import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersModule } from './modules/users/users.module'
import { AuthModule } from './modules/auth/auth.module'
import { DictsModule } from './modules/dicts/dicts.module'

@Module({
  imports: [
    // 读取项目根目录 .env 注入 process.env
    ConfigModule.forRoot({ isGlobal: true }),
    // SQLite（better-sqlite3 驱动），autoLoadEntities 自动加载各模块注册的实体
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.DB_FILE || 'chaos-nestjs.sqlite',
      autoLoadEntities: true,
      synchronize: true, // 学习项目：根据实体自动建表；生产环境应改为迁移
    }),
    UsersModule,
    AuthModule,
    DictsModule,
  ],
})
export class AppModule {}
