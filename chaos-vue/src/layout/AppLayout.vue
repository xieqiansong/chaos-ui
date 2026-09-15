<script setup lang="ts">
import AppSidebar from './components/AppSidebar.vue'
import AppBreadcrumb from './components/AppBreadcrumb.vue'
</script>

<template>
  <el-container class="layout">
    <el-aside width="220px" class="layout-aside">
      <div class="layout-logo">Chaos UI</div>
      <AppSidebar />
    </el-aside>

    <el-container class="layout-right">
      <el-header class="layout-header">
        <AppBreadcrumb />
      </el-header>

      <el-main class="layout-main">
        <router-view v-slot="{ Component }">
          <component :is="Component" />
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout {
  height: 100vh;
}

.layout-aside {
  background: var(--el-menu-bg-color, #fff);
  border-right: 1px solid var(--el-border-color-light);
  overflow: hidden;
}

.layout-logo {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-color-primary);
  border-bottom: 1px solid var(--el-border-color-light);
}

.layout-right {
  flex-direction: column;
}

.layout-header {
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color);
}

.layout-main {
  background: var(--el-fill-color-blank);
  padding: 16px;
}
</style>
