// store/modules/wallet.js
import api from '@/services/api.config'

const state = {
    info: {
        balance: 0,
        cardNumber: '',
        status: 'ACTIVE'
    },
    transactions: [],
    total: 0,
    totalPages: 0,
    isLoading: false,
    error: null
}

const getters = {
    balance: state => state.info.balance,
    cardNumber: state => state.info.cardNumber,
    isActive: state => state.info.status === 'ACTIVE',
    transactions: state => state.transactions,
    totalPages: state => state.totalPages,
    isLoading: state => state.isLoading,
    error: state => state.error
}

const mutations = {
    SET_WALLET_INFO(state, info) {
        state.info = info
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
    }
}

const actions = {
    // 獲取錢包資訊
    async fetchWalletInfo({ commit }) {
        try {
            commit('SET_LOADING', true)
            commit('SET_ERROR', null)
            const response = await api.get('/wallet/info')
            commit('SET_WALLET_INFO', response.data)
            return response.data
        } catch (error) {
            commit('SET_ERROR', error.message || '獲取錢包資訊失敗')
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 獲取交易記錄
    async fetchTransactions({ commit }, params) {
        try {
            commit('SET_LOADING', true)
            const response = await api.get('/wallet/transactions', { params })
            commit('SET_TRANSACTIONS', response.data.transactions)
            commit('SET_TOTAL', response.data.total)
            commit('SET_TOTAL_PAGES', response.data.totalPages)
            return response.data
        } catch (error) {
            commit('SET_ERROR', error.message || '獲取交易記錄失敗')
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 儲值
    async topUp({ commit }, { amount }) {
        try {
            commit('SET_LOADING', true)
            commit('SET_ERROR', null)
            const response = await api.post('/wallet/top-up', { amount })
            commit('UPDATE_BALANCE', response.data.balance)
            return response.data
        } catch (error) {
            commit('SET_ERROR', error.message || '儲值失敗')
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 轉帳
    async transfer({ commit }, { receiverEmail, amount, note }) {
        try {
            commit('SET_LOADING', true)
            commit('SET_ERROR', null)
            const response = await api.post('/wallet/transfer', {
                receiverEmail,
                amount,
                note
            })
            commit('UPDATE_BALANCE', response.data.balance)
            return response.data
        } catch (error) {
            commit('SET_ERROR', error.message || '轉帳失敗')
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 支付
    async pay({ commit }, { orderId, amount }) {
        try {
            commit('SET_LOADING', true)
            commit('SET_ERROR', null)
            const response = await api.post('/wallet/pay', {
                orderId,
                amount
            })
            commit('UPDATE_BALANCE', response.data.balance)
            return response.data
        } catch (error) {
            commit('SET_ERROR', error.message || '支付失敗')
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 退款
    async refund({ commit }, { transactionId, amount }) {
        try {
            commit('SET_LOADING', true)
            commit('SET_ERROR', null)
            const response = await api.post('/wallet/refund', {
                transactionId,
                amount
            })
            commit('UPDATE_BALANCE', response.data.balance)
            return response.data
        } catch (error) {
            commit('SET_ERROR', error.message || '退款失敗')
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