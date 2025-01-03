import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'

// 靜態導入的組件
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
import PartnerStore from '@/views/other/PartnerStore.vue'
import CityMovie from '@/views/other/CityMovie.vue'
import DiscountStore from '@/views/discountStore/DiscountStore.vue'
import StoreOverview from '@/views/discountStore/StoreOverview.vue'
import DiscountStoreDetail from '@/views/discountStore/DiscountStoreDetail.vue'

// 路由配置常量
const ROUTE_META = {
    DEFAULT_TITLE: '市民卡系統',
    LAYOUTS: {
        DEFAULT: 'default',
        AUTH: 'auth',
        USER: 'user',
        ADMIN: 'admin',
        ERROR: 'error'
    }
}

// 動態導入的組件
const asyncComponents = {
    AuthorizedStores: () => import('@/views/store/AuthorizedStores.vue'),
    StoreSearch: () => import('@/views/store/StoreSearch.vue'),
    StoreDetail: () => import('@/views/store/StoreDetail.vue'),
    Promotions: () => import('@/views/promotion/Promotions.vue'),
    PromotionDetail: () => import('@/views/promotion/PromotionDetail.vue'),
    // 管理員組件
    AdminDashboard: () => import('@/views/admin/AdminDashboard.vue'),
    MovieManagement: () => import('@/views/admin/MovieManagement.vue'),
    UserManagement: () => import('@/views/admin/UserManagement.vue'),
    StoreManagement: () => import('@/views/admin/StoreManagement.vue'),
    // 錯誤頁面
    Forbidden: () => import('@/views/error/403.vue'),
    ServerError: () => import('@/views/error/500.vue')
}

// 路由配置
const routes = [
    {
        path: '/',
        name: 'home',
        component: Home,
        meta: {
            title: '首頁',
            layout: ROUTE_META.LAYOUTS.DEFAULT
        }
    },
    {
        path: '/login',
        name: 'login',
        component: Login,
        meta: {
            requiresGuest: true,
            title: '登入',
            layout: ROUTE_META.LAYOUTS.AUTH
        }
    },
    {
        path: '/register',
        name: 'register',
        component: Register,
        meta: {
            requiresGuest: true,
            title: '註冊',
            layout: ROUTE_META.LAYOUTS.AUTH
        }
    },
    {
        path: '/profile',
        name: 'profile',
        component: Profile,
        meta: {
            requiresAuth: true,
            title: '個人資料',
            layout: ROUTE_META.LAYOUTS.USER
        }
    },
    {
        path: '/movies',
        name: 'movies',
        component: MovieList,
        meta: {
            title: '電影列表',
            layout: ROUTE_META.LAYOUTS.DEFAULT
        }
    },
    {
        path: '/movies/:id',
        name: 'movie-detail',
        component: MovieDetail,
        props: true,
        meta: {
            title: '電影詳情',
            layout: ROUTE_META.LAYOUTS.DEFAULT
        }
    },
    {
        path: '/booking/:scheduleId',
        name: 'booking',
        component: Booking,
        props: true,
        meta: {
            requiresAuth: true,
            title: '訂票',
            layout: ROUTE_META.LAYOUTS.USER
        }
    },
    {
        path: '/wallet',
        name: 'wallet',
        component: Wallet,
        meta: {
            requiresAuth: true,
            title: '電子票夾',
            layout: ROUTE_META.LAYOUTS.USER
        },
        children: [
            {
                path: 'deposit',
                name: 'wallet-deposit',
                component: () => import('@/views/user/wallet/Deposit.vue'),
                meta: {
                    requiresAuth: true,
                    title: '儲值',
                    layout: ROUTE_META.LAYOUTS.USER
                }
            },
            {
                path: 'transactions',
                name: 'wallet-transactions',
                component: () => import('@/views/user/wallet/Transactions.vue'),
                meta: {
                    requiresAuth: true,
                    title: '交易記錄',
                    layout: ROUTE_META.LAYOUTS.USER
                }
            }
        ]
    },
    {
        path: '/discounts',
        name: 'discounts',
        component: Discounts,
        meta: {
            title: '優惠券',
            layout: ROUTE_META.LAYOUTS.DEFAULT
        }
    },
    {
        path: '/faq',
        name: 'faq',
        component: FAQ,
        meta: {
            title: '常見問題',
            layout: ROUTE_META.LAYOUTS.DEFAULT
        }
    },
    {
        path: '/partner-store',
        name: 'partner-store',
        component: PartnerStore,
        meta: {
            title: '特約商店',
            layout: ROUTE_META.LAYOUTS.DEFAULT
        }
    },
    {
        path: '/city-movie',
        name: 'city-movie',
        component: CityMovie,
        meta: {
            title: 'CityMovie',
            layout: ROUTE_META.LAYOUTS.DEFAULT
        }
    },
    // 特店優惠路由組
    {
        path: '/discountstore',
        name: 'discountstore',
        component: DiscountStore,
        meta: {
            title: '特店優惠',
            layout: ROUTE_META.LAYOUTS.DEFAULT
        }
    },
    {
        path: '/discountstore/overview',
        name: 'storeoverview',
        component: StoreOverview,
        meta: {
            title: '特店優惠總覽',
            layout: ROUTE_META.LAYOUTS.DEFAULT
        }
    },
    {
        path: '/store/:id',
        name: 'StoreDetail',
        component: DiscountStoreDetail,
        props: true,
        meta: {
            title: '特店優惠詳細資訊',
            layout: ROUTE_META.LAYOUTS.DEFAULT
        }
    },
    // 優惠活動路由組
    {
        path: '/promotions',
        name: 'promotions',
        component: asyncComponents.Promotions,
        meta: {
            title: '優惠活動',
            layout: ROUTE_META.LAYOUTS.DEFAULT
        }
    },
    {
        path: '/promotions/:id',
        name: 'promotion-detail',
        component: asyncComponents.PromotionDetail,
        props: true,
        meta: {
            title: '活動詳情',
            layout: ROUTE_META.LAYOUTS.DEFAULT
        }
    },
    // 管理員路由組
    {
        path: '/admin',
        name: 'admin',
        component: asyncComponents.AdminDashboard,
        meta: {
            requiresAuth: true,
            requiresAdmin: true,
            title: '管理後台',
            layout: ROUTE_META.LAYOUTS.ADMIN
        }
    },
    {
        path: '/admin/movies',
        name: 'admin-movies',
        component: asyncComponents.MovieManagement,
        meta: {
            requiresAuth: true,
            requiresAdmin: true,
            title: '電影管理',
            layout: ROUTE_META.LAYOUTS.ADMIN
        }
    },
    {
        path: '/admin/users',
        name: 'admin-users',
        component: asyncComponents.UserManagement,
        meta: {
            requiresAuth: true,
            requiresAdmin: true,
            title: '會員管理',
            layout: ROUTE_META.LAYOUTS.ADMIN
        }
    },
    {
        path: '/admin/stores',
        name: 'admin-stores',
        component: asyncComponents.StoreManagement,
        meta: {
            requiresAuth: true,
            requiresAdmin: true,
            title: '商店管理',
            layout: ROUTE_META.LAYOUTS.ADMIN
        }
    },
    // 錯誤頁面
    {
        path: '/403',
        name: 'forbidden',
        component: asyncComponents.Forbidden,
        meta: {
            title: '無權限訪問',
            layout: ROUTE_META.LAYOUTS.ERROR
        }
    },
    {
        path: '/404',
        name: 'not-found',
        component: NotFound,
        meta: {
            title: '頁面不存在',
            layout: ROUTE_META.LAYOUTS.ERROR
        }
    },
    {
        path: '/500',
        name: 'server-error',
        component: asyncComponents.ServerError,
        meta: {
            title: '伺服器錯誤',
            layout: ROUTE_META.LAYOUTS.ERROR
        }
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: { name: 'not-found' }
    }
]

// 建立路由實例
const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        }
        if (to.hash) {
            return { el: to.hash, behavior: 'smooth' }
        }
        return { top: 0, behavior: 'smooth' }
    }
})

// 認證檢查函數
const checkAuth = async (to) => {
    // 如果路由不需要認證，直接返回 true
    if (!to.meta.requiresAuth && !to.meta.requiresAdmin) {
        return true
    }

    try {
        // 初始化認證狀態
        await store.dispatch('auth/initAuth')

        const isLoggedIn = store.getters['auth/isLoggedIn']
        const isAdmin = store.getters['auth/isAdmin']

        // 檢查基本認證
        if (to.meta.requiresAuth && !isLoggedIn) {
            store.dispatch('setNotification', {
                type: 'warning',
                message: '請先登入再造訪此頁面',
                duration: 3000
            })
            return false
        }

        // 檢查管理員權限
        if (to.meta.requiresAdmin && !isAdmin) {
            store.dispatch('setNotification', {
                type: 'error',
                message: '您沒有權限訪問此頁面',
                duration: 3000
            })
            return false
        }

        return true
    } catch (error) {
        console.error('Authentication check failed:', error)
        return false
    }
}

// 全局前置守衛
router.beforeEach(async (to, from, next) => {
    // 開始載入
    store.dispatch('setLoading', true)

    try {
        // 更新頁面標題
        document.title = to.meta.title
            ? `${to.meta.title} - ${ROUTE_META.DEFAULT_TITLE}`
            : ROUTE_META.DEFAULT_TITLE

        // 檢查認證狀態
        const authResult = await checkAuth(to)

        if (!authResult) {
            // 認證失敗，重定向到登入頁面
            return next({
                name: 'login',
                query: { redirect: to.fullPath }
            })
        }

        // 檢查訪客限制
        const isLoggedIn = store.getters['auth/isLoggedIn']
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
            message: '系統發生錯誤，請稍後再試',
            duration: 3000
        })

        if (to.name !== 'server-error') {
            next({ name: 'server-error' })
        } else {
            next()
        }
    }
})

// 全局後置守衛
router.afterEach((to) => {
    // 關閉載入狀態
    store.dispatch('setLoading', false)

    // 記錄路由歷史（如果需要的話）
    if (!to.meta.skipHistory) {
        store.commit('addToHistory', to.fullPath)
    }
})

// 路由錯誤處理
router.onError((error) => {
    console.error('Router error:', error)
    store.dispatch('setLoading', false)

    // 組件加載失敗時的處理
    if (error.name === 'ChunkLoadError') {
        // 重新加載頁面
        window.location.reload()
        return
    }

    store.dispatch('setNotification', {
        type: 'error',
        message: '載入頁面時發生錯誤，請重試',
        duration: 3000
    })

    // 導航到錯誤頁面
    if (router.currentRoute.value.name !== 'server-error') {
        router.push({
            name: 'server-error',
            params: { error: error.message }
        })
    }
})

export default router
