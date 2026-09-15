import { IsInt, IsOptional, IsString } from 'class-validator'
import { Type } from 'class-transformer'
import { PageQueryDto } from '../../../common/pagination/page-query.dto'

/**
 * 用户列表查询 DTO，与 chaos-ui 前端搜索表单对齐：
 * - 分页字段 page / size 继承自 PageQueryDto
 * - username：用户名模糊匹配
 * - status：0 禁用 / 1 启用（映射到实体的 enabled 布尔字段）
 * - startDate / endDate：创建时间范围，格式 YYYY-MM-DD
 */
export class UserQueryDto extends PageQueryDto {
  @IsOptional()
  @IsString()
  username?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number

  @IsOptional()
  @IsString()
  startDate?: string

  @IsOptional()
  @IsString()
  endDate?: string
}
