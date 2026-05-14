const VIDEO_URL = import.meta.env.VITE_API_VIDEO_BASE_URL

export function rtspToHlsUrl(rtspUrl: string): string | null {
  try {
    const url = new URL(rtspUrl)
    const segments = url.pathname.split('/').filter(s => s)
    if (segments.length === 0) return null
    const last = segments[segments.length - 1]
    return `${VIDEO_URL}/${last}/index.m3u8`
  } catch {
    return null
  }
}
