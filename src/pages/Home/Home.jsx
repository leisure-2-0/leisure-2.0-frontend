import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../../context/search-context.js';
import MiniCalendar from '../../components/MiniCalendar/MiniCalendar.jsx';
import PostCard from '../../components/PostCard/PostCard.jsx';
import PostMapView from '../../components/PostMapView/PostMapView.jsx';
import { REGIONS } from '../../data/posts.js';
import * as postsApi from '../../api/posts.js';
import * as dashboardApi from '../../api/dashboard.js';
import { getErrorMessage } from '../../api/errors.js';
import './Home.css';

const SOUTH_KOREA_CENTER = { lat: 36.5, lng: 127.8 };

const CATEGORIES = [
  { category: 'all', label: '전체', icon: '✦', background: 'var(--primary-deep)', color: '#fff' },
  { category: '식당', label: '식당', icon: '🍽️', background: 'var(--accent-pale)' },
  { category: '카페', label: '카페', icon: '☕', background: 'var(--primary-pale)' },
  { category: '숙소', label: '숙소', icon: '🏠', background: 'var(--stamp-pale)' },
  { category: '액티비티', label: '액티비티', icon: '⛰️', background: 'var(--accent-pale)' },
  { category: '체험', label: '체험', icon: '🎨', background: 'var(--stamp-pale)' },
  { category: '풍경', label: '풍경/명소', icon: '🌄', background: 'var(--primary-pale)' },
  { category: '축제', label: '축제', icon: '🎊', background: 'var(--stamp-pale)' },
  { category: '행사', label: '행사', icon: '🎪', background: 'var(--accent-pale)' },
  { category: '기타', label: '기타', icon: '✨', background: 'var(--primary-pale)' },
];

export default function Home() {
  const navigate = useNavigate();
  const { query: searchTerm, setQuery: setSearchTerm } = useSearch(); //검색기능, 검색어 변경 탐지
  const [selectedCategory, setSelectedCategory] = useState('all'); // 카테고리 기본값 = 전체
  const [sortOrder, setSortOrder] = useState('latest'); // 정렬 기본값 = 최신순
  const [isSuggestOpen, setIsSuggestOpen] = useState(false); // 검색 제안 패널 열림 상태

  const searchDockRef = useRef(null);
  const mapBoxRef = useRef(null);
  const miniCalPanelRef = useRef(null);

  const normalizedSearchTerm = searchTerm.trim().toLowerCase(); // 검색어 소문자 변환 및 공백 제거

  // 검색어가 있을 때만 지역 제안 필터링
  const regionSuggestions = useMemo(() => {
    if (!normalizedSearchTerm) return [];
    return REGIONS.filter((region) => region.toLowerCase().includes(normalizedSearchTerm));
  }, [normalizedSearchTerm]);

  // 탭(카테고리, 정렬) 조합별로 결과를 캐싱한다. 캐시가 없으면 로딩 중.
  const [feedCache, setFeedCache] = useState({});
  const feedKey = `${selectedCategory}:${sortOrder}`;
  const cached = feedCache[feedKey];
  const visiblePosts = cached?.items ?? [];
  const feedLoading = !cached;
  const feedError = cached?.error ?? '';

  useEffect(() => {
    if (feedCache[feedKey]) return;

    let cancelled = false;
    postsApi
      .getMainFeed({ category: postsApi.toBackendCategory(selectedCategory), sort: sortOrder.toUpperCase() })
      .then((data) => {
        if (cancelled) return;
        setFeedCache((prev) => ({ ...prev, [feedKey]: { items: data.map(postsApi.toCardPost), error: null } }));
      })
      .catch((err) => {
        if (cancelled) return;
        setFeedCache((prev) => ({ ...prev, [feedKey]: { items: [], error: getErrorMessage(err) } }));
      });

    return () => {
      cancelled = true;
    };
  }, [feedKey, selectedCategory, sortOrder, feedCache]);

  const [stats, setStats] = useState(null);
  useEffect(() => {
    let cancelled = false;
    dashboardApi.getDashboardStats().then((data) => {
      if (!cancelled) setStats(data);
    }).catch(() => {
      // 통계 조회 실패는 조용히 무시 — 대시보드는 부가 정보라 화면 흐름을 막지 않는다.
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // 창 크기가 바뀔 때마다 미니 캘린더 패널 높이에 맞춰 지도 박스 높이 동기화
  useEffect(() => {
    function syncMapHeight() {
      if (miniCalPanelRef.current && mapBoxRef.current) {
        mapBoxRef.current.style.height = miniCalPanelRef.current.offsetHeight + 'px';
      }
    }
    syncMapHeight();
    window.addEventListener('resize', syncMapHeight);
    return () => window.removeEventListener('resize', syncMapHeight);
  }, []);

  // 다른 곳 클릭시 검색어 제안 패널 닫기
  useEffect(() => {
    function handleOutsideClick(event) {
      if (!searchDockRef.current?.contains(event.target)) setIsSuggestOpen(false);
    }
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // 검색어 입력 시 상태 업데이트 및 제안 패널 열기
  const handleSearchInputChange = (value) => {
    setSearchTerm(value);
    setIsSuggestOpen(true);
  };

  // 검색어 입력 후 엔터 또는 검색 버튼 클릭 시 검색 결과 페이지로 이동
  const goToSearchResults = (termOverride) => {
    setIsSuggestOpen(false);
    const term = (termOverride ?? searchTerm).trim();
    navigate(term ? `/search?q=${encodeURIComponent(term)}` : '/search');
  };

  // 지역 제안 클릭 시 검색어 업데이트 및 검색 결과 페이지로 이동
  const handleSuggestionClick = (region) => {
    setSearchTerm(region);
    goToSearchResults(region);
  };

  return (
    <section id="page-home" className="page">
      <div className="promo-banner">
        <div className="promo-tag">공식 제휴 · AD</div>
        <div className="promo-text">
          <h2>강원도와 함께하는 <b>2026 소도시 축제 위크</b></h2>
          <p>8월 한 달, 강릉 · 속초 · 정선 3개 지역 공식 축제 소식을 한눈에 만나보세요.</p>
        </div>
        <button className="promo-cta" onClick={() => navigate('/calendar')}>자세히 보기 →</button>
      </div>

      <div className="hero">
        <div className="hero-text">
          <h1>이번 주, 아무도 몰랐던<br />동네 이야기가 올라왔어요</h1>
          <p><span>여가는 소도시에 사는 사람들이 직접 남기는</span> <span>진짜 동네 정보로 채워지는 지역 발견 플랫폼입니다.</span></p>
        </div>

        <div className="search-dock" ref={searchDockRef}>
          <div className="search-bar">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input
              type="text"
              placeholder="지역이나 키워드로 검색해보세요 (예: 강릉, 카페)"
              autoComplete="off"
              value={searchTerm}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              onFocus={() => setIsSuggestOpen(true)}
              onKeyDown={(e) => { if (e.key === 'Enter') goToSearchResults(); }}
            />
            <button className="search-go" onClick={() => goToSearchResults()}>→</button>
          </div>
          {isSuggestOpen && regionSuggestions.length > 0 && (
            <div className="search-suggest open">
              <div className="suggest-label">지역 제안</div>
              {regionSuggestions.map((region) => (
                <div
                  className="suggest-item"
                  key={region}
                  onClick={() => handleSuggestionClick(region)}
                >
                  <span className="pin-ic">📍</span>{region}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="stat-strip">
        <div className="stat-item"><div className="num">{stats ? stats.certifiedRegionCount.toLocaleString() : '-'}</div><div className="lbl">인증된 소도시</div></div>
        <div className="stat-item"><div className="num">{stats ? stats.certifiedPostCount.toLocaleString() : '-'}</div><div className="lbl">누적 인증 게시글</div></div>
        <div className="stat-item"><div className="num">{stats ? stats.monthlyPostCount.toLocaleString() : '-'}</div><div className="lbl">이번달 게시글</div></div>
        <div className="stat-item"><div className="num">{stats ? stats.inProgressFestivalCount.toLocaleString() : '-'}</div><div className="lbl">이번 달 진행중 축제</div></div>
      </div>

      <div className="home-grid">
        <div className="map-box" ref={mapBoxRef}>
          <span className="map-label">📍 지역 지도 — 핀을 눌러 게시글 보기</span>
          <PostMapView center={SOUTH_KOREA_CENTER} level={11} />
        </div>

        <div className="home-sidebar">
          <MiniCalendar panelRef={miniCalPanelRef} />

          <div className="panel side-block">
            <h4>실시간 인기 지역</h4>
            <div className="rank-row top"><span className="rank-num">1</span><span className="rank-place">강릉</span><span className="rank-count">432 뷰</span></div>
            <div className="rank-row top"><span className="rank-num">2</span><span className="rank-place">통영</span><span className="rank-count">387 뷰</span></div>
            <div className="rank-row top"><span className="rank-num">3</span><span className="rank-place">전주</span><span className="rank-count">301 뷰</span></div>
            <div className="rank-row"><span className="rank-num">4</span><span className="rank-place">담양</span><span className="rank-count">255 뷰</span></div>
            <div className="rank-row"><span className="rank-num">5</span><span className="rank-place">군산</span><span className="rank-count">198 뷰</span></div>
          </div>
        </div>

        <div className="cat-square-row">
          {CATEGORIES.map((categoryOption) => (
            <button
              key={categoryOption.category}
              className={'cat-square' + (selectedCategory === categoryOption.category ? ' active' : '')}
              onClick={() => setSelectedCategory(categoryOption.category)}
            >
              <span className="csq" style={{ background: categoryOption.background, color: categoryOption.color }}>{categoryOption.icon}</span>
              <span>{categoryOption.label}</span>
            </button>
          ))}
        </div>

        <div className="section-head">
          <h3>최근 올라온 이야기</h3>
          <div className="sort-toggle">
            <button className={'sort-opt' + (sortOrder === 'latest' ? ' active' : '')} onClick={() => setSortOrder('latest')}>최신순</button>
            <span className="sort-sep">|</span>
            <button className={'sort-opt' + (sortOrder === 'popular' ? ' active' : '')} onClick={() => setSortOrder('popular')}>인기순</button>
          </div>
        </div>

        <div className="post-grid">
          {feedLoading ? (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}><b>불러오는 중...</b></div>
          ) : feedError ? (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}><b>목록을 불러오지 못했어요</b>{feedError}</div>
          ) : visiblePosts.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
              <b>조건에 맞는 게시글이 아직 없어요</b>
              이 조건의 첫 이야기를 가장 먼저 남겨보세요.
            </div>
          ) : (
            visiblePosts.map((post) => <PostCard post={post} key={post.id} />)
          )}
        </div>

        {visiblePosts.length > 0 && (
          <button className="load-more-btn" onClick={() => navigate('/search')}>
            더보기 →
          </button>
        )}
      </div>
    </section>
  );
}
