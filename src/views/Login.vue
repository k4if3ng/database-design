<template>
  <div class="login-container">
    <div class="login-form">
    <h2>登录</h2>

      <div class="role-tabs">
        <button
          v-for="role in roles"
          :key="role.value"
          :class="{ active: selectedRole === role.value }"
          @click="selectedRole = role.value as typeof selectedRole.value"
        >
          {{ role.label }}
        </button>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <input v-model="form.username" type="text" placeholder="用户名" required />
        </div>

        <div class="form-group">
          <input v-model="form.password" type="password" placeholder="密码" required />
        </div>

        <button type="submit" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <div class="links" v-if="selectedRole === 'user'">
        <router-link to="/register">没有账号？点击注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { LoginRequest } from '@/types'

const router = useRouter()
const authStore = useAuthStore()

const selectedRole = ref<'user' | 'worker' | 'admin'>('user')
const loading = ref(false)

const roles = [
  { value: 'user', label: '用户' },
  { value: 'worker', label: '维修人员' },
  { value: 'admin', label: '管理员' },
]

const form = ref<LoginRequest>({
  username: '',
  password: '',
})

const handleLogin = async () => {
  try {
    loading.value = true
    await authStore.login(form.value, selectedRole.value)

    const redirectMap = {
      user: '/user/dashboard',
      worker: '/worker/dashboard',
      admin: '/admin/dashboard',
    }

    router.push(redirectMap[selectedRole.value])
  } catch (error: any) {
    alert(error.response?.data?.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 80%;
  max-width: 600px;
}

.role-tabs {
  display: flex;
  margin-bottom: 1.5rem;
}

.role-tabs button {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  background: #f5f5f5;
  cursor: pointer;
}

.role-tabs button.active {
  background: #667eea;
  color: white;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button[type='submit'] {
  width: 100%;
  padding: 0.75rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button[type='submit']:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.links {
  text-align: center;
  margin-top: 1rem;
}
</style>
