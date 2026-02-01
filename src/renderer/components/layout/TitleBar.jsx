import React, { useState, useEffect } from 'react';

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    // Check initial maximize state
    window.notepro.windowIsMaximized().then(setIsMaximized);
  }, []);

  const handleMinimize = () => window.notepro.windowMinimize();
  const handleMaximize = async () => {
    await window.notepro.windowMaximize();
    const max = await window.notepro.windowIsMaximized();
    setIsMaximized(max);
  };
  const handleClose = () => window.notepro.windowClose();

  return (
    <div style={{
      height: 32,
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      flexShrink: 0,
      position: 'relative',
      zIndex: 100
    }}>
      {/* Drag region */}
      <div style={{
        WebkitAppRegion: 'drag',
        flex: 1,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 12,
        gap: 8
      }}>
        {/* App logo */}
        <div style={{
          width: 20,
          height: 20,
          background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-pink))',
          borderRadius: 5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          color: '#fff',
          fontWeight: 800,
          flexShrink: 0
        }}>✦</div>
        <span style={{
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-display)',
          letterSpacing: '0.02em'
        }}>NotePro</span>
      </div>

      {/* Window control buttons — no drag */}
      <div style={{
        WebkitAppRegion: 'no-drag',
        display: 'flex',
        alignItems: 'stretch',
        height: '100%'
      }}>
        {/* Minimize */}
        <button
          onClick={handleMinimize}
          style={{
            width: 46,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-dim)',
            fontSize: 16,
            transition: 'background var(--transition), color var(--transition)'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-dim)'; }}
        >─</button>

        {/* Maximize / Restore */}
        <button
          onClick={handleMaximize}
          style={{
            width: 46,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-dim)',
            fontSize: 13,
            transition: 'background var(--transition), color var(--transition)'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-dim)'; }}
        >{isMaximized ? '⬚' : '□'}</button>

        {/* Close */}
        <button
          onClick={handleClose}
          style={{
            width: 46,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-dim)',
            fontSize: 16,
            transition: 'background var(--transition), color var(--transition)'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-red)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-dim)'; }}
        >✕</button>
      </div>
    </div>
  );
}
