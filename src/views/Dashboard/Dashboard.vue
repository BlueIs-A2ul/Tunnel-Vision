<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

// 统计数据
const stats = ref({
  totalVehicles: 128,
  bus: 12,
  truck: 8,
  tanker: 3,
  onlineCameras: 5,
  systemStatus: '正常运行'
})

// 设备列表
const devices = ref([
  { id: 'CAM_001', name: '入口摄像头', status: 'online', location: '隧道入口' },
  { id: 'CAM_002', name: '中段监控A', status: 'online', location: 'K2+500' },
  { id: 'CAM_003', name: '中段监控B', status: 'online', location: 'K5+000' },
  { id: 'CAM_004', name: '出口摄像头', status: 'warning', location: '隧道出口' },
  { id: 'CAM_005', name: '应急通道', status: 'online', location: '应急通道' },
])

// 环境数据
const envData = ref({
  temperature: 24.5,
  humidity: 68,
  windSpeed: 2.3,
  airQuality: 85,
  visibility: 1200
})

// 警报日志
const alerts = ref([
  { id: 1, type: 'warning', message: 'CAM_004 信号不稳定', time: '10:23:45' },
  { id: 2, type: 'info', message: '车辆 ID_028 正常驶离', time: '10:22:12' },
  { id: 3, type: 'info', message: '车辆 ID_027 正常驶离', time: '10:21:38' },
  { id: 4, type: 'success', message: '系统自检完成', time: '10:20:00' },
])

// 隧道中的车辆
const tunnelVehicles = ref([
  { id: 'V_001', type: 'bus', x: 0.2, lane: 0 },
  { id: 'V_002', type: 'truck', x: 0.45, lane: 1 },
  { id: 'V_003', type: 'car', x: 0.7, lane: 0 },
  { id: 'V_004', type: 'bus', x: 0.85, lane: 1 },
])

// Canvas 动画
const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationId: number

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 设置 canvas 尺寸
  const resize = () => {
    const rect = canvas.parentElement?.getBoundingClientRect()
    if (rect) {
      canvas.width = rect.width
      canvas.height = rect.height
    }
  }
  resize()
  window.addEventListener('resize', resize)

  // 动画参数
  let flowOffset = 0
  const sensors = [
    { x: 0.1, active: true },
    { x: 0.3, active: true },
    { x: 0.5, active: true },
    { x: 0.7, active: true },
    { x: 0.9, active: false },
  ]

  const animate = () => {
    const w = canvas.width
    const h = canvas.height
    const centerY = h / 2

    // 清空画布
    ctx.fillStyle = '#0B0F1A'
    ctx.fillRect(0, 0, w, h)

    // 绘制隧道轮廓
    ctx.strokeStyle = '#1E293B'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(40, centerY - 60)
    ctx.lineTo(w - 40, centerY - 60)
    ctx.moveTo(40, centerY + 60)
    ctx.lineTo(w - 40, centerY + 60)
    ctx.stroke()

    // 绘制流光效果
    flowOffset = (flowOffset + 0.005) % 1
    const gradient = ctx.createLinearGradient(0, 0, w, 0)
    gradient.addColorStop(0, 'transparent')
    gradient.addColorStop((flowOffset + 0.3) % 1, 'rgba(0, 209, 255, 0.3)')
    gradient.addColorStop((flowOffset + 0.5) % 1, 'rgba(0, 255, 198, 0.5)')
    gradient.addColorStop((flowOffset + 0.7) % 1, 'rgba(122, 92, 255, 0.3)')
    gradient.addColorStop(1, 'transparent')

    ctx.fillStyle = gradient
    ctx.fillRect(40, centerY - 58, w - 80, 116)

    // 绘制车道分隔线
    ctx.strokeStyle = 'rgba(0, 209, 255, 0.2)'
    ctx.setLineDash([10, 10])
    ctx.beginPath()
    ctx.moveTo(40, centerY)
    ctx.lineTo(w - 40, centerY)
    ctx.stroke()
    ctx.setLineDash([])

    // 绘制传感器点
    sensors.forEach((sensor, i) => {
      const sx = 40 + (w - 80) * sensor.x
      const pulse = Math.sin(Date.now() / 500 + i) * 0.5 + 0.5

      // 外圈脉冲
      ctx.beginPath()
      ctx.arc(sx, centerY - 80, 8 + pulse * 6, 0, Math.PI * 2)
      ctx.fillStyle = sensor.active
        ? `rgba(0, 209, 255, ${0.3 * pulse})`
        : 'rgba(255, 59, 59, 0.3)'
      ctx.fill()

      // 内核
      ctx.beginPath()
      ctx.arc(sx, centerY - 80, 5, 0, Math.PI * 2)
      ctx.fillStyle = sensor.active ? '#00D1FF' : '#FF3B3B'
      ctx.shadowColor = sensor.active ? '#00D1FF' : '#FF3B3B'
      ctx.shadowBlur = 10
      ctx.fill()
      ctx.shadowBlur = 0

      // 标签
      ctx.fillStyle = '#64748B'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`Cam ${i + 1}`, sx, centerY - 95)
    })

    // 绘制车辆
    tunnelVehicles.value.forEach(v => {
      const vx = 40 + (w - 80) * v.x
      const vy = v.lane === 0 ? centerY - 25 : centerY + 25

      // 车辆光晕
      ctx.beginPath()
      ctx.arc(vx, vy, 12, 0, Math.PI * 2)
      ctx.fillStyle = v.type === 'bus' ? 'rgba(0, 255, 198, 0.2)' : 'rgba(122, 92, 255, 0.2)'
      ctx.fill()

      // 车辆主体
      ctx.beginPath()
      ctx.arc(vx, vy, 6, 0, Math.PI * 2)
      ctx.fillStyle = v.type === 'bus' ? '#00FFC6' : '#7A5CFF'
      ctx.shadowColor = v.type === 'bus' ? '#00FFC6' : '#7A5CFF'
      ctx.shadowBlur = 8
      ctx.fill()
      ctx.shadowBlur = 0

      // 车辆ID
      ctx.fillStyle = '#94A3B8'
      ctx.font = '9px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(v.id.split('_')[1], vx, vy + 20)
    })

    // 绘制网格装饰
    ctx.strokeStyle = 'rgba(0, 209, 255, 0.05)'
    ctx.lineWidth = 1
    for (let i = 0; i < w; i += 40) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, h)
      ctx.stroke()
    }

    animationId = requestAnimationFrame(animate)
  }

  animate()

  onUnmounted(() => {
    window.removeEventListener('resize', resize)
    cancelAnimationFrame(animationId)
  })
})

// 状态颜色
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    online: 'bg-[#00FFC6]',
    warning: 'bg-[#FFB800]',
    offline: 'bg-[#FF3B3B]'
  }
  return colors[status] || 'bg-gray-500'
}

const getAlertColor = (type: string) => {
  const colors: Record<string, string> = {
    warning: 'text-[#FFB800] border-[#FFB800]/30',
    info: 'text-[#00D1FF] border-[#00D1FF]/30',
    success: 'text-[#00FFC6] border-[#00FFC6]/30',
    error: 'text-[#FF3B3B] border-[#FF3B3B]/30'
  }
  return colors[type] || 'text-gray-400'
}

// 时间显示
const currentTime = ref(new Date().toLocaleTimeString('zh-CN'))
setInterval(() => {
  currentTime.value = new Date().toLocaleTimeString('zh-CN')
}, 1000)
</script>

<template>
  <div class="dashboard-container min-h-screen bg-[#0B0F1A] p-4">
    <!-- 顶部标题栏 -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00D1FF] to-[#7A5CFF] flex items-center justify-center shadow-lg shadow-[#00D1FF]/20">
          <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </div>
        <div>
          <h1 class="text-xl font-bold text-white">隧道智能监控系统</h1>
          <p class="text-xs text-[#64748B]">Tunnel Intelligent Monitoring System</p>
        </div>
      </div>
      <div class="flex items-center gap-6">
        <div class="text-right">
          <div class="text-2xl font-mono text-[#00D1FF]">{{ currentTime }}</div>
          <div class="text-xs text-[#64748B]">{{ new Date().toLocaleDateString('zh-CN') }}</div>
        </div>
        <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-[#00FFC6]/10 border border-[#00FFC6]/30">
          <div class="w-2 h-2 rounded-full bg-[#00FFC6] animate-pulse"></div>
          <span class="text-sm text-[#00FFC6]">系统正常</span>
        </div>
      </div>
    </div>

    <!-- 顶部统计卡片 -->
    <div class="grid grid-cols-6 gap-3 mb-4">
      <div v-for="(value, key) in { '总车辆': stats.totalVehicles, '巴士': stats.bus, '卡车': stats.truck, '油罐车': stats.tanker, '在线摄像头': stats.onlineCameras }" :key="key"
           class="glass-card rounded-xl p-3 relative overflow-hidden group">
        <div class="absolute inset-0 bg-gradient-to-br from-[#00D1FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div class="text-2xl font-bold text-white mb-1">{{ value }}</div>
        <div class="text-xs text-[#64748B]">{{ key }}</div>
        <div class="absolute top-2 right-2 w-8 h-8 rounded-lg bg-gradient-to-br from-[#00D1FF]/20 to-[#7A5CFF]/20 flex items-center justify-center">
          <div class="w-2 h-2 rounded-full bg-[#00D1FF] animate-ping"></div>
        </div>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="grid grid-cols-12 gap-4" style="height: calc(100vh - 220px);">
      <!-- 左侧：设备列表 -->
      <div class="col-span-2 glass-card rounded-xl p-4 flex flex-col">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-white flex items-center gap-2">
            <span class="w-1 h-4 bg-[#00D1FF] rounded-full"></span>
            设备状态
          </h3>
          <span class="text-xs text-[#64748B]">{{ devices.filter(d => d.status === 'online').length }}/{{ devices.length }}</span>
        </div>
        <div class="flex-1 overflow-y-auto space-y-2 pr-1">
          <div v-for="device in devices" :key="device.id"
               class="device-item p-3 rounded-lg bg-[#1E293B]/50 border border-[#334155] hover:border-[#00D1FF]/50 transition-all cursor-pointer group">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-white">{{ device.name }}</span>
              <div :class="['w-2 h-2 rounded-full animate-pulse', getStatusColor(device.status)]"></div>
            </div>
            <div class="text-xs text-[#64748B]">{{ device.id }}</div>
            <div class="text-xs text-[#94A3B8] mt-1">{{ device.location }}</div>
          </div>
        </div>
      </div>

      <!-- 中央：隧道可视化 -->
      <div class="col-span-7 glass-card rounded-xl p-4 flex flex-col">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-white flex items-center gap-2">
            <span class="w-1 h-4 bg-[#00FFC6] rounded-full"></span>
            隧道实时监控
          </h3>
          <div class="flex items-center gap-4 text-xs">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-[#00FFC6]"></div>
              <span class="text-[#64748B]">巴士</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-[#7A5CFF]"></div>
              <span class="text-[#64748B]">卡车/其他</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-[#00D1FF] animate-pulse"></div>
              <span class="text-[#64748B]">传感器</span>
            </div>
          </div>
        </div>
        <div class="flex-1 relative rounded-lg bg-[#0B0F1A] border border-[#1E293B] overflow-hidden">
          <canvas ref="canvasRef" class="w-full h-full"></canvas>
          <!-- 覆盖信息 -->
          <div class="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#0B0F1A]/80 border border-[#334155] text-xs text-[#94A3B8]">
            实时渲染 | {{ tunnelVehicles.length }} 辆车辆
          </div>
        </div>
        <!-- 底部统计条 -->
        <div class="mt-3 grid grid-cols-4 gap-3">
          <div class="p-2 rounded-lg bg-[#1E293B]/50 text-center">
            <div class="text-lg font-bold text-[#00D1FF]">1,245</div>
            <div class="text-xs text-[#64748B]">今日通行</div>
          </div>
          <div class="p-2 rounded-lg bg-[#1E293B]/50 text-center">
            <div class="text-lg font-bold text-[#00FFC6]">42</div>
            <div class="text-xs text-[#64748B]">平均车速(km/h)</div>
          </div>
          <div class="p-2 rounded-lg bg-[#1E293B]/50 text-center">
            <div class="text-lg font-bold text-[#7A5CFF]">3</div>
            <div class="text-xs text-[#64748B]">拥堵路段</div>
          </div>
          <div class="p-2 rounded-lg bg-[#1E293B]/50 text-center">
            <div class="text-lg font-bold text-white">0</div>
            <div class="text-xs text-[#64748B]">事故警报</div>
          </div>
        </div>
      </div>

      <!-- 右侧：环境数据 -->
      <div class="col-span-3 glass-card rounded-xl p-4 flex flex-col">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-white flex items-center gap-2">
            <span class="w-1 h-4 bg-[#7A5CFF] rounded-full"></span>
            环境监测
          </h3>
          <span class="text-xs px-2 py-0.5 rounded-full bg-[#00FFC6]/10 text-[#00FFC6]">正常</span>
        </div>
        <div class="flex-1 space-y-3">
          <!-- 温度 -->
          <div class="env-gauge p-3 rounded-lg bg-[#1E293B]/50 border border-[#334155]">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs text-[#64748B]">温度</span>
              <span class="text-sm font-bold text-[#00D1FF]">{{ envData.temperature }}°C</span>
            </div>
            <div class="h-1.5 rounded-full bg-[#334155] overflow-hidden">
              <div class="h-full rounded-full bg-gradient-to-r from-[#00D1FF] to-[#00FFC6]" style="width: 65%"></div>
            </div>
          </div>
          <!-- 湿度 -->
          <div class="env-gauge p-3 rounded-lg bg-[#1E293B]/50 border border-[#334155]">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs text-[#64748B]">湿度</span>
              <span class="text-sm font-bold text-[#7A5CFF]">{{ envData.humidity }}%</span>
            </div>
            <div class="h-1.5 rounded-full bg-[#334155] overflow-hidden">
              <div class="h-full rounded-full bg-gradient-to-r from-[#7A5CFF] to-[#00D1FF]" style="width: 68%"></div>
            </div>
          </div>
          <!-- 风速 -->
          <div class="env-gauge p-3 rounded-lg bg-[#1E293B]/50 border border-[#334155]">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs text-[#64748B]">风速</span>
              <span class="text-sm font-bold text-[#00FFC6]">{{ envData.windSpeed }} m/s</span>
            </div>
            <div class="h-1.5 rounded-full bg-[#334155] overflow-hidden">
              <div class="h-full rounded-full bg-gradient-to-r from-[#00FFC6] to-[#00D1FF]" style="width: 30%"></div>
            </div>
          </div>
          <!-- 能见度 -->
          <div class="env-gauge p-3 rounded-lg bg-[#1E293B]/50 border border-[#334155]">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs text-[#64748B]">能见度</span>
              <span class="text-sm font-bold text-white">{{ envData.visibility }} m</span>
            </div>
            <div class="h-1.5 rounded-full bg-[#334155] overflow-hidden">
              <div class="h-full rounded-full bg-gradient-to-r from-[#00D1FF] to-white" style="width: 85%"></div>
            </div>
          </div>
          <!-- 空气质量 -->
          <div class="p-3 rounded-lg bg-gradient-to-br from-[#00FFC6]/10 to-[#00D1FF]/10 border border-[#00FFC6]/30">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full bg-[#00FFC6]/20 flex items-center justify-center">
                <span class="text-lg font-bold text-[#00FFC6]">优</span>
              </div>
              <div>
                <div class="text-xs text-[#64748B]">空气质量指数</div>
                <div class="text-xl font-bold text-[#00FFC6]">{{ envData.airQuality }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部：警报日志 -->
    <div class="mt-4 glass-card rounded-xl p-4" style="height: 120px;">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-semibold text-white flex items-center gap-2">
          <span class="w-1 h-4 bg-[#FF3B3B] rounded-full"></span>
          实时警报与日志
        </h3>
        <div class="flex items-center gap-2">
          <button class="px-3 py-1 rounded-lg bg-[#1E293B] text-xs text-[#94A3B8] hover:bg-[#334155] transition-colors">
            全部
          </button>
          <button class="px-3 py-1 rounded-lg bg-[#FF3B3B]/10 text-xs text-[#FF3B3B] hover:bg-[#FF3B3B]/20 transition-colors">
            警报
          </button>
          <button class="px-3 py-1 rounded-lg bg-[#00D1FF]/10 text-xs text-[#00D1FF] hover:bg-[#00D1FF]/20 transition-colors">
            信息
          </button>
        </div>
      </div>
      <div class="overflow-x-auto">
        <div class="flex gap-3" style="min-width: max-content;">
          <div v-for="alert in alerts" :key="alert.id"
               :class="['alert-item px-4 py-2 rounded-lg border bg-[#0B0F1A]/50 flex items-center gap-3', getAlertColor(alert.type)]">
            <div :class="['w-2 h-2 rounded-full', 
              alert.type === 'warning' ? 'bg-[#FFB800]' : 
              alert.type === 'error' ? 'bg-[#FF3B3B]' : 
              alert.type === 'success' ? 'bg-[#00FFC6]' : 'bg-[#00D1FF]']">
            </div>
            <span class="text-sm font-mono text-[#94A3B8]">{{ alert.time }}</span>
            <span class="text-sm">{{ alert.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  background-image:
    radial-gradient(circle at 20% 50%, rgba(0, 209, 255, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(122, 92, 255, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 40% 20%, rgba(0, 255, 198, 0.02) 0%, transparent 50%);
}

.glass-card {
  background: rgba(30, 41, 59, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(51, 65, 85, 0.5);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.3),
    0 2px 4px -1px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.glass-card:hover {
  border-color: rgba(0, 209, 255, 0.3);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.3),
    0 2px 4px -1px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 0 20px rgba(0, 209, 255, 0.1);
}

.device-item {
  position: relative;
  overflow: hidden;
}

.device-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(to bottom, #00D1FF, #7A5CFF);
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.device-item:hover::before {
  transform: scaleY(1);
}

.env-gauge {
  position: relative;
  overflow: hidden;
}

.env-gauge::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 209, 255, 0.1), transparent);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  50%, 100% { left: 100%; }
}

.alert-item {
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-track {
  background: rgba(30, 41, 59, 0.5);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 209, 255, 0.3);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 209, 255, 0.5);
}
</style>
