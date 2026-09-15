import { IsArray, IsInt } from 'class-validator'
import { Type } from 'class-transformer'

/** 批量删除 DTO：接收一组用户 id */
export class BatchDeleteDto {
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  ids: number[]
}
