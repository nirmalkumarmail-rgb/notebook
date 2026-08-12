function formatDate(iso) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);

  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)  return `${days}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function NoteCard({ note, selected, onSelect, onDelete }) {
  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Delete this note?')) onDelete();
  };

  return (
    <div className={`note-card${selected ? ' selected' : ''}`} onClick={onSelect}>
      <div className="note-card-header">
        <div className="note-card-title">
          {note.pinned && (
            <svg className="pin-icon" width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z M12 17v5"/>
            </svg>
          )}
          {note.title || 'Untitled'}
        </div>
      </div>

      {note.content && (
        <div className="note-card-preview">{note.content}</div>
      )}

      <div className="note-card-footer">
        <div className="note-card-tags">
          {note.tags?.slice(0, 3).map((t) => (
            <span key={t} className="tag">{t}</span>
          ))}
        </div>
        <span className="note-card-date">{formatDate(note.updated_at)}</span>
      </div>

      <button className="card-delete-btn" onClick={handleDelete} title="Delete note">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
