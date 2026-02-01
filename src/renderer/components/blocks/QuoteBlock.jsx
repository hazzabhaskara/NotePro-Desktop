import React, { useRef, useCallback } from 'react';

export function QuoteBlock({ block, onUpdate, onDelete }) {
  const debounceRef = useRef(null);

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
    <div style={{
      borderLeft: '3px solid var(--accent-indigo)',
      paddingLeft: 16,
      margin: '4px 0',
      background: 'rgba(99,102,241,0.04)',
      borderRadius: '0 var(--radius-md) var(--radius-md) 0',
      padding: '8px 16px'
    }}>
      <div
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Kutipan..."
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        style={{
          color: 'var(--text-muted)',
          fontSize: 14,
          fontStyle: 'italic',
          lineHeight: 1.75,
          fontFamily: 'var(--font-mono)',
          minHeight: '1.75em'
        }}
      >{block.content}</div>
    </div>
  );
}
