<template>
  <div class="audit-log-page">
    <div class="page-header">
      <h1>审计日志</h1>
      <div class="header-actions">
        <button @click="exportLogs" class="btn-export" :disabled="loading">
          导出日志
        </button>
        <button @click="refreshLogs" class="btn-refresh" :disabled="loading">
          刷新
        </button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filters-section">
      <div class="filters-row">
        <div class="filter-group">
          <label>操作类型:</label>
          <select v-model="filters.action" @change="applyFilters">
            <option value="">所有操作</option>
            <option value="CREATE">创建</option>
            <option value="UPDATE">更新</option>
            <option value="DELETE">删除</option>
            <option value="LOGIN">登录</option>
            <option value="LOGOUT">登出</option>
            <option value="ASSIGN">分配</option>
            <option value="COMPLETE">完成</option>
          </select>
        </div>

        <div class="filter-group">
          <label>实体类型:</label>
          <select v-model="filters.entityType" @change="applyFilters">
            <option value="">所有类型</option>
            <option value="USER">用户</option>
            <option value="WORKER">维修工</option>
            <option value="REPAIR_ORDER">维修工单</option>
            <option value="REPAIR_LOG">维修记录</option>
            <option value="VEHICLE">车辆</option>
            <option value="MATERIAL">材料</option>
          </select>
        </div>

        <div class="filter-group">
          <label>用户ID:</label>
          <input 
            type="number"
            v-model="filters.userId" 
            @change="applyFilters"
            placeholder="输入用户ID"
          >
        </div>
      </div>

      <div class="filters-row">
        <div class="filter-group">
          <label>开始日期:</label>
          <input 
            type="datetime-local" 
            v-model="filters.startDate" 
            @change="applyFilters"
          >
        </div>

        <div class="filter-group">
          <label>结束日期:</label>
          <input 
            type="datetime-local" 
            v-model="filters.endDate" 
            @change="applyFilters"
          >
        </div>

        <div class="filter-group">
          <label>关键词:</label>
          <input 
            type="text" 
            v-model="searchKeyword" 
            @input="debounceSearch"
            placeholder="搜索日志内容..."
          >
        </div>
      </div>

      <div class="filter-actions">
        <button @click="clearFilters" class="btn-clear">清除筛选</button>
        <button @click="applyFilters" class="btn-apply">应用筛选</button>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-section">
      <div class="stat-card">
        <h4>总日志数</h4>
        <p class="stat-number">{{ auditLogs?.totalElements || 0 }}</p>
      </div>
      <div class="stat-card">
        <h4>当前页</h4>
        <p class="stat-number">{{ currentPage }} / {{ totalPages }}</p>
      </div>
      <div class="stat-card">
        <h4>操作类型</h4>
        <p class="stat-number">{{ getUniqueActions().length }}</p>
      </div>
      <div class="stat-card">
        <h4>活跃用户</h4>
        <p class="stat-number">{{ getUniqueUsers().length }}</p>
      </div>
    </div>

    <!-- 日志列表 -->
    <div class="logs-section">
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>加载日志中...</p>
      </div>
      
      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
        <button @click="refreshLogs" class="btn-retry">重试</button>
      </div>

      <div v-else-if="auditLogs?.content?.length" class="logs-table">
        <table>
          <thead>
            <tr>
              <th>时间</th>
              <th>操作</th>
              <th>实体类型</th>
              <th>实体ID</th>
              <th>用户ID</th>
              <th>详情</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in auditLogs.content" :key="log.id" :class="getLogRowClass(log)">
              <td>
                <div class="timestamp">
                  <div class="date">{{ formatDate(log.timestamp) }}</div>
                  <div class="time">{{ formatTime(log.timestamp) }}</div>
                </div>
              </td>
              <td>
                <span :class="['action-badge', getActionClass(log.action)]">
                  {{ getActionText(log.action) }}
                </span>
              </td>
              <td>
                <span class="entity-type">{{ getEntityTypeText(log.entityType) }}</span>
              </td>
              <td>
                <span class="entity-id">{{ log.entityId }}</span>
              </td>
              <td>
                <span class="user-id">{{ log.userId }}</span>
              </td>
              <td>
                <div class="details">
                  <div class="details-preview">
                    {{ truncateText(log.details, 50) }}
                  </div>
                  <button 
                    v-if="log.details.length > 50"
                    @click="showLogDetails(log)" 
                    class="btn-details"
                  >
                    查看详情
                  </button>
                </div>
              </td>
              <td>
                <div class="action-buttons">
                  <button @click="showLogDetails(log)" class="btn-view">查看</button>
                  <button 
                    v-if="canGetBlockchainProof(log)"
                    @click="getBlockchainProof(log)" 
                    class="btn-blockchain"
                  >
                    区块链证明
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">📋</div>
        <h3>暂无日志记录</h3>
        <p>当前筛选条件下没有找到相关日志</p>
        <button @click="clearFilters" class="btn-clear-all">清除所有筛选</button>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="auditLogs?.content?.length" class="pagination">
      <button 
        @click="goToPage(1)" 
        :disabled="currentPage === 1"
        class="btn-page"
      >
        首页
      </button>
      <button 
        @click="goToPage(currentPage - 1)" 
        :disabled="currentPage === 1"
        class="btn-page"
      >
        上一页
      </button>
      
      <div class="page-numbers">
        <button
          v-for="page in getVisiblePages()"
          :key="page"
          @click="goToPage(page)"
          :class="['btn-page', { active: page === currentPage }]"
        >
          {{ page }}
        </button>
      </div>

      <button 
        @click="goToPage(currentPage + 1)" 
        :disabled="currentPage === totalPages"
        class="btn-page"
      >
        下一页
      </button>
      <button 
        @click="goToPage(totalPages)" 
        :disabled="currentPage === totalPages"
        class="btn-page"
      >
        末页
      </button>

      <div class="page-size-selector">
        <label>每页显示:</label>
        <select v-model="pageSize" @change="changePageSize">
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>
    </div>

    <!-- 日志详情模态框 -->
    <div v-if="showDetailsModal" class="modal-overlay" @click="closeDetailsModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>日志详情</h3>
          <button @click="closeDetailsModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="log-details">
            <div class="detail-row">
              <span class="label">日志ID:</span>
              <span class="value">{{ selectedLog?.id }}</span>
            </div>
            <div class="detail-row">
              <span class="label">时间:</span>
              <span class="value">{{ formatFullTimestamp(selectedLog?.timestamp) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">操作:</span>
              <span class="value">{{ getActionText(selectedLog?.action) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">实体类型:</span>
              <span class="value">{{ getEntityTypeText(selectedLog?.entityType) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">实体ID:</span>
              <span class="value">{{ selectedLog?.entityId }}</span>
            </div>
            <div class="detail-row">
              <span class="label">用户ID:</span>
              <span class="value">{{ selectedLog?.userId }}</span>
            </div>
            <div class="detail-row full-width">
              <span class="label">详细信息:</span>
              <div class="details-content">
                <pre>{{ selectedLog?.details }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 区块链证明模态框 -->
    <div v-if="showBlockchainModal" class="modal-overlay" @click="closeBlockchainModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>区块链证明</h3>
          <button @click="closeBlockchainModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="loadingBlockchain" class="loading">加载区块链证明中...</div>
          <div v-else-if="blockchainProof" class="blockchain-proof">
            <div class="proof-row">
              <span class="label">工单ID:</span>
              <span class="value">{{ blockchainProof.orderId }}</span>
            </div>
            <div class="proof-row">
              <span class="label">区块哈希:</span>
              <span class="value hash">{{ blockchainProof.blockHash }}</span>
            </div>
            <div class="proof-row">
              <span class="label">交易哈希:</span>
              <span class="value hash">{{ blockchainProof.transactionHash }}</span>
            </div>
            <div class="proof-row">
              <span class="label">时间戳:</span>
              <span class="value">{{ formatFullTimestamp(blockchainProof.timestamp) }}</span>
            </div>
            <div class="proof-row">
              <span class="label">验证状态:</span>
              <span :class="['value', 'verify-status', blockchainProof.verified ? 'verified' : 'unverified']">
                {{ blockchainProof.verified ? '已验证' : '未验证' }}
              </span>
            </div>
            <div class="proof-data">
              <h4>证明数据:</h4>
              <div class="data-item">
                <span class="label">工单状态:</span>
                <span class="value">{{ blockchainProof.proofData.orderStatus }}</span>
              </div>
              <div class="data-item">
                <span class="label">完成时间:</span>
                <span class="value">{{ formatFullTimestamp(blockchainProof.proofData.completionTime) }}</span>
              </div>
              <div class="data-item">
                <span class="label">总费用:</span>
                <span class="value">￥{{ blockchainProof.proofData.totalCost.toFixed(2) }}</span>
              </div>
              <div class="data-item">
                <span class="label">维修工ID:</span>
                <span class="value">{{ blockchainProof.proofData.workerId }}</span>
              </div>
            </div>
          </div>
          <div v-else class="error">获取区块链证明失败</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import type { AuditLog, BlockchainProof } from '@/types'

const adminStore = useAdminStore()

// 状态管理
const loading = ref(false)
const error = ref<string | null>(null)
const auditLogs = ref<AuditLog | null>(null)
const selectedLog = ref<any>(null)
const blockchainProof = ref<BlockchainProof | null>(null)
const loadingBlockchain = ref(false)

// 模态框状态
const showDetailsModal = ref(false)
const showBlockchainModal = ref(false)

// 分页状态
const currentPage = ref(1)
const pageSize = ref(20)
const totalPages = computed(() => auditLogs.value?.totalPages || 0)

// 筛选状态
const filters = ref({
  action: '',
  entityType: '',
  userId: '',
  startDate: '',
  endDate: ''
})

const searchKeyword = ref('')
let searchTimeout: ReturnType<typeof setTimeout>

// 计算属性
const getUniqueActions = () => {
  if (!auditLogs.value?.content) return []
  const actions = new Set(auditLogs.value.content.map(log => log.action))
  return Array.from(actions)
}

const getUniqueUsers = () => {
  if (!auditLogs.value?.content) return []
  const users = new Set(auditLogs.value.content.map(log => log.userId))
  return Array.from(users)
}

// 方法
const formatDate = (timestamp: string) => {
  return new Date(timestamp).toLocaleDateString('zh-CN')
}

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN')
}

const formatFullTimestamp = (timestamp?: string) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleString('zh-CN')
}

const getActionText = (action?: string) => {
  if (!action) return ''
  const actionMap: Record<string, string> = {
    'CREATE': '创建',
    'UPDATE': '更新',
    'DELETE': '删除',
    'LOGIN': '登录',
    'LOGOUT': '登出',
    'ASSIGN': '分配',
    'COMPLETE': '完成'
  }
  return actionMap[action] || action
}

const getEntityTypeText = (entityType?: string) => {
  if (!entityType) return ''
  const typeMap: Record<string, string> = {
    'USER': '用户',
    'WORKER': '维修工',
    'REPAIR_ORDER': '维修工单',
    'REPAIR_LOG': '维修记录',
    'VEHICLE': '车辆',
    'MATERIAL': '材料'
  }
  return typeMap[entityType] || entityType
}

const getActionClass = (action: string) => {
  const classMap: Record<string, string> = {
    'CREATE': 'create',
    'UPDATE': 'update',
    'DELETE': 'delete',
    'LOGIN': 'login',
    'LOGOUT': 'logout',
    'ASSIGN': 'assign',
    'COMPLETE': 'complete'
  }
  return classMap[action] || 'default'
}

const getLogRowClass = (log: any) => {
  const classes = ['log-row']
  if (log.action === 'DELETE') classes.push('danger')
  if (log.action === 'CREATE') classes.push('success')
  if (log.action === 'LOGIN' || log.action === 'LOGOUT') classes.push('info')
  return classes.join(' ')
}

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const canGetBlockchainProof = (log: any) => {
  return log.entityType === 'REPAIR_ORDER' && log.action === 'COMPLETE'
}

const debounceSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    applyFilters()
  }, 500)
}

const fetchLogs = async () => {
  try {
    loading.value = true
    error.value = null
    
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      ...filters.value
    }
    
    const response = await adminStore.getAuditLogs(params)
    if (response.success) {
      auditLogs.value = response.data
    } else {
      error.value = response.message || '获取日志失败'
    }
  } catch (err) {
    error.value = '获取日志失败'
    console.error('获取审计日志失败:', err)
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  currentPage.value = 1
  fetchLogs()
}

const clearFilters = () => {
  filters.value = {
    action: '',
    entityType: '',
    userId: '',
    startDate: '',
    endDate: ''
  }
  searchKeyword.value = ''
  applyFilters()
}

const refreshLogs = () => {
  fetchLogs()
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchLogs()
  }
}

const changePageSize = () => {
  currentPage.value = 1
  fetchLogs()
}

const getVisiblePages = () => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
}

const showLogDetails = (log: any) => {
  selectedLog.value = log
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedLog.value = null
}

const getBlockchainProof = async (log: any) => {
  try {
    loadingBlockchain.value = true
    showBlockchainModal.value = true
    
    const response = await adminStore.getBlockchainProof(log.entityId)
    if (response.success) {
      blockchainProof.value = response.data
    } else {
      error.value = '获取区块链证明失败'
    }
  } catch (err) {
    error.value = '获取区块链证明失败'
    console.error('获取区块链证明失败:', err)
  } finally {
    loadingBlockchain.value = false
  }
}

const closeBlockchainModal = () => {
  showBlockchainModal.value = false
  blockchainProof.value = null
}

const exportLogs = async () => {
  try {
    const params = {
      ...filters.value,
      export: true
    }
    
    console.log('导出日志参数:', params)
    alert('导出功能待实现')
  } catch (err) {
    console.error('导出日志失败:', err)
  }
}

onMounted(() => {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  
  filters.value.endDate = now.toISOString().slice(0, 16)
  filters.value.startDate = sevenDaysAgo.toISOString().slice(0, 16)
  
  fetchLogs()
})
</script>

<style scoped>
.audit-log-page {
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

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn-export, .btn-refresh {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-export:hover, .btn-refresh:hover {
  background: #0056b3;
}

.filters-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.filters-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  color: #333;
}

.filter-group input,
.filter-group select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.filter-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.btn-clear, .btn-apply {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-clear {
  background: #6c757d;
  color: white;
}

.btn-apply {
  background: #28a745;
  color: white;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.stat-card h4 {
  margin: 0 0 0.5rem 0;
  color: #666;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #007bff;
  margin: 0;
}

.logs-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 2rem;
  color: #dc3545;
}

.btn-retry {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
}

.logs-table {
  overflow-x: auto;
}

.logs-table table {
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
  font-weight: 600;
  color: #333;
  position: sticky;
  top: 0;
}

.log-row.danger { 
  background-color: #fff5f5; 
}

.log-row.success { 
  background-color: #f0fff4; 
}

.log-row.info { 
  background-color: #f0f8ff; 
}

.timestamp {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.timestamp .date {
  font-weight: 500;
}

.timestamp .time {
  font-size: 0.8rem;
  color: #666;
}

.action-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.action-badge.create { 
  background: #d4edda; 
  color: #155724; 
}

.action-badge.update { 
  background: #d1ecf1; 
  color: #0c5460; 
}

.action-badge.delete { 
  background: #f8d7da; 
  color: #721c24; 
}

.action-badge.login { 
  background: #cce5ff; 
  color: #004085; 
}

.action-badge.logout { 
  background: #e2e3e5; 
  color: #383d41; 
}

.action-badge.assign { 
  background: #fff3cd; 
  color: #856404; 
}

.action-badge.complete { 
  background: #d4edda; 
  color: #155724; 
}

.action-badge.default { 
  background: #f8f9fa; 
  color: #495057; 
}

.entity-type, .entity-id, .user-id {
  font-family: monospace;
  font-size: 0.9rem;
}

.details {
  max-width: 300px;
}

.details-preview {
  word-break: break-word;
  margin-bottom: 0.5rem;
}

.btn-details, .btn-view, .btn-blockchain {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  margin-right: 0.5rem;
}

.btn-blockchain {
  background: #6f42c1;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.btn-clear-all {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.btn-page {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  background: white;
  color: #333;
  border-radius: 4px;
  cursor: pointer;
}

.btn-page:hover {
  background: #f8f9fa;
}

.btn-page.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.btn-page:disabled {
  background: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-size-selector select {
  padding: 0.25rem;
  border: 1px solid #ddd;
  border-radius: 4px;
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
  max-width: 800px;
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

.log-details {
  display: grid;
  gap: 1rem;
}

.detail-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 1rem;
  align-items: start;
}

.detail-row.full-width {
  grid-template-columns: 1fr;
}

.detail-row .label {
  font-weight: 500;
  color: #666;
}

.detail-row .value {
  word-break: break-word;
}

.details-content {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #eee;
}

.details-content pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.blockchain-proof {
  display: grid;
  gap: 1rem;
}

.proof-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 1rem;
  align-items: center;
}

.proof-row .label {
  font-weight: 500;
  color: #666;
}

.proof-row .value.hash {
  font-family: monospace;
  font-size: 0.9rem;
  word-break: break-all;
}

.verify-status.verified {
  color: #28a745;
  font-weight: bold;
}

.verify-status.unverified {
  color: #dc3545;
  font-weight: bold;
}

.proof-data {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #eee;
}

.proof-data h4 {
  margin: 0 0 1rem 0;
  color: #333;
}

.data-item {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.data-item .label {
  font-weight: 500;
  color: #666;
}
</style>