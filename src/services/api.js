import axios from 'axios';
import Cookies from 'js-cookie';

// Por padrão usa a API integrada do próprio Next.js (/api), sem problemas de CORS.
// Caso queira apontar para um backend externo (ex: Render), defina NEXT_PUBLIC_API_URL.
export const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function resolveImageUrl(url) {
  if (!url) return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }
  if (API_URL === '/api') {
    return url.startsWith('/') ? url : `/${url}`;
  }
  return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}
