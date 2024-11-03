<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light fixed-top">
    <div class="container">
      <!-- Logo -->
      <router-link class="navbar-brand" to="/">
        <img src="@/assets/images/logo.png" alt="逢甲" height="40">
        市民卡系統
      </router-link>

      <!-- Toggler Button -->
      <button class="navbar-toggler" type="button" @click="toggleNav" aria-controls="navbarNav"
              :aria-expanded="!isNavCollapsed" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Navbar items with collapse class bound to isNavCollapsed -->
      <div :class="['collapse', 'navbar-collapse', { show: !isNavCollapsed }]" id="navbarNav">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <!-- 電影 -->
          <li class="nav-item">
            <router-link class="nav-link" to="/movies">
              <i class="fas fa-film"></i> 電影
            </router-link>
          </li>

          <!-- 我的訂單 -->
          <li class="nav-item" v-if="isLoggedIn">
            <router-link class="nav-link" to="/bookings">
              <i class="fas fa-ticket-alt"></i> 我的訂單
            </router-link>
          </li>

          <!-- 電子錢包 -->
          <li class="nav-item" v-if="isLoggedIn">
            <router-link class="nav-link" to="/wallet">
              <i class="fas fa-wallet"></i> 電子錢包
            </router-link>
          </li>

          <!-- 優惠專區 -->
          <li class="nav-item">
            <router-link class="nav-link" to="/discounts">
              <i class="fas fa-tags"></i> 優惠專區
            </router-link>
          </li>
        </ul>

        <!-- Right Side Menu -->
        <ul class="navbar-nav">
          <!-- Search Button -->
          <li class="nav-item">
            <button class="nav-link btn" @click="toggleSearch">
              <i class="fas fa-search"></i>
            </button>
          </li>

          <!-- If Not Logged In -->
          <template v-if="!isLoggedIn">
            <li class="nav-item">
              <router-link class="nav-link" to="/login">
                <i class="fas fa-sign-in-alt"></i> 登入
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/register">
                <i class="fas fa-user-plus"></i> 註冊
              </router-link>
            </li>
          </template>

          <!-- If Logged In -->
          <template v-else>
            <!-- Notifications -->
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" id="notificationDropdown" role="button"
                 data-bs-toggle="dropdown" aria-expanded="false">
                <i class="fas fa-bell"></i>
                <span class="badge bg-danger" v-if="unreadNotifications">{{ unreadNotifications }}</span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="notificationDropdown">
                <li v-if="notifications.length === 0">
                  <span class="dropdown-item">無新通知</span>
                </li>
                <li v-for="notification in notifications" :key="notification.id">
                  <a class="dropdown-item" href="#" @click="readNotification(notification.id)">
                    {{ notification.message }}
                  </a>
                </li>
              </ul>
            </li>

            <!-- User Menu -->
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button"
                 data-bs-toggle="dropdown" aria-expanded="false">
                <img :src="userAvatar" class="rounded-circle" alt="avatar" width="24" height="24">
                {{ userName }}
              </a>
              <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                <li>
                  <router-link class="dropdown-item" to="/profile">
                    <i class="fas fa-user"></i> 個人資料
                  </router-link>
                </li>
                <li>
                  <router-link class="dropdown-item" to="/settings">
                    <i class="fas fa-cog"></i> 設定
                  </router-link>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <a class="dropdown-item" href="#" @click="logout">
                    <i class="fas fa-sign-out-alt"></i> 登出
                  </a>
                </li>
              </ul>
            </li>
          </template>
        </ul>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="search-bar" :class="{ active: isSearchActive }">
      <div class="container">
        <div class="input-group">
          <input type="text" class="form-control" placeholder="搜尋電影..."
                 v-model="searchQuery" @keyup.enter="search">
          <button class="btn btn-outline-secondary" type="button" @click="search">
            <i class="fas fa-search"></i>
          </button>
          <button class="btn btn-outline-secondary" type="button" @click="toggleSearch">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'Header',
  setup() {
    const store = useStore()
    const router = useRouter()
    const searchQuery = ref('')
    const isSearchActive = ref(false)
    const isNavCollapsed = ref(true)  // New reactive state for nav collapse

    // Computed properties
    const isLoggedIn = computed(() => store.getters['auth/isLoggedIn'])
    const userName = computed(() => store.getters['auth/userName'])
    const userAvatar = computed(() => store.getters['auth/userAvatar'])
    const notifications = computed(() => store.getters['notification/notifications'])
    const unreadNotifications = computed(() => store.getters['notification/unreadCount'])

    // Methods
    const toggleSearch = () => {
      isSearchActive.value = !isSearchActive.value
      if (!isSearchActive.value) {
        searchQuery.value = ''
      }
    }

    const toggleNav = () => {
      isNavCollapsed.value = !isNavCollapsed.value
    }

    const search = () => {
      if (searchQuery.value.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery.value.trim())}`)
        toggleSearch()
      }
    }

    const readNotification = async (id) => {
      await store.dispatch('notification/markAsRead', id)
    }

    const logout = async () => {
      try {
        await store.dispatch('auth/logout')
        router.push('/login')
      } catch (error) {
        console.error('登出失敗:', error)
      }
    }

    return {
      isLoggedIn,
      userName,
      userAvatar,
      notifications,
      unreadNotifications,
      searchQuery,
      isSearchActive,
      isNavCollapsed,
      toggleSearch,
      toggleNav,
      search,
      readNotification,
      logout
    }
  }
}
</script>

<style scoped>
.navbar {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.navbar-brand {
  font-weight: bold;
  color: var(--primary-color);
}

.nav-link {
  color: var(--text-color);
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: var(--primary-color);
}

.search-bar {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  padding: 1rem 0;
  transform: translateY(-100%);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.search-bar.active {
  transform: translateY(0);
  opacity: 1;
  visibility: visible;
}

.dropdown-menu {
  min-width: 200px;
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(50%, -50%);
}

.user-avatar {
  width: 24px;
  height: 24px;
  object-fit: cover;
  border-radius: 50%;
}
</style>
