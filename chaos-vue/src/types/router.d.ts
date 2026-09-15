import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** 页面标题，用于设置 document.title 与菜单/面包屑展示 */
    title?: string
    /** 是否需要登录鉴权 */
    requiresAuth?: boolean
    /** 菜单图标名（对应 @element-plus/icons-vue 的导出名，如 'Odometer'） */
    icon?: string
    /** 为 true 时菜单与面包屑均不展示该路由 */
    hidden?: boolean
    /** 即使只有一个子路由也展示为子菜单（用于分组占位） */
    alwaysShow?: boolean
  }
}
