import { useState } from 'react';

const PAGE_SIZE = 3;

// homepageUrl 원본엔 "공식 홈페이지 https://..." 같은 라벨이 섞여있거나 프로토콜이 아예 없는
// 값(www.example.kr)이 섞여 있어, 그대로 href에 쓰면 우리 사이트 기준 상대경로로 붙어버린다.
function toExternalUrl(raw) {
  if (!raw) return null;
  const found = raw.match(/https?:\/\/\S+/);
  if (found) return found[0];
  const trimmed = raw.trim();
  return trimmed ? `https://${trimmed}` : null;
}

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
          {pagedEvents.map((event) => {
            const externalUrl = toExternalUrl(event.homepageUrl);
            return (
              <div className="detail-card" key={event.title}>
                <div className="cat">{event.category} · {event.region}</div>
                <h5>{event.title}</h5>
                <div className="meta2">{event.time}</div>
                <p>{event.description}</p>
                {externalUrl ? (
                  <a className="more" href={externalUrl} target="_blank" rel="noopener noreferrer">자세히 보기 →</a>
                ) : (
                  <span className="more">자세히 보기 →</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
