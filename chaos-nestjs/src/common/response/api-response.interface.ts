/**
 * 统一响应结构，与 chaos-ui 前端约定保持一致：
 * - code === 0 表示成功（前端 request.ts 据此剥离外层直接返回 data）
 * - message 为提示文案
 * - data 为业务数据，错误时可为 null
 */
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}
