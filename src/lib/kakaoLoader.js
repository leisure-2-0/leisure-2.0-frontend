// react-kakao-maps-sdk keeps a single Loader instance app-wide and throws if useKakaoLoader
// is ever called again with different options — so every call site must share this exact object.
export const KAKAO_APP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;

export const KAKAO_LOADER_OPTIONS = {
  appkey: KAKAO_APP_KEY ?? '',
  // react-kakao-maps-sdk defaults to a protocol-relative "//dapi.kakao.com/..." URL, which
  // resolves to plain http:// on a local dev server (Vite serves http://localhost) — Kakao's
  // script endpoint rejects that over http, so force https explicitly.
  url: 'https://dapi.kakao.com/v2/maps/sdk.js',
  // "services" adds the Geocoder (address <-> coordinate conversion) used by the address search
  // and reverse-geocoding on the write page's location picker.
  libraries: ['services'],
};
