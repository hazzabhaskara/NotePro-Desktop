const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('notepro', {
  // ── Pages ──
  getPages: () => ipcRenderer.invoke('get-pages'),
  getTrashPages: () => ipcRenderer.invoke('get-trash-pages'),
  searchPages: (query) => ipcRenderer.invoke('search-pages', query),

  // Tags
  getTags: () => ipcRenderer.invoke('get-tags'),
  createTag: (tag) => ipcRenderer.invoke('create-tag', tag),
  deleteTag: (tagId) => ipcRenderer.invoke('delete-tag', tagId),
  getPageTags: (pageId) => ipcRenderer.invoke('get-page-tags', pageId),
  addTagToPage: (data) => ipcRenderer.invoke('add-tag-to-page', data),
  removeTagFromPage: (data) => ipcRenderer.invoke('remove-tag-from-page', data),
  getPage: (pageId) => ipcRenderer.invoke('get-page', pageId),
  createPage: (data) => ipcRenderer.invoke('create-page', data),
  updatePage: (data) => ipcRenderer.invoke('update-page', data),
  deletePage: (pageId) => ipcRenderer.invoke('delete-page', pageId), // This becomes soft delete
  restorePage: (pageId) => ipcRenderer.invoke('restore-page', pageId),
  permanentDeletePage: (pageId) => ipcRenderer.invoke('permanent-delete-page', pageId),

  // ── Blocks ──
  createBlock: (data) => ipcRenderer.invoke('create-block', data),
  updateBlock: (data) => ipcRenderer.invoke('update-block', data),
  deleteBlock: (blockId) => ipcRenderer.invoke('delete-block', blockId),
  reorderBlocks: (data) => ipcRenderer.invoke('reorder-blocks', data),
  replacePageBlocks: (pageId, blocks) => ipcRenderer.invoke('replace-page-blocks', { pageId, blocks }),
  selectImage: () => ipcRenderer.invoke('select-image'),
  exportMarkdown: (data) => ipcRenderer.invoke('export-markdown', data),
  exportPdf: (title) => ipcRenderer.invoke('export-pdf', title),

  // ── Window Controls ──
  windowMinimize: () => ipcRenderer.invoke('window-minimize'),
  windowMaximize: () => ipcRenderer.invoke('window-maximize'),
  windowClose: () => ipcRenderer.invoke('window-close'),
  windowIsMaximized: () => ipcRenderer.invoke('window-is-maximized')
});
