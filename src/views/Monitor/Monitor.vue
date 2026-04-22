<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'

// 统计数据
const stats = ref({
  totalVehicles: 128,
  busCount: 45,
  truckCount: 38,
  onlineCameras: 5,
})

// 实时跟踪列表
const trackingList = ref([
  { id: 'ID_016', category: 'bus', cam: 3, time: '10:23:15' },
  { id: 'ID_017', category: 'truck', cam: 2, time: '10:22:48' },
  { id: 'ID_018', category: 'bus', cam: 2, time: '10:21:33' },
  { id: 'ID_019', category: 'car', cam: 4, time: '10:20:12' },
  { id: 'ID_020', category: 'truck', cam: 1, time: '10:19:55' },
])

// 摄像头列表
const cameras = ref([
  { id: 1, name: 'Camera 01', status: 'online', location: '入口段' },
  { id: 2, name: 'Camera 02', status: 'online', location: '中段A' },
  { id: 3, name: 'Camera 03', status: 'online', location: '中段B' },
  { id: 4, name: 'Camera 04', status: 'online', location: '中段C' },
  { id: 5, name: 'Camera 05', status: 'offline', location: '出口段' },
])

// 当前选中的摄像头
const activeCamera = ref(1)

// ECharts 实例
let trendChart: echarts.ECharts | null = null
let typeChart: echarts.ECharts | null = null

// 初始化趋势图
const initTrendChart = () => {
  const chartDom = document.getElementById('trendChart')
  if (!chartDom) return
  
  trendChart = echarts.init(chartDom)
  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#E2E8F0',
      textStyle: { color: '#1E293B' },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
      axisLine: { lineStyle: { color: '#E2E8F0' } },
      axisLabel: { color: '#64748B' },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#E2E8F0' } },
      axisLabel: { color: '#64748B' },
      splitLine: { lineStyle: { color: '#F1F5F9' } },
    },
    series: [
      {
        name: '车辆数',
        type: 'line',
        smooth: true,
        data: [12, 28, 45, 38, 52, 48, 65, 42, 25],
        lineStyle: { color: '#3B82F6', width: 3 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
            { offset: 1, color: 'rgba(59, 130, 246, 0.05)' },
          ]),
        },
        itemStyle: { color: '#3B82F6' },
      },
    ],
  }
  trendChart.setOption(option)
}

// 初始化车辆类型饼图
const initTypeChart = () => {
  const chartDom = document.getElementById('typeChart')
  if (!chartDom) return
  
  typeChart = echarts.init(chartDom)
  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#E2E8F0',
      textStyle: { color: '#1E293B' },
    },
    legend: {
      bottom: '5%',
      left: 'center',
      textStyle: { color: '#64748B' },
    },
    series: [
      {
        name: '车辆类型',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
        },
        data: [
          { value: 45, name: '巴士', itemStyle: { color: '#3B82F6' } },
          { value: 38, name: '卡车', itemStyle: { color: '#10B981' } },
          { value: 25, name: '油罐车', itemStyle: { color: '#F59E0B' } },
          { value: 20, name: '其他', itemStyle: { color: '#64748B' } },
        ],
      },
    ],
  }
  typeChart.setOption(option)
}

// 刷新数据
const refreshData = () => {
  stats.value.totalVehicles += Math.floor(Math.random() * 5)
  
  const newRecord = {
    id: `ID_${String(Math.floor(Math.random() * 100)).padStart(3, '0')}`,
    category: ['bus', 'truck', 'car'][Math.floor(Math.random() * 3)],
    cam: Math.floor(Math.random() * 5) + 1,
    time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
  }
  trackingList.value.unshift(newRecord)
  if (trackingList.value.length > 10) {
    trackingList.value.pop()
  }
}

// 获取车辆类型标签
const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    bus: '巴士',
    truck: '卡车',
    car: '小车',
    tanker: '油罐车',
  }
  return labels[category] || category
}

// 获取车辆类型样式
const getCategoryClass = (category: string) => {
  const classes: Record<string, string> = {
    bus: 'bg-blue-100 text-blue-700',
    truck: 'bg-green-100 text-green-700',
    car: 'bg-gray-100 text-gray-700',
    tanker: 'bg-orange-100 text-orange-700',
  }
  return classes[category] || 'bg-gray-100 text-gray-700'
}

let refreshTimer: number | null = null

onMounted(() => {
  nextTick(() => {
    initTrendChart()
    initTypeChart()
  })
  
  refreshTimer = window.setInterval(refreshData, 5000)
  
  window.addEventListener('resize', () => {
    trendChart?.resize()
    typeChart?.resize()
  })
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
  trendChart?.dispose()
  typeChart?.dispose()
})
</script>

<template>
  <div class="monitor-container">
    <!-- 顶部统计卡片 -->
    <div class="stats-row">
      <el-row :gutter="16">
        <el-col :span="3">
          <div class="stat-card">
            <div class="stat-number">{{ stats.totalVehicles }}</div>
            <div class="stat-label">总车辆数</div>
          </div>
        </el-col>
        <el-col :span="3">
          <div class="stat-card">
            <div class="stat-number text-blue-600">{{ stats.busCount }}</div>
            <div class="stat-label">今日巴士</div>
          </div>
        </el-col>
        <el-col :span="3">
          <div class="stat-card">
            <div class="stat-number text-green-600">{{ stats.truckCount }}</div>
            <div class="stat-label">今日卡车</div>
          </div>
        </el-col>
        <el-col :span="3">
          <div class="stat-card">
            <div class="stat-number text-purple-600">5</div>
            <div class="stat-label">油罐车</div>
          </div>
        </el-col>
        <el-col :span="3">
          <div class="stat-card">
            <div class="stat-number text-cyan-600">{{ stats.onlineCameras }}</div>
            <div class="stat-label">在线摄像头</div>
          </div>
        </el-col>
        <el-col :span="9">
          <div class="quick-actions">
            <el-button type="primary" @click="refreshData">
              刷新数据
            </el-button>
            <el-button type="success">
              查看录像
            </el-button>
            <el-button type="warning">
              警报记录
            </el-button>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <el-row :gutter="16">
        <!-- 左侧：实时跟踪列表 -->
        <el-col :span="4">
          <el-card class="panel-card" shadow="hover">
            <template #header>
              <div class="panel-header">
                <span class="panel-title">实时跟踪列表</span>
                <el-tag type="info" size="small">Live</el-tag>
              </div>
            </template>
            <div class="tracking-list">
              <div
                v-for="item in trackingList"
                :key="item.id"
                class="tracking-item"
              >
                <div class="tracking-id">{{ item.id }}</div>
                <div class="tracking-info">
                  <span class="category-tag" :class="getCategoryClass(item.category)">
                    {{ getCategoryLabel(item.category) }}
                  </span>
                  <span class="cam-info">Cam {{ item.cam }}</span>
                </div>
                <div class="tracking-time">{{ item.time }}</div>
              </div>
            </div>
          </el-card>

          <!-- ECharts 趋势图 -->
          <el-card class="panel-card chart-card" shadow="hover">
            <template #header>
              <div class="panel-header">
                <span class="panel-title">今日流量趋势</span>
              </div>
            </template>
            <div id="trendChart" class="chart-container"></div>
          </el-card>
        </el-col>

        <!-- 中央：实时监控画面 -->
        <el-col :span="12">
          <el-card class="video-card" shadow="hover">
            <template #header>
              <div class="video-header">
                <div class="camera-selector">
                  <el-select v-model="activeCamera" placeholder="选择摄像头">
                    <el-option
                      v-for="cam in cameras"
                      :key="cam.id"
                      :label="cam.name"
                      :value="cam.id"
                    >
                      <span>{{ cam.name }}</span>
                      <el-tag
                        :type="cam.status === 'online' ? 'success' : 'danger'"
                        size="small"
                        class="ml-2"
                      >
                        {{ cam.status === 'online' ? '在线' : '离线' }}
                      </el-tag>
                    </el-option>
                  </el-select>
                </div>
                <div class="camera-info">
                  <span class="location">{{ cameras.find(c => c.id === activeCamera)?.location }}</span>
                  <span class="live-indicator">
                    <span class="live-dot"></span>
                    LIVE
                  </span>
                </div>
              </div>
            </template>
            <div class="video-container">
              <div class="video-placeholder">
                <div class="video-overlay">
                  <div class="overlay-top">
                    <span>{{ cameras.find(c => c.id === activeCamera)?.name }}</span>
                    <span>{{ new Date().toLocaleString('zh-CN') }}</span>
                  </div>
                  <div class="overlay-center">
                    <el-icon :size="64" class="video-icon"><VideoCamera /></el-icon>
                    <p>实时监控画面</p>
                  </div>
                  <div class="overlay-bottom">
                    <span>Camera {{ activeCamera }} - 隧道监控</span>
                  </div>
                </div>
              </div>
            </div>
          </el-card>

          <!-- 隧道模拟视图 -->
          <el-card class="tunnel-card" shadow="hover">
            <template #header>
              <div class="panel-header">
                <span class="panel-title">隧道模拟视图</span>
                <span class="tunnel-length">隧道全长: 2.5km</span>
              </div>
            </template>
            <div class="tunnel-view">
              <div class="tunnel-bg">
                <div
                  v-for="cam in cameras"
                  :key="cam.id"
                  class="camera-position"
                  :style="{ left: `${(cam.id - 1) * 25}%` }"
                >
                  <div class="camera-marker" :class="{ 'online': cam.status === 'online' }">
                    <el-icon><VideoCamera /></el-icon>
                  </div>
                  <div class="camera-label">Cam {{ cam.id }}</div>
                </div>
                
                <div class="vehicle-marker" style="left: 25%;">
                  <div class="vehicle-icon bus">
                    <el-icon :size="20"><UserFilled /></el-icon>
                  </div>
                  <div class="vehicle-id">ID_016</div>
                </div>
                <div class="vehicle-marker" style="left: 50%;">
                  <div class="vehicle-icon truck">
                    <el-icon :size="20"><Truck /></el-icon>
                  </div>
                  <div class="vehicle-id">ID_017</div>
                </div>
                <div class="vehicle-marker" style="left: 75%;">
                  <div class="vehicle-icon bus">
                    <el-icon :size="20"><UserFilled /></el-icon>
                  </div>
                  <div class="vehicle-id">ID_018</div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧：环境数据 + 车辆类型统计 -->
        <el-col :span="8">
          <el-card class="panel-card" shadow="hover">
            <template #header>
              <div class="panel-header">
                <span class="panel-title">环境监测数据</span>
                <el-tag type="success" size="small">正常</el-tag>
              </div>
            </template>
            <div class="env-grid">
              <div class="env-item">
                <div class="env-value">24.5°C</div>
                <div class="env-label">温度</div>
              </div>
              <div class="env-item">
                <div class="env-value">65%</div>
                <div class="env-label">湿度</div>
              </div>
              <div class="env-item">
                <div class="env-value">2.3 m/s</div>
                <div class="env-label">风速</div>
              </div>
              <div class="env-item">
                <div class="env-value">良好</div>
                <div class="env-label">能见度</div>
              </div>
            </div>
          </el-card>

          <!-- ECharts 车辆类型饼图 -->
          <el-card class="panel-card chart-card" shadow="hover">
            <template #header>
              <div class="panel-header">
                <span class="panel-title">车辆类型分布</span>
              </div>
            </template>
            <div id="typeChart" class="chart-container"></div>
          </el-card>

          <!-- 系统状态 -->
          <el-card class="panel-card" shadow="hover">
            <template #header>
              <div class="panel-header">
                <span class="panel-title">系统状态</span>
              </div>
            </template>
            <div class="system-status">
              <div class="status-item">
                <span class="status-label">服务器状态</span>
                <el-tag type="success">运行中</el-tag>
              </div>
              <div class="status-item">
                <span class="status-label">数据库连接</span>
                <el-tag type="success">正常</el-tag>
              </div>
              <div class="status-item">
                <span class="status-label">AI识别服务</span>
                <el-tag type="success">运行中</el-tag>
              </div>
              <div class="status-item">
                <span class="status-label">存储空间</span>
                <el-progress :percentage="72" :color="'#3B82F6'" />
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style scoped>
.monitor-container {
  padding: 16px;
  background-color: #F8FAFC;
  min-height: calc(100vh - 64px);
}

.stats-row {
  margin-bottom: 16px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #1E293B;
  line-height: 1.2;
}

.stat-label {
  font-size: 12px;
  color: #64748B;
  margin-top: 4px;
}

.quick-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  align-items: center;
  height: 100%;
}

.panel-card {
  margin-bottom: 16px;
  border-radius: 8px;
}

.panel-card :deep(.el-card__header) {
  padding: 12px 16px;
  border-bottom: 1px solid #E2E8F0;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-title {
  font-weight: 600;
  color: #1E293B;
}

.tracking-list {
  max-height: 240px;
  overflow-y: auto;
}

.tracking-item {
  padding: 10px 0;
  border-bottom: 1px solid #F1F5F9;
}

.tracking-item:last-child {
  border-bottom: none;
}

.tracking-id {
  font-size: 13px;
  font-weight: 600;
  color: #1E293B;
  margin-bottom: 4px;
}

.tracking-info {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 4px;
}

.category-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.cam-info {
  font-size: 12px;
  color: #64748B;
}

.tracking-time {
  font-size: 11px;
  color: #94A3B8;
}

.chart-card :deep(.el-card__body) {
  padding: 8px;
}

.chart-container {
  height: 180px;
}

.video-card {
  margin-bottom: 16px;
}

.video-card :deep(.el-card__header) {
  padding: 12px 16px;
}

.video-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.camera-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.location {
  color: #64748B;
  font-size: 13px;
}

.live-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #EF4444;
  font-size: 12px;
  font-weight: 600;
}

.live-dot {
  width: 8px;
  height: 8px;
  background: #EF4444;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.video-container {
  aspect-ratio: 16/9;
  background: #1E293B;
  border-radius: 4px;
  overflow: hidden;
}

.video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1E293B 0%, #334155 100%);
  position: relative;
}

.video-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px;
}

.overlay-top {
  display: flex;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
}

.overlay-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: rgba(255, 255, 255, 0.6);
}

.video-icon {
  margin-bottom: 8px;
}

.overlay-bottom {
  display: flex;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

.tunnel-card :deep(.el-card__body) {
  padding: 16px;
}

.tunnel-length {
  font-size: 12px;
  color: #64748B;
}

.tunnel-view {
  height: 100px;
}

.tunnel-bg {
  position: relative;
  height: 100%;
  background: linear-gradient(90deg, #F1F5F9 0%, #E2E8F0 50%, #F1F5F9 100%);
  border-radius: 8px;
  border: 2px solid #CBD5E1;
}

.camera-position {
  position: absolute;
  top: 20%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.camera-marker {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #94A3B8;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}

.camera-marker.online {
  background: #3B82F6;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
}

.camera-label {
  margin-top: 4px;
  font-size: 11px;
  color: #64748B;
  font-weight: 500;
}

.vehicle-marker {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.vehicle-icon {
  font-size: 20px;
  background: white;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #1E293B;
}

.vehicle-id {
  margin-top: 2px;
  font-size: 10px;
  color: #64748B;
  background: white;
  padding: 1px 4px;
  border-radius: 2px;
}

.env-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.env-item {
  text-align: center;
  padding: 12px;
  background: #F8FAFC;
  border-radius: 8px;
}

.env-icon {
  margin-bottom: 4px;
  display: flex;
  justify-content: center;
}

.env-value {
  font-size: 18px;
  font-weight: 600;
  color: #1E293B;
}

.env-label {
  font-size: 12px;
  color: #64748B;
  margin-top: 2px;
}

.system-status {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-label {
  color: #64748B;
  font-size: 13px;
}

.main-content {
  flex: 1;
}
</style>
