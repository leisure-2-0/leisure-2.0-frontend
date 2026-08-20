import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth-context.js';
import { POINT_HISTORY } from '../../data/mypage.js';

export default function AccountTab() {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();
  const photoInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ email: user.email, nickname: user.nickname });
  const [profileMessage, setProfileMessage] = useState('');

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    updateProfile({ avatarUrl: URL.createObjectURL(file) });
    e.target.value = '';
  };

  const startEditing = () => {
    setEditForm({ email: user.email, nickname: user.nickname });
    setProfileMessage('');
    setIsEditing(true);
  };

  const cancelEditing = () => setIsEditing(false);

  const updateEditField = (field) => (e) => {
    setEditForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile(editForm);
    setIsEditing(false);
    setProfileMessage('저장되었어요.');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="account-tab-layout">
      <div className="account-view">
        <h3>계정 정보</h3>

        <div className="account-row">
          <span className="account-label">프로필 사진</span>
          <div className="account-photo-wrap">
            <div
              className="account-photo"
              style={user.avatarUrl ? { backgroundImage: `url(${user.avatarUrl})` } : undefined}
            ></div>
            <button
              type="button"
              className="account-photo-edit"
              onClick={() => photoInputRef.current?.click()}
              title="사진 변경"
              aria-label="사진 변경"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handlePhotoChange}
            />
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="account-row">
            <span className="account-label">이름</span>
            <span className="account-value">{user.name}</span>
          </div>
          <div className="account-row">
            <span className="account-label">이메일</span>
            {isEditing ? (
              <input type="email" value={editForm.email} onChange={updateEditField('email')} required />
            ) : (
              <span className="account-value">{user.email}</span>
            )}
          </div>
          <div className="account-row">
            <span className="account-label">닉네임</span>
            {isEditing ? (
              <input type="text" value={editForm.nickname} onChange={updateEditField('nickname')} required />
            ) : (
              <span className="account-value">{user.nickname}</span>
            )}
          </div>

          <div className="account-save-row">
            {!isEditing && profileMessage && <span className="account-message">{profileMessage}</span>}
            {isEditing ? (
              <>
                <button type="button" className="account-cancel-btn" onClick={cancelEditing}>취소</button>
                <button type="submit" className="account-save-btn">저장</button>
              </>
            ) : (
              <button type="button" className="account-edit-btn" onClick={startEditing}>수정</button>
            )}
          </div>
        </form>

        <div className="account-links">
          <Link to="/mypage/password" className="account-link-row">
            <span>비밀번호 변경</span><span className="account-chevron">›</span>
          </Link>
          <button className="account-link-row account-logout-row" onClick={handleLogout}>
            <span>로그아웃</span><span className="account-chevron">›</span>
          </button>
        </div>
      </div>

      <div className="panel account-points-panel">
        <h4>포인트 내역</h4>
        <p className="account-points-current">현재 <b>{user.points}</b> 보유중</p>
        <ul className="points-history-list">
          {POINT_HISTORY.map((item) => (
            <li className="points-history-row" key={`${item.label}-${item.date}`}>
              <div className="points-history-info">
                <span className="points-history-label">{item.label}</span>
                <span className="points-history-date">{item.date.slice(5).replace('-', '.')}</span>
              </div>
              <span className="points-history-amount">+{item.points}P</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
