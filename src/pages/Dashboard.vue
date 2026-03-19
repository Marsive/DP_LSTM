<template>
  <div class="dashboard-page">
    <div class="page-header">
      <h1 class="page-title">总控台</h1>
      <p class="page-desc">车联网路径隐私保护系统的核心指标与功能入口。</p>
    </div>

    <!-- 核心 KPI -->
    <el-row :gutter="20" class="kpi-row">
      <el-col :span="6" v-for="(stat, idx) in kpiList" :key="idx">
        <el-card class="kpi-card" shadow="never">
          <div class="kpi-content">
            <div class="kpi-info">
              <div class="kpi-title">{{ stat.title }}</div>
              <div class="kpi-value">{{ stat.value }}</div>
            </div>
            <div class="kpi-icon" :class="stat.colorClass">
              <el-icon><component :is="stat.icon" /></el-icon>
            </div>
          </div>
          <div class="kpi-footer">
            <span class="kpi-trend" :class="stat.trend > 0 ? 'text-success' : 'text-neutral'">
              <el-icon v-if="stat.trend > 0"><Top /></el-icon>
              <el-icon v-else-if="stat.trend < 0"><Bottom /></el-icon>
              <el-icon v-else><Minus /></el-icon>
              {{ Math.abs(stat.trend) }}%
            </span>
            <span class="kpi-subtext">{{ stat.desc }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 工作流主视图 -->
    <h3 class="section-title">业务流程概览</h3>
    <el-row :gutter="20" style="margin-bottom: 24px;">
      <el-col :span="6" v-for="(step, index) in workflows" :key="index">
        <div class="flow-card" @click="router.push(step.path)">
          <div class="flow-header">
            <div class="flow-step-num">Step 0{{ index + 1 }}</div>
            <el-icon class="flow-icon"><component :is="step.icon" /></el-icon>
          </div>
          <h4>{{ step.title }}</h4>
          <p>{{ step.desc }}</p>
          <div class="flow-arrow" v-if="index < 3">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <!-- 快捷入口 -->
      <el-col :span="12">
        <el-card shadow="never" class="action-card">
          <template #header>
            <span class="card-title">快捷操作</span>
          </template>
          <div class="quick-actions">
            <el-button class="action-btn" @click="router.push('/data-simulation')" plain>
              <el-icon><MapLocation /></el-icon>
              轨迹数据模拟生成
            </el-button>
            <el-button class="action-btn" @click="router.push('/privacy-protection')" plain>
              <el-icon><Lock /></el-icon>
              配置隐私保护策略
            </el-button>
            <el-button class="action-btn" @click="router.push('/model-training')" plain>
              <el-icon><Cpu /></el-icon>
              启动 LSTM 训练任务
            </el-button>
            <el-button class="action-btn" @click="router.push('/evaluation')" plain>
              <el-icon><DataAnalysis /></el-icon>
              生成最新效用评估
            </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 系统状态/近期摘要 placeholder -->
      <el-col :span="12">
        <el-card shadow="never" class="status-card">
          <template #header>
            <span class="card-title">系统运行状态</span>
          </template>
          <div class="status-list">
            <div class="status-item">
              <span class="status-dot success"></span>
              <span class="status-text">基础数据模拟服务</span>
              <span class="status-time">运行正常</span>
            </div>
            <div class="status-item">
              <span class="status-dot success"></span>
              <span class="status-text">差分隐私计算引擎</span>
              <span class="status-time">运行正常</span>
            </div>
            <div class="status-item">
              <span class="status-dot warning"></span>
              <span class="status-text">LSTM 深度预测模型</span>
              <span class="status-time">待新训练</span>
            </div>
            <div class="status-item">
              <span class="status-dot success"></span>
              <span class="status-text">综合分析评估模块</span>
              <span class="status-time">已就绪</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Top, Bottom, Minus, ArrowRight, MapLocation, Lock, Cpu, DataAnalysis } from '@element-plus/icons-vue'
import { trajectoryApi, evaluationApi, modelApi } from '../services/api'

const router = useRouter()

const kpiList = ref([
  { title: '仿真轨迹总量', value: '0', icon: 'MapLocation', colorClass: 'icon-primary', trend: 12, desc: '较上周新增比率' },
  { title: '已保护轨迹数', value: '0', icon: 'Lock', colorClass: 'icon-success', trend: 8, desc: '成功施加噪声保护' },
  { title: '模型训练次数', value: '0', icon: 'Cpu', colorClass: 'icon-warning', trend: 0, desc: '累计参数优化记录' },
  { title: '效用评估报告', value: '0', icon: 'DataAnalysis', colorClass: 'icon-info', trend: 5, desc: '含位置熵等指标' },
])

const workflows = [
  { title: '数据模拟层', desc: '基于城市路网，生成大量动态车辆行驶轨迹。', icon: 'MapLocation', path: '/data-simulation' },
  { title: '隐私保护层', desc: '注入拉普拉斯噪声，保护车辆真实敏感位置信息。', icon: 'Lock', path: '/privacy-protection' },
  { title: 'AI 训练层', desc: '训练 LSTM 网络，通过学习生成平滑虚假轨迹。', icon: 'Cpu', path: '/model-training' },
  { title: '分析评估层', desc: '计算位置熵与相似度，衡量安全性与数据可用性。', icon: 'DataAnalysis', path: '/evaluation' }
]

onMounted(async () => {
  try {
    const [trajRes, protRes, modelRes, evalRes] = await Promise.allSettled([
      trajectoryApi.list(1, 1, false),
      trajectoryApi.list(1, 1, true),
      modelApi.getRecords(),
      evaluationApi.getResults(1),
    ])

    if (trajRes.status === 'fulfilled') {
      kpiList.value[0].value = String(trajRes.value.data?.data?.total ?? 0)
    }
    if (protRes.status === 'fulfilled') {
      kpiList.value[1].value = String(protRes.value.data?.data?.total ?? 0)
    }
    if (modelRes.status === 'fulfilled') {
      kpiList.value[2].value = String(modelRes.value.data?.data?.items?.length ?? 0)
    }
    if (evalRes.status === 'fulfilled') {
      kpiList.value[3].value = String(evalRes.value.data?.data?.items?.length ?? 0)
    }
  } catch {
    // 忽略未启动接口的报错
  }
})
</script>

<style scoped>
.dashboard-page {
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-header {
  margin-bottom: 24px;
}
.page-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
}
.page-desc {
  font-size: 14px;
  color: var(--text-secondary);
}

.kpi-row {
  margin-bottom: 24px;
}
.kpi-card {
  padding: 4px;
}
.kpi-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}
.kpi-title {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
  margin-bottom: 8px;
}
.kpi-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  font-family: monospace, sans-serif;
}
.kpi-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
}
.icon-primary { background: #EEF2FF; color: #4F7CFF; }
.icon-success { background: #ECFDF5; color: #10B981; }
.icon-warning { background: #FFFBEB; color: #F59E0B; }
.icon-info { background: #F0F9FF; color: #0EA5E9; }

.kpi-footer {
  display: flex;
  align-items: center;
  font-size: 12px;
  gap: 8px;
  border-top: 1px solid var(--border-color);
  padding-top: 16px;
}
.kpi-trend {
  display: flex;
  align-items: center;
  font-weight: 600;
}
.kpi-trend .el-icon {
  margin-right: 2px;
  font-size: 14px;
}
.text-success { color: #10B981; }
.text-neutral { color: var(--text-secondary); }
.kpi-subtext { color: var(--text-secondary); }

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.flow-card {
  position: relative;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
}
.flow-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 8px 24px rgba(79, 124, 255, 0.08);
  transform: translateY(-2px);
}
.flow-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.flow-step-num {
  font-size: 12px;
  font-weight: 700;
  color: var(--primary-color);
  background: #EEF2FF;
  padding: 4px 10px;
  border-radius: 6px;
}
.flow-icon {
  font-size: 24px;
  color: var(--text-secondary);
}
.flow-card h4 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}
.flow-card p {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}
.flow-arrow {
  position: absolute;
  top: 50%;
  right: -14px;
  transform: translateY(-50%);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--text-secondary);
  z-index: 10;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.action-card {
  height: 100%;
}
.card-title {
  font-weight: 600;
  font-size: 15px;
  color: var(--text-primary);
}
.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.action-btn {
  width: 100%;
  height: 52px;
  justify-content: flex-start;
  padding-left: 24px;
  font-size: 14px;
  border-radius: 8px;
  color: var(--text-regular);
}
.action-btn .el-icon {
  margin-right: 8px;
  font-size: 18px;
  color: var(--text-secondary);
}
.action-btn:hover .el-icon {
  color: var(--primary-color);
}

.status-card {
  height: 100%;
}
.status-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 8px 0;
}
.status-item {
  display: flex;
  align-items: center;
}
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 12px;
  box-shadow: 0 0 0 4px rgba(255,255,255,0.8);
}
.status-dot.success { background-color: var(--success-color); box-shadow: 0 0 0 4px #ECFDF5; }
.status-dot.warning { background-color: var(--warning-color); box-shadow: 0 0 0 4px #FFFBEB; }
.status-text {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  flex: 1;
}
.status-time {
  color: var(--text-secondary);
  font-size: 13px;
}
</style>
