import Thumbnail from '../Thumbnail/Thumbnail.jsx';
import { CATEGORY_ICONS } from '../../data/posts.js';
import './PostCard.css';

export default function PostCard({ post }) {
  return (
    <div className="post-card">
      <Thumbnail variant={post.thumbnailVariant} image={post.imageSeed} />
      <div className="post-body">
        <p className="post-title">{post.title}</p>
        <div className="post-tags">
          <span className="tag cat-chip">{CATEGORY_ICONS[post.category] || '✨'} {post.category}</span>
          {post.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
        </div>
        <div className="post-meta">
          <span>{post.region} · 조회 {post.views} · 방문인증 {post.visits}회</span>
        </div>
      </div>
    </div>
  );
}
