// store/modules/discount.js
import api from '@/services/api.config'

const state = {
    discounts: [],
    currentDiscount: null,
    total: 0,
    totalPages: 0,
    isLoading: false,
    error: null
}

const getters = {
    allDiscounts: (state) => state.discounts,
    currentDiscount: (state) => state.currentDiscount,
    totalPages: (state) => state.totalPages,
    isLoading: (state) => state.isLoading,
    error: (state) => state.error,

    // 取得有效的優惠
    validDiscounts: (state) => {
        const now = new Date()
        return state.discounts.filter((discount) => {
            const endDate = new Date(discount.endDate)
            return endDate >= now && discount.status === 'ACTIVE'
        })
    },

    // 取得即將到期的優惠
    expiringDiscounts: (state) => {
        const now = new Date()
        const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000))
        return state.discounts.filter((discount) => {
            const endDate = new Date(discount.endDate)
            return endDate >= now && endDate <= thirtyDaysFromNow && discount.status === 'ACTIVE'
        })
    }
}

const mutations = {
    SET_DISCOUNTS(state, discounts) {
        state.discounts = discounts
    },
    SET_CURRENT_DISCOUNT(state, discount) {
        state.currentDiscount = discount
    },
    SET_TOTAL(state, total) {
        state.total = total
    },
    SET_TOTAL_PAGES(state, totalPages) {
        state.totalPages = totalPages
    },
    SET_LOADING(state, status) {
        state.isLoading = status
    },
    SET_ERROR(state, error) {
        state.error = error
    },
    UPDATE_DISCOUNT_STATUS(state, { discountId, status }) {
        const discount = state.discounts.find((d) => d.id === discountId)
        if (discount) {
            discount.status = status
        }
    }
}

const actions = {
    // 獲取優惠列表
    async fetchDiscounts({ commit }, params = {}) {
        try {
            commit('SET_LOADING', true)
            commit('SET_ERROR', null)
            const response = await api.get('/discounts', { params })
            commit('SET_DISCOUNTS', response.data.discounts)
            commit('SET_TOTAL', response.data.total)
            commit('SET_TOTAL_PAGES', response.data.totalPages)
            return response.data
        } catch (error) {
            commit('SET_ERROR', error.message || '獲取優惠列表失敗')
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 獲取優惠詳情
    async fetchDiscountDetail({ commit }, discountId) {
        try {
            commit('SET_LOADING', true)
            commit('SET_ERROR', null)
            const response = await api.get(`/discounts/${discountId}`)
            commit('SET_CURRENT_DISCOUNT', response.data)
            return response.data
        } catch (error) {
            commit('SET_ERROR', error.message || '獲取優惠詳情失敗')
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 使用優惠
    async useDiscount({ commit }, { discountId, orderId }) {
        try {
            commit('SET_LOADING', true)
            commit('SET_ERROR', null)
            const response = await api.post(`/discounts/${discountId}/use`, { orderId })
            commit('UPDATE_DISCOUNT_STATUS', {
                discountId,
                status: 'USED'
            })
            return response.data
        } catch (error) {
            commit('SET_ERROR', error.message || '使用優惠失敗')
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 檢查優惠是否可用
    async checkDiscountAvailability({ commit }, { discountId, amount }) {
        try {
            commit('SET_LOADING', true)
            commit('SET_ERROR', null)
            const response = await api.post(`/discounts/${discountId}/check`, { amount })
            return response.data
        } catch (error) {
            commit('SET_ERROR', error.message || '檢查優惠可用性失敗')
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 搜尋優惠
    async searchDiscounts({ commit }, keyword) {
        try {
            commit('SET_LOADING', true)
            commit('SET_ERROR', null)
            const response = await api.get('/discounts/search', {
                params: { keyword }
            })
            commit('SET_DISCOUNTS', response.data.discounts)
            commit('SET_TOTAL', response.data.total)
            commit('SET_TOTAL_PAGES', response.data.totalPages)
            return response.data
        } catch (error) {
            commit('SET_ERROR', error.message || '搜尋優惠失敗')
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 清除錯誤
    clearError({ commit }) {
        commit('SET_ERROR', null)
    }
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
}