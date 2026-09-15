import type { PageQuery } from './pagination'

/**
 * 用户实体，字段对齐 chaos-nestjs 后端 User 实体。
 * createdAt / updatedAt 由 TypeORM 序列化为字符串。
 */
export interface User {
  id: number
  username: string
  nickname: string
  email?: string
  /** 是否启用：true 启用 / false 禁用（对应后端的 enabled 字段） */
  enabled: boolean
  createdAt: string
  updatedAt: string
}

/** 用户列表查询参数：分页 + 搜索条件，与后端 UserQueryDto 对齐 */
export interface UserQuery extends PageQuery {
  username?: string
  /** 0 禁用，1 启用；null/undefined 表示全部（后端映射为 enabled） */
  status?: number | null
  /** 创建时间起，格式 YYYY-MM-DD */
  startDate?: string
  /** 创建时间止，格式 YYYY-MM-DD */
  endDate?: string
}

/** 新增用户提交数据，对齐后端 CreateUserDto */
export interface CreateUserPayload {
  username: string
  nickname: string
  enabled: boolean
  email?: string
}

/** 编辑用户提交数据，对齐后端 UpdateUserDto（username 不可改，故不含） */
export interface UpdateUserPayload {
  nickname: string
  enabled: boolean
  email?: string
}
