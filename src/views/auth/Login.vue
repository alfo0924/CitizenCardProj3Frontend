<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-form">
        <h2 class="text-center mb-4">會員登入</h2>

        <AlertMessage
            v-if="error"
            type="error"
            :message="error"
            @close="error = ''"
        />

        <form @submit.prevent="handleSubmit">
          <!-- Email輸入 -->
          <div class="form-group mb-3">
            <label for="email" class="form-label">電子郵件</label>
            <div class="input-group">
              <span class="input-group-text">
                <i class="fas fa-envelope"></i>
              </span>
              <input
                  type="email"
                  class="form-control"
                  id="email"
                  v-model="formData.email"
                  :class="{ 'is-invalid': validationErrors.email }"
                  required
                  placeholder="請輸入電子郵件"
                  maxlength="100"
                  autocomplete="email"
              >
            </div>
            <div class="invalid-feedback" v-if="validationErrors.email">
              {{ validationErrors.email }}
            </div>
          </div>

          <!-- 密碼輸入 -->
          <div class="form-group mb-3">
            <label for="password" class="form-label">密碼</label>
            <div class="input-group">
              <span class="input-group-text">
                <i class="fas fa-lock"></i>
              </span>
              <input
                  :type="showPassword ? 'text' : 'password'"
                  class="form-control"
                  id="password"
                  v-model="formData.password"
                  :class="{ 'is-invalid': validationErrors.password }"
                  required
                  placeholder="請輸入密碼"
                  maxlength="255"
                  autocomplete="current-password"
              >
              <button
                  type="button"
                  class="btn btn-outline-secondary"
                  @click="togglePasswordVisibility"
              >
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <div class="invalid-feedback" v-if="validationErrors.password">
              {{ validationErrors.password }}
            </div>
          </div>

          <!-- 登入按鈕 -->
          <button
              type="submit"
              class="btn btn-primary w-100 mb-3"
              :disabled="isLoading"
          >
            <LoadingSpinner v-if="isLoading" size="sm" class="me-2"/>
            {{ isLoading ? '登入中...' : '登入' }}
          </button>

          <!-- 註冊連結 -->
          <div class="text-center">
            <span class="text-muted">還沒有帳號？</span>
            <router-link to="/register" class="text-primary ms-1">立即註冊</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import AlertMessage from '@/components/common/AlertMessage.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

export default {
  name: 'Login',

  components: {
    AlertMessage,
    LoadingSpinner
  },

  setup() {
    const store = useStore()
    const router = useRouter()

    const formData = reactive({
      email: '',
      password: ''
    })

    const isLoading = ref(false)
    const error = ref('')
    const showPassword = ref(false)
    const validationErrors = reactive({
      email: '',
      password: ''
    })

    const validateForm = () => {
      let isValid = true
      validationErrors.email = ''
      validationErrors.password = ''

      if (!formData.email) {
        validationErrors.email = '請輸入電子郵件'
        isValid = false
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        validationErrors.email = '請輸入有效的電子郵件格式'
        isValid = false
      }

      if (!formData.password) {
        validationErrors.password = '請輸入密碼'
        isValid = false
      }

      return isValid
    }

    const handleSubmit = async () => {
      if (!validateForm()) return

      try {
        isLoading.value = true
        error.value = ''

        await store.dispatch('auth/login', {
          email: formData.email.trim().toLowerCase(),
          password: formData.password
        })

        router.push('/')
      } catch (err) {
        if (err.response?.status === 401) {
          error.value = '帳號或密碼錯誤'
        } else if (err.response?.status === 403) {
          error.value = '帳戶已被停用'
        } else {
          error.value = '登入失敗，請稍後再試'
        }
        console.error('Login error:', err)
      } finally {
        isLoading.value = false
      }
    }

    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value
    }

    return {
      formData,
      isLoading,
      error,
      showPassword,
      validationErrors,
      handleSubmit,
      togglePasswordVisibility
    }
  }
}
</script>

<style scoped>
/* 保持原有樣式不變 */
</style>
