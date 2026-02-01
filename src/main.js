const electron = require('electron');

// Defensive check to ensure we are running in Electron main process
if (typeof electron === 'string') {
  console.error('[NotePro] Error: main.js is running in a plain Node environment.');
  console.error('[NotePro] Path detected:', electron);
  console.error('[NotePro] Please ensure you are running with the "electron" binary.');
  process.exit(1);
}

const { app, BrowserWindow, ipcMain, shell, protocol, dialog, net } = electron;
const path = require('path');
const fs = require('fs');

console.log('[NotePro] Starting Main Process...');
console.log('[NotePro] Electron:', process.versions.electron || 'N/A');
console.log('[NotePro] Node:', process.versions.node);

// ─── DATABASE SETUP (using sql.js - pure JavaScript SQLite) ─────────────────────────────────────────
let DB_DIR;
let DB_PATH;

let db = null;
let SQL = null;

async function initDatabase() {
  console.log('[DB] Initializing database...');
  // Initialize paths after app is ready
  DB_DIR = path.join(app.getPath('userData'), 'notepro');
  DB_PATH = path.join(DB_DIR, 'notepro.db');
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  // Import sql.js dynamically
  const initSqlJs = require('sql.js');

  // Determine WASM file location
  let wasmPath;
  if (app.isPackaged) {
    wasmPath = path.join(process.resourcesPath, 'sql-wasm.wasm');
  } else {
    wasmPath = path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
  }

  SQL = await initSqlJs({
    locateFile: () => wasmPath
  });

  // Load existing database or create new one
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');

  // Schema creation
  db.run(`
    CREATE TABLE IF NOT EXISTS pages (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT 'Halaman Baru',
      icon TEXT NOT NULL DEFAULT '📄',
      parent_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      "order" INTEGER NOT NULL DEFAULT 0,
      is_favorite BOOLEAN DEFAULT 0,
      deleted_at TEXT DEFAULT NULL,
      FOREIGN KEY (parent_id) REFERENCES pages(id) ON DELETE CASCADE
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS blocks (
      id TEXT PRIMARY KEY,
      page_id TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'paragraph',
      content TEXT NOT NULL DEFAULT '',
      meta TEXT NOT NULL DEFAULT '{}',
      "order" INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#6366f1',
      created_at TEXT NOT NULL
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS page_tags (
      page_id TEXT NOT NULL,
      tag_id TEXT NOT NULL,
      PRIMARY KEY (page_id, tag_id),
      FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );
  `);

  // Manual Migration Check (sql.js doesn't do ALTER smoothly on startup without checking)
  try {
    db.run("SELECT is_favorite FROM pages LIMIT 1");
  } catch (e) {
    console.log('[DB] Migrating: Adding is_favorite column');
    db.run("ALTER TABLE pages ADD COLUMN is_favorite BOOLEAN DEFAULT 0");
  }

  try {
    db.run("SELECT deleted_at FROM pages LIMIT 1");
  } catch (e) {
    console.log('[DB] Migrating: Adding deleted_at column');
    db.run("ALTER TABLE pages ADD COLUMN deleted_at TEXT DEFAULT NULL");
  }

  // Save database
  saveDatabase();

  // Seed kalau database baru (kosong)
  const result = db.exec('SELECT COUNT(*) as c FROM pages');
  const count = result.length > 0 ? result[0].values[0][0] : 0;
  if (count === 0) {
    seedDatabase();
  }
}

// ─── UTILITIES (Global Scope) ──────────────────────────────────────────

function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
    console.log('[DB] Saved to disk:', DB_PATH);
  }
}

// ─── DEBOUNCE UTILITY ───────────────────────────────────────────
let saveTimeout = null;
function debouncedSave(delay = 500) {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveDatabase();
    saveTimeout = null;
  }, delay);
}

// Helper to run queries and get results as objects
function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function queryGet(sql, params = []) {
  const results = queryAll(sql, params);
  return results.length > 0 ? results[0] : null;
}

function runSql(sql, params = []) {
  db.run(sql, params);
  debouncedSave(); // Use debounced save instead of immediate
}

function generateId(prefix = '') {
  return prefix + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function nowISO() {
  return new Date().toISOString();
}

function seedDatabase() {
  const now = nowISO();

  // ── Page 1: Project Management ──
  runSql('INSERT INTO pages (id, title, icon, parent_id, created_at, updated_at, "order") VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['page-1', '📋 Project Management', '📋', null, now, now, 0]);
  runSql('INSERT INTO blocks (id, page_id, type, content, meta, "order", created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['b1', 'page-1', 'heading1', 'Project Management', '{}', 0, now]);
  runSql('INSERT INTO blocks (id, page_id, type, content, meta, "order", created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['b2', 'page-1', 'paragraph', 'Halaman utama untuk mengelola semua proyek aktif dan task yang sedang berjalan.', '{}', 1, now]);
  runSql('INSERT INTO blocks (id, page_id, type, content, meta, "order", created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['b3', 'page-1', 'divider', '', '{}', 2, now]);
  runSql('INSERT INTO blocks (id, page_id, type, content, meta, "order", created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['b4', 'page-1', 'kanban', '', JSON.stringify({
      columns: [
        {
          id: 'col-1', title: '📥 Backlog', color: '#6366f1', cards: [
            { id: 'card-1', title: 'Riset Pasar', desc: 'Analisis kompetitor & target user' },
            { id: 'card-2', title: 'Wireframing', desc: 'Sketsa UI untuk halaman utama' }
          ]
        },
        {
          id: 'col-2', title: '🔄 In Progress', color: '#f59e0b', cards: [
            { id: 'card-3', title: 'Backend API', desc: 'Endpoint autentikasi & user' }
          ]
        },
        {
          id: 'col-3', title: '✅ Done', color: '#10b981', cards: [
            { id: 'card-4', title: 'Inisiasi Proyek', desc: 'Setup repo & dokumentasi awal' }
          ]
        }
      ]
    }), 3, now]);

  // ── Page 2: Jurnal Harian ──
  runSql('INSERT INTO pages (id, title, icon, parent_id, created_at, updated_at, "order") VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['page-2', '📝 Jurnal Harian', '📝', null, now, now, 1]);
  runSql('INSERT INTO blocks (id, page_id, type, content, meta, "order", created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['b10', 'page-2', 'heading1', 'Jurnal Harian', '{}', 0, now]);
  runSql('INSERT INTO blocks (id, page_id, type, content, meta, "order", created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['b11', 'page-2', 'paragraph', 'Catatan harian untuk refleksi, ide, dan pemikiran bebas.', '{}', 1, now]);
  runSql('INSERT INTO blocks (id, page_id, type, content, meta, "order", created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['b12', 'page-2', 'divider', '', '{}', 2, now]);
  runSql('INSERT INTO blocks (id, page_id, type, content, meta, "order", created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['b13', 'page-2', 'toggle', '🌅 Pagi — Refleksi', JSON.stringify({
      open: true,
      children: [
        { id: 'b13a', type: 'paragraph', content: 'Hari ini saya ingin fokus pada produktivitas dan konsistensi dalam menulis.', meta: {} },
        { id: 'b13b', type: 'todo', content: 'Baca 30 menit sebelum kerja', meta: { checked: true } },
        { id: 'b13c', type: 'todo', content: 'Tulis jurnal pagi', meta: { checked: false } }
      ]
    }), 3, now]);
  runSql('INSERT INTO blocks (id, page_id, type, content, meta, "order", created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['b14', 'page-2', 'toggle', '🌙 Malam — Evaluasi', JSON.stringify({
      open: false,
      children: [
        { id: 'b14a', type: 'paragraph', content: 'Evaluasi apa yang sudah dicapai hari ini.', meta: {} }
      ]
    }), 4, now]);
  runSql('INSERT INTO blocks (id, page_id, type, content, meta, "order", created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['b15', 'page-2', 'quote', '"Menulis adalah cara terbaik untuk memahami pikiran sendiri."', '{}', 5, now]);

  // ── Page 3: Goal Tracker ──
  runSql('INSERT INTO pages (id, title, icon, parent_id, created_at, updated_at, "order") VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['page-3', '🎯 Goal Tracker', '🎯', null, now, now, 2]);
  runSql('INSERT INTO blocks (id, page_id, type, content, meta, "order", created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['b20', 'page-3', 'heading1', 'Goal Tracker 2025', '{}', 0, now]);
  runSql('INSERT INTO blocks (id, page_id, type, content, meta, "order", created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['b21', 'page-3', 'paragraph', 'Lacak target tahunan Anda di sini.', '{}', 1, now]);
  runSql('INSERT INTO blocks (id, page_id, type, content, meta, "order", created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['b22', 'page-3', 'divider', '', '{}', 2, now]);
  runSql('INSERT INTO blocks (id, page_id, type, content, meta, "order", created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['b23', 'page-3', 'table', '', JSON.stringify({
      headers: ['Tujuan', 'Kategori', 'Deadline', 'Status', 'Progres'],
      rows: [
        ['Selesaikan Proyek App', 'Karir', '31 Mar 2025', '🔄 Sedang', '65%'],
        ['Baca 12 Buku', 'Pribadi', '31 Des 2025', '🟢 On Track', '25%'],
        ['Belajar Piano', 'Hobby', '30 Jun 2025', '🟡 Lambat', '10%'],
        ['Fitness Konsisten', 'Kesehatan', 'Ongoing', '🟢 On Track', '70%'],
        ['Kuasai English B2', 'Karir', '31 Agt 2025', '🔴 Behind', '5%']
      ]
    }), 3, now]);

  // ── Page 4: Study Notes (parent) ──
  runSql('INSERT INTO pages (id, title, icon, parent_id, created_at, updated_at, "order") VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['page-4', '📚 Study Notes', '📚', null, now, now, 3]);
  runSql('INSERT INTO blocks (id, page_id, type, content, meta, "order", created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['b30', 'page-4', 'heading1', 'Study Notes', '{}', 0, now]);
  runSql('INSERT INTO blocks (id, page_id, type, content, meta, "order", created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['b31', 'page-4', 'paragraph', 'Koleksi catatan pembelajaran dari berbagai topik.', '{}', 1, now]);

  // ── Page 5: React Fundamentals (child of page-4) ──
  runSql('INSERT INTO pages (id, title, icon, parent_id, created_at, updated_at, "order") VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['page-5', 'React Fundamentals', '⚛️', 'page-4', now, now, 0]);
  runSql('INSERT INTO blocks (id, page_id, type, content, meta, "order", created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['b40', 'page-5', 'heading1', 'React Fundamentals', '{}', 0, now]);
  runSql('INSERT INTO blocks (id, page_id, type, content, meta, "order", created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['b41', 'page-5', 'heading2', 'Core Concepts', '{}', 1, now]);
  runSql('INSERT INTO blocks (id, page_id, type, content, meta, "order", created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['b42', 'page-5', 'bulleted_list', 'Components adalah building block utama React', '{}', 2, now]);
  runSql('INSERT INTO blocks (id, page_id, type, content, meta, "order", created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['b43', 'page-5', 'bulleted_list', 'Props digunakan untuk melewatkan data dari parent ke child', '{}', 3, now]);
  runSql('INSERT INTO blocks (id, page_id, type, content, meta, "order", created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['b44', 'page-5', 'bulleted_list', 'State mengatur data yang bisa berubah seiring waktu', '{}', 4, now]);
  runSql('INSERT INTO blocks (id, page_id, type, content, meta, "order", created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['b45', 'page-5', 'heading2', 'Hooks Penting', '{}', 5, now]);
  runSql('INSERT INTO blocks (id, page_id, type, content, meta, "order", created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['b46', 'page-5', 'numbered_list', 'useState — Mengelola state lokal komponen', '{}', 6, now]);
  runSql('INSERT INTO blocks (id, page_id, type, content, meta, "order", created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['b47', 'page-5', 'numbered_list', 'useEffect — Side effects & lifecycle', '{}', 7, now]);
  runSql('INSERT INTO blocks (id, page_id, type, content, meta, "order", created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['b48', 'page-5', 'numbered_list', 'useCallback — Memoize fungsi', '{}', 8, now]);
  runSql('INSERT INTO blocks (id, page_id, type, content, meta, "order", created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['b49', 'page-5', 'quote', '"React makes it painless to create interactive UIs." — React Docs', '{}', 9, now]);

  // ── Page 6: JavaScript Patterns (child of page-4) ──
  runSql('INSERT INTO pages (id, title, icon, parent_id, created_at, updated_at, "order") VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['page-6', 'JavaScript Patterns', '🧩', 'page-4', now, now, 1]);
  runSql('INSERT INTO blocks (id, page_id, type, content, meta, "order", created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['b50', 'page-6', 'heading1', 'JavaScript Design Patterns', '{}', 0, now]);
  runSql('INSERT INTO blocks (id, page_id, type, content, meta, "order", created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['b51', 'page-6', 'paragraph', 'Pola-pola desain yang sering digunakan dalam pengembangan JavaScript modern.', '{}', 1, now]);
  runSql('INSERT INTO blocks (id, page_id, type, content, meta, "order", created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['b52', 'page-6', 'toggle', '🏗️ Module Pattern', JSON.stringify({
      open: true,
      children: [
        { id: 'b52a', type: 'paragraph', content: 'Membungkus code dalam scope terpisah menggunakan IIFE atau ES6 modules untuk enkapsulasi.', meta: {} }
      ]
    }), 2, now]);
  runSql('INSERT INTO blocks (id, page_id, type, content, meta, "order", created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['b53', 'page-6', 'toggle', '🎭 Observer Pattern', JSON.stringify({
      open: false,
      children: [
        { id: 'b53a', type: 'paragraph', content: 'Objek subscribe ke event dan bereaksi ketika event tersebut di-trigger. Digunakan di event systems dan state management.', meta: {} }
      ]
    }), 3, now]);
}

// ─── IPC ERROR HANDLER WRAPPER ──────────────────────────────────
function wrapHandler(handler) {
  return async (event, ...args) => {
    try {
      return await handler(event, ...args);
    } catch (error) {
      console.error('[IPC Error]', error.message, error.stack);
      return { success: false, error: error.message };
    }
  };
}

// ─── TAGS IPC HANDLERS ─────────────────────────────────────────
function registerIpcHandlers() {
  ipcMain.handle('get-tags', wrapHandler(() => {
    return queryAll('SELECT * FROM tags ORDER BY name ASC');
  }));

  ipcMain.handle('create-tag', wrapHandler((_, { name, color }) => {
    const id = generateId('tag-');
    const now = nowISO();
    runSql('INSERT INTO tags (id, name, color, created_at) VALUES (?, ?, ?, ?)',
      [id, name, color || '#6366f1', now]);
    return { id, name, color: color || '#6366f1' };
  }));

  ipcMain.handle('delete-tag', wrapHandler((_, tagId) => {
    runSql('DELETE FROM tags WHERE id = ?', [tagId]);
    return true;
  }));

  ipcMain.handle('get-page-tags', wrapHandler((_, pageId) => {
    const sql = `
    SELECT t.* 
    FROM tags t
    JOIN page_tags pt ON pt.tag_id = t.id
    WHERE pt.page_id = ?
  `;
    return queryAll(sql, [pageId]);
  }));

  ipcMain.handle('add-tag-to-page', wrapHandler((_, { pageId, tagId }) => {
    // Check default
    const exists = queryGet('SELECT * FROM page_tags WHERE page_id = ? AND tag_id = ?', [pageId, tagId]);
    if (!exists) {
      runSql('INSERT INTO page_tags (page_id, tag_id) VALUES (?, ?)', [pageId, tagId]);
    }
    return true;
  }));

  ipcMain.handle('remove-tag-from-page', wrapHandler((_, { pageId, tagId }) => {
    runSql('DELETE FROM page_tags WHERE page_id = ? AND tag_id = ?', [pageId, tagId]);
    return true;
  }));

  // ─── IPC HANDLERS ───────────────────────────────────────────

  // Ambil semua pages
  // Ambil semua pages (flat list, filter deleted)
  ipcMain.handle('get-pages', wrapHandler(() => {
    let pages;
    try {
      pages = queryAll('SELECT * FROM pages WHERE deleted_at IS NULL ORDER BY "order" ASC');
    } catch (e) {
      pages = queryAll('SELECT * FROM pages ORDER BY "order" ASC');
    }
    return pages.map(p => ({
      ...p,
      parentId: p.parent_id,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      isFavorite: !!p.is_favorite
    }));
  }));

  // FULL-TEXT SEARCH
  ipcMain.handle('search-pages', wrapHandler((_, query) => {
    if (!query) return [];
    const search = `%${query}%`;
    const sql = `
    SELECT DISTINCT p.* 
    FROM pages p
    LEFT JOIN blocks b ON b.page_id = p.id
    WHERE p.deleted_at IS NULL 
    AND (
      p.title LIKE ? 
      OR b.content LIKE ?
    )
    LIMIT 20
  `;
    const rows = queryAll(sql, [search, search]);
    return rows.map(p => ({
      ...p,
      parentId: p.parent_id,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      isFavorite: !!p.is_favorite
    }));
  }));

  // EXPORT PDF
  ipcMain.handle('export-pdf', wrapHandler(async (event, title) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const { filePath } = await dialog.showSaveDialog(win, {
      title: 'Simpan PDF',
      defaultPath: `${title || 'Document'}.pdf`,
      filters: [{ name: 'PDF', extensions: ['pdf'] }]
    });
    if (filePath) {
      const data = await win.webContents.printToPDF({
        printBackground: true,
        pageSize: 'A4',
        margins: { top: 0, bottom: 0, left: 0, right: 0 } // Minimal margins usually better for screen calc
      });
      fs.writeFileSync(filePath, data);
      return true;
    }
    return false;
  }));

  // Ambil pages di trash
  ipcMain.handle('get-trash-pages', wrapHandler(() => {
    const pages = queryAll('SELECT * FROM pages WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC');
    return pages.map(p => ({
      ...p,
      parentId: p.parent_id,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      deletedAt: p.deleted_at
    }));
  }));

  // Ambil single page + blocks
  ipcMain.handle('get-page', wrapHandler((_, pageId) => {
    const page = queryGet('SELECT * FROM pages WHERE id = ?', [pageId]);
    if (!page) return null;
    const blocks = queryAll('SELECT * FROM blocks WHERE page_id = ? ORDER BY "order" ASC', [pageId]);
    return {
      ...page,
      parentId: page.parent_id,
      createdAt: page.created_at,
      updatedAt: page.updated_at,
      blocks: blocks.map(b => ({
        ...b,
        pageId: b.page_id,
        createdAt: b.created_at,
        meta: JSON.parse(b.meta)
      }))
    };
  }));

  // Tambah page baru
  ipcMain.handle('create-page', wrapHandler((_, { title, icon, parentId }) => {
    const now = nowISO();
    const id = generateId('pg-');

    // Hitung order
    let maxOrder;
    if (parentId) {
      maxOrder = queryGet('SELECT COALESCE(MAX("order"), -1) as m FROM pages WHERE parent_id = ?', [parentId]);
    } else {
      maxOrder = queryGet('SELECT COALESCE(MAX("order"), -1) as m FROM pages WHERE parent_id IS NULL');
    }

    runSql('INSERT INTO pages (id, title, icon, parent_id, created_at, updated_at, "order") VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, title || 'Halaman Baru', icon || '📄', parentId || null, now, now, (maxOrder?.m || 0) + 1]);

    // Tambah 2 blocks default
    const h1Id = generateId('blk-');
    const pId = generateId('blk-');
    runSql('INSERT INTO blocks (id, page_id, type, content, meta, "order", created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [h1Id, id, 'heading1', title || 'Halaman Baru', '{}', 0, now]);
    runSql('INSERT INTO blocks (id, page_id, type, content, meta, "order", created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [pId, id, 'paragraph', 'Mulai menulis di sini...', '{}', 1, now]);

    return id;
  }));

  // Update page (title / icon / favorite)
  ipcMain.handle('update-page', wrapHandler((_, { pageId, title, icon, isFavorite }) => {
    const now = nowISO();
    if (title !== undefined) runSql('UPDATE pages SET title = ?, updated_at = ? WHERE id = ?', [title, now, pageId]);
    if (icon !== undefined) runSql('UPDATE pages SET icon = ?, updated_at = ? WHERE id = ?', [icon, now, pageId]);
    if (isFavorite !== undefined) runSql('UPDATE pages SET is_favorite = ?, updated_at = ? WHERE id = ?', [isFavorite ? 1 : 0, now, pageId]);
    return true;
  }));

  // Soft Delete Page (Set deleted_at)
  ipcMain.handle('delete-page', wrapHandler((_, pageId) => {
    const now = nowISO();
    // We don't delete blocks, just mark page as deleted. Blocks stay but are hidden since page is excluded.
    runSql('UPDATE pages SET deleted_at = ? WHERE id = ?', [now, pageId]);

    // Recursively soft delete children?
    // For simplicity MVP: Just the page. Children might become orphans or we can cascade soft delete.
    // Better UX: Cascade soft delete.
    const children = queryAll('SELECT id FROM pages WHERE parent_id = ?', [pageId]);
    children.forEach(child => {
      runSql('UPDATE pages SET deleted_at = ? WHERE id = ?', [now, child.id]);
    });

    return true;
  }));

  // Restore Page
  ipcMain.handle('restore-page', wrapHandler((_, pageId) => {
    runSql('UPDATE pages SET deleted_at = NULL WHERE id = ?', [pageId]);
    return true;
  }));

  // Permanent Delete Page (Clean up blocks and page)
  ipcMain.handle('permanent-delete-page', wrapHandler((_, pageId) => {
    runSql('DELETE FROM blocks WHERE page_id = ?', [pageId]);
    runSql('DELETE FROM pages WHERE id = ?', [pageId]);
    return true;
  }));


  // Tambah block baru
  ipcMain.handle('create-block', wrapHandler((_, { pageId, type, content, meta }) => {
    const now = nowISO();
    const id = generateId('blk-');
    const maxOrder = queryGet('SELECT COALESCE(MAX("order"), -1) as m FROM blocks WHERE page_id = ?', [pageId]);
    runSql('INSERT INTO blocks (id, page_id, type, content, meta, "order", created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, pageId, type, content || '', JSON.stringify(meta || {}), (maxOrder?.m || 0) + 1, now]);
    return id;
  }));

  // Update block (content / meta)
  ipcMain.handle('update-block', wrapHandler((_, { blockId, content, meta }) => {
    if (content !== undefined) runSql('UPDATE blocks SET content = ? WHERE id = ?', [content, blockId]);
    if (meta !== undefined) runSql('UPDATE blocks SET meta = ? WHERE id = ?', [JSON.stringify(meta), blockId]);
    return true;
  }));

  // Hapus block
  ipcMain.handle('delete-block', wrapHandler((_, blockId) => {
    runSql('DELETE FROM blocks WHERE id = ?', [blockId]);
    return true;
  }));

  // Reorder blocks
  ipcMain.handle('reorder-blocks', wrapHandler((_, { pageId, orderedIds }) => {
    // We use a transaction-like approach (though runSql commits individually due to our debouncedSave logic)
    // For safety, we just update each block's order
    orderedIds.forEach((blockId, index) => {
      runSql('UPDATE blocks SET "order" = ? WHERE id = ?', [index, blockId]);
    });
    return true;
  }));

  // Replace all blocks (for Undo/Redo)
  ipcMain.handle('replace-page-blocks', wrapHandler((_, { pageId, blocks }) => {
    // 1. Delete all blocks for this page
    runSql('DELETE FROM blocks WHERE page_id = ?', [pageId]);

    // 2. Insert all blocks provided
    const now = nowISO();
    blocks.forEach((b, index) => {
      runSql('INSERT INTO blocks (id, page_id, type, content, meta, "order", created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [b.id, pageId, b.type, b.content, JSON.stringify(b.meta || {}), index, b.createdAt || now]);
    });

    return true;
  }));

  // Select Image (Local)
  ipcMain.handle('select-image', wrapHandler(async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif', 'webp', 'jpeg'] }]
    });

    if (canceled || filePaths.length === 0) {
      return null;
    }

    const srcPath = filePaths[0];
    const imagesDir = path.join(app.getPath('userData'), 'notepro', 'images');

    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    const ext = path.extname(srcPath);
    const fileName = Date.now() + '-' + Math.random().toString(36).substr(2, 9) + ext;
    const destPath = path.join(imagesDir, fileName);

    fs.copyFileSync(srcPath, destPath);

    // Return protocol URL
    return `notepro-image://${fileName}`;
  }));

  ipcMain.handle('export-markdown', wrapHandler(async (_, { title, content }) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Export to Markdown',
      defaultPath: `${title}.md`,
      filters: [{ name: 'Markdown', extensions: ['md'] }]
    });

    if (canceled || !filePath) return false;

    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }));
} // End of registerIpcHandlers

// ─── APP LIFECYCLE ──────────────────────────────────────────

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false,          // Custom title bar
    titleBarStyle: 'hidden',
    backgroundColor: '#11111b',
    transparent: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    },
    icon: path.join(__dirname, '..', 'resources', 'icon.ico'),
    show: false
  });

  // Expose window controls ke renderer
  ipcMain.handle('window-minimize', () => mainWindow?.minimize());
  ipcMain.handle('window-maximize', () => {
    if (mainWindow?.isMaximized()) mainWindow.restore();
    else mainWindow?.maximize();
  });
  ipcMain.handle('window-close', () => mainWindow?.close());
  ipcMain.handle('window-is-maximized', () => mainWindow?.isMaximized());

  // Load renderer
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'renderer', 'index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  // Register custom protocol for images
  protocol.handle('notepro-image', (request) => {
    const url = request.url.replace('notepro-image://', '');
    const imagePath = path.join(app.getPath('userData'), 'notepro', 'images', decodeURIComponent(url));
    return net.fetch('file:///' + imagePath);
  });

  registerIpcHandlers();
  await initDatabase();
  createWindow();

  app.on('activate', () => {
    if (!mainWindow) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Clear debounce and force immediate save
    if (saveTimeout) clearTimeout(saveTimeout);
    saveDatabase();
    app.quit();
  }
});

app.on('before-quit', () => {
  // Force save before quit
  if (saveTimeout) clearTimeout(saveTimeout);
  saveDatabase();
});

// Auto-save periodically (backup for debounce)
setInterval(() => {
  if (!saveTimeout) saveDatabase(); // Only if no pending debounced save
}, 30000); // Save every 30 seconds
