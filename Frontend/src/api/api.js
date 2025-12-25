import axios from 'axios'

// Use environment variables for production flexibility
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/transcribe'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 30000,
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const response = await axios.post(`${API_BASE}/auth/refresh-token`, {}, {
          withCredentials: true,
          timeout: 10000
        })

        const { access_token } = response.data
        localStorage.setItem('access_token', access_token)

        originalRequest.headers.Authorization = `Bearer ${access_token}`
        return api(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user_data')
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (credentials) => {
    const formData = new FormData()
    formData.append('username', credentials.username)
    formData.append('password', credentials.password)
    return api.post('/auth/login', formData)
  },

  register: (userData) => {
    return api.post('/auth/register', userData)
  },

  logout: () => api.post('/auth/logout'),

  refreshToken: () => api.post('/auth/refresh-token'),
}

export const transcriptionAPI = {
  // Summarize is now handled by the Reports create endpoint
  summarize: (data) => api.post('/reports', data),
}

export const imageAPI = {
  analyze: (formData) => api.post('/images/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  }),

  getAnalyses: (params = {}) => {
    const { patient_id, skip = 0, limit = 20 } = params
    const queryParams = new URLSearchParams({ skip, limit })
    if (patient_id) queryParams.append('patient_id', patient_id)
    return api.get(`/images?${queryParams.toString()}`)
  },

  getAnalysis: (id) => api.get(`/images/${id}`),

  deleteAnalysis: (id) => api.delete(`/images/${id}`),
}

export const reportsAPI = {
  create: (reportData) => api.post('/reports', reportData),

  getAll: (params = {}) => {
    const { patient_id, skip = 0, limit = 20 } = params
    const queryParams = new URLSearchParams({ skip, limit })
    if (patient_id) queryParams.append('patient_id', patient_id)
    return api.get(`/reports?${queryParams.toString()}`)
  },

  get: (id) => api.get(`/reports/${id}`),

  delete: (id) => api.delete(`/reports/${id}`),

  downloadPDF: (id) => api.get(`/reports/${id}/pdf`, {
    responseType: 'blob',
    timeout: 30000,
  }),
}

export const analyticsAPI = {
  get: () => api.get('/analytics'),
  getStats: () => api.get('/analytics/stats'),
}

export const patientsAPI = {
  getAll: (params = {}) => {
    const { skip = 0, limit = 50, search } = params
    const queryParams = new URLSearchParams({ skip, limit })
    if (search) queryParams.append('search', search)
    return api.get(`/patients?${queryParams.toString()}`)
  },
  get: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`),
}

export const systemAPI = {
  health: () => api.get('/analytics/health'),
}

// WebSocket helper
export const createWebSocket = (sessionId, onMessage, onError, onOpen, onClose) => {
  const ws = new WebSocket(`${WS_BASE}/${sessionId}`)

  ws.onopen = (event) => onOpen && onOpen(event)
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      if (onMessage) onMessage(data)
    } catch (e) {
      console.error('WS Error:', e)
    }
  }
  ws.onerror = (error) => onError && onError(error)
  ws.onclose = (event) => onClose && onClose(event)

  return {
    send: (data) => ws.readyState === WebSocket.OPEN && ws.send(JSON.stringify(data)),
    close: () => ws.close()
  }
}

// Utility to extract clean error messages from API responses
export const apiUtils = {
  getErrorMessage: (error) => {
    if (error.response?.data?.detail) {
      if (typeof error.response.data.detail === 'string') {
        return error.response.data.detail
      }
      if (Array.isArray(error.response.data.detail)) {
        return error.response.data.detail[0]?.msg || 'Validation error'
      }
    }
    return error.message || 'An unexpected error occurred'
  }
}

export default api
