import type { Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/stores/user'

/** 判断当前用户是否拥有给定权限码（支持单个或数组，满足其一即通过） */
function hasPermission(value: string | string[]): boolean {
  const userStore = useUserStore()
  const codes = Array.isArray(value) ? value : [value]
  return codes.some((code) => userStore.permissions.includes(code))
}

/**
 * v-permission：无权限时直接从 DOM 移除对应元素（按钮级权限控制）。
 * 用法：v-permission="'user:create'" 或 v-permission="['user:edit', 'user:delete']"
 */
export const permission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    if (!hasPermission(binding.value)) {
      el.parentNode?.removeChild(el)
    }
  },
}
