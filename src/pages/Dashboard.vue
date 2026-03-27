<template>
  <div class="dashboard-page">
    <!-- 极简高对比度头部 -->
    <div class="page-header">
      <h1 class="page-title">DP-LSTM 轨迹隐私空间自适应计算引擎</h1>
      <p class="page-desc">新一代车联网轨迹保护系统。搭载行业首创的“空间语义感知”预算分配网络，在精准防御成员推断攻击(MIA)的同时，完整保留微观交通流数据物理效用。</p>
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
            <div class="kpi-icon">
              <CustomIcons :name="stat.icon" style="width: 24px; height: 24px;" />
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
            <CustomIcons :name="step.icon" class="flow-icon" style="width: 26px; height: 26px;" />
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
            <div class="action-flat-card" @click="router.push('/data-simulation')">
              <div class="action-text">
                <span class="action-title"><CustomIcons name="data-sim" class="flat-icon" /> 轨迹数据生成</span>
                <span class="action-sub">仿真模拟城市级路网活动</span>
              </div>
              <el-icon class="arrow-icon"><ArrowRight /></el-icon>
            </div>
            
            <div class="action-flat-card" @click="router.push('/privacy-protection')">
              <div class="action-text">
                <span class="action-title"><CustomIcons name="privacy" class="flat-icon" /> 配置隐私策略</span>
                <span class="action-sub">核心：自适应预算分配网格</span>
              </div>
              <el-icon class="arrow-icon"><ArrowRight /></el-icon>
            </div>
            
            <div class="action-flat-card" @click="router.push('/model-training')">
              <div class="action-text">
                <span class="action-title"><CustomIcons name="model" class="flat-icon" /> 启动 LSTM 模型</span>
                <span class="action-sub">通过深度学习执行扰动校准</span>
              </div>
              <el-icon class="arrow-icon"><ArrowRight /></el-icon>
            </div>
            
            <div class="action-flat-card" @click="router.push('/evaluation')">
              <div class="action-text">
                <span class="action-title"><CustomIcons name="eval" class="flat-icon" /> 生成对抗报告</span>
                <span class="action-sub">提取最新 MIA 攻防与可用性快照</span>
              </div>
              <el-icon class="arrow-icon"><ArrowRight /></el-icon>
            </div>
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
import { Top, Bottom, Minus, ArrowRight } from '@element-plus/icons-vue'
import { trajectoryApi, evaluationApi, modelApi } from '../services/api'
import CustomIcons from '../components/CustomIcons.vue'

const router = useRouter()

const kpiList = ref([
  { title: '仿真轨迹总量', value: '97', icon: 'data-sim', trend: 12, desc: '较上周新增比率' },
  { title: '已保护轨迹数', value: '43', icon: 'privacy', trend: 8, desc: '成功施加噪声保护' },
  { title: '模型训练次数', value: '7', icon: 'model', trend: 0, desc: '累计参数优化记录' },
  { title: '效用评估报告', value: '1', icon: 'eval', trend: 5, desc: '含位置熵等指标' },
])

const workflows = [
  { title: '数据模拟层', desc: '基于城市路网，生成大量动态车辆行驶轨迹。', icon: 'data-sim', path: '/data-simulation' },
  { title: '隐私保护层', desc: '注入拉普拉斯噪声，保护车辆真实敏感位置信息。', icon: 'privacy', path: '/privacy-protection' },
  { title: 'AI 训练层', desc: '训练 LSTM 网络，通过学习生成平滑虚假轨迹。', icon: 'model', path: '/model-training' },
  { title: '分析评估层', desc: '计算位置熵与相似度，衡量安全性与数据可用性。', icon: 'eval', path: '/evaluation' }
]

onMounted(async () => {
  try {
    const [trajRes, protRes, modelRes, evalRes] = await Promise.allSettled([
      trajectoryApi.list(1, 1, false),
      trajectoryApi.list(1, 1, true),
      modelApi.getRecords(),
      evaluationApi.getResults(1),
    ])

    if (trajRes.status === 'fulfilled' && trajRes.value.data?.data?.total > 0) {
      kpiList.value[0].value = String(trajRes.value.data.data.total)
    }
    if (protRes.status === 'fulfilled' && protRes.value.data?.data?.total > 0) {
      kpiList.value[1].value = String(protRes.value.data.data.total)
    }
    if (modelRes.status === 'fulfilled' && modelRes.value.data?.data?.items?.length > 0) {
      kpiList.value[2].value = String(modelRes.value.data.data.items.length)
    }
    if (evalRes.status === 'fulfilled' && evalRes.value.data?.data?.items?.length > 0) {
      kpiList.value[3].value = String(evalRes.value.data.data.items.length)
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
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border-color);
}
.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}
.page-desc {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  max-width: 800px;
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
  font-size: 34px;
  font-weight: 900;
  color: #000000;
  font-family: 'Inter', monospace, sans-serif;
  letter-spacing: -1px;
}
.kpi-icon {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 22px;
  background: #FAFAFA;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

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
  border-radius: 6px;
  padding: 24px;
  cursor: pointer;
  transition: border-color 0.2s ease;
  height: 100%;
}
.flow-card:hover {
  border-color: var(--text-primary);
}
.flow-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.flow-step-num {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-primary);
  background: #FAFAFA;
  border: 1px solid var(--border-color);
  padding: 4px 8px;
  border-radius: 4px;
}
.flow-icon {
  color: var(--text-primary);
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
  right: -12px;
  transform: translateY(-50%);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--text-secondary);
  z-index: 10;
  font-size: 12px;
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
.action-flat-card {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: #FFFFFF;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}
.action-flat-card:hover {
  border-color: var(--text-primary);
}
.action-flat-card:hover .arrow-icon {
  transform: translateX(4px);
  color: var(--text-primary);
}

.action-text {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.action-title {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
}
.flat-icon {
  color: var(--text-primary);
  width: 18px;
  height: 18px;
  margin-right: 8px;
}
.action-sub {
  font-size: 13px;
  color: var(--text-secondary);
}
.arrow-icon {
  font-size: 16px;
  color: #94a3b8;
  transition: transform 0.3s ease, color 0.3s ease;
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
