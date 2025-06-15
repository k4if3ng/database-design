<template>
  <div class="dashboard">
    <h1>用户仪表板</h1>

    <div class="stats-grid">
      <div class="stat-card">
        <h3>车辆数量</h3>
        <p class="stat-number">{{ vehicles.length }}</p>
      </div>

      <div class="stat-card">
        <h3>维修工单</h3>
        <p class="stat-number">{{ repairOrders.length }}</p>
      </div>

      <div class="stat-card">
        <h3>已完成维修</h3>
        <p class="stat-number">{{ completedRepairs }}</p>
      </div>

    </div>

    <div class="recent-orders">
      <h2>最近的维修工单</h2>
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
import { computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const { vehicles, repairOrders, repairLogs } = userStore

const recentOrders = computed(() =>
  repairOrders
    .slice(0, 5)
    .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime()),
)

const completedRepairs = computed(() => 
  repairOrders.filter(order => order.status === 'COMPLETED').length
)

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    SUBMITTED: '已提交',
    ASSIGNED: '已分配',
    ACCEPTED: '已接受',
    PENDING_ASSIGNMENT: '待分配',
    IN_PROGRESS: '维修中',
    COMPLETED: '已完成',
    REJECTED: '已拒绝',
  }
  return statusMap[status] || status
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

onMounted(async () => {
  await Promise.all([
    userStore.fetchVehicles(),
    userStore.fetchRepairOrders(),
    userStore.fetchRepairLogs(),
  ])
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh; /* 关键：至少撑满整个视口高度 */
  width: 80vw;        /* 撑满宽度 */
  padding: 1.5rem;
  background: linear-gradient(to bottom right, #f5f7fa, #c3cfe2); /* 可选背景 */
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

.status.submitted {
  background: #e3f2fd;
  color: #1976d2;
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
.status.pending_assignment {
  background: #f3e5f5;
  color: #8e24aa;
}
</style>
