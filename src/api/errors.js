export function getErrorMessage(error) {
  const data = error?.response?.data;
  if (!data) return '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  if (Array.isArray(data.data) && data.data.length > 0) return data.data[0];
  return data.message ?? '요청 처리 중 오류가 발생했습니다.';
}
