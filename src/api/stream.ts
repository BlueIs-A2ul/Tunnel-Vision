/**
 * 检测流管理 API（调用深度学习端 Python 服务）
 */

import axios from 'axios'
import type {
  StartStreamRequest,
  StartStreamResponse,
  GetStreamsResponse,
  StreamOpResponse,
} from '@/types/detection'

const pythonApi = axios.create({
  // TODO 使用env变量
  baseURL: import.meta.env.VITE_API_PYTHON_BASE_URL,
  timeout: 10000,
})

pythonApi.interceptors.response.use(
  response => response.data,
  error => Promise.reject(error),
)

/**
 * 开启检测流推理
 * POST /api/stream
 */
export function startDetection(
  params: StartStreamRequest,
): Promise<StartStreamResponse> {
  return pythonApi.post('/api/stream', params)
}

/**
 * 获取当前活动检测流列表
 * GET /api/stream
 */
export function getDetectionStreams(): Promise<GetStreamsResponse> {
  return pythonApi.get('/api/stream')
}

/**
 * 停止指定检测流推理
 * DELETE /api/stream/<stream_id>
 */
export function stopDetection(streamId: string): Promise<StreamOpResponse> {
  return pythonApi.delete(`/api/stream/${streamId}`)
}
