<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()

const selectedDate = ref(new Date().toISOString().split('T')[0])

const vehicleRecords = ref([
  {
    id: 'ID_003',
    category: 'BUS',
    time: '2026-03-29 20:31:03',
    status: '正常驶离',
    imageCount: 4,
  },
  {
    id: 'ID_002',
    category: 'TRUCK',
    time: '2026-03-29 20:30:50',
    status: '正常驶离',
    imageCount: 4,
  },
  {
    id: 'ID_001',
    category: 'TRUCK',
    time: '2026-03-29 20:29:04',
    status: '正常驶离',
    imageCount: 3,
  },
])

const refreshData = () => {
  console.log('刷新数据', selectedDate.value)
}

const getCategoryClass = (category: string) => {
  const classes: Record<string, string> = {
    BUS: 'text-orange-500',
    TRUCK: 'text-orange-500',
    CAR: 'text-gray-500',
  }
  return classes[category] || 'text-gray-500'
}

const goBack = () => {
  router.back()
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
  { key: 'refresh', label: '刷新设置', labelEn: 'Refresh Settings' },
  { key: 'display', label: '显示设置', labelEn: 'Display Settings' },
  { key: 'log', label: '日志设置', labelEn: 'Log Settings' },
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
</script>

<template>
  <div class="vehicle-log-container">
    <!-- 顶部工具栏 -->
    <el-card class="toolbar-card" shadow="never">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-button type="danger" @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
          <span class="page-title">车辆归档日志 / Vehicle History Log</span>
        </div>
        <div class="toolbar-right">
          <div class="date-picker-wrapper">
            <span class="date-label">选择日期:</span>
            <el-date-picker
              v-model="selectedDate"
              type="date"
              placeholder="选择日期"
              value-format="YYYY-MM-DD"
              style="width: 150px"
            />
          </div>
          <el-button type="primary" @click="refreshData">
            刷新列表 / Refresh
          </el-button>
          <el-button @click="openSettings">
            设置 / Settings
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 车辆记录列表 -->
    <div class="records-list">
      <el-card
        v-for="record in vehicleRecords"
        :key="record.id"
        class="record-card"
        shadow="hover"
      >
        <div class="record-header">
          <span class="record-id">{{ record.id }}</span>
          <span class="category-tag" :class="getCategoryClass(record.category)">
            [{{ record.category }}]
          </span>
          <span class="record-time">{{ record.time }} ({{ record.status }})</span>
        </div>
        <div class="record-images">
          <div
            v-for="i in record.imageCount"
            :key="i"
            class="image-item"
          >
            <div class="image-placeholder">
              <span class="image-text">车辆图片 {{ i }}</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>

  <el-dialog
    v-model="settingsDialogVisible"
    title=""
    width="680px"
    :show-close="false"
    destroy-on-close
    class="settings-dialog"
  >
    <div class="settings-container">
      <div class="settings-header">
        <div class="settings-logo">
          <svg class="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
        <span class="settings-title">设置 / Settings</span>
      </div>

      <div class="settings-content">
        <div class="settings-nav">
          <div
            v-for="tab in settingTabs"
            :key="tab.key"
            class="nav-item"
            :class="{ active: activeSettingTab === tab.key }"
            @click="activeSettingTab = tab.key"
          >
            <span class="nav-label">{{ tab.label }}</span>
            <span class="nav-label-en">{{ tab.labelEn }}</span>
          </div>
        </div>

        <div class="settings-panel">
          <template v-if="activeSettingTab === 'refresh'">
            <h3 class="panel-title">刷新设置 / Refresh Settings</h3>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">自动刷新</span>
                <span class="setting-label-en">Auto Refresh</span>
              </div>
              <el-switch v-model="settingsForm.autoRefresh" />
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">刷新间隔</span>
                <span class="setting-label-en">Refresh Interval</span>
              </div>
              <div class="setting-control">
                <el-input-number
                  v-model="settingsForm.refreshInterval"
                  :min="5"
                  :max="300"
                  controls-position="right"
                  class="interval-input"
                />
                <el-select v-model="settingsForm.refreshUnit" class="unit-select">
                  <el-option label="秒" value="seconds" />
                  <el-option label="分钟" value="minutes" />
                </el-select>
              </div>
            </div>
            <p class="setting-hint">设置自动刷新间隔，单位为秒，最小值为5秒</p>
          </template>

          <template v-else-if="activeSettingTab === 'display'">
            <h3 class="panel-title">显示设置 / Display Settings</h3>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">每页记录数</span>
                <span class="setting-label-en">Records Per Page</span>
              </div>
              <el-select v-model="settingsForm.pageSize" class="page-size-select">
                <el-option :label="10" :value="10" />
                <el-option :label="20" :value="20" />
                <el-option :label="50" :value="50" />
                <el-option :label="100" :value="100" />
              </el-select>
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">图片大小</span>
                <span class="setting-label-en">Image Size</span>
              </div>
              <el-select v-model="settingsForm.imageSize" class="page-size-select">
                <el-option label="小 / Small" value="small" />
                <el-option label="中 / Medium" value="medium" />
                <el-option label="大 / Large" value="large" />
              </el-select>
            </div>
          </template>

          <template v-else>
            <h3 class="panel-title">日志设置 / Log Settings</h3>
            <p class="setting-hint">日志设置功能开发中...</p>
          </template>
        </div>
      </div>

      <div class="settings-footer">
        <el-button @click="resetSettings">重置 / Reset</el-button>
        <el-button type="primary" @click="saveSettings">保存 / Save</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped>
.vehicle-log-container {
  padding: 16px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 64px);
}

/* 工具栏 */
.toolbar-card {
  margin-bottom: 16px;
  border-radius: 8px;
}

.toolbar-card :deep(.el-card__body) {
  padding: 16px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.date-picker-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

/* 记录列表 */
.records-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-card {
  border-radius: 8px;
}

.record-card :deep(.el-card__body) {
  padding: 16px;
}

.record-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.record-id {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.category-tag {
  font-size: 14px;
  font-weight: 500;
}

.record-time {
  font-size: 14px;
  color: #909399;
}

/* 图片区域 */
.record-images {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.image-item {
  width: 120px;
  height: 90px;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  background: #e4e7ed;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dcdfe6;
}

.image-text {
  font-size: 12px;
  color: #909399;
}

.settings-dialog :deep(.el-dialog__header) {
  display: none;
}

.settings-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.settings-container {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.settings-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #3b82f6;
  color: white;
}

.settings-logo {
  width: 36px;
  height: 36px;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-title {
  font-size: 18px;
  font-weight: 600;
}

.settings-content {
  display: flex;
  min-height: 320px;
}

.settings-nav {
  width: 160px;
  background: #f5f7fa;
  border-right: 1px solid #e4e7ed;
  padding: 8px;
}

.nav-item {
  padding: 12px 16px;
  cursor: pointer;
  border-radius: 6px;
  margin-bottom: 4px;
  transition: all 0.2s;
}

.nav-item:hover {
  background: #e4e7ed;
}

.nav-item.active {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.nav-label-en {
  display: block;
  font-size: 11px;
  color: #909399;
  margin-top: 2px;
}

.settings-panel {
  flex: 1;
  padding: 20px 24px;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.setting-info {
  display: flex;
  flex-direction: column;
}

.setting-label {
  font-size: 14px;
  color: #303133;
}

.setting-label-en {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.setting-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.interval-input {
  width: 100px;
}

.unit-select {
  width: 100px;
}

.page-size-select {
  width: 160px;
}

.setting-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 16px;
  line-height: 1.5;
}

.settings-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e4e7ed;
  background: #fafafa;
}
</style>
