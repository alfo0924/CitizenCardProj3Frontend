<template>
  <div id="app">
    <!-- Header -->
    <Header v-if="showHeader" class="app-header" />

    <!-- Main Content -->
    <main class="main-content">
      <!-- Loading Overlay -->
      <LoadingSpinner
          v-if="$store.getters.isLoading"
          :isOverlay="true"
      />

      <!-- Global Alert -->
      <AlertMessage
          v-if="$store.getters.notification"
          :type="$store.getters.notification.type"
          :message="$store.getters.notification.message"
          @close="$store.dispatch('clearNotification')"
          class="global-alert"
      />

      <!-- Router View -->
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Footer -->
    <Footer v-if="showFooter" class="app-footer" />
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import AlertMessage from '@/components/common/AlertMessage.vue'

export default {
  name: 'App',

  components: {
    Header,
    Footer,
    LoadingSpinner,
    AlertMessage
  },

  setup() {
    const route = useRoute()

    // 計算是否顯示Header
    const showHeader = computed(() => {
      const noHeaderRoutes = ['login', 'register', 'forgot-password']
      return !noHeaderRoutes.includes(route.name)
    })

    // 計算是否顯示Footer
    const showFooter = computed(() => {
      const noFooterRoutes = ['login', 'register', 'forgot-password']
      return !noFooterRoutes.includes(route.name)
    })

    return {
      showHeader,
      showFooter
    }
  }
}
</script>

<style>
/* 全局樣式 */
:root {
  /* 主題顏色 */
  --primary-color: #007bff;
  --primary-dark: #0056b3;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  --info-color: #17a2b8;

  /* 中性色 */
  --text-color: #333333;
  --text-light: #666666;
  --bg-light: #BA0043;
  --border-color: #dee2e6;

  /* 布局常量 */
  --header-height: 60px;
  --footer-height: 60px;
  --content-padding: 0;

  /* 間距 */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;

  /* 圓角 */
  --border-radius-sm: 0.25rem;
  --border-radius-md: 0.5rem;
  --border-radius-lg: 1rem;

  /* 陰影 */
  --box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 基礎重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  width: 100%;
  overflow-x: hidden;
  background-color: var(--bg-light);
}

body {
  font-family: 'Noto Sans TC', sans-serif;
  line-height: 1.6;
  color: var(--text-color);
}

/* App 布局 */
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-height);
  background-color: white;
  box-shadow: var(--box-shadow);
  z-index: 1030;
}

/* 主要內容區域 */
.main-content {
  flex: 1;
  margin-top: var(--header-height);
  min-height: calc(100vh - var(--header-height));
  width: 100%;
  position: relative;
  overflow: hidden;
}

/* 全局提示 */
.global-alert {
  position: fixed;
  top: calc(var(--header-height) + var(--spacing-md));
  right: var(--spacing-md);
  z-index: 1050;
}

/* Footer */
.app-footer {
  background-color: white;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1020;
}

/* 頁面切換動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 響應式設計 */
@media (max-width: 1200px) {
  .main-content {
    margin-top: var(--header-height);
  }
}

@media (max-width: 768px) {
  :root {
    --header-height: 56px;
  }

  .main-content {
    margin-top: var(--header-height);
  }

  .global-alert {
    width: calc(100% - 2rem);
    right: 1rem;
  }
}

@media (max-width: 576px) {
  .main-content {
    margin-top: var(--header-height);
  }
}

/* Loading 遮罩 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

/* 工具類 */
.container-fluid {
  width: 100%;
  padding-right: 15px;
  padding-left: 15px;
  margin-right: auto;
  margin-left: auto;
}

@media (min-width: 1200px) {
  .container-fluid {
    max-width: 1140px;
  }
}

.px-4 {
  padding-right: 1.5rem;
  padding-left: 1.5rem;
}
</style>
