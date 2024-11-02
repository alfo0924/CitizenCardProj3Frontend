// services/auth.service.js
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
        localStorage.removeItem('token')
        localStorage.removeItem('user')
    }

    // 重設密碼請求
    async requestPasswordReset(email) {
        try {
            const response = await api.post('/auth/password-reset-request', { email })
            return response
        } catch (error) {
            throw error
        }
    }

    // 重設密碼
    async resetPassword(token, newPassword) {
        try {
            const response = await api.post('/auth/reset-password', {
                token,
                newPassword
            })
            return response
        } catch (error) {
            throw error
        }
    }

    // 變更密碼
    async changePassword(oldPassword, newPassword) {
        try {
            const response = await api.post('/auth/change-password', {
                oldPassword,
                newPassword
            })
            return response
        } catch (error) {
            throw error
        }
    }

    // 更新個人資料
    async updateProfile(userData) {
        try {
            const response = await api.put('/auth/profile', userData)
            if (response.user) {
                localStorage.setItem('user', JSON.stringify(response.user))
            }
            return response
        } catch (error) {
            throw error
        }
    }

    // 驗證Email
    async verifyEmail(token) {
        try {
            const response = await api.post('/auth/verify-email', { token })
            return response
        } catch (error) {
            throw error
        }
    }

    // 重新發送驗證Email
    async resendVerificationEmail() {
        try {
            const response = await api.post('/auth/resend-verification')
            return response
        } catch (error) {
            throw error
        }
    }

    // 刷新Token
    async refreshToken() {
        try {
            const response = await api.post('/auth/refresh-token')
            if (response.token) {
                localStorage.setItem('token', response.token)
            }
            return response
        } catch (error) {
            throw error
        }
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
        try {
            const decoded = JSON.parse(atob(token.split('.')[1]))
            return decoded.exp < Date.now() / 1000
        } catch (error) {
            return true
        }
    }
}

export default new AuthService()