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

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
