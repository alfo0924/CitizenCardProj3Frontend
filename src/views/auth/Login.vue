<template>
  <div class="login-container">


    <div class="login-box">
      <h2 class="text-center mb-4">會員登入</h2>

      <!-- 錯誤提示 -->
      <div v-if="error" class="alert alert-danger" role="alert">
        {{ error }}
      </div>

      <!-- 登入表單 -->
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

        <!-- 記住我 & 忘記密碼 -->
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div class="form-check">
            <input
                type="checkbox"
                class="form-check-input"
                id="rememberMe"
                v-model="formData.rememberMe"
            >
            <label class="form-check-label" for="rememberMe">記住我</label>
          </div>
          <router-link to="/forgot-password" class="text-primary">忘記密碼？</router-link>
        </div>

        <!-- 登入按鈕 -->
        <button
            type="submit"
            class="btn btn-primary w-100 mb-3"
            :disabled="isLoading"
        >
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
          {{ isLoading ? '登入中...' : '登入' }}
        </button>

        <!-- 分隔線 -->
        <div class="text-center mb-3">
          <span class="text-muted">或</span>
        </div>

        <!-- 社交登入按鈕 -->
        <div class="social-login">
          <button
              type="button"
              class="btn btn-outline-primary w-100 mb-2"
              @click="handleGoogleLogin"
              :disabled="isLoading"
          >
            <i class="fab fa-google me-2"></i>使用 Google 帳號登入
          </button>
          <button
              type="button"
              class="btn btn-outline-primary w-100"
              @click="handleFacebookLogin"
              :disabled="isLoading"
          >
            <i class="fab fa-facebook me-2"></i>使用 Facebook 帳號登入
          </button>
        </div>

        <!-- 註冊連結 -->
        <div class="text-center mt-3">
          <span class="text-muted">還沒有帳號？</span>
          <router-link to="/register" class="text-primary ms-1">立即註冊</router-link>
        </div>
        <!-- 返回按鈕 -->

      </form>
      <div class="back-button">
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
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'Login',

  setup() {
    const store = useStore()
    const router = useRouter()

    // 表單數據
    const formData = reactive({
      email: '',
      password: '',
      rememberMe: false
    })

    // 狀態管理
    const isLoading = ref(false)
    const error = ref('')
    const showPassword = ref(false)
    const validationErrors = reactive({
      email: '',
      password: ''
    })

    // 表單驗證
    const validateForm = () => {
      let isValid = true
      validationErrors.email = ''
      validationErrors.password = ''

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
      }

      return isValid
    }

    // 處理表單提交
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
          router.push('/dashboard')
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

    // 切換密碼顯示
    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value
    }

    // 社交登入處理
    const handleGoogleLogin = async () => {
      try {
        isLoading.value = true
        const response = await store.dispatch('auth/googleLogin')
        if (response.success) {
          router.push('/dashboard')
        } else {
          error.value = '使用 Google 登入失敗'
        }
      } catch (err) {
        error.value = '使用 Google 登入失敗'
        console.error('Google login error:', err)
      } finally {
        isLoading.value = false
      }
    }

    const handleFacebookLogin = async () => {
      try {
        isLoading.value = true
        const response = await store.dispatch('auth/facebookLogin')
        if (response.success) {
          router.push('/dashboard')
        } else {
          error.value = '使用 Facebook 登入失敗'
        }
      } catch (err) {
        error.value = '使用 Facebook 登入失敗'
        console.error('Facebook login error:', err)
      } finally {
        isLoading.value = false
      }
    }

    // 返回和首頁導航
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
      handleGoogleLogin,
      handleFacebookLogin,
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
  background-color: var(--bg-light);
  padding: 1rem;
  position: relative;
}

.login-box {
  background-color: white;
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
  width: 100%;
  max-width: 400px;
}

.form-group {
  position: relative;
}

.input-group-text {
  background-color: transparent;
}

.input-group .form-control {
  border-left: none;
}

.input-group .form-control:focus {
  border-color: var(--border-color);
  box-shadow: none;
}

.btn-outline-secondary {
  border-left: none;
}

.social-login {
  margin-top: 1rem;
}

.social-login button {
  transition: all 0.3s ease;
}

.social-login button:hover {
  transform: translateY(-1px);
}

.form-check-label {
  user-select: none;
}

.invalid-feedback {
  display: block;
}

/* 更新返回按鈕樣式 */
.back-button {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.back-button .btn {
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.back-button .btn i {
  font-size: 0.875rem;
}

.back-button .btn:hover {
  transform: translateY(-1px);
}

@media (max-width: 576px) {
  .login-box {
    padding: 1.5rem;
  }

  .back-button {
    margin-top: 1rem;
    padding-top: 1rem;
  }

  .back-button .btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  }
}
</style>
