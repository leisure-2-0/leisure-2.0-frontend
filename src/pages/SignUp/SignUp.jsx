import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth-context.js';
import './SignUp.css';

const INITIAL_FORM = {
  password: '',
  confirmPassword: '',
  email: '',
  name: '',
  nickname: '',
};

export default function SignUp() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [isConfirmTouched, setIsConfirmTouched] = useState(false);

  const passwordsMismatch = isConfirmTouched && form.confirmPassword !== '' && form.confirmPassword !== form.password;
  const canSubmit = Object.values(form).every((value) => value.trim() !== '') && form.password === form.confirmPassword;

  const updateField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    // no backend auth wired up yet — mock sign-up just logs the user straight in with the entered profile
    login({ email: form.email, name: form.name, nickname: form.nickname });
    navigate('/', { replace: true });
  };

  return (
    <section className="page auth-page signup-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <div className="logo-stamp">여가</div>Yeo-ga
        </Link>
        <h1>여가와 함께 시작해요</h1>
        <p className="auth-sub">소도시 사람들의 진짜 이야기를 남겨보세요.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>비밀번호</span>
            <input
              type="password"
              placeholder="비밀번호"
              autoComplete="new-password"
              value={form.password}
              onChange={updateField('password')}
              required
            />
          </label>
          <label className="auth-field">
            <span>비밀번호 확인</span>
            <input
              type="password"
              placeholder="비밀번호 확인"
              autoComplete="new-password"
              className={passwordsMismatch ? 'invalid' : ''}
              value={form.confirmPassword}
              onChange={updateField('confirmPassword')}
              onBlur={() => setIsConfirmTouched(true)}
              required
            />
          </label>
          {passwordsMismatch && <p className="auth-field-error">비밀번호가 일치하지 않아요.</p>}

          <label className="auth-field">
            <span>이메일</span>
            <input
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={form.email}
              onChange={updateField('email')}
              required
            />
          </label>

          <label className="auth-field">
            <span>이름</span>
            <input
              type="text"
              placeholder="실명을 입력해주세요"
              autoComplete="name"
              value={form.name}
              onChange={updateField('name')}
              required
            />
          </label>
          <label className="auth-field">
            <span>닉네임</span>
            <input
              type="text"
              placeholder="닉네임을 입력해주세요"
              autoComplete="nickname"
              value={form.nickname}
              onChange={updateField('nickname')}
              required
            />
          </label>

          <button type="submit" className="auth-submit" disabled={!canSubmit}>회원가입</button>
        </form>

        <p className="auth-switch">이미 계정이 있으신가요? <Link to="/login">로그인</Link></p>
      </div>
    </section>
  );
}
