<script setup lang="ts">
import { ref } from 'vue'

const stats = ref([
  { label: '用户数', value: 1280 },
  { label: '今日访问', value: 342 },
  { label: '订单数', value: 87 },
  { label: '待处理', value: 12 },
])
</script>

<template>
  <div class="dashboard">
    <h2 class="page-title">仪表盘</h2>

    <el-row :gutter="16">
      <el-col v-for="item in stats" :key="item.label" :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">{{ item.label }}</div>
          <div class="stat-value">{{ item.value }}</div>
        </el-card>
      </el-col>
    </el-row>

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
