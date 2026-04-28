<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const featureMenus = [
  { path: '/features/search-by-image', label: '根据图像查询车辆信息' },
]

const activeMenu = computed(() => route.path)

function navigateTo(path: string) {
  router.push(path)
}
</script>

<template>
  <div class="min-h-[calc(100vh-80px)] bg-[#081832] flex flex-col">
    <div class="w-[98%] mx-auto pt-3 flex-1 flex flex-col">
      <div class="mb-3">
        <div class="inline-block bg-[#034c6a] rounded-[18px] px-[30px] py-2 text-white font-bold text-lg">
          <i class="inline-block w-[18px] h-[18px] relative top-0.5 mr-2 bg-white bg-center bg-no-repeat bg-contain"></i>
          其他功能
        </div>
      </div>
      <div class="flex flex-1">
        <aside class="w-[220px] bg-[#072951] border-r border-[#034c6a] shrink-0 flex flex-col">
          <div class="py-3.5 px-5 text-sm font-semibold text-white bg-[#034c6a] text-center mx-3 mt-3 mb-2 rounded-[18px]">功能列表</div>
          <nav class="flex flex-col gap-0.5 px-3 py-1">
            <button
              v-for="item in featureMenus"
              :key="item.path"
              :class="[
                'flex items-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 border border-transparent text-left w-full bg-transparent',
                activeMenu === item.path
                  ? 'bg-[#04425f] text-white border-[#034c6a]'
                  : 'text-[#e8f7fe] hover:bg-[rgba(4,66,95,0.5)] hover:text-white'
              ]"
              @click="navigateTo(item.path)"
            >
              <span class="text-[13px]">{{ item.label }}</span>
            </button>
          </nav>
        </aside>
        <main class="flex-1 p-4 overflow-auto bg-[#081832]" style="box-shadow: -10px 0 15px #034c6a inset">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>
