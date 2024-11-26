<template>
  <div>
    <!-- 主選單 Navbar -->
    <nav class="navbar navbar-expand-lg navbar-light bg-white sticky-top">
      <div class="container d-flex justify-content-between align-items-center">
        <!-- Logo 區域 -->
        <router-link class="navbar-brand d-flex align-items-center ms-2" to="/">
          <img src="/header_logo.webp" alt="逢甲" height="80" class="me-3">
          <div>
            <h4 class="m-0 logo-title">逢甲市民卡</h4>
            <small class="logo-subtitle">FENG CHIA PASS</small>
          </div>
        </router-link>

        <!-- Toggler Button -->
        <button
            class="navbar-toggler"
            type="button"
            @click="toggleNav"
            :aria-expanded="!isNavCollapsed"
            aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- 中央選單項目 -->
        <div :class="['collapse', 'navbar-collapse', { show: !isNavCollapsed }]" id="navbarNav">
          <ul class="navbar-nav mx-auto">
            <li class="nav-item">
              <router-link class="nav-link" to="/discountstore">特約商店</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/city-movie">CityMovie</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/faq">常見問題</router-link>
            </li>
          </ul>

          <!-- 用戶操作區域 -->
          <ul class="navbar-nav me-2">
            <!-- 未登入狀態 -->
            <li class="nav-item" v-if="!isLoggedIn">
              <router-link class="btn btn-custom-outline" to="/login">
                登入/註冊
              </router-link>
            </li>

            <!-- 已登入狀態 -->
            <li class="nav-item dropdown" v-else>
              <a
                  href="#"
                  class="nav-link dropdown-toggle user-menu"
                  id="userDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
              >
                <img
                    :src="userAvatar"
                    class="user-avatar"
                    :alt="userName"
                >
                {{ userName }}
              </a>
              <ul class="dropdown-menu dropdown-menu-end custom-dropdown" aria-labelledby="userDropdown">
                <li>
                  <router-link class="dropdown-item" to="/profile">
                    <i class="fas fa-user me-2"></i>個人資料
                  </router-link>
                </li>
                <li>
                  <router-link class="dropdown-item" to="/wallet">
                    <i class="fas fa-wallet me-2"></i>電子錢包
                  </router-link>
                </li>
                <!-- 管理員選項 -->
                <li v-if="isAdmin">
                  <router-link class="dropdown-item" to="/admin">
                    <i class="fas fa-cog me-2"></i>管理後台
                  </router-link>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <a
                      class="dropdown-item text-danger"
                      href="#"
                      @click.prevent="handleLogout"
                  >
                    <i class="fas fa-sign-out-alt me-2"></i>登出
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- 麵包屑導航區域 -->
    <div v-if="showBreadcrumbs" class="breadcrumb">
      <div class="container d-flex align-items-center">
        <router-link to="/" class="breadcrumb-item">
          <i class="fas fa-home me-1"></i>首頁
        </router-link>
        <span class="divider">/</span>
        <span v-if="currentBreadcrumb" class="breadcrumb-item active">
          {{ currentBreadcrumb }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

export default {
  name: 'Header',

  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    const isNavCollapsed = ref(true)

    // 用戶狀態
    const isLoggedIn = computed(() => store.getters['auth/isLoggedIn'])
    const isAdmin = computed(() => store.getters['auth/isAdmin'])
    const userName = computed(() => store.getters['auth/userName'])
    const userAvatar = computed(() => store.getters['auth/userAvatar'] || '/default-avatar.png')

    // 導航控制
    const toggleNav = () => {
      isNavCollapsed.value = !isNavCollapsed.value
    }

    // 登出處理
    const handleLogout = async () => {
      try {
        await store.dispatch('auth/logout')
        router.push('/login')
        store.dispatch('setNotification', {
          type: 'success',
          message: '已成功登出'
        })
      } catch (error) {
        console.error('Logout error:', error)
        store.dispatch('setNotification', {
          type: 'error',
          message: '登出失敗，請稍後再試'
        })
      }
    }

    // 麵包屑相關
    const breadcrumbs = computed(() => {
      return route.matched
          .filter(route => route.meta && route.meta.title)
          .map(route => ({
            name: route.meta.title,
            path: route.path,
          }))
    })

    const currentBreadcrumb = computed(() => {
      const currentRoute = route.matched.find(r => r.meta && r.meta.title)
      return currentRoute ? currentRoute.meta.title : ''
    })

    const showBreadcrumbs = computed(() => route.path !== '/')

    return {
      isNavCollapsed,
      isLoggedIn,
      isAdmin,
      userName,
      userAvatar,
      toggleNav,
      handleLogout,
      breadcrumbs,
      currentBreadcrumb,
      showBreadcrumbs,
    }
  }
}
</script>

<style scoped>
.navbar {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1030;
  padding: 0.5rem 1rem;
}

.navbar-brand {
  display: flex;
  align-items: center;
}

.logo-title {
  font-size: 2rem;
  font-weight: 700;
  color: #BA0043;
  margin: 0;
}

.logo-subtitle {
  font-size: 1.5rem;
  color: #BA0043;
  font-weight: 700;
}

.nav-link {
  color: #BA0043;
  font-weight: 600;
  font-size: 1.5rem;
  transition: color 0.3s ease, border-bottom 0.3s ease;
  text-decoration: none;
  position: relative;
  padding-bottom: 5px;
}

.nav-link::after {
  content: '';
  position: absolute;
  width: 0;
  height: 3px;
  bottom: 0;
  left: 50%;
  background-color: #BA0043;
  transition: width 0.3s ease, left 0.3s ease;
}

.nav-link:hover {
  color: #a00000;
}

.nav-link:hover::after {
  width: 100%;
  left: 0;
}

/* 其他樣式保持不變 */
.user-menu {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.btn-custom-outline {
  color: #BA0043;
  border: 2px solid #BA0043;
  font-weight: 700;
  font-size: 1.25rem;
  padding: 0.4rem 1.2rem;
  border-radius: 50px;
  background-color: transparent;
  text-align: center;
  transition: all 0.3s ease;
}

.btn-custom-outline:hover {
  background-color: rgba(186, 0, 67, 0.5);
  color: #a00000;
  border-color: #a00000;
}

/* 下拉選單樣式 */
.custom-dropdown {
  padding: 0.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  border: none;
}

.custom-dropdown .dropdown-item {
  font-size: 1.2rem;
  color: #BA0043;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.custom-dropdown .dropdown-item:hover {
  background-color: rgba(186, 0, 67, 0.1);
  color: #a00000;
}

.dropdown-divider {
  margin: 0.5rem 0;
  border-color: #dee2e6;
}

/* 麵包屑樣式 */
.breadcrumb {
  background-color: #f8f9fa;
  padding: 0.75rem 1rem;
  margin: 0;
  border-bottom: 1px solid #dee2e6;
}

.breadcrumb-item {
  color: #6c757d;
  text-decoration: none;
  transition: color 0.3s ease;
}

.breadcrumb-item:hover {
  color: #BA0043;
}

.breadcrumb-item.active {
  color: #BA0043;
}

.divider {
  color: #BA0043;
  margin: 0 0.5rem;
}

.nav-item{
  padding-left: 10px;
  padding-right: 10px;
}

/* 響應式設計 */
@media (max-width: 992px) {
  .navbar-nav {
    padding: 1rem 0;
  }

  .nav-link {
    font-size: 1.25rem;
    padding: 0.5rem 1rem;
  }
}

@media (max-width: 768px) {
  .logo-title {
    font-size: 1.5rem;
  }

  .logo-subtitle {
    font-size: 1rem;
  }

  .btn-custom-outline {
    font-size: 1rem;
    padding: 0.3rem 1rem;
  }

  .custom-dropdown .dropdown-item {
    font-size: 1rem;
  }
}

@media (max-width: 576px) {
  .navbar {
    padding: 0.25rem 0.5rem;
  }

  .navbar-brand img {
    height: 60px;
  }
}
</style>