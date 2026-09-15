import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 50, unique: true })
  username: string

  @Column({ length: 50 })
  nickname: string

  @Column({ length: 120, nullable: true })
  email?: string

  @Column({ default: true })
  enabled: boolean

  /**
   * 登录密码哈希，格式 `salt:hash`（salt 与 hash 均为 hex）。
   * 由 common/auth/password 用 scrypt 计算，永不返回给前端。
   * 演示账号 admin 的密码在 AuthService.onModuleInit 中写入。
   */
  @Column({ length: 200, nullable: true })
  password?: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
