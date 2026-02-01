import React from 'react';

export function ShortcutsModal({ onClose }) {
    const SHORTCUTS = [
        { key: 'Ctrl + /', label: 'Buka Menu Shortcut ini' },
        { key: 'Ctrl + K', label: 'Cari Halaman' },
        { key: 'Ctrl + P', label: 'Cari Halaman (Alternatif)' },
        { key: 'Ctrl + B', label: 'Toggle Sidebar' },
        { key: 'Ctrl + Z', label: 'Undo' },
        { key: 'Ctrl + Shift + Z', label: 'Redo' },
        { key: 'Cmd/Ctrl + Enter', label: 'Selesai Edit Block (Code/Toggle)' },
        { key: '/', label: 'Slash Menu (Insert Block)' },
        { key: '[[', label: 'Insert Link Halaman' },
        { key: 'Escape', label: 'Tutup Modal / Clear Selection' },
    ];

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            backdropFilter: 'blur(2px)'
        }} onClick={onClose}>
            <div style={{
                width: 500,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                padding: 24
            }} onClick={e => e.stopPropagation()}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700 }}>Keyboard Shortcuts</h2>
                    <button onClick={onClose} style={{ fontSize: 18, color: 'var(--text-dim)' }}>✕</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {SHORTCUTS.map((s, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, padding: '4px 0', borderBottom: '1px solid var(--bg-hover)' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                            <span style={{
                                fontFamily: 'var(--font-mono)',
                                background: 'var(--bg-active)',
                                padding: '2px 6px',
                                borderRadius: 4,
                                fontSize: 11,
                                color: 'var(--text-primary)'
                            }}>{s.key}</span>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: 'var(--text-dim)' }}>
                    NotePro v1.0 • Built with Electron & React
                </div>
            </div>
        </div>
    );
}
