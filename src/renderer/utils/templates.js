export const TEMPLATES = [
    {
        id: 'meeting-notes',
        label: 'Meeting Notes',
        icon: '📅',
        description: 'Catat agenda, peserta, dan action items.',
        blocks: [
            { type: 'heading1', content: 'Meeting Notes' },
            { type: 'divider' },
            { type: 'heading2', content: '📅 Details' },
            { type: 'bulleted_list', content: 'Date: ' },
            { type: 'bulleted_list', content: 'Attendees: ' },
            { type: 'heading2', content: '📝 Agenda' },
            { type: 'todo', content: 'Topic 1' },
            { type: 'todo', content: 'Topic 2' },
            { type: 'heading2', content: '✅ Action Items' },
            { type: 'todo', content: 'Action 1' },
        ]
    },
    {
        id: 'daily-journal',
        label: 'Daily Journal',
        icon: '📓',
        description: 'Refleksi harian dan planning besok.',
        blocks: [
            { type: 'heading1', content: 'Daily Journal' },
            { type: 'quote', content: 'What is the highlight of today?' },
            { type: 'heading2', content: '🌟 Wins' },
            { type: 'bulleted_list', content: '' },
            { type: 'heading2', content: 'challenges' },
            { type: 'bulleted_list', content: '' },
            { type: 'heading2', content: '🚀 Tomorrow' },
            { type: 'todo', content: 'Goal 1' },
        ]
    },
    {
        id: 'project-tracker',
        label: 'Project Tracker',
        icon: '🚀',
        description: 'Track progress project sederhana.',
        blocks: [
            { type: 'heading1', content: 'Project Alpha' },
            {
                type: 'kanban', content: JSON.stringify({
                    columns: [
                        { id: 'col1', title: 'To Do', cards: [{ id: 'c1', content: 'Task 1' }] },
                        { id: 'col2', title: 'In Progress', cards: [] },
                        { id: 'col3', title: 'Done', cards: [] }
                    ]
                })
            },
            { type: 'heading2', content: 'Resources' },
            { type: 'bulleted_list', content: 'Design Doc' },
            { type: 'bulleted_list', content: 'API Spec' },
        ]
    }
];
