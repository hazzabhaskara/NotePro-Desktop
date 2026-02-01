import React, { useState, useEffect, useRef } from 'react';
import Prism from 'prismjs';
import '../../styles/prism-theme.css';

// Import common languages
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-jsx';

const LANGUAGES = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'json', label: 'JSON' },
    { value: 'sql', label: 'SQL' },
    { value: 'bash', label: 'Bash' },
    { value: 'jsx', label: 'JSX' },
];

export function CodeBlock({ block, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    // Default to javascript if no language set
    const language = block.meta?.language || 'javascript';
    const code = block.content || '';
    const codeRef = useRef(null);

    useEffect(() => {
        if (codeRef.current && !isEditing) {
            Prism.highlightElement(codeRef.current);
        }
    }, [code, language, isEditing]);

    const handleChange = (e) => {
        onUpdate({ content: e.target.value });
    };

    const handleLanguageChange = (e) => {
        onUpdate({ meta: { ...block.meta, language: e.target.value } });
    };

    return (
        <div style={{ position: 'relative', margin: '12px 0', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
            {/* Header / Toolbar */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                background: 'var(--bg-surface)',
                borderBottom: '1px solid var(--border)'
            }}>
                <select
                    value={language}
                    onChange={handleLanguageChange}
                    style={{
                        background: 'transparent',
                        color: 'var(--text-secondary)',
                        border: 'none',
                        fontSize: 12,
                        cursor: 'pointer',
                        outline: 'none'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {LANGUAGES.map(lang => (
                        <option key={lang.value} value={lang.value}>{lang.label}</option>
                    ))}
                </select>

                <button
                    onClick={() => setIsEditing(!isEditing)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-dim)',
                        fontSize: 12,
                        cursor: 'pointer'
                    }}
                >
                    {isEditing ? 'Done' : 'Edit'}
                </button>
            </div>

            {/* Editor or Viewer */}
            {isEditing ? (
                <textarea
                    value={code}
                    onChange={handleChange}
                    autoFocus
                    onBlur={() => setIsEditing(false)}
                    spellCheck={false}
                    style={{
                        width: '100%',
                        minHeight: 120,
                        padding: 16,
                        background: '#1e1e2e',
                        color: '#cdd6f4',
                        border: 'none',
                        fontFamily: 'monospace',
                        fontSize: 13,
                        lineHeight: 1.5,
                        resize: 'vertical',
                        outline: 'none',
                        display: 'block'
                    }}
                />
            ) : (
                <div
                    onClick={() => setIsEditing(true)}
                    style={{ background: '#1e1e2e', cursor: 'text' }}
                >
                    <pre className={`language-${language}`} style={{ margin: 0, borderRadius: 0 }}>
                        <code ref={codeRef}>{code}</code>
                    </pre>
                    {/* Empty state placeholder */}
                    {!code && (
                        <div style={{ padding: 16, color: '#6c7086', fontSize: 13, fontStyle: 'italic' }}>
              // Klik untuk menulis kode ({language})...
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
