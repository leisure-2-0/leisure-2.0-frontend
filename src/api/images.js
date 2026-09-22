import axios from 'axios';
import { apiClient } from './client.js';
import { getErrorMessage } from './errors.js';

export const IMAGE_PURPOSE = {
  PROFILE: 'PROFILE',
  POST: 'POST',
  CONTENT: 'CONTENT',
};

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const MAX_BYTES = 10 * 1024 * 1024;

export function validateImageFile(file) {
  if (!file.type) return '이미지 형식을 알 수 없어요. 다른 파일을 선택해주세요.';
  if (!ALLOWED_TYPES.includes(file.type)) return 'PNG, JPG, WEBP, GIF 이미지만 올릴 수 있어요.';
  if (file.size > MAX_BYTES) return '이미지 크기는 10MB까지만 올릴 수 있어요.';
  return '';
}

export async function uploadImage(file, imagePurpose) {
  const invalidReason = validateImageFile(file);
  if (invalidReason) {
    const error = new Error(invalidReason);
    error.isInvalidFile = true;
    throw error;
  }

  const contentType = file.type;
  let presignedUrl;
  let imageUrl;

  try {
    const data = await apiClient
      .post('/images', { contentType, imagePurpose })
      .then((res) => res.data.data);
    presignedUrl = data.presignedUrl;
    imageUrl = data.imageUrl;
  } catch (err) {
    console.error('[image-upload] presign 실패', {
      imagePurpose,
      contentType,
      status: err?.response?.status,
    });
    throw new Error(getErrorMessage(err), { cause: err });
  }

  try {
    await axios.put(presignedUrl, file, { headers: { 'Content-Type': contentType } });
  } catch (err) {
    console.error('[image-upload] S3 PUT 실패', {
      imagePurpose,
      contentType,
      status: err?.response?.status,
      body: err?.response?.data,
    });
    throw new Error('이미지 업로드에 실패했어요. 잠시 후 다시 시도해주세요.', { cause: err });
  }

  return imageUrl;
}
