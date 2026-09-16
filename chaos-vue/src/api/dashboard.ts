import { get } from '@/utils/request'

/** 单日新增趋势条目，对齐 chaos-nestjs DashboardTrendItem */
export interface DashboardTrendItem {
  date: string
  count: number
}

/** 仪表盘统计，对齐 chaos-nestjs DashboardStats */
export interface DashboardStats {
  userCount: number
  enabledUserCount: number
  disabledUserCount: number
  todayUserCount: number
  trend: DashboardTrendItem[]
}

/** 获取仪表盘统计：GET /api/dashboard/stats */
export function fetchDashboardStats(): Promise<DashboardStats> {
  return get<DashboardStats>('/dashboard/stats')
}
