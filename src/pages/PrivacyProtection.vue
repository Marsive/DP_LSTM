<template>
  <div class="privacy-page">
    <el-row :gutter="20">
      <!-- 隐私参数配置 -->
      <el-col :span="8">
        <el-card style="margin-bottom: 20px;">
          <template #header>
            <el-icon style="margin-right: 8px;"><Lock /></el-icon>
            差分隐私参数配置
          </template>
          <el-form label-position="top" :model="privacyConfig" size="default">
            <el-form-item label="隐私预算 ε">
              <el-slider
                v-model="privacyConfig.epsilon"
                :min="0.1"
                :max="10"
                :step="0.1"
                show-input
              />
            </el-form-item>
            <el-form-item label="位置敏感度（米）">
              <el-input-number v-model="privacyConfig.sensitivityMeters" :min="10" :max="1000" :step="10" controls-position="right" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="预算分配策略">
              <el-select v-model="privacyConfig.budgetStrategy" style="width: 100%;">
                <el-option label="传统一刀切机制 (Uniform)" value="uniform" />
                <el-option label="空间语义自适应 (Adaptive)" value="adaptive" />
                <el-option label="几何时间递减 (Geometric)" value="geometric" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 动态策略雷达图展示 -->
        <el-card>
          <template #header>
            <el-icon style="margin-right: 8px;"><DataLine /></el-icon>
            理论收益与损耗动态剖析
          </template>
          <div ref="radarChartRef" style="width: 100%; height: 260px;"></div>
          <div v-if="noiseImpact" style="font-size: 13px; line-height: 1.8; margin-top: 10px; border-top: 1px solid var(--border-color); padding-top: 10px;">
            <el-row :gutter="10">
              <el-col :span="12">
                <span style="color: var(--text-secondary);">单点偏移方差：</span>
                <strong style="color: var(--warning-color);">{{ noiseImpact.noiseStdDevMeters }}m</strong>
              </el-col>
              <el-col :span="12">
                <span style="color: var(--text-secondary);">95% 覆盖半径：</span>
                <strong style="color: var(--danger-color);">±{{ noiseImpact.ci95Meters }}m</strong>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>

      <!-- 轨迹选择与操作 -->
      <el-col :span="16">
        <el-card style="margin-bottom: 20px;">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>
                <el-icon style="margin-right: 8px;"><Select /></el-icon>
                选择待保护轨迹
              </span>
              <el-button
                type="primary"
                class="btn-gradient"
                @click="applyProtection"
                :loading="applying"
                :disabled="!selectedIds.length"
              >
                <el-icon style="margin-right: 4px;"><Lock /></el-icon>
                施加差分隐私保护
              </el-button>
            </div>
          </template>
          <el-table
            :data="originalTrajectories"
            stripe
            style="width: 100%"
            @selection-change="onSelectionChange"
            max-height="300"
          >
            <el-table-column type="selection" width="50" />
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="vehicleId" label="车辆编号" />
            <el-table-column prop="pointCount" label="轨迹点数" width="100" />
          </el-table>
        </el-card>

        <!-- 对比图表 -->
        <el-card>
          <template #header>
            <el-icon style="margin-right: 8px;"><DataAnalysis /></el-icon>
            不同 ε 值下的噪声对比
          </template>
          <div ref="compareChartRef" style="width: 100%; height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { trajectoryApi, privacyApi } from '../services/api'

const privacyConfig = ref({
  epsilon: 1.0,
  sensitivityMeters: 100,
  budgetStrategy: 'uniform',
})

const originalTrajectories = ref<any[]>([])
const selectedIds = ref<number[]>([])
const applying = ref(false)
const noiseImpact = ref<any>(null)
const compareChartRef = ref<HTMLElement>()
const radarChartRef = ref<HTMLElement>()
let compareChart: echarts.ECharts | null = null
let radarChart: echarts.ECharts | null = null

onMounted(async () => {
  await loadOriginalTrajectories()
  await fetchNoiseImpact()
  await nextTick()
  initCompareChart()
  await loadCompareData()
})

async function loadOriginalTrajectories() {
  try {
    const res = await trajectoryApi.list(1, 100, false)
    originalTrajectories.value = res.data?.data?.items ?? []
  } catch {
    // 静默处理
  }
}

function onSelectionChange(selection: any[]) {
  selectedIds.value = selection.map((s: any) => s.id)
}

async function fetchNoiseImpact() {
  try {
    const res = await privacyApi.getConfig(
      privacyConfig.value.epsilon,
      privacyConfig.value.sensitivityMeters
    )
    noiseImpact.value = res.data?.data?.impact
    updateRadarChart()
  } catch {
    // 静默处理
  }
}

function initCompareChart() {
  if (compareChartRef.value) {
    compareChart = echarts.init(compareChartRef.value)
  }
  if (radarChartRef.value) {
    radarChart = echarts.init(radarChartRef.value)
  }
}

function updateRadarChart() {
  if (!radarChart) return
  
  // 模拟基于 epsilon 的隐私效用反比映射
  const eps = privacyConfig.value.epsilon
  // eps -> 0.1: privacy -> 100, utility -> 10
  // eps -> 10: privacy -> 10, utility -> 100
  const privacyScore = Math.min(100, Math.max(10, 100 * (1 / (eps + 0.5))))
  const utilityScore = Math.min(100, Math.max(10, 80 * Math.log10(eps + 1)))

  radarChart.setOption({
    backgroundColor: 'transparent',
    tooltip: { format: 'item' },
    radar: {
      indicator: [
        { name: '单点隐匿度', max: 100 },
        { name: 'MIA拦截率', max: 100 },
        { name: '聚合K-匿名', max: 100 },
        { name: '路线保真度', max: 100 },
        { name: '密度分布效用', max: 100 },
        { name: '下游预测价值', max: 100 }
      ],
      axisName: { color: '#666', fontSize: 13, fontWeight: 'bold' },
      splitArea: { areaStyle: { color: ['rgba(230, 238, 255, 0.4)', 'rgba(240, 245, 255, 0.3)'] } },
      splitLine: { lineStyle: { color: 'rgba(200, 215, 240, 0.8)' } },
      axisLine: { lineStyle: { color: 'rgba(200, 215, 240, 0.8)' } }
    },
    series: [
      {
        name: '理论指征',
        type: 'radar',
        data: [
          {
            value: [privacyScore, privacyScore * 0.9, privacyScore * 0.95, utilityScore, utilityScore * 0.9, utilityScore * 0.85],
            name: '当前配置面板 (实控属性)',
            areaStyle: {
              color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
                { color: 'rgba(64, 158, 255, 0.5)', offset: 0 },
                { color: 'rgba(64, 158, 255, 0.1)', offset: 1 }
              ])
            },
            lineStyle: { width: 3, color: '#409EFF' },
            itemStyle: { color: '#409EFF', borderColor: '#fff', borderWidth: 2 }
          }
        ]
      }
    ]
  })
}

async function applyProtection() {
  applying.value = true
  try {
    const res = await privacyApi.apply({
      trajectoryIds: selectedIds.value,
      epsilon: privacyConfig.value.epsilon,
      sensitivityMeters: privacyConfig.value.sensitivityMeters,
      budgetStrategy: privacyConfig.value.budgetStrategy,
    })
    const data = res.data?.data
    ElMessage.success(`成功保护 ${data?.protectedCount ?? 0} 条轨迹`)
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.error?.message || '保护失败')
  } finally {
    applying.value = false
  }
}



async function loadCompareData() {
  try {
    const res = await privacyApi.compare(
      [0.1, 0.5, 1.0, 2.0, 5.0, 10.0],
      privacyConfig.value.sensitivityMeters
    )
    const comparisons = res.data?.data?.comparisons ?? []

    if (compareChart) {
      compareChart.setOption({
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis' },
        legend: { data: ['噪声标准差 (m)', '95%置信区间 (m)'], textStyle: { color: '#333' } },
        xAxis: {
          type: 'category',
          name: '隐私预算 ε',
          data: comparisons.map((c: any) => `ε=${c.epsilon}`),
          axisLabel: { color: '#666' }
        },
        yAxis: { type: 'value', name: '噪声幅度 (米)', axisLabel: { color: '#666' } },
        series: [
          {
            name: '噪声标准差 (m)',
            type: 'bar',
            data: comparisons.map((c: any) => c.noiseStdDevMeters),
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#667eea' },
                { offset: 1, color: '#764ba2' },
              ]),
              borderRadius: [4, 4, 0, 0],
            },
          },
          {
            name: '95%置信区间 (m)',
            type: 'line',
            data: comparisons.map((c: any) => c.ci95Meters),
            smooth: true,
            lineStyle: { color: '#f5576c', width: 2 },
            itemStyle: { color: '#f5576c' },
          },
        ],
      })
    }
  } catch {
    // 静默处理
  }
}

watch(() => privacyConfig.value.epsilon, fetchNoiseImpact)
</script>
