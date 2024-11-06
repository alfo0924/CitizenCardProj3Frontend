<template>
  <div class="discounts-container">
    <!-- 載入中狀態 -->
    <LoadingSpinner v-if="isLoading" />

    <!-- 錯誤提示 -->
    <AlertMessage
        v-if="error"
        type="error"
        :message="error"
        @close="error = null"
    />

    <!-- 優惠列表 -->
    <div v-else class="discounts-content">
      <h2 class="page-title mb-4">優惠專區</h2>

      <!-- 搜尋和篩選 -->
      <div class="filters mb-4">
        <div class="row g-3">
          <!-- 搜尋框 -->
          <div class="col-md-4">
            <div class="input-group">
              <span class="input-group-text">
                <i class="fas fa-search"></i>
              </span>
              <input
                  type="text"
                  class="form-control"
                  placeholder="搜尋優惠"
                  v-model="searchKeyword"
                  @input="handleSearch"
              >
            </div>
          </div>

          <!-- 類型篩選 -->
          <div class="col-md-3">
            <select
                class="form-select"
                v-model="selectedType"
                @change="filterDiscounts"
            >
              <option value="">所有類型</option>
              <option value="CASH">現金折扣</option>
              <option value="PERCENTAGE">折扣優惠</option>
              <option value="FIXED">固定折抵</option>
            </select>
          </div>

          <!-- 狀態篩選 -->
          <div class="col-md-3">
            <select
                class="form-select"
                v-model="selectedStatus"
                @change="filterDiscounts"
            >
              <option value="">所有狀態</option>
              <option value="AVAILABLE">可使用</option>
              <option value="USED">已使用</option>
              <option value="EXPIRED">已過期</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 優惠卡片列表 -->
      <div class="row g-4">
        <div
            v-for="discount in discounts"
            :key="discount.id"
            class="col-md-6 col-lg-4"
        >
          <div
              class="discount-card"
              :class="{
              'expired': isExpired(discount),
              'used': discount.status === 'USED'
            }"
          >
            <!-- 優惠類型標籤 -->
            <div class="discount-type">
              {{ getDiscountType(discount.type) }}
            </div>

            <!-- 優惠內容 -->
            <div class="discount-content">
              <h3 class="discount-title">{{ discount.title }}</h3>
              <p class="discount-description">{{ discount.description }}</p>

              <div class="discount-value">
                {{ formatDiscountValue(discount) }}
              </div>

              <div class="discount-period">
                <i class="fas fa-calendar-alt"></i>
                {{ formatDate(discount.startDate) }} - {{ formatDate(discount.endDate) }}
              </div>

              <div class="discount-info">
                <div class="info-item" v-if="discount.minPurchase">
                  <i class="fas fa-tag"></i>
                  最低消費：NT$ {{ formatNumber(discount.minPurchase) }}
                </div>
                <div class="info-item" v-if="discount.remainingQuantity">
                  <i class="fas fa-cubes"></i>
                  剩餘數量：{{ discount.remainingQuantity }}
                </div>
              </div>

              <div class="discount-conditions" v-if="discount.conditions">
                <small>
                  <i class="fas fa-info-circle"></i>
                  使用條件：{{ discount.conditions }}
                </small>
              </div>
            </div>

            <!-- 操作按鈕 -->
            <div class="discount-actions">
              <router-link
                  :to="`/discounts/${discount.id}`"
                  class="btn btn-outline-primary me-2"
              >
                查看詳情
              </router-link>
              <button
                  class="btn btn-primary"
                  :disabled="!canUseDiscount(discount)"
                  @click="useDiscount(discount)"
              >
                {{ getActionButtonText(discount) }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 無數據提示 -->
      <div
          v-if="discounts.length === 0"
          class="no-data text-center py-5"
      >
        <i class="fas fa-ticket-alt fa-3x mb-3"></i>
        <p class="text-muted">暫無優惠券</p>
      </div>

      <!-- 分頁 -->
      <nav v-if="totalPages > 1" class="mt-4">
        <ul class="pagination justify-content-center">
          <li
              class="page-item"
              :class="{ disabled: currentPage === 1 }"
          >
            <button
                class="page-link"
                @click="changePage(currentPage - 1)"
                :disabled="currentPage === 1"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
          </li>

          <li
              v-for="page in displayedPages"
              :key="page"
              class="page-item"
              :class="{
              active: currentPage === page,
              disabled: page === '...'
            }"
          >
            <button
                class="page-link"
                @click="page !== '...' && changePage(page)"
            >
              {{ page }}
            </button>
          </li>

          <li
              class="page-item"
              :class="{ disabled: currentPage === totalPages }"
          >
            <button
                class="page-link"
                @click="changePage(currentPage + 1)"
                :disabled="currentPage === totalPages"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>
<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import AlertMessage from '@/components/common/AlertMessage.vue'

export default {
  name: 'Discounts',

  components: {
    LoadingSpinner,
    AlertMessage
  },

  setup() {
    const store = useStore()

    // 狀態
    const isLoading = ref(false)
    const error = ref(null)
    const searchKeyword = ref('')
    const selectedType = ref('')
    const selectedStatus = ref('')
    const currentPage = ref(1)

    // 從store獲取數據
    const discounts = computed(() => store.state.discount.discounts)
    const totalPages = computed(() => store.state.discount.totalPages)

    // 分頁顯示
    const displayedPages = computed(() => {
      const delta = 2
      const range = []
      const rangeWithDots = []
      let l

      for (let i = 1; i <= totalPages.value; i++) {
        if (
            i === 1 ||
            i === totalPages.value ||
            i >= currentPage.value - delta &&
            i <= currentPage.value + delta
        ) {
          range.push(i)
        }
      }

      range.forEach((i) => {
        if (l) {
          if (i - l === 2) {
            rangeWithDots.push(l + 1)
          } else if (i - l !== 1) {
            rangeWithDots.push('...')
          }
        }
        rangeWithDots.push(i)
        l = i
      })

      return rangeWithDots
    })

    // 獲取優惠列表
    const fetchDiscounts = async () => {
      try {
        isLoading.value = true
        error.value = null
        await store.dispatch('discount/fetchDiscounts', {
          page: currentPage.value,
          type: selectedType.value,
          status: selectedStatus.value,
          keyword: searchKeyword.value
        })
      } catch (err) {
        error.value = '載入優惠列表失敗，請稍後再試'
        console.error('Error fetching discounts:', err)
      } finally {
        isLoading.value = false
      }
    }

    // 搜尋處理
    const handleSearch = () => {
      currentPage.value = 1
      fetchDiscounts()
    }

    // 篩選處理
    const filterDiscounts = () => {
      currentPage.value = 1
      fetchDiscounts()
    }

    // 換頁
    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        fetchDiscounts()
      }
    }

    // 檢查優惠是否過期
    const isExpired = (discount) => {
      return new Date(discount.endDate) < new Date()
    }

    // 檢查優惠是否可用
    const canUseDiscount = (discount) => {
      return discount.status === 'ACTIVE' && !isExpired(discount)
    }

    // 使用優惠
    const useDiscount = async (discount) => {
      try {
        isLoading.value = true
        error.value = null
        await store.dispatch('discount/useDiscount', discount.id)
        await fetchDiscounts()
      } catch (err) {
        error.value = '使用優惠失敗，請稍後再試'
        console.error('Error using discount:', err)
      } finally {
        isLoading.value = false
      }
    }

    // 格式化優惠值
    const formatDiscountValue = (discount) => {
      switch (discount.type) {
      case 'CASH':
        return `NT$ ${discount.value}`
      case 'PERCENTAGE':
        return `${discount.value}% OFF`
      case 'FIXED':
        return `折抵 NT$ ${discount.value}`
      default:
        return discount.value
      }
    }

    // 獲取優惠類型文字
    const getDiscountType = (type) => {
      switch (type) {
      case 'CASH':
        return '現金折扣'
      case 'PERCENTAGE':
        return '折扣優惠'
      case 'FIXED':
        return '固定折抵'
      default:
        return '優惠'
      }
    }

    // 獲取按鈕文字
    const getActionButtonText = (discount) => {
      if (discount.status === 'USED') return '已使用'
      if (isExpired(discount)) return '已過期'
      return '立即使用'
    }

    // 格式化日期
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('zh-TW')
    }

    onMounted(() => {
      fetchDiscounts()
    })

    return {
      isLoading,
      error,
      discounts,
      searchKeyword,
      selectedType,
      selectedStatus,
      currentPage,
      totalPages,
      displayedPages,
      handleSearch,
      filterDiscounts,
      changePage,
      isExpired,
      canUseDiscount,
      useDiscount,
      formatDiscountValue,
      getDiscountType,
      getActionButtonText,
      formatDate
    }
  }
}
</script>

<style scoped>
.discounts-container {
  padding: 2rem 0;
}

.discount-card {
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
  overflow: hidden;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
}

.discount-card:hover {
  transform: translateY(-5px);
}

.discount-type {
  background: var(--primary-color);
  color: white;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.discount-content {
  padding: 1.5rem;
  flex: 1;
}

.discount-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.discount-description {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.discount-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.discount-period {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.discount-period i {
  margin-right: 0.5rem;
}

.discount-conditions {
  font-size: 0.75rem;
  color: var(--text-light);
  margin-top: 0.5rem;
}

.discount-actions {
  padding: 1rem 1.5rem;
  background: var(--bg-light);
  border-top: 1px solid var(--border-color);
  text-align: center;
}

.discount-card.expired {
  opacity: 0.7;
}

.discount-card.expired .discount-type {
  background: var(--secondary-color);
}

.discount-card.used .discount-type {
  background: var(--success-color);
}

.filters {
  background: white;
  padding: 1.5rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
  margin-bottom: 2rem;
}

.pagination {
  margin-bottom: 0;
}

.page-link {
  color: var(--primary-color);
  border-color: var(--border-color);
  background: white;
  transition: all 0.3s ease;
}

.page-link:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.page-item.active .page-link {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

@media (max-width: 768px) {
  .filters .row {
    row-gap: 1rem;
  }

  .discount-card {
    margin-bottom: 1rem;
  }

  .discount-content {
    padding: 1rem;
  }

  .discount-actions {
    padding: 1rem;
  }

  .discount-title {
    font-size: 1.1rem;
  }

  .discount-value {
    font-size: 1.25rem;
  }
}
</style>
