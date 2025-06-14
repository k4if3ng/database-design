<template>
  <div class="layout">
    <nav class="sidebar">
      <div class="logo">
        <h2>用户中心</h2>
      </div>

      <div class="profile-section">
        <!-- <div class="avatar">
          <img :src="user?.avatar || '/images/default-avatar.png'" alt="头像">
        </div> -->
        <div class="user-details">
          <h3>{{ user?.username }}</h3>
          <button @click="showProfileModal = true" class="edit-profile-btn">
            <i class="fa-solid fa-user-pen"></i> 编辑资料
          </button>
        </div>
      </div>

      <ul class="nav-menu">
        <li>
          <router-link to="/user/dashboard" class="nav-link">
            <i class="fa-solid fa-gauge-high"></i>
            <span>仪表板</span>
          </router-link>
        </li>
        <li>
          <router-link to="/user/vehicles" class="nav-link">
            <i class="fa-solid fa-car"></i>
            <span>我的车辆</span>
          </router-link>
        </li>
        <li>
          <router-link to="/user/repair-orders" class="nav-link">
            <i class="fa-solid fa-clipboard-list"></i>
            <span>维修工单</span>
          </router-link>
        </li>
        <li>
          <router-link to="/user/repair-logs" class="nav-link">
            <i class="fa-solid fa-history"></i>
            <span>维修记录</span>
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

    <!-- 个人信息编辑模态框 -->
    <div v-if="showProfileModal" class="profile-modal-overlay">
      <div class="profile-modal">
        <div class="modal-header">
          <h3>编辑个人资料</h3>
          <button @click="showProfileModal = false" class="close-btn">
            <i class="fa-solid fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>用户名</label>
            <input type="text" v-model="profileForm.username" class="form-control" placeholder="用户名">
          </div>
          
          <div class="form-group">
            <label>手机号码</label>
            <input type="text" v-model="profileForm.phone" class="form-control" placeholder="手机号码">
          </div>

        </div>
        
        <div class="modal-footer">
          <button @click="showProfileModal = false" class="cancel-btn">取消</button>
          <button @click="saveProfile" class="save-btn" :disabled="updating">
            {{ updating ? '保存中...' : '保存修改' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import type { User } from '@/types/index'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()
const user = ref<User | null>(null)

const showProfileModal = ref(false)
const updating = ref(false)

const profileForm = reactive({
  username: '',
  phone: '',
})

// 监听用户数据变化
watchEffect(() => {
  if (
    authStore.user &&
    authStore.isUser &&
    'username' in authStore.user &&
    'phone' in authStore.user
  ) {
    user.value = authStore.user as User
    profileForm.username = authStore.user.username || ''
    profileForm.phone = authStore.user.phone || ''
  }
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const saveProfile = async () => {
  try {
    updating.value = true
    await authStore.updateUserInfo({
      username: profileForm.username,
      phone: profileForm.phone,
    })
    toast.success('个人资料已更新')
    showProfileModal.value = false
  } catch (error) {
    toast.error('更新个人资料失败')
  } finally {
    updating.value = false
  }
}

onMounted(async () => {
  await authStore.fetchUserInfo()
  if (
    authStore.user &&
    'username' in authStore.user &&
    'phone' in authStore.user
  ) {
    const user = authStore.user as { username: string; phone: string }
    profileForm.username = user.username || ''
    profileForm.phone = user.phone || ''
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

.edit-profile-btn {
  margin-top: 10%;
  background: transparent;
  border: 1px solid #3498db;
  color: #3498db;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s;
}

.edit-profile-btn:hover {
  background: #3498db;
  color: white;
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

/* 模态框样式 */
.profile-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.profile-modal {
  background: white;
  border-radius: 8px;
  width: 500px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #64748b;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 1rem;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1rem;
  border: 2px solid #e5e7eb;
}

.avatar-input {
  display: none;
}

.upload-btn {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.cancel-btn {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.save-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.save-btn:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}
</style>