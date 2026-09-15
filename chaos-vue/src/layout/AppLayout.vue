<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { ArrowDown, SwitchButton, User } from '@element-plus/icons-vue'
import AppSidebar from './components/AppSidebar.vue'
import AppBreadcrumb from './components/AppBreadcrumb.vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const username = computed(
  () => userStore.userInfo?.nickname || userStore.userInfo?.username || '用户',
)

/** 退出登录：二次确认 → 清空 token → 跳登录页 */
async function onLogout() {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      type: 'warning',
      confirmButtonText: '退出',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }
  userStore.logout()
  router.push('/login')
}
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
        <el-dropdown class="layout-user" trigger="click">
          <span class="layout-user-trigger">
            <el-icon><User /></el-icon>
            <span class="layout-user-name">{{ username }}</span>
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="onLogout">
                <el-icon><SwitchButton /></el-icon>
                <span>退出登录</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
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
  justify-content: space-between;
  border-bottom: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color);
}

.layout-user {
  cursor: pointer;
}

.layout-user-trigger {
  display: flex;
  align-items: center;
  gap: 4px;
  outline: none;
}

.layout-user-name {
  font-size: 14px;
}

.layout-main {
  background: var(--el-fill-color-blank);
  padding: 16px;
}
</style>
