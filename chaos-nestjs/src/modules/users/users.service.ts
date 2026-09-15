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
}
