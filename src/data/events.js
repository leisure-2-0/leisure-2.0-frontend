export const EVENTS = {
  '2026-08-01': [{ title: '여수 밤바다 불꽃축제', region: '여수', category: '축제', time: '19:00~21:00', description: '이순신광장 일대에서 열리는 여름밤 불꽃쇼' }],
  '2026-08-08': [{ title: '강릉 커피&재즈 페스티벌 1일차', region: '강릉', category: '축제', time: '11:00~20:00', description: '강릉 커피거리 로컬 카페 컬래버 부스 운영' }],
  '2026-08-09': [{ title: '강릉 커피&재즈 페스티벌 2일차', region: '강릉', category: '축제', time: '11:00~21:00', description: '야간 재즈 공연과 로컬 로스터리 마켓' }],
  '2026-08-15': [{ title: '담양 대나무 빛초롱 축제 1일차', region: '담양', category: '축제', time: '18:00~22:00', description: '대나무숲 산책로를 따라 조성된 야간 조명 전시' }],
  '2026-08-16': [{ title: '담양 대나무 빛초롱 축제 2일차', region: '담양', category: '축제', time: '18:00~22:00', description: '지역 공방 작가들의 대나무 공예 체험 부스' }],
  '2026-08-19': [
    { title: '전주 한옥마을 야시장', region: '전주', category: '행사', time: '18:00~23:00', description: '한옥마을 골목을 따라 열리는 야간 프리마켓' },
    { title: '속초 해변 요가 클래스', region: '속초', category: '계절', time: '07:00~08:00', description: '아바이마을 해변에서 열리는 무료 아침 요가' },
    { title: '군산 근대골목 사진전', region: '군산', category: '행사', time: '10:00~18:00', description: '지역 작가들의 근대골목 사진 전시' },
    { title: '여수 밤바다 버스킹', region: '여수', category: '행사', time: '19:00~21:00', description: '이순신광장 주변 로컬 뮤지션 버스킹' },
    { title: '정선 5일장 나들이', region: '정선', category: '행사', time: '09:00~17:00', description: '정선 재래시장 전통 5일장 구경' },
  ],
  '2026-08-22': [{ title: '통영 한산대첩문화제 1일차', region: '통영', category: '축제', time: '10:00~21:00', description: '수상 퍼레이드와 동피랑 골목 장터' }],
  '2026-08-23': [{ title: '통영 한산대첩문화제 2일차', region: '통영', category: '축제', time: '10:00~21:00', description: '전통 뱃노래 공연과 야시장' }],
  '2026-08-24': [{ title: '통영 한산대첩문화제 3일차', region: '통영', category: '축제', time: '10:00~20:00', description: '폐막 불꽃놀이 및 지역 상인 감사 마켓' }],
  '2026-08-29': [{ title: '속초 설악문화제 프리이벤트', region: '속초', category: '행사', time: '14:00~19:00', description: '설악문화제 개막을 앞둔 로컬 마켓 사전 행사' }],
};

export function pad(number) {
  return number < 10 ? '0' + number : '' + number;
}

export function todayStr() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function defaultDateFor(calendarYear, calendarMonth) {
  const today = todayStr();
  const monthPrefix = `${calendarYear}-${pad(calendarMonth + 1)}`;
  return today.startsWith(monthPrefix) ? today : `${monthPrefix}-01`;
}
