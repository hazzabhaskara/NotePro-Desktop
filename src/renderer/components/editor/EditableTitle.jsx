import React, { useRef, useCallback } from 'react';

const ICON_POOL = [
  '📄','📒','📓','📔','📕','📗','📘','📙','🗒️','📃',
  '📝','📋','🎯','🧩','⚛️','🌟','💡','🔬','🎨','🚀',
  '🏠','🎵','📸','🧠','⚡','🌈','🎭','📊','🛠️','🌙'
];

export function EditableTitle({ title, icon, createdAt, onUpdateTitle, onUpdateIcon }) {
  const debounceRef = useRef(null);

  const handleTitleChange = useCallback((e) => {
    const val = e.target.value;
    // Debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onUpdateTitle(val);
    }, 400);
  }, [onUpdateTitle]);

  const handleIconClick = useCallback(() => {
    const current = icon;
    let next = current;
    while (next === current) {
      next = ICON_POOL[Math.floor(Math.random() * ICON_POOL.length)];
    }
    onUpdateIcon(next);
  }, [icon, onUpdateIcon]);

  // Format date for display
  const formatDate = (iso) => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return iso;
    }
  };

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Icon + Title row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Clickable emoji icon */}
        <span
          onClick={handleIconClick}
          style={{
            fontSize: 38,
            cursor: 'pointer',
            transition: 'transform 0.15s',
            display: 'inline-block',
            lineHeight: 1,
            flexShrink: 0
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.12)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          title="Klik untuk mengubah icon"
        >{icon}</span>

        {/* Title input */}
        <input
          type="text"
          defaultValue={title}
          onChange={handleTitleChange}
          placeholder="Judul halaman..."
          style={{
            flex: 1,
            fontSize: 28,
            fontWeight: 800,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.02em',
            lineHeight: 1.3,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            caretColor: 'var(--accent-indigo)'
          }}
        />
      </div>

      {/* Subtitle */}
      <div style={{
        marginTop: 6,
        paddingLeft: 52,
        fontSize: 11,
        color: 'var(--text-dim)',
        fontFamily: 'var(--font-mono)'
      }}>
        Klik emoji untuk mengubah icon &nbsp;•&nbsp; Dibuat {formatDate(createdAt)}
      </div>
    </div>
  );
}
