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
                if (user.wallet) {
                    localStorage.setItem('wallet', JSON.stringify(user.wallet))
                }
            }
            return response.data
        } catch (error) {
            this.handleError(error)
            throw new Error(error.response?.data?.message || '登入失敗，請檢查帳號密碼')
        }
    }

    async register(userData) {
        try {
            // 資料驗證
            this.validateRegisterData(userData)

            const now = new Date().toISOString()
            const formattedData = {
                name: userData.name.trim(),
                email: userData.email.toLowerCase().trim(),
                password: userData.password,
                phone: userData.phone?.trim(),
                birthday: userData.birthday,
                gender: userData.gender,
                role: 'ROLE_USER',
                active: true,
                emailVerified: false,
                version: 0,
                createdAt: now,
                updatedAt: now,
                lastLoginTime: now,
                lastLoginIp: '0.0.0.0',
                avatar: '/avatars/default-avatar.jpg'
            }

            const response = await api.post('/auth/register', formattedData)
            return response.data
        } catch (error) {
            this.handleError(error)
            throw new Error(error.response?.data?.message || '註冊失敗，請稍後再試')
        }
    }

    validateRegisterData(userData) {
        if (!userData.name || userData.name.trim().length < 2) {
            throw new Error('姓名長度必須大於2個字元')
        }

        if (!userData.email || !this.isValidEmail(userData.email)) {
            throw new Error('請輸入有效的電子郵件')
        }

        if (!userData.password || userData.password.length < 8) {
            throw new Error('密碼長度必須至少8個字元')
        }

        if (userData.password !== userData.confirmPassword) {
            throw new Error('密碼與確認密碼不一致')
        }

        if (!userData.phone || !this.isValidPhone(userData.phone)) {
            throw new Error('請輸入有效的手機號碼')
        }

        if (!userData.birthday) {
            throw new Error('請選擇生日')
        }

        if (!userData.gender || !['MALE', 'FEMALE', 'OTHER'].includes(userData.gender)) {
            throw new Error('請選擇有效的性別')
        }
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }

    isValidPhone(phone) {
        return /^09\d{8}$/.test(phone)
    }

    async logout() {
        try {
            const token = this.getToken()
            if (token) {
                await api.post('/auth/logout', { token })
            }
        } catch (error) {
            console.error('登出失敗:', error)
        } finally {
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
                if (response.data.wallet) {
                    localStorage.setItem('wallet', JSON.stringify(response.data.wallet))
                }
            }
            return response.data
        } catch (error) {
            this.handleError(error)
            throw new Error('獲取個人資料失敗')
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
                if (response.data.wallet) {
                    localStorage.setItem('wallet', JSON.stringify(response.data.wallet))
                }
            }
            return response.data
        } catch (error) {
            this.handleError(error)
            throw new Error('更新個人資料失敗')
        }
    }

    async validateEmail(email) {
        try {
            if (!this.isValidEmail(email)) {
                throw new Error('無效的電子郵件格式')
            }
            const response = await api.post('/auth/validate-email', {
                email: email.toLowerCase().trim()
            })
            return response.data
        } catch (error) {
            throw new Error(error.response?.data?.message || '電子郵件驗證失敗')
        }
    }

    setAuthData(token, refreshToken, user) {
        if (!token || !refreshToken || !user) {
            throw new Error('無效的認證資料')
        }
        localStorage.setItem('token', token)
        localStorage.setItem('refreshToken', refreshToken)
        localStorage.setItem('user', JSON.stringify(user))
    }

    clearAuthData() {
        const items = ['token', 'refreshToken', 'user', 'wallet', 'tickets', 'coupons']
        items.forEach(item => localStorage.removeItem(item))
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
            if (!refreshToken) {
                throw new Error('無可用的更新令牌')
            }

            const response = await api.post('/auth/refresh-token', { refreshToken })
            if (response.data) {
                const { token, refreshToken: newRefreshToken } = response.data
                this.setAuthData(token, newRefreshToken, this.getCurrentUser())
                return token
            }
        } catch (error) {
            this.handleError(error)
            this.clearAuthData()
            throw new Error('更新令牌失敗')
        }
    }

    async checkToken() {
        try {
            const response = await api.get('/auth/check')
            return response.data
        } catch (error) {
            this.handleError(error)
            throw new Error('令牌驗證失敗')
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
