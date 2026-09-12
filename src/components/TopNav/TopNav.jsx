import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useSearch } from '../../context/search-context.js';
import { useAuth } from '../../context/auth-context.js';
import './TopNav.css';

export default function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { query: searchTerm, setQuery: setSearchTerm } = useSearch();
  const { user, isLoggedIn, refreshPoints } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const goToSearchResults = () => {
    const trimmedSearchTerm = searchTerm.trim();
    navigate(trimmedSearchTerm ? `/search?q=${encodeURIComponent(trimmedSearchTerm)}` : '/search');
  };

  const goToMyPage = (tab) => {
    setIsProfileMenuOpen(false);
    navigate(tab ? `/mypage?tab=${tab}` : '/mypage');
  };

  // 프로필 메뉴 바깥을 클릭하면 닫기
  useEffect(() => {
    if (!isProfileMenuOpen) return;
    function handleOutsideClick(event) {
      if (!profileMenuRef.current?.contains(event.target)) setIsProfileMenuOpen(false);
    }
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isProfileMenuOpen]);

  return (
    <header className="topnav">
      <div className="topnav-inner">
        <Link to="/" className="logo">
          <div className="logo-stamp">여가</div>Yeo-ga
        </Link>
        <nav className="nav-tabs">
          <NavLink to="/calendar" className={({ isActive }) => 'nav-tab' + (isActive ? ' active' : '')}>축제 캘린더</NavLink>
          <NavLink to="/map" className={({ isActive }) => 'nav-tab' + (isActive ? ' active' : '')}>지도</NavLink>
          <NavLink to="/search" className={({ isActive }) => 'nav-tab' + (isActive ? ' active' : '')}>둘러보기</NavLink>
        </nav>
        <div className="nav-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            type="text"
            placeholder="지역이나 키워드 검색"
            autoComplete="off"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') goToSearchResults(); }}
          />
        </div>
        <div className="nav-right">
          {isLoggedIn ? (
            <>
              <button className="write-btn" onClick={() => navigate('/write')}>+ 새 글 작성</button>
              <div className="profile-menu-wrap" ref={profileMenuRef}>
                <button
                  className="avatar"
                  style={user.avatarUrl ? { backgroundImage: `url(${user.avatarUrl})` } : undefined}
                  onClick={() => {
                    setIsProfileMenuOpen((open) => !open);
                    refreshPoints();
                  }}
                  title="프로필"
                  aria-label="프로필 메뉴 열기"
                ></button>

                {isProfileMenuOpen && (
                  <div className="profile-menu">
                    <div className="profile-menu-header">
                      <div
                        className="profile-menu-avatar"
                        style={user.avatarUrl ? { backgroundImage: `url(${user.avatarUrl})` } : undefined}
                      ></div>
                      <div className="profile-menu-id">
                        <b>{user.nickname}</b>
                        <span>{user.email}</span>
                      </div>
                    </div>

                    <div className="profile-menu-points">⬡ {user.points ?? 0}</div>

                    <div className="profile-menu-links">
                      <button className="profile-menu-link" onClick={() => goToMyPage()}>내 게시글</button>
                      <button className="profile-menu-link" onClick={() => goToMyPage('likes')}>좋아요</button>
                      <button className="profile-menu-link" onClick={() => goToMyPage('bookmarks')}>북마크</button>
                      <button className="profile-menu-link" onClick={() => goToMyPage('account')}>설정</button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button className="login-btn" onClick={() => navigate('/login', { state: { from: location.pathname } })}>
              로그인
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
