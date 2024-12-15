import api from './api.config'

class AuthService {
    async login(credentials) {
        try {
            if (!credentials.email || !credentials.password) {
                throw new Error('請輸入電子郵件和密碼')
            }

            const response = await api.post('/auth/login', {
                email: credentials.email.toLowerCase().trim(),
                password: credentials.password
            })

            if (!response.data) {
                throw new Error('伺服器回應無效')
            }

            const { token, user } = response.data
            if (!token || !user) {
                throw new Error('無效的登入資訊')
            }

            // 驗證用戶資料完整性
            if (!this.validateUserData(user)) {
                throw new Error('用戶資料不完整')
            }

            this.setAuthData(token, user)
            return { token, user }
        } catch (error) {
            const errorMessage = this.getErrorMessage(error)
            throw new Error(errorMessage)
        }
    }

    validateUserData(user) {
        const requiredFields = [
            'id',
            'name',
            'email',
            'role',
            'active',
            'email_verified',
            'created_at',
            'updated_at'
        ]
        return requiredFields.every(field => user.hasOwnProperty(field))
    }

    getErrorMessage(error) {
        if (error.response) {
            switch (error.response.status) {
                case 400:
                    return '請求資料格式錯誤'
                case 401:
                    return '帳號或密碼錯誤'
                case 403:
                    return '帳戶已被停用'
                case 404:
                    return '帳號不存在'
                case 422:
                    return error.response.data?.message || '驗證失敗'
                case 429:
                    return '登入嘗試次數過多，請稍後再試'
                case 500:
                    return '系統錯誤，請稍後再試'
                default:
                    return '登入失敗，請稍後再試'
            }
        }
        return error.message || '網路連線異常'
    }

    async register(userData) {
        try {
            this.validateRegisterData(userData)

            const now = new Date().toISOString()
            const formattedData = {
                name: userData.name.trim(),
                email: userData.email.toLowerCase().trim(),
                password: userData.password,
                phone: userData.phone?.trim() || null,
                birthday: userData.birthday || null,
                gender: userData.gender || null,
                role: 'ROLE_USER',
                address: null,
                avatar: null,
                active: true,
                email_verified: false,
                last_login_time: now,
                last_login_ip: null,
                created_at: now,
                updated_at: now,
                version: 0
            }

            const response = await api.post('/auth/register', formattedData)
            return response.data
        } catch (error) {
            throw new Error(this.getErrorMessage(error))
        }
    }

    validateRegisterData(userData) {
        if (!userData.name || userData.name.trim().length > 50) {
            throw new Error('姓名長度必須在1-50個字元之間')
        }
        if (!userData.email || !this.isValidEmail(userData.email) || userData.email.length > 100) {
            throw new Error('請輸入有效的電子郵件(最多100字元)')
        }
        if (!userData.password || userData.password.length < 8 || userData.password.length > 255) {
            throw new Error('密碼長度必須在8-255個字元之間')
        }
        if (userData.phone && (!this.isValidPhone(userData.phone) || userData.phone.length > 20)) {
            throw new Error('請輸入有效的手機號碼(最多20字元)')
        }
        if (userData.gender && !['male', 'female', 'other'].includes(userData.gender)) {
            throw new Error('性別欄位無效')
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
                await api.post('/auth/logout')
            }
        } finally {
            this.clearAuthData()
        }
    }

    setAuthData(token, user) {
        if (!token || !user) return
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
    }

    clearAuthData() {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
    }

    getCurrentUser() {
        try {
            const userStr = localStorage.getItem('user')
            return userStr ? JSON.parse(userStr) : null
        } catch {
            this.clearAuthData()
            return null
        }
    }

    getToken() {
        return localStorage.getItem('token')
    }

    isLoggedIn() {
        const token = this.getToken()
        const user = this.getCurrentUser()
        return !!token && !!user && !this.isTokenExpired(token) && user.active
    }

    isTokenExpired(token) {
        try {
            const decoded = JSON.parse(atob(token.split('.')[1]))
            return decoded.exp < Date.now() / 1000
        } catch {
            return true
        }
    }
}

export default new AuthService()
