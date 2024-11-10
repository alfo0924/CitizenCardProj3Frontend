import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'

// 基礎頁面
const Home = () => import('@/views/Home.vue')
const NotFound = () => import('@/views/NotFound.vue')

// 認證相關頁面
const Login = () => import('@/views/auth/Login.vue')
const Register = () => import('@/views/auth/Register.vue')

// 用戶相關頁面
const Profile = () => import('@/views/user/Profile.vue')
const Wallet = () => import('@/views/user/Wallet.vue')

// 電影相關頁面
const MovieList = () => import('@/views/movie/MovieList.vue')
const MovieDetail = () => import('@/views/movie/MovieDetail.vue')
const Booking = () => import('@/views/movie/Booking.vue')

// 優惠相關頁面
const Discounts = () => import('@/views/discount/Discounts.vue')
const DiscountDetail = () => import('@/views/discount/DiscountDetail.vue')

// 特惠商店相關頁面
const AuthorizedStores = () => import('@/views/store/AuthorizedStores.vue')
const StoreSearch = () => import('@/views/store/StoreSearch.vue')
const StoreDetail = () => import('@/views/store/StoreDetail.vue')

// 優惠活動相關頁面
const Promotions = () => import('@/views/promotion/Promotions.vue')
const PromotionDetail = () => import('@/views/promotion/PromotionDetail.vue')

const routes = [
    {
        path: '/',
        name: 'home',
        component: Home,
        meta: {
            title: '首頁'
        }
    },
    // 特惠商店路由組
    {
        path: '/stores',
        component: AuthorizedStores,
        children: [
            {
                path: '',
                name: 'stores',
                component: StoreSearch,
                meta: {
                    title: '特惠商店'
                }
            },
            {
                path: ':id',
                name: 'store-detail',
                component: StoreDetail,
                props: true,
                meta: {
                    title: '商店詳情'
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
            title: '優惠活動'
        }
    },
    {
        path: '/promotions/:id',
        name: 'promotion-detail',
        component: PromotionDetail,
        props: true,
        meta: {
            title: '活動詳情'
        }
    },
    // 認證路由組
    {
        path: '/login',
        name: 'login',
        component: Login,
        meta: {
            requiresGuest: true,
            title: '登入'
        }
    },
    {
        path: '/register',
        name: 'register',
        component: Register,
        meta: {
            requiresGuest: true,
            title: '註冊'
        }
    },
    // 用戶路由組
    {
        path: '/profile',
        name: 'profile',
        component: Profile,
        meta: {
            requiresAuth: true,
            title: '個人資料'
        }
    },
    // 電子錢包路由
    {
        path: '/wallet',
        name: 'wallet',
        component: Wallet,
        meta: {
            requiresAuth: true,
            title: '電子錢包'
        },
        children: [
            {
                path: 'deposit',
                name: 'wallet-deposit',
                component: () => import('@/views/user/wallet/Deposit.vue'),
                meta: {
                    title: '儲值'
                }
            },
            {
                path: 'transactions',
                name: 'wallet-transactions',
                component: () => import('@/views/user/wallet/Transactions.vue'),
                meta: {
                    title: '交易記錄'
                }
            }
        ]
    },
    // 電影路由組
    {
        path: '/movies',
        name: 'movies',
        component: MovieList,
        meta: {
            title: '電影列表'
        }
    },
    {
        path: '/movies/:id',
        name: 'movie-detail',
        component: MovieDetail,
        props: true,
        meta: {
            title: '電影詳情'
        }
    },
    {
        path: '/booking/:scheduleId',
        name: 'booking',
        component: Booking,
        props: true,
        meta: {
            requiresAuth: true,
            title: '訂票'
        }
    },
    // 優惠券路由組
    {
        path: '/discounts',
        name: 'discounts',
        component: Discounts,
        meta: {
            title: '優惠專區'
        }
    },
    {
        path: '/discounts/:id',
        name: 'discount-detail',
        component: DiscountDetail,
        props: true,
        meta: {
            title: '優惠詳情'
        }
    },
    // 管理員路由組
    {
        path: '/admin',
        name: 'admin-dashboard',
        component: () => import('@/views/admin/AdminDashboard.vue'),
        meta: {
            requiresAuth: true,
            requiresAdmin: true,
            title: '管理後台'
        }
    },
    {
        path: '/admin/movies',
        name: 'admin-movies',
        component: () => import('@/views/admin/MovieManagement.vue'),
        meta: {
            requiresAuth: true,
            requiresAdmin: true,
            title: '電影管理'
        }
    },
    {
        path: '/admin/users',
        name: 'admin-users',
        component: () => import('@/views/admin/UserManagement.vue'),
        meta: {
            requiresAuth: true,
            requiresAdmin: true,
            title: '會員管理'
        }
    },
    {
        path: '/admin/discounts',
        name: 'admin-discounts',
        component: () => import('@/views/admin/DiscountManagement.vue'),
        meta: {
            requiresAuth: true,
            requiresAdmin: true,
            title: '優惠管理'
        }
    },
    {
        path: '/admin/stores',
        name: 'admin-stores',
        component: () => import('@/views/admin/StoreManagement.vue'),
        meta: {
            requiresAuth: true,
            requiresAdmin: true,
            title: '商店管理'
        }
    },
    {
        path: '/admin/promotions',
        name: 'admin-promotions',
        component: () => import('@/views/admin/PromotionManagement.vue'),
        meta: {
            requiresAuth: true,
            requiresAdmin: true,
            title: '活動管理'
        }
    },
    // 錯誤頁面
    {
        path: '/403',
        name: 'forbidden',
        component: () => import('@/views/error/403.vue'),
        meta: {
            title: '無權限訪問'
        }
    },
    {
        path: '/404',
        name: 'not-found',
        component: NotFound,
        meta: {
            title: '頁面不存在'
        }
    },
    {
        path: '/500',
        name: 'server-error',
        component: () => import('@/views/error/500.vue'),
        meta: {
            title: '伺服器錯誤'
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
        }
        return { top: 0, behavior: 'smooth' }
    }
})

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
            next({
                name: 'login',
                query: { redirect: to.fullPath }
            })
            return
        }

        // 需要管理員權限的頁面
        if (to.meta.requiresAdmin && !isAdmin) {
            next({ name: 'forbidden' })
            return
        }

        // 已登入用戶不能訪問登入/註冊頁
        if (to.meta.requiresGuest && isLoggedIn) {
            next({ name: 'home' })
            return
        }

        next()
    } catch (error) {
        console.error('Navigation error:', error)
        next({ name: 'server-error' })
    }
})

// 錯誤處理
router.onError((error) => {
    console.error('Router error:', error)
    if (error.name === 'ChunkLoadError') {
        window.location.reload()
    } else {
        router.push({
            name: 'server-error',
            params: { error: error.message }
        })
    }
})

export default router
