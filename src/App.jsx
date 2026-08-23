import { Routes, Route } from 'react-router-dom';
import TopNav from './components/TopNav/TopNav.jsx';
import ChatFab from './components/ChatFab/ChatFab.jsx';
import { SearchProvider } from './context/SearchContext.jsx';
import { CalendarProvider } from './context/CalendarContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import Home from './pages/Home/Home.jsx';
import Chat from './pages/Chat/Chat.jsx';
import CalendarPage from './pages/Calendar/CalendarPage.jsx';
import SearchResults from './pages/SearchResults/SearchResults.jsx';
import MapPage from './pages/Map/MapPage.jsx';
import Login from './pages/Login/Login.jsx';
import SignUp from './pages/SignUp/SignUp.jsx';
import MyPage from './pages/MyPage/MyPage.jsx';
import ChangePassword from './pages/MyPage/ChangePassword.jsx';
import WritePost from './pages/Write/WritePost.jsx';
import PostDetail from './pages/PostDetail/PostDetail.jsx';

export default function App() {
  return (
    <AuthProvider>
      <SearchProvider>
        <CalendarProvider>
          <TopNav />
          <ChatFab />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/mypage" element={<MyPage />} />
              <Route path="/mypage/password" element={<ChangePassword />} />
              <Route path="/write" element={<WritePost />} />
              <Route path="/post/:postId" element={<PostDetail />} />
            </Routes>
          </main>
        </CalendarProvider>
      </SearchProvider>
    </AuthProvider>
  );
}
