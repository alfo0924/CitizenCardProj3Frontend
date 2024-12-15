import api from '@/services/api.config'

const state = {
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    isLoading: false,
    error: null
}

const getters = {
    isLoggedIn: state => !!state.token && !!state.user,
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

            const { token, user } = response.data

            if (!user.id || !user.email) {
                throw new Error('無效的用戶資料')
            }

            const now = new Date().toISOString()
            user.last_login_time = now
            user.updated_at = now

            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))

            commit('SET_AUTH_DATA', { token, user })
            return response
        } catch (error) {
            let errorMessage = '登入失敗，請稍後再試'
            if (error.response?.status === 404) {
                errorMessage = '此帳號不存在，請先註冊'
            } else if (error.response?.status === 401) {
                errorMessage = '帳號密碼錯誤'
            }
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
            return response.data
        } catch (error) {
            const errorMessage = error.response?.data?.message || '註冊失敗'
            commit('SET_ERROR', errorMessage)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    async logout({ commit }) {
        try {
            await api.post('/auth/logout')
        } finally {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            commit('CLEAR_AUTH_DATA')
        }
    },

    async fetchProfile({ commit }) {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        try {
            const response = await api.get('/auth/profile')
            const userData = response.data
            commit('SET_USER', userData)
            localStorage.setItem('user', JSON.stringify(userData))
            return { success: true, data: userData }
        } catch (error) {
            const errorMessage = error.response?.data?.message || '獲取用戶資料失敗'
            commit('SET_ERROR', errorMessage)
            return { success: false, message: errorMessage }
        } finally {
            commit('SET_LOADING', false)
        }
    },

    async updateProfile({ commit }, userData) {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        try {
            const now = new Date().toISOString()
            const updateData = {
                name: userData.name,
                phone: userData.phone,
                birthday: userData.birthday,
                gender: userData.gender,
                address: userData.address,
                avatar: userData.avatar,
                updated_at: now,
                version: (userData.version || 0) + 1
            }

            const response = await api.put('/auth/profile', updateData)
            const updatedUser = response.data

            localStorage.setItem('user', JSON.stringify(updatedUser))
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
    SET_AUTH_DATA(state, { token, user }) {
        state.token = token
        state.user = user
        state.error = null
    },
    SET_USER(state, user) {
        state.user = user
    },
    CLEAR_AUTH_DATA(state) {
        state.token = null
        state.user = null
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
