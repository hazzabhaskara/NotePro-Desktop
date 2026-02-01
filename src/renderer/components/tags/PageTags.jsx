import React, { useState, useEffect, useCallback } from 'react';
import { TagsSelector } from './TagsSelector';

export function PageTags({ pageId }) {
    const [tags, setTags] = useState([]);
    const [selectorOpen, setSelectorOpen] = useState(false);

    // Load tags whenever pageId changes
    const loadPageTags = useCallback(async () => {
        try {
            const data = await window.notepro.getPageTags(pageId);
            setTags(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Failed to load page tags:", e);
            setTags([]);
        }
    }, [pageId]);

    useEffect(() => {
        loadPageTags();
    }, [loadPageTags]);

    return (
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 8, marginBottom: 12 }}>
            {tags.map(tag => (
                <div
                    key={tag.id}
                    style={{
                        background: `${tag.color}20`, // 12% opacity
                        color: tag.color,
                        fontSize: 11,
                        fontWeight: 500,
                        padding: '2px 8px',
                        borderRadius: 100,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        border: `1px solid ${tag.color}40`,
                        userSelect: 'none'
                    }}
                >
                    {tag.name}
                </div>
            ))}

            <div style={{ position: 'relative' }}>
                <button
                    onClick={() => setSelectorOpen(!selectorOpen)}
                    style={{
                        background: 'transparent',
                        border: '1px dashed var(--text-dim)',
                        color: 'var(--text-dim)',
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 100,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'var(--text-secondary)';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--text-dim)';
                        e.currentTarget.style.color = 'var(--text-dim)';
                    }}
                >
                    + Add Tag
                </button>

                {selectorOpen && (
                    <TagsSelector
                        pageId={pageId}
                        alreadySelectedIds={tags.map(t => t.id)}
                        onChange={loadPageTags} // Reload tags when selection changes
                        onClose={() => setSelectorOpen(false)}
                    />
                )}
            </div>
        </div>
    );
}
