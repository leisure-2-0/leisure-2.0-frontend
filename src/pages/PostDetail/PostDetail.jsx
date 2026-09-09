import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Thumbnail from '../../components/Thumbnail/Thumbnail.jsx';
import { HeartIcon, BookmarkIcon, EditIcon, TrashIcon } from '../../components/Icons/Icons.jsx';
import { CATEGORY_ICONS } from '../../data/posts.js';
import { useAuth } from '../../context/auth-context.js';
import * as postsApi from '../../api/posts.js';
import { getErrorMessage } from '../../api/errors.js';
import './PostDetail.css';

const CATEGORY_LABELS = { RESTAURANT: '식당', HOTEL: '숙소', ACTIVITY: '액티비티', SCENERY: '풍경' };

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  // postId별로 캐싱한다 — 캐시가 없으면 아직 못 불러온 것(로딩 중).
  const [postsById, setPostsById] = useState({});
  const entry = postsById[postId];
  const post = entry?.data ?? null;
  const error = entry?.error ?? '';
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLikeBusy, setIsLikeBusy] = useState(false);
  const [isBookmarkBusy, setIsBookmarkBusy] = useState(false);
  const [isDeleteBusy, setIsDeleteBusy] = useState(false);

  useEffect(() => {
    if (postsById[postId]) return;

    let cancelled = false;
    postsApi
      .getPostDetail(postId)
      .then((data) => {
        if (cancelled) return;
        setPostsById((prev) => ({ ...prev, [postId]: { data, error: null } }));
        setIsLiked(data.isLiked);
        setIsBookmarked(data.isBookmarked);
      })
      .catch((err) => {
        if (cancelled) return;
        setPostsById((prev) => ({ ...prev, [postId]: { data: null, error: getErrorMessage(err) } }));
      });

    return () => {
      cancelled = true;
    };
  }, [postId, postsById]);

  const handleToggleLike = async () => {
    if (!isLoggedIn) return navigate('/login');
    if (isLikeBusy) return;
    setIsLikeBusy(true);
    try {
      const result = isLiked ? await postsApi.unlikePost(postId) : await postsApi.likePost(postId);
      setIsLiked(result.isLiked);
    } catch {
      // 실패 시 상태 유지
    } finally {
      setIsLikeBusy(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!isLoggedIn) return navigate('/login');
    if (isBookmarkBusy) return;
    setIsBookmarkBusy(true);
    try {
      const result = isBookmarked ? await postsApi.unbookmarkPost(postId) : await postsApi.bookmarkPost(postId);
      setIsBookmarked(result.isBookmarked);
    } catch {
      // 실패 시 상태 유지
    } finally {
      setIsBookmarkBusy(false);
    }
  };

  const handleEdit = () => navigate(`/write/${postId}`);

  const handleDelete = async () => {
    if (isDeleteBusy) return;
    if (!window.confirm('이 게시글을 삭제할까요? 삭제하면 되돌릴 수 없어요.')) return;
    setIsDeleteBusy(true);
    try {
      await postsApi.deletePost(postId);
      navigate('/mypage?tab=posts', { replace: true });
    } catch {
      setIsDeleteBusy(false);
    }
  };

  if (error) return <Navigate to="/" replace />;
  if (!post) return <section className="page post-detail-page"><p>불러오는 중...</p></section>;

  const categoryLabel = CATEGORY_LABELS[post.category] || post.category;

  return (
    <section className="page post-detail-page">
      <button type="button" className="post-detail-back" onClick={() => navigate(-1)}>← 목록으로</button>

      <div className="post-detail-cover">
        <Thumbnail />
      </div>

      <div className="post-detail-head">
        <div className="post-detail-head-top">
          <span className="tag cat-chip">{CATEGORY_ICONS[categoryLabel] || '✨'} {categoryLabel}</span>
          <span className="post-detail-meta">{post.location?.region} · 조회 {post.viewCount}</span>
        </div>
        <h1 className="post-detail-title">{post.title}</h1>
        <div className="post-detail-tags">
          {post.tags.map((tag) => <span className="tag" key={tag}>#{tag}</span>)}
        </div>
      </div>

      <div className="post-detail-author-row">
        <div className="post-detail-author">
          <div className="post-detail-avatar"></div>
          <div>
            <p className="post-detail-author-name">{post.author.nickname}</p>
            <p className="post-detail-author-sub">{post.location?.region} 인증 로컬</p>
          </div>
        </div>
        <div className="post-detail-actions">
          <button
            type="button"
            className={'post-detail-icon-btn' + (isLiked ? ' active' : '')}
            aria-label="좋아요"
            onClick={handleToggleLike}
          >
            <HeartIcon filled={isLiked} />
          </button>
          <button
            type="button"
            className={'post-detail-icon-btn' + (isBookmarked ? ' active' : '')}
            aria-label="북마크"
            onClick={handleToggleBookmark}
          >
            <BookmarkIcon filled={isBookmarked} />
          </button>
        </div>
      </div>

      <div className="post-detail-body" dangerouslySetInnerHTML={{ __html: post.content }} />

      {post.location && (
        <div className="post-detail-location">
          <span className="post-detail-location-label">위치</span>
          <p>{post.location.placeName} {post.location.address}</p>
        </div>
      )}

      {post.isMine && (
        <div className="post-detail-manage-row">
          <button type="button" className="post-detail-manage-btn" onClick={handleEdit}>
            <EditIcon /> 수정
          </button>
          <button type="button" className="post-detail-manage-btn danger" onClick={handleDelete} disabled={isDeleteBusy}>
            <TrashIcon /> 삭제
          </button>
        </div>
      )}
    </section>
  );
}
