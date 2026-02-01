import React, { useState, useEffect, useMemo, memo } from 'react';
import { ContextMenu } from '../ui/ContextMenu';

// ─── Trash Item Component ───
const TrashItem = ({ page, onContextMenu }) => {
  return (
    <div
      style={{
        padding: '6px 12px 6px 28px',
        fontSize: 12,
        color: 'var(--text-muted)',
        cursor: 'default',
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }}
      onContextMenu={(e) => onContextMenu(e, page, true)}
    >
      <span>{page.icon}</span>
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: 'line-through' }}>{page.title}</span>
    </div>
  );
};

// ─── Recursive Page Item Component ───
const PageItem = ({
  page,
  allPages,
  activePage,
  expandedIds,
  depth = 0,
  onNavigate,
  onToggleExpand,
  onContextMenu,
  onCreatePage
}) => {
  // Simple filter, relying on React fast render
  const children = allPages.filter(p => p.parentId === page.id);
  const isActive = activePage?.id === page.id;
  const isExpanded = expandedIds[page.id];
  const hasChildren = children.length > 0;

  return (
    <div>
      {/* Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          height: 30,
          paddingLeft: 10 + depth * 16,
          paddingRight: 8,
          marginBottom: 1,
          borderRadius: 'var(--radius-md)',
          marginLeft: 6,
          marginRight: 6,
          cursor: 'pointer',
          background: isActive ? 'var(--bg-hover)' : 'transparent',
          transition: 'background var(--transition)',
          position: 'relative',
          userSelect: 'none'
        }}
        onClick={() => onNavigate(page.id)}
        onContextMenu={(e) => onContextMenu(e, page, false)}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-surface2)'; }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
      >
        {/* Expand arrow */}
        <div style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {hasChildren ? (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleExpand(page.id); }}
              style={{
                color: 'var(--text-dim)',
                fontSize: 9,
                padding: 0,
                width: 14,
                height: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 3,
                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >▶</button>
          ) : null}
        </div>

        {/* Icon */}
        <span style={{ fontSize: 15, flexShrink: 0, width: 20, textAlign: 'center' }}>{page.icon}</span>

        {/* Title */}
        <span style={{
          flex: 1,
          fontSize: 12.5,
          fontWeight: isActive || page.isFavorite ? 600 : 400,
          color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontFamily: 'var(--font-mono)'
        }}>
          {page.title}
        </span>

        {/* Fav Indicator */}
        {page.isFavorite && (
          <span style={{ fontSize: 10, color: 'var(--accent-yellow)', marginRight: 4 }}>★</span>
        )}

        {/* Hover: + button */}
        <button
          className="page-add-btn"
          onClick={(e) => { e.stopPropagation(); onCreatePage({ parentId: page.id, title: 'Sub-halaman Baru', icon: '📄' }); }}
          style={{
            width: 18,
            height: 18,
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-dim)',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            flexShrink: 0
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >+</button>
      </div>

      {/* Children */}
      {isExpanded && children.map(child => (
        <PageItem
          key={child.id}
          page={child}
          allPages={allPages}
          activePage={activePage}
          expandedIds={expandedIds}
          depth={depth + 1}
          onNavigate={onNavigate}
          onToggleExpand={onToggleExpand}
          onContextMenu={onContextMenu}
          onCreatePage={onCreatePage}
        />
      ))}
    </div>
  );
};

export function Sidebar({
  pages,
  trashPages = [],
  activePage,
  onNavigate,
  onCreatePage,
  onDeletePage,
  onToggleSidebar,
  onOpenSearch,
  onToggleFavorite,
  onRestorePage,
  onPermanentDelete,
  onToggleTheme,
  theme
}) {
  // Initialize extended state
  const [expandedIds, setExpandedIds] = useState({ 'page-4': true });
  const [trashOpen, setTrashOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState(null); // { x, y, pageId, isTrash }

  const favorites = useMemo(() => pages.filter(p => p.isFavorite), [pages]);
  const topLevel = useMemo(() => pages.filter(p => !p.parentId), [pages]);

  const toggleExpand = (id) => setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));

  // Close context menu on outside click
  useEffect(() => {
    const close = () => setContextMenu(null);
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, []);

  const handleContextMenu = (e, page, isTrash) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, pageId: page.id, isTrash });
  };

  const handleContextAction = (action, pageId) => {
    setContextMenu(null);
    if (action === 'sub') {
      onCreatePage({ parentId: pageId, title: 'Sub-halaman Baru', icon: '📄' });
    } else if (action === 'delete') {
      onDeletePage(pageId);
    } else if (action === 'toggle-fav') {
      const page = pages.find(p => p.id === pageId);
      if (page) onToggleFavorite(pageId, !page.isFavorite);
    } else if (action === 'restore') {
      onRestorePage(pageId);
    } else if (action === 'permanent-delete') {
      if (confirm('Hapus selamanya? Data tidak bisa dikembalikan.')) {
        onPermanentDelete(pageId);
      }
    }
  };

  return (
    <div style={{
      width: 240,
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      height: '100%',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* ── Logo Row ── */}
      <div style={{
        padding: '16px 14px 10px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0
      }}>
        <div style={{
          width: 28,
          height: 28,
          background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-pink))',
          borderRadius: 7,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          color: '#fff',
          flexShrink: 0
        }}>✦</div>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 16,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          flex: 1
        }}>NotePro</span>
        {/* Toggle sidebar off */}
        <button
          onClick={onToggleSidebar}
          style={{ color: 'var(--text-dim)', fontSize: 16, padding: '2px 4px' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
        >«</button>
      </div>

      {/* ── Search ── */}
      <button
        onClick={onOpenSearch}
        style={{
          margin: '0 10px 6px',
          background: 'var(--bg-surface2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '7px 10px',
          color: 'var(--text-dim)',
          fontSize: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          transition: 'border-color var(--transition)'
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
      >
        <span style={{ fontSize: 14 }}>🔍</span>
        <span>Cari...</span>
        <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-dim)', background: 'var(--bg-hover)', borderRadius: 4, padding: '1px 5px' }}>⌘K</span>
      </button>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>

        {/* ── Favorites ── */}
        {favorites.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{
              padding: '10px 14px 4px',
              fontSize: 10,
              color: 'var(--text-dim)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: 700
            }}>Favorit</div>
            {favorites.map(page => (
              <div
                key={'fav-' + page.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  height: 28,
                  padding: '0 14px',
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
                onClick={() => onNavigate(page.id)}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span>{page.icon}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{page.title}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Section: Halaman ── */}
        <div style={{
          padding: '4px 14px 4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <span style={{
            fontSize: 10,
            color: 'var(--text-dim)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontWeight: 700
          }}>Halaman</span>
          <button
            onClick={() => onCreatePage({ title: 'Halaman Baru', icon: '📄', parentId: null })}
            style={{ color: 'var(--text-dim)', fontSize: 18, lineHeight: 1, padding: '0 2px' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
          >+</button>
        </div>

        {/* ── Page Tree ── */}
        <div>
          {topLevel.map(page => (
            <PageItem
              key={page.id}
              page={page}
              allPages={pages}
              activePage={activePage}
              expandedIds={expandedIds}
              depth={0}
              onNavigate={onNavigate}
              onToggleExpand={toggleExpand}
              onContextMenu={handleContextMenu}
              onCreatePage={onCreatePage}
            />
          ))}
        </div>

        {/* ── Trash Section ── */}
        <div style={{ marginTop: 20 }}>
          <div
            onClick={() => setTrashOpen(!trashOpen)}
            style={{
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              color: 'var(--text-muted)',
              cursor: 'pointer',
              userSelect: 'none'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <span>🗑️</span>
            <span style={{ flex: 1 }}>Sampah</span>
            <span style={{ fontSize: 10 }}>{trashPages.length}</span>
          </div>

          {trashOpen && (
            <div style={{ paddingLeft: 0 }}>
              {trashPages.length === 0 ? (
                <div style={{ padding: '4px 28px', fontSize: 11, color: 'var(--text-dim)', fontStyle: 'italic' }}>Kosong</div>
              ) : (
                trashPages.map(p => (
                  <TrashItem
                    key={p.id}
                    page={p}
                    onContextMenu={handleContextMenu}
                  />
                ))
              )}
            </div>
          )}
        </div>

      </div>

      {/* ── Footer / Theme Toggle ── */}
      <div style={{
        padding: '12px 14px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>v1.0.0</span>

        <button
          onClick={onToggleTheme}
          style={{
            width: 24, height: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 4,
            color: 'var(--text-secondary)',
            fontSize: 14,
            transition: 'transform 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>
      </div>

      {/* ── Context Menu ── */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          pageId={contextMenu.pageId}
          isTrash={contextMenu.isTrash}
          onAction={handleContextAction}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* CSS: show + btn on row hover */}
      <style>{`
        .page-add-btn { opacity: 0 !important; }
        div[style*="position: relative"]:hover .page-add-btn { opacity: 1 !important; }
      `}</style>
    </div>
  );
}
