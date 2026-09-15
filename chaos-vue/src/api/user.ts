import type { PageResult } from '@/types/pagination'
import type { User, UserQuery } from '@/types/user'

// 假数据：模拟后端用户表（后续接入 chaos-lib 后端后删除）
const ALL_USERS: User[] = Array.from({ length: 57 }, (_, i) => {
  const month = String((i % 6) + 1).padStart(2, '0')
  const day = String((i % 28) + 1).padStart(2, '0')
  return {
    id: i + 1,
    username: `user_${String(i + 1).padStart(3, '0')}`,
    email: `user${i + 1}@example.com`,
    status: i % 3 === 0 ? 0 : 1,
    createdAt: `2026-${month}-${day} 10:${String(i % 60).padStart(2, '0')}:00`,
  }
})

function delay<T>(data: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms))
}

/**
 * 获取用户列表（假数据版）。
 *
 * 接入真实后端（chaos-lib）时，改为：
 *   return get<PageResult<User>>('/users', query)
 * 后端按 pagination.Query 约定接收 page/size，返回 { items, total, page, size }。
 */
export function fetchUsers(query: UserQuery): Promise<PageResult<User>> {
  const { page = 1, size = 20, username, status, startDate, endDate } = query

  let list = ALL_USERS
  if (username) {
    list = list.filter((u) => u.username.includes(username))
  }
  if (status !== undefined && status !== null) {
    list = list.filter((u) => u.status === status)
  }
  if (startDate) {
    list = list.filter((u) => u.createdAt.slice(0, 10) >= startDate)
  }
  if (endDate) {
    list = list.filter((u) => u.createdAt.slice(0, 10) <= endDate)
  }

  const total = list.length
  const start = (page - 1) * size
  const items = list.slice(start, start + size)

  return delay({ items, total, page, size })
}
