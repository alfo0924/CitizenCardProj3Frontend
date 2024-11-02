<template>
  <div class="discount-management">
    <div class="container">
      <!-- 載入中狀態 -->
      <LoadingSpinner v-if="isLoading" />

      <!-- 錯誤提示 -->
      <AlertMessage
          v-if="error"
          type="error"
          :message="error"
      />

      <!-- 管理介面 -->
      <div v-else class="management-content">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2>優惠管理</h2>
          <button
              class="btn btn-primary"
              @click="openDiscountModal()"
          >
            <i class="fas fa-plus me-2"></i>新增優惠
          </button>
        </div>

        <!-- 搜尋和篩選 -->
        <div class="filters mb-4">
          <div class="row g-3">
            <div class="col-md-4">
              <input
                  type="text"
                  class="form-control"
                  placeholder="搜尋優惠"
                  v-model="searchKeyword"
                  @input="handleSearch"
              >
            </div>
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
            <div class="col-md-3">
              <select
                  class="form-select"
                  v-model="selectedStatus"
                  @change="filterDiscounts"
              >
                <option value="">所有狀態</option>
                <option value="ACTIVE">啟用</option>
                <option value="INACTIVE">停用</option>
                <option value="EXPIRED">已過期</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 優惠列表 -->
        <div class="table-responsive">
          <table class="table">
            <thead>
            <tr>
              <th>優惠代碼</th>
              <th>名稱</th>
              <th>類型</th>
              <th>折扣值</th>
              <th>有效期間</th>
              <th>狀態</th>
              <th>使用次數</th>
              <th>操作</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="discount in discounts" :key="discount.id">
              <td>{{ discount.code }}</td>
              <td>{{ discount.title }}</td>
              <td>
                  <span
                      class="badge"
                      :class="getTypeBadgeClass(discount.type)"
                  >
                    {{ getTypeText(discount.type) }}
                  </span>
              </td>
              <td>{{ formatDiscountValue(discount) }}</td>
              <td>
                {{ formatDate(discount.startDate) }} -<br>
                {{ formatDate(discount.endDate) }}
              </td>
              <td>
                  <span
                      class="badge"
                      :class="getStatusBadgeClass(discount.status)"
                  >
                    {{ getStatusText(discount.status) }}
                  </span>
              </td>
              <td>{{ discount.usageCount }}/{{ discount.maxUsage || '∞' }}</td>
              <td>
                <button
                    class="btn btn-sm btn-outline-primary me-2"
                    @click="openDiscountModal(discount)"
                >
                  編輯
                </button>
                <button
                    class="btn btn-sm"
                    :class="discount.status === 'ACTIVE' ? 'btn-outline-danger' : 'btn-outline-success'"
                    @click="toggleDiscountStatus(discount)"
                >
                  {{ discount.status === 'ACTIVE' ? '停用' : '啟用' }}
                </button>
              </td>
            </tr>
            </tbody>
          </table>
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
                  :disabled="currentPage === totalPages"
              >
                <i class="fas fa-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- 優惠編輯Modal -->
    <div
        class="modal fade"
        id="discountModal"
        tabindex="-1"
        ref="discountModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ editingDiscount.id ? '編輯優惠' : '新增優惠' }}
            </h5>
            <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveDiscount">
              <div class="mb-3">
                <label class="form-label">優惠代碼</label>
                <input
                    type="text"
                    class="form-control"
                    v-model="editingDiscount.code"
                    required
                >
              </div>
              <div class="mb-3">
                <label class="form-label">優惠名稱</label>
                <input
                    type="text"
                    class="form-control"
                    v-model="editingDiscount.title"
                    required
                >
              </div>
              <div class="mb-3">
                <label class="form-label">優惠說明</label>
                <textarea
                    class="form-control"
                    v-model="editingDiscount.description"
                    rows="3"
                ></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">優惠類型</label>
                <select
                    class="form-select"
                    v-model="editingDiscount.type"
                    required
                >
                  <option value="CASH">現金折扣</option>
                  <option value="PERCENTAGE">折扣優惠</option>
                  <option value="FIXED">固定折抵</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">折扣值</label>
                <div class="input-group">
                  <input
                      type="number"
                      class="form-control"
                      v-model="editingDiscount.value"
                      required
                  >
                  <span class="input-group-text">
                    {{ editingDiscount.type === 'PERCENTAGE' ? '%' : 'NT$' }}
                  </span>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">開始日期</label>
                <input
                    type="date"
                    class="form-control"
                    v-model="editingDiscount.startDate"
                    required
                >
              </div>
              <div class="mb-3">
                <label class="form-label">結束日期</label>
                <input
                    type="date"
                    class="form-control"
                    v-model="editingDiscount.endDate"
                    required
                >
              </div>
              <div class="mb-3">
                <label class="form-label">使用次數上限</label>
                <input
                    type="number"
                    class="form-control"
                    v-model="editingDiscount.maxUsage"
                    placeholder="留空表示不限制"
                >
              </div>
              <div class="mb-3">
                <label class="form-label">最低消費金額</label>
                <input
                    type="number"
                    class="form-control"
                    v-model="editingDiscount.minAmount"
                    placeholder="留空表示不限制"
                >
              </div>
              <div class="mb-3">
                <label class="form-label">狀態</label>
                <select
                    class="form-select"
                    v-model="editingDiscount.status"
                    required
                >
                  <option value="ACTIVE">啟用</option>
                  <option value="INACTIVE">停用</option>
                </select>
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
                    :disabled="isProcessing"
                >
                  <span
                      v-if="isProcessing"
                      class="spinner-border spinner-border-sm me-2"
                  ></span>
                  {{ isProcessing ? '處理中...' : '儲存' }}
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
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { Modal } from 'bootstrap'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import AlertMessage from '@/components/common/AlertMessage.vue'
import Swal from 'sweetalert2'

export default {
  name: 'DiscountManagement',

  components: {
    LoadingSpinner,
    AlertMessage
  },

  setup() {
    const store = useStore()
    const discountModal = ref(null)

    // 狀態
    const isLoading = ref(false)
    const error = ref(null)
    const isProcessing = ref(false)
    const searchKeyword = ref('')
    const selectedType = ref('')
    const selectedStatus = ref('')
    const currentPage = ref(1)
    const editingDiscount = ref({
      code: '',
      title: '',
      description: '',
      type: 'PERCENTAGE',
      value: '',
      startDate: '',
      endDate: '',
      maxUsage: '',
      minAmount: '',
      status: 'ACTIVE'
    })

    // 從store獲取數據
    const discounts = computed(() => store.state.discount.discounts)
    const totalPages = computed(() => store.state.discount.totalPages)

    // 分頁顯示
    const displayedPages = computed(() => {
      const range = []
      const delta = 2
      for (
          let i = Math.max(1, currentPage.value - delta);
          i <= Math.min(totalPages.value, currentPage.value + delta);
          i++
      ) {
        range.push(i)
      }
      return range
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
        error.value = '載入優惠列表失敗'
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

    // 開啟編輯Modal
    const openDiscountModal = (discount = null) => {
      if (discount) {
        editingDiscount.value = { ...discount }
      } else {
        editingDiscount.value = {
          code: '',
          title: '',
          description: '',
          type: 'PERCENTAGE',
          value: '',
          startDate: '',
          endDate: '',
          maxUsage: '',
          minAmount: '',
          status: 'ACTIVE'
        }
      }
      const modal = new Modal(discountModal.value)
      modal.show()
    }

    // 儲存優惠
    const saveDiscount = async () => {
      try {
        isProcessing.value = true
        if (editingDiscount.value.id) {
          await store.dispatch('discount/updateDiscount', editingDiscount.value)
        } else {
          await store.dispatch('discount/createDiscount', editingDiscount.value)
        }
        Modal.getInstance(discountModal.value).hide()
        await fetchDiscounts()
      } catch (err) {
        error.value = '儲存優惠失敗'
        console.error('Error saving discount:', err)
      } finally {
        isProcessing.value = false
      }
    }

    // 切換優惠狀態
    const toggleDiscountStatus = async (discount) => {
      const newStatus = discount.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
      const actionText = newStatus === 'ACTIVE' ? '啟用' : '停用'

      try {
        await Swal.fire({
          title: `確定要${actionText}此優惠嗎？`,
          text: `即將${actionText}優惠「${discount.title}」`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: `確定${actionText}`,
          cancelButtonText: '取消'
        })

        await store.dispatch('discount/updateDiscount', {
          ...discount,
          status: newStatus
        })
        await fetchDiscounts()

        Swal.fire(
            `已${actionText}`,
            `優惠已成功${actionText}`,
            'success'
        )
      } catch (err) {
        error.value = `${actionText}優惠失敗`
        console.error('Error toggling discount status:', err)
      }
    }

    // 獲取類型樣式
    const getTypeBadgeClass = (type) => {
      switch (type) {
        case 'CASH':
          return 'bg-success'
        case 'PERCENTAGE':
          return 'bg-primary'
        case 'FIXED':
          return 'bg-info'
        default:
          return 'bg-secondary'
      }
    }

    // 獲取類型文字
    const getTypeText = (type) => {
      switch (type) {
        case 'CASH':
          return '現金折扣'
        case 'PERCENTAGE':
          return '折扣優惠'
        case 'FIXED':
          return '固定折抵'
        default:
          return '未知'
      }
    }

    // 獲取狀態樣式
    const getStatusBadgeClass = (status) => {
      switch (status) {
        case 'ACTIVE':
          return 'bg-success'
        case 'INACTIVE':
          return 'bg-secondary'
        case 'EXPIRED':
          return 'bg-danger'
        default:
          return 'bg-secondary'
      }
    }

    // 獲取狀態文字
    const getStatusText = (status) => {
      switch (status) {
        case 'ACTIVE':
          return '啟用'
        case 'INACTIVE':
          return '停用'
        case 'EXPIRED':
          return '已過期'
        default:
          return '未知'
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
      isProcessing,
      discounts,
      searchKeyword,
      selectedType,
      selectedStatus,
      currentPage,
      totalPages,
      displayedPages,
      editingDiscount,
      discountModal,
      handleSearch,
      filterDiscounts,
      changePage,
      openDiscountModal,
      saveDiscount,
      toggleDiscountStatus,
      getTypeBadgeClass,
      getTypeText,
      getStatusBadgeClass,
      getStatusText,
      formatDiscountValue,
      formatDate
    }
  }
}
</script>
<style scoped>
.discount-management {
  padding: 2rem 0;
}

.badge {
  padding: 0.5rem 0.75rem;
  font-weight: 500;
}

.table {
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
}

.table td {
  vertical-align: middle;
}

.table th {
  background-color: var(--bg-light);
  font-weight: 600;
  color: var(--text-secondary);
}

.modal-body {
  max-height: calc(100vh - 210px);
  overflow-y: auto;
}

.filters .form-control,
.filters .form-select {
  background-color: white;
  border: 1px solid var(--border-color);
}

.filters .form-control:focus,
.filters .form-select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.pagination {
  margin-bottom: 0;
}

.pagination .page-link {
  padding: 0.5rem 0.75rem;
  color: var(--primary-color);
  background-color: white;
  border: 1px solid var(--border-color);
}

.pagination .page-link:hover {
  background-color: var(--bg-light);
  border-color: var(--border-color);
}

.pagination .page-item.active .page-link {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.pagination .page-item.disabled .page-link {
  color: var(--text-light);
  background-color: var(--bg-light);
  border-color: var(--border-color);
}

@media (max-width: 768px) {
  .filters .row {
    row-gap: 1rem;
  }

  .table {
    font-size: 0.875rem;
  }

  .badge {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }

  .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }

  .pagination .page-link {
    padding: 0.375rem 0.5rem;
    font-size: 0.875rem;
  }

  .modal-body {
    max-height: calc(100vh - 180px);
  }
}

@media (max-width: 576px) {
  .table {
    font-size: 0.75rem;
  }

  .badge {
    padding: 0.2rem 0.4rem;
    font-size: 0.7rem;
  }

  .btn-sm {
    padding: 0.2rem 0.4rem;
    font-size: 0.7rem;
  }

  .pagination .page-link {
    padding: 0.25rem 0.4rem;
    font-size: 0.75rem;
  }
}
</style>