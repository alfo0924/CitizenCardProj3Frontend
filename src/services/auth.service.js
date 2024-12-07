import api from './api.config'

class AuthService {
    // 登入
    async login(credentials) {
        const response = await api.post('/auth/login', credentials)
        if (response.token) {
            localStorage.setItem('token', response.token)
            localStorage.setItem('user', JSON.stringify(response.user))
        }
        return response
    }

    // 註冊
    async register(userData) {
        const response = await api.post('/auth/register', userData)
        return response
    }

    // 登出
    logout() {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
    }

    // 更新個人資料
    async updateProfile(userData) {
        const response = await api.put('/auth/profile', userData)
        if (response.user) {
            localStorage.setItem('user', JSON.stringify(response.user))
        }
        return response
    }

    // 變更密碼
    async changePassword(oldPassword, newPassword) {
        const response = await api.post('/auth/change-password', {
            oldPassword,
            newPassword
        })
        return response
    }

    // 驗證Email
    async verifyEmail(token) {
        const response = await api.post('/auth/verify-email', { token })
        return response
    }

    // 刷新Token
    async refreshToken() {
        const response = await api.post('/auth/refresh-token')
        if (response.token) {
            localStorage.setItem('token', response.token)
        }
        return response
    }

    // 獲取當前用戶
    getCurrentUser() {
        const userStr = localStorage.getItem('user')
        return userStr ? JSON.parse(userStr) : null
    }

    // 獲取Token
    getToken() {
        return localStorage.getItem('token')
    }

    // 檢查是否已登入
    isLoggedIn() {
        return !!this.getToken()
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
}

export default new AuthService()
