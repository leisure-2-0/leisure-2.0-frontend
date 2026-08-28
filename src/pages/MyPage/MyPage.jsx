import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/auth-context.js';
import { MY_POSTS, MY_BOOKMARKS, MY_LIKES } from '../../data/mypage.js';
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

export default function MyPage() {
  const { user, isLoggedIn } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  if (!isLoggedIn) return <Navigate to="/login" state={{ from: '/mypage' }} replace />;

  const activeTab = searchParams.get('tab') || 'posts';

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
          {activeTab === 'posts' && <MyPostsTab posts={MY_POSTS} />}
          {activeTab === 'bookmarks' && (
            <SavedPostsTab
              title="북마크"
              posts={MY_BOOKMARKS}
              emptyTitle="아직 북마크한 게시글이 없어요"
              emptyBody="마음에 드는 이야기를 북마크해보세요."
            />
          )}
          {activeTab === 'likes' && (
            <SavedPostsTab
              title="좋아요"
              posts={MY_LIKES}
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
