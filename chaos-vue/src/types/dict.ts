/** 字典项，与 chaos-nestjs DictsService.DictItem 对齐 */
export interface DictItem {
  value: number | string
  label: string
  color?: 'success' | 'info' | 'warning' | 'danger' | 'primary'
}

/** 后端已注册的字典类型标识（随后端注册表扩展） */
export type DictType = 'user-status'
