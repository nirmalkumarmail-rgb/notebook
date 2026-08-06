import { useState, useRef, useEffect, useCallback } from 'react';

export default function NoteEditor({ note, onChange, onBack, saveStatus }) {
  const [tagInput, setTagInput] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [note.content]);

  const handleContentChange = (e) => {
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
    onChange({ content: el.value });
  };

  const commitTag = useCallback((raw) => {
    const tag = raw.trim().toLowerCase().replace(/\s+/g, '-');
    if (tag && !note.tags.includes(tag)) {
      onChange({ tags: [...note.tags, tag] });
    }
    setTagInput('');
  }, [note.tags, onChange]);

  const removeTag = (tag) => onChange({ tags: note.tags.filter((t) => t !== tag) });

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commitTag(tagInput);
    } else if (e.key === 'Backspace' && !tagInput && note.tags.length > 0) {
      removeTag(note.tags[note.tags.length - 1]);
    }
  };

  const wordCount = note.content.trim() ? note.content.trim().split(/\s+/).length : 0;
  const charCount = note.content.length;
  const createdDate = new Date(note.created_at).toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <>
      <div className="editor-toolbar">
        <button className="btn-icon btn-back" onClick={onBack} title="Back to notes">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5m7-7-7 7 7 7" />
          </svg>
        </button>
        <div className="toolbar-spacer" />
        {saveStatus === 'saving' && (
          <div className="save-indicator saving">
            <span className="save-dot" /> Saving…
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="save-indicator error">
            <span className="save-dot" /> Error saving
          </div>
        )}
      </div>

      <div className="editor-scroll">
        <div className="editor-content">
          <input
            className="title-input"
            type="text"
            placeholder="Untitled"
            value={note.title}
            onChange={(e) => onChange({ title: e.target.value })}
            autoFocus={!note.title && !note.content}
          />
          <div className="editor-meta">Created {createdDate}</div>
          <div className="editor-divider" />
          <textarea
            ref={textareaRef}
            className="content-textarea"
            placeholder="Start writing…"
            value={note.content}
            onChange={handleContentChange}
          />

          <div className="tags-section">
            <div className="tags-label">Tags</div>
            <div className="tags-row">
              {note.tags.map((tag) => (
                <button key={tag} className="tag-pill" onClick={() => removeTag(tag)} title="Remove tag">
                  {tag}
                  <span className="tag-pill-x">&times;</span>
                </button>
              ))}
              <input
                className="tag-input"
                type="text"
                placeholder="Add tag…"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => tagInput && commitTag(tagInput)}
              />
            </div>
          </div>

          <div className="editor-footer">
            {wordCount} {wordCount === 1 ? 'word' : 'words'} · {charCount} {charCount === 1 ? 'character' : 'characters'}
          </div>
        </div>
      </div>
    </>
  );
}
