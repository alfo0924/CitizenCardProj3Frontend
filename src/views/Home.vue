<template>
  <div class="home">
    <!-- 輪播區塊 -->
    <div class="carousel-section mb-4">
      <div id="mainCarousel" class="carousel slide" data-bs-ride="carousel">
        <div class="carousel-indicators">
          <button v-for="(slide, index) in featuredMovies"
                  :key="'indicator-' + index"
                  type="button"
                  :data-bs-target="'#mainCarousel'"
                  :data-bs-slide-to="index"
                  :class="{ active: index === 0 }"
                  :aria-current="index === 0"
                  :aria-label="'Slide ' + (index + 1)">
          </button>
        </div>

        <div class="carousel-inner">
          <div v-for="(movie, index) in featuredMovies"
               :key="'slide-' + index"
               class="carousel-item"
               :class="{ active: index === 0 }">
            <img :src="movie.bannerUrl" class="d-block w-100" :alt="movie.movieName">
            <div class="carousel-caption">
              <h3>{{ movie.movieName }}</h3>
              <p>{{ movie.shortDescription }}</p>
              <router-link
                  :to="'/movies/' + movie.movieId"
                  class="btn btn-primary"
              >
                立即訂票
              </router-link>
            </div>
          </div>
        </div>

        <button class="carousel-control-prev" type="button" data-bs-target="#mainCarousel" data-bs-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#mainCarousel" data-bs-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
      </div>
    </div>

    <!-- 熱映中電影 -->
    <section class="now-showing mb-5">
      <div class="container">
        <h2 class="section-title mb-4">
          <i class="fas fa-film"></i> 熱映中
        </h2>
        <div class="row row-cols-1 row-cols-md-4 g-4">
          <div v-for="movie in nowShowingMovies"
               :key="movie.movieId"
               class="col">
            <MovieCard :movie="movie" />
          </div>
        </div>
        <div class="text-center mt-4">
          <router-link to="/movies" class="btn btn-outline-primary">
            查看更多電影
          </router-link>
        </div>
      </div>
    </section>

    <!-- 優惠專區 -->
    <section class="discounts-section mb-5 bg-light py-5">
      <div class="container">
        <h2 class="section-title mb-4">
          <i class="fas fa-tags"></i> 優惠專區
        </h2>
        <div class="row">
          <div v-for="discount in activeDiscounts"
               :key="discount.discountId"
               class="col-md-6 col-lg-4 mb-4">
            <div class="discount-card">
              <div class="discount-content">
                <h3>{{ discount.discountName }}</h3>
                <p>{{ discount.description }}</p>
                <div class="discount-validity">
                  有效期限：{{ formatDate(discount.validUntil) }}
                </div>
                <button
                    class="btn btn-outline-primary mt-3"
                    @click="showDiscountDetails(discount)"
                >
                  查看詳情
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 會員專區 -->
    <section class="member-section mb-5" v-if="isLoggedIn">
      <div class="container">
        <h2 class="section-title mb-4">
          <i class="fas fa-user-circle"></i> 會員專區
        </h2>
        <div class="row">
          <!-- 電子錢包 -->
          <div class="col-md-4 mb-4">
            <div class="info-card">
              <h3>電子錢包</h3>
              <div class="balance">
                餘額：NT$ {{ formatNumber(walletBalance) }}
              </div>
              <router-link to="/wallet" class="btn btn-primary mt-3">
                儲值/查看明細
              </router-link>
            </div>
          </div>

          <!-- 最近訂單 -->
          <div class="col-md-4 mb-4">
            <div class="info-card">
              <h3>最近訂單</h3>
              <div v-if="recentBookings.length > 0">
                <div v-for="booking in recentBookings"
                     :key="booking.bookingId"
                     class="booking-item">
                  <div>{{ booking.movieName }}</div>
                  <small>{{ formatDate(booking.showTime) }}</small>
                </div>
              </div>
              <div v-else class="text-muted">
                尚無訂票紀錄
              </div>
              <router-link to="/bookings" class="btn btn-primary mt-3">
                查看所有訂單
              </router-link>
            </div>
          </div>

          <!-- 可用優惠 -->
          <div class="col-md-4 mb-4">
            <div class="info-card">
              <h3>可用優惠</h3>
              <div v-if="availableDiscounts.length > 0">
                <div v-for="discount in availableDiscounts"
                     :key="discount.discountId"
                     class="discount-item">
                  {{ discount.discountName }}
                </div>
              </div>
              <div v-else class="text-muted">
                目前無可用優惠
              </div>
              <router-link to="/discounts" class="btn btn-primary mt-3">
                查看所有優惠
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import MovieCard from '@/components/movie/MovieCard.vue'

export default {
  name: 'Home',

  components: {
    MovieCard
  },

  setup() {
    const store = useStore()

    // 資料狀態
    const featuredMovies = ref([])
    const nowShowingMovies = ref([])
    const activeDiscounts = ref([])
    const recentBookings = ref([])
    const availableDiscounts = ref([])

    // 計算屬性
    const isLoggedIn = computed(() => store.getters['auth/isLoggedIn'])
    const walletBalance = computed(() => store.state.wallet.balance)

    // 方法
    const fetchFeaturedMovies = async () => {
      try {
        const response = await store.dispatch('movie/fetchFeaturedMovies')
        featuredMovies.value = response.data
      } catch (error) {
        console.error('Error fetching featured movies:', error)
      }
    }

    const fetchNowShowingMovies = async () => {
      try {
        const response = await store.dispatch('movie/fetchNowShowingMovies')
        nowShowingMovies.value = response.data
      } catch (error) {
        console.error('Error fetching now showing movies:', error)
      }
    }

    const fetchActiveDiscounts = async () => {
      try {
        const response = await store.dispatch('discount/fetchActiveDiscounts')
        activeDiscounts.value = response.data
      } catch (error) {
        console.error('Error fetching active discounts:', error)
      }
    }

    const fetchMemberData = async () => {
      if (isLoggedIn.value) {
        try {
          // 獲取最近訂單
          const bookingsResponse = await store.dispatch('booking/fetchRecentBookings')
          recentBookings.value = bookingsResponse.data

          // 獲取可用優惠
          const discountsResponse = await store.dispatch('discount/fetchAvailableDiscounts')
          availableDiscounts.value = discountsResponse.data

          // 更新錢包餘額
          await store.dispatch('wallet/fetchBalance')
        } catch (error) {
          console.error('Error fetching member data:', error)
        }
      }
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('zh-TW')
    }

    const formatNumber = (number) => {
      return number.toLocaleString('zh-TW')
    }

    const showDiscountDetails = (discount) => {
      // 實作優惠詳情顯示邏輯
    }

    // 生命週期鉤子
    onMounted(async () => {
      await Promise.all([
        fetchFeaturedMovies(),
        fetchNowShowingMovies(),
        fetchActiveDiscounts(),
        fetchMemberData()
      ])
    })

    return {
      featuredMovies,
      nowShowingMovies,
      activeDiscounts,
      recentBookings,
      availableDiscounts,
      isLoggedIn,
      walletBalance,
      formatDate,
      formatNumber,
      showDiscountDetails
    }
  }
}
</script>

<style scoped>
.home {
  padding-top: 60px;
}

.carousel-section {
  margin-top: -60px;
}

.carousel-item {
  height: 500px;
}

.carousel-item img {
  object-fit: cover;
  height: 100%;
}

.carousel-caption {
  background: rgba(0, 0, 0, 0.5);
  padding: 2rem;
  border-radius: var(--border-radius-lg);
}

.section-title {
  color: var(--text-color);
  font-weight: 600;
  margin-bottom: 2rem;
}

.section-title i {
  color: var(--primary-color);
  margin-right: 0.5rem;
}

.discount-card {
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
  padding: 1.5rem;
  height: 100%;
  transition: transform 0.3s ease;
}

.discount-card:hover {
  transform: translateY(-5px);
}

.discount-validity {
  color: var(--text-light);
  font-size: 0.875rem;
  margin-top: 1rem;
}

.info-card {
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
  padding: 1.5rem;
  height: 100%;
}

.info-card h3 {
  color: var(--primary-color);
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.balance {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--success-color);
}

.booking-item,
.discount-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
}

.booking-item:last-child,
.discount-item:last-child {
  border-bottom: none;
}

@media (max-width: 768px) {
  .carousel-item {
    height: 300px;
  }

  .carousel-caption {
    padding: 1rem;
  }

  .carousel-caption h3 {
    font-size: 1.25rem;
  }
}
</style>