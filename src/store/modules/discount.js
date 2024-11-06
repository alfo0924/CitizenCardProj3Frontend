import axios from 'axios'

// 模擬優惠券數據
const mockDiscounts = [
    {
        id: 1,
        title: '新會員優惠券',
        description: '新會員註冊即可獲得100元折價券',
        imageUrl: require('@/assets/images/default-discount.jpg'),
        type: 'NEW_MEMBER',
        amount: 100,
        minPurchase: 500,
        startDate: '2024-03-01',
        endDate: '2024-12-31',
        status: 'AVAILABLE',
        remainingQuantity: 100,
        usageSteps: [
            '註冊成為會員',
            '系統自動發放優惠券',
            '消費時自動套用'
        ],
        notes: [
            '每個帳號限領一次',
            '不可與其他優惠同時使用',
            '有效期限內使用'
        ]
    },
    {
        id: 2,
        title: '生日優惠券',
        description: '生日當月可獲得200元折價券',
        imageUrl: require('@/assets/images/default-discount.jpg'),
        type: 'BIRTHDAY',
        amount: 200,
        minPurchase: 1000,
        startDate: '2024-03-01',
        endDate: '2024-12-31',
        status: 'AVAILABLE',
        remainingQuantity: 50,
        usageSteps: [
            '生日當月自動發放',
            '消費時選擇使用',
            '結帳時折抵'
        ],
        notes: [
            '限生日當月使用',
            '不可與其他優惠同時使用',
            '逾期失效'
        ]
    }
]

const state = {
    discounts: [],
    currentDiscount: null,
    total: 0,
    totalPages: 0,
    isLoading: false,
    error: null
}

const getters = {
    allDiscounts: state => state.discounts,
    currentDiscount: state => state.currentDiscount,
    totalPages: state => state.totalPages,
    isLoading: state => state.isLoading,
    error: state => state.error,

    // 取得有效的優惠
    validDiscounts: state => {
        const now = new Date()
        return state.discounts.filter(discount => {
            const endDate = new Date(discount.endDate)
            return endDate >= now && discount.status === 'AVAILABLE'
        })
    },

    // 取得即將到期的優惠
    expiringDiscounts: state => {
        const now = new Date()
        const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000))
        return state.discounts.filter(discount => {
            const endDate = new Date(discount.endDate)
            return endDate >= now && endDate <= thirtyDaysFromNow && discount.status === 'AVAILABLE'
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
        const discount = state.discounts.find(d => d.id === discountId)
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

            // 模擬API請求延遲
            await new Promise(resolve => setTimeout(resolve, 1000))

            // 使用模擬數據
            const response = {
                data: {
                    discounts: mockDiscounts,
                    total: mockDiscounts.length,
                    totalPages: 1
                }
            }

            commit('SET_DISCOUNTS', response.data.discounts)
            commit('SET_TOTAL', response.data.total)
            commit('SET_TOTAL_PAGES', response.data.totalPages)

            return response.data
        } catch (error) {
            commit('SET_ERROR', '載入優惠列表失敗，請稍後再試')
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

            // 模擬API請求延遲
            await new Promise(resolve => setTimeout(resolve, 1000))

            // 查找模擬數據
            const discount = mockDiscounts.find(d => d.id === Number(discountId))

            if (!discount) {
                throw new Error('優惠券不存在')
            }

            commit('SET_CURRENT_DISCOUNT', discount)
            return discount
        } catch (error) {
            commit('SET_ERROR', error.message || '載入優惠券詳情失敗')
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

            // 模擬API請求延遲
            await new Promise(resolve => setTimeout(resolve, 1000))

            // 模擬使用優惠券
            commit('UPDATE_DISCOUNT_STATUS', {
                discountId,
                status: 'USED'
            })

            return { success: true, message: '優惠券使用成功' }
        } catch (error) {
            commit('SET_ERROR', '使用優惠券失敗，請稍後再試')
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

            // 模擬API請求延遲
            await new Promise(resolve => setTimeout(resolve, 1000))

            // 查找優惠券
            const discount = mockDiscounts.find(d => d.id === Number(discountId))

            if (!discount) {
                throw new Error('優惠券不存在')
            }

            // 檢查條件
            const isAvailable = amount >= discount.minPurchase &&
              discount.status === 'AVAILABLE' &&
              new Date(discount.endDate) >= new Date()

            return {
                available: isAvailable,
                message: isAvailable ? '可以使用此優惠券' : '不符合使用條件'
            }
        } catch (error) {
            commit('SET_ERROR', error.message || '檢查優惠券失敗')
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

            // 模擬API請求延遲
            await new Promise(resolve => setTimeout(resolve, 1000))

            // 搜尋模擬數據
            const filteredDiscounts = mockDiscounts.filter(discount =>
              discount.title.includes(keyword) ||
              discount.description.includes(keyword)
            )

            commit('SET_DISCOUNTS', filteredDiscounts)
            commit('SET_TOTAL', filteredDiscounts.length)
            commit('SET_TOTAL_PAGES', 1)

            return {
                discounts: filteredDiscounts,
                total: filteredDiscounts.length,
                totalPages: 1
            }
        } catch (error) {
            commit('SET_ERROR', '搜尋優惠券失敗，請稍後再試')
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
