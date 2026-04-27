<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const formRef = ref<FormInstance>()
const loading = ref(false)

// 当前 Tab: 'login' | 'register'
const activeTab = ref<'login' | 'register'>(route.path.includes('register') ? 'register' : 'login')

// 登录表单
const loginForm = ref({
  username: '',
  password: '',
})

// 注册表单
const registerForm = ref({
  username: '',
  password: '',
  confirmPassword: '',
})

// 表单验证规则
const loginRules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const registerRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value !== registerForm.value.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

// 切换 Tab
function switchTab(tab: 'login' | 'register') {
  activeTab.value = tab
  // 更新路由
  if (tab === 'login') {
    router.push('/login')
  } else {
    router.push('/register')
  }
}

// 登录处理
async function handleLogin() {
  const valid = await formRef.value?.validate().catch(() => false)
  console.log('登录表单验证结果:', valid)
  if (!valid) return

  loading.value = true
  try {
    await authStore.login({
      username: loginForm.value.username,
      password: loginForm.value.password,
    })

    ElMessage.success('登录成功')

    const redirect = route.query.redirect as string
    await router.push(redirect || '/dashboard')
  } catch (error: any) {
    ElMessage.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}

// 注册处理
async function handleRegister() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await authStore.register({
      username: registerForm.value.username,
      password: registerForm.value.password,
    })

    ElMessage.success('注册成功，请登录')

    // 清空注册表单
    registerForm.value = {
      username: '',
      password: '',
      confirmPassword: '',
    }

    // 切换到登录状态
    activeTab.value = 'login'
    router.push('/login')
  } catch (error: any) {
    ElMessage.error(error.message || '注册失败')
  } finally {
    loading.value = false
  }
}

// 跳转到登录
function goToLogin() {
  router.push('/login')
}

// 跳转到注册
function goToRegister() {
  router.push('/register')
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-[#f5f7fa]">
    <!-- 登录注册卡片 -->
    <div class="w-105 bg-white rounded-2xl shadow-lg p-10">
      <!-- Logo & Title -->
      <div class="flex flex-col items-center mb-6">
        <!-- Logo Icon -->
        <div
          class="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-4 shadow-md">
          <svg class="w-9 h-9 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
        <h1 class="text-2xl font-semibold text-gray-800 mb-1">智慧隧道综合平台</h1>
        <p class="text-sm text-gray-500">用户登录 / 注册</p>
      </div>

      <!-- Tab 切换 -->
      <div class="flex rounded-lg bg-gray-100 p-1 mb-6">
        <button
          :class="['flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all', activeTab === 'login' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700']"
          @click="switchTab('login')">
          登录
        </button>
        <button
          :class="['flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all', activeTab === 'register' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700']"
          @click="switchTab('register')">
          注册
        </button>
      </div>

      <!-- 登录表单 -->
      <el-form v-if="activeTab === 'login'" ref="formRef" :model="loginForm" :rules="loginRules" label-position="top"
        @submit.prevent="handleLogin">
        <!-- Username -->
        <el-form-item prop="username" class="mb-5">
          <template #label>
            <span class="text-sm text-gray-700 font-medium">用户名</span>
          </template>
          <el-input v-model="loginForm.username" placeholder="请输入用户名" size="large" class="auth-input">
            <template #prefix>
              <el-icon class="text-gray-400">
                <User />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- Password -->
        <el-form-item prop="password" class="mb-6">
          <template #label>
            <span class="text-sm text-gray-700 font-medium">密码</span>
          </template>
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" size="large" show-password
            class="auth-input">
            <template #prefix>
              <el-icon class="text-gray-400">
                <Lock />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- Submit Button -->
        <el-button type="primary" size="large"
          class="w-full h-12 !text-base !rounded-lg !bg-blue-500 !border-blue-500 hover:!bg-blue-600 hover:!border-blue-600 transition-colors"
          :loading="loading" @click="handleLogin">
          立即登录
        </el-button>

      </el-form>

      <!-- 注册表单 -->
      <el-form v-else ref="formRef" :model="registerForm" :rules="registerRules" label-position="top"
        @submit.prevent="handleRegister">
        <!-- Username -->
        <el-form-item prop="username" class="mb-5">
          <template #label>
            <span class="text-sm text-gray-700 font-medium">用户名</span>
          </template>
          <el-input v-model="registerForm.username" placeholder="请输入用户名(3-20个字符)" size="large" class="auth-input">
            <template #prefix>
              <el-icon class="text-gray-400">
                <User />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- Password -->
        <el-form-item prop="password" class="mb-5">
          <template #label>
            <span class="text-sm text-gray-700 font-medium">密码</span>
          </template>
          <el-input v-model="registerForm.password" type="password" placeholder="请输入密码(至少6个字符)" size="large"
            show-password class="auth-input">
            <template #prefix>
              <el-icon class="text-gray-400">
                <Lock />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- Confirm Password -->
        <el-form-item prop="confirmPassword" class="mb-6">
          <template #label>
            <span class="text-sm text-gray-700 font-medium">确认密码</span>
          </template>
          <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" size="large"
            show-password class="auth-input">
            <template #prefix>
              <el-icon class="text-gray-400">
                <Lock />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- Submit Button -->
        <el-button type="primary" size="large"
          class="w-full h-12 !text-base !rounded-lg !bg-blue-500 !border-blue-500 hover:!bg-blue-600 hover:!border-blue-600 transition-colors"
          :loading="loading" @click="handleRegister">
          立即注册
        </el-button>

        <!-- Switch to Login -->
        <div class="mt-6 text-center text-sm text-gray-500">
          已有账号?
          <button type="button" class="text-blue-500 hover:text-blue-600 font-medium" @click="goToLogin">
            立即登录
          </button>
        </div>
      </el-form>
    </div>

    <!-- Footer -->
    <div class="mt-8 text-center text-xs text-gray-400">
      <p>© 2026 智慧隧道综合平台</p>
    </div>
  </div>
</template>

<style scoped>
.auth-input :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 0 0 1px #e4e7ed inset;
  padding: 0 12px;
}

.auth-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #3b82f6 inset;
}

.auth-input :deep(.el-input__inner) {
  height: 44px;
}

:deep(.el-form-item__label) {
  padding-bottom: 8px !important;
  line-height: 1.5 !important;
}
</style>
