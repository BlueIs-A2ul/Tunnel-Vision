<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  Monitor,
  VideoCamera,
  DataAnalysis,
  Setting,
  User,
} from '@element-plus/icons-vue'

const props = defineProps<{
  isCollapse: boolean
}>()

const route = useRoute()

const menuItems = [
  { path: '/', icon: Monitor, title: '实时监控' },
  { path: '/cameras', icon: VideoCamera, title: '摄像头管理' },
  { path: '/analysis', icon: DataAnalysis, title: '数据分析' },
  { path: '/users', icon: User, title: '用户管理' },
  { path: '/settings', icon: Setting, title: '系统设置' },
]

const activeMenu = computed(() => route.path)
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Logo Area -->
    <div class="h-16 flex items-center justify-center border-b border-gray-100">
      <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-md">
        <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </div>
      <span v-if="!isCollapse" class="ml-3 text-lg font-semibold text-gray-800 truncate">隧道监控</span>
    </div>

    <!-- Menu -->
    <el-menu
      :default-active="activeMenu"
      :collapse="isCollapse"
      :collapse-transition="false"
      class="flex-1 border-r-0"
      router
    >
      <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
        <el-icon>
          <component :is="item.icon" />
        </el-icon>
        <template #title>{{ item.title }}</template>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<style scoped>
:deep(.el-menu) {
  border-right: none;
}
</style>