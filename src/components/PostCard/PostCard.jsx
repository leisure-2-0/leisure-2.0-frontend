import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Thumbnail from '../Thumbnail/Thumbnail.jsx';
import { HeartIcon, BookmarkIcon, EditIcon, TrashIcon } from '../Icons/Icons.jsx';
import { CATEGORY_ICONS } from '../../data/posts.js';
import { useAuth } from '../../context/auth-context.js';
import * as postsApi from '../../api/posts.js';
import './PostCard.css';

export default function PostCard({ post, onToggled, onDeleted }) {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [isLiked, setIsLiked] = useState(!!post.isLiked);
  const [isBookmarked, setIsBookmarked] = useState(!!post.isBookmarked);
  const [isLikeBusy, setIsLikeBusy] = useState(false);
  const [isBookmarkBusy, setIsBookmarkBusy] = useState(false);
  const [isDeleteBusy, setIsDeleteBusy] = useState(false);

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/write/${post.id}`);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (isDeleteBusy) return;
    if (!window.confirm('이 게시글을 삭제할까요? 삭제하면 되돌릴 수 없어요.')) return;
    setIsDeleteBusy(true);
    try {
      await postsApi.deletePost(post.id);
      onDeleted?.(post.id);
    } catch {
      setIsDeleteBusy(false);
    }
  };

  const handleToggleLike = async (e) => {
    e.stopPropagation();
    if (!isLoggedIn) return navigate('/login');
    if (isLikeBusy) return;
    setIsLikeBusy(true);
    try {
      const result = isLiked ? await postsApi.unlikePost(post.id) : await postsApi.likePost(post.id);
      setIsLiked(result.isLiked);
      onToggled?.(post.id, { isLiked: result.isLiked, isBookmarked });
    } catch (err) {
      // 낡은 목록 캐시 탓에 상태를 반대로 알고 있으면 서버가 409(이미 눌림)/404(안 눌림)로 거절한다.
      // 이때 조용히 넘어가면 버튼이 영영 안 먹는 것처럼 보이므로, 서버가 알려준 실제 상태로 되돌린다.
      const status = err?.response?.status;
      if (status === 409 || status === 404) {
        const actual = status === 409;
        setIsLiked(actual);
        onToggled?.(post.id, { isLiked: actual, isBookmarked });
      }
    } finally {
      setIsLikeBusy(false);
    }
  };

  const handleToggleBookmark = async (e) => {
    e.stopPropagation();
    if (!isLoggedIn) return navigate('/login');
    if (isBookmarkBusy) return;
    setIsBookmarkBusy(true);
    try {
      const result = isBookmarked ? await postsApi.unbookmarkPost(post.id) : await postsApi.bookmarkPost(post.id);
      setIsBookmarked(result.isBookmarked);
      onToggled?.(post.id, { isLiked, isBookmarked: result.isBookmarked });
    } catch (err) {
      const status = err?.response?.status;
      if (status === 409 || status === 404) {
        const actual = status === 409;
        setIsBookmarked(actual);
        onToggled?.(post.id, { isLiked, isBookmarked: actual });
      }
    } finally {
      setIsBookmarkBusy(false);
    }
  };

  return (
    <div className="post-card" onClick={() => navigate(`/post/${post.id}`)} role="button" tabIndex={0}>
      <Thumbnail variant={post.thumbnailVariant} src={post.thumbnailUrl} />
      <div className="post-body">
        <p className="post-title">{post.title}</p>
        <div className="post-tags">
          <span className="tag cat-chip">{CATEGORY_ICONS[post.category] || '✨'} {post.category}</span>
          {post.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
        </div>
        <div className="post-meta">
          <span>{post.region} · 조회 {post.views}</span>
          <div className="post-card-icons">
            <button
              type="button"
              className={'post-card-icon-btn' + (isLiked ? ' active' : '')}
              aria-label="좋아요"
              onClick={handleToggleLike}
            >
              <HeartIcon filled={isLiked} />
            </button>
            <button
              type="button"
              className={'post-card-icon-btn' + (isBookmarked ? ' active' : '')}
              aria-label="북마크"
              onClick={handleToggleBookmark}
            >
              <BookmarkIcon filled={isBookmarked} />
            </button>
            {post.isMine && (
              <>
                <button type="button" className="post-card-icon-btn" aria-label="수정" onClick={handleEdit}>
                  <EditIcon />
                </button>
                <button type="button" className="post-card-icon-btn" aria-label="삭제" onClick={handleDelete} disabled={isDeleteBusy}>
                  <TrashIcon />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
