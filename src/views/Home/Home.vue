<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <div>
    <el-card>
      <div class="text-center py-12">
        <h2 class="text-2xl font-semibold text-gray-700 mb-4">欢迎使用隧道监控系统</h2>
        <p class="text-gray-500 mb-6">实时监控、车辆检测、数据统计</p>
        <div class="text-sm text-gray-400">
          当前用户: <span class="text-blue-500">{{ authStore.user?.username }}</span>
          <span class="ml-2">({{ authStore.user?.role }})</span>
        </div>
      </div>
    </el-card>
  </div>
</template>