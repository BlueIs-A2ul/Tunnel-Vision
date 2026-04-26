/**
 * 用户信息
 */
export interface User {
  /** 用户ID */
  id: number
  /** 用户名 */
  username: string
  /** 用户角色 */
  role: 'admin' | 'user'
  /** 创建时间 */
  createdAt: string
}

/**
 * 登录参数
 */
export interface LoginParams {
  /** 用户ID */
  id?: number
  /** 用户名 */
  username: string
  /** 密码 */
  password: string
  /** 是否管理员(1-是,0-否) */
  isAdmin?: number
}

/**
 * 登录响应
 */
export interface LoginResponse {
  /** 响应码：200成功，其他失败 */
  code: number
  /** 响应消息 */
  msg: string
  /** 响应数据 */
  data: {
    /** Token */
    token: string
    /** 用户信息 */
    user: User
  }
}

/**
 * 注册参数
 */
export interface RegisterParams {
  /** 用户名 */
  username: string
  /** 密码 */
  password: string
  /** 是否管理员(1-是,0-否) */
  isAdmin?: number
}

/**
 * 注册响应
 */
export interface RegisterResponse {
  /** 响应码：200成功，其他失败 */
  code: number
  /** 响应消息 */
  msg: string
  /** 响应数据 */
  data: {
    /** Token */
    token: string
    /** 用户信息 */
    user: User
  }
}

/**
 * 认证状态
 */
export interface AuthState {
  /** Token */
  token: string | null
  /** 用户信息 */
  user: User | null
  /** 是否已认证 */
  isAuthenticated: boolean
}
