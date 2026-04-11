import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor — attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('business_nexus_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('business_nexus_token');
      localStorage.removeItem('business_nexus_user');
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH ====================
export const loginUser = (email: string, password: string, role: string) =>
  api.post('/auth/login', { email, password, role });

export const registerUser = (name: string, email: string, password: string, role: string) =>
  api.post('/auth/register', { name, email, password, role });

export const forgotPasswordApi = (email: string) =>
  api.post('/auth/forgot-password', { email });

export const resetPasswordApi = (token: string, newPassword: string) =>
  api.post('/auth/reset-password', { token, newPassword });

export const getCurrentUser = () =>
  api.get('/auth/me');

export const changePasswordApi = (currentPassword: string, newPassword: string) =>
  api.put('/auth/change-password', { currentPassword, newPassword });

export const enable2FA = () =>
  api.post('/auth/enable-2fa');

export const verify2FA = (email: string, code: string) =>
  api.post('/auth/verify-2fa', { email, code });

// ==================== USERS ====================
export const getUsers = (role?: string) =>
  api.get('/users', { params: role ? { role } : {} });

export const getUserById = (id: string) =>
  api.get(`/users/${id}`);

export const updateUser = (id: string, updates: Record<string, unknown>) =>
  api.put(`/users/${id}`, updates);

// ==================== MESSAGES ====================
export const getConversations = () =>
  api.get('/messages/conversations');

export const getMessagesWith = (userId: string) =>
  api.get(`/messages/${userId}`);

export const sendMessageApi = (receiverId: string, content: string) =>
  api.post('/messages', { receiverId, content });

// ==================== COLLABORATIONS ====================
export const getCollaborations = () =>
  api.get('/collaborations');

export const createCollaboration = (entrepreneurId: string, message: string) =>
  api.post('/collaborations', { entrepreneurId, message });

export const updateCollaborationStatus = (id: string, status: string) =>
  api.put(`/collaborations/${id}`, { status });

// ==================== DEALS ====================
export const getDeals = () =>
  api.get('/deals');

export const createDeal = (deal: Record<string, unknown>) =>
  api.post('/deals', deal);

// ==================== MEETINGS ====================
export const getMeetings = () =>
  api.get('/meetings');

export const scheduleMeeting = (meetingData: {
  title: string;
  entrepreneurId: string;
  investorId: string;
  date: string | Date;
  startTime: string;
  durationMinutes: number;
  notes?: string;
}) => api.post('/meetings', meetingData);

export const updateMeetingStatus = (id: string, status: 'accepted' | 'rejected' | 'cancelled') =>
  api.put(`/meetings/${id}/status`, { status });

// ==================== DOCUMENTS ====================
export const getDocuments = () =>
  api.get('/documents');

export const createDocument = (formData: FormData) =>
  api.post('/documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

export const signDocument = (id: string, signature: string) =>
  api.post(`/documents/${id}/sign`, { signature });

export const deleteDocument = (id: string) =>
  api.delete(`/documents/${id}`);

// ==================== NOTIFICATIONS ====================
export const getNotifications = () =>
  api.get('/notifications');

export const markNotificationRead = (id: string) =>
  api.put(`/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  api.put('/notifications/read-all');

// ==================== PAYMENTS ====================
export const getTransactions = () =>
  api.get('/payments');

export const processDeposit = (amount: number, source: string) =>
  api.post('/payments/deposit', { amount, source });

export const processWithdrawal = (amount: number, destination: string) =>
  api.post('/payments/withdraw', { amount, destination });

export const processTransfer = (targetUserId: string, amount: number, description?: string) =>
  api.post('/payments/transfer', { targetUserId, amount, description });

export default api;
