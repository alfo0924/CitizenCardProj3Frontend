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

    const profileData = reactive({
      name: '',
      email: '',
      phone: '',
      birthday: '',
      gender: '',
      address: ''
    })

    const fetchProfile = async () => {
      try {
        isLoading.value = true
        error.value = null
        const response = await store.dispatch('user/fetchProfile')
        Object.assign(profileData, response.data)
      } catch (err) {
        error.value = '載入個人資料失敗，請稍後再試'
        console.error('Error fetching profile:', err)
      } finally {
        isLoading.value = false
      }
    }

    const updateProfile = async () => {
      try {
        isUpdating.value = true
        updateSuccess.value = false
        await store.dispatch('user/updateProfile', profileData)
        updateSuccess.value = true
        setTimeout(() => {
          updateSuccess.value = false
        }, 3000)
      } catch (err) {
        error.value = '更新個人資料失敗，請稍後再試'
        console.error('Error updating profile:', err)
      } finally {
        isUpdating.value = false
      }
    }

    onMounted(() => {
      fetchProfile()
    })

    return {
      isLoading,
      error,
      isUpdating,
      updateSuccess,
      profileData,
      updateProfile
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