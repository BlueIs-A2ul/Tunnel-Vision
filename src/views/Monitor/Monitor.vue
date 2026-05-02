<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { VideoCamera } from '@element-plus/icons-vue'
import { getRealtimeStats } from '@/api/realtime'
import { startDemo, stopDemo } from '@/api/demo'
import { connectAlertSocket, disconnectAlertSocket } from '@/utils/socket'

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
  { id: 5, name: 'Camera 05', status: 'online', location: '出口段' },
])

const activeCamera = ref(1)

const videoRef = ref<HTMLVideoElement | null>(null)
const isVideoPlaying = ref(false)
const currentPlayTime = ref(0)

function getVideoSrc(camId: number): string {
  return `./videos/demo_burned_cam_0${camId}.mp4`
}

function playCamera(camId: number) {
  if (camId === activeCamera.value && isVideoPlaying.value) return

  if (isVideoPlaying.value && videoRef.value) {
    currentPlayTime.value = videoRef.value.currentTime
  }

  activeCamera.value = camId

  if (!isVideoPlaying.value) {
    isVideoPlaying.value = true
  }
}

function onCameraSelect(e: Event) {
  const camId = Number((e.target as HTMLSelectElement).value)
  playCamera(camId)
}

function onVideoTimeUpdate() {
  if (videoRef.value) {
    currentPlayTime.value = videoRef.value.currentTime
  }
}

function onVideoLoaded() {
  if (videoRef.value) {
    if (currentPlayTime.value > 0) {
      videoRef.value.currentTime = currentPlayTime.value
    }
    videoRef.value.play()
  }
}

function onVideoEnded() {
  isVideoPlaying.value = false
}

let trendChart: echarts.ECharts | null = null
let typeChart: echarts.ECharts | null = null
const handleEchartsResize = () => {
  trendChart?.resize()
  typeChart?.resize()
}

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

async function fetchRealtimeData() {
  try {
    const res = await getRealtimeStats()
    console.log('实时车辆统计数据:', res)
    if (res.code === 1 && res.data) {
      const d = res.data
      stats.value.totalVehicles = d.totalVehicleCount
      stats.value.busCount = d.busCount
      stats.value.truckCount = d.truckCount
      stats.value.tankerCount = d.tankerCount
      trackingList.value = d.currentVehicles.map(v => ({
        id: v.vehicleId,
        category: v.category,
        cam: parseInt(v.cameraId, 10) || 0,
        time: new Date(v.timestamp).toLocaleTimeString('zh-CN', { hour12: false }),
      }))
      updateTypeChart()
    }
  } catch (err) {
    console.error('获取实时数据失败:', err)
  }
}

function updateTypeChart() {
  if (!typeChart) return
  typeChart.setOption({
    series: [{
      data: [
        { value: stats.value.busCount, name: '巴士', itemStyle: { color: '#4b8df8' } },
        { value: stats.value.truckCount, name: '卡车', itemStyle: { color: '#25f3e6' } },
        { value: stats.value.tankerCount, name: '油罐车', itemStyle: { color: '#ff4e4e' } },
      ],
    }],
  })
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

onMounted(async () => {
  await fetchRealtimeData()

  await nextTick()
  initTrendChart()
  initTypeChart()
  updateTypeChart()

  refreshTimer = window.setInterval(fetchRealtimeData, 5000)

  connectAlertSocket()
  startDemo().then(res => console.log('演示开始:', res)).catch(err => console.error('演示开始失败:', err))

  window.addEventListener('resize', handleEchartsResize)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
  stopDemo().catch(() => { })
  disconnectAlertSocket()
  window.removeEventListener('resize', handleEchartsResize)
  videoRef.value?.pause()
  trendChart?.dispose()
  typeChart?.dispose()
  trendChart = null
  typeChart = null
})
</script>

<template>
  <div class="min-h-[calc(100vh-80px)] bg-[#081832]">
    <div class="w-[98%] mx-auto py-4">
      <div class="mb-5">
        <div
          class="inline-flex items-center bg-[#034c6a] rounded-[18px] px-[30px] py-2 text-white font-bold text-lg gap-2">
          <el-icon :size="20" color="#4b8df8">
            <VideoCamera />
          </el-icon>
          实时监控
        </div>
      </div>

      <!-- RTSP Input -->
      <div v-if="showRtspInput && !rtspConnected" class="mb-4">
        <div
          class="flex items-center justify-between py-3 px-5 bg-[#072951] border border-dashed border-[#034c6a] rounded-lg">
          <div class="flex items-center gap-2 text-[#e8f7fe] text-sm whitespace-nowrap">

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
        <div class="w-[15.66%] bg-[#034c6a] rounded-lg p-4 text-center">
          <div class="text-[28px] font-bold text-[#ffff43] leading-tight">{{ stats.totalVehicles }}</div>
          <div class="text-xs text-[#e8f7fe] mt-1">总车辆数</div>
        </div>
        <div class="w-[15.66%] bg-[#034c6a] rounded-lg p-4 text-center">
          <div class="text-[28px] font-bold text-[#25f3e6] leading-tight">{{ stats.busCount }}</div>
          <div class="text-xs text-[#e8f7fe] mt-1">巴士</div>
        </div>
        <div class="w-[15.66%] bg-[#034c6a] rounded-lg p-4 text-center">
          <div class="text-[28px] font-bold text-[#4b8df8] leading-tight">{{ stats.truckCount }}</div>
          <div class="text-xs text-[#e8f7fe] mt-1">卡车</div>
        </div>
        <div class="w-[15.66%] bg-[#034c6a] rounded-lg p-4 text-center">
          <div class="text-[28px] font-bold text-[#ff4e4e] leading-tight">{{ stats.tankerCount }}</div>
          <div class="text-xs text-[#e8f7fe] mt-1">油罐车</div>
        </div>
        <div class="w-[15.66%] bg-[#034c6a] rounded-lg p-4 text-center">
          <div class="text-[28px] font-bold text-[#ffff43] leading-tight">{{ stats.onlineCameras }}</div>
          <div class="text-xs text-[#e8f7fe] mt-1">在线摄像头</div>
        </div>
        <div class="w-[15.66%] bg-[#034c6a] rounded-lg p-4 text-center">
          <div class="text-[28px] font-bold text-[#ff4e4e] leading-tight">{{ stats.todayWarnings }}</div>
          <div class="text-xs text-[#e8f7fe] mt-1">今日预警</div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex gap-4">
        <!-- Left Column -->
        <div class="w-[16.666%]">
          <div class="relative border border-[#034c6a] rounded-lg mt-6 mb-4
            shadow-[-10px_0_15px_#034c6a_inset,0_-10px_15px_#034c6a_inset,10px_0_15px_#034c6a_inset,0_10px_15px_#034c6a_inset]
            box-border">
            <div
              class="absolute -top-3.75 left-[20%] bg-[#034c6a] rounded-[18px] h-8.75 w-3/5 leading-8.75 text-center text-sm font-bold text-white z-10 flex items-center justify-center gap-2 px-3 box-border">
              实时跟踪列表
            </div>
            <div class="pt-5 px-3 pb-3 max-h-[480px] overflow-y-auto">
              <div v-for="item in trackingList" :key="item.id" class="py-2 border-b border-[#034c6a] last:border-b-0">
                <div class="text-[13px] font-semibold text-white mb-0.5">{{ item.id }}</div>
                <div class="flex gap-1.5 items-center mb-0.5">
                  <span
                    :class="['px-2 py-0.5 rounded-[10px] text-[10px] font-medium', getCategoryClass(item.category)]">
                    {{ getCategoryLabel(item.category) }}
                  </span>
                  <span class="text-[11px] text-[#61d2f7]">Cam {{ item.cam }}</span>
                </div>
                <div class="text-[11px] text-[#61d2f7]">{{ item.time }}</div>
              </div>
            </div>
          </div>

          <div class="relative border border-[#034c6a] rounded-lg mt-6 mb-4
            shadow-[-10px_0_15px_#034c6a_inset,0_-10px_15px_#034c6a_inset,10px_0_15px_#034c6a_inset,0_10px_15px_#034c6a_inset]
            box-border">
            <div
              class="absolute -top-3.75 left-[20%] bg-[#034c6a] rounded-[18px] h-8.75 w-3/5 leading-8.75 text-center text-sm font-bold text-white z-10 flex items-center justify-center gap-2 px-3 box-border">
              今日流量趋势
            </div>
            <div class="pt-5 px-3 pb-3">
              <div id="trendChart" class="h-40"></div>
            </div>
          </div>
        </div>

        <!-- Right Column (merged center + right) -->
        <div class="flex-1 flex flex-col gap-4 min-w-0">
          <!-- Top Section: flex row -->
          <div class="flex gap-4 min-w-0">
            <!-- 实时监控 -->
            <div class="flex-1 min-w-0">
              <div class="relative border border-[#034c6a] rounded-lg mt-6 mb-4
                shadow-[-10px_0_15px_#034c6a_inset,0_-10px_15px_#034c6a_inset,10px_0_15px_#034c6a_inset,0_10px_15px_#034c6a_inset]
                box-border">
                <div
                  class="absolute -top-3.75 left-[20%] bg-[#034c6a] rounded-[18px] h-8.75 w-3/5 leading-8.75 text-center text-sm font-bold text-white z-10 flex items-center justify-center gap-2 px-3 box-border">
                  <span>实时监控</span>
                  <div class="flex items-center">
                    <select :value="activeCamera" @change="onCameraSelect"
                      class="bg-transparent border border-white/20 text-white rounded px-1.5 py-0.5 text-xs outline-none cursor-pointer">
                      <option v-for="cam in cameras" :key="cam.id" :value="cam.id" class="bg-[#081832] text-white">
                        {{ cam.name }} ({{ cam.status === 'online' ? '在线' : '离线' }})
                      </option>
                    </select>
                  </div>
                </div>
                <div class="pt-5 px-3 pb-3">
                  <div
                    class="aspect-video bg-gradient-to-br from-[#072951] to-[#081832] rounded overflow-hidden relative">
                    <video
                      v-if="isVideoPlaying"
                      :key="activeCamera"
                      ref="videoRef"
                      :src="getVideoSrc(activeCamera)"
                      class="w-full h-full object-cover"
                      controls
                      @timeupdate="onVideoTimeUpdate"
                      @loadedmetadata="onVideoLoaded"
                      @ended="onVideoEnded"
                    />
                    <div v-else class="absolute inset-0 flex flex-col justify-between p-4">
                      <div class="flex justify-between text-white/70 text-xs">
                        <span>{{cameras.find(c => c.id === activeCamera)?.name}}</span>
                        <span>{{ new Date().toLocaleString('zh-CN') }}</span>
                      </div>
                      <div class="flex flex-col items-center text-white/40">
                        <el-icon :size="64" class="mb-2 opacity-50">
                          <VideoCamera />
                        </el-icon>
                        <p>点击隧道模拟视图中的摄像头图标开始播放</p>
                      </div>
                      <div class="flex justify-center text-white/40 text-xs">
                        <span>Camera {{ activeCamera }} - 隧道监控</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- 车辆类型分布 + 系统状态 -->
            <div class="w-[35%] min-w-0">
              <div class="relative border border-[#034c6a] rounded-lg mt-6 mb-4
                shadow-[-10px_0_15px_#034c6a_inset,0_-10px_15px_#034c6a_inset,10px_0_15px_#034c6a_inset,0_10px_15px_#034c6a_inset]
                box-border">
                <div
                  class="absolute -top-3.75 left-[20%] bg-[#034c6a] rounded-[18px] h-8.75 w-3/5 leading-8.75 text-center text-sm font-bold text-white z-10 flex items-center justify-center gap-2 px-3 box-border">
                  车辆类型分布
                </div>
                <div class="pt-5 px-2 pb-2">
                  <div id="typeChart" class="h-80"></div>
                </div>
              </div>

              <div class="relative border border-[#034c6a] rounded-lg mt-6 mb-4
                shadow-[-10px_0_15px_#034c6a_inset,0_-10px_15px_#034c6a_inset,10px_0_15px_#034c6a_inset,0_10px_15px_#034c6a_inset]
                box-border">
                <div
                  class="absolute -top-3.75 left-[20%] bg-[#034c6a] rounded-[18px] h-8.75 w-3/5 leading-8.75 text-center text-sm font-bold text-white z-10 flex items-center justify-center gap-2 px-3 box-border">
                  系统状态
                </div>
                <div class="pt-5 px-5 pb-5">
                  <div class="flex flex-col gap-3">
                    <div class="flex justify-between items-center">
                      <span class="text-[#61d2f7] text-[13px]">服务器状态</span>
                      <span
                        class="text-[12px] px-2.5 py-0.5 rounded-[10px] bg-[rgba(37,243,230,0.2)] text-[#25f3e6] border border-[#25f3e6]">运行中</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-[#61d2f7] text-[13px]">数据库连接</span>
                      <span
                        class="text-[12px] px-2.5 py-0.5 rounded-[10px] bg-[rgba(37,243,230,0.2)] text-[#25f3e6] border border-[#25f3e6]">正常</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-[#61d2f7] text-[13px]">AI 识别服务</span>
                      <span
                        class="text-[12px] px-2.5 py-0.5 rounded-[10px] bg-[rgba(37,243,230,0.2)] text-[#25f3e6] border border-[#25f3e6]">运行中</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Bottom Section: 隧道模拟视图 -->
          <div>
            <div class="relative border border-[#034c6a] rounded-lg mt-6 mb-4
              shadow-[-10px_0_15px_#034c6a_inset,0_-10px_15px_#034c6a_inset,10px_0_15px_#034c6a_inset,0_10px_15px_#034c6a_inset]
              box-border">
              <div
                class="absolute -top-3.75 left-[20%] bg-[#034c6a] rounded-[18px] h-8.75 w-3/5 leading-8.75 text-center text-sm font-bold text-white z-10 flex items-center justify-center gap-2 px-3 box-border">
                <span>隧道模拟视图</span>
                <span class="text-[11px] font-normal text-[#61d2f7]">全长: 2.5km</span>
              </div>
              <div class="pt-5 px-3 pb-3">
                <div class="relative h-20 rounded-lg border border-[#034c6a]"
                  style="background: linear-gradient(90deg, #072951 0%, #034c6a 50%, #072951 100%);">
                  <div v-for="cam in cameras" :key="cam.id"
                    class="absolute top-[45%] flex flex-col items-center cursor-pointer"
                    :style="{ left: `${(cam.id - 1) * 25}%`, transform: 'translate(-50%, -50%)' }"
                    @click="playCamera(cam.id)">
                    <div
                      :class="['w-8 h-8 rounded-full flex items-center justify-center text-white text-sm transition-all duration-300', cam.status === 'online' ? 'bg-[#4b8df8]' : 'bg-[#64748b]', cam.status === 'online' ? 'shadow-[0_0_8px_rgba(75,141,248,0.5)]' : '', cam.id === activeCamera ? 'ring-2 ring-[#25f3e6] ring-offset-2 ring-offset-[#081832] shadow-[0_0_16px_rgba(37,243,230,0.7)] scale-110' : '']">
                      <el-icon>
                        <VideoCamera />
                      </el-icon>
                    </div>
                    <div class="mt-0.5 text-[10px] text-[#61d2f7] font-medium">{{ cam.name }}</div>
                  </div>
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
/* 标签颜色类 - 通过 getCategoryClass() 动态绑定 */
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

/* Element Plus 组件样式覆盖 */
:deep(.el-progress__text) {
  color: #61d2f7 !important;
}

:deep(.el-progress-bar__outer) {
  background: #034c6a;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #034c6a;
  border-radius: 2px;
}
</style>
