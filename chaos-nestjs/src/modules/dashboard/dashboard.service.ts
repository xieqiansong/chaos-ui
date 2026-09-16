import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../users/user.entity'

/** 仪表盘统计：仅统计后端可真实计算的指标（不编造访问/订单等业务数据） */
export interface DashboardStats {
  /** 用户总数 */
  userCount: number
  /** 启用用户数 */
  enabledUserCount: number
  /** 禁用用户数 */
  disabledUserCount: number
  /** 今日新增用户数 */
  todayUserCount: number
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

    // 今日 00:00:00 起创建的账号
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayUserCount = await this.userRepository
      .createQueryBuilder('user')
      .where('user.createdAt >= :start', { start: todayStart.toISOString() })
      .getCount()

    return { userCount, enabledUserCount, disabledUserCount, todayUserCount }
  }
}
