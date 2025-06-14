// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/Register.vue'),
    },
    {
      path: '/user',
      name: 'UserLayout',
      component: () => import('@/views/layouts/UserLayout.vue'),
      meta: { requiresAuth: true, role: 'USER' },
      children: [
        {
          path: 'dashboard',
          name: 'UserDashboard',
          component: () => import('@/views/user/Dashboard.vue'),
        },
        {
          path: 'vehicles',
          name: 'UserVehicles',
          component: () => import('@/views/user/Vehicles.vue'),
        },
        {
          path: 'repair-orders',
          name: 'UserRepairOrders',
          component: () => import('@/views/user/RepairOrders.vue'),
        },
        {
          path: 'repair-logs',
          name: 'UserRepairLogs',
          component: () => import('@/views/user/RepairLogs.vue'),
        },
      ],
    },
    {
      path: '/worker',
      name: 'WorkerLayout',
      component: () => import('@/views/layouts/WorkerLayout.vue'),
      meta: { requiresAuth: true, role: 'WORKER' },
      children: [
        {
          path: 'dashboard',
          name: 'WorkerDashboard',
          component: () => import('@/views/worker/Dashboard.vue'),
        },
        {
          path: 'orders',
          name: 'OrderList',
          component: () => import('@/views/worker/OrderList.vue'),
        },
        {
          path: 'orders/:id',
          name: 'WorkerOrderDetails',
          component: () => import('@/views/worker/OrderDetails.vue'),
        },
        {
          path: 'repair-logs',
          name: 'WorkerRepairLogs',
          component: () => import('@/views/worker/RepairLogs.vue'),
        },
        {
          path: 'WorkerPerformance',
          name: 'WorkerPerformance',
          component: () => import('@/views/worker/Performance.vue'),
        },
      ],
    },
    {
      path: '/admin',
      name: 'AdminLayout',
      component: () => import('@/views/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
      children: [
        {
          path: 'dashboard',
          name: 'AdminDashboard',
          component: () => import('@/views/admin/Dashboard.vue'),
        },

      ],
    },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }

  if (to.meta.role && authStore.userRole !== to.meta.role) {
    next('/login')
    return
  }

  next()
})

export default router
