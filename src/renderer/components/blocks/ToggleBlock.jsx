import React, { useState, useRef, useCallback } from 'react';
import { BlockRenderer } from '../editor/BlockRenderer';

export function ToggleBlock({ block, onUpdate, onDelete }) {
  const [open, setOpen] = useState(block.meta?.open || false);
  const children = block.meta?.children || [];
  const debounceRef = useRef(null);

  // ── Update toggle title ──
  const handleTitleInput = useCallback((e) => {
    const val = e.target.innerText;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onUpdate({ content: val });
    }, 300);
  }, [onUpdate]);

  // ── Update a child block inside meta.children ──
  const handleChildUpdate = useCallback((childId, updates) => {
    const newChildren = children.map(c => {
      if (c.id === childId) {
        return {
          ...c,
          ...(updates.content !== undefined ? { content: updates.content } : {}),
          ...(updates.meta !== undefined ? { meta: updates.meta } : {})
        };
      }
      return c;
    });
    onUpdate({ meta: { ...block.meta, children: newChildren, open } });
  }, [children, block.meta, open, onUpdate]);

  // ── Delete a child block ──
  const handleChildDelete = useCallback((childId) => {
    const newChildren = children.filter(c => c.id !== childId);
    onUpdate({ meta: { ...block.meta, children: newChildren, open } });
  }, [children, block.meta, open, onUpdate]);

  // ── Add a child ──
  const handleAddChild = useCallback(() => {
    const newChild = {
      id: 'child-' + Math.random().toString(36).substr(2, 9),
      type: 'paragraph',
      content: '',
      meta: {}
    };
    onUpdate({ meta: { ...block.meta, children: [...children, newChild], open: true } });
    setOpen(true);
  }, [children, block.meta, onUpdate]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Backspace' && e.target.innerText.trim() === '') {
      e.preventDefault();
      onDelete();
    }
  }, [onDelete]);

  return (
    <div style={{ marginBottom: 2 }}>
      {/* Toggle header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
        {/* Arrow */}
        <button
          onClick={() => setOpen(!open)}
          style={{
            color: 'var(--text-muted)',
            fontSize: 10,
            padding: '3px 0',
            width: 18,
            height: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-sm)',
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            flexShrink: 0,
            marginTop: 2
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >▶</button>

        {/* Title */}
        <div
          contentEditable
          suppressContentEditableWarning
          data-placeholder="Toggle..."
          onInput={handleTitleInput}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            color: 'var(--text-primary)',
            fontSize: 14,
            fontWeight: 600,
            lineHeight: 1.6,
            fontFamily: 'var(--font-mono)',
            cursor: 'text'
          }}
        >{block.content}</div>
      </div>

      {/* Children panel */}
      {open && (
        <div style={{
          marginLeft: 24,
          marginTop: 6,
          borderLeft: '2px solid var(--border)',
          paddingLeft: 16,
          paddingBottom: 4
        }}>
          {children.map(child => (
            <BlockRenderer
              key={child.id}
              block={child}
              onUpdate={(updates) => handleChildUpdate(child.id, updates)}
              onDelete={() => handleChildDelete(child.id)}
            />
          ))}

          {/* + Add child */}
          <button
            onClick={handleAddChild}
            style={{
              marginTop: 4,
              color: 'var(--text-dim)',
              fontSize: 11,
              padding: '3px 0',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'color var(--transition)'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-muted)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
          >+ tambah item</button>
        </div>
      )}
    </div>
  );
}
