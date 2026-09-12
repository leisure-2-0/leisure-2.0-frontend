import { useEffect, useState } from 'react';
import { useCalendar } from '../../context/calendar-context.js';
import { defaultDateFor } from '../../data/events.js';
import * as festivalsApi from '../../api/festivals.js';
import CalendarGrid from './CalendarGrid.jsx';
import DayDetail from './DayDetail.jsx';
import TopFestivalList from './TopFestivalList.jsx';
import './CalendarPage.css';

const CALENDAR_FILTERS = [
  { category: 'all', label: '전체' },
  ...festivalsApi.CALENDAR_CATEGORIES.map((category) => ({ category, label: category })),
];

export default function CalendarPage() {
  const { calYear, calMonth, selectedDate, setSelectedDate, goPrevMonth, goNextMonth } = useCalendar();
  const [selectedFilterCategory, setSelectedFilterCategory] = useState('all');

  const effectiveDate = selectedDate ?? defaultDateFor(calYear, calMonth);
  const backendCategory = festivalsApi.toBackendCategory(selectedFilterCategory);

  // 월(연/월/카테고리) 조합별로 캐싱한다. 캐시가 없으면 로딩 중.
  const [monthCache, setMonthCache] = useState({});
  const monthKey = `${calYear}-${calMonth}-${selectedFilterCategory}`;
  const monthEntry = monthCache[monthKey];
  const eventsByDate = monthEntry ? festivalsApi.buildDayEventsMap(monthEntry, calYear, calMonth) : {};
  const monthLoading = !monthEntry;

  useEffect(() => {
    if (monthCache[monthKey]) return;
    let cancelled = false;
    // 월별 응답엔 카테고리가 없어 색상 구분을 못 하므로, 카테고리별로 나눠 요청해 직접 태그를 붙인다.
    const categoriesToFetch = backendCategory ? [backendCategory] : festivalsApi.BACKEND_CATEGORIES;
    Promise.all(
      categoriesToFetch.map((category) =>
        festivalsApi
          .getMonthlyFestivals({ year: calYear, month: calMonth + 1, category })
          .then((data) => data.map((f) => ({ ...f, category })))
      )
    )
      .then((results) => {
        if (!cancelled) setMonthCache((prev) => ({ ...prev, [monthKey]: results.flat() }));
      })
      .catch(() => {
        if (!cancelled) setMonthCache((prev) => ({ ...prev, [monthKey]: [] }));
      });
    return () => {
      cancelled = true;
    };
  }, [monthKey, calYear, calMonth, backendCategory, monthCache]);

  // 날짜(일자/카테고리) 조합별로 캐싱한다.
  const [dayCache, setDayCache] = useState({});
  const dayKey = `${effectiveDate}-${selectedFilterCategory}`;
  const dayEntry = dayCache[dayKey];
  const detailEvents = dayEntry
    ? dayEntry.map((d) => ({
        title: d.name,
        category: festivalsApi.fromBackendCategory(d.category),
        region: d.signguName,
        time: d.eventTime,
        description: d.overview,
        homepageUrl: d.homepageUrl,
      }))
    : [];
  const dayLoading = !dayEntry;

  useEffect(() => {
    if (dayCache[dayKey]) return;
    let cancelled = false;
    festivalsApi
      .getDailyFestivals({ date: effectiveDate, category: backendCategory })
      .then((data) => {
        if (!cancelled) setDayCache((prev) => ({ ...prev, [dayKey]: data }));
      })
      .catch(() => {
        if (!cancelled) setDayCache((prev) => ({ ...prev, [dayKey]: [] }));
      });
    return () => {
      cancelled = true;
    };
  }, [dayKey, effectiveDate, backendCategory, dayCache]);

  return (
    <section id="page-calendar" className="page">
      <div className="eyebrow" style={{ marginTop: 26 }}>축제 캘린더 — 전국 소도시 일정</div>
      <div className="cal-topbar">
        <div className="cal-filters">
          {CALENDAR_FILTERS.map((filterOption) => (
            <button
              key={filterOption.category}
              className={'chip' + (selectedFilterCategory === filterOption.category ? ' active' : '')}
              onClick={() => setSelectedFilterCategory(filterOption.category)}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
        <div className="month-nav">
          <button onClick={goPrevMonth}>‹</button>
          <span className="mono">{calYear}년 {calMonth + 1}월</span>
          <button onClick={goNextMonth}>›</button>
        </div>
      </div>

      <div className="cal-grid-wrap">
        <CalendarGrid
          calYear={calYear}
          calMonth={calMonth}
          selectedDate={effectiveDate}
          onSelectDate={setSelectedDate}
          eventsByDate={monthLoading ? {} : eventsByDate}
        />
        <TopFestivalList />
      </div>

      <DayDetail key={dayKey} selectedDate={effectiveDate} events={detailEvents} loading={dayLoading} />
    </section>
  );
}
