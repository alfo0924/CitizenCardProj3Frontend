<template>
  <div class="login-container">
    <div class="login-form">
      <h2 class="text-center mb-4">會員登入</h2>

      <AlertMessage
          v-if="error"
          type="error"
          :message="error"
          @close="clearError"
      />

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
          <div class="invalid-feedback" v-if="validationErrors.email">
            {{ validationErrors.email }}
          </div>
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
                tabindex="-1"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
          <div class="invalid-feedback" v-if="validationErrors.password">
            {{ validationErrors.password }}
          </div>
        </div>

        <button
            type="submit"
            class="btn btn-danger w-100 mb-3"
            :disabled="isLoading || !isFormValid"
        >
          <LoadingSpinner v-if="isLoading" size="sm" class="me-2"/>
          {{ isLoading ? '登入中...' : '登入' }}
        </button>

        <div class="text-center">
          <span class="text-muted">還沒有帳號？</span>
          <router-link to="/register" class="text-primary ms-1">立即註冊</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import AlertMessage from '@/components/common/AlertMessage.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

export default {
  name: 'LoginForm',
  components: { AlertMessage, LoadingSpinner },

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
      if (!validateEmail() || !validatePassword()) return

      try {
        isLoading.value = true
        error.value = ''

        const response = await store.dispatch('auth/login', {
          email: formData.email.toLowerCase(),
          password: formData.password
        })

        if (response.status === 404) {
          error.value = '無此帳號，請先註冊'
          setTimeout(() => {
            router.push('/register')
          }, 5000)
          return
        }

        router.push('/')
      } catch (err) {
        if (err.response?.status === 404) {
          error.value = '無此帳號，請先註冊'
          setTimeout(() => {
            router.push('/register')
          }, 5000)
        } else if (err.response?.status === 401) {
          error.value = '帳號密碼錯誤'
        } else {
          error.value = '登入失敗，請稍後再試'
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
.login-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 2rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
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

.invalid-feedback {
  display: block;
  font-size: 0.875rem;
}

@media (max-width: 576px) {
  .login-form {
    padding: 1.5rem;
  }
}
</style>
