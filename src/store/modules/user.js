import api from '@/services/api.config'

const state = {
    users: [],
    totalPages: 0,
    loading: false,
    error: null,
    profile: null
}

const getters = {
    userProfile: state => state.profile,
    isLoading: state => state.isLoading,
    error: state => state.error
}

const actions = {
    async fetchProfile({ commit }) {
        try {
            commit('SET_LOADING', true)
            commit('CLEAR_ERROR')
            const response = await api.get('/api/users/profile')
            commit('SET_PROFILE', response.data)
            return { success: true, data: response.data }
        } catch (error) {
            const message = error.response?.data?.message || '獲取用戶資料失敗'
            commit('SET_ERROR', message)
            return { success: false, message }
        } finally {
            commit('SET_LOADING', false)
        }
    },

    async updateProfile({ commit }, profileData) {
        try {
            commit('SET_LOADING', true)
            commit('CLEAR_ERROR')
            const response = await api.put('/api/users/profile', {
                name: profileData.name,
                phone: profileData.phone,
                birthday: profileData.birthday,
                gender: profileData.gender,
                address: profileData.address,
                avatar: profileData.avatar
            })
            commit('SET_PROFILE', response.data)
            return { success: true, data: response.data }
        } catch (error) {
            const message = error.response?.data?.message || '更新用戶資料失敗'
            commit('SET_ERROR', message)
            return { success: false, message }
        } finally {
            commit('SET_LOADING', false)
        }
    },
    async fetchUsers({ commit }, { page = 1, size = 10, search, role, status } = {}) {
        try {
            commit('SET_LOADING', true);
            const response = await api.get('/api/users/list', {
                params: {
                    page: page - 1,  // 後端是從0開始計算，前端要減1
                    size,
                    search,
                    role: role || undefined,
                    status: status === 'ACTIVE' ? true : (status === 'INACTIVE' ? false : undefined)
                }
            });

            if (response.data) {
                commit('SET_USERS', response.data.content);
                commit('SET_PAGINATION', {
                    totalPages: response.data.totalPages,
                    currentPage: page,
                    totalItems: response.data.totalElements
                });
            }
        } catch (error) {
            commit('SET_ERROR', error.message);
        } finally {
            commit('SET_LOADING', false);
        }
    },

    async updateUser({ dispatch }, { id, ...userData }) {
        try {
            // 移除重複的 /api 前綴
            await api.put(`/users/${id}`, userData)
            await dispatch('fetchUsers')
            return { success: true }
        } catch (error) {
            console.error('更新用戶失敗:', error)
            throw error
        }
    },

    async createUser({ dispatch }, userData) {
        try {
            await api.post('/users', userData)
            await dispatch('fetchUsers')
            return { success: true }
        } catch (error) {
            console.error('創建用戶失敗:', error)
            throw error
        }
    },

    async updateUserStatus({ dispatch }, { id, active }) {
        try {
            await api.put(`/users/${id}/status`, null, {
                params: { active }
            })
            await dispatch('fetchUsers')
            return { success: true }
        } catch (error) {
            console.error('更新用戶狀態失敗:', error)
            throw error
        }
    }

}

const mutations = {

    SET_USERS(state, users) {
        state.users = users.map(user => ({
            ...user,
            createdAt: user.created_at
        }));
    },
    SET_PAGINATION(state, { totalPages, currentPage, totalItems }) {
        state.totalPages = totalPages
        state.currentPage = currentPage
        state.totalItems = totalItems
    },
    SET_LOADING(state, loading) {
        state.loading = loading
    },
    SET_ERROR(state, error) {
        state.error = error
    },
    SET_PROFILE(state, profile) {
        state.profile = profile
    },
    CLEAR_ERROR(state) {
        state.error = null
    },

}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
