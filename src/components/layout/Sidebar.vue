<template>
  <div class="sidebar" :class="{ 'sidebar-collapsed': isCollapsed }">
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
          <router-link to="/" class="nav-link" :title="isCollapsed ? '首頁' : ''">
            <i class="fas fa-home"></i>
            <span v-if="!isCollapsed">首頁</span>
          </router-link>
        </li>

        <!-- 電影區 -->
        <li class="nav-item">
          <router-link to="/movies" class="nav-link" :title="isCollapsed ? '電影' : ''">
            <i class="fas fa-film"></i>
            <span v-if="!isCollapsed">電影</span>
          </router-link>
        </li>

        <!-- 訂單管理 -->
        <li class="nav-item" v-if="isLoggedIn">
          <router-link to="/bookings" class="nav-link" :title="isCollapsed ? '我的訂單' : ''">
            <i class="fas fa-ticket-alt"></i>
            <span v-if="!isCollapsed">我的訂單</span>
          </router-link>
        </li>

        <!-- 電子錢包 -->
        <li class="nav-item" v-if="isLoggedIn">
          <router-link to="/wallet" class="nav-link" :title="isCollapsed ? '電子錢包' : ''">
            <i class="fas fa-wallet"></i>
            <span v-if="!isCollapsed">電子錢包</span>
          </router-link>
        </li>

        <!-- 優惠專區 -->
        <li class="nav-item">
          <router-link to="/discounts" class="nav-link" :title="isCollapsed ? '優惠專區' : ''">
            <i class="fas fa-tags"></i>
            <span v-if="!isCollapsed">優惠專區</span>
          </router-link>
        </li>

        <!-- 管理員專區 -->
        <template v-if="isAdmin">
          <li class="nav-item">
            <div class="nav-divider" v-if="!isCollapsed">管理員功能</div>
            <router-link to="/admin/movies" class="nav-link" :title="isCollapsed ? '電影管理' : ''">
              <i class="fas fa-film"></i>
              <span v-if="!isCollapsed">電影管理</span>
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
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'Sidebar',

  setup() {
    const store = useStore()
    const router = useRouter()
    const isCollapsed = ref(false)

    // 計算屬性
    const isLoggedIn = computed(() => store.getters['auth/isLoggedIn'])
    const isAdmin = computed(() => store.getters['auth/isAdmin'])
    const userName = computed(() => store.getters['auth/userName'])
    const userEmail = computed(() => store.getters['auth/userEmail'])
    const userAvatar = computed(() => store.getters['auth/userAvatar'])

    // 切換側邊欄
    const toggleSidebar = () => {
      isCollapsed.value = !isCollapsed.value
      localStorage.setItem('sidebarState', isCollapsed.value ? 'collapsed' : 'expanded')
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

    // 初始化側邊欄狀態
    const initSidebarState = () => {
      const savedState = localStorage.getItem('sidebarState')
      if (savedState) {
        isCollapsed.value = savedState === 'collapsed'
      }
    }

    // 在組件掛載時初始化
    initSidebarState()

    return {
      isCollapsed,
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
.sidebar {
  width: 250px;
  height: 100vh;
  background-color: var(--bg-light);
  border-right: 1px solid var(--border-color);
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
}

.sidebar-collapsed {
  width: 60px;
}

.sidebar-header {
  padding: 1rem;
  display: flex;
  justify-content: flex-end;
}

.collapse-btn {
  background: none;
  border: none;
  color: var(--text-color);
  padding: 0.5rem;
}

.user-info {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.user-avatar img {
  width: 40px;
  height: 40px;
  object-fit: cover;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: var(--text-color);
  text-decoration: none;
  transition: background-color 0.3s ease;
}

.nav-link:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.nav-link.active {
  background-color: var(--primary-color);
  color: white;
}

.nav-link i {
  width: 20px;
  text-align: center;
  margin-right: 10px;
}

.nav-divider {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid var(--border-color);
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    z-index: 1030;
    transform: translateX(-100%);
  }

  .sidebar.show {
    transform: translateX(0);
  }
}
</style>