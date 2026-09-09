import { pad, todayStr } from '../../data/events.js';

export default function CalendarGrid({ calYear, calMonth, selectedDate, onSelectDate, eventsByDate }) {
  const firstWeekday = new Date(calYear, calMonth, 1).getDay();
  const totalDays = new Date(calYear, calMonth + 1, 0).getDate();
  const today = todayStr();

  const dayCells = [];
  for (let emptyIndex = 0; emptyIndex < firstWeekday; emptyIndex++) dayCells.push(null);
  for (let dayNumber = 1; dayNumber <= totalDays; dayNumber++) dayCells.push(dayNumber);

  return (
    <div className="cal-card">
      <div className="cal-weekdays">
        <span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span>
      </div>
      <div className="cal-days">
        {dayCells.map((dayNumber, index) => {
          if (dayNumber === null) return <div className="cal-day empty" key={`empty-${index}`}></div>;
          const dateString = `${calYear}-${pad(calMonth + 1)}-${pad(dayNumber)}`;
          const dayEvents = eventsByDate[dateString] || [];
          const isToday = dateString === today;
          const isSelected = dateString === selectedDate;
          const shownEvents = dayEvents.slice(0, 2);
          const hiddenEventCount = dayEvents.length - shownEvents.length;
          return (
            <div
              className={'cal-day' + (isToday ? ' today' : '') + (isSelected ? ' selected' : '')}
              key={dateString}
              onClick={() => onSelectDate(dateString)}
            >
              <span className="dnum">{dayNumber}</span>
              <div className="evs">
                {shownEvents.map((event) => (
                  <div className="ev-pill" title={event.title} key={event.festivalId ?? event.title}>{event.title}</div>
                ))}
                {hiddenEventCount > 0 && (
                  <div className="ev-more">
                    +{hiddenEventCount}
                    <div className="day-popover">
                      {dayEvents.map((event) => (
                        <div className="popover-item" key={event.festivalId ?? event.title}>
                          <span className="p-dot"></span><b>{event.title}</b><span>{event.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
