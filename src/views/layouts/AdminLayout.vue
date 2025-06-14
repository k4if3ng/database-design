<template>
  <div class="layout">
    <nav class="sidebar">
      <div class="logo">
        <h2>管理员中心</h2>
      </div>

      <div class="profile-section">
        <div class="user-details">
          <h3>用户名: {{ admin?.username || 'admin' }}</h3>
          <h3>角色: 管理员</h3>
        </div>
      </div>

      <ul class="nav-menu">
        <li>
          <router-link to="/admin/dashboard" class="nav-link">
            <i class="fa-solid fa-gauge-high"></i>
            <span>仪表板</span>
          </router-link>
        </li>
        <li>
          <router-link to="/admin/users" class="nav-link">
            <i class="fa-solid fa-users"></i>
            <span>用户管理</span>
          </router-link>
        </li>
        <li>
          <router-link to="/admin/workers" class="nav-link">
            <i class="fa-solid fa-user-cog"></i>
            <span>维修人员管理</span>
          </router-link>
        </li>
        <li>
          <router-link to="/admin/repair-orders" class="nav-link">
            <i class="fa-solid fa-clipboard-list"></i>
            <span>维修工单管理</span>
          </router-link>
        </li>
        <li>
          <router-link to="/admin/statistics" class="nav-link">
            <i class="fa-solid fa-chart-line"></i>
            <span>统计分析</span>
          </router-link>
        </li>
        <li>
          <router-link to="/admin/audit-logs" class="nav-link">
            <i class="fa-solid fa-file-alt"></i>
            <span>审计日志</span>
          </router-link>
        </li>
      </ul>

      <div class="user-info">
        <button @click="handleLogout" class="logout-btn">
          <i class="fa-solid fa-sign-out-alt"></i> 退出登录
        </button>
      </div>
    </nav>

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { User } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const admin = ref<User | null>(null)

// 监听用户数据变化
watchEffect(() => {
  if (authStore.user && authStore.isAdmin) {
    admin.value = authStore.user as User
  }
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
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