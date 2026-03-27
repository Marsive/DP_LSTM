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
        <CustomIcons name="logo" class="logo-custom" />
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
          <CustomIcons :name="String(route.meta.icon)" style="margin-right: 14px;" />
          <span class="menu-title">{{ route.meta.title }}</span>
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

import CustomIcons from './components/CustomIcons.vue'

const route = useRoute()
const router = useRouter()
const currentRoute = computed(() => route.path)
const currentTitle = computed(() => (route.meta?.title as string) || '总控台')
const username = computed(() => localStorage.getItem('username') || 'admin')

const menuRoutes = [
  { path: '/dashboard', meta: { title: '总控台', icon: 'dashboard' } },
  { path: '/data-simulation', meta: { title: '数据模拟', icon: 'data-sim' } },
  { path: '/privacy-protection', meta: { title: '隐私保护', icon: 'privacy' } },
  { path: '/model-training', meta: { title: '模型训练', icon: 'model' } },
  { path: '/evaluation', meta: { title: '效果评估', icon: 'eval' } },
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

.logo-custom {
  width: 28px;
  height: 28px;
  margin-right: 12px;
  color: var(--text-primary);
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
  height: 48px;
  line-height: 48px;
  margin-bottom: 6px;
  border-radius: 0 8px 8px 0;
  border-left: 2px solid transparent;
  font-size: 14px;
  color: var(--text-secondary) !important;
  transition: all 0.2s;
  padding-left: 18px !important;
  background-color: transparent !important;
}

.sidebar-menu .el-menu-item:hover {
  background-color: #FAFAFA !important;
  color: var(--text-primary) !important;
}

.menu-title {
  letter-spacing: 0.5px;
}

.sidebar-menu .el-menu-item.is-active {
  background-color: #FAFAFA !important;
  color: var(--text-primary) !important;
  border-left: 2px solid var(--primary-color);
  font-weight: 700;
}

.sidebar-menu .el-menu-item.is-active .menu-title {
  font-weight: 700;
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
  border-radius: 0;
  border: 1px solid #EAEAEA;
  background-color: #FFFFFF;
  transition: border-color 0.2s, background-color 0.2s;
}

.user-dropdown:hover {
  background-color: #FAFAFA;
  border-color: #CCCCCC;
}

.user-avatar {
  background-color: transparent !important;
  color: #111111 !important;
  margin-right: 8px;
  border-radius: 0 !important;
}

.username {
  color: #111111;
  font-size: 14px;
  font-weight: 700;
  margin-right: 6px;
}
</style>
