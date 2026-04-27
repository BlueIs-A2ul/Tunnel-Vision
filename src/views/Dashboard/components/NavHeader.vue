<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const currentDate = computed(() => {
  const date = new Date()
  return `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, '0')}月${String(date.getDate()).padStart(2, '0')}日`
})

const menuItems = [
  { path: '/dashboard', title: '数据分析' },
  { path: '/monitor', title: '实时监控' },
  { path: '/cameras', title: '摄像头管理' },
  { path: '/vehicle-log', title: '车辆归档日志' },
  { path: '/users', title: '用户管理' },
  { path: '/settings', title: '系统设置' },
]

const activeMenu = computed(() => route.path)

function navigateTo(path: string) {
  router.push(path)
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <header class="w-full h-20 bg-[#030829] flex items-center justify-between px-8">
    <!-- 左侧 Logo 和标题 -->
    <div class="flex items-center">
      <div
        class="w-10 h-10 rounded-lg bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-md mr-4">
        <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </div>
      <div class="text-white font-['Microsoft_YaHei']">
        <h2 class="text-lg font-bold">智慧隧道监测综合平台</h2>
        <p class="text-[#e8f7fe] text-xs">Comprehensive service platform for smart tourism</p>
      </div>
    </div>

    <!-- 中间导航菜单 -->
    <div class="flex items-center space-x-1">
      <button v-for="item in menuItems" :key="item.path" @click="navigateTo(item.path)" :class="[
        'px-6 py-2 rounded-md text-sm font-medium transition-all duration-200',
        activeMenu === item.path
          ? 'bg-[#04425f] text-white border border-[#034c6a]'
          : 'text-[#e8f7fe] hover:bg-[#04425f]/50 hover:text-white'
      ]">
        {{ item.title }}
      </button>
    </div>

    <!-- 右侧日期和退出按钮 -->
    <div class="flex items-center gap-4">
      <div class="text-[#e8f7fe] text-sm">{{ currentDate }}</div>
      <button @click="handleLogout" class="text-[#e8f7fe] hover:text-white text-sm transition-colors">
        退出登录
      </button>
    </div>
  </header>
</template>
