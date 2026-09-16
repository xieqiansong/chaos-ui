import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Layout from '@/layout/AppLayout.vue'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: {
      title: '登录',
      hidden: true,
      // 白名单：显式声明为公开路由；其余路由默认均需登录（安全优先）
      public: true,
    },
  },
  {
    // 布局父路由：左侧菜单 + 顶部 + 内容区
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    meta: {
      title: '主页',
    },
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/DashboardView.vue'),
        meta: {
          title: '仪表盘',
          icon: 'Odometer',
        },
      },
      {
        path: 'about',
        name: 'about',
        component: () => import('@/views/AboutView.vue'),
        meta: {
          title: '关于',
          icon: 'InfoFilled',
        },
      },
      {
        path: 'users',
        name: 'users',
        component: () => import('@/views/UserListView.vue'),
        meta: {
          title: '用户管理',
          icon: 'User',
        },
      },
      {
        // 用户详情：从列表页带 id 跳转；hidden 使其不出现在侧边栏菜单
        path: 'users/:id',
        name: 'user-detail',
        component: () => import('@/views/UserDetailView.vue'),
        meta: {
          title: '用户详情',
          hidden: true,
        },
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/views/ProfileSettingsView.vue'),
        meta: {
          title: '个人中心',
          icon: 'Setting',
        },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 全局前置守卫：设置页面标题 + 登录校验
router.beforeEach((to) => {
  // 设置页面标题
  document.title = (to.meta.title as string) || 'Chaos UI'

  // 登录校验：读取用户 store 中的 token（与 localStorage 同步）
  const userStore = useUserStore()
  const loggedIn = !!userStore.token

  // 白名单模式：仅 public 路由可免登录访问，其余默认需登录（缺 token 跳登录页并记来源）
  const isPublic = to.matched.some((r) => r.meta.public)
  if (!isPublic && !loggedIn) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  // 已登录再访问登录页：直接进首页（或登录前想去的页面）
  if (to.path === '/login' && loggedIn) {
    return { path: (to.query.redirect as string) || '/' }
  }
})

export default router
