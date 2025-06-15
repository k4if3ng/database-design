<template>
  <div class="workers-page">
    <div class="page-header">
      <h1>维修人员管理</h1>
      <div class="stats-summary">
        <div class="stat-item">
          <span class="stat-label">总人数:</span>
          <span class="stat-value">{{ workers.length }}</span>
        </div>
      </div>
    </div>

    <div class="filters">
      <div class="filter-group">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索维修人员..."
          class="search-input"
        />
        <select v-model="specialtyFilter" class="filter-select">
          <option value="">所有专业</option>
          <option v-for="specialty in specialties" :key="specialty" :value="specialty">
            {{ specialty }}
          </option>
        </select>
      </div>
    </div>

    <div class="workers-table">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="workers.length === 0" class="empty-state">暂无维修人员数据</div>
      <table v-else>
        <thead>
          <tr>
            <th>ID</th>
            <th>姓名</th>
            <th>专业</th>
            <th>时薪</th>
            <th>基础工资</th>
            <th>总收入</th>
            <th>当前工单</th>
            <th>完成工单</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="worker in filteredWorkers" :key="worker.workerId">
            <td>{{ worker.workerId }}</td>
            <td>{{ worker.workerName || '未知' }}</td>
            <td>{{ worker.specialty || '未知' }}</td>
            <td>￥{{ formatNumber(worker.hourlyWage) }}</td>
            <td>￥{{ formatNumber(worker.baseSalary) }}</td>
            <td>￥{{ formatNumber(worker.totalEarnings) }}</td>
            <td>{{ worker.currentOrders || 0 }}</td>
            <td>{{ worker.completedOrders || 0 }}</td>
            <td>
              <button @click="viewWorkerDetails(worker)" class="btn-view">查看详情</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 维修人员详情模态框 -->
    <div v-if="showWorkerModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>维修人员详情</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="worker-details">
            <div class="detail-section">
              <h4>基本信息</h4>
              <p><strong>ID:</strong> {{ selectedWorker?.workerId }}</p>
              <p><strong>姓名:</strong> {{ selectedWorker?.workerName || '未知' }}</p>
              <p><strong>专业:</strong> {{ selectedWorker?.specialty || '未知' }}</p>
            </div>
            <div class="detail-section">
              <h4>薪资信息</h4>
              <p><strong>时薪:</strong> ￥{{ formatNumber(selectedWorker?.hourlyWage) }}</p>
              <p><strong>基础工资:</strong> ￥{{ formatNumber(selectedWorker?.baseSalary) }}</p>
              <p><strong>总收入:</strong> ￥{{ formatNumber(selectedWorker?.totalEarnings) }}</p>
            </div>
            <div class="detail-section">
              <h4>工作统计</h4>
              <p><strong>当前工单:</strong> {{ selectedWorker?.currentOrders || 0 }}</p>
              <p><strong>完成工单:</strong> {{ selectedWorker?.completedOrders || 0 }}</p>
              <p><strong>完成率:</strong> {{ getCompletionRate(selectedWorker) }}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import type { Worker } from '@/types'

const adminStore = useAdminStore()
const workers = computed(() => adminStore.workers)
const loading = computed(() => adminStore.loading)
const error = computed(() => adminStore.error)

const searchQuery = ref('')
const specialtyFilter = ref('')
const showWorkerModal = ref(false)
const selectedWorker = ref<Worker | null>(null)

const specialties = computed(() => {
  const uniqueSpecialties = new Set(
    workers.value
      .map(w => w.specialty)
      .filter(specialty => specialty) // 过滤掉空值
  )
  return Array.from(uniqueSpecialties)
})

const filteredWorkers = computed(() => {
  let filtered = workers.value
  
  if (searchQuery.value) {
    filtered = filtered.filter(worker =>
      (worker.workerName?.toLowerCase() || '').includes(searchQuery.value.toLowerCase()) ||
      (worker.specialty?.toLowerCase() || '').includes(searchQuery.value.toLowerCase())
    )
  }
  
  if (specialtyFilter.value) {
    filtered = filtered.filter(worker => worker.specialty === specialtyFilter.value)
  }
  
  return filtered
})

// 格式化数字，处理 undefined/null 值
const formatNumber = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '0.00'
  }
  return value.toFixed(2)
}

const viewWorkerDetails = (worker: Worker) => {
  selectedWorker.value = worker
  showWorkerModal.value = true
}

const closeModal = () => {
  showWorkerModal.value = false
  selectedWorker.value = null
}

const getCompletionRate = (worker: Worker | null) => {
  if (!worker) return '0.0'
  const current = worker.currentOrders || 0
  const completed = worker.completedOrders || 0
  const total = current + completed
  if (total === 0) return '0.0'
  return ((completed / total) * 100).toFixed(1)
}

onMounted(async () => {
  console.log('Workers.vue 组件挂载，开始获取数据...')
  try {
    await adminStore.fetchWorkers()
    console.log('Workers 数据获取完成:', adminStore.workers)
  } catch (error) {
    console.error('Workers 数据获取失败:', error)
  }
})
</script>

<style scoped>
.workers-page {
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

.stats-summary {
  display: flex;
  gap: 2rem;
}

.stat-item {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-label {
  color: #666;
  margin-right: 0.5rem;
}

.stat-value {
  font-weight: bold;
  color: #007bff;
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

.search-input {
  width: 250px;
}

.filter-select {
  width: 150px;
}

.workers-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
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

.btn-view {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

.btn-view:hover {
  background: #0056b3;
}

.loading, .error, .empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error {
  color: #dc3545;
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

.worker-details {
  display: grid;
  gap: 1.5rem;
}

.detail-section h4 {
  margin: 0 0 1rem 0;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
}

.detail-section p {
  margin: 0.5rem 0;
}

.debug-info details {
  margin-top: 0.5rem;
}

.debug-info pre {
  background: #f8f9fa;
  padding: 0.5rem;
  border-radius: 4px;
  overflow-x: auto;
  max-height: 200px;
}
</style>