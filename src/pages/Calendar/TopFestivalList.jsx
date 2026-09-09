import { useEffect, useState } from 'react';
import Thumbnail from '../../components/Thumbnail/Thumbnail.jsx';
import * as festivalsApi from '../../api/festivals.js';

export default function TopFestivalList() {
  const [festivals, setFestivals] = useState(null);

  useEffect(() => {
    let cancelled = false;
    festivalsApi.getUpcomingFestivals().then((data) => {
      if (!cancelled) setFestivals(data);
    }).catch(() => {
      if (!cancelled) setFestivals([]);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const today = new Date();
  const festivalList = (festivals ?? []).map((f) => ({
    ...f,
    daysUntil: Math.ceil((new Date(f.eventStartDate) - today) / 86400000),
  }));

  return (
    <div className="panel">
      <h4 style={{ fontSize: 12.5, color: 'var(--ink-soft)', margin: '2px 0 12px' }}>다가오는 축제 TOP</h4>
      <div className="top-fest-list">
        {festivals === null ? (
          <p className="draft-list-empty">불러오는 중...</p>
        ) : festivalList.length === 0 ? (
          <p className="draft-list-empty">다가오는 축제가 없어요.</p>
        ) : (
          festivalList.map((event) => (
            <div className="fest-card" key={event.festivalId}>
              <Thumbnail variant={(event.region.length % 4) + 1} className="thumb" />
              <div className="info"><b>{event.name}</b><div className="meta">{event.region} · {event.eventStartDate.slice(5).replace('-', '.')}</div></div>
              <div className="dday">{event.daysUntil === 0 ? 'D-DAY' : 'D-' + event.daysUntil}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
