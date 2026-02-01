import React, { useState, useRef, useEffect } from 'react';

export function SearchModal({ onClose, onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Async Search with Debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length === 0) {
        setResults([]);
        return;
      }
      if (window.notepro && window.notepro.searchPages) {
        try {
          const res = await window.notepro.searchPages(query);
          setResults(res || []);
        } catch (e) {
          console.error("Search failed", e);
        }
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && results.length > 0) {
      onSelect(results[0].id);
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.55)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '18vh',
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          width: 480,
          maxHeight: 360,
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search input row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '13px 18px',
          borderBottom: '1px solid var(--border)'
        }}>
          <span style={{ color: 'var(--text-dim)', fontSize: 18, flexShrink: 0 }}>🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Cari konten halaman..."
            style={{
              flex: 1,
              fontSize: 14,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              background: 'transparent',
              border: 'none',
              outline: 'none'
            }}
          />
          <span style={{ color: 'var(--text-dim)', fontSize: 10, background: 'var(--bg-hover)', borderRadius: 4, padding: '2px 6px' }}>Esc</span>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          {results.length === 0 ? (
            <div style={{
              padding: '36px 18px',
              textAlign: 'center',
              color: 'var(--text-dim)',
              fontSize: 13
            }}>
              {query ? (
                <>Tidak ditemukan</>
              ) : (
                <div style={{ opacity: 0.6 }}>Ketik untuk mencari di judul & konten</div>
              )}
            </div>
          ) : (
            results.map((page, idx) => (
              <div
                key={page.id}
                onClick={() => onSelect(page.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 18px',
                  cursor: 'pointer',
                  transition: 'background var(--transition)',
                  background: idx === 0 ? 'var(--bg-hover)' : 'transparent'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = idx === 0 ? 'var(--bg-hover)' : 'transparent'}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>{page.icon}</span>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>{page.title}</div>
                </div>
                {page.parentId && (
                  <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>sub</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
