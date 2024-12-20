import axios from 'axios'

// 初始狀態
const state = {
    movies: [],
    currentMovie: null,
    schedules: [],
    reviews: [],
    categories: [],
    totalPages: 0,
    isLoading: false,
    error: null
}

// getters
const getters = {
    allMovies: state => state.movies,
    currentMovie: state => state.currentMovie,
    movieSchedules: state => state.schedules,
    movieReviews: state => state.reviews,
    movieCategories: state => state.categories,
    totalPages: state => state.totalPages,
    isLoading: state => state.isLoading,
    error: state => state.error,

    // 依狀態過濾電影
    showingMovies: state =>
      state.movies.filter(movie => movie.status === 'SHOWING'),

    comingMovies: state =>
      state.movies.filter(movie => movie.status === 'COMING'),

    // 依分類過濾電影
    moviesByCategory: state => categoryId =>
      state.movies.filter(movie => movie.categoryId === categoryId)
}

// actions
const actions = {
    // 清理數據
    clearMovieData({ commit }) {
        commit('SET_MOVIES', [])
        commit('SET_CURRENT_MOVIE', null)
        commit('SET_SCHEDULES', [])
        commit('SET_REVIEWS', [])
        commit('SET_ERROR', null)
    },

    // 獲取電影列表
    async fetchMovies({ commit }, params) {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')

        try {
            const response = await axios.get('/api/movies', {
                params: {
                    ...params,
                    size: params.size || 12
                }
            })

            // 只保存必要的數據
            const movies = response.data.content.map(movie => ({
                id: movie.id,
                title: movie.title,
                posterUrl: movie.posterUrl,
                category: movie.category,
                status: movie.status,
                rating: movie.rating,
                price: movie.price,
                duration: movie.duration,
                releaseDate: movie.releaseDate
            }))

            commit('SET_MOVIES', movies)
            commit('SET_TOTAL_PAGES', response.data.totalPages || 0)
        } catch (error) {
            console.error('Error fetching movies:', error)
            commit('SET_ERROR', '載入電影列表失敗')
            commit('SET_MOVIES', [])
            commit('SET_TOTAL_PAGES', 0)
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 獲取電影詳情
    async fetchMovieDetail({ commit }, movieId) {
        console.log('Fetching movie detail:', movieId)
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')

        try {
            const response = await axios.get(`/api/movies/${movieId}`)
            console.log('Movie detail response:', response.data)
            commit('SET_CURRENT_MOVIE', response.data)
        } catch (error) {
            console.error('Error fetching movie detail:', {
                error,
                movieId,
                message: error.message,
                response: error.response?.data
            })
            commit('SET_ERROR', '載入電影詳情失敗')
            commit('SET_CURRENT_MOVIE', null)
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 獲取電影場次
    async fetchMovieSchedules({ commit }, movieId) {
        commit('CLEAR_ERROR')

        try {
            const response = await axios.get(`/api/movies/${movieId}/schedules`)
            commit('SET_SCHEDULES', response.data || [])
        } catch (error) {
            console.error('Error fetching schedules:', error)
            commit('SET_ERROR', '載入場次資訊失敗')
            commit('SET_SCHEDULES', [])
        }
    },

    // 獲取電影評論
    async fetchMovieReviews({ commit }, movieId) {
        commit('CLEAR_ERROR')

        try {
            const response = await axios.get(`/api/movies/${movieId}/reviews`)
            commit('SET_REVIEWS', response.data || [])
        } catch (error) {
            console.error('Error fetching reviews:', error)
            commit('SET_ERROR', '載入評論失敗')
            commit('SET_REVIEWS', [])
        }
    },

    // 獲取電影分類
    async fetchCategories({ commit }) {
        commit('CLEAR_ERROR')

        try {
            const response = await axios.get('/api/movies/categories')
            commit('SET_CATEGORIES', response.data || [])
        } catch (error) {
            console.error('Error fetching categories:', error)
            commit('SET_ERROR', '載入分類失敗')
            commit('SET_CATEGORIES', [])
        }
    },

    // 提交評論
    async submitReview({ commit }, { movieId, rating, comment }) {
        commit('CLEAR_ERROR')

        try {
            const response = await axios.post(`/api/movies/${movieId}/reviews`, {
                rating,
                comment
            })
            return response.data
        } catch (error) {
            console.error('Error submitting review:', error)
            commit('SET_ERROR', '提交評論失敗')
            throw error
        }
    },

    // 搜索電影
    async searchMovies({ commit }, keyword) {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')

        try {
            const response = await axios.get('/api/movies/search', {
                params: { keyword }
            })
            commit('SET_MOVIES', response.data.content || [])
            commit('SET_TOTAL_PAGES', response.data.totalPages || 0)
        } catch (error) {
            console.error('Error searching movies:', error)
            commit('SET_ERROR', '搜索電影失敗')
            commit('SET_MOVIES', [])
            commit('SET_TOTAL_PAGES', 0)
        } finally {
            commit('SET_LOADING', false)
        }
    }
}

// mutations
const mutations = {
    SET_MOVIES(state, movies) {
        state.movies = movies
    },

    SET_CURRENT_MOVIE(state, movie) {
        state.currentMovie = movie
    },

    SET_SCHEDULES(state, schedules) {
        state.schedules = schedules
    },

    SET_REVIEWS(state, reviews) {
        state.reviews = reviews
    },

    SET_CATEGORIES(state, categories) {
        state.categories = categories
    },

    SET_TOTAL_PAGES(state, totalPages) {
        state.totalPages = totalPages
    },

    SET_LOADING(state, status) {
        state.isLoading = status
    },

    SET_ERROR(state, error) {
        state.error = error
    },

    CLEAR_ERROR(state) {
        state.error = null
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
