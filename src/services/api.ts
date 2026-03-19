/**
 * 后端 API 服务封装
 *
 * 所有接口统一使用 axios 实例，保持一致的请求/响应格式。
 */

import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:5000/api/v1',
    timeout: 120000,  // 训练等操作可能较久
    headers: { 'Content-Type': 'application/json' },
})

// ─── 轨迹数据接口 ───────────────────────────────────

export interface TrajectoryConfig {
    vehicleCount: number
    timeSteps: number
    samplingInterval: number
    gridRows: number
    gridCols: number
    speedRange: [number, number]
}

export const trajectoryApi = {
    generate: (config: TrajectoryConfig) =>
        api.post('/trajectories/generate', config),

    list: (page = 1, pageSize = 20, isProtected?: boolean) =>
        api.get('/trajectories', {
            params: { page, pageSize, isProtected },
        }),

    getDetail: (id: number) =>
        api.get(`/trajectories/${id}`),

    clear: () =>
        api.delete('/trajectories'),
}

// ─── 隐私保护接口 ───────────────────────────────────

export interface PrivacyConfig {
    trajectoryIds: number[]
    epsilon: number
    sensitivityMeters: number
    budgetStrategy: string
}

export const privacyApi = {
    apply: (config: PrivacyConfig) =>
        api.post('/privacy/apply', config),

    getConfig: (epsilon?: number, sensitivityMeters?: number) =>
        api.get('/privacy/config', {
            params: { epsilon, sensitivityMeters },
        }),

    compare: (epsilonValues: number[], sensitivityMeters = 100) =>
        api.post('/privacy/compare', { epsilonValues, sensitivityMeters }),
}

// ─── 模型接口 ───────────────────────────────────────

export interface TrainConfig {
    epochs: number
    batchSize: number
    learningRate: number
    hiddenSize: number
    numLayers: number
    seqLength: number
    trainRatio: number
}

export const modelApi = {
    train: (config: TrainConfig) =>
        api.post('/model/train', config),

    getStatus: () =>
        api.get('/model/status'),

    predict: (trajectoryId: number, predictSteps: number) =>
        api.post('/model/predict', { trajectoryId, predictSteps }),

    generateFakePaths: (params: {
        trajectoryId: number
        generateSteps: number
        epsilon: number
        sensitivityMeters: number
        noiseTarget: string
        numPaths: number
    }) => api.post('/model/generate', params),

    getRecords: () =>
        api.get('/model/records'),
}

// ─── 评估接口 ───────────────────────────────────────

export const evaluationApi = {
    run: (params: {
        originalTrajectoryIds?: number[]
        protectedTrajectoryIds?: number[]
        epsilon?: number
        kAnonymityThreshold?: number
    }) => api.post('/evaluation/run', params),

    getResults: (limit = 20) =>
        api.get('/evaluation/results', { params: { limit } }),

    batchCompare: (epsilonValues: number[]) =>
        api.post('/evaluation/batch-compare', { epsilonValues }),
}

export default api
