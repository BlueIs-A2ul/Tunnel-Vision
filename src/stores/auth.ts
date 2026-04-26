import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginParams, RegisterParams } from '@/types/user'
import * as authApi from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(
    localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user')!)
      : null,
  )

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  /**
   * 用户登录
   */
  async function login(params: LoginParams) {
    const response = await authApi.login(params)

    // 根据 code 判断是否成功
    if (response.code === 200) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))

      token.value = response.data.token
      user.value = response.data.user
    } else {
      throw new Error(response.msg || '登录失败')
    }
  }

  /**
   * 用户注册
   */
  async function register(params: RegisterParams) {
    const response = await authApi.register(params)

    // 根据 code 判断是否成功
    if (response.code === 200) {
      localStorage.setItem('token', response.data.token as string)
      localStorage.setItem('user', JSON.stringify(response.data.user))

      token.value = response.data.token as string
      user.value = response.data.user as User
    } else {
      throw new Error(response.msg || '注册失败')
    }
  }

  /**
   * 用户登出
   */
  async function logout() {
    await authApi.logout()

    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('rememberMe')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')

    token.value = null
    user.value = null
  }

  /**
   * 初始化 - 从本地存储恢复登录状态
   */
  function init() {
    const rememberMe = localStorage.getItem('rememberMe')
    if (rememberMe) {
      token.value = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      user.value = storedUser ? JSON.parse(storedUser) : null
    } else {
      token.value = sessionStorage.getItem('token')
      const storedUser = sessionStorage.getItem('user')
      user.value = storedUser ? JSON.parse(storedUser) : null
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    init,
  }
})
