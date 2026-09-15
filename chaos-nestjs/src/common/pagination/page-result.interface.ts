/**
 * 分页结果结构，与 chaos-ui 前端约定保持一致：
 * - 列表字段为 items（不要用 list）
 * - 总数为 total，并回填当前 page / size
 */
export interface PageResult<T> {
  items: T[]
  total: number
  page: number
  size: number
}
