<template>
  <div class="not-found">
    <div class="container">
      <div class="error-content text-center">
        <h1 class="error-code">404</h1>
        <h2 class="error-title">頁面不存在</h2>
        <p class="error-message">
          抱歉，您要尋找的頁面不存在或已被移除。
        </p>
        <div class="error-actions">
          <router-link
              to="/"
              class="btn btn-primary btn-lg"
          >
            <i class="fas fa-home me-2"></i>
            返回首頁
          </router-link>
          <button
              class="btn btn-outline-secondary btn-lg ms-3"
              @click="$router.go(-1)"
          >
            <i class="fas fa-arrow-left me-2"></i>
            返回上一頁
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>

<style scoped>
.not-found {
  min-height: calc(100vh - 60px);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-light);
}

.error-content {
  padding: 2rem;
}

.error-code {
  font-size: 8rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.error-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 1rem;
}

.error-message {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

@media (max-width: 768px) {
  .error-code {
    font-size: 6rem;
  }

  .error-title {
    font-size: 1.5rem;
  }

  .error-message {
    font-size: 1rem;
  }

  .error-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .error-actions .btn {
    width: 100%;
  }
}
</style>