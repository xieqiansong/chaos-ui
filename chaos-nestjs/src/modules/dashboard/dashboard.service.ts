import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../users/user.entity'

/** 单日新增趋势条目：日期（本地 YYYY-MM-DD）+ 当日新增用户数 */
export interface DashboardTrendItem {
  date: string
  count: number
}

/**
 * 仪表盘统计：仅统计后端可真实计算的指标（不编造访问/订单等业务数据）。
 * trend 为近 7 天（含今日）每日新增用户数，供前端折线 / 柱状图使用。
 */
export interface DashboardStats {
  /** 用户总数 */
  userCount: number
  /** 启用用户数 */
  enabledUserCount: number
  /** 禁用用户数 */
  disabledUserCount: number
  /** 今日新增用户数 */
  todayUserCount: number
  /** 近 7 天每日新增用户数（含今日） */
  trend: DashboardTrendItem[]
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getStats(): Promise<DashboardStats> {
    const userCount = await this.userRepository.count()
    const enabledUserCount = await this.userRepository.count({ where: { enabled: true } })
    const disabledUserCount = await this.userRepository.count({ where: { enabled: false } })

    // 今日 00:00:00 起创建的账号（本地时间）
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayUserCount = await this.userRepository
      .createQueryBuilder('user')
      .where('user.createdAt >= :start', { start: todayStart.toISOString() })
      .getCount()

    const trend = await this.getWeeklyTrend()

    return { userCount, enabledUserCount, disabledUserCount, todayUserCount, trend }
  }

  // 近 7 天（含今日）每日新增用户数；无新增的日期补 0，保证折线 / 柱状图坐标轴连续
  private async getWeeklyTrend(): Promise<DashboardTrendItem[]> {
    const days = 7
    const result: DashboardTrendItem[] = []
    const now = new Date()
    for (let i = days - 1; i >= 0; i--) {
      const day = new Date(now)
      day.setDate(now.getDate() - i)
      day.setHours(0, 0, 0, 0)
      const next = new Date(day)
      next.setDate(day.getDate() + 1)
      const count = await this.userRepository
        .createQueryBuilder('user')
        .where('user.createdAt >= :start AND user.createdAt < :end', {
          start: day.toISOString(),
          end: next.toISOString(),
        })
        .getCount()
      result.push({ date: formatLocalDate(day), count })
    }
    return result
  }
}

// 本地日期格式化为 YYYY-MM-DD（避免 toISOString 的 UTC 偏移导致坐标轴标签错位）
function formatLocalDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
