<template>
  <div class="register-container">
    <div class="register-box">
      <h2 class="text-center mb-4">會員註冊</h2>

      <!-- 錯誤訊息顯示 -->
      <div v-if="error" class="alert alert-danger" role="alert">
        {{ error }}
      </div>

      <!-- 註冊表單 -->
      <form @submit.prevent="handleSubmit" class="needs-validation" novalidate>
        <!-- 姓名 -->
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

        <!-- Email -->
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

        <!-- 密碼 -->
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
          <!-- 密碼強度指示器 -->
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

        <!-- 手機號碼 -->
        <div class="form-group mb-3">
          <label for="phone" class="form-label">手機號碼</label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-phone"></i>
            </span>
            <input
                type="tel"
                class="form-control"
                id="phone"
                v-model="formData.phone"
                :class="{ 'is-invalid': validationErrors.phone }"
                required
                placeholder="請輸入手機號碼"
            >
          </div>
          <div class="invalid-feedback" v-if="validationErrors.phone">
            {{ validationErrors.phone }}
          </div>
        </div>

        <!-- 生日 -->
        <div class="form-group mb-3">
          <label for="birthday" class="form-label">生日</label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-calendar"></i>
            </span>
            <input
                type="date"
                class="form-control"
                id="birthday"
                v-model="formData.birthday"
                :class="{ 'is-invalid': validationErrors.birthday }"
                required
            >
          </div>
          <div class="invalid-feedback" v-if="validationErrors.birthday">
            {{ validationErrors.birthday }}
          </div>
        </div>

        <!-- 性別 -->
        <div class="form-group mb-3">
          <label class="form-label">性別</label>
          <div class="d-flex">
            <div class="form-check me-3">
              <input
                  type="radio"
                  class="form-check-input"
                  id="male"
                  value="MALE"
                  v-model="formData.gender"
                  required
              >
              <label class="form-check-label" for="male">男</label>
            </div>
            <div class="form-check me-3">
              <input
                  type="radio"
                  class="form-check-input"
                  id="female"
                  value="FEMALE"
                  v-model="formData.gender"
              >
              <label class="form-check-label" for="female">女</label>
            </div>
            <div class="form-check">
              <input
                  type="radio"
                  class="form-check-input"
                  id="other"
                  value="OTHER"
                  v-model="formData.gender"
              >
              <label class="form-check-label" for="other">其他</label>
            </div>
          </div>
        </div>

        <!-- 地址 -->
        <div class="form-group mb-3">
          <label for="address" class="form-label">地址</label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-home"></i>
            </span>
            <input
                type="text"
                class="form-control"
                id="address"
                v-model="formData.address"
                placeholder="請輸入地址（選填）"
            >
          </div>
        </div>

        <!-- 服務條款 -->
        <div class="form-check mb-3">
          <input
              type="checkbox"
              class="form-check-input"
              id="terms"
              v-model="formData.agreeToTerms"
              :class="{ 'is-invalid': validationErrors.agreeToTerms }"
              required
          >
          <label class="form-check-label" for="terms">
            我同意 <a href="#" @click.prevent="showTerms">服務條款</a> 和
            <a href="#" @click.prevent="showPrivacy">隱私政策</a>
          </label>
          <div class="invalid-feedback" v-if="validationErrors.agreeToTerms">
            {{ validationErrors.agreeToTerms }}
          </div>
        </div>

        <!-- 註冊按鈕 -->
        <button
            type="submit"
            class="btn btn-primary w-100 mb-3"
            :disabled="isLoading"
        >
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
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

export default {
  name: 'Register',

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
      address: '',
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

      // 長度檢查
      if (formData.password.length >= 8) strength += 20

      // 包含數字
      if (/\d/.test(formData.password)) strength += 20

      // 包含小寫字母
      if (/[a-z]/.test(formData.password)) strength += 20

      // 包含大寫字母
      if (/[A-Z]/.test(formData.password)) strength += 20

      // 包含特殊字符
      if (/[!@#$%^&*]/.test(formData.password)) strength += 20

      return strength
    })

    // 密碼強度文字
    const passwordStrengthText = computed(() => {
      if (passwordStrength.value < 40) return '弱'
      if (passwordStrength.value < 80) return '中'
      return '強'
    })

    // 密碼強度顏色
    const passwordStrengthClass = computed(() => {
      if (passwordStrength.value < 40) return 'bg-danger'
      if (passwordStrength.value < 80) return 'bg-warning'
      return 'bg-success'
    })

    // 表單驗證
    const validateForm = () => {
      let isValid = true

      // 重置錯誤訊息
      Object.keys(validationErrors).forEach((key) => {
        validationErrors[key] = ''
      })

      // 姓名驗證
      if (!formData.name) {
        validationErrors.name = '請輸入姓名'
        isValid = false
      }

      // Email驗證
      if (!formData.email) {
        validationErrors.email = '請輸入電子郵件'
        isValid = false
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        validationErrors.email = '請輸入有效的電子郵件格式'
        isValid = false
      }

      // 密碼驗證
      if (!formData.password) {
        validationErrors.password = '請輸入密碼'
        isValid = false
      } else if (formData.password.length < 8) {
        validationErrors.password = '密碼長度至少8個字符'
        isValid = false
      } else if (passwordStrength.value < 60) {
        validationErrors.password = '密碼強度不足'
        isValid = false
      }

      // 確認密碼驗證
      if (!formData.confirmPassword) {
        validationErrors.confirmPassword = '請確認密碼'
        isValid = false
      } else if (formData.password !== formData.confirmPassword) {
        validationErrors.confirmPassword = '兩次密碼輸入不一致'
        isValid = false
      }

      // 手機號碼驗證
      if (!formData.phone) {
        validationErrors.phone = '請輸入手機號碼'
        isValid = false
      } else if (!/^09\d{8}$/.test(formData.phone)) {
        validationErrors.phone = '請輸入有效的手機號碼格式'
        isValid = false
      }

      // 生日驗證
      if (!formData.birthday) {
        validationErrors.birthday = '請選擇生日'
        isValid = false
      }

      // 服務條款驗證
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

        const response = await store.dispatch('auth/register', formData)

        if (response.success) {
          router.push('/login?registered=true')
        } else {
          error.value = response.message || '註冊失敗，請稍後再試'
        }
      } catch (err) {
        error.value = '註冊時發生錯誤，請稍後再試'
        console.error('Registration error:', err)
      } finally {
        isLoading.value = false
      }
    }

    // 切換密碼顯示
    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value
    }

    // 顯示服務條款
    const showTerms = () => {
      // 實作服務條款顯示邏輯
    }

    // 顯示隱私政策
    const showPrivacy = () => {
      // 實作隱私政策顯示邏輯
      alert('隱私政策內容將在新視窗開啟')
      // 或者使用modal顯示
    }

    // 返回所有需要的響應式數據和方法
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
      togglePasswordVisibility,
      showTerms,
      showPrivacy
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
  background-color: var(--bg-light);
  padding: 2rem 1rem;
}

.register-box {
  background-color: white;
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
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
  border-color: var(--border-color);
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
  background-color: var(--danger-color) !important;
}

.progress-bar.bg-warning {
  background-color: var(--warning-color) !important;
}

.progress-bar.bg-success {
  background-color: var(--success-color) !important;
}

.form-check {
  margin-bottom: 0.5rem;
}

.form-check-input:checked {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.btn-primary {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background-color: var(--primary-dark);
  border-color: var(--primary-dark);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  opacity: 0.65;
}

.invalid-feedback {
  display: block;
  font-size: 0.875rem;
  color: var(--danger-color);
}

.form-control.is-invalid {
  border-color: var(--danger-color);
  background-image: none;
}

.form-control.is-invalid:focus {
  border-color: var(--danger-color);
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}

input[type="date"] {
  padding: 0.375rem 0.75rem;
}

.gender-group {
  display: flex;
  gap: 1.5rem;
}

a {
  color: var(--primary-color);
  text-decoration: none;
  transition: color 0.3s ease;
}

a:hover {
  color: var(--primary-dark);
  text-decoration: underline;
}

@media (max-width: 576px) {
  .register-box {
    padding: 1.5rem;
  }

  .gender-group {
    flex-direction: column;
    gap: 0.5rem;
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

.register-box {
  animation: fadeIn 0.5s ease-out;
}

.spinner-border {
  width: 1rem;
  height: 1rem;
  border-width: 0.15em;
}

.tooltip {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: var(--border-radius-sm);
  display: none;
}

.form-group:hover .tooltip {
  display: block;
}

.terms-links {
  font-size: 0.875rem;
}

.terms-links a {
  text-decoration: underline;
  margin: 0 0.25rem;
}

.password-strength small {
  font-size: 0.75rem;
}

.validation-message {
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.validation-message.success {
  color: var(--success-color);
}

.validation-message.error {
  color: var(--danger-color);
}
</style>