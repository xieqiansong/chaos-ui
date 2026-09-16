import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import * as XLSX from 'xlsx'
import { UsersService } from './users.service'
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { UserQueryDto } from './dto/user-query.dto'
import { BatchDeleteDto } from './dto/batch-delete.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { AuthUser } from '../auth/auth-user.decorator'

// multer 2.x 不再补充 Express.Multer 命名空间，这里用最小兼容类型
interface UploadedFile {
  fieldname: string
  originalname: string
  encoding: string
  mimetype: string
  size: number
  buffer: Buffer
  destination?: string
  filename?: string
  path?: string
}

// 用户管理接口需登录：校验 Authorization: Bearer <token>
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto)
  }

  @Get()
  findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query)
  }

  // 当前用户资料：GET /api/users/me（需登录），静态路由须置于 :id 之前
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@AuthUser() user: { id: number }) {
    return this.usersService.getProfile(user.id)
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id)
  }

  // 更新当前用户资料：PUT /api/users/me（需登录）
  @Put('me')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @AuthUser() user: { id: number },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, dto)
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto)
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id)
  }

  @Delete()
  removeMany(@Body() dto: BatchDeleteDto) {
    return this.usersService.removeMany(dto.ids)
  }

  // 导出：后端生成 xlsx 并以二进制流返回（经响应拦截器透传，前端直接下载）
  @Get('export')
  async exportUsers(): Promise<StreamableFile> {
    const users = await this.usersService.exportAll()
    const data = users.map((u) => ({
      用户ID: u.id,
      用户名: u.username,
      昵称: u.nickname,
      邮箱: u.email ?? '',
      状态: u.enabled ? '启用' : '禁用',
      创建时间: new Date(u.createdAt).toISOString().replace('T', ' ').slice(0, 19),
      更新时间: new Date(u.updatedAt).toISOString().replace('T', ' ').slice(0, 19),
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '用户')
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
    return new StreamableFile(buf, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: 'attachment; filename="users.xlsx"',
    })
  }

  // 导入：接收 xlsx，内存解析后落库（已存在用户名跳过），返回导入/跳过计数
  @Post('import')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  importUsers(@UploadedFile() file: UploadedFile) {
    if (!file) {
      throw new BadRequestException('未收到文件')
    }
    const wb = XLSX.read(file.buffer, { type: 'buffer' })
    const sheet = wb.Sheets[wb.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet)
    return this.usersService.importUsers(rows)
  }
}
