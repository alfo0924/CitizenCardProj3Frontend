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
    token: null
}

const mutations = {
    SET_DASHBOARD_STATS(state, stats) {
        state.dashboardStats = {
            totalUsers: parseInt(stats?.totalUsers) || 0,
            newUsers: parseInt(stats?.newUsers) || 0,
            totalStores: parseInt(stats?.totalStores) || 0,
            newStores: parseInt(stats?.newStores) || 0,
            activeMovies: parseInt(stats?.activeMovies) || 0,
            newMovies: parseInt(stats?.newMovies) || 0
        }
    },
    SET_USER_DATA(state, { labels, data }) {
        state.userData = {
            labels: Array.isArray(labels) ? labels : [],
            data: Array.isArray(data) ? data : []
        }
    },
    SET_STORE_DATA(state, { labels, data }) {
        state.storeData = {
            labels: Array.isArray(labels) ? labels : [],
            data: Array.isArray(data) ? data : []
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
        state.dashboardStats = {
            totalUsers: 0,
            newUsers: 0,
            totalStores: 0,
            newStores: 0,
            activeMovies: 0,
            newMovies: 0
        }
        state.userData = { labels: [], data: [] }
        state.storeData = { labels: [], data: [] }
        state.error = null
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
            return {
                success: false,
                error: error.message || '驗證失敗'
            }
        }
    },

    async fetchDashboardData({ commit }) {
        commit('SET_LOADING', true)
        commit('CLEAR_DASHBOARD_DATA')

        try {
            const response = await adminService.getDashboardData()

            if (!response?.success || !response?.data) {
                throw new Error(response?.error || '獲取數據失敗')
            }

            const {
                stats,
                userRoleDistribution,
                storeCategoryDistribution,
                totalUsers,
                newUsers,
                totalStores,
                newStores,
                activeMovies,
                newMovies
            } = response.data

            // Validate and set basic stats
            const basicStats = {
                totalUsers: Number(totalUsers),
                newUsers: Number(newUsers),
                totalStores: Number(totalStores),
                newStores: Number(newStores),
                activeMovies: Number(activeMovies),
                newMovies: Number(newMovies)
            }

            if (Object.values(basicStats).some(isNaN)) {
                throw new Error('基礎統計數據格式無效')
            }

            commit('SET_DASHBOARD_STATS', basicStats)

            // Validate and set distributions
            if (userRoleDistribution && typeof userRoleDistribution === 'object') {
                const labels = Object.keys(userRoleDistribution)
                const data = Object.values(userRoleDistribution).map(Number)

                if (!data.some(isNaN)) {
                    commit('SET_USER_DATA', { labels, data })
                }
            }

            if (storeCategoryDistribution && typeof storeCategoryDistribution === 'object') {
                const labels = Object.keys(storeCategoryDistribution)
                const data = Object.values(storeCategoryDistribution).map(Number)

                if (!data.some(isNaN)) {
                    commit('SET_STORE_DATA', { labels, data })
                }
            }

            commit('SET_ERROR', null)
            return { success: true, data: response.data }
        } catch (error) {
            const errorMessage = error?.message || '載入儀表板數據失敗'
            commit('SET_ERROR', errorMessage)
            console.error('Dashboard data fetch error:', error)
            return { success: false, error: errorMessage }
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
            return {
                success: false,
                error: error?.message || '獲取用戶統計失敗'
            }
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
            return {
                success: false,
                error: error?.message || '獲取商店統計失敗'
            }
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
            return {
                success: false,
                error: error?.message || '獲取電影統計失敗'
            }
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
    token: state => state.token
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
