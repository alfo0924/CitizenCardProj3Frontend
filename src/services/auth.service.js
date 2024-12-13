import api from './api.config'

class AuthService {
    async login(credentials) {
        try {
            const response = await api.post('/auth/login', {
                ...credentials,
                email: credentials.email.toLowerCase().trim()
            })
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

    async register(userData) {
        try {
            const now = new Date().toISOString()
            const formattedData = {
                name: userData.name.trim(),
                email: userData.email.toLowerCase().trim(),
                password: userData.password,
                confirmPassword: userData.confirmPassword,
                phone: userData.phone?.trim(),
                birthday: userData.birthday,
                gender: userData.gender,
                address: userData.address?.trim(),
                role: 'ROLE_USER',
                active: true,
                emailVerified: false,
                version: 0,
                createdAt: now,
                updatedAt: now,
                lastLoginTime: now,
                lastLoginIp: '0.0.0.0'
            }
            const response = await api.post('/auth/register', formattedData)
            return response.data
        } catch (error) {
            this.handleError(error)
            throw error
        }
    }

    async logout() {
        try {
            const token = this.getToken()
            if (token) {
                await api.post('/auth/logout', { token })
            }
            this.clearAuthData()
        } catch (error) {
            console.error('登出失敗:', error)
            this.clearAuthData()
        }
    }

    async getProfile() {
        try {
            const response = await api.get('/auth/profile')
            if (response.data) {
                const currentUser = this.getCurrentUser()
                this.setAuthData(this.getToken(), this.getRefreshToken(), {
                    ...currentUser,
                    ...response.data
                })
            }
            return response.data
        } catch (error) {
            this.handleError(error)
            throw error
        }
    }

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

    async validateEmail(email) {
        try {
            const response = await api.post('/auth/validate-email', {
                email: email.toLowerCase().trim()
            })
            return response.data
        } catch (error) {
            this.handleError(error)
            throw error
        }
    }

    setAuthData(token, refreshToken, user) {
        localStorage.setItem('token', token)
        localStorage.setItem('refreshToken', refreshToken)
        localStorage.setItem('user', JSON.stringify(user))
    }

    clearAuthData() {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        localStorage.removeItem('wallet')
        localStorage.removeItem('tickets')
        localStorage.removeItem('coupons')
    }

    getCurrentUser() {
        try {
            const userStr = localStorage.getItem('user')
            return userStr ? JSON.parse(userStr) : null
        } catch (error) {
            console.error('獲取用戶資料失敗:', error)
            return null
        }
    }

    getToken() {
        return localStorage.getItem('token')
    }

    getRefreshToken() {
        return localStorage.getItem('refreshToken')
    }

    isLoggedIn() {
        const token = this.getToken()
        return !!token && !this.isTokenExpired(token)
    }

    isTokenExpired(token) {
        if (!token) return true
        try {
            const decoded = JSON.parse(atob(token.split('.')[1]))
            return decoded.exp < Date.now() / 1000
        } catch {
            return true
        }
    }

    async refreshToken() {
        try {
            const refreshToken = this.getRefreshToken()
            if (!refreshToken) throw new Error('無可用的更新令牌')

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

    async checkToken() {
        try {
            const response = await api.get('/auth/check')
            return response.data
        } catch (error) {
            this.handleError(error)
            throw error
        }
    }

    handleError(error) {
        if (error.response?.status === 401) {
            this.clearAuthData()
        }
        console.error('認證服務錯誤:', error)
    }
}

export default new AuthService()
