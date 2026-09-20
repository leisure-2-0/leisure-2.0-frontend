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
import Modal from '../../components/Modal/Modal.jsx';
import './WritePost.css';

const CATEGORY_OPTIONS = postsApi.WRITABLE_CATEGORIES;
const AUTOSAVE_INTERVAL_MS = 60000;
// AI 임베딩이 청킹 없이 게시글 하나를 통째로 벡터화하고, 답변 생성 프롬프트도 문서 여러 개를
// 그대로 이어붙이는 구조라 본문이 너무 길면 의미가 흐려지거나 프롬프트가 넘칠 수 있어 제한한다.
const MAX_BODY_LENGTH = 2000;

function toRequestFields(s) {
  return {
    title: s.title,
    content: s.bodyHtml,
    category: postsApi.toBackendCategory(s.category),
    tags: s.tags,
    location: s.location
      ? {
          region: s.location.region ?? null,
          placeName: s.location.placeName ?? null,
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
  const [bodyLength, setBodyLength] = useState(0);

  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [draftsLoading, setDraftsLoading] = useState(false);
  const [savedHint, setSavedHint] = useState('');
  const [missingFields, setMissingFields] = useState([]);
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
            ? {
                lat: data.location.latitude,
                lng: data.location.longitude,
                address: data.location.address,
                placeName: data.location.placeName,
                region: data.location.region,
              }
            : null
        );
        setBodyHtml(data.content || '');
        setIsBodyEmpty(!data.content);
        // RichTextEditor는 isLoadingPost가 풀린 뒤에야 처음 마운트되므로, 그때 bodyHtml을
        // 초기 content prop으로 받아 반영한다 (아직 마운트 전이라 editorRef로는 못 건드림).
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

  // setSavedHint와 ref만 사용하므로, 인터벌이 오래된 클로저를 들고 있어도 동작에 문제없다.
  const showSavedHint = (message, durationMs = 2000) => {
    setSavedHint(message);
    clearTimeout(savedHintTimerRef.current);
    savedHintTimerRef.current = setTimeout(() => setSavedHint(''), durationMs);
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
        showSavedHint('자동 저장했어요');
      } catch (err) {
        // 조용히 넘기면 저장이 계속 실패해도 알 방법이 없어, 실패 사유를 그대로 보여준다.
        showSavedHint(`자동 저장 실패 — ${getErrorMessage(err)}`, 5000);
      }
    }, AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isEditMode]);

  useEffect(() => () => clearTimeout(savedHintTimerRef.current), []);

  if (initializing) return null;
  if (!isLoggedIn) return <Navigate to="/login" state={{ from: '/write' }} replace />;
  if (isEditMode && loadFailed) return <Navigate to="/mypage?tab=posts" replace />;
  if (isEditMode && isLoadingPost) return <section className="page write-page"><p>불러오는 중...</p></section>;

  const isOverBodyLimit = bodyLength > MAX_BODY_LENGTH;

  const handleEditorUpdate = ({ html, isEmpty, length }) => {
    setBodyHtml(html);
    setIsBodyEmpty(isEmpty);
    setBodyLength(length);
  };

  const handleSaveDraft = async () => {
    setFormError('');
    try {
      const id = await ensurePostId();
      await postsApi.saveDraft(id, toRequestFields(stateRef.current));
      showSavedHint('임시 저장했어요');
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
          ? {
              lat: data.location.latitude,
              lng: data.location.longitude,
              address: data.location.address,
              placeName: data.location.placeName,
              region: data.location.region,
            }
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

  // 게시 전 필수 항목 확인 — 빠진 게 있으면 게시하지 않고 무엇이 빠졌는지 팝업으로 알린다.
  const findMissingFields = (s) => {
    const missing = [];
    if (!s.title.trim()) missing.push('제목');
    if (!s.category) missing.push('카테고리');
    if (s.isBodyEmpty) missing.push('내용');
    if (!s.location || (!s.location.address && !s.location.placeName)) missing.push('위치');
    return missing;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isPublishing) return;

    const missing = findMissingFields(stateRef.current);
    if (missing.length > 0) {
      setMissingFields(missing);
      return;
    }
    if (isOverBodyLimit) {
      setFormError(`본문은 ${MAX_BODY_LENGTH.toLocaleString()}자를 넘을 수 없어요.`);
      return;
    }

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
            maxLength={50}
          />

          <RichTextEditor ref={editorRef} onUpdate={handleEditorUpdate} content={bodyHtml} />
          <div className={'write-body-counter' + (isOverBodyLimit ? ' over' : '')}>
            {bodyLength.toLocaleString()} / {MAX_BODY_LENGTH.toLocaleString()}자
          </div>
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
            <button type="submit" className="auth-submit" disabled={isPublishing}>
              {isEditMode ? '수정 완료' : '게시하기'}
            </button>
          </div>
        </div>
      </form>

      <Modal
        isOpen={missingFields.length > 0}
        onClose={() => setMissingFields([])}
        title="아직 덜 채워졌어요"
      >
        <p className="write-missing-message">{missingFields.join(', ')} 기록도 마저 채워주세요!</p>
        <div className="write-missing-actions">
          <button type="button" className="auth-submit" onClick={() => setMissingFields([])}>
            돌아가서 채우기
          </button>
        </div>
      </Modal>

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
