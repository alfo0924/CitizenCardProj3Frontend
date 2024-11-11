<template>
  <div id="app">
    <!-- Header -->
    <Header v-if="showHeader" />

    <!-- Main Content -->
    <main class="main-content">
      <!-- Router View for displaying different page components -->
      <!-- <router-view></router-view> -->
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="default">
          <component :is="Component" />
        </transition>
      </router-view>
      <!-- <router-view v-slot="{ Component }">
        <div v-if="Component">
          <component :is="Component" />
        </div>
        <div v-else>無匹配的路由組件</div>
      </router-view> -->
    </main>

    <!-- Footer -->
    <Footer v-if="showFooter" />
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'

export default {
  name: 'App',

  components: {
    Header,
    Footer
  },

  setup() {
    const route = useRoute()

    // Determine visibility of Header and Footer
    const showHeader = computed(() => {
      const noHeaderRoutes = [] // ['login', 'register', 'forgot-password']
      return !noHeaderRoutes.includes(route.name)
    })

    const showFooter = computed(() => {
      const noFooterRoutes = [] // ['login', 'register', 'forgot-password']
      return !noFooterRoutes.includes(route.name)
    })

    return {
      showHeader,
      showFooter,
    }
  }
}
</script>

<style>
/* Global styles */
:root {
  /* Theme colors */
  --primary-color: #007bff;
  --primary-dark: #0056b3;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  --info-color: #17a2b8;

  /* Neutral colors */
  --text-color: #333333;
  --text-light: #666666;
  --bg-light: #BA0043;
  --border-color: #dee2e6;

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;

  /* Border Radius */
  --border-radius-sm: 0.25rem;
  --border-radius-md: 0.5rem;
  --border-radius-lg: 1rem;

  /* Shadow */
  --box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Noto Sans TC', sans-serif;
  line-height: 1.6;
  color: var(--text-color);
  background-color: #BA0043; /* Set global background color */
}

#app {
  background-color: #BA0043; /* Ensure background color throughout the app */
}

/* Main content area */
.main-content {
  min-height: 100vh;
  padding-top: 10px; /* Header height plus additional space */
  width: 100%;
  transition: all 0.3s ease;
  padding-bottom: 10px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Sticky Header with Space Above */
.navbar {
  top: 20px; /* Space above the header to show background */
  left: 0;
  width: 100%;
  z-index: 1000;
  background-color: white; /* Background color for header */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 10px 20px;
}

@media (max-width: 768px) {
  .main-content {
    padding-top: 70px; /* Adjust padding for smaller screens */
  }
}

.slider {
  position: relative;
  z-index: 500;
}
</style>
