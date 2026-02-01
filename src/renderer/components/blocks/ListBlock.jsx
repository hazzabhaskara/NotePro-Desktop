import React, { useRef, useCallback } from 'react';

export function ListBlock({ block, variant, onUpdate, onDelete }) {
  const debounceRef = useRef(null);
  const prefix = variant === 'bullet' ? '•' : '→';
  const prefixColor = variant === 'bullet' ? 'var(--accent-indigo)' : 'var(--accent-teal)';

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
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '1.5px 0' }}>
      {/* Prefix bullet / arrow */}
      <span style={{
        color: prefixColor,
        fontSize: variant === 'bullet' ? 18 : 14,
        fontWeight: 700,
        lineHeight: '1.75em',
        flexShrink: 0,
        userSelect: 'none',
        marginTop: variant === 'bullet' ? -1 : 1
      }}>{prefix}</span>

      {/* Editable text */}
      <div
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Item..."
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        style={{
          flex: 1,
          color: 'var(--text-secondary)',
          fontSize: 14,
          lineHeight: 1.75,
          fontFamily: 'var(--font-mono)',
          minHeight: '1.75em'
        }}
      >{block.content}</div>
    </div>
  );
}
