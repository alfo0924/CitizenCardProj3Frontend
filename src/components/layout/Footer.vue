<template>
  <footer class="footer mt-auto py-4 bg-light">
    <div class="container">
      <div class="row">
        <!-- 政府資訊 -->
        <div class="col-md-6 mb-3 text-md-start d-flex align-items-start">
          <img src="/logo.webp" alt="Bird Logo" class="footer-logo me-3">
          <div>
            <h2 class="text-dark mb-3">逢甲市政府</h2>
            <p class="mb-1">更新日期：2024-11-19</p>
            <p class="mb-1">瀏覽人次：283364</p>
            <p class="mb-1">
              網站安全政策 / 政府網站資料開放宣言 / 隱私權政策
            </p>
          </div>
        </div>

        <!-- 聯絡資訊 -->
        <div class="col-md-6 text-md-end">
          <p class="mb-1">地址：407102逢甲市資工區市府路168號</p>
          <p class="mb-1">電話：04-2451-7250</p>
          <p class="mb-1">信箱：fcpass@mail.fccgov.tw</p>
          <p class="mb-1">民眾如有市政問題，歡迎多加利用1999專線洽詢</p>
          <p class="mb-1">逢甲市境內民眾請撥1999，外縣市民眾請撥04-24517250</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'Footer',

  setup() {
    const visitorCount = ref(283364)
    const lastUpdate = ref('2024-10-27')

    return {
      visitorCount,
      lastUpdate,
    }
  }
}
</script>

<style scoped>
.footer {
  background-color: #fff !important;
  color: var(--text-dark);
}

.footer h1 {
  font-weight: bold;
}

.footer p {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.footer-logo {
  width: 80px; /* Adjust the size as needed */
  height: auto;
}

@media (max-width: 768px) {
  .footer {
    text-align: center;
  }

  .text-md-end p {
    text-align: center;
  }
}
</style>
