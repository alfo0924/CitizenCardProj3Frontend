<template>
  <div class="container">
    <div class="store-detail-container" v-if="card">
      <!-- 店家基本資訊 -->
      <div class="store-info-section">
        <div class="store-image">
          <img :src="`/images/discountStore/${card.id}.jpg`" alt="store-image" />
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
      <!-- GoogleMap & 店家資訊 -->
      <div class="map-info-section">
        <h2>店家位置</h2>
        <div class="map-info-container">
          <!-- Map -->
          <div class="map-container">
            <iframe :src="card.iframeSrc" width="100%" height="450" style="border:0;" allowfullscreen="" loading="lazy"
              referrerpolicy="no-referrer-when-downgrade">
            </iframe>
          </div>
          <!-- 店家詳細資訊 -->
          <div class="detail-info">
            <div class="info-item">
              <div class="info-icon">📍</div>
              <div class="info-content">
                <h3>位置</h3>
                <p>{{ card.address }}</p>
              </div>
            </div>
            <div class="info-item">
              <div class="info-icon">📞</div>
              <div class="info-content">
                <h3>聯絡電話</h3>
                <p>{{ card.phone }}</p>
              </div>
            </div>
            <div class="info-item">
              <div class="info-icon">🍽️</div>
              <div class="info-content">
                <h3>料理類型</h3>
                <p>{{ card.category }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from "lodash";
import storeData from "./StoreInfo.json";
import { GoogleMap, Marker } from 'vue3-google-map';

export default {
  components: { GoogleMap, Marker },
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
      center: {
        // lat:緯度, lng:經度
        lat: 25.12662, lng: 121.45747
      },
      markerOptions: {
        position: {
          lat: 25.12662, lng: 121.45747
        },
      },
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

.map-info-section {
  margin-top: 30px;
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.map-info-section h2 {
  font-size: 22px;
  margin-bottom: 15px;
}

.map-info-container {
  display: flex;
  gap: 20px;
}

.map-container {
  width: 80%;  /* 減少地圖寬度為原來的 4/5 */
  border-radius: 8px;
  overflow: hidden;
}

.map-container iframe {
  width: 100%;
  height: 450px;
  border-radius: 8px;
}

.detail-info {
  width: 20%;  /* 資訊區塊佔用剩餘的 1/5 寬度 */
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 10px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.info-icon {
  font-size: 20px;
  color: #ff6347;
  min-width: 24px;
  text-align: center;
}

.info-content h3 {
  font-size: 16px;
  margin-bottom: 5px;
  color: #333;
  font-weight: bold;
}

.info-content p {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  margin: 0;
  word-break: break-all;
}

@media (max-width: 768px) {
  .map-info-container {
    flex-direction: column;
  }
  
  .map-container,
  .detail-info {
    width: 100%;
  }
}
</style>