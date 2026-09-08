import { apiClient } from './client.js';

export function login({ email, password }) {
  return apiClient.post('/auth', { email, password }).then((res) => res.data.data);
}

export function logout() {
  return apiClient.delete('/auth');
}

export function reissue() {
  return apiClient.post('/auth/refresh').then((res) => res.data.data);
}

export function signUp({ email, password, passwordCheck, nickname }) {
  return apiClient.post('/members', { email, password, passwordCheck, nickname }).then((res) => res.data.data);
}

export function checkEmail(email) {
  return apiClient.get('/members/email/check', { params: { email } });
}

export function checkNickname(nickname) {
  return apiClient.get('/members/nickname/check', { params: { nickname } });
}

export function getMyProfile() {
  return apiClient.get('/members/me').then((res) => res.data.data);
}

export function changeProfile({ nickname, profileImageUrl }) {
  return apiClient.patch('/members/me', { nickname, profileImageUrl }).then((res) => res.data.data);
}

export function changePassword({ currentPassword, newPassword, newPasswordConfirm }) {
  return apiClient
    .patch('/members/me/password', { currentPassword, newPassword, newPasswordConfirm })
    .then((res) => res.data.data);
}

export function withdrawMember() {
  return apiClient.delete('/members');
}
