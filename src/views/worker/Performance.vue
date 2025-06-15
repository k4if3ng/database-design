<template>
  <div class="performance">
    <h1>绩效与收入</h1>
    
    <div v-if="loading" class="loading">
      <p>加载中...</p>
    </div>
    
    <div v-else class="performance-content">
      <div class="stats-grid">
        <!-- 总收入卡片 -->
        <div class="stats-card">
          <h2>总收入统计</h2>
          <div v-if="totalEarnings" class="stats-data">
            <div class="stat-item">
              <span class="stat-label">总收入:</span>
              <span class="stat-value">¥{{ totalEarnings.toFixed(2) }}</span>
            </div>
          </div>
          <div v-else class="no-data">
            <p>暂无收入数据</p>
          </div>
        </div>

        <!-- 详细收入卡片 -->
        <div class="stats-card">
          <h2>收入详情</h2>
          <div v-if="earningDetails" class="stats-data">
            <div class="stat-item">
              <span class="stat-label">工人ID:</span>
              <span class="stat-value">{{ earningDetails.workerId }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">姓名:</span>
              <span class="stat-value">{{ earningDetails.workerName }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">专业:</span>
              <span class="stat-value">{{ earningDetails.specialty }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">时薪:</span>
              <span class="stat-value">¥{{ earningDetails.hourlyWage.toFixed(2) }}/小时</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">基础工资:</span>
              <span class="stat-value">¥{{ earningDetails.baseSalary.toFixed(2) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">总收入:</span>
              <span class="stat-value">¥{{ earningDetails.totalEarnings.toFixed(2) }}</span>
            </div>
          </div>
          <div v-else class="no-data">
            <p>暂无详细收入数据</p>
          </div>
        </div>
        
        <!-- 绩效卡片 -->
        <div class="stats-card">
          <h2>绩效指标</h2>
          <div v-if="performance" class="stats-data">
            <div class="stat-item">
              <span class="stat-label">完成订单数:</span>
              <span class="stat-value">{{ performance.completedOrders }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">总工作时长:</span>
              <span class="stat-value">{{ performance.totalHours.toFixed(1) }} 小时</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">工作效率:</span>
              <span class="stat-value">{{ performance.efficiency.toFixed(2) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">完成率:</span>
              <span class="stat-value">{{ (performance.completionRate * 100).toFixed(1) }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">平均评分:</span>
              <span class="stat-value">{{ performance.averageRating.toFixed(1) }}/5</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">准时完成率:</span>
              <span class="stat-value">{{ (performance.OnTimeCompletionRate * 100).toFixed(1) }}%</span>
            </div>
          </div>
          <div v-else class="no-data">
            <p>暂无绩效数据</p>
          </div>
        </div>
      </div>

      <!-- 年度收入趋势 -->
      <div v-if="earningDetails?.yearlyEarnings?.length" class="chart-section">
        <h2>年度收入趋势</h2>
        <div class="yearly-earnings">
          <div v-for="yearlyEarning in earningDetails.yearlyEarnings" :key="yearlyEarning.year" 
               class="yearly-item">
            <div class="yearly-header">
              <h3>{{ yearlyEarning.year }}年</h3>
              <div class="yearly-summary">
                <span>总收入: ¥{{ yearlyEarning.totalSalary.toFixed(2) }}</span>
                <span>总工时: {{ yearlyEarning.totalWorkHours }} 小时</span>
              </div>
            </div>
            <div class="yearly-details">
              <div class="detail-item">
                <span>基础工资:</span>
                <span>¥{{ yearlyEarning.baseSalary.toFixed(2) }}</span>
              </div>
              <div class="detail-item">
                <span>小时补偿:</span>
                <span>¥{{ yearlyEarning.hourlyCompensation.toFixed(2) }}</span>
              </div>
            </div>
            
            <!-- 月度收入详情 -->
            <div v-if="yearlyEarning.monthlyEarnings?.length" class="monthly-earnings">
              <h4>月度收入详情</h4>
              <div class="monthly-grid">
                <div v-for="monthlyEarning in yearlyEarning.monthlyEarnings" 
                     :key="`${monthlyEarning.year}-${monthlyEarning.month}`" 
                     class="monthly-item">
                  <div class="monthly-header">
                    <span>{{ monthlyEarning.month }}月</span>
                    <span class="settlement-status" :class="monthlyEarning.settlementStatus.toLowerCase()">
                      {{ getStatusText(monthlyEarning.settlementStatus) }}
                    </span>
                  </div>
                  <div class="monthly-details">
                    <div>工时: {{ monthlyEarning.totalWorkHours }}h</div>
                    <div>基础: ¥{{ monthlyEarning.baseSalary.toFixed(2) }}</div>
                    <div>小时: ¥{{ monthlyEarning.hourlyCompensation.toFixed(2) }}</div>
                    <div class="total">总计: ¥{{ monthlyEarning.totalSalary.toFixed(2) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 结算记录 -->
      <div class="chart-section">
        <h2>月度结算记录</h2>
        <div class="chart-container">
          <div v-if="settlementRecords?.length" class="settlement-list">
            <div v-for="settlement in settlementRecords" 
                 :key="`${settlement.settlementYear}-${settlement.settlementMonth}`" 
                 class="settlement-item">
              <div class="settlement-header">
                <span class="settlement-period">{{ settlement.settlementYear }}年{{ settlement.settlementMonth }}月</span>
                <span class="settlement-status" :class="settlement.settlementStatus.toLowerCase()">
                  {{ getStatusText(settlement.settlementStatus) }}
                </span>
              </div>
              <div class="settlement-details">
                <div class="detail-item">
                  <span>结算ID:</span>
                  <span>{{ settlement.id }}</span>
                </div>
                <div class="detail-item">
                  <span>工人姓名:</span>
                  <span>{{ settlement.workerName }}</span>
                </div>
                <div class="detail-item">
                  <span>专业:</span>
                  <span>{{ settlement.specialty }}</span>
                </div>
                <div class="detail-item">
                  <span>工作时长:</span>
                  <span>{{ settlement.totalHours }} 小时</span>
                </div>
                <div class="detail-item">
                  <span>时薪:</span>
                  <span>¥{{ settlement.hourlyWage.toFixed(2) }}</span>
                </div>
                <div class="detail-item">
                  <span>时薪工资:</span>
                  <span>¥{{ settlement.totalHourlyWage.toFixed(2) }}</span>
                </div>
                <div class="detail-item">
                  <span>基础工资:</span>
                  <span>¥{{ settlement.baseSalary.toFixed(2) }}</span>
                </div>
                <div class="detail-item total">
                  <span>总收入:</span>
                  <span>¥{{ settlement.totalSalary.toFixed(2) }}</span>
                </div>
                <div class="detail-item">
                  <span>结算日期:</span>
                  <span>{{ settlement.settlementData }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="chart-placeholder">
            <p>暂无结算记录数据</p>
          </div>
        </div>
      </div>
      
      <!-- 评分反馈 -->
      <div class="feedback-section">
        <h2>客户评分与反馈</h2>
        <div class="feedback-container">
          <p class="feedback-placeholder">暂无客户评分与反馈数据</p>
          <!-- 
          实际项目中这里应该会展示来自客户的评分和评价内容
          <div v-for="feedback in feedbacks" :key="feedback.id" class="feedback-item">
            <div class="feedback-header">
              <span class="feedback-rating">★★★★★</span>
              <span class="feedback-date">{{ formatDate(feedback.date) }}</span>
            </div>
            <p class="feedback-content">{{ feedback.content }}</p>
          </div>
          -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useWorkerStore } from '@/stores/worker'

const workerStore = useWorkerStore()
const loading = computed(() => workerStore.loading)
const totalEarnings = computed(() => workerStore.earnings)
const earningDetails = computed(() => workerStore.earningDetails)
const performance = computed(() => workerStore.workerPerformance)
const settlementRecords = computed(() => workerStore.settlementRecords)

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'SETTLED': '已结算',
    'PENDING': '待结算',
    'PROCESSING': '处理中'
  }
  return statusMap[status] || status
}

onMounted(async () => {
  try {
    // 加载总收入数据
    await workerStore.fetchEarnings()
    
    // 加载详细收入数据
    await workerStore.fetchEarningDetails()
    
    // 加载绩效数据
    await workerStore.fetchWorkerPerformance()
    
    // 加载结算记录
    await workerStore.fetchSettlementRecords()
  } catch (error) {
    console.error('加载数据失败:', error)
  }
})
</script>

<style scoped>
.performance {
  min-height: 100vh;
  width: 80vw;
  margin: 0 auto;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stats-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stats-card h2 {
  margin: 0 0 1rem 0;
  color: #2d3748;
  font-size: 1.25rem;
}

.stats-data {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  color: #4a5568;
  font-weight: 500;
}

.stat-value {
  color: #2d3748;
  font-weight: 600;
}

.no-data {
  text-align: center;
  color: #a0aec0;
  padding: 2rem 0;
}

.chart-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.chart-section h2 {
  margin: 0 0 1rem 0;
  color: #2d3748;
  font-size: 1.25rem;
}

.yearly-earnings {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.yearly-item {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
}

.yearly-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.yearly-header h3 {
  margin: 0;
  color: #2d3748;
}

.yearly-summary {
  display: flex;
  gap: 1rem;
  color: #4a5568;
  font-size: 0.9rem;
}

.yearly-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.monthly-earnings {
  margin-top: 1rem;
}

.monthly-earnings h4 {
  margin: 0 0 1rem 0;
  color: #4a5568;
  font-size: 1rem;
}

.monthly-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.monthly-item {
  background: #f7fafc;
  border-radius: 6px;
  padding: 1rem;
}

.monthly-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.monthly-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #4a5568;
}

.monthly-details .total {
  font-weight: 600;
  color: #2d3748;
  margin-top: 0.25rem;
  padding-top: 0.25rem;
  border-top: 1px solid #e2e8f0;
}

.settlement-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.settlement-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  border-left: 4px solid #4299e1;
}

.settlement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.settlement-period {
  font-weight: bold;
  color: #2d3748;
}

.settlement-status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.settlement-status.settled {
  background-color: #c6f6d5;
  color: #22543d;
}

.settlement-status.pending {
  background-color: #fef5e7;
  color: #744210;
}

.settlement-status.processing {
  background-color: #e6fffa;
  color: #234e52;
}

.settlement-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.detail-item.total {
  font-weight: bold;
  color: #2d3748;
  border-top: 1px solid #e2e8f0;
  padding-top: 0.5rem;
  margin-top: 0.5rem;
}

.chart-placeholder {
  text-align: center;
  color: #a0aec0;
  padding: 2rem 0;
}

.feedback-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.feedback-section h2 {
  margin: 0 0 1rem 0;
  color: #2d3748;
  font-size: 1.25rem;
}

.feedback-container {
  text-align: center;
  color: #a0aec0;
  padding: 2rem 0;
}

.feedback-placeholder {
  margin: 0;
}
</style>