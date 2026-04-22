<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import * as echarts from 'echarts'
import { Search, Refresh } from '@element-plus/icons-vue'

// 时间筛选
const timeRange = ref('today')
const timeRangeOptions = [
  { label: '今日', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
]

// 搜索关键词
const searchKeyword = ref('')

// 统计数据
const stats = ref({
  totalPass: 1234,
  todayBus: 45,
  todayTruck: 38,
  avgSpeed: 58,
})

// 车辆记录数据（模拟）
const vehicleRecords = ref([
  { id: 'ID_001', category: 'truck', cam: 3, time: '2026-04-22 10:23:15', speed: 55, images: 4 },
  { id: 'ID_002', category: 'bus', cam: 2, time: '2026-04-22 10:22:48', speed: 48, images: 4 },
  { id: 'ID_003', category: 'truck', cam: 2, time: '2026-04-22 10:21:33', speed: 52, images: 3 },
  { id: 'ID_004', category: 'car', cam: 4, time: '2026-04-22 10:20:12', speed: 65, images: 4 },
  { id: 'ID_005', category: 'truck', cam: 1, time: '2026-04-22 10:19:55', speed: 45, images: 4 },
  { id: 'ID_006', category: 'bus', cam: 3, time: '2026-04-22 10:18:30', speed: 50, images: 4 },
  { id: 'ID_007', category: 'truck', cam: 2, time: '2026-04-22 10:17:22', speed: 58, images: 3 },
  { id: 'ID_008', category: 'car', cam: 5, time: '2026-04-22 10:16:15', speed: 62, images: 4 },
  { id: 'ID_009', category: 'bus', cam: 1, time: '2026-04-22 10:15:48', speed: 47, images: 4 },
  { id: 'ID_010', category: 'truck', cam: 4, time: '2026-04-22 10:14:33', speed: 53, images: 4 },
  { id: 'ID_011', category: 'car', cam: 3, time: '2026-04-22 10:13:22', speed: 60, images: 3 },
  { id: 'ID_012', category: 'bus', cam: 2, time: '2026-04-22 10:12:15', speed: 49, images: 4 },
])

// 分页
const currentPage = ref(1)
const pageSize = 10
const totalRecords = computed(() => filteredRecords.value.length)

// 筛选后的记录
const filteredRecords = computed(() => {
  let records = vehicleRecords.value
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    records = records.filter(r =>
      r.id.toLowerCase().includes(keyword) ||
      r.category.toLowerCase().includes(keyword)
    )
  }
  return records
})

// 当前页数据
const currentPageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredRecords.value.slice(start, end)
})

// ECharts 实例
let trendChart: echarts.ECharts | null = null
let typeChart: echarts.ECharts | null = null
let hourChart: echarts.ECharts | null = null

// 初始化流量趋势图
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
      orient: 'vertical',
      left: 'left',
      textStyle: { color: '#64748B' },
    },
    series: [
      {
        name: '车辆类型',
        type: 'pie',
        radius: '70%',
        center: ['60%', '50%'],
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

// 初始化时段分布柱状图
const initHourChart = () => {
  const chartDom = document.getElementById('hourChart')
  if (!chartDom) return

  hourChart = echarts.init(chartDom)
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
      data: ['0-4时', '4-8时', '8-12时', '12-16时', '16-20时', '20-24时'],
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
        type: 'bar',
        data: [45, 128, 256, 198, 312, 156],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#3B82F6' },
            { offset: 1, color: '#60A5FA' },
          ]),
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  }
  hourChart.setOption(option)
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

// 刷新数据
const refreshData = () => {
  // 模拟数据更新
  stats.value.totalPass += Math.floor(Math.random() * 10)
}

// 处理分页变化
const handlePageChange = (page: number) => {
  currentPage.value = page
}

// 处理时间范围变化
const handleTimeRangeChange = () => {
  // 根据时间范围更新数据
  refreshData()
}

onMounted(() => {
  nextTick(() => {
    initTrendChart()
    initTypeChart()
    initHourChart()
  })

  window.addEventListener('resize', () => {
    trendChart?.resize()
    typeChart?.resize()
    hourChart?.resize()
  })
})

onUnmounted(() => {
  trendChart?.dispose()
  typeChart?.dispose()
  hourChart?.dispose()
})
</script>

<template>
  <div class="dashboard-container">
    <!-- 顶部工具栏 -->
    <el-card class="toolbar-card" shadow="hover">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-radio-group v-model="timeRange" @change="handleTimeRangeChange">
            <el-radio-button v-for="opt in timeRangeOptions" :key="opt.value" :label="opt.value">
              {{ opt.label }}
            </el-radio-button>
          </el-radio-group>
        </div>
        <div class="toolbar-right">
          <el-input v-model="searchKeyword" placeholder="搜索车辆ID或类型" :prefix-icon="Search" clearable
            style="width: 240px" />
          <el-button type="primary" :icon="Refresh" @click="refreshData">
            刷新数据
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <el-row :gutter="16">
        <el-col :span="3">
          <div class="stat-card">
            <div class="stat-number">{{ stats.totalPass }}</div>
            <div class="stat-label">总通行量</div>
          </div>
        </el-col>
        <el-col :span="3">
          <div class="stat-card">
            <div class="stat-number text-blue-600">{{ stats.todayBus }}</div>
            <div class="stat-label">今日巴士</div>
          </div>
        </el-col>
        <el-col :span="3">
          <div class="stat-card">
            <div class="stat-number text-green-600">{{ stats.todayTruck }}</div>
            <div class="stat-label">今日卡车</div>
          </div>
        </el-col>
        <el-col :span="3">
          <div class="stat-card">
            <div class="stat-number text-orange-600">25</div>
            <div class="stat-label">今日油罐车</div>
          </div>
        </el-col>
        <el-col :span="3">
          <div class="stat-card">
            <div class="stat-number text-purple-600">{{ stats.avgSpeed }}</div>
            <div class="stat-label">平均时速(km/h)</div>
          </div>
        </el-col>
        <el-col :span="3">
          <div class="stat-card">
            <div class="stat-number text-cyan-600">99.2%</div>
            <div class="stat-label">识别准确率</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="summary-info">
            <div class="summary-item">
              <span class="summary-label">高峰时段</span>
              <span class="summary-value">16:00-20:00</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">今日预警</span>
              <span class="summary-value text-orange-600">3 次</span>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 图表区 -->
    <div class="charts-row">
      <el-row :gutter="16">
        <el-col :span="8">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="panel-header">
                <span class="panel-title">日流量趋势</span>
              </div>
            </template>
            <div id="trendChart" class="chart-container"></div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="panel-header">
                <span class="panel-title">车辆类型分布</span>
              </div>
            </template>
            <div id="typeChart" class="chart-container"></div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="panel-header">
                <span class="panel-title">时段分布</span>
              </div>
            </template>
            <div id="hourChart" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 车辆记录表格 -->
    <el-card class="table-card" shadow="hover">
      <template #header>
        <div class="panel-header">
          <span class="panel-title">车辆通行记录</span>
          <span class="record-count">共 {{ totalRecords }} 条记录</span>
        </div>
      </template>
      <div class="table-container">
        <div v-for="record in currentPageData" :key="record.id" class="record-item">
          <div class="record-main">
            <div class="record-header">
              <span class="record-id">{{ record.id }}</span>
              <span class="category-tag" :class="getCategoryClass(record.category)">
                {{ getCategoryLabel(record.category) }}
              </span>
              <span class="record-time">{{ record.time }}</span>
              <span class="record-status">正常驶离</span>
            </div>
            <div class="record-details">
              <div class="detail-item">
                <span>Cam {{ record.cam }}</span>
              </div>
              <div class="detail-item">
                <span>{{ record.speed }} km/h</span>
              </div>
              <div class="detail-item">
                <span>{{ record.images }} 张抓拍</span>
              </div>
            </div>
          </div>
          <div class="record-images">
            <div v-for="i in Math.min(record.images, 4)" :key="i" class="image-placeholder"></div>
          </div>
        </div>
      </div>
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination v-model:current-page="currentPage" :page-size="pageSize" :total="totalRecords"
          layout="prev, pager, next, jumper" @change="handlePageChange" />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 16px;
  background-color: #F8FAFC;
  min-height: calc(100vh - 64px);
}

/* 工具栏 */
.toolbar-card {
  margin-bottom: 16px;
}

.toolbar-card :deep(.el-card__body) {
  padding: 12px 16px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 统计卡片 */
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

.stat-icon {
  margin-bottom: 8px;
  display: flex;
  justify-content: center;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #1E293B;
  line-height: 1.2;
}

.stat-label {
  font-size: 12px;
  color: #64748B;
  margin-top: 4px;
}

.summary-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  font-size: 13px;
  color: #64748B;
}

.summary-value {
  font-size: 14px;
  font-weight: 600;
  color: #1E293B;
}

/* 图表区 */
.charts-row {
  margin-bottom: 16px;
}

.chart-card {
  border-radius: 8px;
}

.chart-card :deep(.el-card__header) {
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

.chart-container {
  height: 240px;
}

/* 表格卡片 */
.table-card {
  border-radius: 8px;
}

.table-card :deep(.el-card__header) {
  padding: 12px 16px;
  border-bottom: 1px solid #E2E8F0;
}

.record-count {
  font-size: 13px;
  color: #64748B;
}

.table-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #F8FAFC;
  border-radius: 8px;
  border: 1px solid #E2E8F0;
}

.record-main {
  flex: 1;
}

.record-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.record-id {
  font-size: 15px;
  font-weight: 600;
  color: #1E293B;
}

.category-tag {
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.record-time {
  font-size: 13px;
  color: #64748B;
}

.record-status {
  font-size: 12px;
  color: #10B981;
  background: #D1FAE5;
  padding: 2px 8px;
  border-radius: 4px;
}

.record-details {
  display: flex;
  gap: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #64748B;
}

.record-images {
  display: flex;
  gap: 8px;
}

.image-placeholder {
  width: 64px;
  height: 48px;
  background: #E2E8F0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94A3B8;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding-top: 16px;
  border-top: 1px solid #E2E8F0;
  margin-top: 16px;
}
</style>
