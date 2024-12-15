import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import auth from './modules/auth'
import movie from './modules/movie'
import wallet from './modules/wallet'
import discount from './modules/discount'
import storeModule from './modules/store'  // 改名為 storeModule
import api from '@/services/api.config'

const vuexStore = createStore({  // 改名為 vuexStore
    state: {
        isLoading: false,
        error: null,
        notification: null
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
        }
    },

    getters: {
        isLoading: state => state.isLoading,
        error: state => state.error,
        notification: state => state.notification
    },

    modules: {
        auth,
        movie,
        wallet,
        discount,
        store: storeModule  // 使用重命名的模塊
    },

    plugins: [
        createPersistedState({
            paths: ['auth.token', 'auth.user'],
            storage: window.localStorage
        })
    ],

    strict: process.env.NODE_ENV !== 'production'
})

vuexStore.subscribeAction({
    before: (action) => {
        if (!action.type.includes('setLoading')) {
            vuexStore.dispatch('setLoading', true)
        }
    },
    after: (action) => {
        if (!action.type.includes('setLoading')) {
            vuexStore.dispatch('setLoading', false)
        }
    },
    error: (action, error) => {
        console.error('Action error:', error)
        vuexStore.dispatch('setLoading', false)
        vuexStore.dispatch('setError', error.message || '系統發生錯誤')
    }
})

const initializeStore = async () => {
    const token = localStorage.getItem('token')
    if (token) {
        try {
            await vuexStore.dispatch('auth/checkToken')
        } catch (error) {
            console.error('認證狀態恢復失敗:', error)
            localStorage.removeItem('token')
            localStorage.removeItem('user')
        }
    }
}

initializeStore()

export default vuexStore
