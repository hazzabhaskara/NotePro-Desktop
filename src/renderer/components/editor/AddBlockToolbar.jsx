import React from 'react';

const BLOCK_BUTTONS = [
  { key: 'heading1', label: 'H1', icon: '📌', content: 'Heading 1', meta: {} },
  { key: 'heading2', label: 'H2', icon: '📍', content: 'Heading 2', meta: {} },
  { key: 'heading3', label: 'H3', icon: '🔖', content: 'Heading 3', meta: {} },
  { key: 'bulleted_list', label: 'List', icon: '📎', content: 'Item baru', meta: {} },
  { key: 'numbered_list', label: 'Numbered', icon: '🔢', content: 'Item baru', meta: {} },
  { key: 'todo', label: 'Todo', icon: '☑️', content: 'Task baru', meta: { checked: false } },
  {
    key: 'toggle', label: 'Toggle', icon: '🔽', content: 'Toggle baru', meta: {
      open: false,
      children: [{ id: 'child-' + Date.now(), type: 'paragraph', content: 'Konten tersembunyi...', meta: {} }]
    }
  },
  { key: 'quote', label: 'Quote', icon: '💬', content: 'Kutipan di sini...', meta: {} },
  { key: 'divider', label: 'Divider', icon: '─', content: '', meta: {} },
  { key: 'image', label: 'Image', icon: '🖼️', content: '', meta: {} },
  { key: 'code', label: 'Code', icon: '💻', content: '', meta: { language: 'javascript' } },
];

export function AddBlockToolbar({ onAdd }) {
  return (
    <div style={{ marginTop: 32, paddingTop: 20 }}>
      {/* Label */}
      <div style={{
        textAlign: 'center',
        color: 'var(--text-dim)',
        fontSize: 11,
        marginBottom: 14,
        letterSpacing: '0.04em',
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <span>Tambah Blok Baru</span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      {/* Buttons */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 7,
        justifyContent: 'center'
      }}>
        {BLOCK_BUTTONS.map(btn => (
          <button
            key={btn.key}
            onClick={() => onAdd(btn.key, btn.content, btn.meta)}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '7px 13px',
              color: 'var(--text-muted)',
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all var(--transition)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--accent-indigo)';
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.background = 'var(--bg-hover)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.background = 'var(--bg-surface)';
            }}
          >
            <span style={{ fontSize: 14 }}>{btn.icon}</span>
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
