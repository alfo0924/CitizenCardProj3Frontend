import { createRouter, createWebHistory } from 'vue-router'
import { useStore } from 'vuex'

// 載入頁面組件
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

// 創建路由實例
const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home
        },
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
        {
            path: '/profile',
            name: 'profile',
            component: Profile,
            meta: {
                requiresAuth: true,
                title: '個人資料'
            }
        },
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
            meta: {
                requiresAuth: true,
                title: '訂票'
            },
            props: true
        },
        {
            path: '/wallet',
            name: 'wallet',
            component: Wallet,
            meta: {
                requiresAuth: true,
                title: '電子錢包'
            }
        },
        {
            path: '/discounts',
            name: 'discounts',
            component: Discounts,
            meta: {
                title: '優惠券'
            }
        },
        // 管理員路由
        {
            path: '/admin',
            name: 'admin',
            component: () => import('@/views/admin/AdminDashboard.vue'),
            meta: {
                requiresAuth: true,
                requiresAdmin: true,
                title: '管理後台'
            },
            children: [
                {
                    path: 'movies',
                    name: 'admin-movies',
                    component: () => import('@/views/admin/MovieManagement.vue'),
                    meta: {
                        title: '電影管理'
                    }
                },
                {
                    path: 'users',
                    name: 'admin-users',
                    component: () => import('@/views/admin/UserManagement.vue'),
                    meta: {
                        title: '會員管理'
                    }
                },
                {
                    path: 'discounts',
                    name: 'admin-discounts',
                    component: () => import('@/views/admin/DiscountManagement.vue'),
                    meta: {
                        title: '優惠管理'
                    }
                }
            ]
        },
        // 404頁面
        {
            path: '/:pathMatch(.*)*',
            name: 'not-found',
            component: NotFound,
            meta: {
                title: '頁面不存在'
            }
        }
    ],
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return { top: 0 }
        }
    }
})

// 導航守衛
router.beforeEach((to, from, next) => {
    // 設置頁面標題
    document.title = to.meta.title ? `${to.meta.title} - 市民卡系統` : '市民卡系統'

    const store = useStore()
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
        next({ name: 'home' })
        return
    }

    // 已登入用戶不能訪問登入/註冊頁
    if (to.meta.requiresGuest && isLoggedIn) {
        next({ name: 'home' })
        return
    }

    next()
})

// 錯誤處理
router.onError((error) => {
    console.error('Router error:', error)
    router.push({ name: 'not-found' })
})

export default router