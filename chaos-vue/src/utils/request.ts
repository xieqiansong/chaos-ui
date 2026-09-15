import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'

/** 后端接口返回的统一结构（按实际后端调整） */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api'

const request: AxiosInstance = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器：统一附加鉴权 token
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// 响应拦截器：剥离统一结构，统一错误处理
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data
    // 约定 code === 0 为成功；按实际后端调整
    if (res && typeof res.code === 'number' && res.code !== 0) {
      console.error('[request]', res.message)
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      // 未授权：跳转到登录页（待接入真实登录路由）
      window.location.href = '/login'
    }
    console.error('[request]', error.message)
    return Promise.reject(error)
  },
)

/** 泛型封装：直接返回 data 业务字段 */
export function get<T = unknown>(url: string, config?: AxiosRequestConfig) {
  return request.get<ApiResponse<T>>(url, config).then((r) => r.data.data)
}

export function post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
  return request.post<ApiResponse<T>>(url, data, config).then((r) => r.data.data)
}

export function put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
  return request.put<ApiResponse<T>>(url, data, config).then((r) => r.data.data)
}

export function del<T = unknown>(url: string, config?: AxiosRequestConfig) {
  return request.delete<ApiResponse<T>>(url, config).then((r) => r.data.data)
}

export default request
