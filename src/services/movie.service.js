// services/movie.service.js
import api from './api.config'

class MovieService {
    // 獲取電影列表
    async getMovies(params) {
        try {
            const response = await api.get('/movies', { params })
            return response
        } catch (error) {
            throw error
        }
    }

    // 獲取電影詳情
    async getMovieById(movieId) {
        try {
            const response = await api.get(`/movies/${movieId}`)
            return response
        } catch (error) {
            throw error
        }
    }

    // 獲取電影場次
    async getMovieSchedules(movieId) {
        try {
            const response = await api.get(`/movies/${movieId}/schedules`)
            return response
        } catch (error) {
            throw error
        }
    }

    // 獲取場次座位
    async getScheduleSeats(scheduleId) {
        try {
            const response = await api.get(`/schedules/${scheduleId}/seats`)
            return response
        } catch (error) {
            throw error
        }
    }

    // 獲取電影分類
    async getCategories() {
        try {
            const response = await api.get('/movies/categories')
            return response
        } catch (error) {
            throw error
        }
    }

    // 搜索電影
    async searchMovies(keyword) {
        try {
            const response = await api.get('/movies/search', {
                params: { keyword }
            })
            return response
        } catch (error) {
            throw error
        }
    }

    // 獲取電影評論
    async getMovieReviews(movieId, params) {
        try {
            const response = await api.get(`/movies/${movieId}/reviews`, { params })
            return response
        } catch (error) {
            throw error
        }
    }

    // 提交電影評論
    async submitReview(movieId, reviewData) {
        try {
            const response = await api.post(`/movies/${movieId}/reviews`, reviewData)
            return response
        } catch (error) {
            throw error
        }
    }

    // 獲取熱映電影
    async getNowShowingMovies() {
        try {
            const response = await api.get('/movies', {
                params: { status: 'SHOWING' }
            })
            return response
        } catch (error) {
            throw error
        }
    }

    // 獲取即將上映電影
    async getComingMovies() {
        try {
            const response = await api.get('/movies', {
                params: { status: 'COMING' }
            })
            return response
        } catch (error) {
            throw error
        }
    }

    // 檢查座位可用性
    async checkSeatAvailability(scheduleId, seatNumber) {
        try {
            const response = await api.get(`/schedules/${scheduleId}/seats/${seatNumber}`)
            return response
        } catch (error) {
            throw error
        }
    }

    // 預訂座位
    async bookSeat(scheduleId, seatData) {
        try {
            const response = await api.post(`/schedules/${scheduleId}/bookings`, seatData)
            return response
        } catch (error) {
            throw error
        }
    }

    // 取消訂位
    async cancelBooking(bookingId) {
        try {
            const response = await api.delete(`/bookings/${bookingId}`)
            return response
        } catch (error) {
            throw error
        }
    }

    // 獲取用戶訂位記錄
    async getUserBookings(params) {
        try {
            const response = await api.get('/user/bookings', { params })
            return response
        } catch (error) {
            throw error
        }
    }

    // 獲取訂位詳情
    async getBookingDetails(bookingId) {
        try {
            const response = await api.get(`/bookings/${bookingId}`)
            return response
        } catch (error) {
            throw error
        }
    }

    // 計算訂票價格
    async calculateTicketPrice(scheduleId, seatCount, discountCode = null) {
        try {
            const response = await api.post(`/schedules/${scheduleId}/calculate-price`, {
                seatCount,
                discountCode
            })
            return response
        } catch (error) {
            throw error
        }
    }
}

export default new MovieService()