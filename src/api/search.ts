/* ============================================
 * 图像搜索相关 API 接口
 * ============================================
 * searchByImage - 根据图像查询车辆
 * ============================================ */

import request from '@/utils/request'

export interface SearchResult {
  vehicleId: string
  similarity: number
  vehicleType: string
  tracks: { location: string; time: string }[]
  imageUrlList: string[]
}

export interface SearchByImageResponse {
  code: number
  msg: string
  data: SearchResult[]
}

/**
 * 根据图像查询车辆
 * @param {File} file 上传的图片文件
 * @returns
 */
export function searchByImage(file: File): Promise<SearchByImageResponse> {
  const formData = new FormData()
  formData.append('file', file)
  return request.post(`/api/ai/search`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
