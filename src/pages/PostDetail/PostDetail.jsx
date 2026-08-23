import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Thumbnail from '../../components/Thumbnail/Thumbnail.jsx';
import { HeartIcon, BookmarkIcon } from '../../components/Icons/Icons.jsx';
import RelatedPostCard from './RelatedPostCard.jsx';
import {
  CATEGORY_ICONS,
  getAuthorName,
  getMockPostBody,
  getPostById,
  getRelatedByAuthor,
  getRelatedByRegion,
} from '../../data/posts.js';
import './PostDetail.css';

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const post = getPostById(postId);

  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  if (!post) return <Navigate to="/" replace />;

  const authorName = getAuthorName(post);
  const relatedByRegion = getRelatedByRegion(post);
  const relatedByAuthor = getRelatedByAuthor(post);

  return (
    <section className="page post-detail-page">
      <button type="button" className="post-detail-back" onClick={() => navigate(-1)}>← 목록으로</button>

      <div className="post-detail-cover">
        <Thumbnail image={post.imageSeed} />
      </div>

      <div className="post-detail-head">
        <div className="post-detail-head-top">
          <span className="tag cat-chip">{CATEGORY_ICONS[post.category] || '✨'} {post.category}</span>
          <span className="post-detail-meta">{post.region} · 조회 {post.views} · 방문인증 {post.visits}회</span>
        </div>
        <h1 className="post-detail-title">{post.title}</h1>
        <div className="post-detail-tags">
          {post.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
        </div>
      </div>

      <div className="post-detail-author-row">
        <div className="post-detail-author">
          <div className="post-detail-avatar"></div>
          <div>
            <p className="post-detail-author-name">{authorName}</p>
            <p className="post-detail-author-sub">{post.region} 인증 로컬</p>
          </div>
        </div>
        <div className="post-detail-actions">
          <button
            type="button"
            className={'post-detail-icon-btn' + (isLiked ? ' active' : '')}
            aria-label="좋아요"
            onClick={() => setIsLiked((v) => !v)}
          >
            <HeartIcon filled={isLiked} />
          </button>
          <button
            type="button"
            className={'post-detail-icon-btn' + (isBookmarked ? ' active' : '')}
            aria-label="북마크"
            onClick={() => setIsBookmarked((v) => !v)}
          >
            <BookmarkIcon filled={isBookmarked} />
          </button>
        </div>
      </div>

      <div
        className="post-detail-body"
        dangerouslySetInnerHTML={{ __html: getMockPostBody(post) }}
      />

      <div className="post-detail-location">
        <span className="post-detail-location-label">위치</span>
        <div className="map-box post-detail-map">
          <div className="pin" style={{ top: `${post.mapPosition.top}%`, left: `${post.mapPosition.left}%` }}>
            <div className="dot"></div>
            <span>{post.region}</span>
          </div>
        </div>
      </div>

      <hr className="post-detail-divider" />

      {relatedByRegion.length > 0 && (
        <div className="post-detail-related">
          <h3 className="post-detail-related-title">{post.region}의 다른 글</h3>
          <div className="related-post-grid">
            {relatedByRegion.map((related) => <RelatedPostCard post={related} key={related.id} />)}
          </div>
        </div>
      )}

      {relatedByAuthor.length > 0 && (
        <div className="post-detail-related">
          <h3 className="post-detail-related-title">{authorName}님의 다른 글</h3>
          <div className="related-post-grid">
            {relatedByAuthor.map((related) => <RelatedPostCard post={related} key={related.id} />)}
          </div>
        </div>
      )}
    </section>
  );
}
