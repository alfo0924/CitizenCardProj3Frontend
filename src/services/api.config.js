import axios from 'axios'
import store from '@/store'
import router from '@/router'

// 創建axios實例
const api = axios.create({
    baseURL: 'http://localhost:8080',
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
        // 添加CORS相關標頭
        config.headers['Access-Control-Allow-Origin'] = 'http://localhost:3009'
        config.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
        config.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
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
                    router.push('/403')
                    break
                case 404:
                    store.dispatch('setError', '資源不存在')
                    router.push('/404')
                    break
                case 500:
                    store.dispatch('setError', '伺服器錯誤')
                    router.push('/500')
                    break
                default:
                    store.dispatch('setError', errorMessage)
            }
        }

        throw error
    }
)

// API端點
export const endpoints = {
    auth: {
        register: '/auth/register',
        login: '/auth/login',
        logout: '/auth/logout',
        validateEmail: '/auth/validate-email',
        profile: '/auth/profile',
        check: '/auth/check'
    },

    user: {
        profile: '/user/profile',
        updateProfile: '/user/profile'
    },

    movie: {
        list: '/movies',
        detail: id => `/movies/${id}`,
        schedules: id => `/movies/${id}/schedules`
    },

    wallet: {
        tickets: '/wallet/tickets',
        coupons: '/wallet/coupons',
        useTicket: id => `/wallet/tickets/${id}/use`,
        useCoupon: id => `/wallet/coupons/${id}/use`
    }
}

// API方法
export const apiService = {
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

    patch: async (url, data = {}) => {
        try {
            const response = await api.patch(url, data)
            return response
        } catch (error) {
            console.error('PATCH request failed:', error)
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

export default api
