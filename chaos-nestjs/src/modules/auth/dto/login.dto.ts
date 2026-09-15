import { IsNotEmpty, IsString } from 'class-validator'

/** 登录入参，与 chaos-ui 前端 auth.ts 的 LoginParams 对齐 */
export class LoginDto {
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString()
  username: string

  @IsNotEmpty({ message: '密码不能为空' })
  @IsString()
  password: string
}
