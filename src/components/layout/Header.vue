<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light fixed-top">
    <div class="container">
      <!-- Logo -->
      <router-link class="navbar-brand d-flex align-items-center" to="/">
        <img src="@/assets/images/logo.png" alt="逢甲" height="40">
        <span class="ms-2">市民卡系統</span>
      </router-link>

      <!-- Toggler Button -->
      <button
          class="navbar-toggler border-0"
          type="button"
          @click="toggleNav"
          aria-controls="navbarNav"
          :aria-expanded="!isNavCollapsed"
          aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Navbar items -->
      <div
          :class="['collapse', 'navbar-collapse', { show: !isNavCollapsed }]"
          id="navbarNav"
      >
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <!-- 電影 -->
          <li class="nav-item">
            <router-link class="nav-link d-flex align-items-center" to="/movies">
              <i class="fas fa-film"></i>
              <span class="ms-2">電影</span>
            </router-link>
          </li>

          <!-- 特惠商店 -->
          <li class="nav-item">
            <router-link class="nav-link d-flex align-items-center" to="/stores">
              <i class="fas fa-store"></i>
              <span class="ms-2">特惠商店</span>
            </router-link>
          </li>

          <!-- 優惠活動 -->
          <li class="nav-item">
            <router-link class="nav-link d-flex align-items-center" to="/promotions">
              <i class="fas fa-percentage"></i>
              <span class="ms-2">優惠活動</span>
            </router-link>
          </li>

          <!-- 我的訂單 -->
          <li class="nav-item" v-if="isLoggedIn">
            <router-link class="nav-link d-flex align-items-center" to="/bookings">
              <i class="fas fa-ticket-alt"></i>
              <span class="ms-2">我的訂單</span>
            </router-link>
          </li>

          <!-- 電子錢包 -->
          <li class="nav-item" v-if="isLoggedIn">
            <router-link class="nav-link d-flex align-items-center" to="/wallet">
              <i class="fas fa-wallet"></i>
              <span class="ms-2">電子錢包</span>
            </router-link>
          </li>

          <!-- 優惠專區 -->
          <li class="nav-item">
            <router-link class="nav-link d-flex align-items-center" to="/discounts">
              <i class="fas fa-tags"></i>
              <span class="ms-2">優惠專區</span>
            </router-link>
          </li>
        </ul>

        <!-- Right Side Menu -->
        <ul class="navbar-nav align-items-center">
          <!-- Search Button -->
          <li class="nav-item">
            <button
                class="nav-link btn d-flex align-items-center"
                @click="toggleSearch"
            >
              <i class="fas fa-search"></i>
            </button>
          </li>

          <!-- Not Logged In -->
          <template v-if="!isLoggedIn">
            <li class="nav-item">
              <router-link
                  class="nav-link d-flex align-items-center"
                  to="/login"
              >
                <i class="fas fa-sign-in-alt"></i>
                <span class="ms-2">登入</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link
                  class="nav-link d-flex align-items-center"
                  to="/register"
              >
                <i class="fas fa-user-plus"></i>
                <span class="ms-2">註冊</span>
              </router-link>
            </li>
          </template>

          <!-- Logged In -->
          <template v-else>
            <!-- Notifications -->
            <li class="nav-item dropdown">
              <a
                  class="nav-link dropdown-toggle position-relative"
                  href="#"
                  id="notificationDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
              >
                <i class="fas fa-bell"></i>
                <span
                    v-if="unreadNotifications"
                    class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                >
                  {{ unreadNotifications }}
                </span>
              </a>
              <ul
                  class="dropdown-menu dropdown-menu-end"
                  aria-labelledby="notificationDropdown"
              >
                <li v-if="notifications.length === 0">
                  <span class="dropdown-item text-muted">無新通知</span>
                </li>
                <li v-for="notification in notifications" :key="notification.id">
                  <a
                      class="dropdown-item"
                      href="#"
                      @click.prevent="readNotification(notification.id)"
                  >
                    {{ notification.message }}
                  </a>
                </li>
              </ul>
            </li>

            <!-- User Menu -->
            <li class="nav-item dropdown ms-2">
              <a
                  class="nav-link dropdown-toggle d-flex align-items-center"
                  href="#"
                  id="userDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
              >
                <img
                    :src="userAvatar"
                    class="rounded-circle me-2"
                    alt="avatar"
                    width="32"
                    height="32"
                >
                <span>{{ userName }}</span>
              </a>
              <ul
                  class="dropdown-menu dropdown-menu-end"
                  aria-labelledby="userDropdown"
              >
                <li>
                  <router-link class="dropdown-item" to="/profile">
                    <i class="fas fa-user me-2"></i>個人資料
                  </router-link>
                </li>
                <li>
                  <router-link class="dropdown-item" to="/settings">
                    <i class="fas fa-cog me-2"></i>設定
                  </router-link>
                </li>
                <!-- 管理員選項 -->
                <template v-if="isAdmin">
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <router-link class="dropdown-item" to="/admin/dashboard">
                      <i class="fas fa-tachometer-alt me-2"></i>管理後台
                    </router-link>
                  </li>
                  <li>
                    <router-link class="dropdown-item" to="/admin/stores">
                      <i class="fas fa-store-alt me-2"></i>商店管理
                    </router-link>
                  </li>
                  <li>
                    <router-link class="dropdown-item" to="/admin/promotions">
                      <i class="fas fa-ad me-2"></i>活動管理
                    </router-link>
                  </li>
                </template>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <a
                      class="dropdown-item text-danger"
                      href="#"
                      @click.prevent="logout"
                  >
                    <i class="fas fa-sign-out-alt me-2"></i>登出
                  </a>
                </li>
              </ul>
            </li>
          </template>
        </ul>
      </div>
    </div>

    <!-- Search Bar -->
    <div
        class="search-bar w-100 position-absolute"
        :class="{ active: isSearchActive }"
    >
      <div class="container py-3">
        <div class="input-group">
          <input
              type="text"
              class="form-control"
              placeholder="搜尋電影、商店或優惠..."
              v-model="searchQuery"
              @keyup.enter="search"
          >
          <button
              class="btn btn-outline-secondary"
              type="button"
              @click="search"
          >
            <i class="fas fa-search"></i>
          </button>
          <button
              class="btn btn-outline-secondary"
              type="button"
              @click="toggleSearch"
          >
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

    // 響應式狀態
    const searchQuery = ref('')
    const isSearchActive = ref(false)
    const isNavCollapsed = ref(true)

    // 計算屬性
    const isLoggedIn = computed(() => store.getters['auth/isLoggedIn'])
    const isAdmin = computed(() => store.getters['auth/isAdmin'])
    const userName = computed(() => store.getters['auth/userName'])
    const userEmail = computed(() => store.getters['auth/userEmail'])
    const userAvatar = computed(() => store.getters['auth/userAvatar'] || require('@/assets/images/default-avatar.jpg'))
    const notifications = computed(() => store.getters['notification/notifications'])
    const unreadNotifications = computed(() => store.getters['notification/unreadCount'])

    // 方法
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
        const query = encodeURIComponent(searchQuery.value.trim())
        router.push({
          path: '/search',
          query: {
            q: query,
            type: 'all'
          }
        })
        toggleSearch()
      }
    }

    const readNotification = async (id) => {
      try {
        await store.dispatch('notification/markAsRead', id)
      } catch (error) {
        console.error('標記通知失敗:', error)
      }
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
      // 狀態
      searchQuery,
      isSearchActive,
      isNavCollapsed,

      // 計算屬性
      isLoggedIn,
      isAdmin,
      userName,
      userEmail,
      userAvatar,
      notifications,
      unreadNotifications,

      // 方法
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
  z-index: 1030;
  background-color: #ffffff !important;
  padding: 0.5rem 1rem;
  min-height: 60px;
}

.navbar-brand {
  font-weight: bold;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0;
}

.navbar-brand img {
  height: 40px;
  width: auto;
  object-fit: contain;
}

.nav-link {
  color: var(--text-color);
  transition: all 0.3s ease;
  position: relative;
  padding: 0.5rem 1rem;
  font-weight: 500;
}

.nav-link:hover {
  color: var(--primary-color);
}

.nav-link i {
  margin-right: 0.5rem;
  font-size: 1.1rem;
}

.nav-link.active {
  color: var(--primary-color);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 1rem;
  right: 1rem;
  height: 2px;
  background-color: var(--primary-color);
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
  z-index: 1020;
}

.search-bar.active {
  transform: translateY(0);
  opacity: 1;
  visibility: visible;
}

.search-bar .input-group {
  max-width: 600px;
  margin: 0 auto;
}

.search-bar .form-control {
  border-right: none;
}

.search-bar .btn {
  border-color: #ced4da;
}

.search-bar .btn:hover {
  background-color: #f8f9fa;
}

.dropdown-menu {
  min-width: 200px;
  padding: 0.5rem 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border: none;
  margin-top: 0.5rem;
}

.dropdown-item {
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dropdown-item i {
  width: 1.25rem;
  text-align: center;
  color: #6c757d;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  color: var(--primary-color);
}

.dropdown-item:hover i {
  color: var(--primary-color);
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(50%, -50%);
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

.user-avatar {
  width: 32px;
  height: 32px;
  object-fit: cover;
  border-radius: 50%;
  margin-right: 0.5rem;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* 響應式設計 */
@media (max-width: 991.98px) {
  .navbar-collapse {
    background: white;
    padding: 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    position: absolute;
    top: 100%;
    left: 1rem;
    right: 1rem;
    z-index: 1020;
  }

  .nav-item {
    margin: 0.5rem 0;
  }

  .nav-link.active::after {
    display: none;
  }

  .dropdown-menu {
    position: static !important;
    transform: none !important;
    box-shadow: none;
    border: none;
    background: #f8f9fa;
    margin-top: 0.5rem;
    padding: 0;
  }

  .dropdown-item {
    padding: 0.75rem 1rem;
  }
}

@media (max-width: 768px) {
  .navbar {
    padding: 0.25rem 1rem;
  }

  .navbar-brand img {
    height: 32px;
  }

  .search-bar .input-group {
    max-width: 100%;
    padding: 0 1rem;
  }
}

/* 動畫效果 */
.dropdown-menu {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* CSS 變量 */
:root {
  --primary-color: #007bff;
  --text-color: #343a40;
  --light: #f8f9fa;
  --border-color: #dee2e6;
}
</style>
