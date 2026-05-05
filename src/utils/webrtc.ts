import { WHEPClient } from 'whip-whep-client'
import Hls from 'hls.js'

const MEDIA_MTX_HOST = 'http://localhost'

let whepClient: WHEPClient | null = null
let hls: Hls | null = null

export async function playWebRTC(streamName: string, video: HTMLVideoElement) {
  stopWebRTC()
  stopHLS()

  video.src = ''
  video.srcObject = null

  const endpoint = `${MEDIA_MTX_HOST}:8889/${streamName}/whep`

  try {
    whepClient = new WHEPClient({ endpoint })
    whepClient.on('stream', (stream: MediaStream) => {
      video.srcObject = stream
    })
    await whepClient.view()
    await video.play()
  } catch (err) {
    console.error('WebRTC 播放失败，尝试 HLS 兜底:', err)
    stopWebRTC()
    playHLS(streamName, video)
  }
}

export function stopWebRTC() {
  if (whepClient) {
    whepClient.stop().catch(() => {})
    whepClient = null
  }
}

function playHLS(streamName: string, video: HTMLVideoElement) {
  stopHLS()
  stopWebRTC()

  video.src = ''
  video.srcObject = null

  const url = `${MEDIA_MTX_HOST}:8888/${streamName}/index.m3u8`

  if (Hls.isSupported()) {
    hls = new Hls({ lowLatencyMode: true })
    hls.loadSource(url)
    hls.attachMedia(video)
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play().catch(() => {})
    })
    return
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url
    video.play().catch(() => {})
  }
}

function stopHLS() {
  if (hls) {
    hls.destroy()
    hls = null
  }
}

export function stopStream() {
  stopWebRTC()
  stopHLS()
}
