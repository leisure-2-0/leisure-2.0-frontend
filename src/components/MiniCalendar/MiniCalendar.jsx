import { useNavigate } from 'react-router-dom';
import { useCalendar } from '../../context/calendar-context.js';
import { EVENTS, pad, todayStr } from '../../data/events.js';
import './MiniCalendar.css';

export default function MiniCalendar({ panelRef }) {
  const navigate = useNavigate();
  const { calYear, calMonth, setSelectedDate } = useCalendar();

  const firstWeekday = new Date(calYear, calMonth, 1).getDay();
  const totalDays = new Date(calYear, calMonth + 1, 0).getDate();
  const today = todayStr();

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
          const hasEvent = !!EVENTS[dateString];
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
