<template>
  <div>
    <!-- Spacer 區域顯示背景色 -->
    <div class="spacer"></div>
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
        <button class="navbar-toggler" type="button" @click="toggleNav" aria-controls="navbarNav"
                :aria-expanded="!isNavCollapsed" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- 中央選單項目 -->
        <div :class="['collapse', 'navbar-collapse', { show: !isNavCollapsed }]" id="navbarNav">
          <ul class="navbar-nav mx-auto">
            <li class="nav-item dropdown">
              <a href="#" class="nav-link dropdown-toggle" id="discountsDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">好康優惠</a>
              <ul class="dropdown-menu custom-dropdown" aria-labelledby="discountsDropdown">
                <router-link class="dropdown-item" to="/partner-store">特約商店</router-link>
              </ul>
            </li>
            <li class="nav-item dropdown">
              <a href="#" class="nav-link dropdown-toggle" id="citylifeDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">市民生活</a>
              <ul class="dropdown-menu custom-dropdown" aria-labelledby="citylifeDropdown">
                <router-link class="dropdown-item" to="/city-movie">CityMovie</router-link>
              </ul>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/faq">常見問題</router-link>
            </li>
          </ul>

          <!-- 登入/註冊 按鈕 -->
          <ul class="navbar-nav me-2">
            <li class="nav-item">
              <router-link class="btn btn-custom-outline" to="/login">登入/註冊</router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- 麵包屑導航區域（僅在非首頁顯示） -->
    <div v-if="showBreadcrumbs" class="breadcrumb">
      <div class="container d-flex align-items-center">
        <!-- 首頁連結 -->
        <router-link to="/" class="breadcrumb-item">首頁</router-link>
        <span class="divider">/</span>

        <!-- 當前頁面名稱 -->
        <span v-if="breadcrumbs.length > 0" class="breadcrumb-item">
          {{ currentBreadcrumb }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'Header',
  setup() {
    const isNavCollapsed = ref(true)
    const route = useRoute()

    const toggleNav = () => {
      isNavCollapsed.value = !isNavCollapsed.value
    }

    // 動態生成麵包屑
    const breadcrumbs = computed(() => {
      return route.matched
        .filter(route => route.meta && route.meta.title)
        .map(route => ({
          name: route.meta.title,
          path: route.path,
        }))
    })

    // 獲取當前頁面名稱
    const currentBreadcrumb = computed(() => {
      const currentRoute = route.matched.find(r => r.meta && r.meta.title)
      return currentRoute ? currentRoute.meta.title : ''
    })
    
    // 計算屬性來判斷是否顯示麵包屑
    const showBreadcrumbs = computed(() => route.path !== '/')

    return {
      isNavCollapsed,
      toggleNav,
      breadcrumbs,
      currentBreadcrumb,
      showBreadcrumbs,
    }
  }
}
</script>

<style scoped>
.spacer {
  height: 20px; /* 控制上方空白區域的高度 */
  background-color: #BA0043; /* 設定背景色 */
}

.navbar {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding-top: 10px;
}

.navbar-brand {
  display: flex;
  align-items: center;
}

.logo-title {
  font-size: 2.0rem;
  font-weight: 700;
  color: #BA0043;
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
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: #a00000;
}

/* 自訂按鈕樣式 */
.btn-custom-outline {
  color: #BA0043;
  border: 2px solid #BA0043;
  font-weight: 700;
  font-size: 1.25rem;
  padding: 0.4rem 1.2rem;
  border-radius: 50px;
  background-color: transparent;
  text-align: center;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.btn-custom-outline:hover {
  background-color: transparent;
  color: #a00000;
  border-color: #a00000;
}

/* 麵包屑樣式 */
.breadcrumb {
  background-color: #f0f0f0;
  padding: 10px 80px;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333333;
  position: relative;
  top: 0;
  z-index: 900;
  text-align: left;
}

.breadcrumb .container {
  display: flex;
  gap: 10px;
  align-items: center;
}

.breadcrumb-item {
  color: #333333;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.breadcrumb-item:hover {
  color: #BA0043;
}

.divider {
  color: #BA0043;
  font-weight: 600;
}

/* 下拉選單樣式 */
.custom-dropdown {
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.custom-dropdown .dropdown-item {
  font-size: 1.2rem;
  color: #BA0043;
  padding: 8px 20px;
  border-radius: 20px;
  transition: background-color 0.3s ease;
}

.custom-dropdown .dropdown-item:hover {
  background-color: #f0f0f0;
  color: #BA0043;
}

@media (max-width: 768px) {
  .breadcrumb {
    font-size: 1rem;
    padding: 8px 0;
  }
  .breadcrumb .container {
    gap: 10px;
  }
}
</style>
