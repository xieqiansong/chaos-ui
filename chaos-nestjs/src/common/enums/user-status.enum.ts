/**
 * 用户启用状态枚举（单一真源）。
 *
 * 与实体 User.enabled（boolean）对应：1=启用 / 0=禁用。
 * 查询参数 status（1/0）即通过本枚举映射回 enabled 布尔值，
 * 前端的字典文案（启用/禁用 + 颜色）也依据本枚举在 DictsService 中统一定义。
 */
export enum UserStatus {
  DISABLED = 0,
  ENABLED = 1,
}
