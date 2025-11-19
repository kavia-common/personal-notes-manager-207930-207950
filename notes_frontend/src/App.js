import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

// Environment configuration
const API_BASE = process.env.REACT_APP_API_BASE || '';
const FEATURE_FLAGS_RAW = process.env.REACT_APP_FEATURE_FLAGS || '[]';
const EXPERIMENTS_ENABLED = String(process.env.REACT_APP_EXPERIMENTS_ENABLED || '').toLowerCase() === 'true';

// Safe parse of JSON feature flags
function safeParseFlags(raw) {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const FEATURE_FLAGS = safeParseFlags(FEATURE_FLAGS_RAW);
const hasFlag = (flag) => FEATURE_FLAGS.includes(flag);

// Storage helpers
const STORAGE_KEY = 'notes_app_items_v1';

// PUBLIC_INTERFACE
export function loadNotes() {
  /** Load notes from localStorage; returns array of notes. */
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// PUBLIC_INTERFACE
export function saveNotes(notes) {
  /** Persist notes to localStorage. */
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // noop fallback
  }
}

// Types
/**
 * Note model
 * id: string
 * title: string
 * content: string
 * updatedAt: number (epoch ms)
 */

// Utility: generate ID
function newId() {
  return `n_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// PUBLIC_INTERFACE
function Header({ onNewNote, search, onSearchChange }) {
  /** App header with search and create actions. */
  return (
    <header className="np-header" role="banner">
      <div className="np-header-left">
        <span className="np-logo" aria-label="Notes Manager">🗒️</span>
        <h1 className="np-title">Notes</h1>
      </div>
      <div className="np-header-actions">
        <label className="sr-only" htmlFor="global-search">Search notes</label>
        <input
          id="global-search"
          className="np-search"
          type="search"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search notes"
        />
        <button className="btn btn-primary" onClick={onNewNote} aria-label="Create a new note">
          + New
        </button>
      </div>
    </header>
  );
}

// PUBLIC_INTERFACE
function NotesList({ notes, activeId, onSelect }) {
  /** Sidebar list of notes. */
  return (
    <nav className="np-sidebar" aria-label="Notes list">
      <ul className="np-notes-list">
        {notes.length === 0 && (
          <li className="np-empty">No notes yet. Create one to get started.</li>
        )}
        {notes.map((n) => (
          <NoteItem
            key={n.id}
            note={n}
            active={n.id === activeId}
            onClick={() => onSelect(n.id)}
          />
        ))}
      </ul>
    </nav>
  );
}

// PUBLIC_INTERFACE
function NoteItem({ note, active, onClick }) {
  /** Individual note item row. */
  const updated = new Date(note.updatedAt).toLocaleString();
  return (
    <li>
      <button
        className={`np-note-item ${active ? 'active' : ''}`}
        onClick={onClick}
        aria-current={active ? 'true' : 'false'}
      >
        <div className="np-note-title" title={note.title || 'Untitled'}>
          {note.title || 'Untitled'}
        </div>
        <div className="np-note-meta" aria-label={`Last updated ${updated}`}>
          {updated}
        </div>
      </button>
    </li>
  );
}

// PUBLIC_INTERFACE
function NoteEditor({ note, onChange, onSave, onDelete, experimentsEnabled }) {
  /** Editor/viewer for a single note. */
  if (!note) {
    return (
      <main className="np-main" role="main">
        <div className="np-blank">Select or create a note to begin.</div>
      </main>
    );
  }

  return (
    <main className="np-main" role="main">
      <div className="np-card">
        <div className="np-card-header">
          <input
            className="np-input title"
            type="text"
            placeholder="Title"
            value={note.title}
            onChange={(e) => onChange({ ...note, title: e.target.value })}
            aria-label="Note title"
          />
          <div className="np-card-actions">
            <button className="btn btn-danger" onClick={() => onDelete(note.id)} aria-label="Delete note">
              Delete
            </button>
            <button className="btn btn-primary" onClick={() => onSave(note)} aria-label="Save note">
              Save
            </button>
          </div>
        </div>
        <div className="np-card-body">
          <label className="sr-only" htmlFor="note-content">Note content</label>
          <textarea
            id="note-content"
            className="np-textarea"
            placeholder="Start writing your note..."
            value={note.content}
            onChange={(e) => onChange({ ...note, content: e.target.value })}
            aria-label="Note content"
          />
          {experimentsEnabled && (
            <div className="np-experiment">
              <span className="np-experiment-badge" title="Experiments enabled">
                Beta
              </span>
              <p className="np-experiment-text">
                Experiments are enabled. Try our upcoming features soon!
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// PUBLIC_INTERFACE
function App() {
  /**
   * Notes manager SPA with responsive layout and Ocean Professional theme.
   * - In-memory CRUD with localStorage persistence
   * - Reads env vars for API base and feature flags, logs intended endpoints
   * - Responsive layout: header, sidebar, main editor
   */
  const [notes, setNotes] = useState(() => {
    const existing = loadNotes();
    if (existing.length) return existing.sort((a, b) => b.updatedAt - a.updatedAt);
    // Seed with mock if empty
    return [
      { id: newId(), title: 'Welcome to Notes', content: 'This is your first note. Edit or create new ones!', updatedAt: Date.now() },
    ];
  });
  const [activeId, setActiveId] = useState(notes[0]?.id || null);
  const [draft, setDraft] = useState(() => notes.find(n => n.id === activeId) || null);
  const [search, setSearch] = useState('');

  // Log API endpoints if base is present
  useEffect(() => {
    if (API_BASE) {
      // Intention only; does not call backend
      // eslint-disable-next-line no-console
      console.info('[Notes] API base detected:', API_BASE);
      // eslint-disable-next-line no-console
      console.info('[Notes] Intended endpoints (not called):', {
        list: `${API_BASE}/notes`,
        create: `${API_BASE}/notes`,
        update: `${API_BASE}/notes/:id`,
        delete: `${API_BASE}/notes/:id`,
      });
    }
  }, []);

  // Persist to localStorage when notes change
  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  // Keep draft in sync when activeId or notes change
  useEffect(() => {
    const found = notes.find(n => n.id === activeId) || null;
    setDraft(found);
  }, [activeId, notes]);

  const filteredNotes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(n => (n.title || '').toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q));
  }, [notes, search]);

  const createNote = () => {
    const n = { id: newId(), title: 'Untitled', content: '', updatedAt: Date.now() };
    const next = [n, ...notes];
    setNotes(next);
    setActiveId(n.id);
  };

  const updateNote = (updated) => {
    setDraft(updated);
  };

  const saveNote = (noteToSave) => {
    const next = notes.map(n => (n.id === noteToSave.id ? { ...noteToSave, updatedAt: Date.now() } : n))
      .sort((a, b) => b.updatedAt - a.updatedAt);
    setNotes(next);
  };

  const deleteNote = (id) => {
    const next = notes.filter(n => n.id !== id);
    setNotes(next);
    if (id === activeId) {
      setActiveId(next[0]?.id || null);
    }
  };

  return (
    <div className="np-app" style={{ minHeight: '100vh' }}>
      <Header onNewNote={createNote} search={search} onSearchChange={setSearch} />
      <div className="np-layout">
        <NotesList notes={filteredNotes} activeId={activeId} onSelect={setActiveId} />
        <NoteEditor
          note={draft}
          onChange={updateNote}
          onSave={saveNote}
          onDelete={deleteNote}
          experimentsEnabled={EXPERIMENTS_ENABLED && hasFlag('experiments')}
        />
      </div>
      <footer className="np-footer" role="contentinfo">
        <small>Ocean Professional theme • Local only • {new Date().getFullYear()}</small>
      </footer>
    </div>
  );
}

export default App;
