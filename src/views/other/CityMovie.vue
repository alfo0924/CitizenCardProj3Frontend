<!-- MoviePage.vue -->
<!-- MoviePage.vue template section -->
<template>
  <div class="movie-page">
    <!-- 用於防止內容被頂部導覽列遮擋的間隔 -->
    <div class="nav-spacer"></div>

  <div class="page-wrapper">
    <!-- 固定標題 -->
    <header class="fixed-header">
      <h1 class="title">CityMovie 電影資訊</h1>
    </header>

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
              <img :src="selectedMovie.poster" :alt="selectedMovie.title" class="main-poster"/>
              <h2 class="movie-title">{{ selectedMovie.title }}</h2>
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
<!-- MoviePage.vue script section -->
<script setup>
import { ref, reactive } from 'vue'

const movies = reactive([
  {
    id: 1,
    title: "電影 光影都市",
    description: "《光影都市》是一部描繪未來城市生活的冒險電影。" +
        "故事發生在一個高度發達、科技融入生活每一個角落的大都市中。" +
        "主人公是一名年輕的工程師，他在城市的數位脈絡中穿梭，發現了一個隱藏的秘密網絡，這個網絡有著改變世界的潛力。" +
        "在這個科技與人類情感交織的世界裡，主人公必須做出抉擇，是讓科技繼續主導一切，還是重新掌握人類的命運。",
    poster: "/images/movienight.jpg",
    showtimes: [
      {
        date: "2024 年 12 月 21 日 星期四",
        times: ["14:00", "17:00", "20:00"]
      },
      {
        date: "2024 年 12 月 22 日 星期五",
        times: ["13:00", "16:00", "19:00"]
      }
    ]
  },
  {
    id: 2,
    title: "電影 美味人生",
    description: "《美味人生》是一部溫馨的美食電影，講述了一名年輕廚師的成長故事。" +
        "主人公來自一個有著悠久烹飪傳統的家庭，但他總是覺得自己的廚藝不夠好，無法得到父母的認可。" +
        "當他決定開設自己的餐廳時，他遭遇了各種挑戰，但也在過程中發現了料理的真正意義——它不僅是滋養身體的食物，更是一種能夠傳遞情感和故事的藝術。" +
        "隨著時間的推移，他的餐廳成為了大家族和社區的聚集點，無論是家庭聚餐還是朋友間的聚會，都離不開他精心準備的每一道菜。",
    poster: "/images/moviefood.jpeg",
    showtimes: [
      {
        date: "2024 年 12 月 21 日 星期四",
        times: ["14:00", "17:00", "20:00"]
      },
      {
        date: "2024 年 12 月 22 日 星期五",
        times: ["13:00", "16:00", "19:00"]
      }
    ]
  },
  {
    id: 3,
    title: "電影 海洋的守護者",
    description: "《海洋的守護者》是一部關於海洋保護和生態平衡的感人電影。" +
        "故事圍繞一名年輕的環保活動家，她決心拯救濒臨破壞的珊瑚礁和海洋生物。" +
        "電影中，她與一群志同道合的科學家、志願者及當地居民合作，努力抵抗非法捕魚、污染和氣候變遷對海洋造成的威脅。" +
        "隨著他們的努力，社區漸漸意識到保護海洋生態的重要性，並開始採取可持續發展的方式來利用海洋資源。",
    poster: "/images/moviesea.jpg",
    showtimes: [
      {
        date: "2024 年 12 月 21 日 星期四",
        times: ["14:00", "17:00", "20:00"]
      },
      {
        date: "2024 年 12 月 22 日 星期五",
        times: ["13:00", "16:00", "19:00"]
      }
    ]
  }
])

const rows = Array.from({ length: 10 }, (_, i) => String.fromCharCode(65 + i))
const movieSeats = reactive({})
const showBookingSection = ref(false)
const selectedMovie = ref(movies[0])
const selectedShowtime = ref({
  date: '',
  time: ''
})

const selectMovie = (movie) => {
  selectedMovie.value = movie
  selectedShowtime.value = { date: '', time: '' }
  showBookingSection.value = false
}

const selectShowtime = (date, time) => {
  selectedShowtime.value = { date, time }
}

const showBooking = (movie) => {
  if (!selectedShowtime.value.time) {
    alert('請選擇觀影場次')
    return
  }
  selectedMovie.value = movie
  showBookingSection.value = true

  // 滾動到訂票區域
  setTimeout(() => {
    const bookingSection = document.querySelector('.booking-section')
    bookingSection?.scrollIntoView({ behavior: 'smooth' })
  }, 100)
}

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

const cancelBooking = () => {
  showBookingSection.value = false
  selectedShowtime.value = { date: '', time: '' }
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
    showtime: selectedShowtime.value,
    seats: movieSeats[currentMovieId]
  })

  alert('訂位成功！')
  movieSeats[currentMovieId] = []
  selectedShowtime.value = { date: '', time: '' }
  showBookingSection.value = false
}
</script>

<style scoped>
.movie-page {
  padding-top: 0px; /* 為頂部導航欄預留空間 */
  //min-height: 100vh;
  background: #f5f5f5;
}

.page-wrapper {
  min-height: auto;
  background: #f5f5f5;
}

.fixed-header {
  //position: fixed;
  top: 160px; /* 更新這個值，讓它在導航欄下方 */
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
  margin: 0;
}

.content-wrapper {
  display: flex;
  margin-top: 0;
  min-height: calc(100vh - 200px);
}

.fixed-sidebar {
  position: fixed;
  top: 240px; /* 160px (導航欄) + 80px (header) */
  left: 0;
  width: 240px;
  height: calc(100vh - 240px);
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
  margin-left: 240px;
  position: relative;
  padding: 0;  /* 移除所有padding */
  margin-top: -1rem; /* 確保上方沒有額外間距 */
  background-color:#f8f9fa;
}

.scroll-container {
  padding: 0;
  min-height: auto;
}

.sticky-section {
  position: sticky;
  top: 240px; /* 與 fixed-sidebar 相同 */
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.movie-details {
  padding: 24px;
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

.seats-container {
  max-width: 100%;
  overflow-x: auto;
  padding: 20px 0;
}

.seat-row {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 8px;
}

.seat {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s ease;
}

.seat.available {
  background: #ffffff;
  border: 1px solid #dee2e6;
}

.seat.selected {
  background: #BA0043;
  color: white;
  border: 1px solid #BA0043;
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

/* 響應式設計 */
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
    padding-top: 120px;
  }

  .fixed-header {
    top: 120px;
  }

  .fixed-sidebar {
    position: static;
    width: 100%;
    height: auto;
    margin-top: 0;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }

  .main-content {
    margin-left: 0;
  }

  .sticky-section {
    position: static;
    top: 60px;
  }

  .movie-details {
    padding: 16px;
  }

  .main-poster {
    height: 300px;
  }

  .time-slots {
    gap: 8px;
  }

  .time-slot {
    padding: 6px 12px;
    font-size: 0.9rem;
  }

  .seat {
    width: 32px;
    height: 32px;
    font-size: 0.7rem;
  }
}
</style>
