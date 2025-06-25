<template>
  <div class="statistics-page">
    <div class="page-header">
      <h1>统计分析</h1>
      <div class="header-actions">
        <button @click="refreshData" class="btn-refresh" :disabled="loading">
          <span v-if="loading">刷新中...</span>
          <span v-else>刷新数据</span>
        </button>
      </div>
    </div>

    <!-- 概览统计 -->
    <div class="overview-section">
      <h2>业务概览</h2>
      <div class="overview-cards">
        <div class="overview-card revenue">
          <div class="card-content">
            <h3>总收入</h3>
            <p class="amount">￥{{ (statisticsOverview?.totalRevenue || 0).toFixed(2) }}</p>
          </div>
          <div class="card-icon">💰</div>
        </div>
        <div class="overview-card orders">
          <div class="card-content">
            <h3>工单统计</h3>
            <p class="amount">{{ statisticsOverview?.totalRepairOrders || 0 }}</p>
            <small>完成率: {{ completionRate }}%</small>
          </div>
          <div class="card-icon">📋</div>
        </div>
        <!-- <div class="overview-card rating">
          <div class="card-content">
            <h3>客户满意度</h3>
            <p class="amount">{{ (statisticsOverview?.averageCustomerRating || 0).toFixed(1) }}</p>
            <small>平均评分</small>
          </div>
          <div class="card-icon">⭐</div>
        </div> -->
        <div class="overview-card profit">
          <div class="card-content">
            <h3>净收益</h3>
            <p class="amount">￥{{ (statisticsOverview?.netIncome || 0).toFixed(2) }}</p>
          </div>
          <div class="card-icon">📈</div>
        </div>
      </div>
    </div>

    <!-- 成本分析 -->
    <div class="cost-analysis-section">
      <h2>成本分析</h2>
      <div class="analysis-controls">
        <select v-model="costAnalysisParams.period" @change="fetchCostAnalysis">
          <option value="month">按月</option>
          <!-- <option value="quarter">按季度</option> -->
          <option value="year">按年</option>
        </select>
        <input 
          type="number" 
          v-model="costAnalysisParams.year" 
          @change="fetchCostAnalysis"
          min="2020" 
          max="2030"
          placeholder="年份"
        >
        <input 
          v-if="costAnalysisParams.period === 'month'"
          type="number" 
          v-model="costAnalysisParams.month" 
          @change="fetchCostAnalysis"
          min="1" 
          max="12"
          placeholder="月份"
        >
      </div>
      <div class="cost-cards">
        <div class="cost-card">
          <h4>总成本</h4>
          <p class="cost-amount">￥{{ (costAnalysis?.totalCost || 0).toFixed(2) }}</p>
        </div>
        <div class="cost-card">
          <h4>人工成本</h4>
          <p class="cost-amount">￥{{ (costAnalysis?.laborCost || 0).toFixed(2) }}</p>
          <p class="cost-ratio">{{ (costAnalysis?.laborCostPercentage || 0).toFixed(1) }}%</p>
        </div>
        <div class="cost-card">
          <h4>材料成本</h4>
          <p class="cost-amount">￥{{ (costAnalysis?.materialCost || 0).toFixed(2) }}</p>
          <p class="cost-ratio">{{ (costAnalysis?.materialCostPercentage || 0).toFixed(1) }}%</p>
        </div>
        <div class="cost-card">
          <h4>平均成本</h4>
          <p class="cost-amount">￥{{ (costAnalysis?.averageCostPerOrder|| 0).toFixed(2) }}</p>
        </div>
      </div>
    </div>

    <!-- 车型维修统计 -->
    <div class="vehicle-stats-section">
      <h2>车型维修统计</h2>
      <div class="vehicle-stats-summary" v-if="vehicleTypeStats">
        <div class="summary-info">
          <div class="summary-card">
            <h4>总维修次数</h4>
            <p class="big-number">{{ vehicleTypeStats.summary.totalRepairs }}</p>
          </div>
          <div class="summary-card">
            <h4>车型种类</h4>
            <p class="big-number">{{ vehicleTypeStats.summary.totalVehicleTypes }}</p>
          </div>
          <div class="summary-card">
            <h4>统计时间范围</h4>
            <p class="date-range">{{ vehicleTypeStats.summary.dateRange }}</p>
          </div>
        </div>
      </div>
      
      <div class="vehicle-stats-table">
        <div v-if="loadingVehicleStats" class="loading">加载中...</div>
        <table v-else-if="vehicleTypeStats?.vehicleTypeStats?.length">
          <thead>
            <tr>
              <th>车型</th>
              <th>维修次数</th>
              <th>占比</th>
              <th>平均费用</th>
              <th>维修频率</th>
              <th>常见问题</th>
              <th>趋势</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="stat in vehicleTypeStats.vehicleTypeStats" :key="stat.vehicleType">
              <td>{{ stat.vehicleType }}</td>
              <td>{{ stat.repairCount }}</td>
              <td>
                <span class="percentage">{{ stat.percentage.toFixed(1) }}%</span>
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: `${stat.percentage}%` }"
                  ></div>
                </div>
              </td>
              <td>￥{{ stat.averageCost.toFixed(2) }}</td>
              <td>
                <span class="frequency-badge" :class="getFrequencyClass(stat.repairFrequency)">
                  {{ stat.repairFrequency }}
                </span>
              </td>
              <td>
                <div class="common-issues">
                  <span 
                    v-for="issue in stat.commonIssues.slice(0, 3)" 
                    :key="issue.issueType"
                    class="issue-tag"
                    :title="`${issue.count}次 (${issue.percentage.toFixed(1)}%)`"
                  >
                    {{ issue.issueType }}
                  </span>
                  <span v-if="stat.commonIssues.length > 3" class="more-issues">
                    +{{ stat.commonIssues.length - 3 }}
                  </span>
                </div>
              </td>
              <td>
                <div class="trend-chart">
                  <div 
                    v-for="(trendItem, index) in stat.trend.slice(-6)" 
                    :key="index"
                    class="trend-bar"
                    :style="{ 
                      height: `${getTrendBarHeight(trendItem, stat.trend)}%`,
                      backgroundColor: getTrendBarColor(trendItem, stat.trend, index)
                    }"
                    :title="`${trendItem.month}: ${trendItem.count}次`"
                  ></div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state">暂无车型统计数据</div>
      </div>

      <!-- 详细问题分析 -->
      <div v-if="selectedVehicleType" class="vehicle-detail-analysis">
        <h3>{{ selectedVehicleType.vehicleType }} 详细分析</h3>
        <div class="detail-tabs">
          <button 
            :class="['tab-btn', { active: activeTab === 'issues' }]"
            @click="activeTab = 'issues'"
          >
            常见问题分析
          </button>
          <button 
            :class="['tab-btn', { active: activeTab === 'trend' }]"
            @click="activeTab = 'trend'"
          >
            维修趋势
          </button>
        </div>
        
        <div v-if="activeTab === 'issues'" class="issues-analysis">
          <div class="issues-chart">
            <div 
              v-for="issue in selectedVehicleType.commonIssues" 
              :key="issue.issueType"
              class="issue-bar"
            >
              <div class="issue-label">{{ issue.issueType }}</div>
              <div class="issue-progress">
                <div 
                  class="issue-progress-fill"
                  :style="{ width: `${issue.percentage}%` }"
                ></div>
                <span class="issue-stats">{{ issue.count }}次 ({{ issue.percentage.toFixed(1) }}%)</span>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="activeTab === 'trend'" class="trend-analysis">
          <div class="trend-chart-large">
            <div 
              v-for="(trendItem, index) in selectedVehicleType.trend" 
              :key="index"
              class="trend-bar-large"
              :style="{ 
                height: `${getTrendBarHeight(trendItem, selectedVehicleType.trend)}%`
              }"
            >
              <div class="trend-value">{{ trendItem.count }}</div>
              <div class="trend-month">{{ trendItem.month }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 工种工作量统计 -->
    <div class="specialty-workload-section">
      <h2>工种工作量统计</h2>
      <div class="workload-controls">
        <input 
          type="date" 
          v-model="workloadParams.startDate" 
          @change="fetchSpecialtyWorkload"
        >
        <input 
          type="date" 
          v-model="workloadParams.endDate" 
          @change="fetchSpecialtyWorkload"
        >
      </div>
      <div v-if="specialtyWorkloadStats">
        <div class="workload-summary">
          <span>统计区间：{{ specialtyWorkloadStats.dateRange }}</span>
          <span>总工单数：{{ specialtyWorkloadStats.totalOrders }}</span>
        </div>
        <div class="workload-cards">
          <div 
            v-for="workload in specialtyWorkloadStats.specialtyStats" 
            :key="workload.specialty"
            class="workload-card"
          >
            <h4>{{ workload.specialty }}</h4>
            <div class="workload-stats">
              <div class="stat-item">
                <span class="label">人员数量:</span>
                <span class="value">{{ workload.workers }}</span>
              </div>
              <div class="stat-item">
                <span class="label">分配工单:</span>
                <span class="value">{{ workload.assignedCount }}</span>
              </div>
              <div class="stat-item">
                <span class="label">完成工单:</span>
                <span class="value">{{ workload.completedCount }}</span>
              </div>
              <div class="stat-item">
                <span class="label">分配率:</span>
                <span class="value">{{ workload.assignedPercentage.toFixed(1) }}%</span>
              </div>
              <div class="stat-item">
                <span class="label">完成率:</span>
                <span class="value">{{ workload.completedPercentage.toFixed(1) }}%</span>
              </div>
              <div class="stat-item">
                <span class="label">平均完成时间:</span>
                <span class="value">{{ workload.averageCompletionTime }}</span>
              </div>
              <div class="stat-item">
                <span class="label">平均成本:</span>
                <span class="value">￥{{ workload.averageCost.toFixed(2) }}</span>
              </div>
              <div class="stat-item">
                <span class="label">人均工单:</span>
                <span class="value">{{ workload.orderPerWorker }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-if="specialtyWorkloadStats.recommendations?.recruiting?.length" class="workload-recommendations">
          <h4>招聘建议</h4>
          <ul>
            <li v-for="rec in specialtyWorkloadStats.recommendations.recruiting" :key="rec.specialty">
              {{ rec.specialty }}：建议招聘 {{ rec.recommendedHires }} 人，原因：{{ rec.reason }}
            </li>
          </ul>
        </div>
      </div>
      <div v-else class="empty-state">暂无工种工作量数据</div>
    </div>

    <!-- 负面反馈统计 -->
<div class="negative-feedback-section">
      <h2>负面反馈统计</h2>
      <div class="feedback-controls">
        <select v-model="feedbackParams.rating" @change="fetchNegativeFeedback">
          <option value="">所有评分</option>
          <option value="1">1星</option>
          <option value="2">2星</option>
          <option value="3">3星</option>
        </select>
        <input 
          type="date" 
          v-model="feedbackParams.startDate" 
          @change="fetchNegativeFeedback"
        >
        <input 
          type="date" 
          v-model="feedbackParams.endDate" 
          @change="fetchNegativeFeedback"
        >
      </div>
      <div class="feedback-summary">
        <div class="summary-card">
          <h4>负面反馈总数</h4>
          <p class="big-number">{{ negativeFeedback?.total || 0 }}</p>
          <div v-if="negativeFeedback">
            <span>平均严重程度: {{ negativeFeedback.averageSeverity?.toFixed(1) }}</span>
          </div>
        </div>
        <div class="worker-feedback-stats">
          <h4>维修工负面反馈统计</h4>
          <div class="worker-stats-table">
            <table v-if="negativeFeedback?.workerStats.length">
              <thead>
                <tr>
                  <th>维修工</th>
                  <th>负面反馈数</th>
                  <th>平均严重程度</th>
                  <th>负面比例</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="stat in negativeFeedback.workerStats" :key="stat.workerId">
                  <td>{{ stat.workerName }}</td>
                  <td>{{ stat.negativeCount }}</td>
                  <td>{{ stat.averageSeverity.toFixed(1) }}</td>
                  <td>
                    <span :class="['ratio', getRatioClass(stat.percentage / 100)]">
                      {{ stat.percentage.toFixed(1) }}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-else class="empty-state">暂无负面反馈统计</div>
          </div>
        </div>
      </div>
      <div v-if="negativeFeedback?.feedbacks?.length">
        <h4>负面反馈详情</h4>
        <table class="breakdown-table">
          <thead>
            <tr>
              <th>工单号</th>
              <th>反馈ID</th>
              <th>反馈日期</th>
              <th>严重程度</th>
              <th>维修工</th>
              <th>工种</th>
              <th>车型</th>
              <th>内容</th>
              <th>处理状态</th>
              <th>处理动作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="fb in negativeFeedback.feedbacks" :key="fb.feedbackId">
              <td>{{ fb.orderId }}</td>
              <td>{{ fb.feedbackId }}</td>
              <td>{{ fb.feedbackDate }}</td>
              <td>{{ fb.severity }}</td>
              <td>{{ fb.worker?.name }}</td>
              <td>{{ fb.worker?.specialty }}</td>
              <td>{{ fb.vehicle?.type }}</td>
              <td>{{ fb.comment }}</td>
              <td>{{ fb.resolution?.status }}</td>
              <td>{{ fb.resolution?.actionTaken }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="negativeFeedback?.categories?.length">
        <h4>反馈分类统计</h4>
        <table class="breakdown-table">
          <thead>
            <tr>
              <th>分类</th>
              <th>数量</th>
              <th>占比</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cat in negativeFeedback.categories" :key="cat.category">
              <td>{{ cat.category }}</td>
              <td>{{ cat.count }}</td>
              <td>{{ cat.percentage.toFixed(1) }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 待处理任务统计 -->
    <div class="pending-tasks-section">
      <h2>待分配任务统计</h2>
      <div class="pending-summary">
        <div class="summary-card">
          <h4>总待分配任务</h4>
          <p class="big-number">{{ pendingTasks?.totalPendingTasks || 0 }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import type { 
  AdminStatisticsOverview, 
  VehicleTypeStats, 
  CostAnalysis, 
  SpecialtyWorkloadStats, 
  NegativeFeedback, 
  PendingTasks 
} from '@/types'

const adminStore = useAdminStore()
const loading = ref(false)
const loadingVehicleStats = ref(false)

// 统计数据
const statisticsOverview = ref<AdminStatisticsOverview | null>(null)
const costAnalysis = ref<CostAnalysis | null>(null)
// const specialtyWorkload = ref<SpecialtyWorkload[]>([]) // 删除旧变量
const specialtyWorkloadStats = ref<SpecialtyWorkloadStats | null>(null)
const negativeFeedback = ref<NegativeFeedback | null>(null)
const pendingTasks = ref<PendingTasks | null>(null)
const vehicleTypeStats = ref<VehicleTypeStats | null>(null)
const selectedVehicleType = ref<any>(null)
const activeTab = ref('issues')

// 查询参数
const costAnalysisParams = ref({
  period: 'month',
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1
})

const workloadParams = ref({
  startDate: '',
  endDate: ''
})

const feedbackParams = ref({
  rating: '',
  startDate: '',
  endDate: ''
})

// 计算属性
const completionRate = computed(() => {
  if (!statisticsOverview.value || statisticsOverview.value.totalRepairOrders === 0) return 0
  return ((statisticsOverview.value.completedRepairOrders / statisticsOverview.value.totalRepairOrders) * 100).toFixed(1)
})

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'PENDING': '待分配',
    'ASSIGNED': '已分配',
    'IN_PROGRESS': '进行中',
    'COMPLETED': '已完成'
  }
  return statusMap[status] || status
}

const getRatioClass = (ratio: number) => {
  if (ratio > 0.3) return 'high'
  if (ratio > 0.1) return 'medium'
  return 'low'
}

const fetchStatisticsOverview = async () => {
  try {
    await adminStore.fetchStatisticsOverview()
    statisticsOverview.value = adminStore.statisticsOverview
  } catch (error) {
    console.error('获取统计概览失败:', error)
  }
}

const getFrequencyClass = (frequency: string) => {
  const frequencyMap: Record<string, string> = {
    '高': 'high',
    '中': 'medium', 
    '低': 'low',
    'High': 'high',
    'Medium': 'medium',
    'Low': 'low'
  }
  return frequencyMap[frequency] || 'medium'
}

const getTrendBarHeight = (item: any, trend: any[]) => {
  const maxCount = Math.max(...trend.map(t => t.count))
  return maxCount > 0 ? (item.count / maxCount) * 100 : 0
}

const getTrendBarColor = (item: any, trend: any[], index: number) => {
  if (index === 0) return '#6c757d'
  const prevCount = trend[trend.indexOf(item) - 1]?.count || 0
  if (item.count > prevCount) return '#28a745'
  if (item.count < prevCount) return '#dc3545'
  return '#ffc107'
}

const selectVehicleType = (vehicleType: any) => {
  selectedVehicleType.value = vehicleType
  activeTab.value = 'issues'
}

const fetchVehicleStats = async () => {
  try {
    loadingVehicleStats.value = true
    const response = await adminStore.fetchVehicleRepairStats()
    vehicleTypeStats.value = response
  } catch (error) {
    console.error('获取车型统计失败:', error)
  } finally {
    loadingVehicleStats.value = false
  }
}

const fetchCostAnalysis = async () => {
  try {
    const response = await adminStore.fetchCostAnalysis(costAnalysisParams.value)
    costAnalysis.value = response
  } catch (error) {
    console.error('获取成本分析失败:', error)
  }
}

const fetchSpecialtyWorkload = async () => {
  try {
    const params = {
      ...(workloadParams.value.startDate && { startDate: workloadParams.value.startDate }),
      ...(workloadParams.value.endDate && { endDate: workloadParams.value.endDate })
    }
    const response = await adminStore.fetchSpecialtyWorkload(params)
    specialtyWorkloadStats.value = response
  } catch (error) {
    console.error('获取工种工作量失败:', error)
  }
}

const fetchNegativeFeedback = async () => {
  try {
    const params = {
      ...(feedbackParams.value.rating && { rating: parseInt(feedbackParams.value.rating) }),
      ...(feedbackParams.value.startDate && { startDate: feedbackParams.value.startDate }),
      ...(feedbackParams.value.endDate && { endDate: feedbackParams.value.endDate })
    }
    const response = await adminStore.fetchNegativeFeedback(params)
    negativeFeedback.value = response
  } catch (error) {
    console.error('获取负面反馈失败:', error)
  }
}

const fetchPendingTasks = async () => {
  try {
    const response = await adminStore.fetchPendingTasks()
    if (response.success) {
      pendingTasks.value = response.data
    }
  } catch (error) {
    console.error('获取待处理任务失败:', error)
  }
}

const refreshData = async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchStatisticsOverview(),
      fetchVehicleStats(),
      fetchCostAnalysis(),
      fetchSpecialtyWorkload(),
      fetchNegativeFeedback(),
      fetchPendingTasks()
    ])
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // 设置默认日期范围（最近30天）
  const today = new Date()
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  workloadParams.value.endDate = today.toISOString().split('T')[0]
  workloadParams.value.startDate = thirtyDaysAgo.toISOString().split('T')[0]
  
  feedbackParams.value.endDate = today.toISOString().split('T')[0]
  feedbackParams.value.startDate = thirtyDaysAgo.toISOString().split('T')[0]
  
  refreshData()
})
</script>

<style scoped>
.statistics-page {
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

.btn-refresh {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-refresh:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.overview-section, 
.cost-analysis-section, 
.vehicle-stats-section, 
.specialty-workload-section, 
.negative-feedback-section, 
.pending-tasks-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.overview-section h2,
.cost-analysis-section h2,
.vehicle-stats-section h2,
.specialty-workload-section h2,
.negative-feedback-section h2,
.pending-tasks-section h2 {
  margin: 0 0 1.5rem 0;
  color: #333;
  border-bottom: 2px solid #007bff;
  padding-bottom: 0.5rem;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.overview-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.overview-card.revenue { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
.overview-card.orders { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.overview-card.rating { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.overview-card.profit { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }

.card-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  opacity: 0.9;
}

.card-content .amount {
  margin: 0;
  font-size: 1.8rem;
  font-weight: bold;
}

.card-content small {
  opacity: 0.8;
  font-size: 0.8rem;
}

.card-icon {
  font-size: 2rem;
  opacity: 0.8;
}

.analysis-controls,
.workload-controls,
.feedback-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
}

.analysis-controls select,
.analysis-controls input,
.workload-controls input,
.feedback-controls select,
.feedback-controls input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.cost-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.cost-card {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  text-align: center;
}

.cost-card h4 {
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

.breakdown-table table,
.vehicle-stats-table table,
.worker-stats-table table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.breakdown-table th,
.breakdown-table td,
.vehicle-stats-table th,
.vehicle-stats-table td,
.worker-stats-table th,
.worker-stats-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.breakdown-table th,
.vehicle-stats-table th,
.worker-stats-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.common-issues {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.issue-tag {
  background: #e9ecef;
  color: #495057;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.workload-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.workload-card {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
}

.workload-card h4 {
  margin: 0 0 1rem 0;
  color: #333;
  text-align: center;
  background: #007bff;
  color: white;
  padding: 0.5rem;
  border-radius: 4px;
}

.workload-stats {
  display: grid;
  gap: 0.5rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-item .label {
  color: #666;
}

.stat-item .value {
  font-weight: bold;
  color: #333;
}

.feedback-summary {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
}

.summary-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 6px;
  text-align: center;
}

.summary-card h4 {
  margin: 0 0 1rem 0;
  color: #666;
}

.big-number {
  font-size: 3rem;
  font-weight: bold;
  color: #dc3545;
  margin: 0;
}

.ratio {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
}

.ratio.high { background: #f8d7da; color: #721c24; }
.ratio.medium { background: #fff3cd; color: #856404; }
.ratio.low { background: #d4edda; color: #155724; }

.pending-summary {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
}

.status-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.status-card {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  text-align: center;
}

.status-name {
  display: block;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.status-count {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #007bff;
}

.loading, .empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.empty-state {
  font-style: italic;
}

/* 车型统计样式 */
.vehicle-stats-summary {
  margin-bottom: 2rem;
}

.summary-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.date-range {
  font-size: 1rem;
  color: #007bff;
  margin: 0;
}

.percentage {
  font-weight: bold;
  color: #007bff;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  margin-top: 4px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.frequency-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.frequency-badge.high { background: #f8d7da; color: #721c24; }
.frequency-badge.medium { background: #fff3cd; color: #856404; }
.frequency-badge.low { background: #d4edda; color: #155724; }

.more-issues {
  background: #6c757d;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
}

.trend-chart {
  display: flex;
  align-items: end;
  gap: 2px;
  height: 40px;
  min-width: 80px;
}

.trend-bar {
  width: 8px;
  min-height: 2px;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.trend-bar:hover {
  opacity: 0.8;
}

.vehicle-detail-analysis {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.detail-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.tab-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.issues-chart {
  display: grid;
  gap: 1rem;
}

.issue-bar {
  display: grid;
  grid-template-columns: 150px 1fr;
  align-items: center;
  gap: 1rem;
}

.issue-label {
  font-weight: 500;
  color: #333;
}

.issue-progress {
  position: relative;
  background: #e9ecef;
  height: 24px;
  border-radius: 12px;
  overflow: hidden;
}

.issue-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #28a745, #20c997);
  border-radius: 12px;
  transition: width 0.3s ease;
}

.issue-stats {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.8rem;
  color: #333;
  font-weight: 500;
}

.trend-chart-large {
  display: flex;
  align-items: end;
  gap: 8px;
  height: 200px;
  padding: 1rem;
  background: white;
  border-radius: 6px;
}

.trend-bar-large {
  min-width: 40px;
  background: #007bff;
  border-radius: 4px 4px 0 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 8px 4px 4px;
  transition: all 0.3s ease;
}

.trend-bar-large:hover {
  background: #0056b3;
}

.trend-value {
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
}

.trend-month {
  color: #666;
  font-size: 0.8rem;
  margin-top: 8px;
}
</style>