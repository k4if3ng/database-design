<template>
  <div class="assigned-orders">
    <h1 class="text-2xl font-bold mb-4">分配的工单</h1>
    
    <div v-if="loading" class="text-center py-10">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p class="mt-4">Loading assigned orders...</p>
    </div>
    
    <div v-else-if="!assignedOrders.length" class="text-center py-10">
      <div class="text-gray-500">
        <i class="fa-solid fa-clipboard-check text-5xl mb-4"></i>
        <p>No orders assigned to you at the moment.</p>
      </div>
    </div>
    
    <div v-else class="grid gap-6">
      <div v-for="order in assignedOrders" :key="order.orderId" 
          class="bg-white rounded-lg shadow-md p-4 border-l-4" 
          :class="orderStatusClass(order)">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-lg font-semibold">Order #{{ order.orderId }}</h3>
            <p class="text-sm text-gray-600">
              Vehicle: {{ order.licensePlate }} | Created: {{ formatDate(order.createTime) }}
            </p>
          </div>
          <div class="text-sm font-medium py-1 px-3 rounded-full" 
              :class="statusClass(order.status)">
            {{ formatStatus(order.status) }}
          </div>
        </div>
        
        <div class="mb-4">
          <h4 class="text-sm font-medium text-gray-700 mb-1">Issue Description</h4>
          <p class="text-sm">{{ order.issue }}</p>
        </div>
        
        <div class="mt-6 flex gap-3 justify-end">
          <button 
            v-if="order.status === 'ASSIGNED'"
            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            @click="handleAccept(order)"
            :disabled="loading"
          >
            Accept
          </button>
          <button 
            v-if="order.status === 'ASSIGNED' && !order.cannotReject"
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
            @click="handleReject(order)"
            :disabled="loading"
          >
            Reject
          </button>
          <button 
            v-if="order.status === 'ACCEPTED' || order.status === 'IN_PROGRESS'"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            @click="openUpdateModal(order)"
          >
            Update Progress
          </button>
        </div>
      </div>
    </div>
    
    <!-- Update Order Modal -->
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
    
    <!-- Add Material Modal -->
    <div v-if="showMaterialModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-xl font-bold mb-4">Add Material</h3>
        
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Material Name</label>
          <input type="text" v-model="materialForm.name" class="w-full p-2 border rounded" />
        </div>
        
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium mb-1">Quantity</label>
            <input type="number" v-model="materialForm.quantity" class="w-full p-2 border rounded" min="1" step="1" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Price (per unit)</label>
            <input type="number" v-model="materialForm.price" class="w-full p-2 border rounded" step="0.01" min="0" />
          </div>
        </div>
        
        <div class="flex justify-end gap-3 mt-6">
          <button 
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
            @click="closeMaterialModal"
          >
            Cancel
          </button>
          <button 
            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            @click="submitMaterial"
            :disabled="materialLoading"
          >
            {{ materialLoading ? 'Adding...' : 'Add Material' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useWorkerStore } from '@/stores/worker'
import { workerService } from '@/services/worker'
import { useToast } from 'vue-toastification'
import type { RepairOrder } from '@/types'

const workerStore = useWorkerStore()
const toast = useToast()

const loading = computed(() => workerStore.loading)
const assignedOrders = computed(() => workerStore.assignedOrders)

const showUpdateModal = ref(false)
const showMaterialModal = ref(false)
const selectedOrder = ref<RepairOrder | null>(null)
const updateLoading = ref(false)
const materialLoading = ref(false)

const updateForm = ref({
  orderId: 0,
  status: 'IN_PROGRESS',
  issue: '',
  repairResult: '',
  laborCost: 0,
  laborHours: 0
})

const materialForm = ref({
  orderId: 0,
  name: '',
  quantity: 1,
  price: 0
})

onMounted(async () => {
  try {
    await workerStore.fetchAssignedOrders()
  } catch (error) {
    toast.error('Failed to load assigned orders')
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

function orderStatusClass(order: RepairOrder) {
  if (!order.status) return 'border-gray-300'
  
  const statusColorMap: Record<string, string> = {
    'SUBMITTED': 'border-blue-500',
    'ASSIGNED': 'border-yellow-500',
    'ACCEPTED': 'border-green-500',
    'IN_PROGRESS': 'border-purple-500',
    'COMPLETED': 'border-green-500',
    'REJECTED': 'border-red-500'
  }
  
  return statusColorMap[order.status] || 'border-gray-300'
}

async function handleAccept(order: RepairOrder) {
  try {
    await workerStore.acceptOrder(order.orderId)
    toast.success('Order accepted successfully')
  } catch (error) {
    toast.error('Failed to accept order')
  }
}

async function handleReject(order: RepairOrder) {
  try {
    await workerStore.rejectOrder(order.orderId)
    toast.success('Order rejected successfully')
  } catch (error) {
    toast.error('Failed to reject order')
  }
}

function openUpdateModal(order: RepairOrder) {
  selectedOrder.value = order
  updateForm.value = {
    orderId: order.orderId,
    status: order.status === 'ACCEPTED' ? 'IN_PROGRESS' : order.status,
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
  } catch (error) {
    toast.error('Failed to update order')
  } finally {
    updateLoading.value = false
  }
}

function openMaterialModal() {
  if (!selectedOrder.value) return
  
  materialForm.value = {
    orderId: selectedOrder.value.orderId,
    name: '',
    quantity: 1,
    price: 0
  }
  showMaterialModal.value = true
}

function closeMaterialModal() {
  showMaterialModal.value = false
}

async function submitMaterial() {
  materialLoading.value = true
  try {
    await workerService.addMaterial(materialForm.value)
    closeMaterialModal()
    toast.success('Material added successfully')
    // Refresh orders to show updated cost
    await workerStore.fetchAssignedOrders()
  } catch (error) {
    toast.error('Failed to add material')
  } finally {
    materialLoading.value = false
  }
}
</script>

<style scoped>
.assigned-orders {
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

.bg-white {
  background-color: white;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.py-10 {
  padding-top: 2.5rem;
  padding-bottom: 2.5rem;
}

.grid {
  display: grid;
}

.gap-6 {
  gap: 1.5rem;
}

.p-4 {
  padding: 1rem;
}

.border-l-4 {
  border-left-width: 4px;
  border-left-style: solid;
}

.text-center {
  text-align: center;
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
</style>