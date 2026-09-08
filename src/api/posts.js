import { apiClient } from './client.js';

export function getMyPosts({ sort = 'LATEST', page, size } = {}) {
  return apiClient.get('/members/me/posts', { params: { sort, page, size } }).then((res) => res.data.data);
}

export function getMyLikes({ sort = 'LATEST', page, size } = {}) {
  return apiClient.get('/members/me/likes', { params: { sort, page, size } }).then((res) => res.data.data);
}

export function getMyBookmarks({ sort = 'LATEST', page, size } = {}) {
  return apiClient.get('/members/me/bookmarks', { params: { sort, page, size } }).then((res) => res.data.data);
}

export function likePost(postId) {
  return apiClient.post(`/posts/${postId}/likes`).then((res) => res.data.data);
}

export function unlikePost(postId) {
  return apiClient.delete(`/posts/${postId}/likes`).then((res) => res.data.data);
}

export function bookmarkPost(postId) {
  return apiClient.post(`/posts/${postId}/bookmarks`).then((res) => res.data.data);
}

export function unbookmarkPost(postId) {
  return apiClient.delete(`/posts/${postId}/bookmarks`).then((res) => res.data.data);
}

export function getMainFeed({ category, sort = 'LATEST' } = {}) {
  return apiClient.get('/posts/main', { params: { category, sort } }).then((res) => res.data.data);
}

export function getPosts({ category, sort = 'LATEST', cursor, limit } = {}) {
  return apiClient.get('/posts', { params: { category, sort, cursor, limit } }).then((res) => res.data.data);
}

export function getPostDetail(postId) {
  return apiClient.get(`/posts/${postId}`).then((res) => res.data.data);
}

export function startPost() {
  return apiClient.post('/posts').then((res) => res.data.data);
}

export function saveDraft(postId, fields) {
  return apiClient.patch(`/posts/${postId}`, fields).then((res) => res.data.data);
}

export function publishPost(postId, fields) {
  return apiClient.patch(`/posts/${postId}/publish`, fields).then((res) => res.data.data);
}

export function editPost(postId, fields) {
  return apiClient.patch(`/posts/${postId}/content`, fields).then((res) => res.data.data);
}

export function deletePost(postId) {
  return apiClient.delete(`/posts/${postId}`).then((res) => res.data.data);
}

export function getMyDrafts() {
  return apiClient.get('/members/me/drafts').then((res) => res.data.data);
}

export function getMyDraftDetail(postId) {
  return apiClient.get(`/members/me/drafts/${postId}`).then((res) => res.data.data);
}

const CATEGORY_LABELS = {
  RESTAURANT: '식당',
  HOTEL: '숙소',
  ACTIVITY: '액티비티',
  SCENERY: '풍경',
};

// 백엔드 카테고리는 4종(RESTAURANT/HOTEL/ACTIVITY/SCENERY)뿐이라, 홈 화면의 나머지 카테고리
// 버튼(카페/체험/축제/행사/기타)은 매칭되는 백엔드 값이 없어 필터를 걸지 않는다(=전체와 동일하게 동작).
const KOREAN_TO_CATEGORY = {
  식당: 'RESTAURANT',
  숙소: 'HOTEL',
  액티비티: 'ACTIVITY',
  풍경: 'SCENERY',
};

export function toBackendCategory(koreanLabel) {
  return KOREAN_TO_CATEGORY[koreanLabel];
}

export function fromBackendCategory(enumValue) {
  return CATEGORY_LABELS[enumValue];
}

// 글쓰기 화면의 카테고리 선택지는 백엔드가 실제로 저장할 수 있는 값으로 한정한다.
export const WRITABLE_CATEGORIES = Object.keys(KOREAN_TO_CATEGORY);

// 백엔드는 아직 대표이미지를 내려주지 않아 postId 기반으로 플레이스홀더 색상만 정해준다.
export function toCardPost(item) {
  return {
    id: item.postId,
    region: item.region || '',
    category: CATEGORY_LABELS[item.category] || item.category,
    thumbnailVariant: (item.postId % 4) + 1,
    imageSeed: undefined,
    title: item.title,
    tags: (item.tags || []).map((tag) => `#${tag}`),
    views: item.viewCount,
    isLiked: item.isLiked,
    isBookmarked: item.isBookmarked,
    isMine: !!item.isMine,
  };
}
