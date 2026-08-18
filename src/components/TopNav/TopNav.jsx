import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSearch } from '../../context/search-context.js';
import './TopNav.css';

export default function TopNav() {
  const navigate = useNavigate();
  const { query: searchTerm, setQuery: setSearchTerm } = useSearch();

  const goToSearchResults = () => {
    const trimmedSearchTerm = searchTerm.trim();
    navigate(trimmedSearchTerm ? `/search?q=${encodeURIComponent(trimmedSearchTerm)}` : '/search');
  };

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
          <div className="points-pill">⬡ 1,240P</div>
          <div className="avatar"></div>
        </div>
      </div>
    </header>
  );
}
