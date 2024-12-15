import api from './api.config'

class AuthService {
    async login(credentials) {
        if (!credentials.email || !credentials.password) {
            throw new Error('請輸入電子郵件和密碼')
        }

        try {
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

            // 更新登入資訊
            const now = new Date().toISOString()
            user.last_login_time = now
            user.updated_at = now

            this.setAuthData(token, user)
            return { token, user }
        } catch (error) {
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
        const requiredFields = [
            'id',
            'name',
            'email',
            'role',
            'active',
            'email_verified',
            'created_at',
            'updated_at',
            'version'
        ]

        for (const field of requiredFields) {
            if (!Object.prototype.hasOwnProperty.call(user, field)) {
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

            const now = new Date().toISOString()
            const formattedData = {
                name: userData.name.trim(),
                email: userData.email.toLowerCase().trim(),
                password: userData.password,
                phone: userData.phone?.trim() || null,
                birthday: userData.birthday || null,
                gender: userData.gender || null,
                role: 'ROLE_USER',
                address: userData.address?.trim() || null,
                avatar: userData.avatar || null,
                active: true,
                email_verified: false,
                last_login_time: null,
                last_login_ip: null,
                created_at: now,
                updated_at: now,
                version: 0
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

    async fetchProfile() {
        try {
            const response = await api.get('/auth/profile')
            const userData = response.data

            // 更新本地存儲的用戶資料
            if (userData) {
                localStorage.setItem('user', JSON.stringify(userData))
            }

            return userData
        } catch (error) {
            throw new Error('獲取用戶資料失敗')
        }
    }

    async updateProfile(profileData) {
        try {
            const now = new Date().toISOString()
            const updateData = {
                name: profileData.name,
                phone: profileData.phone,
                birthday: profileData.birthday,
                gender: profileData.gender,
                address: profileData.address,
                avatar: profileData.avatar,
                updated_at: now,
                version: (profileData.version || 0) + 1
            }

            const response = await api.put('/auth/profile', updateData)
            const updatedUser = response.data

            // 更新本地存儲的用戶資料
            if (updatedUser) {
                localStorage.setItem('user', JSON.stringify(updatedUser))
            }

            return updatedUser
        } catch (error) {
            throw new Error('更新個人資料失敗')
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
