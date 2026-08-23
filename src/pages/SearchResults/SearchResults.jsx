import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PostCard from '../../components/PostCard/PostCard.jsx';
import { CATEGORY_ICONS, POSTS, REGIONS, filterPosts, sortPosts } from '../../data/posts.js';
import './SearchResults.css';

// derived from the canonical category list so this filter can't drift out of sync with it
const CATEGORY_FILTER_OPTIONS = ['all', ...Object.keys(CATEGORY_ICONS)];

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
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
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [sortOrder, setSortOrder] = useState('latest');

  const applySearchTermToUrl = () => {
    const trimmedSearchTerm = searchTerm.trim();
    setSearchParams(trimmedSearchTerm ? { q: trimmedSearchTerm } : {});
  };

  const matchedPosts = useMemo(() => {
    const filtered = filterPosts(POSTS, { searchTerm, category: selectedCategory, region: selectedRegion });
    return sortPosts(filtered, sortOrder);
  }, [searchTerm, selectedCategory, selectedRegion, sortOrder]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedRegion('all');
  };

  return (
    <section className="page search-page">
      <div className="eyebrow" style={{ marginTop: 26 }}>검색 결과</div>

      <div className="search-page-layout">
        <aside className="search-sidebar">
          <div className="filter-group">
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

          <div className="filter-group">
            <h4>지역</h4>
            <div className="filter-option-list">
              <button
                className={'filter-option' + (selectedRegion === 'all' ? ' active' : '')}
                onClick={() => setSelectedRegion('all')}
              >
                전체
              </button>
              {REGIONS.map((region) => (
                <button
                  key={region}
                  className={'filter-option' + (selectedRegion === region ? ' active' : '')}
                  onClick={() => setSelectedRegion(region)}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          <button className="filter-reset-btn" onClick={resetFilters}>필터 초기화</button>
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
              {searchTerm ? `"${searchTerm}" 검색 결과` : '전체 게시글'}
              <span className="result-count">{matchedPosts.length}개</span>
            </h3>
            <div className="sort-toggle">
              <button className={'sort-opt' + (sortOrder === 'latest' ? ' active' : '')} onClick={() => setSortOrder('latest')}>최신순</button>
              <span className="sort-sep">|</span>
              <button className={'sort-opt' + (sortOrder === 'popular' ? ' active' : '')} onClick={() => setSortOrder('popular')}>인기순</button>
            </div>
          </div>

          <div className="post-grid">
            {matchedPosts.length === 0 ? (
              <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                <b>조건에 맞는 게시글이 아직 없어요</b>
                다른 검색어나 필터를 사용해보세요.
              </div>
            ) : (
              matchedPosts.map((post) => <PostCard post={post} key={post.title} />)
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
