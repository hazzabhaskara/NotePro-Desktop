import React, { useRef, useCallback, useEffect, useState } from 'react';

export function ParagraphBlock({ block, onUpdate, onDelete, onNavigate, onTriggerSlash }) {
  const debounceRef = useRef(null);
  const contentRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  // Sync content on mount and when block.content changes externally
  useEffect(() => {
    if (contentRef.current) {
      // Only sync if not currently focused to avoid cursor jumping
      if (document.activeElement !== contentRef.current) {
        contentRef.current.innerText = block.content || '';
      }
    }
  }, [block.content]);

  const handleInput = useCallback((e) => {
    const val = e.target.innerText;

    // Check for Slash Command trigger
    if (val === '/' && onTriggerSlash) {
      const rect = contentRef.current.getBoundingClientRect();
      onTriggerSlash(rect);
    }

    // Debounced update to parent - prevents re-render during typing
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onUpdate({ content: val });
    }, 500);
  }, [onUpdate, onTriggerSlash]);

  const handleKeyDown = useCallback((e) => {
    // Delete empty block on backspace
    if (e.key === 'Backspace' && e.target.innerText.trim() === '') {
      e.preventDefault();
      onDelete();
    }
    // Optional: handle Enter for new block
    if (e.key === 'Enter' && !e.shiftKey) {
      // Let default behavior or integrate with block creation
    }
  }, [onDelete]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // Final save on blur
    if (contentRef.current) {
      const val = contentRef.current.innerText;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      onUpdate({ content: val });
    }
  }, [onUpdate]);

  const isEmpty = !block.content || block.content.trim() === '';

  return (
    <>
      <div
        ref={contentRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        data-placeholder={isEmpty && isFocused ? "Ketik '/' untuk perintah..." : ""}
        className="paragraph-block"
        style={{
          color: 'var(--text-primary)',
          fontSize: 15,
          lineHeight: 1.7,
          minHeight: '1.7em',
          fontFamily: 'var(--font-sans)',
          padding: '3px 2px',
          outline: 'none',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          borderRadius: 3,
          transition: 'background 0.15s',
          position: 'relative'
        }}
      />
      <style>{`
        .paragraph-block:empty::before {
          content: attr(data-placeholder);
          color: var(--text-dim);
          opacity: 0.5;
          pointer-events: none;
        }
        .paragraph-block:hover {
          background: var(--bg-hover);
        }
        .paragraph-block:focus {
          background: transparent;
        }
      `}</style>
    </>
  );
}
