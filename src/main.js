import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'

// 引入 Bootstrap CSS 和 JavaScript
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// 引入 Font Awesome
import '@fortawesome/fontawesome-free/css/all.min.css'

// 引入自定義全局樣式
import '@/assets/css/main.css'
import '@/assets/css/variables.css'
import '@/assets/css/utilities.css'

// 設置 Vue 功能標誌
window.__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = false

// 設置 axios 默認配置
axios.defaults.baseURL = process.env.VUE_APP_API_URL || 'http://localhost:8080/api'
axios.defaults.headers.common['Content-Type'] = 'application/json'

// 創建 Vue 應用實例
const app = createApp(App)

// 全局錯誤處理
const errorHandler = (err, vm, info) => {
    console.error('Global error:', {
        error: err,
        component: vm?.$options?.name,
        info,
        route: router.currentRoute.value
    })
    store.dispatch('setError', err.message || '發生未知錯誤')
}

app.config.errorHandler = errorHandler

// 全局屬性
app.config.globalProperties.$formatDate = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('zh-TW')
}

app.config.globalProperties.$formatDateTime = (datetime) => {
    if (!datetime) return ''
    return new Date(datetime).toLocaleString('zh-TW')
}

app.config.globalProperties.$formatCurrency = (amount) => {
    if (typeof amount !== 'number') return 'NT$ 0'
    return `NT$ ${amount.toLocaleString('zh-TW')}`
}

// 全局導航守衛
router.beforeEach((to, from, next) => {
    // 設置頁面標題
    document.title = to.meta.title ? `${to.meta.title} - 市民卡系統` : '市民卡系統'

    // 檢查路由是否需要認證
    if (to.matched.some((record) => record.meta.requiresAuth)) {
        if (!store.getters['auth/isLoggedIn']) {
            next({
                path: '/login',
                query: { redirect: to.fullPath }
            })
            return
        }
    }

    // 檢查路由是否需要管理員權限
    if (to.matched.some((record) => record.meta.requiresAdmin)) {
        if (!store.getters['auth/isAdmin']) {
            next({ path: '/' })
            return
        }
    }

    // 已登入用戶不能訪問登入/註冊頁
    if (to.matched.some((record) => record.meta.requiresGuest)) {
        if (store.getters['auth/isLoggedIn']) {
            next({ path: '/' })
            return
        }
    }

    next()
})

// axios 請求攔截器
axios.interceptors.request.use(
  (config) => {
      const token = store.getters['auth/token']
      if (token) {
          config.headers.Authorization = `Bearer ${token}`
      }
      return config
  },
  (error) => {
      console.error('Request error:', error)
      return Promise.reject(error)
  }
)

// axios 響應攔截器
axios.interceptors.response.use(
  (response) => response,
  (error) => {
      console.error('Response error:', error)

      if (error.response) {
          switch (error.response.status) {
          case 401:
              store.dispatch('auth/logout')
              router.push({
                  path: '/login',
                  query: { redirect: router.currentRoute.value.fullPath }
              })
              break
          case 403:
              router.push('/403')
              break
          case 404:
              router.push('/404')
              break
          case 500:
              router.push('/500')
              break
          }
      }

      return Promise.reject(error)
  }
)

// 註冊 Vuex store
app.use(store)

// 註冊 Vue Router
app.use(router)

// 掛載應用
app.mount('#app')

// 開發環境提示
if (process.env.NODE_ENV === 'development') {
    console.log('Running in development mode')
}

// 未捕獲的 Promise 錯誤
window.addEventListener('unhandledrejection', event => {
    console.error('Unhandled promise rejection:', {
        error: event.reason,
        promise: event.promise
    })
})

// 導出 app 實例（用於測試）
export default app
