import React, { useState, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BlockRenderer } from '@/components/editor';
import { BlockMenu } from '@/components/ui';


export function SortableBlock({
    block,
    onUpdate,
    onDelete,
    onAddAfter,
    onNavigate,
    onTriggerSlash,
    onBlockMenuAction
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
    const handleRef = useRef(null);

    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: block.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        position: 'relative',
        padding: '2px 0'
    };

    const handleMenuClick = (e) => {
        e.stopPropagation();
        const rect = handleRef.current.getBoundingClientRect();
        setMenuPos({ x: rect.left, y: rect.bottom + 4 });
        setMenuOpen(true);
    };

    const handleAction = (action) => {
        if (onBlockMenuAction) {
            onBlockMenuAction(block.id, action);
        }
        setMenuOpen(false);
    };

    return (
        <div ref={setNodeRef} style={style} className="block-row">
            {/* Handle & Add Button Container */}
            <div
                className="block-controls"
                style={{
                    position: 'absolute',
                    left: -44,
                    top: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    opacity: 0,
                    transition: 'opacity 0.15s ease'
                }}
            >
                {/* Add Button */}
                <button
                    onClick={onAddAfter}
                    className="block-btn"
                    style={{
                        width: 22,
                        height: 24,
                        borderRadius: 4,
                        background: 'transparent',
                        color: 'var(--text-muted)',
                        border: 'none',
                        fontSize: 18,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                    }}
                    title="Tambah blok"
                >
                    +
                </button>

                {/* Handle Button - Click for menu, Drag to move */}
                <div
                    ref={(node) => {
                        handleRef.current = node;
                        setActivatorNodeRef(node);
                    }}
                    {...attributes}
                    {...listeners}
                    onClick={handleMenuClick}
                    className="block-handle"
                    style={{
                        width: 18,
                        height: 24,
                        borderRadius: 4,
                        background: 'transparent',
                        color: 'var(--text-dim)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'grab',
                        fontSize: 14,
                        letterSpacing: -2,
                        transition: 'all 0.15s',
                        userSelect: 'none'
                    }}
                    title="Klik untuk menu • Drag untuk pindahkan"
                >
                    ⋮⋮
                </div>
            </div>

            {/* Block Content */}
            <div style={{ marginLeft: 0 }}>
                <BlockRenderer
                    block={block}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onNavigate={onNavigate}
                    onTriggerSlash={onTriggerSlash}
                />
            </div>

            {/* Block Menu Popover */}
            {menuOpen && (
                <BlockMenu
                    x={menuPos.x}
                    y={menuPos.y}
                    onAction={handleAction}
                    onClose={() => setMenuOpen(false)}
                />
            )}

            <style>{`
        .block-row:hover .block-controls { 
          opacity: 1 !important; 
        }
        .block-controls:hover { 
          opacity: 1 !important; 
        }
        .block-btn:hover {
          background: var(--bg-hover) !important;
          color: var(--text-primary) !important;
        }
        .block-handle:hover {
          background: var(--bg-hover) !important;
          color: var(--text-primary) !important;
        }
        .block-handle:active {
          cursor: grabbing !important;
        }
      `}</style>
        </div>
    );
}
