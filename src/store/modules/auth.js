import api from '@/services/api.config'

const state = {
    token: localStorage.getItem('token') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    isLoading: false,
    error: null,
    wallet: JSON.parse(localStorage.getItem('wallet')) || null
}

const getters = {
    isLoggedIn: state => !!state.token,
    isAdmin: state => state.user?.role === 'ROLE_ADMIN',
    currentUser: state => state.user,
    userName: state => state.user?.name || '',
    userEmail: state => state.user?.email || '',
    userPhone: state => state.user?.phone || '',
    userBirthday: state => state.user?.birthday || '',
    userGender: state => state.user?.gender || '',
    userRole: state => state.user?.role || '',
    userAddress: state => state.user?.address || '',
    userAvatar: state => state.user?.avatar || '',
    isActive: state => state.user?.active || false,
    isEmailVerified: state => state.user?.email_verified || false,
    lastLoginTime: state => state.user?.last_login_time || null,
    lastLoginIp: state => state.user?.last_login_ip || '',
    walletBalance: state => state.wallet?.balance || 0,
    authError: state => state.error,
    isLoading: state => state.isLoading
}

const actions = {
    async login({ commit }, credentials) {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        try {
            const response = await api.post('/auth/login', {
                email: credentials.email.toLowerCase().trim(),
                password: credentials.password
            })

            const { token, refreshToken, user, wallet } = response.data
            if (!token || !user) {
                throw new Error('無效的響應數據')
            }

            localStorage.setItem('token', token)
            localStorage.setItem('refreshToken', refreshToken)
            localStorage.setItem('user', JSON.stringify(user))

            if (wallet) {
                localStorage.setItem('wallet', JSON.stringify(wallet))
            }

            commit('SET_AUTH_DATA', { token, refreshToken, user, wallet })
            return response.data
        } catch (error) {
            const errorMessage = error.response?.data?.message || '登入失敗，請稍後再試'
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
                name: userData.name.trim(),
                email: userData.email.toLowerCase().trim(),
                password: userData.password,
                phone: userData.phone?.trim(),
                birthday: userData.birthday,
                gender: userData.gender,
                address: userData.address?.trim()
            }

            const response = await api.post('/auth/register', registerData)
            return response.data
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
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
            localStorage.removeItem('wallet')
            commit('CLEAR_AUTH_DATA')
        }
    },

    async getProfile({ commit }) {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        try {
            const response = await api.get('/auth/profile')
            const userData = response.data
            commit('SET_USER', userData)
            localStorage.setItem('user', JSON.stringify(userData))

            if (userData.wallet) {
                commit('SET_WALLET', userData.wallet)
                localStorage.setItem('wallet', JSON.stringify(userData.wallet))
            }

            return userData
        } catch (error) {
            commit('SET_ERROR', '獲取資料失敗')
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    }
}

const mutations = {
    SET_AUTH_DATA(state, { token, refreshToken, user, wallet }) {
        state.token = token
        state.refreshToken = refreshToken
        state.user = user
        state.wallet = wallet
    },
    SET_USER(state, user) {
        state.user = user
    },
    SET_WALLET(state, wallet) {
        state.wallet = wallet
    },
    CLEAR_AUTH_DATA(state) {
        state.token = null
        state.refreshToken = null
        state.user = null
        state.wallet = null
        state.error = null
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
