import axios from 'axios'
import store from '@/store'
import router from '@/router'

// API實例配置
const api = axios.create({
    baseURL: process.env.VUE_APP_API_URL || 'http://localhost:8080/api',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
})

// 請求重試配置
const MAX_RETRIES = 3
const RETRY_DELAY = 1000

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

// 請求攔截器
api.interceptors.request.use(
    config => {
        // 添加重試配置
        config.retry = MAX_RETRIES
        config.retryDelay = RETRY_DELAY

        // 添加認證token
        const token = localStorage.getItem('token')
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
        // 處理token更新
        if (response.data?.token) {
            localStorage.setItem('token', response.data.token)
            api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
        }
        return response
    },
    async error => {
        const originalRequest = error.config

        // 處理請求重試
        if (error.response?.status === 401 && originalRequest.retry > 0) {
            originalRequest.retry -= 1
            try {
                await store.dispatch('auth/checkToken')
                return api(originalRequest)
            } catch (retryError) {
                // Token刷新失敗，執行登出流程
                await handleAuthError()
                return Promise.reject(retryError)
            }
        }

        // 處理錯誤響應
        if (error.response) {
            handleErrorResponse(error.response)
        } else if (error.request) {
            // 請求發送失敗
            handleNetworkError(error)
        } else {
            // 其他錯誤
            handleUnexpectedError(error)
        }

        return Promise.reject(error)
    }
)

// 處理認證錯誤
async function handleAuthError() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    store.commit('auth/CLEAR_AUTH_DATA')

    if (router.currentRoute.value.name !== 'login') {
        store.dispatch('setNotification', {
            type: 'warning',
            message: '登入已過期，請重新登入'
        })
        router.push({
            name: 'login',
            query: { redirect: router.currentRoute.value.fullPath }
        })
    }
}

// 處理錯誤響應
function handleErrorResponse(response) {
    const status = response.status
    const errorMessage = ERROR_MESSAGES[status] || '發生未知錯誤，請稍後再試'

    // 設置錯誤通知
    store.dispatch('setNotification', {
        type: 'error',
        message: errorMessage
    })

    // 特殊狀態碼處理
    switch (status) {
        case 401:
            handleAuthError()
            break
        case 403:
            if (router.currentRoute.value.name !== 'login') {
                router.push('/403')
            }
            break
        case 500:
            router.push('/500')
            break
    }
}

// 處理網絡錯誤
function handleNetworkError(error) {
    store.dispatch('setNotification', {
        type: 'error',
        message: '無法連接到伺服器，請檢查網路連線'
    })
    console.error('Network Error:', error)
}

// 處理未預期的錯誤
function handleUnexpectedError(error) {
    store.dispatch('setNotification', {
        type: 'error',
        message: '發生意外錯誤，請稍後再試'
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
        verifyToken: '/auth/verify-token'
    },
    users: {
        profile: '/users/profile',
        update: '/users/profile',
        changePassword: '/users/change-password'
    },
    movies: {
        list: '/movies',
        detail: id => `/movies/${id}`,
        schedules: id => `/movies/${id}/schedules`,
        search: '/movies/search'
    },
    schedules: {
        list: '/schedules',
        detail: id => `/schedules/${id}`,
        seats: id => `/schedules/${id}/seats`
    },
    tickets: {
        list: '/movie-tickets',
        create: '/movie-tickets',
        detail: id => `/movie-tickets/${id}`,
        cancel: id => `/movie-tickets/${id}/cancel`,
        qrcode: id => `/movie-tickets/${id}/qrcode`
    },
    discounts: {
        list: '/discount-coupons',
        detail: id => `/discount-coupons/${id}`,
        use: id => `/discount-coupons/${id}/use`,
        qrcode: id => `/discount-coupons/${id}/qrcode`
    },
    wallet: {
        info: '/wallet',
        balance: '/wallet/balance',
        deposit: '/wallet/deposit',
        withdraw: '/wallet/withdraw',
        transactions: '/wallet/transactions'
    },
    stores: {
        list: '/stores',
        detail: id => `/stores/${id}`,
        search: '/stores/search',
        nearby: '/stores/nearby'
    }
}

// API服務封裝
const apiService = {
    async get(url, config = {}) {
        try {
            const response = await api.get(url, {
                ...config,
                validateStatus: status => status < 500
            })
            return response.data
        } catch (error) {
            console.error(`GET ${url} failed:`, error)
            throw error
        }
    },

    async post(url, data = {}, config = {}) {
        try {
            const response = await api.post(url, data, {
                ...config,
                validateStatus: status => status < 500
            })
            return response.data
        } catch (error) {
            console.error(`POST ${url} failed:`, error)
            throw error
        }
    },

    async put(url, data = {}, config = {}) {
        try {
            const response = await api.put(url, data, {
                ...config,
                validateStatus: status => status < 500
            })
            return response.data
        } catch (error) {
            console.error(`PUT ${url} failed:`, error)
            throw error
        }
    },

    async delete(url, config = {}) {
        try {
            const response = await api.delete(url, {
                ...config,
                validateStatus: status => status < 500
            })
            return response.data
        } catch (error) {
            console.error(`DELETE ${url} failed:`, error)
            throw error
        }
    },

    // 上傳文件
    async upload(url, formData, config = {}) {
        try {
            const response = await api.post(url, formData, {
                ...config,
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                validateStatus: status => status < 500
            })
            return response.data
        } catch (error) {
            console.error(`Upload to ${url} failed:`, error)
            throw error
        }
    },

    // 下載文件
    async download(url, config = {}) {
        try {
            const response = await api.get(url, {
                ...config,
                responseType: 'blob',
                validateStatus: status => status < 500
            })
            return response.data
        } catch (error) {
            console.error(`Download from ${url} failed:`, error)
            throw error
        }
    }
}

export { api as default, apiService }
