<template>
  <div class="promotion-management">
    <!-- 頁面標題區 -->
    <div class="page-header bg-light py-3">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center">
          <h2 class="mb-0">活動管理</h2>
          <button
              class="btn btn-primary"
              @click="showAddPromotionModal"
          >
            <i class="bi bi-plus-lg"></i> 新增活動
          </button>
        </div>
      </div>
    </div>

    <div class="container py-4">
      <!-- 搜尋和篩選區 -->
      <div class="filter-section bg-white p-3 rounded shadow-sm mb-4">
        <div class="row g-3">
          <!-- 搜尋框 -->
          <div class="col-md-4">
            <div class="input-group">
              <span class="input-group-text bg-white">
                <i class="bi bi-search"></i>
              </span>
              <input
                  type="text"
                  class="form-control"
                  v-model="searchQuery"
                  placeholder="搜尋活動名稱..."
                  @input="handleSearch"
              >
            </div>
          </div>

          <!-- 活動類型 -->
          <div class="col-md-3">
            <select
                class="form-select"
                v-model="selectedType"
                @change="handleFilter"
            >
              <option value="">所有類型</option>
              <option value="discount">折扣優惠</option>
              <option value="event">特別活動</option>
              <option value="seasonal">季節活動</option>
            </select>
          </div>

          <!-- 活動狀態 -->
          <div class="col-md-3">
            <select
                class="form-select"
                v-model="selectedStatus"
                @change="handleFilter"
            >
              <option value="">所有狀態</option>
              <option value="upcoming">即將開始</option>
              <option value="ongoing">進行中</option>
              <option value="ended">已結束</option>
            </select>
          </div>

          <!-- 排序方式 -->
          <div class="col-md-2">
            <select
                class="form-select"
                v-model="sortBy"
                @change="handleSort"
            >
              <option value="startDate">開始日期</option>
              <option value="endDate">結束日期</option>
              <option value="participants">參與人數</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 載入中提示 -->
      <loading-spinner v-if="loading" />

      <!-- 錯誤提示 -->
      <alert-message
          v-if="error"
          :message="error"
          type="danger"
          @close="error = ''"
      />

      <!-- 活動列表 -->
      <div class="table-responsive" v-if="!loading && !error">
        <table class="table table-hover">
          <thead class="table-light">
          <tr>
            <th>活動資訊</th>
            <th>時間</th>
            <th>參與情況</th>
            <th>狀態</th>
            <th>操作</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="promotion in promotions" :key="promotion.id">
            <!-- 活動資訊 -->
            <td>
              <div class="d-flex align-items-center">
                <img
                    :src="promotion.imageUrl || require('@/assets/images/default-promotion.jpg')"
                    class="promotion-thumbnail me-2"
                    :alt="promotion.title"
                >
                <div>
                  <div class="promotion-title">{{ promotion.title }}</div>
                  <div class="promotion-type small text-muted">
                    {{ getTypeText(promotion.type) }}
                  </div>
                </div>
              </div>
            </td>

            <!-- 時間 -->
            <td>
              <div>開始：{{ formatDate(promotion.startDate) }}</div>
              <div>結束：{{ formatDate(promotion.endDate) }}</div>
            </td>

            <!-- 參與情況 -->
            <td>
              <div>參與人數：{{ promotion.participantCount }}</div>
              <div>收藏數：{{ promotion.favoriteCount }}</div>
            </td>

            <!-- 狀態 -->
            <td>
                <span
                    :class="['badge', getStatusClass(promotion.status)]"
                >
                  {{ getStatusText(promotion.status) }}
                </span>
            </td>

            <!-- 操作按鈕 -->
            <td>
              <div class="btn-group">
                <button
                    class="btn btn-sm btn-outline-primary"
                    @click="editPromotion(promotion)"
                    title="編輯"
                >
                  <i class="bi bi-pencil"></i>
                </button>
                <button
                    class="btn btn-sm btn-outline-info"
                    @click="viewStatistics(promotion)"
                    title="統計"
                >
                  <i class="bi bi-graph-up"></i>
                </button>
                <button
                    class="btn btn-sm btn-outline-danger"
                    @click="confirmDelete(promotion)"
                    title="刪除"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
          </tbody>
        </table>

        <!-- 無資料提示 -->
        <div
            v-if="promotions.length === 0"
            class="text-center py-5"
        >
          <i class="bi bi-calendar-x display-1 text-muted"></i>
          <p class="mt-3">暫無活動資料</p>
        </div>
      </div>

      <!-- 分頁控制 -->
      <nav
          v-if="!loading && totalPages > 1"
          class="mt-4"
          aria-label="Promotion navigation"
      >
        <ul class="pagination justify-content-center">
          <li
              class="page-item"
              :class="{ disabled: currentPage === 1 }"
          >
            <button
                class="page-link"
                @click="changePage(currentPage - 1)"
            >
              上一頁
            </button>
          </li>
          <li
              v-for="page in displayedPages"
              :key="page"
              class="page-item"
              :class="{ active: currentPage === page }"
          >
            <button
                class="page-link"
                @click="changePage(page)"
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
            >
              下一頁
            </button>
          </li>
        </ul>
      </nav>
    </div>

    <!-- 新增/編輯活動 Modal -->
    <promotion-form-modal
        ref="promotionFormModal"
        :editing-promotion="editingPromotion"
        @save="savePromotion"
    />

    <!-- 統計資料 Modal -->
    <promotion-stats-modal
        ref="promotionStatsModal"
        :promotion="selectedPromotion"
    />

    <!-- 刪除確認 Modal -->
    <div
        class="modal fade"
        id="deleteModal"
        tabindex="-1"
        aria-labelledby="deleteModalLabel"
        aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="deleteModalLabel">確認刪除</h5>
            <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            確定要刪除活動 "{{ promotionToDelete?.title }}" 嗎？此操作無法復原。
          </div>
          <div class="modal-footer">
            <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
            >
              取消
            </button>
            <button
                type="button"
                class="btn btn-danger"
                @click="deletePromotion"
                :disabled="deleting"
            >
              {{ deleting ? '刪除中...' : '確認刪除' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { Modal } from 'bootstrap'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import AlertMessage from '@/components/common/AlertMessage.vue'
import PromotionFormModal from '@/components/promotion/PromotionFormModal.vue'
import PromotionStatsModal from '@/components/promotion/PromotionStatsModal.vue'
import { debounce } from '@/utils/helpers'

export default {
  name: 'PromotionManagement',

  components: {
    LoadingSpinner,
    AlertMessage,
    PromotionFormModal,
    PromotionStatsModal
  },

  setup() {
    const store = useStore()

    // 響應式狀態
    const loading = ref(false)
    const deleting = ref(false)
    const error = ref('')
    const searchQuery = ref('')
    const selectedType = ref('')
    const selectedStatus = ref('')
    const sortBy = ref('startDate')
    const currentPage = ref(1)
    const promotions = ref([])
    const totalItems = ref(0)
    const itemsPerPage = 10

    // Modal 相關
    const promotionFormModal = ref(null)
    const promotionStatsModal = ref(null)
    let deleteModal = null
    const editingPromotion = ref(null)
    const selectedPromotion = ref(null)
    const promotionToDelete = ref(null)

    // 計算屬性
    const totalPages = computed(() => {
      return Math.ceil(totalItems.value / itemsPerPage)
    })

    const displayedPages = computed(() => {
      const delta = 2
      const range = []
      for (
          let i = Math.max(1, currentPage.value - delta);
          i <= Math.min(totalPages.value, currentPage.value + delta);
          i++
      ) {
        range.push(i)
      }
      return range
    })

    // 方法
    const fetchPromotions = async () => {
      loading.value = true
      error.value = ''
      try {
        const response = await store.dispatch('promotion/fetchPromotions', {
          page: currentPage.value,
          size: itemsPerPage,
          type: selectedType.value,
          status: selectedStatus.value,
          sort: sortBy.value,
          search: searchQuery.value
        })
        promotions.value = response.data.content
        totalItems.value = response.data.totalElements
      } catch (err) {
        error.value = '載入活動資料失敗，請稍後再試'
        console.error('Error fetching promotions:', err)
      } finally {
        loading.value = false
      }
    }

    const handleSearch = debounce(() => {
      currentPage.value = 1
      fetchPromotions()
    }, 300)

    const handleFilter = () => {
      currentPage.value = 1
      fetchPromotions()
    }

    const handleSort = () => {
      fetchPromotions()
    }

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        fetchPromotions()
      }
    }

    const showAddPromotionModal = () => {
      editingPromotion.value = null
      promotionFormModal.value.show()
    }

    const editPromotion = (promotion) => {
      editingPromotion.value = { ...promotion }
      promotionFormModal.value.show()
    }

    const savePromotion = async (promotionData) => {
      try {
        if (editingPromotion.value) {
          await store.dispatch('promotion/updatePromotion', {
            id: editingPromotion.value.id,
            ...promotionData
          })
        } else {
          await store.dispatch('promotion/createPromotion', promotionData)
        }
        promotionFormModal.value.hide()
        fetchPromotions()
      } catch (err) {
        error.value = '儲存失敗，請稍後再試'
        console.error('Error saving promotion:', err)
      }
    }

    const viewStatistics = (promotion) => {
      selectedPromotion.value = promotion
      promotionStatsModal.value.show()
    }

    const confirmDelete = (promotion) => {
      promotionToDelete.value = promotion
      deleteModal.show()
    }

    const deletePromotion = async () => {
      if (!promotionToDelete.value) return

      deleting.value = true
      try {
        await store.dispatch('promotion/deletePromotion', promotionToDelete.value.id)
        deleteModal.hide()
        fetchPromotions()
      } catch (err) {
        error.value = '刪除失敗，請稍後再試'
        console.error('Error deleting promotion:', err)
      } finally {
        deleting.value = false
        promotionToDelete.value = null
      }
    }

    const getTypeText = (type) => {
      const typeMap = {
        'discount': '折扣優惠',
        'event': '特別活動',
        'seasonal': '季節活動'
      }
      return typeMap[type] || type
    }

    const getStatusClass = (status) => {
      const statusMap = {
        'upcoming': 'bg-info',
        'ongoing': 'bg-success',
        'ended': 'bg-secondary'
      }
      return statusMap[status] || 'bg-secondary'
    }

    const getStatusText = (status) => {
      const statusMap = {
        'upcoming': '即將開始',
        'ongoing': '進行中',
        'ended': '已結束'
      }
      return statusMap[status] || status
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('zh-TW')
    }

    // 生命週期鉤子
    onMounted(() => {
      deleteModal = new Modal(document.getElementById('deleteModal'))
      fetchPromotions()
    })

    return {
      // 狀態
      loading,
      deleting,
      error,
      searchQuery,
      selectedType,
      selectedStatus,
      sortBy,
      currentPage,
      promotions,
      editingPromotion,
      selectedPromotion,
      promotionToDelete,
      promotionFormModal,
      promotionStatsModal,

      // 計算屬性
      totalPages,
      displayedPages,

      // 方法
      handleSearch,
      handleFilter,
      handleSort,
      changePage,
      showAddPromotionModal,
      editPromotion,
      savePromotion,
      viewStatistics,
      confirmDelete,
      deletePromotion,
      getTypeText,
      getStatusClass,
      getStatusText,
      formatDate
    }
  }
}
</script>

<style scoped>
.promotion-management {
  min-height: 100vh;
  padding-top: 60px;
}

.page-header {
  background-color: white;
  border-bottom: 1px solid #dee2e6;
}

.promotion-thumbnail {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.promotion-title {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.promotion-type {
  color: #6c757d;
}

.table th {
  font-weight: 600;
  white-space: nowrap;
}

.table td {
  vertical-align: middle;
}

.btn-group .btn {
  padding: 0.25rem 0.5rem;
}

.btn-group .btn i {
  font-size: 1rem;
}

.badge {
  padding: 0.5rem 0.75rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .filter-section {
    padding: 1rem;
  }

  .table {
    font-size: 0.875rem;
  }

  .promotion-thumbnail {
    width: 40px;
    height: 40px;
  }

  .btn-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .btn-group .btn {
    width: 100%;
  }
}
</style>
