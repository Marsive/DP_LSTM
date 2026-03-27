<template>
  <div class="login-container">
    <!-- Abstract light background shapes -->
    <div class="bg-shape shape-1"></div>
    <div class="bg-shape shape-2"></div>

    <div class="login-box">
      <div class="login-header">
        <img src="/logo.png" class="logo-img" alt="logo" />
        <h2>DP-LSTM 隐私保护系统</h2>
        <p>欢迎回到管理控制台</p>
      </div>
      
      <el-form 
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @keyup.enter="handleLogin"
        label-position="top"
      >
        <el-form-item prop="username">
          <el-input 
            v-model="loginForm.username" 
            placeholder="请输入管理员账号 ( admin )"
            :prefix-icon="User"
            size="large"
          />
        </el-form-item>
        
        <el-form-item prop="password" style="margin-top: 24px;">
          <el-input 
            v-model="loginForm.password" 
            type="password"
            placeholder="请输入密码 ( 123456 )"
            :prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>
        
        <el-form-item style="margin-top: 32px;">
          <el-button 
            type="primary" 
            class="login-btn btn-gradient"
            :loading="loading"
            @click="handleLogin"
            size="large"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-footer">
        <p>Data Privacy & Deep Learning System</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const loginFormRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = reactive<FormRules>({
  username: [
    { required: true, message: '账号不能为空', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' }
  ]
})

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      // 模拟登录请求延迟
      setTimeout(() => {
        loading.value = false
        if (loginForm.username === 'admin' && loginForm.password === '123456') {
          ElMessage.success('登录成功')
          localStorage.setItem('token', 'mock-jwt-token-123456')
          localStorage.setItem('username', loginForm.username)
          router.push('/')
        } else {
          ElMessage.error('账号或密码错误（默认 admin / 123456）')
        }
      }, 600)
    }
  })
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-dark);
  position: relative;
  overflow: hidden;
}

.login-box {
  width: 440px;
  padding: 48px 40px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
  z-index: 10;
  position: relative;
  display: flex;
  flex-direction: column;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-img {
  width: 56px;
  height: 56px;
  margin-bottom: 16px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}

.login-header h2 {
  font-size: 22px;
  color: var(--text-primary);
  margin-bottom: 8px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.login-header p {
  color: var(--text-secondary);
  font-size: 14px;
}

.login-form {
  margin-top: 8px;
}

.login-btn {
  width: 100%;
  font-size: 16px;
  border-radius: 8px;
  height: 48px;
  letter-spacing: 4px;
}

.login-footer {
  margin-top: 24px;
  text-align: center;
  color: var(--text-placeholder);
  font-size: 12px;
}

/* 浅色干净的大背景块点缀 */
.bg-shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 1;
  opacity: 0.6;
}

.shape-1 {
  width: 600px;
  height: 600px;
  background: #E0E7FF;
  top: -200px;
  right: -100px;
}

.shape-2 {
  width: 500px;
  height: 500px;
  background: #E0F2FE;
  bottom: -150px;
  left: -150px;
}

:deep(.el-input__inner) {
  height: 44px;
}
</style>
