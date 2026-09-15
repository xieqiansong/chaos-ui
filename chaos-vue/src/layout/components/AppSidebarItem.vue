<script setup lang="ts">
import { computed } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import type { Component } from 'vue'
import type { RouteRecordRaw } from 'vue-router'

const props = defineProps<{
  item: RouteRecordRaw
  basePath: string
}>()

const visibleChildren = computed(() =>
  (props.item.children ?? []).filter((c) => !c.meta?.hidden),
)

// 仅有一个可见子路由且不强制分组时，直接展示该子路由
const singleChild = computed(() =>
  visibleChildren.value.length === 1 && !props.item.meta?.alwaysShow
    ? visibleChildren.value[0]
    : undefined,
)

const showSubMenu = computed(() => visibleChildren.value.length > 1)

function resolvePath(path: string): string {
  if (path.startsWith('/')) return path
  const base = props.basePath.replace(/\/$/, '')
  return `${base}/${path}`
}

const resolvedPath = computed(() =>
  resolvePath(singleChild.value ? singleChild.value.path : props.item.path),
)

const iconName = computed(() => singleChild.value?.meta?.icon ?? props.item.meta?.icon)
const iconComp = computed<Component | undefined>(() =>
  iconName.value
    ? ((ElementPlusIconsVue as Record<string, Component>)[iconName.value] ?? undefined)
    : undefined,
)

const title = computed(
  () => singleChild.value?.meta?.title ?? props.item.meta?.title ?? '',
)
</script>

<template>
  <el-sub-menu v-if="showSubMenu" :index="resolvedPath">
    <template #title>
      <el-icon v-if="iconComp"><component :is="iconComp" /></el-icon>
      <span>{{ title }}</span>
    </template>
    <AppSidebarItem
      v-for="child in visibleChildren"
      :key="child.path"
      :item="child"
      :base-path="resolvedPath"
    />
  </el-sub-menu>

  <el-menu-item v-else :index="resolvedPath">
    <el-icon v-if="iconComp"><component :is="iconComp" /></el-icon>
    <template #title>{{ title }}</template>
  </el-menu-item>
</template>
