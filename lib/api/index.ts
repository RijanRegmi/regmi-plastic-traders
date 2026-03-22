import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api',
  withCredentials: true,
});

// Attach JWT token on every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// ─── API helpers ───────────────────────────────────────────────────────────────
export const cmsApi = {
  getPage:    (page: string) => api.get(`/cms/${page}`).then((r) => r.data.data),
  getAll:     () => api.get('/cms').then((r) => r.data.data),
  updatePage: (page: string, updates: Record<string, { value: unknown; label?: string; type?: string }>) =>
    api.put(`/admin/cms/${page}`, updates).then((r) => r.data),
};

export const productApi = {
  getAll:       (params?: Record<string, unknown>) => api.get('/products', { params }).then((r) => r.data),
  getFeatured:  () => api.get('/products/featured').then((r) => r.data.data),
  getCategories:() => api.get('/products/categories').then((r) => r.data.data),
  getBySlug:    (slug: string) => api.get(`/products/${slug}`).then((r) => r.data.data),
  adminGetAll:  (params?: Record<string, unknown>) => api.get('/admin/products', { params }).then((r) => r.data),
  adminGetById: (id: string) => api.get(`/admin/products/${id}`).then((r) => r.data.data),
  create:       (data: Record<string, unknown>) => api.post('/admin/products', data).then((r) => r.data),
  update:       (id: string, data: Record<string, unknown>) => api.put(`/admin/products/${id}`, data).then((r) => r.data),
  delete:       (id: string) => api.delete(`/admin/products/${id}`).then((r) => r.data),
};

export const blogApi = {
  getPublished: (params?: Record<string, unknown>) => api.get('/blog', { params }).then((r) => r.data),
  getBySlug:    (slug: string) => api.get(`/blog/${slug}`).then((r) => r.data.data),
  adminGetAll:  () => api.get('/admin/blog').then((r) => r.data),
  create:       (data: Record<string, unknown>) => api.post('/admin/blog', data).then((r) => r.data),
  update:       (id: string, data: Record<string, unknown>) => api.put(`/admin/blog/${id}`, data).then((r) => r.data),
  delete:       (id: string) => api.delete(`/admin/blog/${id}`).then((r) => r.data),
};

export const reviewApi = {
  getActive:   () => api.get('/reviews').then((r) => r.data),
  adminGetAll: () => api.get('/admin/reviews').then((r) => r.data.data),
  create:      (data: Record<string, unknown>) => api.post('/admin/reviews', data).then((r) => r.data),
  update:      (id: string, data: Record<string, unknown>) => api.put(`/admin/reviews/${id}`, data).then((r) => r.data),
  delete:      (id: string) => api.delete(`/admin/reviews/${id}`).then((r) => r.data),
};

export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }).then((r) => r.data),
  me:    () => api.get('/auth/me').then((r) => r.data),
};

export const uploadApi = {
  uploadImages:    (formData: FormData) => api.post('/admin/upload', formData).then((r) => r.data),
  uploadSingle:    (formData: FormData) => api.post('/admin/upload/single', formData).then((r) => r.data),
  uploadLogo:      (formData: FormData) => api.post('/admin/upload/logo', formData).then((r) => r.data),
  uploadBackground:(page: string, formData: FormData) => api.post(`/admin/upload/background/${page}`, formData).then((r) => r.data),
  listImages:      () => api.get('/admin/upload').then((r) => r.data),
  deleteImage:     (filename: string) => api.delete(`/admin/upload/${filename}`).then((r) => r.data),
};