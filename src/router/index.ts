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
        // {
        //   path: 'assigned-orders',
        //   name: 'WorkerAssignedOrders',
        //   component: () => import('@/views/worker/AssignedOrders.vue'),
        // },
        // {
        //   path: 'processed-orders',
        //   name: 'WorkerProcessedOrders',
        //   component: () => import('@/views/worker/ProcessedOrders.vue'),
        // },
        // {
        //   path: 'earnings',
        //   name: 'WorkerEarnings',
        //   component: () => import('@/views/worker/Earnings.vue'),
        // },
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
        {
          path: 'users',
          name: 'AdminUsers',
          component: () => import('@/views/admin/Users.vue'),
        },
        {
          path: 'workers',
          name: 'AdminWorkers',
          component: () => import('@/views/admin/Workers.vue'),
        },
        {
          path: 'repair-orders',
          name: 'AdminRepairOrders',
          component: () => import('@/views/admin/RepairOrders.vue'),
        },
        // {
        //   path: 'statistics',
        //   name: 'AdminStatistics',
        //   component: () => import('@/views/admin/Statistics.vue'),
        // },
        // {
        //   path: 'settlements',
        //   name: 'AdminSettlements',
        //   component: () => import('@/views/admin/Settlements.vue'),
        // },
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
