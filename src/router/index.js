import { createRouter, createWebHistory } from 'vue-router'

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
    history: createWebHistory(import.meta.env.BASE_URL),
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
                requiresGuest: true
            }
        },
        {
            path: '/register',
            name: 'register',
            component: Register,
            meta: {
                requiresGuest: true
            }
        },
        {
            path: '/profile',
            name: 'profile',
            component: Profile,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/movies',
            name: 'movies',
            component: MovieList
        },
        {
            path: '/movies/:id',
            name: 'movie-detail',
            component: MovieDetail,
            props: true
        },
        {
            path: '/booking/:scheduleId',
            name: 'booking',
            component: Booking,
            meta: {
                requiresAuth: true
            },
            props: true
        },
        {
            path: '/wallet',
            name: 'wallet',
            component: Wallet,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/discounts',
            name: 'discounts',
            component: Discounts
        },
        // 管理員路由
        {
            path: '/admin',
            name: 'admin',
            component: () => import('@/views/admin/AdminDashboard.vue'),
            meta: {
                requiresAuth: true,
                requiresAdmin: true
            },
            children: [
                {
                    path: 'movies',
                    name: 'admin-movies',
                    component: () => import('@/views/admin/MovieManagement.vue')
                },
                {
                    path: 'users',
                    name: 'admin-users',
                    component: () => import('@/views/admin/UserManagement.vue')
                },
                {
                    path: 'discounts',
                    name: 'admin-discounts',
                    component: () => import('@/views/admin/DiscountManagement.vue')
                }
            ]
        },
        // 404頁面
        {
            path: '/:pathMatch(.*)*',
            name: 'not-found',
            component: NotFound
        }
    ]
})

// 導航守衛
router.beforeEach((to, from, next) => {
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

// 路由切換時回到頁面頂部
router.afterEach((to, from) => {
    window.scrollTo(0, 0)
})

export default router