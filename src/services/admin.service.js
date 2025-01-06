import axios from 'axios'
import { API_URL } from './api.config'

class AdminService {
    constructor() {
        this.api = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json'
            }
        })

        // 设置请求拦截器，统一处理认证信息
        this.api.interceptors.request.use(
            config => {
                const token = localStorage.getItem('token')
                if (token) {
                    config.headers['Authorization'] = `Bearer ${token}`
                }
                return config
            },
            error => {
                console.error('Request interceptor error:', error)
                return Promise.reject(error)
            }
        )

        // 设置响应拦截器，统一处理响应数据
        this.api.interceptors.response.use(
            response => {
                // 如果响应中包含data字段，则返回data
                return response.data || response
            },
            error => {
                // 统一处理错误响应
                const errorResponse = {
                    success: false,
                    error: this.formatErrorMessage(error),
                    status: error.response?.status
                }
                console.error('API Error:', errorResponse)
                return Promise.reject(errorResponse)
            }
        )
    }

    // 格式化错误消息
    formatErrorMessage(error) {
        if (error.response?.data?.message) {
            return error.response.data.message
        }
        if (error.response?.data?.error) {
            return error.response.data.error
        }
        if (error.message) {
            return error.message
        }
        return '系統發生錯誤'
    }

    // 验证响应数据
    validateResponse(response) {
        if (!response || typeof response !== 'object') {
            throw new Error('無效的響應數據格式')
        }
        return response
    }

    // 检查身份认证
    checkAuthentication() {
        const token = localStorage.getItem('token')
        if (!token) {
            throw new Error('未登入')
        }
        return token
    }

    // API状态检查
    async checkApiStatus() {
        try {
            const response = await this.api.get('/api/system/status')
            return {
                success: true,
                data: this.validateResponse(response)
            }
        } catch (error) {
            console.error('API status check failed:', error)
            return {
                success: false,
                error: error.error || '無法連接到伺服器'
            }
        }
    }

    async getDashboardData() {
        try {
            // 移除多餘的/api前綴
            const response = await this.api.get('/system/dashboard', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            // 添加數據驗證
            if (!response?.data) {
                throw new Error('無效的響應數據')
            }

            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            console.error('獲取儀表板數據失敗:', error)
            return {
                success: false,
                error: error.response?.data?.message || '系統錯誤'
            }
        }
    }


    // 格式化仪表板数据
    formatDashboardData(data) {
        return {
            totalUsers: Number(data.totalUsers) || 0,
            newUsers: Number(data.newUsers) || 0,
            totalStores: Number(data.totalStores) || 0,
            newStores: Number(data.newStores) || 0,
            activeMovies: Number(data.activeMovies) || 0,
            newMovies: Number(data.newMovies) || 0,
            userRoleDistribution: this.formatDistributionData(data.userRoleDistribution),
            storeCategoryDistribution: this.formatDistributionData(data.storeCategoryDistribution),
            movieGenreDistribution: this.formatDistributionData(data.movieGenreDistribution),
            recentActivities: Array.isArray(data.recentActivities) ? data.recentActivities : []
        }
    }

    // 格式化分布数据
    formatDistributionData(data) {
        if (!data || typeof data !== 'object') {
            return {}
        }
        return Object.entries(data).reduce((acc, [key, value]) => {
            acc[key] = Number(value) || 0
            return acc
        }, {})
    }

    // 获取用户分析数据
    async getUserAnalytics() {
        try {
            this.checkAuthentication()
            const response = await this.api.get('/api/system/analytics/users')
            return {
                success: true,
                data: this.validateResponse(response)
            }
        } catch (error) {
            return {
                success: false,
                error: error.error || '獲取用戶分析數據失敗'
            }
        }
    }

    // 获取商店分析数据
    async getStoreAnalytics() {
        try {
            this.checkAuthentication()
            const response = await this.api.get('/api/system/analytics/stores')
            return {
                success: true,
                data: this.validateResponse(response)
            }
        } catch (error) {
            return {
                success: false,
                error: error.error || '獲取商店分析數據失敗'
            }
        }
    }

    // 获取电影分析数据
    async getMovieAnalytics() {
        try {
            this.checkAuthentication()
            const response = await this.api.get('/api/system/analytics/movies')
            return {
                success: true,
                data: this.validateResponse(response)
            }
        } catch (error) {
            return {
                success: false,
                error: error.error || '獲取電影分析數據失敗'
            }
        }
    }

    // 获取最近活动数据
    async getRecentActivity() {
        try {
            this.checkAuthentication()
            const response = await this.api.get('/api/system/activity/recent')
            return {
                success: true,
                data: this.validateResponse(response)
            }
        } catch (error) {
            return {
                success: false,
                error: error.error || '獲取最近活動數據失敗'
            }
        }
    }

    // 导出报表
    async exportReport(reportType, dateRange) {
        try {
            this.checkAuthentication()
            const response = await this.api.post('/api/system/reports/export',
                {
                    type: reportType,
                    startDate: dateRange.start,
                    endDate: dateRange.end
                },
                {
                    responseType: 'blob'
                }
            )
            return {
                success: true,
                data: response
            }
        } catch (error) {
            return {
                success: false,
                error: error.error || '匯出報表失敗'
            }
        }
    }

    // Dashboard数据获取的包装方法
    async fetchDashboardData({ commit }) {
        commit('SET_LOADING', true)
        try {
            const response = await adminService.getDashboardData()
            if (!response.success) {
                throw new Error(response.error || '獲取數據失敗')
            }

            const { data } = response
            commit('SET_DASHBOARD_STATS', data)

            if (data.userRoleDistribution) {
                commit('SET_USER_DATA', data.userRoleDistribution)
            }

            if (data.storeCategoryDistribution) {
                commit('SET_STORE_DATA', data.storeCategoryDistribution)
            }

            return response
        } catch (error) {
            commit('SET_ERROR', error.message)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    }
}

export default new AdminService()
