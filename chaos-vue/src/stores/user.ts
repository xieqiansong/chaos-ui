import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { loginApi, type LoginParams, type LoginResult, type UserInfo } from '@/api/auth'

const TOKEN_KEY = 'token'
const USER_INFO_KEY = 'user_info'

export const useUserStore = defineStore('user', () => {
  // 初始化时回填 localStorage，保证刷新后登录态不丢（Pinia state 刷新即丢失）
  const token = ref<string>(localStorage.getItem(TOKEN_KEY) ?? '')
  const userInfo = ref<LoginResult['user'] | null>(loadUserInfo())

  const isLoggedIn = computed(() => !!token.value)

  // 当前用户权限码集合（按钮级权限控制用），未登录为空数组
  const permissions = computed<string[]>(() => userInfo.value?.permissions ?? [])
  /** 是否拥有给定权限（支持单个或数组，满足其一即通过） */
  function hasPermission(code: string | string[]): boolean {
    const codes = Array.isArray(code) ? code : [code]
    return codes.some((c) => permissions.value.includes(c))
  }

  function setToken(value: string) {
    token.value = value
    if (value) localStorage.setItem(TOKEN_KEY, value)
    else localStorage.removeItem(TOKEN_KEY)
  }

  /** 调用登录接口换 token，并落库 localStorage + Pinia */
  async function login(params: LoginParams) {
    const result = await loginApi(params)
    setToken(result.token)
    userInfo.value = result.user
    persistUserInfo()
    return result
  }

  /** 退出登录：清空 token 与用户信息 */
  function logout() {
    setToken('')
    userInfo.value = null
    localStorage.removeItem(USER_INFO_KEY)
  }

  /** 局部更新用户信息（如个人资料保存后同步昵称 / 头像等） */
  function patchUserInfo(patch: Partial<UserInfo>) {
    if (!userInfo.value) userInfo.value = patch as UserInfo
    else userInfo.value = { ...userInfo.value, ...patch }
    persistUserInfo()
  }

  // ---- 内部工具：序列化 / 反序列化 userInfo（与 token 一并持久化，刷新后权限不丢失） ----
  function persistUserInfo() {
    if (userInfo.value) localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo.value))
  }
  function loadUserInfo(): LoginResult['user'] | null {
    const raw = localStorage.getItem(USER_INFO_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as LoginResult['user']
    } catch {
      return null
    }
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    permissions,
    hasPermission,
    setToken,
    login,
    logout,
    patchUserInfo,
  }
})

export type UserStore = ReturnType<typeof useUserStore>
