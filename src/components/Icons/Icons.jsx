// simple outline-style icons (no colored emoji) shared by the post card and the post detail page's
// like/bookmark buttons — filled with currentColor when active, otherwise just an outline.
export function HeartIcon({ filled = false, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20.5s-7.5-4.6-10-9.2C0.3 8 1.7 4.5 5 3.5c2.2-0.7 4.4 0.2 5.6 2 0.4 0.6 0.9 1.5 1.4 1.5s1-0.9 1.4-1.5c1.2-1.8 3.4-2.7 5.6-2 3.3 1 4.7 4.5 3 7.8-2.5 4.6-10 9.2-10 9.2z" />
    </svg>
  );
}

export function BookmarkIcon({ filled = false, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3.5h12v17l-6-4-6 4z" />
    </svg>
  );
}
