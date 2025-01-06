import adminService from '@/services/admin.service'
import authService from '@/services/auth.service'

const state = {
    dashboardStats: {
        totalUsers: 0,
        newUsers: 0,
        totalStores: 0,
        newStores: 0,
        activeMovies: 0,
        newMovies: 0
    },
    userData: {
        labels: [],
        data: []
    },
    storeData: {
        labels: [],
        data: []
    },
    layout: 'default',
    isLoading: false,
    error: null,
    isAuthenticated: false,
    token: null,
    userRoleDistribution: {},
    storeCategoryDistribution: {}
}

const mutations = {
    SET_DASHBOARD_STATS(state, data) {
        state.dashboardStats = {
            totalUsers: parseInt(data.totalUsers) || 0,
            newUsers: parseInt(data.newUsers) || 0,
            totalStores: parseInt(data.totalStores) || 0,
            newStores: parseInt(data.newStores) || 0,
            activeMovies: parseInt(data.activeMovies) || 0,
            newMovies: parseInt(data.newMovies) || 0
        }
        // 直接設置分佈數據
        state.userRoleDistribution = data.userRoleDistribution || {}
        state.storeCategoryDistribution = data.storeCategoryDistribution || {}
    },
    SET_USER_DATA(state, distribution) {
        if (!distribution) return
        // 修改：直接使用分佈數據
        state.userRoleDistribution = distribution
        state.userData = {
            labels: Object.keys(distribution),
            data: Object.values(distribution)
        }
    },
    SET_STORE_DATA(state, distribution) {
        if (!distribution) return
        // 修改：直接使用分佈數據
        state.storeCategoryDistribution = distribution
        state.storeData = {
            labels: Object.keys(distribution),
            data: Object.values(distribution)
        }
    },
    SET_LOADING(state, status) {
        state.isLoading = Boolean(status)
    },
    SET_ERROR(state, error) {
        state.error = error ? String(error) : null
    },
    SET_LAYOUT(state, layout) {
        state.layout = layout || 'default'
    },
    SET_AUTH_STATUS(state, status) {
        state.isAuthenticated = Boolean(status)
    },
    SET_TOKEN(state, token) {
        state.token = token || null
    },
    CLEAR_DASHBOARD_DATA(state) {
        Object.assign(state, {
            dashboardStats: {
                totalUsers: 0,
                newUsers: 0,
                totalStores: 0,
                newStores: 0,
                activeMovies: 0,
                newMovies: 0
            },
            userData: { labels: [], data: [] },
            storeData: { labels: [], data: [] },
            userRoleDistribution: {},
            storeCategoryDistribution: {},
            error: null
        })
    }
}

const actions = {
    setLayout({ commit }, layout) {
        commit('SET_LAYOUT', layout)
    },

    async checkToken({ commit }) {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                commit('SET_AUTH_STATUS', false)
                return { success: false, error: '找不到登入令牌' }
            }

            const response = await authService.validateToken(token)
            if (!response?.success) {
                throw new Error(response?.error || '無效的登入令牌')
            }

            commit('SET_AUTH_STATUS', true)
            commit('SET_TOKEN', token)
            return { success: true }
        } catch (error) {
            commit('SET_AUTH_STATUS', false)
            commit('SET_TOKEN', null)
            localStorage.removeItem('token')
            return { success: false, error: error.message || '驗證失敗' }
        }
    },

    async fetchDashboardData({ commit }) {
        commit('SET_LOADING', true)
        try {
            const response = await adminService.getDashboardData()
            if (!response?.success || !response?.data) {
                throw new Error(response?.error || '獲取數據失敗')
            }

            // 修改：直接使用 response.data
            const data = response.data
            commit('SET_DASHBOARD_STATS', data)
            commit('SET_USER_DATA', data.userRoleDistribution)
            commit('SET_STORE_DATA', data.storeCategoryDistribution)

            return response
        } catch (error) {
            commit('SET_ERROR', error.message)
            return { success: false, error: error.message }
        } finally {
            commit('SET_LOADING', false)
        }
    },

    async getUserStats() {
        try {
            const response = await adminService.getUserStats()
            if (!response?.success) {
                throw new Error(response?.error || '獲取用戶統計失敗')
            }
            return { success: true, data: response.data }
        } catch (error) {
            console.error('獲取用戶統計失敗:', error)
            return { success: false, error: error?.message || '獲取用戶統計失敗' }
        }
    },

    async getStoreStats() {
        try {
            const response = await adminService.getStoreStats()
            if (!response?.success) {
                throw new Error(response?.error || '獲取商店統計失敗')
            }
            return { success: true, data: response.data }
        } catch (error) {
            console.error('獲取商店統計失敗:', error)
            return { success: false, error: error?.message || '獲取商店統計失敗' }
        }
    },

    async getMovieStats() {
        try {
            const response = await adminService.getMovieStats()
            if (!response?.success) {
                throw new Error(response?.error || '獲取電影統計失敗')
            }
            return { success: true, data: response.data }
        } catch (error) {
            console.error('獲取電影統計失敗:', error)
            return { success: false, error: error?.message || '獲取電影統計失敗' }
        }
    }
}

const getters = {
    dashboardStats: state => state.dashboardStats,
    userData: state => state.userData,
    storeData: state => state.storeData,
    isLoading: state => state.isLoading,
    error: state => state.error,
    currentLayout: state => state.layout,
    isAuthenticated: state => state.isAuthenticated,
    token: state => state.token,
    userRoleDistribution: state => state.userRoleDistribution,
    storeCategoryDistribution: state => state.storeCategoryDistribution
}

function validateDashboardData(data) {
    if (!data || typeof data !== 'object') {
        throw new Error('無效的數據格式')
    }

    const validatedData = {
        totalUsers: Number(data.totalUsers) || 0,
        newUsers: Number(data.newUsers) || 0,
        totalStores: Number(data.totalStores) || 0,
        newStores: Number(data.newStores) || 0,
        activeMovies: Number(data.activeMovies) || 0,
        newMovies: Number(data.newMovies) || 0,
        userRoleDistribution: validateDistributionData(data.userRoleDistribution),
        storeCategoryDistribution: validateDistributionData(data.storeCategoryDistribution)
    }

    return validatedData
}

function validateDistributionData(data) {
    if (!data || typeof data !== 'object') {
        return {}
    }

    const validatedData = {}
    Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'number' || !isNaN(Number(value))) {
            validatedData[key] = Number(value)
        }
    })
    return validatedData
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
