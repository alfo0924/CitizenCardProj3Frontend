<template>
    <section class="service-section">
      <h2 class="section-title">市民卡服務</h2>
      <div class="service-container">
        <div class="service-card">
          <i class="icon icon-movie"></i>
          <h3>電影訂票</h3>
          <p>線上訂票，免排隊</p>
        </div>
        <div class="service-card">
          <i class="icon icon-wallet"></i>
          <h3>電子錢包</h3>
          <p>安全支付，快速儲值</p>
        </div>
        <div class="service-card">
          <i class="icon icon-discount"></i>
          <h3>優惠資訊</h3>
          <p>多重優惠，省錢省心</p>
        </div>
        <div class="service-card">
          <i class="icon icon-member"></i>
          <h3>會員中心</h3>
          <p>管理個人資料與訂單</p>
        </div>
      </div>
    </section>
  </template>
<script>
export default {
  name: 'ServiceSection',
}
</script>
<style scoped>
.service-section {
  background-color: #b71c1c;
  padding: 50px 20px;
  text-align: center;
}

.section-title {
  font-size: 2rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 30px;
}

.service-container {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
}

.service-card {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 15px;
  width: 200px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.service-card h3 {
  font-size: 1.25rem;
  font-weight: bold;
  color: #333333;
  margin-top: 10px;
  margin-bottom: 5px;
}

.service-card p {
  color: #666666;
}

.icon {
  font-size: 2rem;
  color: #1e88e5;
  margin-bottom: 10px;
}

.icon-movie::before {
  content: "🎬"; /* 使用 emoji 模擬圖示，根據需求換成其他圖示 */
}

.icon-wallet::before {
  content: "👛";
}

.icon-discount::before {
  content: "🏷️";
}

.icon-member::before {
  content: "👤";
}
</style>
