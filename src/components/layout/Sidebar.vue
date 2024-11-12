<template>
  <div
      class="sidebar"
      :class="{
      'collapsed': isCollapsed,
      'mobile': isMobile,
      'show': showMobileSidebar
    }"
  >
    <!-- 側邊欄頂部 -->
    <div class="sidebar-header">
      <button class="btn collapse-btn" @click="toggleSidebar">
        <i class="fas" :class="isCollapsed ? 'fa-angle-right' : 'fa-angle-left'"></i>
      </button>
    </div>

    <!-- 使用者資訊區 -->
    <div class="user-info" v-if="isLoggedIn && !isCollapsed">
      <div class="user-avatar">
        <img :src="userAvatar" :alt="userName" class="rounded-circle">
      </div>
      <div class="user-details">
        <h6 class="mb-0">{{ userName }}</h6>
        <small class="text-muted">{{ userEmail }}</small>
      </div>
    </div>

    <!-- 導航選單 -->
    <nav class="sidebar-nav">
      <ul class="nav flex-column">
        <!-- 首頁 -->
        <li class="nav-item">
          <router-link to="/" class="nav-link" :title="isCollapsed ? '首頁' : ''" exact>
            <i class="fas fa-home"></i>
            <span v-if="!isCollapsed">首頁</span>
          </router-link>
        </li>

        <!-- 一般功能區 -->
        <div class="nav-section" v-if="!isCollapsed">
          <div class="nav-divider">一般功能</div>
        </div>

        <!-- 電影區 -->
        <li class="nav-item">
          <router-link to="/movies" class="nav-link" :title="isCollapsed ? '電影' : ''">
            <i class="fas fa-film"></i>
            <span v-if="!isCollapsed">電影</span>
          </router-link>
        </li>

        <!-- 特惠商店 -->
        <li class="nav-item">
          <router-link to="/discountstore" class="nav-link" :title="isCollapsed ? '特惠商店' : ''">
            <i class="fas fa-store"></i>
            <span v-if="!isCollapsed">特惠商店</span>
          </router-link>
        </li>

        <!-- 優惠活動 -->
        <li class="nav-item">
          <router-link to="/promotions" class="nav-link" :title="isCollapsed ? '優惠活動' : ''">
            <i class="fas fa-percentage"></i>
            <span v-if="!isCollapsed">優惠活動</span>
          </router-link>
        </li>

        <!-- 優惠專區 -->
        <li class="nav-item">
          <router-link to="/discounts" class="nav-link" :title="isCollapsed ? '優惠專區' : ''">
            <i class="fas fa-tags"></i>
            <span v-if="!isCollapsed">優惠專區</span>
          </router-link>
        </li>

        <!-- 會員功能區 -->
        <template v-if="isLoggedIn">
          <div class="nav-section" v-if="!isCollapsed">
            <div class="nav-divider">會員功能</div>
          </div>

          <!-- 我的訂單 -->
          <li class="nav-item">
            <router-link to="/bookings" class="nav-link" :title="isCollapsed ? '我的訂單' : ''">
              <i class="fas fa-ticket-alt"></i>
              <span v-if="!isCollapsed">我的訂單</span>
            </router-link>
          </li>

          <!-- 電子錢包 -->
          <li class="nav-item">
            <router-link to="/wallet" class="nav-link" :title="isCollapsed ? '電子錢包' : ''">
              <i class="fas fa-wallet"></i>
              <span v-if="!isCollapsed">電子錢包</span>
            </router-link>
          </li>

          <!-- 個人資料 -->
          <li class="nav-item">
            <router-link to="/profile" class="nav-link" :title="isCollapsed ? '個人資料' : ''">
              <i class="fas fa-user"></i>
              <span v-if="!isCollapsed">個人資料</span>
            </router-link>
          </li>
        </template>

        <!-- 管理員功能區 -->
        <template v-if="isAdmin">
          <div class="nav-section" v-if="!isCollapsed">
            <div class="nav-divider">管理員功能</div>
          </div>

          <li class="nav-item">
            <router-link to="/admin/dashboard" class="nav-link" :title="isCollapsed ? '管理後台' : ''">
              <i class="fas fa-tachometer-alt"></i>
              <span v-if="!isCollapsed">管理後台</span>
            </router-link>
          </li>

          <li class="nav-item">
            <router-link to="/admin/movies" class="nav-link" :title="isCollapsed ? '電影管理' : ''">
              <i class="fas fa-film"></i>
              <span v-if="!isCollapsed">電影管理</span>
            </router-link>
          </li>

          <li class="nav-item">
            <router-link to="/admin/stores" class="nav-link" :title="isCollapsed ? '商店管理' : ''">
              <i class="fas fa-store-alt"></i>
              <span v-if="!isCollapsed">商店管理</span>
            </router-link>
          </li>

          <li class="nav-item">
            <router-link to="/admin/promotions" class="nav-link" :title="isCollapsed ? '活動管理' : ''">
              <i class="fas fa-ad"></i>
              <span v-if="!isCollapsed">活動管理</span>
            </router-link>
          </li>

          <li class="nav-item">
            <router-link to="/admin/users" class="nav-link" :title="isCollapsed ? '會員管理' : ''">
              <i class="fas fa-users"></i>
              <span v-if="!isCollapsed">會員管理</span>
            </router-link>
          </li>

          <li class="nav-item">
            <router-link to="/admin/discounts" class="nav-link" :title="isCollapsed ? '優惠管理' : ''">
              <i class="fas fa-percentage"></i>
              <span v-if="!isCollapsed">優惠管理</span>
            </router-link>
          </li>
        </template>
      </ul>
    </nav>

    <!-- 底部功能區 -->
    <div class="sidebar-footer">
      <template v-if="isLoggedIn">
        <router-link to="/settings" class="btn btn-link" :title="isCollapsed ? '設定' : ''">
          <i class="fas fa-cog"></i>
          <span v-if="!isCollapsed">設定</span>
        </router-link>
        <button class="btn btn-link" @click="logout" :title="isCollapsed ? '登出' : ''">
          <i class="fas fa-sign-out-alt"></i>
          <span v-if="!isCollapsed">登出</span>
        </button>
      </template>
      <template v-else>
        <router-link to="/login" class="btn btn-link" :title="isCollapsed ? '登入' : ''">
          <i class="fas fa-sign-in-alt"></i>
          <span v-if="!isCollapsed">登入</span>
        </router-link>
      </template>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'Sidebar',

  setup() {
    const store = useStore()
    const router = useRouter()

    // 響應式狀態
    const isCollapsed = ref(false)
    const isMobile = ref(false)
    const showMobileSidebar = ref(false)

    // 計算屬性
    const isLoggedIn = computed(() => store.getters['auth/isLoggedIn'])
    const isAdmin = computed(() => store.getters['auth/isAdmin'])
    const userName = computed(() => store.getters['auth/userName'])
    const userEmail = computed(() => store.getters['auth/userEmail'])
    const userAvatar = computed(() => store.getters['auth/userAvatar'] || require('@/assets/images/default-avatar.jpg'))

    // 切換側邊欄
    const toggleSidebar = () => {
      if (isMobile.value) {
        showMobileSidebar.value = !showMobileSidebar.value
      } else {
        isCollapsed.value = !isCollapsed.value
        localStorage.setItem('sidebarState', isCollapsed.value ? 'collapsed' : 'expanded')
      }
    }

    // 登出
    const logout = async () => {
      try {
        await store.dispatch('auth/logout')
        router.push('/login')
      } catch (error) {
        console.error('登出失敗:', error)
      }
    }

    // 處理視窗大小變化
    const handleResize = () => {
      isMobile.value = window.innerWidth <= 768
      if (isMobile.value) {
        showMobileSidebar.value = false
      } else {
        const savedState = localStorage.getItem('sidebarState')
        isCollapsed.value = savedState === 'collapsed'
      }
    }

    // 生命週期鉤子
    onMounted(() => {
      handleResize()
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })

    return {
      isCollapsed,
      isMobile,
      showMobileSidebar,
      isLoggedIn,
      isAdmin,
      userName,
      userEmail,
      userAvatar,
      toggleSidebar,
      logout
    }
  }
}
</script>
<style scoped>
/* Sidebar 基本樣式 */
.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  background-color: white;
  border-right: 1px solid var(--border-color);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: var(--header-height);
  left: 0;
  z-index: 1020;
  overflow-x: hidden;
  overflow-y: auto;
}

/* 收合狀態 */
.sidebar.collapsed {
  width: var(--sidebar-collapsed-width);
}

/* 移動端狀態 */
.sidebar.mobile {
  transform: translateX(-100%);
  box-shadow: var(--box-shadow);
}

.sidebar.mobile.show {
  transform: translateX(0);
}

/* 頂部區域 */
.sidebar-header {
  padding: var(--spacing-md);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 60px;
  border-bottom: 1px solid var(--border-color);
}

.collapse-btn {
  background: none;
  border: none;
  color: var(--secondary-color);
  padding: var(--spacing-sm);
  cursor: pointer;
  transition: color 0.3s ease;
}

.collapse-btn:hover {
  color: var(--primary-color);
}

/* 用戶資訊區 */
.user-info {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.user-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  box-shadow: var(--box-shadow);
}

.user-details h6 {
  font-size: 0.9rem;
  margin-bottom: var(--spacing-xs);
}

.user-details small {
  color: var(--text-light);
}

/* 導航選單 */
.sidebar-nav {
  flex: 1;
  padding: var(--spacing-md) 0;
  overflow-y: auto;
}

.nav-section {
  margin: var(--spacing-md) 0;
}

.nav-divider {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: 0.75rem;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 1px;
  background-color: var(--bg-light);
}

.nav-item {
  margin: var(--spacing-xs) 0;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--text-color);
  text-decoration: none;
  transition: all 0.3s ease;
  border-radius: var(--border-radius-sm);
  margin: 0 var(--spacing-sm);
}

.nav-link:hover {
  background-color: rgba(var(--primary-color-rgb), 0.1);
  color: var(--primary-color);
}

.nav-link.active {
  background-color: var(--primary-color);
  color: white;
}

.nav-link i {
  width: 24px;
  text-align: center;
  font-size: 1.1rem;
  margin-right: var(--spacing-md);
}

/* 底部功能區 */
.sidebar-footer {
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: center;
  gap: var(--spacing-sm);
}

.btn-link {
  color: var(--text-light);
  text-decoration: none;
  padding: var(--spacing-sm);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.btn-link:hover {
  color: var(--primary-color);
}

/* 響應式設計 */
@media (max-width: 991.98px) {
  .sidebar {
    width: 240px;
  }

  .sidebar.collapsed {
    transform: translateX(-100%);
  }
}

@media (max-width: 767.98px) {
  .sidebar {
    width: 100%;
    max-width: 280px;
    transform: translateX(-100%);
  }

  .sidebar.show {
    transform: translateX(0);
  }

  .sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1015;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  }

  .sidebar.show + .sidebar-overlay {
    opacity: 1;
    visibility: visible;
  }

  .nav-link {
    padding: var(--spacing-md);
  }
}

/* 滾動條美化 */
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: var(--border-radius-sm);
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: var(--secondary-color);
}

/* 動畫效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 工具提示 */
[title] {
  position: relative;
}

[title]:hover::after {
  content: attr(title);
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  margin-left: 10px;
  z-index: 1000;
}
</style>
