<template>
  <div class="movie-container">
    <h1 class="title">CityMovie 電影資訊</h1>

    <div class="main-content">
      <!-- 左側大圖和詳情 -->
      <div class="movie-details">
        <img :src="selectedMovie.poster" :alt="selectedMovie.title" class="main-poster"/>
        <h2 class="movie-title">{{ selectedMovie.title }}</h2>
        <p class="movie-description">{{ selectedMovie.description }}</p>
        <button @click="showBooking(selectedMovie)" class="movie-button">立即訂票</button>
      </div>

      <!-- 右側電影列表 -->
      <div class="movie-list">
        <div
            v-for="movie in movies"
            :key="movie.id"
            :class="['movie-item', { active: selectedMovie.id === movie.id }]"
            @click="selectMovie(movie)"
        >
          {{ movie.title }}
        </div>
      </div>
    </div>

    <!-- 座位選擇區域 -->
    <div v-if="showBookingSection" class="booking-section container py-4">
      <h2 class="booking-title">{{ selectedMovie.title }} - 座位選擇</h2>
      <div class="card">
        <div class="card-body">
          <!-- 螢幕 -->
          <div class="text-center mb-4">
            <div class="bg-light mx-auto p-2 rounded" style="width: 80%;">
              螢幕位置
            </div>
          </div>

          <!-- 座位說明 -->
          <div class="d-flex justify-content-center gap-3 mb-4">
            <div class="d-flex align-items-center">
              <div class="seat-legend bg-light border me-2"></div>
              <small>可選擇</small>
            </div>
            <div class="d-flex align-items-center">
              <div class="seat-legend bg-primary me-2"></div>
              <small>已選擇</small>
            </div>
            <div class="d-flex align-items-center">
              <div class="seat-legend bg-secondary me-2"></div>
              <small>已訂位</small>
            </div>
          </div>

          <!-- 座位區域 -->
          <div class="overflow-auto">
            <div v-for="row in rows" :key="row" class="d-flex mb-2 gap-2">
              <div v-for="num in 20" :key="`${row}${num}`"
                   @click="toggleSeat(selectedMovie.id, row, num)"
                   :class="[
                     'seat-box d-flex align-items-center justify-content-center border rounded',
                     getSeatStatus(selectedMovie.id, row, num) === 'selected' ? 'bg-primary text-white' :
                     getSeatStatus(selectedMovie.id, row, num) === 'occupied' ? 'bg-secondary text-white' : 'bg-light'
                   ]">
                {{ row }} {{ num }}
              </div>
            </div>
          </div>

          <!-- 已選座位 -->
          <div class="mt-4">
            <h6>已選擇的座位：</h6>
            <div class="d-flex flex-wrap gap-2 mb-3">
              <span v-for="seat in getSelectedSeatsForMovie(selectedMovie.id)" :key="seat.id"
                    class="badge bg-primary">
                {{ seat.seatNumber }}
              </span>
            </div>
            <div class="d-flex gap-2">
              <button @click="confirmBooking" class="btn btn-primary">
                確認訂位
              </button>
              <button @click="cancelBooking" class="btn btn-secondary">
                取消
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const movies = reactive([
  {
    id: 1,
    title: "電影 A",
    description: "精彩的動作片。",
    poster: "/images/movienight.jpg"
  },
  {
    id: 2,
    title: "電影 B",
    description: "感人的愛情故事。",
    poster: "/images/movienight.jpg"
  },
  {
    id: 3,
    title: "電影 C",
    description: "驚悚冒險片。",
    poster: "/images/movienight.jpg"
  }
])

const rows = Array.from({ length: 10 }, (_, i) => String.fromCharCode(65 + i))
const movieSeats = reactive({})
const showBookingSection = ref(false)
const selectedMovie = ref(movies[0])

const selectMovie = (movie) => {
  selectedMovie.value = movie
}

const showBooking = (movie) => {
  selectedMovie.value = movie
  showBookingSection.value = true
  if (!movieSeats[movie.id]) {
    movieSeats[movie.id] = []
  }
  setTimeout(() => {
    const bookingSection = document.querySelector('.booking-section')
    bookingSection?.scrollIntoView({ behavior: 'smooth' })
  }, 100)
}

const toggleSeat = (movieId, row, num) => {
  const seatNumber = `${row} ${num}`
  const seatInfo = {
    id: `${row}-${num}`,
    seatNumber,
    row,
    num
  }

  if (!movieSeats[movieId]) {
    movieSeats[movieId] = []
  }

  const existingIndex = movieSeats[movieId].findIndex(s => s.seatNumber === seatNumber)
  if (existingIndex === -1) {
    movieSeats[movieId].push(seatInfo)
  } else {
    movieSeats[movieId].splice(existingIndex, 1)
  }
}

const getSelectedSeatsForMovie = (movieId) => {
  return movieSeats[movieId] || []
}

const getSeatStatus = (movieId, row, num) => {
  const seatNumber = `${row} ${num}`

  if (!movieSeats[movieId]) {
    return 'available'
  }

  const isSelected = movieSeats[movieId].some(s => s.seatNumber === seatNumber)
  if (isSelected) return 'selected'

  return 'available'
}

const cancelBooking = () => {
  showBookingSection.value = false
}

const confirmBooking = () => {
  const currentMovieId = selectedMovie.value.id
  if (!movieSeats[currentMovieId] || movieSeats[currentMovieId].length === 0) {
    alert('請選擇座位')
    return
  }

  console.log('訂位資訊：', {
    movieId: currentMovieId,
    movieTitle: selectedMovie.value.title,
    seats: movieSeats[currentMovieId]
  })

  alert('訂位成功！')
  movieSeats[currentMovieId] = []
  showBookingSection.value = false
}
</script>

<style scoped>
.movie-container {
  padding: 20px;
}

.title {
  font-size: 2rem;
  color: #BA0043;
  margin-bottom: 2rem;
  text-align: center;
}

.main-content {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.movie-details {
  flex: 1;
  padding: 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
}

.main-poster {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 20px;
}

.movie-list {
  width: 200px;
  background: #f5f5f5;
  padding: 15px;
  border-radius: 10px;
}

.movie-item {
  padding: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.movie-item:hover {
  background-color: #e0e0e0;
}

.movie-item.active {
  background-color: #BA0043;
  color: white;
}

.movie-title {
  font-size: 1.5rem;
  color: #333;
  margin: 10px 0;
}

.movie-description {
  color: #777;
  font-size: 1rem;
  margin-bottom: 20px;
}

.movie-button {
  background-color: #BA0043;
  color: #fff;
  border: none;
  padding: 10px 20px;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.movie-button:hover {
  background-color: #a00000;
}

.booking-section {
  margin-top: 30px;
}

.booking-title {
  color: #333;
  margin-bottom: 20px;
}

.seat-box {
  width: 4rem;
  height: 2.5rem;
  cursor: pointer;
}

.seat-box:hover {
  background-color: #e9ecef !important;
}

.seat-legend {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 0.25rem;
}

.gap-2 {
  gap: 0.5rem !important;
}

.gap-3 {
  gap: 1rem !important;
}
</style>