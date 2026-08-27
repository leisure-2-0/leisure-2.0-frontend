import PostCard from '../../components/PostCard/PostCard.jsx';

export default function SavedPostsTab({ title, posts, emptyTitle, emptyBody }) {
  return (
    <>
      <div className="section-head">
        <h3>{title} <span className="result-count">{posts.length}개</span></h3>
      </div>

      {posts.length === 0 ? (
        <div className="empty-state">
          <b>{emptyTitle}</b>{emptyBody}
        </div>
      ) : (
        <div className="post-grid">
          {posts.map((post) => <PostCard post={post} key={post.title} />)}
        </div>
      )}
    </>
  );
}
