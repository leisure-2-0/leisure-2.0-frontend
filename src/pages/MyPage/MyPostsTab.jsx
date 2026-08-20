import { useNavigate } from 'react-router-dom';
import PostCard from '../../components/PostCard/PostCard.jsx';

export default function MyPostsTab({ posts }) {
  const navigate = useNavigate();

  return (
    <>
      <div className="section-head">
        <h3>내 게시글 <span className="result-count">{posts.length}개</span></h3>
        <button className="mypage-write-btn" onClick={() => navigate('/write')}>+ 새 글 작성</button>
      </div>

      {posts.length === 0 ? (
        <div className="empty-state">
          <b>아직 작성한 게시글이 없어요</b>동네 이야기를 처음으로 남겨보세요.
        </div>
      ) : (
        <div className="post-grid">
          {posts.map((post) => <PostCard post={post} key={post.title} />)}
        </div>
      )}
    </>
  );
}
