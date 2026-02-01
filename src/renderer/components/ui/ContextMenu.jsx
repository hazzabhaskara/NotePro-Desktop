import React, { useEffect, useRef } from 'react';

export function ContextMenu({ x, y, pageId, isTrash, onAction, onClose }) {
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    // Use mousedown so it fires before click
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Adjust position... (no change)
  const adjustedX = Math.min(x, window.innerWidth - 180);
  const adjustedY = Math.min(y, window.innerHeight - 100);

  let items = [];
  if (isTrash) {
    items = [
      { key: 'restore', label: 'Pulihkan', icon: '♻️', color: 'var(--text-primary)' },
      { key: 'permanent-delete', label: 'Hapus Selamanya', icon: '🔥', color: 'var(--accent-red)' },
    ];
  } else {
    items = [
      { key: 'sub', label: 'Sub-halaman', icon: '📄', color: 'var(--text-secondary)' },
      { key: 'toggle-fav', label: 'Favorit', icon: '⭐', color: 'var(--accent-yellow)' },
      { key: 'delete', label: 'Hapus halaman', icon: '🗑️', color: 'var(--accent-red)' },
    ];
  }

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
        boxShadow: 'var(--shadow-md)',
        zIndex: 999,
        minWidth: 170,
        overflow: 'hidden'
      }}
    >
      {items.map((item, idx) => (
        <React.Fragment key={item.key}>
          {idx > 0 && <div style={{ height: 1, background: 'var(--border)', margin: '2px 0' }} />}
          <div
            onClick={(e) => {
              e.stopPropagation();
              onAction(item.key, pageId);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              padding: '8px 14px',
              cursor: 'pointer',
              color: item.color,
              fontSize: 12.5,
              fontFamily: 'var(--font-mono)',
              transition: 'background var(--transition)'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: 15 }}>{item.icon}</span>
            {item.label}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
