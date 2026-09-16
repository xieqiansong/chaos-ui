import { post } from '@/utils/request'

export interface LoginParams {
  username: string
  password: string
}

export interface UserInfo {
  id: number
  username: string
  nickname: string
  email?: string
  /** 头像 URL */
  avatar?: string
  /** 手机号 */
  phone?: string
  /** 省份 */
  province?: string
  /** 城市 */
  city?: string
  /** 详细地址 */
  address?: string
  /** 扩展资料 */
  extra?: Record<string, unknown>
}

export interface LoginResult {
  token: string
  user: UserInfo
}

/**
 * 登录接口：POST /api/auth/login（chaos-nestjs 的 AuthModule）。
 * 后端返回统一结构 { code, message, data }，由 request.ts 拦截器剥离外层后此处直接得到 data，
 * 即 { token, user }；token 经请求拦截器以 Bearer 形式自动附加到后续请求。
 */
export function loginApi(params: LoginParams): Promise<LoginResult> {
  return post<LoginResult>('/auth/login', params)
}
