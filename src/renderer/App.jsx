import React, { useState, useEffect, useCallback } from 'react';
import { TitleBar } from './components/layout/TitleBar';
import { Sidebar } from './components/layout/Sidebar';
import { PageEditor } from './components/editor/PageEditor';
import { SearchModal } from './components/ui/SearchModal';
import { ShortcutsModal } from './components/ui/ShortcutsModal';

export function App() {
  const [pages, setPages] = useState([]);
  const [trashPages, setTrashPages] = useState([]);
  const [activePage, setActivePage] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(() => localStorage.getItem('notepro-sidebar') !== 'false');
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('notepro-theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('notepro-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('notepro-sidebar', sidebarOpen);
  }, [sidebarOpen]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // ── Load all pages on mount ──
  const loadPages = useCallback(async () => {
    try {
      const data = await window.notepro.getPages();
      const trash = await window.notepro.getTrashPages();
      const validPages = Array.isArray(data) ? data : [];
      setPages(validPages);
      setTrashPages(Array.isArray(trash) ? trash : []);

      // Initial load logic
      if (loading && validPages.length > 0 && !activePage) {
        // Only auto-select if we really have no active page and just started
        const first = validPages.find(p => !p.parentId) || validPages[0];
        setActivePage(first);
      }
    } catch (e) {
      console.error("Failed to load pages:", e);
      setPages([]);
    }
    setLoading(false);
  }, [loading, activePage]);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  // ── Keyboard shortcut: Cmd/Ctrl+K, ? ──
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === '?' && !e.target.matches('input, textarea, [contenteditable]')) {
        e.preventDefault();
        setShortcutsOpen(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setShortcutsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setShortcutsOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ── CRUD helpers exposed down ──
  const handleCreatePage = async ({ title, icon, parentId }) => {
    const newId = await window.notepro.createPage({ title, icon, parentId });
    await loadPages();
    // Navigate to new page
    const newPage = await window.notepro.getPage(newId);
    setActivePage(newPage);
  };

  const handleDeletePage = async (pageId) => {
    await window.notepro.deletePage(pageId); // Soft delete
    await loadPages();
    if (activePage?.id === pageId) {
      const remaining = pages.filter(p => p.id !== pageId && p.parentId !== pageId);
      setActivePage(remaining.length > 0 ? remaining[0] : null);
    }
    // Also might need to clear active page if it was deleted
  };

  const handleUpdatePage = async ({ pageId, title, icon, isFavorite }) => {
    await window.notepro.updatePage({ pageId, title, icon, isFavorite });
    setPages(prev => prev.map(p => p.id === pageId ? {
      ...p,
      ...(title !== undefined ? { title } : {}),
      ...(icon !== undefined ? { icon } : {}),
      ...(isFavorite !== undefined ? { isFavorite } : {})
    } : p));

    if (activePage?.id === pageId) {
      setActivePage(prev => ({
        ...prev,
        ...(title !== undefined ? { title } : {}),
        ...(icon !== undefined ? { icon } : {}),
        ...(isFavorite !== undefined ? { isFavorite } : {})
      }));
    }
  };

  const handleRestorePage = async (pageId) => {
    await window.notepro.restorePage(pageId);
    await loadPages();
  };

  const handlePermanentDelete = async (pageId) => {
    await window.notepro.permanentDeletePage(pageId);
    await loadPages();
  };

  const navigateToPage = async (pageId) => {
    const page = await window.notepro.getPage(pageId);
    if (page) setActivePage(page);
  };

  if (loading) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <TitleBar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
          <div style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 14 }}>Memuat...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
      {/* Native-style title bar */}
      <TitleBar />

      {/* App body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar */}
        {sidebarOpen && (
          <Sidebar
            pages={pages}
            trashPages={trashPages}
            activePage={activePage}
            onNavigate={navigateToPage}
            onCreatePage={handleCreatePage}
            onDeletePage={handleDeletePage}
            onToggleFavorite={(pageId, isFav) => handleUpdatePage({ pageId, isFavorite: isFav })}
            onRestorePage={handleRestorePage}
            onPermanentDelete={handlePermanentDelete}
            onToggleSidebar={() => setSidebarOpen(false)}
            onOpenSearch={() => setSearchOpen(true)}
            onToggleTheme={toggleTheme}
            theme={theme}
          />
        )}

        {/* Main editor */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Mini top bar when sidebar is closed */}
          {!sidebarOpen && (
            <div style={{
              height: 40,
              background: 'var(--bg-surface)',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              gap: 10,
              flexShrink: 0
            }}>
              <button onClick={() => setSidebarOpen(true)} style={{ color: 'var(--text-dim)', fontSize: 18, padding: '0 4px' }}>»</button>
              {activePage && <>
                <span style={{ fontSize: 16 }}>{activePage.icon}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }}>{activePage.title}</span>
              </>}
            </div>
          )}

          {/* PageEditor */}
          {activePage ? (
            <PageEditor
              page={activePage}
              onUpdatePage={handleUpdatePage}
              onRefreshPage={() => navigateToPage(activePage.id)}
              onNavigate={navigateToPage}
            />
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
                <div style={{ color: 'var(--text-dim)', fontSize: 14 }}>Pilih atau buat halaman baru</div>
                <button
                  onClick={() => handleCreatePage({ title: 'Halaman Pertama', icon: '📝' })}
                  style={{
                    marginTop: 20, background: 'var(--accent-indigo)', color: '#fff',
                    borderRadius: 'var(--radius-md)', padding: '8px 20px', fontSize: 13, fontWeight: 600
                  }}
                >+ Buat Halaman</button>
                <div style={{ marginTop: 24, fontSize: 11, color: 'var(--text-dim)', opacity: 0.6 }}>
                  Tekan <code style={{ background: 'var(--bg-surface)', padding: '2px 4px', borderRadius: 4 }}>?</code> untuk shortcut keyboard
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {searchOpen && (
        <SearchModal
          pages={pages}
          onClose={() => setSearchOpen(false)}
          onSelect={(pageId) => { navigateToPage(pageId); setSearchOpen(false); }}
        />
      )}

      {shortcutsOpen && (
        <ShortcutsModal onClose={() => setShortcutsOpen(false)} />
      )}
    </div>
  );
}
