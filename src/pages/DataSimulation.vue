<template>
  <div class="data-sim-page">
    <el-row :gutter="20">
      <!-- 参数配置 -->
      <el-col :span="8">
        <el-card>
          <template #header>
            <el-icon style="margin-right: 8px;"><Setting /></el-icon>
            轨迹生成参数
          </template>
          <el-form label-position="top" :model="config" size="default">
            <el-form-item label="车辆数量 (辆)">
              <el-input-number v-model="config.vehicleCount" :min="1" :max="500" controls-position="right" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="时间步数 (Step)">
              <el-input-number v-model="config.timeSteps" :min="10" :max="1000" controls-position="right" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="采样时间间隔 (秒)">
              <el-input-number v-model="config.samplingInterval" :min="1" :max="60" controls-position="right" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="路网空间划分行数 (X 轴)">
              <el-input-number v-model="config.gridRows" :min="5" :max="50" controls-position="right" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="路网空间划分列数 (Y 轴)">
              <el-input-number v-model="config.gridCols" :min="5" :max="50" controls-position="right" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="速度范围（km/h）">
              <el-slider
                v-model="speedRange"
                range
                :min="0"
                :max="150"
                :marks="{ 0: '0', 60: '60', 120: '120' }"
              />
            </el-form-item>
            <el-form-item style="margin-top: 30px;">
              <el-button
                type="primary"
                class="btn-gradient"
                @click="generateData"
                :loading="generating"
                style="width: 100%; height: 42px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 15px rgba(64, 158, 255, 0.3);"
              >
                <el-icon style="margin-right: 6px; font-size: 16px;"><VideoPlay /></el-icon>
                生成时空仿真轨迹
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 轨迹列表与地图 -->
      <el-col :span="16">
        <el-card style="margin-bottom: 20px;">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>
                <el-icon style="margin-right: 8px;"><MapLocation /></el-icon>
                轨迹地图展示
              </span>
              <el-button size="small" type="danger" plain @click="clearAll" :disabled="!trajectories.length">
                清空全部
              </el-button>
            </div>
          </template>
          <div ref="mapRef" class="map-container" id="trajectory-map"></div>
        </el-card>

        <el-card>
          <template #header>
            <el-icon style="margin-right: 8px;"><List /></el-icon>
            轨迹数据列表
          </template>
          <el-table :data="trajectories" stripe style="width: 100%" max-height="300">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="vehicleId" label="车辆编号" width="150" />
            <el-table-column prop="pointCount" label="轨迹点数" width="100" />
            <el-table-column prop="isProtected" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.isProtected ? 'success' : 'info'" size="small" effect="dark">
                  {{ row.isProtected ? '已保护' : '原始' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button size="small" type="primary" link @click="viewTrajectory(row.id, row.isProtected, row.originalTrajectoryId)">
                  查看轨迹对比
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div style="margin-top: 12px; display: flex; justify-content: flex-end;">
            <el-pagination
              v-model:current-page="page"
              :page-size="pageSize"
              :total="total"
              layout="total, prev, pager, next"
              @current-change="loadTrajectories"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import L from 'leaflet'
import { trajectoryApi } from '../services/api'

const config = ref({
  vehicleCount: 20,
  timeSteps: 80,
  samplingInterval: 5,
  gridRows: 20,
  gridCols: 20,
})
const speedRange = ref([20, 80])
const generating = ref(false)
const trajectories = ref<any[]>([])
const page = ref(1)
const pageSize = 20
const total = ref(0)
const mapRef = ref<HTMLElement>()
let map: L.Map | null = null
let trajLayers: L.LayerGroup | null = null

// 闪烁颜色
const COLORS = ['#667eea', '#43e97b', '#fa709a', '#f5576c', '#a18cd1', '#fbc2eb', '#ff9a9e', '#fecfef']

onMounted(async () => {
  await nextTick()
  initMap()
  loadTrajectories()
})

function initMap() {
  if (map) return
  map = L.map('trajectory-map', { preferCanvas: true }).setView([39.9042, 116.4074], 14)
  // 按照用户要求，恢复契合目前整体 Light 亮色主题的地图瓦片
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map)
  trajLayers = L.layerGroup().addTo(map)
}

async function loadTrajectories() {
  try {
    const res = await trajectoryApi.list(page.value, pageSize)
    const data = res.data?.data
    trajectories.value = data?.items ?? []
    total.value = data?.total ?? 0
  } catch {
    // 后端未启动
  }
}

async function generateData() {
  generating.value = true
  try {
    const res = await trajectoryApi.generate({
      ...config.value,
      speedRange: [speedRange.value[0], speedRange.value[1]],
    })
    const data = res.data?.data
    ElMessage.success(`成功生成 ${data?.generatedCount ?? 0} 条轨迹`)
    await loadTrajectories()

    // 显示前几条轨迹
    if (data?.trajectoryIds?.length > 0) {
      const idsToShow = data.trajectoryIds.slice(0, 5)
      if (trajLayers) trajLayers.clearLayers()
      for (let i = 0; i < idsToShow.length; i++) {
        await showTrajectoryOnMap(idsToShow[i], COLORS[i % COLORS.length])
      }
    }
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.error?.message || '生成失败')
  } finally {
    generating.value = false
  }
}

async function viewTrajectory(id: number, isProtected: boolean = false, originalId?: number) {
  if (trajLayers) trajLayers.clearLayers()
  
  if (isProtected && originalId) {
    // 双轨对比全息模式：同时渲染原始轨迹与保护后轨迹
    await showDualTrajectoryOnMap(originalId, id)
  } else {
    // 单轨渲染
    await showTrajectoryOnMap(id, '#409EFF', '原始真实轨迹')
  }
}

async function showDualTrajectoryOnMap(origId: number, protectedId: number) {
  try {
    const resOrig = await trajectoryApi.getDetail(origId)
    const pointsOrig = resOrig.data?.data?.points ?? []
    
    const resProt = await trajectoryApi.getDetail(protectedId)
    const pointsProt = resProt.data?.data?.points ?? []

    if (!pointsOrig.length || !pointsProt.length || !map) return

    // 绘制原始轨迹 (主题蓝)
    const latlngsOrig = pointsOrig.map((p: any) => [p.latitude, p.longitude] as [number, number])
    const polylineOrig = L.polyline(latlngsOrig, {
      color: '#409EFF',
      weight: 4,
      opacity: 0.9,
      dashArray: '5, 8'
    })

    // 绘制被DP污染的轨迹 (主题红)
    const latlngsProt = pointsProt.map((p: any) => [p.latitude, p.longitude] as [number, number])
    const polylineProt = L.polyline(latlngsProt, {
      color: '#F56C6C',
      weight: 3,
      opacity: 0.7,
    })

    if (trajLayers) {
      trajLayers.addLayer(polylineOrig)
      trajLayers.addLayer(polylineProt)

      // 仅标记原始起点/终点作锚点对比
      const startMarker = L.circleMarker(latlngsOrig[0], {
        radius: 6, fillColor: '#409EFF', fillOpacity: 1, weight: 2, color: '#fff',
      }).bindTooltip("真实起点")
      trajLayers.addLayer(startMarker)

      const endMarker = L.circleMarker(latlngsOrig[latlngsOrig.length - 1], {
        radius: 6, fillColor: '#E6A23C', fillOpacity: 1, weight: 2, color: '#fff',
      }).bindTooltip("真实终点")
      trajLayers.addLayer(endMarker)

      // 在被保护的终点做发散标定
      const protEndMarker = L.circleMarker(latlngsProt[latlngsProt.length - 1], {
        radius: 8, fillColor: '#F56C6C', fillOpacity: 0.8, weight: 1, color: '#fff',
      }).bindTooltip("DP模糊后终点")
      trajLayers.addLayer(protEndMarker)
    }

    const bounds = L.latLngBounds([...latlngsOrig, ...latlngsProt])
    map.fitBounds(bounds, { padding: [50, 50] })
  } catch {
    ElMessage.error('加载双轨对比详情失败')
  }
}

async function showTrajectoryOnMap(id: number, color: string, tooltipText: string = "轨迹") {
  try {
    const res = await trajectoryApi.getDetail(id)
    const points = res.data?.data?.points ?? []
    if (!points.length || !map) return

    const latlngs = points.map((p: any) => [p.latitude, p.longitude] as [number, number])
    const polyline = L.polyline(latlngs, {
      color,
      weight: 3,
      opacity: 0.8,
    }).bindTooltip(tooltipText)

    if (trajLayers) {
      trajLayers.addLayer(polyline)
      const startMarker = L.circleMarker(latlngs[0], {
        radius: 6, fillColor: '#409EFF', fillOpacity: 1, weight: 2, color: '#fff',
      })
      trajLayers.addLayer(startMarker)
      const endMarker = L.circleMarker(latlngs[latlngs.length - 1], {
        radius: 6, fillColor: '#F56C6C', fillOpacity: 1, weight: 2, color: '#fff',
      })
      trajLayers.addLayer(endMarker)
    }

    map.fitBounds(polyline.getBounds(), { padding: [30, 30] })
  } catch {
    ElMessage.error('加载轨迹详情失败')
  }
}

async function clearAll() {
  try {
    await trajectoryApi.clear()
    ElMessage.success('轨迹数据已清除')
    trajectories.value = []
    total.value = 0
    if (trajLayers) trajLayers.clearLayers()
  } catch {
    ElMessage.error('清除失败')
  }
}
</script>
