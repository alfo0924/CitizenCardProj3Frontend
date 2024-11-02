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
  config => {
      const token = localStorage.getItem('token')
      if (token) {
          config.headers.Authorization = `Bearer ${token}`
      }
      return config
  },
  error => {
      return Promise.reject(error)
  }
)

// 響應攔截器
api.interceptors.response.use(
  response => response.data,
  error => {
      const { response } = error

      if (response) {
          switch (response.status) {
          case 401:
              store.dispatch('auth/logout')
              router.push({
                  path: '/login',
                  query: { redirect: router.currentRoute.value.fullPath }
              })
              break
          case 403:
              router.push('/403')
              break
          case 404:
              router.push('/404')
              break
          case 500:
              router.push('/500')
              break
          }
      }

      const errorMessage = response?.data?.message || '發生錯誤，請稍後再試'
      store.dispatch('setError', errorMessage)
      return Promise.reject(error)
  }
)

// API端點
export const endpoints = {
    auth: {
        register: '/auth/register',
        login: '/auth/login',
        logout: '/auth/logout',
        refreshToken: '/auth/refresh-token',
        resetPassword: '/auth/reset-password',
        changePassword: '/auth/change-password'
    },

    user: {
        profile: '/user/profile',
        updateProfile: '/user/profile',
        uploadAvatar: '/user/avatar'
    },

    movie: {
        list: '/movies',
        detail: id => `/movies/${id}`,
        schedules: id => `/movies/${id}/schedules`,
        reviews: id => `/movies/${id}/reviews`,
        categories: '/movies/categories'
    },

    booking: {
        create: '/bookings',
        list: '/bookings',
        detail: id => `/bookings/${id}`,
        cancel: id => `/bookings/${id}/cancel`
    },

    wallet: {
        info: '/wallet',
        topUp: '/wallet/top-up',
        transfer: '/wallet/transfer',
        transactions: '/wallet/transactions'
    },

    discount: {
        list: '/discounts',
        detail: id => `/discounts/${id}`,
        use: id => `/discounts/${id}/use`,
        available: '/discounts/available'
    }
}

// API方法
export const apiService = {
    get: async (url, params = {}) => {
        const response = await api.get(url, { params })
        return response
    },

    post: async (url, data = {}) => {
        const response = await api.post(url, data)
        return response
    },

    put: async (url, data = {}) => {
        const response = await api.put(url, data)
        return response
    },

    delete: async url => {
        const response = await api.delete(url)
        return response
    },

    upload: async (url, file, onUploadProgress) => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await api.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress
        })
        return response
    }
}

export default api
