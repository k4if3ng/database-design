<template>
  <div class="layout">
    <nav class="sidebar">
      <div class="logo">
        <h2>维修人员中心</h2>
      </div>

      <div class="profile-section">
        <!-- <div class="avatar">
          <img :src="worker?.avatar || '/images/default-avatar.png'" alt="头像">
        </div> -->
        <div class="user-details">
          <h3>ID: {{ worker?.workerId}}</h3>
          <h3>用户名: {{ worker?.workerName }}</h3>
          <h3>{{ worker?.specialty }}</h3>
          <!-- <button @click="showProfileModal = true" class="edit-profile-btn">
            <i class="fa-solid fa-user-pen"></i> 编辑资料
          </button> -->
        </div>
      </div>

      <ul class="nav-menu">
        <li>
          <router-link to="/worker/dashboard" class="nav-link">
            <span>仪表板</span>
          </router-link>
        </li>
        <li>
          <router-link to="/worker/orders" class="nav-link">
            <span>工单列表</span>
          </router-link>
        </li>
        <li>
          <router-link to="/worker/orders/:id" class="nav-link">
            <span>工单详情</span>
          </router-link>
        </li>
        <li>
          <router-link to="/worker/performance" class="nav-link">
            <span>绩效与收入</span>
          </router-link>
        </li>
      </ul>

      <div class="user-info">
        <button @click="handleLogout">退出登录</button>
      </div>
    </nav>

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import type { Worker } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()
const worker = ref<Worker | null>(null)

watchEffect(() => {
  if (authStore.isWorker && authStore.user) {
    worker.value = authStore.user as Worker
  }
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

onMounted(async () => {
  console.log('Worker Layout Mounted')
  console.log('Before fetch - authStore.user:', authStore.user)
  console.log('User role:', authStore.userRole)
  
  try {
    // 确保异步加载完成
    await authStore.fetchUserInfo()
    console.log('After fetch - authStore.user:', authStore.user)
    
    if (authStore.isWorker && authStore.user) {
      worker.value = authStore.user as Worker
    }
  } catch (error) {
    console.error('Error fetching worker info:', error)
    toast.error('无法加载用户信息')
  }
})
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 20vw;
  background: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
}

.logo {
  padding: 1.5rem;
  border-bottom: 1px solid #34495e;
}

.logo h2 {
  margin: 0;
  font-size: 1.2rem;
}

.profile-section {
  padding: 0.2rem;
  display: flex;
  flex-direction: column;
  align-items: left;
  border-bottom: 1px solid #34495e;
}

.user-details {
  text-align: left;
  padding: 1.5rem;
}

.user-details h3 {
  margin: 0;
  font-size: 1.2rem;
}

.nav-menu {
  flex: 1;
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-link {
  display: block;
  padding: 1rem 1.5rem;
  color: white;
  text-decoration: none;
  transition: background-color 0.2s;
}

.nav-link:hover,
.nav-link.router-link-active {
  background: #34495e;
}

.user-info {
  padding: 1.5rem;
  border-top: 1px solid #34495e;
}

.user-info button {
  width: 100%;
  padding: 0.5rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 0.5rem;
}

.logout-btn {
  width: 100%;
  padding: 0.5rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-btn i {
  margin-right: 0.5rem;
}

.main-content {
  flex: 1;
  background: #f8f9fa;
  overflow-y: auto;
}
</style>