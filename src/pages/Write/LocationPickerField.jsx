import { useState } from 'react';
import { Map, MapMarker, useKakaoLoader } from 'react-kakao-maps-sdk';
import Modal from '../../components/Modal/Modal.jsx';
import { KAKAO_APP_KEY, KAKAO_LOADER_OPTIONS } from '../../lib/kakaoLoader.js';

const DEFAULT_CENTER = { lat: 36.5, lng: 127.8 };

export default function LocationPickerField({ location, onChange }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addressInput, setAddressInput] = useState('');
  const [searchError, setSearchError] = useState('');
  const [loading, loadError] = useKakaoLoader(KAKAO_LOADER_OPTIONS);

  const isKeyMissing = !KAKAO_APP_KEY;

  const handleAddressSearch = () => {
    const query = addressInput.trim();
    if (!query || !window.kakao) return;
    setSearchError('');
    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.addressSearch(query, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK && result[0]) {
        onChange({ lat: parseFloat(result[0].y), lng: parseFloat(result[0].x), address: result[0].address_name });
      } else {
        setSearchError('주소를 찾지 못했어요. 다른 표현으로 시도해보세요.');
      }
    });
  };

  const handleMapClick = (_map, mouseEvent) => {
    if (!window.kakao) return;
    const latlng = mouseEvent.latLng;
    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result, status) => {
      const address =
        status === window.kakao.maps.services.Status.OK && result[0]
          ? result[0].road_address?.address_name || result[0].address?.address_name || ''
          : '';
      onChange({ lat: latlng.getLat(), lng: latlng.getLng(), address });
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
    ? location.address || `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
    : null;

  return (
    <div className="location-field auth-field">
      <span>위치</span>

      <button type="button" className="location-preview" onClick={() => setIsModalOpen(true)}>
        <div className="location-preview-map">{renderMapArea('100%')}</div>
        <span className="location-preview-hint">클릭해서 {location ? '위치 변경' : '위치 설정'}</span>
      </button>

      {addressLabel && <p className="location-address">📍 {addressLabel}</p>}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="위치 선택">
        <div className="location-search">
          <input
            type="text"
            placeholder="주소를 입력해보세요 (예: 강릉시 안목해변길 12)"
            autoFocus
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              e.preventDefault();
              handleAddressSearch();
            }}
          />
          <button type="button" className="account-edit-btn" onClick={handleAddressSearch}>검색</button>
        </div>
        {searchError && <p className="auth-field-error">{searchError}</p>}

        <div className="location-modal-map">{renderMapArea('420px', { interactive: true })}</div>

        {addressLabel && <p className="location-address">📍 {addressLabel}</p>}

        <div className="location-modal-actions">
          <button type="button" className="auth-submit" onClick={() => setIsModalOpen(false)}>완료</button>
        </div>
      </Modal>
    </div>
  );
}
