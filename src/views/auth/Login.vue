<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-form">
        <h2 class="text-center mb-4">會員登入</h2>

        <!-- 錯誤訊息顯示區域 -->
        <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
          {{ error }}
          <button type="button" class="btn-close" @click="clearError" aria-label="Close"></button>
        </div>

        <form @submit.prevent="handleSubmit" novalidate>
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
                  v-model.trim="formData.email"
                  :class="{ 'is-invalid': validationErrors.email }"
                  required
                  placeholder="請輸入電子郵件"
                  maxlength="100"
                  autocomplete="email"
                  @input="validateEmail"
              >
            </div>
            <small class="text-danger" v-if="validationErrors.email">
              {{ validationErrors.email }}
            </small>
          </div>

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
                  @input="validatePassword"
              >
              <button
                  type="button"
                  class="btn btn-outline-secondary"
                  @click="togglePasswordVisibility"
              >
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <small class="text-danger" v-if="validationErrors.password">
              {{ validationErrors.password }}
            </small>
          </div>

          <button
              type="submit"
              class="btn btn-danger w-100 mb-3"
              :disabled="isLoading || !isFormValid"
          >
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
            {{ isLoading ? '登入中...' : '登入' }}
          </button>

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
import { ref, reactive, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'LoginForm',

  setup() {
    const store = useStore()
    const router = useRouter()

    const formData = reactive({
      email: '',
      password: ''
    })

    const validationErrors = reactive({
      email: '',
      password: ''
    })

    const isLoading = ref(false)
    const error = ref('')
    const showPassword = ref(false)

    const validateEmail = () => {
      validationErrors.email = ''
      if (!formData.email) {
        validationErrors.email = '請輸入電子郵件'
        return false
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        validationErrors.email = '請輸入有效的電子郵件格式'
        return false
      }
      return true
    }

    const validatePassword = () => {
      validationErrors.password = ''
      if (!formData.password) {
        validationErrors.password = '請輸入密碼'
        return false
      }
      if (formData.password.length < 6) {
        validationErrors.password = '密碼長度不得小於6個字元'
        return false
      }
      return true
    }

    const isFormValid = computed(() => {
      return formData.email &&
          formData.password &&
          !validationErrors.email &&
          !validationErrors.password
    })

    const clearError = () => {
      error.value = ''
    }

    const handleSubmit = async () => {
      if (!validateEmail() || !validatePassword()) {
        return
      }

      try {
        isLoading.value = true
        error.value = ''

        const loginData = {
          email: formData.email.toLowerCase(),
          password: formData.password
        }

        await store.dispatch('auth/login', loginData)
        router.push('/')
      } catch (err) {
        console.error('Login error:', err)

        // 處理不同類型的錯誤
        if (err.response) {
          const { status, data } = err.response

          // 優先使用後端返回的錯誤訊息
          if (data && data.message) {
            error.value = data.message
            return
          }

          // 根據HTTP狀態碼設置錯誤訊息
          switch (status) {
            case 400:
              error.value = '請求格式錯誤，請檢查輸入內容'
              break
            case 401:
              error.value = '帳號或密碼錯誤'
              break
            case 403:
              error.value = '帳戶已被停用'
              break
            case 404:
              error.value = '無此帳號，請先註冊'
              break
            case 422:
              error.value = '驗證失敗，請檢查輸入資料'
              break
            case 429:
              error.value = '登入嘗試次數過多，請稍後再試'
              break
            case 500:
              error.value = '系統發生錯誤，請稍後再試'
              break
            default:
              error.value = '登入失敗，請稍後再試'
          }
        } else if (err.request) {
          // 請求已發送但沒有收到回應
          error.value = '無法連接到伺服器，請檢查網路連線'
        } else {
          // 其他錯誤
          error.value = err.message || '登入過程發生錯誤'
        }
      } finally {
        isLoading.value = false
      }
    }

    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value
    }

    return {
      formData,
      validationErrors,
      isLoading,
      error,
      showPassword,
      isFormValid,
      handleSubmit,
      togglePasswordVisibility,
      clearError,
      validateEmail,
      validatePassword
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 2rem 0;
}

.login-container {
  min-height: calc(100vh - 4rem);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.login-form {
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.input-group-text {
  background-color: transparent;
  border-right: none;
}

.input-group .form-control {
  border-left: none;
}

.input-group .form-control:focus {
  border-color: #dee2e6;
  box-shadow: none;
}

.btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
}

.btn-danger:hover:not(:disabled) {
  background-color: #bb2d3b;
  border-color: #b02a37;
}

.alert {
  margin-bottom: 1rem;
}

@media (max-width: 576px) {
  .login-form {
    padding: 1.5rem;
  }
}
</style>
