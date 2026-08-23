import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Thumbnail from '../Thumbnail/Thumbnail.jsx';
import { HeartIcon, BookmarkIcon } from '../Icons/Icons.jsx';
import { CATEGORY_ICONS } from '../../data/posts.js';
import './PostCard.css';

export default function PostCard({ post }) {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <div className="post-card" onClick={() => navigate(`/post/${post.id}`)} role="button" tabIndex={0}>
      <Thumbnail variant={post.thumbnailVariant} image={post.imageSeed} />
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
              onClick={(e) => { e.stopPropagation(); setIsLiked((v) => !v); }}
            >
              <HeartIcon filled={isLiked} />
            </button>
            <button
              type="button"
              className={'post-card-icon-btn' + (isBookmarked ? ' active' : '')}
              aria-label="북마크"
              onClick={(e) => { e.stopPropagation(); setIsBookmarked((v) => !v); }}
            >
              <BookmarkIcon filled={isBookmarked} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
