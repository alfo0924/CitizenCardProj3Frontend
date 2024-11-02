<template>
  <div id="app">
    <!-- Header -->
    <Header v-if="showHeader" />

    <!-- Sidebar -->
    <div class="d-flex">
      <Sidebar v-if="showSidebar" />

      <!-- Main Content -->
      <main class="main-content" :class="{ 'with-sidebar': showSidebar }">
        <div class="container-fluid px-4">
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
          />

          <!-- Router View -->
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </main>
    </div>

    <!-- Footer -->
    <Footer v-if="showFooter" />
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from '@/components/layout/Header.vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import Footer from '@/components/layout/Footer.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import AlertMessage from '@/components/common/AlertMessage.vue'

export default {
  name: 'App',

  components: {
    Header,
    Sidebar,
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

    // 計算是否顯示Sidebar
    const showSidebar = computed(() => {
      const noSidebarRoutes = ['login', 'register', 'forgot-password']
      return !noSidebarRoutes.includes(route.name)
    })

    // 計算是否顯示Footer
    const showFooter = computed(() => {
      const noFooterRoutes = ['login', 'register', 'forgot-password']
      return !noFooterRoutes.includes(route.name)
    })

    return {
      showHeader,
      showSidebar,
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
  --bg-light: #f8f9fa;
  --border-color: #dee2e6;

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

body {
  font-family: 'Noto Sans TC', sans-serif;
  line-height: 1.6;
  color: var(--text-color);
  background-color: var(--bg-light);
}

/* 主要內容區域 */
.main-content {
  min-height: 100vh;
  padding-top: 60px; /* Header高度 */
  width: 100%;
  transition: all 0.3s ease;
}

.main-content.with-sidebar {
  margin-left: 250px; /* Sidebar寬度 */
  width: calc(100% - 250px);
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
@media (max-width: 768px) {
  .main-content.with-sidebar {
    margin-left: 0;
    width: 100%;
  }
}

/* 工具類 */
.container-fluid {
  padding-right: 15px;
  padding-left: 15px;
  margin-right: auto;
  margin-left: auto;
}

.px-4 {
  padding-right: 1.5rem;
  padding-left: 1.5rem;
}
</style>