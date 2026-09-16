import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname, join } from 'path'
import { mkdirSync } from 'fs'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

// 上传根目录：项目根 uploads/（运行时生成，已 gitignore）
export const UPLOAD_DIR = join(process.cwd(), 'uploads')
mkdirSync(UPLOAD_DIR, { recursive: true })

// 与 multer 上传文件结构兼容的最小类型（multer 2.x 不再补充 Express.Multer 命名空间）
interface UploadedFile {
  fieldname: string
  originalname: string
  encoding: string
  mimetype: string
  size: number
  destination: string
  filename: string
  path: string
  buffer?: Buffer
}

/**
 * 文件上传接口（需登录，与前端「个人中心」头像/附件上传对齐）。
 * POST /api/files/upload —— 表单字段名固定为 file，multer 落盘后返回可访问 URL。
 * 返回 { url }，由全局 ResponseInterceptor 包成 { code: 0, message: 'success', data: { url } }，
 * 前端 upload 的 on-success 取 res.data.url。
 * 文件静态访问由 main.ts 的 express.static('/api/files') 提供。
 */
@UseGuards(JwtAuthGuard)
@Controller('files')
export class UploadsController {
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: () => UPLOAD_DIR,
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname)
          const rand = Math.random().toString(36).slice(2, 8)
          cb(null, `${Date.now()}-${rand}${ext}`)
        },
      }),
      // 服务端兜底限制：单文件 ≤ 10MB（前端另有更细的按类型限制）
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  uploadFile(@UploadedFile() file: UploadedFile) {
    if (!file) {
      throw new BadRequestException('未收到文件')
    }
    return { url: `/api/files/${file.filename}` }
  }
}
