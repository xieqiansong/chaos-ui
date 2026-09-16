import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { QueryDeepPartialEntity, Repository } from 'typeorm'
import { User } from './user.entity'
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { UserQueryDto } from './dto/user-query.dto'
import { PageResult } from '../../common/pagination/page-result.interface'
import { UserStatus } from '../../common/enums/user-status.enum'
import { hashPassword } from '../../common/auth/password'

/** 对外用户结构：永不携带 password 字段 */
export type PublicUser = Omit<User, 'password'>

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /** 抹掉敏感字段（password），统一对外输出用户结构 */
  private toPublicUser(user: User): PublicUser {
    const { password: _password, ...rest } = user
    return rest
  }

  async create(dto: CreateUserDto): Promise<PublicUser> {
    const user = this.userRepository.create(dto)
    const saved = await this.userRepository.save(user)
    return this.toPublicUser(saved)
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
    return { items: items.map((u) => this.toPublicUser(u)), total, page, size }
  }

  async findOne(id: number): Promise<PublicUser> {
    const user = await this.userRepository.findOneBy({ id })
    if (!user) {
      throw new NotFoundException(`User ${id} not found`)
    }
    return this.toPublicUser(user)
  }

  /** 获取当前登录用户资料（个人中心回显用），不含 password */
  async getProfile(id: number): Promise<PublicUser> {
    return this.findOne(id)
  }

  /**
   * 更新当前登录用户资料。
   * password 仅当显式传入时才重新哈希；其余字段按需更新（undefined 表示不动）。
   */
  async updateProfile(id: number, dto: UpdateProfileDto): Promise<PublicUser> {
    const user = await this.userRepository.findOneBy({ id })
    if (!user) {
      throw new NotFoundException(`User ${id} not found`)
    }
    // 用宽松对象收集变更字段，再整体转换为 TypeORM 深局部实体类型，
    // 规避 simple-json 列（extra）在 QueryDeepPartialEntity 成员赋值时的类型限制
    const patch: Record<string, unknown> = {}
    if (dto.nickname !== undefined) patch.nickname = dto.nickname
    if (dto.email !== undefined) patch.email = dto.email
    if (dto.phone !== undefined) patch.phone = dto.phone
    if (dto.province !== undefined) patch.province = dto.province
    if (dto.city !== undefined) patch.city = dto.city
    if (dto.address !== undefined) patch.address = dto.address
    if (dto.avatar !== undefined) patch.avatar = dto.avatar
    if (dto.extra !== undefined) patch.extra = dto.extra
    if (dto.password) patch.password = hashPassword(dto.password)

    await this.userRepository.update(id, patch as QueryDeepPartialEntity<User>)
    return this.findOne(id)
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
