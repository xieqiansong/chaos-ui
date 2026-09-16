/**
 * 权限码定义与演示用分配规则。
 * 真实项目里权限码通常由「角色-权限」在登录时装配；此处为不引入 RBAC 模块的简化演示：
 *   - admin 账号拥有全部操作权限
 *   - 其余账号无操作权限（仅可查看列表 / 详情）
 */
export const PERMISSIONS = {
  USER_CREATE: 'user:create',
  USER_EDIT: 'user:edit',
  USER_DELETE: 'user:delete',
  USER_EXPORT: 'user:export',
  USER_IMPORT: 'user:import',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export const ALL_PERMISSIONS: Permission[] = Object.values(PERMISSIONS)

/** 根据账号返回权限码集合（演示规则，可替换为角色查询） */
export function getUserPermissions(username: string): string[] {
  if (username === 'admin') return [...ALL_PERMISSIONS]
  return []
}
