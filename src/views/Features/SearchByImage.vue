<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'

const imageUrl = ref<string | null>(null)
const searchResult = ref<{ id: string; category: string; time: string; confidence: number } | null>(null)
const loading = ref(false)

function handleImageUpload(file: File) {
  const reader = new FileReader()
  reader.onload = (e) => {
    imageUrl.value = e.target?.result as string
    searchResult.value = null
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
  if (!imageUrl.value) return
  loading.value = true

  await new Promise((r) => setTimeout(r, 1500))

  searchResult.value = {
    id: 'ID_001',
    category: '巴士',
    time: '2026-04-28 10:30:25',
    confidence: 0.96,
  }
  loading.value = false
}

function handleReset() {
  imageUrl.value = null
  searchResult.value = null
}
</script>

<template>
  <div>
    <div class="max-w-[1000px] mx-auto">
      <div class="mb-5">
        <div class="inline-block bg-[#034c6a] rounded-[18px] px-[30px] py-2 text-white font-bold text-lg mb-2">
          <i class="inline-block w-[18px] h-[18px] relative top-0.5 mr-2 bg-white bg-center bg-no-repeat bg-contain rounded-full"></i>
          根据图像查询车辆信息
        </div>
        <p class="text-sm text-[#61d2f7] ml-1">上传车辆图片，通过 AI 识别快速查询车辆详细信息</p>
      </div>

      <div class="flex gap-6">
        <div class="w-[380px] shrink-0">
          <div
            class="upload-area"
            :class="{ 'has-image': !!imageUrl }"
            @dragover.prevent
            @drop.prevent="handleDrop"
            @click="handleSelect"
          >
            <template v-if="imageUrl">
              <img :src="imageUrl" alt="上传的图片" class="w-full h-full object-contain block" />
              <div class="absolute inset-0 bg-[rgba(8,24,50,0.85)] flex flex-col items-center justify-center text-white opacity-0 transition-opacity duration-200 gap-2 peer">
                <el-icon :size="24"><Plus /></el-icon>
                <span>点击重新选择图片</span>
              </div>
            </template>
            <template v-else>
              <el-icon :size="48" class="text-[#4b8df8] mb-2"><Plus /></el-icon>
              <p class="text-sm text-[#e8f7fe] my-2">拖拽图片到此处，或点击上传</p>
              <p class="text-xs text-[#61d2f7]">支持 JPG、PNG、WebP 格式</p>
            </template>
          </div>

          <div class="mt-4 flex gap-3">
            <button
              class="inline-flex items-center gap-1.5 px-5 py-2 rounded-md text-sm font-medium cursor-pointer border-none text-white transition-opacity duration-200"
              style="background: linear-gradient(to bottom, #4b8df8, #25f3e6)"
              :disabled="!imageUrl || loading"
              @click="handleSearch"
            >
              <el-icon><Search /></el-icon>
              {{ loading ? '查询中...' : '开始查询' }}
            </button>
            <button
              class="inline-flex items-center gap-1.5 px-5 py-2 rounded-md text-sm font-medium cursor-pointer border border-[#034c6a] bg-transparent text-[#e8f7fe] transition-all duration-200 hover:bg-[rgba(3,76,106,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
              :disabled="!imageUrl"
              @click="handleReset"
            >
              重新上传
            </button>
          </div>
        </div>

        <div class="flex-1">
          <template v-if="searchResult">
            <div class="result-wrapper">
              <div class="result-title-pill">查询结果</div>
              <div class="p-0">
                <div class="flex flex-col gap-1">
                  <div class="result-item">
                    <span class="result-label">车辆编号</span>
                    <span class="result-value">{{ searchResult.id }}</span>
                  </div>
                  <div class="result-item">
                    <span class="result-label">车辆类型</span>
                    <span class="px-3 py-0.5 rounded-xl text-xs bg-[rgba(75,141,248,0.2)] text-[#4b8df8] border border-[#4b8df8]">{{ searchResult.category }}</span>
                  </div>
                  <div class="result-item">
                    <span class="result-label">抓拍时间</span>
                    <span class="result-value">{{ searchResult.time }}</span>
                  </div>
                  <div class="result-item">
                    <span class="result-label">识别置信度</span>
                    <span class="px-3 py-0.5 rounded-xl text-xs bg-[rgba(37,243,230,0.2)] text-[#25f3e6] border border-[#25f3e6]">{{ (searchResult.confidence * 100).toFixed(0) }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="flex flex-col items-center justify-center min-h-[300px] bg-[#072951] rounded-lg border border-[#034c6a] text-[#e8f7fe] gap-3">
              <el-icon :size="48" color="#61d2f7"><Search /></el-icon>
              <p>上传图片并点击查询，结果将显示在此处</p>
            </div>
          </template>
        </div>
      </div>
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
  min-height: 260px;
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
  padding: 0;
  border-style: solid;
  border-color: #034c6a;
}

.upload-area.has-image:hover .upload-overlay {
  opacity: 1;
}

.result-wrapper {
  position: relative;
  box-shadow: -10px 0 15px #034c6a inset,
              0 -10px 15px #034c6a inset,
              10px 0 15px #034c6a inset,
              0 10px 15px #034c6a inset;
  border: 1px solid #034c6a;
  border-radius: 8px;
  box-sizing: border-box;
  margin-top: 25px;
  padding: 20px;
  padding-top: 30px;
}

.result-title-pill {
  position: absolute;
  top: -15px;
  left: 20%;
  background: #034c6a;
  border-radius: 18px;
  height: 35px;
  width: 60%;
  line-height: 35px;
  text-align: center;
  color: #fff;
  font-size: 14px;
  font-weight: bold;
  z-index: 10;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #034c6a;
}

.result-item:last-child {
  border-bottom: none;
}

.result-label {
  color: #61d2f7;
  font-size: 14px;
}

.result-value {
  color: #fff;
  font-weight: 500;
  font-size: 14px;
}
</style>
