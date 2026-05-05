<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import { getVehiclesWithImages } from '@/api/vehicles'
import type { VehicleRecord } from '@/types/vehicle'

const selectedDate = ref(new Date().toISOString().split('T')[0])
const vehicleRecords = ref<VehicleRecord[]>([])
const loading = ref(false)

const statusLabels: Record<string, string> = {
  moving: '行驶中',
  exited: '正常驶离',
  abnormal: '异常',
}

const statusStyles: Record<string, string> = {
  moving: 'text-[#25f3e6] bg-[rgba(37,243,230,0.1)] border border-[#25f3e6]',
  exited: 'text-[#61d2f7] bg-[rgba(97,210,247,0.1)] border border-[#61d2f7]',
  abnormal: 'text-[#ff4e4e] bg-[rgba(255,78,78,0.1)] border border-[#ff4e4e]',
}

const typeLabels: Record<string, string> = {
  bus: 'BUS',
  truck: 'TRUCK',
  car: 'CAR',
  tanker: 'TANKER',
}

function getTypeStyle(type: string): string {
  const styles: Record<string, string> = {
    bus: 'bg-[rgba(75,141,248,0.2)] text-[#4b8df8] border-[#4b8df8]',
    truck: 'bg-[rgba(37,243,230,0.2)] text-[#25f3e6] border-[#25f3e6]',
    car: 'bg-[rgba(255,255,67,0.2)] text-[#ffff43] border-[#ffff43]',
    tanker: 'bg-[rgba(255,78,78,0.2)] text-[#ff4e4e] border-[#ff4e4e]',
  }
  return styles[type] || styles.bus
}

function formatTime(raw: unknown): string {
  if (!raw) return '--'
  if (typeof raw === 'string') {
    const d = new Date(raw)
    return isNaN(d.getTime()) ? raw : d.toLocaleString('zh-CN', { hour12: false })
  }
  if (typeof raw === 'number') {
    return new Date(raw).toLocaleString('zh-CN', { hour12: false })
  }
  return String(raw)
}

function handleImgError(e: Event) {
  const el = e.target as HTMLElement
  el.style.display = 'none'
}

async function fetchData() {
  loading.value = true
  try {
    const res = await getVehiclesWithImages(selectedDate.value)
    if (res.code === 1 && res.data) {
      vehicleRecords.value = res.data
    } else {
      ElMessage.warning(res.msg || '获取数据失败')
    }
  } catch (err) {
    console.error('获取车辆归档数据失败:', err)
    ElMessage.error('获取数据失败，请检查网络连接')
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  fetchData()
}

const settingsDialogVisible = ref(false)
const activeSettingTab = ref('refresh')

const settingsForm = ref({
  autoRefresh: true,
  refreshInterval: 10,
  refreshUnit: 'seconds',
  pageSize: 20,
  imageSize: 'medium',
})

const settingTabs = [
  { key: 'refresh', label: '刷新设置' },
  { key: 'display', label: '显示设置' },
  { key: 'log', label: '日志设置' },
]

function openSettings() {
  settingsDialogVisible.value = true
}

function resetSettings() {
  settingsForm.value = {
    autoRefresh: true,
    refreshInterval: 10,
    refreshUnit: 'seconds',
    pageSize: 20,
    imageSize: 'medium',
  }
}

function saveSettings() {
  ElMessage.success('设置已保存')
  settingsDialogVisible.value = false
}

onMounted(fetchData)
</script>

<template>
  <div class="min-h-[calc(100vh-80px)] bg-[#081832]">
    <div class="w-[98%] mx-auto py-5">

      <div class="flex justify-end items-center mb-5">
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <span class="text-sm text-[#61d2f7] whitespace-nowrap">选择日期:</span>
            <el-date-picker v-model="selectedDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD"
              class="dark-date-picker" />
          </div>
          <button
            class="inline-flex items-center gap-1.5 px-5 py-2 rounded-md text-sm font-medium cursor-pointer border-none text-white transition-opacity duration-200 hover:opacity-90"
            style="background: linear-gradient(to bottom, #4b8df8, #25f3e6)" @click="refreshData">
            刷新列表 / Refresh
          </button>
          <button
            class="inline-flex items-center gap-1.5 px-5 py-2 rounded-md text-sm font-medium cursor-pointer border border-[#034c6a] bg-transparent text-[#e8f7fe] transition-all duration-200 hover:bg-[rgba(3,76,106,0.3)]"
            @click="openSettings">
            设置 / Settings
          </button>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center py-20">
        <el-icon class="is-loading" :size="32" color="#4b8df8">
          <Loading />
        </el-icon>
      </div>

      <div v-else-if="vehicleRecords.length === 0" class="text-center py-20 text-[#61d2f7] text-sm">
        暂无车辆归档数据
      </div>

      <div v-else class="flex flex-col gap-2">
        <div v-for="(record, index) in vehicleRecords" :key="record.id" class="record-card"
          :class="index % 2 === 0 ? 'bg-[#072951]' : 'bg-[rgba(7,41,81,0.5)]'">
          <div class="flex items-center gap-3 mb-4">
            <span class="text-base font-semibold text-white">{{ record.vehicleUid }}</span>
            <span :class="['px-2.5 py-0.5 rounded-xl text-xs font-medium border', getTypeStyle(record.type)]">
              {{ typeLabels[record.type] || record.type }}
            </span>
            <span class="text-sm text-[#61d2f7]">{{ formatTime(record.lastSeenTime) }}</span>
            <span :class="['text-xs px-2 py-0.5 rounded', statusStyles[record.status] || '']">
              {{ statusLabels[record.status] || record.status }}
            </span>
          </div>
          <div class="flex gap-3 flex-wrap">
            <template v-if="record.images.length > 0">
              <div v-for="(img, i) in record.images" :key="i" class="w-[120px] h-[90px]">
                <div
                  class="w-full h-full bg-[#034c6a] rounded-md overflow-hidden border border-[#034c6a] flex items-center justify-center"
                  style="box-shadow: inset -3px 0 8px #61d2f7, inset 3px 0 8px #61d2f7">
                  <img :src="img.imageUrl" :alt="`图片 ${i + 1}`"
                    class="w-full h-full object-cover" @error="handleImgError" />
                </div>
              </div>
            </template>
            <template v-else>
              <div class="w-[120px] h-[90px]">
                <div
                  class="w-full h-full bg-[#034c6a] rounded-md flex items-center justify-center border border-[#034c6a]"
                  style="box-shadow: inset -3px 0 8px #61d2f7, inset 3px 0 8px #61d2f7">
                  <span class="text-xs text-[#61d2f7]">暂无图片</span>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <el-dialog v-model="settingsDialogVisible" title="" width="680px" :show-close="false" destroy-on-close
        custom-class="dark-settings-dialog">
        <div class="rounded-lg overflow-hidden bg-[#081832]">
          <div class="flex items-center gap-3 py-4 px-5 bg-[#034c6a] text-white">
            <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span class="text-lg font-semibold">设置 / Settings</span>
          </div>

          <div class="flex min-h-[320px]">
            <div class="w-[160px] bg-[#072951] border-r border-[#034c6a] p-2">
              <button v-for="tab in settingTabs" :key="tab.key" :class="[
                'block w-full py-3 px-4 cursor-pointer rounded-md mb-1 transition-all duration-200 text-left border-none text-sm font-medium',
                activeSettingTab === tab.key
                  ? 'bg-[#04425f] text-white border border-[#034c6a]'
                  : 'bg-transparent text-[#e8f7fe] hover:bg-[rgba(4,66,95,0.5)] hover:text-white'
              ]" @click="activeSettingTab = tab.key">
                {{ tab.label }}
              </button>
            </div>

            <div class="flex-1 py-5 px-6 bg-[#081832]">
              <template v-if="activeSettingTab === 'refresh'">
                <h3 class="text-base font-semibold text-white mb-5 pb-3 border-b border-[#034c6a]">刷新设置 / Refresh
                  Settings</h3>
                <div class="flex justify-between items-center py-3 border-b border-[#034c6a]">
                  <div class="flex flex-col">
                    <span class="text-sm text-white">自动刷新</span>
                    <span class="text-xs text-[#61d2f7] mt-0.5">Auto Refresh</span>
                  </div>
                  <el-switch v-model="settingsForm.autoRefresh" />
                </div>
                <div class="flex justify-between items-center py-3 border-b border-[#034c6a]">
                  <div class="flex flex-col">
                    <span class="text-sm text-white">刷新间隔</span>
                    <span class="text-xs text-[#61d2f7] mt-0.5">Refresh Interval</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <el-input-number v-model="settingsForm.refreshInterval" :min="5" :max="300"
                      controls-position="right" class="dark-input-number" />
                    <el-select v-model="settingsForm.refreshUnit" class="dark-select">
                      <el-option label="秒" value="seconds" />
                      <el-option label="分钟" value="minutes" />
                    </el-select>
                  </div>
                </div>
                <p class="text-xs text-[#61d2f7] mt-4 leading-relaxed">设置自动刷新间隔，单位为秒，最小值为5秒</p>
              </template>

              <template v-else-if="activeSettingTab === 'display'">
                <h3 class="text-base font-semibold text-white mb-5 pb-3 border-b border-[#034c6a]">显示设置 / Display
                  Settings</h3>
                <div class="flex justify-between items-center py-3 border-b border-[#034c6a]">
                  <div class="flex flex-col">
                    <span class="text-sm text-white">每页记录数</span>
                    <span class="text-xs text-[#61d2f7] mt-0.5">Records Per Page</span>
                  </div>
                  <el-select v-model="settingsForm.pageSize" class="dark-select">
                    <el-option :label="10" :value="10" />
                    <el-option :label="20" :value="20" />
                    <el-option :label="50" :value="50" />
                    <el-option :label="100" :value="100" />
                  </el-select>
                </div>
                <div class="flex justify-between items-center py-3 border-b border-[#034c6a]">
                  <div class="flex flex-col">
                    <span class="text-sm text-white">图片大小</span>
                    <span class="text-xs text-[#61d2f7] mt-0.5">Image Size</span>
                  </div>
                  <el-select v-model="settingsForm.imageSize" class="dark-select">
                    <el-option label="小 / Small" value="small" />
                    <el-option label="中 / Medium" value="medium" />
                    <el-option label="大 / Large" value="large" />
                  </el-select>
                </div>
              </template>

              <template v-else>
                <h3 class="text-base font-semibold text-white mb-5 pb-3 border-b border-[#034c6a]">日志设置 / Log Settings
                </h3>
                <p class="text-xs text-[#61d2f7] mt-4 leading-relaxed">日志设置功能开发中...</p>
              </template>
            </div>
          </div>

          <div class="flex justify-end gap-3 py-4 px-5 border-t border-[#034c6a] bg-[#072951]">
            <button
              class="inline-flex items-center gap-1.5 px-5 py-2 rounded-md text-sm font-medium cursor-pointer border border-[#034c6a] bg-transparent text-[#e8f7fe] transition-all duration-200 hover:bg-[rgba(3,76,106,0.3)]"
              @click="resetSettings">
              重置 / Reset
            </button>
            <button
              class="inline-flex items-center gap-1.5 px-5 py-2 rounded-md text-sm font-medium cursor-pointer border-none text-white transition-opacity duration-200 hover:opacity-90"
              style="background: linear-gradient(to bottom, #4b8df8, #25f3e6)" @click="saveSettings">
              保存 / Save
            </button>
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<style scoped>
.record-card {
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #034c6a;
  box-shadow: -10px 0 15px #034c6a inset,
    10px 0 15px #034c6a inset;
}

:deep(.dark-settings-dialog .el-dialog__header) {
  display: none;
}

:deep(.dark-settings-dialog .el-dialog__body) {
  padding: 0;
}

:deep(.dark-settings-dialog) {
  background: #081832;
  border: 1px solid #034c6a;
  border-radius: 8px;
}

:deep(.dark-date-picker .el-input__wrapper) {
  background: #034c6a;
  border: 1px solid #034c6a;
  box-shadow: none;
}

:deep(.dark-date-picker .el-input__inner) {
  color: #fff;
}

:deep(.dark-date-picker .el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.5);
}

:deep(.dark-input-number .el-input-number__decrease),
:deep(.dark-input-number .el-input-number__increase) {
  background: #034c6a;
  color: #fff;
}

:deep(.dark-input-number .el-input__wrapper) {
  background: #034c6a;
  border: 1px solid #034c6a;
  box-shadow: none;
}

:deep(.dark-input-number .el-input__inner) {
  color: #fff;
}

:deep(.dark-select .el-input__wrapper) {
  background: #034c6a;
  border: 1px solid #034c6a;
  box-shadow: none;
}

:deep(.dark-select .el-input__inner) {
  color: #fff;
}

:deep(.dark-select .el-select-dropdown) {
  background: #081832;
  border: 1px solid #034c6a;
}

:deep(.dark-select .el-select-dropdown__item) {
  color: #e8f7fe;
}

:deep(.dark-select .el-select-dropdown__item.hover),
:deep(.dark-select .el-select-dropdown__item:hover) {
  background: #034c6a;
  color: #fff;
}

:deep(.dark-select .el-select-dropdown__item.selected) {
  color: #4b8df8;
}

:deep(.el-switch__core) {
  border-color: #034c6a;
  background: #034c6a;
}
</style>
