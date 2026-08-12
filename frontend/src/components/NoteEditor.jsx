import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function NoteEditor({ note, onChange, onBack, onPin, saveStatus }) {
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

  const insertAround = useCallback((before, after, placeholder = 'text') => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = el.value.slice(start, end) || placeholder;
    const newContent = el.value.slice(0, start) + before + selected + after + el.value.slice(end);
    onChange({ content: newContent });
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  }, [onChange]);

  const insertLinePrefix = useCallback((prefix) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const lineStart = el.value.lastIndexOf('\n', start - 1) + 1;
    const newContent = el.value.slice(0, lineStart) + prefix + el.value.slice(lineStart);
    onChange({ content: newContent });
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length);
    }, 0);
  }, [onChange]);

  const exportNote = () => {
    const name = (note.title || 'Untitled').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_') || 'note';
    const blob = new Blob([`# ${note.title || 'Untitled'}\n\n${note.content}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const commitTag = useCallback((raw) => {
    const tag = raw.trim().toLowerCase().replace(/\s+/g, '-');
    if (tag && !note.tags.includes(tag)) onChange({ tags: [...note.tags, tag] });
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

        <div className="format-toolbar">
          <button className="fmt-btn" title="Bold" onMouseDown={(e) => { e.preventDefault(); insertAround('**', '**', 'bold text'); }}>
            <strong>B</strong>
          </button>
          <button className="fmt-btn fmt-italic" title="Italic" onMouseDown={(e) => { e.preventDefault(); insertAround('*', '*', 'italic text'); }}>
            <em>I</em>
          </button>
          <button className="fmt-btn" title="Heading 1" onMouseDown={(e) => { e.preventDefault(); insertLinePrefix('# '); }}>H1</button>
          <button className="fmt-btn" title="Heading 2" onMouseDown={(e) => { e.preventDefault(); insertLinePrefix('## '); }}>H2</button>
          <button className="fmt-btn" title="Bullet list" onMouseDown={(e) => { e.preventDefault(); insertLinePrefix('- '); }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><circle cx="4" cy="18" r="1.5" fill="currentColor"/></svg>
          </button>
          <button className="fmt-btn" title="Blockquote" onMouseDown={(e) => { e.preventDefault(); insertLinePrefix('> '); }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"/></svg>
          </button>
          <button className="fmt-btn fmt-code" title="Inline code" onMouseDown={(e) => { e.preventDefault(); insertAround('`', '`', 'code'); }}>
            {'</>'}
          </button>
        </div>

        <div className="toolbar-spacer" />

        <button
          className={`btn-icon${note.pinned ? ' btn-pinned' : ''}`}
          onClick={() => onPin(note.id, !note.pinned)}
          title={note.pinned ? 'Unpin note' : 'Pin note'}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="17" x2="12" y2="22"/>
            <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
          </svg>
        </button>

        <button className="btn-icon" onClick={exportNote} title="Download as .md">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </button>

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
            placeholder="Start writing… supports **bold**, *italic*, # Headings, - lists"
            value={note.content}
            onChange={handleContentChange}
          />

          {note.content && (
            <div className="live-preview">
              <div className="live-preview-label">Preview</div>
              <div className="markdown-preview">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content}</ReactMarkdown>
              </div>
            </div>
          )}

          <div className="tags-section">
            <div className="tags-label">Tags</div>
            <div className="tags-row">
              {note.tags.map((tag) => (
                <button key={tag} className="tag-pill" onClick={() => removeTag(tag)} title="Remove tag">
                  {tag}<span className="tag-pill-x">&times;</span>
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
