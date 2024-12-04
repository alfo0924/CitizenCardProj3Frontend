import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import auth from './modules/auth'
import movie from './modules/movie'
import wallet from './modules/wallet'
import discount from './modules/discount'
import discountStore from './modules/discountStore'

const store = createStore({
    state: {
        isLoading: false,
        error: null,
        notification: null,
        systemStats: {
            visitorCount: 0,
            userCount: 0,
            movieCount: 0
        }
    },

    mutations: {
        SET_LOADING(state, status) {
            state.isLoading = status
        },

        SET_ERROR(state, error) {
            state.error = error
        },

        CLEAR_ERROR(state) {
            state.error = null
        },

        SET_NOTIFICATION(state, notification) {
            state.notification = notification
        },

        CLEAR_NOTIFICATION(state) {
            state.notification = null
        },

        SET_SYSTEM_STATS(state, stats) {
            state.systemStats = stats
        }
    },

    actions: {
        setLoading({ commit }, status) {
            commit('SET_LOADING', status)
        },

        setError({ commit }, error) {
            commit('SET_ERROR', error)
            setTimeout(() => {
                commit('CLEAR_ERROR')
            }, 5000)
        },

        clearError({ commit }) {
            commit('CLEAR_ERROR')
        },

        setNotification({ commit }, notification) {
            commit('SET_NOTIFICATION', notification)
            setTimeout(() => {
                commit('CLEAR_NOTIFICATION')
            }, 3000)
        },

        clearNotification({ commit }) {
            commit('CLEAR_NOTIFICATION')
        },

        // 系統統計數據
        async fetchSystemStats({ commit }) {
            try {
                const response = await fetch('/api/system/stats')
                const data = await response.json()
                commit('SET_SYSTEM_STATS', data)
            } catch (error) {
                console.error('Error fetching system stats:', error)
                commit('SET_SYSTEM_STATS', {
                    visitorCount: 0,
                    userCount: 0,
                    movieCount: 0
                })
            }
        }
    },

    getters: {
        isLoading: state => state.isLoading,
        error: state => state.error,
        notification: state => state.notification,
        systemStats: state => state.systemStats
    },

    modules: {
        auth,
        movie,
        wallet,
        discount,
        discountStore,
    },

    plugins: [
        createPersistedState({
            paths: ['auth.token', 'auth.user'],
            storage: window.localStorage
        })
    ],

    strict: process.env.NODE_ENV !== 'production'
})

// 全局請求攔截器
store.subscribeAction({
    before: (action) => {
        if (!action.type.includes('setLoading')) {
            store.dispatch('setLoading', true)
        }
    },
    after: (action) => {
        if (!action.type.includes('setLoading')) {
            store.dispatch('setLoading', false)
        }
    },
    error: (action, error) => {
        console.error('Action error:', {
            action: action.type,
            error
        })
        store.dispatch('setLoading', false)
        store.dispatch('setError', error.message || '發生錯誤，請稍後再試')
    }
})

// 初始化時從 localStorage 恢復認證狀態
const initializeStore = async () => {
    const token = localStorage.getItem('token')
    if (token) {
        try {
            await store.dispatch('auth/restoreToken', token)
        } catch (error) {
            console.error('Failed to restore auth state:', error)
            localStorage.removeItem('token')
        }
    }

    // 獲取系統統計數據
    store.dispatch('fetchSystemStats')
}

initializeStore()

export default store
