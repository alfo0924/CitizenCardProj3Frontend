<template>
  <div class="user-management">
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
          <h2>會員管理</h2>
          <button
              class="btn btn-primary"
              @click="openUserModal()"
          >
            <i class="fas fa-plus me-2"></i>新增會員
          </button>
        </div>

        <!-- 搜尋和篩選 -->
        <div class="filters mb-4">
          <div class="row g-3">
            <div class="col-md-4">
              <input
                  type="text"
                  class="form-control"
                  placeholder="搜尋會員"
                  v-model="searchKeyword"
                  @input="handleSearch"
              >
            </div>
            <div class="col-md-3">
              <select
                  class="form-select"
                  v-model="selectedRole"
                  @change="filterUsers"
              >
                <option value="">所有角色</option>
                <option value="USER">一般會員</option>
                <option value="ADMIN">管理員</option>
              </select>
            </div>
            <div class="col-md-3">
              <select
                  class="form-select"
                  v-model="selectedStatus"
                  @change="filterUsers"
              >
                <option value="">所有狀態</option>
                <option value="ACTIVE">啟用</option>
                <option value="INACTIVE">停用</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 會員列表 -->
        <div class="table-responsive">
          <table class="table">
            <thead>
            <tr>
              <th>會員編號</th>
              <th>姓名</th>
              <th>Email</th>
              <th>角色</th>
              <th>狀態</th>
              <th>註冊時間</th>
              <th>操作</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>
                  <span
                      class="badge"
                      :class="getRoleBadgeClass(user.role)"
                  >
                    {{ getRoleText(user.role) }}
                  </span>
              </td>
              <td>
                  <span
                      class="badge"
                      :class="getStatusBadgeClass(user.status)"
                  >
                    {{ getStatusText(user.status) }}
                  </span>
              </td>
              <td>{{ formatDateTime(user.createdAt) }}</td>
              <td>
                <button
                    class="btn btn-sm btn-outline-primary me-2"
                    @click="openUserModal(user)"
                >
                  編輯
                </button>
                <button
                    class="btn btn-sm"
                    :class="user.status === 'ACTIVE' ? 'btn-outline-danger' : 'btn-outline-success'"
                    @click="toggleUserStatus(user)"
                >
                  {{ user.status === 'ACTIVE' ? '停用' : '啟用' }}
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

    <!-- 會員編輯Modal -->
    <div
        class="modal fade"
        id="userModal"
        tabindex="-1"
        ref="userModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ editingUser.id ? '編輯會員' : '新增會員' }}
            </h5>
            <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveUser">
              <div class="mb-3">
                <label class="form-label">姓名</label>
                <input
                    type="text"
                    class="form-control"
                    v-model="editingUser.name"
                    required
                >
              </div>
              <div class="mb-3">
                <label class="form-label">Email</label>
                <input
                    type="email"
                    class="form-control"
                    v-model="editingUser.email"
                    required
                >
              </div>
              <div class="mb-3">
                <label class="form-label">角色</label>
                <select
                    class="form-select"
                    v-model="editingUser.role"
                    required
                >
                  <option value="USER">一般會員</option>
                  <option value="ADMIN">管理員</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">狀態</label>
                <select
                    class="form-select"
                    v-model="editingUser.status"
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
<script>import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { Modal } from 'bootstrap'
import Swal from 'sweetalert2'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import AlertMessage from '@/components/common/AlertMessage.vue'

export default {
  name: 'UserManagement',
  components: {
    LoadingSpinner,
    AlertMessage
  },
  setup() {
    const store = useStore()
    const userModal = ref(null)
    const isLoading = ref(false)
    const error = ref(null)
    const isProcessing = ref(false)
    const searchKeyword = ref('')
    const selectedRole = ref('')
    const selectedStatus = ref('')
    const currentPage = ref(1)
    const editingUser = ref({
      name: '',
      email: '',
      role: 'USER',
      status: 'ACTIVE'
    })

    // 模擬用戶數據
    const mockUsers = [
      {
        id: 1,
        name: '王大明',
        email: 'wang.dm@gmail.com',
        role: 'USER',
        status: 'ACTIVE',
        createdAt: '2024-01-01T10:30:00'
      },
      {
        id: 2,
        name: '李小華',
        email: 'lee.sh@gmail.com',
        role: 'ADMIN',
        status: 'ACTIVE',
        createdAt: '2024-01-02T11:15:00'
      },
      {
        id: 3,
        name: '張美玲',
        email: 'chang.ml@gmail.com',
        role: 'USER',
        status: 'INACTIVE',
        createdAt: '2024-01-03T12:45:00'
      }
    ]

    // 從store獲取數據或使用模擬數據
    const users = computed(() => {
      const storeUsers = store.state.user.users
      return storeUsers && storeUsers.length > 0 ? storeUsers : mockUsers
    })

    const totalPages = computed(() => store.state.user.totalPages || Math.ceil(mockUsers.length / 10))

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

    const fetchUsers = async () => {
      try {
        isLoading.value = true
        error.value = null
        const response = await store.dispatch('user/fetchUsers', {
          page: currentPage.value,
          role: selectedRole.value,
          status: selectedStatus.value,
          keyword: searchKeyword.value
        })

        if (!response || !response.success) {
          console.log('使用模擬數據')
          store.commit('user/setUsers', mockUsers)
        }
      } catch (err) {
        console.error('Error fetching users:', err)
        error.value = '載入用戶列表失敗'
        store.commit('user/setUsers', mockUsers)
      } finally {
        isLoading.value = false
      }
    }

    const handleSearch = () => {
      currentPage.value = 1
      fetchUsers()
    }

    const filterUsers = () => {
      currentPage.value = 1
      fetchUsers()
    }

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        fetchUsers()
      }
    }

    const openUserModal = (user = null) => {
      if (user) {
        editingUser.value = { ...user }
      } else {
        editingUser.value = {
          name: '',
          email: '',
          role: 'USER',
          status: 'ACTIVE'
        }
      }
      const modal = new Modal(userModal.value)
      modal.show()
    }

    const saveUser = async () => {
      try {
        isProcessing.value = true
        if (editingUser.value.id) {
          await store.dispatch('user/updateUser', editingUser.value)
        } else {
          await store.dispatch('user/createUser', editingUser.value)
        }
        Modal.getInstance(userModal.value).hide()
        await fetchUsers()
      } catch (err) {
        error.value = '儲存用戶失敗'
        console.error('Error saving user:', err)
      } finally {
        isProcessing.value = false
      }
    }

    const toggleUserStatus = async (user) => {
      const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
      const actionText = newStatus === 'ACTIVE' ? '啟用' : '停用'
      try {
        await Swal.fire({
          title: `確定要${actionText}此用戶嗎？`,
          text: `即將${actionText}用戶「${user.name}」`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: `確定${actionText}`,
          cancelButtonText: '取消'
        })
        await store.dispatch('user/updateUser', { ...user, status: newStatus })
        await fetchUsers()
        Swal.fire(
            `已${actionText}`,
            `用戶已成功${actionText}`,
            'success'
        )
      } catch (err) {
        error.value = `${actionText}用戶失敗`
        console.error('Error toggling user status:', err)
      }
    }

    const getRoleBadgeClass = (role) => {
      switch (role) {
      case 'ADMIN':
        return 'bg-danger'
      case 'USER':
        return 'bg-primary'
      default:
        return 'bg-secondary'
      }
    }

    const getRoleText = (role) => {
      switch (role) {
      case 'ADMIN':
        return '管理員'
      case 'USER':
        return '一般用戶'
      default:
        return '未知'
      }
    }

    const getStatusBadgeClass = (status) => {
      switch (status) {
      case 'ACTIVE':
        return 'bg-success'
      case 'INACTIVE':
        return 'bg-secondary'
      default:
        return 'bg-secondary'
      }
    }

    const getStatusText = (status) => {
      switch (status) {
      case 'ACTIVE':
        return '啟用'
      case 'INACTIVE':
        return '停用'
      default:
        return '未知'
      }
    }

    const formatDateTime = (datetime) => {
      return new Date(datetime).toLocaleString('zh-TW')
    }

    onMounted(() => {
      fetchUsers()
    })

    return {
      isLoading,
      error,
      isProcessing,
      users,
      searchKeyword,
      selectedRole,
      selectedStatus,
      currentPage,
      totalPages,
      displayedPages,
      editingUser,
      userModal,
      handleSearch,
      filterUsers,
      changePage,
      openUserModal,
      saveUser,
      toggleUserStatus,
      getRoleBadgeClass,
      getRoleText,
      getStatusBadgeClass,
      getStatusText,
      formatDateTime
    }
  }
}
</script>
<style scoped>
.user-management {
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

.modal-body {
  max-height: calc(100vh - 210px);
  overflow-y: auto;
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
