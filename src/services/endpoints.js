import api from './api';

// ─── Auth ────────────────────────────────────────────
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
};

// ─── Dashboard ───────────────────────────────────────
export const dashboardService = {
  get: (params) => api.get('/dashboard', { params }),
};

// ─── Banks ───────────────────────────────────────────
export const bankService = {
  getAll: () => api.get('/banks'),
  getById: (id) => api.get(`/banks/${id}`),
  create: (data) => api.post('/banks', data),
  update: (id, data) => api.put(`/banks/${id}`, data),
  delete: (id) => api.delete(`/banks/${id}`),
};

// ─── Cash Wallet ─────────────────────────────────────
export const cashService = {
  get: () => api.get('/cash'),
  update: (balance) => api.put('/cash', { balance }),
};

// ─── Transactions ────────────────────────────────────
// Backend response: { success, message, data: { items, page, limit, total } }
export const transactionService = {
  getAll: (params) => api.get('/transactions', { params }),
  create: (data) => api.post('/transactions', data),
  settleFriend: (id) => api.patch(`/transactions/${id}/settle-friend`),
};

// ─── Categories ──────────────────────────────────────
export const categoryService = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// ─── EMIs ────────────────────────────────────────────
export const emiService = {
  getAll: () => api.get('/emis'),
  create: (data) => api.post('/emis', data),
  update: (id, data) => api.put(`/emis/${id}`, data),
  delete: (id) => api.delete(`/emis/${id}`),
  toggleStatus: (id, isActive) => api.patch(`/emis/${id}/status`, { isActive }),
};

// ─── Subscriptions ───────────────────────────────────
export const subscriptionService = {
  getAll: () => api.get('/subscriptions'),
  create: (data) => api.post('/subscriptions', data),
  update: (id, data) => api.put(`/subscriptions/${id}`, data),
  delete: (id) => api.delete(`/subscriptions/${id}`),
  toggleStatus: (id, isActive) => api.patch(`/subscriptions/${id}/status`, { isActive }),
};

// ─── Reports ─────────────────────────────────────────
export const reportService = {
  getDaily: (params) => api.get('/reports/daily', { params }),
  getMonthly: (params) => api.get('/reports/monthly', { params }),
  getYearly: (params) => api.get('/reports/yearly', { params }),
};

// ─── PDF ─────────────────────────────────────────────
export const pdfService = {
  downloadMonthly: (params) => api.get('/pdf/monthly', { params, responseType: 'blob', timeout: 60000 }),
};
