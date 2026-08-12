import NoteCard from './NoteCard';

export default function Sidebar({
  notes,
  selectedId,
  searchQuery,
  onSearch,
  onSelect,
  onCreate,
  onDelete,
  onLogout,
  theme,
  onToggleTheme,
  isMobileEditor,
  allTags,
  selectedTag,
  onSelectTag,
}) {
  return (
    <aside className={`sidebar${isMobileEditor ? ' mobile-hidden' : ''}`}>
      <div className="sidebar-header">
        <h1>Notebook</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button className="btn-primary" onClick={onCreate}>+ New</button>
          <button className="btn-icon" onClick={onToggleTheme} title={theme === 'dark' ? 'Light mode' : 'Dark mode'} style={{ width: 32, height: 32 }}>
            {theme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
          <button className="btn-logout" onClick={onLogout} title="Sign out">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="search-wrap">
        <span className="search-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </span>
        <input
          type="search"
          className="search-input"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      {allTags.length > 0 && (
        <div className="tag-filter-bar">
          {allTags.map((tag) => (
            <button
              key={tag}
              className={`tag-filter-pill${selectedTag === tag ? ' active' : ''}`}
              onClick={() => onSelectTag(selectedTag === tag ? null : tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      <div className="notes-list">
        {(searchQuery || selectedTag) && (
          <div className="notes-count">
            {notes.length} result{notes.length !== 1 ? 's' : ''}
            {selectedTag && <span className="notes-count-tag"> in #{selectedTag}</span>}
          </div>
        )}
        {notes.length === 0 ? (
          <div className="notes-empty">
            {searchQuery ? 'No notes match your search.' : 'No notes yet. Create one to get started.'}
          </div>
        ) : (
          notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              selected={note.id === selectedId}
              onSelect={() => onSelect(note.id)}
              onDelete={() => onDelete(note.id)}
            />
          ))
        )}
      </div>
    </aside>
  );
}
