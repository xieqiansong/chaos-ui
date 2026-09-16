import type {
  CreateUserPayload,
  UpdateProfilePayload,
  UpdateUserPayload,
  User,
  UserQuery,
} from '@/types/user'
import type { PageResult } from '@/types/pagination'
import { del, get, post, put } from '@/utils/request'

/**
 * 获取用户列表（真实后端版）。
 *
 * 请求：GET /api/users，查询参数按 UserQueryDto 约定（page/size + 过滤条件）。
 * 响应：统一结构 { code, message, data }，data 为 PageResult<User>
 *       = { items, total, page, size }，由 request.ts 拦截器剥离外层后返回 data。
 */
export function fetchUsers(query: UserQuery): Promise<PageResult<User>> {
  return get<PageResult<User>>('/users', { params: query })
}

/** 获取单个用户详情：GET /api/users/:id */
export function getUser(id: number): Promise<User> {
  return get<User>(`/users/${id}`)
}

/** 新增用户：POST /api/users */
export function createUser(payload: CreateUserPayload): Promise<User> {
  return post<User>('/users', payload)
}

/** 编辑用户：PUT /api/users/:id（username 不可改，后端 UpdateUserDto 不含） */
export function updateUser(id: number, payload: UpdateUserPayload): Promise<User> {
  return put<User>(`/users/${id}`, payload)
}

/** 删除用户：DELETE /api/users/:id */
export function deleteUser(id: number): Promise<void> {
  return del<void>(`/users/${id}`)
}

/** 批量删除用户：DELETE /api/users，body { ids: number[] } */
export function batchDeleteUsers(ids: number[]): Promise<{ deleted: number }> {
  return del<{ deleted: number }>('/users', { data: { ids } })
}

/** 获取当前登录用户资料：GET /api/users/me（后端裁剪 password） */
export function getUserProfile(): Promise<User> {
  return get<User>('/users/me')
}

/** 更新当前登录用户资料：PUT /api/users/me */
export function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  return put<User>('/users/me', payload)
}
