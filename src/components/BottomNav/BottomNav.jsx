import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth-context.js';
import './BottomNav.css';

// 720px 이하 모바일 폭에서 헤더 대신 쓰는 하단 앱 내비게이션.
export default function BottomNav() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <nav className="bottom-nav">
      <NavLink to="/" end className={({ isActive }) => 'bottom-nav-item' + (isActive ? ' active' : '')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span>홈</span>
      </NavLink>

      <NavLink to="/calendar" className={({ isActive }) => 'bottom-nav-item' + (isActive ? ' active' : '')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span>캘린더</span>
      </NavLink>

      <NavLink to="/map" className={({ isActive }) => 'bottom-nav-item' + (isActive ? ' active' : '')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4z" />
          <line x1="8" y1="2" x2="8" y2="18" />
          <line x1="16" y1="6" x2="16" y2="22" />
        </svg>
        <span>지도</span>
      </NavLink>

      <button className="bottom-nav-item" onClick={() => navigate('/write')} aria-label="글쓰기">
        <span className="bottom-nav-write-circle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </span>
        <span>글쓰기</span>
      </button>

      <button className="bottom-nav-item" onClick={() => navigate('/chat')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
        <span>AI챗</span>
      </button>

      <button className="bottom-nav-item" onClick={() => navigate('/mypage')} aria-label="프로필">
        <span
          className="bottom-nav-avatar"
          style={user?.avatarUrl ? { backgroundImage: `url(${user.avatarUrl})` } : undefined}
        ></span>
        <span>프로필</span>
      </button>
    </nav>
  );
}
