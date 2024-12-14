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
                case 401:
                    localStorage.removeItem('token')
                    localStorage.removeItem('user')
                    localStorage.removeItem('wallet')
                    store.commit('auth/CLEAR_AUTH_DATA')
                    router.push('/login')
                    break
                case 403:
                    if (router.currentRoute.value.path !== '/login') {
                        router.push('/403')
                    }
                    break
                case 500:
                    router.push('/500')
                    break
            }
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
        const errorMessage = error.response?.data?.message || '操作失敗，請稍後再試'
        store.commit('SET_ERROR', errorMessage)
        console.error('API Error:', error)
    }
}

export { api as default, apiService }
