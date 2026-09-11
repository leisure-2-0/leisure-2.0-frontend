import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map as KakaoMap, MapMarker, CustomOverlayMap, useKakaoLoader } from 'react-kakao-maps-sdk';
import { KAKAO_APP_KEY, KAKAO_LOADER_OPTIONS } from '../../lib/kakaoLoader.js';
import { CATEGORY_ICONS } from '../../data/posts.js';
import * as mapApi from '../../api/map.js';
import * as postsApi from '../../api/posts.js';
import './PostMapView.css';

// 미리보기 카드 폭 계산에 맞춰 해시태그를 몇 개까지 보여줄지 판단하는 데 쓴다 (PostMapView.css의 .map-post-preview와 값을 맞출 것).
const PREVIEW_CARD_WIDTH = 250;
const PREVIEW_CARD_PADDING = 28; // 14px * 2
const CHIP_PADDING = 16; // .tag { padding: 2px 8px } → 좌우 8px씩
const CHIP_GAP = 4;
const TAG_FONT = "11.5px 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif";

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function openPostInNewTab(postId) {
  window.open(`/post/${postId}`, '_blank', 'noopener,noreferrer');
}

// 좌표를 소수점 4자리(약 11m)로 반올림해서 "같은 장소"로 묶는다.
function groupPinsByLocation(pins) {
  const groups = new Map();
  for (const pin of pins) {
    const key = `${pin.latitude.toFixed(4)},${pin.longitude.toFixed(4)}`;
    if (!groups.has(key)) {
      groups.set(key, { key, lat: pin.latitude, lng: pin.longitude, pins: [] });
    }
    groups.get(key).pins.push(pin);
  }
  return [...groups.values()];
}

let measureCtx = null;
function measureChipWidth(text) {
  if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d');
  measureCtx.font = TAG_FONT;
  return measureCtx.measureText(text).width + CHIP_PADDING;
}

// 카테고리 배지 옆에 해시태그를 최대 2개까지 붙이되, 실제 렌더링 폭을 캔버스로 측정해서
// 카드 폭을 넘어설 해시태그는 잘려 보이는 대신 아예 표시하지 않는다.
function pickFittingTags(tags, categoryChipText) {
  const contentWidth = PREVIEW_CARD_WIDTH - PREVIEW_CARD_PADDING;
  let remaining = contentWidth - measureChipWidth(categoryChipText) - CHIP_GAP - 4; // 여백 약간 확보
  const shown = [];
  for (const tag of (tags || []).slice(0, 2)) {
    const text = `#${tag}`;
    const width = measureChipWidth(text) + (shown.length > 0 ? CHIP_GAP : 0);
    if (width > remaining) break;
    shown.push(text);
    remaining -= width;
  }
  return shown;
}

// 지역 집계 핀 ↔ 개별/클러스터 게시글 핀을 오가는 인터랙티브 카카오맵.
// 홈 미니맵과 /map 전체 화면 지도가 이 컴포넌트 하나를 그대로 공유한다.
export default function PostMapView({ center, level = 11 }) {
  const navigate = useNavigate();
  const [loading, loadError] = useKakaoLoader(KAKAO_LOADER_OPTIONS);

  const [regionPins, setRegionPins] = useState([]);
  const [bounds, setBounds] = useState(null);
  const [postPins, setPostPins] = useState([]);

  // 지도 위에서 클릭한 게시글 핀의 미리보기 팝업 상태
  const [selectedPin, setSelectedPin] = useState(null);
  const [previewCache, setPreviewCache] = useState({});
  // 같은 위치에 여러 게시글이 겹칠 때 클릭한 숫자 핀의 목록 패널 상태
  const [selectedCluster, setSelectedCluster] = useState(null);

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

  // 미리보기 팝업을 연 게시글의 상세 정보를 postId별로 캐싱해서 불러온다.
  useEffect(() => {
    if (!selectedPin || previewCache[selectedPin.postId]) return;
    const postId = selectedPin.postId;
    let cancelled = false;
    postsApi
      .getPostDetail(postId)
      .then((data) => {
        if (!cancelled) setPreviewCache((prev) => ({ ...prev, [postId]: { data, error: false } }));
      })
      .catch(() => {
        if (!cancelled) setPreviewCache((prev) => ({ ...prev, [postId]: { data: null, error: true } }));
      });
    return () => {
      cancelled = true;
    };
  }, [selectedPin, previewCache]);

  const handleBoundsSettled = (map) => {
    const b = map.getBounds();
    const sw = b.getSouthWest();
    const ne = b.getNorthEast();
    setBounds({ minLat: sw.getLat(), maxLat: ne.getLat(), minLng: sw.getLng(), maxLng: ne.getLng() });
  };

  const handleRegionPinClick = (region) => {
    navigate(`/search?q=${encodeURIComponent(region)}`);
  };

  const handlePostPinClick = (pin) => {
    setSelectedCluster(null);
    setSelectedPin((prev) => (prev?.postId === pin.postId ? null : pin));
  };

  const handleClusterPinClick = (group) => {
    setSelectedPin(null);
    setSelectedCluster((prev) => (prev?.key === group.key ? null : group));
  };

  const closeAllOverlays = () => {
    setSelectedPin(null);
    setSelectedCluster(null);
  };

  const previewEntry = selectedPin ? previewCache[selectedPin.postId] : null;
  const groupedPostPins = useMemo(() => groupPinsByLocation(postPins), [postPins]);

  if (isKeyMissing) {
    return (
      <div className="map-status-overlay">
        <b>카카오맵 API 키가 설정되지 않았어요</b>
        프로젝트 루트에 .env 파일을 만들고 VITE_KAKAO_MAP_KEY 값을 넣어주세요. (.env.example 참고)
      </div>
    );
  }
  if (loadError) {
    return (
      <div className="map-status-overlay">
        <b>지도를 불러오지 못했어요</b>
        카카오 개발자 콘솔 &gt; 내 애플리케이션 &gt; 플랫폼에 이 도메인이 등록돼 있는지 확인해주세요. 자세한 원인은 브라우저 콘솔을 확인해주세요.
      </div>
    );
  }
  if (loading) {
    return <div className="map-status-overlay">지도를 불러오는 중...</div>;
  }

  return (
    <>
      <KakaoMap
        center={center}
        level={level}
        style={{ width: '100%', height: '100%' }}
        onCreate={handleBoundsSettled}
        onIdle={handleBoundsSettled}
        onClick={closeAllOverlays}
      >
        {!isCityLevel && regionPins.map((pin) => (
          <CustomOverlayMap key={pin.region} position={{ lat: pin.centerLat, lng: pin.centerLng }} yAnchor={1} clickable>
            <button type="button" className="map-region-pin" onClick={() => handleRegionPinClick(pin.region)}>
              <span className="map-region-pin-dot"></span>
              <span className="map-region-pin-label">{pin.region} {pin.postCount}</span>
            </button>
          </CustomOverlayMap>
        ))}

        {isCityLevel && groupedPostPins.map((group) => (
          group.pins.length === 1 ? (
            <MapMarker
              key={group.key}
              position={{ lat: group.lat, lng: group.lng }}
              title={group.pins[0].title}
              onClick={() => handlePostPinClick(group.pins[0])}
            />
          ) : (
            <CustomOverlayMap key={group.key} position={{ lat: group.lat, lng: group.lng }} yAnchor={1} zIndex={10} clickable>
              <button type="button" className="map-cluster-pin" onClick={() => handleClusterPinClick(group)}>
                {group.pins.length}
              </button>
            </CustomOverlayMap>
          )
        ))}

        {selectedPin && (
          <CustomOverlayMap
            position={{ lat: selectedPin.latitude, lng: selectedPin.longitude }}
            yAnchor={1.3}
            zIndex={20}
            clickable
          >
            <div className="map-post-preview">
              <button
                type="button"
                className="map-post-preview-close"
                onClick={() => setSelectedPin(null)}
                aria-label="닫기"
              >
                ×
              </button>

              {!previewEntry ? (
                <p className="map-post-preview-status">불러오는 중...</p>
              ) : previewEntry.error ? (
                <p className="map-post-preview-status">불러오지 못했어요</p>
              ) : (
                (() => {
                  const categoryLabel = postsApi.fromBackendCategory(previewEntry.data.category);
                  const categoryIcon = CATEGORY_ICONS[categoryLabel] || '✨';
                  const categoryChipText = `${categoryIcon} ${categoryLabel}`;
                  const visibleTags = pickFittingTags(previewEntry.data.tags, categoryChipText);
                  return (
                    <>
                      <div className="map-post-preview-head">
                        <span className="tag cat-chip">{categoryChipText}</span>
                        {visibleTags.length > 0 && (
                          <div className="map-post-preview-tags">
                            {visibleTags.map((t) => <span className="tag" key={t}>{t}</span>)}
                          </div>
                        )}
                      </div>
                      <h5 className="map-post-preview-title">{previewEntry.data.title}</h5>
                      <p className="map-post-preview-meta">
                        {previewEntry.data.location?.region} · 좋아요 {previewEntry.data.likeCount} · 조회 {previewEntry.data.viewCount}
                      </p>
                      <p className="map-post-preview-excerpt">{stripHtml(previewEntry.data.content).slice(0, 70)}...</p>
                      <button
                        type="button"
                        className="map-post-preview-more"
                        onClick={() => openPostInNewTab(selectedPin.postId)}
                      >
                        게시글 보기 →
                      </button>
                    </>
                  );
                })()
              )}
            </div>
          </CustomOverlayMap>
        )}
      </KakaoMap>

      {selectedCluster && (
        <div className="map-cluster-panel">
          <div className="map-cluster-panel-head">
            <h4>이 위치의 게시글 {selectedCluster.pins.length}개</h4>
            <button type="button" onClick={() => setSelectedCluster(null)} aria-label="닫기">×</button>
          </div>
          <div className="map-cluster-panel-list">
            {selectedCluster.pins.map((pin) => {
              const categoryLabel = postsApi.fromBackendCategory(pin.category);
              return (
                <button
                  key={pin.postId}
                  type="button"
                  className="map-cluster-panel-item"
                  onClick={() => openPostInNewTab(pin.postId)}
                >
                  <span className="tag cat-chip">{CATEGORY_ICONS[categoryLabel] || '✨'} {categoryLabel}</span>
                  <span className="map-cluster-panel-item-title">{pin.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
