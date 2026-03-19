<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <img src="/dp_lstm.svg" class="logo-img" alt="logo" />
        <h2>DP-LSTM 隐私保护系统</h2>
        <p>欢迎回来，请登录您的账户</p>
      </div>
      
      <el-form 
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input 
            v-model="loginForm.username" 
            placeholder="请输入账号 ( admin )"
            :prefix-icon="User"
            size="large"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password"
            placeholder="请输入密码 ( 123456 )"
            :prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>
        
        <el-form-item>
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
    </div>
    
    <!-- 动态背景球 -->
    <div class="bg-shape shape-1"></div>
    <div class="bg-shape shape-2"></div>
    <div class="bg-shape shape-3"></div>
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
  width: 420px;
  padding: 40px;
  background: rgba(26, 35, 50, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.3);
  z-index: 10;
  position: relative;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo-img {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  filter: drop-shadow(0 0 12px rgba(102, 126, 234, 0.6));
}

.login-header h2 {
  font-size: 24px;
  color: var(--text-primary);
  margin-bottom: 8px;
  font-weight: 600;
  letter-spacing: 1px;
}

.login-header p {
  color: var(--text-secondary);
  font-size: 14px;
}

.login-form {
  margin-top: 20px;
}

.login-btn {
  width: 100%;
  margin-top: 10px;
  font-size: 16px;
  border-radius: 8px;
}

/* 动态背景修饰 */
.bg-shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 1;
  opacity: 0.5;
  animation: float 10s infinite ease-in-out alternate;
}

.shape-1 {
  width: 400px;
  height: 400px;
  background: #667eea;
  top: -100px;
  right: -100px;
  animation-delay: 0s;
}

.shape-2 {
  width: 300px;
  height: 300px;
  background: #764ba2;
  bottom: -50px;
  left: -100px;
  animation-delay: -2s;
}

.shape-3 {
  width: 250px;
  height: 250px;
  background: #38f9d7;
  bottom: 20%;
  right: 15%;
  opacity: 0.2;
  animation-delay: -4s;
}

@keyframes float {
  0% { transform: translate(0, 0); }
  100% { transform: translate(30px, 40px); }
}

/* 覆盖 input 样式，让登录框更通透 */
:deep(.el-input__wrapper) {
  background-color: rgba(30, 42, 58, 0.6) !important;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1) inset !important;
}

:deep(.el-input__inner) {
  height: 44px;
}
</style>
