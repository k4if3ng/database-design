<template>
  <div class="pending-orders">
    <h1 class="text-2xl font-bold mb-4">Pending Orders Statistics</h1>
    
    <div v-if="loading" class="text-center py-10">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p class="mt-4">Loading statistics...</p>
    </div>
    
    <div v-else-if="!pendingStats" class="text-center py-10">
      <div class="text-gray-500">
        <i class="fa-solid fa-chart-pie text-5xl mb-4"></i>
        <p>No pending orders statistics available.</p>
      </div>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- Summary Cards -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold mb-2">Total Pending Orders</h3>
        <p class="text-3xl font-bold text-blue-600">{{ pendingStats.totalPendingOrders }}</p>
      </div>
      
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold mb-2">Average Pending Days</h3>
        <p class="text-3xl font-bold text-orange-600">{{ pendingStats.averagePendingDays?.toFixed(1) || 0 }} days</p>
      </div>
      
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold mb-2">Oldest Pending Order</h3>
        <p class="text-3xl font-bold text-red-600">{{ pendingStats.oldestPendingOrder?.pendingDays || 0 }} days</p>
        <p class="text-sm text-gray-600 mt-2" v-if="pendingStats.oldestPendingOrder">
          Order #{{ pendingStats.oldestPendingOrder.orderId }} - {{ pendingStats.oldestPendingOrder.issue }}
        </p>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <!-- Status Distribution -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold mb-4">Orders by Status</h3>
        <div v-for="status in pendingStats.byStatus" :key="status.status" class="mb-2">
          <div class="flex justify-between mb-1">
            <span>{{ status.status }}</span>
            <span>{{ status.count }} ({{ status.percentage.toFixed(1) }}%)</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2.5">
            <div class="h-2.5 rounded-full" 
                :style="{ width: `${status.percentage}%` }"
                :class="getStatusColor(status.status)"></div>
          </div>
        </div>
      </div>
      
      <!-- Oldest Pending Order -->
      <div v-if="pendingStats.oldestPendingOrder" class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold mb-4">Oldest Pending Order Details</h3>
        <div class="border-l-4 border-red-500 pl-4 py-2">
          <p class="font-medium">Order #{{ pendingStats.oldestPendingOrder.orderId }}</p>
          <p class="text-gray-600 text-sm">Created: {{ formatDate(pendingStats.oldestPendingOrder.createTime) }}</p>
          <p class="text-gray-600 text-sm">Status: {{ pendingStats.oldestPendingOrder.status }}</p>
          <p class="mt-2">{{ pendingStats.oldestPendingOrder.issue }}</p>
          <p class="text-red-600 mt-2">
            Pending for {{ pendingStats.oldestPendingOrder.pendingDays }} days
          </p>
        </div>
      </div>
    </div>
    
    <!-- Action needed alert -->
    <div v-if="pendingStats.totalPendingOrders > 5" class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
      <div class="flex">
        <div class="flex-shrink-0">
          <i class="fa-solid fa-triangle-exclamation text-yellow-400"></i>
        </div>
        <div class="ml-3">
          <p class="text-yellow-700">
            You have {{ pendingStats.totalPendingOrders }} pending orders. Consider prioritizing orders that have been waiting the longest.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useWorkerStore } from '@/stores/worker'
import { useToast } from 'vue-toastification'

const workerStore = useWorkerStore()
const toast = useToast()

const loading = ref(true)
const pendingStats = computed(() => workerStore.pendingStats)

onMounted(async () => {
  try {
    loading.value = true
    await workerStore.fetchPendingStats()
  } catch (error) {
    toast.error('Failed to load pending statistics')
  } finally {
    loading.value = false
  }
})

function formatDate(dateString: string) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

function getStatusColor(status: string) {
  const statusMap: Record<string, string> = {
    '已分配': 'bg-yellow-500',
    '已接受': 'bg-blue-500',
    '维修中': 'bg-purple-500',
    'ASSIGNED': 'bg-yellow-500',
    'ACCEPTED': 'bg-blue-500',
    'IN_PROGRESS': 'bg-purple-500'
  }
  
  return statusMap[status] || 'bg-gray-500'
}
</script>

<style scoped>
.pending-orders {
  min-height: 100vh;
  width: 80vw;
  padding: 1.5rem;
  background: linear-gradient(to bottom right, #f5f7fa, #c3cfe2);
  box-sizing: border-box;
}

.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}

.font-bold {
  font-weight: 700;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mb-8 {
  margin-bottom: 2rem;
}

.grid {
  display: grid;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.gap-6 {
  gap: 1.5rem;
}

.bg-white {
  background-color: white;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.p-6 {
  padding: 1.5rem;
}

.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.font-semibold {
  font-weight: 600;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}

.text-blue-600 {
  color: #2563eb;
}

.text-orange-600 {
  color: #ea580c;
}

.text-red-600 {
  color: #dc2626;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-gray-600 {
  color: #4b5563;
}

.mt-2 {
  margin-top: 0.5rem;
}

.flex {
  display: flex;
}

.justify-between {
  justify-content: space-between;
}

.mb-1 {
  margin-bottom: 0.25rem;
}

.w-full {
  width: 100%;
}

.bg-gray-200 {
  background-color: #e5e7eb;
}

.rounded-full {
  border-radius: 9999px;
}

.h-2\.5 {
  height: 0.625rem;
}

.border-l-4 {
  border-left-width: 4px;
  border-left-style: solid;
}

.border-red-500 {
  border-color: #ef4444;
}

.pl-4 {
  padding-left: 1rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.font-medium {
  font-weight: 500;
}

.text-center {
  text-align: center;
}

.py-10 {
  padding-top: 2.5rem;
  padding-bottom: 2.5rem;
}

.text-gray-500 {
  color: #6b7280;
}

.text-5xl {
  font-size: 3rem;
  line-height: 1;
}

.mb-4 {
  margin-bottom: 1rem;
}

.bg-yellow-50 {
  background-color: #fffbeb;
}

.border-yellow-400 {
  border-color: #fbbf24;
}

.p-4 {
  padding: 1rem;
}

.flex-shrink-0 {
  flex-shrink: 0;
}

.text-yellow-400 {
  color: #fbbf24;
}

.ml-3 {
  margin-left: 0.75rem;
}

.text-yellow-700 {
  color: #b45309;
}

@media (min-width: 768px) {
  .md\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  
  .md\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>