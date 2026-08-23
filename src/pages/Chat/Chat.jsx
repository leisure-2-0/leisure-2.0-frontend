import { useEffect, useRef, useState } from 'react';
import Thumbnail from '../../components/Thumbnail/Thumbnail.jsx';
import './Chat.css';

const PROMPT_CHIPS = [
  '강릉 당일치기 코스 짜줘',
  '이번 주말 열리는 축제 있어?',
  '혼자 여행하기 좋은 소도시 추천해줘',
  '반려동물 동반 가능한 숙소 알려줘',
];

const CHAT_HISTORY = ['통영 여행 준비', '가을 축제 추천', '담양 카페 리스트'];

const FOLLOW_UP_SUGGESTIONS = [
  '주차 가능한 곳으로 다시 추천해줘',
  '근처 숙소도 같이 알려줘',
];

const PLACE_RECOMMENDATIONS = [
  { variant: 1, title: '안목해변 뷰 로컬 카페', meta: '강릉 · 맛집' },
  { variant: 3, title: '구도심 골목 원두집', meta: '강릉 · 맛집' },
  { variant: 2, title: '중앙시장 뒷골목 게스트하우스', meta: '강릉 · 숙소' },
];

const CANNED_REPLIES = [
  {
    text: '말씀하신 조건에 맞는 인증 게시글을 찾아볼게요. 잠시만요.',
    refCards: [
      { variant: 2, title: '중앙시장 뒷골목 게스트하우스', info: '강릉 · 숙소' },
      { variant: 4, title: '초보도 가능한 카약 체험', info: '여수 · 액티비티' },
    ],
  },
  {
    text: '이 지역은 최근 인증 게시글이 활발히 올라오고 있어요. 관련 게시글 2건을 참고해보세요.',
    refCards: [
      { variant: 1, title: '노을 명당 골목', info: '통영 · 풍경' },
      { variant: 3, title: '근대골목 산책로', info: '군산 · 풍경' },
    ],
  },
];

const INITIAL_MESSAGES = [
  { id: 1, role: 'ai', text: '안녕하세요! 여가 AI예요 🙂 소도시 여행에 대해 무엇이든 물어보세요.' },
  { id: 2, role: 'user', text: '강릉에서 혼자 가기 좋은 카페 추천해줘' },
  {
    id: 3,
    role: 'ai',
    text: '강릉 주민들이 직접 인증한 카페 게시글 중에서 조용히 혼자 시간 보내기 좋은 곳 2곳을 찾았어요.',
    refCards: [
      { variant: 1, title: '안목해변 뷰 로컬 카페', info: '강릉 · 카페' },
      { variant: 3, title: '구도심 골목 원두집', info: '강릉 · 카페' },
    ],
  },
];

function RefCards({ cards }) {
  if (!cards?.length) return null;
  return (
    <div className="ref-cards">
      {cards.map((card) => (
        <div className="ref-card" key={card.title}>
          <Thumbnail variant={card.variant} className="thumb" style={{ height: 52 }} />
          <div className="info"><b>{card.title}</b><span>{card.info}</span></div>
        </div>
      ))}
    </div>
  );
}

export default function Chat() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const cannedReplyIndexRef = useRef(0);
  const nextMessageIdRef = useRef(INITIAL_MESSAGES.length + 1);
  const chatLogRef = useRef(null);

  useEffect(() => {
    if (chatLogRef.current) chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = (messageText) => {
    if (!messageText || !messageText.trim()) return;
    const userMessage = { id: nextMessageIdRef.current++, role: 'user', text: messageText };
    setMessages((previousMessages) => [...previousMessages, userMessage]);
    setInputValue('');
    setTimeout(() => {
      const reply = CANNED_REPLIES[cannedReplyIndexRef.current % CANNED_REPLIES.length];
      cannedReplyIndexRef.current++;
      setMessages((previousMessages) => [...previousMessages, { id: nextMessageIdRef.current++, role: 'ai', ...reply }]);
    }, 500);
  };

  return (
    <section id="page-chat" className="page">
      <div className="chat-grid">
        <div className="chat-side">
          <div className="panel" style={{ padding: 14 }}>
            <h4 style={{ fontSize: 12.5, color: 'var(--ink-soft)', margin: '2px 0 10px' }}>추천 질문</h4>
            {PROMPT_CHIPS.map((promptText) => (
              <button className="prompt-chip" key={promptText} onClick={() => sendMessage(promptText)}>{promptText}</button>
            ))}
          </div>
          <div className="panel" style={{ padding: 14 }}>
            <h4 style={{ fontSize: 12.5, color: 'var(--ink-soft)', margin: '2px 0 10px' }}>최근 대화</h4>
            {CHAT_HISTORY.map((historyLabel, index) => (
              <div className={'history-item' + (index === 0 ? ' active' : '')} key={historyLabel}>{historyLabel}</div>
            ))}
          </div>
        </div>

        <div className="chat-window">
          <div className="chat-header">
            <div className="logo-stamp">여가</div>
            <div className="htxt"><b>여가 AI 챗봇</b><span>인증된 게시글 기반으로 답변해요</span></div>
          </div>
          <div className="chat-log" ref={chatLogRef}>
            {messages.map((message) => (
              <div className={'bubble-row ' + message.role} key={message.id}>
                <div className={'bubble-avatar ' + message.role}></div>
                <div className="bubble">
                  {message.text}
                  <RefCards cards={message.refCards} />
                </div>
              </div>
            ))}
          </div>
          <div className="chat-input-bar">
            <div className="chat-suggest">
              {FOLLOW_UP_SUGGESTIONS.map((suggestion) => (
                <button className="sugg" key={suggestion} onClick={() => sendMessage(suggestion)}>{suggestion}</button>
              ))}
            </div>
            <div className="input-row">
              <input
                type="text"
                placeholder="궁금한 지역이나 취향을 말해보세요"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(inputValue); }}
              />
              <button className="send-btn" onClick={() => sendMessage(inputValue)}>보내기</button>
            </div>
          </div>
        </div>

        <div className="chat-right">
          <div className="panel">
            <h4 style={{ fontSize: 12.5, color: 'var(--ink-soft)', margin: '2px 0 12px' }}>대화 기반 추천 장소</h4>
            {PLACE_RECOMMENDATIONS.map((place) => (
              <div className="place-mini" key={place.title}>
                <Thumbnail variant={place.variant} className="thumb" />
                <div className="txt"><b>{place.title}</b><span>{place.meta}</span></div>
              </div>
            ))}
          </div>
          <div className="panel">
            <h4 style={{ fontSize: 12.5, color: 'var(--ink-soft)', margin: '2px 0 10px' }}>관련 태그</h4>
            <div className="chip-row">
              <span className="tag">#혼자여행</span><span className="tag">#카페</span><span className="tag">#강릉</span><span className="tag">#조용한곳</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
