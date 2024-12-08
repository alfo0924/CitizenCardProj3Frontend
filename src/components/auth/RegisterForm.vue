<template>
  <div class="register-container">
    <div class="register-form">
      <h2 class="text-center mb-4">會員註冊</h2>

      <AlertMessage
          v-if="error"
          type="error"
          :message="error"
          @close="error = ''"
      />

      <form @submit.prevent="handleSubmit" class="needs-validation" novalidate>
        <!-- 姓名輸入 -->
        <div class="form-group mb-3">
          <label for="name" class="form-label">姓名</label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-user"></i>
            </span>
            <input
                type="text"
                class="form-control"
                id="name"
                v-model="formData.name"
                :class="{ 'is-invalid': validationErrors.name }"
                required
                placeholder="請輸入姓名"
            >
          </div>
          <div class="invalid-feedback" v-if="validationErrors.name">
            {{ validationErrors.name }}
          </div>
        </div>

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
          <div class="password-strength mt-2" v-if="formData.password">
            <div class="progress">
              <div
                  class="progress-bar"
                  :class="passwordStrengthClass"
                  :style="{ width: passwordStrength + '%' }"
              ></div>
            </div>
            <small class="text-muted">{{ passwordStrengthText }}</small>
          </div>
        </div>

        <!-- 確認密碼 -->
        <div class="form-group mb-3">
          <label for="confirmPassword" class="form-label">確認密碼</label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-lock"></i>
            </span>
            <input
                :type="showPassword ? 'text' : 'password'"
                class="form-control"
                id="confirmPassword"
                v-model="formData.confirmPassword"
                :class="{ 'is-invalid': validationErrors.confirmPassword }"
                required
                placeholder="請再次輸入密碼"
            >
          </div>
          <div class="invalid-feedback" v-if="validationErrors.confirmPassword">
            {{ validationErrors.confirmPassword }}
          </div>
        </div>

        <!-- 註冊按鈕 -->
        <button
            type="submit"
            class="btn btn-primary w-100 mb-3"
            :disabled="isLoading"
        >
          <LoadingSpinner v-if="isLoading" size="sm" class="me-2"/>
          {{ isLoading ? '註冊中...' : '註冊' }}
        </button>

        <!-- 登入連結 -->
        <div class="text-center">
          <span class="text-muted">已經有帳號？</span>
          <router-link to="/login" class="text-primary ms-1">立即登入</router-link>
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
  name: 'RegisterForm',

  components: {
    AlertMessage,
    LoadingSpinner
  },

  setup() {
    const store = useStore()
    const router = useRouter()

    // 表單數據
    const formData = reactive({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      birthday: '',
      gender: '',
      agreeToTerms: false
    })

    // 狀態控制
    const isLoading = ref(false)
    const error = ref('')
    const showPassword = ref(false)
    const validationErrors = reactive({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      birthday: '',
      agreeToTerms: ''
    })

    // 密碼強度計算
    const passwordStrength = computed(() => {
      if (!formData.password) return 0
      let strength = 0
      if (formData.password.length >= 8) strength += 20
      if (/\d/.test(formData.password)) strength += 20
      if (/[a-z]/.test(formData.password)) strength += 20
      if (/[A-Z]/.test(formData.password)) strength += 20
      if (/[!@#$%^&*]/.test(formData.password)) strength += 20
      return strength
    })

    const passwordStrengthText = computed(() => {
      if (passwordStrength.value < 40) return '弱'
      if (passwordStrength.value < 80) return '中'
      return '強'
    })

    const passwordStrengthClass = computed(() => {
      if (passwordStrength.value < 40) return 'bg-danger'
      if (passwordStrength.value < 80) return 'bg-warning'
      return 'bg-success'
    })

    // 表單驗證
    const validateForm = () => {
      let isValid = true
      Object.keys(validationErrors).forEach(key => {
        validationErrors[key] = ''
      })

      if (!formData.name) {
        validationErrors.name = '請輸入姓名'
        isValid = false
      }

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
      } else if (formData.password.length < 8) {
        validationErrors.password = '密碼長度至少8個字符'
        isValid = false
      }

      if (!formData.confirmPassword) {
        validationErrors.confirmPassword = '請確認密碼'
        isValid = false
      } else if (formData.password !== formData.confirmPassword) {
        validationErrors.confirmPassword = '兩次密碼輸入不一致'
        isValid = false
      }

      if (!formData.phone) {
        validationErrors.phone = '請輸入手機號碼'
        isValid = false
      } else if (!/^09\d{8}$/.test(formData.phone)) {
        validationErrors.phone = '請輸入有效的手機號碼格式'
        isValid = false
      }

      if (!formData.birthday) {
        validationErrors.birthday = '請選擇生日'
        isValid = false
      }

      if (!formData.agreeToTerms) {
        validationErrors.agreeToTerms = '請同意服務條款和隱私政策'
        isValid = false
      }

      return isValid
    }

    // 處理表單提交
    const handleSubmit = async () => {
      if (!validateForm()) return

      try {
        isLoading.value = true
        error.value = ''

        await store.dispatch('auth/register', formData)
        router.push('/login')
      } catch (err) {
        error.value = err.message || '註冊失敗，請稍後再試'
        console.error('Registration error:', err)
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
      passwordStrength,
      passwordStrengthText,
      passwordStrengthClass,
      handleSubmit,
      togglePasswordVisibility
    }
  }
}
</script>
<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  padding: 2rem 1rem;
}

.register-form {
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
}

.form-group {
  position: relative;
  margin-bottom: 1.5rem;
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

.password-strength {
  margin-top: 0.5rem;
}

.progress {
  height: 4px;
  margin-bottom: 0.25rem;
}

.progress-bar {
  transition: width 0.3s ease;
}

.progress-bar.bg-danger {
  background-color: #dc3545 !important;
}

.progress-bar.bg-warning {
  background-color: #ffc107 !important;
}

.progress-bar.bg-success {
  background-color: #28a745 !important;
}

.btn-primary {
  background-color: #BA0043;
  border-color: #BA0043;
  transition: all 0.3s ease;
}

.btn-primary:hover:not(:disabled) {
  background-color: #990038;
  border-color: #990038;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background-color: #BA0043;
  border-color: #BA0043;
  opacity: 0.65;
}

.form-check-input:checked {
  background-color: #BA0043;
  border-color: #BA0043;
}

.invalid-feedback {
  display: block;
  font-size: 0.875rem;
  color: #dc3545;
}

.form-control.is-invalid {
  border-color: #dc3545;
  background-image: none;
}

.form-control.is-invalid:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}

input[type="date"] {
  padding: 0.375rem 0.75rem;
}

a {
  color: #BA0043;
  text-decoration: none;
  transition: color 0.3s ease;
}

a:hover {
  color: #990038;
  text-decoration: underline;
}

@media (max-width: 576px) {
  .register-form {
    padding: 1.5rem;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.register-form {
  animation: fadeIn 0.5s ease-out;
}
</style>
