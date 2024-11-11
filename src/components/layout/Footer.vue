<template>
  <footer class="footer mt-auto py-4">
    <div class="container">
      <div class="row g-4">
        <!-- 公司資訊 -->
        <div class="col-12 col-md-4">
          <div class="footer-section">
            <h5 class="footer-title">
              <img src="@/assets/images/logo.png" alt="市民卡" height="30" class="me-2">
              市民卡系統
            </h5>
            <ul class="list-unstyled contact-info">
              <li>
                <i class="fas fa-phone-alt me-2"></i>
                客服專線：(02)1234-5678
              </li>
              <li>
                <i class="fas fa-envelope me-2"></i>
                Email：support@citizencard.com
              </li>
              <li>
                <i class="fas fa-clock me-2"></i>
                服務時間：週一至週五 09:00-18:00
              </li>
            </ul>
            <div class="social-links">
              <a href="#" target="_blank" rel="noopener" title="Facebook">
                <i class="fab fa-facebook"></i>
              </a>
              <a href="#" target="_blank" rel="noopener" title="Line">
                <i class="fab fa-line"></i>
              </a>
              <a href="#" target="_blank" rel="noopener" title="Instagram">
                <i class="fab fa-instagram"></i>
              </a>
              <a href="#" target="_blank" rel="noopener" title="Youtube">
                <i class="fab fa-youtube"></i>
              </a>
            </div>
          </div>
        </div>

        <!-- 快速連結 -->
        <div class="col-12 col-md-4">
          <div class="footer-section">
            <h5 class="footer-title">快速連結</h5>
            <div class="row">
              <div class="col-6">
                <ul class="list-unstyled quick-links">
                  <li>
                    <router-link to="/about">
                      <i class="fas fa-angle-right me-2"></i>關於我們
                    </router-link>
                  </li>
                  <li>
                    <router-link to="/faq">
                      <i class="fas fa-angle-right me-2"></i>常見問題
                    </router-link>
                  </li>
                  <li>
                    <router-link to="/terms">
                      <i class="fas fa-angle-right me-2"></i>使用條款
                    </router-link>
                  </li>
                  <li>
                    <router-link to="/privacy">
                      <i class="fas fa-angle-right me-2"></i>隱私政策
                    </router-link>
                  </li>
                </ul>
              </div>
              <div class="col-6">
                <ul class="list-unstyled quick-links">
                  <li>
                    <router-link to="/stores">
                      <i class="fas fa-angle-right me-2"></i>特約商店
                    </router-link>
                  </li>
                  <li>
                    <router-link to="/promotions">
                      <i class="fas fa-angle-right me-2"></i>優惠活動
                    </router-link>
                  </li>
                  <li>
                    <router-link to="/contact">
                      <i class="fas fa-angle-right me-2"></i>聯絡我們
                    </router-link>
                  </li>
                  <li>
                    <router-link to="/sitemap">
                      <i class="fas fa-angle-right me-2"></i>網站地圖
                    </router-link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- 訂閱電子報 -->
        <div class="col-12 col-md-4">
          <div class="footer-section">
            <h5 class="footer-title">訂閱電子報</h5>
            <p class="newsletter-desc">
              訂閱我們的電子報，獲取最新優惠和活動資訊！
            </p>
            <form @submit.prevent="subscribeNewsletter" class="newsletter-form">
              <div class="input-group">
                <input
                    type="email"
                    class="form-control"
                    placeholder="請輸入您的Email"
                    v-model="emailSubscribe"
                    :disabled="isSubscribing"
                    required
                >
                <button
                    class="btn btn-primary"
                    type="submit"
                    :disabled="isSubscribing"
                >
                  <span v-if="isSubscribing" class="spinner-border spinner-border-sm me-1"></span>
                  <span v-else><i class="fas fa-paper-plane me-1"></i></span>
                  訂閱
                </button>
              </div>
            </form>
            <div class="app-download mt-3">
              <p class="mb-2">下載市民卡 APP：</p>
              <div class="app-links">
                <a href="#" target="_blank" rel="noopener" class="me-2">
                  <img src="@/assets/images/app-store.png" alt="App Store" height="40">
                </a>
                <a href="#" target="_blank" rel="noopener">
                  <img src="@/assets/images/google-play.png" alt="Google Play" height="40">
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分隔線 -->
      <hr class="footer-divider my-4">

      <!-- 版權資訊 -->
      <div class="footer-bottom">
        <div class="row align-items-center">
          <div class="col-12 col-md-6 text-center text-md-start">
            <p class="copyright mb-2 mb-md-0">
              &copy; {{ currentYear }} 市民卡系統 版權所有
            </p>
          </div>
          <div class="col-12 col-md-6 text-center text-md-end">
            <p class="site-stats mb-0">
              <span class="me-3">
                <i class="fas fa-eye me-1"></i>
                瀏覽人次：{{ formatNumber(visitorCount) }}
              </span>
              <span>
                <i class="fas fa-clock me-1"></i>
                更新時間：{{ lastUpdate }}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'Footer',

  setup() {
    const store = useStore()
    const emailSubscribe = ref('')
    const isSubscribing = ref(false)
    const visitorCount = ref(0)
    const lastUpdate = ref('')

    const currentYear = computed(() => new Date().getFullYear())

    const subscribeNewsletter = async () => {
      if (!emailSubscribe.value) return

      try {
        isSubscribing.value = true
        await store.dispatch('newsletter/subscribe', emailSubscribe.value)
        emailSubscribe.value = ''
        store.dispatch('notification/show', {
          type: 'success',
          message: '訂閱成功！感謝您的訂閱。'
        })
      } catch (error) {
        console.error('訂閱失敗:', error)
        store.dispatch('notification/show', {
          type: 'error',
          message: '訂閱失敗，請稍後再試。'
        })
      } finally {
        isSubscribing.value = false
      }
    }

    const getStatistics = async () => {
      try {
        const stats = await store.dispatch('system/getStatistics')
        visitorCount.value = stats.visitorCount
        lastUpdate.value = new Date(stats.lastUpdate).toLocaleDateString('zh-TW')
      } catch (error) {
        console.error('獲取統計資訊失敗:', error)
      }
    }

    const formatNumber = (num) => {
      return new Intl.NumberFormat('zh-TW').format(num)
    }

    onMounted(() => {
      getStatistics()
    })

    return {
      emailSubscribe,
      isSubscribing,
      currentYear,
      visitorCount,
      lastUpdate,
      subscribeNewsletter,
      formatNumber
    }
  }
}
</script>

<style scoped>
.footer {
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
  font-size: 0.9rem;
}

.footer-section {
  height: 100%;
}

.footer-title {
  color: #0d6efd;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
}

.contact-info li {
  margin-bottom: 0.75rem;
  color: #6c757d;
}

.social-links {
  margin-top: 1.5rem;
}

.social-links a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin-right: 0.75rem;
  border-radius: 50%;
  background-color: #e9ecef;
  color: #495057;
  transition: all 0.3s ease;
}

.social-links a:hover {
  background-color: #0d6efd;
  color: white;
  transform: translateY(-2px);
}

.quick-links li {
  margin-bottom: 0.75rem;
}

.quick-links a {
  color: #6c757d;
  text-decoration: none;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
}

.quick-links a:hover {
  color: #0d6efd;
  transform: translateX(5px);
}

.newsletter-desc {
  color: #6c757d;
  margin-bottom: 1rem;
}

.newsletter-form .form-control {
  border-right: none;
}

.newsletter-form .btn {
  border-left: none;
  padding-left: 1rem;
  padding-right: 1rem;
}

.app-download {
  color: #6c757d;
}

.app-links img {
  transition: transform 0.3s ease;
}

.app-links img:hover {
  transform: translateY(-2px);
}

.footer-divider {
  border-color: #dee2e6;
  opacity: 0.5;
}

.copyright {
  color: #6c757d;
}

.site-stats {
  color: #6c757d;
}

@media (max-width: 768px) {
  .footer-section {
    text-align: center;
    margin-bottom: 2rem;
  }

  .footer-title {
    justify-content: center;
  }

  .social-links {
    justify-content: center;
  }

  .quick-links a {
    justify-content: center;
  }

  .app-links {
    justify-content: center;
    display: flex;
  }
}
</style>
