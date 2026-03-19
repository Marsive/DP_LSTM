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
        <img src="/dp_lstm.svg" alt="logo" style="width: 24px; height: 24px; margin-right: 8px;" />
        DP-LSTM 隐私保护
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
          <el-tag type="info" effect="dark" round style="margin-left: 12px">
            车联网路径隐私保护系统
          </el-tag>
        </div>
        
        <div class="top-bar-right">
          <el-dropdown @command="handleCommand" trigger="click">
            <span class="user-dropdown">
              <el-avatar :size="32" icon="UserFilled" class="user-avatar" />
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

// 菜单路由（从 router 配置中提取有 meta.title 的路由）
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
.sidebar-menu {
  border-right: none;
  flex: 1;
  padding-top: 8px;
}

.sidebar-menu .el-menu-item {
  height: 48px;
  line-height: 48px;
  margin: 4px 8px;
  border-radius: 8px;
  font-size: 14px;
}

.sidebar-menu .el-menu-item.is-active {
  background: linear-gradient(135deg, rgba(102,126,234,0.2), rgba(118,75,162,0.2)) !important;
  color: #667eea !important;
}

.top-bar-left, .top-bar-right {
  display: flex;
  align-items: center;
}

.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.user-dropdown:hover {
  background-color: var(--bg-card-hover);
}

.user-avatar {
  background: var(--gradient-primary);
  margin-right: 8px;
}

.username {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
}
</style>
