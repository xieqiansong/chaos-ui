import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'


import App from './App.vue'
import router from './router'
import { permission } from '@/directives/permission'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

// 注册全局指令：v-permission（按钮级权限控制）
app.directive('permission', permission)

app.mount('#app')
