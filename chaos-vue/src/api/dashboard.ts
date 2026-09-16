import { get } from '@/utils/request'

/** 仪表盘统计：与 chaos-nestjs DashboardStats 对齐（仅真实可计算指标） */
export interface DashboardStats {
  userCount: number
  enabledUserCount: number
  disabledUserCount: number
  todayUserCount: number
}

/** 获取仪表盘统计：GET /api/dashboard/stats */
export function fetchDashboardStats(): Promise<DashboardStats> {
  return get<DashboardStats>('/dashboard/stats')
}
