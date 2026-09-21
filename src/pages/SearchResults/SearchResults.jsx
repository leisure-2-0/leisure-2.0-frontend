import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PostCard from '../../components/PostCard/PostCard.jsx';
import { CATEGORY_ICONS } from '../../data/posts.js';
import { REGION_HIERARCHY, toRegionSearchTerm } from '../../data/regions.js';
import { useAuth } from '../../context/auth-context.js';
import { ChevronDownIcon } from '../../components/Icons/Icons.jsx';
import * as postsApi from '../../api/posts.js';
import * as searchApi from '../../api/search.js';
import { getErrorMessage } from '../../api/errors.js';
import './SearchResults.css';

// derived from the canonical category list so this filter can't drift out of sync with it
const CATEGORY_FILTER_OPTIONS = ['all', ...Object.keys(CATEGORY_ICONS)];
const SEARCH_PAGE_SIZE = 15;

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { initializing } = useAuth();
  const searchTermFromUrl = searchParams.get('q') || '';

  // this page's search box is intentionally independent from the header/home search box:
  // typing here never touches the shared header search, and vice versa. The URL's ?q= only
  // re-seeds it when a *new* one actually arrives (e.g. a fresh search from home or 더보기) —
  // this is React's documented "adjust state during render" pattern, not a plain setState-in-effect.
  const [lastSyncedSearchTermFromUrl, setLastSyncedSearchTermFromUrl] = useState(searchTermFromUrl);
  const [searchTerm, setSearchTerm] = useState(searchTermFromUrl);
  if (searchTermFromUrl !== lastSyncedSearchTermFromUrl) {
    setLastSyncedSearchTermFromUrl(searchTermFromUrl);
    setSearchTerm(searchTermFromUrl);
  }

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSido, setSelectedSido] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [sortOrder, setSortOrder] = useState('latest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const activeFilterLabel = [
    selectedCategory === 'all' ? null : selectedCategory,
    selectedRegion === 'all' ? null : selectedRegion,
  ].filter(Boolean).join(' · ');

  const runSearch = (term) => {
    setSearchTerm(term);
    setSearchParams(term.trim() ? { q: term.trim() } : {});
  };

  const applySearchTermToUrl = () => runSearch(searchTerm);

  const selectRegion = (districtName) => {
    setSelectedRegion(districtName);
    runSearch(toRegionSearchTerm(districtName));
    setIsFilterOpen(false);
  };

  // eslint-disable-next-line no-unused-vars
  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedSido(null);
    setSelectedCity(null);
    setSelectedRegion('all');
    runSearch('');
  };

  const isSearching = searchTermFromUrl.trim() !== '';
  const backendCategory = postsApi.toBackendCategory(selectedCategory);
  const backendSort = sortOrder.toUpperCase();
  const feedKey = isSearching
    ? `search:${searchTermFromUrl}:${selectedCategory}:${sortOrder}`
    : `browse:${selectedCategory}:${sortOrder}`;

  const [feedCache, setFeedCache] = useState({});
  const current = feedCache[feedKey];
  const matchedPosts = current?.items ?? [];
  const loading = !current;
  const error = current?.error ?? '';
  const hasNext = current?.hasNext ?? false;
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (initializing || feedCache[feedKey]) return;
    let cancelled = false;

    const request = isSearching
      ? searchApi.searchPosts({ searchTerm: searchTermFromUrl, category: backendCategory, sort: backendSort, page: 0, size: SEARCH_PAGE_SIZE })
          .then((data) => ({ items: data.content.map(postsApi.toCardPost), page: 0, hasNext: data.hasNext }))
      : postsApi.getPosts({ category: backendCategory, sort: backendSort })
          .then((data) => ({ items: data.posts.map(postsApi.toCardPost), cursor: data.nextCursor, hasNext: data.hasNext }));

    request
      .then((result) => {
        if (cancelled) return;
        setFeedCache((prev) => ({ ...prev, [feedKey]: { ...result, error: null } }));
      })
      .catch((err) => {
        if (cancelled) return;
        setFeedCache((prev) => ({ ...prev, [feedKey]: { items: [], hasNext: false, error: getErrorMessage(err) } }));
      });

    return () => {
      cancelled = true;
    };
  }, [feedKey, isSearching, searchTermFromUrl, backendCategory, backendSort, feedCache, initializing]);

  const handleLoadMore = async () => {
    if (!hasNext || loadingMore) return;
    setLoadingMore(true);
    try {
      if (isSearching) {
        const nextPage = current.page + 1;
        const data = await searchApi.searchPosts({
          searchTerm: searchTermFromUrl, category: backendCategory, sort: backendSort, page: nextPage, size: SEARCH_PAGE_SIZE,
        });
        setFeedCache((prev) => ({
          ...prev,
          [feedKey]: { items: [...prev[feedKey].items, ...data.content.map(postsApi.toCardPost)], page: nextPage, hasNext: data.hasNext, error: null },
        }));
      } else {
        const data = await postsApi.getPosts({ category: backendCategory, sort: backendSort, cursor: current.cursor });
        setFeedCache((prev) => ({
          ...prev,
          [feedKey]: { items: [...prev[feedKey].items, ...data.posts.map(postsApi.toCardPost)], cursor: data.nextCursor, hasNext: data.hasNext, error: null },
        }));
      }
    } catch {
      // 다시 누르면 재시도된다
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <section className="page search-page">

      <div className="search-page-layout">
        <aside className="search-sidebar">
          <button
            type="button"
            className={'filter-toggle' + (isFilterOpen ? ' open' : '')}
            onClick={() => setIsFilterOpen((open) => !open)}
            aria-expanded={isFilterOpen}
          >
            <span>필터{activeFilterLabel && <em>{activeFilterLabel}</em>}</span>
            <ChevronDownIcon className="filter-toggle-caret" />
          </button>

          <div className={'search-filter-body' + (isFilterOpen ? ' open' : '')}>
          <div className="filter-group filter-group-category">
            <h4>카테고리</h4>
            <div className="filter-option-list">
              {CATEGORY_FILTER_OPTIONS.map((option) => (
                <button
                  key={option}
                  className={'filter-option' + (selectedCategory === option ? ' active' : '')}
                  onClick={() => setSelectedCategory(option)}
                >
                  {option === 'all' ? '전체' : option}
                </button>
              ))}
            </div>
          </div>

          <div className='eyebrow'></div>

          <div className="filter-group filter-group-region">
            <h4>지역</h4>
            <div className="filter-option-list">
              <button
                className={'filter-option' + (!selectedSido && selectedRegion === 'all' ? ' active' : '')}
                onClick={() => { setSelectedSido(null); setSelectedRegion('all'); runSearch(''); }}
              >
                전체
              </button>
              {REGION_HIERARCHY.map((sido) => {
                const isSidoOpen = selectedSido === sido.name;
                return (
                  <div className="region-filter-sido" key={sido.name}>
                    <button
                      className={'filter-option region-filter-sido-toggle' + (isSidoOpen ? ' open' : '')}
                      onClick={() => { setSelectedSido(isSidoOpen ? null : sido.name); setSelectedCity(null); }}
                    >
                      <span className="region-filter-caret">›</span>
                      {sido.name}
                    </button>
                    {isSidoOpen && (
                      <div className="filter-option-list filter-option-list-sub">
                        {sido.districts.map((district) => {
                          if (typeof district === 'string') {
                            return (
                              <button
                                key={district}
                                className={'filter-option' + (selectedRegion === district ? ' active' : '')}
                                onClick={() => selectRegion(district)}
                              >
                                {district}
                              </button>
                            );
                          }
                          const isCityOpen = selectedCity === district.name;
                          return (
                            <div className="region-filter-city" key={district.name}>
                              <button
                                className={'filter-option region-filter-sido-toggle' + (isCityOpen ? ' open' : '')}
                                onClick={() => setSelectedCity(isCityOpen ? null : district.name)}
                              >
                                <span className="region-filter-caret">›</span>
                                {district.name}
                              </button>
                              {isCityOpen && (
                                <div className="filter-option-list filter-option-list-sub">
                                  <button
                                    className={'filter-option' + (selectedRegion === district.name ? ' active' : '')}
                                    onClick={() => selectRegion(district.name)}
                                  >
                                    {district.name} 전체
                                  </button>
                                  {district.wards.map((ward) => (
                                    <button
                                      key={ward}
                                      className={'filter-option' + (selectedRegion === ward ? ' active' : '')}
                                      onClick={() => selectRegion(ward)}
                                    >
                                      {ward}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* <button className="filter-reset-btn" onClick={resetFilters}>필터 초기화</button> */}
          </div>
        </aside>

        <div className="search-main">
          <div className="search-page-searchbar">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input
              type="text"
              placeholder="지역이나 키워드로 검색해보세요"
              autoComplete="off"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') applySearchTermToUrl(); }}
            />
            <button className="search-page-go" onClick={applySearchTermToUrl}>검색</button>
          </div>

          <div className="section-head">
            <h3>
              {searchTermFromUrl ? `"${searchTermFromUrl}" 검색 결과` : '전체 게시글'}
              <span className="result-count">{matchedPosts.length}개</span>
            </h3>
            <div className="sort-toggle">
              <button className={'sort-opt' + (sortOrder === 'latest' ? ' active' : '')} onClick={() => setSortOrder('latest')}>최신순</button>
              <span className="sort-sep">|</span>
              <button className={'sort-opt' + (sortOrder === 'popular' ? ' active' : '')} onClick={() => setSortOrder('popular')}>인기순</button>
            </div>
          </div>

          <div className="post-grid">
            {loading ? (
              <div className="empty-state" style={{ gridColumn: '1/-1' }}><b>불러오는 중...</b></div>
            ) : error ? (
              <div className="empty-state" style={{ gridColumn: '1/-1' }}><b>목록을 불러오지 못했어요</b>{error}</div>
            ) : matchedPosts.length === 0 ? (
              <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                <b>조건에 맞는 게시글이 아직 없어요</b>
                다른 검색어나 필터를 사용해보세요.
              </div>
            ) : (
              matchedPosts.map((post) => <PostCard post={post} key={post.id} />)
            )}
          </div>

          {hasNext && (
            <button className="load-more-btn" onClick={handleLoadMore} disabled={loadingMore}>
              {loadingMore ? '불러오는 중...' : '더보기 →'}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
