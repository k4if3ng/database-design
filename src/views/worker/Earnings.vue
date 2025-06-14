<template>
  <div class="earnings">
    <h1 class="text-2xl font-bold mb-4">Earnings & Compensation</h1>
    
    <div v-if="loading" class="text-center py-10">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p class="mt-4">Loading earnings data...</p>
    </div>
    
    <div v-else-if="!detailedEarnings" class="text-center py-10">
      <div class="text-gray-500">
        <i class="fa-solid fa-money-bill-wave text-5xl mb-4"></i>
        <p>No earnings data available.</p>
      </div>
    </div>
    
    <div v-else>
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold mb-2">Total Earnings</h3>
          <p class="text-3xl font-bold text-green-600">${{ detailedEarnings.totalEarnings?.toFixed(2) }}</p>
          <p class="text-sm text-gray-500 mt-2">Lifetime earnings</p>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold mb-2">Base Salary</h3>
          <p class="text-3xl font-bold text-blue-600">${{ detailedEarnings.baseSalary?.toFixed(2) }}</p>
          <p class="text-sm text-gray-500 mt-2">Monthly base</p>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold mb-2">Hourly Rate</h3>
          <p class="text-3xl font-bold text-purple-600">${{ detailedEarnings.hourlyWage?.toFixed(2) }}/hr</p>
          <p class="text-sm text-gray-500 mt-2">Current rate</p>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold mb-2">Specialty</h3>
          <p class="text-xl font-bold">{{ detailedEarnings.specialty }}</p>
          <p class="text-sm text-gray-500 mt-2">Skill area</p>
        </div>
      </div>
      
      <!-- Yearly Earnings -->
      <div v-if="detailedEarnings.yearlyEarnings && detailedEarnings.yearlyEarnings.length > 0">
        <h2 class="text-xl font-semibold mb-4">Yearly Earnings</h2>
        
        <div v-for="yearData in detailedEarnings.yearlyEarnings" :key="yearData.year" class="mb-8">
          <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="bg-gray-50 px-6 py-4 border-b">
              <h3 class="text-lg font-medium">{{ yearData.year }} Summary</h3>
            </div>
            
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div>
                  <p class="text-sm text-gray-500">Total Salary</p>
                  <p class="text-2xl font-bold text-green-600">${{ yearData.totalSalary?.toFixed(2) }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Base Salary</p>
                  <p class="text-2xl font-bold">${{ yearData.baseSalary?.toFixed(2) }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Hourly Compensation</p>
                  <p class="text-2xl font-bold text-blue-600">${{ yearData.hourlyCompensation?.toFixed(2) }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Total Work Hours</p>
                  <p class="text-2xl font-bold">{{ yearData.totalWorkHours?.toFixed(1) }} hrs</p>
                </div>
              </div>
              
              <!-- Monthly Breakdown -->
              <h4 class="font-medium mb-3 mt-6">Monthly Breakdown</h4>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                      <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Salary</th>
                      <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Salary</th>
                      <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hourly Compensation</th>
                      <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Hours</th>
                      <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="monthData in yearData.monthlyEarnings" :key="`${yearData.year}-${monthData.month}`">
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {{ getMonthName(monthData.month) }} {{ monthData.year }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm">
                        ${{ monthData.totalSalary?.toFixed(2) }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm">
                        ${{ monthData.baseSalary?.toFixed(2) }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm">
                        ${{ monthData.hourlyCompensation?.toFixed(2) }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm">
                        {{ monthData.totalWorkHours?.toFixed(1) }} hrs
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                              :class="getSettlementStatusClass(monthData.settlementStatus)">
                          {{ formatSettlementStatus(monthData.settlementStatus) }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- No earnings data alert -->
      <div v-else class="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <i class="fa-solid fa-info-circle text-blue-400"></i>
          </div>
          <div class="ml-3">
            <p class="text-blue-700">
              No yearly earnings data is available yet. This information will appear after your first salary settlement.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useWorkerStore } from '@/stores/worker'
import { useToast } from 'vue-toastification'

const workerStore = useWorkerStore()
const toast = useToast()

const loading = ref(true)
const detailedEarnings = computed(() => workerStore.detailedEarnings)

onMounted(async () => {
  try {
    loading.value = true
    await workerStore.fetchDetailedEarnings()
  } catch (error) {
    toast.error('Failed to load earnings data')
  } finally {
    loading.value = false
  }
})

function getMonthName(monthNumber: number) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return months[monthNumber - 1] || 'Unknown'
}

function formatSettlementStatus(status: string) {
  if (!status) return 'Unknown'
  
  const statusMap: Record<string, string> = {
    'PENDING': 'Pending',
    'SETTLED': 'Settled',
    'APPROVED': 'Approved',
    'PAID': 'Paid'
  }
  
  return statusMap[status] || status
}

function getSettlementStatusClass(status: string) {
  if (!status) return 'bg-gray-100 text-gray-800'
  
  const statusClassMap: Record<string, string> = {
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'SETTLED': 'bg-green-100 text-green-800',
    'APPROVED': 'bg-blue-100 text-blue-800',
    'PAID': 'bg-purple-100 text-purple-800'
  }
  
  return statusClassMap[status] || 'bg-gray-100 text-gray-800'
}
</script>

<style scoped>
.earnings {
  min-height: 100vh;
  width: 80vw;
  padding: 1.5rem;
  background: linear-gradient(to bottom right, #f5f7fa, #c3cfe2);
  box-sizing: border-box;
}

.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}

.font-bold {
  font-weight: 700;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mb-8 {
  margin-bottom: 2rem;
}

.text-center {
  text-align: center;
}

.py-10 {
  padding-top: 2.5rem;
  padding-bottom: 2.5rem;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.rounded-full {
  border-radius: 9999px;
}

.h-12 {
  height: 3rem;
}

.w-12 {
  width: 3rem;
}

.border-b-2 {
  border-bottom-width: 2px;
  border-bottom-style: solid;
}

.border-primary {
  border-color: #3b82f6;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.mt-4 {
  margin-top: 1rem;
}

.text-gray-500 {
  color: #6b7280;
}

.text-5xl {
  font-size: 3rem;
  line-height: 1;
}

.grid {
  display: grid;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.gap-6 {
  gap: 1.5rem;
}

.bg-white {
  background-color: white;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.p-6 {
  padding: 1.5rem;
}

.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.font-semibold {
  font-weight: 600;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}

.text-green-600 {
  color: #059669;
}

.text-sm {
  color: #6b7280;
}

.mt-2 {
  margin-top: 0.5rem;
}

.text-blue-600 {
  color: #2563eb;
}

.text-purple-600 {
  color: #7c3aed;
}

.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.text-gray-50 {
  background-color: #f9fafb;
}

.px-6 {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.border-b {
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: #e5e7eb;
}

.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}

.font-medium {
  font-weight: 500;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.mt-6 {
  margin-top: 1.5rem;
}

.overflow-x-auto {
  overflow-x: auto;
}

.min-w-full {
  min-width: 100%;
}

.divide-y {
  border-top-width: 1px;
  border-bottom-width: 1px;
}

.divide-gray-200 {
  border-color: #e5e7eb;
}

.bg-gray-50 {
  background-color: #f9fafb;
}

.text-left {
  text-align: left;
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.uppercase {
  text-transform: uppercase;
}

.tracking-wider {
  letter-spacing: 0.05em;
}

.whitespace-nowrap {
  white-space: nowrap;
}

.px-2 {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.inline-flex {
  display: inline-flex;
}

.leading-5 {
  line-height: 1.25rem;
}

.bg-blue-50 {
  background-color: #eff6ff;
}

.border-l-4 {
  border-left-width: 4px;
}

.border-blue-400 {
  border-color: #60a5fa;
}

.flex {
  display: flex;
}

.flex-shrink-0 {
  flex-shrink: 0;
}

.text-blue-400 {
  color: #60a5fa;
}

.ml-3 {
  margin-left: 0.75rem;
}

.text-blue-700 {
  color: #1d4ed8;
}

@media (min-width: 768px) {
  .md\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>