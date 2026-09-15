import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto'
import { UserQueryDto } from './dto/user-query.dto'
import { PageResult } from '../../common/pagination/page-result.interface'
import { UserStatus } from '../../common/enums/user-status.enum'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(dto)
    return this.userRepository.save(user)
  }

  async findAll(query: UserQueryDto): Promise<PageResult<User>> {
    const { page = 1, size = 10, username, status, startDate, endDate } = query

    const qb = this.userRepository.createQueryBuilder('user')

    if (username) {
      qb.andWhere('user.username LIKE :username', { username: `%${username}%` })
    }
    if (status !== undefined && status !== null) {
      qb.andWhere('user.enabled = :enabled', { enabled: status === UserStatus.ENABLED })
    }
    if (startDate) {
      qb.andWhere('user.createdAt >= :startDate', { startDate: `${startDate} 00:00:00` })
    }
    if (endDate) {
      qb.andWhere('user.createdAt <= :endDate', { endDate: `${endDate} 23:59:59` })
    }

    qb.orderBy('user.id', 'ASC').skip((page - 1) * size).take(size)

    const [items, total] = await qb.getManyAndCount()
    return { items, total, page, size }
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id })
    if (!user) {
      throw new NotFoundException(`User ${id} not found`)
    }
    return user
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    await this.findOne(id)
    await this.userRepository.update(id, dto)
    return this.findOne(id)
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id)
    await this.userRepository.delete(id)
  }

  async removeMany(ids: number[]): Promise<{ deleted: number }> {
    if (!ids.length) return { deleted: 0 }
    const result = await this.userRepository.delete(ids)
    return { deleted: result.affected ?? 0 }
  }

  // 导出：返回全部用户（不分页），供后端生成 Excel
  async exportAll(): Promise<User[]> {
    return this.userRepository.find({ order: { id: 'ASC' } })
  }

  // 导入：解析后的行数据落库，已存在用户名跳过
  async importUsers(
    rows: Record<string, unknown>[],
  ): Promise<{ imported: number; skipped: number }> {
    let imported = 0
    let skipped = 0
    for (const row of rows) {
      const username = String(row['用户名'] ?? row['username'] ?? '').trim()
      if (!username) {
        skipped++
        continue
      }
      // 用户名唯一：已存在则跳过，避免冲突
      if (await this.userRepository.existsBy({ username })) {
        skipped++
        continue
      }
      const nickname = String(row['昵称'] ?? row['nickname'] ?? username).trim()
      const emailRaw = row['邮箱'] ?? row['email']
      const email = emailRaw ? String(emailRaw) : undefined
      const statusRaw = row['状态'] ?? row['status'] ?? row['enabled']
      const user = this.userRepository.create({
        username,
        nickname,
        email,
        enabled: this.parseStatus(statusRaw),
      })
      // 演示导入不处理密码，仅补充列表数据
      await this.userRepository.save(user)
      imported++
    }
    return { imported, skipped }
  }

  // 状态字段多种写法统一映射为 boolean
  private parseStatus(v: unknown): boolean {
    if (v === undefined || v === null || v === '') return true
    if (typeof v === 'boolean') return v
    const s = String(v).trim()
    if (['启用', '1', 'true', 'ENABLED', 'enabled'].includes(s)) return true
    if (['禁用', '0', 'false', 'DISABLED', 'disabled'].includes(s)) return false
    return true
  }
}
