import React from 'react';

// Regex patterns
const BOLD_REGEX = /\*\*(.*?)\*\*/g;
const ITALIC_REGEX = /\*(.*?)\*/g;
const STRIKE_REGEX = /~(.*?)~/g;
const CODE_REGEX = /`(.*?)`/g;
const LINK_REGEX = /\[\[(.*?)\]\]/g;

export function RichTextRenderer({ content, onNavigate }) {
    if (!content) return null;

    // Split content by all possible patterns
    // Strategy: Replace patterns with special tokens, then split and replace back with components?
    // Easier strategy: Recursively split by finding the first match of any pattern.
    // Or, since it's simple: use a composite regex or multiple passes.
    // Multiple passes is hard with React components.
    // Let's use a simple parser that scans standard markdown.

    // Actually, for simplicity and performance in this MVP, let's use a regex split approach.
    // But regex split includes capturing groups.

    const parts = content.split(/(\*\*.*?\*\*|\*.*?\*|~.*?~|`.*?`|\[\[.*?\]\])/g);

    return (
        <>
            {parts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={index}>{part.slice(2, -2)}</strong>;
                }
                if (part.startsWith('*') && part.endsWith('*')) {
                    return <em key={index}>{part.slice(1, -1)}</em>;
                }
                if (part.startsWith('~') && part.endsWith('~')) {
                    return <del key={index}>{part.slice(1, -1)}</del>;
                }
                if (part.startsWith('`') && part.endsWith('`')) {
                    return (
                        <code key={index} style={{
                            background: 'rgba(255,255,255,0.1)',
                            padding: '0 4px',
                            borderRadius: 4,
                            fontFamily: 'monospace',
                            fontSize: '0.9em'
                        }}>{part.slice(1, -1)}</code>
                    );
                }
                if (part.startsWith('[[') && part.endsWith(']]')) {
                    const pageName = part.slice(2, -2);
                    return (
                        <span
                            key={index}
                            onClick={(e) => {
                                e.stopPropagation();
                                // We need to resolve pageName to ID. For now, let's try to navigate via search or title.
                                // Since onNavigate expects ID, and we don't have ID here easily,
                                // we might need a special handler "onNavigateByTitle" or just pass event up.
                                // For MVP, if onNavigate is passed, call it with special payload or handle upstream.
                                // Actually, let's just emit event or console log for now if ID resolution is hard.
                                if (onNavigate) onNavigate(null, pageName); // Assuming onNavigate can handle title lookup?
                            }}
                            style={{
                                color: 'var(--accent-indigo)',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                fontWeight: 500
                            }}
                        >
                            {pageName}
                        </span>
                    );
                }
                return part;
            })}
        </>
    );
}
