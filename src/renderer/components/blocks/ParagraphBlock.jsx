import React, { useRef, useState, useCallback, useEffect } from 'react';
import { RichTextRenderer } from './RichTextRenderer';

export function ParagraphBlock({ block, onUpdate, onDelete, onNavigate, onTriggerSlash }) {
  const [isEditing, setIsEditing] = useState(false);
  const debounceRef = useRef(null);
  const contentRef = useRef(null);

  // Sync content only when not editing to avoid cursor jumping, or initial load
  useEffect(() => {
    if (!isEditing && contentRef.current && contentRef.current.innerText !== block.content) {
      contentRef.current.innerText = block.content || '';
    }
  }, [block.content, isEditing]);

  const handleInput = useCallback((e) => {
    const val = e.target.innerText;

    // Check for Slash Command trigger
    if (val === '/' && onTriggerSlash) {
      const rect = contentRef.current.getBoundingClientRect();
      onTriggerSlash(rect); // Pass coordinates
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onUpdate({ content: val });
    }, 300);
  }, [onUpdate, onTriggerSlash]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Backspace' && e.target.innerText.trim() === '') {
      e.preventDefault();
      onDelete();
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      // End editing on Enter? No, standard behavior is new block usually.
      // But for now let's keep default behavior or maybe blur?
      // e.preventDefault();
      // e.target.blur();
    }
  }, [onDelete]);

  if (isEditing) {
    return (
      <div
        ref={contentRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Ketik di sini... (Gunakan / untuk menu)"
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onBlur={() => setIsEditing(false)}
        autoFocus
        style={{
          color: 'var(--text-primary)',
          fontSize: 14,
          lineHeight: 1.75,
          minHeight: '1.75em',
          fontFamily: 'var(--font-mono)',
          padding: '1px 0',
          outline: 'none',
          whiteSpace: 'pre-wrap'
        }}
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      style={{
        color: 'var(--text-secondary)',
        fontSize: 14,
        lineHeight: 1.75,
        minHeight: '1.75em',
        fontFamily: 'var(--font-mono)',
        padding: '1px 0',
        cursor: 'text',
        whiteSpace: 'pre-wrap'
      }}
    >
      <RichTextRenderer content={block.content || ''} onNavigate={onNavigate} />
      {(!block.content) && <span style={{ color: 'var(--text-dim)', opacity: 0.5 }}>Ketik di sini...</span>}
    </div>
  );
}
