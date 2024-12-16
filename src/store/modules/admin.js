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
        state.dashboardStats = stats
    },
    SET_USER_DATA(state, data) {
        state.userData = data
    },
    SET_STORE_DATA(state, data) {
        state.storeData = data
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
                return { success: false, error: 'No token found' }
            }

            const response = await authService.validateToken(token)
            if (response.success) {
                commit('SET_AUTH_STATUS', true)
                commit('SET_TOKEN', token)
                return { success: true }
            } else {
                commit('SET_AUTH_STATUS', false)
                localStorage.removeItem('token')
                return { success: false, error: 'Invalid token' }
            }
        } catch (error) {
            commit('SET_AUTH_STATUS', false)
            localStorage.removeItem('token')
            return { success: false, error: error.message }
        }
    },

    async checkApiStatus({ commit }) {
        try {
            const response = await adminService.checkApiStatus()
            return { success: true, data: response }
        } catch (error) {
            console.error('API Status Check Error:', error)
            return { success: false, error: error.message }
        }
    },

    async fetchDashboardData({ commit }) {
        try {
            commit('SET_LOADING', true)
            commit('SET_ERROR', null)

            const response = await adminService.getDashboardData()

            commit('SET_DASHBOARD_STATS', {
                totalUsers: response.stats.totalUsers,
                newUsers: response.stats.newUsers,
                totalStores: response.stats.totalStores,
                newStores: response.stats.newStores,
                activeMovies: response.stats.activeMovies,
                newMovies: response.stats.newMovies
            })

            commit('SET_USER_DATA', {
                labels: response.userData.labels,
                data: response.userData.data
            })

            commit('SET_STORE_DATA', {
                labels: response.storeData.labels,
                data: response.storeData.data
            })

            return {
                success: true,
                stats: response.stats,
                userData: response.userData,
                storeData: response.storeData
            }
        } catch (error) {
            commit('SET_ERROR', error.message)
            return {
                success: false,
                error: error.message
            }
        } finally {
            commit('SET_LOADING', false)
        }
    },

    async getUserStats({ commit }) {
        try {
            const response = await adminService.getUserStats()
            return { success: true, data: response }
        } catch (error) {
            console.error('User Stats Error:', error)
            return { success: false, error: error.message }
        }
    },

    async getStoreStats({ commit }) {
        try {
            const response = await adminService.getStoreStats()
            return { success: true, data: response }
        } catch (error) {
            console.error('Store Stats Error:', error)
            return { success: false, error: error.message }
        }
    },

    async getMovieStats({ commit }) {
        try {
            const response = await adminService.getMovieStats()
            return { success: true, data: response }
        } catch (error) {
            console.error('Movie Stats Error:', error)
            return { success: false, error: error.message }
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
