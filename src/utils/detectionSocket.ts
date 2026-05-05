import io from 'socket.io-client'
import type { DetectionResultData, ResultPayload, StatsPayload } from '@/types/detection'

const SOCKET_URL = 'http://76d09927.r30.cpolar.top:5000'
const NAMESPACE = '/ws/events'

let socket: SocketIOClient.Socket | null = null

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
    onResult?.(payload.data)
  })

  socket.on('stats', (payload: StatsPayload) => {
    onStats?.(payload.data)
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
