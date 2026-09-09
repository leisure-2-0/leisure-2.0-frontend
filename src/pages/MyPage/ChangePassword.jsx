import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth-context.js';
import * as authApi from '../../api/auth.js';
import { getErrorMessage } from '../../api/errors.js';
import { setAccessToken } from '../../api/tokenStore.js';

export default function ChangePassword() {
  const navigate = useNavigate();
  const { isLoggedIn, initializing } = useAuth();

  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [isConfirmTouched, setIsConfirmTouched] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (initializing) return null;
  if (!isLoggedIn) return <Navigate to="/login" state={{ from: '/mypage/password' }} replace />;

  const updateField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const passwordsMismatch = isConfirmTouched && form.confirm !== '' && form.confirm !== form.next;
  const canSubmit = form.current !== '' && form.next !== '' && form.next === form.confirm;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');
    setIsSubmitting(true);
    try {
      const { accessToken } = await authApi.changePassword({
        currentPassword: form.current,
        newPassword: form.next,
        newPasswordConfirm: form.confirm,
      });
      setAccessToken(accessToken);
      navigate('/mypage?tab=account');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page auth-page">
      <div className="auth-card">
        <h1>비밀번호 변경</h1>
        <p className="auth-sub">현재 비밀번호를 확인하고 새 비밀번호로 바꿔주세요.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>현재 비밀번호</span>
            <input type="password" autoComplete="current-password" value={form.current} onChange={updateField('current')} required />
          </label>
          <label className="auth-field">
            <span>새 비밀번호</span>
            <input type="password" autoComplete="new-password" value={form.next} onChange={updateField('next')} required />
          </label>
          <label className="auth-field">
            <span>새 비밀번호 확인</span>
            <input
              type="password"
              autoComplete="new-password"
              className={passwordsMismatch ? 'invalid' : ''}
              value={form.confirm}
              onChange={updateField('confirm')}
              onBlur={() => setIsConfirmTouched(true)}
              required
            />
          </label>
          {passwordsMismatch && <p className="auth-field-error">비밀번호가 일치하지 않아요.</p>}
          {error && <p className="auth-field-error">{error}</p>}
          <button type="submit" className="auth-submit" disabled={!canSubmit || isSubmitting}>비밀번호 변경</button>
        </form>

        <Link to="/mypage?tab=account" className="auth-skip">← 계정 정보로 돌아가기</Link>
      </div>
    </section>
  );
}
