import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BlockRenderer } from './BlockRenderer';

export function SortableBlock({ block, onUpdate, onDelete, onAddAfter, onNavigate, onTriggerSlash }) {
    const {
        attributes,
        listeners,
        setNodeRef,
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

    return (
        <div ref={setNodeRef} style={style} className="group block-row">
            {/* Drag Handle & Add Button Container */}
            <div
                style={{
                    position: 'absolute',
                    left: -48,
                    top: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    opacity: 0,
                    transition: 'opacity 0.2s',
                }}
                className="block-controls"
            >
                {/* Add Button */}
                <button
                    onClick={onAddAfter}
                    style={{
                        width: 20,
                        height: 20,
                        borderRadius: 4,
                        background: 'var(--bg-hover)',
                        color: 'var(--text-muted)',
                        border: 'none',
                        fontSize: 16,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                    title="Add block below"
                >+</button>

                {/* Drag Handle */}
                <div
                    {...attributes}
                    {...listeners}
                    style={{
                        cursor: 'grab',
                        padding: 4,
                        color: 'var(--text-dim)',
                        display: 'flex',
                        alignItems: 'center'
                    }}
                    title="Drag to move"
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

            <style>{`
        .block-row:hover .block-controls { opacity: 1 !important; }
        .block-controls:hover { opacity: 1 !important; }
      `}</style>
        </div>
    );
}
