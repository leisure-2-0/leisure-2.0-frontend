// mock draft storage — there's no backend post API yet, so drafts just live in localStorage.
const STORAGE_KEY = 'yeoga_write_drafts';

const SEED_DRAFTS = [
  {
    id: 'seed-auto-draft',
    type: 'auto',
    savedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    title: '주말에 다녀온 남해 편백숲 산책',
    coverImageUrl: null,
    category: '풍경',
    location: null,
    tags: ['편백숲', '산책', '힐링'],
    bodyHtml: '<p>글을 쓰다가 자리를 비운 사이 자동으로 저장된 임시 글이에요. 남해 편백숲은...</p>',
  },
  {
    id: 'seed-manual-draft',
    type: 'manual',
    savedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    title: '을지로 노포 골목 탐방기',
    coverImageUrl: null,
    category: '식당',
    location: { lat: 37.5663, lng: 126.9915, address: '서울 중구 을지로' },
    tags: ['노포', '혼밥', '가성비'],
    bodyHtml: '<p>퇴근길에 들른 을지로 노포 골목, 사진을 더 추가한 뒤 이어서 쓰려고 직접 임시 저장했어요.</p>',
  },
  {
    id: 'seed-rejected-draft',
    type: 'rejected',
    savedAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    title: '속초 밤바다 포장마차 후기',
    coverImageUrl: null,
    category: '식당',
    location: null,
    tags: ['가성비', '노포'],
    bodyHtml: '<p>속초 밤바다 근처, 현지인들만 아는 포장마차를 소개합니다.</p>',
    rejectionReason: '게시글에 포함된 이미지가 저작권 정책에 위배될 수 있어요. 이미지를 교체한 뒤 다시 게시해주세요.',
  },
];

export function loadDrafts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const drafts = raw ? JSON.parse(raw) : [];
    return Array.isArray(drafts) ? drafts : [];
  } catch {
    return [];
  }
}

function persistDrafts(drafts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  } catch {
    // storage full or unavailable — the draft just won't persist across reloads this time
  }
}

// upserts by id; explicitType is what a manual save always sets, autosave keeps whatever
// type the draft already had (so it doesn't downgrade a manual/rejected draft back to "auto").
export function saveDraft(id, fields, explicitType) {
  const drafts = loadDrafts();
  const existingIndex = drafts.findIndex((draft) => draft.id === id);
  const existing = existingIndex >= 0 ? drafts[existingIndex] : null;
  const type = explicitType === 'auto' ? (existing?.type ?? 'auto') : explicitType;

  const draft = { ...fields, id, type, savedAt: new Date().toISOString() };
  if (existingIndex >= 0) drafts[existingIndex] = draft;
  else drafts.unshift(draft);

  persistDrafts(drafts);
  return draft;
}

export function deleteDraft(id) {
  persistDrafts(loadDrafts().filter((draft) => draft.id !== id));
}

// seeds one example draft of each type (자동 저장 / 직접 저장 / 반려됨) so the demo always has
// all three cases to show — there's no real usage history or moderation pipeline yet to produce them.
export function ensureSeedDrafts() {
  const drafts = loadDrafts();
  const missing = SEED_DRAFTS.filter((seed) => !drafts.some((draft) => draft.id === seed.id));
  if (missing.length === 0) return;
  persistDrafts([...missing, ...drafts]);
}
