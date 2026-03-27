<template>
  <div class="login-container">
    <!-- Top Success Banner -->
    <div class="logout-banner">已退出登录</div>

    <div class="login-box">
      <div class="login-header">
        <div class="logo-container">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#333333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="logo-svg">
            <path d="M12 3 L 4 6 V 11 C 4 16 7 20 12 22 C 17 20 20 16 20 11 V 6 Z" fill="#FFFFFF" />
            <text x="12" y="15" font-family="serif" font-size="12" font-weight="bold" font-style="italic" text-anchor="middle" fill="#333333" stroke="none">ε</text>
          </svg>
        </div>
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
            class="login-btn btn-black-flat"
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
  background-color: #FFFFFF;
  position: relative;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

.logout-banner {
  position: absolute;
  top: 0;
  width: 100%;
  height: 40px;
  line-height: 40px;
  text-align: center;
  background-color: #F0FDF4;
  color: #166534;
  font-size: 13px;
  font-weight: 500;
  border-bottom: 1px solid #DCFCE7;
}

.login-box {
  width: 440px;
  padding: 48px 40px;
  background: #FFFFFF;
  border: 1px solid #EAEAEA;
  border-radius: 0;
  box-shadow: none;
  z-index: 10;
  position: relative;
  display: flex;
  flex-direction: column;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.logo-svg {
  display: block;
}

.login-header h2 {
  font-size: 24px;
  color: #111111;
  margin-bottom: 12px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.login-header p {
  color: #888888;
  font-size: 14px;
}

.login-form {
  margin-top: 16px;
}

.btn-black-flat {
  background: #000000 !important;
  border: 1px solid #000000 !important;
  color: #FFFFFF !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  transition: opacity 0.2s ease;
}
.btn-black-flat:hover {
  opacity: 0.85;
}

.login-btn {
  width: 100%;
  font-size: 15px;
  font-weight: 700;
  height: 48px;
  letter-spacing: 2px;
}

.login-footer {
  margin-top: 32px;
  text-align: center;
  color: #AAAAAA;
  font-size: 12px;
  letter-spacing: 0.5px;
}

/* 去除不需要的发光背景，保留纯净留白 */
.bg-shape {
  display: none;
}

/* 极致扁平下划线输入框 */
:deep(.el-input__wrapper) {
  background-color: transparent !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  border-bottom: 1px solid #EAEAEA !important;
  padding: 0 4px !important;
  transition: border-color 0.2s ease;
}
:deep(.el-input__wrapper.is-focus) {
  border-bottom: 1px solid #111111 !important;
}
:deep(.el-input__inner) {
  height: 44px;
  color: #111111 !important;
}
:deep(.el-input__inner::placeholder) {
  color: #BBBBBB !important;
}
:deep(.el-icon) {
  color: #666666 !important;
}
</style>
