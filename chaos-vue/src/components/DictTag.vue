<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useDictStore } from '@/stores/dict'

const props = withDefaults(
  defineProps<{
    /** 字典类型，对应后端 /api/dicts/:type */
    dict: string
    /** 当前值（与字典项的 value 比对，支持 number / string 互比） */
    value: number | string
    /** 字典未命中时的兜底文案 */
    empty?: string
  }>(),
  { empty: '-' },
)

const dictStore = useDictStore()

// 确保字典已加载（页面首次进入若尚未拉取则此处补拉）
onMounted(() => {
  if (!dictStore.get(props.dict).length) {
    dictStore.load(props.dict)
  }
})

const item = computed(() => dictStore.get(props.dict).find(
  (i) => i.value === props.value || String(i.value) === String(props.value),
))
const label = computed(() => item.value?.label ?? props.empty)
const color = computed(() => item.value?.color ?? 'info')
</script>

<template>
  <el-tag :type="color" disable-transitions>{{ label }}</el-tag>
</template>
