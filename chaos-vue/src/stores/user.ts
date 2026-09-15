import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { loginApi, type LoginParams, type LoginResult } from '@/api/auth'

const TOKEN_KEY = 'token'

export const useUserStore = defineStore('user', () => {
  // 初始化时回填 localStorage，保证刷新后登录态不丢（Pinia state 刷新即丢失）
  const token = ref<string>(localStorage.getItem(TOKEN_KEY) ?? '')
  const userInfo = ref<LoginResult['user'] | null>(null)

  const isLoggedIn = computed(() => !!token.value)

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
    return result
  }

  /** 退出登录：清空 token 与用户信息 */
  function logout() {
    setToken('')
    userInfo.value = null
  }

  return { token, userInfo, isLoggedIn, setToken, login, logout }
})

export type UserStore = ReturnType<typeof useUserStore>
