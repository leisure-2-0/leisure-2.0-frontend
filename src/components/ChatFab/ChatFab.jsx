import { useLocation, useNavigate } from 'react-router-dom';
import './ChatFab.css';

export default function ChatFab() {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === '/chat') return null;

  return (
    <button className="chat-fab" aria-label="AI 챗봇 열기" onClick={() => navigate('/chat')}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    </button>
  );
}
