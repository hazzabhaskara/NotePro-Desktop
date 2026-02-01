import React, { useState, useEffect, useRef } from 'react';

const ITEMS = [
    { id: 'heading1', label: 'Heading 1', icon: 'H1', keyword: 'h1 heading' },
    { id: 'heading2', label: 'Heading 2', icon: 'H2', keyword: 'h2 heading' },
    { id: 'heading3', label: 'Heading 3', icon: 'H3', keyword: 'h3 heading' },
    { id: 'paragraph', label: 'Text', icon: 'T', keyword: 'text paragraph' },
    { id: 'bulleted_list', label: 'Bullet List', icon: '•', keyword: 'list bul' },
    { id: 'numbered_list', label: 'Numbered List', icon: '1.', keyword: 'list num' },
    { id: 'todo', label: 'To-do List', icon: '☑', keyword: 'todo check' },
    { id: 'toggle', label: 'Toggle List', icon: '▶', keyword: 'toggle collapse' },
    { id: 'quote', label: 'Quote', icon: '❝', keyword: 'quote' },
    { id: 'code', label: 'Code Block', icon: '💻', keyword: 'code javascript python' },
    { id: 'image', label: 'Image', icon: '🖼️', keyword: 'image picture upload' },
    { id: 'embed', label: 'Embed (Video)', icon: '🎥', keyword: 'video youtube embed iframe' },
    { id: 'divider', label: 'Divider', icon: '—', keyword: 'divider rule' },
];

export function SlashMenu({ x, y, onSelect, onClose }) {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const menuRef = useRef(null);

    const filtered = ITEMS.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.keyword.includes(query.toLowerCase())
    );

    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
    }, []);

    // Reset selection on query change
    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

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

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % filtered.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filtered[selectedIndex]) {
                onSelect(filtered[selectedIndex].id);
            }
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    // Adjust position
    const top = y + 24;
    const left = x;

    return (
        <div
            ref={menuRef}
            style={{
                position: 'fixed',
                left,
                top,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 1000,
                width: 250,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <div style={{ padding: '8px 8px 4px' }}>
                <input
                    ref={inputRef}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Tipe blok..."
                    style={{
                        width: '100%',
                        background: 'var(--bg-base)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '4px 8px',
                        color: 'var(--text-primary)',
                        fontSize: 13,
                        outline: 'none'
                    }}
                />
            </div>
            <div style={{ maxHeight: 200, overflowY: 'auto', padding: '0 4px 4px' }}>
                {filtered.map((item, idx) => (
                    <div
                        key={item.id}
                        onClick={() => onSelect(item.id)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '6px 8px',
                            cursor: 'pointer',
                            borderRadius: 'var(--radius-sm)',
                            background: idx === selectedIndex ? 'var(--bg-hover)' : 'transparent',
                            color: idx === selectedIndex ? 'var(--text-primary)' : 'var(--text-secondary)',
                            transition: 'background 0.1s'
                        }}
                    >
                        <span style={{ fontSize: 16, width: 20, textAlign: 'center', opacity: 0.7 }}>{item.icon}</span>
                        <span style={{ fontSize: 13 }}>{item.label}</span>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div style={{ padding: 10, textAlign: 'center', color: 'var(--text-dim)', fontSize: 12 }}>Tidak ditemukan</div>
                )}
            </div>
        </div>
    );
}
