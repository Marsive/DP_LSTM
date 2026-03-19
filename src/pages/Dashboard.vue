<template>
  <div class="dashboard-page">
    <!-- 统计卡片 -->
    <el-row :gutter="20" style="margin-bottom: 24px">
      <el-col :span="6" v-for="stat in stats" :key="stat.label">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" :style="{ background: stat.gradient }">
            <el-icon :size="24"><component :is="stat.icon" /></el-icon>
          </div>
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 系统架构说明 -->
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div style="display: flex; align-items: center;">
              <el-icon style="margin-right: 8px; color: #667eea;"><InfoFilled /></el-icon>
              系统工作流程
            </div>
          </template>
          <el-steps direction="vertical" :active="4" finish-status="success">
            <el-step title="数据模拟层" description="生成模拟城市路网中的车辆轨迹数据" />
            <el-step title="隐私保护层" description="添加拉普拉斯噪声进行差分隐私处理" />
            <el-step title="AI 模型层" description="LSTM 路径预测与虚假路径生成" />
            <el-step title="评估层" description="位置熵、轨迹相似度、k-匿名度评估" />
          </el-steps>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <div style="display: flex; align-items: center;">
              <el-icon style="margin-right: 8px; color: #667eea;"><Warning /></el-icon>
              快速开始指南
            </div>
          </template>
          <el-timeline>
            <el-timeline-item timestamp="第一步" placement="top" color="#667eea">
              <h4>数据模拟</h4>
              <p style="color: var(--text-secondary); font-size: 13px;">
                前往「数据模拟」页面，配置参数并生成车辆轨迹数据
              </p>
            </el-timeline-item>
            <el-timeline-item timestamp="第二步" placement="top" color="#764ba2">
              <h4>隐私保护</h4>
              <p style="color: var(--text-secondary); font-size: 13px;">
                在「隐私保护」页面，选择轨迹并设置 ε 值施加差分隐私
              </p>
            </el-timeline-item>
            <el-timeline-item timestamp="第三步" placement="top" color="#43e97b">
              <h4>模型训练</h4>
              <p style="color: var(--text-secondary); font-size: 13px;">
                在「模型训练」页面，训练 LSTM 并生成虚假路径
              </p>
            </el-timeline-item>
            <el-timeline-item timestamp="第四步" placement="top" color="#f5576c">
              <h4>效果评估</h4>
              <p style="color: var(--text-secondary); font-size: 13px;">
                在「效果评估」页面，查看隐私保护效果与数据可用性指标
              </p>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { trajectoryApi, evaluationApi, modelApi } from '../services/api'

const stats = ref([
  { label: '轨迹总数', value: '0', icon: 'MapLocation', gradient: 'var(--gradient-primary)' },
  { label: '已保护轨迹', value: '0', icon: 'Lock', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
  { label: '模型训练次数', value: '0', icon: 'Cpu', gradient: 'linear-gradient(135deg, #fa709a, #fee140)' },
  { label: '评估记录', value: '0', icon: 'DataAnalysis', gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)' },
])

onMounted(async () => {
  try {
    const [trajRes, protRes, modelRes, evalRes] = await Promise.allSettled([
      trajectoryApi.list(1, 1, false),
      trajectoryApi.list(1, 1, true),
      modelApi.getRecords(),
      evaluationApi.getResults(1),
    ])

    if (trajRes.status === 'fulfilled') {
      stats.value[0].value = String(trajRes.value.data?.data?.total ?? 0)
    }
    if (protRes.status === 'fulfilled') {
      stats.value[1].value = String(protRes.value.data?.data?.total ?? 0)
    }
    if (modelRes.status === 'fulfilled') {
      stats.value[2].value = String(modelRes.value.data?.data?.items?.length ?? 0)
    }
    if (evalRes.status === 'fulfilled') {
      stats.value[3].value = String(evalRes.value.data?.data?.items?.length ?? 0)
    }
  } catch {
    // 后端未启动时静默处理
  }
})
</script>

<style scoped>
.dashboard-page {
  animation: fadeInUp 0.5s ease;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.stat-card {
  position: relative;
  overflow: hidden;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 0 auto 12px;
}

.stat-value {
  font-size: 28px !important;
  font-weight: 700;
  color: var(--text-primary) !important;
  -webkit-text-fill-color: var(--text-primary) !important;
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 4px;
}

h4 {
  color: var(--text-primary);
  margin-bottom: 4px;
}
</style>
