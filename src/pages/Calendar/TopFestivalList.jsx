import Thumbnail from '../../components/Thumbnail/Thumbnail.jsx';
import { EVENTS } from '../../data/events.js';

export default function TopFestivalList() {
  const today = new Date();
  const allEvents = Object.entries(EVENTS).flatMap(([date, events]) => events.map((event) => ({ ...event, date })));
  const upcomingEvents = allEvents
    .map((event) => ({ ...event, daysUntil: Math.ceil((new Date(event.date) - today) / 86400000) }))
    .filter((event) => event.daysUntil >= 0)
    .sort((eventA, eventB) => eventA.daysUntil - eventB.daysUntil)
    .slice(0, 5);
  const festivalList = upcomingEvents.length
    ? upcomingEvents
    : allEvents.slice(0, 5).map((event) => ({ ...event, daysUntil: null }));

  return (
    <div className="panel">
      <h4 style={{ fontSize: 12.5, color: 'var(--ink-soft)', margin: '2px 0 12px' }}>다가오는 축제 TOP</h4>
      <div className="top-fest-list">
        {festivalList.map((event) => (
          <div className="fest-card" key={event.title}>
            <Thumbnail variant={(event.region.length % 4) + 1} className="thumb" />
            <div className="info"><b>{event.title}</b><div className="meta">{event.region} · {event.date.slice(5).replace('-', '.')}</div></div>
            <div className="dday">{event.daysUntil === null ? '—' : (event.daysUntil === 0 ? 'D-DAY' : 'D-' + event.daysUntil)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
