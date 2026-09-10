import { apiClient } from './client.js';

export function searchPosts({ searchTerm, category, sort = 'LATEST', page, size }) {
  return apiClient.get('/searches', { params: { searchTerm, category, sort, page, size } }).then((res) => res.data.data);
}
