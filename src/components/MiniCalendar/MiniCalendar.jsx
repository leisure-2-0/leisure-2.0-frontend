import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCalendar } from '../../context/calendar-context.js';
import { pad, todayStr } from '../../data/events.js';
import * as festivalsApi from '../../api/festivals.js';
import './MiniCalendar.css';

export default function MiniCalendar({ panelRef }) {
  const navigate = useNavigate();
  const { calYear, calMonth, setSelectedDate } = useCalendar();

  const firstWeekday = new Date(calYear, calMonth, 1).getDay();
  const totalDays = new Date(calYear, calMonth + 1, 0).getDate();
  const today = todayStr();

  // 이 달의 이벤트 유무만 점으로 표시하면 되므로 카테고리 구분 없이 전체를 불러온다.
  const [monthCache, setMonthCache] = useState({});
  const monthKey = `${calYear}-${calMonth}`;
  const eventDates = monthCache[monthKey]
    ? new Set(Object.keys(festivalsApi.buildDayEventsMap(monthCache[monthKey], calYear, calMonth)))
    : new Set();

  useEffect(() => {
    if (monthCache[monthKey]) return;
    let cancelled = false;
    festivalsApi
      .getMonthlyFestivals({ year: calYear, month: calMonth + 1 })
      .then((data) => {
        if (!cancelled) setMonthCache((prev) => ({ ...prev, [monthKey]: data }));
      })
      .catch(() => {
        if (!cancelled) setMonthCache((prev) => ({ ...prev, [monthKey]: [] }));
      });
    return () => {
      cancelled = true;
    };
  }, [monthKey, calYear, calMonth, monthCache]);

  const dayCells = [];
  for (let emptyIndex = 0; emptyIndex < firstWeekday; emptyIndex++) dayCells.push(null);
  for (let dayNumber = 1; dayNumber <= totalDays; dayNumber++) dayCells.push(dayNumber);

  const handleDayClick = (dayNumber) => {
    const dateString = `${calYear}-${pad(calMonth + 1)}-${pad(dayNumber)}`;
    setSelectedDate(dateString);
    navigate('/calendar');
  };

  return (
    <div className="panel side-block" ref={panelRef}>
      <div className="mini-cal-head">
        <b>{calMonth + 1}월</b>
        <button className="mini-cal-link" onClick={() => navigate('/calendar')}>전체보기 →</button>
      </div>
      <div className="mini-cal-weekdays">
        <span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span>
      </div>
      <div className="mini-cal-days">
        {dayCells.map((dayNumber, index) => {
          if (dayNumber === null) return <div className="mini-cal-day empty" key={`empty-${index}`}></div>;
          const dateString = `${calYear}-${pad(calMonth + 1)}-${pad(dayNumber)}`;
          const hasEvent = eventDates.has(dateString);
          const isToday = dateString === today;
          return (
            <div
              className={'mini-cal-day' + (isToday ? ' today' : '')}
              key={dateString}
              onClick={() => handleDayClick(dayNumber)}
            >
              {dayNumber}
              {hasEvent && <span className="dot"></span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
