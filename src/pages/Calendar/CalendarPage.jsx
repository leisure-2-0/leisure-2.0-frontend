import { useState } from 'react';
import { useCalendar } from '../../context/calendar-context.js';
import { EVENTS, defaultDateFor } from '../../data/events.js';
import CalendarGrid from './CalendarGrid.jsx';
import DayDetail from './DayDetail.jsx';
import TopFestivalList from './TopFestivalList.jsx';
import './CalendarPage.css';

const CALENDAR_FILTERS = [
  { category: 'all', label: '전체' },
  { category: '축제', label: '축제' },
  { category: '행사', label: '행사 / 마켓' },
  { category: '계절', label: '계절 이벤트' },
];

export default function CalendarPage() {
  const { calYear, calMonth, selectedDate, setSelectedDate, goPrevMonth, goNextMonth } = useCalendar();
  const [selectedFilterCategory, setSelectedFilterCategory] = useState('all');

  const effectiveDate = selectedDate ?? defaultDateFor(calYear, calMonth);
  const detailEvents = EVENTS[effectiveDate] || [];

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
        />
        <TopFestivalList />
      </div>

      <DayDetail selectedDate={effectiveDate} events={detailEvents} />
    </section>
  );
}
