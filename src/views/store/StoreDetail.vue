<template>
  <div class="store-detail">
    <!-- 載入中提示 -->
    <loading-spinner v-if="loading" />

    <!-- 錯誤提示 -->
    <alert-message
        v-if="error"
        :message="error"
        type="danger"
        @close="error = ''"
    />

    <template v-if="!loading && !error && store">
      <!-- 商店主要資訊區 -->
      <div class="store-header">
        <div class="container">
          <div class="row align-items-center">
            <!-- 商店圖片輪播 -->
            <div class="col-md-6">
              <div class="store-images">
                <div id="storeCarousel" class="carousel slide" data-bs-ride="carousel">
                  <div class="carousel-inner">
                    <div
                        v-for="(image, index) in store.images"
                        :key="index"
                        class="carousel-item"
                        :class="{ active: index === 0 }"
                    >
                      <img
                          :src="image.url"
                          :alt="store.name"
                          class="d-block w-100"
                          @error="handleImageError"
                      >
                    </div>
                  </div>
                  <button class="carousel-control-prev" type="button" data-bs-target="#storeCarousel" data-bs-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Previous</span>
                  </button>
                  <button class="carousel-control-next" type="button" data-bs-target="#storeCarousel" data-bs-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Next</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- 商店基本資訊 -->
            <div class="col-md-6">
              <div class="store-info p-4">
                <div class="d-flex justify-content-between align-items-start mb-3">
                  <h1 class="store-name mb-0">{{ store.name }}</h1>
                  <button
                      class="btn btn-outline-primary favorite-btn"
                      @click="toggleFavorite"
                  >
                    <i :class="['bi', isFavorite ? 'bi-heart-fill' : 'bi-heart']"></i>
                  </button>
                </div>

                <!-- 商店評分 -->
                <div class="store-rating mb-3">
                  <div class="stars">
                    <i
                        v-for="n in 5"
                        :key="n"
                        class="bi"
                        :class="getStarClass(n)"
                    ></i>
                  </div>
                  <span class="rating-text">{{ store.rating }} ({{ store.reviewCount }}則評價)</span>
                </div>

                <!-- 商店標籤 -->
                <div class="store-tags mb-3">
                  <span
                      v-for="tag in store.tags"
                      :key="tag.id"
                      class="badge bg-secondary me-2"
                  >
                    {{ tag.name }}
                  </span>
                </div>

                <!-- 營業資訊 -->
                <div class="store-status mb-3">
                  <span
                      :class="['badge', getStatusClass]"
                  >
                    {{ store.status }}
                  </span>
                  <span class="ms-2">{{ store.businessHours }}</span>
                </div>

                <!-- 聯絡資訊 -->
                <div class="contact-info">
                  <p class="mb-2">
                    <i class="bi bi-geo-alt-fill"></i>
                    {{ store.address }}
                    <button
                        class="btn btn-link btn-sm text-decoration-none"
                        @click="copyAddress"
                    >
                      複製
                    </button>
                  </p>
                  <p class="mb-2">
                    <i class="bi bi-telephone-fill"></i>
                    <a :href="`tel:${store.phone}`">{{ store.phone }}</a>
                  </p>
                  <p class="mb-2" v-if="store.website">
                    <i class="bi bi-globe"></i>
                    <a :href="store.website" target="_blank" rel="noopener">
                      官方網站
                    </a>
                  </p>
                </div>

                <!-- 功能按鈕 -->
                <div class="action-buttons mt-4">
                  <button
                      class="btn btn-primary me-2"
                      @click="getDirections"
                  >
                    <i class="bi bi-map"></i> 導航前往
                  </button>
                  <button
                      class="btn btn-outline-primary"
                      @click="shareStore"
                  >
                    <i class="bi bi-share"></i> 分享
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 商店詳細內容區 -->
      <div class="store-content container py-5">
        <div class="row">
          <div class="col-md-8">
            <!-- 優惠資訊 -->
            <section class="store-discounts mb-5" v-if="store.discounts.length">
              <h3 class="section-title">優惠活動</h3>
              <div class="discount-list">
                <div
                    v-for="discount in store.discounts"
                    :key="discount.id"
                    class="discount-item card mb-3"
                >
                  <div class="card-body">
                    <h5 class="card-title">{{ discount.title }}</h5>
                    <p class="card-text">{{ discount.description }}</p>
                    <div class="discount-meta">
                      <span class="text-muted">
                        <i class="bi bi-calendar3"></i>
                        {{ formatDate(discount.startDate) }} - {{ formatDate(discount.endDate) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <!-- 商店介紹 -->
            <section class="store-description mb-5">
              <h3 class="section-title">商店介紹</h3>
              <div class="description-content">
                {{ store.description }}
              </div>
            </section>

            <!-- 設施服務 -->
            <section class="store-facilities mb-5" v-if="store.facilities.length">
              <h3 class="section-title">設施服務</h3>
              <div class="facilities-list">
                <div class="row">
                  <div
                      v-for="facility in store.facilities"
                      :key="facility.id"
                      class="col-6 col-md-4 mb-3"
                  >
                    <div class="facility-item">
                      <i :class="facility.icon"></i>
                      {{ facility.name }}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <!-- 顧客評價 -->
            <section class="store-reviews">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h3 class="section-title mb-0">顧客評價</h3>
                <button
                    class="btn btn-primary"
                    @click="showReviewModal"
                    v-if="canReview"
                >
                  撰寫評價
                </button>
              </div>

              <!-- 評價列表 -->
              <div class="review-list">
                <div
                    v-for="review in store.reviews"
                    :key="review.id"
                    class="review-item card mb-3"
                >
                  <div class="card-body">
                    <div class="review-header d-flex justify-content-between">
                      <div class="reviewer-info">
                        <img
                            :src="review.userAvatar"
                            :alt="review.userName"
                            class="reviewer-avatar"
                        >
                        <span class="reviewer-name">{{ review.userName }}</span>
                      </div>
                      <div class="review-rating">
                        <i
                            v-for="n in 5"
                            :key="n"
                            class="bi"
                            :class="getReviewStarClass(review.rating, n)"
                        ></i>
                      </div>
                    </div>
                    <p class="review-content mt-3">{{ review.content }}</p>
                    <div class="review-meta text-muted">
                      <small>{{ formatDate(review.createdAt) }}</small>
                    </div>
                  </div>
                </div>

                <!-- 載入更多評價 -->
                <div class="text-center mt-4" v-if="hasMoreReviews">
                  <button
                      class="btn btn-outline-primary"
                      @click="loadMoreReviews"
                      :disabled="loadingReviews"
                  >
                    {{ loadingReviews ? '載入中...' : '載入更多評價' }}
                  </button>
                </div>
              </div>
            </section>
          </div>

          <!-- 側邊資訊欄 -->
          <div class="col-md-4">
            <!-- 地圖位置 -->
            <div class="store-map card mb-4">
              <div class="card-body p-0">
                <div ref="miniMap" class="mini-map"></div>
              </div>
            </div>

            <!-- 營業時間 -->
            <div class="business-hours card mb-4">
              <div class="card-body">
                <h5 class="card-title">營業時間</h5>
                <ul class="list-unstyled">
                  <li
                      v-for="(hours, day) in store.businessHoursDetail"
                      :key="day"
                      class="d-flex justify-content-between"
                      :class="{ 'text-primary': isCurrentDay(day) }"
                  >
                    <span>{{ day }}</span>
                    <span>{{ hours }}</span>
                  </li>
                </ul>
              </div>
            </div>

            <!-- 交通資訊 -->
            <div class="transportation card mb-4" v-if="store.transportation">
              <div class="card-body">
                <h5 class="card-title">交通資訊</h5>
                <div v-html="store.transportation"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 撰寫評價 Modal -->
    <div
        class="modal fade"
        id="reviewModal"
        tabindex="-1"
        aria-labelledby="reviewModalLabel"
        aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="reviewModalLabel">撰寫評價</h5>
            <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitReview">
              <!-- 評分 -->
              <div class="mb-3">
                <label class="form-label">評分</label>
                <div class="rating-input">
                  <i
                      v-for="n in 5"
                      :key="n"
                      class="bi"
                      :class="getInputStarClass(n)"
                      @click="setRating(n)"
                      style="cursor: pointer"
                  ></i>
                </div>
              </div>

              <!-- 評價內容 -->
              <div class="mb-3">
                <label for="reviewContent" class="form-label">評價內容</label>
                <textarea
                    id="reviewContent"
                    v-model="newReview.content"
                    class="form-control"
                    rows="4"
                    required
                ></textarea>
              </div>

              <div class="text-end">
                <button
                    type="button"
                    class="btn btn-secondary me-2"
                    data-bs-dismiss="modal"
                >
                  取消
                </button>
                <button
                    type="submit"
                    class="btn btn-primary"
                    :disabled="submitting"
                >
                  {{ submitting ? '提交中...' : '提交評價' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import AlertMessage from '@/components/common/AlertMessage.vue';
import { Modal } from 'bootstrap';
import { formatDate } from '@/utils/helpers';

export default {
  name: 'StoreDetail',

  components: {
    LoadingSpinner,
    AlertMessage
  },

  data() {
    return {
      store: null,
      loading: true,
      error: '',
      isFavorite: false,
      reviewModal: null,
      miniMap: null,
      miniMapMarker: null,
      loadingReviews: false,
      submitting: false,
      currentPage: 1,
      hasMoreReviews: true,
      newReview: {
        rating: 0,
        content: ''
      }
    };
  },

  computed: {
    storeId() {
      return this.$route.params.id;
    },

    canReview() {
      return this.$store.getters['auth/isAuthenticated'];
    },

    getStatusClass() {
      const statusMap = {
        'open': 'bg-success',
        'closed': 'bg-danger',
        'break': 'bg-warning',
        'coming': 'bg-info'
      };
      return statusMap[this.store?.status.toLowerCase()] || 'bg-secondary';
    }
  },

  methods: {
    async fetchStoreDetails() {
      this.loading = true;
      this.error = '';
      try {
        const response = await this.$store.dispatch('store/fetchStoreDetails', this.storeId);
        this.store = response.data;
        this.initializeMiniMap();
      } catch (error) {
        console.error('Error fetching store details:', error);
        this.error = '載入商店資料失敗，請稍後再試';
      } finally {
        this.loading = false;
      }
    },

    async checkFavoriteStatus() {
      if (this.$store.getters['auth/isAuthenticated']) {
        try {
          const response = await this.$store.dispatch(
              'store/checkFavoriteStatus',
              this.storeId
          );
          this.isFavorite = response.data.isFavorite;
        } catch (error) {
          console.error('Error checking favorite status:', error);
        }
      }
    },

    async toggleFavorite() {
      if (!this.$store.getters['auth/isAuthenticated']) {
        this.$router.push({ name: 'login' });
        return;
      }

      try {
        await this.$store.dispatch('store/toggleFavorite', {
          storeId: this.storeId,
          isFavorite: !this.isFavorite
        });
        this.isFavorite = !this.isFavorite;
        this.store.favoriteCount += this.isFavorite ? 1 : -1;
      } catch (error) {
        console.error('Error toggling favorite:', error);
        this.$emit('show-error', '收藏操作失敗，請稍後再試');
      }
    },

    initializeMiniMap() {
      if (!window.google || !this.store) return;

      const mapOptions = {
        center: {
          lat: parseFloat(this.store.latitude),
          lng: parseFloat(this.store.longitude)
        },
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      };

      this.miniMap = new google.maps.Map(this.$refs.miniMap, mapOptions);
      this.miniMapMarker = new google.maps.Marker({
        position: mapOptions.center,
        map: this.miniMap,
        title: this.store.name
      });
    },

    async loadMoreReviews() {
      if (this.loadingReviews || !this.hasMoreReviews) return;

      this.loadingReviews = true;
      try {
        const response = await this.$store.dispatch('store/fetchStoreReviews', {
          storeId: this.storeId,
          page: this.currentPage + 1
        });

        if (response.data.reviews.length === 0) {
          this.hasMoreReviews = false;
        } else {
          this.store.reviews.push(...response.data.reviews);
          this.currentPage++;
        }
      } catch (error) {
        console.error('Error loading more reviews:', error);
      } finally {
        this.loadingReviews = false;
      }
    },

    showReviewModal() {
      if (!this.reviewModal) {
        this.reviewModal = new Modal(document.getElementById('reviewModal'));
      }
      this.reviewModal.show();
    },

    async submitReview() {
      if (this.submitting || !this.newReview.rating || !this.newReview.content) return;

      this.submitting = true;
      try {
        const response = await this.$store.dispatch('store/submitReview', {
          storeId: this.storeId,
          ...this.newReview
        });

        // 更新評價列表和統計
        this.store.reviews.unshift(response.data);
        this.store.rating = response.data.newAverageRating;
        this.store.reviewCount++;

        // 重置表單並關閉 Modal
        this.newReview = { rating: 0, content: '' };
        this.reviewModal.hide();
      } catch (error) {
        console.error('Error submitting review:', error);
        this.error = '提交評價失敗，請稍後再試';
      } finally {
        this.submitting = false;
      }
    },

    getStarClass(n) {
      return n <= this.store.rating ? 'bi-star-fill' : 'bi-star';
    },

    getReviewStarClass(rating, n) {
      return n <= rating ? 'bi-star-fill' : 'bi-star';
    },

    getInputStarClass(n) {
      return n <= this.newReview.rating ? 'bi-star-fill' : 'bi-star';
    },

    setRating(rating) {
      this.newReview.rating = rating;
    },

    async copyAddress() {
      try {
        await navigator.clipboard.writeText(this.store.address);
        this.$emit('show-success', '地址已複製');
      } catch (error) {
        console.error('Error copying address:', error);
        this.$emit('show-error', '複製失敗');
      }
    },

    getDirections() {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${this.store.latitude},${this.store.longitude}`;
      window.open(url, '_blank');
    },

    async shareStore() {
      const shareData = {
        title: this.store.name,
        text: `來看看這家特約商店：${this.store.name}`,
        url: window.location.href
      };

      try {
        if (navigator.share) {
          await navigator.share(shareData);
        } else {
          await navigator.clipboard.writeText(window.location.href);
          this.$emit('show-success', '連結已複製');
        }
      } catch (error) {
        console.error('Error sharing:', error);
      }
    },

    isCurrentDay(day) {
      const days = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
      return days[new Date().getDay()] === day;
    },

    formatDate(date) {
      return formatDate(date);
    },

    handleImageError(event) {
      event.target.src = require('@/assets/images/default-store.jpg');
    }
  },

  async created() {
    await this.fetchStoreDetails();
    await this.checkFavoriteStatus();
  },

  beforeDestroy() {
    if (this.reviewModal) {
      this.reviewModal.dispose();
    }
  }
};
</script>

<style scoped>
.store-detail {
  min-height: 100vh;
}

.store-header {
  background-color: #f8f9fa;
  padding: 3rem 0;
}

.store-images {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.carousel-item img {
  height: 400px;
  object-fit: cover;
}

.store-info {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.store-name {
  font-size: 2rem;
  font-weight: 600;
}

.favorite-btn {
  width: 40px;
  height: 40px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.store-rating .stars {
  color: #ffc107;
  font-size: 1.2rem;
  margin-right: 0.5rem;
}

.rating-text {
  color: #6c757d;
}

.contact-info i {
  width: 20px;
  margin-right: 0.5rem;
  color: #6c757d;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e9ecef;
}

.mini-map {
  height: 300px;
  border-radius: 8px;
}

.business-hours li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #e9ecef;
}

.business-hours li:last-child {
  border-bottom: none;
}

.review-item {
  border: none;
  background-color: #f8f9fa;
}

.reviewer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 0.5rem;
}

.review-rating {
  color: #ffc107;
}

.facility-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.facility-item i {
  color: #6c757d;
}

@media (max-width: 768px) {
  .store-header {
    padding: 1.5rem 0;
  }

  .carousel-item img {
    height: 300px;
  }

  .store-name {
    font-size: 1.5rem;
  }

  .mini-map {
    height: 200px;
  }
}
</style>
