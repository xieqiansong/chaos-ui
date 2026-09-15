import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'
import { ResponseInterceptor } from './common/response/response.interceptor'
import { AllExceptionsFilter } from './common/exception/all-exceptions.filter'
import { UPLOAD_DIR } from './modules/uploads/uploads.controller'
import express from 'express'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // 静态文件服务：上传的文件经 /api/files/<filename> 直接访问。
  // 挂在原始 express 实例上（早于 NestJS 路由），因此不经过全局响应拦截器，
  // 且随 Vite 的 /api 代理一并转发到后端，前端 img/附件可直接加载。
  app.use('/api/files', express.static(UPLOAD_DIR))

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
