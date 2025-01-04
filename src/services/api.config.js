import axios from 'axios'
import store from '@/store'
import router from '@/router'
export const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:8080'
// API 實例配置
const api = axios.create({
    baseURL: process.env.VUE_APP_API_URL || 'http://localhost:8080',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
})

// 常量配置
const CONFIG = {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes in milliseconds
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
        // 添加重試配置
        config.retry = CONFIG.MAX_RETRIES
        config.retryDelay = CONFIG.RETRY_DELAY

        // 檢查 token 是否即將過期
        if (TokenManager.isTokenExpiringSoon()) {
            try {
                await store.dispatch('auth/refreshToken')
            } catch (error) {
                console.warn('Token refresh failed:', error)
            }
        }

        // 添加認證 token
        const token = TokenManager.getToken()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        // 添加請求時間戳，防止快取
        if (config.method === 'get') {
            config.params = {
                ...config.params,
                _t: Date.now()
            }
        }

        return config
    },
    error => {
        console.error('Request error:', error)
        return Promise.reject(error)
    }
)

// 響應攔截器
api.interceptors.response.use(
    response => {
        // 處理 token 更新
        const newToken = response.headers['x-auth-token'] || response.data?.token
        if (newToken) {
            TokenManager.setToken(newToken)
        }
        return response
    },
    async error => {
        const originalRequest = error.config

        // 處理請求重試
        if (error.response?.status === 401 && originalRequest.retry > 0) {
            originalRequest.retry -= 1

            await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY))

            try {
                const refreshResult = await store.dispatch('auth/refreshToken')
                if (refreshResult.success) {
                    return api(originalRequest)
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError)
            }

            await handleAuthError()
            return Promise.reject(error)
        }

        // 處理錯誤響應
        if (error.response) {
            await handleErrorResponse(error.response)
        } else if (error.request) {
            handleNetworkError(error)
        } else {
            handleUnexpectedError(error)
        }

        return Promise.reject(error)
    }
)

// 處理認證錯誤
async function handleAuthError() {
    TokenManager.removeToken()
    localStorage.removeItem('user')
    await store.dispatch('auth/logout')

    if (router.currentRoute.value.name !== 'login') {
        store.dispatch('setNotification', {
            type: 'warning',
            message: '登入已過期，請重新登入',
            duration: 5000
        })

        router.push({
            name: 'login',
            query: {
                redirect: router.currentRoute.value.fullPath,
                expired: 'true'
            }
        })
    }
}

// 處理錯誤響應
async function handleErrorResponse(response) {
    const status = response.status
    const serverMessage = response.data?.message
    const errorMessage = serverMessage || ERROR_MESSAGES[status] || '發生未知錯誤，請稍後再試'

    store.dispatch('setNotification', {
        type: 'error',
        message: errorMessage,
        duration: 5000
    })

    switch (status) {
        case 401:
            await handleAuthError()
            break
        case 403:
            if (!router.currentRoute.value.path.includes('/403')) {
                router.push('/403')
            }
            break
        case 500:
            if (!router.currentRoute.value.path.includes('/500')) {
                router.push('/500')
            }
            break
    }
}

// 處理網絡錯誤
function handleNetworkError(error) {
    store.dispatch('setNotification', {
        type: 'error',
        message: '無法連接到伺服器，請檢查網路連線',
        duration: 5000
    })
    console.error('Network Error:', error)
}

// 處理未預期的錯誤
function handleUnexpectedError(error) {
    store.dispatch('setNotification', {
        type: 'error',
        message: '發生意外錯誤，請稍後再試',
        duration: 5000
    })
    console.error('Unexpected Error:', error)
}

// API端點配置
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
        tickets: '/wallet/tickets',  // 新增
        coupons: '/wallet/coupons',  // 新增
        ticketDetail: id => `/wallet/tickets/${id}`,  // 新增
        couponDetail: id => `/wallet/coupons/${id}`   // 新增
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

// API服務封裝
const apiService = {
    async request(method, url, options = {}) {
        try {
            const config = {
                method,
                url,
                ...options,
                validateStatus: status => status < 500
            }

            const response = await api(config)
            return response
        } catch (error) {
            console.error(`${method.toUpperCase()} ${url} failed:`, error)
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
        return this.request('put', url, { ...config, data })
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
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },

    async download(url, config = {}) {
        return this.request('get', url, {
            ...config,
            responseType: 'blob'
        })
    }
}

export { api as default, apiService, TokenManager }
