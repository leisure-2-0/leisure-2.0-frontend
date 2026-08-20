import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth-context.js';
import { CATEGORY_ICONS, REGIONS } from '../../data/posts.js';
import './WritePost.css';

const CATEGORY_OPTIONS = Object.keys(CATEGORY_ICONS);

export default function WritePost() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [title, setTitle] = useState('');
  const [region, setRegion] = useState(REGIONS[0]);
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [tags, setTags] = useState('');
  const [body, setBody] = useState('');

  if (!isLoggedIn) return <Navigate to="/login" state={{ from: '/write' }} replace />;

  const canSubmit = title.trim() !== '' && body.trim() !== '';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    // no backend post API wired up yet — mock submit just goes back to 내 게시글
    navigate('/mypage?tab=posts');
  };

  return (
    <section className="page write-page">
      <div className="write-card">
        <h1>새 이야기 남기기</h1>
        <p className="write-sub">우리 동네의 진짜 이야기를 들려주세요.</p>

        <form className="write-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>제목</span>
            <input
              type="text"
              placeholder="게시글 제목을 입력해주세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>

          <label className="auth-field">
            <span>지역</span>
            <select value={region} onChange={(e) => setRegion(e.target.value)}>
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          <label className="auth-field">
            <span>카테고리</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
            </select>
          </label>

          <label className="auth-field">
            <span>태그</span>
            <input
              type="text"
              placeholder="#카페 #혼자여행 처럼 띄어써서 입력해주세요"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </label>

          <label className="auth-field">
            <span>내용</span>
            <textarea
              placeholder="어떤 이야기를 나누고 싶으신가요?"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              required
            />
          </label>

          <div className="write-actions">
            <button type="button" className="write-cancel" onClick={() => navigate(-1)}>취소</button>
            <button type="submit" className="auth-submit" disabled={!canSubmit}>게시하기</button>
          </div>
        </form>
      </div>
    </section>
  );
}
