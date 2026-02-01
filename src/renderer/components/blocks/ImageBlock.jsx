import React, { useState } from 'react';

export function ImageBlock({ block, onUpdate }) {
    const [loading, setLoading] = useState(false);

    const handleSelectImage = async () => {
        setLoading(true);
        try {
            const url = await window.notepro.selectImage();
            if (url) {
                onUpdate({ content: url });
            }
        } catch (error) {
            console.error('Failed to select image:', error);
        }
        setLoading(false);
    };

    const handleUpdateCaption = (e) => {
        const caption = e.target.value;
        onUpdate({ meta: { ...block.meta, caption } });
    };

    if (!block.content) {
        return (
            <div
                style={{
                    background: 'var(--bg-surface)',
                    border: '1px dashed var(--border-color)',
                    borderRadius: 8,
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--text-muted)'
                }}
                onClick={handleSelectImage}
            >
                {loading ? (
                    <span>Memproses...</span>
                ) : (
                    <>
                        <span style={{ fontSize: 24, marginBottom: 8 }}>🖼️</span>
                        <span>Klik untuk upload gambar</span>
                    </>
                )}
            </div>
        );
    }

    return (
        <div style={{ margin: '12px 0' }}>
            <img
                src={block.content}
                alt="User uploaded"
                style={{
                    maxWidth: '100%',
                    borderRadius: 8,
                    display: 'block'
                }}
            />
            <input
                type="text"
                placeholder="Tulis caption..."
                value={block.meta?.caption || ''}
                onChange={handleUpdateCaption}
                style={{
                    width: '100%',
                    marginTop: 8,
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-dim)',
                    fontSize: 13,
                    textAlign: 'center',
                    outline: 'none'
                }}
            />
        </div>
    );
}
