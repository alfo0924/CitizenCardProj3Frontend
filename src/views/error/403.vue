<template>
  <div class="error-page">
    <div class="error-content text-center">
      <div class="error-icon mb-4">
        <i class="fas fa-lock"></i>
      </div>

      <h1 class="error-code">403</h1>
      <h2 class="error-title mb-4">無權限訪問</h2>

      <p class="error-message mb-4">
        很抱歉，您沒有權限訪問此頁面。如果您認為這是一個錯誤，請聯繫系統管理員。
      </p>

      <div class="error-actions">
        <router-link to="/" class="btn btn-primary me-3">
          <i class="fas fa-home me-2"></i>
          回到首頁
        </router-link>

        <button
            class="btn btn-outline-secondary"
            @click="goBack"
        >
          <i class="fas fa-arrow-left me-2"></i>
          返回上一頁
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  name: 'Forbidden',

  setup() {
    const router = useRouter()

    const goBack = () => {
      router.back()
    }

    return {
      goBack
    }
  }
}
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-light);
  padding: 2rem;
}

.error-content {
  max-width: 500px;
  padding: 3rem;
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
}

.error-icon {
  font-size: 4rem;
  color: var(--warning-color);
}

.error-code {
  font-size: 6rem;
  font-weight: 700;
  color: var(--danger-color);
  margin-bottom: 1rem;
  line-height: 1;
}

.error-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-color);
}

.error-message {
  color: var(--text-secondary);
  font-size: 1.1rem;
  line-height: 1.6;
}

.error-actions {
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn i {
  font-size: 1.1rem;
}

@media (max-width: 576px) {
  .error-content {
    padding: 2rem;
  }

  .error-icon {
    font-size: 3rem;
  }

  .error-code {
    font-size: 4rem;
  }

  .error-title {
    font-size: 1.5rem;
  }

  .error-message {
    font-size: 1rem;
  }

  .btn {
    width: 100%;
    margin-bottom: 1rem;
  }
}
</style>
