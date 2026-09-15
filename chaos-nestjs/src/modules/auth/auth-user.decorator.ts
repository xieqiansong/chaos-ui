import { createParamDecorator, ExecutionContext } from '@nestjs/common'

/** 从请求中取出 JwtAuthGuard 注入的当前用户：@AuthUser() user */
export const AuthUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().user,
)
