import api from './api.config'

class AuthService {
    async login(credentials) {
        if (!credentials.email || !credentials.password) {
            throw new Error('請輸入電子郵件和密碼')
        }

        try {
            // 先檢查帳號是否存在
            const checkUserResponse = await api.post('/auth/check-user', {
                email: credentials.email.toLowerCase().trim()
            })

            if (!checkUserResponse.data.exists) {
                throw new Error('此帳號不存在請註冊')
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
                throw new Error('帳號密碼錯誤')
            }

            this.validateUserData(user)
            this.setAuthData(token, user)
            return { token, user }

        } catch (error) {
            if (error.message === '此帳號不存在請註冊') {
                throw {
                    message: error.message,
                    shouldRedirect: true
                }
            }

            if (error.response) {
                const status = error.response.status
                switch (status) {
                    case 401:
                        throw new Error('帳號密碼錯誤')
                    case 403:
                        throw new Error('帳戶已被停用')
                    case 404:
                        throw new Error('此帳號不存在請註冊')
                    default:
                        throw new Error('登入失敗，請稍後再試')
                }
            }
            throw error
        }
    }

    validateUserData(user) {
        const requiredFields = ['id', 'name', 'email', 'role', 'active']
        for (const field of requiredFields) {
            if (!user.hasOwnProperty(field)) {
                throw new Error('用戶資料不完整')
            }
        }

        if (!user.active) {
            throw new Error('此帳戶已被停用')
        }
    }

    async register(userData) {
        try {
            this.validateRegisterData(userData)

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
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }

            const response = await api.post('/auth/register', formattedData)
            return response.data
        } catch (error) {
            if (error.response?.status === 409) {
                throw new Error('此電子郵件已被註冊')
            }
            throw error
        }
    }

    validateRegisterData(userData) {
        if (!userData.name?.trim()) {
            throw new Error('請輸入姓名')
        }
        if (!this.isValidEmail(userData.email)) {
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
                await api.post('/auth/logout')
            }
        } finally {
            this.clearAuthData()
        }
    }

    setAuthData(token, user) {
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
        return !!token && !!user && user.active
    }
}

export default new AuthService()
