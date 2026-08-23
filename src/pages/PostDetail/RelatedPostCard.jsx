import { useNavigate } from 'react-router-dom';
import Thumbnail from '../../components/Thumbnail/Thumbnail.jsx';

export default function RelatedPostCard({ post }) {
  const navigate = useNavigate();

  return (
    <div
      className="related-post-card"
      onClick={() => navigate(`/post/${post.id}`)}
      role="button"
      tabIndex={0}
    >
      <Thumbnail image={post.imageSeed} className="related-post-thumb" />
      <p className="related-post-title">{post.title}</p>
      <span className="related-post-meta">{post.region} · 조회 {post.views}</span>
    </div>
  );
}
