import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, MapMarker, CustomOverlayMap, useKakaoLoader } from 'react-kakao-maps-sdk';
import { KAKAO_APP_KEY, KAKAO_LOADER_OPTIONS } from '../../lib/kakaoLoader.js';
import * as mapApi from '../../api/map.js';
import './MapPage.css';

const SOUTH_KOREA_CENTER = { lat: 36.5, lng: 127.8 };

export default function MapPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, loadError] = useKakaoLoader(KAKAO_LOADER_OPTIONS);

  const [regionPins, setRegionPins] = useState([]);
  const [bounds, setBounds] = useState(null);
  const [postPins, setPostPins] = useState([]);

  const isKeyMissing = !KAKAO_APP_KEY;

  // 지역별 집계 핀은 화면 범위와 무관하게 항상 유효해서 한 번만 불러온다.
  useEffect(() => {
    let cancelled = false;
    mapApi.getRegionPinCounts().then((data) => {
      if (!cancelled) setRegionPins(data);
    }).catch(() => {
      // 실패해도 지도 자체는 계속 쓸 수 있게 조용히 넘어간다.
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const latSpan = bounds ? bounds.maxLat - bounds.minLat : Infinity;
  const lngSpan = bounds ? bounds.maxLng - bounds.minLng : Infinity;
  const isCityLevel = latSpan <= mapApi.MAX_PIN_QUERY_SPAN && lngSpan <= mapApi.MAX_PIN_QUERY_SPAN;

  // 시 단위로 충분히 확대됐을 때만 개별 게시글 핀을 불러온다(그보다 넓으면 백엔드가 400을 반환).
  useEffect(() => {
    if (!bounds || !isCityLevel) return;
    let cancelled = false;
    mapApi.getPostPins(bounds).then((data) => {
      if (!cancelled) setPostPins(data);
    }).catch(() => {
      // 조회 실패는 조용히 무시 — 다음 idle에서 재시도된다.
    });
    return () => {
      cancelled = true;
    };
  }, [bounds, isCityLevel]);

  const handleBoundsSettled = (map) => {
    const b = map.getBounds();
    const sw = b.getSouthWest();
    const ne = b.getNorthEast();
    setBounds({ minLat: sw.getLat(), maxLat: ne.getLat(), minLng: sw.getLng(), maxLng: ne.getLng() });
  };

  const handleRegionPinClick = (region) => {
    navigate(`/search?q=${encodeURIComponent(region)}`);
  };

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
          <Map
            center={SOUTH_KOREA_CENTER}
            level={13}
            style={{ width: '100%', height: '100%' }}
            onCreate={handleBoundsSettled}
            onIdle={handleBoundsSettled}
          >
            {!isCityLevel && regionPins.map((pin) => (
              <CustomOverlayMap key={pin.region} position={{ lat: pin.centerLat, lng: pin.centerLng }} yAnchor={1}>
                <button type="button" className="map-region-pin" onClick={() => handleRegionPinClick(pin.region)}>
                  <span className="map-region-pin-dot"></span>
                  <span className="map-region-pin-label">{pin.region} {pin.postCount}</span>
                </button>
              </CustomOverlayMap>
            ))}

            {isCityLevel && postPins.map((pin) => (
              <MapMarker
                key={pin.postId}
                position={{ lat: pin.latitude, lng: pin.longitude }}
                title={pin.title}
                onClick={() => navigate(`/post/${pin.postId}`)}
              />
            ))}
          </Map>
        )}
      </div>
    </section>
  );
}
