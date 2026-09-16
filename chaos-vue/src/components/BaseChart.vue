<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

const props = withDefaults(
  defineProps<{
    /** ECharts 配置项，变化时自动重绘 */
    option: EChartsOption
    /** 容器高度，默认 320px */
    height?: string
  }>(),
  { height: '320px' },
)

const el = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null
let observer: ResizeObserver | null = null

// 应用配置项；notMerge=true 整体替换，避免旧 series 残留
function render() {
  if (!chart || !props.option) return
  chart.setOption(props.option, true)
}

onMounted(() => {
  if (!el.value) return
  chart = echarts.init(el.value)
  render()
  // 监听容器尺寸变化自动 resize（比 window resize 更精准，适配侧边栏折叠等）
  observer = new ResizeObserver(() => chart?.resize())
  observer.observe(el.value)
})

// option 变化（如切换数据 / 路由）时重绘
watch(() => props.option, render, { deep: true })

// 组件卸载：断开观察器 + 销毁实例，防止内存泄漏
onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
  chart?.dispose()
  chart = null
})
</script>

<template>
  <div ref="el" class="base-chart" :style="{ height }" />
</template>

<style scoped>
.base-chart {
  width: 100%;
}
</style>
