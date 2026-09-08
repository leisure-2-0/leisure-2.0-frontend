import PostCard from '../../components/PostCard/PostCard.jsx';

export default function SavedPostsTab({ title, posts, loading, error, onToggled, emptyTitle, emptyBody }) {
  return (
    <>
      <div className="section-head">
        <h3>{title} <span className="result-count">{posts.length}개</span></h3>
      </div>

      {loading ? (
        <div className="empty-state"><b>불러오는 중...</b></div>
      ) : error ? (
        <div className="empty-state"><b>목록을 불러오지 못했어요</b>{error}</div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <b>{emptyTitle}</b>{emptyBody}
        </div>
      ) : (
        <div className="post-grid">
          {posts.map((post) => <PostCard post={post} key={post.id} onToggled={onToggled} />)}
        </div>
      )}
    </>
  );
}
