import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { verifyJwt } from '../../common/auth/jwt'

/**
 * 路由守卫：校验 Authorization: Bearer <token>，校验通过将用户信息挂到 request.user。
 * 配合 @UseGuards(JwtAuthGuard) 使用；401 会经全局 AllExceptionsFilter 包成统一结构。
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const auth = request.headers?.authorization
    if (!auth || !auth.startsWith('Bearer ')) {
      throw new UnauthorizedException('未登录或 token 缺失')
    }
    try {
      const payload = verifyJwt(auth.slice('Bearer '.length))
      request.user = { id: payload.sub, username: payload.username }
      return true
    } catch {
      throw new UnauthorizedException('token 无效或已过期')
    }
  }
}
