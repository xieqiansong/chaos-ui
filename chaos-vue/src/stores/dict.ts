import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchDict } from '@/api/dict'
import type { DictItem } from '@/types/dict'

/**
 * 字典 store：前端侧缓存，避免每个页面重复拉取。
 * 数据单一真源仍在后端（/api/dicts/:type），这里只做读取缓存。
 */
export const useDictStore = defineStore('dict', () => {
  const cache = ref<Record<string, DictItem[]>>({})

  /** 拉取并缓存某类字典（已缓存则直接返回） */
  async function load(type: string): Promise<DictItem[]> {
    if (!cache.value[type]) {
      cache.value[type] = await fetchDict(type)
    }
    return cache.value[type]
  }

  /** 同步读取已缓存的字典项（未加载则返回空数组） */
  function get(type: string): DictItem[] {
    return cache.value[type] ?? []
  }

  /** 按 value 取展示文案；未命中返回原始值的字符串形式 */
  function getLabel(type: string, value: number | string): string {
    const item = find(type, value)
    return item?.label ?? String(value)
  }

  /** 按 value 取颜色（el-tag type） */
  function getColor(type: string, value: number | string): DictItem['color'] {
    return find(type, value)?.color
  }

  function find(type: string, value: number | string): DictItem | undefined {
    return get(type).find((i) => i.value === value || String(i.value) === String(value))
  }

  return { cache, load, get, getLabel, getColor }
})
