import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Auth/Auth.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Auth/Auth.vue'),
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
        component: () => import('@/views/Dashboard/Dashboard.vue'),
        meta: { title: '数据总览', requiresAuth: true },
      },
      {
        path: 'monitor',
        name: 'Monitor',
        component: () => import('@/views/Monitor/Monitor.vue'),
        meta: { title: '实时监控', requiresAuth: true },
      },
      {
        path: 'gallery',
        component: () => import('@/views/Gallery/GalleryLayout.vue'),
        redirect: '/gallery/vehicle-log',
        children: [
          {
            path: 'vehicle-log',
            name: 'VehicleLog',
            component: () => import('@/views/Gallery/VehicleLog.vue'),
            meta: { title: '车辆归档日志', requiresAuth: true },
          },
        ],
      },
      {
        path: 'features',
        component: () => import('@/views/Features/FeaturesLayout.vue'),
        redirect: '/features/search-by-image',
        children: [
          {
            path: 'search-by-image',
            name: 'SearchByImage',
            component: () => import('@/views/Features/SearchByImage.vue'),
            meta: { title: '根据图像查询车辆信息', requiresAuth: true },
          },
        ],
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/Users/Users.vue'),
        meta: { title: '用户管理', requiresAuth: true },
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/Settings/Settings.vue'),
        meta: { title: '系统设置', requiresAuth: true },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to, _from) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  } else if (
    (to.name === 'Login' || to.name === 'Register') &&
    authStore.isAuthenticated
  ) {
    return { path: '/dashboard' }
  } else {
    return true
  }
})

export default router
