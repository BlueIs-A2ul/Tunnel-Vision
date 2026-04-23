<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Refresh, ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()

// 日期选择
const selectedDate = ref(new Date().toISOString().split('T')[0])

// 车辆记录数据（模拟）
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

// 刷新数据
const refreshData = () => {
  // 模拟刷新
  console.log('刷新数据', selectedDate.value)
}

// 获取车辆类型样式
const getCategoryClass = (category: string) => {
  const classes: Record<string, string> = {
    BUS: 'text-orange-500',
    TRUCK: 'text-orange-500',
    CAR: 'text-gray-500',
  }
  return classes[category] || 'text-gray-500'
}

// 返回上一页
const goBack = () => {
  router.back()
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
          <el-button>
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
</style>
