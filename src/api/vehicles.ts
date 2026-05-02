/* ============================================
 * 车辆相关 API 接口
 * ============================================
 * getVehiclesWithImages  - 获取所有车辆及对应图片（聚合接口）
 * ============================================ */

import request from '@/utils/request'
import type { GetVehiclesWithImagesRes } from '@/types/vehicle'

/**
 * 获取所有车辆及对应图片（聚合接口）
 * GET /api/vehicle-images/with-images
 * @param date 可选日期筛选 YYYY-MM-DD
 * @returns
 */
export function getVehiclesWithImages(date?: string): Promise<GetVehiclesWithImagesRes> {
  const params = date ? { date } : {}
  return request.get('/api/vehicle-images/with-images', { params })
}
