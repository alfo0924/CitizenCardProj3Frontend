import axios from 'axios'

// 初始狀態
const state = {
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    isLoading: false,
    error: null
}

// getters
const getters = {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => state.user && state.user.role === 'ROLE_ADMIN',
    currentUser: (state) => state.user,
    authError: (state) => state.error,
    isLoading: (state) => state.isLoading
}

// actions
const actions = {
    // 登入
    async login({ commit }, credentials) {
        try {
            commit('SET_LOADING', true)
            commit('CLEAR_ERROR')

            const response = await axios.post('/api/auth/login', credentials)

            const { token, user } = response.data

            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))

            commit('SET_TOKEN', token)
            commit('SET_USER', user)

            // 設置axios的authorization header
            axios.defaults.headers.common.Authorization = `Bearer ${token}`

            return response
        } catch (error) {
            commit('SET_ERROR', error.response?.data?.message || '登入失敗')
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 註冊
    async register({ commit }, userData) {
        try {
            commit('SET_LOADING', true)
            commit('CLEAR_ERROR')

            const response = await axios.post('/api/auth/register', userData)
            return response
        } catch (error) {
            commit('SET_ERROR', error.response?.data?.message || '註冊失敗')
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 登出
    async logout({ commit }) {
        try {
            await axios.post('/api/auth/logout')
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            delete axios.defaults.headers.common.Authorization
            commit('CLEAR_USER')
        }
    },

    // 重設密碼請求
    async requestPasswordReset({ commit }, email) {
        try {
            commit('SET_LOADING', true)
            commit('CLEAR_ERROR')

            const response = await axios.post('/api/auth/password-reset-request', { email })
            return response
        } catch (error) {
            commit('SET_ERROR', error.response?.data?.message || '重設密碼請求失敗')
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 重設密碼
    async resetPassword({ commit }, { token, newPassword }) {
        try {
            commit('SET_LOADING', true)
            commit('CLEAR_ERROR')

            const response = await axios.post('/api/auth/reset-password', {
                token,
                newPassword
            })
            return response
        } catch (error) {
            commit('SET_ERROR', error.response?.data?.message || '重設密碼失敗')
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 更新用戶資料
    async updateProfile({ commit }, userData) {
        try {
            commit('SET_LOADING', true)
            commit('CLEAR_ERROR')

            const response = await axios.put('/api/auth/profile', userData)

            const updatedUser = response.data
            localStorage.setItem('user', JSON.stringify(updatedUser))
            commit('SET_USER', updatedUser)

            return response
        } catch (error) {
            commit('SET_ERROR', error.response?.data?.message || '更新資料失敗')
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 變更密碼
    async changePassword({ commit }, { oldPassword, newPassword }) {
        try {
            commit('SET_LOADING', true)
            commit('CLEAR_ERROR')

            const response = await axios.post('/api/auth/change-password', {
                oldPassword,
                newPassword
            })
            return response
        } catch (error) {
            commit('SET_ERROR', error.response?.data?.message || '變更密碼失敗')
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 重新整理token
    async refreshToken({ commit }) {
        try {
            const response = await axios.post('/api/auth/refresh-token')
            const { token } = response.data

            localStorage.setItem('token', token)
            commit('SET_TOKEN', token)
            axios.defaults.headers.common.Authorization = `Bearer ${token}`

            return response
        } catch (error) {
            commit('CLEAR_USER')
            throw error
        }
    }
}

// mutations
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

    SET_LOADING(state, isLoading) {
        state.isLoading = isLoading
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