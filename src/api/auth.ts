import type { LoginParams, LoginResponse, RegisterParams, RegisterResponse, User } from '@/types/user'

const MOCK_USERS: User[] = [
  { id: 1, username: 'admin', role: 'admin', createdAt: '2024-01-01' },
  { id: 2, username: 'user', role: 'user', createdAt: '2024-01-02' },
]

const MOCK_PASSWORDS: Record<string, string> = {
  admin: 'admin123',
  user: 'user123',
}

const USE_MOCK = true

function generateToken(user: User): string {
  return `mock-token-${user.id}-${Date.now()}`
}

export async function login(params: LoginParams): Promise<LoginResponse> {
  if (USE_MOCK) {
    return mockLogin(params)
  }
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!response.ok) throw new Error('Login failed')
  return response.json()
}

async function mockLogin(params: LoginParams): Promise<LoginResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const user = MOCK_USERS.find((u) => u.username === params.username)
  if (!user) {
    throw new Error('用户不存在')
  }

  if (MOCK_PASSWORDS[params.username] !== params.password) {
    throw new Error('密码错误')
  }

  return {
    token: generateToken(user),
    user,
  }
}

export async function logout(): Promise<void> {
  if (USE_MOCK) return
  await fetch('/api/auth/logout', { method: 'POST' })
}

export async function register(params: RegisterParams): Promise<RegisterResponse> {
  if (USE_MOCK) {
    return mockRegister(params)
  }
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!response.ok) throw new Error('Registration failed')
  return response.json()
}

async function mockRegister(params: RegisterParams): Promise<RegisterResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  if (MOCK_USERS.find((u) => u.username === params.username)) {
    throw new Error('用户名已存在')
  }

  const newUser: User = {
    id: MOCK_USERS.length + 1,
    username: params.username,
    role: 'user',
    createdAt: new Date().toISOString().split('T')[0],
  }
  MOCK_USERS.push(newUser)
  MOCK_PASSWORDS[params.username] = params.password

  return {
    token: generateToken(newUser),
    user: newUser,
  }
}

export async function getCurrentUser(): Promise<User | null> {
  if (USE_MOCK) {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  }
  const response = await fetch('/api/auth/me')
  if (!response.ok) return null
  return response.json()
}