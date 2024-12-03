<template>
  <div class="container">
    <div class="store-detail-container" v-if="card">
      <!-- 店家基本資訊 -->
      <div class="store-info-section">
        <div class="store-image">
          <img src="/images/discountStore/shop-158317_1280.png" alt="store-image" />
        </div>
        <div class="store-info">
          <span class="store-category">{{ card.category }}</span>
          <h2 class="store-name">{{ card.name }}</h2>
          <p class="store-location">{{ card.location }}</p>
          <div class="info-block">
            <h3>優惠日期：</h3>
            <p>{{ card.time }}</p>
          </div>
          <div class="info-block">
            <h3>店家資訊：</h3>
            <ul>
              <li><strong>地址：</strong>{{ card.address }}</li>
              <li><strong>電話：</strong>{{ card.phone }}</li>
              <li v-if="card.website">
                <strong>網站連結：</strong>
                <a :href="card.website" target="_blank" rel="noopener noreferrer">{{ card.website }}</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <!-- 優惠內容 -->
      <div class="discount-content-section">
        <h2>優惠內容</h2>
        <div class="discount-details">
          <h3>出示市民卡享下列優惠：</h3>
          <p>{{ card.content }}</p>
          <p>注意事項：</p>
          <p>1.未主動出示「桃園市市民卡」，恕無法給予優惠。</p>
          <p>2.不得與其他優惠活動併用。</p>
          <p>3.優惠不適用禮卷購買、禮券支付、兌現或找零。</p>
          <p>4.陶板屋桃園同德店保有修改、中止或異動本活動之權利。</p>
        </div>
      </div>
    </div>
    <div v-else class="loading-message">Loading...</div>
  </div>
</template>

<script>
import _ from "lodash";
import storeData from "./StoreInfo.json";

export default {
  name: "StoreDetail",
  props: {
    id: {
      type: [String, Number],
      required: true,
    },
  },
  data() {
    return {
      card: null,
    };
  },
  created() {
    // 使用 Lodash 來找出對應的資料
    this.card = _.find(storeData.stores, (store) => store.id === parseInt(this.id));
  },
};
</script>

<style scoped>
.store-detail-container {
  padding: 20px;
  background-color: #f9f9f9;
  font-family: "Arial", sans-serif;
  color: #333;
}

.store-info-section {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.store-image img {
  max-width: 200px;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.store-info {
  flex: 1;
}

.store-category {
  font-size: 14px;
  font-weight: bold;
  color: #ff6347;
  margin-bottom: 10px;
}

.store-name {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.store-location {
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
}

.info-block h3 {
  font-size: 18px;
  margin-bottom: 5px;
  color: #333;
}

.info-block p,
.info-block ul {
  font-size: 14px;
  line-height: 1.6;
  color: #555;
}

.info-block ul {
  list-style: none;
  padding: 0;
}

.info-block li {
  margin-bottom: 5px;
}

.discount-content-section {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.discount-content-section h2 {
  font-size: 22px;
  margin-bottom: 10px;
}

.discount-details h3 {
  font-size: 18px;
  margin-bottom: 5px;
  color: #333;
}

.discount-details p {
  font-size: 14px;
  color: #555;
}

.loading-message {
  text-align: center;
  font-size: 16px;
  color: #888;
  padding: 20px;
}
</style>