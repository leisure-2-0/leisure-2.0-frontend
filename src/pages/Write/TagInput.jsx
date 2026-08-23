import { useState } from 'react';

export default function TagInput({ tags, onChange, maxTags = 10 }) {
  const [draft, setDraft] = useState('');
  const atLimit = tags.length >= maxTags;

  const commitDraft = () => {
    const cleaned = draft.trim().replace(/^#/, '');
    if (!cleaned || tags.includes(cleaned) || atLimit) {
      setDraft('');
      return;
    }
    onChange([...tags, cleaned]);
    setDraft('');
  };

  const removeTag = (tag) => onChange(tags.filter((t) => t !== tag));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commitDraft();
    } else if (e.key === 'Backspace' && draft === '' && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div className="tag-input">
      <div className="tag-input-chips">
        {tags.map((tag) => (
          <span className="tag-input-chip" key={tag}>
            #{tag}
            <button type="button" onClick={() => removeTag(tag)} aria-label={`${tag} 태그 삭제`}>×</button>
          </span>
        ))}
        <input
          type="text"
          className="tag-input-field"
          placeholder={
            atLimit
              ? '태그는 최대 10개까지 추가할 수 있어요'
              : tags.length === 0
                ? '태그를 입력하고 Enter (예: 혼자여행)'
                : '태그 추가'
          }
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitDraft}
          disabled={atLimit}
        />
      </div>
      <span className="tag-input-count">{tags.length}/{maxTags}</span>
    </div>
  );
}
