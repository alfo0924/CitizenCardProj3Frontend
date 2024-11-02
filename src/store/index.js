import { createStore } from 'vuex'
import auth from './modules/auth'
import movie from './modules/movie'
import wallet from './modules/wallet'
import discount from './modules/discount'

const store = createStore({
    state: {
        // 全局狀態
        isLoading: false,
        error: null,
        notification: null
    },

    mutations: {
        // 設置載入狀態
        SET_LOADING(state, status) {
            state.isLoading = status
        },

        // 設置錯誤信息
        SET_ERROR(state, error) {
            state.error = error
        },

        // 清除錯誤信息
        CLEAR_ERROR(state) {
            state.error = null
        },

        // 設置通知信息
        SET_NOTIFICATION(state, notification) {
            state.notification = notification
        },

        // 清除通知信息
        CLEAR_NOTIFICATION(state) {
            state.notification = null
        }
    },

    actions: {
        // 設置載入狀態
        setLoading({ commit }, status) {
            commit('SET_LOADING', status)
        },

        // 設置錯誤信息
        setError({ commit }, error) {
            commit('SET_ERROR', error)
            // 5秒後自動清除錯誤信息
            setTimeout(() => {
                commit('CLEAR_ERROR')
            }, 5000)
        },

        // 清除錯誤信息
        clearError({ commit }) {
            commit('CLEAR_ERROR')
        },

        // 設置通知信息
        setNotification({ commit }, notification) {
            commit('SET_NOTIFICATION', notification)
            // 3秒後自動清除通知信息
            setTimeout(() => {
                commit('CLEAR_NOTIFICATION')
            }, 3000)
        },

        // 清除通知信息
        clearNotification({ commit }) {
            commit('CLEAR_NOTIFICATION')
        }
    },

    getters: {
        // 獲取載入狀態
        isLoading: state => state.isLoading,

        // 獲取錯誤信息
        error: state => state.error,

        // 獲取通知信息
        notification: state => state.notification
    },

    modules: {
        auth,
        movie,
        wallet,
        discount
    },

    // 嚴格模式，在開發環境下開啟
    strict: process.env.NODE_ENV !== 'production'
})

// 請求攔截器，自動設置載入狀態
store.subscribeAction({
    before: (action) => {
        store.dispatch('setLoading', true)
    },
    after: (action) => {
        store.dispatch('setLoading', false)
    },
    error: (action, error) => {
        store.dispatch('setLoading', false)
        store.dispatch('setError', error.message || '發生錯誤，請稍後再試')
    }
})

// 初始化時從 localStorage 恢復認證狀態
const token = localStorage.getItem('token')
if (token) {
    store.dispatch('auth/restoreToken', token)
}

export default store