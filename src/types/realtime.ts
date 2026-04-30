/**
 * 实时车辆统计数据相关类型
 */

/** 当前在线车辆 */
export interface CurrentVehicle {
  vehicleId: string
  category: string
  cameraId: string
  timestamp: number
}

/** 实时统计数据 */
export interface RealtimeStatsData {
  totalVehicleCount: number
  busCount: number
  truckCount: number
  tankerCount: number
  currentVehicles: CurrentVehicle[]
}

/** 车辆统计汇总 */
export interface SummaryData {
  totalVehicleCount: number
  busCount: number
  truckCount: number
  tankerCount: number
}

/** 实时统计数据响应 */
export interface GetRealtimeStatsResponse {
  code: number
  msg: string
  data: RealtimeStatsData
}

/** 车辆统计汇总响应 */
export interface GetSummaryResponse {
  code: number
  msg: string
  data: SummaryData
}
