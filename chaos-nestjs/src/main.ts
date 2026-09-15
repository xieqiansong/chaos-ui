import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'
import { ResponseInterceptor } from './common/response/response.interceptor'
import { AllExceptionsFilter } from './common/exception/all-exceptions.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // 全局前缀 /api：与 chaos-ui 前端约定（VITE_API_BASE_URL 缺省 /api）对齐，
  // 配合 chaos-ui 的 Vite 开发代理 /api -> http://localhost:30048 即可免 CORS。
  app.setGlobalPrefix('api')

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  app.useGlobalInterceptors(new ResponseInterceptor())
  app.useGlobalFilters(new AllExceptionsFilter())

  const port = Number(process.env.PORT) || 30048
  await app.listen(port)
  // eslint-disable-next-line no-console
  console.log(`chaos-nestjs is running on http://localhost:${port}/api`)
}

bootstrap()
