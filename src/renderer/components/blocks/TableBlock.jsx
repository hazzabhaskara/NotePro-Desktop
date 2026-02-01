import React, { useState } from 'react';

export function TableBlock({ block, onUpdate }) {
  const headers = block.meta?.headers || [];
  const rows = block.meta?.rows || [];
  const [addingRow, setAddingRow] = useState(false);
  const [newRow, setNewRow] = useState(() => headers.map(() => ''));

  const progressColIndex = headers.findIndex(h => h.toLowerCase().includes('progres'));

  const handleAddRow = () => {
    if (newRow.every(c => c.trim() === '')) return;
    const updatedRows = [...rows, [...newRow]];
    onUpdate({ meta: { ...block.meta, rows: updatedRows } });
    setNewRow(headers.map(() => ''));
    setAddingRow(false);
  };

  const getProgressColor = (val) => {
    const num = parseInt(val);
    if (isNaN(num)) return 'var(--accent-indigo)';
    if (num > 60) return 'var(--accent-green)';
    if (num > 30) return 'var(--accent-amber)';
    return 'var(--accent-red)';
  };

  return (
    <div style={{ marginTop: 8, overflowX: 'auto', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
        {/* Head */}
        <thead>
          <tr style={{ background: 'var(--bg-surface2)' }}>
            {headers.map((h, i) => (
              <th key={i} style={{
                padding: '9px 14px',
                textAlign: 'left',
                color: 'var(--text-dim)',
                fontWeight: 600,
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                borderBottom: '1px solid var(--border)',
                whiteSpace: 'nowrap',
                userSelect: 'none'
              }}>{h}</th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              style={{ borderBottom: '1px solid var(--border)', transition: 'background var(--transition)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {row.map((cell, ci) => (
                <td key={ci} style={{
                  padding: '8px 14px',
                  color: ci === 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: ci === 0 ? 600 : 400,
                  whiteSpace: 'nowrap'
                }}>
                  {ci === progressColIndex ? (
                    // Progress bar
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, background: 'var(--bg-hover)', borderRadius: 99, height: 6, overflow: 'hidden', minWidth: 60 }}>
                        <div style={{
                          height: '100%',
                          background: getProgressColor(cell),
                          borderRadius: 99,
                          width: cell,
                          transition: 'width 0.6s ease'
                        }} />
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-dim)', minWidth: 34, textAlign: 'right' }}>{cell}</span>
                    </div>
                  ) : cell}
                </td>
              ))}
            </tr>
          ))}

          {/* New row input */}
          {addingRow && (
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
              {newRow.map((val, ci) => (
                <td key={ci} style={{ padding: '4px 8px' }}>
                  <input
                    value={val}
                    onChange={e => {
                      const updated = [...newRow];
                      updated[ci] = e.target.value;
                      setNewRow(updated);
                    }}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddRow(); if (e.key === 'Escape') setAddingRow(false); }}
                    placeholder={headers[ci]}
                    style={{
                      width: '100%',
                      background: 'var(--bg-hover)',
                      border: '1px solid var(--border-hover)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '5px 8px',
                      fontSize: 12,
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-mono)'
                    }}
                  />
                </td>
              ))}
            </tr>
          )}
        </tbody>
      </table>

      {/* Bottom: add row button */}
      <div style={{ padding: '6px 10px', borderTop: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
        {addingRow ? (
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={handleAddRow}
              style={{ background: 'var(--accent-indigo)', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '4px 12px' }}
            >+ Tambah</button>
            <button
              onClick={() => { setAddingRow(false); setNewRow(headers.map(() => '')); }}
              style={{ background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: 11, padding: '4px 8px' }}
            >Batal</button>
          </div>
        ) : (
          <button
            onClick={() => setAddingRow(true)}
            style={{
              color: 'var(--text-dim)',
              fontSize: 11,
              padding: '3px 0',
              transition: 'color var(--transition)'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-muted)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
          >+ Tambah Row</button>
        )}
      </div>
    </div>
  );
}
