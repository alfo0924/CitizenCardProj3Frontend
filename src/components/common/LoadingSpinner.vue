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
    isOverlay: {
      type: Boolean,
      default: false
    },
    text: {
      type: String,
      default: '載入中...'
    },
    size: {
      type: String,
      default: 'md',
      validator: value => ['sm', 'md', 'lg'].includes(value)
    },
    theme: {
      type: String,
      default: 'primary',
      validator: value => [
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
    sizeClass() {
      return {
        'spinner-sm': this.size === 'sm',
        'spinner-md': this.size === 'md',
        'spinner-lg': this.size === 'lg'
      }
    },
    colorClass() {
      return `text-${this.theme}`
    },
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

.spinner-sm .spinner-border {
  width: 1rem;
  height: 1rem;
  border-width: 0.15em;
}

.spinner-md .spinner-border {
  width: 2rem;
  height: 2rem;
  border-width: 0.25em;
}

.spinner-lg .spinner-border {
  width: 3rem;
  height: 3rem;
  border-width: 0.3em;
}

.loading-text {
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.spinner-sm .loading-text {
  font-size: 0.75rem;
}

.spinner-md .loading-text {
  font-size: 0.875rem;
}

.spinner-lg .loading-text {
  font-size: 1rem;
}

.spinner-border {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.text-primary {
  color: #BA0043 !important;
}

.text-secondary {
  color: #6c757d !important;
}

.text-success {
  color: #28a745 !important;
}

.text-danger {
  color: #dc3545 !important;
}

.text-warning {
  color: #ffc107 !important;
}

.text-info {
  color: #17a2b8 !important;
}
</style>
