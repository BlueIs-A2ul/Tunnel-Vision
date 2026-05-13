<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps<{
  title: string
  data: {
    ID: string
    type: string
    timeStamp: string
    cameraID: string
    count: number
    photos?: string[]
    isDangerous?: boolean
    speed?: number
  }[]
  unit?: string
}>()

// 分页状态
const currentPage = ref(1)
const pageSize = 10

// 总页数
const totalPages = computed(() => Math.ceil(props.data.length / pageSize))

// 当前页数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return props.data.slice(start, end)
})

// 上一页
function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

// 下一页
function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

// 获取类型标签的样式类
function getTypeClasses(type: string | number): string {
  if (type === 'truck' || type === '卡车') {
    return 'bg-green-500/30 text-green-300'
  }
  if (type === 'bus' || type === '巴士') {
    return 'bg-blue-500/30 text-blue-300'
  }
  if (type === 'car' || type === '小车') {
    return 'bg-amber-500/30 text-amber-300'
  }
  return ''
}
</script>
<template>
  <div class="relative mt-6 w-full bg-[#081832] overflow-visible"
    style="box-shadow: -10px 0 15px #034c6a inset, 0 -10px 15px #034c6a inset, 10px 0 15px #034c6a inset, 0 10px 15px #034c6a inset; padding-bottom: 20px;">
    <div class="flex items-center justify-between px-5 py-3 border-b border-[#034c6a] bg-[#081832]">
      <div
        class="absolute -top-3.75 left-[10%] w-4/5 h-8.75 bg-[#034c6a] rounded-[18px] text-white font-bold text-sm leading-8.75 text-center z-10">
        {{ title }}
      </div>
      <span class="text-sm text-[#61d2f7] mt-2">共 {{ data.length }} 条记录</span>
    </div>

    <!-- 分页导航 -->
    <div v-if="totalPages > 1"
      class="flex items-center justify-center gap-4 py-2 border-b border-[#034c6a] bg-[#081832]">
      <button @click="prevPage" :disabled="currentPage === 1"
        class="px-3 py-1 text-sm text-white bg-[#034c6a] rounded hover:bg-[#034c6a]/80 disabled:opacity-50 disabled:cursor-not-allowed">
        上一页
      </button>
      <span class="text-sm text-[#61d2f7]">第 {{ currentPage }} / {{ totalPages }} 页</span>
      <button @click="nextPage" :disabled="currentPage === totalPages"
        class="px-3 py-1 text-sm text-white bg-[#034c6a] rounded hover:bg-[#034c6a]/80 disabled:opacity-50 disabled:cursor-not-allowed">
        下一页
      </button>
    </div>

    <div class="p-3 space-y-3">
      <div v-if="paginatedData.length === 0" class="flex flex-col items-center justify-center py-12 text-[#61d2f7]">
        <Icon icon="uiw:message--exclude" :size="48" class="mb-3 opacity-50" />
        <span class="text-sm">当前暂无数据</span>
      </div>
      <div v-for="(record, index) in paginatedData" :key="record.ID"
        class="flex items-center justify-between px-4 py-3 rounded-lg border border-[#034c6a]"
        :class="index % 2 === 0 ? 'bg-[#072951]' : 'bg-[#072951]/50'"
        style="box-shadow: -10px 0 15px #034c6a inset, 10px 0 15px #034c6a inset;">
        <div class="flex items-center gap-4">
          <div class="flex flex-col gap-1.5 flex-1">
            <div class="flex items-center gap-3">
              <span class="font-semibold text-white text-base">{{ record.ID }}</span>
              <span v-if="record.type" class="px-2 py-0.5 text-xs rounded-full" :class="getTypeClasses(record.type)">
                {{ record.type }}
              </span>
              <span v-if="record.isDangerous" class="px-2 py-0.5 text-xs rounded-full bg-red-500/30 text-red-300">
                危险行为
              </span>
              <span v-else class="px-2 py-0.5 text-xs rounded-full bg-green-500/30 text-green-300">
                正常行驶
              </span>
            </div>
            <div class="flex items-center gap-4 text-xs text-[#61d2f7]">
              <span>摄像头: {{ record.cameraID }}</span>
              <span>时间: {{ record.timeStamp }}</span>
              <span>{{ record.count }} 次抓拍</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <div v-for="(_, photoIndex) in Math.min(record.photos?.length ?? 0, 4)" :key="photoIndex"
            class="w-14 h-14 bg-[#034c6a] rounded-md border border-[#034c6a] overflow-hidden"
            style="box-shadow: inset -3px 0 8px #61d2f7, inset 3px 0 8px #61d2f7;">
            <img v-if="record.photos?.[photoIndex]" :src="record.photos[photoIndex]" alt="抓拍照片"
              class="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
