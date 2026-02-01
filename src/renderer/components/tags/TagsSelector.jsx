import React, { useState, useEffect, useRef } from 'react';

const TAG_COLORS = [
    '#ef4444', // red
    '#f97316', // orange
    '#f59e0b', // amber
    '#22c55e', // green
    '#06b6d4', // cyan
    '#3b82f6', // blue
    '#6366f1', // indigo
    '#d946ef', // fuchsia
    '#ec4899', // pink
    '#64748b', // slate
];

export function TagsSelector({ pageId, alreadySelectedIds = [], onChange, onClose }) {
    const [query, setQuery] = useState('');
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const menuRef = useRef(null);

    useEffect(() => {
        loadTags();
    }, []);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [onClose]);

    const loadTags = async () => {
        try {
            const data = await window.notepro.getTags();
            setTags(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Failed to load tags:", e);
            setTags([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!query.trim()) return;
        const color = TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
        try {
            const newTag = await window.notepro.createTag({ name: query.trim(), color });
            // Ensure newTag is valid before adding
            if (newTag && newTag.id) {
                setTags(prev => [...prev, newTag]);
                await toggleTag(newTag.id, false); // Auto select
                setQuery('');
            }
        } catch (e) {
            console.error("Failed to create tag", e);
        }
    };

    const toggleTag = async (tagId, isSelected) => {
        try {
            if (isSelected) {
                await window.notepro.removeTagFromPage({ pageId, tagId });
            } else {
                await window.notepro.addTagToPage({ pageId, tagId });
            }
            onChange(); // Trigger refresh in parent
        } catch (e) { console.error(e); }
    };

    const handleDeleteTag = async (e, tagId) => {
        e.stopPropagation();
        if (confirm('Hapus tag ini dari semua halaman?')) {
            try {
                await window.notepro.deleteTag(tagId);
                setTags(prev => prev.filter(t => t.id !== tagId));
                onChange();
            } catch (e) { console.error(e); }
        }
    };

    const filteredTags = Array.isArray(tags) ? tags.filter(t => t.name.toLowerCase().includes(query.toLowerCase())) : [];
    const exactMatch = filteredTags.find(t => t.name.toLowerCase() === query.toLowerCase());

    return (
        <div
            ref={menuRef}
            style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                width: 240,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 50,
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}
        >
            <div style={{ padding: 8, borderBottom: '1px solid var(--border)' }}>
                <input
                    autoFocus
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Cari tag..."
                    style={{
                        width: '100%',
                        background: 'var(--bg-base)',
                        border: 'none',
                        outline: 'none',
                        fontSize: 13,
                        color: 'var(--text-primary)',
                        padding: '4px 8px',
                        borderRadius: 4
                    }}
                />
            </div>

            <div style={{ maxHeight: 200, overflowY: 'auto', padding: 4 }}>
                {loading ? (
                    <div style={{ padding: 8, fontSize: 12, color: 'var(--text-muted)' }}>Loading...</div>
                ) : (
                    <>
                        {filteredTags.map(tag => {
                            const selected = alreadySelectedIds.includes(tag.id);
                            return (
                                <div
                                    key={tag.id}
                                    onClick={() => toggleTag(tag.id, selected)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        padding: '6px 8px',
                                        borderRadius: 4,
                                        cursor: 'pointer',
                                        fontSize: 13,
                                        color: 'var(--text-primary)',
                                        background: 'transparent'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{
                                        width: 14, height: 14, borderRadius: 3,
                                        border: `1px solid ${selected ? tag.color : 'var(--text-muted)'}`,
                                        background: selected ? tag.color : 'transparent',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 10, color: '#fff'
                                    }}>
                                        {selected && '✓'}
                                    </div>
                                    <span style={{ flex: 1 }}>{tag.name}</span>

                                    {/* Delete button (small trash) */}
                                    <button
                                        onClick={(e) => handleDeleteTag(e, tag.id)}
                                        style={{ fontSize: 10, color: 'var(--text-muted)', padding: 2, background: 'none', border: 'none' }}
                                        onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-red)'}
                                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                                        title="Delete Tag Globally"
                                    >✕</button>
                                </div>
                            );
                        })}

                        {query && !exactMatch && (
                            <div
                                onClick={handleCreate}
                                style={{
                                    padding: '6px 8px',
                                    fontSize: 12,
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    borderTop: filteredTags.length > 0 ? '1px solid var(--border)' : 'none',
                                    marginTop: filteredTags.length > 0 ? 4 : 0
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'var(--bg-hover)';
                                    e.currentTarget.style.color = 'var(--text-primary)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                }}
                            >
                                + Buat tag <b>"{query}"</b>
                            </div>
                        )}

                        {!query && filteredTags.length === 0 && (
                            <div style={{ padding: 12, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                                Belum ada tag
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
