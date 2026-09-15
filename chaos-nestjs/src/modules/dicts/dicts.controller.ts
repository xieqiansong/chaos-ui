import { Controller, Get, Param } from '@nestjs/common'
import { DictsService } from './dicts.service'

/**
 * 字典接口（参考型数据，无需登录）。
 * GET /api/dicts/:type —— 返回某类字典的项列表，
 * 由全局 ResponseInterceptor 包装为 { code: 0, message: 'success', data: [...] }。
 */
@Controller('dicts')
export class DictsController {
  constructor(private readonly dicts: DictsService) {}

  @Get(':type')
  getDict(@Param('type') type: string) {
    return this.dicts.getDict(type)
  }
}
