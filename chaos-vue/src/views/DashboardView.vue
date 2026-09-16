<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { EChartsOption } from 'echarts'
import BaseChart from '@/components/BaseChart.vue'
import { fetchDashboardStats, type DashboardStats } from '@/api/dashboard'
import { showError } from '@/utils/message'

const loading = ref(false)
const stats = ref<DashboardStats | null>(null)

// 顶部指标卡：label + 取值字段，渲染时从 stats 取数
const cards = [
  { label: '用户总数', field: 'userCount' as const },
  { label: '启用用户', field: 'enabledUserCount' as const },
  { label: '禁用用户', field: 'disabledUserCount' as const },
  { label: '今日新增', field: 'todayUserCount' as const },
]

// ---------- 饼图：用户状态分布（启用 vs 禁用，真实可计算） ----------
const statusPieOption = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'item' },
  legend: { bottom: 0 },
  series: [
    {
      name: '用户状态',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}: {c}' },
      data: [
        { name: '启用', value: stats.value?.enabledUserCount ?? 0 },
        { name: '禁用', value: stats.value?.disabledUserCount ?? 0 },
      ],
    },
  ],
}))

// 近 7 天新增趋势（折线 + 柱状，复用同一份趋势数据）
const trendDates = computed(() => stats.value?.trend.map((t) => t.date) ?? [])
const trendCounts = computed(() => stats.value?.trend.map((t) => t.count) ?? [])

const trendLineOption = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: 40, right: 20, top: 30, bottom: 30 },
  xAxis: { type: 'category', data: trendDates.value, boundaryGap: false },
  yAxis: { type: 'value', minInterval: 1 },
  series: [
    {
      name: '新增用户',
      type: 'line',
      smooth: true,
      areaStyle: {},
      data: trendCounts.value,
    },
  ],
}))

const trendBarOption = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: 40, right: 20, top: 30, bottom: 30 },
  xAxis: { type: 'category', data: trendDates.value },
  yAxis: { type: 'value', minInterval: 1 },
  series: [
    {
      name: '新增用户',
      type: 'bar',
      barWidth: '50%',
      data: trendCounts.value,
    },
  ],
}))

async function load() {
  loading.value = true
  try {
    stats.value = await fetchDashboardStats()
  } catch {
    // 拦截器已提示
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="dashboard">
    <h2 class="page-title">仪表盘</h2>

    <!-- 指标卡 -->
    <div v-loading="loading" class="stat-row">
      <el-row :gutter="16">
        <el-col v-for="c in cards" :key="c.field" :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-label">{{ c.label }}</div>
            <div class="stat-value">{{ stats ? stats[c.field] : '-' }}</div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 图表区：饼图 + 折线 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :span="8">
        <el-card shadow="never" header="用户状态分布">
          <BaseChart :option="statusPieOption" height="300px" />
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-card shadow="never" header="近 7 天新增趋势（折线）">
          <BaseChart :option="trendLineOption" height="300px" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 柱状图 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :span="24">
        <el-card shadow="never" header="近 7 天新增趋势（柱状）">
          <BaseChart :option="trendBarOption" height="320px" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.page-title {
  margin: 0 0 16px;
  font-size: 20px;
}
.stat-card {
  margin-bottom: 16px;
}
.stat-label {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}
.stat-value {
  font-size: 28px;
  font-weight: 600;
  margin-top: 8px;
}
.chart-row {
  margin-bottom: 16px;
}
</style>
