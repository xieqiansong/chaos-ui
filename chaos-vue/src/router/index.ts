import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Layout from '@/layout/AppLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: {
      title: '登录',
      hidden: true,
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
          requiresAuth: false,
        },
      },
      {
        path: 'about',
        name: 'about',
        component: () => import('@/views/AboutView.vue'),
        meta: {
          title: '关于',
          icon: 'InfoFilled',
          requiresAuth: false,
        },
      },
      {
        path: 'users',
        name: 'users',
        component: () => import('@/views/UserListView.vue'),
        meta: {
          title: '用户管理',
          icon: 'User',
          requiresAuth: false,
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

  // 登录校验（占位实现，待接入真实鉴权 store）
  if (to.meta.requiresAuth && !localStorage.getItem('token')) {
    return { path: '/login' }
  }
})

export default router
