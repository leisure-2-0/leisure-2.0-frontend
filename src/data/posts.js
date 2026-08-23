export const CATEGORY_ICONS = {
  '식당': '🍽️',
  '카페': '☕',
  '숙소': '🏠',
  '액티비티': '⛰️',
  '체험': '🎨',
  '풍경': '🌄',
  '축제': '🎊',
  '행사': '🎪',
  '기타': '✨',
};

export const REGIONS = ['강릉', '전주', '통영', '여수', '담양', '속초', '군산', '경주', '목포', '정선'];

// there's no real author field in the mock data, so each post is deterministically assigned
// one of these mock authors (by id) — enough to make "이 사람의 다른 글" distinct from "같은 지역 다른 글".
const MOCK_AUTHORS = ['제주소녀', '동네여행가', '로컬맛집헌터', '느긋한산책러', '카메라들고여행', '반려동반러', '축제매니아', '숙소덕후'];

export function getAuthorName(post) {
  return MOCK_AUTHORS[post.id % MOCK_AUTHORS.length];
}

export function getRelatedByRegion(post, limit = 4) {
  return POSTS.filter((p) => p.region === post.region && p.id !== post.id).slice(0, limit);
}

export function getRelatedByAuthor(post, limit = 4) {
  const authorName = getAuthorName(post);
  return POSTS.filter((p) => p.id !== post.id && getAuthorName(p) === authorName).slice(0, limit);
}

// top/left are percentage positions on the map page's pin canvas, pointing at the specific
// spot each post is actually talking about (not just a generic per-region marker).
export const POSTS = [
  { id: 0, region: '강릉', category: '카페', thumbnailVariant: 1, imageSeed: 'gangneung-cafe', title: '관광객은 모르는 강릉 로컬 카페 3곳', tags: ['#카페', '#혼자여행'], views: '1.2k', visits: 3, points: 20, mapPosition: { top: 36, left: 61 } },
  { id: 1, region: '통영', category: '풍경', thumbnailVariant: 3, imageSeed: 'tongyeong-sunset', title: '통영 주민이 꼽은 노을 명당 골목', tags: ['#야경', '#산책'], views: '980', visits: 5, points: 20, mapPosition: { top: 72, left: 53 } },
  { id: 2, region: '전주', category: '숙소', thumbnailVariant: 2, imageSeed: 'jeonju-hanok', title: '한옥마을 안쪽 조용한 게스트하우스', tags: ['#한옥', '#혼숙'], views: '760', visits: 2, points: 25, mapPosition: { top: 56, left: 38 } },
  { id: 3, region: '여수', category: '액티비티', thumbnailVariant: 4, imageSeed: 'yeosu-kayak', title: '초보도 가능한 여수 밤바다 카약 체험', tags: ['#액티비티', '#데이트'], views: '2.1k', visits: 8, points: 30, mapPosition: { top: 66, left: 70 } },
  { id: 4, region: '담양', category: '풍경', thumbnailVariant: 1, imageSeed: 'damyang-bamboo', title: '대나무숲 뒤편, 아무도 없는 산책로', tags: ['#자연', '#힐링'], views: '640', visits: 2, points: 20, mapPosition: { top: 62, left: 43 } },
  { id: 5, region: '속초', category: '식당', thumbnailVariant: 2, imageSeed: 'sokcho-market', title: '속초 시장에서 40년 한 자리 노포', tags: ['#노포', '#가성비'], views: '1.5k', visits: 6, points: 20, mapPosition: { top: 24, left: 45 } },
  { id: 6, region: '군산', category: '풍경', thumbnailVariant: 3, imageSeed: 'gunsan-alley', title: '인구감소지역, 그래서 더 조용한 근대골목', tags: ['#산책', '#사진'], views: '410', visits: 1, points: 20, mapPosition: { top: 50, left: 34 } },
  { id: 7, region: '강릉', category: '액티비티', thumbnailVariant: 4, imageSeed: 'gangneung-surf', title: '서핑 초보 강습 후기, 준비물까지', tags: ['#서핑', '#액티비티'], views: '1.8k', visits: 4, points: 30, mapPosition: { top: 41, left: 66 } },
  { id: 8, region: '통영', category: '식당', thumbnailVariant: 1, imageSeed: 'tongyeong-noodle', title: '동피랑 마을 할머니 멸치국수집', tags: ['#로컬맛집'], views: '890', visits: 7, points: 20, mapPosition: { top: 76, left: 58 } },
  { id: 9, region: '담양', category: '축제', thumbnailVariant: 1, imageSeed: 'damyang-lantern', title: '대나무 숲을 밝히는 담양 빛초롱 축제 후기', tags: ['#축제', '#야경'], views: '1.4k', visits: 4, points: 25, mapPosition: { top: 66, left: 47 } },
  { id: 10, region: '통영', category: '축제', thumbnailVariant: 3, imageSeed: 'tongyeong-parade', title: '한산대첩문화제, 수상 퍼레이드 직관 후기', tags: ['#축제', '#전통'], views: '1.1k', visits: 3, points: 25, mapPosition: { top: 73, left: 59 } },
  { id: 11, region: '속초', category: '숙소', thumbnailVariant: 2, imageSeed: 'sokcho-petfriendly', title: '강아지와 함께 묵기 좋은 속초 독채 숙소', tags: ['#반려동반', '#숙소'], views: '870', visits: 4, points: 25, mapPosition: { top: 28, left: 49 } },
  { id: 12, region: '전주', category: '카페', thumbnailVariant: 4, imageSeed: 'jeonju-petcafe', title: '한옥마을 근처 반려동물 동반 카페 리스트', tags: ['#반려동반', '#카페'], views: '650', visits: 2, points: 20, mapPosition: { top: 60, left: 42 } },
  { id: 13, region: '경주', category: '풍경', thumbnailVariant: 3, imageSeed: 'gyeongju-night', title: '첨성대 야경 산책, 관광객 없는 시간대', tags: ['#야경', '#산책'], views: '1.3k', visits: 5, points: 20, mapPosition: { top: 58, left: 66 } },
  { id: 14, region: '경주', category: '카페', thumbnailVariant: 1, imageSeed: 'gyeongju-bakery', title: '황리단길 골목 안쪽 로컬 빵집', tags: ['#카페', '#디저트'], views: '720', visits: 3, points: 20, mapPosition: { top: 62, left: 69 } },
  { id: 15, region: '목포', category: '풍경', thumbnailVariant: 3, imageSeed: 'mokpo-sunset', title: '유달산 노을 전망대, 현지인만 아는 곳', tags: ['#야경', '#전망'], views: '540', visits: 2, points: 20, mapPosition: { top: 78, left: 38 } },
  { id: 16, region: '목포', category: '식당', thumbnailVariant: 2, imageSeed: 'mokpo-octopus', title: '목포 원도심 60년 전통 세발낙지집', tags: ['#로컬맛집', '#전통'], views: '1.1k', visits: 6, points: 20, mapPosition: { top: 82, left: 41 } },
  { id: 17, region: '정선', category: '풍경', thumbnailVariant: 1, imageSeed: 'jeongseon-valley', title: '화암동굴 근처 아무도 없는 계곡', tags: ['#자연', '#힐링'], views: '380', visits: 1, points: 20, mapPosition: { top: 34, left: 58 } },
  { id: 18, region: '정선', category: '축제', thumbnailVariant: 3, imageSeed: 'jeongseon-arirang', title: '정선 아리랑제, 3대가 함께 즐기는 전통 축제', tags: ['#축제', '#전통'], views: '650', visits: 3, points: 25, mapPosition: { top: 30, left: 55 } },
  { id: 19, region: '강릉', category: '기타', thumbnailVariant: 4, imageSeed: 'gangneung-library', title: '강릉 시립도서관, 바다 보이는 열람실', tags: ['#힐링', '#조용한곳'], views: '480', visits: 2, points: 20, mapPosition: { top: 31, left: 63 } },
  { id: 20, region: '전주', category: '체험', thumbnailVariant: 2, imageSeed: 'jeonju-hanji', title: '한지 공예 체험, 나만의 한지등 만들기', tags: ['#체험', '#공방'], views: '390', visits: 1, points: 20, mapPosition: { top: 52, left: 40 } },
  { id: 21, region: '속초', category: '액티비티', thumbnailVariant: 4, imageSeed: 'sokcho-mountain', title: '설악산 초보자 코스 당일 등반 후기', tags: ['#등산', '#액티비티'], views: '1.6k', visits: 5, points: 30, mapPosition: { top: 20, left: 47 } },
  { id: 22, region: '여수', category: '숙소', thumbnailVariant: 1, imageSeed: 'yeosu-guesthouse', title: '여수 밤바다 뷰 오션뷰 게스트하우스', tags: ['#오션뷰', '#숙소'], views: '990', visits: 4, points: 25, mapPosition: { top: 70, left: 73 } },
  { id: 23, region: '담양', category: '풍경', thumbnailVariant: 3, imageSeed: 'damyang-petwalk', title: '메타세쿼이아길 반려견 동반 산책 후기', tags: ['#반려동반', '#산책'], views: '710', visits: 3, points: 25, mapPosition: { top: 58, left: 45 } },
  { id: 24, region: '군산', category: '식당', thumbnailVariant: 2, imageSeed: 'gunsan-jjamppong', title: '군산 짬뽕 원조 노포, 웨이팅 없이 가는 법', tags: ['#로컬맛집', '#가성비'], views: '1.7k', visits: 8, points: 20, mapPosition: { top: 46, left: 37 } },
];

export function getPostById(id) {
  return POSTS.find((post) => String(post.id) === String(id));
}

// there's no real article body in the mock data yet, so the detail page renders a
// deterministic-but-flavorful paragraph set built from the post's own fields.
export function getMockPostBody(post) {
  return `
    <p>${post.region}에 갈 일이 있다면 꼭 들러보길 추천하는 곳, <b>${post.title}</b>입니다. ${CATEGORY_ICONS[post.category] || ''} ${post.category} 카테고리로 소개하지만, 막상 가보면 사진보다 훨씬 좋았던 곳이라 다시 정리해봤어요.</p>
    <p>이미 다녀온 분들의 반응도 좋았던 곳입니다. 조회수 ${post.views}이 괜히 나온 게 아니더라고요.</p>
    <h2>가기 전에 알아두면 좋은 것</h2>
    <ul>
      <li>혼자 가도, 같이 가도 무난하게 좋은 분위기</li>
      <li>사람이 몰리는 시간대는 살짝 피하는 걸 추천</li>
      <li>${post.tags.join(', ')} 태그를 보고 찾아오시는 분들이 특히 만족도가 높았어요</li>
    </ul>
    <p>다음에 ${post.region}에 다시 갈 일이 생기면 또 들르고 싶은 곳이에요. 근처에 다른 곳도 같이 둘러보고 온 후기는 나중에 이어서 남겨볼게요.</p>
  `;
}

export function parseViewCount(viewsText) {
  return viewsText.includes('k') ? parseFloat(viewsText) * 1000 : parseInt(viewsText, 10);
}

// searchTerm/category/region are all optional; 'all' (or an empty search term) means "don't filter by this".
export function filterPosts(posts, { searchTerm = '', category = 'all', region = 'all' } = {}) {
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  return posts.filter((post) => {
    const matchesCategory = category === 'all' || post.category === category;
    const matchesRegion = region === 'all' || post.region === region;
    const matchesSearchTerm =
      !normalizedSearchTerm ||
      post.title.toLowerCase().includes(normalizedSearchTerm) ||
      post.tags.some((tag) => tag.toLowerCase().includes(normalizedSearchTerm)) ||
      post.region.toLowerCase().includes(normalizedSearchTerm);
    return matchesCategory && matchesRegion && matchesSearchTerm;
  });
}

export function sortPosts(posts, sortOrder) {
  const sortedPosts = [...posts];
  if (sortOrder === 'popular') {
    sortedPosts.sort((postA, postB) => parseViewCount(postB.views) - parseViewCount(postA.views));
  }
  return sortedPosts;
}
