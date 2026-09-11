import { useEffect, useState } from 'react';
import { AuthContext } from './auth-context.js';
import * as authApi from '../api/auth.js';
import { setAccessToken, clearAccessToken, onUnauthorized } from '../api/tokenStore.js';

function toProfile(memberProfile) {
  return {
    publicId: memberProfile.publicId,
    email: memberProfile.email,
    nickname: memberProfile.nickname,
    avatarUrl: memberProfile.profileImageUrl,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // 앱이 처음 로드될 때 refresh 쿠키로 세션 복구를 시도한다
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const { accessToken } = await authApi.reissue();
        setAccessToken(accessToken);
        const profile = await authApi.getMyProfile();
        if (!cancelled) setUser(toProfile(profile));
        const points = await authApi.getPoints();
        if (!cancelled) setUser((current) => (current ? { ...current, points } : current));
      } catch {
        clearAccessToken();
      } finally {
        if (!cancelled) setInitializing(false);
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => onUnauthorized(() => setUser(null)), []);

  const login = async (email, password) => {
    const { accessToken } = await authApi.login({ email, password });
    setAccessToken(accessToken);
    const profile = await authApi.getMyProfile();
    setUser(toProfile(profile));
    const points = await authApi.getPoints();
    setUser((current) => (current ? { ...current, points } : current));
  };

  // 포인트 적립은 비동기 처리라 즉시 반영되지 않으므로, 필요한 화면에서 수동으로 재조회할 수 있게 노출한다.
  const refreshPoints = async () => {
    try {
      const points = await authApi.getPoints();
      setUser((current) => (current ? { ...current, points } : current));
    } catch {
      // 잔액 갱신 실패는 조용히 무시 — 화면엔 이전 값이 계속 보인다.
    }
  };

  const signup = async ({ email, password, passwordCheck, nickname }) => {
    await authApi.signUp({ email, password, passwordCheck, nickname });
    await login(email, password);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearAccessToken();
      setUser(null);
    }
  };

  const updateProfile = (updates) => setUser((current) => (current ? { ...current, ...updates } : current));

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, initializing, login, signup, logout, updateProfile, refreshPoints }}>
      {children}
    </AuthContext.Provider>
  );
}
