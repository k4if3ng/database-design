<template>
  <div class="dashboard">
    <h1>维修人员仪表板</h1>

    <div class="stats-grid">
      <div class="stat-card">
        <h3>分配工单</h3>
        <p class="stat-number">{{ assignedOrders.length }}</p>
      </div>

      <div class="stat-card">
        <h3>已完成工单</h3>
        <p class="stat-number">{{ completedOrders.length }}</p>
      </div>

      <div class="stat-card">
        <h3>总收入</h3>
        <p class="stat-number">￥{{ totalEarnings.toFixed(2) }}</p>
      </div>

    </div>

    <div class="recent-orders">
      <h2>最近分配的工单</h2>
      <div class="order-list">
        <div v-for="order in recentOrders" :key="order.orderId" class="order-item">
          <div class="order-info">
            <h4>{{ order.issue }}</h4>
            <p>车牌号: {{ order.licensePlate }}</p>
            <p>状态: {{ getStatusText(order.status) }}</p>
          </div>
          <div class="order-meta">
            <span class="order-date">{{ formatDate(order.createTime) }}</span>
            <span :class="`status ${order.status.toLowerCase()}`">
              {{ getStatusText(order.status) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { workerService } from '@/services/worker'

interface Order {
  orderId: number
  issue: string
  licensePlate: string
  status: string
  createTime: string
  laborCost?: number
}

const assignedOrders = ref<Order[]>([])
const completedOrders = computed(() =>
  assignedOrders.value.filter(order => order.status === 'COMPLETED'),
)

const totalEarnings = computed(() =>
  assignedOrders.value.reduce((acc, order) => acc + (order.laborCost || 0), 0),
)

const recentOrders = computed(() =>
  assignedOrders.value
    .slice(0, 5)
    .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime()),
)

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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

onMounted(async () => {
  const response = await workerService.getAssignedOrders()
  assignedOrders.value = response.data
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

.recent-orders {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.order-item:last-child {
  border-bottom: none;
}

.order-info h4 {
  margin: 0 0 0.5rem 0;
}

.order-info p {
  margin: 0.25rem 0;
  color: #666;
  font-size: 0.9rem;
}

.order-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
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
</style>