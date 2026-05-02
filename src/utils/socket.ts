import io from 'socket.io-client'

const SOCKET_URL = 'http://118.24.178.134:8081'
let socket: SocketIOClient.Socket | null = null

/**
 * 连接 Java 后端 WebSocket（告警/演示数据推送）
 * 命名空间：/
 * 事件名：message
 */
export function connectAlertSocket() {
  if (socket?.connected) return socket

  socket = io(`${SOCKET_URL}/`, {
    transports: ['websocket'],
    forceNew: true,
  })

  socket.on('connect', () => {
    console.log('WS 已连接:', socket?.id)
  })

  socket.on('message', (_data: any) => {
    //console.log('WS message:', data)
  })

  socket.on('disconnect', (reason: any) => {
    console.log('WS 已断开:', reason)
  })

  socket.on('connect_error', (err: any) => {
    console.error('WS 连接错误:', err.message)
  })

  return socket
}

/**
 * 断开 WebSocket 连接
 */
export function disconnectAlertSocket() {
  socket?.disconnect()
  socket = null
}
