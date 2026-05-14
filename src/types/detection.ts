/**
 * 视频重识别检测结果相关类型
 */

/** 车辆检测信息 */
export interface DetectionVehicle {
  vehicle_id: string
  category: string
  bbox: [number, number, number, number]
  confidence: number
  track_id: number
  similarity: number
}

/** 检测帧统计数据 */
export interface DetectionStats {
  fps: number
  inference_ms: number
}

/** result 事件中 vehicle_detected 类型的实际数据载荷 */
export interface DetectionResultData {
  stream_id: string
  frame_id: number
  timestamp: number
  vehicles: DetectionVehicle[]
  stats: DetectionStats
}

/** result 事件的完整 payload */
export interface ResultPayload {
  type: 'vehicle_detected'
  data: DetectionResultData
}

/** stats 事件的完整 payload */
export interface StatsPayload {
  type: 'stats'
  data: Record<string, unknown>
}

/** 开启检测流请求体 */
export interface StartStreamRequest {
  name: string
  rtsp_url: string
  position: number
}

/** 单个检测流信息 */
export interface StreamInfo {
  stream_id: string
  name: string
  rtsp_url: string
  position: number
  status: string
  fps: number
  vehicles_count: number
}

/** 开启检测流响应 */
export interface StartStreamResponse {
  code: number
  message: string
  data: StreamInfo
}

/** 获取检测流列表响应 */
export interface GetStreamsResponse {
  code: number
  message?: string
  data: {
    streams: StreamInfo[]
    total: number
  }
}

/** 通用操作响应 */
export interface StreamOpResponse {
  code: number
  message: string
  data: string
}
