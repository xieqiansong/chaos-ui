<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { fetchDashboardStats, type DashboardStats } from '@/api/dashboard'
import { showError } from '@/utils/message'

const loading = ref(false)
const stats = ref<DashboardStats | null>(null)

// 卡片元数据：label + 取值字段，渲染时从 stats 取数
const cards = [
  { label: '用户总数', field: 'userCount' as const },
  { label: '启用用户', field: 'enabledUserCount' as const },
  { label: '禁用用户', field: 'disabledUserCount' as const },
  { label: '今日新增', field: 'todayUserCount' as const },
]

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

    <el-card class="placeholder" shadow="never">
      <el-empty description="在此放置图表 / 表格等核心内容" />
    </el-card>
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
.placeholder {
  min-height: 320px;
}
</style>
