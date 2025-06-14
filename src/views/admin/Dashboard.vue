<template>
  <div class="dashboard">
    <h1>管理员仪表板</h1>

    <div class="stats-grid">
      <div class="stat-card">
        <h3>总用户数</h3>
        <p class="stat-number">{{ users.length || 0 }}</p>
      </div>

      <div class="stat-card">
        <h3>总维修人员数</h3>
        <p class="stat-number">{{ workers.length || 0 }}</p>
      </div>

      <div class="stat-card">
        <h3>总维修工单</h3>
        <p class="stat-number">{{ adminStats.totalRepairOrders || 0 }}</p>
      </div>

      <div class="stat-card">
        <h3>已完成工单</h3>
        <p class="stat-number">{{ adminStats.completedRepairOrders || 0 }}</p>
      </div>

      <div class="stat-card">
        <h3>总收入</h3>
        <p class="stat-number">￥{{ (adminStats.totalRevenue || 0).toFixed(2) }}</p>
      </div>

      <div class="stat-card">
        <h3>净收入</h3>
        <p class="stat-number">￥{{ (adminStats.netIncome || 0).toFixed(2) }}</p>
      </div>

      <div class="stat-card">
        <h3>平均客户评分</h3>
        <p class="stat-number">{{ (adminStats.averageCustomerRating || 0).toFixed(1) }}</p>
      </div>

      <div class="stat-card">
        <h3>系统状态</h3>
        <p class="stat-number">{{ systemHealth.status || '未知' }}</p>
      </div>
    </div>

    <div class="cost-breakdown">
      <h2>成本构成分析</h2>
      <div class="cost-grid">
        <div class="cost-item">
          <h4>总成本</h4>
          <p class="cost-amount">￥{{ totalCost.toFixed(2) }}</p>
        </div>
        <div class="cost-item">
          <h4>人工成本</h4>
          <p class="cost-amount">￥{{ (adminStats.totalLaborCost || 0).toFixed(2) }}</p>
          <p class="cost-ratio">{{ laborCostRatio }}%</p>
        </div>
        <div class="cost-item">
          <h4>材料成本</h4>
          <p class="cost-amount">￥{{ (adminStats.totalMaterialCost || 0).toFixed(2) }}</p>
          <p class="cost-ratio">{{ materialCostRatio }}%</p>
        </div>
      </div>
    </div>

    <div class="recent-logs">
      <h2>最近操作日志</h2>
      <div class="log-list">
        <div v-if="recentLogs.length === 0" class="empty-state">
          暂无日志记录
        </div>
        <div v-for="log in recentLogs" :key="log.id" class="log-item">
          <div class="log-info">
            <h4>{{ log.action }}</h4>
            <p>实体类型: {{ log.entityType }}</p>
            <p>用户ID: {{ log.userId }}</p>
          </div>
          <div class="log-meta">
            <span class="log-date">{{ formatDate(log.timestamp) }}</span>
            <span class="log-details">{{ log.details }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAdminStore } from '@/stores/admin'
import type { AdminStatisticsOverview, SystemHealth, User, Worker } from '@/types'

const adminStore = useAdminStore()

const adminStats = ref<AdminStatisticsOverview>({
  totalRevenue: 0,
  totalLaborCost: 0,
  totalMaterialCost: 0,
  netIncome: 0,
  totalRepairOrders: 0,
  completedRepairOrders: 0,
  averageCustomerRating: 0,
})

const recentLogs = ref<Array<{
  id: number;
  action: string;
  entityType: string;
  entityId: number;
  userId: number;
  details: string;
  timestamp: string;
}>>([])

const systemHealth = ref<SystemHealth>({
  status: '正常',
  timestamp: '',
  version: '',
  database: '',
  redis: '',
})

const users = ref<User[]>([])
const workers = ref<Worker[]>([])

// 计算总成本
const totalCost = computed(() => {
  return (adminStats.value.totalLaborCost || 0) + (adminStats.value.totalMaterialCost || 0)
})

// 计算人工成本比例
const laborCostRatio = computed(() => {
  if (totalCost.value === 0) return 0
  return ((adminStats.value.totalLaborCost || 0) / totalCost.value * 100).toFixed(1)
})

// 计算材料成本比例
const materialCostRatio = computed(() => {
  if (totalCost.value === 0) return 0
  return ((adminStats.value.totalMaterialCost || 0) / totalCost.value * 100).toFixed(1)
})

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('zh-CN');
}

onMounted(async () => {
  try {
    // 获取管理员统计信息
    await adminStore.fetchStatisticsOverview()
    if (adminStore.statisticsOverview) {
      adminStats.value = adminStore.statisticsOverview
    }
    
    // 获取用户列表
    await adminStore.fetchUsers()
    users.value = adminStore.users
    
    // 获取维修人员列表
    await adminStore.fetchWorkers()
    workers.value = adminStore.workers
    
    // 获取最近的审计日志
    const logsResponse = await adminStore.getAuditLogs({ page: 1, size: 10 })
    if (logsResponse.success && logsResponse.data && logsResponse.data.content) {
      recentLogs.value = logsResponse.data.content
    }
    
    // 获取系统健康状态
    await adminStore.fetchSystemHealth()
    if (adminStore.systemHealth) {
      systemHealth.value = adminStore.systemHealth
    }
  } catch (error) {
    console.error('加载管理员仪表板数据失败:', error)
  }
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  width: 80vw;
  padding: 1.5rem;
  background: linear-gradient(to bottom right, #f5f7fa, #c3cfe2);
  box-sizing: border-box;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  margin: 0.5rem 0;
}

.cost-breakdown {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.cost-breakdown h2 {
  margin-bottom: 1rem;
  color: #333;
}

.cost-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.cost-item {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  text-align: center;
}

.cost-item h4 {
  margin: 0 0 0.5rem 0;
  color: #666;
}

.cost-amount {
  font-size: 1.5rem;
  font-weight: bold;
  color: #28a745;
  margin: 0.5rem 0;
}

.cost-ratio {
  font-size: 0.9rem;
  color: #6c757d;
  margin: 0;
}

.recent-logs {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.log-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.log-item:last-child {
  border-bottom: none;
}

.log-info h4 {
  margin: 0 0 0.5rem 0;
}

.log-info p {
  margin: 0.25rem 0;
  color: #666;
  font-size: 0.9rem;
}

.log-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.log-date {
  font-size: 0.8rem;
  color: #888;
}

.log-details {
  font-size: 0.9rem;
  color: #444;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #888;
  font-style: italic;
}
</style>