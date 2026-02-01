import React, { useEffect, useRef } from 'react';

export function BlockMenu({ x, y, onAction, onClose }) {
    const menuRef = useRef(null);

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

    const items = [
        { key: 'delete', label: 'Hapus', icon: '🗑️', color: 'var(--accent-red)' },
        { key: 'duplicate', label: 'Duplikat', icon: '📄', color: 'var(--text-primary)' },
        { key: 'divider' },
        { key: 'turn-h1', label: 'Ubah ke Heading 1', icon: '𝐇₁', color: 'var(--text-primary)' },
        { key: 'turn-h2', label: 'Ubah ke Heading 2', icon: '𝐇₂', color: 'var(--text-primary)' },
        { key: 'turn-list', label: 'Ubah ke List', icon: '•', color: 'var(--text-primary)' },
        { key: 'turn-todo', label: 'Ubah ke Todo', icon: '☐', color: 'var(--text-primary)' },
        { key: 'turn-quote', label: 'Ubah ke Quote', icon: '❝', color: 'var(--text-primary)' },
    ];

    // Adjust position to stay in viewport
    const adjustedX = Math.min(x, window.innerWidth - 200);
    const adjustedY = Math.min(y, window.innerHeight - 280);

    return (
        <div
            ref={menuRef}
            style={{
                position: 'fixed',
                left: adjustedX,
                top: adjustedY,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 1000,
                minWidth: 180,
                overflow: 'hidden',
                animation: 'fadeIn 0.15s ease-out'
            }}
        >
            <div style={{
                padding: '6px 10px',
                fontSize: 10,
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
                letterSpacing: 0.5
            }}>
                Aksi Blok
            </div>
            {items.map((item, idx) => {
                if (item.key === 'divider') {
                    return <div key={idx} style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />;
                }
                return (
                    <div
                        key={item.key}
                        onClick={(e) => {
                            e.stopPropagation();
                            onAction(item.key);
                            onClose();
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '8px 12px',
                            cursor: 'pointer',
                            color: item.color,
                            fontSize: 13,
                            fontFamily: 'var(--font-mono)',
                            transition: 'background 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        <span style={{ fontSize: 14, width: 18, textAlign: 'center' }}>{item.icon}</span>
                        {item.label}
                    </div>
                );
            })}
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}
