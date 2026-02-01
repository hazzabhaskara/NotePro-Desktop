import React, { useRef, useCallback } from 'react';

const LEVEL_MAP = { heading1: 1, heading2: 2, heading3: 3 };

const STYLES = {
  1: { fontSize: 26, fontWeight: 800, color: 'var(--text-primary)',   marginTop: 0,  marginBottom: 4, lineHeight: 1.3 },
  2: { fontSize: 19, fontWeight: 700, color: 'var(--text-primary)',   marginTop: 20, marginBottom: 2, lineHeight: 1.4 },
  3: { fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 14, marginBottom: 0, lineHeight: 1.5 },
};

export function HeadingBlock({ block, onUpdate, onDelete }) {
  const level = LEVEL_MAP[block.type] || 1;
  const style = STYLES[level];
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

  const Tag = `h${level}`;

  return (
    <Tag
      contentEditable
      suppressContentEditableWarning
      data-placeholder={`Heading ${level}`}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      style={{
        ...style,
        fontFamily: 'var(--font-display)',
        letterSpacing: level === 1 ? '-0.02em' : '0',
        caretColor: 'var(--accent-indigo)',
        outline: 'none'
      }}
    >{block.content}</Tag>
  );
}
