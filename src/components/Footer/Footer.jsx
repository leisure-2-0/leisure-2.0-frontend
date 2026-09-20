import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-brand">
          <img className="logo-stamp" src="/logo.svg" alt="로고" />여정
          <p className="footer-tagline">여행 정보를 공유하는 곳, 여정.<br />현지인만 아는 여행지를 여정에서 찾아보세요.</p>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <span className="footer-col-title">서비스</span>
            <Link to="/search">둘러보기</Link>
            <Link to="/map">지도</Link>
            <Link to="/calendar">축제 캘린더</Link>
          </div>
          <div className="footer-col">
            <span className="footer-col-title">고객지원</span>
            <a href="#">공지사항</a>
            <a href="#">자주 묻는 질문</a>
            <a href="#">문의하기</a>
          </div>
          <div className="footer-col">
            <span className="footer-col-title">약관</span>
            <a href="#">이용약관</a>
            <a href="#">개인정보처리방침</a>
          </div>
        </div>
      </div>

      <div className="site-footer-bottom">
        <p>프로젝트 여정 · 팀 여간행장</p>
        <p>© {new Date().getFullYear()} 여정. All rights reserved.</p>
      </div>
    </footer>
  );
}
