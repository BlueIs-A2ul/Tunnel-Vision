/**
 * 系统参数设置
 */
export interface SystemSettings {
  /** 默认摄像头数量 */
  cameraCount: number
  /** 视频同步帧率 */
  frameRate: number
  /** 抽帧检测间隔（秒） */
  detectionInterval: number
}
