import { apiClient } from './client.js';
import { pad } from '../data/events.js';

export function getMonthlyFestivals({ year, month, category }) {
  return apiClient.get('/festivals/months', { params: { year, month, category } }).then((res) => res.data.data);
}

export function getDailyFestivals({ date, category }) {
  return apiClient.get('/festivals/days', { params: { date, category } }).then((res) => res.data.data);
}

export function getUpcomingFestivals() {
  return apiClient.get('/festivals/upcoming').then((res) => res.data.data);
}

const CATEGORY_LABELS = { FESTIVAL: '축제', PERFORMANCE: '공연', EVENT: '행사' };
const KOREAN_TO_CATEGORY = { 축제: 'FESTIVAL', 공연: 'PERFORMANCE', 행사: 'EVENT' };

export function fromBackendCategory(enumValue) {
  return CATEGORY_LABELS[enumValue] || enumValue;
}

export function toBackendCategory(koreanLabel) {
  return KOREAN_TO_CATEGORY[koreanLabel];
}

export const CALENDAR_CATEGORIES = Object.keys(KOREAN_TO_CATEGORY);
export const BACKEND_CATEGORIES = Object.values(KOREAN_TO_CATEGORY);

function parseISODate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// 월별 응답은 (festivalId, name, eventTime, 시작일~종료일) 형태라, 달력 칸마다 표시하려면
// 기간을 이번 달 범위로 잘라 날짜별로 펼쳐야 한다. 카테고리는 이 응답에 없어 색상 구분은 못 한다.
export function buildDayEventsMap(festivals, year, month) {
  const map = {};
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);

  festivals.forEach((f) => {
    const start = parseISODate(f.eventStartDate);
    const end = f.eventEndDate ? parseISODate(f.eventEndDate) : start;
    const from = start < monthStart ? monthStart : start;
    const to = end > monthEnd ? monthEnd : end;

    for (const d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      const key = formatDate(d);
      if (!map[key]) map[key] = [];
      map[key].push({ title: f.name, time: f.eventTime, festivalId: f.festivalId, category: f.category });
    }
  });

  return map;
}
