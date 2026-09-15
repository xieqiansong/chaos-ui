import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto'
import { PageResult } from '../../common/pagination/page-result.interface'

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

  async findAll(page = 1, size = 10): Promise<PageResult<User>> {
    const [items, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * size,
      take: size,
      order: { id: 'ASC' },
    })
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
}
