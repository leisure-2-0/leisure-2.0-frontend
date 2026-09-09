import PostCard from '../../components/PostCard/PostCard.jsx';

export default function MyPostsTab({ posts, loading, error, onToggled, onDeleted }) {
  return (
    <>
      <div className="section-head">
        <h3>내 게시글 <span className="result-count">{posts.length}개</span></h3>
      </div>

      {loading ? (
        <div className="empty-state"><b>불러오는 중...</b></div>
      ) : error ? (
        <div className="empty-state"><b>목록을 불러오지 못했어요</b>{error}</div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <b>아직 작성한 게시글이 없어요</b>동네 이야기를 처음으로 남겨보세요.
        </div>
      ) : (
        <div className="post-grid">
          {posts.map((post) => <PostCard post={post} key={post.id} onToggled={onToggled} onDeleted={onDeleted} />)}
        </div>
      )}
    </>
  );
}
