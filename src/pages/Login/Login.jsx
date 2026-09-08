import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth-context.js';
import { getErrorMessage } from '../../api/errors.js';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = location.state?.from ?? '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <div className="logo-stamp">여가</div>Yeo-ga
        </Link>
        <h1>다시 만나 반가워요</h1>
        <p className="auth-sub">소도시의 진짜 이야기를 계속 만나보세요.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>이메일</span>
            <input
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="auth-field">
            <span>비밀번호</span>
            <input
              type="password"
              placeholder="비밀번호를 입력해주세요"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && <p className="auth-field-error">{error}</p>}

          <button type="submit" className="auth-submit" disabled={isSubmitting}>로그인</button>
        </form>

        <p className="auth-switch">아직 계정이 없으신가요? <Link to="/signup">회원가입</Link></p>
        <Link to="/" className="auth-skip">로그인 없이 둘러보기 →</Link>
      </div>
    </section>
  );
}
