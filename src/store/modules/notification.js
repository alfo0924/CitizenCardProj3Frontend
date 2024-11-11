// store/modules/notification.js

// 初始狀態
const state = {
  notification: null
}

// getters
const getters = {
  notification: state => state.notification
}

// mutations
const mutations = {
  SET_NOTIFICATION(state, notification) {
    state.notification = notification
  },
  CLEAR_NOTIFICATION(state) {
    state.notification = null
  }
}

// actions
const actions = {
  /**
   * 設置通知
   * @param {Object} context - Vuex context
   * @param {Object} notification - 通知對象
   * @param {string} notification.type - 通知類型 (success/error/warning/info)
   * @param {string} notification.message - 通知訊息
   * @param {number} [notification.duration=3000] - 通知顯示時間（毫秒）
   */
  setNotification({ commit }, notification) {
    // 清除現有的通知
    commit('CLEAR_NOTIFICATION')

    // 設置新的通知
    commit('SET_NOTIFICATION', {
      id: Date.now(),
      type: notification.type || 'info',
      message: notification.message,
      duration: notification.duration || 3000
    })

    // 設置自動清除
    setTimeout(() => {
      commit('CLEAR_NOTIFICATION')
    }, notification.duration || 3000)
  },

  /**
   * 顯示成功通知
   * @param {Object} context - Vuex context
   * @param {string} message - 通知訊息
   * @param {number} [duration] - 通知顯示時間
   */
  showSuccess({ dispatch }, { message, duration }) {
    dispatch('setNotification', {
      type: 'success',
      message,
      duration
    })
  },

  /**
   * 顯示錯誤通知
   * @param {Object} context - Vuex context
   * @param {string} message - 通知訊息
   * @param {number} [duration] - 通知顯示時間
   */
  showError({ dispatch }, { message, duration }) {
    dispatch('setNotification', {
      type: 'error',
      message,
      duration
    })
  },

  /**
   * 顯示警告通知
   * @param {Object} context - Vuex context
   * @param {string} message - 通知訊息
   * @param {number} [duration] - 通知顯示時間
   */
  showWarning({ dispatch }, { message, duration }) {
    dispatch('setNotification', {
      type: 'warning',
      message,
      duration
    })
  },

  /**
   * 顯示信息通知
   * @param {Object} context - Vuex context
   * @param {string} message - 通知訊息
   * @param {number} [duration] - 通知顯示時間
   */
  showInfo({ dispatch }, { message, duration }) {
    dispatch('setNotification', {
      type: 'info',
      message,
      duration
    })
  },

  /**
   * 清除通知
   * @param {Object} context - Vuex context
   */
  clearNotification({ commit }) {
    commit('CLEAR_NOTIFICATION')
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
