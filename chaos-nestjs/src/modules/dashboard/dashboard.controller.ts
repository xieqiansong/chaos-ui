import { Controller, Get, UseGuards } from '@nestjs/common'
import { DashboardService } from './dashboard.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

/**
 * 仪表盘统计接口（需登录）。
 * GET /api/dashboard/stats —— 返回真实可从库计算的用户指标，
 * 由全局 ResponseInterceptor 包装为 { code: 0, message: 'success', data: DashboardStats }。
 */
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getStats() {
    return this.dashboardService.getStats()
  }
}
