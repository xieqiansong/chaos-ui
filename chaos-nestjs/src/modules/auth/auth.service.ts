import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../users/user.entity'
import { LoginDto } from './dto/login.dto'
import { hashPassword, verifyPassword } from '../../common/auth/password'
import { signJwt } from '../../common/auth/jwt'
import { getUserPermissions } from '../../common/permissions'

export interface LoginResult {
  token: string
  user: {
    id: number
    username: string
    nickname: string
    /** 权限码集合，供前端按钮级权限控制（v-permission）使用 */
    permissions: string[]
  }
}

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 首次启动（库内无用户）时种入演示管理员账号：admin / admin123。
   * 便于 chaos-ui 直接联调登录；生产应移除或改为显式初始化脚本。
   */
  async onModuleInit() {
    const count = await this.userRepository.count()
    if (count === 0) {
      await this.userRepository.save(
        this.userRepository.create({
          username: 'admin',
          nickname: '管理员',
          enabled: true,
          password: hashPassword('admin123'),
        }),
      )
    }
  }

  /** 校验账号密码，成功返回不含 password 的用户信息 */
  async validateUser(
    username: string,
    password: string,
  ): Promise<LoginResult['user'] | null> {
    const user = await this.userRepository.findOne({ where: { username } })
    if (!user || !verifyPassword(password, user.password)) return null
    return {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      permissions: getUserPermissions(user.username),
    }
  }

  async login(dto: LoginDto): Promise<LoginResult> {
    const user = await this.validateUser(dto.username, dto.password)
    if (!user) throw new UnauthorizedException('账号或密码错误')
    const token = signJwt({ sub: user.id, username: user.username })
    return { token, user }
  }
}
