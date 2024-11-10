<template>
  <div class="store-card card h-100 shadow-sm">
    <!-- 商店圖片 -->
    <img
        :src="store.imageUrl || require('@/assets/images/default-store.jpg')"
        class="card-img-top"
        :alt="store.name"
        @error="handleImageError"
    >

    <!-- 商店基本信息 -->
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <h5 class="card-title mb-0">{{ store.name }}</h5>
        <span
            :class="['badge', getStatusClass]"
        >
          {{ store.status }}
        </span>
      </div>

      <!-- 商店類別標籤 -->
      <div class="mb-2">
        <span
            v-for="category in store.categories"
            :key="category.id"
            class="badge bg-secondary me-1"
        >
          {{ category.name }}
        </span>
      </div>

      <!-- 商店地址 -->
      <p class="card-text small text-muted mb-2">
        <i class="bi bi-geo-alt-fill me-1"></i>
        {{ store.address }}
      </p>

      <!-- 營業時間 -->
      <p class="card-text small text-muted mb-2">
        <i class="bi bi-clock-fill me-1"></i>
        {{ store.businessHours }}
      </p>

      <!-- 目前優惠摘要 -->
      <div class="discount-info" v-if="store.currentDiscount">
        <div class="alert alert-success py-1 px-2 small mb-2">
          <i class="bi bi-tag-fill me-1"></i>
          {{ store.currentDiscount }}
        </div>
      </div>
    </div>

    <!-- 卡片底部操作區 -->
    <div class="card-footer bg-transparent border-top-0">
      <div class="d-flex justify-content-between align-items-center">
        <button
            class="btn btn-sm btn-outline-primary"
            @click="viewDetails"
        >
          查看詳情
        </button>
        <button
            class="btn btn-sm btn-outline-secondary"
            @click="toggleFavorite"
        >
          <i :class="['bi', isFavorite ? 'bi-heart-fill text-danger' : 'bi-heart']"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StoreCard',

  props: {
    store: {
      type: Object,
      required: true,
      validator: (store) => {
        return store.id && store.name && store.address;
      }
    }
  },

  data() {
    return {
      isFavorite: false,
      imageError: false
    };
  },

  computed: {
    getStatusClass() {
      const statusMap = {
        'open': 'bg-success',
        'closed': 'bg-danger',
        'break': 'bg-warning',
        'coming': 'bg-info'
      };
      return statusMap[this.store.status.toLowerCase()] || 'bg-secondary';
    }
  },

  methods: {
    handleImageError() {
      this.imageError = true;
    },

    viewDetails() {
      this.$router.push({
        name: 'store-detail',
        params: { id: this.store.id }
      });
    },

    async toggleFavorite() {
      try {
        // 確保用戶已登入
        if (!this.$store.getters['auth/isAuthenticated']) {
          this.$router.push({ name: 'login' });
          return;
        }

        this.isFavorite = !this.isFavorite;

        // 調用收藏相關的 API
        await this.$store.dispatch('store/toggleFavorite', {
          storeId: this.store.id,
          isFavorite: this.isFavorite
        });

        this.$emit('favorite-changed', {
          storeId: this.store.id,
          isFavorite: this.isFavorite
        });
      } catch (error) {
        console.error('收藏操作失敗:', error);
        this.isFavorite = !this.isFavorite; // 恢復原狀態
        this.$emit('show-error', '收藏操作失敗，請稍後再試');
      }
    }
  },

  async created() {
    // 初始化收藏狀態
    if (this.$store.getters['auth/isAuthenticated']) {
      try {
        const favoriteStatus = await this.$store.dispatch(
            'store/checkFavoriteStatus',
            this.store.id
        );
        this.isFavorite = favoriteStatus;
      } catch (error) {
        console.error('獲取收藏狀態失敗:', error);
      }
    }
  }
};
</script>

<style scoped>
.store-card {
  transition: transform 0.2s ease-in-out;
}

.store-card:hover {
  transform: translateY(-5px);
}

.card-img-top {
  height: 200px;
  object-fit: cover;
}

.badge {
  font-size: 0.8rem;
}

.discount-info {
  min-height: 30px;
}

.btn-sm {
  font-size: 0.875rem;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
}

.bi {
  font-size: 1rem;
}
</style>
