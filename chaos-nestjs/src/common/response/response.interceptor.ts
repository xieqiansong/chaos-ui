import { CallHandler, ExecutionContext, Injectable, NestInterceptor, StreamableFile } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { ApiResponse } from './api-response.interface'

/**
 * 统一成功响应包装：把控制器返回值包成 { code: 0, message: 'success', data }。
 * 错误响应由 AllExceptionsFilter 统一包装，不在此处理。
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T> | StreamableFile> {
  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T> | StreamableFile> {
    return next.handle().pipe(
      map((data) => {
        // 二进制响应（文件流 / Buffer）透传，不走统一结构包装，供前端直接下载
        if (data instanceof StreamableFile || Buffer.isBuffer(data as unknown as Buffer)) {
          return data as ApiResponse<T> | StreamableFile
        }
        return {
          code: 0,
          message: 'success',
          data: data as T,
        }
      }),
    )
  }
}
