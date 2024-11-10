<template>
  <div class="store-list-item" @click="navigateToDetail">
    <div class="row g-0 align-items-center">
      <!-- 商店圖片 -->
      <div class="col-md-3">
        <div class="store-image-wrapper">
          <img
              :src="store.imageUrl || require('@/assets/images/default-store.jpg')"
              :alt="store.name"
              class="store-image"
              @error="handleImageError"
          >
          <span
              :class="['status-badge', getStatusClass]"
              v-if="store.status"
          >
            {{ store.status }}
          </span>
        </div>
      </div>

      <!-- 商店資訊 -->
      <div class="col-md-9">
        <div class="store-content p-3">
          <!-- 商店名稱和收藏按鈕 -->
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h5 class="store-name mb-0">{{ store.name }}</h5>
            <button
                class="btn btn-outline-primary btn-sm favorite-btn"
                @click.stop="toggleFavorite"
            >
              <i :class="['bi', isFavorite ? 'bi-heart-fill' : 'bi-heart']"></i>
            </button>
          </div>

          <!-- 評分和評價數 -->
          <div class="store-rating mb-2">
            <div class="stars">
              <i
                  v-for="n in 5"
                  :key="n"
                  class="bi"
                  :class="getStarClass(n)"
              ></i>
            </div>
            <span class="rating-text">
              {{ store.rating }} ({{ store.reviewCount }}則評價)
            </span>
          </div>

          <!-- 商店標籤 -->
          <div class="store-tags mb-2">
            <span
                v-for="tag in store.tags"
                :key="tag.id"
                class="badge bg-secondary me-1"
            >
              {{ tag.name }}
            </span>
          </div>

          <!-- 地址和距離 -->
          <p class="store-address mb-2">
            <i class="bi bi-geo-alt-fill"></i>
            {{ store.address }}
            <span v-if="store.distance" class="distance-info">
              ({{ formatDistance(store.distance) }})
            </span>
          </p>

          <!-- 營業時間 -->
          <p class="business-hours mb-2">
            <i class="bi bi-clock-fill"></i>
            {{ store.businessHours }}
          </p>

          <!-- 當前優惠 -->
          <div class="current-discount" v-if="store.currentDiscount">
            <div class="alert alert-success py-1 px-2 small mb-0">
              <i class="bi bi-tag-fill"></i>
              {{ store.currentDiscount }}
            </div>
          </div>

          <!-- 功能按鈕 -->
          <div class="action-buttons mt-3">
            <button
                class="btn btn-sm btn-outline-primary me-2"
                @click.stop="getDirections"
            >
              <i class="bi bi-map"></i> 導航前往
            </button>
            <button
                class="btn btn-sm btn-outline-primary"
                @click.stop="callStore"
                v-if="store.phone"
            >
              <i class="bi bi-telephone"></i> 聯絡商店
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StoreListItem',

  props: {
    store: {
      type: Object,
      required: true,
      validator: (store) => {
        return store.id && store.name && store.address;
      }
    },
    isFavorite: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    getStatusClass() {
      const statusMap = {
        'open': 'status-open',
        'closed': 'status-closed',
        'break': 'status-break',
        'coming': 'status-coming'
      };
      return statusMap[this.store.status?.toLowerCase()] || 'status-default';
    }
  },

  methods: {
    handleImageError(event) {
      event.target.src = require('@/assets/images/default-store.jpg');
    },

    getStarClass(n) {
      return n <= this.store.rating ? 'bi-star-fill' : 'bi-star';
    },

    formatDistance(distance) {
      if (distance < 1) {
        return `${Math.round(distance * 1000)}公尺`;
      }
      return `${distance.toFixed(1)}公里`;
    },

    navigateToDetail() {
      this.$router.push({
        name: 'store-detail',
        params: { id: this.store.id }
      });
    },

    toggleFavorite() {
      if (!this.$store.getters['auth/isAuthenticated']) {
        this.$router.push({ name: 'login' });
        return;
      }
      this.$emit('favorite-toggle', {
        storeId: this.store.id,
        isFavorite: !this.isFavorite
      });
    },

    getDirections() {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${this.store.latitude},${this.store.longitude}`;
      window.open(url, '_blank');
    },

    callStore() {
      window.location.href = `tel:${this.store.phone}`;
    }
  }
};
</script>

<style scoped>
.store-list-item {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  overflow: hidden;
}

.store-list-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.store-image-wrapper {
  position: relative;
  width: 100%;
  height: 200px;
}

.store-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
}

.status-open {
  background-color: #28a745;
}

.status-closed {
  background-color: #dc3545;
}

.status-break {
  background-color: #ffc107;
}

.status-coming {
  background-color: #17a2b8;
}

.status-default {
  background-color: #6c757d;
}

.store-content {
  height: 100%;
}

.store-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #212529;
}

.favorite-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.store-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stars {
  color: #ffc107;
}

.rating-text {
  color: #6c757d;
  font-size: 0.875rem;
}

.store-tags .badge {
  font-weight: normal;
}

.store-address,
.business-hours {
  color: #6c757d;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.store-address i,
.business-hours i {
  margin-right: 0.5rem;
}

.distance-info {
  color: #17a2b8;
  margin-left: 0.5rem;
}

.current-discount {
  margin-top: 0.5rem;
}

.current-discount i {
  margin-right: 0.25rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-buttons .btn {
  font-size: 0.875rem;
}

.action-buttons i {
  margin-right: 0.25rem;
}

@media (max-width: 768px) {
  .store-image-wrapper {
    height: 150px;
  }

  .store-content {
    padding: 1rem !important;
  }

  .action-buttons {
    flex-wrap: wrap;
  }

  .action-buttons .btn {
    width: 100%;
    margin-right: 0 !important;
    margin-bottom: 0.5rem;
  }
}
</style>
