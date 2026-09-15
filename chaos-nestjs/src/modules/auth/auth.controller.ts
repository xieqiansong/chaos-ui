import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { JwtAuthGuard } from './jwt-auth.guard'
import { AuthUser } from './auth-user.decorator'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** POST /api/auth/login：账号密码换取 { token, user } */
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  /** GET /api/auth/profile：需登录，返回当前用户信息（演示路由守卫） */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  profile(@AuthUser() user: { id: number; username: string }) {
    return user
  }
}
