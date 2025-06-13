<template>
  <div class="register-container">
    <div class="register-form">
      <h2>用户注册</h2>
      
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="username">用户名</label>
          <input 
            id="username"
            v-model="form.username" 
            type="text" 
            placeholder="请输入用户名" 
            required 
          />
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <input 
            id="password"
            v-model="form.password" 
            type="password" 
            placeholder="请输入密码" 
            required 
          />
        </div>

        <div class="form-group">
          <label for="confirmedPassword">确认密码</label>
          <input 
            id="confirmedPassword"
            v-model="form.confirmedPassword" 
            type="password" 
            placeholder="请再次输入密码" 
            required 
          />
          <div class="error-message" v-if="passwordMismatch">
            两次输入的密码不一致
          </div>
        </div>

        <div class="form-group">
          <label for="phone">手机号码</label>
          <input 
            id="phone"
            v-model="form.phone" 
            type="tel" 
            placeholder="请输入手机号码" 
            required 
          />
        </div>

        <button type="submit" :disabled="loading || passwordMismatch">
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </form>

      <div class="links">
        <router-link to="/login">已有账号？返回登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/services/auth'
import type { RegisterRequest } from '@/types'

const router = useRouter()
const loading = ref(false)

const form = ref<RegisterRequest>({
  username: '',
  password: '',
  confirmedPassword: '',
  phone: ''
})

const passwordMismatch = computed(() => {
  return form.value.password !== '' && 
         form.value.confirmedPassword !== '' && 
         form.value.password !== form.value.confirmedPassword
})

const handleRegister = async () => {
  if (passwordMismatch.value) {
    return
  }
  
  try {
    loading.value = true
    const response = await authService.register(form.value)
    
    alert('注册成功！请登录您的账号')
    router.push('/login')
  } catch (error: any) {
    console.error('Registration error:', error)
    alert(error.response?.data?.message || '注册失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 50%;
  max-width: 800px;
  min-width: 600px;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.error-message {
  color: #e53e3e;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

button[type='submit'] {
  width: 100%;
  padding: 0.75rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
}

button[type='submit']:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.links {
  text-align: center;
  margin-top: 1rem;
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #4a5568;
}
</style>