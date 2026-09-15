<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 取路由匹配链中未隐藏的节点作为面包屑
const crumbs = computed(() =>
  route.matched
    .filter((r) => r.meta?.title && !r.meta?.hidden)
    .map((r) => ({ title: r.meta.title as string, path: r.path })),
)
</script>

<template>
  <el-breadcrumb separator="/" class="layout-breadcrumb">
    <el-breadcrumb-item v-for="(c, i) in crumbs" :key="c.path">
      <span v-if="i === crumbs.length - 1" class="current">{{ c.title }}</span>
      <router-link v-else :to="c.path">{{ c.title }}</router-link>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<style scoped>
.layout-breadcrumb {
  font-size: 14px;
}
.current {
  color: var(--el-text-color-secondary);
}
</style>
