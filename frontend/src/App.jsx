import { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Sidebar from './components/Sidebar';
import NoteEditor from './components/NoteEditor';
import * as api from './api';

// ── Notes dashboard ─────────────────────────
function NotesApp() {
  const { user, logout } = useAuth();

  const [theme, setTheme] = useState(
    () => localStorage.getItem(`nb_theme_${user.id}`) || 'light'
  );
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(`nb_theme_${user.id}`, theme);
  }, [theme, user.id]);
  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [isMobileEditor, setIsMobileEditor] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved');
  const [isCreating, setIsCreating] = useState(false);

  const saveTimers = useRef({});
  const notesRef = useRef([]);
  const selectedIdRef = useRef(null);

  useEffect(() => { notesRef.current = notes; }, [notes]);
  useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);

  const loadNotes = useCallback(async () => {
    try {
      const data = await api.fetchNotes();
      setNotes(data);
    } catch (err) { console.error(err); }
  }, []);
  useEffect(() => { loadNotes(); }, [loadNotes]);

  const allTags = [...new Set(notes.flatMap((n) => n.tags ?? []))].sort();

  const filteredNotes = notes.filter((n) => {
    if (selectedTag && !n.tags?.includes(selectedTag)) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags?.some((t) => t.toLowerCase().includes(q))
    );
  });

  const selectedNote = notes.find((n) => n.id === selectedId) ?? null;

  const doServerSave = useCallback(async (id, noteData) => {
    try {
      const saved = await api.updateNote(id, {
        title: noteData.title,
        content: noteData.content,
        tags: noteData.tags,
      });
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, updated_at: saved.updated_at } : n))
      );
      if (selectedIdRef.current === id) setSaveStatus('saved');
    } catch {
      if (selectedIdRef.current === id) setSaveStatus('error');
    }
  }, []);

  const handleChange = useCallback(
    (id, changes) => {
      setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...changes } : n)));
      setSaveStatus('saving');
      clearTimeout(saveTimers.current[id]);
      saveTimers.current[id] = setTimeout(() => {
        const latest = notesRef.current.find((n) => n.id === id);
        if (latest) doServerSave(id, latest);
        delete saveTimers.current[id];
      }, 600);
    },
    [doServerSave]
  );

  const handleCreate = async () => {
    if (isCreating) return;
    setIsCreating(true);
    try {
      const note = await api.createNote({});
      setNotes((prev) => [note, ...prev.filter((n) => n.id !== note.id)]);
      setSelectedId(note.id);
      setIsMobileEditor(true);
      setSaveStatus('saved');
    } catch (err) { console.error(err); }
    finally { setIsCreating(false); }
  };

  const handlePin = async (id, pinned) => {
    try {
      const updated = await api.pinNote(id, pinned);
      setNotes((prev) =>
        prev
          .map((n) => (n.id === id ? { ...n, pinned: updated.pinned } : n))
          .sort((a, b) => (b.pinned - a.pinned) || (new Date(b.updated_at) - new Date(a.updated_at)))
      );
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    clearTimeout(saveTimers.current[id]);
    delete saveTimers.current[id];
    try {
      await api.deleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (selectedIdRef.current === id) {
        setSelectedId(null);
        setIsMobileEditor(false);
        setSaveStatus('saved');
      }
    } catch (err) { console.error(err); }
  };

  const handleSelect = (id) => {
    const prevId = selectedIdRef.current;
    if (prevId && prevId !== id && saveTimers.current[prevId]) {
      clearTimeout(saveTimers.current[prevId]);
      delete saveTimers.current[prevId];
      const prev = notesRef.current.find((n) => n.id === prevId);
      if (prev) doServerSave(prevId, prev);
    }
    setSelectedId(id);
    setIsMobileEditor(true);
    setSaveStatus('saved');
  };

  return (
    <div className="app">
      <Sidebar
        notes={filteredNotes}
        selectedId={selectedId}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        onSelect={handleSelect}
        onCreate={handleCreate}
        onDelete={handleDelete}
        onLogout={logout}
        theme={theme}
        onToggleTheme={toggleTheme}
        isMobileEditor={isMobileEditor}
        isCreating={isCreating}
        allTags={allTags}
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
      />
      <main className={`editor-pane${isMobileEditor ? ' mobile-active' : ''}`}>
        {selectedNote ? (
          <NoteEditor
            key={selectedNote.id}
            note={selectedNote}
            onChange={(changes) => handleChange(selectedNote.id, changes)}
            onBack={() => setIsMobileEditor(false)}
            onPin={handlePin}
            saveStatus={saveStatus}
          />
        ) : (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
            </svg>
            <p>Select a note or create a new one</p>
            <button className="btn-primary" onClick={handleCreate} disabled={isCreating}>
              {isCreating ? 'Creating…' : 'New Note'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

// ── Route guards ────────────────────────────
function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="auth-loading" />;
  if (!user) return <Navigate to="/login" replace />;
  return <NotesApp />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="auth-loading" />;
  if (user) return <Navigate to="/" replace />;
  return children;
}

// ── Root ────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<ProtectedRoute />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
