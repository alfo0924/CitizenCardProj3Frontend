import api from './api.config'

class AuthService {
    // 登入
    async login(credentials) {
        try {
            const response = await api.post('/auth/login', credentials)
            if (response.data) {
                const { token, refreshToken, user } = response.data
                this.setAuthData(token, refreshToken, user)
            }
            return response.data
        } catch (error) {
            this.handleError(error)
            throw error
        }
    }

    // 註冊
    async register(userData) {
        try {
            const formattedData = {
                ...userData,
                role: 'ROLE_USER',
                active: true,
                emailVerified: false,
                version: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
            const response = await api.post('/auth/register', formattedData)
            return response.data
        } catch (error) {
            this.handleError(error)
            throw error
        }
    }

    // 登出
    async logout() {
        try {
            const token = this.getToken()
            if (token) {
                await api.post('/auth/logout', { token })
            }
            this.clearAuthData()
        } catch (error) {
            console.error('Logout error:', error)
            this.clearAuthData()
        }
    }

    // 獲取個人資料
    async getProfile() {
        try {
            const response = await api.get('/auth/profile')
            return response.data
        } catch (error) {
            this.handleError(error)
            throw error
        }
    }

    // 更新個人資料
    async updateProfile(profileData) {
        try {
            const response = await api.put('/auth/profile', {
                ...profileData,
                updatedAt: new Date().toISOString()
            })
            if (response.data) {
                const user = this.getCurrentUser()
                this.setAuthData(this.getToken(), this.getRefreshToken(), {
                    ...user,
                    ...response.data
                })
            }
            return response.data
        } catch (error) {
            this.handleError(error)
            throw error
        }
    }

    // 驗證Email
    async validateEmail(email) {
        try {
            const response = await api.post('/auth/validate-email', { email })
            return response.data
        } catch (error) {
            this.handleError(error)
            throw error
        }
    }

    // 設置認證數據
    setAuthData(token, refreshToken, user) {
        localStorage.setItem('token', token)
        localStorage.setItem('refreshToken', refreshToken)
        localStorage.setItem('user', JSON.stringify(user))
    }

    // 清除認證數據
    clearAuthData() {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        localStorage.removeItem('wallet')
        localStorage.removeItem('tickets')
        localStorage.removeItem('coupons')
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

    // 獲取Refresh Token
    getRefreshToken() {
        return localStorage.getItem('refreshToken')
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

    // 刷新Token
    async refreshToken() {
        try {
            const refreshToken = this.getRefreshToken()
            if (!refreshToken) throw new Error('No refresh token')

            const response = await api.post('/auth/refresh-token', {
                refreshToken
            })

            if (response.data) {
                const { token, refreshToken: newRefreshToken } = response.data
                this.setAuthData(token, newRefreshToken, this.getCurrentUser())
                return token
            }
        } catch (error) {
            this.handleError(error)
            this.clearAuthData()
            throw error
        }
    }

    // 檢查Token
    async checkToken() {
        try {
            const response = await api.get('/auth/check')
            return response.data
        } catch (error) {
            this.handleError(error)
            throw error
        }
    }

    // 錯誤處理
    handleError(error) {
        if (error.response?.status === 401) {
            this.clearAuthData()
        }
        console.error('Auth service error:', error)
    }
}

export default new AuthService()
