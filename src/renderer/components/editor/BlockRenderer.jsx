import React, { memo } from 'react';
import { ParagraphBlock } from '../blocks/ParagraphBlock';
import { HeadingBlock } from '../blocks/HeadingBlock';
import { ListBlock } from '../blocks/ListBlock';
import { TodoBlock } from '../blocks/TodoBlock';
import { ToggleBlock } from '../blocks/ToggleBlock';
import { QuoteBlock } from '../blocks/QuoteBlock';
import { DividerBlock } from '../blocks/DividerBlock';
import { KanbanBlock } from '../blocks/KanbanBlock';
import { TableBlock } from '../blocks/TableBlock';
import { ImageBlock } from '../blocks/ImageBlock';
import { CodeBlock } from '../blocks/CodeBlock';
import { EmbedBlock } from '../blocks/EmbedBlock';

function BlockRendererComponent({ block, onUpdate, onDelete, onNavigate, onTriggerSlash }) {
  switch (block.type) {
    case 'paragraph':
      return <ParagraphBlock block={block} onUpdate={onUpdate} onDelete={onDelete} onNavigate={onNavigate} onTriggerSlash={onTriggerSlash} />;

    case 'heading1':
    case 'heading2':
    case 'heading3':
      // Headings might use RichText later
      return <HeadingBlock block={block} onUpdate={onUpdate} onDelete={onDelete} />;

    case 'bulleted_list':
      return <ListBlock block={block} variant="bullet" onUpdate={onUpdate} onDelete={onDelete} />;

    case 'numbered_list':
      return <ListBlock block={block} variant="number" onUpdate={onUpdate} onDelete={onDelete} />;

    case 'todo':
      return <TodoBlock block={block} onUpdate={onUpdate} onDelete={onDelete} />;

    case 'toggle':
      return <ToggleBlock block={block} onUpdate={onUpdate} onDelete={onDelete} />;

    case 'quote':
      return <QuoteBlock block={block} onUpdate={onUpdate} onDelete={onDelete} />;

    case 'divider':
      return <DividerBlock />;

    case 'kanban':
      return <KanbanBlock block={block} onUpdate={onUpdate} />;

    case 'table':
      return <TableBlock block={block} onUpdate={onUpdate} />;

    case 'image':
      return <ImageBlock block={block} onUpdate={onUpdate} />;

    case 'code':
      return <CodeBlock block={block} onUpdate={onUpdate} />;

    case 'embed':
      return <EmbedBlock block={block} onUpdate={onUpdate} onDelete={onDelete} />;

    default:
      return (
        <div style={{ color: 'var(--text-dim)', fontSize: 12, padding: '2px 0', fontStyle: 'italic' }}>
          [Block type tidak dikenal: {block.type}]
        </div>
      );
  }
}

// Memoize (shallow compare is enough usually, assuming stable callbacks)
export const BlockRenderer = memo(BlockRendererComponent);
