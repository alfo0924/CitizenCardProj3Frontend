<template>
  <div class="login-container">
    <div class="login-form">
      <h2 class="text-center mb-4">帳號登入</h2>

      <!-- Error Message -->
      <div v-if="error" class="alert alert-danger" role="alert">
        {{ error }}
      </div>

      <form @submit.prevent="handleSubmit">
        <!-- Account Input -->
        <div class="form-group mb-3">
          <label for="email" class="form-label">帳號</label>
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
                placeholder="輸入電子信箱"
                required
                autocomplete="email"
            />
          </div>
          <div class="invalid-feedback" v-if="validationErrors.email">
            {{ validationErrors.email }}
          </div>
        </div>

        <!-- Password Input -->
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
                placeholder="請輸入大小寫，至少8碼以上"
                required
                autocomplete="current-password"
            />
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
          <router-link to="/forgot-password" class="forgot-password text-danger">
            忘記密碼了嗎？
          </router-link>
        </div>

        <!-- Remember Me -->
        <div class="form-check mb-3">
          <input
              type="checkbox"
              class="form-check-input"
              id="rememberMe"
              v-model="formData.rememberMe"
          />
          <label class="form-check-label" for="rememberMe">記住我</label>
        </div>

        <!-- reCAPTCHA Placeholder -->
        <div class="recaptcha-container d-flex align-items-center mb-3">
          <input type="checkbox" id="not-robot" class="form-check-input me-2" required />
          <label for="not-robot" class="form-check-label">我不是機器人</label>
          <div class="ms-auto recaptcha-text">
            <small>reCAPTCHA</small><br />
            <small>隱私權 • 條款</small>
          </div>
        </div>

        <!-- Login Button -->
        <button
            type="submit"
            class="btn btn-login w-100 mb-3"
            :disabled="isLoading"
        >
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
          {{ isLoading ? '登入中...' : '登入' }}
        </button>

        <div class="social-login">
          <button type="button" class="btn btn-outline-primary w-100 mb-2" @click="handleGoogleLogin">
            <i class="fab fa-google me-2"></i>使用 Google 帳號登入
          </button>
          <button type="button" class="btn btn-outline-primary w-100" @click="handleFacebookLogin">
            <i class="fab fa-facebook me-2"></i>使用 Facebook 帳號登入
          </button>
        </div>

        <!-- Register Link -->
        <div class="text-center">
          <router-link to="/register" class="text-secondary">立即註冊</router-link>
        </div>
      </form>

      <!-- Back Buttons -->
      <div class="back-button mt-4 pt-4 border-top">
        <button class="btn btn-outline-secondary" @click="goBack">
          <i class="fas fa-arrow-left"></i> 返回
        </button>
        <button class="btn btn-outline-primary ms-2" @click="goHome">
          <i class="fas fa-home"></i> 回到首頁
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

export default {
  name: 'LoginForm',

  setup() {
    const router = useRouter()
    const store = useStore()

    // Form data
    const formData = reactive({
      email: '',
      password: '',
      rememberMe: false
    })

    // State
    const isLoading = ref(false)
    const error = ref('')
    const showPassword = ref(false)
    const validationErrors = reactive({
      email: '',
      password: ''
    })

    // Form validation
    const validateForm = () => {
      let isValid = true
      validationErrors.email = ''
      validationErrors.password = ''

      // Email validation
      if (!formData.email) {
        validationErrors.email = '請輸入電子郵件'
        isValid = false
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        validationErrors.email = '請輸入有效的電子郵件格式'
        isValid = false
      }

      // Password validation
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

        const response = await store.dispatch('auth/login', {
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe
        })

        if (response.success) {
          // 顯示登入成功提示
          store.dispatch('setNotification', {
            type: 'success',
            message: '登入成功！歡迎回來'
          })

          // 獲取重定向路徑，如果沒有則導向用戶首頁
          const redirectPath = router.currentRoute.value.query.redirect || '/profile'
          router.push(redirectPath)
        } else {
          error.value = response.message || '登入失敗，請稍後再試'
        }
      } catch (err) {
        error.value = '登入時發生錯誤，請稍後再試'
        console.error('Login error:', err)
      } finally {
        isLoading.value = false
      }
    }

    // Toggle password visibility
    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value
    }

    // Navigation
    const goBack = () => {
      router.back()
    }

    const goHome = () => {
      router.push('/')
    }

    return {
      formData,
      isLoading,
      error,
      showPassword,
      validationErrors,
      handleSubmit,
      togglePasswordVisibility,
      goBack,
      goHome
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #BA0043;
  padding: 1rem;
}

.login-form {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
  font-size: 1.2rem;
}

.form-label {
  font-weight: 600;
}

.input-group-text {
  background-color: transparent;
}

.form-control {
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 0.75rem;
}

.form-control:focus {
  border-color: #BA0043;
  box-shadow: 0 0 0 0.2rem rgba(186, 0, 67, 0.25);
}

.forgot-password {
  display: inline-block;
  font-size: 0.875rem;
  color: #c53030;
  margin-top: 0.5rem;
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

.recaptcha-container {
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.recaptcha-container .form-check-label {
  font-weight: 500;
  color: #333;
}

.recaptcha-text {
  text-align: right;
  font-size: 0.75rem;
  color: #555;
}

.btn-login {
  background-color: #BA0043;
  color: #fff;
  font-weight: 600;
  padding: 0.75rem;
  border-radius: 4px;
  border: none;
  transition: all 0.3s ease;
}

.btn-login:hover:not(:disabled) {
  background-color: #800000;
}

.btn-login:disabled {
  background-color: #d4d4d4;
  cursor: not-allowed;
}

.back-button {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.invalid-feedback {
  display: block;
}

@media (max-width: 576px) {
  .login-form {
    padding: 1.5rem;
  }
}
</style>
