<!-- src/views/layouts/UserLayout.vue -->
<template>
  <div class="layout">
    <nav class="sidebar">
      <div class="logo">
        <h2>用户中心</h2>
      </div>

      <ul class="nav-menu">
        <li>
          <router-link to="/user/dashboard" class="nav-link">
            <span>仪表板</span>
          </router-link>
        </li>
        <li>
          <router-link to="/user/vehicles" class="nav-link">
            <span>我的车辆</span>
          </router-link>
        </li>
        <li>
          <router-link to="/user/repair-orders" class="nav-link">
            <span>维修工单</span>
          </router-link>
        </li>
        <li>
          <router-link to="/user/repair-logs" class="nav-link">
            <span>维修记录</span>
          </router-link>
        </li>
      </ul>

      <div class="user-info">
        <p>{{ user?.username }}</p>
        <button @click="handleLogout">退出登录</button>
      </div>
    </nav>

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const { user } = authStore

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

onMounted(() => {
  authStore.fetchUserInfo()
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

.main-content {
  flex: 1;
  background: #f8f9fa;
  overflow-y: auto;
}
</style>
