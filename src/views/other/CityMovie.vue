<!-- MoviePage.vue -->
<template>
  <div class="movie-page">
    <div class="nav-spacer"></div>
    <div class="page-wrapper">
      <div class="content-wrapper">
        <!-- 固定左側選單 -->
        <aside class="fixed-sidebar">
          <div class="movie-list">
            <div v-for="movie in movies"
                 :key="movie.id"
                 :class="['movie-item', { active: selectedMovie.id === movie.id }]"
                 @click="selectMovie(movie)">
              {{ movie.title }}
            </div>
          </div>
        </aside>

        <!-- 右側內容區域 -->
        <main class="main-content">
          <!-- 滾動固定區域 -->
          <div class="scroll-container">
            <div class="sticky-section">
              <div class="movie-details">
                <h1 class="title">CityMovie 電影資訊</h1>
                <img :src="selectedMovie.poster_url" :alt="selectedMovie.title" class="main-poster"/>
                <h2 class="movie-title">{{ selectedMovie.title }}</h2>

                <!-- 電影資訊區塊 -->
                <div class="movie-info">
                  <p><strong>導演：</strong>{{ selectedMovie.director }}</p>
                  <p><strong>演員：</strong>{{ selectedMovie.cast }}</p>
                  <p><strong>片長：</strong>{{ selectedMovie.duration }} 分鐘</p>
                  <p><strong>類型：</strong>{{ selectedMovie.genre }}</p>
                </div>

                <p class="movie-description">{{ selectedMovie.description }}</p>

                <div class="showtimes">
                  <div v-for="schedule in selectedMovie.showtimes" :key="schedule.date">
                    <div class="date-header">{{ schedule.date }}</div>
                    <div class="time-slots">
                      <button v-for="time in schedule.times"
                              :key="`${schedule.date}-${time}`"
                              :class="['time-slot', {
                                active: selectedShowtime.date === schedule.date &&
                                       selectedShowtime.time === time
                              }]"
                              @click="selectShowtime(schedule.date, time)">
                        {{ time }}
                        <span class="seat-icon">🪑</span>
                      </button>
                    </div>
                  </div>
                </div>

                <button @click="showBooking(selectedMovie)" class="movie-button">立即訂票</button>
              </div>
            </div>
          </div>

          <!-- 座位選擇區域 -->
          <div v-if="showBookingSection" class="booking-section">
            <div class="booking-content">
              <h2 class="booking-title">{{ selectedMovie.title }} - 座位選擇</h2>
              <div class="showtime-info">
                選擇場次：{{ selectedShowtime.date }} {{ selectedShowtime.time }}
              </div>

              <div class="screen">
                <div class="screen-label">螢幕位置</div>
              </div>

              <div class="seat-legend">
                <div class="legend-item">
                  <div class="legend-box available"></div>
                  <span>可選擇</span>
                </div>
                <div class="legend-item">
                  <div class="legend-box selected"></div>
                  <span>已選擇</span>
                </div>
                <div class="legend-item">
                  <div class="legend-box occupied"></div>
                  <span>已訂位</span>
                </div>
              </div>

              <div class="seats-container">
                <div v-for="row in rows" :key="row" class="seat-row">
                  <div v-for="num in 20"
                       :key="`${row}${num}`"
                       @click="toggleSeat(selectedMovie.id, row, num)"
                       :class="[
                         'seat',
                         getSeatStatus(selectedMovie.id, row, num)
                       ]">
                    {{ row }}{{ num }}
                  </div>
                </div>
              </div>

              <div class="selected-seats">
                <h3>已選擇的座位：</h3>
                <div class="selected-seats-list">
                  <span v-for="seat in getSelectedSeatsForMovie(selectedMovie.id)"
                        :key="seat.id"
                        class="selected-seat-tag">
                    {{ seat.seatNumber }}
                  </span>
                </div>
              </div>

              <div class="booking-actions">
                <button @click="confirmBooking" class="confirm-button">確認訂位</button>
                <button @click="cancelBooking" class="cancel-button">取消</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

const movies = ref([])
const showBookingSection = ref(false)
const selectedMovie = ref(null)
const selectedShowtime = ref({
  date: '',
  time: ''
})

// 座位相關
const rows = Array.from({ length: 10 }, (_, i) => String.fromCharCode(65 + i))
const movieSeats = reactive({})

// 獲取電影資料
const fetchMovies = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/movies/now-showing')
    const data = await response.json()

    const processedMovies = data.content
        .sort((a, b) => a.id - b.id)
        .map(movie => ({
          ...movie,
          showtimes: [
            {
              date: "2024 年 12 月 21 日 星期六",
              times: ["14:00", "17:00", "20:00"]
            },
            {
              date: "2024 年 12 月 22 日 星期日",
              times: ["13:00", "16:00", "19:00"]
            }
          ]
        }))

    movies.value = processedMovies
    selectedMovie.value = processedMovies[0]
  } catch (error) {
    console.error('Error fetching movies:', error)
  }
}

// 元件掛載時獲取資料
onMounted(() => {
  fetchMovies()
})

// 選擇電影
const selectMovie = (movie) => {
  selectedMovie.value = movie
  selectedShowtime.value = { date: '', time: '' }
  showBookingSection.value = false

  // 找到標題元素
  const titleElement = document.querySelector('.movie-details .title')

  if (titleElement) {
    setTimeout(() => {
      titleElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })

      // 補償固定導航欄的高度
      window.scrollBy({
        top: -500, // 根據實際導航欄高度調整
        behavior: 'smooth'
      })
    }, 100)
  }
}

// 選擇場次
const selectShowtime = (date, time) => {
  selectedShowtime.value = { date, time }
}

// 顯示訂票區域
const showBooking = (movie) => {
  if (!selectedShowtime.value.time) {
    alert('請選擇觀影場次')
    return
  }
  selectedMovie.value = movie
  showBookingSection.value = true

  setTimeout(() => {
    const bookingSection = document.querySelector('.booking-section')
    bookingSection?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }, 100)
}

// 座位相關函數
const toggleSeat = (movieId, row, num) => {
  const seatNumber = `${row}${num}`
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
  const seatNumber = `${row}${num}`
  if (!movieSeats[movieId]) {
    return 'available'
  }
  return movieSeats[movieId].some(s => s.seatNumber === seatNumber) ? 'selected' : 'available'
}

// 取消訂票
const cancelBooking = () => {
  showBookingSection.value = false
  selectedShowtime.value = { date: '', time: '' }

  // 滾動回電影資訊
  const titleElement = document.querySelector('.movie-details .title')
  if (titleElement) {
    setTimeout(() => {
      titleElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })

      // 補償固定導航欄的高度
      window.scrollBy({
        top: -500,
        behavior: 'smooth'
      })
    }, 100)
  }
}

// 確認訂票
const confirmBooking = () => {
  const currentMovieId = selectedMovie.value.id
  if (!movieSeats[currentMovieId] || movieSeats[currentMovieId].length === 0) {
    alert('請選擇座位')
    return
  }

  // 顯示訂位資訊
  console.log('訂位資訊：', {
    movieId: currentMovieId,
    movieTitle: selectedMovie.value.title,
    showtime: selectedShowtime.value,
    seats: movieSeats[currentMovieId]
  })

  // 訂位成功處理
  alert('訂位成功！')
  movieSeats[currentMovieId] = []
  selectedShowtime.value = { date: '', time: '' }
  showBookingSection.value = false

  // 滾動回電影資訊
  const titleElement = document.querySelector('.movie-details .title')
  if (titleElement) {
    setTimeout(() => {
      titleElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })

      // 補償固定導航欄的高度
      window.scrollBy({
        top: -500,
        behavior: 'smooth'
      })
    }, 100)
  }
}
</script>

<style scoped>
.movie-page {
  padding-top: 0;
  background-color: white;
}

.page-wrapper {
  min-height: auto;
  background: #ffffff;
}

.fixed-header {
  position: fixed;
  top: 80px;
  left: 0;
  right: 0;
  height: 80px;
  background: #ffffff;
  z-index: 1000;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title {
  font-size: 2rem;
  color: #BA0043;
  text-align: center;
  margin: 0 0 30px 0;
}

.content-wrapper {
  display: flex;
  margin-top: 0;
  min-height: calc(100vh - 200px);
}

.fixed-sidebar {
  position: fixed;
  top: 160px;
  left: 0;
  width: 240px;
  height: calc(100vh - 160px);
  overflow-y: auto;
  background: #ffffff;
  padding: 20px;
  border-right: 1px solid #e0e0e0;
}

.movie-list {
  padding: 10px;
}

.movie-item {
  padding: 12px 16px;
  margin-bottom: 8px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.movie-item:hover {
  background-color: #f0f0f0;
}

.movie-item.active {
  background-color: #BA0043;
  color: white;
}

.main-content {
  flex: 1;
  margin: 150px 0 0 240px;
  position: relative;
  padding: 0;
  background-color: #ffffff;
}

.scroll-container {
  padding: 0;
  min-height: auto;
  background-color: #ffffff;
}

.sticky-section {
  position: sticky;
  top: 160px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.movie-details {
  padding: 12px 24px 24px;
}

.main-poster {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 24px;
}

.movie-title {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 16px;
}

.movie-description {
  color: #666;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 24px;
}

.movie-info {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.movie-info p {
  margin: 8px 0;
  color: #495057;
}

.movie-info strong {
  color: #333;
  margin-right: 8px;
}

.showtimes {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.date-header {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 16px;
  font-weight: 500;
  text-align: center;
}

.time-slots {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-bottom: 20px;
}

.time-slot {
  padding: 8px 16px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.time-slot:hover {
  background: #f0f0f0;
}

.time-slot.active {
  background-color: #BA0043;
  color: white;
  border-color: #BA0043;
}

.movie-button {
  width: 100%;
  max-width: 300px;
  padding: 12px 24px;
  background-color: #BA0043;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0 auto;
  display: block;
}

.movie-button:hover {
  background-color: #a00039;
  transform: translateY(-2px);
}

/* 座位選擇區域樣式 */
.booking-section {
  padding: 20px;
  margin-top: -20px;
  background-color: white;
  margin-bottom: var(--footer-height);
}

.booking-content {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.booking-title {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 24px;
  text-align: center;
}

.showtime-info {
  text-align: center;
  font-size: 1.1rem;
  color: #495057;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 24px;
}

.screen {
  width: 80%;
  margin: 0 auto 40px;
  text-align: center;
}

.screen-label {
  background: #e9ecef;
  padding: 12px;
  border-radius: 4px;
  font-size: 1rem;
  color: #495057;
}

.seat-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 24px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-box {
  width: 24px;
  height: 24px;
  border-radius: 4px;
}

.legend-box.available {
  background: #ffffff;
  border: 1px solid #dee2e6;
}

.legend-box.selected {
  background: #BA0043;
}

.legend-box.occupied {
  background: #6c757d;
}

/* 更新的座位容器與座位樣式 */
.seats-container {
  max-width: 100%;
  overflow-x: auto;
  padding: 20px 0;
  -webkit-overflow-scrolling: touch;
}

.seat-row {
  display: flex;
  gap: 6px;
  justify-content: flex-start;
  margin-bottom: 6px;
  padding: 0 20px;
  min-width: max-content;
}

.seat {
  width: 46px;
  min-width: 46px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  padding: 0 2px;
  border: 1px solid #dee2e6;
  letter-spacing: -0.2px;
  user-select: none;
}

.seat.available {
  background: #ffffff;
}

.seat.selected {
  background: #BA0043;
  color: white;
  border-color: #BA0043;
}

.seat.occupied {
  background: #6c757d;
  color: white;
  cursor: not-allowed;
}

.selected-seats {
  margin-top: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.selected-seats h3 {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 12px;
}

.selected-seats-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.selected-seat-tag {
  background: #BA0043;
  color: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 0.9rem;
}

.booking-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 24px;
}

.confirm-button,
.cancel-button {
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.confirm-button {
  background-color: #BA0043;
  color: white;
  border: none;
}

.confirm-button:hover {
  background-color: #a00039;
  transform: translateY(-2px);
}

.cancel-button {
  background-color: #6c757d;
  color: white;
  border: none;
}

.cancel-button:hover {
  background-color: #5a6268;
  transform: translateY(-2px);
}

/* RWD 響應式設計 */
@media (max-width: 1024px) {
  .fixed-sidebar {
    width: 200px;
  }

  .main-content {
    margin-left: 200px;
  }
}

@media (max-width: 768px) {
  .movie-page {
    padding-top: 80px;
  }

  .content-wrapper {
    flex-direction: column;
    padding-top: 60px;
  }

  .fixed-header {
    top: 60px;
  }

  .fixed-sidebar {
    position: relative;
    width: 100%;
    height: auto;
    top: 0;
    padding: 10px;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
    background: #fff;
    z-index: 10;
  }

  .movie-list {
    display: flex;
    overflow-x: auto;
    padding: 5px;
    gap: 10px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .movie-list::-webkit-scrollbar {
    display: none;
  }

  .movie-item {
    flex: 0 0 auto;
    min-width: 120px;
    padding: 10px 15px;
    margin-bottom: 0;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    border-radius: 20px;
  }

  .main-content {
    margin-left: 0;
    width: 100%;
    margin-top: 20px;
    margin-bottom: var(--footer-height);
  }

  .sticky-section {
    position: relative;
    top: 0;
    margin-top: 0;
  }

  .movie-details {
    padding: 15px;
  }

  .title {
    margin-top: 0;
  }

  .main-poster {
    height: 250px;
  }

  .time-slots {
    gap: 8px;
  }

  .date-header {
    margin-left: 0;
    text-align: center;
  }

  .time-slot {
    padding: 8px 12px;
    font-size: 0.9rem;
  }

  .booking-section {
    padding: 15px;
    margin-top: 0;
  }

  /* 座位相關響應式調整 */
  .seats-container {
    padding: 10px 0;
  }

  .seat-row {
    gap: 4px;
    margin-bottom: 4px;
    padding: 0 10px;
  }

  .seat {
    width: 46px;
    min-width: 46px;
    height: 36px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .movie-page {
    padding-top: 70px;
  }

  .content-wrapper {
    padding-top: 50px;
  }

  .title {
    font-size: 1.5rem;
  }

  .movie-item {
    min-width: 100px;
    padding: 8px 12px;
    font-size: 0.9rem;
  }

  .movie-title {
    font-size: 1.3rem;
  }

  .main-poster {
    height: 200px;
  }

  .time-slot {
    padding: 6px 10px;
    font-size: 0.85rem;
  }

  .main-content {
    margin-top: 15px;
  }

  .booking-content {
    padding: 15px;
  }
}

@media (max-width: 320px) {
  .movie-item {
    min-width: 90px;
    padding: 6px 10px;
    font-size: 0.85rem;
  }

  .time-slot {
    padding: 4px 8px;
    font-size: 0.8rem;
  }

  .seat-row {
    padding: 0 5px;
  }

  .seat {
    width: 46px;
    min-width: 46px;
    height: 36px;
    font-size: 14px;
  }
}
</style>