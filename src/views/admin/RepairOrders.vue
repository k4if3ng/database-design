<template>
  <div class="repair-orders-page">
    <div class="page-header">
      <h1>维修工单管理</h1>
      <div class="header-actions">
        <button @click="showBatchSubmitModal = true" class="btn-primary">批量提交工单</button>
        <button 
          v-if="selectedOrdersForAssign.length > 0" 
          @click="batchAssignOrders" 
          class="btn-success"
        >
          批量分配 ({{ selectedOrdersForAssign.length }})
        </button>
        <button @click="refreshData" class="btn-secondary" :disabled="loading">刷新数据</button>
      </div>
    </div>

    <div class="stats-cards">
      <div class="stat-card">
        <h3>总工单</h3>
        <p class="stat-number">{{ repairOrders.length }}</p>
      </div>
      <div class="stat-card">
        <h3>待分配</h3>
        <p class="stat-number">{{ getOrdersByStatus('PENDING_ASSIGNMENT').length }}</p>
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
            <select v-model="repairTypeFilter" class="filter-select">
              <option value="">所有工种</option>
              <option value="发动机维修">发动机维修</option>
              <option value="电气维修">电气维修</option>
              <option value="钣金喷漆">钣金喷漆</option>
              <option value="新能源维修">新能源维修</option>
              <option value="其他">其他</option>
            </select>
            <select v-model="userFilter" class="filter-select">
              <option value="">所有车辆</option>
              <option v-for="user in uniqueUsers" :key="user.vehicleId" :value="user.vehicleId">
                {{ user.licensePlate || user.vehicleId }}
              </option>
            </select>            、
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索工单..."
              class="search-input"
            />
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
          <tr 
            v-for="order in filteredOrders" 
            :key="order.orderId"
            :class="{ 'selected-row': selectedOrders.includes(order.orderId) }"
          >
            <td>
              <input 
                type="checkbox" 
                v-model="selectedOrders" 
                :value="order.orderId"
                @change="updateSelectedOrdersForAssign"
              >
            </td>
            <td>{{ order.orderId }}</td>
            <td>{{ order.licensePlate }}</td>
            <td>{{ truncateText(order.issue, 30) }}</td>
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
                  @click="handleOrderAssignment(order)" 
                  :class="order.status === 'PENDING_ASSIGNMENT' ? 'btn-assign' : 'btn-manual-assign'"
                  :disabled="order.status === 'COMPLETED'"
                >
                  {{ order.status === 'PENDING_ASSIGNMENT' ? '分配' : '重新分配' }}
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
      <div class="batch-info">
        <p>已选择 {{ selectedOrders.length }} 个工单</p>
        <p v-if="selectedOrdersForAssign.length > 0" class="text-success">
          其中 {{ selectedOrdersForAssign.length }} 个可分配
        </p>
      </div>
      <div class="batch-buttons">
        <button 
          v-if="selectedOrdersForAssign.length > 0" 
          @click="batchAssignOrders" 
          class="btn-success"
        >
          批量分配
        </button>
        <button @click="batchDelete" class="btn-danger">批量删除</button>
      </div>
    </div>

    <!-- 查看工单详情模态框 -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="modal large-modal" @click.stop>
        <div class="modal-header">
          <h3>工单详情 - #{{ selectedOrder?.orderId }}</h3>
          <button @click="closeDetailModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body" v-if="selectedOrder">
          <div class="detail-grid">
            <div class="detail-section">
              <h4>基本信息</h4>
              <div class="detail-item">
                <label>工单ID:</label>
                <span>{{ selectedOrder.orderId }}</span>
              </div>
              <div class="detail-item">
                <label>车牌号:</label>
                <span>{{ selectedOrder.licensePlate }}</span>
              </div>
              <div class="detail-item">
                <label>车辆ID:</label>
                <span>{{ selectedOrder.vehicleId }}</span>
              </div>
              <div class="detail-item">
                <label>问题描述:</label>
                <span>{{ selectedOrder.issue }}</span>
              </div>
              <div class="detail-item">
                <label>维修类型:</label>
                <span>{{ selectedOrder.repairType || '未指定' }}</span>
              </div>
            </div>

            <div class="detail-section">
              <h4>状态信息</h4>
              <div class="detail-item">
                <label>当前状态:</label>
                <span :class="['status', selectedOrder.status.toLowerCase()]">
                  {{ getStatusText(selectedOrder.status) }}
                </span>
              </div>
              <div class="detail-item">
                <label>优先级:</label>
                <span :class="['priority', selectedOrder.priority?.toLowerCase()]">
                  {{ getPriorityText(selectedOrder.priority) }}
                </span>
              </div>
              <div class="detail-item">
                <label>维修工:</label>
                <span>{{ selectedOrder.workerName || '未分配' }}</span>
              </div>
              <div class="detail-item">
                <label>预估工时:</label>
                <span>{{ selectedOrder.estimatedHours || 0 }} 小时</span>
              </div>
            </div>

            <div class="detail-section full-width">
              <h4>时间信息</h4>
              <div class="detail-grid-2">
                <div class="detail-item">
                  <label>创建时间:</label>
                  <span>{{ formatDateTime(selectedOrder.createTime) }}</span>
                </div>
                <div class="detail-item" v-if="selectedOrder.assignTime">
                  <label>分配时间:</label>
                  <span>{{ formatDateTime(selectedOrder.assignTime) }}</span>
                </div>
                <div class="detail-item" v-if="selectedOrder.estimatedCompletionTime">
                  <label>预计完成时间:</label>
                  <span>{{ formatDateTime(selectedOrder.estimatedCompletionTime) }}</span>
                </div>
                <div class="detail-item" v-if="selectedOrder.customerPhone">
                  <label>客户电话:</label>
                  <span>{{ selectedOrder.customerPhone }}</span>
                </div>
              </div>
            </div>

            <div class="detail-section full-width" v-if="selectedOrder.notes">
              <h4>备注信息</h4>
              <div class="notes-content">
                {{ selectedOrder.notes }}
              </div>
            </div>

            <div class="detail-section full-width" v-if="selectedOrder.repairSolution">
              <h4>维修方案</h4>
              <div class="notes-content">
                {{ selectedOrder.repairSolution }}
              </div>
            </div>

            <div class="detail-section full-width" v-if="selectedOrder.repairResult">
              <h4>维修结果</h4>
              <div class="notes-content">
                {{ selectedOrder.repairResult }}
              </div>
            </div>
          </div>
          
          <div class="detail-actions">
            <button 
              @click="handleOrderAssignmentFromDetail(selectedOrder)" 
              :class="selectedOrder.status === 'PENDING_ASSIGNMENT' ? 'btn-assign' : 'btn-manual-assign'"
              :disabled="selectedOrder.status === 'COMPLETED'"
            >
              {{ selectedOrder.status === 'PENDING_ASSIGNMENT' ? '分配' : '重新分配' }}
            </button>
            <button 
              @click="rollbackOrderFromDetail" 
              class="btn-rollback"
              :disabled="selectedOrder.status === 'COMPLETED'"
            >
              回滚工单
            </button>
            <button @click="closeDetailModal" class="btn-secondary">关闭</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 分配工单模态框 -->
    <div v-if="showAssignModal" class="modal-overlay" @click="closeAssignModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>
            {{ 
              isBatchAssign 
                ? '批量分配工单' 
                : selectedOrder?.status === 'PENDING_ASSIGNMENT' ? '分配工单' : '重新分配工单'
            }} 
            {{ !isBatchAssign ? `#${selectedOrder?.orderId}` : '' }}
          </h3>
          <button @click="closeAssignModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="assignment-status-info" v-if="!isBatchAssign && selectedOrder && selectedOrder.status !== 'PENDING_ASSIGNMENT'">
            <div class="status-box status-info-warning">
              <strong>
                {{ 
                  selectedOrder.status === 'ASSIGNED' 
                    ? `此工单已分配给 ${selectedOrder.workerName}，重新分配将更换维修工` 
                    : `此工单正在由 ${selectedOrder.workerName} 处理中，重新分配将中断当前工作`
                }}
              </strong>
            </div>
          </div>
          
          <form @submit.prevent="submitAssignment">
            <div v-if="isBatchAssign" class="batch-assign-orders">
              <h4>选中的工单 ({{ ordersToAssign.length }})</h4>
              <div class="orders-list">
                <div v-for="order in ordersToAssign" :key="order.orderId" class="order-item">
                  <span class="order-id">#{{ order.orderId }}</span>
                  <span class="order-plate">{{ order.licensePlate }}</span>
                  <span class="order-issue">{{ truncateText(order.issue, 40) }}</span>
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label for="workerId">选择维修工:</label>
              <select id="workerId" v-model="assignForm.workerId" required class="form-select">
                <option value="0" disabled>-- 请选择维修工 --</option>
                <option 
                  v-for="worker in workers" 
                  :key="worker.workerId" 
                  :value="worker.workerId"
                >
                  {{ worker.workerName }} ({{ worker.specialty }})
                </option>
              </select>
              <span class="worker-info" v-if="assignForm.workerId">
                {{ getWorkerInfo(assignForm.workerId) }}
              </span>
            </div>
            
            <div class="form-group">
              <label for="priority">优先级:</label>
              <select id="priority" v-model="assignForm.priority" required class="form-select">
                <option value="LOW">低</option>
                <option value="MEDIUM">中</option>
                <option value="HIGH">高</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="estimatedHours">预估工时:</label>
              <input 
                id="estimatedHours" 
                type="number" 
                v-model.number="assignForm.estimatedHours" 
                min="1" 
                required 
                class="form-input"
              >
              <span class="form-hint">请输入预计完成所需的工作小时数</span>
            </div>
            
            <div class="form-group">
              <label for="notes">备注:</label>
              <textarea 
                id="notes" 
                v-model="assignForm.notes" 
                rows="3" 
                :placeholder="isBatchAssign ? '批量分配备注...' : '请输入分配说明或特殊要求...'"
                class="form-textarea"
              ></textarea>
            </div>
            
            <div v-if="isBatchAssign" class="batch-options">
              <h4>批量分配选项</h4>
              <div class="form-group">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="batchAssignOptions.autoDistribute">
                  <span>自动分配给多个维修工 (负载均衡)</span>
                </label>
                <span class="form-hint">启用后，工单将分配给多个维修工以平衡工作量</span>
              </div>
              <div class="form-group" v-if="batchAssignOptions.autoDistribute">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="batchAssignOptions.respectSpecialty">
                  <span>考虑维修专业匹配度</span>
                </label>
                <span class="form-hint">启用后，系统会尝试将工单分配给专业对口的维修工</span>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="button" @click="closeAssignModal" class="btn-cancel">取消</button>
              <button type="submit" class="btn-primary">确认分配</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 回滚工单模态框 -->
    <div v-if="showRollbackModal" class="modal-overlay" @click="closeRollbackModal">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h3>回滚工单 - #{{ selectedOrder?.orderId }}</h3>
        <button @click="closeRollbackModal" class="close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="submitRollback">
          <div class="form-group">
            <label>当前状态:</label>
            <span :class="['status', selectedOrder?.status.toLowerCase()]">
              {{ getStatusText(selectedOrder?.status) }}
            </span>
          </div>
          
          <div class="form-group">
            <label>回滚时间:</label>
            <input 
              type="datetime-local" 
              v-model="rollbackForm.targetTimestamp" 
              class="form-input"
              required
            />
            <span class="form-hint">请选择回滚的目标时间点</span>
          </div>
          
          <div class="warning-message">
            <strong>注意:</strong> 回滚操作将撤销工单在所选时间点之后的所有状态变更，请谨慎操作！
          </div>
          
          <div class="form-actions">
            <button type="button" @click="closeRollbackModal" class="btn-cancel">取消</button>
            <button type="submit" class="btn-warning">确认回滚</button>
          </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 批量提交工单模态框 -->
    <div v-if="showBatchSubmitModal" class="modal-overlay" @click="closeBatchSubmitModal">
      <div class="modal large-modal" @click.stop>
        <div class="modal-header">
          <h3>批量提交工单</h3>
          <button @click="closeBatchSubmitModal" class="close-btn">&times;</button>
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
const showDetailModal = ref(false)
const showRollbackModal = ref(false)
const showBatchSubmitModal = ref(false)
const selectedOrder = ref<RepairOrder | null>(null)
const isBatchAssign = ref(false)
const ordersToAssign = ref<RepairOrder[]>([])
const repairTypeFilter = ref('') // 新增工种过滤器
const userFilter = ref('') // 新增用户过滤器

const assignForm = ref({
  workerId: 0,
  priority: '',
  estimatedHours: 1,
  notes: ''
})

const rollbackForm = ref({
  // reason: '',
  // rollbackToStatus: 'PENDING_ASSIGNMENT',
  targetTimestamp: ''
})

const batchOrdersForm = ref([{
  vehicleId: 0,
  issue: '',
  repairType: '',
  additionalInfo: '',
  priority: 'MEDIUM'
}])

const batchAssignOptions = ref({
  autoDistribute: false,
  respectSpecialty: true
})


// 获取唯一用户列表（根据车辆ID和车牌号）
const uniqueUsers = computed(() => {
  const userMap = new Map();
  
  repairOrders.value.forEach(order => {
    if (order.vehicleId && !userMap.has(order.vehicleId)) {
      userMap.set(order.vehicleId, {
        vehicleId: order.vehicleId,
        licensePlate: order.licensePlate
      });
    }
  });
  
  return Array.from(userMap.values());
});

// 更新筛选逻辑
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
  
  // 按工种筛选
  if (repairTypeFilter.value) {
    filtered = filtered.filter(order => order.repairType === repairTypeFilter.value)
  }
  
  // 按用户（车辆）筛选
  if (userFilter.value) {
    filtered = filtered.filter(order => order.vehicleId === parseInt(userFilter.value))
  }
  
  return filtered
})

// 获取可以分配的选中工单
const selectedOrdersForAssign = computed(() => {
  return selectedOrders.value.filter(orderId => {
    const order = repairOrders.value.find(o => o.orderId === orderId)
    return order && order.status === 'PENDING_ASSIGNMENT'
  })
})

const isAllSelected = computed(() => {
  return filteredOrders.value.length > 0 && 
         selectedOrders.value.length === filteredOrders.value.length
})

const getOrdersByStatus = (status: string) => {
  return repairOrders.value.filter(order => order.status === status)
}

const getStatusText = (status?: string) => {
  if (!status) return '未知'
  const statusMap: Record<string, string> = {
    'PENDING_ASSIGNMENT': '待分配',
    'ASSIGNED': '已分配',
    'IN_PROGRESS': '进行中',
    'COMPLETED': '已完成',
    'ACCEPTED': '已接收',
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

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 获取维修工信息
const getWorkerInfo = (workerId: number) => {
  const worker = workers.value.find(w => w.workerId === workerId)
  if (!worker) return ''
  
  return `专业: ${worker.specialty}, 当前负载: ${worker.currentOrders} 个工单, 完成数: ${worker.completedOrders}`
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedOrders.value = []
  } else {
    selectedOrders.value = filteredOrders.value.map(order => order.orderId)
  }
  updateSelectedOrdersForAssign()
}

const updateSelectedOrdersForAssign = () => {
  // 这个方法在选择发生变化时自动调用
  // 用于更新UI显示和启用/禁用分配按钮
}

// 统一处理工单分配
const handleOrderAssignment = (order: RepairOrder) => {
  if (order.status === 'COMPLETED') {
    alert('已完成的工单不能再分配');
    return;
  }

  selectedOrder.value = order;
  isBatchAssign.value = false;
  ordersToAssign.value = [order];
  
  // 根据工单状态设置不同的表单内容
  if (order.status === 'PENDING_ASSIGNMENT') {
    // 首次分配
    assignForm.value = {
      workerId: 0,
      priority: order.priority || 'MEDIUM',
      estimatedHours: getEstimatedHours(),
      notes: `首次分配工单 #${order.orderId} - ${order.licensePlate}`
    };
  } else {
    // 重新分配
    assignForm.value = {
      workerId: order.workerId || 0,
      priority: order.priority || 'MEDIUM',
      estimatedHours: order.estimatedHours || getEstimatedHours(),
      notes: `重新分配工单 #${order.orderId} - ${order.licensePlate}` + 
             (order.workerName ? ` (当前: ${order.workerName})` : '')
    };
  }
  
  showAssignModal.value = true;
}

// 处理从详情页进行分配
const handleOrderAssignmentFromDetail = (order: RepairOrder) => {
  closeDetailModal();
  handleOrderAssignment(order);
}

// 处理从详情页回滚工单
const rollbackOrderFromDetail = () => {
  if (selectedOrder.value) {
    rollbackOrder(selectedOrder.value);
    closeDetailModal();
  }
}

// 获取预估工时
const getEstimatedHours = () => {
  if (!selectedOrder.value) return 1
  
  const repairTypeHoursMap: Record<string, number> = {
    'ENGINE': 4,
    'BRAKE': 2,
    'TRANSMISSION': 6,
    'ELECTRICAL': 3,
    'OTHER': 2
  }
  
  const baseHours = repairTypeHoursMap[selectedOrder.value.repairType || 'OTHER'] || 2
  const priorityMultiplier = selectedOrder.value.priority === 'HIGH' ? 1.2 : 1
  
  return Math.ceil(baseHours * priorityMultiplier)
}

const refreshData = async () => {
  try {
    await Promise.all([
      adminStore.fetchRepairOrders(),
      adminStore.fetchWorkers()
    ])
  } catch (error) {
    console.error('刷新数据失败:', error)
  }
}

// 查看工单详情
const viewOrderDetails = (order: RepairOrder) => {
  selectedOrder.value = order
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedOrder.value = null
}

// 批量分配工单
const batchAssignOrders = () => {
  const ordersToAssignList = selectedOrdersForAssign.value.map(orderId => 
    repairOrders.value.find(order => order.orderId === orderId)
  ).filter(Boolean) as RepairOrder[]
  
  if (ordersToAssignList.length === 0) {
    alert('没有可分配的工单')
    return
  }
  
  selectedOrder.value = null
  isBatchAssign.value = true
  ordersToAssign.value = ordersToAssignList
  
  // 自动填充表单 - 使用最常见的优先级
  const priorityCounts = ordersToAssignList.reduce((acc, order) => {
    const priority = order.priority || 'MEDIUM'
    acc[priority] = (acc[priority] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const mostCommonPriority = Object.keys(priorityCounts).reduce((a, b) => 
    priorityCounts[a] > priorityCounts[b] ? a : b
  )
  
  assignForm.value = {
    workerId: 0,
    priority: mostCommonPriority,
    estimatedHours: Math.ceil(ordersToAssignList.length * 2), // 批量分配预估总工时
    notes: `批量分配 ${ordersToAssignList.length} 个工单`
  }
  
  showAssignModal.value = true
}

const closeAssignModal = () => {
  showAssignModal.value = false
  selectedOrder.value = null
  isBatchAssign.value = false
  ordersToAssign.value = []
  assignForm.value = {
    workerId: 0,
    priority: '',
    estimatedHours: 1,
    notes: ''
  }
  batchAssignOptions.value = {
    autoDistribute: false,
    respectSpecialty: true
  }
}

const submitAssignment = async () => {
  try {
    if (isBatchAssign.value) {
      // 批量分配逻辑
      if (batchAssignOptions.value.autoDistribute) {
        // 自动分配 - 根据负载均衡
        await submitAutoDistributeBatch()
      } else {
        // 手动分配到同一个维修工
        await submitManualBatch()
      }
    } else {
      // 单个工单分配
      if (!selectedOrder.value) return
      
      const response = await adminStore.assignRepairOrder(selectedOrder.value.orderId, assignForm.value)
      if (response.success) {
        alert('工单分配成功！')
        closeAssignModal()
        await adminStore.fetchRepairOrders()
      } else {
        alert(`分配失败: ${response.message}`)
      }
    }
  } catch (error) {
    console.error('分配工单失败:', error)
    alert('分配工单失败，请稍后重试')
  }
}

const submitAutoDistributeBatch = async () => {
  const availableWorkersList = workers.value.sort((a, b) => a.currentOrders - b.currentOrders)
  let workerIndex = 0
  
  const assignments = ordersToAssign.value.map(order => {
    // 如果考虑专业匹配
    if (batchAssignOptions.value.respectSpecialty) {
      const suitableWorker = availableWorkersList.find(worker => 
        worker.specialty.includes(order.repairType || '')
      )
      if (suitableWorker) {
        return {
          orderId: order.orderId,
          workerId: suitableWorker.workerId,
          priority: order.priority || assignForm.value.priority,
          estimatedHours: Math.ceil(assignForm.value.estimatedHours / ordersToAssign.value.length),
          notes: `${assignForm.value.notes} - 自动分配到 ${suitableWorker.workerName}`
        }
      }
    }
    
    // 负载均衡分配
    const worker = availableWorkersList[workerIndex % availableWorkersList.length]
    workerIndex++
    
    return {
      orderId: order.orderId,
      workerId: worker.workerId,
      priority: order.priority || assignForm.value.priority,
      estimatedHours: Math.ceil(assignForm.value.estimatedHours / ordersToAssign.value.length),
      notes: `${assignForm.value.notes} - 自动分配到 ${worker.workerName}`
    }
  })
  
  // 逐个分配
  const results = await Promise.allSettled(
    assignments.map(assignment => 
      adminStore.assignRepairOrder(assignment.orderId, {
        workerId: assignment.workerId,
        priority: assignment.priority,
        estimatedHours: assignment.estimatedHours,
        notes: assignment.notes
      })
    )
  )
  
  const successful = results.filter(r => r.status === 'fulfilled').length
  alert(`批量分配完成！成功分配 ${successful}/${ordersToAssign.value.length} 个工单`)
  
  closeAssignModal()
  selectedOrders.value = []
  await adminStore.fetchRepairOrders()
}

const submitManualBatch = async () => {
  if (!assignForm.value.workerId) {
    alert('请选择维修工')
    return
  }
  
  const assignments = ordersToAssign.value.map(order => ({
    orderId: order.orderId,
    workerId: assignForm.value.workerId,
    priority: order.priority || assignForm.value.priority,
    estimatedHours: Math.ceil(assignForm.value.estimatedHours / ordersToAssign.value.length),
    notes: `${assignForm.value.notes} - 批量分配 #${order.orderId}`
  }))
  
  const results = await Promise.allSettled(
    assignments.map(assignment => 
      adminStore.assignRepairOrder(assignment.orderId, {
        workerId: assignment.workerId,
        priority: assignment.priority,
        estimatedHours: assignment.estimatedHours,
        notes: assignment.notes
      })
    )
  )
  
  const successful = results.filter(r => r.status === 'fulfilled').length
  alert(`批量分配完成！成功分配 ${successful}/${ordersToAssign.value.length} 个工单`)
  
  closeAssignModal()
  selectedOrders.value = []
  await adminStore.fetchRepairOrders()
}

// 回滚工单
const rollbackOrder = (order: RepairOrder) => {
  selectedOrder.value = order
  
  // 格式化当前日期时间，用于datetime-local输入 (YYYY-MM-DDThh:mm)
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  
  rollbackForm.value = {
    targetTimestamp: `${year}-${month}-${day}T${hours}:${minutes}`
  }
  
  showRollbackModal.value = true
}

const closeRollbackModal = () => {
  showRollbackModal.value = false
  selectedOrder.value = null
  rollbackForm.value = {
    targetTimestamp: ''
  }
}

const submitRollback = async () => {
  if (!selectedOrder.value) return
  
  try {
    // 将本地日期时间格式转换为ISO字符串
    const isoTimestamp = new Date(rollbackForm.value.targetTimestamp).toISOString()
    
    // 发送请求参数而不是请求体
    const response = await adminStore.rollbackRepairOrder(
      selectedOrder.value.orderId, 
      { targetTimestamp: isoTimestamp }
    )
    
    if (response.success) {
      alert('工单回滚成功！')
      closeRollbackModal()
      await adminStore.fetchRepairOrders()
    } else {
      alert(`回滚失败: ${response.message}`)
    }
  } catch (error) {
    console.error('回滚工单失败:', error)
    alert('回滚工单失败，请稍后重试')
  }
}

// 批量删除
const batchDelete = async () => {
  if (confirm(`确定要删除选中的 ${selectedOrders.value.length} 个工单吗？此操作不可恢复！`)) {
    try {
      const response = await adminStore.batchDeleteOrders(selectedOrders.value)
      if (response.success) {
        alert(`成功删除 ${response.data.successfullyDeleted} 个工单`)
        selectedOrders.value = []
        await adminStore.fetchRepairOrders()
      } else {
        alert(`删除失败: ${response.message}`)
      }
    } catch (error) {
      console.error('批量删除失败:', error)
      alert('批量删除失败，请稍后重试')
    }
  }
}

// 批量提交工单
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

onMounted(async () => {
  await refreshData()
})
</script>

<style scoped>
.repair-orders-page {
  background: #f8f9fa;
  min-height: 100vh;
  width: 80vw;
  padding: 1rem;
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

.header-actions {
  display: flex;
  gap: 1rem;
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
  flex-wrap: wrap;
}

.search-input, .filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 200px;
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

.selected-row {
  background-color: #e3f2fd;
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

.btn-view, .btn-assign, .btn-manual-assign, .btn-rollback, .btn-disabled {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

.btn-view { background: #007bff; color: white; }
.btn-assign { background: #28a745; color: white; }
.btn-manual-assign { background: #17a2b8; color: white; }
.btn-rollback { background: #ffc107; color: #212529; }
.btn-disabled { 
  background: #e9ecef; 
  color: #6c757d; 
  cursor: not-allowed; 
}

.btn-primary { background: #007bff; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; }
.btn-secondary { background: #6c757d; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; }
.btn-success { background: #28a745; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; }
.btn-danger { background: #dc3545; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; }
.btn-warning { background: #ffc107; color: #212529; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; }
.btn-cancel { background: #6c757d; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; }
.btn-add { background: #28a745; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; margin: 1rem 0; }
.btn-remove { background: #dc3545; color: white; padding: 0.25rem 0.5rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }

.btn-primary:disabled, .btn-assign:disabled, .btn-rollback:disabled, .btn-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.batch-actions {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.batch-info {
  flex: 1;
}

.batch-buttons {
  display: flex;
  gap: 1rem;
}

.text-success {
  color: #28a745;
  font-weight: 500;
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

.large-modal {
  max-width: 900px;
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

.assignment-status-info {
  margin-bottom: 1rem;
}

.status-box {
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.status-info-normal {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-info-warning {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeeba;
}

.status-info-error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.batch-assign-orders {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.orders-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.5rem;
}

.order-item {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
}

.order-item:last-child {
  border-bottom: none;
}

.order-id {
  font-weight: bold;
  color: #007bff;
  min-width: 60px;
}

.order-plate {
  font-weight: 500;
  min-width: 80px;
}

.order-issue {
  flex: 1;
  color: #666;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 1rem;
}

.detail-section {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
}

.detail-section.full-width {
  grid-column: 1 / -1;
}

.detail-section h4 {
  margin: 0 0 1rem 0;
  color: #333;
  border-bottom: 2px solid #007bff;
  padding-bottom: 0.5rem;
}

.detail-item {
  display: flex;
  margin-bottom: 0.5rem;
}

.detail-item label {
  font-weight: 600;
  color: #666;
  min-width: 120px;
}

.detail-item span {
  flex: 1;
}

.detail-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.notes-content {
  background: white;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  white-space: pre-wrap;
}

.detail-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-hint {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.8rem;
  color: #666;
}

.worker-info {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.8rem;
  color: #007bff;
  background: #e3f2fd;
  padding: 0.5rem;
  border-radius: 4px;
}

.batch-options {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
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

.warning-message {
  background: #fff3cd;
  color: #856404;
  padding: 0.75rem;
  border-radius: 4px;
  margin: 1rem 0;
  border: 1px solid #ffeaa7;
}

.batch-order-item {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  background: #f8f9fa;
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

@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input, .filter-select {
    min-width: auto;
    width: 100%;
  }

  .batch-actions {
    flex-direction: column;
    gap: 1rem;
  }

  .batch-buttons {
    justify-content: center;
  }
}
</style>