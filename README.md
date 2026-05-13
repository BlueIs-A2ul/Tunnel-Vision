# TunnelVision - 隧道车辆监控系统

基于 Vue 3 + TypeScript + Vite + Electron 的隧道车辆智能监控管理平台，提供实时视频监控、车辆检测与重识别、数据统计分析等功能。

## 技术栈

| 类别 | 技术 |
|------|------|
| **前端框架** | Vue 3 + TypeScript |
| **构建工具** | Vite 5 |
| **桌面端** | Electron 30 |
| **UI 组件库** | Element Plus |
| **样式** | TailwindCSS v4 |
| **状态管理** | Pinia (persistedstate) |
| **路由** | Vue Router 5 (Hash History) |
| **HTTP 客户端** | Axios |
| **图表** | ECharts 6 |
| **地图** | 高德地图 (AMap) |
| **实时通信** | Socket.IO (检测数据) + WebRTC/WHEP (视频流) |
| **视频播放** | HLS.js |

## 功能模块

| 模块 | 说明 |
|------|------|
| **数据总览** | 车辆统计概览、通行趋势图表 |
| **实时监控** | 多路 RTSP 视频流实时播放，车辆检测与重识别结果叠加显示 |
| **车辆归档日志** | 历史车辆通行记录查询与回放 |
| **以图搜车** | 基于图像特征检索车辆信息 |
| **用户管理** | 管理员维护系统用户账号与权限 |
| **系统设置** | 摄像头数量、视频帧率、抽帧检测间隔等参数配置 |

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式（支持 HMR）
npm run dev

# 类型检查
npm run check

# 代码检查
npm run lint

# 构建
npm run build
```

## 开发说明


### 组件自动导入

使用 Element Plus 组件时无需手动导入，Vite 插件（unplugin-vue-components）会自动处理：

```vue
<template>
  <el-button type="primary">按钮</el-button>
</template>
```

### 样式的使用方式

- 优先使用 TailwindCSS 原子类
- 仅在多组件复用样式时提取到 CSS 文件
- 全局样式统一引入 TailwindCSS 指令

### 路由说明

- 路由模式：Hash History（适配 Electron 文件协议）
- 路由守卫自动处理认证状态：
  - 未登录访问受保护页面 → 重定向到 `/login`
  - 已登录访问 `/login` 或 `/register` → 重定向到 `/dashboard`
- 配置路径：`src/router/index.ts`

### 跨平台构建

支持 Windows（NSIS 安装包）、macOS（DMG）、Linux（AppImage），配置见 `electron-builder.json5`。
