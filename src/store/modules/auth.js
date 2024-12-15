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
    userName: state => state.user?.name || '',
    userEmail: state => state.user?.email || '',
    userPhone: state => state.user?.phone || '',
    userBirthday: state => state.user?.birthday || '',
    userGender: state => state.user?.gender || '',
    userRole: state => state.user?.role || 'ROLE_USER',
    userAddress: state => state.user?.address || '',
    userAvatar: state => state.user?.avatar || '',
    isActive: state => state.user?.active ?? false,
    isEmailVerified: state => state.user?.email_verified ?? false,
    lastLoginTime: state => state.user?.last_login_time || null,
    lastLoginIp: state => state.user?.last_login_ip || '',
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

            if (!response.data || !response.data.token || !response.data.user) {
                throw new Error('無效的登入回應')
            }

            const { token, user } = response.data

            if (!user.id || !user.email || !user.role) {
                throw new Error('用戶資料不完整')
            }

            user.last_login_time = new Date().toISOString()
            user.updated_at = new Date().toISOString()

            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))

            commit('SET_AUTH_DATA', { token, user })
            return { token, user }
        } catch (error) {
            let errorMessage = '登入失敗'
            if (error.response) {
                switch (error.response.status) {
                    case 400:
                        errorMessage = '請求資料格式錯誤'
                        break
                    case 401:
                        errorMessage = '帳號或密碼錯誤'
                        break
                    case 403:
                        errorMessage = '帳戶已被停用'
                        break
                    case 404:
                        errorMessage = '帳號不存在'
                        break
                    case 422:
                        errorMessage = error.response.data?.message || '驗證失敗'
                        break
                    default:
                        errorMessage = '登入失敗，請稍後再試'
                }
            }
            commit('SET_ERROR', errorMessage)
            throw new Error(errorMessage)
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
                phone: userData.phone?.trim() || null,
                birthday: userData.birthday || null,
                gender: userData.gender || null,
                role: 'ROLE_USER',
                address: userData.address?.trim() || null,
                avatar: null,
                active: true,
                email_verified: false,
                last_login_time: now,
                last_login_ip: null,
                created_at: now,
                updated_at: now,
                version: 0
            }

            const response = await api.post('/auth/register', registerData)
            return response.data
        } catch (error) {
            const errorMessage = error.response?.data?.message || '註冊失敗，請稍後再試'
            commit('SET_ERROR', errorMessage)
            throw new Error(errorMessage)
        } finally {
            commit('SET_LOADING', false)
        }
    },

    async logout({ commit }) {
        try {
            await api.post('/auth/logout')
        } catch (error) {
            console.error('登出錯誤:', error)
        } finally {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            commit('CLEAR_AUTH_DATA')
        }
    },

    async getProfile({ commit }) {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        try {
            const response = await api.get('/auth/profile')
            const userData = response.data

            if (!userData || !userData.id) {
                throw new Error('無效的用戶資料')
            }

            localStorage.setItem('user', JSON.stringify(userData))
            commit('SET_USER', userData)
            return userData
        } catch (error) {
            const errorMessage = error.response?.data?.message || '獲取用戶資料失敗'
            commit('SET_ERROR', errorMessage)
            throw new Error(errorMessage)
        } finally {
            commit('SET_LOADING', false)
        }
    }
}

const mutations = {
    SET_AUTH_DATA(state, { token, user }) {
        state.token = token
        state.user = user
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
