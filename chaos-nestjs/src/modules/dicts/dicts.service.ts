import { Injectable } from '@nestjs/common'
import { UserStatus } from '../../common/enums/user-status.enum'

/** 字典项：value 为后端存储值，label 为展示文案，color 为 el-tag 颜色类型 */
export interface DictItem {
  value: number | string
  label: string
  color?: 'success' | 'info' | 'warning' | 'danger' | 'primary'
}

/**
 * 字典服务：集中维护所有枚举文案与颜色（单一真源）。
 *
 * 前端不再各自硬编码「启用/禁用」等中文与颜色，统一从这里取；
 * 后续新增枚举只需在此注册表追加一项即可。
 */
@Injectable()
export class DictsService {
  private readonly registry: Record<string, DictItem[]> = {
    'user-status': [
      { value: UserStatus.ENABLED, label: '启用', color: 'success' },
      { value: UserStatus.DISABLED, label: '禁用', color: 'info' },
    ],
  }

  /** 按字典类型返回项列表；类型不存在时返回空数组 */
  getDict(type: string): DictItem[] {
    return this.registry[type] ?? []
  }
}
