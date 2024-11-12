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

      <!-- Breadcrumb -->
      <nav v-if="showBreadcrumb" class="breadcrumb">
        <router-link to="/"></router-link>
        <!-- Additional breadcrumb links here -->
      </nav>

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

    // 不顯示布局的路由
    const noLayoutRoutes = ['login', 'register', 'forgot-password']

    // 計算是否顯示Header
    const showHeader = computed(() => {
      return !noLayoutRoutes.includes(route.name)
    })

    // 計算是否顯示Footer
    const showFooter = computed(() => {
      return !noLayoutRoutes.includes(route.name)
    })

    // 計算是否顯示Breadcrumb
    const showBreadcrumb = computed(() => {
      return !noLayoutRoutes.includes(route.name)
    })

    return {
      route,
      showHeader,
      showFooter,
      showBreadcrumb
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
  --breadcrumb-height: 40px;
  --breadcrumb-margin: 80px; /* 增加間距 */
  --footer-height: 60px;
  --content-padding: 30px; /* 增加內容padding */

  /* 間距 */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-xxl: 3rem; /* 新增更大的間距 */

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

/* Header */
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

/* Breadcrumb */
.breadcrumb-container {
  position: fixed;
  top: var(--header-height);
  left: 0;
  right: 0;
  height: var(--breadcrumb-height);
  background-color: white;
  border-bottom: 1px solid var(--border-color);
  z-index: 1020;
  padding: 0.5rem 0;
}

.breadcrumb {
  margin: 0;
  padding: 0.5rem var(--content-padding);
  background-color: transparent;
  display: flex;
  align-items: center;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
}

.breadcrumb-item + .breadcrumb-item::before {
  content: ">";
  padding: 0 0.5rem;
  color: var(--text-light);
}

/* 主要內容區域 */
.main-content {
  flex: 1;
  margin-top: calc(var(--header-height) + var(--breadcrumb-height) + var(--breadcrumb-margin));
  min-height: calc(100vh - var(--header-height) - var(--breadcrumb-height));
  width: 100%;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  padding: var(--content-padding);
}

/* 內容容器 */
.content-container {
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
  padding: var(--content-padding);
  margin-bottom: var(--spacing-xxl);
}

/* 全局提示 */
.global-alert {
  position: fixed;
  top: calc(var(--header-height) + var(--breadcrumb-height) + var(--spacing-md));
  right: var(--spacing-md);
  z-index: 1050;
  min-width: 300px;
}

/* Footer */
.app-footer {
  background-color: white;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1020;
  padding: var(--spacing-lg) 0;
  margin-top: auto;
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

/* 容器類 */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--content-padding);
}

.container-fluid {
  width: 100%;
  padding: 0 var(--content-padding);
}

/* 響應式設計 */
@media (max-width: 1200px) {
  .container {
    max-width: 1140px;
  }
}

@media (max-width: 992px) {
  :root {
    --content-padding: 20px;
    --breadcrumb-margin: 30px;
  }

  .container {
    max-width: 960px;
  }
}

@media (max-width: 768px) {
  :root {
    --header-height: 56px;
    --breadcrumb-height: 36px;
    --breadcrumb-margin: 20px;
    --content-padding: 15px;
  }

  .container {
    max-width: 720px;
  }

  .global-alert {
    width: calc(100% - 2rem);
    right: 1rem;
    min-width: auto;
  }
}

@media (max-width: 576px) {
  :root {
    --breadcrumb-margin: 15px;
    --content-padding: 10px;
  }

  .container {
    width: 100%;
  }

  .content-container {
    padding: var(--spacing-md);
  }
}

/* 工具類 */
.d-flex { display: flex; }
.flex-column { flex-direction: column; }
.align-items-center { align-items: center; }
.justify-content-between { justify-content: space-between; }
.w-100 { width: 100%; }
.mb-3 { margin-bottom: 1rem; }
.mt-3 { margin-top: 1rem; }
.px-4 { padding-left: 1.5rem; padding-right: 1.5rem; }
.py-4 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
.text-center { text-align: center; }
.position-relative { position: relative; }
.overflow-hidden { overflow: hidden; }
</style>
