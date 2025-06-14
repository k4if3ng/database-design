<template>
  <div class="performance">
    <h1>绩效与收入</h1>
    
    <div v-if="loading" class="loading">
      <p>加载中...</p>
    </div>
    
    <div v-else class="performance-content">
      <div class="stats-grid">
        <!-- 收入卡片 -->
        <div class="stats-card">
          <h2>收入统计</h2>
          <div v-if="earnings" class="stats-data">
            <div class="stat-item">
              <span class="stat-label">总收入:</span>
              <span class="stat-value">¥{{ earnings.totalEarnings.toFixed(2) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">本月收入:</span>
              <span class="stat-value">¥{{ earnings.thisMonthEarnings.toFixed(2) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">完成工单数:</span>
              <span class="stat-value">{{ earnings.completedOrders }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">平均工单价值:</span>
              <span class="stat-value">¥{{ earnings.averageOrderValue.toFixed(2) }}</span>
            </div>
          </div>
          <div v-else class="no-data">
            <p>暂无收入数据</p>
          </div>
        </div>
        
        <!-- 绩效卡片 -->
        <div class="stats-card">
          <h2>绩效指标</h2>
          <div v-if="performance" class="stats-data">
            <div class="stat-item">
              <span class="stat-label">完成率:</span>
              <span class="stat-value">{{ (performance.completionRate * 100).toFixed(1) }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">平均评分:</span>
              <span class="stat-value">{{ performance.averageRating.toFixed(1) }}/5</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">总工作时长:</span>
              <span class="stat-value">{{ performance.totalWorkHours.toFixed(1) }} 小时</span>
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
      
      <!-- 收入趋势图表 -->
      <div class="chart-section">
        <h2>收入趋势</h2>
        <div class="chart-container">
          <!-- 图表将在这里渲染 -->
          <p class="chart-placeholder">图表加载中或暂无数据...</p>
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
const earnings = computed(() => workerStore.earnings)
const performance = computed(() => workerStore.performance)

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

onMounted(async () => {
  try {
    // 加载收入数据
    await workerStore.fetchEarnings()
    
    // 加载绩效数据
    await workerStore.fetchPerformance()
  } catch (error) {
    console.error('加载数据失败:', error)
  }
})
</script>

<style scoped>
.performance {
  padding: 1.5rem;
  background: linear-gradient(to bottom right, #f5f7fa, #c3cfe2);
  min-height: 100vh;
  min-width: 80vw;
}

.loading {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
}

.performance-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.stats-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stats-card h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
  color: #4a5568;
}

.stats-data {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  color: #718096;
  font-weight: bold;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: bold;
  color: #4a5568;
}

.no-data, .chart-placeholder, .feedback-placeholder {
  text-align: center;
  padding: 2rem;
  background: #f9f9f9;
  border-radius: 8px;
  color: #718096;
}

.chart-section, .feedback-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-section h2, .feedback-section h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
  color: #4a5568;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.feedback-container {
  margin-top: 1rem;
}

.feedback-item {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.feedback-rating {
  color: #f59e0b;
}

.feedback-date {
  color: #718096;
  font-size: 0.9rem;
}

.feedback-content {
  margin: 0;
  color: #4a5568;
}
</style>