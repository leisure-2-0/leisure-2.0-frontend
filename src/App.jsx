import { Routes, Route } from 'react-router-dom';
import TopNav from './components/TopNav/TopNav.jsx';
import ChatFab from './components/ChatFab/ChatFab.jsx';
import { SearchProvider } from './context/SearchContext.jsx';
import { CalendarProvider } from './context/CalendarContext.jsx';
import Home from './pages/Home/Home.jsx';
import Chat from './pages/Chat/Chat.jsx';
import CalendarPage from './pages/Calendar/CalendarPage.jsx';
import SearchResults from './pages/SearchResults/SearchResults.jsx';

export default function App() {
  return (
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
          </Routes>
        </main>
      </CalendarProvider>
    </SearchProvider>
  );
}
