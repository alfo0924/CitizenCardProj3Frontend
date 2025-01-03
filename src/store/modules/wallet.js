// store/modules/wallet.js
import api from '@/services/api.config'

const state = {
    info: {
        balance: 0,
        cardNumber: '',
        status: 'ACTIVE'
    },
    tickets: [],
    coupons: [],
    transactions: [],
    total: 0,
    totalPages: 0,
    isLoading: false,
    error: null
}

const getters = {
    balance: (state) => state.info.balance,
    cardNumber: (state) => state.info.cardNumber,
    isActive: (state) => state.info.status === 'ACTIVE',
    tickets: (state) => state.tickets,
    validTickets: (state) => state.tickets.filter(ticket => ticket.status === 'VALID'),
    coupons: (state) => state.coupons,
    validCoupons: (state) => state.coupons.filter(coupon => coupon.status === 'VALID'),
    transactions: (state) => state.transactions,
    totalPages: (state) => state.totalPages,
    isLoading: (state) => state.isLoading,
    error: (state) => state.error
}

const mutations = {
    SET_WALLET_INFO(state, info) {
        state.info = info
    },
    SET_TICKETS(state, tickets) {
        state.tickets = tickets || []
    },
    SET_COUPONS(state, coupons) {
        state.coupons = coupons || []
    },
    SET_TRANSACTIONS(state, transactions) {
        state.transactions = transactions
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
    UPDATE_BALANCE(state, amount) {
        state.info.balance = amount
    },
    UPDATE_TICKET_STATUS(state, { ticketId, status }) {
        const ticket = state.tickets.find(t => t.id === ticketId)
        if (ticket) {
            ticket.status = status
        }
    },
    UPDATE_COUPON_STATUS(state, { couponId, status }) {
        const coupon = state.coupons.find(c => c.id === couponId)
        if (coupon) {
            coupon.status = status
        }
    }
}

const actions = {
    async fetchWalletInfo({ commit }) {
        try {
            commit('SET_LOADING', true)
            commit('SET_ERROR', null)
            const response = await api.get('/wallet/info')
            commit('SET_WALLET_INFO', response.data)
            return response.data
        } catch (error) {
            const message = error.response?.data?.message || '獲取錢包資訊失敗'
            commit('SET_ERROR', message)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    async fetchTickets({ commit }, params = { page: 0, size: 10 }) {
        try {
            commit('SET_LOADING', true)
            const response = await api.get('/wallet/tickets', {
                params: {
                    ...params,
                    sort: 'createdAt,desc'
                }
            })
            if (response.data?.content) {
                commit('SET_TICKETS', response.data.content)
                commit('SET_TOTAL_PAGES', response.data.totalPages)
            }
            return response.data
        } catch (error) {
            const message = error.response?.data?.message || '獲取電影票失敗'
            commit('SET_ERROR', message)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    async fetchValidTickets({ commit }, params = { page: 0, size: 10 }) {
        try {
            commit('SET_LOADING', true)
            const response = await api.get('/wallet/tickets/valid', { params })
            if (response.data?.content) {
                commit('SET_TICKETS', response.data.content)
                commit('SET_TOTAL_PAGES', response.data.totalPages)
            }
            return response.data
        } catch (error) {
            const message = error.response?.data?.message || '獲取有效電影票失敗'
            commit('SET_ERROR', message)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    async fetchCoupons({ commit }, params = { page: 0, size: 10 }) {
        try {
            commit('SET_LOADING', true)
            const response = await api.get('/wallet/coupons', {
                params: {
                    ...params,
                    sort: 'expiryDate,asc'
                }
            })
            if (response.data?.content) {
                commit('SET_COUPONS', response.data.content)
                commit('SET_TOTAL_PAGES', response.data.totalPages)
            }
            return response.data
        } catch (error) {
            const message = error.response?.data?.message || '獲取優惠券失敗'
            commit('SET_ERROR', message)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    async useTicket({ commit }, ticketId) {
        try {
            commit('SET_LOADING', true)
            const response = await api.patch(`/wallet/tickets/${ticketId}/use`)
            commit('UPDATE_TICKET_STATUS', { ticketId, status: 'USED' })
            return response.data
        } catch (error) {
            const message = error.response?.data?.message || '使用電影票失敗'
            commit('SET_ERROR', message)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    async useCoupon({ commit }, couponId) {
        try {
            commit('SET_LOADING', true)
            const response = await api.patch(`/wallet/coupons/${couponId}/use`)
            commit('UPDATE_COUPON_STATUS', { couponId, status: 'USED' })
            return response.data
        } catch (error) {
            const message = error.response?.data?.message || '使用優惠券失敗'
            commit('SET_ERROR', message)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    async deposit({ commit }, amount) {
        try {
            commit('SET_LOADING', true)
            const response = await api.post('/wallet/deposit', { amount })
            commit('UPDATE_BALANCE', response.data.balance)
            return response.data
        } catch (error) {
            const message = error.response?.data?.message || '儲值失敗'
            commit('SET_ERROR', message)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    async withdraw({ commit }, amount) {
        try {
            commit('SET_LOADING', true)
            const response = await api.post('/wallet/withdraw', { amount })
            commit('UPDATE_BALANCE', response.data.balance)
            return response.data
        } catch (error) {
            const message = error.response?.data?.message || '提領失敗'
            commit('SET_ERROR', message)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

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
