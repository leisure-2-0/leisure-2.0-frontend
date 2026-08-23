import { useState } from 'react';
import { Map, useKakaoLoader } from 'react-kakao-maps-sdk';
import { KAKAO_APP_KEY, KAKAO_LOADER_OPTIONS } from '../../lib/kakaoLoader.js';
import './MapPage.css';

const SOUTH_KOREA_CENTER = { lat: 36.5, lng: 127.8 };

export default function MapPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, loadError] = useKakaoLoader(KAKAO_LOADER_OPTIONS);

  const isKeyMissing = !KAKAO_APP_KEY;

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

        {isKeyMissing ? (
          <div className="map-status-overlay">
            <b>카카오맵 API 키가 설정되지 않았어요</b>
            프로젝트 루트에 .env 파일을 만들고 VITE_KAKAO_MAP_KEY 값을 넣어주세요. (.env.example 참고)
          </div>
        ) : loadError ? (
          <div className="map-status-overlay">
            <b>지도를 불러오지 못했어요</b>
            카카오 개발자 콘솔 &gt; 내 애플리케이션 &gt; 플랫폼에 이 도메인이 등록돼 있는지 확인해주세요. 자세한 원인은 브라우저 콘솔을 확인해주세요.
          </div>
        ) : loading ? (
          <div className="map-status-overlay">지도를 불러오는 중...</div>
        ) : (
          <Map center={SOUTH_KOREA_CENTER} level={13} style={{ width: '100%', height: '100%' }} />
        )}
      </div>
    </section>
  );
}
