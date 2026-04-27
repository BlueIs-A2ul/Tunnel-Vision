/**
 * 用户信息
 */
export interface User {
  /** 用户ID */
  id?: number
  /** 用户名 */
  username: string
  /** 用户角色 */
  role?: 'admin' | 'user'
  /** 创建时间 */
  createdAt?: string
}

/**
 * 登录参数
 */
export interface LoginParams {
  /** 用户名 */
  username: string
  /** 密码 */
  password: string
}

/**
 * 登录响应
 */
export interface LoginResponse {
  /** 响应码：1成功，其他失败 */
  code: number
  /** 响应消息 */
  msg: string
  /** 响应数据 */
  data: {
    /** Token */
    token: string
    /** 用户名 */
    username: string
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
}

/**
 * 注册响应
 */
export interface RegisterResponse {
  /** 响应码：1成功，其他失败 */
  code: number
  /** 响应消息 */
  msg: string
  /** 响应数据 */
  data?: {
    /** Token */
    token?: string
    /** 用户信息 */
    user?: User
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

/**
 * 登出响应
 */
export interface LogoutResponse {
  /** 响应码：1成功，0失败 */
  code: number
  /** 响应消息 */
  msg: string
  /** 响应数据 */
  data?: Record<string, unknown>
}
