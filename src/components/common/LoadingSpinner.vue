<template>
  <div class="loading-spinner-container" :class="{ overlay: isOverlay }">
    <div class="loading-spinner" :class="sizeClass">
      <div class="spinner-border" :class="colorClass" role="status">
        <span class="visually-hidden">載入中...</span>
      </div>
      <div v-if="text" class="loading-text" :class="textColorClass">
        {{ text }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',

  props: {
    // 是否顯示為覆蓋層
    isOverlay: {
      type: Boolean,
      default: false
    },
    // 載入提示文字
    text: {
      type: String,
      default: '載入中...'
    },
    // 尺寸: small, medium, large
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    // 顏色主題: primary, secondary, success, danger, warning, info
    theme: {
      type: String,
      default: 'primary',
      validator: (value) => [
        'primary',
        'secondary',
        'success',
        'danger',
        'warning',
        'info'
      ].includes(value)
    }
  },

  computed: {
    // 尺寸類名
    sizeClass() {
      return {
        'spinner-small': this.size === 'small',
        'spinner-medium': this.size === 'medium',
        'spinner-large': this.size === 'large'
      }
    },
    // 顏色類名
    colorClass() {
      return `text-${this.theme}`
    },
    // 文字顏色類名
    textColorClass() {
      return `text-${this.theme}`
    }
  }
}
</script>

<style scoped>
.loading-spinner-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

/* 覆蓋層樣式 */
.loading-spinner-container.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 9999;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

/* 尺寸變體 */
.spinner-small .spinner-border {
  width: 1rem;
  height: 1rem;
  border-width: 0.15em;
}

.spinner-medium .spinner-border {
  width: 2rem;
  height: 2rem;
  border-width: 0.25em;
}

.spinner-large .spinner-border {
  width: 3rem;
  height: 3rem;
  border-width: 0.3em;
}

/* 文字樣式 */
.loading-text {
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

/* 尺寸對應的文字大小 */
.spinner-small .loading-text {
  font-size: 0.75rem;
}

.spinner-medium .loading-text {
  font-size: 0.875rem;
}

.spinner-large .loading-text {
  font-size: 1rem;
}

/* 動畫效果 */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.spinner-border {
  animation: spin 1s linear infinite;
}

/* 主題顏色 */
.text-primary {
  color: var(--primary-color) !important;
}

.text-secondary {
  color: var(--secondary-color) !important;
}

.text-success {
  color: var(--success-color) !important;
}

.text-danger {
  color: var(--danger-color) !important;
}

.text-warning {
  color: var(--warning-color) !important;
}

.text-info {
  color: var(--info-color) !important;
}
</style>