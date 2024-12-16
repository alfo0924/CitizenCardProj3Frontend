import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Login from '@/views/auth/Login.vue'
import Register from '@/views/auth/Register.vue'
import Profile from '@/views/user/Profile.vue'
import MovieList from '@/views/movie/MovieList.vue'
import MovieDetail from '@/views/movie/MovieDetail.vue'
import Booking from '@/views/movie/Booking.vue'
import Wallet from '@/views/user/Wallet.vue'
import Discounts from '@/views/discount/Discounts.vue'
import NotFound from '@/views/NotFound.vue'
import FAQ from '@/views/other/FAQ.vue'
import store from '@/store'
import PartnerStore from '@/views/other/PartnerStore.vue'
import CityMovie from '@/views/other/CityMovie.vue'

// 使用動態引入優化載入效能
// 特惠商店相關頁面
const AuthorizedStores = () => import('@/views/store/AuthorizedStores.vue')
const StoreSearch = () => import('@/views/store/StoreSearch.vue')
const StoreDetail = () => import('@/views/store/StoreDetail.vue')

// 優惠活動相關頁面
const Promotions = () => import('@/views/promotion/Promotions.vue')
const PromotionDetail = () => import('@/views/promotion/PromotionDetail.vue')

// 特店優惠相關頁面
const DiscountStore = () => import('@/views/discountStore/DiscountStore.vue')
const StoreOverview = () => import('@/views/discountStore/StoreOverview.vue')
const DiscountStoreDetail = () => import('@/views/discountStore/DiscountStoreDetail.vue')

// 定義路由配置
const routes = [
    // 首頁路由
    {
        path: '/',
        name: 'home',
        component: Home,
        meta: {
            title: '首頁',
            layout: 'default',
            keepAlive: true // 啟用組件緩存
        }
    },
    // 身份驗證相關路由
    {
        path: '/login',
        name: 'login',
        component: Login,
        meta: {
            requiresGuest: true, // 僅允許未登入用戶訪問
            title: '登入',
            layout: 'auth'
        }
    },
    {
        path: '/register',
        name: 'register',
        component: Register,
        meta: {
            requiresGuest: true,
            title: '註冊',
            layout: 'auth'
        }
    },
    // 用戶相關路由
    {
        path: '/profile',
        name: 'profile',
        component: Profile,
        meta: {
            requiresAuth: true, // 需要登入才能訪問
            title: '個人資料',
            layout: 'user',
            keepAlive: true
        }
    },
    // 電影相關路由
    {
        path: '/movies',
        name: 'movies',
        component: MovieList,
        meta: {
            title: '電影列表',
            layout: 'default',
            keepAlive: true
        }
    },
    {
        path: '/movies/:id',
        name: 'movie-detail',
        component: MovieDetail,
        props: true,
        meta: {
            title: '電影詳情',
            layout: 'default'
        }
    },
    {
        path: '/booking/:scheduleId',
        name: 'booking',
        component: Booking,
        meta: {
            requiresAuth: true,
            title: '訂票',
            layout: 'user'
        },
        props: true
    },
    // 電子錢包相關路由
    {
        path: '/wallet',
        name: 'wallet',
        component: Wallet,
        meta: {
            requiresAuth: true,
            title: '電子票夾',
            layout: 'user',
            keepAlive: true
        },
        children: [
            {
                path: 'deposit',
                name: 'wallet-deposit',
                component: () => import('@/views/user/wallet/Deposit.vue'),
                meta: {
                    title: '儲值',
                    layout: 'user'
                }
            },
            {
                path: 'transactions',
                name: 'wallet-transactions',
                component: () => import('@/views/user/wallet/Transactions.vue'),
                meta: {
                    title: '交易記錄',
                    layout: 'user'
                }
            }
        ]
    },
// 優惠活動路由組
    {
        path: '/promotions',
        name: 'promotions',
        component: Promotions,
        meta: {
            title: '優惠活動',
            layout: 'default',
            keepAlive: true
        }
    },
    {
        path: '/promotions/:id',
        name: 'promotion-detail',
        component: PromotionDetail,
        props: true,
        meta: {
            title: '活動詳情',
            layout: 'default'
        }
    },

// 管理員路由組
    {
        path: '/admin',
        name: 'admin',
        component: () => import('@/views/admin/AdminDashboard.vue'),
        meta: {
            requiresAuth: true, // 需要登入
            requiresAdmin: true, // 需要管理員權限
            title: '管理後台',
            layout: 'admin',
            keepAlive: true
        }
    },
    {
        path: '/admin/movies',
        name: 'admin-movies',
        component: () => import('@/views/admin/MovieManagement.vue'),
        meta: {
            requiresAuth: true,
            requiresAdmin: true,
            title: '電影管理',
            layout: 'admin',
            keepAlive: true
        }
    },
    {
        path: '/admin/users',
        name: 'admin-users',
        component: () => import('@/views/admin/UserManagement.vue'),
        meta: {
            requiresAuth: true,
            requiresAdmin: true,
            title: '會員管理',
            layout: 'admin',
            keepAlive: true
        }
    },
    {
        path: '/admin/stores',
        name: 'admin-stores',
        component: () => import('@/views/admin/StoreManagement.vue'),
        meta: {
            requiresAuth: true,
            requiresAdmin: true,
            title: '商店管理',
            layout: 'admin',
            keepAlive: true
        }
    },

// 錯誤頁面路由組
    {
        path: '/403',
        name: 'forbidden',
        component: () => import('@/views/error/403.vue'),
        meta: {
            title: '無權限訪問',
            layout: 'error'
        }
    },
    {
        path: '/404',
        name: 'not-found',
        component: NotFound,
        meta: {
            title: '頁面不存在',
            layout: 'error'
        }
    },
    {
        path: '/500',
        name: 'server-error',
        component: () => import('@/views/error/500.vue'),
        meta: {
            title: '伺服器錯誤',
            layout: 'error'
        }
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: { name: 'not-found' }
    }
]

// 創建路由實例
const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return { top: 0 }
        }
    }
})

// 導航守衛
router.beforeEach(async (to, from, next) => {
    // 設置頁面標題
    document.title = to.meta.title
        ? `${to.meta.title} - 市民卡系統`
        : '市民卡系統'

    try {
        // 檢查用戶狀態
        const isLoggedIn = store.getters['auth/isLoggedIn']
        const isAdmin = store.getters['auth/isAdmin']
        const loginError = store.state.auth?.error

        // 清除之前的錯誤狀態
        if (loginError) {
            store.commit('auth/CLEAR_ERROR')
        }

        // 檢查權限
        if (to.meta.requiresAuth && !isLoggedIn) {
            store.dispatch('setNotification', {
                type: 'warning',
                message: '請先登入後再訪問此頁面'
            })
            return next({
                name: 'login',
                query: { redirect: to.fullPath }
            })
        }

        if (to.meta.requiresAdmin && !isAdmin) {
            store.dispatch('setNotification', {
                type: 'error',
                message: '您沒有權限訪問此頁面'
            })
            return next({ name: 'forbidden' })
        }

        // 已登入用戶不能訪問登入/註冊頁
        if (to.meta.requiresGuest && isLoggedIn) {
            return next({ name: 'profile' })
        }

        // 設置布局
        if (to.meta.layout) {
            store.commit('setLayout', to.meta.layout)
        }

        next()
    } catch (error) {
        console.error('Navigation error:', error)
        store.dispatch('setNotification', {
            type: 'error',
            message: '發生錯誤，請稍後再試'
        })
        next({ name: 'server-error' })
    }
})

export default router
