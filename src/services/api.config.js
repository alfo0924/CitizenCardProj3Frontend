import axios from 'axios'
import store from '@/store'
import router from '@/router'

// 創建axios實例，設定基本配置
const api = axios.create({
    baseURL: 'http://localhost:8080', // 移除/api前綴
    timeout: 15000, // 增加超時時間
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
    }
})

// 添加跨域配置
api.defaults.withCredentials = true

// 請求攔截器：在發送請求前執行
api.interceptors.request.use(
    config => {
        // 從本地存儲獲取認證令牌
        const token = localStorage.getItem('token')
        // 如果存在令牌，加入到請求標頭中
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    error => {
        // 請求錯誤處理
        return Promise.reject(error)
    }
)

// 響應攔截器：處理伺服器回應
api.interceptors.response.use(
    // 成功回應直接返回數據
    response => response.data,
    // 錯誤回應處理
    error => {
        const { response } = error

        if (response) {
            // 根據不同的錯誤狀態碼處理
            switch (response.status) {
                case 401: // 未授權
                    store.dispatch('auth/logout')
                    router.push({
                        path: '/login',
                        query: { redirect: router.currentRoute.value.fullPath }
                    })
                    break
                case 403: // 禁止訪問
                    router.push('/403')
                    break
                case 404: // 找不到資源
                    router.push('/404')
                    break
                case 500: // 伺服器錯誤
                    router.push('/500')
                    break
            }
        }

        // 設定錯誤訊息
        const errorMessage = response?.data?.message || '發生錯誤，請稍後再試'
        store.dispatch('setError', errorMessage)
        return Promise.reject(error)
    }
)

// API端點定義
export const endpoints = {
    // 認證相關端點
    auth: {
        register: '/auth/register',
        login: '/auth/login',
        logout: '/auth/logout'
    },

    // 用戶相關端點
    user: {
        profile: '/user/profile',
        updateProfile: '/user/profile'
    },

    // 電影相關端點
    movie: {
        list: '/movies',
        detail: id => `/movies/${id}`,
        schedules: id => `/movies/${id}/schedules`
    },

    // 票券相關端點
    wallet: {
        tickets: '/wallet/tickets',
        coupons: '/wallet/coupons',
        useTicket: id => `/wallet/tickets/${id}/use`,
        useCoupon: id => `/wallet/coupons/${id}/use`
    }
}

// API方法封裝
export const apiService = {
    // GET請求方法
    get: async (url, params = {}) => {
        const response = await api.get(url, { params })
        return response
    },

    // POST請求方法
    post: async (url, data = {}) => {
        const response = await api.post(url, data)
        return response
    },

    // PATCH請求方法
    patch: async (url, data = {}) => {
        const response = await api.patch(url, data)
        return response
    },

    // DELETE請求方法
    delete: async url => {
        const response = await api.delete(url)
        return response
    }
}

export default api
