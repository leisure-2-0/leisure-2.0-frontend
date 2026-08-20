import PostCard from '../../components/PostCard/PostCard.jsx';

export default function SavedPostsTab({ posts, emptyTitle, emptyBody }) {
  if (posts.length === 0) {
    return (
      <div className="empty-state">
        <b>{emptyTitle}</b>{emptyBody}
      </div>
    );
  }

  return (
    <div className="post-grid">
      {posts.map((post) => <PostCard post={post} key={post.title} />)}
    </div>
  );
}
