import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-brand">
          <div className="logo-stamp">여가</div>Yeo-ga
          <p className="footer-tagline">현지인만 아는 여행지, 여가에서 찾아보세요.</p>
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
        <p>㈜여가 · 대표 홍길동 · 사업자등록번호 000-00-00000</p>
        <p>서울특별시 여가구 여행로 123 · 고객센터 1234-5678</p>
        <p>© {new Date().getFullYear()} Yeo-ga. All rights reserved.</p>
      </div>
    </footer>
  );
}
