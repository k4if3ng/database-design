<template>
  <div class="vehicles-container">
    <div class="header">
      <h1>我的车辆</h1>
      <button class="add-button" @click="showAddModal = true">添加车辆</button>
    </div>

    <div class="loading" v-if="loading">加载中...</div>
    <div class="empty-state" v-else-if="vehicles.length === 0">
      <p>暂无车辆信息，请添加车辆。</p>
    </div>

    <div class="vehicles-grid" v-else>
      <div
        v-for="vehicle in vehicles"
        :key="vehicle.vehicleId"
        class="vehicle-card"
      >
        <div class="vehicle-header">
          <h3>{{ vehicle.brand }} {{ vehicle.model }}</h3>
          <span class="license-plate">{{ vehicle.licensePlate }}</span>
        </div>
        <div class="vehicle-details">
          <p><strong>年份:</strong> {{ vehicle.year }}</p>
          <p><strong>VIN:</strong> {{ vehicle.vin }}</p>
        </div>
        <div class="vehicle-actions">
          <button class="repair-button" @click="openRepairModal(vehicle)">
            申请维修
          </button>
        </div>
      </div>
    </div>

    <!-- 添加车辆弹窗 -->
    <div class="modal" v-if="showAddModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>添加车辆</h2>
          <button class="close-button" @click="showAddModal = false">&times;</button>
        </div>
        <form @submit.prevent="submitAddVehicle">
          <div class="form-group">
            <label for="licensePlate">车牌号</label>
            <input
              id="licensePlate"
              v-model="vehicleForm.licensePlate"
              type="text"
              placeholder="例如：沪A12345"
              required
            />
          </div>
          <div class="form-group">
            <label for="brand">品牌</label>
            <input
              id="brand"
              v-model="vehicleForm.brand"
              type="text"
              placeholder="例如：Toyota"
              required
            />
          </div>
          <div class="form-group">
            <label for="model">型号</label>
            <input
              id="model"
              v-model="vehicleForm.model"
              type="text"
              placeholder="例如：Camry"
              required
            />
          </div>
          <div class="form-group">
            <label for="year">年份</label>
            <input
              id="year"
              v-model="vehicleForm.year"
              type="number"
              placeholder="请输入车辆年份"
              required
            />
          </div>
          <div class="form-group">
            <label for="vin">VIN</label>
            <input
              id="vin"
              v-model="vehicleForm.vin"
              type="text"
              placeholder="例如：1HGBH41JXMN109186"
              required
            />
          </div>
          <div class="form-actions">
            <button type="button" class="cancel-button" @click="showAddModal = false">取消</button>
            <button type="submit" class="submit-button" :disabled="isSubmitting">
              {{ isSubmitting ? '提交中...' : '提交' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 申请维修弹窗 -->
    <div class="modal" v-if="showRepairModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>申请维修</h2>
          <button class="close-button" @click="showRepairModal = false">&times;</button>
        </div>
        <form @submit.prevent="submitRepairRequest">
          <div class="form-group">
            <label>车辆信息</label>
            <div class="vehicle-info">
              <p>{{ selectedVehicle?.brand }} {{ selectedVehicle?.model }} ({{ selectedVehicle?.licensePlate }})</p>
            </div>
          </div>
          <div class="form-group">
            <label for="issue">故障描述</label>
            <textarea
              id="issue"
              v-model="repairForm.issue"
              placeholder="请描述车辆故障情况"
              required
            ></textarea>
          </div>
          <div class="form-group">
            <label for="repairType">维修类型</label>
            <select id="repairType" v-model="repairForm.repairType" required>
              <option value="机修">机修</option>
              <option value="电气">电气</option>
              <option value="钣金">钣金</option>
              <option value="喷漆">喷漆</option>
              <option value="其他">其他</option>
            </select>
          </div>
          <div class="form-group">
            <label for="additionalInfo">附加信息</label>
            <textarea
              id="additionalInfo"
              v-model="repairForm.additionalInfo"
              placeholder="其他需要说明的信息（可选）"
            ></textarea>
          </div>
          <div class="form-actions">
            <button type="button" class="cancel-button" @click="showRepairModal = false">取消</button>
            <button type="submit" class="submit-button" :disabled="isSubmitting">
              {{ isSubmitting ? '提交中...' : '提交' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const { vehicles, fetchVehicles } = userStore

const loading = ref(false)
const isSubmitting = ref(false)
const showRepairModal = ref(false)
const showAddModal = ref(false)
const selectedVehicle = ref<any>(null)

const repairForm = reactive({
  vehicleId: 0,
  issue: '',
  repairType: '',
  additionalInfo: ''
})

const vehicleForm = reactive({
  licensePlate: '',
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  vin: ''
})

const resetVehicleForm = () => {
  vehicleForm.licensePlate = ''
  vehicleForm.brand = ''
  vehicleForm.model = ''
  vehicleForm.year = new Date().getFullYear()
  vehicleForm.vin = ''
}

const submitAddVehicle = async () => {
  try {
    isSubmitting.value = true
    await userStore.addVehicle(vehicleForm)
    showAddModal.value = false
    resetVehicleForm()
    await fetchVehicles()
    alert('车辆添加成功')
  } catch (error) {
    console.error('添加车辆失败:', error)
    const errMsg =
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      (error as any).response?.data?.message
        ? (error as any).response.data.message
        : '添加车辆失败，请稍后重试'
    alert(errMsg)
  } finally {
    isSubmitting.value = false
  }
}

const resetRepairForm = () => {
  repairForm.vehicleId = 0
  repairForm.issue = ''
  repairForm.repairType = ''
  repairForm.additionalInfo = ''
}

const openRepairModal = (vehicle: any) => {
  selectedVehicle.value = vehicle
  repairForm.vehicleId = vehicle.vehicleId
  showRepairModal.value = true
}

const submitRepairRequest = async () => {
  try {
    isSubmitting.value = true
    await userStore.submitRepair(repairForm)
    showRepairModal.value = false
    resetRepairForm()
    alert('维修申请已提交')
  } catch (error) {
    console.error('提交维修申请失败:', error)
    let errMsg = '提交维修申请失败，请稍后重试'
    if (typeof error === 'object' && error !== null && 'response' in error && (error as any).response?.data?.message) {
      errMsg = (error as any).response.data.message
    }
    alert(errMsg)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await fetchVehicles()
  } catch (error) {
    console.error('获取车辆列表失败:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.vehicles-container {
  width: 80vw;
  padding: 1.5rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.add-button {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.loading, .empty-state {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.vehicles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.vehicle-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.vehicle-header {
  padding: 1rem;
  background: #f5f5f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.vehicle-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.license-plate {
  background: #333;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-weight: bold;
}

.vehicle-details {
  padding: 1rem;
}

.vehicle-details p {
  margin: 0.5rem 0;
}

.vehicle-actions {
  padding: 1rem;
  border-top: 1px solid #eee;
  text-align: right;
}

.repair-button {
  background: #2196F3;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

/* 弹窗样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.2rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

form {
  padding: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input, 
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.vehicle-info {
  background: #f5f5f5;
  padding: 0.75rem;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.cancel-button {
  background: #f5f5f5;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.submit-button {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>