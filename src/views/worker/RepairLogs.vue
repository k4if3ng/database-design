<template>
  <div class="repair-logs">
    <h1>维修记录</h1>
    
    <div class="filters">
      <div class="date-filter">
        <label>日期范围:</label>
        <input type="date" v-model="startDate" />
        <span>至</span>
        <input type="date" v-model="endDate" />
      </div>
      
      <div class="search-box">
        <input type="text" v-model="searchQuery" placeholder="搜索车牌号或问题..." />
      </div>
    </div>
    
    <div v-if="loading" class="loading">
      <p>加载中...</p>
    </div>
    
    <div v-else>
      <div v-if="filteredLogs.length === 0" class="no-logs">
        <p>没有符合条件的维修记录</p>
      </div>
      
      <div v-else class="logs-table-container">
        <table class="logs-table">
          <thead>
            <tr>
              <th>工单ID</th>
              <th>车牌号</th>
              <th>问题</th>
              <th>完成时间</th>
              <th>工时</th>
              <th>材料费 (元)</th>
              <th>人工费 (元)</th>
              <th>总费用 (元)</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in filteredLogs" :key="log.id">
              <td>{{ log.orderId }}</td>
              <td>{{ log.licensePlate }}</td>
              <td>{{ log.issue }}</td>
              <td>{{ formatDate(log.completionTime) }}</td>
              <td>{{ log.laborHours || '-' }} 小时</td>
              <td>{{ log.materialsCost?.toFixed(2) }}</td>
              <td>{{ log.laborCost?.toFixed(2) }}</td>
              <td>{{ log.totalCost?.toFixed(2) }}</td>
              <td>
                <button @click="viewLogDetails(log)" class="view-btn">查看详情</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 统计信息 -->
      <div class="summary-section">
        <div class="summary-card">
          <h3>总计</h3>
          <p>完成工单: {{ filteredLogs.length }} 个</p>
          <p>总工时: {{ calculateTotalWorkHours() }} 小时</p>
          <p>总材料费: ¥{{ calculateTotalMaterialCost().toFixed(2) }}</p>
          <p>总人工费: ¥{{ calculateTotalLaborCost().toFixed(2) }}</p>
          <p>总收入: ¥{{ calculateTotalEarnings().toFixed(2) }}</p>
        </div>
      </div>
    </div>
    
    <!-- 维修记录详情对话框 -->
    <div v-if="selectedLog && showDetailDialog" class="modal-overlay">
      <div class="modal log-detail-modal">
        <div class="modal-header">
          <h3>维修记录详情</h3>
          <button @click="showDetailDialog = false" class="close-btn">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="detail-row">
            <span class="detail-label">工单ID:</span>
            <span class="detail-value">{{ selectedLog.orderId }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">车牌号:</span>
            <span class="detail-value">{{ selectedLog.licensePlate }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">问题:</span>
            <span class="detail-value">{{ selectedLog.issue }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">维修描述:</span>
            <span class="detail-value description">{{ selectedLog.repairDescription }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">完成时间:</span>
            <span class="detail-value">{{ formatDate(selectedLog.completionTime) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">工时:</span>
            <span class="detail-value">{{ selectedLog.laborHours }} 小时</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">材料费:</span>
            <span class="detail-value">¥{{ selectedLog.materialsCost?.toFixed(2) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">人工费:</span>
            <span class="detail-value">¥{{ selectedLog.laborCost?.toFixed(2) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">总费用:</span>
            <span class="detail-value">¥{{ selectedLog.totalCost?.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useWorkerStore } from '@/stores/worker'
import type { RepairLog } from '@/types'

const workerStore = useWorkerStore()
const loading = computed(() => workerStore.loading)

const startDate = ref('')
const endDate = ref('')
const searchQuery = ref('')
const showDetailDialog = ref(false)
const selectedLog = ref<RepairLog | null>(null)

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

const filteredLogs = computed(() => {
  let filtered = workerStore.repairLogs
  
  // 日期过滤
  if (startDate.value) {
    const start = new Date(startDate.value)
    filtered = filtered.filter((log: RepairLog) => 
      new Date(log.completionTime) >= start
    )
  }
  
  if (endDate.value) {
    const end = new Date(endDate.value)
    end.setHours(23, 59, 59, 999)  // 设置为当天最后一毫秒
    filtered = filtered.filter((log: RepairLog) => 
      new Date(log.completionTime) <= end
    )
  }
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter((log: RepairLog) => 
      log.licensePlate.toLowerCase().includes(query) ||
      log.issue.toLowerCase().includes(query)
    )
  }
  
  // 按完成时间降序排列
  return [...filtered].sort((a: RepairLog, b: RepairLog) => 
    new Date(b.completionTime).getTime() - new Date(a.completionTime).getTime()
  )
})

const viewLogDetails = (log: RepairLog) => {
  selectedLog.value = log
  showDetailDialog.value = true
}

const calculateTotalWorkHours = () => {
  return filteredLogs.value.reduce((sum, log) => sum + (log.laborHours || 0), 0)
}

const calculateTotalMaterialCost = () => {
  return filteredLogs.value.reduce((sum, log) => sum + (log.materialsCost || 0), 0)
}

const calculateTotalLaborCost = () => {
  return filteredLogs.value.reduce((sum, log) => sum + (log.laborCost || 0), 0)
}

const calculateTotalEarnings = () => {
  return filteredLogs.value.reduce((sum, log) => sum + (log.totalCost || 0), 0)
}

onMounted(async () => {
  try {
    await workerStore.fetchRepairLogs()
  } catch (error) {
    console.error('获取维修记录失败:', error)
  }
})
</script>

<style scoped>
.repair-logs {
  padding: 1.5rem;
  background: linear-gradient(to bottom right, #f5f7fa, #c3cfe2);
  min-height: 100vh;
  min-width: 80vw;
}

.filters {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.date-filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-filter input {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.search-box input {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  width: 250px;
}

.loading, .no-logs {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.logs-table-container {
  overflow-x: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
}

.logs-table th,
.logs-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.logs-table th {
  background: #f8f9fa;
  font-weight: bold;
}

.logs-table tbody tr:hover {
  background: #f5f7fa;
}

.view-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

.summary-section {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.summary-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 300px;
}

.summary-card h3 {
  margin-top: 0;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
}

.summary-card p {
  display: flex;
  justify-content: space-between;
  margin: 0.5rem 0;
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
  padding: 0;
  width: 600px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
}

.modal-body {
  padding: 1.5rem;
}

.detail-row {
  margin-bottom: 1rem;
  display: flex;
}

.detail-label {
  font-weight: bold;
  width: 120px;
  color: #555;
}

.detail-value {
  flex: 1;
}

.detail-value.description {
  white-space: pre-line;
}
</style>