<template>
  <div class="container discounts-container">
    <!-- 載入中狀態 -->
    <LoadingSpinner v-if="isLoading" />

    <!-- 錯誤提示 -->
    <AlertMessage v-if="error" type="error" :message="error" @close="error = null" />

    <!-- 優惠列表 -->
    <div v-else class="discounts-content">
      <div>
        <h3 class="hot-title">熱門優惠</h3>
      </div>
      <div class="hot-discount-store-block hot-card-group row mb-4">
        <div class="card m-3 col-lg-3 col-md-5 col-sm-11">
          <img src="\images\discountStore\shop-158317_1280.png" class="card-img-top" alt="store-image">
          <div class="card-body">
            <h3 class="card-title text-dark">Store Name</h3>
            <h4 class="card-text text-dark">Discounts Content</h4>
            <h5 class="card-text text-dark">Discounts Time</h5>
            <p class="card-text text-dark">Discounts Store Location</p>
            <div class="d-flex flex-wrap">
              <p class="tag d-inline bg-primary text-white px-1 mx-1 rounded-pill">tag</p>
              <p class="tag d-inline bg-primary text-white px-1 mx-1 rounded-pill">tag-medium</p>
              <p class="tag d-inline bg-primary text-white px-1 mx-1 rounded-pill">tag-large-content</p>
            </div>
          </div>
        </div>
        <div class="card m-3 col-lg-3 col-md-5 col-sm-11">
          <img src="\images\discountStore\shop-158317_1280.png" class="card-img-top" alt="store-image">
          <div class="card-body">
            <h3 class="card-title text-dark">Store Name</h3>
            <h4 class="card-text text-dark">Discounts Content</h4>
            <h5 class="card-text text-dark">Discounts Time</h5>
            <p class="card-text text-dark">Discounts Store Location</p>
            <div class="d-flex flex-wrap">
              <p class="tag d-inline bg-primary text-white px-1 mx-1 rounded-pill">tag</p>
              <p class="tag d-inline bg-primary text-white px-1 mx-1 rounded-pill">tag-medium</p>
              <p class="tag d-inline bg-primary text-white px-1 mx-1 rounded-pill">tag-large-content</p>
            </div>
          </div>
        </div>
        <div class="card m-3 col-lg-3 col-md-5 col-sm-11">
          <img src="\images\discountStore\shop-158317_1280.png" class="card-img-top" alt="store-image">
          <div class="card-body">
            <h3 class="card-title text-dark">Store Name</h3>
            <h4 class="card-text text-dark">Discounts Content</h4>
            <h5 class="card-text text-dark">Discounts Time</h5>
            <p class="card-text text-dark">Discounts Store Location</p>
            <div class="d-flex flex-wrap">
              <p class="tag d-inline bg-primary text-white px-1 mx-1 rounded-pill">tag</p>
              <p class="tag d-inline bg-primary text-white px-1 mx-1 rounded-pill">tag-medium</p>
              <p class="tag d-inline bg-primary text-white px-1 mx-1 rounded-pill">tag-large-content</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import AlertMessage from '@/components/common/AlertMessage.vue'

export default {
  name: 'DiscountsList',

  components: {
    LoadingSpinner,
    AlertMessage
  },

  setup() {
    const store = useStore()
    const router = useRouter()

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
        await store.dispatch('discount/useDiscount', {
          discountId: discount.id
        })
        router.push('/wallet')
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
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css");

.card-body {
  background-color: #CED4DA;

}
h3 {
  margin-block-start: 1em;
  margin-block-end: 0em;
}
</style>