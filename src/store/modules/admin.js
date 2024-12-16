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
            totalUsers: stats?.totalUsers || 0,
            newUsers: stats?.newUsers || 0,
            totalStores: stats?.totalStores || 0,
            newStores: stats?.newStores || 0,
            activeMovies: stats?.activeMovies || 0,
            newMovies: stats?.newMovies || 0
        }
    },
    SET_USER_DATA(state, data) {
        state.userData = {
            labels: data?.labels || [],
            data: data?.data || []
        }
    },
    SET_STORE_DATA(state, data) {
        state.storeData = {
            labels: data?.labels || [],
            data: data?.data || []
        }
    },
    SET_LOADING(state, status) {
        state.isLoading = status
    },
    SET_ERROR(state, error) {
        state.error = error
    },
    SET_LAYOUT(state, layout) {
        state.layout = layout
    },
    SET_AUTH_STATUS(state, status) {
        state.isAuthenticated = status
    },
    SET_TOKEN(state, token) {
        state.token = token
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
    }
}

const actions = {
    setLayout({ commit }, layout) {
        commit('SET_LAYOUT', layout)
    },

    async checkToken({ commit, dispatch }) {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                commit('SET_AUTH_STATUS', false)
                throw new Error('找不到登入令牌')
            }

            const response = await authService.validateToken(token)
            if (response.success) {
                commit('SET_AUTH_STATUS', true)
                commit('SET_TOKEN', token)
                return { success: true }
            }
            throw new Error(response.error || '無效的登入令牌')
        } catch (error) {
            commit('SET_AUTH_STATUS', false)
            localStorage.removeItem('token')
            return {
                success: false,
                error: error.message || '驗證失敗'
            }
        }
    },

    async fetchDashboardData({ commit }) {
        commit('SET_LOADING', true)
        commit('SET_ERROR', null)
        commit('CLEAR_DASHBOARD_DATA')

        try {
            const response = await adminService.getDashboardData()

            if (!response) {
                throw new Error('無法連接到伺服器')
            }

            if (!response.success) {
                throw new Error(response.error || '獲取數據失敗')
            }

            if (!response.data || typeof response.data !== 'object') {
                throw new Error('無效的響應數據格式')
            }

            const { stats, userRoleDistribution, storeCategoryDistribution } = response.data

            // Validate and set dashboard stats
            if (stats && typeof stats === 'object') {
                commit('SET_DASHBOARD_STATS', stats)
            } else {
                throw new Error('無效的統計數據')
            }

            // Validate and set user role distribution
            if (userRoleDistribution && typeof userRoleDistribution === 'object') {
                commit('SET_USER_DATA', {
                    labels: Object.keys(userRoleDistribution),
                    data: Object.values(userRoleDistribution)
                })
            }

            // Validate and set store category distribution
            if (storeCategoryDistribution && typeof storeCategoryDistribution === 'object') {
                commit('SET_STORE_DATA', {
                    labels: Object.keys(storeCategoryDistribution),
                    data: Object.values(storeCategoryDistribution)
                })
            }

            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            const errorMessage = error.message || '載入儀表板數據失敗'
            commit('SET_ERROR', errorMessage)
            console.error('Dashboard data fetch error:', error)
            return {
                success: false,
                error: errorMessage
            }
        } finally {
            commit('SET_LOADING', false)
        }
    },

    async getUserStats({ commit }) {
        try {
            const response = await adminService.getUserStats()
            if (!response || !response.success) {
                throw new Error(response?.error || '獲取用戶統計失敗')
            }
            return { success: true, data: response.data }
        } catch (error) {
            console.error('獲取用戶統計失敗:', error)
            return {
                success: false,
                error: error.message || '獲取用戶統計失敗'
            }
        }
    },

    async getStoreStats({ commit }) {
        try {
            const response = await adminService.getStoreStats()
            if (!response || !response.success) {
                throw new Error(response?.error || '獲取商店統計失敗')
            }
            return { success: true, data: response.data }
        } catch (error) {
            console.error('獲取商店統計失敗:', error)
            return {
                success: false,
                error: error.message || '獲取商店統計失敗'
            }
        }
    },

    async getMovieStats({ commit }) {
        try {
            const response = await adminService.getMovieStats()
            if (!response || !response.success) {
                throw new Error(response?.error || '獲取電影統計失敗')
            }
            return { success: true, data: response.data }
        } catch (error) {
            console.error('獲取電影統計失敗:', error)
            return {
                success: false,
                error: error.message || '獲取電影統計失敗'
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
