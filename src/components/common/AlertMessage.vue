<template>
  <transition name="alert">
    <div v-if="show" class="alert" :class="alertClasses" role="alert">
      <!-- 警告圖標 -->
      <div class="alert-icon">
        <i :class="iconClass"></i>
      </div>

      <!-- 警告內容 -->
      <div class="alert-content">
        <strong v-if="title" class="alert-title">{{ title }}</strong>
        <p class="alert-message">{{ message }}</p>
      </div>

      <!-- 關閉按鈕 -->
      <button
          v-if="dismissible"
          type="button"
          class="btn-close"
          @click="closeAlert"
          aria-label="Close"
      >
        <i class="fas fa-times"></i>
      </button>

      <!-- 自動關閉進度條 -->
      <div
          v-if="autoClose"
          class="alert-progress"
          :style="{ width: `${progress}%` }"
      ></div>
    </div>
  </transition>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

export default {
  name: 'AlertMessage',

  props: {
    type: {
      type: String,
      default: 'info',
      validator: value => ['success', 'warning', 'error', 'info'].includes(value)
    },
    title: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      required: true
    },
    dismissible: {
      type: Boolean,
      default: true
    },
    duration: {
      type: Number,
      default: 5000
    },
    autoClose: {
      type: Boolean,
      default: true
    }
  },

  emits: ['close'],

  setup(props, { emit }) {
    const show = ref(true)
    const progress = ref(100)
    let closeTimer = null
    let progressTimer = null

    const alertClasses = computed(() => ({
      [`alert-${props.type}`]: true,
      'alert-dismissible': props.dismissible
    }))

    const iconClass = computed(() => ({
      'fas': true,
      'fa-check-circle': props.type === 'success',
      'fa-exclamation-circle': props.type === 'warning',
      'fa-times-circle': props.type === 'error',
      'fa-info-circle': props.type === 'info'
    }))

    const startTimers = () => {
      if (props.autoClose && props.duration > 0) {
        // 設置關閉計時器
        closeTimer = setTimeout(() => {
          closeAlert()
        }, props.duration)

        // 設置進度條更新
        const updateInterval = 10
        const step = (updateInterval / props.duration) * 100
        progressTimer = setInterval(() => {
          progress.value = Math.max(0, progress.value - step)
        }, updateInterval)
      }
    }

    const clearTimers = () => {
      if (closeTimer) clearTimeout(closeTimer)
      if (progressTimer) clearInterval(progressTimer)
    }

    const closeAlert = () => {
      clearTimers()
      show.value = false
      emit('close')
    }

    onMounted(() => {
      startTimers()
    })

    onBeforeUnmount(() => {
      clearTimers()
    })

    return {
      show,
      progress,
      alertClasses,
      iconClass,
      closeAlert
    }
  }
}
</script>

<style scoped>
.alert {
  position: relative;
  padding: 1rem 1rem 1rem 3rem;
  margin-bottom: 1rem;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  display: flex;
  align-items: flex-start;
  overflow: hidden;
}

.alert-icon {
  position: absolute;
  left: 1rem;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
}

.alert-content {
  flex: 1;
  min-width: 0;
}

.alert-title {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 600;
}

.alert-message {
  margin: 0;
  font-size: 0.875rem;
}

.btn-close {
  padding: 0.5rem;
  margin: -0.5rem -0.5rem -0.5rem auto;
  background: transparent;
  border: 0;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.15s;
}

.btn-close:hover {
  opacity: 1;
}

.alert-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background-color: rgba(255, 255, 255, 0.7);
  transition: width 10ms linear;
}

/* 警告類型樣式 */
.alert-success {
  background-color: #d1e7dd;
  border-color: #badbcc;
  color: #0f5132;
}

.alert-warning {
  background-color: #fff3cd;
  border-color: #ffecb5;
  color: #664d03;
}

.alert-error {
  background-color: #f8d7da;
  border-color: #f5c2c7;
  color: #842029;
}

.alert-info {
  background-color: #cff4fc;
  border-color: #b6effb;
  color: #055160;
}

/* 過渡動畫 */
.alert-enter-active,
.alert-leave-active {
  transition: all 0.3s ease;
}

.alert-enter-from,
.alert-leave-to {
  transform: translateY(-30px);
  opacity: 0;
}

@media (max-width: 576px) {
  .alert {
    margin: 0.5rem;
    padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  }

  .alert-icon {
    left: 0.75rem;
    font-size: 1rem;
  }
}
</style>
