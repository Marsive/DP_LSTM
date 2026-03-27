<template>
  <div class="evaluation-page">
    <el-row :gutter="20">
      <!-- 评估参数与操作 -->
      <el-col :span="8">
        <el-card style="margin-bottom: 20px;">
          <template #header>
            <el-icon style="margin-right: 8px;"><Setting /></el-icon>
            效果评估参数
          </template>
          <el-form label-position="top" size="default">
            <el-form-item label="当前评估 ε 值">
              <el-input-number v-model="evalEpsilon" :min="0.1" :max="10" :step="0.1" controls-position="right" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="K-匿名评估基准阈值">
              <el-input-number v-model="kThreshold" :min="100" :max="10000" :step="100" controls-position="right" style="width: 100%;" />
            </el-form-item>
            <el-form-item style="margin-top: 20px;">
              <el-button type="primary" class="btn-gradient" @click="runEvaluation" :loading="running" style="width: 100%; height: 40px; font-weight: bold; border-radius: 8px; box-shadow: 0 4px 15px rgba(64,158,255,0.3);">
                <el-icon style="margin-right: 6px;"><DataAnalysis /></el-icon>
                运行深度攻防测试评估
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 最新结果概览 -->
        <el-card v-if="latestResult" class="result-summary">
          <template #header>
            <el-icon style="margin-right: 8px;"><Trophy /></el-icon>
            最新评估结果
          </template>
          <el-descriptions column="1" border size="small">
            <el-descriptions-item label="评估 ID">{{ latestResult.id }}</el-descriptions-item>
            <el-descriptions-item label="ε 值">{{ latestResult.epsilon }}</el-descriptions-item>
            <el-descriptions-item label="位置熵 (安全性)">
              <span style="color: var(--success-color); font-weight: bold;">
                {{ latestResult.locationEntropy }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="MIA攻击成功率">
              <span style="color: var(--success-color); font-weight: bold;" v-if="latestResult.reIdentificationRisk !== undefined">
                {{ (latestResult.reIdentificationRisk * 100).toFixed(1) }}%
              </span>
              <span v-else>N/A</span>
            </el-descriptions-item>
            <el-descriptions-item label="DTW 距离 (可用性)">
              <span style="color: var(--warning-color); font-weight: bold;">
                {{ latestResult.trajectoryDtw }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="地理范围查询误差">
              <span style="color: var(--warning-color); font-weight: bold;" v-if="latestResult.rangeQueryError !== undefined">
                {{ (latestResult.rangeQueryError * 100).toFixed(1) }}%
              </span>
              <span v-else>N/A</span>
            </el-descriptions-item>
            <el-descriptions-item label="K-匿名度占比">
              {{ latestResult.kAnonymity }}
            </el-descriptions-item>
            <el-descriptions-item label="计算耗时">
              {{ latestResult.computationTimeMs }} ms
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <!-- 趋势图表与攻防大屏 -->
      <el-col :span="16">
        <!-- 攻防推演状态面板 (新增核心卖点) -->
        <el-card style="margin-bottom: 20px; background: linear-gradient(135deg, #ffffff 0%, #f4f6fa 100%);">
          <div style="display: flex; justify-content: space-between; align-items: center; color: #333;">
            <div>
              <div style="font-size: 14px; color: #666; margin-bottom: 8px; font-weight: bold;">[互动沙盘] 成员推断(MIA)攻防推演评估</div>
              <div v-if="latestResult && latestResult.reIdentificationRisk !== undefined">
                <div style="font-size: 28px; font-weight: bold;" :style="{ color: latestResult.reIdentificationRisk < 0.2 ? '#67C23A' : '#F56C6C' }">
                  攻击成功拦截率: {{ (100 - latestResult.reIdentificationRisk * 100).toFixed(1) }}%
                </div>
                <div style="font-size: 13px; margin-top: 8px; color: #999;">
                  当前模型防御级别定级评价：<strong :style="{ color: latestResult.reIdentificationRisk < 0.2 ? '#67C23A' : '#F56C6C' }">{{ latestResult.reIdentificationRisk < 0.2 ? '极高 (成功重混溯源追踪特征数据)' : '危险 (存在部分地理隐私位置暴露风险)' }}</strong>
                </div>
              </div>
              <div v-else>
                <div style="font-size: 14px; color: #E6A23C; padding: 10px 0;">
                  缺少最新防溯源测评指标数据，<br/>需在上方重新点击“运行全面评估”进行沙箱模拟防御探测。
                </div>
              </div>
            </div>
            <div style="text-align: right;">
              <!-- 简单的盾牌 CSS 可视化 -->
              <div :style="shieldStyle(latestResult?.reIdentificationRisk)"></div>
            </div>
          </div>
        </el-card>

        <!-- 综合趋势图 -->
        <el-card style="margin-bottom: 20px;">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>
                <el-icon style="margin-right: 8px;"><TrendCharts /></el-icon>
                效用与隐私权衡趋势
              </span>
              <el-button size="small" type="primary" plain @click="loadBatchCompare">
                生成对比趋势图
              </el-button>
            </div>
          </template>
          <div ref="metricsChartRef" style="width: 100%; height: 350px;"></div>
        </el-card>

        <!-- 历史评估记录表 -->
        <el-card>
          <template #header>
            <el-icon style="margin-right: 8px;"><List /></el-icon>
            历史评估记录
          </template>
          <el-table :data="historyResults" stripe max-height="300">
            <el-table-column prop="id" label="ID" width="50" />
            <el-table-column prop="epsilon" label="ε" width="50" />
            <el-table-column label="位置熵" min-width="80">
              <template #default="{ row }">
                {{ Number(row.locationEntropy).toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column label="MIA率" min-width="80">
              <template #default="{ row }">
                {{ row.reIdentificationRisk !== undefined ? (row.reIdentificationRisk * 100).toFixed(1) + '%' : '-' }}
              </template>
            </el-table-column>
            <el-table-column label="DTW距离" min-width="110">
              <template #default="{ row }">
                {{ Math.round(row.trajectoryDtw).toLocaleString() }}
              </template>
            </el-table-column>
            <el-table-column label="范围误差" min-width="80">
              <template #default="{ row }">
                {{ row.rangeQueryError !== undefined ? (row.rangeQueryError * 100).toFixed(1) + '%' : '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="kAnonymity" label="K-匿名" min-width="70" />
            <el-table-column prop="createdAt" label="评估时间" width="180">
              <template #default="{ row }">
                {{ new Date(row.createdAt).toLocaleString() }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { evaluationApi } from '../services/api'

const evalEpsilon = ref(1.0)
const kThreshold = ref(500)
const running = ref(false)
const latestResult = ref<any>(null)
const historyResults = ref<any[]>([])

const metricsChartRef = ref<HTMLElement>()
let metricsChart: echarts.ECharts | null = null

// 根据拦截率动态渲染盾牌效果
function shieldStyle(risk?: number) {
  if (risk === undefined) {
    return {
      width: '60px',
      height: '60px',
      borderRadius: '10px 10px 30px 30px',
      background: '#eee',
      border: `3px solid #ccc`,
    }
  }
  const isSafe = risk < 0.2
  return {
    width: '60px',
    height: '60px',
    borderRadius: '10px 10px 30px 30px',
    background: isSafe ? 'rgba(103, 194, 58, 0.1)' : 'rgba(245, 108, 108, 0.1)',
    border: `3px solid ${isSafe ? '#67C23A' : '#F56C6C'}`,
    boxShadow: `0 0 15px ${isSafe ? 'rgba(103, 194, 58, 0.4)' : 'rgba(245, 108, 108, 0.4)'}`,
    transition: 'all 0.5s ease'
  }
}

onMounted(async () => {
  await loadHistory()
  await nextTick()
  initChart()
  updateChart() // 有历史数据的话先画历史数据的图
})

function initChart() {
  if (!metricsChartRef.value) return
  metricsChart = echarts.init(metricsChartRef.value)
}

async function runEvaluation() {
  running.value = true
  try {
    const res = await evaluationApi.run({
      epsilon: evalEpsilon.value,
      kAnonymityThreshold: kThreshold.value,
    })
    latestResult.value = res.data?.data
    ElMessage.success('评估完成')
    await loadHistory()
    updateChart()
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.error?.message || '评估失败')
  } finally {
    running.value = false
  }
}

async function loadHistory() {
  try {
    const res = await evaluationApi.getResults(20)
    historyResults.value = res.data?.data?.items ?? []
    if (historyResults.value.length > 0 && !latestResult.value) {
      latestResult.value = historyResults.value[0]
    }
  } catch {
    // 静默处理
  }
}

async function loadBatchCompare() {
  try {
    const epsilons = [0.1, 0.5, 1.0, 2.0, 5.0, 10.0]
    const res = await evaluationApi.batchCompare(epsilons)
    const comparisons = res.data?.data?.comparisons ?? []
    
    // 过滤掉没跑的数据
    const validData = comparisons.filter((c: any) => c.status !== 'no_data')
    if (validData.length === 0) {
      ElMessage.warning('没有找到对应的预演数据，请先生成或评估这些 ε 值')
      return
    }

    if (metricsChart) {
      metricsChart.setOption({
        backgroundColor: 'transparent',
        title: { text: '多 ε 值全景评估', textStyle: { color: '#333', fontSize: 15, fontWeight: 'bold' }, left: 'center', top: 0 },
        tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.9)', borderColor: '#eee' },
        legend: { data: ['位置熵(安全)', 'MIA(安全)', 'DTW(差距)', '范围误差(差距)'], top: 35, textStyle: { color: '#666' } },
        grid: { top: 80, bottom: 20, containLabel: true },
        xAxis: {
          type: 'category',
          data: validData.map((c: any) => `ε=${c.epsilon}`),
          axisLabel: { color: '#666' }
        },
        yAxis: [
          { type: 'value', name: '分数/比例 %', position: 'left', axisLabel: { color: '#666' } },
          { type: 'value', name: 'DTW 距离', position: 'right', axisLabel: { color: '#666' } },
        ],
        series: [
          {
            name: '位置熵(安全)',
            type: 'bar',
            data: validData.map((c: any) => c.locationEntropy),
            itemStyle: { color: '#43e97b', borderRadius: [4, 4, 0, 0] },
          },
          {
            name: 'MIA(安全)',
            type: 'line',
            data: validData.map((c: any) => c.reIdentificationRisk !== undefined ? (c.reIdentificationRisk * 100).toFixed(1) : 0),
            smooth: true,
            lineStyle: { color: '#00d2ff', width: 2, type: 'dashed' },
            itemStyle: { color: '#00d2ff' },
          },
          {
            name: 'DTW(差距)',
            type: 'line',
            yAxisIndex: 1,
            data: validData.map((c: any) => c.trajectoryDtw),
            smooth: true,
            lineStyle: { color: '#f5576c', width: 2 },
            itemStyle: { color: '#f5576c' },
          },
          {
            name: '范围误差(差距)',
            type: 'line',
            data: validData.map((c: any) => c.rangeQueryError !== undefined ? (c.rangeQueryError * 100).toFixed(1) : 0),
            smooth: true,
            lineStyle: { color: '#f6d365', width: 2 },
            itemStyle: { color: '#f6d365' },
          },
        ],
      })
    }
  } catch {
    ElMessage.error('获取对比数据失败')
  }
}

function updateChart() {
  if (historyResults.value.length === 0 || !metricsChart) return
  
  // 按时间正序排用于画图
  const sorted = [...historyResults.value].reverse()
  
  metricsChart.setOption({
    backgroundColor: 'transparent',
    title: { text: '最近评估记录趋势', textStyle: { color: '#333', fontSize: 15, fontWeight: 'bold' }, left: 'center', top: 0 },
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.9)', borderColor: '#eee' },
    legend: { data: ['位置熵', 'DTW 距离', 'K-匿名度'], top: 35, textStyle: { color: '#666' } },
    grid: { top: 80, bottom: 20, containLabel: true },
    xAxis: {
      type: 'category',
      data: sorted.map((r: any) => `ID:${r.id}`),
      axisLabel: { color: '#666' }
    },
    yAxis: [
      { type: 'value', name: '熵 / K-匿名', position: 'left', axisLabel: { color: '#666' } },
      { type: 'value', name: 'DTW 距离', position: 'right', axisLabel: { color: '#666' } },
    ],
    series: [
      {
        name: '位置熵',
        type: 'line',
        data: sorted.map((r: any) => r.locationEntropy),
        smooth: true,
        itemStyle: { color: '#43e97b' },
      },
      {
        name: 'DTW 距离',
        type: 'line',
        yAxisIndex: 1,
        data: sorted.map((r: any) => r.trajectoryDtw),
        smooth: true,
        itemStyle: { color: '#f5576c' },
      },
      {
        name: 'K-匿名度',
        type: 'bar',
        data: sorted.map((r: any) => r.kAnonymity),
        itemStyle: { color: '#667eea', borderRadius: [4, 4, 0, 0] },
      },
    ],
  })
}
</script>

<style scoped>
.result-summary :deep(.el-descriptions__label) {
  width: 150px;
  background-color: var(--bg-card-hover) !important;
  color: var(--text-secondary);
}

.result-summary :deep(.el-descriptions__content) {
  background-color: var(--bg-card) !important;
  color: var(--text-primary);
}
</style>
