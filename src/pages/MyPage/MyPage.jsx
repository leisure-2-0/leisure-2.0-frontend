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

  // 좋아요/북마크 변경은 보고 있는 탭뿐 아니라 이미 불러와 둔 다른 탭 캐시에도 반영해야 한다.
  // (예: 좋아요 탭에서 취소했는데 내 게시글 캐시엔 눌린 상태로 남아, 그 탭으로 가면 다시 눌린 것처럼 보임)
  const handleToggled = (postId, { isLiked, isBookmarked }) => {
    setTabData((prev) => {
      const next = {};
      for (const [tab, data] of Object.entries(prev)) {
        const belongs = tab === 'likes' ? isLiked : tab === 'bookmarks' ? isBookmarked : true;

        // 좋아요/북마크 목록에 새로 들어가야 하는 글은 끼워넣을 위치를 알 수 없으니,
        // 캐시를 버려서 그 탭을 열 때 다시 불러오게 한다.
        if (belongs && tab !== 'posts' && !data.items.some((p) => p.id === postId)) continue;

        next[tab] = {
          ...data,
          items: data.items
            .filter((p) => p.id !== postId || belongs)
            .map((p) => (p.id === postId ? { ...p, isLiked, isBookmarked } : p)),
        };
      }
      return next;
    });
  };

  const handleDeleted = (postId) => {
    setTabData((prev) => {
      const next = {};
      for (const [tab, data] of Object.entries(prev)) {
        next[tab] = { ...data, items: data.items.filter((p) => p.id !== postId) };
      }
      return next;
    });
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
              onDeleted={handleDeleted}
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
              onDeleted={handleDeleted}
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
