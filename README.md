# 隧道监控系统 (TunnelVision)

基于 Vue 3 + TypeScript + Vite + Electron 的隧道车辆监控管理平台。

## 技术栈

- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **桌面端**: Electron
- **UI 组件库**: Element Plus
- **样式**: TailwindCSS v4
- **状态管理**: Pinia
- **路由**: Vue Router
- **HTTP 客户端**: Axios

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建

```bash
npm run build
```

## 项目结构

```
src/
├── api/              # API 接口封装
├── components/       # 公共组件
│   └── layout/       # 布局组件
├── router/           # 路由配置
├── stores/           # Pinia 状态管理
├── types/            # TypeScript 类型定义
├── utils/            # 工具函数
├── views/            # 页面视图
│   ├── Login/        # 登录页
│   └── Home/         # 首页
└── style.css         # 全局样式
```

## 登录功能

### 测试账号

- 管理员: `admin` / `admin123`
- 普通用户: `user` / `user123`

### 特性

- 支持"记住我"功能
- 登录成功后跳转到实时监控页
- 未登录自动重定向到登录页
- 登录状态持久化存储

## 开发说明

### 组件自动导入

使用 Element Plus 组件时无需手动导入，Vite 插件会自动处理。例如直接使用：

```vue
<template>
  <el-button type="primary">按钮</el-button>
</template>
```

### 样式规范

- 使用内联 Tailwind CSS 类名
- 仅在多组件复用样式时提取到 CSS 文件
- 遵循浅色主题配色规范

### 路由

- 路由配置在 `src/router/index.ts`
- 需要登录的页面设置 `meta: { requiresAuth: true }`
- 路由守卫自动处理未登录跳转

## 注意事项

- 构建过程会执行 TypeScript 类型检查 (`vue-tsc`)
- Electron 主进程入口: `dist-electron/main.js`
- API 目前使用 Mock 数据，后端就绪后修改 `src/api/auth.ts` 中的 `USE_MOCK` 配置
