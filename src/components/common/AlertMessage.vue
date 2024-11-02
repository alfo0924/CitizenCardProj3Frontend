<template>
  <div
      v-if="show"
      class="alert-container"
      :class="[`alert-${type}`, { 'alert-dismissible': dismissible }]"
  >
    <div class="alert-content">
      <!-- 圖標 -->
      <span class="alert-icon">
        <i class="fas" :class="iconClass"></i>
      </span>

      <!-- 標題 -->
      <h5 v-if="title" class="alert-title">{{ title }}</h5>

      <!-- 訊息內容 -->
      <div class="alert-message">
        <slot>{{ message }}</slot>
      </div>

      <!-- 關閉按鈕 -->
      <button
          v-if="dismissible"
          type="button"
          class="btn-close"
          @click="dismiss"
          aria-label="Close"
      ></button>
    </div>

    <!-- 進度條 -->
    <div
        v-if="autoClose"
        class="alert-progress"
        :style="{ width: `${progress}%` }"
    ></div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

export default {
  name: 'AlertMessage',

  props: {
    // 提示類型
    type: {
      type: String,
      default: 'info',
      validator: (value) => ['success', 'info', 'warning', 'error'].includes(value)
    },
    // 標題
    title: {
      type: String,
      default: ''
    },
    // 訊息內容
    message: {
      type: String,
      default: ''
    },
    // 是否可關閉
    dismissible: {
      type: Boolean,
      default: true
    },
    // 自動關閉時間(毫秒)，0表示不自動關閉
    duration: {
      type: Number,
      default: 3000
    },
    // 是否自動關閉
    autoClose: {
      type: Boolean,
      default: true
    }
  },

  emits: ['close'],

  setup(props, { emit }) {
    const show = ref(true)
    const progress = ref(100)
    let timer = null
    let progressTimer = null

    // 計算圖標class
    const iconClass = computed(() => {
      switch (props.type) {
        case 'success':
          return 'fa-check-circle'
        case 'info':
          return 'fa-info-circle'
        case 'warning':
          return 'fa-exclamation-triangle'
        case 'error':
          return 'fa-times-circle'
        default:
          return 'fa-info-circle'
      }
    })

    // 關閉提示
    const dismiss = () => {
      show.value = false
      emit('close')
      clearTimers()
    }

    // 清除計時器
    const clearTimers = () => {
      if (timer) clearTimeout(timer)
      if (progressTimer) clearInterval(progressTimer)
    }

    // 設置自動關閉
    const setupAutoClose = () => {
      if (props.autoClose && props.duration > 0) {
        // 設置關閉計時器
        timer = setTimeout(() => {
          dismiss()
        }, props.duration)

        // 設置進度條計時器
        const interval = 10 // 每10毫秒更新一次進度
        const step = (interval / props.duration) * 100
        progressTimer = setInterval(() => {
          progress.value = Math.max(0, progress.value - step)
        }, interval)
      }
    }

    // 掛載時設置自動關閉
    onMounted(() => {
      setupAutoClose()
    })

    // 卸載前清除計時器
    onBeforeUnmount(() => {
      clearTimers()
    })

    return {
      show,
      progress,
      iconClass,
      dismiss
    }
  }
}
</script>

<style scoped>
.alert-container {
  position: relative;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid transparent;
  border-radius: var(--border-radius-md);
  overflow: hidden;
}

.alert-content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.alert-icon {
  font-size: 1.25rem;
  line-height: 1;
}

.alert-title {
  margin: 0 0 0.25rem;
  font-size: 1rem;
  font-weight: 600;
}

.alert-message {
  flex: 1;
  font-size: 0.875rem;
}

.alert-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background-color: rgba(255, 255, 255, 0.5);
  transition: width 10ms linear;
}

/* 類型樣式 */
.alert-success {
  background-color: var(--success-color);
  color: white;
}

.alert-info {
  background-color: var(--info-color);
  color: white;
}

.alert-warning {
  background-color: var(--warning-color);
  color: white;
}

.alert-error {
  background-color: var(--danger-color);
  color: white;
}

/* 可關閉樣式 */
.alert-dismissible {
  padding-right: 3rem;
}

.btn-close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.5rem;
  background: none;
  border: none;
  color: currentColor;
  opacity: 0.75;
  cursor: pointer;
}

.btn-close:hover {
  opacity: 1;
}

/* 動畫效果 */
.alert-container {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 響應式設計 */
@media (max-width: 576px) {
  .alert-container {
    margin: 0.5rem;
  }
}
</style>