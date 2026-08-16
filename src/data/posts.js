export const CATEGORY_ICONS = {
  '맛집': '🍜',
  '숙소': '🏠',
  '액티비티': '⛰️',
  '풍경': '🌄',
  '기타': '✨',
  '축제': '🎊',
  '반려동반': '🐾',
};

export const REGIONS = ['강릉', '전주', '통영', '여수', '담양', '속초', '군산', '경주', '목포', '정선'];

export const POSTS = [
  { region: '강릉', category: '맛집', thumbnailVariant: 1, imageSeed: 'gangneung-cafe', title: '관광객은 모르는 강릉 로컬 카페 3곳', tags: ['#카페', '#혼자여행'], views: '1.2k', visits: 3, points: 20 },
  { region: '통영', category: '풍경', thumbnailVariant: 3, imageSeed: 'tongyeong-sunset', title: '통영 주민이 꼽은 노을 명당 골목', tags: ['#야경', '#산책'], views: '980', visits: 5, points: 20 },
  { region: '전주', category: '숙소', thumbnailVariant: 2, imageSeed: 'jeonju-hanok', title: '한옥마을 안쪽 조용한 게스트하우스', tags: ['#한옥', '#혼숙'], views: '760', visits: 2, points: 25 },
  { region: '여수', category: '액티비티', thumbnailVariant: 4, imageSeed: 'yeosu-kayak', title: '초보도 가능한 여수 밤바다 카약 체험', tags: ['#액티비티', '#데이트'], views: '2.1k', visits: 8, points: 30 },
  { region: '담양', category: '풍경', thumbnailVariant: 1, imageSeed: 'damyang-bamboo', title: '대나무숲 뒤편, 아무도 없는 산책로', tags: ['#자연', '#힐링'], views: '640', visits: 2, points: 20 },
  { region: '속초', category: '맛집', thumbnailVariant: 2, imageSeed: 'sokcho-market', title: '속초 시장에서 40년 한 자리 노포', tags: ['#노포', '#가성비'], views: '1.5k', visits: 6, points: 20 },
  { region: '군산', category: '풍경', thumbnailVariant: 3, imageSeed: 'gunsan-alley', title: '인구감소지역, 그래서 더 조용한 근대골목', tags: ['#산책', '#사진'], views: '410', visits: 1, points: 20 },
  { region: '강릉', category: '액티비티', thumbnailVariant: 4, imageSeed: 'gangneung-surf', title: '서핑 초보 강습 후기, 준비물까지', tags: ['#서핑', '#액티비티'], views: '1.8k', visits: 4, points: 30 },
  { region: '통영', category: '맛집', thumbnailVariant: 1, imageSeed: 'tongyeong-noodle', title: '동피랑 마을 할머니 멸치국수집', tags: ['#로컬맛집'], views: '890', visits: 7, points: 20 },
  { region: '담양', category: '축제', thumbnailVariant: 1, imageSeed: 'damyang-lantern', title: '대나무 숲을 밝히는 담양 빛초롱 축제 후기', tags: ['#축제', '#야경'], views: '1.4k', visits: 4, points: 25 },
  { region: '통영', category: '축제', thumbnailVariant: 3, imageSeed: 'tongyeong-parade', title: '한산대첩문화제, 수상 퍼레이드 직관 후기', tags: ['#축제', '#전통'], views: '1.1k', visits: 3, points: 25 },
  { region: '속초', category: '반려동반', thumbnailVariant: 2, imageSeed: 'sokcho-petfriendly', title: '강아지와 함께 묵기 좋은 속초 독채 숙소', tags: ['#반려동반', '#숙소'], views: '870', visits: 4, points: 25 },
  { region: '전주', category: '반려동반', thumbnailVariant: 4, imageSeed: 'jeonju-petcafe', title: '한옥마을 근처 반려동물 동반 카페 리스트', tags: ['#반려동반', '#카페'], views: '650', visits: 2, points: 20 },
];

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
