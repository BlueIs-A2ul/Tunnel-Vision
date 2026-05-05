import { ref } from 'vue'
import type { DetectionVehicle } from '@/types/detection'

export function useDetectionOverlay() {
  const canvasRef = ref<HTMLCanvasElement | null>(null)
  let videoEl: HTMLVideoElement | null = null
  let ctx: CanvasRenderingContext2D | null = null

  function init(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
    videoEl = video
    canvasRef.value = canvas
    ctx = canvas.getContext('2d')
  }

  /** 收到 detection result 后直接调用绘制 */
  function drawFrame(vehicles: DetectionVehicle[]) {
    const c = canvasRef.value
    if (!c || !videoEl || !ctx || !videoEl.videoWidth || !videoEl.videoHeight) return

    const rect = videoEl.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    c.width = Math.round(rect.width * dpr)
    c.height = Math.round(rect.height * dpr)
    c.style.width = `${rect.width}px`
    c.style.height = `${rect.height}px`

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, rect.width, rect.height)

    const videoRatio = videoEl.videoWidth / videoEl.videoHeight
    const containerRatio = rect.width / rect.height

    let drawW: number
    let drawH: number
    let offsetX = 0
    let offsetY = 0

    if (containerRatio > videoRatio) {
      drawH = rect.height
      drawW = drawH * videoRatio
      offsetX = (rect.width - drawW) / 2
    } else {
      drawW = rect.width
      drawH = drawW / videoRatio
      offsetY = (rect.height - drawH) / 2
    }

    const scaleX = drawW / videoEl.videoWidth
    const scaleY = drawH / videoEl.videoHeight

    for (const vehicle of vehicles) {
      const [x1, y1, x2, y2] = vehicle.bbox
      const left = offsetX + x1 * scaleX
      const top = offsetY + y1 * scaleY
      const width = (x2 - x1) * scaleX
      const height = (y2 - y1) * scaleY

      ctx.strokeStyle = '#20e070'
      ctx.lineWidth = 2
      ctx.strokeRect(left, top, width, height)

      ctx.font = '14px sans-serif'
      ctx.fillStyle = '#20e070'
      ctx.fillText(
        `${vehicle.vehicle_id} ${vehicle.category} ${vehicle.similarity.toFixed(2)}`,
        left,
        Math.max(14, top - 6),
      )
    }
  }

  function dispose() {
    videoEl = null
    canvasRef.value = null
    ctx = null
  }

  return { canvasRef, init, drawFrame, dispose }
}
