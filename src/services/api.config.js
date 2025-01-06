import axios from 'axios'
import store from '@/store'
import router from '@/router'

export const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:8080'

// API 實例配置
const api = axios.create({
    baseURL: process.env.VUE_APP_API_URL || 'http://localhost:8080/api',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true
})

// 常量配置
const CONFIG = {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000,
    REQUEST_TIMEOUT: 15000
}

// 錯誤狀態碼與消息映射
const ERROR_MESSAGES = {
    400: '請求格式錯誤',
    401: '身份驗證失敗，請重新登入',
    403: '您沒有權限執行此操作',
    404: '請求的資源不存在',
    422: '資料驗證失敗',
    429: '請求次數過多，請稍後再試',
    500: '伺服器錯誤，請稍後再試',
    503: '服務暫時不可用，請稍後再試'
}

// Token 管理
const TokenManager = {
    getToken() {
        return localStorage.getItem('token')
    },
    setToken(token) {
        if (token) {
            localStorage.setItem('token', token)
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        }
    },
    removeToken() {
        localStorage.removeItem('token')
        delete api.defaults.headers.common['Authorization']
    },
    isTokenExpiringSoon() {
        const token = this.getToken()
        if (!token) return false
        try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            const expiryTime = payload.exp * 1000
            return Date.now() > expiryTime - CONFIG.TOKEN_REFRESH_THRESHOLD
        } catch {
            return false
        }
    }
}

// 請求攔截器
api.interceptors.request.use(
    async config => {
        // 處理 URL 格式
        if (!config.url.startsWith('/') && !config.url.startsWith('http')) {
            config.url = `/${config.url}`
        }

        if (config.url === '/auth/refresh-token') {
            return config
        }

        // 加入 debug 資訊
        console.log('當前請求 URL:', config.url)
        console.log('Token:', TokenManager.getToken())
        console.log('Headers:', config.headers)

        if (TokenManager.isTokenExpiringSoon()) {
            try {
                const refreshResult = await store.dispatch('auth/refreshToken')
                if (!refreshResult.success) {
                    await store.dispatch('auth/forceLogout')
                    throw new Error('Token 刷新失敗')
                }
            } catch (error) {
                console.error('Token refresh failed:', error)
                throw error
            }
        }

        const token = TokenManager.getToken()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
            console.log('設置 Authorization 後的 Headers:', config.headers)
        }

        if (config.method === 'get') {
            config.params = {
                ...config.params,
                _t: Date.now()
            }
        }

        return config
    },
    error => Promise.reject(error)
)
// 響應攔截器
api.interceptors.response.use(
    response => {
        const newToken = response.headers['x-auth-token'] || response.data?.token
        if (newToken) {
            TokenManager.setToken(newToken)
        }
        return response
    },
    async error => {
        const originalRequest = error.config

        // 如果是 401 錯誤且不是重試請求
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true
            try {
                await store.dispatch('auth/refreshToken')
                return api(originalRequest)
            } catch (refreshError) {
                await store.dispatch('auth/handleAuthError', refreshError)
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

// API服務封裝
const apiService = {
    async request(method, url, options = {}) {
        try {
            // 確保 url 以斜線開頭
            const normalizedUrl = url.startsWith('/') ? url : `/${url}`

            const config = {
                method,
                url: normalizedUrl,
                ...options,
                validateStatus: status => status < 500
            }

            // 特殊處理 multipart/form-data
            if (options.data instanceof FormData) {
                config.headers = {
                    ...config.headers,
                    'Content-Type': 'multipart/form-data'
                }
            }

            // Debug 信息
            console.log('Request config:', {
                method,
                url: normalizedUrl,
                headers: config.headers,
                data: options.data instanceof FormData ?
                    Object.fromEntries(options.data.entries()) :
                    options.data
            })

            const response = await api(config)
            return response
        } catch (error) {
            console.error(`${method.toUpperCase()} ${url} failed:`, error)
            if (error.response) {
                console.error('Error response:', {
                    status: error.response.status,
                    data: error.response.data,
                    headers: error.response.headers
                })
            }
            throw error
        }
    },

    get(url, config = {}) {
        return this.request('get', url, config)
    },

    post(url, data = {}, config = {}) {
        return this.request('post', url, { ...config, data })
    },

    put(url, data = {}, config = {}) {
        const defaultConfig = {
            headers: {
                'Content-Type': 'application/json'
            }
        }
        return this.request('put', url, {
            ...defaultConfig,
            ...config,
            data
        })
    },

    patch(url, data = {}, config = {}) {
        return this.request('patch', url, { ...config, data })
    },

    delete(url, config = {}) {
        return this.request('delete', url, config)
    },

    async upload(url, formData, config = {}) {
        return this.request('post', url, {
            ...config,
            data: formData,
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    },

    async download(url, config = {}) {
        return this.request('get', url, {
            ...config,
            responseType: 'blob'
        })
    }
}

// API 端點配置
export const endpoints = {
    auth: {
        login: '/auth/login',
        register: '/auth/register',
        logout: '/auth/logout',
        profile: '/auth/profile',
        verifyToken: '/auth/verify-token',
        refreshToken: '/auth/refresh-token'
    },
    users: {
        profile: '/users/profile',
        update: '/users/profile',
        changePassword: '/users/change-password',
        updateAvatar: '/users/avatar'
    },
    movies: {
        list: '/movies',
        detail: id => `/movies/${id}`,
        schedules: id => `/movies/${id}/schedules`,
        search: '/movies/search',
        upcoming: '/movies/upcoming',
        popular: '/movies/popular'
    },
    schedules: {
        list: '/schedules',
        detail: id => `/schedules/${id}`,
        seats: id => `/schedules/${id}/seats`,
        book: id => `/schedules/${id}/book`
    },
    tickets: {
        list: '/movie-tickets',
        create: '/movie-tickets',
        detail: id => `/movie-tickets/${id}`,
        cancel: id => `/movie-tickets/${id}/cancel`,
        qrcode: id => `/movie-tickets/${id}/qrcode`,
        validate: id => `/movie-tickets/${id}/validate`
    },
    discounts: {
        list: '/discount-coupons',
        detail: id => `/discount-coupons/${id}`,
        use: id => `/discount-coupons/${id}/use`,
        qrcode: id => `/discount-coupons/${id}/qrcode`,
        validate: id => `/discount-coupons/${id}/validate`,
        available: '/discount-coupons/available'
    },
    wallet: {
        info: '/wallet',
        balance: '/wallet/balance',
        deposit: '/wallet/deposit',
        withdraw: '/wallet/withdraw',
        transactions: '/wallet/transactions',
        statement: '/wallet/statement',
        tickets: '/wallet/tickets',
        coupons: '/wallet/coupons',
        ticketDetail: id => `/wallet/tickets/${id}`,
        couponDetail: id => `/wallet/coupons/${id}`
    },
    stores: {
        list: '/stores',
        detail: id => `/stores/${id}`,
        search: '/stores/search',
        nearby: '/stores/nearby',
        categories: '/stores/categories',
        promotions: id => `/stores/${id}/promotions`
    }
}

export { api as default, apiService, TokenManager }
