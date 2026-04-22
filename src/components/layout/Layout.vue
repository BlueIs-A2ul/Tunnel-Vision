<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const isCollapse = ref(false)

const currentTitle = computed(() => (route.meta?.title as string) || '首页')

function toggleSidebar() {
  isCollapse.value = !isCollapse.value
}

function handleLogout() {
  authStore.logout()
}
</script>

<template>
  <div class="dark-layout">
    <el-container class="h-screen">
      <!-- Sidebar -->
      <el-aside
        :width="isCollapse ? '64px' : '240px'"
        class="sidebar transition-all duration-300 ease-in-out"
      >
        <div class="h-full flex flex-col">
          <!-- Logo Area -->
          <div class="h-16 flex items-center justify-center border-b border-[#334155]/50">
            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00D1FF] to-[#7A5CFF] flex items-center justify-center shadow-lg shadow-[#00D1FF]/20">
              <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <span v-if="!isCollapse" class="ml-3 text-lg font-semibold text-white truncate">隧道监控</span>
          </div>

          <!-- Menu -->
          <el-menu
            :default-active="route.path"
            :collapse="isCollapse"
            :collapse-transition="false"
            class="flex-1 dark-menu border-r-0"
            router
            background-color="transparent"
            text-color="#94A3B8"
            active-text-color="#00D1FF"
          >
            <el-menu-item index="/dashboard">
              <el-icon><Monitor /></el-icon>
              <template #title>实时监控</template>
            </el-menu-item>
            <el-menu-item index="/cameras">
              <el-icon><VideoCamera /></el-icon>
              <template #title>摄像头管理</template>
            </el-menu-item>
            <el-menu-item index="/analysis">
              <el-icon><DataAnalysis /></el-icon>
              <template #title>数据分析</template>
            </el-menu-item>
            <el-menu-item index="/users">
              <el-icon><User /></el-icon>
              <template #title>用户管理</template>
            </el-menu-item>
            <el-menu-item index="/settings">
              <el-icon><Setting /></el-icon>
              <template #title>系统设置</template>
            </el-menu-item>
          </el-menu>

          <!-- User Area -->
          <div class="p-4 border-t border-[#334155]/50">
            <div class="flex items-center gap-3" :class="{ 'justify-center': isCollapse }">
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-[#00D1FF] to-[#7A5CFF] flex items-center justify-center text-white text-sm font-bold">
                {{ authStore.user?.username?.charAt(0).toUpperCase() || 'U' }}
              </div>
              <div v-if="!isCollapse" class="flex-1 min-w-0">
                <div class="text-sm text-white truncate">{{ authStore.user?.username }}</div>
                <div class="text-xs text-[#64748B]">{{ authStore.user?.role }}</div>
              </div>
              <el-icon v-if="!isCollapse" class="text-[#64748B] cursor-pointer hover:text-[#FF3B3B] transition-colors" @click="handleLogout">
                <SwitchButton />
              </el-icon>
            </div>
          </div>
        </div>
      </el-aside>

      <!-- Main Container -->
      <el-container>
        <!-- Header -->
        <el-header class="header flex items-center justify-between px-6 h-14">
          <div class="flex items-center">
            <el-button @click="toggleSidebar" text class="mr-4 text-[#94A3B8] hover:text-[#00D1FF]">
              <el-icon :size="20">
                <Fold v-if="!isCollapse" />
                <Expand v-else />
              </el-icon>
            </el-button>
            <div class="text-base font-medium text-white">
              {{ currentTitle }}
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-[#00FFC6]/10 border border-[#00FFC6]/30">
              <div class="w-2 h-2 rounded-full bg-[#00FFC6] animate-pulse"></div>
              <span class="text-xs text-[#00FFC6]">在线</span>
            </div>
          </div>
        </el-header>

        <!-- Main Content -->
        <el-main class="main-content p-0">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
.dark-layout {
  background: #0B0F1A;
}

.sidebar {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(12px);
  border-right: 1px solid rgba(51, 65, 85, 0.5);
}

.header {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(51, 65, 85, 0.5);
}

.main-content {
  background: #0B0F1A;
}

:deep(.dark-menu) {
  background: transparent !important;
}

:deep(.dark-menu .el-menu-item) {
  border-left: 3px solid transparent;
  margin: 4px 8px;
  border-radius: 8px;
  height: 44px;
  line-height: 44px;
}

:deep(.dark-menu .el-menu-item:hover) {
  background: rgba(0, 209, 255, 0.1) !important;
  color: #00D1FF !important;
}

:deep(.dark-menu .el-menu-item.is-active) {
  background: rgba(0, 209, 255, 0.15) !important;
  border-left-color: #00D1FF;
  color: #00D1FF !important;
}

:deep(.el-button.is-text) {
  color: #94A3B8;
}

:deep(.el-button.is-text:hover) {
  color: #00D1FF;
  background: rgba(0, 209, 255, 0.1);
}
</style>
