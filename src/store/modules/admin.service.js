import axios from 'axios'
import { API_URL } from './api.config'

class AdminService {
    // 檢查API狀態
    async checkApiStatus() {
        try {
            const response = await axios.get(`${API_URL}/admin/status`)
            return response.data
        } catch (error) {
            console.error('API status check failed:', error)
            return { success: false }
        }
    }

    // 獲取儀表板統計數據
    async getDashboardStats() {
        try {
            const response = await axios.get(`${API_URL}/admin/dashboard/stats`)
            return response.data
        } catch (error) {
            throw new Error('Failed to fetch dashboard stats')
        }
    }

    // 獲取會員分析數據
    async getUserAnalytics() {
        try {
            const response = await axios.get(`${API_URL}/admin/analytics/users`)
            return response.data
        } catch (error) {
            throw new Error('Failed to fetch user analytics')
        }
    }

    // 獲取商店分析數據
    async getStoreAnalytics() {
        try {
            const response = await axios.get(`${API_URL}/admin/analytics/stores`)
            return response.data
        } catch (error) {
            throw new Error('Failed to fetch store analytics')
        }
    }

    // 獲取電影分析數據
    async getMovieAnalytics() {
        try {
            const response = await axios.get(`${API_URL}/admin/analytics/movies`)
            return response.data
        } catch (error) {
            throw new Error('Failed to fetch movie analytics')
        }
    }

    // 獲取最近活動數據
    async getRecentActivity() {
        try {
            const response = await axios.get(`${API_URL}/admin/activity/recent`)
            return response.data
        } catch (error) {
            throw new Error('Failed to fetch recent activity')
        }
    }

    // 獲取系統性能指標
    async getSystemMetrics() {
        try {
            const response = await axios.get(`${API_URL}/admin/system/metrics`)
            return response.data
        } catch (error) {
            throw new Error('Failed to fetch system metrics')
        }
    }

    // 獲取完整儀表板數據
    async fetchDashboardData() {
        try {
            const [stats, userAnalytics, storeAnalytics] = await Promise.all([
                this.getDashboardStats(),
                this.getUserAnalytics(),
                this.getStoreAnalytics()
            ])

            return {
                success: true,
                stats: {
                    totalUsers: stats.totalUsers,
                    newUsers: stats.newUsers,
                    totalStores: stats.totalStores,
                    newStores: stats.newStores,
                    activeMovies: stats.activeMovies,
                    newMovies: stats.newMovies
                },
                userData: {
                    labels: userAnalytics.labels,
                    data: userAnalytics.data
                },
                storeData: {
                    labels: storeAnalytics.labels,
                    data: storeAnalytics.data
                }
            }
        } catch (error) {
            console.error('Dashboard data fetch failed:', error)
            return {
                success: false,
                message: error.message
            }
        }
    }

    // 導出報表
    async exportReport(reportType, dateRange) {
        try {
            const response = await axios.post(`${API_URL}/admin/reports/export`, {
                type: reportType,
                startDate: dateRange.start,
                endDate: dateRange.end
            }, {
                responseType: 'blob'
            })
            return response.data
        } catch (error) {
            throw new Error('Failed to export report')
        }
    }
}

export default new AdminService()
