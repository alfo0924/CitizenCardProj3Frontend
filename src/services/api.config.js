import axios from 'axios'
import store from '@/store'
import router from '@/router'

const api = axios.create({
    baseURL: process.env.VUE_APP_API_URL || 'http://localhost:8080/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
})

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

api.interceptors.response.use(
    response => {
        if (response.data && response.data.token) {
            localStorage.setItem('token', response.data.token)
        }
        return response
    },
    error => {
        if (error.response) {
            switch (error.response.status) {
                case 400:
                    store.commit('SET_ERROR', '請求格式錯誤')
                    break
                case 401:
                    localStorage.removeItem('token')
                    localStorage.removeItem('user')
                    store.commit('auth/CLEAR_AUTH_DATA')
                    router.push('/login')
                    break
                case 403:
                    store.commit('SET_ERROR', '您沒有權限執行此操作')
                    if (router.currentRoute.value.path !== '/login') {
                        router.push('/403')
                    }
                    break
                case 404:
                    store.commit('SET_ERROR', '請求的資源不存在')
                    break
                case 422:
                    store.commit('SET_ERROR', '資料驗證失敗')
                    break
                case 429:
                    store.commit('SET_ERROR', '請求次數過多，請稍後再試')
                    break
                case 500:
                    store.commit('SET_ERROR', '伺服器錯誤，請稍後再試')
                    router.push('/500')
                    break
                default:
                    store.commit('SET_ERROR', '發生未知錯誤，請稍後再試')
            }
        } else if (error.request) {
            store.commit('SET_ERROR', '無法連接到伺服器，請檢查網路連線')
        } else {
            store.commit('SET_ERROR', '發生錯誤，請稍後再試')
        }
        return Promise.reject(error)
    }
)

export const endpoints = {
    auth: {
        login: '/auth/login',
        register: '/auth/register',
        logout: '/auth/logout',
        profile: '/auth/profile'
    },
    users: {
        profile: '/users/profile',
        update: '/users/profile'
    },
    movies: {
        list: '/movies',
        detail: id => `/movies/${id}`,
        schedules: id => `/movies/${id}/schedules`
    },
    schedules: {
        list: '/schedules',
        detail: id => `/schedules/${id}`
    },
    tickets: {
        list: '/movie-tickets',
        create: '/movie-tickets',
        detail: id => `/movie-tickets/${id}`,
        qrcode: id => `/movie-tickets/${id}/qrcode`
    },
    discounts: {
        list: '/discount-coupons',
        detail: id => `/discount-coupons/${id}`,
        qrcode: id => `/discount-coupons/${id}/qrcode`
    },
    wallet: {
        info: '/wallet',
        balance: '/wallet/balance'
    },
    stores: {
        list: '/stores',
        detail: id => `/stores/${id}`
    }
}

const apiService = {
    async get(url, config = {}) {
        try {
            const response = await api.get(url, config)
            return response.data
        } catch (error) {
            this.handleError(error)
            throw error
        }
    },

    async post(url, data = {}, config = {}) {
        try {
            const response = await api.post(url, data, config)
            return response.data
        } catch (error) {
            this.handleError(error)
            throw error
        }
    },

    async put(url, data = {}, config = {}) {
        try {
            const response = await api.put(url, data, config)
            return response.data
        } catch (error) {
            this.handleError(error)
            throw error
        }
    },

    async delete(url, config = {}) {
        try {
            const response = await api.delete(url, config)
            return response.data
        } catch (error) {
            this.handleError(error)
            throw error
        }
    },

    handleError(error) {
        console.error('API Error:', error)
    }
}

export { api as default, apiService }
