<template>
  <div class="store-management">
    <!-- 頁面標題區 -->
    <div class="page-header bg-light py-3">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center">
          <h2 class="mb-0">商店管理</h2>
          <button
              class="btn btn-primary"
              @click="showAddStoreModal"
          >
            <i class="bi bi-plus-lg"></i> 新增商店
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
                  placeholder="搜尋商店名稱或地址..."
                  @input="handleSearch"
              >
            </div>
          </div>

          <!-- 類別篩選 -->
          <div class="col-md-3">
            <select
                class="form-select"
                v-model="selectedCategory"
                @change="handleFilter"
            >
              <option value="">所有類別</option>
              <option
                  v-for="category in categories"
                  :key="category.id"
                  :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
          </div>

          <!-- 狀態篩選 -->
          <div class="col-md-3">
            <select
                class="form-select"
                v-model="selectedStatus"
                @change="handleFilter"
            >
              <option value="">所有狀態</option>
              <option value="active">營業中</option>
              <option value="inactive">已停業</option>
              <option value="pending">待審核</option>
            </select>
          </div>

          <!-- 排序方式 -->
          <div class="col-md-2">
            <select
                class="form-select"
                v-model="sortBy"
                @change="handleSort"
            >
              <option value="newest">最新添加</option>
              <option value="name">店名排序</option>
              <option value="rating">評分排序</option>
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

      <!-- 商店列表 -->
      <div class="table-responsive" v-if="!loading && !error">
        <table class="table table-hover">
          <thead class="table-light">
          <tr>
            <th>商店資訊</th>
            <th>類別</th>
            <th>地址</th>
            <th>聯絡方式</th>
            <th>狀態</th>
            <th>操作</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="store in stores" :key="store.id">
            <!-- 商店資訊 -->
            <td>
              <div class="d-flex align-items-center">
                <img
                    :src="store.imageUrl || require('@/assets/images/default-store.jpg')"
                    class="store-thumbnail me-2"
                    :alt="store.name"
                >
                <div>
                  <div class="store-name">{{ store.name }}</div>
                  <div class="store-rating">
                    <i class="bi bi-star-fill text-warning"></i>
                    {{ store.rating }} ({{ store.reviewCount }}評價)
                  </div>
                </div>
              </div>
            </td>

            <!-- 類別 -->
            <td>
              <span class="badge bg-secondary">{{ store.category }}</span>
            </td>

            <!-- 地址 -->
            <td>{{ store.address }}</td>

            <!-- 聯絡方式 -->
            <td>
              <div>{{ store.phone }}</div>
              <div class="small text-muted">{{ store.email }}</div>
            </td>

            <!-- 狀態 -->
            <td>
                <span
                    :class="['badge', getStatusClass(store.status)]"
                >
                  {{ getStatusText(store.status) }}
                </span>
            </td>

            <!-- 操作按鈕 -->
            <td>
              <div class="btn-group">
                <button
                    class="btn btn-sm btn-outline-primary"
                    @click="editStore(store)"
                >
                  <i class="bi bi-pencil"></i>
                </button>
                <button
                    class="btn btn-sm btn-outline-danger"
                    @click="confirmDelete(store)"
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
            v-if="stores.length === 0"
            class="text-center py-5"
        >
          <i class="bi bi-shop display-1 text-muted"></i>
          <p class="mt-3">暫無商店資料</p>
        </div>
      </div>

      <!-- 分頁控制 -->
      <nav
          v-if="!loading && totalPages > 1"
          class="mt-4"
          aria-label="Store navigation"
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

    <!-- 新增/編輯商店 Modal -->
    <div
        class="modal fade"
        id="storeModal"
        tabindex="-1"
        aria-labelledby="storeModalLabel"
        aria-hidden="true"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="storeModalLabel">
              {{ editingStore ? '編輯商店' : '新增商店' }}
            </h5>
            <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveStore">
              <!-- 商店基本資訊 -->
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">商店名稱</label>
                  <input
                      type="text"
                      class="form-control"
                      v-model="storeForm.name"
                      required
                  >
                </div>
                <div class="col-md-6">
                  <label class="form-label">商店類別</label>
                  <select
                      class="form-select"
                      v-model="storeForm.categoryId"
                      required
                  >
                    <option value="">請選擇類別</option>
                    <option
                        v-for="category in categories"
                        :key="category.id"
                        :value="category.id"
                    >
                      {{ category.name }}
                    </option>
                  </select>
                </div>
                <div class="col-12">
                  <label class="form-label">商店地址</label>
                  <input
                      type="text"
                      class="form-control"
                      v-model="storeForm.address"
                      required
                  >
                </div>
                <div class="col-md-6">
                  <label class="form-label">聯絡電話</label>
                  <input
                      type="tel"
                      class="form-control"
                      v-model="storeForm.phone"
                      required
                  >
                </div>
                <div class="col-md-6">
                  <label class="form-label">電子郵件</label>
                  <input
                      type="email"
                      class="form-control"
                      v-model="storeForm.email"
                      required
                  >
                </div>
                <div class="col-12">
                  <label class="form-label">商店描述</label>
                  <textarea
                      class="form-control"
                      v-model="storeForm.description"
                      rows="3"
                  ></textarea>
                </div>
              </div>

              <div class="text-end mt-4">
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
                    :disabled="saving"
                >
                  {{ saving ? '儲存中...' : '儲存' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

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
            確定要刪除商店 "{{ storeToDelete?.name }}" 嗎？此操作無法復原。
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
                @click="deleteStore"
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
import { debounce } from '@/utils/helpers'

export default {
  name: 'StoreManagement',
  components: {
    LoadingSpinner,
    AlertMessage
  },
  setup() {
    const store = useStore()
    const loading = ref(false)
    const saving = ref(false)
    const deleting = ref(false)
    const error = ref('')
    const searchQuery = ref('')
    const selectedCategory = ref('')
    const selectedStatus = ref('')
    const sortBy = ref('newest')
    const currentPage = ref(1)
    const stores = ref([])
    const categories = ref([])
    const totalItems = ref(0)
    const itemsPerPage = 10

    // 模擬商店資料
    const mockStores = [
      {
        id: 1,
        name: '星巴克逢甲店',
        category: '咖啡廳',
        description: '提供優質咖啡和輕食的休閒空間',
        address: '台中市西屯區文華路100號',
        phone: '04-12345678',
        email: 'fcustar@gmail.com',
        website: 'https://www.starbucks.com.tw',
        openingHours: '週一至週日 07:00-22:00',
        imageUrl: '/images/stores/starbucks.jpg',
        rating: 4.5,
        ratingCount: 128,
        status: 'active'
      },
      {
        id: 2,
        name: '麥當勞逢甲店',
        category: '速食',
        description: '24小時營業的速食餐廳',
        address: '台中市西屯區文華路120號',
        phone: '04-23456789',
        email: 'fcumc@gmail.com',
        website: 'https://www.mcdonalds.com.tw',
        openingHours: '24小時營業',
        imageUrl: '/images/stores/mcdonalds.jpg',
        rating: 4.3,
        ratingCount: 256,
        status: 'active'
      },
      {
        id: 3,
        name: '全家便利商店',
        category: '便利商店',
        description: '24小時便利商店',
        address: '台中市西屯區文華路80號',
        phone: '04-34567890',
        email: 'fcufamily@gmail.com',
        website: 'https://www.family.com.tw',
        openingHours: '24小時營業',
        imageUrl: '/images/stores/family.jpg',
        rating: 4.2,
        ratingCount: 186,
        status: 'pending'
      }
    ]

    // 模擬類別資料
    const mockCategories = [
      { id: 1, name: '咖啡廳' },
      { id: 2, name: '速食' },
      { id: 3, name: '便利商店' },
      { id: 4, name: '餐廳' },
      { id: 5, name: '飲料店' }
    ]

    // 表單數據
    const storeForm = ref({
      id: null,
      name: '',
      categoryId: '',
      address: '',
      phone: '',
      email: '',
      description: ''
    })

    const editingStore = ref(null)
    const storeToDelete = ref(null)

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

    // 獲取商店列表
    const fetchStores = async () => {
      loading.value = true
      error.value = ''
      try {
        const response = await store.dispatch('store/fetchStores', {
          page: currentPage.value,
          size: itemsPerPage,
          category: selectedCategory.value,
          status: selectedStatus.value,
          sort: sortBy.value,
          search: searchQuery.value
        })

        if (response && response.success) {
          stores.value = response.data.content
          totalItems.value = response.data.totalElements
        } else {
          console.log('使用模擬數據')
          stores.value = mockStores
          totalItems.value = mockStores.length
        }
      } catch (err) {
        error.value = '載入商店資料失敗'
        console.error('Error fetching stores:', err)
        stores.value = mockStores
        totalItems.value = mockStores.length
      } finally {
        loading.value = false
      }
    }

    // 獲取類別列表
    const fetchCategories = async () => {
      try {
        const response = await store.dispatch('store/fetchCategories')
        if (response && response.success) {
          categories.value = response.data
        } else {
          categories.value = mockCategories
        }
      } catch (err) {
        console.error('Error fetching categories:', err)
        categories.value = mockCategories
      }
    }

    // 搜尋處理
    const handleSearch = debounce(() => {
      currentPage.value = 1
      fetchStores()
    }, 300)

    // 篩選處理
    const handleFilter = () => {
      currentPage.value = 1
      fetchStores()
    }

    // 排序處理
    const handleSort = () => {
      fetchStores()
    }

    // 換頁
    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        fetchStores()
      }
    }

    // 新增/編輯商店
    const showAddStoreModal = () => {
      storeForm.value = {
        id: null,
        name: '',
        categoryId: '',
        address: '',
        phone: '',
        email: '',
        description: ''
      }
      editingStore.value = null
      storeModal.show()
    }

    const editStore = (store) => {
      storeForm.value = { ...store }
      editingStore.value = store
      storeModal.show()
    }

    const saveStore = async () => {
      saving.value = true
      try {
        if (editingStore.value) {
          await store.dispatch('store/updateStore', storeForm.value)
        } else {
          await store.dispatch('store/createStore', storeForm.value)
        }
        storeModal.hide()
        fetchStores()
      } catch (err) {
        error.value = '儲存失敗'
        console.error('Error saving store:', err)
      } finally {
        saving.value = false
      }
    }

    // 刪除商店
    const confirmDelete = (store) => {
      storeToDelete.value = store
      deleteModal.show()
    }

    const deleteStore = async () => {
      if (!storeToDelete.value) return
      deleting.value = true
      try {
        await store.dispatch('store/deleteStore', storeToDelete.value.id)
        deleteModal.hide()
        fetchStores()
      } catch (err) {
        error.value = '刪除失敗'
        console.error('Error deleting store:', err)
      } finally {
        deleting.value = false
        storeToDelete.value = null
      }
    }

    // 狀態相關方法
    const getStatusClass = (status) => {
      const statusMap = {
        'active': 'bg-success',
        'inactive': 'bg-danger',
        'pending': 'bg-warning'
      }
      return statusMap[status] || 'bg-secondary'
    }

    const getStatusText = (status) => {
      const statusMap = {
        'active': '營業中',
        'inactive': '已停業',
        'pending': '待審核'
      }
      return statusMap[status] || status
    }

    // 生命週期鉤子
    onMounted(() => {
      fetchCategories()
      fetchStores()
    })

    return {
      loading,
      saving,
      deleting,
      error,
      searchQuery,
      selectedCategory,
      selectedStatus,
      sortBy,
      currentPage,
      stores,
      categories,
      storeForm,
      editingStore,
      storeToDelete,
      totalPages,
      displayedPages,
      handleSearch,
      handleFilter,
      handleSort,
      changePage,
      showAddStoreModal,
      editStore,
      saveStore,
      confirmDelete,
      deleteStore,
      getStatusClass,
      getStatusText
    }
  }
}
</script>

<style scoped>
.store-management {
  min-height: 100vh;
  padding-top: 60px;
}

.page-header {
  background-color: white;
  border-bottom: 1px solid #dee2e6;
}

.store-thumbnail {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.store-name {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.store-rating {
  font-size: 0.875rem;
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

.modal-body {
  max-height: calc(100vh - 210px);
  overflow-y: auto;
}

@media (max-width: 768px) {
  .filter-section {
    padding: 1rem;
  }

  .table {
    font-size: 0.875rem;
  }

  .store-thumbnail {
    width: 40px;
    height: 40px;
  }
}
</style>
