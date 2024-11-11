<template>
  <div class="register-container">
    <div class="register-box">
      <h2 class="text-center mb-4">會員註冊</h2>

      <!-- Error Message -->
      <div v-if="error" class="alert alert-danger" role="alert">
        {{ error }}
      </div>

      <!-- Registration Form -->
      <form @submit.prevent="handleSubmit">
        <!-- Name -->
        <div class="form-group mb-3">
          <label for="name" class="form-label">姓名</label>
          <input
            type="text"
            class="form-control"
            id="name"
            v-model="formData.name"
            placeholder="請輸入姓名"
            required
          />
        </div>

        <!-- Email -->
        <div class="form-group mb-3">
          <label for="email" class="form-label">電子郵件</label>
          <input
            type="email"
            class="form-control"
            id="email"
            v-model="formData.email"
            placeholder="請輸入電子郵件"
            required
          />
        </div>

        <!-- Password -->
        <div class="form-group mb-3">
          <label for="password" class="form-label">密碼</label>
          <input
            :type="showPassword ? 'text' : 'password'"
            class="form-control"
            id="password"
            v-model="formData.password"
            placeholder="請輸入密碼"
            required
          />
          <button
            type="button"
            class="btn btn-outline-secondary show-password-btn"
            @click="togglePasswordVisibility"
          >
            <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
          </button>
        </div>

        <!-- Confirm Password -->
        <div class="form-group mb-3">
          <label for="confirmPassword" class="form-label">確認密碼</label>
          <input
            :type="showPassword ? 'text' : 'password'"
            class="form-control"
            id="confirmPassword"
            v-model="formData.confirmPassword"
            placeholder="請再次輸入密碼"
            required
          />
        </div>

        <!-- Phone Number -->
        <div class="form-group mb-3">
          <label for="phone" class="form-label">手機號碼</label>
          <input
            type="tel"
            class="form-control"
            id="phone"
            v-model="formData.phone"
            placeholder="請輸入手機號碼"
            required
          />
        </div>

        <!-- Terms and Conditions -->
        <div class="form-check mb-3">
          <input
            type="checkbox"
            class="form-check-input"
            id="terms"
            v-model="formData.agreeToTerms"
            required
          />
          <label class="form-check-label" for="terms">
            我同意 <a href="#" @click.prevent="showTerms">服務條款</a> 和
            <a href="#" @click.prevent="showPrivacy">隱私政策</a>
          </label>
        </div>

        <!-- Register Button -->
        <button type="submit" class="btn btn-primary w-100 mb-3">
          註冊
        </button>

        <!-- Login Link -->
        <div class="text-center">
          <span class="text-muted">已經有帳號？</span>
          <router-link to="/login" class="text-primary ms-1">立即登入</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'

export default {
  name: 'RegisterForm',

  setup() {
    const formData = reactive({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      agreeToTerms: false
    })

    const error = ref('')
    const showPassword = ref(false)

    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value
    }

    const handleSubmit = () => {
      console.log('Form submitted:', formData)
      // Registration logic
    }

    const showTerms = () => {
      alert('顯示服務條款')
    }

    const showPrivacy = () => {
      alert('顯示隱私政策')
    }

    return {
      formData,
      error,
      showPassword,
      togglePasswordVisibility,
      handleSubmit,
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
  background-color: #BA0043; /* Light pink background */
  padding: 1rem;
}

.register-box {
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

.btn-primary {
  background-color: #BA0043; /* Dark red */
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 4px;
}

.btn-primary:hover {
  background-color: #800000;
}

.show-password-btn {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
}

.form-check-label a {
  color: #800000;
  text-decoration: underline;
  cursor: pointer;
}

.text-primary {
  color: #800000;
}

.text-primary:hover {
  color: #BA0043;
}
</style>
