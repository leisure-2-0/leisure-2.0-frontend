import { useCallback, useEffect, useState } from 'react';
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

// 로컬파트@도메인.최상위도메인 — 공백과 연속된 점을 허용하지 않는다.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

const EMAIL_LABELS = {
  available: '사용 가능한 이메일이에요.',
  taken: '이미 가입된 이메일이에요.',
};

const NICKNAME_LABELS = {
  available: '사용 가능한 닉네임이에요.',
  taken: '이미 사용 중인 닉네임이에요.',
};

function validateEmailFormat(value) {
  return EMAIL_PATTERN.test(value) ? '' : '이메일 형식이 올바르지 않아요. (예: you@example.com)';
}

function useDuplicateCheck(value, checkFn, validateFormat, labels) {
  const [status, setStatus] = useState(IDLE_STATUS);

  const runCheck = useCallback(
    (raw) => {
      const trimmed = raw.trim();
      if (!trimmed) {
        setStatus(IDLE_STATUS);
        return Promise.resolve(null);
      }
      const formatError = validateFormat ? validateFormat(trimmed) : '';
      if (formatError) {
        setStatus({ checking: false, message: formatError, available: false });
        return Promise.resolve(false);
      }
      setStatus({ checking: true, message: '', available: null });
      return checkFn(trimmed)
        .then(() => {
          setStatus({ checking: false, message: labels.available, available: true });
          return true;
        })
        .catch((err) => {
          const message = err?.response?.status === 409 ? labels.taken : getErrorMessage(err);
          setStatus({ checking: false, message, available: false });
          return false;
        });
    },
    [checkFn, validateFormat, labels]
  );

  useEffect(() => {
    const timer = setTimeout(() => runCheck(value), DUPLICATE_CHECK_DELAY_MS);
    return () => clearTimeout(timer);
  }, [value, runCheck]);

  return { ...status, recheck: () => runCheck(value) };
}

export default function SignUp() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [isConfirmTouched, setIsConfirmTouched] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailStatus = useDuplicateCheck(form.email, authApi.checkEmail, validateEmailFormat, EMAIL_LABELS);
  const nicknameStatus = useDuplicateCheck(form.nickname, authApi.checkNickname, null, NICKNAME_LABELS);

  const passwordsMismatch = isConfirmTouched && form.confirmPassword !== '' && form.confirmPassword !== form.password;
  const canSubmit =
    Object.values(form).every((value) => value.trim() !== '') &&
    form.password === form.confirmPassword &&
    validateEmailFormat(form.email.trim()) === '' &&
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
      const status = err?.response?.status;
      if (status === 409) {
        const [emailOk, nicknameOk] = await Promise.all([emailStatus.recheck(), nicknameStatus.recheck()]);
        if (!emailOk && !nicknameOk) {
          setError('이미 가입된 이메일이고, 닉네임도 사용 중이에요.');
        } else if (!emailOk) {
          setError('이미 가입된 이메일이에요.');
        } else if (!nicknameOk) {
          setError('이미 사용 중인 닉네임이에요.');
        } else {
          setError('가입 처리 중 문제가 생겼어요. 다시 시도해주세요.');
        }
      } else if (status === 400) {
        setError('입력한 내용을 다시 확인해주세요. 비밀번호는 영문·숫자·특수문자(!@#$%)를 포함해 8~20자여야 해요.');
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page auth-page signup-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <img className="logo-stamp" src="/logo.svg" alt="로고" />여정
        </Link>
        <h1>여정과 함께 시작해요</h1>
        <p className="auth-sub">나누고 싶은 여행 정보, 여가 정보를 남기러 가요</p>

        <form className="auth-form" onSubmit={handleSubmit}>
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

          {error && <p className="auth-field-error">{error}</p>}

          <button type="submit" className="auth-submit" disabled={!canSubmit || isSubmitting}>회원가입</button>
        </form>

        <p className="auth-switch">이미 계정이 있으신가요? <Link to="/login">로그인</Link></p>
      </div>
    </section>
  );
}
