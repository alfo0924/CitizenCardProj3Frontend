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

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { Modal } from 'bootstrap'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import AlertMessage from '@/components/common/AlertMessage.vue'
import Swal from 'sweetalert2'

export default {
  name: 'UserManagement',

  components: {
    LoadingSpinner,
    AlertMessage
  },

  setup() {
    const store = useStore()
    const userModal = ref(null)

    // 狀態
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

    // 從store獲取數據
    const users = computed(() => store.state.user.users)
    const totalPages = computed(() => store.state.user.totalPages)

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

    // 獲取會員列表
    const fetchUsers = async () => {
      try {
        isLoading.value = true
        error.value = null
        await store.dispatch('user/fetchUsers', {
          page: currentPage.value,
          role: selectedRole.value,
          status: selectedStatus.value,
          keyword: searchKeyword.value
        })
      } catch (err) {
        error.value = '載入會員列表失敗'
        console.error('Error fetching users:', err)
      } finally {
        isLoading.value = false
      }
    }

    // 搜尋處理
    const handleSearch = () => {
      currentPage.value = 1
      fetchUsers()
    }

    // 篩選處理
    const filterUsers = () => {
      currentPage.value = 1
      fetchUsers()
    }

    // 換頁
    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        fetchUsers()
      }
    }

    // 開啟編輯Modal
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

    // 儲存會員
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
        error.value = '儲存會員失敗'
        console.error('Error saving user:', err)
      } finally {
        isProcessing.value = false
      }
    }

    // 切換會員狀態
    const toggleUserStatus = async (user) => {
      const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
      const actionText = newStatus === 'ACTIVE' ? '啟用' : '停用'

      try {
        await Swal.fire({
          title: `確定要${actionText}此會員嗎？`,
          text: `即將${actionText}會員「${user.name}」`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: `確定${actionText}`,
          cancelButtonText: '取消'
        })

        await store.dispatch('user/updateUser', {
          ...user,
          status: newStatus
        })
        await fetchUsers()

        Swal.fire(
            `已${actionText}`,
            `會員已成功${actionText}`,
            'success'
        )
      } catch (err) {
        error.value = `${actionText}會員失敗`
        console.error('Error toggling user status:', err)
      }
    }

    // 獲取角色樣式
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

    // 獲取角色文字
    const getRoleText = (role) => {
      switch (role) {
        case 'ADMIN':
          return '管理員'
        case 'USER':
          return '一般會員'
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
        default:
          return '未知'
      }
    }

    // 格式化日期時間
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

@media (max-width: 768px) {
  .filters .row {
    row-gap: 1