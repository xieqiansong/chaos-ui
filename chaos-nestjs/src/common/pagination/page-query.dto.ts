import { IsInt, IsOptional, Min } from 'class-validator'
import { Type } from 'class-transformer'

/**
 * 分页查询基类 DTO，与 chaos-ui 前端分页约定对齐：
 * - 用 page / size（不是 pageSize）
 * - 均为可选，缺省 page=1、size=10（由属性初始化器兜底）
 */
export class PageQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  size?: number = 10
}
