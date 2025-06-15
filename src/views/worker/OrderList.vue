<template>
  <div class="orders-list">
    <h1>维修工单列表</h1>
    
    <div class="filters">
      <select v-model="statusFilter" class="filter-dropdown">
        <option value="">全部状态</option>
        <option value="ASSIGNED">已分配</option>
        <option value="PENDING_ASSIGNMENT">待分配</option>
        <option value="ACCEPTED">已接受</option>
        <option value="IN_PROGRESS">维修中</option>
        <option value="COMPLETED">已完成</option>
        <option value="REJECTED">已拒绝</option>
      </select>
      
      <div class="search-box">
        <input type="text" v-model="searchQuery" placeholder="搜索车牌号或问题..." />
      </div>
    </div>

    <div v-if="loading" class="loading">
      <p>加载中...</p>
    </div>
    
    <div v-else>
      <div v-if="filteredOrders.length === 0" class="no-orders">
        <p>没有符合条件的工单</p>
      </div>
      
      <div v-else class="orders-grid">
        <div v-for="order in filteredOrders" :key="order.orderId" class="order-card">
          <div class="order-header">
            <h3>工单 #{{ order.orderId }}</h3>
            <span :class="`status ${order.status.toLowerCase()}`">
              {{ getStatusText(order.status) }}
            </span>
          </div>
          
          <div class="order-body">
            <p><strong>车牌号:</strong> {{ order.licensePlate }}</p>
            <p><strong>问题:</strong> {{ order.issue }}</p>
            <p><strong>分配时间:</strong> {{ formatDate(order.assignTime || order.createTime) }}</p>
          </div>
          
          <div class="order-footer">
            <router-link :to="`/worker/orders/${order.orderId}`" class="view-btn">
              查看详情
            </router-link>
            
            <div class="action-buttons" v-if="order.status === 'ASSIGNED'">
              <button @click="handleAccept(order.orderId)" class="accept-btn">接受</button>
              <button @click="openRejectDialog(order.orderId)" class="reject-btn">拒绝</button>
            </div>
          
            <div class="action-buttons" v-if="order.status === 'ACCEPTED'">
              <button @click="handleStartRepair(order.orderId)" class="start-btn">开始维修</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 拒绝工单对话框 -->
    <div v-if="showRejectDialog" class="modal-overlay">
      <div class="modal">
        <h3>拒绝工单</h3>
        <p>请输入拒绝原因:</p>
        <textarea v-model="rejectReason" rows="4" placeholder="拒绝原因..."></textarea>
        <div class="modal-buttons">
          <button @click="showRejectDialog = false" class="cancel-btn">取消</button>
          <button @click="handleReject" class="confirm-btn">确认拒绝</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkerStore } from '@/stores/worker'
import type { RepairOrder } from '@/types'

const router = useRouter()
const workerStore = useWorkerStore()

const loading = computed(() => workerStore.loading)
const statusFilter = ref('')
const searchQuery = ref('')
const showRejectDialog = ref(false)
const rejectReason = ref('')
const currentOrderId = ref<number | null>(null)

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    ASSIGNED: '已分配',
    ACCEPTED: '已接受',
    IN_PROGRESS: '维修中',
    PENDING_ASSIGNMENT: '待分配',
    COMPLETED: '已完成',
    REJECTED: '已拒绝',
  }
  return statusMap[status] || status
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const filteredOrders = computed(() => {
  let filtered = workerStore.assignedOrders

  // 过滤状态
  if (statusFilter.value) {
    filtered = filtered.filter((order: RepairOrder) => order.status === statusFilter.value)
  }

  // 搜索
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter((order: RepairOrder) => 
      order.licensePlate.toLowerCase().includes(query) ||
      order.issue.toLowerCase().includes(query)
    )
  }


  return filtered
})

const handleAccept = async (orderId: number) => {
  try {
    await workerStore.acceptOrder(orderId)
    alert('工单已成功接受')
  } catch (error) {
    console.error('接受工单失败:', error)
    alert('接受工单失败，请重试')
  }
}

const openRejectDialog = (orderId: number) => {
  currentOrderId.value = orderId
  rejectReason.value = ''
  showRejectDialog.value = true
}

const handleReject = async () => {
  if (!rejectReason.value.trim()) {
    alert('请输入拒绝原因')
    return
  }

  if (currentOrderId.value) {
    try {
      await workerStore.rejectOrder(currentOrderId.value, rejectReason.value)
      showRejectDialog.value = false
      alert('工单已成功拒绝')
    } catch (error) {
      console.error('拒绝工单失败:', error)
      alert('拒绝工单失败，请重试')
    }
  }
}

const handleStartRepair = async (orderId: number) => {
  try {
    await workerStore.startOrder(orderId)
    alert('已开始维修')
  } catch (error) {
    console.error('开始维修失败:', error)
    alert('开始维修失败，请重试')
  }
}

onMounted(async () => {
  try {
    await workerStore.fetchAssignedOrders()
  } catch (error) {
    console.error('获取工单失败:', error)
  }
})
</script>

<style scoped>
.orders-list {
  padding: 1.5rem;
  background: linear-gradient(to bottom right, #f5f7fa, #c3cfe2);
  min-height: 100vh;
  min-width: 80vw;
}

.filters {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.filter-dropdown {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  width: 150px;
}

.search-box input {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  width: 250px;
}

.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.order-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.order-header h3 {
  margin: 0;
}

.order-body {
  padding: 1rem;
}

.order-body p {
  margin: 0.5rem 0;
}

.order-footer {
  padding: 1rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.view-btn {
  text-decoration: none;
  color: #667eea;
  font-weight: bold;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.accept-btn, .reject-btn, .confirm-btn, .cancel-btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: bold;
}

.accept-btn {
  background: #e8f5e8;
  color: #388e3c;
}

.reject-btn, .cancel-btn {
  background: #ffebee;
  color: #d32f2f;
}

.confirm-btn {
  background: #2e7d32;
  color: white;
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
}

.status.assigned {
  background: #fff3e0;
  color: #f57c00;
}
.status.accepted {
  background: #e8f5e8;
  color: #388e3c;
}
.status.in_progress {
  background: #fff9c4;
  color: #f9a825;
}
.status.completed {
  background: #e8f5e8;
  color: #2e7d32;
}
.status.rejected {
  background: #ffebee;
  color: #d32f2f;
}

.loading, .no-orders {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  width: 400px;
  max-width: 90%;
}

.modal textarea {
  width: 100%;
  margin: 1rem 0;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>