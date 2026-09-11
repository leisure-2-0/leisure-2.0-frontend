import { useEffect, useRef, useState } from 'react';
import PostMapView from '../../components/PostMapView/PostMapView.jsx';
import './MapPage.css';

const SOUTH_KOREA_CENTER = { lat: 36.5, lng: 127.8 };

export default function MapPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // 헤더를 제외한 나머지 화면 전체를 지도가 채우도록 높이를 동기화한다 (네이버 지도 스타일).
  const canvasRef = useRef(null);
  useEffect(() => {
    function syncHeight() {
      const topNav = document.querySelector('.topnav');
      const topNavHeight = topNav ? topNav.offsetHeight : 0;
      if (canvasRef.current) {
        canvasRef.current.style.height = `calc(100vh - ${topNavHeight}px)`;
      }
    }
    syncHeight();
    window.addEventListener('resize', syncHeight);
    return () => window.removeEventListener('resize', syncHeight);
  }, []);

  return (
    <section className="page map-page">
      <div className="map-box map-page-canvas" ref={canvasRef}>
        <div className="map-page-overlay-top">
          <div className="search-page-searchbar map-floating-search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input
              type="text"
              placeholder="지역이나 키워드로 지도에서 찾아보세요"
              autoComplete="off"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <PostMapView center={SOUTH_KOREA_CENTER} level={11} />
      </div>
    </section>
  );
}
