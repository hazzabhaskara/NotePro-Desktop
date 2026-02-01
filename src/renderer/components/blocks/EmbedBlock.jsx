import React, { useState, useEffect, useRef } from 'react';

export function EmbedBlock({ block, onUpdate, onDelete }) {
    const [url, setUrl] = useState(block.content || '');
    const [isEditing, setIsEditing] = useState(!block.content);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isEditing) inputRef.current?.focus();
    }, [isEditing]);

    const getEmbedUrl = (inputUrl) => {
        if (!inputUrl) return '';
        // YouTube
        const ytMatch = inputUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^&?]+)/);
        if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
        // Vimeo?? Skip for now, assume generic or youtube
        return inputUrl;
    };

    const handleApply = () => {
        const finalUrl = getEmbedUrl(url);
        onUpdate(block.id, { content: finalUrl });
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleApply();
        if (e.key === 'Backspace' && !url) onDelete(block.id);
    };

    const iframeSrc = block.content;

    if (isEditing) {
        return (
            <div style={{
                padding: '12px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                gap: 8
            }}>
                <input
                    ref={inputRef}
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Paste YouTube or website URL..."
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
                <button
                    onClick={handleApply}
                    style={{
                        background: 'var(--accent-indigo)',
                        color: '#fff',
                        borderRadius: 4,
                        padding: '4px 12px',
                        fontSize: 12
                    }}
                >Embed</button>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', marginBottom: 12 }} className="embed-block">
            {/* Iframe */}
            <div style={{
                position: 'relative',
                width: '100%',
                paddingTop: '56.25%', // 16:9 Aspect Ratio
                background: '#000',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden'
            }}>
                {iframeSrc ? (
                    <iframe
                        src={iframeSrc}
                        title="Embed"
                        style={{
                            position: 'absolute',
                            top: 0, left: 0,
                            width: '100%', height: '100%',
                            border: 'none'
                        }}
                        allowFullScreen
                    />
                ) : (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                        Invalid URL
                    </div>
                )}
            </div>

            {/* Controls overlay (visible on hover) */}
            <div className="embed-controls" style={{
                position: 'absolute',
                top: 8, right: 8,
                display: 'flex', gap: 4
            }}>
                <button
                    onClick={() => { setIsEditing(true); setUrl(block.content); }}
                    style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 8px', borderRadius: 4, fontSize: 11 }}
                >Edit</button>
                <button
                    onClick={() => onDelete(block.id)}
                    style={{ background: 'rgba(0,0,0,0.6)', color: '#ff6b6b', padding: '4px 8px', borderRadius: 4, fontSize: 11 }}
                >Delete</button>
            </div>

            <style>{`
            .embed-controls { opacity: 0; transition: opacity 0.2s; }
            .embed-block:hover .embed-controls { opacity: 1; }
          `}</style>
        </div>
    );
}
