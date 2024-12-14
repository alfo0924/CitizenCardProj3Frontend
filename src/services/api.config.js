import axios from 'axios'
import store from '@/store'
import router from '@/router'

// 創建axios實例
const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
})

// 請求攔截器
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
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
    response => response.data,
    error => {
        if (error.code === 'ERR_NETWORK') {
            console.error('Network error:', error)
            throw new Error('網路連線錯誤，請檢查網路狀態')
        }

        const { response } = error
        if (response) {
            const errorMessage = response.data?.message || '發生錯誤，請稍後再試'

            switch (response.status) {
                case 400:
                    store.dispatch('setError', errorMessage)
                    break
                case 401:
                    store.dispatch('auth/logout')
                    router.push({
                        path: '/login',
                        query: { redirect: router.currentRoute.value.fullPath }
                    })
                    break
                case 403:
                    store.dispatch('setError', '無權限訪問')
                    break
                case 404:
                    store.dispatch('setError', '資源不存在')
                    break
                case 500:
                    store.dispatch('setError', '伺服器錯誤')
                    break
                default:
                    store.dispatch('setError', errorMessage)
            }
        }

        return Promise.reject(error)
    }
)

// API端點配置
export const endpoints = {
    auth: {
        register: '/auth/register',
        login: '/auth/login',
        logout: '/auth/logout',
        validateEmail: '/auth/validate-email',
        profile: '/auth/profile',
        check: '/auth/check'
    },
    movies: {
        list: '/movies',
        detail: id => `/movies/${id}`,
        schedules: id => `/movies/${id}/schedules`
    },
    schedules: {
        list: '/schedules',
        detail: id => `/schedules/${id}`,
        seats: id => `/schedules/${id}/seats`
    },
    wallet: {
        info: '/wallet',
        balance: '/wallet/balance'
    },
    movieTickets: {
        list: '/movie-tickets',
        detail: id => `/movie-tickets/${id}`,
        create: '/movie-tickets',
        qrcode: id => `/movie-tickets/${id}/qrcode`
    },
    discountCoupons: {
        list: '/discount-coupons',
        detail: id => `/discount-coupons/${id}`,
        qrcode: id => `/discount-coupons/${id}/qrcode`
    },
    stores: {
        list: '/stores',
        detail: id => `/stores/${id}`,
        categories: '/stores/categories'
    }
}

// API服務方法
const apiService = {
    get: async (url, params = {}) => {
        try {
            const response = await api.get(url, { params })
            return response
        } catch (error) {
            console.error('GET request failed:', error)
            throw error
        }
    },

    post: async (url, data = {}) => {
        try {
            const response = await api.post(url, data)
            return response
        } catch (error) {
            console.error('POST request failed:', error)
            throw error
        }
    },

    put: async (url, data = {}) => {
        try {
            const response = await api.put(url, data)
            return response
        } catch (error) {
            console.error('PUT request failed:', error)
            throw error
        }
    },

    delete: async url => {
        try {
            const response = await api.delete(url)
            return response
        } catch (error) {
            console.error('DELETE request failed:', error)
            throw error
        }
    }
}

export { api as default, apiService }
