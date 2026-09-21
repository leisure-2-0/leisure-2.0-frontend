const STATUS_MESSAGES = {
  400: '입력한 내용을 다시 확인해주세요.',
  401: '로그인이 필요해요.',
  403: '권한이 없어요.',
  404: '요청한 정보를 찾을 수 없어요.',
  409: '이미 사용 중이거나 처리된 요청이에요.',
  413: '파일 크기가 너무 커요.',
  429: '요청이 너무 많아요. 잠시 후 다시 시도해주세요.',
};

const NETWORK_MESSAGE = '네트워크 연결을 확인해주세요.';
const SERVER_MESSAGE = '일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요.';

export function getErrorMessage(error) {
  const status = error?.response?.status;

  if (!status) return NETWORK_MESSAGE;
  if (status >= 500) return SERVER_MESSAGE;

  return STATUS_MESSAGES[status] ?? SERVER_MESSAGE;
}
