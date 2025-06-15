<template>
  <div class="repair-logs">
    <h1>维修记录</h1>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="repairLogs.length === 0" class="empty-state">
      <p>暂无维修记录。</p>
    </div>
    <div v-else>
      <div class="logs-grid">
        <div v-for="log in repairLogs" :key="log.logId" class="log-card">
          <div class="log-header">
            <h2>记录 #{{ log.logId }}</h2>
            <!-- <span class="rating">评分: {{ log.rating }}</span> -->
          </div>
          <div class="log-details">
            <p><strong>描述:</strong> {{ log.issue }}</p>
            <p><strong>维修结果:</strong> {{ log.repairDescription }}</p>
            <p><strong>提交时间:</strong> {{ formatDate(log.submitTime) }}</p>
            <p><strong>完成时间:</strong> {{ formatDate(log.completionTime) }}</p>
            <p><strong>材料费:</strong> {{ formatPrice(log.materialsCost) }}</p>
            <p><strong>人工费:</strong> {{ formatPrice(log.laborCost) }}</p>
            <p><strong>总费用:</strong> {{ formatPrice(log.totalCost) }}</p>
            <p><strong>车辆信息:</strong> {{ log.licensePlate }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) {
    return '未完成' // 如果日期为空，返回默认值
  }
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const formatPrice = (price: number | null | undefined) => {
  if (price === null || price === undefined) {
    return '未完成' // 如果价格为空，返回默认值
  }
  return `￥${price.toFixed(2)}`
}

export default defineComponent({
  name: 'RepairLogs',
  setup() {
    const userStore = useUserStore()
    const { repairLogs, loading, fetchRepairLogs } = userStore

    onMounted(() => {
      fetchRepairLogs()
    })

    return {
      repairLogs,
      loading,
      formatDate,
      formatPrice,
    }
  },
})
</script>

<style scoped>
.repair-logs {
  width: 80vw;
  padding: 20px;
}

.logs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.log-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 15px;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.rating {
  background: #ff9800;
  color: #fff;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.9rem;
}

.log-details p {
  margin: 5px 0;
}

.materials-list {
  margin-top: 10px;
}

.materials-list h3 {
  margin-bottom: 5px;
}

.materials-list li {
  margin: 5px 0;
}

.loading, .empty-state {
  text-align: center;
  font-size: 18px;
  padding: 20px;
}
</style>