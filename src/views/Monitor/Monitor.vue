<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { VideoCamera } from '@element-plus/icons-vue'

const rtspUrl = ref('')
const rtspConnected = ref(false)
const showRtspInput = ref(true)

function connectRtsp() {
  if (!rtspUrl.value.trim()) {
    ElMessage.warning('请输入 RTSP 流地址')
    return
  }
  rtspConnected.value = true
  showRtspInput.value = false
}

function disconnectRtsp() {
  rtspConnected.value = false
  showRtspInput.value = true
  rtspUrl.value = ''
}

const stats = ref({
  totalVehicles: 128,
  busCount: 45,
  truckCount: 38,
  tankerCount: 5,
  onlineCameras: 5,
  todayWarnings: 3,
})

const trackingList = ref([
  { id: 'ID_016', category: 'bus', cam: 3, time: '10:23:15' },
  { id: 'ID_017', category: 'truck', cam: 2, time: '10:22:48' },
  { id: 'ID_018', category: 'bus', cam: 2, time: '10:21:33' },
  { id: 'ID_019', category: 'car', cam: 4, time: '10:20:12' },
  { id: 'ID_020', category: 'truck', cam: 1, time: '10:19:55' },
])

const cameras = ref([
  { id: 1, name: 'Camera 01', status: 'online', location: '入口段' },
  { id: 2, name: 'Camera 02', status: 'online', location: '中段A' },
  { id: 3, name: 'Camera 03', status: 'online', location: '中段B' },
  { id: 4, name: 'Camera 04', status: 'online', location: '中段C' },
  { id: 5, name: 'Camera 05', status: 'offline', location: '出口段' },
])

const activeCamera = ref(1)

let trendChart: echarts.ECharts | null = null
let typeChart: echarts.ECharts | null = null

const darkTooltip: echarts.EChartsOption['tooltip'] = {
  backgroundColor: 'rgba(3, 8, 41, 0.9)',
  borderColor: '#034c6a',
  textStyle: { color: '#ffffff' },
}

const darkAxis = {
  axisLine: { lineStyle: { color: '#034c6a' } },
  axisLabel: { color: '#ffffff' },
  splitLine: { lineStyle: { color: '#034c6a' } },
}

const initTrendChart = () => {
  const chartDom = document.getElementById('trendChart')
  if (!chartDom) return

  trendChart = echarts.init(chartDom)
  const option: echarts.EChartsOption = {
    tooltip: { ...darkTooltip, trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
      ...darkAxis,
    },
    yAxis: { type: 'value', ...darkAxis },
    series: [
      {
        name: '车辆数',
        type: 'line',
        smooth: true,
        data: [12, 28, 45, 38, 52, 48, 65, 42, 25],
        lineStyle: { color: '#4b8df8', width: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(75, 141, 248, 0.5)' },
            { offset: 1, color: 'rgba(75, 141, 248, 0.1)' },
          ]),
        },
        itemStyle: { color: '#4b8df8' },
      },
    ],
  }
  trendChart.setOption(option)
}

const initTypeChart = () => {
  const chartDom = document.getElementById('typeChart')
  if (!chartDom) return

  typeChart = echarts.init(chartDom)
  const option: echarts.EChartsOption = {
    tooltip: { ...darkTooltip, trigger: 'item' },
    legend: { bottom: '5%', left: 'center', textStyle: { color: '#ffffff' } },
    series: [
      {
        name: '车辆类型',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 4, borderColor: '#081832', borderWidth: 2 },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold', color: '#fff' },
        },
        data: [
          { value: 45, name: '巴士', itemStyle: { color: '#4b8df8' } },
          { value: 38, name: '卡车', itemStyle: { color: '#25f3e6' } },
          { value: 25, name: '油罐车', itemStyle: { color: '#ff4e4e' } },
          { value: 20, name: '其他', itemStyle: { color: '#ffff43' } },
        ],
      },
    ],
  }
  typeChart.setOption(option)
}

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

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    bus: '巴士',
    truck: '卡车',
    car: '小车',
    tanker: '油罐车',
  }
  return labels[category] || category
}

const getCategoryClass = (category: string) => {
  const classes: Record<string, string> = {
    bus: 'tag-blue',
    truck: 'tag-green',
    car: 'tag-amber',
    tanker: 'tag-red',
  }
  return classes[category] || 'tag-blue'
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
  <div class="min-h-[calc(100vh-80px)] bg-[#081832]">
    <div class="w-[98%] mx-auto py-4">
      <div class="mb-5">
        <div class="inline-block bg-[#034c6a] rounded-[18px] px-[30px] py-2 text-white font-bold text-lg">
          <i
            class="inline-block w-[18px] h-[18px] relative top-0.5 mr-2 bg-white bg-center bg-no-repeat bg-contain"></i>
          实时监控
        </div>
      </div>

      <!-- RTSP Input -->
      <div v-if="showRtspInput && !rtspConnected" class="mb-4">
        <div
          class="flex items-center justify-between py-3 px-5 bg-[#072951] border border-dashed border-[#034c6a] rounded-lg">
          <div class="flex items-center gap-2 text-[#e8f7fe] text-sm whitespace-nowrap">
            <el-icon :size="20" color="#4b8df8">
              <VideoCamera />
            </el-icon>
            <span>RTSP 视频流地址</span>
          </div>
          <div class="flex gap-2 flex-1 ml-4">
            <input v-model="rtspUrl" placeholder="请输入 RTSP 流地址，如 rtsp://192.168.1.100:554/stream"
              class="flex-1 py-2 px-3 rounded-md border border-[#034c6a] bg-[#081832] text-white text-[13px] outline-none focus:border-[#4b8df8] placeholder:text-white/40" />
            <button
              class="px-5 py-2 rounded-md text-sm font-medium cursor-pointer border-none text-white whitespace-nowrap transition-opacity duration-200 hover:opacity-90"
              style="background: linear-gradient(to bottom, #4b8df8, #25f3e6)" @click="connectRtsp">
              连接
            </button>
          </div>
        </div>
      </div>

      <div v-if="rtspConnected" class="mb-4">
        <div
          class="flex items-center justify-between py-3 px-5 bg-[#072951] border border-solid border-[#034c6a] rounded-lg">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-[#25f3e6] animate-pulse"></span>
            <span class="text-[#61d2f7] text-[13px]">{{ rtspUrl }}</span>
          </div>
          <button
            class="py-1.5 px-4 rounded-md text-[13px] cursor-pointer border border-[#ff4e4e] bg-transparent text-[#ff4e4e] transition-all duration-200 hover:bg-[rgba(255,78,78,0.15)]"
            @click="disconnectRtsp">
            断开连接
          </button>
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="flex flex-wrap gap-[1%] mb-4">
        <div class="stat-item">
          <div class="stat-value">{{ stats.totalVehicles }}</div>
          <div class="stat-label">总车辆数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value text-[#25f3e6]">{{ stats.busCount }}</div>
          <div class="stat-label">今日巴士</div>
        </div>
        <div class="stat-item">
          <div class="stat-value text-[#4b8df8]">{{ stats.truckCount }}</div>
          <div class="stat-label">今日卡车</div>
        </div>
        <div class="stat-item">
          <div class="stat-value text-[#ff4e4e]">{{ stats.tankerCount }}</div>
          <div class="stat-label">油罐车</div>
        </div>
        <div class="stat-item">
          <div class="stat-value text-[#ffff43]">{{ stats.onlineCameras }}</div>
          <div class="stat-label">在线摄像头</div>
        </div>
        <div class="stat-item">
          <div class="stat-value text-[#ff4e4e]">{{ stats.todayWarnings }}</div>
          <div class="stat-label">今日预警</div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex gap-4">
        <!-- Left Column -->
        <div class="w-[16.666%]">
          <div class="panel-wrapper">
            <div class="panel-title-pill">实时跟踪列表</div>
            <div class="panel-body">
              <div v-for="item in trackingList" :key="item.id" class="tracking-item last:border-b-0">
                <div class="tracking-id">{{ item.id }}</div>
                <div class="tracking-info">
                  <span :class="['tag-sm', getCategoryClass(item.category)]">
                    {{ getCategoryLabel(item.category) }}
                  </span>
                  <span class="tracking-cam">Cam {{ item.cam }}</span>
                </div>
                <div class="tracking-time">{{ item.time }}</div>
              </div>
            </div>
          </div>

          <div class="panel-wrapper">
            <div class="panel-title-pill">今日流量趋势</div>
            <div class="panel-body" style="padding: 8px;">
              <div id="trendChart" class="h-[160px]"></div>
            </div>
          </div>
        </div>

        <!-- Center Column -->
        <div class="w-1/2">
          <div class="panel-wrapper">
            <div class="panel-title-pill">
              <span>实时监控</span>
              <div class="flex items-center">
                <select v-model="activeCamera"
                  class="bg-transparent border border-white/20 text-white rounded px-1.5 py-0.5 text-xs outline-none cursor-pointer">
                  <option v-for="cam in cameras" :key="cam.id" :value="cam.id" class="bg-[#081832] text-white">
                    {{ cam.name }} ({{ cam.status === 'online' ? '在线' : '离线' }})
                  </option>
                </select>
              </div>
            </div>
            <div class="panel-body" style="padding: 0;">
              <div class="aspect-video bg-gradient-to-br from-[#072951] to-[#081832] rounded overflow-hidden relative">
                <div class="absolute inset-0 flex flex-col justify-between p-4">
                  <div class="flex justify-between text-white/70 text-xs">
                    <span>{{cameras.find(c => c.id === activeCamera)?.name}}</span>
                    <span>{{ new Date().toLocaleString('zh-CN') }}</span>
                  </div>
                  <div class="flex flex-col items-center text-white/40">
                    <el-icon :size="64" class="mb-2 opacity-50">
                      <VideoCamera />
                    </el-icon>
                    <p>实时监控画面</p>
                  </div>
                  <div class="flex justify-center text-white/40 text-xs">
                    <span>Camera {{ activeCamera }} - 隧道监控</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="panel-wrapper">
            <div class="panel-title-pill">
              <span>隧道模拟视图</span>
              <span class="tunnel-length">全长: 2.5km</span>
            </div>
            <div class="panel-body">
              <div class="relative h-20 rounded-lg border border-[#034c6a]"
                style="background: linear-gradient(90deg, #072951 0%, #034c6a 50%, #072951 100%);">
                <div v-for="cam in cameras" :key="cam.id" class="cam-marker" :style="{ left: `${(cam.id - 1) * 25}%` }">
                  <div :class="['cam-dot', cam.status === 'online' ? 'online' : 'offline']">
                    <el-icon>
                      <VideoCamera />
                    </el-icon>
                  </div>
                  <div class="cam-label-text">Cam {{ cam.id }}</div>
                </div>
                <div class="vehicle on-road" style="left:25%">
                  <div class="v-icon bus">B</div>
                  <div class="v-id">ID_016</div>
                </div>
                <div class="vehicle on-road" style="left:50%">
                  <div class="v-icon truck">T</div>
                  <div class="v-id">ID_017</div>
                </div>
                <div class="vehicle on-road" style="left:75%">
                  <div class="v-icon bus">B</div>
                  <div class="v-id">ID_018</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="w-1/3">
          <div class="panel-wrapper">
            <div class="panel-title-pill">
              <span>环境监测数据</span>
              <span class="pill-status">正常</span>
            </div>
            <div class="panel-body">
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
            </div>
          </div>

          <div class="panel-wrapper">
            <div class="panel-title-pill">车辆类型分布</div>
            <div class="panel-body" style="padding: 8px;">
              <div id="typeChart" class="h-[160px]"></div>
            </div>
          </div>

          <div class="panel-wrapper">
            <div class="panel-title-pill">系统状态</div>
            <div class="panel-body">
              <div class="flex flex-col gap-3">
                <div class="status-row">
                  <span class="status-label">服务器状态</span>
                  <span class="status-badge ok">运行中</span>
                </div>
                <div class="status-row">
                  <span class="status-label">数据库连接</span>
                  <span class="status-badge ok">正常</span>
                </div>
                <div class="status-row">
                  <span class="status-label">AI 识别服务</span>
                  <span class="status-badge ok">运行中</span>
                </div>
                <div class="status-row">
                  <span class="status-label">存储空间</span>
                  <el-progress :percentage="72" :color="'#4b8df8'" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-item {
  width: 15.66%;
  background: #034c6a;
  border-radius: 8px;
  padding: 16px 8px;
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #ffff43;
  line-height: 1.2;
}

.stat-label {
  font-size: 12px;
  color: #e8f7fe;
  margin-top: 4px;
}

.panel-wrapper {
  position: relative;
  box-shadow: -10px 0 15px #034c6a inset,
    0 -10px 15px #034c6a inset,
    10px 0 15px #034c6a inset,
    0 10px 15px #034c6a inset;
  border: 1px solid #034c6a;
  border-radius: 8px;
  box-sizing: border-box;
  margin-top: 25px;
  margin-bottom: 16px;
}

.panel-title-pill {
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 12px;
  box-sizing: border-box;
}

.pill-status {
  font-size: 11px;
  font-weight: normal;
  background: rgba(37, 243, 230, 0.2);
  color: #25f3e6;
  padding: 0 8px;
  border-radius: 10px;
}

.tunnel-length {
  font-size: 11px;
  font-weight: normal;
  color: #61d2f7;
}

.panel-body {
  padding: 20px 12px 12px;
}

.tracking-item {
  padding: 8px 0;
  border-bottom: 1px solid #034c6a;
}

.tracking-id {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 2px;
}

.tracking-info {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-bottom: 2px;
}

.tag-sm {
  padding: 1px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
}

.tag-blue {
  background: rgba(75, 141, 248, 0.25);
  color: #4b8df8;
  border: 1px solid #4b8df8;
}

.tag-green {
  background: rgba(37, 243, 230, 0.2);
  color: #25f3e6;
  border: 1px solid #25f3e6;
}

.tag-amber {
  background: rgba(255, 255, 67, 0.2);
  color: #ffff43;
  border: 1px solid #ffff43;
}

.tag-red {
  background: rgba(255, 78, 78, 0.2);
  color: #ff4e4e;
  border: 1px solid #ff4e4e;
}

.tracking-cam {
  font-size: 11px;
  color: #61d2f7;
}

.tracking-time {
  font-size: 11px;
  color: #61d2f7;
}

.cam-marker {
  position: absolute;
  top: 15%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cam-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
}

.cam-dot.online {
  background: #4b8df8;
  box-shadow: 0 0 8px rgba(75, 141, 248, 0.5);
}

.cam-dot.offline {
  background: #64748b;
}

.cam-label-text {
  margin-top: 2px;
  font-size: 10px;
  color: #61d2f7;
  font-weight: 500;
}

.vehicle {
  position: absolute;
  top: 45%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.v-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.3);
}

.v-icon.bus {
  background: #4b8df8;
}

.v-icon.truck {
  background: #25f3e6;
  color: #081832;
}

.v-id {
  margin-top: 1px;
  font-size: 9px;
  color: #61d2f7;
  background: rgba(8, 24, 50, 0.8);
  padding: 1px 4px;
  border-radius: 2px;
}

.env-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.env-item {
  text-align: center;
  padding: 12px;
  background: #072951;
  border-radius: 8px;
  border: 1px solid #034c6a;
}

.env-value {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.env-label {
  font-size: 12px;
  color: #61d2f7;
  margin-top: 2px;
}

.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-label {
  color: #61d2f7;
  font-size: 13px;
}

.status-badge {
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 10px;
}

.status-badge.ok {
  background: rgba(37, 243, 230, 0.2);
  color: #25f3e6;
  border: 1px solid #25f3e6;
}

:deep(.el-progress__text) {
  color: #61d2f7 !important;
}

:deep(.el-progress-bar__outer) {
  background: #034c6a;
}
</style>
