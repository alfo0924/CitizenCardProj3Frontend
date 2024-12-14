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
    userAvatar: state => state.user?.avatar || '/avatars/default-avatar.jpg',
    userEmail: state => state.user?.email || '',
    userPhone: state => state.user?.phone || '',
    userRole: state => state.user?.role || '',
    userBirthday: state => state.user?.birthday || '',
    userGender: state => state.user?.gender || '',
    userAddress: state => state.user?.address || '',
    walletBalance: state => state.wallet?.balance || 0,
    authError: state => state.error,
    isLoading: state => state.isLoading,
    isEmailVerified: state => state.user?.emailVerified || false,
    lastLoginTime: state => state.user?.lastLoginTime || null
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
            const { token, refreshToken, user } = response.data
            if (token && user) {
                localStorage.setItem('token', token)
                localStorage.setItem('refreshToken', refreshToken)
                localStorage.setItem('user', JSON.stringify(user))
                if (user.wallet) {
                    localStorage.setItem('wallet', JSON.stringify(user.wallet))
                }
                commit('SET_AUTH_DATA', { token, refreshToken, user })
                if (user.wallet) {
                    commit('SET_WALLET', user.wallet)
                }
            }
            return response.data
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
            if (userData.password !== userData.confirmPassword) {
                throw new Error('密碼與確認密碼不一致')
            }

            const now = new Date().toISOString()
            const registerData = {
                name: userData.name.trim(),
                email: userData.email.toLowerCase().trim(),
                password: userData.password,
                confirmPassword: userData.confirmPassword,
                phone: userData.phone?.trim(),
                birthday: userData.birthday,
                gender: userData.gender,
                address: userData.address?.trim(),
                role: 'ROLE_USER',
                active: true,
                emailVerified: false,
                version: 0,
                createdAt: now,
                updatedAt: now,
                lastLoginTime: now,
                lastLoginIp: '0.0.0.0',
                avatar: '/avatars/default-avatar.jpg'
            }

            const response = await api.post('/auth/register', registerData)
            return response.data
        } catch (error) {
            let errorMessage = '註冊失敗，請稍後再試'
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message
            } else if (error.message) {
                errorMessage = error.message
            }
            commit('SET_ERROR', errorMessage)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    async logout({ commit }) {
        try {
            const token = localStorage.getItem('token')
            if (token) {
                await api.post('/auth/logout', { token })
            }
        } catch (error) {
            console.error('登出失敗:', error)
        } finally {
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
            localStorage.removeItem('wallet')
            commit('CLEAR_AUTH_DATA')
        }
    },

    async refreshToken({ commit, state }) {
        try {
            const response = await api.post('/auth/refresh-token', {
                refreshToken: state.refreshToken
            })
            const { token, refreshToken } = response.data
            localStorage.setItem('token', token)
            localStorage.setItem('refreshToken', refreshToken)
            commit('SET_TOKENS', { token, refreshToken })
            return token
        } catch (error) {
            commit('CLEAR_AUTH_DATA')
            throw error
        }
    },

    async validateEmail({ commit }, email) {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        try {
            const response = await api.post('/auth/validate-email', {
                email: email.toLowerCase().trim()
            })
            return response.data
        } catch (error) {
            const errorMessage = error.response?.data?.message || '驗證信箱失敗'
            commit('SET_ERROR', errorMessage)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    async checkToken({ commit, dispatch }) {
        try {
            const response = await api.get('/auth/check')
            if (response.data.valid && response.data.user) {
                commit('SET_USER', response.data.user)
                if (response.data.user.wallet) {
                    commit('SET_WALLET', response.data.user.wallet)
                }
            } else {
                await dispatch('logout')
            }
            return response.data
        } catch (error) {
            await dispatch('logout')
            throw error
        }
    },

    async getProfile({ commit }) {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        try {
            const response = await api.get('/auth/profile')
            commit('SET_USER', response.data)
            if (response.data.wallet) {
                commit('SET_WALLET', response.data.wallet)
                localStorage.setItem('wallet', JSON.stringify(response.data.wallet))
            }
            localStorage.setItem('user', JSON.stringify(response.data))
            return response.data
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
    SET_AUTH_DATA(state, { token, refreshToken, user }) {
        state.token = token
        state.refreshToken = refreshToken
        state.user = user
    },
    SET_TOKENS(state, { token, refreshToken }) {
        state.token = token
        state.refreshToken = refreshToken
    },
    SET_TOKEN(state, token) {
        state.token = token
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
