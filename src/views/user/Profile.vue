<template>
  <div class="profile-container">
    <h1 class="mb-4">個人資料</h1>

    <!-- 載入中狀態 -->
    <LoadingSpinner v-if="isLoading" />

    <!-- 錯誤提示 -->
    <AlertMessage
        v-if="error"
        type="error"
        :message="error"
    />

    <!-- 個人資料表單 -->
    <form @submit.prevent="updateProfile" v-if="!isLoading && !error">
      <div class="mb-3">
        <label for="name" class="form-label">姓名</label>
        <input
            type="text"
            class="form-control"
            id="name"
            v-model="profileData.name"
            required
        >
      </div>

      <div class="mb-3">
        <label for="email" class="form-label">電子郵件</label>
        <input
            type="email"
            class="form-control"
            id="email"
            v-model="profileData.email"
            required
            disabled
        >
      </div>

      <div class="mb-3">
        <label for="phone" class="form-label">手機號碼</label>
        <input
            type="tel"
            class="form-control"
            id="phone"
            v-model="profileData.phone"
            required
        >
      </div>

      <div class="mb-3">
        <label for="birthday" class="form-label">生日</label>
        <input
            type="date"
            class="form-control"
            id="birthday"
            v-model="profileData.birthday"
        >
      </div>

      <div class="mb-3">
        <label class="form-label">性別</label>
        <div>
          <div class="form-check form-check-inline">
            <input
                class="form-check-input"
                type="radio"
                id="male"
                value="MALE"
                v-model="profileData.gender"
            >
            <label class="form-check-label" for="male">男</label>
          </div>
          <div class="form-check form-check-inline">
            <input
                class="form-check-input"
                type="radio"
                id="female"
                value="FEMALE"
                v-model="profileData.gender"
            >
            <label class="form-check-label" for="female">女</label>
          </div>
          <div class="form-check form-check-inline">
            <input
                class="form-check-input"
                type="radio"
                id="other"
                value="OTHER"
                v-model="profileData.gender"
            >
            <label class="form-check-label" for="other">其他</label>
          </div>
        </div>
      </div>

      <div class="mb-3">
        <label for="address" class="form-label">地址</label>
        <textarea
            class="form-control"
            id="address"
            v-model="profileData.address"
            rows="3"
        ></textarea>
      </div>

      <button type="submit" class="btn btn-primary" :disabled="isUpdating">
        <span v-if="isUpdating" class="spinner-border spinner-border-sm me-2"></span>
        {{ isUpdating ? '更新中...' : '更新資料' }}
      </button>
    </form>

    <!-- 更新成功提示 -->
    <AlertMessage
        v-if="updateSuccess"
        type="success"
        message="個人資料更新成功！"
    />
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useStore } from 'vuex'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import AlertMessage from '@/components/common/AlertMessage.vue'

// 模擬用戶數據
const mockUsers = [
  {
    id: 1,
    email: 'user@example.com',
    password: 'user123456',
    name: '一般會員',
    role: 'ROLE_USER',
    avatar: 'https://i.pravatar.cc/150?img=1',
    phone: '0912345678',
    birthday: '1990-01-01',
    gender: 'MALE',
    address: '台中市西屯區文華路100號',
    wallet: {
      balance: 1000
    }
  },
  {
    id: 2,
    email: 'admin@example.com',
    password: 'admin123456',
    name: '系統管理員',
    role: 'ROLE_ADMIN',
    avatar: 'https://i.pravatar.cc/150?img=2',
    phone: '0987654321',
    birthday: '1985-12-31',
    gender: 'FEMALE',
    address: '台中市西屯區文華路200號',
    wallet: {
      balance: 5000
    }
  }
]

export default {
  name: 'Profile',

  components: {
    LoadingSpinner,
    AlertMessage
  },

  setup() {
    const store = useStore()
    const isLoading = ref(false)
    const error = ref(null)
    const isUpdating = ref(false)
    const updateSuccess = ref(false)
    const useMockData = ref(true) // 控制是否使用假資料

    const profileData = reactive({
      name: '',
      email: '',
      phone: '',
      birthday: '',
      gender: '',
      address: ''
    })

    // 獲取當前用戶角色
    const getCurrentUserRole = () => {
      return store.getters['auth/isAdmin'] ? 'ROLE_ADMIN' : 'ROLE_USER'
    }

    // 根據角色獲取對應的模擬數據
    const getMockUserByRole = () => {
      const role = getCurrentUserRole()
      return mockUsers.find(user => user.role === role) || mockUsers[0]
    }

    const fetchProfile = async () => {
      try {
        isLoading.value = true
        error.value = null

        if (useMockData.value) {
          // 使用假資料，根據用戶角色選擇對應數據
          const mockUser = getMockUserByRole()

          setTimeout(() => {
            Object.assign(profileData, {
              name: mockUser.name,
              email: mockUser.email,
              phone: mockUser.phone,
              birthday: mockUser.birthday,
              gender: mockUser.gender,
              address: mockUser.address
            })
            isLoading.value = false
          }, 1000) // 模擬加載時間
        } else {
          // 使用真實 API
          const response = await store.dispatch('user/fetchProfile')
          if (response.success) {
            Object.assign(profileData, response.data)
          } else {
            throw new Error(response.message || '獲取資料失敗')
          }
          isLoading.value = false
        }
      } catch (err) {
        error.value = '載入個人資料失敗，請稍後再試'
        console.error('Error fetching profile:', err)
        isLoading.value = false
      }
    }

    const updateProfile = async () => {
      try {
        isUpdating.value = true
        updateSuccess.value = false

        if (useMockData.value) {
          // 模擬更新成功
          // 獲取當前用戶模擬數據
          const mockUser = getMockUserByRole()

          // 更新模擬數據
          Object.assign(mockUser, {
            ...mockUser,
            ...profileData
          })

          setTimeout(() => {
            updateSuccess.value = true
            isUpdating.value = false

            // 3秒後隱藏成功提示
            setTimeout(() => {
              updateSuccess.value = false
            }, 3000)
          }, 1000)
        } else {
          // 使用真實 API
          const response = await store.dispatch('user/updateProfile', profileData)
          if (response.success) {
            updateSuccess.value = true
            setTimeout(() => {
              updateSuccess.value = false
            }, 3000)
          } else {
            throw new Error(response.message || '更新失敗')
          }
          isUpdating.value = false
        }
      } catch (err) {
        error.value = '更新個人資料失敗，請稍後再試'
        console.error('Error updating profile:', err)
        isUpdating.value = false
      }
    }

    // 表單驗證
    const validateForm = () => {
      // 可以添加更多驗證規則
      if (!profileData.name.trim()) {
        error.value = '請輸入姓名'
        return false
      }
      if (!profileData.phone.trim()) {
        error.value = '請輸入手機號碼'
        return false
      }
      // 手機號碼格式驗證
      const phoneRegex = /^09\d{8}$/
      if (!phoneRegex.test(profileData.phone)) {
        error.value = '請輸入有效的手機號碼'
        return false
      }
      return true
    }

    // 監聽後端 API 狀態
    const checkApiAvailability = async () => {
      try {
        const response = await store.dispatch('checkApiStatus')
        useMockData.value = !response.success
      } catch (err) {
        console.error('API check failed:', err)
        useMockData.value = true
      }
    }

    onMounted(async () => {
      // 檢查 API 可用性
      await checkApiAvailability()
      // 獲取個人資料
      await fetchProfile()
    })

    return {
      isLoading,
      error,
      isUpdating,
      updateSuccess,
      profileData,
      updateProfile,
      validateForm
    }
  }
}
</script>

<style scoped>
.profile-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
}

.form-label {
  font-weight: 500;
}

.form-control:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.btn-primary {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.btn-primary:hover {
  background-color: var(--primary-dark);
  border-color: var(--primary-dark);
}

@media (max-width: 768px) {
  .profile-container {
    padding: 1rem;
  }
}
</style>
