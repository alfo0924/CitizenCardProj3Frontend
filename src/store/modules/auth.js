// store/modules/auth.js
import api from '@/services/api.config'

const state = {
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    isLoading: false,
    error: null
}

const getters = {
    isLoggedIn: state => !!state.token,
    isAdmin: state => state.user?.role === 'ROLE_ADMIN',
    currentUser: state => state.user,
    userName: state => state.user?.name || '',
    userAvatar: state => state.user?.avatar || '',
    authError: state => state.error,
    isLoading: state => state.isLoading
}

const actions = {
    async login({ commit }, credentials) {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')

        try {
            const response = await api.post('/auth/login', credentials)
            const { token, user } = response

            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))

            commit('SET_TOKEN', token)
            commit('SET_USER', user)

            return response
        } catch (error) {
            commit('SET_ERROR', error.message || '登入失敗')
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    async register({ commit }, userData) {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')

        try {
            const response = await api.post('/auth/register', userData)
            return response
        } catch (error) {
            commit('SET_ERROR', error.message || '註冊失敗')
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    async logout({ commit }) {
        try {
            await api.post('/auth/logout')
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            commit('CLEAR_USER')
        }
    },

    async validateEmail({ commit }, email) {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')

        try {
            const response = await api.post('/auth/validate-email', { email })
            return response
        } catch (error) {
            commit('SET_ERROR', error.message || '驗證信箱失敗')
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    async checkToken({ commit }) {
        try {
            const response = await api.get('/auth/check')
            return response
        } catch (error) {
            commit('CLEAR_USER')
            throw error
        }
    },

    async getProfile({ commit }) {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')

        try {
            const response = await api.get('/auth/profile')
            commit('SET_USER', response)
            return response
        } catch (error) {
            commit('SET_ERROR', error.message || '獲取資料失敗')
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    }
}

const mutations = {
    SET_TOKEN(state, token) {
        state.token = token
    },

    SET_USER(state, user) {
        state.user = user
    },

    CLEAR_USER(state) {
        state.token = null
        state.user = null
    },

    SET_LOADING(state, status) {
        state.isLoading = status
    },

    SET_ERROR(state, error) {
        state.error = error
    },

    CLEAR_ERROR(state) {
        state.error = null
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
