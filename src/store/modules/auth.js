import api from '@/services/api.config'

const state = {
    token: localStorage.getItem('token') || null,
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
    userRole: state => state.user?.role || 'ROLE_USER',
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

            if (!response.data || !response.data.token) {
                throw new Error('伺服器回應格式錯誤')
            }

            const { token, user } = response.data

            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))

            if (response.data.wallet) {
                localStorage.setItem('wallet', JSON.stringify(response.data.wallet))
            }

            commit('SET_AUTH_DATA', {
                token,
                user,
                wallet: response.data.wallet || null
            })

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
                phone: userData.phone?.trim() || null,
                birthday: userData.birthday || null,
                gender: userData.gender || null,
                address: userData.address?.trim() || null,
                role: 'ROLE_USER',
                active: true,
                email_verified: false,
                created_at: new Date(),
                updated_at: new Date(),
                version: 0
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

            if (!userData) {
                throw new Error('無法獲取用戶資料')
            }

            commit('SET_USER', userData)
            localStorage.setItem('user', JSON.stringify(userData))

            if (userData.wallet) {
                commit('SET_WALLET', userData.wallet)
                localStorage.setItem('wallet', JSON.stringify(userData.wallet))
            }

            return userData
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
    SET_AUTH_DATA(state, { token, user, wallet }) {
        state.token = token
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
