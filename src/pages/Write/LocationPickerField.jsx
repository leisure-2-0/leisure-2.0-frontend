import { useState } from 'react';
import { Map, MapMarker, useKakaoLoader } from 'react-kakao-maps-sdk';
import Modal from '../../components/Modal/Modal.jsx';
import { KAKAO_APP_KEY, KAKAO_LOADER_OPTIONS } from '../../lib/kakaoLoader.js';

const DEFAULT_CENTER = { lat: 36.5, lng: 127.8 };

export default function LocationPickerField({ location, onChange }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addressInput, setAddressInput] = useState('');
  const [searchError, setSearchError] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, loadError] = useKakaoLoader(KAKAO_LOADER_OPTIONS);

  const isKeyMissing = !KAKAO_APP_KEY;

  // 장소명(상호명)까지 채우기 위해 주소 대신 카카오 장소(키워드) 검색을 사용 — 결과에 place_name이 같이 옴
  const handlePlaceSearch = () => {
    const query = addressInput.trim();
    if (!query || !window.kakao) return;
    setSearchError('');
    setSearchResults([]);
    const places = new window.kakao.maps.services.Places();
    places.keywordSearch(query, (results, status) => {
      if (status === window.kakao.maps.services.Status.OK && results.length) {
        setSearchResults(results);
      } else {
        setSearchError('장소를 찾지 못했어요. 다른 표현으로 시도해보세요.');
      }
    });
  };

  // 장소 검색 결과엔 행정구역명이 없어서, 선택한 좌표를 역지오코딩해 region을 채운다
  const selectSearchResult = (result) => {
    const lat = parseFloat(result.y);
    const lng = parseFloat(result.x);
    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.coord2Address(lng, lat, (geoResult, geoStatus) => {
      const found = geoStatus === window.kakao.maps.services.Status.OK && geoResult[0];
      const region = found ? geoResult[0].address?.region_2depth_name || null : null;
      onChange({
        lat,
        lng,
        address: result.road_address_name || result.address_name,
        placeName: result.place_name,
        region,
      });
    });
    setSearchResults([]);
    setAddressInput('');
  };

  const handleMapClick = (_map, mouseEvent) => {
    if (!window.kakao) return;
    setSearchResults([]);
    const latlng = mouseEvent.latLng;
    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result, status) => {
      const found = status === window.kakao.maps.services.Status.OK && result[0];
      const address = found ? result[0].road_address?.address_name || result[0].address?.address_name || '' : '';
      const region = found ? result[0].address?.region_2depth_name || null : null;
      onChange({ lat: latlng.getLat(), lng: latlng.getLng(), address, placeName: null, region });
    });
  };

  const renderMapArea = (height, { interactive } = { interactive: false }) => {
    if (isKeyMissing) return <div className="map-status-overlay">카카오맵 API 키가 설정되지 않았어요.</div>;
    if (loadError) return <div className="map-status-overlay">지도를 불러오지 못했어요.</div>;
    if (loading) return <div className="map-status-overlay">지도를 불러오는 중...</div>;
    return (
      <Map
        center={location ?? DEFAULT_CENTER}
        level={location ? 4 : 13}
        style={{ width: '100%', height }}
        draggable={interactive}
        zoomable={interactive}
        onClick={interactive ? handleMapClick : undefined}
      >
        {location && <MapMarker position={location} />}
      </Map>
    );
  };

  const addressLabel = location
    ? [location.placeName, location.address].filter(Boolean).join(' · ') ||
      `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
    : null;

  const closeModal = () => {
    setIsModalOpen(false);
    setSearchResults([]);
    setSearchError('');
    setAddressInput('');
  };

  return (
    <div className="location-field auth-field">
      <span>위치</span>

      <button type="button" className="location-preview" onClick={() => setIsModalOpen(true)}>
        <div className="location-preview-map">{renderMapArea('100%')}</div>
        <span className="location-preview-hint">클릭해서 {location ? '위치 변경' : '위치 설정'}</span>
      </button>

      {addressLabel && <p className="location-address">📍 {addressLabel}</p>}

      <Modal isOpen={isModalOpen} onClose={closeModal} title="위치 선택">
        <div className="location-search">
          <input
            type="text"
            placeholder="장소나 주소를 입력해보세요 (예: 메가커피 강남점)"
            autoFocus
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              e.preventDefault();
              handlePlaceSearch();
            }}
          />
          <button type="button" className="account-edit-btn" onClick={handlePlaceSearch}>검색</button>
        </div>
        {searchError && <p className="auth-field-error">{searchError}</p>}

        {searchResults.length > 0 && (
          <ul className="location-search-results">
            {searchResults.map((result) => (
              <li key={result.id}>
                <button type="button" onClick={() => selectSearchResult(result)}>
                  <span className="location-search-result-name">{result.place_name}</span>
                  <span className="location-search-result-address">{result.road_address_name || result.address_name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="location-modal-map">{renderMapArea('420px', { interactive: true })}</div>

        {addressLabel && <p className="location-address">📍 {addressLabel}</p>}

        <div className="location-modal-actions">
          <button type="button" className="auth-submit" onClick={closeModal}>완료</button>
        </div>
      </Modal>
    </div>
  );
}
