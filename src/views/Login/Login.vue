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
const mode = ref<'login' | 'register'>('login')

const loginForm = ref({
  username: '',
  password: '',
  rememberMe: false,
})

const registerForm = ref({
  username: '',
  password: '',
  confirmPassword: '',
})

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

async function handleLogin() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await authStore.login({
      username: loginForm.value.username,
      password: loginForm.value.password,
      rememberMe: loginForm.value.rememberMe,
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

async function handleRegister() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await authStore.register({
      username: registerForm.value.username,
      password: registerForm.value.password,
      confirmPassword: registerForm.value.confirmPassword,
    })

    ElMessage.success('注册成功')

    const redirect = route.query.redirect as string
    await router.push(redirect || '/dashboard')
  } catch (error: any) {
    ElMessage.error(error.message || '注册失败')
  } finally {
    loading.value = false
  }
}

function switchMode(newMode: 'login' | 'register') {
  mode.value = newMode
  formRef.value?.clearValidate()
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-[#f5f7fa]">
    <!-- Login/Register Card -->
    <div class="w-[420px] bg-white rounded-2xl shadow-lg p-10">
      <!-- Logo & Title -->
      <div class="flex flex-col items-center mb-8">
        <!-- Logo Icon -->
        <div
          class="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-4 shadow-md">
          <svg class="w-9 h-9 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
        <h1 class="text-2xl font-semibold text-gray-800 mb-1">隧道监控系统</h1>
        <p class="text-sm text-gray-500">{{ mode === 'login' ? '系统管理中心' : '用户注册' }}</p>
      </div>

      <!-- Login Form -->
      <el-form v-if="mode === 'login'" ref="formRef" :model="loginForm" :rules="loginRules" label-position="top"
        @submit.prevent="handleLogin">
        <!-- Username -->
        <el-form-item prop="username" class="mb-5">
          <template #label>
            <span class="text-sm text-gray-700 font-medium">用户名</span>
          </template>
          <el-input v-model="loginForm.username" placeholder="请输入用户名" size="large" class="login-input">
            <template #prefix>
              <el-icon class="text-gray-400">
                <User />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- Password -->
        <el-form-item prop="password" required class="mb-6 password-field">
          <template #label>
            <div class="flex justify-between items-center w-full">
              <span class="text-sm text-gray-700 font-medium">登录密码</span>
              <a href="#" class="text-xs text-blue-500 hover:text-blue-600">忘记密码?</a>
            </div>
          </template>
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" size="large" show-password
            class="login-input">
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

        <!-- Switch to Register -->
        <div class="mt-6 text-center text-sm text-gray-500">
          还没有账号?
          <button type="button" class="text-blue-500 hover:text-blue-600 font-medium" @click="switchMode('register')">
            立即注册
          </button>
        </div>
      </el-form>

      <!-- Register Form -->
      <el-form v-else ref="formRef" :model="registerForm" :rules="registerRules" label-position="top"
        @submit.prevent="handleRegister">
        <!-- Username -->
        <el-form-item prop="username" class="mb-5">
          <template #label>
            <span class="text-sm text-gray-700 font-medium">用户名</span>
          </template>
          <el-input v-model="registerForm.username" placeholder="请输入用户名(3-20个字符)" size="large"
            class="login-input">
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
            show-password class="login-input">
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
            show-password class="login-input">
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
          <button type="button" class="text-blue-500 hover:text-blue-600 font-medium" @click="switchMode('login')">
            立即登录
          </button>
        </div>
      </el-form>
    </div>

    <!-- Footer -->
    <div class="mt-8 text-center text-xs text-gray-400">
      <p>© 2026 隧道监控系统</p>
      <p v-if="mode === 'login'" class="mt-1">测试账号: admin / admin123 | user / user123</p>
    </div>
  </div>
</template>

<style scoped>
.login-input :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 0 0 1px #e4e7ed inset;
  padding: 0 12px;
}

.login-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #3b82f6 inset;
}

.login-input :deep(.el-input__inner) {
  height: 44px;
}

:deep(.el-form-item__label) {
  padding-bottom: 8px !important;
  line-height: 1.5 !important;
}

/* 密码字段：必填星号与标签文本同行，忘记密码靠右 */
.password-field :deep(.el-form-item__label) {
  display: flex !important;
  align-items: center !important;
  width: 100% !important;
}

.password-field :deep(.el-form-item__label)::before {
  margin-right: 4px !important;
  position: static !important;
}

.password-field :deep(.el-form-item__label > div) {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>