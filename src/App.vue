<template>
  <div id="app">
    <!-- Header -->
    <Header v-if="showHeader" class="app-header" />

    <div class="app-container">
      <!-- Sidebar -->
      <Sidebar
          v-if="showSidebar"
          class="app-sidebar"
          :class="{ 'collapsed': isSidebarCollapsed, 'show': isMobile && showSidebar }"
      />

      <!-- Main Content -->
      <main
          class="main-content"
          :class="{
          'with-sidebar': showSidebar && !isSidebarCollapsed,
          'with-collapsed-sidebar': isSidebarCollapsed,
          'with-header': showHeader,
          'with-footer': showFooter
        }"
      >
        <!-- Loading Overlay -->
        <LoadingSpinner
            v-if="isLoading"
            :isOverlay="true"
        />

        <!-- Global Alert -->
        <AlertMessage
            v-if="notification"
            :type="notification.type"
            :message="notification.message"
            @close="clearNotification"
            class="global-alert"
        />

        <!-- Router View -->
        <div class="content-wrapper">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </main>
    </div>

    <!-- Footer -->
    <Footer v-if="showFooter" class="app-footer" />
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

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
    const store = useStore()

    const isSidebarCollapsed = ref(false)
    const isMobile = ref(window.innerWidth <= 768)

    const showHeader = computed(() => {
      const noHeaderRoutes = ['login', 'register', 'forgot-password']
      return !noHeaderRoutes.includes(route.name)
    })

    const showSidebar = computed(() => {
      const isAuthRoute = route.path.includes('/admin') ||
          route.path.includes('/user') ||
          route.path.includes('/profile') ||
          route.path.includes('/wallet') ||
          route.path.includes('/bookings')
      return showHeader.value && isAuthRoute
    })

    const showFooter = computed(() => {
      const noFooterRoutes = ['login', 'register', 'forgot-password']
      return !noFooterRoutes.includes(route.name)
    })

    const isLoading = computed(() => store.state.loading)
    const notification = computed(() => store.state.notification)

    const clearNotification = () => {
      store.dispatch('clearNotification')
    }

    const handleResize = () => {
      isMobile.value = window.innerWidth <= 768
      if (isMobile.value) {
        isSidebarCollapsed.value = true
      }
    }

    onMounted(() => {
      window.addEventListener('resize', handleResize)
      handleResize()
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })

    return {
      showHeader,
      showSidebar,
      showFooter,
      isSidebarCollapsed,
      isMobile,
      isLoading,
      notification,
      clearNotification
    }
  }
}
</script>

<style>
:root {
  --primary-color: #007bff;
  --primary-dark: #0056b3;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  --info-color: #17a2b8;
  --text-color: #333333;
  --text-light: #666666;
  --bg-light: #BA0043;
  --border-color: #dee2e6;
  --header-height: 60px;
  --sidebar-width: 250px;
  --sidebar-collapsed-width: 70px;
  --footer-height: 60px;
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --border-radius-sm: 0.25rem;
  --border-radius-md: 0.5rem;
  --border-radius-lg: 1rem;
  --box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  overflow-x: hidden;
}

body {
  font-family: 'Noto Sans TC', sans-serif;
  line-height: 1.6;
  color: var(--text-color);
  background-color: var(--bg-light);
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-container {
  flex: 1;
  display: flex;
  position: relative;
}

.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-height);
  z-index: 1030;
  background-color: white;
  box-shadow: var(--box-shadow);
}

.app-sidebar {
  position: fixed;
  left: 0;
  top: var(--header-height);
  bottom: 0;
  width: var(--sidebar-width);
  z-index: 1020;
  background-color: white;
  box-shadow: var(--box-shadow);
  transition: all 0.3s ease;
}

.app-sidebar.collapsed {
  width: var(--sidebar-collapsed-width);
}

.main-content {
  flex: 1;
  min-height: calc(100vh - var(--header-height));
  margin-left: 0;
  transition: all 0.3s ease;
  width: 100%;
}

.main-content.with-header {
  padding-top: var(--header-height);
}

.main-content.with-sidebar {
  margin-left: var(--sidebar-width);
  width: calc(100% - var(--sidebar-width));
}

.main-content.with-collapsed-sidebar {
  margin-left: var(--sidebar-collapsed-width);
  width: calc(100% - var(--sidebar-collapsed-width));
}

.content-wrapper {
  padding: var(--spacing-lg);
  min-height: 100%;
}

.app-footer {
  background-color: white;
  padding: var(--spacing-md) 0;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
}

.global-alert {
  position: fixed;
  top: calc(var(--header-height) + var(--spacing-md));
  right: var(--spacing-md);
  z-index: 1050;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  :root {
    --header-height: 56px;
  }

  .app-sidebar {
    transform: translateX(-100%);
  }

  .app-sidebar.show {
    transform: translateX(0);
  }

  .main-content.with-sidebar,
  .main-content.with-collapsed-sidebar {
    margin-left: 0;
    width: 100%;
  }

  .content-wrapper {
    padding: var(--spacing-md);
  }
}
</style>
