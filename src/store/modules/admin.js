import adminService from '@/services/admin.service'

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
    isLoading: false,
    error: null
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
    }
}

const actions = {
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
    error: state => state.error
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
