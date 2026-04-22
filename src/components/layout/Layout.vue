<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Fold, Expand } from '@element-plus/icons-vue'
import SideNavBar from './SideNavBar.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isCollapse = ref(false)

const currentTitle = computed(() => (route.meta?.title as string) || '首页')

function toggleSidebar() {
  isCollapse.value = !isCollapse.value
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}

const currentDate = computed(() => {
  const date = new Date()
  return `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, '0')}月${String(date.getDate()).padStart(2, '0')}日`
})
</script>

<template>
  <div class="common-layout">
    <el-container class="h-screen">
      <!-- Sidebar -->
      <el-aside
        :width="isCollapse ? '64px' : '260px'"
        class="bg-white shadow-lg transition-all duration-300 ease-in-out border-r border-gray-200"
      >
        <SideNavBar :is-collapse="isCollapse" />
      </el-aside>

      <!-- Main Container -->
      <el-container>
        <!-- Header -->
        <el-header class="bg-white shadow-sm flex items-center justify-between px-6 py-3 border-b border-gray-200 h-16">
          <div class="flex items-center">
            <el-button @click="toggleSidebar" text class="mr-4">
              <el-icon :size="20">
                <Fold v-if="!isCollapse" />
                <Expand v-else />
              </el-icon>
            </el-button>
            <div class="text-lg font-semibold text-gray-700">
              {{ currentTitle }}
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-gray-500 text-sm">当前日期: {{ currentDate }}</div>
            <el-button link class="text-gray-700" @click="handleLogout">
              退出登录
            </el-button>
          </div>
        </el-header>

        <!-- Main Content -->
        <el-main class="bg-gray-50 p-6">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
.common-layout {
  height: 100vh;
}
</style>