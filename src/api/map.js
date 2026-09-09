import { apiClient } from './client.js';

export function getRegionPinCounts(category) {
  return apiClient.get('/maps/regions', { params: { category } }).then((res) => res.data.data);
}

export function getPostPins({ minLat, maxLat, minLng, maxLng, category }) {
  return apiClient.get('/maps/pins', { params: { minLat, maxLat, minLng, maxLng, category } }).then((res) => res.data.data);
}

// 백엔드가 개별 게시글 핀 조회를 시 단위 화면 정도로 제한한다 — 이보다 넓으면 400.
export const MAX_PIN_QUERY_SPAN = 0.7;
