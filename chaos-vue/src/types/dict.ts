/** 字典项，与 chaos-nestjs DictsService.DictItem 对齐 */
export interface DictItem {
  value: number | string
  label: string
  color?: 'success' | 'info' | 'warning' | 'danger' | 'primary'
  /** 子级（如省市区联动的「市」），扁平枚举可省略 */
  children?: DictItem[]
}

/** 后端已注册的字典类型标识（随后端注册表扩展） */
export type DictType = 'user-status' | 'region'
