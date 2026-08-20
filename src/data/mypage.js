import { POSTS } from './posts.js';

// mock slices standing in for "posts I wrote / bookmarked / liked" until there's a real backend to ask.
export const MY_POSTS = [POSTS[0], POSTS[7], POSTS[9]];
export const MY_BOOKMARKS = [POSTS[3], POSTS[5], POSTS[10], POSTS[12]];
export const MY_LIKES = [POSTS[1], POSTS[4], POSTS[6], POSTS[8], POSTS[11]];

// mock points-earning log for the account tab's history panel.
export const POINT_HISTORY = [
  { label: '강릉 로컬 카페 리뷰 작성', points: 20, date: '2026-08-16' },
  { label: '여수 밤바다 카약 체험 방문인증', points: 30, date: '2026-08-14' },
  { label: '출석 체크', points: 5, date: '2026-08-12' },
  { label: '친구 초대 완료', points: 50, date: '2026-08-09' },
  { label: '통영 노을 명당 골목 방문인증', points: 20, date: '2026-08-05' },
  { label: '속초 독채 숙소 리뷰 작성', points: 25, date: '2026-08-03' },
  { label: '출석 체크', points: 5, date: '2026-08-02' },
  { label: '전주 한옥마을 게시글 방문인증', points: 20, date: '2026-07-29' },
  { label: '담양 빛초롱 축제 후기 작성', points: 25, date: '2026-07-26' },
  { label: '출석 체크', points: 5, date: '2026-07-22' },
];
