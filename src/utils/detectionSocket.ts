import { io, Socket } from 'socket.io-client'
import type {
  DetectionResultData,
  ResultPayload,
  StatsPayload,
} from '@/types/detection'

const SOCKET_URL = import.meta.env.VITE_API_PYTHON_BASE_URL
const NAMESPACE = '/ws/events'

let socket: Socket | null = null
let _onResult: OnDetectionResult | undefined
let _onStats: OnStats | undefined

export type OnDetectionResult = (data: DetectionResultData) => void
export type OnStats = (data: StatsPayload['data']) => void

/**
 * 连接深度学习端 Socket.IO 服务
 * 连接后自动 subscribe result + stats 频道
 */
export function connectDetectionSocket(
  onResult?: OnDetectionResult,
  onStats?: OnStats,
) {
  _onResult = onResult
  _onStats = onStats

  if (socket?.connected) return socket

  socket = io(`${SOCKET_URL}${NAMESPACE}`, {
    transports: ['websocket'],
    forceNew: true,
  })

  socket.on('connect', () => {
    console.log('[Detection] Socket.IO 已连接:', socket?.id)
    socket?.emit('subscribe', { channels: ['result', 'stats'] })
  })

  socket.on('result', (payload: ResultPayload) => {
    if (payload?.type !== 'vehicle_detected') return
    if (payload.data?.vehicles?.length) {
      console.log('[Detection] 收到检测结果:', payload.data)
    }
    onResult?.(payload.data)
  })

  socket.on('stats', (payload: StatsPayload) => {
    if (payload.data?.total_vehicles !== 0) {
      console.log('[Detection] 收到统计数据:', payload.data)
    }
    _onStats?.(payload.data)
  })

  socket.on('disconnect', (reason: any) => {
    console.log('[Detection] Socket.IO 已断开:', reason)
  })

  socket.on('connect_error', (err: any) => {
    console.error('[Detection] Socket.IO 连接错误:', err.message)
  })

  return socket
}

/** 断开 Python 端 Socket.IO 连接 */
export function disconnectDetectionSocket() {
  socket?.disconnect()
  socket = null
}

/** 判断连接是否活跃 */
export function isDetectionConnected(): boolean {
  return socket?.connected ?? false
}

/**
 * 模拟检测结果（仅开发环境使用）
 * 使用方式：浏览器 Console 中调用 window.__mockDetectionResult(streamId, vehicles)
 */
export function mockDetectionResult(streamId: string, vehicles: DetectionResultData['vehicles']) {
  if (!_onResult) {
    console.warn('[Detection Mock] 检测回调未注册，请先连接检测 WebSocket')
    return
  }
  const data: DetectionResultData = {
    stream_id: streamId,
    frame_id: Date.now(),
    timestamp: Date.now(),
    vehicles,
    stats: { fps: 30, inference_ms: 50 },
  }
  console.log('[Detection Mock] 注入假检测结果:', data)
  _onResult(data)
}

if (import.meta.env.DEV) {
  ;(window as any).__mockDetectionResult = mockDetectionResult
}
