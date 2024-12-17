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

        this.api.interceptors.response.use(
            response => response.data,
            error => {
                const errorMessage = error.response?.data?.message || error.message || '系統發生錯誤'
                // eslint-disable-next-line prefer-promise-reject-errors
                return Promise.reject({
                    success: false,
                    error: errorMessage,
                    status: error.response?.status
                })
            }
        )
    }

    async checkApiStatus() {
        try {
            const response = await this.api.get('/system/status')
            return {
                success: true,
                data: response
            }
        } catch (error) {
            console.error('API status check failed:', error)
            return {
                success: false,
                error: error.message || '無法連接到伺服器'
            }
        }
    }

    async getDashboardData() {
        try {
            const response = await this.api.get('/api/system/dashboard')
            if (!response || typeof response !== 'object') {
                throw new Error('無效的響應數據格式')
            }
            return this.formatDashboardData(response)
        } catch (error) {
            console.error('Dashboard data fetch failed:', error)
            return {
                success: false,
                error: error.message || '獲取儀表板數據失敗'
            }
        }
    }

    formatDashboardData(data) {
        const formattedData = {
            stats: {
                totalUsers: data.totalUsers || 0,
                newUsers: data.newUsers || 0,
                totalStores: data.totalStores || 0,
                newStores: data.newStores || 0,
                activeMovies: data.activeMovies || 0,
                newMovies: data.newMovies || 0
            },
            userRoleDistribution: data.userRoleDistribution || {},
            storeCategoryDistribution: data.storeCategoryDistribution || {},
            movieGenreDistribution: data.movieGenreDistribution || {},
            recentActivities: data.recentActivities || []
        }
        return {
            success: true,
            data: formattedData
        }
    }

    async getUserAnalytics() {
        try {
            const response = await this.api.get('/api/system/analytics/users')
            return {
                success: true,
                data: response
            }
        } catch (error) {
            return {
                success: false,
                error: error.message || '獲取用戶分析數據失敗'
            }
        }
    }

    async getStoreAnalytics() {
        try {
            const response = await this.api.get('/api/system/analytics/stores')
            return {
                success: true,
                data: response
            }
        } catch (error) {
            return {
                success: false,
                error: error.message || '獲取商店分析數據失敗'
            }
        }
    }

    async getMovieAnalytics() {
        try {
            const response = await this.api.get('/api/system/analytics/movies')
            return {
                success: true,
                data: response
            }
        } catch (error) {
            return {
                success: false,
                error: error.message || '獲取電影分析數據失敗'
            }
        }
    }

    async getRecentActivity() {
        try {
            const response = await this.api.get('/api/system/activity/recent')
            return {
                success: true,
                data: response
            }
        } catch (error) {
            return {
                success: false,
                error: error.message || '獲取最近活動數據失敗'
            }
        }
    }

    async fetchDashboardData() {
        try {
            const dashboardData = await this.getDashboardData()
            if (!dashboardData.success) {
                throw new Error(dashboardData.error)
            }
            return dashboardData
        } catch (error) {
            console.error('Dashboard data fetch failed:', error)
            return {
                success: false,
                error: error.message || '獲取儀表板數據失敗'
            }
        }
    }

    async exportReport(reportType, dateRange) {
        try {
            const response = await this.api.post('/api/system/reports/export', {
                type: reportType,
                startDate: dateRange.start,
                endDate: dateRange.end
            }, {
                responseType: 'blob'
            })
            return {
                success: true,
                data: response
            }
        } catch (error) {
            return {
                success: false,
                error: error.message || '匯出報表失敗'
            }
        }
    }
}

export default new AdminService()
