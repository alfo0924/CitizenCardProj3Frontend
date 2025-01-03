import api from '@/services/api.config'

const TOKEN_VERIFY_INTERVAL = 15 * 60 * 1000 // 15 minutes
const STORAGE_KEYS = {
    TOKEN: 'token',
    USER: 'user',
    LAST_VERIFICATION: 'lastVerification'
}

const state = {
    token: localStorage.getItem(STORAGE_KEYS.TOKEN) || null,
    user: JSON.parse(localStorage.getItem(STORAGE_KEYS.USER)) || null,
    isLoading: false,
    error: null,
    isTokenVerified: false,
    lastVerification: localStorage.getItem(STORAGE_KEYS.LAST_VERIFICATION) || null,
    isInitialized: false
}

const getters = {
    isLoggedIn: state => !!state.token && !!state.user && state.isTokenVerified && state.isInitialized,
    isAdmin: state => state.user?.role === 'ROLE_ADMIN',
    currentUser: state => state.user,
    userId: state => state.user?.id || null,
    userName: state => state.user?.name || '',
    userEmail: state => state.user?.email || '',
    userPhone: state => state.user?.phone || '',
    userBirthday: state => state.user?.birthday || '',
    userGender: state => state.user?.gender || '',
    userRole: state => state.user?.role || 'ROLE_USER',
    userAddress: state => state.user?.address || '',
    userAvatar: state => state.user?.avatar || '',
    userActive: state => state.user?.active ?? true,
    userEmailVerified: state => state.user?.email_verified ?? false,
    userLastLoginTime: state => state.user?.last_login_time || null,
    userLastLoginIp: state => state.user?.last_login_ip || '',
    userCreatedAt: state => state.user?.created_at || null,
    userUpdatedAt: state => state.user?.updated_at || null,
    userVersion: state => state.user?.version || 0,
    authError: state => state.error,
    isLoading: state => state.isLoading,
    tokenNeedsVerification: state => {
        if (!state.lastVerification) return true
        const lastCheck = new Date(state.lastVerification)
        const now = new Date()
        return now - lastCheck > TOKEN_VERIFY_INTERVAL
    }
}

const actions = {
    async initAuth({ dispatch, commit, getters }) {
        try {
            commit('SET_LOADING', true)
            const token = localStorage.getItem(STORAGE_KEYS.TOKEN)

            if (token) {
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`

                if (getters.tokenNeedsVerification) {
                    const verifyResult = await dispatch('checkToken')
                    if (!verifyResult.success) {
                        await dispatch('forceLogout')
                        return false
                    }
                }

                const profileResult = await dispatch('fetchProfile')
                if (!profileResult.success) {
                    await dispatch('forceLogout')
                    return false
                }
            }

            return true
        } catch (error) {
            await dispatch('forceLogout')
            return false
        } finally {
            commit('SET_INITIALIZED')
            commit('SET_LOADING', false)
        }
    },

    async checkToken({ commit, dispatch }) {
        try {
            const response = await api.get('/auth/verify-token')

            if (response.data.valid) {
                commit('SET_TOKEN_VERIFIED', true)
                commit('UPDATE_VERIFICATION_TIME')
                return { success: true }
            }

            throw new Error('登入令牌已過期')
        } catch (error) {
            await dispatch('handleAuthError', error)
            return {
                success: false,
                message: error.response?.data?.message || error.message
            }
        }
    },

    async handleAuthError({ commit }, error) {
        let errorMessage = '認證失敗'
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    errorMessage = '登入已過期，請重新登入'
                    break
                case 403:
                    errorMessage = '無權限訪問'
                    break
                default:
                    errorMessage = error.response.data?.message || '發生錯誤，請稍後再試'
            }
        }
        commit('SET_ERROR', errorMessage)
    },

    async forceLogout({ commit }) {
        Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key))
        delete api.defaults.headers.common['Authorization']
        commit('RESET_STATE')
    },

    async login({ commit, dispatch }, credentials) {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')

        try {
            const response = await api.post('/auth/login', {
                email: credentials.email.toLowerCase().trim(),
                password: credentials.password
            })

            const { token, user } = response.data

            if (!user?.id || !user?.email) {
                throw new Error('無效的用戶資料')
            }

            const now = new Date().toISOString()
            user.last_login_time = now
            user.updated_at = now

            api.defaults.headers.common['Authorization'] = `Bearer ${token}`
            localStorage.setItem(STORAGE_KEYS.TOKEN, token)
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))

            commit('SET_AUTH_DATA', { token, user })
            commit('SET_TOKEN_VERIFIED', true)
            commit('UPDATE_VERIFICATION_TIME')

            return { success: true, data: response.data }
        } catch (error) {
            await dispatch('handleAuthError', error)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    async register({ commit }, userData) {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')

        try {
            const now = new Date().toISOString()
            const registerData = {
                name: userData.name.trim(),
                email: userData.email.toLowerCase().trim(),
                password: userData.password,
                phone: userData.phone?.trim(),
                birthday: userData.birthday,
                gender: userData.gender,
                role: 'ROLE_USER',
                address: userData.address?.trim(),
                avatar: userData.avatar,
                active: true,
                email_verified: false,
                last_login_time: now,
                last_login_ip: '',
                created_at: now,
                updated_at: now,
                version: 0
            }

            const response = await api.post('/auth/register', registerData)
            return { success: true, data: response.data }
        } catch (error) {
            const errorMessage = error.response?.data?.message || '註冊失敗'
            commit('SET_ERROR', errorMessage)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    async logout({ dispatch }) {
        try {
            await api.post('/auth/logout')
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            await dispatch('forceLogout')
        }
    },

    async fetchProfile({ commit }) {
        try {
            const response = await api.get('/auth/profile')
            const userData = response.data?.user || response.data

            if (!userData?.id) {
                throw new Error('無效的用戶資料')
            }

            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData))
            commit('SET_USER', userData)

            return { success: true, data: userData }
        } catch (error) {
            const errorMessage = error.response?.data?.message || '獲取用戶資料失敗'
            commit('SET_ERROR', errorMessage)
            return { success: false, message: errorMessage }
        }
    },

    async updateProfile({ commit, state }, userData) {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')

        try {
            const now = new Date().toISOString()
            const updateData = {
                ...userData,
                updated_at: now,
                version: (state.user?.version || 0) + 1
            }

            const response = await api.put('/auth/profile', updateData)
            const updatedUser = response.data?.user || response.data

            if (!updatedUser?.id) {
                throw new Error('無效的用戶資料')
            }

            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser))
            commit('SET_USER', updatedUser)

            return { success: true, data: updatedUser }
        } catch (error) {
            const errorMessage = error.response?.data?.message || '更新失敗'
            commit('SET_ERROR', errorMessage)
            return { success: false, message: errorMessage }
        } finally {
            commit('SET_LOADING', false)
        }
    }
}

const mutations = {
    RESET_STATE(state) {
        state.token = null
        state.user = null
        state.error = null
        state.isTokenVerified = false
        state.lastVerification = null
        state.isInitialized = false
    },
    SET_AUTH_DATA(state, { token, user }) {
        state.token = token
        state.user = user
        state.error = null
    },
    SET_TOKEN(state, token) {
        state.token = token
    },
    SET_USER(state, user) {
        state.user = user
    },
    SET_TOKEN_VERIFIED(state, verified) {
        state.isTokenVerified = verified
    },
    SET_INITIALIZED(state) {
        state.isInitialized = true
    },
    UPDATE_VERIFICATION_TIME(state) {
        const now = new Date().toISOString()
        state.lastVerification = now
        localStorage.setItem(STORAGE_KEYS.LAST_VERIFICATION, now)
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
