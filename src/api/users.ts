import type { User } from '@/types/user'

export interface CreateUserParams {
  username: string
  password: string
  role: 'admin' | 'user'
}

export interface UpdateUserParams {
  username?: string
  password?: string
  role?: 'admin' | 'user'
}

const MOCK_USERS: User[] = [
  { id: 1, username: 'admin', role: 'admin', createdAt: '2024-01-01' },
  { id: 2, username: 'user', role: 'user', createdAt: '2024-01-02' },
  { id: 3, username: 'test', role: 'user', createdAt: '2024-01-03' },
]

const USE_MOCK = true

export async function getUsers(): Promise<User[]> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return [...MOCK_USERS]
  }
  const response = await fetch('/api/users')
  if (!response.ok) throw new Error('Failed to fetch users')
  return response.json()
}

export async function getUser(id: number): Promise<User> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const user = MOCK_USERS.find((u) => u.id === id)
    if (!user) throw new Error('用户不存在')
    return user
  }
  const response = await fetch(`/api/users/${id}`)
  if (!response.ok) throw new Error('Failed to fetch user')
  return response.json()
}

export async function createUser(params: CreateUserParams): Promise<User> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    if (MOCK_USERS.find((u) => u.username === params.username)) {
      throw new Error('用户名已存在')
    }
    const newUser: User = {
      id: Math.max(...MOCK_USERS.map((u) => u.id)) + 1,
      username: params.username,
      role: params.role,
      createdAt: new Date().toISOString().split('T')[0],
    }
    MOCK_USERS.push(newUser)
    return newUser
  }
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!response.ok) throw new Error('Failed to create user')
  return response.json()
}

export async function updateUser(id: number, params: UpdateUserParams): Promise<User> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const user = MOCK_USERS.find((u) => u.id === id)
    if (!user) throw new Error('用户不存在')
    if (params.username && params.username !== user.username) {
      if (MOCK_USERS.find((u) => u.username === params.username)) {
        throw new Error('用户名已存在')
      }
    }
    Object.assign(user, {
      ...(params.username && { username: params.username }),
      ...(params.role && { role: params.role }),
    })
    return user
  }
  const response = await fetch(`/api/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!response.ok) throw new Error('Failed to update user')
  return response.json()
}

export async function deleteUser(id: number): Promise<void> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const index = MOCK_USERS.findIndex((u) => u.id === id)
    if (index === -1) throw new Error('用户不存在')
    MOCK_USERS.splice(index, 1)
    return
  }
  const response = await fetch(`/api/users/${id}`, { method: 'DELETE' })
  if (!response.ok) throw new Error('Failed to delete user')
}
