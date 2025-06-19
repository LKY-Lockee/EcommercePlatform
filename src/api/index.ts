import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

// 请求拦截器 - 添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem('token')
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''

      // 只有在有token且不在登录页面时才进行跳转
      // 这样可以避免登录失败时的页面刷新
      if (token && currentPath !== '/login') {
        // Token过期或无效，清除本地存储并跳转到登录页
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
      // 如果在登录页面或没有token，让错误正常抛出给调用方处理
    }
    return Promise.reject(error)
  },
)

export default api
