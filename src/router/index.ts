import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login/Login.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: () => import('@/components/layout/Layout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Home/Home.vue'),
        meta: { title: '实时监控', requiresAuth: true },
      },
      {
        path: 'cameras',
        name: 'Cameras',
        component: () => import('@/views/Home/Home.vue'),
        meta: { title: '摄像头管理', requiresAuth: true },
      },
      {
        path: 'analysis',
        name: 'Analysis',
        component: () => import('@/views/Home/Home.vue'),
        meta: { title: '数据分析', requiresAuth: true },
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/Home/Home.vue'),
        meta: { title: '用户管理', requiresAuth: true },
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/Home/Home.vue'),
        meta: { title: '系统设置', requiresAuth: true },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.name === 'Login' && authStore.isAuthenticated) {
    next({ path: '/dashboard' })
  } else {
    next()
  }
})

export default router