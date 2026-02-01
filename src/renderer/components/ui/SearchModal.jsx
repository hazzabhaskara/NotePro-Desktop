import React, { useState, useRef, useEffect } from 'react';

// Static commands list
const COMMANDS = [
  { id: 'create-page', label: 'Create New Page', icon: '📄', description: 'Buat halaman baru' },
  { id: 'toggle-theme', label: 'Toggle Theme', icon: '🌓', description: 'Ganti tema terang/gelap' },
  { id: 'daily-journal', label: 'Open Daily Journal', icon: '📅', description: 'Buka jurnal hari ini' },
];

export function SearchModal({
  pages: _pages,  // kept for API compatibility
  onClose,
  onSelect,
  onCreatePage,
  onToggleTheme,
  onOpenDailyNote
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isCommandMode, setIsCommandMode] = useState(false);
  const [filteredCommands, setFilteredCommands] = useState(COMMANDS);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Detect command mode (starts with >)
  useEffect(() => {
    if (query.startsWith('>')) {
      setIsCommandMode(true);
      const commandQuery = query.slice(1).trim().toLowerCase();
      if (commandQuery) {
        setFilteredCommands(
          COMMANDS.filter(cmd =>
            cmd.label.toLowerCase().includes(commandQuery) ||
            cmd.description.toLowerCase().includes(commandQuery)
          )
        );
      } else {
        setFilteredCommands(COMMANDS);
      }
      setSelectedIndex(0);
    } else {
      setIsCommandMode(false);
    }
  }, [query]);

  // Async Search with Debounce (for pages mode)
  useEffect(() => {
    if (isCommandMode) return;

    const timer = setTimeout(async () => {
      if (query.trim().length === 0) {
        setResults([]);
        return;
      }
      if (window.notepro && window.notepro.searchPages) {
        try {
          const res = await window.notepro.searchPages(query);
          setResults(res || []);
          setSelectedIndex(0);
        } catch (e) {
          console.error('Search failed', e);
        }
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, isCommandMode]);

  const executeCommand = (commandId) => {
    switch (commandId) {
      case 'create-page':
        onCreatePage?.();
        break;
      case 'toggle-theme':
        onToggleTheme?.();
        break;
      case 'daily-journal':
        onOpenDailyNote?.();
        break;
      default:
        break;
    }
    onClose();
  };

  const handleKeyDown = (e) => {
    const items = isCommandMode ? filteredCommands : results;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      if (isCommandMode && filteredCommands.length > 0) {
        executeCommand(filteredCommands[selectedIndex].id);
      } else if (results.length > 0) {
        onSelect(results[selectedIndex].id);
      }
    } else if (e.key === 'Escape') {
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
          maxHeight: 400,
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
          <span style={{ color: isCommandMode ? 'var(--accent-indigo)' : 'var(--text-dim)', fontSize: 18, flexShrink: 0 }}>
            {isCommandMode ? '⌘' : '🔍'}
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isCommandMode ? 'Ketik perintah...' : 'Cari halaman atau ketik > untuk perintah...'}
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
        <div style={{ maxHeight: 340, overflowY: 'auto' }}>
          {isCommandMode ? (
            // Command Mode
            filteredCommands.length === 0 ? (
              <div style={{
                padding: '36px 18px',
                textAlign: 'center',
                color: 'var(--text-dim)',
                fontSize: 13
              }}>
                Perintah tidak ditemukan
              </div>
            ) : (
              filteredCommands.map((cmd, idx) => (
                <div
                  key={cmd.id}
                  onClick={() => executeCommand(cmd.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 18px',
                    cursor: 'pointer',
                    transition: 'background var(--transition)',
                    background: idx === selectedIndex ? 'var(--bg-hover)' : 'transparent'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; setSelectedIndex(idx); }}
                  onMouseLeave={e => { if (idx !== selectedIndex) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{cmd.icon}</span>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{
                      color: 'var(--text-primary)',
                      fontSize: 13,
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 500
                    }}>{cmd.label}</div>
                    <div style={{
                      color: 'var(--text-dim)',
                      fontSize: 11,
                      marginTop: 2
                    }}>{cmd.description}</div>
                  </div>
                  <span style={{
                    color: 'var(--text-dim)',
                    fontSize: 10,
                    background: 'var(--bg-surface2)',
                    borderRadius: 4,
                    padding: '2px 6px'
                  }}>↵</span>
                </div>
              ))
            )
          ) : (
            // Search Mode
            results.length === 0 ? (
              <div style={{
                padding: '36px 18px',
                textAlign: 'center',
                color: 'var(--text-dim)',
                fontSize: 13
              }}>
                {query ? (
                  <>Tidak ditemukan</>
                ) : (
                  <div style={{ opacity: 0.6 }}>
                    <div>Ketik untuk mencari di judul & konten</div>
                    <div style={{ marginTop: 8, fontSize: 11 }}>
                      💡 Ketik <code style={{ background: 'var(--bg-surface2)', padding: '1px 4px', borderRadius: 3 }}>&gt;</code> untuk command palette
                    </div>
                  </div>
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
                    background: idx === selectedIndex ? 'var(--bg-hover)' : 'transparent'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; setSelectedIndex(idx); }}
                  onMouseLeave={e => { if (idx !== selectedIndex) e.currentTarget.style.background = 'transparent'; }}
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
            )
          )}
        </div>
      </div>
    </div>
  );
}
