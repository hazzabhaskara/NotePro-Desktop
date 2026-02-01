import React, { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';

import { EditableTitle } from './EditableTitle';
import { PageTags } from '../tags/PageTags';
import { SortableBlock } from './SortableBlock';
import { AddBlockToolbar } from './AddBlockToolbar';
import { SlashMenu } from './SlashMenu';
import { useHistory } from '../../hooks/useHistory';
import { exportMarkdown } from '../../utils/exportMarkdown';
import { TEMPLATES } from '../../utils/templates';

export function PageEditor({ page, onUpdatePage, onRefreshPage, onNavigate }) {
  // Use history hook for blocks state
  const history = useHistory([]);
  const blocks = history.state;
  const [loading, setLoading] = useState(true);
  const [slashMenu, setSlashMenu] = useState({ visible: false, x: 0, y: 0, blockId: null });

  // ── Sensors for DnD ──
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ── Fetch blocks whenever active page changes ──
  const loadBlocks = useCallback(async () => {
    setLoading(true);
    const fullPage = await window.notepro.getPage(page.id);
    if (fullPage) {
      // Reset history when loading a new page
      history.reset(fullPage.blocks || []);
    }
    setLoading(false);
  }, [page.id]);

  useEffect(() => {
    loadBlocks();
  }, [loadBlocks]);

  // ── Undo / Redo ──
  const handleUndo = useCallback(async () => {
    if (!history.canUndo) return;
    const past = history.historyState.past;
    const previousState = past[past.length - 1];
    await window.notepro.replacePageBlocks(page.id, previousState);
    history.undo();
  }, [history, page.id]);

  const handleRedo = useCallback(async () => {
    if (!history.canRedo) return;
    const future = history.historyState.future;
    const nextState = future[0];
    await window.notepro.replacePageBlocks(page.id, nextState);
    history.redo();
  }, [history, page.id]);

  // Keyboard shortcuts for Undo/Redo
  useEffect(() => {
    const handler = (e) => {
      // Undo: Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Redo: Ctrl+Shift+Z or Ctrl+Y
      if (((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) ||
        ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleUndo, handleRedo]);

  // ── Block CRUD ──
  const handleCreateBlock = async (type, content = '', meta = {}) => {
    const newId = await window.notepro.createBlock({ pageId: page.id, type, content, meta });
    const newBlock = {
      id: newId,
      pageId: page.id,
      type,
      content,
      meta,
      order: blocks.length,
      createdAt: new Date().toISOString()
    };
    const newBlocks = [...blocks, newBlock];
    history.set(newBlocks);
  };

  const handleUpdateBlock = async (blockId, { content, meta, type }) => {
    const update = {};
    if (content !== undefined) update.content = content;
    if (meta !== undefined) update.meta = meta;
    if (type !== undefined) update.type = type;

    await window.notepro.updateBlock({ blockId, ...update });

    const newBlocks = blocks.map(b => b.id === blockId ? { ...b, ...update } : b);
    history.set(newBlocks);
  };

  const handleDeleteBlock = async (blockId) => {
    await window.notepro.deleteBlock(blockId);
    const newBlocks = blocks.filter(b => b.id !== blockId);
    history.set(newBlocks);
  };

  const handleAddBlockAfter = async (afterIndex) => {
    await handleCreateBlock('paragraph', '', {});
  };

  // ── Drag End Handler ──
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((i) => i.id === active.id);
      const newIndex = blocks.findIndex((i) => i.id === over.id);
      const newItems = arrayMove(blocks, oldIndex, newIndex);
      const orderedIds = newItems.map(b => b.id);
      window.notepro.reorderBlocks({ pageId: page.id, orderedIds });
      history.set(newItems);
    }
  };

  // ── Slash Menu Logic ──
  const handleTriggerSlash = useCallback((rect, blockId) => {
    if (rect) {
      setSlashMenu({
        visible: true,
        x: rect.left,
        y: rect.bottom + 8,
        blockId
      });
    }
  }, []);

  const handleSlashAction = async (type) => {
    if (slashMenu.blockId) {
      // Update block type and remove '/' content
      // Logic: Replace the current block with new type.
      // But slash cmd is usually triggered by "/", so we might want to clear content or keep it?
      // Typically "/" is removed.
      await handleUpdateBlock(slashMenu.blockId, { type, content: '' }); // Clear content for clean start
      setSlashMenu({ visible: false, x: 0, y: 0, blockId: null });
    }
  };

  // ── Template Logic ──
  const handleApplyTemplate = async (templateId) => {
    const template = TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    // Delete existing empty blocks first if any (but usually it's just one empty block)
    // Actually, simpler: just create the new blocks. 
    // If the page was truly "empty" (0 blocks), straightforward. 
    // If it had 1 empty paragraph, we might want to remove it.

    // Batch Insert (simulated via loops for now or new API?)
    // API createBlock return ID, so we can't batch easily without backend support.
    // Let's loop.

    setLoading(true);
    // Cleanup first block if empty
    if (blocks.length === 1 && !blocks[0].content) {
      await window.notepro.deleteBlock(blocks[0].id);
    }

    for (const b of template.blocks) {
      await window.notepro.createBlock({
        pageId: page.id,
        type: b.type,
        content: b.content || '',
        meta: b.meta || {}
      });
    }

    // Refresh
    const fullPage = await window.notepro.getPage(page.id);
    history.reset(fullPage.blocks || []);
    setLoading(false);
  };

  const handleExport = async () => {
    const md = exportMarkdown(page.title, blocks);
    await window.notepro.exportMarkdown({ title: page.title, content: md });
  };

  const handleExportPdf = async () => {
    await window.notepro.exportPdf(page.title);
  };

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>Memuat halaman...</span>
      </div>
    );
  }

  // Check if empty state for templates
  const isEmpty = blocks.length === 0 || (blocks.length === 1 && !blocks[0].content && blocks[0].type === 'paragraph');

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      background: 'var(--bg-base)',
      padding: '48px 0 80px'
    }}>
      <div style={{
        maxWidth: 740,
        margin: '0 auto',
        padding: '0 48px'
      }}>
        {/* ── Header Row: Title + Export ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <EditableTitle
              title={page.title}
              icon={page.icon}
              createdAt={page.createdAt}
              onUpdateTitle={(title) => onUpdatePage({ pageId: page.id, title })}
              onUpdateIcon={(icon) => onUpdatePage({ pageId: page.id, icon })}
            />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleExport}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '6px 12px',
                color: 'var(--text-secondary)',
                fontSize: 12,
                cursor: 'pointer',
                marginTop: 12
              }}
              title="Export to Markdown"
            >
              ⬇️ MD
            </button>
            <button
              onClick={handleExportPdf}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '6px 12px',
                color: 'var(--text-secondary)',
                fontSize: 12,
                cursor: 'pointer',
                marginTop: 12
              }}
              title="Export to PDF"
            >
              📄 PDF
            </button>
          </div>
        </div>

        {/* Tags */}
        <PageTags pageId={page.id} />

        {/* ── Sortable Block List ── */}
        <div style={{ marginTop: 8 }}>
          {blocks.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={blocks}
                strategy={verticalListSortingStrategy}
              >
                {blocks.map((block, idx) => (
                  <SortableBlock
                    key={block.id}
                    block={block}
                    onUpdate={(updates) => handleUpdateBlock(block.id, updates)}
                    onDelete={() => handleDeleteBlock(block.id)}
                    onAddAfter={() => handleAddBlockAfter(idx)}
                    onNavigate={onNavigate}
                    onTriggerSlash={(rect) => handleTriggerSlash(rect, block.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* ── Templates (if empty) ── */}
        {isEmpty && (
          <div style={{ marginTop: 40, padding: 20, border: '1px dashed var(--border)', borderRadius: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>Mulai dari template:</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
              {TEMPLATES.map(t => (
                <div
                  key={t.id}
                  onClick={() => handleApplyTemplate(t.id)}
                  style={{
                    padding: 12,
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--accent-indigo)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{t.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{t.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>{t.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Add Block Toolbar ── */}
        <AddBlockToolbar onAdd={handleCreateBlock} />
      </div>

      {/* ── Slash Menu ── */}
      {slashMenu.visible && (
        <SlashMenu
          x={slashMenu.x}
          y={slashMenu.y}
          onSelect={handleSlashAction}
          onClose={() => setSlashMenu({ ...slashMenu, visible: false })}
        />
      )}
    </div>
  );
}
