import { useRef } from 'react';

export default function CoverImageField({ previewUrl, onChange }) {
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // read as a base64 data URL (not a blob URL) so it can round-trip through a saved draft —
    // object URLs die on reload, data URLs don't.
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="cover-image-field">
      <button
        type="button"
        className={'cover-image-banner' + (previewUrl ? '' : ' post-thumb c1')}
        onClick={() => inputRef.current?.click()}
        title="클릭해서 대표 이미지 변경"
      >
        {previewUrl ? (
          <>
            <div className="cover-image-photo" style={{ backgroundImage: `url(${previewUrl})` }}></div>
            <span className="cover-image-hover-hint">클릭해서 변경</span>
          </>
        ) : (
          <span className="cover-image-caption">🖼 클릭해서 대표 이미지 추가하기</span>
        )}
      </button>
      {previewUrl && (
        <button type="button" className="cover-image-reset" onClick={() => onChange(null)}>기본 이미지로</button>
      )}
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
    </div>
  );
}
