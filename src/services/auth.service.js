import api from './api.config'

class AuthService {
    // 登入
    async login(credentials) {
        try {
            const response = await api.post('/auth/login', credentials)
            if (response.token) {
                localStorage.setItem('token', response.token)
                localStorage.setItem('user', JSON.stringify(response.user))
            }
            return response
        } catch (error) {
            throw error
        }
    }

    // 註冊
    async register(userData) {
        try {
            const response = await api.post('/auth/register', userData)
            return response
        } catch (error) {
            throw error
        }
    }

    // 登出
    logout() {
        try {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            // 清除其他相關的本地存儲
            localStorage.removeItem('wallet')
            localStorage.removeItem('tickets')
            localStorage.removeItem('coupons')
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    // 獲取個人資料
    async getProfile() {
        try {
            const response = await api.get('/auth/profile')
            return response
        } catch (error) {
            throw error
        }
    }

    // 驗證Email
    async validateEmail(email) {
        try {
            const response = await api.post('/auth/validate-email', { email })
            return response
        } catch (error) {
            throw error
        }
    }

    // 獲取當前用戶
    getCurrentUser() {
        try {
            const userStr = localStorage.getItem('user')
            return userStr ? JSON.parse(userStr) : null
        } catch (error) {
            console.error('Get current user error:', error)
            return null
        }
    }

    // 獲取Token
    getToken() {
        return localStorage.getItem('token')
    }

    // 檢查是否已登入
    isLoggedIn() {
        const token = this.getToken()
        return !!token && !this.isTokenExpired(token)
    }

    // 檢查Token是否過期
    isTokenExpired(token) {
        if (!token) return true
        try {
            const decoded = JSON.parse(atob(token.split('.')[1]))
            return decoded.exp < Date.now() / 1000
        } catch {
            return true
        }
    }

    // 檢查Token
    async checkToken() {
        try {
            const response = await api.get('/auth/check')
            return response
        } catch (error) {
            this.logout()
            throw error
        }
    }
}

export default new AuthService()
