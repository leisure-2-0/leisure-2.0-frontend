import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/auth-context.js';
import { CATEGORY_ICONS } from '../../data/posts.js';
import * as postsApi from '../../api/posts.js';
import { getErrorMessage } from '../../api/errors.js';
import CoverImageField from './CoverImageField.jsx';
import LocationPickerField from './LocationPickerField.jsx';
import TagInput from './TagInput.jsx';
import RichTextEditor from './RichTextEditor.jsx';
import DraftListModal from './DraftListModal.jsx';
import './WritePost.css';

const CATEGORY_OPTIONS = postsApi.WRITABLE_CATEGORIES;
const AUTOSAVE_INTERVAL_MS = 60000;

function toRequestFields(s) {
  return {
    title: s.title,
    content: s.bodyHtml,
    category: postsApi.toBackendCategory(s.category),
    tags: s.tags,
    location: s.location
      ? {
          region: s.location.region ?? null,
          placeName: null,
          address: s.location.address ?? null,
          latitude: s.location.lat,
          longitude: s.location.lng,
        }
      : null,
  };
}

export default function WritePost() {
  const navigate = useNavigate();
  const { postId: editingPostIdParam } = useParams();
  const isEditMode = !!editingPostIdParam;
  const { isLoggedIn, initializing } = useAuth();

  const [title, setTitle] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState(null);
  const [location, setLocation] = useState(null);
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [tags, setTags] = useState([]);
  const [bodyHtml, setBodyHtml] = useState('');
  const [isBodyEmpty, setIsBodyEmpty] = useState(true);

  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [draftsLoading, setDraftsLoading] = useState(false);
  const [savedHint, setSavedHint] = useState('');
  const [formError, setFormError] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoadingPost, setIsLoadingPost] = useState(isEditMode);
  const [loadFailed, setLoadFailed] = useState(false);

  const editorRef = useRef(null);
  const savedHintTimerRef = useRef(null);
  const postIdRef = useRef(isEditMode ? Number(editingPostIdParam) : null);

  // 수정 모드면 기존 게시글 내용을 불러와 폼을 채운다 (본인 글이 아니면 접근 불가).
  useEffect(() => {
    if (!isEditMode) return;
    let cancelled = false;
    postsApi
      .getPostDetail(editingPostIdParam)
      .then((data) => {
        if (cancelled) return;
        if (!data.isMine) {
          setLoadFailed(true);
          return;
        }
        setTitle(data.title || '');
        setCategory(postsApi.fromBackendCategory(data.category) || CATEGORY_OPTIONS[0]);
        setTags(data.tags || []);
        setLocation(
          data.location
            ? { lat: data.location.latitude, lng: data.location.longitude, address: data.location.address, region: data.location.region }
            : null
        );
        setBodyHtml(data.content || '');
        setIsBodyEmpty(!data.content);
        editorRef.current?.setContent(data.content || '');
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingPost(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isEditMode, editingPostIdParam]);

  // always-fresh snapshot of the form for the autosave timer, which is set up once and
  // would otherwise close over stale state.
  const stateRef = useRef(null);
  useEffect(() => {
    stateRef.current = { title, coverImageUrl, category, tags, location, bodyHtml, isBodyEmpty };
  });

  // 실제로 저장할 내용이 생기기 전까지는 서버에 글 컨테이너를 만들지 않는다.
  const ensurePostId = async () => {
    if (postIdRef.current) return postIdRef.current;
    const { postId: newId } = await postsApi.startPost();
    postIdRef.current = newId;
    return newId;
  };

  useEffect(() => {
    if (isEditMode) return; // 게시된 글 수정은 명시적 저장만 지원(자동저장 없음)
    const timer = setInterval(async () => {
      const s = stateRef.current;
      const hasContent = s.title.trim() !== '' || !s.isBodyEmpty || s.tags.length > 0;
      if (!hasContent) return;
      try {
        const id = await ensurePostId();
        await postsApi.saveDraft(id, toRequestFields(s));
      } catch {
        // 자동 저장 실패는 조용히 넘어간다 (다음 주기에 재시도됨)
      }
    }, AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isEditMode]);

  useEffect(() => () => clearTimeout(savedHintTimerRef.current), []);

  if (initializing) return null;
  if (!isLoggedIn) return <Navigate to="/login" state={{ from: '/write' }} replace />;
  if (isEditMode && loadFailed) return <Navigate to="/mypage?tab=posts" replace />;
  if (isEditMode && isLoadingPost) return <section className="page write-page"><p>불러오는 중...</p></section>;

  const canSubmit = title.trim() !== '' && !isBodyEmpty;

  const handleEditorUpdate = ({ html, isEmpty }) => {
    setBodyHtml(html);
    setIsBodyEmpty(isEmpty);
  };

  const handleSaveDraft = async () => {
    setFormError('');
    try {
      const id = await ensurePostId();
      await postsApi.saveDraft(id, toRequestFields(stateRef.current));
      setSavedHint('임시 저장했어요');
      clearTimeout(savedHintTimerRef.current);
      savedHintTimerRef.current = setTimeout(() => setSavedHint(''), 2000);
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  };

  const handleOpenDraftList = async () => {
    setIsDraftModalOpen(true);
    setDraftsLoading(true);
    try {
      const list = await postsApi.getMyDrafts();
      setDrafts(list.map((d) => ({ id: d.postId, title: d.title, savedAt: d.updatedAt })));
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setDraftsLoading(false);
    }
  };

  const handleSelectDraft = async (draft) => {
    setIsDraftModalOpen(false);
    setFormError('');
    try {
      const data = await postsApi.getMyDraftDetail(draft.id);
      postIdRef.current = data.postId;
      setTitle(data.title || '');
      setCoverImageUrl(null);
      setCategory(postsApi.fromBackendCategory(data.category) || CATEGORY_OPTIONS[0]);
      setTags(data.tags || []);
      setLocation(
        data.location
          ? { lat: data.location.latitude, lng: data.location.longitude, address: data.location.address, region: data.location.region }
          : null
      );
      setBodyHtml(data.content || '');
      setIsBodyEmpty(!data.content);
      editorRef.current?.setContent(data.content || '');
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  };

  const handleDeleteDraft = async (id) => {
    try {
      await postsApi.deletePost(id);
      setDrafts((prev) => prev.filter((draft) => draft.id !== id));
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || isPublishing) return;
    setFormError('');
    setIsPublishing(true);
    try {
      if (isEditMode) {
        await postsApi.editPost(postIdRef.current, toRequestFields(stateRef.current));
      } else {
        const id = await ensurePostId();
        await postsApi.publishPost(id, toRequestFields(stateRef.current));
      }
      navigate('/mypage?tab=posts');
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setIsPublishing(false);
    }
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
          <TagInput tags={tags} onChange={setTags} maxTags={5} />
        </div>

        <LocationPickerField location={location} onChange={setLocation} />

        {formError && <p className="auth-field-error">{formError}</p>}

        <div className="write-actions">
          <div className="write-actions-left">
            {!isEditMode && (
              <>
                <button type="button" className="write-draft-btn" onClick={handleSaveDraft}>임시 저장</button>
                <button type="button" className="write-draft-btn" onClick={handleOpenDraftList}>불러오기</button>
              </>
            )}
            {savedHint && <span className="write-draft-saved-hint">{savedHint}</span>}
          </div>
          <div className="write-actions-right">
            <button type="button" className="write-cancel" onClick={() => navigate(-1)}>취소</button>
            <button type="submit" className="auth-submit" disabled={!canSubmit || isPublishing}>
              {isEditMode ? '수정 완료' : '게시하기'}
            </button>
          </div>
        </div>
      </form>

      {!isEditMode && (
        <DraftListModal
          isOpen={isDraftModalOpen}
          onClose={() => setIsDraftModalOpen(false)}
          drafts={drafts}
          loading={draftsLoading}
          onSelect={handleSelectDraft}
          onDelete={handleDeleteDraft}
        />
      )}
    </section>
  );
}
