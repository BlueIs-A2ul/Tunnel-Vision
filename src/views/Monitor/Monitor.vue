<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { VideoCamera } from '@element-plus/icons-vue'
import { startMonitoring } from '@/api/realtime'
import { connectAlertSocket, disconnectAlertSocket } from '@/utils/socket'
import { connectDetectionSocket, disconnectDetectionSocket } from '@/utils/detectionSocket'
import { useDetectionOverlay } from '@/composables/useDetectionOverlay'
import { playDirectHLS, stopStream } from '@/utils/webrtc'

// TODO 使用输入框让用户配置
const cameras = ref([
  { id: 1, name: 'Camera 01', status: 'online', location: '入口段', hlsUrl: 'http://b4951fd.r21.cpolar.top/cam01/index.m3u8' },
  { id: 2, name: 'Camera 02', status: 'online', location: '中段A', hlsUrl: 'http://b4951fd.r21.cpolar.top/cam02/index.m3u8' },
  { id: 3, name: 'Camera 03', status: 'online', location: '中段B', hlsUrl: 'http://b4951fd.r21.cpolar.top/cam03/index.m3u8' },
  { id: 4, name: 'Camera 04', status: 'online', location: '中段C', hlsUrl: 'http://b4951fd.r21.cpolar.top/cam04/index.m3u8' },
  { id: 5, name: 'Camera 05', status: 'online', location: '出口段', hlsUrl: 'http://b4951fd.r21.cpolar.top/cam05/index.m3u8' },
])

const stats = ref({
  totalVehicles: 128,
  busCount: 45,
  truckCount: 38,
  tankerCount: 5,
  onlineCameras: 5,
  todayWarnings: 3,
})

const alertedVehicles = new Set<string>()

const trackingList = ref([
  { id: 'ID_016', category: 'bus', cam: 3, time: '10:23:15', danger: false },
  { id: 'ID_017', category: 'truck', cam: 2, time: '10:22:48', danger: false },
  { id: 'ID_018', category: 'bus', cam: 2, time: '10:21:33', danger: false },
  { id: 'ID_019', category: 'car', cam: 4, time: '10:20:12', danger: false },
  { id: 'ID_020', category: 'truck', cam: 1, time: '10:19:55', danger: false },
])

const colorPalette = [
  { bg: '#ff4757', text: '#fff' },
  { bg: '#2ed573', text: '#fff' },
  { bg: '#1e90ff', text: '#fff' },
  { bg: '#ffa502', text: '#fff' },
  { bg: '#a855f7', text: '#fff' },
]
let nextColorSlot = 0
const vehicleColorMap = new Map<string, number>()

function getVehicleColor(id: string) {
  let idx = vehicleColorMap.get(id)
  if (idx === undefined) {
    idx = nextColorSlot % colorPalette.length
    nextColorSlot++
    vehicleColorMap.set(id, idx)
  }
  return colorPalette[idx]
}

interface TunnelVehicle {
  id: string
  category: string
  left: number
}
const tunnelVehicles = ref<TunnelVehicle[]>([])

const activeCamera = ref(1)
const videoRef = ref<HTMLVideoElement | null>(null)
const isVideoPlaying = ref(false)

const detectionCanvasRef = ref<HTMLCanvasElement | null>(null)
const {
  init: initDetection,
  drawFrame,
  dispose: disposeDetection,
} = useDetectionOverlay()

function playCamera(camId: number) {
  if (camId === activeCamera.value && isVideoPlaying.value) {
    return
  }

  activeCamera.value = camId

  if (!isVideoPlaying.value) {
    isVideoPlaying.value = true
  }

  const cam = cameras.value.find(c => c.id === camId)
  if (cam && videoRef.value) {
    playDirectHLS(cam.hlsUrl, videoRef.value)
  }
}

function onCameraSelect(e: Event) {
  const camId = Number((e.target as HTMLSelectElement).value)
  playCamera(camId)
}

function onVideoCanPlay() {
  if (!videoRef.value || !detectionCanvasRef.value) return
  initDetection(videoRef.value, detectionCanvasRef.value)
}

function onVideoEnded() {
  isVideoPlaying.value = false
}

let typeChart: echarts.ECharts | null = null
const handleEchartsResize = () => {
  typeChart?.resize()
}

const darkTooltip: echarts.EChartsOption['tooltip'] = {
  backgroundColor: 'rgba(3, 8, 41, 0.9)',
  borderColor: '#034c6a',
  textStyle: { color: '#ffffff' },
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
  // data driven by WebSocket
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

function handleWsMessage(data: { type: string;[key: string]: any }) {
  switch (data.type) {
    case 'vehicle_pass': {
      const idx = trackingList.value.findIndex(v => v.id === data.vehicle_id)
      const entry = {
        id: data.vehicle_id,
        category: data.category,
        cam: parseInt((data.camera_id || '').replace('cam_', ''), 10) || 0,
        time: new Date(data.exit_time).toLocaleTimeString('zh-CN', { hour12: false }),
        danger: idx >= 0 ? trackingList.value[idx].danger : false,
      }
      if (idx >= 0) {
        trackingList.value[idx] = entry
      } else {
        trackingList.value.unshift(entry)
        stats.value.totalVehicles++
        if (data.category === 'bus') stats.value.busCount++
        else if (data.category === 'truck') stats.value.truckCount++
        else if (data.category === 'tanker') stats.value.tankerCount++
      }
      updateTypeChart()

      const camNumber = parseInt((data.camera_id || '').replace('cam_', ''), 10) || 0
      const vid = data.vehicle_id
      if (camNumber >= 5) {
        tunnelVehicles.value = tunnelVehicles.value.filter(v => v.id !== vid)
      } else {
        const existing = tunnelVehicles.value.find(v => v.id === vid)
        if (existing) {
          existing.left = (camNumber - 1) * 25 + 20
        } else {
          const entry: TunnelVehicle = { id: vid, category: data.category, left: (camNumber - 1) * 25 }
          tunnelVehicles.value.push(entry)
          requestAnimationFrame(() => {
            entry.left = (camNumber - 1) * 25 + 20
          })
        }
      }
      break
    }

    case 'stats': {
      const oldDangerMap: Record<string, boolean> = {}
      trackingList.value.forEach(v => { if (v.danger) oldDangerMap[v.id] = true })
      stats.value.totalVehicles = data.totalVehicleCount
      stats.value.busCount = data.busCount
      stats.value.truckCount = data.truckCount
      stats.value.tankerCount = data.tankerCount
      trackingList.value = (data.currentVehicles || []).map((v: any) => ({
        id: v.vehicleId,
        category: v.category,
        cam: parseInt((v.cameraId || '').replace('cam_', ''), 10) || 0,
        time: new Date(v.timestamp).toLocaleTimeString('zh-CN', { hour12: false }),
        danger: oldDangerMap[v.vehicleId] || false,
      }))
      updateTypeChart()

      const oldTunnelMap = new Map(tunnelVehicles.value.map(v => [v.id, { left: v.left, category: v.category }]))
      tunnelVehicles.value = (data.currentVehicles || []).map((v: any) => {
        const camNumber = parseInt((v.cameraId || '').replace('cam_', ''), 10) || 0
        const old = oldTunnelMap.get(v.vehicleId)
        if (old !== undefined) {
          return { id: v.vehicleId, category: v.category, left: old.left }
        }
        const entry: TunnelVehicle = { id: v.vehicleId, category: v.category, left: (camNumber - 1) * 25 }
        requestAnimationFrame(() => {
          entry.left = (camNumber - 1) * 25 + 20
        })
        return entry
      })
      break
    }

    case 'alert': {
      if (alertedVehicles.has(data.vehicle_id)) break
      alertedVehicles.add(data.vehicle_id)
      const target = trackingList.value.find(v => v.id === data.vehicle_id)
      if (target) target.danger = true
      stats.value.todayWarnings++
      ElNotification.warning({
        title: '告警',
        message: data.message,
        duration: 5000,
      })
      break
    }
  }
}

onMounted(async () => {
  await fetchRealtimeData()

  await nextTick()
  initTypeChart()
  updateTypeChart()

  await startMonitoring()
  connectAlertSocket(handleWsMessage)
  connectDetectionSocket(
    (data) => {
      drawFrame(data.vehicles)
    },
  )

  window.addEventListener('resize', handleEchartsResize)
})

onUnmounted(() => {
  disconnectAlertSocket()
  disconnectDetectionSocket()
  stopStream()
  disposeDetection()
  window.removeEventListener('resize', handleEchartsResize)
  videoRef.value?.pause()
  typeChart = null
})
</script>

<template>
  <div class="min-h-[calc(100vh-80px)] bg-[#081832]">
    <div class="w-[98%] mx-auto py-4">
      <div class="mb-5">
        <div
          class="inline-flex items-center bg-[#034c6a] rounded-[18px] px-7.5 py-2 text-white font-bold text-lg gap-2">
          <el-icon :size="20" color="#4b8df8">
            <VideoCamera />
          </el-icon>
          实时监控
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
            <div class="pt-5 px-3 pb-3 max-h-120 overflow-y-auto">
              <div v-for="item in trackingList" :key="item.id" class="py-2 border-b border-[#034c6a] last:border-b-0">
                <div class="text-[13px] font-semibold text-white mb-0.5">{{ item.id }}</div>
                <div class="flex gap-1.5 items-center mb-0.5">
                  <span
                    :class="['px-2 py-0.5 rounded-[10px] text-[10px] font-medium', getCategoryClass(item.category)]">
                    {{ getCategoryLabel(item.category) }}
                  </span>
                  <span v-if="item.danger"
                    class="px-2 py-0.5 rounded-[10px] text-[10px] font-medium bg-[rgba(255,78,78,0.25)] text-[#ff4e4e] border border-[#ff4e4e]">危险</span>
                  <span class="text-[11px] text-[#61d2f7]">Cam {{ item.cam }}</span>
                </div>
                <div class="text-[11px] text-[#61d2f7]">{{ item.time }}</div>
              </div>
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
                    class="aspect-video bg-linear-to-br from-[#072951] to-[#081832] rounded overflow-hidden relative">
                    <video v-if="isVideoPlaying" ref="videoRef" class="w-full h-full object-contain" autoplay muted
                      playsinline @canplay="onVideoCanPlay" @ended="onVideoEnded" />
                    <canvas v-if="isVideoPlaying" ref="detectionCanvasRef"
                      class="absolute inset-0 w-full h-full pointer-events-none" />
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
                <!-- Camera Row -->
                <div class="relative h-10 rounded-t-lg border border-b-0 border-[#034c6a]"
                  style="background: linear-gradient(90deg, #072951 0%, #034c6a 50%, #072951 100%);">
                  <div v-for="cam in cameras" :key="cam.id"
                    class="absolute top-[50%] flex flex-col items-center cursor-pointer"
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
                <!-- Vehicle Row -->
                <div class="relative h-14 rounded-b-lg border border-t-0 border-[#034c6a]"
                  style="background: linear-gradient(90deg, #072951 0%, #034c6a 50%, #072951 100%);">
                  <div class="absolute top-[50%] left-0 right-0 -translate-y-1/2 border-t-2"
                    style="border-top-style: dashed; border-top-color: rgba(156,163,175,0.4)"></div>
                  <div v-for="v in tunnelVehicles" :key="v.id"
                    class="absolute top-[50%] -translate-x-1/2 -translate-y-1/2 px-2 py-1 rounded text-[11px] font-bold whitespace-nowrap z-10 shadow-[0_0_6px_rgba(0,0,0,0.4)]"
                    :style="{ left: v.left + '%', transition: 'left 4s linear', backgroundColor: getVehicleColor(v.id).bg, color: getVehicleColor(v.id).text }">
                    {{ v.id }}
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
