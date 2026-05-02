<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import { searchByImage, type SearchResult } from '@/api/search'
import { Icon } from '@iconify/vue'

const imageUrl = ref<string | null>(null)
const selectedFile = ref<File | null>(null)
const searchResults = ref<SearchResult[]>([])
const filteredResults = computed(() =>
  searchResults.value.filter(item => item.imageUrlList?.length > 0)
)
const loading = ref(false)

function handleImageUpload(file: File) {
  selectedFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    imageUrl.value = e.target?.result as string
    searchResults.value = []
  }
  reader.readAsDataURL(file)
}

function handleDrop(event: DragEvent) {
  const file = event.dataTransfer?.files[0]
  if (file && file.type.startsWith('image/')) {
    handleImageUpload(file)
  }
}

function handleSelect() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) handleImageUpload(file)
  }
  input.click()
}

async function handleSearch() {
  if (!selectedFile.value) {
    ElMessage.warning('请先上传图片')
    return
  }
  loading.value = true

  try {
    const res = await searchByImage(selectedFile.value)
    if (res.code !== 1) throw new Error(res.msg || '查询失败')
    searchResults.value = res.data
  } catch (error: any) {
    ElMessage.error(error.message || '查询失败')
  } finally {
    loading.value = false
  }
}

const selectedItem = ref<SearchResult | null>(null)
const dialogVisible = ref(false)

function showDetail(item: SearchResult) {
  selectedItem.value = item
  dialogVisible.value = true
}

function handleReset() {
  imageUrl.value = null
  selectedFile.value = null
  searchResults.value = []
}
</script>

<template>
  <div>
    <div class="max-w-[1000px] mx-auto">
      <div class="mb-5">
        <div class="inline-flex items-center bg-[#034c6a] rounded-[18px] px-7.5 py-2 text-white font-bold text-lg mb-2">
          <Icon icon="mdi:car-search" :size="20" color="#fff" class="mr-2"></Icon>
          根据图像查询车辆信息
        </div>
        <p class="text-sm text-[#61d2f7] ml-1">上传车辆图片，通过 AI 识别快速查询车辆详细信息</p>
      </div>

      <!-- 上传区：水平布局 -->
      <div class="flex items-center gap-6 mb-6">
        <!-- 左侧：图片预览 -->
        <div class="upload-area w-100 shrink-0" :class="{ 'has-image': !!imageUrl }" @dragover.prevent
          @drop.prevent="handleDrop" @click="handleSelect">
          <template v-if="imageUrl">
            <img :src="imageUrl" alt="上传的图片" class="w-full h-full object-contain block" />
            <div
              class="upload-overlay absolute inset-0 bg-[rgba(8,24,50,0.85)] flex flex-col items-center justify-center text-white opacity-0 transition-opacity duration-200 gap-2">
              <el-icon :size="24">
                <Plus />
              </el-icon>
              <span>点击重新选择图片</span>
            </div>
          </template>
          <template v-else>
            <el-icon :size="48" class="text-[#4b8df8] mb-2">
              <Plus />
            </el-icon>
            <p class="text-sm text-[#e8f7fe] my-2">拖拽图片到此处，或点击上传</p>
            <p class="text-xs text-[#61d2f7]">支持 JPG、PNG、WebP 格式</p>
          </template>
          <el-dialog v-model="dialogVisible" :title="'车辆详情 - ' + (selectedItem?.vehicleId || '')" width="50%"
            :close-on-click-modal="false" destroy-on-close>
            <div v-if="selectedItem" class="grid grid-cols-3 gap-3">
              <div v-for="(img, i) in selectedItem.imageUrlList" :key="i"
                class="aspect-square bg-[#072951] rounded-lg border border-[#034c6a] overflow-hidden">
                <el-image :src="img" class="w-full h-full" fit="contain" :preview-src-list="selectedItem.imageUrlList"
                  :initial-index="i" preview-teleported />
              </div>
              <div v-if="!selectedItem.imageUrlList?.length" class="col-span-3 text-center text-[#61d2f7] py-10">暂无图片
              </div>
            </div>
          </el-dialog>
        </div>

        <!-- 右侧：按钮 -->
        <div class="flex-1 flex items-center justify-evenly">
          <button
            class="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-md text-sm font-medium cursor-pointer border-none text-white transition-opacity duration-200 min-w-[120px]"
            style="background: linear-gradient(to bottom, #4b8df8, #25f3e6)" :disabled="!imageUrl || loading"
            @click="handleSearch">
            <el-icon>
              <Search />
            </el-icon>
            {{ loading ? '查询中...' : '开始查询' }}
          </button>
          <button
            class="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-md text-sm font-medium cursor-pointer border border-[#034c6a] bg-transparent text-[#e8f7fe] transition-all duration-200 hover:bg-[rgba(3,76,106,0.3)] disabled:opacity-40 disabled:cursor-not-allowed min-w-[120px]"
            :disabled="!imageUrl" @click="handleReset">
            重新上传
          </button>
        </div>
      </div>

      <!-- 识别结果区 -->
      <template v-if="searchResults.length > 0">
        <div class="text-sm text-[#61d2f7] mb-3">识别结果</div>
        <div class="grid grid-cols-5 gap-3">
          <div v-for="(item, index) in filteredResults" :key="index" class="flex flex-col">
            <div class="aspect-[3/4] bg-[#072951] rounded-lg border border-[#034c6a] overflow-hidden">
              <img :src="item.imageUrlList?.[0] || ''" class="w-full h-full object-contain" alt="搜索结果" />
            </div>
            <span class="text-xs text-white mt-1 text-left">{{ item.vehicleId }}</span>
            <span class="text-xs text-[#61d2f7] mt-1 text-left">相似度: {{ (item.similarity * 100).toFixed(0) }}%</span>
            <span v-if="item.vehicleType" class="text-xs text-white mt-0.5 text-left">{{ item.vehicleType }}</span>
            <button
              class="text-xs text-[#4b8df8] mt-0.5 bg-transparent border-none cursor-pointer p-0 hover:underline text-left"
              @click.stop="showDetail(item)">
              查看更多
            </button>
          </div>
        </div>
      </template>
      <template v-else>
        <div
          class="flex flex-col items-center justify-center min-h-[300px] bg-[#072951] rounded-lg border border-[#034c6a] text-[#e8f7fe] gap-3">
          <el-icon :size="48" color="#61d2f7">
            <Search />
          </el-icon>
          <p>上传图片并点击查询，结果将显示在此处</p>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.upload-area {
  border: 2px dashed #034c6a;
  border-radius: 12px;
  padding: 40px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #072951;
  position: relative;
  overflow: hidden;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-area:hover {
  border-color: #4b8df8;
  background: rgba(4, 66, 95, 0.5);
}

.upload-area.has-image {
  width: 260px;
  height: 260px;
  padding: 0;
  border-style: solid;
  border-color: #034c6a;
}

.upload-area.has-image:hover .upload-overlay {
  opacity: 1;
}

:deep(.el-dialog) {
  background: #072951;
  border: 1px solid #034c6a;
  border-radius: 12px;
}

:deep(.el-dialog__title) {
  color: #fff;
}

:deep(.el-dialog__body) {
  color: #e8f7fe;
}
</style>
