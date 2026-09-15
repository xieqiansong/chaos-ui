import type { DictItem } from '@/types/dict'
import { get } from '@/utils/request'

/** 获取某类字典项列表：GET /api/dicts/:type */
export function fetchDict(type: string): Promise<DictItem[]> {
  return get<DictItem[]>(`/dicts/${type}`)
}
