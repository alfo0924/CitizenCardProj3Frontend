<template>
  <div class="profile-container">
    <h1 class="mb-4">個人資料</h1>

    <LoadingSpinner v-if="isLoading" />
    <AlertMessage v-if="error" type="error" :message="error" />

    <!-- 個人資料顯示 -->
    <div v-if="!isLoading && !error && !isEditing" class="profile-info">
      <div class="mb-3">
        <strong>姓名：</strong> {{ profileData.name }}
      </div>
      <div class="mb-3">
        <strong>電子郵件：</strong> {{ profileData.email }}
      </div>
      <div class="mb-3">
        <strong>手機號碼：</strong> {{ profileData.phone || '未設定' }}
      </div>
      <div class="mb-3">
        <strong>生日：</strong> {{ profileData.birthday || '未設定' }}
      </div>
      <div class="mb-3">
        <strong>性別：</strong> {{ getGenderText(profileData.gender) }}
      </div>
      <div class="mb-3">
        <strong>地址：</strong> {{ profileData.address || '未設定' }}
      </div>
      <div class="mb-3">
        <strong>帳號狀態：</strong> {{ profileData.active ? '啟用' : '停用' }}
      </div>
      <div class="mb-3">
        <strong>電子郵件驗證：</strong> {{ profileData.email_verified ? '已驗證' : '未驗證' }}
      </div>
      <div class="mb-3">
        <strong>最後登入時間：</strong> {{ profileData.last_login_time || '無紀錄' }}
      </div>
      <button @click="startEditing" class="btn btn-primary">編輯資料</button>
    </div>

    <!-- 個人資料編輯表單 -->
    <form @submit.prevent="updateProfile" v-if="!isLoading && !error && isEditing">
      <div class="mb-3">
        <label for="name" class="form-label">姓名</label>
        <input type="text" class="form-control" id="name" v-model="editedProfileData.name" required>
      </div>

      <div class="mb-3">
        <label for="email" class="form-label">電子郵件</label>
        <input type="email" class="form-control" id="email" v-model="editedProfileData.email" disabled>
      </div>

      <div class="mb-3">
        <label for="phone" class="form-label">手機號碼</label>
        <input type="tel" class="form-control" id="phone" v-model="editedProfileData.phone">
      </div>

      <div class="mb-3">
        <label for="birthday" class="form-label">生日</label>
        <input type="date" class="form-control" id="birthday" v-model="editedProfileData.birthday">
      </div>

      <div class="mb-3">
        <label class="form-label">性別</label>
        <div>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" id="male" value="MALE" v-model="editedProfileData.gender">
            <label class="form-check-label" for="male">男</label>
          </div>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" id="female" value="FEMALE" v-model="editedProfileData.gender">
            <label class="form-check-label" for="female">女</label>
          </div>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" id="other" value="OTHER" v-model="editedProfileData.gender">
            <label class="form-check-label" for="other">其他</label>
          </div>
        </div>
      </div>

      <div class="mb-3">
        <label for="address" class="form-label">地址</label>
        <input type="text" class="form-control" id="address" v-model="editedProfileData.address">
      </div>

      <button type="submit" class="btn btn-primary me-2" :disabled="isUpdating">
        <span v-if="isUpdating" class="spinner-border spinner-border-sm me-2"></span>
        {{ isUpdating ? '儲存中...' : '儲存' }}
      </button>
      <button type="button" class="btn btn-secondary" @click="cancelEditing">取消</button>
    </form>

    <AlertMessage v-if="updateSuccess" type="success" message="個人資料更新成功！" />
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useStore } from 'vuex'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import AlertMessage from '@/components/common/AlertMessage.vue'

export default {
  name: 'Profile',
  components: { LoadingSpinner, AlertMessage },

  setup() {
    const store = useStore()
    const isLoading = ref(false)
    const error = ref(null)
    const isUpdating = ref(false)
    const updateSuccess = ref(false)
    const isEditing = ref(false)

    const profileData = reactive({
      id: null,
      name: '',
      email: '',
      phone: '',
      birthday: '',
      gender: '',
      role: '',
      address: '',
      avatar: '',
      active: true,
      email_verified: false,
      last_login_time: null,
      last_login_ip: '',
      created_at: null,
      updated_at: null,
      version: 0
    })

    const editedProfileData = reactive({ ...profileData })

    const fetchProfile = async () => {
      try {
        isLoading.value = true
        error.value = null
        const response = await store.dispatch('user/fetchProfile')
        if (response.success) {
          Object.assign(profileData, response.data)
        } else {
          throw new Error(response.message)
        }
      } catch (err) {
        error.value = '載入個人資料失敗，請稍後再試'
        console.error('Error fetching profile:', err)
      } finally {
        isLoading.value = false
      }
    }

    const updateProfile = async () => {
      if (!validateForm()) return

      try {
        isUpdating.value = true
        updateSuccess.value = false

        const updateData = {
          name: editedProfileData.name,
          phone: editedProfileData.phone,
          birthday: editedProfileData.birthday,
          gender: editedProfileData.gender,
          address: editedProfileData.address,
          version: profileData.version
        }

        const response = await store.dispatch('user/updateProfile', updateData)
        if (response.success) {
          Object.assign(profileData, response.data)
          updateSuccess.value = true
          isEditing.value = false
          setTimeout(() => {
            updateSuccess.value = false
          }, 3000)
        } else {
          throw new Error(response.message)
        }
      } catch (err) {
        error.value = '更新個人資料失敗，請稍後再試'
        console.error('Error updating profile:', err)
      } finally {
        isUpdating.value = false
      }
    }

    const validateForm = () => {
      if (!editedProfileData.name.trim()) {
        error.value = '請輸入姓名'
        return false
      }
      if (editedProfileData.phone && !editedProfileData.phone.match(/^09\d{8}$/)) {
        error.value = '請輸入有效的手機號碼'
        return false
      }
      return true
    }

    const startEditing = () => {
      Object.assign(editedProfileData, profileData)
      isEditing.value = true
      error.value = null
    }

    const cancelEditing = () => {
      isEditing.value = false
      error.value = null
    }

    const getGenderText = (gender) => {
      const genderMap = {
        'MALE': '男',
        'FEMALE': '女',
        'OTHER': '其他'
      }
      return genderMap[gender] || '未設定'
    }

    onMounted(fetchProfile)

    return {
      isLoading,
      error,
      isUpdating,
      updateSuccess,
      isEditing,
      profileData,
      editedProfileData,
      updateProfile,
      startEditing,
      cancelEditing,
      getGenderText
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
