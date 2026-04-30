import request from '@/utils/request'

export interface SearchResult {
  vehicleId: string
  similarity: number
  vehicleType: string
  tracks: { location: string; time: string }[]
  imageUrlList: string[]
}

export async function searchByImage(file: File): Promise<SearchResult[]> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await request.post<any, { code: number; msg: string; data: SearchResult[] }>('/api/search', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  if (res.code !== 1) throw new Error(res.msg || '查询失败')
  return res.data
}
