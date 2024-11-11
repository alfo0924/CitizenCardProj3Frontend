<template>
  <div class="home">
    <!-- 輪播區塊 -->
    <div class="carousel-section mb-4">
      <div id="mainCarousel" class="carousel slide" data-bs-ride="carousel">
        <div class="carousel-indicators">
          <button
              v-for="(slide, index) in featuredMovies"
              :key="'indicator-' + index"
              type="button"
              :data-bs-target="'#mainCarousel'"
              :data-bs-slide-to="index"
              :class="{ active: index === 0 }"
              :aria-current="index === 0"
              :aria-label="'Slide ' + (index + 1)"
          ></button>
        </div>
        <div class="carousel-inner">
          <div
              v-for="(movie, index) in featuredMovies"
              :key="'slide-' + index"
              class="carousel-item"
              :class="{ active: index === 0 }"
          >
            <img
                :src="movie.bannerUrl"
                class="d-block w-100"
                :alt="movie.movieName"
            >
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
        <button
            class="carousel-control-prev"
            type="button"
            data-bs-target="#mainCarousel"
            data-bs-slide="prev"
        >
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button
            class="carousel-control-next"
            type="button"
            data-bs-target="#mainCarousel"
            data-bs-slide="next"
        >
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
          <div
              v-for="movie in nowShowingMovies"
              :key="movie.movieId"
              class="col"
          >
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

    <!-- 特惠商店區塊 -->
    <section class="featured-stores mb-5 bg-light py-5">
      <div class="container">
        <h2 class="section-title mb-4">
          <i class="fas fa-store"></i> 特惠商店
        </h2>
        <div class="row row-cols-1 row-cols-md-3 g-4">
          <div
              v-for="store in featuredStores"
              :key="store.id"
              class="col"
          >
            <store-card :store="store" />
          </div>
        </div>
        <div class="text-center mt-4">
          <router-link to="/stores" class="btn btn-outline-primary">
            查看更多商店
          </router-link>
        </div>
      </div>
    </section>

    <!-- 優惠活動區塊 -->
    <section class="promotions mb-5">
      <div class="container">
        <h2 class="section-title mb-4">
          <i class="fas fa-percentage"></i> 優惠活動
        </h2>
        <div class="row row-cols-1 row-cols-md-3 g-4">
          <div
              v-for="promotion in activePromotions"
              :key="promotion.id"
              class="col"
          >
            <promotion-card :promotion="promotion" />
          </div>
        </div>
        <div class="text-center mt-4">
          <router-link to="/promotions" class="btn btn-outline-primary">
            查看更多活動
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
          <div
              v-for="discount in activeDiscounts"
              :key="discount.discountId"
              class="col-md-6 col-lg-4 mb-4"
          >
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
                <div
                    v-for="booking in recentBookings"
                    :key="booking.bookingId"
                    class="booking-item"
                >
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
                <div
                    v-for="discount in availableDiscounts"
                    :key="discount.discountId"
                    class="discount-item"
                >
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
import { useRouter } from 'vue-router'
import MovieCard from '@/components/movie/MovieCard.vue'
import StoreCard from '@/components/store/StoreCard.vue'
import PromotionCard from '@/components/promotion/PromotionCard.vue'

export default {
  name: 'Home',

  components: {
    MovieCard,
    StoreCard,
    PromotionCard
  },

  setup() {
    const store = useStore()
    const router = useRouter()

    // 資料狀態
    const featuredMovies = ref([])
    const nowShowingMovies = ref([])
    const featuredStores = ref([])
    const activePromotions = ref([])
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
        store.dispatch('setNotification', {
          type: 'error',
          message: '載入精選電影失敗'
        })
      }
    }

    const fetchNowShowingMovies = async () => {
      try {
        const response = await store.dispatch('movie/fetchNowShowingMovies')
        nowShowingMovies.value = response.data
      } catch (error) {
        console.error('Error fetching now showing movies:', error)
        store.dispatch('setNotification', {
          type: 'error',
          message: '載入熱映電影失敗'
        })
      }
    }

    const fetchFeaturedStores = async () => {
      try {
        const response = await store.dispatch('store/fetchFeaturedStores')
        featuredStores.value = response.data
      } catch (error) {
        console.error('Error fetching featured stores:', error)
        store.dispatch('setNotification', {
          type: 'error',
          message: '載入特惠商店失敗'
        })
      }
    }

    const fetchActivePromotions = async () => {
      try {
        const response = await store.dispatch('promotion/fetchActivePromotions')
        activePromotions.value = response.data
      } catch (error) {
        console.error('Error fetching active promotions:', error)
        store.dispatch('setNotification', {
          type: 'error',
          message: '載入優惠活動失敗'
        })
      }
    }

    const fetchActiveDiscounts = async () => {
      try {
        const response = await store.dispatch('discount/fetchActiveDiscounts')
        activeDiscounts.value = response.data
      } catch (error) {
        console.error('Error fetching active discounts:', error)
        store.dispatch('setNotification', {
          type: 'error',
          message: '載入優惠專區失敗'
        })
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
          store.dispatch('setNotification', {
            type: 'error',
            message: '載入會員資料失敗'
          })
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
      store.commit('discount/setCurrentDiscount', discount)
      router.push(`/discounts/${discount.discountId}`)
    }

    // 生命週期鉤子
    onMounted(async () => {
      store.dispatch('setLoading', true)
      try {
        await Promise.all([
          fetchFeaturedMovies(),
          fetchNowShowingMovies(),
          fetchFeaturedStores(),
          fetchActivePromotions(),
          fetchActiveDiscounts(),
          fetchMemberData()
        ])
      } finally {
        store.dispatch('setLoading', false)
      }
    })

    return {
      featuredMovies,
      nowShowingMovies,
      featuredStores,
      activePromotions,
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
  min-height: 100vh;
  background-color: var(--bg-light);
}

.carousel-section {
  margin-bottom: 2rem;
}

.carousel-item {
  height: 500px;
}

.carousel-item img {
  object-fit: cover;
  height: 100%;
  width: 100%;
}

.carousel-caption {
  background: rgba(0, 0, 0, 0.6);
  padding: 2rem;
  border-radius: 8px;
  max-width: 600px;
  margin: 0 auto;
  backdrop-filter: blur(4px);
}

.section-title {
  color: var(--text-color);
  font-weight: 600;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title i {
  color: var(--primary-color);
}

section {
  padding: 4rem 0;
}

section:nth-child(even) {
  background-color: white;
}

.featured-stores,
.promotions {
  padding: 4rem 0;
}

.discount-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 1.5rem;
  height: 100%;
  transition: transform 0.3s ease;
}

.discount-card:hover {
  transform: translateY(-5px);
}

.discount-validity {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin-top: 1rem;
}

.info-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
  color: var(--success);
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

  section {
    padding: 2rem 0;
  }

  .featured-stores,
  .promotions {
    padding: 2rem 0;
  }
}
</style>
