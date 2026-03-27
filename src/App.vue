<template>
  <template v-if="route.meta.hideLayout">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </template>

  <div v-else class="layout-container">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <img src="/logo.png" alt="logo" class="logo-img-small" />
        <span class="logo-text">DP-LSTM 分析台</span>
      </div>
      <el-menu
        :default-active="currentRoute"
        router
        class="sidebar-menu"
      >
        <el-menu-item
          v-for="route in menuRoutes"
          :key="route.path"
          :index="route.path"
        >
          <el-icon><component :is="route.meta.icon" /></el-icon>
          <span>{{ route.meta.title }}</span>
        </el-menu-item>
      </el-menu>
    </aside>

    <!-- 主内容区 -->
    <div class="main-content">
      <header class="top-bar">
        <div class="top-bar-left">
          <h2>{{ currentTitle }}</h2>
        </div>
        
        <div class="top-bar-right">
          <el-dropdown @command="handleCommand" trigger="click">
            <span class="user-dropdown">
              <el-avatar :size="30" class="user-avatar">
                <el-icon><UserFilled /></el-icon>
              </el-avatar>
              <span class="username">{{ username }}</span>
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <main class="page-container">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { UserFilled, ArrowDown } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const currentRoute = computed(() => route.path)
const currentTitle = computed(() => (route.meta?.title as string) || '总控台')
const username = computed(() => localStorage.getItem('username') || 'admin')

const menuRoutes = [
  { path: '/dashboard', meta: { title: '总控台', icon: 'Odometer' } },
  { path: '/data-simulation', meta: { title: '数据模拟', icon: 'MapLocation' } },
  { path: '/privacy-protection', meta: { title: '隐私保护', icon: 'Lock' } },
  { path: '/model-training', meta: { title: '模型训练', icon: 'Cpu' } },
  { path: '/evaluation', meta: { title: '效果评估', icon: 'DataAnalysis' } },
]

const handleCommand = (command: string) => {
  if (command === 'logout') {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    ElMessage.success('已退出登录')
    router.push('/login')
  }
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  background-color: #FFFFFF;
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

.sidebar-logo {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  border-bottom: 1px solid var(--border-color);
}

.logo-img-small {
  width: 28px;
  height: 28px;
  margin-right: 12px;
  border-radius: 6px;
  object-fit: cover;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.logo-text {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.5px;
}

.sidebar-menu {
  padding: 16px 12px;
}

.sidebar-menu .el-menu-item {
  height: 44px;
  line-height: 44px;
  margin-bottom: 4px;
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-secondary) !important;
  transition: all 0.2s;
}

.sidebar-menu .el-menu-item:hover {
  background-color: #F8FAFC !important;
  color: var(--text-primary) !important;
}

.sidebar-menu .el-menu-item.is-active {
  background-color: #EEF2FF !important;
  color: var(--primary-color) !important;
  font-weight: 500;
}

.top-bar {
  height: 60px;
  background-color: #FFFFFF;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  padding: 0 32px;
  justify-content: space-between;
}

.top-bar h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid var(--border-color);
  transition: background-color 0.3s;
}

.user-dropdown:hover {
  background-color: #F8FAFC;
}

.user-avatar {
  background-color: #EEF2FF;
  color: var(--primary-color);
  margin-right: 8px;
}

.username {
  color: var(--text-regular);
  font-size: 14px;
  font-weight: 500;
}
</style>
