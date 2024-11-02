// services/api.config.js
import axios from 'axios'

import store from '@/store'
import router from '@/router'

// 創建axios實例
const api = axios.create({
    baseURL: process.env.VUE_APP_API_URL || 'http://localhost:8080/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
    }
})

// 請求攔截器
api.interceptors.request.use(
    (config) => {
        // 從localStorage獲取token
        const token = localStorage.getItem('token')
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

// 響應攔截器
api.interceptors.response.use(
    (response) => {
        return response.data
    },
    (error) => {
        const { response } = error

        // 處理錯誤響應
        if (response) {
            switch (response.status) {
                case 401: // 未授權
                    // 清除token和用戶信息
                    store.dispatch('auth/logout')
                    // 重定向到登入頁面
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

        // 顯示錯誤訊息
        const errorMessage = response?.data?.message || '發生錯誤，請稍後再試'
        store.dispatch('setError', errorMessage)

        return Promise.reject(error)
    }
)

// API端點
export const endpoints = {
    // 認證相關
    auth: {
        register: '/auth/register',
        login: '/auth/login',
        logout: '/auth/logout',
        refreshToken: '/auth/refresh-token',
        resetPassword: '/auth/reset-password',
        changePassword: '/auth/change-password'
    },

    // 用戶相關
    user: {
        profile: '/user/profile',
        updateProfile: '/user/profile',
        uploadAvatar: '/user/avatar'
    },

    // 電影相關
    movie: {
        list: '/movies',
        detail: (id) => `/movies/${id}`,
        schedules: (id) => `/movies/${id}/schedules`,
        reviews: (id) => `/movies/${id}/reviews`,
        categories: '/movies/categories'
    },

    // 訂票相關
    booking: {
        create: '/bookings',
        list: '/bookings',
        detail: (id) => `/bookings/${id}`,
        cancel: (id) => `/bookings/${id}/cancel`
    },

    // 電子錢包相關
    wallet: {
        info: '/wallet',
        topUp: '/wallet/top-up',
        transfer: '/wallet/transfer',
        transactions: '/wallet/transactions'
    },

    // 優惠相關
    discount: {
        list: '/discounts',
        detail: (id) => `/discounts/${id}`,
        use: (id) => `/discounts/${id}/use`,
        available: '/discounts/available'
    }
}

// API方法
export const apiService = {
    // 通用GET請求
    get: async (url, params = {}) => {
        try {
            const response = await api.get(url, { params })
            return response
        } catch (error) {
            throw error
        }
    },

    // 通用POST請求
    post: async (url, data = {}) => {
        try {
            const response = await api.post(url, data)
            return response
        } catch (error) {
            throw error
        }
    },

    // 通用PUT請求
    put: async (url, data = {}) => {
        try {
            const response = await api.put(url, data)
            return response
        } catch (error) {
            throw error
        }
    },

    // 通用DELETE請求
    delete: async (url) => {
        try {
            const response = await api.delete(url)
            return response
        } catch (error) {
            throw error
        }
    },

    // 文件上傳
    upload: async (url, file, onUploadProgress) => {
        try {
            const formData = new FormData()
            formData.append('file', file)

            const response = await api.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress
            })
            return response
        } catch (error) {
            throw error
        }
    }
}

export default api