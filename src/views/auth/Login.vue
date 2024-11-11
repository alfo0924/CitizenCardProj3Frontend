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
          <label for="account" class="form-label">帳號</label>
          <input
            type="text"
            class="form-control"
            id="account"
            v-model="formData.account"
            placeholder="輸入手機號碼/電子信箱/市民卡號"
            required
          />
        </div>

        <!-- Password Input -->
        <div class="form-group mb-3">
          <label for="password" class="form-label">密碼</label>
          <input
            :type="showPassword ? 'text' : 'password'"
            class="form-control"
            id="password"
            v-model="formData.password"
            placeholder="請輸入大小寫，至少8碼以上"
            required
          />
          <router-link to="/forgot-password" class="forgot-password text-danger">忘記密碼了嗎？</router-link>
        </div>

        <!-- reCAPTCHA Placeholder -->
        <div class="recaptcha-container d-flex align-items-center mb-3">
          <input type="checkbox" id="not-robot" class="form-check-input me-2" />
          <label for="not-robot" class="form-check-label">我不是機器人</label>
          <div class="ms-auto recaptcha-text">
            <small>reCAPTCHA</small><br />
            <small>隱私權 • 條款</small>
          </div>
        </div>

        <!-- Login Button -->
        <button type="submit" class="btn btn-login w-100 mb-3">
          登入
        </button>

        <!-- Register Link -->
        <div class="text-center">
          <router-link to="/register" class="text-secondary">立即註冊</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'LoginForm',

  setup() {
    const router = useRouter()

    // Form data
    const formData = reactive({
      account: '',
      password: '',
    })

    const error = ref('')
    const showPassword = ref(false)

    // Handle form submission
    const handleSubmit = () => {
      // Form submission logic here
      console.log('Form submitted with:', formData)
    }

    return {
      formData,
      error,
      showPassword,
      handleSubmit,
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
  background-color: #BA0043; /* Light pink background */
  padding: 1rem;
}

.login-form {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.form-label {
  font-weight: 600;
}

.form-control {
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 0.75rem;
}

.forgot-password {
  display: inline-block;
  font-size: 0.875rem;
  color: #c53030; /* Dark red color */
  margin-top: 0.5rem;
}

/* reCAPTCHA Placeholder */
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
  background-color: #BA0043; /* Dark red background */
  color: #fff;
  font-weight: 600;
  padding: 0.75rem;
  border-radius: 4px;
  border: none;
}

.btn-login:hover {
  background-color: #800000;
}

.text-center {
  font-size: 0.9rem;
}

.text-secondary {
  color: #6c757d;
}

.text-secondary:hover {
  color: #495057;
}
</style>
