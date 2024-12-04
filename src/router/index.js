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

const routes = [
    {
        path: '/',
        name: 'home',
        component: Home,
        meta: {
            title: '首頁',
            layout: 'default'
        }
    },
    {
        path: '/login',
        name: 'login',
        component: Login,
        meta: {
            requiresGuest: true,
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
    {
        path: '/profile',
        name: 'profile',
        component: Profile,
        meta: {
            requiresAuth: true,
            title: '個人資料',
            layout: 'user'
        }
    },
    {
        path: '/movies',
        name: 'movies',
        component: MovieList,
        meta: {
            title: '電影列表',
            layout: 'default'
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
    {
        path: '/wallet',
        name: 'wallet',
        component: Wallet,
        meta: {
            requiresAuth: true,
            title: '電子票夾',
            layout: 'user'
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
    }, {
        path: '/discounts',
        name: 'discounts',
        component: Discounts,
        meta: {
            title: '優惠券',
            layout: 'default'
        }
    },
    {
        path: '/faq',
        name: 'faq',
        component: FAQ,
        meta: {
            title: '常見問題',
            layout: 'default'
        }
    },
    {
        path: '/partner-store',
        name: 'partner-store',
        component: PartnerStore,
        meta: {
            title: '特約商店',
            layout: 'default'
        }
    },
    {
        path: '/city-movie',
        name: 'city-movie',
        component: CityMovie,
        meta: {
            title: 'CityMovie',
            layout: 'default'
        }
    },

    // 特店優惠路由組
    {
        path: '/discountstore',
        name: 'discountstore',
        component: DiscountStore,
        meta: {
            title: '特店優惠',
            layout: 'default' // 保持與其他路由一致的布局設置
        }
    },
    {
        path: '/discountstore/overview',
        name: 'storeoverview',
        component: StoreOverview,
        meta: {
            title: '特店優惠總覽',
            layout: 'default' // 保持與其他路由一致的布局設置
        }
    },
    {
        path: '/store/:id',
        name: 'StoreDetail',
        component: DiscountStoreDetail,
        props: true,
        meta: {
            title: '特店優惠詳細資訊',
            layout: 'default' // 保持與其他路由一致的布局設置
        }
    },

    // 優惠活動路由組
    {
        path: '/promotions',
        name: 'promotions',
        component: Promotions,
        meta: {
            title: '優惠活動',
            layout: 'default'
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
            requiresAuth: true,
            requiresAdmin: true,
            title: '管理後台',
            layout: 'admin'
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
            layout: 'admin'
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
            layout: 'admin'
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
            layout: 'admin'
        }
    },

    // 錯誤頁面
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
]// 創建路由實例
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
// 導航守衛
router.beforeEach(async (to, from, next) => {
    // 設置頁面標題
    document.title = to.meta.title
        ? `${to.meta.title} - 市民卡系統`
        : '市民卡系統'

    try {
        const isLoggedIn = store.getters['auth/isLoggedIn']
        const isAdmin = store.getters['auth/isAdmin']

        // 需要登入的頁面
        if (to.meta.requiresAuth && !isLoggedIn) {
            store.dispatch('setNotification', {
                type: 'warning',
                message: '請先登入後再訪問此頁面'
            })
            next({
                name: 'login',
                query: { redirect: to.fullPath }
            })
            return
        }

        // 需要管理員權限的頁面
        if (to.meta.requiresAdmin && !isAdmin) {
            store.dispatch('setNotification', {
                type: 'error',
                message: '您沒有權限訪問此頁面'
            })
            next({ name: 'forbidden' })
            return
        }

        // 已登入用戶不能訪問登入/註冊頁
        if (to.meta.requiresGuest && isLoggedIn) {
            next({ name: 'profile' }) // 改為導向用戶首頁
            return
        }

        // 設置當前布局
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
// 全局後置守衛
router.afterEach(() => {
    // 關閉loading狀態
    store.dispatch('setLoading', false)
})

// 錯誤處理
router.onError((error) => {
    console.error('Router error:', error)
    if (error.name === 'ChunkLoadError') {
        // 處理代碼分割加載失敗
        window.location.reload()
    } else {
        router.push({
            name: 'server-error',
            params: { error: error.message }
        })
    }
})

export default router

