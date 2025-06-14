<template>
  <div class="order-details">
    <div v-if="loading" class="loading">
      <p>加载中...</p>
    </div>
    
    <div v-else-if="!currentOrder" class="not-found">
      <h2>工单不存在或已被删除</h2>
      <button @click="goBack" class="back-btn">返回列表</button>
    </div>
    
    <div v-else class="details-container">
      <div class="header">
        <button @click="goBack" class="back-btn">
          &larr; 返回列表
        </button>
        <h1>工单 #{{ currentOrder.id }}</h1>
        <span :class="`status ${currentOrder.status.toLowerCase()}`">
          {{ getStatusText(currentOrder.status) }}
        </span>
      </div>
      
      <div class="main-info">
        <div class="info-card">
          <h3>基本信息</h3>
          <div class="info-row">
            <span class="label">车牌号:</span>
            <span class="value">{{ currentOrder.licensePlate }}</span>
          </div>
          <div class="info-row">
            <span class="label">问题描述:</span>
            <span class="value">{{ currentOrder.issue }}</span>
          </div>
          <div class="info-row">
            <span class="label">维修类型:</span>
            <span class="value">{{ currentOrder.repairType || '未指定' }}</span>
          </div>
          <div class="info-row">
            <span class="label">创建时间:</span>
            <span class="value">{{ formatDate(currentOrder.createTime) }}</span>
          </div>
          <div class="info-row">
            <span class="label">分配时间:</span>
            <span class="value">{{ formatDate(currentOrder.assignTime) }}</span>
          </div>
          <div v-if="currentOrder.vehicleInfo" class="info-row">
            <span class="label">车辆型号:</span>
            <span class="value">{{ currentOrder.vehicleInfo.brand }} {{ currentOrder.vehicleInfo.model }} ({{ currentOrder.vehicleInfo.year }})</span>
          </div>
        </div>
        
        <!-- 工单操作区域 -->
        <div class="action-card">
          <div v-if="currentOrder.status === 'ASSIGNED'" class="action-section">
            <h3>工单操作</h3>
            <div class="action-buttons">
              <button @click="handleAccept" class="primary-btn">接受工单</button>
              <button @click="openRejectDialog" class="danger-btn">拒绝工单</button>
            </div>
          </div>
          
          <div v-if="currentOrder.status === 'ACCEPTED' || currentOrder.status === 'IN_PROGRESS'" class="action-section">
            <h3>完成工单</h3>
            <div class="form-group">
              <label>工时 (小时)</label>
              <input type="number" v-model="completeForm.laborHours" min="0.5" step="0.5" />
            </div>
            <div class="form-group">
              <label>维修描述</label>
              <textarea v-model="completeForm.description" rows="4" placeholder="详细描述维修过程和解决方案"></textarea>
            </div>
            <div class="form-group">
              <label>维修建议</label>
              <textarea v-model="completeForm.suggestion" rows="2" placeholder="给客户的后续维护建议"></textarea>
            </div>
            <button @click="handleComplete" class="primary-btn">提交完成</button>
          </div>
          
          <div v-if="currentOrder.status === 'ACCEPTED' || currentOrder.status === 'IN_PROGRESS'" class="action-section">
            <h3>添加维修材料</h3>
            <div class="form-group">
              <label>材料名称</label>
              <input type="text" v-model="materialForm.name" placeholder="例如: 机油滤芯" />
            </div>
            <div class="form-group">
              <label>数量</label>
              <input type="number" v-model="materialForm.quantity" min="1" />
            </div>
            <div class="form-group">
              <label>单价 (元)</label>
              <input type="number" v-model="materialForm.unitPrice" min="0" step="0.01" />
            </div>
            <div class="form-group">
              <label>供应商</label>
              <input type="text" v-model="materialForm.supplier" placeholder="例如: 汽配城" />
            </div>
            <button @click="handleAddMaterial" class="secondary-btn">添加材料</button>
          </div>
        </div>
      </div>
      
      <!-- 材料列表 -->
      <div v-if="materials.length > 0" class="materials-section">
        <h3>材料清单</h3>
        <table class="materials-table">
          <thead>
            <tr>
              <th>材料名称</th>
              <th>数量</th>
              <th>单价 (元)</th>
              <th>总价 (元)</th>
              <th>供应商</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="material in materials" :key="material.id">
              <td>{{ material.name }}</td>
              <td>{{ material.quantity }}</td>
              <td>{{ material.unitPrice.toFixed(2) }}</td>
              <td>{{ material.totalCost.toFixed(2) }}</td>
              <td>{{ material.supplier }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" class="total-label">材料总价:</td>
              <td colspan="2" class="total-value">{{ calculateTotalMaterialCost().toFixed(2) }} 元</td>
            </tr>
          </tfoot>
        </table>
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
import { useRoute, useRouter } from 'vue-router'
import { useWorkerStore } from '@/stores/worker'
import type { RepairOrder, Material } from '@/types'

const route = useRoute()
const router = useRouter()
const workerStore = useWorkerStore()

const loading = ref(true)
const materials = ref<Material[]>([])
const showRejectDialog = ref(false)
const rejectReason = ref('')

const completeForm = ref({
  laborHours: 1,
  description: '',
  suggestion: ''
})

const materialForm = ref({
  name: '',
  quantity: 1,
  unitPrice: 0,
  supplier: ''
})

const currentOrder = computed(() => {
  const orderId = Number(route.params.id)
  return workerStore.assignedOrders.find((order: RepairOrder) => order.id === orderId)
})

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

const goBack = () => {
  router.push('/worker/orders')
}

const handleAccept = async () => {
  if (!currentOrder.value) return
  
  try {
    await workerStore.acceptOrder(currentOrder.value.id)
    alert('工单已成功接受')
  } catch (error) {
    console.error('接受工单失败:', error)
    alert('接受工单失败，请重试')
  }
}

const openRejectDialog = () => {
  rejectReason.value = ''
  showRejectDialog.value = true
}

const handleReject = async () => {
  if (!currentOrder.value) return
  
  if (!rejectReason.value.trim()) {
    alert('请输入拒绝原因')
    return
  }

  try {
    await workerStore.rejectOrder(currentOrder.value.id, rejectReason.value)
    showRejectDialog.value = false
    alert('工单已成功拒绝')
  } catch (error) {
    console.error('拒绝工单失败:', error)
    alert('拒绝工单失败，请重试')
  }
}

const handleComplete = async () => {
  if (!currentOrder.value) return
  
  if (!completeForm.value.description.trim()) {
    alert('请输入维修描述')
    return
  }
  
  try {
    await workerStore.completeOrder(currentOrder.value.id, {
      laborHours: completeForm.value.laborHours,
      description: completeForm.value.description,
      suggestion: completeForm.value.suggestion
    })
    alert('工单已成功完成')
    router.push('/worker/orders')
  } catch (error) {
    console.error('完成工单失败:', error)
    alert('完成工单失败，请重试')
  }
}

const handleAddMaterial = async () => {
  if (!currentOrder.value) return
  
  if (!materialForm.value.name.trim() || materialForm.value.quantity <= 0 || materialForm.value.unitPrice <= 0) {
    alert('请填写完整的材料信息')
    return
  }
  
  try {
    const response = await workerStore.addMaterial(currentOrder.value.id, {
      name: materialForm.value.name,
      quantity: materialForm.value.quantity,
      unitPrice: materialForm.value.unitPrice,
      supplier: materialForm.value.supplier
    })
    
    // 添加到本地材料列表
    materials.value.push(response.data)
    
    // 清空表单
    materialForm.value = {
      name: '',
      quantity: 1,
      unitPrice: 0,
      supplier: ''
    }
    
    alert('材料添加成功')
  } catch (error) {
    console.error('添加材料失败:', error)
    alert('添加材料失败，请重试')
  }
}

const calculateTotalMaterialCost = () => {
  return materials.value.reduce((sum, material) => sum + material.totalCost, 0)
}

onMounted(async () => {
  try {
    // 如果还没有加载工单，则加载
    if (workerStore.assignedOrders.length === 0) {
      await workerStore.fetchAssignedOrders()
    }
    
    // TODO: 实际应用中应该添加获取材料列表的API调用
    // materials.value = await workerService.getMaterialsByOrderId(route.params.id)
    
    loading.value = false
  } catch (error) {
    console.error('加载工单详情失败:', error)
    loading.value = false
  }
})
</script>

<style scoped>
.order-details {
  padding: 1.5rem;
  background: linear-gradient(to bottom right, #f5f7fa, #c3cfe2);
  min-height: 100vh;
  min-width: 80vw;
}

.loading, .not-found {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
}

.details-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.back-btn {
  background: transparent;
  border: none;
  color: #667eea;
  cursor: pointer;
  font-weight: bold;
  padding: 0.5rem;
}

.main-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  padding: 1.5rem;
}

@media (max-width: 768px) {
  .main-info {
    grid-template-columns: 1fr;
  }
}

.info-card, .action-card {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 1.5rem;
}

.info-row {
  margin-bottom: 0.75rem;
  display: flex;
}

.label {
  font-weight: bold;
  width: 120px;
  color: #555;
}

.value {
  flex: 1;
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

.action-section {
  margin-bottom: 2rem;
}

.action-section:last-child {
  margin-bottom: 0;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #555;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.primary-btn, .secondary-btn, .danger-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: bold;
}

.primary-btn {
  background: #667eea;
  color: white;
}

.secondary-btn {
  background: #e2e8f0;
  color: #4a5568;
}

.danger-btn {
  background: #ffebee;
  color: #d32f2f;
}

.materials-section {
  padding: 1.5rem;
  border-top: 1px solid #eee;
}

.materials-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.materials-table th,
.materials-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.materials-table th {
  background: #f8f9fa;
  font-weight: bold;
}

.total-label {
  text-align: right;
  font-weight: bold;
}

.total-value {
  font-weight: bold;
  color: #667eea;
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

.cancel-btn {
  background: #f1f1f1;
  color: #333;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.confirm-btn {
  background: #d32f2f;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}
</style>