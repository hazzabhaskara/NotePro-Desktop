import React, { useState, useCallback } from 'react';

function generateId(prefix = '') {
  return prefix + Math.random().toString(36).substr(2, 9);
}

export function KanbanBlock({ block, onUpdate }) {
  const columns = block.meta?.columns || [];
  const [addingCardColId, setAddingCardColId] = useState(null);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColTitle, setNewColTitle] = useState('');

  const updateColumns = useCallback((newCols) => {
    onUpdate({ meta: { ...block.meta, columns: newCols } });
  }, [onUpdate, block.meta]);

  // ── Add card to column ──
  const handleAddCard = (colId) => {
    if (!newCardTitle.trim()) return;
    const newCols = columns.map(c =>
      c.id === colId
        ? { ...c, cards: [...c.cards, { id: generateId('card-'), title: newCardTitle.trim(), desc: '' }] }
        : c
    );
    updateColumns(newCols);
    setNewCardTitle('');
    setAddingCardColId(null);
  };

  // ── Add new column ──
  const handleAddColumn = () => {
    if (!newColTitle.trim()) return;
    const colors = ['#6366f1', '#ec4899', '#14b8a6', '#8b5cf6', '#f59e0b', '#10b981'];
    const newCol = {
      id: generateId('col-'),
      title: newColTitle.trim(),
      color: colors[columns.length % colors.length],
      cards: []
    };
    updateColumns([...columns, newCol]);
    setNewColTitle('');
    setAddingColumn(false);
  };

  // ── Delete card ──
  const handleDeleteCard = (colId, cardId) => {
    const newCols = columns.map(c =>
      c.id === colId ? { ...c, cards: c.cards.filter(card => card.id !== cardId) } : c
    );
    updateColumns(newCols);
  };

  return (
    <div style={{ marginTop: 8, overflowX: 'auto', paddingBottom: 12 }}>
      <div style={{ display: 'flex', gap: 12, minWidth: 'max-content' }}>
        {columns.map(col => (
          <div key={col.id} style={{
            width: 240,
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Column Header */}
            <div style={{
              padding: '9px 12px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{
                color: col.color,
                fontWeight: 700,
                fontSize: 12,
                fontFamily: 'var(--font-mono)'
              }}>{col.title}</span>
              <span style={{
                background: col.color + '22',
                color: col.color,
                borderRadius: 99,
                padding: '1px 7px',
                fontSize: 10,
                fontWeight: 600
              }}>{col.cards.length}</span>
            </div>

            {/* Cards */}
            <div style={{ padding: 8, flex: 1, display: 'flex', flexDirection: 'column', gap: 7, minHeight: 60 }}>
              {col.cards.map(card => (
                <div
                  key={card.id}
                  className="kanban-card"
                  style={{
                    background: 'var(--bg-surface2)',
                    border: '1px solid var(--border)',
                    borderLeft: `3px solid ${col.color}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '9px 10px',
                    cursor: 'grab',
                    transition: 'border-color var(--transition), transform var(--transition), box-shadow var(--transition)',
                    position: 'relative'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = col.color;
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ color: 'var(--text-primary)', fontSize: 12.5, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{card.title}</div>
                  {card.desc && <div style={{ color: 'var(--text-dim)', fontSize: 11, marginTop: 3 }}>{card.desc}</div>}

                  {/* Delete card button (hover) */}
                  <button
                    className="card-delete-btn"
                    onClick={() => handleDeleteCard(col.id, card.id)}
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 5,
                      width: 18,
                      height: 18,
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-dim)',
                      fontSize: 11,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity var(--transition), background var(--transition), color var(--transition)'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-red)33'; e.currentTarget.style.color = 'var(--accent-red)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-dim)'; }}
                  >✕</button>
                </div>
              ))}

              {/* Add card input / button */}
              {addingCardColId === col.id ? (
                <div style={{ marginTop: 2 }}>
                  <input
                    autoFocus
                    value={newCardTitle}
                    onChange={e => setNewCardTitle(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAddCard(col.id);
                      if (e.key === 'Escape') { setAddingCardColId(null); setNewCardTitle(''); }
                    }}
                    placeholder="Judul card..."
                    style={{
                      width: '100%',
                      background: 'var(--bg-hover)',
                      border: '1px solid var(--border-hover)',
                      borderRadius: 'var(--radius-md)',
                      padding: '6px 9px',
                      fontSize: 12,
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-mono)'
                    }}
                  />
                  <div style={{ display: 'flex', gap: 5, marginTop: 5 }}>
                    <button
                      onClick={() => handleAddCard(col.id)}
                      style={{
                        flex: 1,
                        background: col.color,
                        borderRadius: 'var(--radius-md)',
                        color: '#fff',
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '5px 0'
                      }}
                    >Tambah</button>
                    <button
                      onClick={() => { setAddingCardColId(null); setNewCardTitle(''); }}
                      style={{
                        background: 'var(--bg-hover)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-muted)',
                        fontSize: 11,
                        padding: '5px 8px'
                      }}
                    >✕</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingCardColId(col.id)}
                  style={{
                    background: 'transparent',
                    border: '1px dashed var(--border-hover)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-dim)',
                    fontSize: 11,
                    padding: '5px 0',
                    transition: 'border-color var(--transition), color var(--transition)',
                    marginTop: 2
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-muted)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--text-dim)'; }}
                >+ Card</button>
              )}
            </div>
          </div>
        ))}

        {/* Add Column */}
        {addingColumn ? (
          <div style={{
            width: 240,
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: 10,
            flexShrink: 0
          }}>
            <input
              autoFocus
              value={newColTitle}
              onChange={e => setNewColTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleAddColumn();
                if (e.key === 'Escape') { setAddingColumn(false); setNewColTitle(''); }
              }}
              placeholder="Nama kolom..."
              style={{
                width: '100%',
                background: 'var(--bg-hover)',
                border: '1px solid var(--border-hover)',
                borderRadius: 'var(--radius-md)',
                padding: '6px 9px',
                fontSize: 12,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)'
              }}
            />
            <div style={{ display: 'flex', gap: 5, marginTop: 6 }}>
              <button
                onClick={handleAddColumn}
                style={{ flex: 1, background: 'var(--accent-indigo)', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '5px 0' }}
              >Tambah</button>
              <button
                onClick={() => { setAddingColumn(false); setNewColTitle(''); }}
                style={{ background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: 11, padding: '5px 8px' }}
              >✕</button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAddingColumn(true)}
            style={{
              width: 200,
              background: 'transparent',
              border: '1px dashed var(--border-hover)',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--text-dim)',
              fontSize: 12,
              padding: 10,
              flexShrink: 0,
              transition: 'all var(--transition)',
              alignSelf: 'flex-start',
              minHeight: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-muted)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--text-dim)'; }}
          >+ Kolom Baru</button>
        )}
      </div>

      {/* Hover styles */}
      <style>{`
        .card-delete-btn { opacity: 0 !important; }
        .kanban-card:hover .card-delete-btn { opacity: 1 !important; }
      `}</style>
    </div>
  );
}
