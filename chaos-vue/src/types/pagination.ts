/**
 * 分页相关类型，字段命名对齐 chaos-lib/internal/pagination：
 *   - 请求参数用 page / size（非 pageSize）
 *   - 响应用 items / total / page / size
 * 后续接入 chaos-lib 后端时可直接复用，无需改字段。
 */

/** 分页查询参数基类（page/size 可选，缺省时由后端套用默认值） */
export interface PageQuery {
  page?: number
  size?: number
}

/** 标准分页响应结构 */
export interface PageResult<T> {
  items: T[]
  total: number
  page: number
  size: number
}
