import api from './api.config'

class AuthService {
    async login(credentials) {
        try {
            const response = await api.post('/auth/login', {
                email: credentials.email.toLowerCase().trim(),
                password: credentials.password
            })
            if (response.data && response.data.token && response.data.user) {
                const { token, user } = response.data
                this.setAuthData(token, user)
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
                email_verified: false,
                created_at: now,
                updated_at: now,
                last_login_time: now,
                last_login_ip: '0.0.0.0',
                version: 0
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
        if (userData.phone && !this.isValidPhone(userData.phone)) {
            throw new Error('請輸入有效的手機號碼')
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
                this.setAuthData(this.getToken(), { ...currentUser, ...response.data })
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
                updated_at: new Date().toISOString()
            })
            if (response.data) {
                const user = this.getCurrentUser()
                this.setAuthData(this.getToken(), { ...user, ...response.data })
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

    setAuthData(token, user) {
        if (!token || !user) {
            throw new Error('無效的認證資料')
        }
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
    }

    clearAuthData() {
        const items = ['token', 'user', 'wallet']
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

    handleError(error) {
        if (error.response?.status === 401) {
            this.clearAuthData()
        }
        console.error('認證服務錯誤:', error)
    }
}

export default new AuthService()
