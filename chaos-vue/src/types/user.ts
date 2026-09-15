import type { PageQuery } from './pagination'

/** 用户实体（字段仅示例，对接后端时按真实结构补充） */
export interface User {
  id: number
  username: string
  email: string
  /** 0 禁用，1 启用 */
  status: 0 | 1
  createdAt: string
}

/** 用户列表查询参数：分页 + 搜索条件 */
export interface UserQuery extends PageQuery {
  username?: string
  /** 0 禁用，1 启用；null/undefined 表示全部 */
  status?: number | null
  /** 创建时间起，格式 YYYY-MM-DD */
  startDate?: string
  /** 创建时间止，格式 YYYY-MM-DD */
  endDate?: string
}
