<template>
  <div class="repair-orders">
    <h1>维修工单</h1>
    
    <div class="action-buttons">
      <button class="batch-submit-button" @click="showBatchSubmitModal = true">批量提交工单</button>
    </div>
    
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="repairOrders.length === 0" class="empty-state">
      <p>暂无维修工单。</p>
    </div>
    <div v-else>
      <div class="orders-grid">
        <div v-for="order in repairOrders" :key="order.orderId" class="order-card">
          <div class="order-header">
            <h2>工单 #{{ order.orderId }}</h2>
            <span class="status">{{ getStatusText(order.status) }}</span>
          </div>
          <div class="order-details">
            <p><strong>描述:</strong> {{ order.issue }}</p>
            <p><strong>创建时间:</strong> {{ formatDate(order.createTime) }}</p>
            <p v-if="order.assignTime"><strong>分配时间:</strong> {{ formatDate(order.assignTime) }}</p>
            <p v-if="order.estimatedCompletionTime"><strong>预期完成时间:</strong> {{ formatDate(order.estimatedCompletionTime) }}</p>
            <p><strong>车辆信息:</strong> {{ order.licensePlate }}</p>
            <p v-if="order.workerName"><strong>维修工:</strong> {{ order.workerName }} </p>
            <p v-if="order.repairResult"><strong>维修结果:</strong> {{ order.repairResult }}</p>
          </div>
          <div class="order-actions">
            <button
              v-if="!order.hasFeedback"
              @click="openFeedbackModal(order)"
              class="feedback-button"
            >
              提交反馈
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 提交反馈弹窗 -->
    <div class="modal" v-if="showFeedbackModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>提交反馈</h2>
          <button class="close-button" @click="closeFeedbackModal">&times;</button>
        </div>
        <form @submit.prevent="submitFeedback">
          <div class="form-group">
            <label for="rating">评分</label>
            <select id="rating" v-model="feedbackForm.rating" required>
              <option value="">请选择评分</option>
              <option value="1">1 - 非常差</option>
              <option value="2">2 - 差</option>
              <option value="3">3 - 一般</option>
              <option value="4">4 - 好</option>
              <option value="5">5 - 非常好</option>
            </select>
          </div>
          <div class="form-group">
            <label for="comment">评论</label>
            <textarea
              id="comment"
              v-model="feedbackForm.content"
              placeholder="请输入您的反馈"
              required
            ></textarea>
          </div>
          <div class="form-actions">
            <button type="button" class="cancel-button" @click="closeFeedbackModal">取消</button>
            <button type="submit" class="submit-button" :disabled="isSubmitting">
              {{ isSubmitting ? '提交中...' : '提交' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- 批量提交工单弹窗 -->
    <div class="modal" v-if="showBatchSubmitModal">
      <div class="modal-content batch-modal">
        <div class="modal-header">
          <h2>批量提交维修工单</h2>
          <button class="close-button" @click="closeBatchSubmitModal">&times;</button>
        </div>
        
        <div class="batch-orders">
          <div v-for="(order, index) in batchOrdersForm" :key="index" class="batch-order-item">
            <h3>工单 #{{ index + 1 }}</h3>
            
            <div class="form-group">
              <label>选择车辆</label>
              <select v-model="order.vehicleId" class="form-select" required>
                <option value="" disabled>请选择车辆</option>
                <option v-for="vehicle in vehicles" :key="vehicle.vehicleId" :value="vehicle.vehicleId">
                  {{ vehicle.brand }} {{ vehicle.model }} ({{ vehicle.licensePlate }})
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label>维修类型</label>
              <select v-model="order.repairType" class="form-select" required>
                <option value="">请选择维修类型</option>
                <option value="发动机维修">发动机维修</option>
                <option value="电气维修">电气维修</option>
                <option value="钣金喷漆">钣金喷漆</option>
                <option value="新能源维修">新能源维修</option>
                <option value="其他">其他</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>问题描述</label>
              <textarea
                v-model="order.issue"
                class="form-textarea"
                rows="3"
                placeholder="请描述车辆问题..."
                required
              ></textarea>
            </div>
            
            <div class="form-group">
              <label>额外信息</label>
              <textarea
                v-model="order.additionalInfo"
                class="form-textarea"
                rows="2"
                placeholder="请提供额外信息（可选）..."
              ></textarea>
            </div>
            
            <button v-if="batchOrdersForm.length > 1" @click="removeBatchOrder(index)" class="btn-remove">
              删除此工单
            </button>
          </div>
        </div>
        
        <button @click="addBatchOrder" class="add-order-button">
          + 添加工单
        </button>
        
        <div class="form-actions">
          <button class="cancel-button" @click="closeBatchSubmitModal">取消</button>
          <button
            class="submit-button"
            @click="submitBatchOrders"
            :disabled="isSubmittingBatch"
          >
            {{ isSubmittingBatch ? '提交中...' : '提交所有工单' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

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
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

interface BatchOrderItem {
  vehicleId: number | null;
  issue: string;
  repairType: string;
  additionalInfo?: string;
}

const emptyBatchOrder = (): BatchOrderItem => ({
  vehicleId: null,
  issue: '',
  repairType: '',
  additionalInfo: ''
})

export default defineComponent({
  name: 'RepairOrders',
  setup() {
    const userStore = useUserStore()
    const { 
      repairOrders, 
      vehicles,
      loading, 
      fetchRepairOrders, 
      fetchVehicles,
      submitFeedback: storeSubmitFeedback,
      batchSubmitOrders: storeBatchSubmitOrders
    } = userStore

    // 反馈表单相关
    const showFeedbackModal = ref(false)
    const isSubmitting = ref(false)
    const selectedOrder = ref<any>(null)
    const feedbackForm = reactive({
      repairOrderId: 0,
      rating: '',
      content: '',
    })

    // 批量提交工单相关
    const showBatchSubmitModal = ref(false)
    const isSubmittingBatch = ref(false)
    const batchOrdersForm = ref<BatchOrderItem[]>([emptyBatchOrder()])

    // 反馈表单方法
    const openFeedbackModal = (order: any) => {
      selectedOrder.value = order
      feedbackForm.repairOrderId = order.orderId
      feedbackForm.rating = ''
      feedbackForm.content = ''
      showFeedbackModal.value = true
    }

    const closeFeedbackModal = () => {
      showFeedbackModal.value = false
    }

    const submitFeedback = async () => {
      try {
        isSubmitting.value = true
        await storeSubmitFeedback({
          ...feedbackForm,
          rating: Number(feedbackForm.rating),
          category: Number(feedbackForm.rating) >= 4 ? 'POSITIVE_FEEDBACK' : Number(feedbackForm.rating) === 3 ? 'GENERAL_FEEDBACK' : 'NEGATIVE_FEEDBACK',
        })
        alert('反馈提交成功')
        closeFeedbackModal()
        await fetchRepairOrders() // 更新工单列表
      } catch (error) {
        console.error('提交反馈失败:', error)
        alert('提交反馈失败，请稍后重试')
      } finally {
        isSubmitting.value = false
      }
    }

    // 批量提交工单方法
    const addBatchOrder = () => {
      batchOrdersForm.value.push(emptyBatchOrder())
    }

    const removeBatchOrder = (index: number) => {
      batchOrdersForm.value.splice(index, 1)
    }

    const closeBatchSubmitModal = () => {
      showBatchSubmitModal.value = false
      batchOrdersForm.value = [emptyBatchOrder()]
    }

    const submitBatchOrders = async () => {
      // 验证表单
      for (const [index, order] of batchOrdersForm.value.entries()) {
        if (!order.vehicleId) {
          alert(`工单 #${index + 1} 请选择车辆`)
          return
        }
        if (!order.repairType) {
          alert(`工单 #${index + 1} 请选择维修类型`)
          return
        }
        if (!order.issue.trim()) {
          alert(`工单 #${index + 1} 请填写问题描述`)
          return
        }
      }

      try {
        isSubmittingBatch.value = true
        
        // 转换为API所需格式
        const payload = {
         repairs: batchOrdersForm.value.map(order => ({
            vehicleId: order.vehicleId as number, // ensure vehicleId is number
            issue: order.issue,
            repairType: order.repairType,
            additionalInfo: order.additionalInfo || undefined
          }))
        }
        
        await storeBatchSubmitOrders(payload)
        alert('批量提交工单成功')
        closeBatchSubmitModal()
        await fetchRepairOrders() // 刷新工单列表
      } catch (error) {
        console.error('批量提交工单失败:', error)
        alert('批量提交工单失败，请稍后重试')
      } finally {
        isSubmittingBatch.value = false
      }
    }

    onMounted(async () => {
      fetchRepairOrders()
      fetchVehicles() // 获取车辆列表用于批量提交
    })

    return {
      repairOrders,
      vehicles,
      loading,
      
      // 反馈相关
      showFeedbackModal,
      feedbackForm,
      isSubmitting,
      openFeedbackModal,
      closeFeedbackModal,
      submitFeedback,
      
      // 批量提交相关
      showBatchSubmitModal,
      batchOrdersForm,
      isSubmittingBatch,
      addBatchOrder,
      removeBatchOrder,
      closeBatchSubmitModal,
      submitBatchOrders,
      
      // 辅助方法
      formatDate,
      getStatusText,
    }
  },
})
</script>

<style scoped>
.repair-orders {
  width: 80vw;
  padding: 20px;
}

.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.order-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 15px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.status {
  background: #007bff;
  color: #fff;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.9rem;
}

.order-details p {
  margin: 5px 0;
}

.order-actions {
  margin-top: 10px;
  text-align: right;
}

.feedback-button {
  background: #4caf50;
  color: #fff;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.feedback-button:hover {
  background: #388e3c;
}

/* 弹窗样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group textarea {
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: space-between;
}

.cancel-button {
  background: #f5f5f5;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.submit-button {
  background: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.submit-button:hover {
  background: #388e3c;
}

.loading, .empty-state {
  text-align: center;
  font-size: 18px;
  padding: 20px;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.batch-submit-button {
  background: #4caf50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.batch-submit-button:hover {
  background: #388e3c;
}

.batch-modal {
  width: 600px;
  max-width: 90vw;
}

.batch-orders {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 10px;
}

.batch-order-item {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
}

.form-row {
  display: flex;
  gap: 15px;
}

.form-row .form-group {
  flex: 1;
}

.form-group {
  margin-bottom: 15px;
}

.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.form-textarea {
  resize: vertical;
}

.btn-remove {
  background: #f44336;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  margin-top: 10px;
}

.add-order-button {
  background: #2196f3;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin: 10px 0;
  width: 100%;
}

.add-order-button:hover {
  background: #0b7dda;
}
</style>