import { useState } from 'react';

const PAGE_SIZE = 3;

export default function DayDetail({ selectedDate, events, loading }) {
  const [page, setPage] = useState(0);

  if (!selectedDate) return null;
  const [year, month, day] = selectedDate.split('-');
  const label = `${year}년 ${parseInt(month, 10)}월 ${parseInt(day, 10)}일 일정`;

  const totalPages = Math.ceil(events.length / PAGE_SIZE);
  const pagedEvents = events.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="day-detail">
      <div className="section-head">
        <h3>{label}</h3>
        {!loading && totalPages > 1 && (
          <div className="day-detail-pagination">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>‹</button>
            <span className="mono">{page + 1} / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}>›</button>
          </div>
        )}
      </div>
      {loading ? (
        <div className="empty-state"><b>불러오는 중...</b></div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <b>이 날짜엔 아직 등록된 일정이 없어요</b>새로운 축제나 행사 소식을 가장 먼저 남겨보세요.
        </div>
      ) : (
        <div className="detail-cards">
          {pagedEvents.map((event) => (
            <div className="detail-card" key={event.title}>
              <div className="cat">{event.category} · {event.region}</div>
              <h5>{event.title}</h5>
              <div className="meta2">{event.time}</div>
              <p>{event.description}</p>
              {event.homepageUrl ? (
                <a className="more" href={event.homepageUrl} target="_blank" rel="noreferrer">자세히 보기 →</a>
              ) : (
                <span className="more">자세히 보기 →</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
