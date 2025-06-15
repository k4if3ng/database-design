<template>
  <div class="repair-orders-page">
    <div class="page-header">
      <h1>维修工单管理</h1>
      <div class="header-actions">
        <button @click="showBatchSubmitModal = true" class="btn-primary">批量提交工单</button>
      </div>
    </div>

    <div class="stats-cards">
      <div class="stat-card">
        <h3>总工单</h3>
        <p class="stat-number">{{ repairOrders.length }}</p>
      </div>
      <div class="stat-card">
        <h3>待分配</h3>
        <p class="stat-number">{{ getOrdersByStatus('PENDING').length }}</p>
      </div>
      <div class="stat-card">
        <h3>进行中</h3>
        <p class="stat-number">{{ getOrdersByStatus('IN_PROGRESS').length }}</p>
      </div>
      <div class="stat-card">
        <h3>已完成</h3>
        <p class="stat-number">{{ getOrdersByStatus('COMPLETED').length }}</p>
      </div>
    </div>

    <div class="filters">
      <div class="filter-group">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索工单..."
          class="search-input"
        />
        <select v-model="statusFilter" class="filter-select">
          <option value="">所有状态</option>
          <option value="PENDING">待分配</option>
          <option value="ASSIGNED">已分配</option>
          <option value="IN_PROGRESS">进行中</option>
          <option value="COMPLETED">已完成</option>
        </select>
        <select v-model="priorityFilter" class="filter-select">
          <option value="">所有优先级</option>
          <option value="HIGH">高</option>
          <option value="MEDIUM">中</option>
          <option value="LOW">低</option>
        </select>
      </div>
    </div>

    <div class="orders-table">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <table v-else>
        <thead>
          <tr>
            <th>
              <input type="checkbox" @change="toggleSelectAll" :checked="isAllSelected">
            </th>
            <th>工单ID</th>
            <th>车牌号</th>
            <th>问题描述</th>
            <th>状态</th>
            <th>维修工</th>
            <th>优先级</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order.orderId">
            <td>
              <input 
                type="checkbox" 
                v-model="selectedOrders" 
                :value="order.orderId"
              >
            </td>
            <td>{{ order.orderId }}</td>
            <td>{{ order.licensePlate }}</td>
            <td>{{ order.issue }}</td>
            <td>
              <span :class="['status', order.status.toLowerCase()]">
                {{ getStatusText(order.status) }}
              </span>
            </td>
            <td>{{ order.workerName || '未分配' }}</td>
            <td>
              <span :class="['priority', order.priority?.toLowerCase()]">
                {{ getPriorityText(order.priority) }}
              </span>
            </td>
            <td>{{ formatDate(order.createTime) }}</td>
            <td>
              <div class="action-buttons">
                <button @click="viewOrderDetails(order)" class="btn-view">查看</button>
                <button 
                  v-if="order.status === 'PENDING'" 
                  @click="assignOrder(order)" 
                  class="btn-assign"
                >
                  分配
                </button>
                <button 
                  @click="rollbackOrder(order)" 
                  class="btn-rollback"
                  :disabled="order.status === 'COMPLETED'"
                >
                  回滚
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="selectedOrders.length > 0" class="batch-actions">
      <p>已选择 {{ selectedOrders.length }} 个工单</p>
      <button @click="batchDelete" class="btn-danger">批量删除</button>
    </div>

    <!-- 分配工单模态框 -->
    <div v-if="showAssignModal" class="modal-overlay" @click="closeAssignModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>分配工单</h3>
          <button @click="closeAssignModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitAssignment">
            <div class="form-group">
              <label>选择维修工:</label>
              <select v-model="assignForm.workerId" required>
                <option value="">请选择维修工</option>
                <option 
                  v-for="worker in availableWorkers" 
                  :key="worker.workerId" 
                  :value="worker.workerId"
                >
                  {{ worker.workerName }} ({{ worker.specialty }})
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>优先级:</label>
              <select v-model="assignForm.priority" required>
                <option value="LOW">低</option>
                <option value="MEDIUM">中</option>
                <option value="HIGH">高</option>
              </select>
            </div>
            <div class="form-group">
              <label>预估工时:</label>
              <input 
                type="number" 
                v-model="assignForm.estimatedHours" 
                min="1" 
                required
              >
            </div>
            <div class="form-group">
              <label>备注:</label>
              <textarea v-model="assignForm.notes" rows="3"></textarea>
            </div>
            <div class="form-actions">
              <button type="button" @click="closeAssignModal" class="btn-cancel">取消</button>
              <button type="submit" class="btn-primary">确认分配</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 批量提交工单模态框 -->
    <div v-if="showBatchSubmitModal" class="modal-overlay" @click="closeBatchSubmitModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>批量提交工单</h3>
          <button @click="closeBatchSubmitModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitBatchOrders">
            <div class="batch-orders">
              <div v-for="(order, index) in batchOrdersForm" :key="index" class="batch-order-item">
                <h4>工单 {{ index + 1 }}</h4>
                <div class="form-row">
                  <div class="form-group">
                    <label>车辆ID:</label>
                    <input type="number" v-model="order.vehicleId" required>
                  </div>
                  <div class="form-group">
                    <label>问题描述:</label>
                    <input type="text" v-model="order.issue" required>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>维修类型:</label>
                    <select v-model="order.repairType" required>
                      <option value="ENGINE">发动机</option>
                      <option value="BRAKE">刹车</option>
                      <option value="TRANSMISSION">变速箱</option>
                      <option value="ELECTRICAL">电气</option>
                      <option value="OTHER">其他</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>优先级:</label>
                    <select v-model="order.priority">
                      <option value="LOW">低</option>
                      <option value="MEDIUM">中</option>
                      <option value="HIGH">高</option>
                    </select>
                  </div>
                </div>
                <div class="form-group">
                  <label>附加信息:</label>
                  <textarea v-model="order.additionalInfo" rows="2"></textarea>
                </div>
                <button 
                  type="button" 
                  @click="removeBatchOrder(index)" 
                  class="btn-remove"
                  v-if="batchOrdersForm.length > 1"
                >
                  删除此工单
                </button>
              </div>
            </div>
            <button type="button" @click="addBatchOrder" class="btn-add">添加工单</button>
            <div class="form-actions">
              <button type="button" @click="closeBatchSubmitModal" class="btn-cancel">取消</button>
              <button type="submit" class="btn-primary">提交工单</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import type { RepairOrder, Worker } from '@/types'

const adminStore = useAdminStore()
const repairOrders = computed(() => adminStore.repairOrders)
const workers = computed(() => adminStore.workers)
const loading = computed(() => adminStore.loading)
const error = computed(() => adminStore.error)

const searchQuery = ref('')
const statusFilter = ref('')
const priorityFilter = ref('')
const selectedOrders = ref<number[]>([])
const showAssignModal = ref(false)
const showBatchSubmitModal = ref(false)
const selectedOrder = ref<RepairOrder | null>(null)

const assignForm = ref({
  workerId: 0,
  priority: '',
  estimatedHours: 1,
  notes: ''
})

const batchOrdersForm = ref([{
  vehicleId: 0,
  issue: '',
  repairType: '',
  additionalInfo: '',
  priority: 'MEDIUM'
}])

const filteredOrders = computed(() => {
  let filtered = repairOrders.value
  
  if (searchQuery.value) {
    filtered = filtered.filter(order =>
      order.licensePlate.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      order.issue.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      order.orderId.toString().includes(searchQuery.value)
    )
  }
  
  if (statusFilter.value) {
    filtered = filtered.filter(order => order.status === statusFilter.value)
  }
  
  if (priorityFilter.value) {
    filtered = filtered.filter(order => order.priority === priorityFilter.value)
  }
  
  return filtered
})

const availableWorkers = computed(() => {
  return workers.value.filter(worker => worker.status === 'ACTIVE')
})

const isAllSelected = computed(() => {
  return filteredOrders.value.length > 0 && 
         selectedOrders.value.length === filteredOrders.value.length
})

const getOrdersByStatus = (status: string) => {
  return repairOrders.value.filter(order => order.status === status)
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'PENDING': '待分配',
    'ASSIGNED': '已分配',
    'IN_PROGRESS': '进行中',
    'COMPLETED': '已完成'
  }
  return statusMap[status] || status
}

const getPriorityText = (priority?: string) => {
  if (!priority) return '未设置'
  const priorityMap: Record<string, string> = {
    'LOW': '低',
    'MEDIUM': '中',
    'HIGH': '高'
  }
  return priorityMap[priority] || priority
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedOrders.value = []
  } else {
    selectedOrders.value = filteredOrders.value.map(order => order.orderId)
  }
}

const viewOrderDetails = (order: RepairOrder) => {
  // 实现查看详情逻辑
  console.log('查看工单详情:', order)
}

const assignOrder = (order: RepairOrder) => {
  selectedOrder.value = order
  assignForm.value = {
    workerId: 0,
    priority: order.priority || 'MEDIUM',
    estimatedHours: 1,
    notes: ''
  }
  showAssignModal.value = true
}

const closeAssignModal = () => {
  showAssignModal.value = false
  selectedOrder.value = null
}

const submitAssignment = async () => {
  if (!selectedOrder.value) return
  
  try {
    await adminStore.assignRepairOrder(selectedOrder.value.orderId, assignForm.value)
    closeAssignModal()
    await adminStore.fetchRepairOrders()
  } catch (error) {
    console.error('分配工单失败:', error)
  }
}

const rollbackOrder = async (order: RepairOrder) => {
  if (confirm('确定要回滚此工单吗？')) {
    try {
      await adminStore.rollbackRepairOrder(order.orderId, {
        reason: '管理员手动回滚',
        rollbackToStatus: 'PENDING'
      })
      await adminStore.fetchRepairOrders()
    } catch (error) {
      console.error('回滚工单失败:', error)
    }
  }
}

const batchDelete = async () => {
  if (confirm(`确定要删除选中的 ${selectedOrders.value.length} 个工单吗？`)) {
    try {
      await adminStore.batchDeleteOrders(selectedOrders.value)
      selectedOrders.value = []
      await adminStore.fetchRepairOrders()
    } catch (error) {
      console.error('批量删除失败:', error)
    }
  }
}

const closeBatchSubmitModal = () => {
  showBatchSubmitModal.value = false
  batchOrdersForm.value = [{
    vehicleId: 0,
    issue: '',
    repairType: '',
    additionalInfo: '',
    priority: 'MEDIUM'
  }]
}

const addBatchOrder = () => {
  batchOrdersForm.value.push({
    vehicleId: 0,
    issue: '',
    repairType: '',
    additionalInfo: '',
    priority: 'MEDIUM'
  })
}

const removeBatchOrder = (index: number) => {
  batchOrdersForm.value.splice(index, 1)
}

const submitBatchOrders = async () => {
  try {
    await adminStore.batchSubmitOrders({ orders: batchOrdersForm.value })
    closeBatchSubmitModal()
    await adminStore.fetchRepairOrders()
  } catch (error) {
    console.error('批量提交失败:', error)
  }
}

onMounted(async () => {
  await Promise.all([
    adminStore.fetchRepairOrders(),
    adminStore.fetchWorkers()
  ])
})
</script>

<style scoped>
.repair-orders-page {
  background: #f8f9fa;
  min-height: 100vh;
  width: 80vw;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
  color: #333;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #007bff;
  margin: 0.5rem 0;
}

.filters {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 1rem;
}

.filter-group {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-input, .filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.orders-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
  margin-bottom: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.status, .priority {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status.pending { background: #fff3cd; color: #856404; }
.status.assigned { background: #d1ecf1; color: #0c5460; }
.status.in_progress { background: #cce5ff; color: #004085; }
.status.completed { background: #d4edda; color: #155724; }

.priority.high { background: #f8d7da; color: #721c24; }
.priority.medium { background: #fff3cd; color: #856404; }
.priority.low { background: #d4edda; color: #155724; }

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-view, .btn-assign, .btn-rollback {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

.btn-view { background: #007bff; color: white; }
.btn-assign { background: #28a745; color: white; }
.btn-rollback { background: #ffc107; color: #212529; }

.btn-primary { background: #007bff; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; }
.btn-danger { background: #dc3545; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; }
.btn-cancel { background: #6c757d; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; }
.btn-add { background: #28a745; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; margin: 1rem 0; }
.btn-remove { background: #dc3545; color: white; padding: 0.25rem 0.5rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }

.batch-actions {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input, .form-group select, .form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.batch-order-item {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.batch-order-item h4 {
  margin: 0 0 1rem 0;
  color: #333;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error {
  color: #dc3545;
}
</style>