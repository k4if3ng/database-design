<template>
  <div class="users-page">
    <div class="page-header">
      <h1>用户管理</h1>
      <div class="stats-summary">
        <div class="stat-item">
          <span class="stat-label">总用户数:</span>
          <span class="stat-value">{{ users.length }}</span>
        </div>
      </div>
    </div>

    <div class="filters">
      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索用户名或手机号..."
          class="search-input"
        />
      </div>
    </div>

    <div class="users-table">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <table v-else>
        <thead>
          <tr>
            <th>用户ID</th>
            <th>用户名</th>
            <th>手机号</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.userId">
            <td>{{ user.userId }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.phone }}</td>
            <td>
              <button @click="viewUserDetails(user)" class="btn-view">查看详情</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 用户详情模态框 -->
    <div v-if="showUserModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>用户详情</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="user-details">
            <p><strong>用户ID:</strong> {{ selectedUser?.userId }}</p>
            <p><strong>用户名:</strong> {{ selectedUser?.username }}</p>
            <p><strong>手机号:</strong> {{ selectedUser?.phone }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import type { User } from '@/types'

const adminStore = useAdminStore()
const users = computed(() => adminStore.users)
const loading = computed(() => adminStore.loading)
const error = computed(() => adminStore.error)

const searchQuery = ref('')
const showUserModal = ref(false)
const selectedUser = ref<User | null>(null)

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  return users.value.filter(user => 
    user.username.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    user.phone.includes(searchQuery.value)
  )
})

const formatDate = (dateString?: string) => {
  if (!dateString) return '未知'
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const viewUserDetails = (user: User) => {
  selectedUser.value = user
  showUserModal.value = true
}

const closeModal = () => {
  showUserModal.value = false
  selectedUser.value = null
}

onMounted(() => {
  adminStore.fetchUsers()
})
</script>

<style scoped>
.users-page {
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

.stats-summary {
  display: flex;
  gap: 2rem;
}

.stat-item {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-label {
  color: #666;
  margin-right: 0.5rem;
}

.stat-value {
  font-weight: bold;
  color: #007bff;
}

.filters {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 1rem;
}

.search-input {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 300px;
}

.users-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.btn-view {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-view:hover {
  background: #0056b3;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error {
  color: #dc3545;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 1rem;
}

.user-details p {
  margin: 0.5rem 0;
}
</style>