<template>
  <div class="store-management">
    <!-- 頁面標題區 -->
    <div class="page-header py-3">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center gap-3">
            <button class="btn btn-outline-secondary" @click="$router.back()">
              <i class="bi bi-arrow-left"></i> 返回
            </button>
            <h2 class="mb-0">商店管理</h2>
          </div>
          <button class="btn btn-danger" @click="showAddStoreModal">
            <i class="bi bi-plus-lg"></i> 新增商店
          </button>
        </div>
      </div>
    </div>

    <div class="container py-4">
      <!-- 搜尋和篩選區 -->
      <div class="filter-section  p-3 rounded shadow-sm mb-4">
        <div class="row g-3">
          <!-- 搜尋框 -->
          <div class="col-md-4">
            <div class="input-group">
              <span class="input-group-text bg-white">
                <i class="bi bi-search"></i>
              </span>
              <input type="text" class="form-control" v-model="searchQuery" placeholder="搜尋商店名稱或地址...">
            </div>
          </div>

          <!-- 類別篩選 -->
          <div class="col-md-3">
            <select class="form-select" v-model="selectedCategoryType">
              <option value="">所有類別</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <!-- 區域篩選 -->
          <div class="col-md-3">
            <select class="form-select" v-model="selectedArea">
              <option value="">所有區域</option>
              <option v-for="area in areas" :key="area.id" :value="area.id">
                {{ area.name }}
              </option>
            </select>
          </div>

          <!-- 排序方式 -->
          <div class="col-md-2">
            <select class="form-select" v-model="sortBy">
              <option value="newest">最新添加</option>
              <option value="popularity">人氣度</option>
              <option value="priority">優先權</option>
              <option value="donation">贊助店家</option>
              <option value="name">店名排序</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 載入中提示 -->
      <loading-spinner v-if="loading" />

      <!-- 錯誤提示 -->
      <alert-message v-if="error" :message="error" type="danger" @close="error = ''" />

      <!-- 商店列表 -->
      <div class="table-responsive" v-if="!loading && !error">
        <table class="table table-hover">
          <thead class="table-light">
            <tr>
              <th>商店資訊</th>
              <th>區域</th>
              <th>類別/標籤</th>
              <th>聯絡資訊</th>
              <th>優先度</th>
              <th>活動時間</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="store in stores" :key="store.id">
              <!-- 商店資訊 -->
              <td>
                <div class="d-flex align-items-center">
                  <div>
                    <div class="store-name">{{ store.name }}</div>
                    <div class="store-content text-muted small">{{ store.short_content }}</div>
                  </div>
                </div>
              </td>

              <!-- 區域 -->
              <td>{{ store.area }}</td>
              <!-- 類別和標籤 -->
              <td>
                <span class="badge bg-primary me-1">{{ store.category }}</span>
                <span class="badge bg-secondary">{{ store.tag }}</span>
              </td>
              <!-- 聯絡資訊 -->
              <td>
                <div>{{ store.phone }}</div>
                <div class="small text-muted">{{ store.address }}</div>
                <div class="small">
                  <a v-if="store.website" :href="store.website" target="_blank" class="text-primary">
                    <i class="bi bi-link-45deg"></i> 網站連結
                  </a>
                </div>
              </td>
              <!-- 優先度 -->
              <td>
                <span class="badge" :class="getPriorityClass(store.priority)">
                  {{ store.priority }}
                </span>
                <div class="small" v-if="store.is_donation">
                  <span class="badge bg-success">贊助商家</span>
                </div>
              </td>

              <!-- 活動時間 -->
              <td>{{ store.time }}</td>

              <!-- 操作按鈕 -->
              <td>
                <div class="btn-group">
                  <button class="btn btn-sm btn-outline-primary" @click="editStore(store)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(store)">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 無資料提示 -->
        <div v-if="stores.length === 0" class="text-center py-5">
          <i class="bi bi-shop display-1 text-muted"></i>
          <p class="mt-3">暫無商店資料</p>
        </div>
      </div>

      <!-- 分頁控制 -->
      <nav v-if="!loading && totalPages > 1" class="mt-4" aria-label="Store navigation">
        <ul class="pagination justify-content-center">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button class="page-link" @click="changePage(currentPage - 1)">
              上一頁
            </button>
          </li>
          <li v-for="page in displayedPages" :key="page" class="page-item" :class="{ active: currentPage === page }">
            <button class="page-link" @click="changePage(page)">
              {{ page }}
            </button>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button class="page-link" @click="changePage(currentPage + 1)">
              下一頁
            </button>
          </li>
        </ul>
      </nav>
    </div>

    <!-- 新增/編輯商店 Modal -->
    <div class="modal fade" id="storeModal" tabindex="-1" aria-labelledby="storeModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="storeModalLabel">
              {{ editingStore ? '編輯商店' : '新增商店' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveStore">
              <!-- 商店基本資訊 -->
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">商店名稱</label>
                  <input type="text" class="form-control" v-model="storeForm.name" required>
                </div>

                <div class="col-md-6">
                  <label class="form-label">區域</label>
                  <select class="form-select" v-model="storeForm.area" required>
                    <option value="">請選擇區域</option>
                    <option value="西屯區">西屯區</option>
                    <option value="南屯區">南屯區</option>
                    <option value="北屯區">北屯區</option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label">類別</label>
                  <select class="form-select" v-model="storeForm.category" required>
                    <option value="">請選擇類別</option>
                    <option v-for="category in categories" :key="category.id" :value="category.id">
                      {{ category.name }}
                    </option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label">標籤</label>
                  <input type="text" class="form-control" v-model="storeForm.tag" placeholder="請自行輸入酷酷的標籤" required>
                </div>

                <div class="col-12">
                  <label class="form-label">詳細內容</label>
                  <textarea class="form-control" v-model="storeForm.content" rows="4" required></textarea>
                </div>

                <div class="col-12">
                  <label class="form-label">簡短內容</label>
                  <textarea class="form-control" v-model="storeForm.short_content" rows="2" required></textarea>
                </div>

                <div class="col-12">
                  <label class="form-label">活動時間</label>
                  <input type="text" class="form-control" v-model="storeForm.time"
                    placeholder="例：2024/06/01 - 2025/05/31" required>
                </div>

                <div class="col-12">
                  <label class="form-label">地址</label>
                  <input type="text" class="form-control" v-model="storeForm.address" required>
                </div>

                <div class="col-md-6">
                  <label class="form-label">電話</label>
                  <input type="tel" class="form-control" v-model="storeForm.phone" placeholder="xx-xxxx-xxxx" required>
                </div>

                <div class="col-md-6">
                  <label class="form-label">優先度</label>
                  <input type="number" class="form-control" v-model="storeForm.priority" required>
                </div>

                <div class="col-12">
                  <label class="form-label">網站</label>
                  <input type="url" class="form-control" v-model="storeForm.website">
                </div>

                <div class="col-12">
                  <label class="form-label">圖片網址</label>
                  <input type="text" class="form-control" v-model="storeForm.img_url">
                </div>

                <div class="col-12">
                  <label class="form-label">Google Maps 嵌入連結</label>
                  <input type="text" class="form-control" v-model="storeForm.iframe_src"
                    placeholder="請輸入 Google Maps 的嵌入程式碼 (從分享->嵌入地圖擷取src屬性值即可)" required>
                </div>

                <div class="col-12">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" v-model="storeForm.is_donation" id="is_donation">
                    <label class="form-check-label" for="is_donation">是否為贊助商家</label>
                  </div>
                </div>
              </div>

              <div class="text-end mt-4">
                <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">取消</button>
                <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                  {{ isSubmitting ? '儲存中...' : '儲存' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- 刪除確認 Modal -->
    <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="deleteModalLabel">確認刪除</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            確定要刪除商店 "{{ storeToDelete?.name }}" 嗎？此操作無法復原。
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              取消
            </button>
            <button type="button" class="btn btn-danger" @click="deleteStore" :disabled="deleting">
              {{ deleting ? '刪除中...' : '確認刪除' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
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
    const selectedCategoryType = ref('')
    const selectedArea = ref('')
    const selectedStatus = ref('')
    const sortBy = ref('newest')
    const currentPage = ref(1)
    const stores = ref([])
    const totalItems = ref(0)
    const itemsPerPage = 10
    let storeModal = null
    let deleteModal = null

    // 表單數據
    const storeForm = ref({
      id: null,
      name: '',
      area: '',
      category: '',
      tag: '',
      content: '',
      short_content: '',
      time: '',
      address: '',
      phone: '',
      priority: 0,
      website: '',
      iframe_src: '',
      is_donation: false,
      img_url: '',
      popularity: 0
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
      loading.value = true;
      error.value = '';
      try {
        const params = {
          page: currentPage.value - 1,
          size: itemsPerPage,
          ...(searchQuery.value && { keyword: searchQuery.value }),
          ...(selectedArea.value && { area: selectedArea.value }),
          ...(selectedCategoryType.value && { category: selectedCategoryType.value }),
          sort: getSortOption(sortBy.value)
        };

        // 移除所有空值參數
        Object.keys(params).forEach(key => {
          if (params[key] === '' || params[key] === null || params[key] === undefined) {
            delete params[key];
          }
        });

        const result = await store.dispatch('store/fetchStores', params);

        if (result.success) {
          stores.value = result.data.content;
          totalItems.value = result.data.totalElements;
        } else {
          error.value = result.error || '載入商店資料失敗';
        }
      } catch (err) {
        console.error('組件錯誤:', err);
        error.value = '載入商店資料失敗';
      } finally {
        loading.value = false;
      }
    };

    // 排序方法
    const getSortOption = (sortType) => {
      switch (sortType) {
        case 'popularity':
          return 'popularity,desc';
        case 'priority':
          return 'priority,desc';
        case 'donation':
          return 'is_donation,desc';
        case 'name':
          return 'name,asc';
        default:
          return 'id,desc'; // 最新添加，假設 id 越大表示越新
      }
    };

    // 定義固定的類別列表
    const STORE_CATEGORIES = [
      { id: '川式料理', name: '川式料理' },
      { id: '中式麵食', name: '中式麵食' },
      { id: '中式小吃', name: '中式小吃' },
      { id: '台式甜點', name: '台式甜點' },
      { id: '韓式料理', name: '韓式料理' },
      { id: '日式料理', name: '日式料理' },
      { id: '中式點心', name: '中式點心' },
      { id: '台式早午餐', name: '台式早午餐' },
      { id: '飲品茶點', name: '飲品茶點' },
      { id: '中式料理', name: '中式料理' }
    ];

    const STORE_AREAS = [
      { id: '西屯區', name: '西屯區' },
      { id: '南屯區', name: '南屯區' },
      { id: '北屯區', name: '北屯區' }
    ];

    // 修改區域列表的引用
    const areas = ref(STORE_AREAS);
    const categories = ref(STORE_CATEGORIES);

    // 優先度相關方法
    const getPriorityClass = (priority) => {
      if (priority >= 8) return 'bg-danger';
      if (priority >= 5) return 'bg-warning';
      return 'bg-info';
    };

    // 換頁
    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        fetchStores()
      }
    }

    // 編輯商店
    const showAddStoreModal = () => {
      storeForm.value = {
        id: null,
        name: '',
        categoryId: '',
        address: '',
        phone: '',
        email: '',
      }
      editingStore.value = null
      storeModal.show()
    }

    const editStore = (store) => {
      storeForm.value = {
        id: store.id,
        name: store.name,
        area: store.area,
        category: store.category,
        tag: store.tag,
        content: store.content,
        short_content: store.short_content,
        time: store.time,
        address: store.address,
        phone: store.phone,
        priority: store.priority,
        website: store.website || '',
        iframe_src: store.iframe_src,
        img_url: store.img_url,
        is_donation: store.is_donation || false
      };

      // 設置編輯狀態
      editingStore.value = store;

      // 打開 Modal
      storeModal.show();
    };

    // 保存商店
    const saveStore = async () => {
      saving.value = true;
      try {
        // 驗證必填欄位
        const requiredFields = {
          name: '商店名稱',
          area: '區域',
          category: '類別',
          tag: '標籤',
          content: '詳細內容',
          short_content: '簡短內容',
          time: '活動時間',
          address: '地址',
          phone: '電話',
          iframe_src: 'Google Maps 連結'
        };

        // 檢查必填欄位
        for (const [field, label] of Object.entries(requiredFields)) {
          if (!storeForm.value[field]?.trim()) {
            throw new Error(`請填寫${label}`);
          }
        }

        // 電話格式驗證
        const phonePattern = /^\d{2,3}-\d{3,4}-\d{4}$/;
        if (!phonePattern.test(storeForm.value.phone)) {
          throw new Error('請輸入正確的電話格式 (xx-xxxx-xxxx)');
        }

        const formData = {
          ...storeForm.value,
          priority: parseInt(storeForm.value.priority) || 0,
          is_donation: Boolean(storeForm.value.is_donation)
        };

        let result;
        if (editingStore.value) {
          // 更新現有商店
          result = await store.dispatch('store/updateStore', {
            id: editingStore.value.id,
            storeData: formData
          });
        } else {
          // 創建新商店
          result = await store.dispatch('store/createStore', formData);
        }

        if (result.success) {
          // 關閉 Modal
          storeModal.hide();
          // 重新獲取商店列表
          await fetchStores();
          // 重置表單
          resetStoreForm();
          // 清除編輯狀態
          editingStore.value = null;
          // 顯示成功提示
          alert(editingStore.value ? '修改成功！' : '新增成功！');
        } else {
          throw new Error(result.error || '儲存失敗');
        }
      } catch (err) {
        error.value = err.message;
        console.error('儲存失敗:', err);
        alert(err.message);
      } finally {
        saving.value = false;
      }
    };

    // 添加重置表單函數
    const resetStoreForm = () => {
      storeForm.value = {
        id: null,
        name: '',
        area: '',
        category: '',
        tag: '',
        content: '',
        short_content: '',
        time: '',
        address: '',
        phone: '',
        priority: 0,
        website: '',
        iframe_src: '',
        is_donation: false,
        img_url: '',
        popularity: 0
      };
    };

    // 刪除商店
    const confirmDelete = (store) => {
      storeToDelete.value = store
      deleteModal.show()
    }

    const deleteStore = async () => {
      if (!storeToDelete.value) return;

      deleting.value = true;
      try {
        const result = await store.dispatch('store/deleteStore', storeToDelete.value.id);

        if (result.success) {
          // 關閉 Modal
          const modal = Modal.getInstance(document.getElementById('deleteModal'));
          modal.hide();

          // 重新載入商店列表
          await fetchStores();
        } else {
          error.value = result.error || '刪除失敗';
        }
      } catch (err) {
        console.error('刪除商店時發生錯誤:', err);
        error.value = '刪除失敗';
      } finally {
        deleting.value = false;
        storeToDelete.value = null;
      }
    };

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

    // 初始化 Modal 實例
    onMounted(() => {
      storeModal = new Modal(document.getElementById('storeModal'))
      deleteModal = new Modal(document.getElementById('deleteModal'))
      fetchStores()
    })

    // 添加到 setup() 函數中
    watch([selectedArea, selectedCategoryType, sortBy], () => {
      currentPage.value = 1; // 重置頁碼
      fetchStores();
    }, { immediate: false });

    // 搜索關鍵字使用防抖
    watch(searchQuery, debounce(() => {
      currentPage.value = 1;
      fetchStores();
    }, 300));

    return {
      loading,
      saving,
      deleting,
      error,
      searchQuery,
      selectedStatus,
      currentPage,
      stores,
      storeForm,
      editingStore,
      storeToDelete,
      totalPages,
      displayedPages,
      changePage,
      showAddStoreModal,
      editStore,
      saveStore,
      confirmDelete,
      deleteStore,
      getStatusClass,
      getStatusText,
      STORE_CATEGORIES,
      resetStoreForm,
      isSubmitting: saving,
      getPriorityClass,
      areas,
      categories,
      selectedArea,
      selectedCategoryType,
      sortBy,
      getSortOption,
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

.filter-section {
  background-color: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.store-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.pagination {
  margin-bottom: 2rem;
}

.pagination .page-link {
  color: var(--danger-color);
  border-color: var(--danger-color);
}

.pagination .active .page-link {
  background-color: var(--bs-light);
  border-color: var(--danger-color);
}

@media (max-width: 768px) {
  .filter-section {
    padding: 1rem;
  }

  .store-content {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }

  .badge {
    font-weight: normal;
    padding: 0.4em 0.6em;
  }

  .table td {
    vertical-align: middle;
    max-width: 250px;
    /* 限制欄位最大寬度 */
  }

  .table td>div {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .store-thumbnail {
    width: 40px;
    height: 40px;
  }

  .btn-group .btn {
    padding: 0.2rem 0.4rem;
  }

  .btn-group .btn i {
    font-size: 0.875rem;
  }
}

.store-image-preview {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}

.store-thumbnail {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}
</style>
