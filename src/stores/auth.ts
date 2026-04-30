import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginParams, RegisterParams } from '@/types/user'
import * as authApi from '@/api/auth'
import { getUsers } from '@/api/users'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const token = ref<string | null>(null)
    const user = ref<User | null>(null)

    const isAuthenticated = computed(() => !!token.value && !!user.value)
    const isAdmin = computed(() => user.value?.isAdmin === 1)

    /**
     * 获取存储中的 token 值，未初始化时从 localStorage 回退读取
     */
    function getToken() {
      if (token.value) return token.value
      const stored = localStorage.getItem('token')
      if (stored) token.value = stored
      return token.value
    }

    /**
     * 用户登录
     */
    async function login(params: LoginParams) {
      const response = await authApi.login(params)

      if (response.code === 1 && response.data) {
        token.value = response.data.token
        localStorage.setItem('token', response.data.token)
        user.value = { username: response.data.username }

        // 从用户列表获取当前登录用户的完整信息（含 isAdmin）
        try {
          const usersRes = await getUsers()
          const currentUser = usersRes.data?.find(u => u.username === response.data.username)
          if (currentUser) {
            user.value = currentUser
          }
        } catch {
          // 获取失败不影响登录流程
        }
      } else {
        throw new Error(response.msg || '登录失败')
      }
    }

    /**
     * 用户注册
     */
    async function register(params: RegisterParams) {
      const response = await authApi.register(params)

      if (response.code === 1 && response.data) {
        if (response.data.token) {
          token.value = response.data.token
          localStorage.setItem('token', response.data.token)
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
      try {
        await authApi.logout()
      } catch {
        // 即使后端登出失败也清除本地状态
      }

      token.value = null
      user.value = null
      localStorage.removeItem('token')
    }

    return {
      token,
      user,
      isAuthenticated,
      isAdmin,
      getToken,
      login,
      register,
      logout,
    }
  },
  {
    persist: true,
  },
)
