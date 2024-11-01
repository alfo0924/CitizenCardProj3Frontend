<template>
  <footer class="footer mt-auto py-4 bg-light">
    <div class="container">
      <div class="row">
        <!-- 公司資訊 -->
        <div class="col-md-4 mb-3">
          <h5 class="text-primary mb-3">市民卡系統</h5>
          <p class="mb-1"><i class="fas fa-phone me-2"></i>客服專線：(02)1234-5678</p>
          <p class="mb-1"><i class="fas fa-envelope me-2"></i>Email：support@citizencard.com</p>
          <p class="mb-1"><i class="fas fa-clock me-2"></i>服務時間：週一至週五 09:00-18:00</p>
          <div class="social-links mt-3">
            <a href="#" class="me-2" title="Facebook"><i class="fab fa-facebook fa-lg"></i></a>
            <a href="#" class="me-2" title="Line"><i class="fab fa-line fa-lg"></i></a>
            <a href="#" class="me-2" title="Instagram"><i class="fab fa-instagram fa-lg"></i></a>
          </div>
        </div>

        <!-- 快速連結 -->
        <div class="col-md-4 mb-3">
          <h5 class="text-primary mb-3">快速連結</h5>
          <ul class="list-unstyled">
            <li class="mb-2">
              <router-link to="/about" class="text-decoration-none">
                <i class="fas fa-info-circle me-2"></i>關於我們
              </router-link>
            </li>
            <li class="mb-2">
              <router-link to="/faq" class="text-decoration-none">
                <i class="fas fa-question-circle me-2"></i>常見問題
              </router-link>
            </li>
            <li class="mb-2">
              <router-link to="/terms" class="text-decoration-none">
                <i class="fas fa-file-alt me-2"></i>使用條款
              </router-link>
            </li>
            <li class="mb-2">
              <router-link to="/privacy" class="text-decoration-none">
                <i class="fas fa-shield-alt me-2"></i>隱私政策
              </router-link>
            </li>
          </ul>
        </div>

        <!-- 訂閱電子報 -->
        <div class="col-md-4 mb-3">
          <h5 class="text-primary mb-3">訂閱電子報</h5>
          <p class="mb-3">訂閱最新優惠和活動資訊</p>
          <form @submit.prevent="subscribeNewsletter" class="newsletter-form">
            <div class="input-group mb-3">
              <input
                  type="email"
                  class="form-control"
                  v-model="emailSubscribe"
                  placeholder="請輸入您的Email"
                  required
              >
              <button
                  class="btn btn-primary"
                  type="submit"
                  :disabled="isSubscribing"
              >
                <span v-if="isSubscribing" class="spinner-border spinner-border-sm me-1"></span>
                訂閱
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- 分隔線 -->
      <hr class="my-4">

      <!-- 版權資訊 -->
      <div class="row">
        <div class="col-md-6 text-center text-md-start">
          <p class="mb-0">&copy; {{ currentYear }} 市民卡系統 版權所有</p>
        </div>
        <div class="col-md-6 text-center text-md-end">
          <p class="mb-0">
            <span class="me-2">瀏覽人次：{{ visitorCount }}</span>
            <span>最後更新：{{ lastUpdate }}</span>
          </p>
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

    // 計算當前年份
    const currentYear = computed(() => new Date().getFullYear())

    // 訂閱電子報
    const subscribeNewsletter = async () => {
      if (!emailSubscribe.value) return

      try {
        isSubscribing.value = true
        await store.dispatch('newsletter/subscribe', emailSubscribe.value)
        emailSubscribe.value = ''
        alert('訂閱成功！感謝您的訂閱。')
      } catch (error) {
        console.error('訂閱失敗:', error)
        alert('訂閱失敗，請稍後再試。')
      } finally {
        isSubscribing.value = false
      }
    }

    // 獲取網站統計資訊
    const getStatistics = async () => {
      try {
        const stats = await store.dispatch('system/getStatistics')
        visitorCount.value = stats.visitorCount
        lastUpdate.value = new Date(stats.lastUpdate).toLocaleDateString()
      } catch (error) {
        console.error('獲取統計資訊失敗:', error)
      }
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
      subscribeNewsletter
    }
  }
}
</script>

<style scoped>
.footer {
  background-color: var(--bg-light);
  border-top: 1px solid var(--border-color);
}

.social-links a {
  color: var(--text-color);
  transition: color 0.3s ease;
}

.social-links a:hover {
  color: var(--primary-color);
}

.newsletter-form .form-control {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.newsletter-form .btn {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

@media (max-width: 768px) {
  .footer {
    text-align: center;
  }

  .social-links {
    justify-content: center;
  }
}
</style>