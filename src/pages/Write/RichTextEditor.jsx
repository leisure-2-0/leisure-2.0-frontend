import { forwardRef, useImperativeHandle, useRef } from 'react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import './RichTextEditor.css';

const TOOLBAR_BUTTONS = [
  { key: 'bold', label: 'B', run: (editor) => editor.chain().focus().toggleBold().run() },
  { key: 'italic', label: 'I', run: (editor) => editor.chain().focus().toggleItalic().run() },
  { key: 'strike', label: 'S', run: (editor) => editor.chain().focus().toggleStrike().run() },
];

const HEADING_BUTTONS = [
  { key: 'h2', label: 'H2', level: 2 },
  { key: 'h3', label: 'H3', level: 3 },
];

const LIST_BUTTONS = [
  { key: 'bulletList', label: '• 목록', run: (editor) => editor.chain().focus().toggleBulletList().run() },
  { key: 'orderedList', label: '1. 목록', run: (editor) => editor.chain().focus().toggleOrderedList().run() },
  { key: 'blockquote', label: '❝ 인용', run: (editor) => editor.chain().focus().toggleBlockquote().run() },
];

const RichTextEditor = forwardRef(function RichTextEditor({ onUpdate }, ref) {
  const imageInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Placeholder.configure({ placeholder: '어떤 이야기를 나누고 싶으신가요? 사진은 툴바의 사진 버튼으로 중간에 넣을 수 있어요.' }),
    ],
    onUpdate: ({ editor }) => {
      onUpdate?.({ html: editor.getHTML(), isEmpty: editor.isEmpty });
    },
  });

  // lets the parent load a saved draft's content into an already-mounted editor
  useImperativeHandle(ref, () => ({
    setContent: (html) => {
      if (!editor) return;
      editor.commands.setContent(html || '');
      onUpdate?.({ html: editor.getHTML(), isEmpty: editor.isEmpty });
    },
  }), [editor, onUpdate]);

  // Tiptap v3 doesn't re-render on every transaction by default, so toolbar "active" state
  // needs its own subscription — otherwise buttons like Bold never visually toggle.
  const toolbarState = useEditorState({
    editor,
    selector: ({ editor }) => {
      if (!editor) return {};
      return {
        bold: editor.isActive('bold'),
        italic: editor.isActive('italic'),
        strike: editor.isActive('strike'),
        h2: editor.isActive('heading', { level: 2 }),
        h3: editor.isActive('heading', { level: 3 }),
        bulletList: editor.isActive('bulletList'),
        orderedList: editor.isActive('orderedList'),
        blockquote: editor.isActive('blockquote'),
      };
    },
  });

  const handleInsertImage = (e) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    // base64 data URL (not a blob URL) so inline images survive a saved-draft reload
    const reader = new FileReader();
    reader.onload = () => {
      editor.chain().focus().setImage({ src: reader.result }).run();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  if (!editor) return null;

  return (
    <div className="rich-editor">
      <div className="rich-editor-toolbar">
        {TOOLBAR_BUTTONS.map((btn) => (
          <button
            key={btn.key}
            type="button"
            className={toolbarState[btn.key] ? 'active' : ''}
            onClick={() => btn.run(editor)}
          >
            {btn.label}
          </button>
        ))}
        <span className="rich-editor-sep"></span>
        {HEADING_BUTTONS.map((btn) => (
          <button
            key={btn.key}
            type="button"
            className={toolbarState[btn.key] ? 'active' : ''}
            onClick={() => editor.chain().focus().toggleHeading({ level: btn.level }).run()}
          >
            {btn.label}
          </button>
        ))}
        <span className="rich-editor-sep"></span>
        {LIST_BUTTONS.map((btn) => (
          <button
            key={btn.key}
            type="button"
            className={toolbarState[btn.key] ? 'active' : ''}
            onClick={() => btn.run(editor)}
          >
            {btn.label}
          </button>
        ))}
        <span className="rich-editor-sep"></span>
        <button type="button" onClick={() => imageInputRef.current?.click()}>🖼 사진</button>
        <input ref={imageInputRef} type="file" accept="image/*" hidden onChange={handleInsertImage} />
      </div>
      <EditorContent editor={editor} className="rich-editor-content" />
    </div>
  );
});

export default RichTextEditor;
