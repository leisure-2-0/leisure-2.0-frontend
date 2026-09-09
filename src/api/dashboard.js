import { apiClient } from './client.js';

export function getDashboardStats() {
  return apiClient.get('/dashboards').then((res) => res.data.data);
}
