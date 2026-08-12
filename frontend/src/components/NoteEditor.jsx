import { useState, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';

const TEXT_COLORS = [
  { label: 'Default', value: null },
  { label: 'Red', value: '#ef4444' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Yellow', value: '#eab308' },
  { label: 'Green', value: '#22c55e' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Purple', value: '#a855f7' },
  { label: 'Pink', value: '#ec4899' },
  { label: 'Gray', value: '#6b7280' },
];

const HIGHLIGHT_COLORS = [
  { label: 'None', value: null },
  { label: 'Yellow', value: '#fef08a' },
  { label: 'Green', value: '#bbf7d0' },
  { label: 'Blue', value: '#bfdbfe' },
  { label: 'Pink', value: '#fbcfe8' },
  { label: 'Orange', value: '#fed7aa' },
  { label: 'Purple', value: '#e9d5ff' },
];

export default function NoteEditor({ note, onChange, onBack, onPin, saveStatus }) {
  const [tagInput, setTagInput] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const colorBtnRef = useRef(null);
  const highlightBtnRef = useRef(null);
  const savedSelection = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Start writing…' }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
    ],
    content: note.content || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange({ content: html === '<p></p>' ? '' : html });
    },
    editorProps: {
      attributes: { class: 'rich-editor' },
    },
  });

  const isActive = (type, attrs) => editor?.isActive(type, attrs);
  const cmd = useCallback((fn) => () => fn(editor.chain().focus()), [editor]);

  const exportNote = () => {
    const name = (note.title || 'Untitled').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_') || 'note';
    const text = editor ? editor.getText() : '';
    const blob = new Blob([`# ${note.title || 'Untitled'}\n\n${text}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.txt`;
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
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commitTag(tagInput); }
    else if (e.key === 'Backspace' && !tagInput && note.tags.length > 0) removeTag(note.tags[note.tags.length - 1]);
  };

  const wordCount = editor ? editor.getText().trim().split(/\s+/).filter(Boolean).length : 0;
  const createdDate = new Date(note.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <div className="editor-toolbar">
        <button className="btn-icon btn-back" onClick={onBack} title="Back to notes">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5m7-7-7 7 7 7" />
          </svg>
        </button>

        <div className="format-toolbar">
          <button className={`fmt-btn${isActive('bold') ? ' fmt-active' : ''}`} title="Bold" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}>
            <strong>B</strong>
          </button>
          <button className={`fmt-btn fmt-italic${isActive('italic') ? ' fmt-active' : ''}`} title="Italic" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}>
            <em>I</em>
          </button>
          <button className={`fmt-btn${isActive('heading', { level: 1 }) ? ' fmt-active' : ''}`} title="Heading 1" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 1 }).run(); }}>H1</button>
          <button className={`fmt-btn${isActive('heading', { level: 2 }) ? ' fmt-active' : ''}`} title="Heading 2" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run(); }}>H2</button>
          <button className={`fmt-btn${isActive('bulletList') ? ' fmt-active' : ''}`} title="Bullet list" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><circle cx="4" cy="18" r="1.5" fill="currentColor"/></svg>
          </button>
          <button className={`fmt-btn${isActive('orderedList') ? ' fmt-active' : ''}`} title="Numbered list" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><text x="2" y="8" fontSize="7" fill="currentColor" stroke="none">1</text><text x="2" y="14" fontSize="7" fill="currentColor" stroke="none">2</text><text x="2" y="20" fontSize="7" fill="currentColor" stroke="none">3</text></svg>
          </button>
          <button className={`fmt-btn${isActive('blockquote') ? ' fmt-active' : ''}`} title="Blockquote" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBlockquote().run(); }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"/></svg>
          </button>
          <button className={`fmt-btn fmt-code${isActive('code') ? ' fmt-active' : ''}`} title="Inline code" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleCode().run(); }}>
            {'</>'}
          </button>

          <div className="fmt-separator" />

          {/* Text color picker */}
          <div className="color-picker-wrap" ref={colorBtnRef}>
            <button
              className={`fmt-btn color-btn${showColorPicker ? ' fmt-active' : ''}`}
              title="Text color"
              onMouseDown={(e) => { e.preventDefault(); savedSelection.current = editor.state.selection; setShowColorPicker((v) => !v); setShowHighlightPicker(false); }}
            >
              <span className="color-btn-inner">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <text x="2" y="18" fontSize="20" fontWeight="bold" fontFamily="serif">A</text>
                </svg>
                <span className="color-swatch" style={{ background: editor?.getAttributes('textStyle').color || 'currentColor' }} />
              </span>
            </button>
            {showColorPicker && (
              <div className="color-dropdown">
                <div className="color-dropdown-label">Text color</div>
                <div className="color-swatches">
                  {TEXT_COLORS.map((c) => (
                    <button
                      key={c.label}
                      className="color-swatch-btn"
                      title={c.label}
                      style={{ background: c.value || 'transparent', border: c.value ? 'none' : '1.5px dashed var(--border)' }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        if (savedSelection.current) editor.view.dispatch(editor.state.tr.setSelection(savedSelection.current));
                        if (c.value) editor.chain().focus().setColor(c.value).run();
                        else editor.chain().focus().unsetColor().run();
                        setShowColorPicker(false);
                        savedSelection.current = null;
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Highlight (bg color) picker */}
          <div className="color-picker-wrap" ref={highlightBtnRef}>
            <button
              className={`fmt-btn color-btn${showHighlightPicker ? ' fmt-active' : ''}`}
              title="Highlight color"
              onMouseDown={(e) => { e.preventDefault(); savedSelection.current = editor.state.selection; setShowHighlightPicker((v) => !v); setShowColorPicker(false); }}
            >
              <span className="color-btn-inner">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l-6 6v3h3l6-6"/><path d="M22 2l-3-1-9 9 4 4 9-9z"/>
                </svg>
                <span className="color-swatch" style={{ background: editor?.isActive('highlight') ? (editor?.getAttributes('highlight').color || '#fef08a') : 'transparent', border: editor?.isActive('highlight') ? 'none' : '1.5px dashed var(--border)' }} />
              </span>
            </button>
            {showHighlightPicker && (
              <div className="color-dropdown">
                <div className="color-dropdown-label">Highlight</div>
                <div className="color-swatches">
                  {HIGHLIGHT_COLORS.map((c) => (
                    <button
                      key={c.label}
                      className="color-swatch-btn"
                      title={c.label}
                      style={{ background: c.value || 'transparent', border: c.value ? 'none' : '1.5px dashed var(--border)' }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        if (savedSelection.current) editor.view.dispatch(editor.state.tr.setSelection(savedSelection.current));
                        if (c.value) editor.chain().focus().setHighlight({ color: c.value }).run();
                        else editor.chain().focus().unsetHighlight().run();
                        setShowHighlightPicker(false);
                        savedSelection.current = null;
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
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

        <button className="btn-icon" onClick={exportNote} title="Download note">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </button>

        {saveStatus === 'saving' && <div className="save-indicator saving"><span className="save-dot" /> Saving…</div>}
        {saveStatus === 'error' && <div className="save-indicator error"><span className="save-dot" /> Error saving</div>}
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

          <EditorContent editor={editor} />

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
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </div>
        </div>
      </div>
    </>
  );
}
