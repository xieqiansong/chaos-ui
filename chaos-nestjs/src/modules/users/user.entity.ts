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

  // ---------- 个人资料扩展字段（个人中心可编辑） ----------
  /** 头像 URL（上传后由前端回传） */
  @Column({ length: 255, nullable: true })
  avatar?: string

  /** 手机号 */
  @Column({ length: 20, nullable: true })
  phone?: string

  /** 省份 */
  @Column({ length: 50, nullable: true })
  province?: string

  /** 城市 */
  @Column({ length: 50, nullable: true })
  city?: string

  /** 详细地址 */
  @Column({ length: 255, nullable: true })
  address?: string

  /**
   * 扩展资料（JSON）：承载动态表单字段与附件 URL 等，
   * 如 { website, gender, bio, attachments: string[] }。
   * 用 simple-json 存为文本，避免为演示字段频繁改表。
   */
  @Column({ type: 'simple-json', nullable: true })
  extra?: Record<string, unknown>

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
