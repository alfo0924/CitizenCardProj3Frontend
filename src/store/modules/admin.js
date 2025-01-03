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
        state.userRoleDistribution = labels.reduce((acc, label, index) => {
            acc[label] = data[index]
            return acc
        }, {})
    },
    SET_STORE_DATA(state, { labels, data }) {
        state.storeData = {
            labels: Array.isArray(labels) ? labels : [],
            data: Array.isArray(data) ? data : []
        }
        state.storeCategoryDistribution = labels.reduce((acc, label, index) => {
            acc[label] = data[index]
            return acc
        }, {})
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
        commit('CLEAR_DASHBOARD_DATA')

        try {
            const response = await adminService.getDashboardData()
            if (!response?.success || !response?.data) {
                throw new Error(response?.error || '獲取數據失敗')
            }

            const validatedData = validateDashboardData(response.data)

            // 設置基本統計數據
            commit('SET_DASHBOARD_STATS', {
                totalUsers: validatedData.totalUsers,
                newUsers: validatedData.newUsers,
                totalStores: validatedData.totalStores,
                newStores: validatedData.newStores,
                activeMovies: validatedData.activeMovies,
                newMovies: validatedData.newMovies
            })

            // 設置用戶角色分佈數據
            if (Object.keys(validatedData.userRoleDistribution).length > 0) {
                commit('SET_USER_DATA', {
                    labels: Object.keys(validatedData.userRoleDistribution),
                    data: Object.values(validatedData.userRoleDistribution)
                })
            }

            // 設置商店類別分佈數據
            if (Object.keys(validatedData.storeCategoryDistribution).length > 0) {
                commit('SET_STORE_DATA', {
                    labels: Object.keys(validatedData.storeCategoryDistribution),
                    data: Object.values(validatedData.storeCategoryDistribution)
                })
            }

            commit('SET_ERROR', null)
            return { success: true, data: validatedData }
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
