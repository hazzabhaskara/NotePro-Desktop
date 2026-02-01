import React, { useRef, useCallback } from 'react';

export function TodoBlock({ block, onUpdate, onDelete }) {
  const checked = block.meta?.checked || false;
  const debounceRef = useRef(null);

  const handleCheckbox = useCallback((e) => {
    onUpdate({ meta: { ...block.meta, checked: e.target.checked } });
  }, [onUpdate, block.meta]);

  const handleInput = useCallback((e) => {
    const val = e.target.innerText;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onUpdate({ content: val }), 300);
  }, [onUpdate]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Backspace' && e.target.innerText.trim() === '') {
      e.preventDefault();
      onDelete();
    }
  }, [onDelete]);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '2px 0' }}>
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={checked}
        onChange={handleCheckbox}
        style={{ marginTop: 3, flexShrink: 0 }}
      />

      {/* Editable text */}
      <div
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Task baru..."
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        style={{
          flex: 1,
          color: checked ? 'var(--text-dim)' : 'var(--text-secondary)',
          fontSize: 14,
          lineHeight: 1.75,
          fontFamily: 'var(--font-mono)',
          textDecoration: checked ? 'line-through' : 'none',
          transition: 'color 0.2s, text-decoration 0.2s',
          minHeight: '1.75em'
        }}
      >{block.content}</div>
    </div>
  );
}
