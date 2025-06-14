<template>
  <div class="processed-orders">
    <h1 class="text-2xl font-bold mb-4">Processed Orders</h1>
    
    <div class="mb-6 flex justify-between items-center">
      <div class="flex gap-4">
        <select v-model="filterStatus" class="px-3 py-2 border rounded-md">
          <option value="">All Statuses</option>
          <option value="COMPLETED">Completed</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="REJECTED">Rejected</option>
        </select>
        
        <select v-model="sortOption" class="px-3 py-2 border rounded-md">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="costHigh">Highest Cost</option>
          <option value="costLow">Lowest Cost</option>
        </select>
      </div>
      
      <div class="relative">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search orders..." 
          class="pl-10 pr-4 py-2 border rounded-md w-64"
        >
        <span class="absolute left-3 top-2.5 text-gray-400">
          <i class="fa-solid fa-search"></i>
        </span>
      </div>
    </div>
    
    <div v-if="loading" class="text-center py-10">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p class="mt-4">Loading processed orders...</p>
    </div>
    
    <div v-else-if="!filteredOrders.length" class="text-center py-10">
      <div class="text-gray-500">
        <i class="fa-solid fa-clipboard-list text-5xl mb-4"></i>
        <p>No processed orders found.</p>
      </div>
    </div>
    
    <div v-else>
      <!-- Summary statistics -->
      <div class="bg-white rounded-lg shadow-md p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="text-center">
            <p class="text-gray-600 text-sm">Total Orders</p>
            <p class="text-2xl font-bold">{{ filteredOrders.length }}</p>
          </div>
          <div class="text-center">
            <p class="text-gray-600 text-sm">Completed</p>
            <p class="text-2xl font-bold text-green-600">
              {{ filteredOrders.filter(o => o.status === 'COMPLETED').length }}
            </p>
          </div>
          <div class="text-center">
            <p class="text-gray-600 text-sm">In Progress</p>
            <p class="text-2xl font-bold text-blue-600">
              {{ filteredOrders.filter(o => o.status === 'IN_PROGRESS').length }}
            </p>
          </div>
          <div class="text-center">
            <p class="text-gray-600 text-sm">Total Revenue</p>
            <p class="text-2xl font-bold text-purple-600">
              ${{ calculateTotalRevenue().toFixed(2) }}
            </p>
          </div>
        </div>
      </div>
      
      <!-- Orders table -->
      <div class="bg-white rounded-lg shadow-md overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Labor Cost</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material Cost</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="order in filteredOrders" :key="order.orderId">
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-medium">#{{ order.orderId }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm">{{ order.licensePlate }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="statusClass(order.status)">
                  {{ formatStatus(order.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(order.createTime) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ order.completeTime ? formatDate(order.completeTime) : 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                ${{ order.laborCost?.toFixed(2) || '0.00' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                ${{ order.materialCost?.toFixed(2) || '0.00' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                ${{ order.totalCost?.toFixed(2) || '0.00' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button 
                  @click="showOrderDetails(order)"
                  class="text-blue-600 hover:text-blue-900 mr-3"
                >
                  Details
                </button>
                <button 
                  v-if="order.status === 'IN_PROGRESS'"
                  @click="openUpdateModal(order)"
                  class="text-green-600 hover:text-green-900"
                >
                  Update
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Order Details Modal -->
    <div v-if="showDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-xl font-bold">Order #{{ selectedOrder?.orderId }} Details</h3>
          <button @click="closeDetailsModal" class="text-gray-500 hover:text-gray-700">
            <i class="fa-solid fa-times"></i>
          </button>
        </div>
        
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h4 class="text-sm font-medium text-gray-500">Status</h4>
            <p class="text-sm font-medium py-1 px-3 rounded-full inline-block mt-1"
               :class="statusClass(selectedOrder?.status || '')">
              {{ formatStatus(selectedOrder?.status || '') }}
            </p>
          </div>
          <div>
            <h4 class="text-sm font-medium text-gray-500">Vehicle</h4>
            <p>{{ selectedOrder?.licensePlate }}</p>
          </div>
          <div>
            <h4 class="text-sm font-medium text-gray-500">Created</h4>
            <p>{{ selectedOrder?.createTime ? formatDate(selectedOrder.createTime) : 'N/A' }}</p>
          </div>
          <div>
            <h4 class="text-sm font-medium text-gray-500">Completed</h4>
            <p>{{ selectedOrder?.completeTime ? formatDate(selectedOrder.completeTime) : 'N/A' }}</p>
          </div>
        </div>
        
        <div class="mb-4">
          <h4 class="text-sm font-medium text-gray-500">Description</h4>
          <p class="mt-1">{{ selectedOrder?.issue }}</p>
        </div>
        
        <div class="mb-4">
          <h4 class="text-sm font-medium text-gray-500">Labor Cost</h4>
          <p class="mt-1">${{ selectedOrder?.laborCost?.toFixed(2) || '0.00' }}</p>
        </div>
        
        <div class="mb-4">
          <h4 class="text-sm font-medium text-gray-500">Material Cost</h4>
          <p class="mt-1">${{ selectedOrder?.materialCost?.toFixed(2) || '0.00' }}</p>
        </div>
        
        <div class="mb-4">
          <h4 class="text-sm font-medium text-gray-500">Total Cost</h4>
          <p class="font-bold mt-1">${{ selectedOrder?.totalCost?.toFixed(2) || '0.00' }}</p>
        </div>
        
        <div class="flex justify-end mt-6">
          <button 
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
            @click="closeDetailsModal"
          >
            Close
          </button>
        </div>
      </div>
    </div>
    
    <!-- Update Order Modal (Same as in AssignedOrders.vue) -->
    <div v-if="showUpdateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-bold mb-4">Update Order #{{ selectedOrder?.orderId }}</h3>
        
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Status</label>
          <select v-model="updateForm.status" class="w-full p-2 border rounded">
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Description</label>
          <textarea v-model="updateForm.issue" rows="3" class="w-full p-2 border rounded"></textarea>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Repair Result</label>
          <textarea v-model="updateForm.repairResult" rows="3" class="w-full p-2 border rounded"></textarea>
        </div>
        
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium mb-1">Labor Hours</label>
            <input type="number" v-model="updateForm.laborHours" class="w-full p-2 border rounded" step="0.5" min="0" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Labor Cost</label>
            <input type="number" v-model="updateForm.laborCost" class="w-full p-2 border rounded" step="0.01" min="0" />
          </div>
        </div>
        
        <div class="flex justify-end gap-3 mt-6">
          <button 
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
            @click="closeUpdateModal"
          >
            Cancel
          </button>
          <button 
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            @click="submitUpdate"
            :disabled="updateLoading"
          >
            {{ updateLoading ? 'Updating...' : 'Update Order' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useWorkerStore } from '@/stores/worker'
import { useToast } from 'vue-toastification'
import type { RepairOrder } from '@/types'

const workerStore = useWorkerStore()
const toast = useToast()

const loading = computed(() => workerStore.loading)
const processedOrders = computed(() => workerStore.processedOrders)

const searchQuery = ref('')
const filterStatus = ref('')
const sortOption = ref('newest')

const showDetailsModal = ref(false)
const showUpdateModal = ref(false)
const selectedOrder = ref<RepairOrder | null>(null)
const updateLoading = ref(false)

const updateForm = ref({
  orderId: 0,
  status: '',
  issue: '',
  repairResult: '',
  laborCost: 0,
  laborHours: 0
})

const filteredOrders = computed(() => {
  let result = [...processedOrders.value]
  
  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(order => 
      order.orderId.toString().includes(query) ||
      order.issue?.toLowerCase().includes(query) ||
      order.licensePlate?.toLowerCase().includes(query)
    )
  }
  
  // Apply status filter
  if (filterStatus.value) {
    result = result.filter(order => order.status === filterStatus.value)
  }
  
  // Apply sorting
  switch (sortOption.value) {
    case 'newest':
      result.sort((a, b) => new Date(b.createTime || 0).getTime() - new Date(a.createTime || 0).getTime())
      break
    case 'oldest':
      result.sort((a, b) => new Date(a.createTime || 0).getTime() - new Date(b.createTime || 0).getTime())
      break
    case 'costHigh':
      result.sort((a, b) => (b.totalCost || 0) - (a.totalCost || 0))
      break
    case 'costLow':
      result.sort((a, b) => (a.totalCost || 0) - (b.totalCost || 0))
      break
  }
  
  return result
})

onMounted(async () => {
  try {
    await workerStore.fetchProcessedOrders()
  } catch (error) {
    toast.error('Failed to load processed orders')
  }
})

function formatDate(dateString: string) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString()
}

function formatStatus(status: string) {
  if (!status) return 'Unknown'
  
  const statusMap: Record<string, string> = {
    'SUBMITTED': 'Submitted',
    'ASSIGNED': 'Assigned',
    'ACCEPTED': 'Accepted',
    'IN_PROGRESS': 'In Progress',
    'COMPLETED': 'Completed',
    'REJECTED': 'Rejected'
  }
  
  return statusMap[status] || status
}

function statusClass(status: string) {
  if (!status) return 'bg-gray-100 text-gray-800'
  
  const statusClassMap: Record<string, string> = {
    'SUBMITTED': 'bg-blue-100 text-blue-800',
    'ASSIGNED': 'bg-yellow-100 text-yellow-800',
    'ACCEPTED': 'bg-green-100 text-green-800',
    'IN_PROGRESS': 'bg-purple-100 text-purple-800',
    'COMPLETED': 'bg-green-100 text-green-800',
    'REJECTED': 'bg-red-100 text-red-800'
  }
  
  return statusClassMap[status] || 'bg-gray-100 text-gray-800'
}

function calculateTotalRevenue() {
  return filteredOrders.value.reduce((sum, order) => sum + (order.totalCost || 0), 0)
}

function showOrderDetails(order: RepairOrder) {
  selectedOrder.value = order
  showDetailsModal.value = true
}

function closeDetailsModal() {
  showDetailsModal.value = false
  selectedOrder.value = null
}

function openUpdateModal(order: RepairOrder) {
  selectedOrder.value = order
  updateForm.value = {
    orderId: order.orderId,
    status: order.status || 'IN_PROGRESS',
    issue: order.issue || '',
    repairResult: '',
    laborCost: order.laborCost || 0,
    laborHours: 0
  }
  showUpdateModal.value = true
}

function closeUpdateModal() {
  showUpdateModal.value = false
  selectedOrder.value = null
}

async function submitUpdate() {
  if (!selectedOrder.value) return
  
  updateLoading.value = true
  try {
    await workerStore.updateOrder(updateForm.value)
    closeUpdateModal()
    toast.success('Order updated successfully')
    await workerStore.fetchProcessedOrders()
  } catch (error) {
    toast.error('Failed to update order')
  } finally {
    updateLoading.value = false
  }
}
</script>

<style scoped>
.processed-orders {
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

.mb-6 {
  margin-bottom: 1.5rem;
}

.flex {
  display: flex;
}

.justify-between {
  justify-content: space-between;
}

.items-center {
  align-items: center;
}

.gap-4 {
  gap: 1rem;
}

.px-3 {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.border {
  border-width: 1px;
  border-style: solid;
  border-color: #e5e7eb;
}

.rounded-md {
  border-radius: 0.375rem;
}

.relative {
  position: relative;
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

.overflow-x-auto {
  overflow-x: auto;
}

.grid {
  display: grid;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.grid-cols-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.gap-4 {
  gap: 1rem;
}

.gap-6 {
  gap: 1.5rem;
}

.text-center {
  text-align: center;
}

.text-gray-600 {
  color: #4b5563;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}

.font-bold {
  font-weight: 700;
}

.text-green-600 {
  color: #059669;
}

.text-blue-600 {
  color: #2563eb;
}

.text-purple-600 {
  color: #7c3aed;
}

.py-10 {
  padding-top: 2.5rem;
  padding-bottom: 2.5rem;
}

@media (min-width: 768px) {
  .md\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>