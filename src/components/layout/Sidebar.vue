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

        <!-- 特惠商店 -->
        <li class="nav-item">
          <router-link to="/stores" class="nav-link" :title="isCollapsed ? '特惠商店' : ''">
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
        <router-link to="/settings" class="btn btn-link me-2" :title="isCollapsed ? '設定' : ''">
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
import { ref, computed, onMounted } from 'vue'
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
      // 觸發視窗重新計算大小的事件
      window.dispatchEvent(new Event('resize'))
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

    onMounted(() => {
      initSidebarState()
    })

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
  background-color: #ffffff;
  border-right: 1px solid #dee2e6;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1030;
}

.sidebar-collapsed {
  width: 60px;
}

.sidebar-header {
  padding: 1rem;
  display: flex;
  justify-content: flex-end;
  height: 60px;
}

.collapse-btn {
  background: none;
  border: none;
  color: #6c757d;
  padding: 0.5rem;
  transition: color 0.3s ease;
}

.collapse-btn:hover {
  color: #343a40;
}

.user-info {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar img {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.user-details h6 {
  font-size: 0.9rem;
  color: #343a40;
}

.user-details small {
  font-size: 0.8rem;
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
  color: #495057;
  text-decoration: none;
  transition: all 0.3s ease;
}

.nav-link:hover {
  background-color: #f8f9fa;
  color: #0d6efd;
}

.nav-link.active {
  background-color: #e9ecef;
  color: #0d6efd;
  font-weight: 500;
}

.nav-link i {
  width: 20px;
  text-align: center;
  margin-right: 10px;
  font-size: 1.1rem;
}

.nav-divider {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 1rem;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.btn-link {
  color: #6c757d;
  text-decoration: none;
  padding: 0.5rem;
  transition: color 0.3s ease;
}

.btn-link:hover {
  color: #343a40;
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.show {
    transform: translateX(0);
  }

  .sidebar-collapsed {
    transform: translateX(-100%);
  }
}

/* 自定義滾動條樣式 */
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 2px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
