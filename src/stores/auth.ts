import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginParams } from '@/types/user'
import * as authApi from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
  )

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function login(params: LoginParams) {
    const response = await authApi.login(params)
    
    const storage = params.rememberMe ? localStorage : sessionStorage
    
    storage.setItem('token', response.token)
    storage.setItem('user', JSON.stringify(response.user))
    
    if (params.rememberMe) {
      localStorage.setItem('rememberMe', 'true')
    }
    
    token.value = response.token
    user.value = response.user
  }

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
    logout,
    init,
  }
})