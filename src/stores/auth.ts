import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginParams, RegisterParams } from '@/types/user'
import * as authApi from '@/api/auth'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const token = ref<string | null>(null)
    const user = ref<User | null>(null)

    const isAuthenticated = computed(() => !!token.value && !!user.value)
    const isAdmin = computed(() => user.value?.role === 'admin')

    /**
     * 用户登录
     */
    async function login(params: LoginParams) {
      const response = await authApi.login(params)

      // 根据 code 判断是否成功
      if (response.code === 1 && response.data) {
        token.value = response.data.token
        user.value = { username: response.data.username }
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
      if (response.code === 1 && response.data) {
        if (response.data.token) {
          token.value = response.data.token
        }
        if (response.data.user) {
          user.value = response.data.user
        }
      } else {
        throw new Error(response.msg || '注册失败')
      }
    }

    /**
     * 用户登出
     */
    async function logout() {
      await authApi.logout()

      token.value = null
      user.value = null
    }

    return {
      token,
      user,
      isAuthenticated,
      isAdmin,
      login,
      register,
      logout,
    }
  },
  {
    persist: true,
  },
)
