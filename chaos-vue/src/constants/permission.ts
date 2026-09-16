/** 权限码常量，需与 chaos-nestjs 后端 common/permissions.ts 保持一致 */
export const PERMISSIONS = {
  USER_CREATE: 'user:create',
  USER_EDIT: 'user:edit',
  USER_DELETE: 'user:delete',
  USER_EXPORT: 'user:export',
  USER_IMPORT: 'user:import',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]
