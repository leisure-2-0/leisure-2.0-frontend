import { useRef } from 'react';

export default function CoverImageField({ previewUrl, uploading, onFile, onReset }) {
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) onFile(file);
  };

  return (
    <div className="cover-image-field">
      <button
        type="button"
        className={'cover-image-banner' + (previewUrl ? '' : ' post-thumb c1')}
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        title="클릭해서 대표 이미지 변경"
      >
        {previewUrl ? (
          <>
            <div className="cover-image-photo" style={{ backgroundImage: `url(${previewUrl})` }}></div>
            <span className="cover-image-hover-hint">{uploading ? '업로드 중...' : '클릭해서 변경'}</span>
          </>
        ) : (
          <span className="cover-image-caption">
            {uploading ? '업로드 중...' : '🖼 클릭해서 대표 이미지 추가하기'}
          </span>
        )}
      </button>
      {previewUrl && !uploading && (
        <button type="button" className="cover-image-reset" onClick={onReset}>기본 이미지로</button>
      )}
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
    </div>
  );
}
