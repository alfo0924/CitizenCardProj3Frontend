<template>
  <div class="container discounts-container">
    <!-- 載入中狀態 -->
    <LoadingSpinner v-if="isLoading" />

    <!-- 錯誤提示 -->
    <AlertMessage v-if="error" type="error" :message="error" @close="error = null" />

    <!-- 優惠列表 -->
    <div v-else class="discounts-content">
      <h2 class="page-title">特店優惠專區</h2>

      <!-- 搜尋和篩選 -->
      <div class="search-filter-container">
        <div class="search-box">
          <span class="search-icon">
            <i class="fas fa-search"></i>
          </span>
          <input type="text" placeholder="搜尋" v-model="searchKeyword" @input="handleSearch">
          <button class="advanced-search-btn">
            <i class="bi bi-filter-left"></i>
            進階搜尋
          </button>
        </div>
      </div>

      <!-- 熱門優惠標題 -->
      <h3 class="section-title">熱門優惠</h3>

      <!-- 優惠卡片區域 -->
      <div class="carousel-wrapper">
        <div class="cards-container">
          <transition-group name="card">
            <router-link v-for="store in stores" :key="store.id" :to="{ name: 'StoreDetail', params: { id: store.id } }"
              class="store-card">
              <div class="card-image">
                <img :src="`/images/discountStore/${store.id}.jpg`" alt="store-image" />
              </div>
              <div class="card-content">
                <h4 class="store-name">{{ store.name }}</h4>
                <p class="discount-info">{{ store.shortContent }}</p>
                <p class="time-info">{{ store.time }}</p>
                <p class="location-info">{{ store.address }}</p>
                <div class="tags">
                  <span class="tag">{{ store.category }}</span>
                  <span class="tag">{{ store.tag }}</span>
                </div>
              </div>
            </router-link>
          </transition-group>
        </div>
      </div>

      <!-- 更多按鈕 -->
      <div class="more-btn-container">
        <router-link to="/discountstore/overview" class="more-btn">
          更多店家
        </router-link>
      </div>

      <!-- 底部資訊 -->
      <div class="bottom-info">
        <div class="info-content">
          <h3 class="info-title">桃園市民卡特約商店優惠合作</h3>
          <p class="info-desc">想要提升商店的曝光度嗎？</p>
          <p class="info-desc">免費加入桃園市民卡特約商店計劃發掘商機新視野！</p>
          <button class="join-btn">
            免費加入特店計畫
          </button>
        </div>
        <div class="info-image">
          <div class="speech-bubble">加入逢甲市民卡特店計畫</div>
          <img src="/images/discountStore/shop-158317_1280.png" alt="store illustration">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import storeData from './StoreInfo.json';

export default {
  name: 'Discounts',
  data() {
    return {
      isLoading: false,
      error: null,
      searchKeyword: '',
      currentIndex: 0,
      stores: _.take(_.orderBy(storeData.stores, 'priority', 'desc'), 5),
    }
  },
  methods: {
    handleSearch() {
      // 搜尋處理邏輯
    },
  }
}
</script>

<style scoped>
.discounts-container {
  padding: 2rem 1rem;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: rgba(186, 0, 67, 0.9);
  margin-bottom: 2rem;
}

.search-filter-container {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-box input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.search-box input:focus {
  border-color: rgba(186, 0, 67, 0.5);
  box-shadow: 0 0 0 2px rgba(186, 0, 67, 0.1);
  outline: none;
}

.advanced-search-btn {
  padding: 0.75rem 1.5rem;
  background: rgba(186, 0, 67, 0.1);
  color: rgba(186, 0, 67, 0.9);
  border: none;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.advanced-search-btn:hover {
  background: rgba(186, 0, 67, 0.2);
}

.section-title {
  font-size: 1.5rem;
  color: rgba(186, 0, 67, 0.9);
  margin: 2rem 0;
}

/* 輪播相關樣式 */
.carousel-wrapper {
  position: relative;
  padding: 0 50px;
  margin-bottom: 2rem;
}

.cards-container {
  display: flex;
  overflow-x: hidden;
  scroll-behavior: smooth;
  gap: 2rem;
  padding: 1rem 0;
}

.store-card {
  flex: 0 0 calc(33.333% - 1.33rem);
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  border: 1px solid rgba(186, 0, 67, 0.3);
  color: rgba(186, 0, 67, 0.9);
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 2;
}

.store-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-image img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.card-content {
  padding: 1.5rem;
}

.store-name {
  font-size: 1.25rem;
  color: rgba(186, 0, 67, 0.9);
  margin-bottom: 1rem;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.tag {
  padding: 0.25rem 0.75rem;
  background: rgba(186, 0, 67, 0.1);
  color: rgba(186, 0, 67, 0.9);
  border-radius: 1rem;
  font-size: 0.875rem;
}

.more-btn-container {
  display: flex;
  justify-content: flex-end;
  margin: 2rem 0;
}

.more-btn {
  padding: 0.75rem 2rem;
  background: rgba(186, 0, 67, 0.9);
  color: white;
  border-radius: 2rem;
  text-decoration: none;
  transition: all 0.3s ease;
}

.more-btn:hover {
  background: rgba(186, 0, 67, 1);
  transform: scale(1.05);
}

/* 底部資訊樣式 */
.bottom-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  padding: 3rem;
  background: #FFF5F7;
  border-radius: 1rem;
  margin-top: 2rem;
  position: relative;
  overflow: hidden;
}

.info-content {
  flex: 1;
  z-index: 1;
}

.info-title {
  font-size: 1.75rem;
  font-weight: bold;
  color: rgba(186, 0, 67, 0.9);
  margin-bottom: 1rem;
}

.info-desc {
  font-size: 1.1rem;
  color: #4A5568;
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

.join-btn {
  margin-top: 1.5rem;
  padding: 0.75rem 2rem;
  background: rgba(186, 0, 67, 0.9);
  color: white;
  border: none;
  border-radius: 2rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.join-btn:hover {
  background: rgba(186, 0, 67, 1);
  transform: scale(1.05);
}

.info-image {
  flex: 1;
  position: relative;
  display: flex;
  justify-content: center;
}

.info-image img {
  max-width: 100%;
  height: auto;
}

.speech-bubble {
  position: absolute;
  top: -20px;
  right: 20%;
  background: white;
  padding: 0.75rem 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-size: 0.9rem;
  color: rgba(186, 0, 67, 0.9);
}

.speech-bubble::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 10px 10px 0;
  border-style: solid;
  border-color: white transparent transparent;
}

@media (max-width: 768px) {
  .carousel-wrapper {
    padding: 0 30px;
  }

  .carousel-arrow {
    width: 30px;
    height: 30px;
    font-size: 1rem;
  }

  .store-card {
    flex: 0 0 calc(100% - 1rem);
  }

  .bottom-info {
    flex-direction: column;
    padding: 2rem;
    text-align: center;
  }

  .info-image {
    margin-top: 2rem;
  }

  .speech-bubble {
    right: 10%;
  }
}
</style>