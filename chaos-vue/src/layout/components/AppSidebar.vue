<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import AppSidebarItem from './AppSidebarItem.vue'

const route = useRoute()
const router = useRouter()

// 菜单取自布局父路由（path === '/'）的可见子路由
const menuRoutes = computed<RouteRecordRaw[]>(() => {
  const root = router.options.routes.find((r) => r.path === '/')
  const children = root?.children ?? []
  return children.filter((c) => !c.meta?.hidden)
})

const activeMenu = computed(() => route.path)
</script>

<template>
  <el-menu :default-active="activeMenu" router class="layout-menu" :collapse="false">
    <AppSidebarItem v-for="item in menuRoutes" :key="item.path" :item="item" :base-path="''" />
  </el-menu>
</template>

<style scoped>
.layout-menu {
  border-right: none;
  height: 100%;
}
</style>
