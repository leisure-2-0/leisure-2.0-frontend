import { useState } from 'react';
import './MapPage.css';

export default function MapPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <section className="page map-page">
      <div className="map-box map-page-canvas">
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
      </div>
    </section>
  );
}
