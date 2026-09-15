import { format, parseISO } from 'date-fns'

/** 标准日期时间格式：yyyy-MM-dd HH:mm:ss；空值或解析失败返回占位符 */
export function formatDateTime(value?: string | null): string {
  if (!value) return '-'
  try {
    return format(parseISO(value), 'yyyy-MM-dd HH:mm:ss')
  } catch {
    return '-'
  }
}
