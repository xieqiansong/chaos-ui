import { IsEmail, IsOptional, IsString, Length } from 'class-validator'

/**
 * 个人资料更新 DTO，与 chaos-ui 个人中心（ProfileSettingsView）表单对齐。
 * 仅暴露用户可自行修改的字段，enabled（启用状态）等管理员字段不在其中。
 * password 可选：留空表示不修改密码；填写则经 UsersService 用 scrypt 重新哈希。
 * extra 承载动态表单字段（website / gender / bio / attachments 等）以 JSON 落库，
 * 为任意结构对象，不做嵌套校验（亦不使用 @Type，避免 class-transformer 把嵌套对象清空）。
 */
export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  nickname?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  @Length(0, 20)
  phone?: string

  @IsOptional()
  @IsString()
  @Length(0, 50)
  province?: string

  @IsOptional()
  @IsString()
  @Length(0, 50)
  city?: string

  @IsOptional()
  @IsString()
  @Length(0, 255)
  address?: string

  @IsOptional()
  @IsString()
  @Length(0, 255)
  avatar?: string

  @IsOptional()
  @IsString()
  @Length(6, 20, { message: '密码长度需 6-20 位' })
  password?: string

  @IsOptional()
  extra?: Record<string, unknown>
}
