import { Injectable } from '@nestjs/common'
import { UserStatus } from '../../common/enums/user-status.enum'

/** 字典项：value 为后端存储值，label 为展示文案，color 为 el-tag 颜色类型 */
export interface DictItem {
  value: number | string
  label: string
  color?: 'success' | 'info' | 'warning' | 'danger' | 'primary'
  /** 子级（如省市区联动的「市」列表），扁平枚举可省略 */
  children?: DictItem[]
}

/**
 * 字典服务：集中维护所有枚举文案与颜色（单一真源）。
 *
 * 前端不再各自硬编码「启用/禁用」「省市」等中文与层级，统一从这里取；
 * 后续新增枚举只需在此注册表追加一项即可。
 */
@Injectable()
export class DictsService {
  private readonly registry: Record<string, DictItem[]> = {
    'user-status': [
      { value: UserStatus.ENABLED, label: '启用', color: 'success' },
      { value: UserStatus.DISABLED, label: '禁用', color: 'info' },
    ],
    // 省 → 市 联动字典（value/label 用名称，children 为下属城市）
    region: [
      {
        value: '广东省',
        label: '广东省',
        children: [
          { value: '广州市', label: '广州市' },
          { value: '深圳市', label: '深圳市' },
          { value: '珠海市', label: '珠海市' },
        ],
      },
      {
        value: '浙江省',
        label: '浙江省',
        children: [
          { value: '杭州市', label: '杭州市' },
          { value: '宁波市', label: '宁波市' },
          { value: '温州市', label: '温州市' },
        ],
      },
      {
        value: '四川省',
        label: '四川省',
        children: [
          { value: '成都市', label: '成都市' },
          { value: '绵阳市', label: '绵阳市' },
          { value: '宜宾市', label: '宜宾市' },
        ],
      },
    ],
  }

  /** 按字典类型返回项列表；类型不存在时返回空数组 */
  getDict(type: string): DictItem[] {
    return this.registry[type] ?? []
  }
}

