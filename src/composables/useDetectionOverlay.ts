import { ref } from 'vue'
import type { TrackInfo } from '@/types/detection'

interface TrackCacheEntry {
  tracks: TrackInfo[]
  receivedAt: number
}

const STALE_MS = 300

export function useDetectionOverlay() {
  const canvasRef = ref<HTMLCanvasElement | null>(null)
  let videoEl: HTMLVideoElement | null = null
  let ctx: CanvasRenderingContext2D | null = null
  let activeStream = -1
  let rafId: number | null = null
  const trackCache = new Map<number, TrackCacheEntry>()

  function init(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
    videoEl = video
    canvasRef.value = canvas
    ctx = canvas.getContext('2d')
    startRenderLoop()
  }

  function startRenderLoop() {
    if (rafId !== null) return
    const loop = () => {
      render()
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)
  }

  function stopRenderLoop() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  function render() {
    if (activeStream < 0) return

    const entry = trackCache.get(activeStream)
    if (!entry) return

    if (performance.now() - entry.receivedAt > STALE_MS) {
      clearCanvas()
      return
    }

    drawBoxes(entry.tracks)
  }

  function clearCanvas() {
    const c = canvasRef.value
    if (!c || !ctx) return
    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, c.width / dpr, c.height / dpr)
  }

  function drawBoxes(tracks: TrackInfo[]) {
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

    for (const track of tracks) {
      const [x1, y1, x2, y2] = track.bbox
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
        `${track.vehicle_id} ${track.category} ${track.similarity.toFixed(2)}`,
        left,
        Math.max(14, top - 6),
      )
    }
  }

  function updateTracks(_streamId: number, tracks: TrackInfo[]) {
    trackCache.set(_streamId, { tracks, receivedAt: performance.now() })
  }

  function setActiveStream(streamId: number) {
    if (activeStream !== streamId) {
      activeStream = streamId
      clearCanvas()
    }
  }

  function dispose() {
    stopRenderLoop()
    trackCache.clear()
    activeStream = -1
    videoEl = null
    canvasRef.value = null
    ctx = null
  }

  return { canvasRef, init, updateTracks, setActiveStream, dispose }
}
