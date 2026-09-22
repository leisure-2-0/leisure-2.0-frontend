import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { uploadImage, IMAGE_PURPOSE } from '../../api/images.js';
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

const RichTextEditor = forwardRef(function RichTextEditor({ onUpdate, content, onImageUploadError, onImageUploadingChange }, ref) {
  const imageInputRef = useRef(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // 본문 글자수(HTML 태그 제외한 순수 텍스트 길이)를 title/isEmpty와 함께 부모에 알린다.
  // onCreate에서도 호출해야, 수정 모드처럼 기존 글이 마운트 시점부터 채워지는 경우에도
  // 사용자가 타이핑하기 전부터 글자수가 정확히 표시된다(onUpdate는 이후 편집에만 반응함).
  const notifyUpdate = useCallback((editorInstance) => {
    onUpdate?.({ html: editorInstance.getHTML(), isEmpty: editorInstance.isEmpty, length: editorInstance.getText().length });
  }, [onUpdate]);

  const editor = useEditor({
    // 부모가 비동기로 불러온 기존 글(수정 모드)을 마운트 시점부터 반영한다.
    // WritePost가 로딩 중엔 이 컴포넌트를 아예 렌더링하지 않다가 데이터가 준비된 뒤에만
    // 마운트하므로, 여기서는 최초 1회만 쓰이면 되고 이후 리렌더에서 content가 바뀌어도
    // (편집 중 상태 갱신 등) 에디터를 다시 만들지 않는다.
    content: content || '',
    extensions: [
      StarterKit,
      Image,
      Placeholder.configure({ placeholder: '어떤 이야기를 나누고 싶으신가요? 사진은 툴바의 사진 버튼으로 중간에 넣을 수 있어요.' }),
    ],
    onCreate: ({ editor }) => notifyUpdate(editor),
    onUpdate: ({ editor }) => notifyUpdate(editor),
  });

  // lets the parent load a saved draft's content into an already-mounted editor
  useImperativeHandle(ref, () => ({
    setContent: (html) => {
      if (!editor) return;
      editor.commands.setContent(html || '');
      notifyUpdate(editor);
    },
  }), [editor, notifyUpdate]);

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

  const handleInsertImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !editor) return;

    setIsUploadingImage(true);
    onImageUploadingChange?.(true);
    try {
      const imageUrl = await uploadImage(file, IMAGE_PURPOSE.CONTENT);
      editor.chain().focus().setImage({ src: imageUrl }).run();
    } catch (err) {
      onImageUploadError?.(err.message);
    } finally {
      setIsUploadingImage(false);
      onImageUploadingChange?.(false);
    }
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
        <button type="button" onClick={() => imageInputRef.current?.click()} disabled={isUploadingImage}>
          {isUploadingImage ? '업로드 중...' : '🖼 사진'}
        </button>
        <input ref={imageInputRef} type="file" accept="image/*" hidden onChange={handleInsertImage} />
      </div>
      <EditorContent editor={editor} className="rich-editor-content" />
    </div>
  );
});

export default RichTextEditor;
