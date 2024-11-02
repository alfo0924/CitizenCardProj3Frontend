import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 引入 Bootstrap CSS 和 JavaScript
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// 引入 Font Awesome
import '@fortawesome/fontawesome-free/css/all.min.css'

// 引入自定義全局樣式
import '@/assets/css/main.css'
import '@/assets/css/variables.css'
import '@/assets/css/utilities.css'

// 創建 Vue 應用實例
const app = createApp(App)

// 全局錯誤處理
app.config.errorHandler = (err, vm, info) => {
    console.error('Global error:', err)
    console.error('Error info:', info)
    store.dispatch('setError', err.message || '發生未知錯誤')
}

// 全局屬性
app.config.globalProperties.$formatDate = (date) => {
    return new Date(date).toLocaleDateString('zh-TW')
}

app.config.globalProperties.$formatDateTime = (datetime) => {
    return new Date(datetime).toLocaleString('zh-TW')
}

app.config.globalProperties.$formatCurrency = (amount) => {
    return `NT$ ${amount.toLocaleString('zh-TW')}`
}

// 全局導航守衛
router.beforeEach((to, from, next) => {
    // 檢查路由是否需要認證
    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!store.getters['auth/isLoggedIn']) {
            next({
                path: '/login',
                query: { redirect: to.fullPath }
            })
            return
        }
    }

    // 檢查路由是否需要管理員權限
    if (to.matched.some(record => record.meta.requiresAdmin)) {
        if (!store.getters['auth/isAdmin']) {
            next({ path: '/' })
            return
        }
    }

    // 已登入用戶不能訪問登入/註冊頁
    if (to.matched.some(record => record.meta.requiresGuest)) {
        if (store.getters['auth/isLoggedIn']) {
            next({ path: '/' })
            return
        }
    }

    next()
})

// axios 請求攔截器
import axios from 'axios'

axios.interceptors.request.use(
    config => {
        const token = store.getters['auth/token']
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

// axios 響應攔截器
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    // Token 過期或無效
                    store.dispatch('auth/logout')
                    router.push('/login')
                    break
                case 403:
                    // 權限不足
                    router.push('/403')
                    break
                case 404:
                    // 資源不存在
                    router.push('/404')
                    break
                case 500:
                    // 伺服器錯誤
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

// 開發環境警告
if (process.env.NODE_ENV === 'development') {
    console.log('Running in development mode')
}

// PWA 支援
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registered:', registration)
            })
            .catch(error => {
                console.error('ServiceWorker registration failed:', error)
            })
    })
}