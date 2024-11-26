<template>
  <div id="app">
    <!-- Header -->
    <Header v-if="showHeader" class="app-header" />

    <!-- Main Content -->
    <main :class="['main-content', { 'no-breadcrumb': !showBreadcrumb }, { 'no-header': !showHeader }]">

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

    <DiscountStoreList v-if="!showBreadcrumb"/>
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
import DiscountStoreList from '@/views/discountStore/DiscountStoreList.vue'

export default {
  name: 'App',

  components: {
    Header,
    Footer,
    LoadingSpinner,
    AlertMessage,
    DiscountStoreList
  },

  setup() {
    const route = useRoute()

    // 不顯示布局的路由
    const noLayoutRoutes = ['']
    const noBreadcrumbRoutes = ['home']

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
      console.log('route.name:', route.name, !route.name === 'home')
      return !noBreadcrumbRoutes.includes(route.name)
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
/* 全局樣式變量 */
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
  --text-color: #BA0043;
  --text-light: #fbfcfd;
  --bg-light: #fbfcfd;
  --border-color: #dee2e6;

  /* 布局常量 */
  --header-height: 106px;
  --breadcrumb-height: 40px;
  --breadcrumb-margin: 40px;
  --footer-height: 60px;
  --content-padding: 30px;

  /* 間距 */
  --spacing-xs: 0.25 rem;
  --spacing-sm: 1 rem;
  --spacing-md: 1.5 rem;
  --spacing-lg: 2 rem;
  --spacing-xl: 2.5 rem;
  --spacing-xxl: 3 rem;

  /* 圓角 */
  --border-radius-sm: 0.25rem;
  --border-radius-md: 0.5rem;
  --border-radius-lg: 1rem;

  /* 陰影 */
  --box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  --box-shadow-lg: 0 4px 6px rgba(0, 0, 0, 0.1);
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
  position: relative;
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
  padding: 0;
}

.breadcrumb {
  margin: 0;
  padding: 0.5rem var(--content-padding);
  list-style: none;
  display: flex;
  align-items: center;
  background-color: transparent;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
}

.breadcrumb-item a {
  color: var(--primary-color);
  text-decoration: none;
  transition: color 0.3s ease;
}

.breadcrumb-item a:hover {
  color: var(--primary-dark);
}

.breadcrumb-item + .breadcrumb-item::before {
  content: ">";
  padding: 0 0.5rem;
  color: var(--text-light);
}

.breadcrumb-item.active {
  color: var(--text-light);
}

/* 主要內容區域 */
.main-content {
  flex: 1;
  width: 100%;
  position: relative;
  padding-top: calc(var(--header-height) + var(--breadcrumb-height) + var(--breadcrumb-margin) + var(--spacing-md));
  /* min-height: calc(100vh - var(--header-height) - var(--footer-height)); */
  overflow-x: hidden;
  overflow-y: auto;
  /* padding-bottom: 50px; */
  background: #fbfcfd;
}

.main-content.no-breadcrumb {
  padding-top: calc(var(--header-height));
  /* padding-top: 0px; */
  padding-bottom: 0px;
}

.main-content.no-header {
  padding-top: 0px;
  padding-bottom: 0px;
}

/* 內容容器 */
.content-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  /* padding: var(--content-padding); */
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
}

/* 全局提示 */
.global-alert {
  position: fixed;
  top: calc(var(--header-height) + var(--spacing-md));
  right: var(--spacing-md);
  z-index: 1050;
  min-width: 300px;
  padding: 1rem;
  border-radius: var(--border-radius-md);
  background-color: white;
  box-shadow: var(--box-shadow-lg);
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
@media (min-width: 1400px) {
  :root {
    --breadcrumb-margin: 65px;
    --content-padding: 40px;
  }
}

@media (max-width: 1200px) {
  :root {
    --breadcrumb-margin: 55px;
    --content-padding: 30px;
  }
}

@media (max-width: 992px) {
  :root {
    --breadcrumb-margin: 45px;
    --content-padding: 25px;
  }
}

@media (max-width: 768px) {
  :root {
    --header-height: 86px;
    --breadcrumb-height: 36px;
    --breadcrumb-margin: 35px;
    --content-padding: 20px;
  }
}

@media (max-width: 576px) {
  :root {
    --breadcrumb-margin: 15px;
    --content-padding: 5px;
  }
}
/* 工具類 */
.d-flex { display: flex; }
.flex-column { flex-direction: column; }
.align-items-center { align-items: center; }
.justify-content-between { justify-content: space-between; }
.justify-content-center { justify-content: center; }
.w-100 { width: 100%; }
.h-100 { height: 100%; }
.mb-1 { margin-bottom: var(--spacing-xs); }
.mb-2 { margin-bottom: var(--spacing-sm); }
.mb-3 { margin-bottom: var(--spacing-md); }
.mb-4 { margin-bottom: var(--spacing-lg); }
.mt-1 { margin-top: var(--spacing-xs); }
.mt-2 { margin-top: var(--spacing-sm); }
.mt-3 { margin-top: var(--spacing-md); }
.mt-4 { margin-top: var(--spacing-lg); }
.mx-auto { margin-left: auto; margin-right: auto; }
.p-1 { padding: var(--spacing-xs); }
.p-2 { padding: var(--spacing-sm); }
.p-3 { padding: var(--spacing-md); }
.p-4 { padding: var(--spacing-lg); }
.text-center { text-align: center; }
.text-right { text-align: right; }
.position-relative { position: relative; }
.position-absolute { position: absolute; }
.overflow-hidden { overflow: hidden; }
.cursor-pointer { cursor: pointer; }
</style>
