import React, { useEffect, useRef } from 'react';

export function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Konfirmasi', cancelLabel = 'Batal', isDanger = false }) {
    const modalRef = useRef(null);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Focus confirm button for a11y if needed, or just trap focus
        }
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(2px)'
        }} onClick={onClose}>
            <div
                ref={modalRef}
                style={{
                    background: 'var(--bg-surface)',
                    padding: '24px',
                    borderRadius: 'var(--radius-lg)',
                    width: '400px',
                    maxWidth: '90%',
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid var(--border)',
                    animation: 'fadeIn 0.2s ease-out'
                }}
                onClick={e => e.stopPropagation()}
            >
                <h3 style={{ margin: '0 0 12px', fontSize: 18, color: 'var(--text-primary)' }}>{title}</h3>
                <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{message}</p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '8px 16px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)',
                            background: 'transparent',
                            color: 'var(--text-primary)',
                            fontSize: 13,
                            cursor: 'pointer'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            padding: '8px 16px',
                            borderRadius: 'var(--radius-md)',
                            border: 'none',
                            background: isDanger ? 'var(--accent-red)' : 'var(--accent-indigo)',
                            color: '#fff',
                            fontSize: 13,
                            cursor: 'pointer',
                            fontWeight: 500
                        }}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
