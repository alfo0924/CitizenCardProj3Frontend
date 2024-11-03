import axios from 'axios'

// 模擬用戶數據
const mockUsers = [
    {
        id: 1,
        email: 'user@example.com',
        password: 'user123456',
        name: '一般會員',
        role: 'ROLE_USER',
        avatar: 'https://i.pravatar.cc/150?img=1',
        phone: '0912345678',
        birthday: '1990-01-01',
        gender: 'MALE',
        address: '台中市西屯區文華路100號',
        wallet: {
            balance: 1000
        }
    },
    {
        id: 2,
        email: 'admin@example.com',
        password: 'admin123456',
        name: '系統管理員',
        role: 'ROLE_ADMIN',
        avatar: 'https://i.pravatar.cc/150?img=2',
        phone: '0987654321',
        birthday: '1985-12-31',
        gender: 'FEMALE',
        address: '台中市西屯區文華路200號',
        wallet: {
            balance: 5000
        }
    }
]

// 初始狀態
const state = {
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    isLoading: false,
    error: null
}

// getters
const getters = {
    isLoggedIn: state => !!state.token,
    isAdmin: state => state.user?.role === 'ROLE_ADMIN',
    currentUser: state => state.user,
    userName: state => state.user?.name || '',
    userAvatar: state => state.user?.avatar || '',
    authError: state => state.error,
    isLoading: state => state.isLoading
}

// actions
const actions = {
    // 登入
    async login({ commit }, credentials) {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')

        try {
            // 模擬API請求延遲
            await new Promise(resolve => setTimeout(resolve, 1000))

            // 查找用戶
            const user = mockUsers.find(u =>
              u.email === credentials.email &&
              u.password === credentials.password
            )

            if (user) {
                // 生成模擬token
                const token = `mock-token-${user.id}-${Date.now()}`

                // 儲存認證信息
                localStorage.setItem('token', token)
                localStorage.setItem('user', JSON.stringify(user))

                commit('SET_TOKEN', token)
                commit('SET_USER', user)

                // 設置axios header
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

                return {
                    success: true,
                    data: { token, user }
                }
            } else {
                throw new Error('帳號或密碼錯誤')
            }
        } catch (error) {
            commit('SET_ERROR', error.message)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 註冊
    async register({ commit }, userData) {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')

        try {
            // 模擬API請求延遲
            await new Promise(resolve => setTimeout(resolve, 1000))

            // 檢查Email是否已存在
            if (mockUsers.some(u => u.email === userData.email)) {
                throw new Error('此Email已被註冊')
            }

            // 模擬註冊成功
            return {
                success: true,
                message: '註冊成功，請登入'
            }
        } catch (error) {
            commit('SET_ERROR', error.message)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 登出
    async logout({ commit }) {
        try {
            // 模擬API請求
            await new Promise(resolve => setTimeout(resolve, 500))

            // 清除認證信息
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            delete axios.defaults.headers.common['Authorization']

            commit('CLEAR_USER')
        } catch (error) {
            console.error('Logout error:', error)
        }
    },

    // 重設密碼請求
    async requestPasswordReset({ commit }, email) {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')

        try {
            // 模擬API請求
            await new Promise(resolve => setTimeout(resolve, 1000))

            return {
                success: true,
                message: '重設密碼郵件已發送'
            }
        } catch (error) {
            commit('SET_ERROR', '重設密碼請求失敗')
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 更新用戶資料
    async updateProfile({ commit, state }, userData) {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')

        try {
            // 模擬API請求
            await new Promise(resolve => setTimeout(resolve, 1000))

            const updatedUser = {
                ...state.user,
                ...userData
            }

            localStorage.setItem('user', JSON.stringify(updatedUser))
            commit('SET_USER', updatedUser)

            return {
                success: true,
                data: updatedUser
            }
        } catch (error) {
            commit('SET_ERROR', '更新資料失敗')
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 變更密碼
    async changePassword({ commit }, { oldPassword, newPassword }) {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')

        try {
            // 模擬API請求
            await new Promise(resolve => setTimeout(resolve, 1000))

            return {
                success: true,
                message: '密碼已更新'
            }
        } catch (error) {
            commit('SET_ERROR', '變更密碼失敗')
            throw error
        } finally {
            commit('SET_LOADING', false)
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
