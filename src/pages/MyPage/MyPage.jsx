import { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/auth-context.js';
import * as postsApi from '../../api/posts.js';
import { getErrorMessage } from '../../api/errors.js';
import MyPostsTab from './MyPostsTab.jsx';
import SavedPostsTab from './SavedPostsTab.jsx';
import AccountTab from './AccountTab.jsx';
import './MyPage.css';

const TABS = [
  { key: 'posts', label: '내 게시글' },
  { key: 'bookmarks', label: '북마크' },
  { key: 'likes', label: '좋아요' },
  { key: 'account', label: '계정 정보' },
];

const TAB_FETCHERS = {
  posts: postsApi.getMyPosts,
  bookmarks: postsApi.getMyBookmarks,
  likes: postsApi.getMyLikes,
};

export default function MyPage() {
  const { user, isLoggedIn, initializing } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'posts';

  // 탭별로 불러온 결과를 캐싱한다. 탭 항목이 없으면 아직 못 불러온 것 = 로딩 중.
  const [tabData, setTabData] = useState({});
  const current = tabData[activeTab];
  const posts = current?.items ?? [];
  const loading = !!TAB_FETCHERS[activeTab] && !current;
  const error = current?.error ?? '';

  useEffect(() => {
    const fetcher = TAB_FETCHERS[activeTab];
    if (!fetcher || !isLoggedIn || tabData[activeTab]) return;

    let cancelled = false;
    fetcher()
      .then((data) => {
        if (cancelled) return;
        setTabData((prev) => ({ ...prev, [activeTab]: { items: data.content.map(postsApi.toCardPost), error: null } }));
      })
      .catch((err) => {
        if (cancelled) return;
        setTabData((prev) => ({ ...prev, [activeTab]: { items: [], error: getErrorMessage(err) } }));
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, isLoggedIn, tabData]);

  if (initializing) return null;
  if (!isLoggedIn) return <Navigate to="/login" state={{ from: '/mypage' }} replace />;

  const handleToggled = (postId, { isLiked, isBookmarked }) => {
    const shouldRemove = (activeTab === 'likes' && !isLiked) || (activeTab === 'bookmarks' && !isBookmarked);
    if (!shouldRemove) return;
    setTabData((prev) => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], items: prev[activeTab].items.filter((p) => p.id !== postId) },
    }));
  };

  const handleDeleted = (postId) => {
    setTabData((prev) => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], items: prev[activeTab].items.filter((p) => p.id !== postId) },
    }));
  };

  return (
    <section className="page mypage">
      <div className="mypage-layout">
        <aside className="mypage-sidebar">
          <div className="mypage-profile">
            <div
              className="mypage-avatar"
              style={user.avatarUrl ? { backgroundImage: `url(${user.avatarUrl})` } : undefined}
            ></div>
            <div className="mypage-profile-info">
              <b>{user.nickname}</b>
              <span>{user.email}</span>
            </div>
          </div>

          <div className="filter-option-list">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                className={'filter-option' + (activeTab === tab.key ? ' active' : '')}
                onClick={() => setSearchParams(tab.key === 'posts' ? {} : { tab: tab.key })}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </aside>

        <div className="mypage-main">
          {activeTab === 'posts' && (
            <MyPostsTab posts={posts} loading={loading} error={error} onToggled={handleToggled} onDeleted={handleDeleted} />
          )}
          {activeTab === 'bookmarks' && (
            <SavedPostsTab
              title="북마크"
              posts={posts}
              loading={loading}
              error={error}
              onToggled={handleToggled}
              emptyTitle="아직 북마크한 게시글이 없어요"
              emptyBody="마음에 드는 이야기를 북마크해보세요."
            />
          )}
          {activeTab === 'likes' && (
            <SavedPostsTab
              title="좋아요"
              posts={posts}
              loading={loading}
              error={error}
              onToggled={handleToggled}
              emptyTitle="아직 좋아요한 게시글이 없어요"
              emptyBody="공감 가는 이야기에 좋아요를 남겨보세요."
            />
          )}
          {activeTab === 'account' && <AccountTab />}
        </div>
      </div>
    </section>
  );
}
