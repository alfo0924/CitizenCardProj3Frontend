/**
 * 日期時間格式化
 */
export const formatDateTime = {
    // 完整日期時間
    full: (datetime) => {
        if (!datetime) return ''
        return new Date(datetime).toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    },

    // 僅日期
    date: (date) => {
        if (!date) return ''
        return new Date(date).toLocaleDateString('zh-TW')
    },

    // 僅時間
    time: (time) => {
        if (!time) return ''
        return new Date(time).toLocaleTimeString('zh-TW', {
            hour: '2-digit',
            minute: '2-digit'
        })
    },

    // 短日期（月日）
    shortDate: (date) => {
        if (!date) return ''
        return new Date(date).toLocaleDateString('zh-TW', {
            month: 'numeric',
            day: 'numeric'
        })
    },

    // 相對時間
    relative: (date) => {
        if (!date) return ''
        const now = new Date()
        const diff = now - new Date(date)
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(minutes / 60)
        const days = Math.floor(hours / 24)

        if (minutes < 1) return '剛剛'
        if (minutes < 60) return `${minutes}分鐘前`
        if (hours < 24) return `${hours}小時前`
        if (days < 30) return `${days}天前`
        return new Date(date).toLocaleDateString('zh-TW')
    }
}

// 導出單獨的格式化函數，用於兼容性
export const formatDate = formatDateTime.date
export const formatTime = formatDateTime.time
export const formatFullDateTime = formatDateTime.full

/**
 * 金額格式化
 */
export const formatCurrency = {
    // 台幣格式
    TWD: (amount) => {
        if (typeof amount !== 'number') return 'NT$ 0'
        return `NT$ ${amount.toLocaleString('zh-TW')}`
    },

    // 純數字格式
    number: (amount) => {
        if (typeof amount !== 'number') return '0'
        return amount.toLocaleString('zh-TW')
    }
}

/**
 * 字串處理
 */
export const stringHelpers = {
    // 截短文字
    truncate: (text, length = 30) => {
        if (!text) return ''
        return text.length > length ? text.substring(0, length) + '...' : text
    },

    // 首字母大寫
    capitalize: (text) => {
        if (!text) return ''
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
    },

    // 移除HTML標籤
    stripHtml: (html) => {
        if (!html) return ''
        return html.replace(/<[^>]*>/g, '')
    }
}

/**
 * 驗證函數
 */
export const validators = {
    // Email驗證
    isValidEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return re.test(email)
    },

    // 手機號碼驗證（台灣）
    isValidPhone: (phone) => {
        const re = /^09\d{8}$/
        return re.test(phone)
    },

    // 密碼強度檢查
    checkPasswordStrength: (password) => {
        let strength = 0
        if (password.length >= 8) strength += 20
        if (/[a-z]/.test(password)) strength += 20
        if (/[A-Z]/.test(password)) strength += 20
        if (/[0-9]/.test(password)) strength += 20
        if (/[^a-zA-Z0-9]/.test(password)) strength += 20
        return strength
    }
}

/**
 * 本地存儲
 */
export const storage = {
    // 設置
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value))
            return true
        } catch (error) {
            console.error('Storage set error:', error)
            return false
        }
    },

    // 獲取
    get: (key) => {
        try {
            const item = localStorage.getItem(key)
            return item ? JSON.parse(item) : null
        } catch (error) {
            console.error('Storage get error:', error)
            return null
        }
    },

    // 移除
    remove: (key) => {
        try {
            localStorage.removeItem(key)
            return true
        } catch (error) {
            console.error('Storage remove error:', error)
            return false
        }
    },

    // 清空
    clear: () => {
        try {
            localStorage.clear()
            return true
        } catch (error) {
            console.error('Storage clear error:', error)
            return false
        }
    }
}

/**
 * URL參數處理
 */
export const urlHelpers = {
    // 獲取URL參數
    getQueryParam: (param) => {
        const urlParams = new URLSearchParams(window.location.search)
        return urlParams.get(param)
    },

    // 設置URL參數
    setQueryParams: (params) => {
        const urlParams = new URLSearchParams(window.location.search)
        Object.entries(params).forEach(([key, value]) => {
            if (value === null || value === undefined) {
                urlParams.delete(key)
            } else {
                urlParams.set(key, value)
            }
        })
        return `${window.location.pathname}?${urlParams.toString()}`
    }
}

/**
 * 錯誤處理
 */
export const errorHandler = {
    // 格式化錯誤信息
    formatError: (error) => {
        if (!error) return '發生未知錯誤'
        if (typeof error === 'string') return error
        if (error.response?.data?.message) return error.response.data.message
        if (error.message) return error.message
        return '發生未知錯誤'
    },

    // 記錄錯誤
    logError: (error, context = '') => {
        console.error(`Error in ${context}:`, error)
        // 這裡可以添加錯誤上報邏輯
    }
}

/**
 * 設備檢測
 */
export const deviceDetector = {
    // 是否為移動設備
    isMobile: () => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
    },

    // 是否為iOS設備
    isIOS: () => {
        return /iPad|iPhone|iPod/.test(navigator.userAgent)
    },

    // 是否為Android設備
    isAndroid: () => {
        return /Android/.test(navigator.userAgent)
    }
}

/**
 * 防抖函數
 */
export const debounce = (func, wait = 300) => {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

/**
 * 節流函數
 */
export const throttle = (func, limit = 300) => {
    let inThrottle
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args)
            inThrottle = true
            setTimeout(() => (inThrottle = false), limit)
        }
    }
}

export default {
    formatDateTime,
    formatDate,
    formatTime,
    formatFullDateTime,
    formatCurrency,
    stringHelpers,
    validators,
    storage,
    urlHelpers,
    errorHandler,
    deviceDetector,
    debounce,
    throttle
}
