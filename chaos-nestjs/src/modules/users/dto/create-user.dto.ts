import { IsBoolean, IsEmail, IsOptional, IsString, Length } from 'class-validator'

export class CreateUserDto {
  @IsString()
  @Length(3, 50)
  username: string

  @IsString()
  @Length(1, 50)
  nickname: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsBoolean()
  enabled?: boolean
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  nickname?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  enabled?: boolean
}
