import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'leaflet/dist/leaflet.css'

import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)

app.use(ElementPlus, { locale: zhCn })
app.use(router)

// 注册所有 ElementPlus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')
