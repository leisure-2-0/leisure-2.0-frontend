import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth-context.js';
import * as authApi from '../../api/auth.js';
import { getErrorMessage } from '../../api/errors.js';
import './SignUp.css';

const INITIAL_FORM = {
  password: '',
  confirmPassword: '',
  email: '',
  nickname: '',
};

const IDLE_STATUS = { checking: false, message: '', available: null };
const DUPLICATE_CHECK_DELAY_MS = 500;

function useDuplicateCheck(value, checkFn) {
  const [status, setStatus] = useState(IDLE_STATUS);

  useEffect(() => {
    const trimmed = value.trim();
    const timer = setTimeout(() => {
      if (!trimmed) {
        setStatus(IDLE_STATUS);
        return;
      }
      setStatus({ checking: true, message: '', available: null });
      checkFn(trimmed)
        .then((res) => setStatus({ checking: false, message: res.data.message, available: true }))
        .catch((err) => setStatus({ checking: false, message: getErrorMessage(err), available: false }));
    }, DUPLICATE_CHECK_DELAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return status;
}

export default function SignUp() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [isConfirmTouched, setIsConfirmTouched] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailStatus = useDuplicateCheck(form.email, authApi.checkEmail);
  const nicknameStatus = useDuplicateCheck(form.nickname, authApi.checkNickname);

  const passwordsMismatch = isConfirmTouched && form.confirmPassword !== '' && form.confirmPassword !== form.password;
  const canSubmit =
    Object.values(form).every((value) => value.trim() !== '') &&
    form.password === form.confirmPassword &&
    emailStatus.available !== false &&
    nicknameStatus.available !== false;

  const updateField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');
    setIsSubmitting(true);
    try {
      await signup({
        email: form.email,
        password: form.password,
        passwordCheck: form.confirmPassword,
        nickname: form.nickname,
      });
      navigate('/', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
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
          {emailStatus.checking && <p className="auth-field-hint">확인 중...</p>}
          {!emailStatus.checking && emailStatus.message && (
            <p className={emailStatus.available ? 'auth-field-hint' : 'auth-field-error'}>{emailStatus.message}</p>
          )}

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
          {nicknameStatus.checking && <p className="auth-field-hint">확인 중...</p>}
          {!nicknameStatus.checking && nicknameStatus.message && (
            <p className={nicknameStatus.available ? 'auth-field-hint' : 'auth-field-error'}>{nicknameStatus.message}</p>
          )}

          {error && <p className="auth-field-error">{error}</p>}

          <button type="submit" className="auth-submit" disabled={!canSubmit || isSubmitting}>회원가입</button>
        </form>

        <p className="auth-switch">이미 계정이 있으신가요? <Link to="/login">로그인</Link></p>
      </div>
    </section>
  );
}
