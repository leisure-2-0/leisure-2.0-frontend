import Modal from '../../components/Modal/Modal';

function formatSavedAt(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('ko-KR', {
    month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function DraftListModal({ isOpen, onClose, drafts, loading, onSelect, onDelete }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="임시 저장 불러오기">
      <div className="draft-list">
        {loading && <p className="draft-list-empty">불러오는 중...</p>}
        {!loading && drafts.length === 0 && (
          <p className="draft-list-empty">아직 저장된 임시 글이 없어요.</p>
        )}
        {drafts.map((draft) => (
          <button
            type="button"
            key={draft.id}
            className="draft-row"
            onClick={() => onSelect(draft)}
          >
            <div className="draft-row-main">
              <div className="draft-row-head">
                <span className="draft-row-date">{formatSavedAt(draft.savedAt)}</span>
              </div>
              <span className="draft-row-title">{draft.title?.trim() || '(제목 없음)'}</span>
            </div>
            <button
              type="button"
              className="draft-row-delete"
              aria-label="임시 저장 삭제"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(draft.id);
              }}
            >
              ×
            </button>
          </button>
        ))}
      </div>
    </Modal>
  );
}
