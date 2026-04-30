<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import type { FormInstance, FormRules } from 'element-plus'
import loginBg from '@/assets/loginBg/loginbg.jpg'
import cardBg from '@/assets/loginBg/loginMainBg.png'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const formRef = ref<FormInstance>()
const loading = ref(false)

const activeTab = ref<'login' | 'register'>(route.path.includes('register') ? 'register' : 'login')

const loginForm = ref({
  username: '',
  password: '',
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

function switchTab(tab: 'login' | 'register') {
  activeTab.value = tab
  if (tab === 'login') {
    router.push('/login')
  } else {
    router.push('/register')
  }
}

async function handleLogin() {
  const valid = await formRef.value?.validate().catch(() => false)
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

    registerForm.value = {
      username: '',
      password: '',
      confirmPassword: '',
    }

    activeTab.value = 'login'
    router.push('/login')
  } catch (error: any) {
    ElMessage.error(error.message || '注册失败')
  } finally {
    loading.value = false
  }
}

function goToLogin() {
  router.push('/login')
}
</script>

<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center"
    :style="{ background: `url(${loginBg}) center/cover no-repeat` }"
  >
    <!-- 登录注册卡片 -->
    <div
      class="w-[480px] p-6 rounded-2xl flex flex-col items-center"
      :style="{ background: `url(${cardBg}) center/cover no-repeat`, border: '1px solid rgba(20, 121, 173, 0.6)' }"
    >
      <!-- 主标题 -->
      <div class="text-2xl font-medium text-white text-center mb-1">智慧隧道综合平台</div>

      <!-- Tab 切换 -->
      <div class="flex rounded-lg mb-6 w-full" style="background: rgba(255,255,255,0.05)">
        <button
          :class="[
            'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200',
            activeTab === 'login'
              ? 'bg-[#1479ad] text-white'
              : 'text-white/70 hover:text-white'
          ]"
          @click="switchTab('login')"
        >
          登录
        </button>
        <button
          :class="[
            'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200',
            activeTab === 'register'
              ? 'bg-[#1479ad] text-white'
              : 'text-white/70 hover:text-white'
          ]"
          @click="switchTab('register')"
        >
          注册
        </button>
      </div>

      <!-- 卡片内部内容区 -->
        <!-- 登录表单 -->
        <el-form v-if="activeTab === 'login'" ref="formRef" :model="loginForm" :rules="loginRules" label-position="top"
          @submit.prevent="handleLogin">
          <div class="text-base text-white text-center mb-5 font-medium">用户登录</div>

          <el-form-item prop="username" class="mb-4">
            <div class="auth-input-wrap">
              <span class="auth-input-icon">
                <el-icon><User /></el-icon>
              </span>
              <input
                v-model="loginForm.username"
                type="text"
                placeholder="请输入用户名"
                class="auth-input-native"
              />
            </div>
          </el-form-item>

          <el-form-item prop="password" class="mb-5">
            <div class="auth-input-wrap">
              <span class="auth-input-icon">
                <el-icon><Lock /></el-icon>
              </span>
              <input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                class="auth-input-native"
              />
            </div>
          </el-form-item>

          <button
            type="button"
            class="w-full h-11 rounded-md text-base font-medium cursor-pointer border-none text-white hover:opacity-90 transition-opacity bg-[#0755AA]"
            :disabled="loading"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登 录' }}
          </button>
        </el-form>

        <!-- 注册表单 -->
        <el-form v-else ref="formRef" :model="registerForm" :rules="registerRules" label-position="top"
          @submit.prevent="handleRegister">
          <div class="text-base text-white text-center mb-5 font-medium">用户注册</div>

          <el-form-item prop="username" class="mb-4">
            <div class="auth-input-wrap">
              <span class="auth-input-icon">
                <el-icon><User /></el-icon>
              </span>
              <input
                v-model="registerForm.username"
                type="text"
                placeholder="请输入用户名(3-20个字符)"
                class="auth-input-native"
              />
            </div>
          </el-form-item>

          <el-form-item prop="password" class="mb-4">
            <div class="auth-input-wrap">
              <span class="auth-input-icon">
                <el-icon><Lock /></el-icon>
              </span>
              <input
                v-model="registerForm.password"
                type="password"
                placeholder="请输入密码(至少6个字符)"
                class="auth-input-native"
              />
            </div>
          </el-form-item>

          <el-form-item prop="confirmPassword" class="mb-5">
            <div class="auth-input-wrap">
              <span class="auth-input-icon">
                <el-icon><Lock /></el-icon>
              </span>
              <input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                class="auth-input-native"
              />
            </div>
          </el-form-item>

          <button
            type="button"
            class="w-full h-11 rounded-md text-base font-medium cursor-pointer border-none text-white hover:opacity-90 transition-opacity bg-[#0755AA]"
            :disabled="loading"
            @click="handleRegister"
          >
            {{ loading ? '注册中...' : '立即注册' }}
          </button>

          <div class="mt-5 text-center text-sm text-white/70">
            已有账号?
            <button type="button" class="text-[#00b8ff] hover:text-[#24cdff] font-medium" @click="goToLogin">
              立即登录
            </button>
          </div>
        </el-form>
    </div>

    <!-- Footer -->
    <div class="mt-8 text-center text-xs text-white/50">
      <p>© 2026 智慧隧道综合平台</p>
    </div>
  </div>
</template>

<style scoped>
.auth-input-wrap {
  width: 100%;
  height: 42px;
  border: 1px solid rgba(20, 121, 173, 0.6);
  background: rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  display: flex;
  align-items: center;
  overflow: hidden;
  gap: 0;
}

.auth-input-icon {
  width: 48px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #61d2f7;
  flex-shrink: 0;
  position: relative;
}

.auth-input-icon::after {
  content: '';
  position: absolute;
  right: 0;
  top: 25%;
  height: 50%;
  width: 1px;
  background: rgba(255, 255, 255, 0.15);
}

.auth-input-native {
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  outline: none;
  padding: 0 12px;
  color: #fff;
  font-size: 14px;
}

.auth-input-native::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

:deep(.el-form-item) {
  margin-bottom: 0 !important;
}

:deep(.el-form-item__label) {
  display: none;
}

:deep(.el-form-item__error) {
  position: static;
  padding-top: 4px;
}
</style>
