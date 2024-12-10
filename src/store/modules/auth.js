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

            if (response.token && response.user) {
                localStorage.setItem('token', response.token)
                localStorage.setItem('user', JSON.stringify(response.user))

                commit('SET_TOKEN', response.token)
                commit('SET_USER', response.user)
            }

            return response
        } catch (error) {
            const errorMessage = error.response?.data?.message || '登入失敗，請檢查帳號密碼'
            commit('SET_ERROR', errorMessage)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    async register({ commit }, userData) {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')

        try {
            const registerData = {
                name: userData.name,
                email: userData.email,
                password: userData.password,
                phone: userData.phone,
                birthday: userData.birthday,
                gender: userData.gender,
                role: 'ROLE_USER',
                active: true,
                emailVerified: false,
                lastLoginTime: null,
                lastLoginIp: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }

            const response = await api.post('/auth/register', registerData)
            return response
        } catch (error) {
            const errorMessage = error.response?.data?.message || '註冊失敗，請稍後再試'
            commit('SET_ERROR', errorMessage)
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
            localStorage.removeItem('wallet')
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
            const errorMessage = error.response?.data?.message || '驗證信箱失敗'
            commit('SET_ERROR', errorMessage)
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
            const errorMessage = error.response?.data?.message || '獲取資料失敗'
            commit('SET_ERROR', errorMessage)
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
