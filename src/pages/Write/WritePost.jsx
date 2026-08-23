import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth-context.js';
import { CATEGORY_ICONS } from '../../data/posts.js';
import { deleteDraft, ensureSeedDrafts, loadDrafts, saveDraft } from '../../lib/drafts.js';
import CoverImageField from './CoverImageField.jsx';
import LocationPickerField from './LocationPickerField.jsx';
import TagInput from './TagInput.jsx';
import RichTextEditor from './RichTextEditor.jsx';
import DraftListModal from './DraftListModal.jsx';
import './WritePost.css';

const CATEGORY_OPTIONS = Object.keys(CATEGORY_ICONS);
const AUTOSAVE_INTERVAL_MS = 60000;

export default function WritePost() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [title, setTitle] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState(null);
  const [location, setLocation] = useState(null);
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [tags, setTags] = useState([]);
  const [bodyHtml, setBodyHtml] = useState('');
  const [isBodyEmpty, setIsBodyEmpty] = useState(true);

  const [draftId, setDraftId] = useState(() => crypto.randomUUID());
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [savedHint, setSavedHint] = useState('');

  const editorRef = useRef(null);
  const savedHintTimerRef = useRef(null);

  // always-fresh snapshot of the form for the autosave timer, which is set up once and
  // would otherwise close over stale state.
  const stateRef = useRef(null);
  useEffect(() => {
    stateRef.current = { title, coverImageUrl, category, tags, location, bodyHtml, isBodyEmpty };
  });

  const buildDraftFields = (s) => ({
    title: s.title,
    coverImageUrl: s.coverImageUrl,
    category: s.category,
    tags: s.tags,
    location: s.location,
    bodyHtml: s.bodyHtml,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const s = stateRef.current;
      const hasContent = s.title.trim() !== '' || !s.isBodyEmpty || s.coverImageUrl || s.tags.length > 0;
      if (!hasContent) return;
      saveDraft(draftId, buildDraftFields(s), 'auto');
    }, AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [draftId]);

  useEffect(() => () => clearTimeout(savedHintTimerRef.current), []);

  if (!isLoggedIn) return <Navigate to="/login" state={{ from: '/write' }} replace />;

  const canSubmit = title.trim() !== '' && !isBodyEmpty;

  const handleEditorUpdate = ({ html, isEmpty }) => {
    setBodyHtml(html);
    setIsBodyEmpty(isEmpty);
  };

  const handleSaveDraft = () => {
    saveDraft(draftId, buildDraftFields(stateRef.current), 'manual');
    setSavedHint('임시 저장했어요');
    clearTimeout(savedHintTimerRef.current);
    savedHintTimerRef.current = setTimeout(() => setSavedHint(''), 2000);
  };

  const handleOpenDraftList = () => {
    ensureSeedDrafts();
    setDrafts(loadDrafts());
    setIsDraftModalOpen(true);
  };

  const handleSelectDraft = (draft) => {
    setTitle(draft.title || '');
    setCoverImageUrl(draft.coverImageUrl || null);
    setCategory(draft.category || CATEGORY_OPTIONS[0]);
    setTags(draft.tags || []);
    setLocation(draft.location || null);
    setBodyHtml(draft.bodyHtml || '');
    setIsBodyEmpty(!draft.bodyHtml);
    editorRef.current?.setContent(draft.bodyHtml || '');
    setDraftId(draft.id);
    setIsDraftModalOpen(false);
  };

  const handleDeleteDraft = (id) => {
    deleteDraft(id);
    setDrafts((prev) => prev.filter((draft) => draft.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    // no backend post API wired up yet — mock submit just goes back to 내 게시글
    deleteDraft(draftId);
    navigate('/mypage?tab=posts');
  };

  return (
    <section className="page write-page">
      <form onSubmit={handleSubmit}>
        <CoverImageField previewUrl={coverImageUrl} onChange={setCoverImageUrl} />

        <div className="auth-field">
          <span>카테고리</span>
          <div className="category-chip-row">
            {CATEGORY_OPTIONS.map((c) => (
              <button
                type="button"
                key={c}
                className={'chip' + (category === c ? ' active' : '')}
                onClick={() => setCategory(c)}
              >
                {CATEGORY_ICONS[c]} {c}
              </button>
            ))}
          </div>
        </div>

        <div className="write-main">
          <input
            type="text"
            className="write-title-input"
            placeholder="제목을 입력해주세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <RichTextEditor ref={editorRef} onUpdate={handleEditorUpdate} />
        </div>

        <div className="auth-field">
          <span>태그</span>
          <TagInput tags={tags} onChange={setTags} maxTags={10} />
        </div>

        <LocationPickerField location={location} onChange={setLocation} />

        <div className="write-actions">
          <div className="write-actions-left">
            <button type="button" className="write-draft-btn" onClick={handleSaveDraft}>임시 저장</button>
            <button type="button" className="write-draft-btn" onClick={handleOpenDraftList}>불러오기</button>
            {savedHint && <span className="write-draft-saved-hint">{savedHint}</span>}
          </div>
          <div className="write-actions-right">
            <button type="button" className="write-cancel" onClick={() => navigate(-1)}>취소</button>
            <button type="submit" className="auth-submit" disabled={!canSubmit}>게시하기</button>
          </div>
        </div>
      </form>

      <DraftListModal
        isOpen={isDraftModalOpen}
        onClose={() => setIsDraftModalOpen(false)}
        drafts={drafts}
        onSelect={handleSelectDraft}
        onDelete={handleDeleteDraft}
      />
    </section>
  );
}
