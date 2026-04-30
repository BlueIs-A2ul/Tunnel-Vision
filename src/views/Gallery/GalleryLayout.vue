<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'

const route = useRoute()
const router = useRouter()

const galleryTabs = [
  { path: '/gallery/vehicle-log', label: '车辆归档日志' },
]

const activeTab = computed(() => route.path)

function navigateTo(path: string) {
  router.push(path)
}
</script>

<template>
  <div class="min-h-[calc(100vh-80px)] bg-[#081832] flex flex-col">
    <div class="w-[98%] mx-auto pt-4 flex-1 flex flex-col">
      <div class="mb-3">
        <div
          class="inline-flex items-center bg-[#034c6a] rounded-[18px] px-[30px] py-2 text-white font-bold text-lg gap-2">
          <Icon icon="mdi:image" :size="20" color="#4b8df8"></Icon>
          图库管理
        </div>
      </div>
      <div class="flex gap-1 pt-3 px-0 bg-[#081832]">
        <button v-for="tab in galleryTabs" :key="tab.path" :class="[
          'px-6 py-1.5 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 border-none',
          activeTab === tab.path
            ? 'bg-[#04425f] text-white border border-[#034c6a]'
            : 'bg-transparent text-[#e8f7fe] hover:bg-[rgba(4,66,95,0.5)] hover:text-white'
        ]" @click="navigateTo(tab.path)">
          {{ tab.label }}
        </button>
      </div>
      <div class="flex-1">
        <router-view />
      </div>
    </div>
  </div>
</template>
