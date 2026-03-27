<template>
  <div class="model-page">
    <el-row :gutter="20">
      <!-- 训练配置 -->
      <el-col :span="8">
        <el-card style="margin-bottom: 20px;">
          <template #header>
            <el-icon style="margin-right: 8px;"><Setting /></el-icon>
            LSTM 训练参数
          </template>
          <el-form label-position="top" :model="trainConfig" size="default">
            <el-form-item label="训练轮数 (Epochs)">
              <el-input-number v-model="trainConfig.epochs" :min="5" :max="500" />
            </el-form-item>
            <el-form-item label="批大小 (Batch Size)">
              <el-input-number v-model="trainConfig.batchSize" :min="8" :max="256" :step="8" />
            </el-form-item>
            <el-form-item label="学习率">
              <el-input-number v-model="trainConfig.learningRate" :min="0.0001" :max="0.1" :step="0.0001" :precision="4" />
            </el-form-item>
            <el-form-item label="隐藏层维度">
              <el-select v-model="trainConfig.hiddenSize" style="width: 100%;">
                <el-option :value="64" label="64" />
                <el-option :value="128" label="128" />
                <el-option :value="256" label="256" />
              </el-select>
            </el-form-item>
            <el-form-item label="LSTM 层数">
              <el-select v-model="trainConfig.numLayers" style="width: 100%;">
                <el-option :value="1" label="1 层" />
                <el-option :value="2" label="2 层" />
                <el-option :value="3" label="3 层" />
              </el-select>
            </el-form-item>
            <el-form-item label="序列长度">
              <el-input-number v-model="trainConfig.seqLength" :min="5" :max="50" />
            </el-form-item>
            <el-form-item label="训练集比例">
              <el-slider v-model="trainConfig.trainRatio" :min="0.5" :max="0.95" :step="0.05" show-input />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                class="btn-primary-flat"
                @click="startTraining"
                :loading="isTraining"
                :disabled="isTraining"
                style="width: 100%;"
              >
                <el-icon style="margin-right: 4px;"><VideoPlay /></el-icon>
                {{ isTraining ? '训练中...' : '开始训练' }}
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 训练状态与结果 -->
      <el-col :span="16">
        <!-- 训练进度 -->
        <el-card style="margin-bottom: 20px;">
          <template #header>
            <el-icon style="margin-right: 8px;"><Loading /></el-icon>
            训练状态
          </template>
          <div v-if="trainingStatus.message" style="margin-bottom: 12px;">
            <el-tag :type="isTraining ? 'warning' : 'success'" effect="dark" size="large">
              {{ trainingStatus.message }}
            </el-tag>
          </div>
          <el-progress
            v-if="isTraining || trainingStatus.totalEpochs > 0"
            :percentage="progressPercent"
            :stroke-width="16"
            :format="() => `${trainingStatus.currentEpoch}/${trainingStatus.totalEpochs}`"
            :color="[
              { color: '#667eea', percentage: 20 },
              { color: '#764ba2', percentage: 100 },
            ]"
            style="margin-top: 12px;"
          />
          <div v-if="trainingStatus.currentLoss !== null" style="margin-top: 12px; color: var(--text-secondary); font-size: 13px;">
            当前损失值：<strong style="color: var(--text-primary);">{{ trainingStatus.currentLoss?.toFixed(6) }}</strong>
          </div>
        </el-card>

        <!-- 虚假路径生成 -->
        <el-card style="margin-bottom: 20px;">
          <template #header>
            <el-icon style="margin-right: 8px;"><Position /></el-icon>
            虚假路径生成
          </template>
          <el-form :inline="true" :model="generateConfig" size="default">
            <el-form-item label="轨迹 ID">
              <el-input-number v-model="generateConfig.trajectoryId" :min="1" />
            </el-form-item>
            <el-form-item label="生成步数">
              <el-input-number v-model="generateConfig.generateSteps" :min="5" :max="200" />
            </el-form-item>
            <el-form-item label="ε 值">
              <el-input-number v-model="generateConfig.epsilon" :min="0.1" :max="10" :step="0.1" />
            </el-form-item>
            <el-form-item label="路径数">
              <el-input-number v-model="generateConfig.numPaths" :min="1" :max="20" />
            </el-form-item>
            <el-form-item label="噪声位置">
              <el-select v-model="generateConfig.noiseTarget" style="width: 120px;">
                <el-option label="输入层" value="input" />
                <el-option label="隐藏层" value="hidden" />
                <el-option label="输出层" value="output" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="success" @click="generateFakePaths" :loading="generatingPaths">
                生成虚假路径
              </el-button>
            </el-form-item>
          </el-form>
          <div v-if="fakePaths.length" style="margin-top: 12px; color: var(--text-secondary);">
            已生成 <strong style="color: var(--text-primary);">{{ fakePaths.length }}</strong> 条虚假路径
          </div>
        </el-card>

        <!-- 训练记录 -->
        <el-card>
          <template #header>
            <el-icon style="margin-right: 8px;"><Document /></el-icon>
            历史训练记录
          </template>
          <el-table :data="records" stripe max-height="250">
            <el-table-column prop="id" label="ID" width="60" />
            <el-table-column prop="modelName" label="模型名称" />
            <el-table-column prop="epochs" label="轮数" width="70" />
            <el-table-column prop="hiddenSize" label="隐藏维度" width="90" />
            <el-table-column prop="trainLoss" label="训练损失" width="120">
              <template #default="{ row }">
                {{ row.trainLoss?.toFixed(6) ?? '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'completed' ? 'success' : row.status === 'training' ? 'warning' : 'danger'" size="small" effect="dark">
                  {{ row.status === 'completed' ? '完成' : row.status === 'training' ? '训练中' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { modelApi } from '../services/api'

const trainConfig = ref({
  epochs: 50,
  batchSize: 32,
  learningRate: 0.001,
  hiddenSize: 128,
  numLayers: 2,
  seqLength: 20,
  trainRatio: 0.8,
})

const generateConfig = ref({
  trajectoryId: 1,
  generateSteps: 50,
  epsilon: 1.0,
  sensitivityMeters: 100,
  noiseTarget: 'input',
  numPaths: 5,
})

const isTraining = ref(false)
const trainingStatus = ref({
  currentEpoch: 0,
  totalEpochs: 0,
  currentLoss: null as number | null,
  message: '',
})
const records = ref<any[]>([])
const fakePaths = ref<any[]>([])
const generatingPaths = ref(false)
let pollTimer: number | null = null

const progressPercent = computed(() => {
  if (trainingStatus.value.totalEpochs === 0) return 0
  return Math.round(
    (trainingStatus.value.currentEpoch / trainingStatus.value.totalEpochs) * 100
  )
})

onMounted(() => {
  loadRecords()
  checkStatus()
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})

async function startTraining() {
  isTraining.value = true
  try {
    const res = await modelApi.train(trainConfig.value)
    ElMessage.success(res.data?.data?.message || '训练已启动')
    startPolling()
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.error?.message || '启动失败')
    isTraining.value = false
  }
}

function startPolling() {
  if (pollTimer) clearInterval(pollTimer)
  pollTimer = setInterval(checkStatus, 2000) as unknown as number
}

async function checkStatus() {
  try {
    const res = await modelApi.getStatus()
    const data = res.data?.data
    if (data) {
      trainingStatus.value = {
        currentEpoch: data.currentEpoch || 0,
        totalEpochs: data.totalEpochs || 0,
        currentLoss: data.currentLoss,
        message: data.message || '',
      }
      isTraining.value = data.isTraining || false

      if (!data.isTraining && pollTimer) {
        clearInterval(pollTimer)
        pollTimer = null
        loadRecords()
      }
    }
  } catch {
    // 静默
  }
}

async function loadRecords() {
  try {
    const res = await modelApi.getRecords()
    records.value = res.data?.data?.items ?? []
  } catch {
    // 静默
  }
}

async function generateFakePaths() {
  generatingPaths.value = true
  try {
    const res = await modelApi.generateFakePaths(generateConfig.value)
    fakePaths.value = res.data?.data?.paths ?? []
    ElMessage.success(`成功生成 ${fakePaths.value.length} 条虚假路径`)
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.error?.message || '生成失败')
  } finally {
    generatingPaths.value = false
  }
}
</script>
