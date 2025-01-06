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
    async fetchUsers({ commit }, params) {
        try {
            commit('SET_LOADING', true)
            const response = await api.get('/api/users/list', { params })
            if (response.data?.content) {
                commit('SET_USERS', response.data.content)
                commit('SET_PAGINATION', {
                    totalPages: response.data.totalPages,
                    currentPage: params.page,
                    totalItems: response.data.totalElements
                })
            }
            return response
        } catch (error) {
            commit('SET_ERROR', error.message)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    async createUser({ dispatch }, userData) {
        try {
            await api.post('/api/users', userData)
            await dispatch('fetchUsers', { page: 1, size: 10 })
            return { success: true }
        } catch (error) {
            console.error('Error creating user:', error)
            throw error
        }
    },

    async updateUser({ dispatch }, { id, ...userData }) {
        try {
            await api.put(`/api/users/${id}`, userData)
            await dispatch('fetchUsers', { page: 1, size: 10 })
            return { success: true }
        } catch (error) {
            console.error('Error updating user:', error)
            throw error
        }
    },

    async deleteUser({ dispatch }, id) {
        try {
            await api.delete(`/api/users/${id}`)
            await dispatch('fetchUsers', { page: 1, size: 10 })
            return { success: true }
        } catch (error) {
            console.error('Error deleting user:', error)
            throw error
        }
    }

}

const mutations = {

    SET_USERS(state, users) {
        state.users = users || []
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
