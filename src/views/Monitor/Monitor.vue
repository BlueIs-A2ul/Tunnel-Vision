<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { VideoCamera } from '@element-plus/icons-vue'
import { startMonitoring } from '@/api/realtime'
import type { StreamInfo } from '@/types/detection'
import { healthCheck, startDetection, getDetectionStreams, stopDetection } from '@/api/stream'
import { connectAlertSocket, disconnectAlertSocket } from '@/utils/socket'
import { connectDetectionSocket, disconnectDetectionSocket, isDetectionConnected } from '@/utils/detectionSocket'
import { useDetectionOverlay } from '@/composables/useDetectionOverlay'
import { playDirectHLS, stopStream } from '@/utils/webrtc'
import { rtspToHlsUrl } from '@/utils/hlsMapper'
import StatCards from './components/StatCards.vue'
import VehicleTypeChart from './components/VehicleTypeChart.vue'
import SystemStatus from './components/SystemStatus.vue'


const cameras = ref([
  { id: 1, name: 'Camera 01', location: '入口段' },
  { id: 2, name: 'Camera 02', location: '中段A' },
  { id: 3, name: 'Camera 03', location: '中段B' },
  { id: 4, name: 'Camera 04', location: '中段C' },
  { id: 5, name: 'Camera 05', location: '出口段' },
])

const stats = ref({
  totalVehicles: 0,
  busCount: 0,
  truckCount: 0,
  tankerCount: 0,
  onlineCameras: 0,
  todayWarnings: 0,
})

const alertedVehicles = new Set<string>()

const trackingList = ref<{ id: string; category: string; cam: number; time: string; danger: boolean }[]>([])

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
const pyConnected = ref(false)

const dialogVisible = ref(false)
const streamStarting = ref(false)

const rtspUrls = ref<string[]>([
  localStorage.getItem('monitor_rtsp_cam01') || '',
  localStorage.getItem('monitor_rtsp_cam02') || '',
  localStorage.getItem('monitor_rtsp_cam03') || '',
  localStorage.getItem('monitor_rtsp_cam04') || '',
  localStorage.getItem('monitor_rtsp_cam05') || '',
])

function persistRtspUrls() {
  rtspUrls.value.forEach((url, i) => {
    localStorage.setItem(`monitor_rtsp_cam0${i + 1}`, url)
  })
}

async function startAllStreams() {
  if (!pyConnected.value) {
    ElMessage.warning('Python 推理服务未连接，请检查服务状态')
    return
  }
  streamStarting.value = true
  let successCount = 0
  let failCount = 0
  for (let i = 0; i < 5; i++) {
    const url = rtspUrls.value[i]
    if (!url) {
      ElMessage.warning(`Camera 0${i + 1} 未填写 RTSP 地址，已跳过`)
      failCount++
      continue
    }
    try {
      await startDetection({ name: `Camera 0${i + 1}`, rtsp_url: url, position: i + 1 })
      ElMessage.success(`Camera 0${i + 1} 已启动`)
      successCount++
    } catch {
      ElMessage.error(`Camera 0${i + 1} 启动失败`)
      failCount++
    }
  }
  persistRtspUrls()
  streamStarting.value = false
  ElMessage({ message: `启动完成：成功 ${successCount}，失败 ${failCount}`, type: successCount === 5 ? 'success' : 'warning' })
  fetchStreamList()
}

async function stopSingleStream(camIndex: number) {
  const streamId = camIndex + 1
  try {
    await stopDetection(streamId)
    ElMessage.success(`Camera 0${camIndex + 1} 已停止`)
    fetchStreamList()
  } catch {
    ElMessage.error(`Camera 0${camIndex + 1} 停止失败`)
  }
}

const streamList = ref<StreamInfo[]>([])
const streamIdToCam = ref<Record<number, number>>({})
let streamPollTimer: ReturnType<typeof setInterval> | null = null

function fetchStreamList() {
  getDetectionStreams()
    .then(res => {
      streamList.value = res.data.streams || []
      stats.value.onlineCameras = streamList.value.filter(s => s.status === 'active').length
      const map: Record<number, number> = {}
      streamList.value.forEach(s => {
        map[s.stream_id] = s.position
      })
      streamIdToCam.value = map
    })
    .catch(() => {
      // 静默处理，避免轮询日志洪泛
    })
}

const streamStatusMap = computed<Record<number, string>>(() => {
  const map: Record<number, string> = {}
  streamList.value.forEach(s => {
    map[s.position] = s.status
  })
  return map
})

function getTunnelIconClass(camId: number): string {
  const s = streamStatusMap.value[camId]
  if (s === 'active') return 'bg-[#4b8df8] shadow-[0_0_8px_rgba(75,141,248,0.5)]'
  if (s === 'connecting') return 'bg-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.5)]'
  if (s === 'error') return 'bg-[#ff4e4e] shadow-[0_0_8px_rgba(255,78,78,0.5)]'
  return 'bg-[#64748b]'
}

const detectionCanvasRef = ref<HTMLCanvasElement | null>(null)
const {
  init: initDetection,
  updateTracks,
  setActiveStream,
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

  const hlsUrl = rtspToHlsUrl(rtspUrls.value[camId - 1])
  console.log(`Playing Camera ${camId} with HLS URL: ${hlsUrl}`)
  if (hlsUrl && videoRef.value) {
    playDirectHLS(hlsUrl, videoRef.value)
  }

  setActiveStream(camId)
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

async function fetchRealtimeData() {
  // data driven by WebSocket
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
      }

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
      trackingList.value = (data.currentVehicles || []).map((v: any) => ({
        id: v.vehicleId,
        category: v.category,
        cam: parseInt((v.cameraId || '').replace('cam_', ''), 10) || 0,
        time: new Date(v.timestamp).toLocaleTimeString('zh-CN', { hour12: false }),
        danger: oldDangerMap[v.vehicleId] || false,
      }))

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

  try {
    const health = await healthCheck()
    pyConnected.value = health.status === 'ok'
    if (pyConnected.value) {
      fetchStreamList()
      streamPollTimer = setInterval(fetchStreamList, 20000)
    }
  } catch {
    pyConnected.value = false
  }

  await nextTick()

  await startMonitoring()
  connectAlertSocket(handleWsMessage)

  if (import.meta.env.DEV) {
    ;(window as any).__setStreamIdMap = (map: Record<number, number>) => {
      streamIdToCam.value = map
      console.log('[Dev] 流映射已注入:', map, '当前选中摄像头:', activeCamera.value)
    }
  }
})

onUnmounted(() => {
  if (streamPollTimer) {
    clearInterval(streamPollTimer)
    streamPollTimer = null
  }
  disconnectAlertSocket()
  disconnectDetectionSocket()
  stopStream()
  streamList.value.forEach(s => {
    if (s.status === 'active' || s.status === 'connecting') {
      stopDetection(s.stream_id).catch(() => {})
    }
  })
  disposeDetection()
  videoRef.value?.pause()
})

watch(
  streamList,
  (list) => {
    if (isDetectionConnected()) return
    if (list.some(s => s.status === 'active')) {
      connectDetectionSocket(
        (data) => {
          updateTracks(data.stream_id, data.tracks)
        },
        (statsData) => {
          stats.value.totalVehicles = statsData.total_vehicles
          stats.value.busCount = statsData.bus
          stats.value.truckCount = statsData.truck
          stats.value.tankerCount = statsData.tanker
          stats.value.onlineCameras = statsData.active_streams
        },
      )
    }
  },
  { deep: true },
)
</script>

<template>
  <div class="min-h-[calc(100vh-80px)] bg-[#081832]">
    <div class="w-[98%] mx-auto py-4">
      <div class="mb-5 flex items-center gap-3">
        <div
          class="inline-flex items-center bg-[#034c6a] rounded-[18px] px-7.5 py-2 text-white font-bold text-lg gap-2">
          <el-icon :size="20" color="#4b8df8">
            <VideoCamera />
          </el-icon>
          实时监控
        </div>
        <el-button :icon="VideoCamera" @click="dialogVisible = true"
          class="!bg-[#034c6a] !border-[#034c6a] !text-[#e8f7fe] hover:!bg-[#04425f] hover:!border-[#04425f]">
          配置推理流
        </el-button>
      </div>

      <!-- Stat Cards -->
      <StatCards :stats="stats" />

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
                        {{ cam.name }} ({{ streamStatusMap[cam.id] === 'active' ? '运行中' : streamStatusMap[cam.id] ===
                          'connecting' ? '连接中' : streamStatusMap[cam.id] === 'error' ? '异常' : '未启动' }})
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
              <VehicleTypeChart :busCount="stats.busCount" :truckCount="stats.truckCount" :tankerCount="stats.tankerCount" />
              <SystemStatus :pyConnected="pyConnected" />
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
                      :class="['w-8 h-8 rounded-full flex items-center justify-center text-white text-sm transition-all duration-300', getTunnelIconClass(cam.id), cam.id === activeCamera ? 'ring-2 ring-[#25f3e6] ring-offset-2 ring-offset-[#081832] shadow-[0_0_16px_rgba(37,243,230,0.7)] scale-110' : '']">
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

  <el-dialog v-model="dialogVisible" title="配置推理流" width="520px" :close-on-click-modal="false" class="monitor-dialog">
    <div class="flex flex-col gap-3">
      <div v-for="(_, i) in 5" :key="i" class="flex items-center gap-2">
        <span class="text-white text-sm w-24 shrink-0">Camera 0{{ i + 1 }}</span>
        <el-input v-model="rtspUrls[i]" placeholder="rtsp://..." size="small" class="flex-1" />
        <span v-if="streamStatusMap[i + 1]"
          :class="['text-[10px] px-2 py-0.5 rounded-[10px] border shrink-0', streamStatusMap[i + 1] === 'active' ? 'text-[#25f3e6] bg-[rgba(37,243,230,0.15)] border-[#25f3e6]' : streamStatusMap[i + 1] === 'connecting' ? 'text-[#f59e0b] bg-[rgba(245,158,11,0.15)] border-[#f59e0b]' : 'text-[#ff4e4e] bg-[rgba(255,78,78,0.15)] border-[#ff4e4e]']">{{
            streamStatusMap[i + 1] === 'active' ? '运行中' : streamStatusMap[i + 1] === 'connecting' ? '连接中' :
              streamStatusMap[i + 1] === 'stopped' ? '已停止' : '异常' }}</span>
        <el-button v-if="streamStatusMap[i + 1] === 'active' || streamStatusMap[i + 1] === 'connecting'" size="small"
          type="danger" text @click="stopSingleStream(i)">停止</el-button>
      </div>
    </div>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="streamStarting" @click="startAllStreams">启动全部</el-button>
    </template>
  </el-dialog>
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

<style>
.monitor-dialog {
  --el-dialog-bg-color: #081832;
  --el-dialog-title-font-color: #e8f7fe;
}

.monitor-dialog .el-dialog__header {
  border-bottom: 1px solid #034c6a;
}

.monitor-dialog .el-dialog__footer {
  border-top: 1px solid #034c6a;
}

.monitor-dialog .el-input__wrapper {
  background-color: #072951;
  box-shadow: 0 0 0 1px #034c6a inset;
}

.monitor-dialog .el-input__inner {
  color: #e8f7fe;
}
</style>
