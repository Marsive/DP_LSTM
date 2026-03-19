import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        redirect: '/dashboard',
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../pages/Login.vue'),
        meta: { title: '登录', hideLayout: true },
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('../pages/Dashboard.vue'),
        meta: { title: '总控台', icon: 'Odometer' },
    },
    {
        path: '/data-simulation',
        name: 'DataSimulation',
        component: () => import('../pages/DataSimulation.vue'),
        meta: { title: '数据模拟', icon: 'MapLocation' },
    },
    {
        path: '/privacy-protection',
        name: 'PrivacyProtection',
        component: () => import('../pages/PrivacyProtection.vue'),
        meta: { title: '隐私保护', icon: 'Lock' },
    },
    {
        path: '/model-training',
        name: 'ModelTraining',
        component: () => import('../pages/ModelTraining.vue'),
        meta: { title: '模型训练', icon: 'Cpu' },
    },
    {
        path: '/evaluation',
        name: 'Evaluation',
        component: () => import('../pages/Evaluation.vue'),
        meta: { title: '效果评估', icon: 'DataAnalysis' },
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')

    // 如果没有 token 且目标不是登录页，重定向到登录页
    if (!token && to.path !== '/login') {
        next('/login')
    }
    // 如果登录了且目标是登录页，重定向到首页
    else if (token && to.path === '/login') {
        next('/')
    }
    else {
        next()
    }
})

export default router
