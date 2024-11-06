<template>
  <div class="error-page">
    <div class="error-content text-center">
      <div class="error-icon mb-4">
        <i class="fas fa-exclamation-triangle"></i>
      </div>

      <h1 class="error-code">500</h1>
      <h2 class="error-title mb-4">伺服器錯誤</h2>

      <p class="error-message mb-4">
        很抱歉，伺服器發生錯誤，請稍後再試。如果問題持續發生，請聯繫系統管理員。
      </p>

      <div class="error-actions">
        <router-link to="/" class="btn btn-primary me-3">
          <i class="fas fa-home me-2"></i>
          回到首頁
        </router-link>

        <button
            class="btn btn-outline-secondary"
            @click="reloadPage"
        >
          <i class="fas fa-sync-alt me-2"></i>
          重新整理
        </button>
      </div>

      <!-- 錯誤詳情（僅在開發環境顯示） -->
      <div
          v-if="isDevelopment && errorDetails"
          class="error-details mt-4"
      >
        <div class="alert alert-danger text-start">
          <h5 class="alert-heading">錯誤詳情：</h5>
          <pre class="mb-0">{{ errorDetails }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ServerError',

  data() {
    return {
      isDevelopment: process.env.NODE_ENV === 'development',
      errorDetails: null
    }
  },

  created() {
    // 從路由中獲取錯誤詳情
    if (this.$route.params.error) {
      this.errorDetails = this.$route.params.error
    }
  },

  methods: {
    reloadPage() {
      window.location.reload()
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
  max-width: 600px;
  padding: 3rem;
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
}

.error-icon {
  font-size: 4rem;
  color: var(--danger-color);
  animation: pulse 2s infinite;
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

.error-details {
  text-align: left;
}

.error-details pre {
  background: var(--bg-light);
  padding: 1rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.875rem;
  white-space: pre-wrap;
  word-break: break-all;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
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

  .error-details pre {
    font-size: 0.75rem;
  }
}
</style>
