<template>
  <div class="city-movie">
    <h1 class="title">CityMovie 電影資訊</h1>
    <div class="movie-list">
      <div v-for="movie in movies" :key="movie.id" class="movie-card">
        <img
            :src="movie.poster"
            :alt="movie.title"
            class="movie-poster"
        />
        <h2 class="movie-title">{{ movie.title }}</h2>
        <p class="movie-description">{{ movie.description }}</p>
        <button @click="showBooking(movie)" class="movie-button">立即訂票</button>
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
                   @click="toggleSeat(row, num)"
                   :class="[
                     'seat-box d-flex align-items-center justify-content-center border rounded',
                     getSeatStatus(row, num) === 'selected' ? 'bg-primary text-white' :
                     getSeatStatus(row, num) === 'occupied' ? 'bg-secondary text-white' : 'bg-light'
                   ]">
                {{ row }} {{ num }}
              </div>
            </div>
          </div>

          <!-- 已選座位 -->
          <div class="mt-4">
            <h6>已選擇的座位：</h6>
            <div class="d-flex flex-wrap gap-2 mb-3">
              <span v-for="seat in selectedSeats" :key="seat.id"
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

// 電影資料
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
  }
])

// 座位相關
const rows = Array.from({ length: 10 }, (_, i) => String.fromCharCode(65 + i))
const selectedSeats = ref([])
const showBookingSection = ref(false)
const selectedMovie = ref(null)

// 顯示訂票區域
const showBooking = (movie) => {
  selectedMovie.value = movie
  showBookingSection.value = true
  // 滾動到訂票區域
  setTimeout(() => {
    const bookingSection = document.querySelector('.booking-section')
    bookingSection?.scrollIntoView({ behavior: 'smooth' })
  }, 100)
}

// 取消訂票
const cancelBooking = () => {
  showBookingSection.value = false
  selectedSeats.value = []
  selectedMovie.value = null
}

// 選擇座位
const toggleSeat = (row, num) => {
  const seatNumber = `${row} ${num}`
  const seatInfo = {
    id: `${row}-${num}`,
    seatNumber,
    row,
    num
  }

  const existingIndex = selectedSeats.value.findIndex(s => s.seatNumber === seatNumber)
  if (existingIndex === -1) {
    selectedSeats.value.push(seatInfo)
  } else {
    selectedSeats.value.splice(existingIndex, 1)
  }
}

// 獲取座位狀態
const getSeatStatus = (row, num) => {
  const seatNumber = `${row} ${num}`

  const isSelected = selectedSeats.value.some(s => s.seatNumber === seatNumber)
  if (isSelected) return 'selected'

  const isOccupied = false
  if (isOccupied) return 'occupied'

  return 'available'
}

// 確認訂位
const confirmBooking = () => {
  if (selectedSeats.value.length === 0) {
    alert('請選擇座位')
    return
  }

  console.log('訂位資訊：', {
    movieId: selectedMovie.value.id,
    movieTitle: selectedMovie.value.title,
    seats: selectedSeats.value
  })

  alert('訂位成功！')
  selectedSeats.value = []
  showBookingSection.value = false
  selectedMovie.value = null
}
</script>

<style scoped>
.city-movie {
  padding: 20px;
  text-align: center;
}

.title {
  font-size: 2rem;
  color: #BA0043;
  margin-bottom: 2rem;
}

.movie-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
}

.movie-card {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 10px;
  width: 250px;
  text-align: center;
  padding: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.movie-poster {
  width: 200px;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.movie-poster:hover {
  transform: scale(1.05);
}

.movie-title {
  font-size: 1.5rem;
  color: #333;
  margin: 10px 0;
}

.movie-description {
  color: #777;
  font-size: 1rem;
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