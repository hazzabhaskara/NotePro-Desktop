export function exportMarkdown(pageTitle, blocks) {
    let md = `# ${pageTitle}\n\n`;

    blocks.forEach(block => {
        switch (block.type) {
            case 'paragraph':
                md += `${block.content}\n\n`;
                break;

            case 'heading1':
                md += `# ${block.content}\n\n`;
                break;

            case 'heading2':
                md += `## ${block.content}\n\n`;
                break;

            case 'heading3':
                md += `### ${block.content}\n\n`;
                break;

            case 'bulleted_list':
                md += `- ${block.content}\n`;
                // Check if next is not list, add newline
                break;

            case 'numbered_list':
                md += `1. ${block.content}\n`;
                break;

            case 'todo': {
                const checked = block.meta?.checked ? 'x' : ' ';
                md += `- [${checked}] ${block.content}\n`;
                break;
            }

            case 'quote':
                md += `> ${block.content}\n\n`;
                break;

            case 'code': {
                const lang = block.meta?.language || '';
                md += '```' + lang + '\n' + (block.content || '') + '\n```\n\n';
                break;
            }

            case 'image': {
                const caption = block.meta?.caption || 'Image';
                // Use local path or abstract
                md += `![${caption}](${block.content})\n\n`;
                break;
            }

            case 'divider':
                md += '\n---\n\n';
                break;

            default:
                // Ignore unknown
                break;
        }
    });

    return md;
}
