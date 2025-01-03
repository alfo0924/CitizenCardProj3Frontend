<template>
  <div class="container discounts-container">
    <!-- 優惠列表 -->
    <div class="discounts-content">
      <h2 class="page-title">特店優惠總覽</h2>
      <router-link to="/discountstore/create" class="more-btn">
        新增店家
      </router-link>
      <!-- 搜尋和篩選 -->
      <div class="search-filter-container">
        <div class="search-box">
          <span class="search-icon">
            <i class="fas fa-search"></i>
          </span>
          <input type="text" placeholder="搜尋" v-model="searchKeyword">
          <button class="advanced-search-btn" @click="toggleAdvancedSearch">
            <i class="bi bi-filter-left"></i>
            進階搜尋
          </button>
        </div>
        <!-- 進階搜尋區塊 -->
        <div class="advanced-search-panel" :class="{ 'expanded': isAdvancedSearchOpen }" v-show="isAdvancedSearchOpen">
          <div class="advanced-search-content">
            <!-- 店家資料排序方式 -->
            <div class="form-group">
              <label>排序方式</label>
              <select v-model="advancedFilters.sortBy">
                <option value="default">預設排序</option>
                <option value="popularityDesc">人氣由高到低</option>
                <option value="popularityAsc">人氣由低到高</option>
              </select>
            </div>
            <!-- 美食類別篩選 -->
            <div class="form-group">
              <label>類別</label>
              <select v-model="advancedFilters.selectedCategory">
                <option value="全部">全部</option>
                <option v-for="(category, index) in advancedFilters.category" :key="index" :value="category">{{ category
                  }}</option>
              </select>
            </div>
            <!-- 店家地區篩選 -->
            <div class="form-group">
              <label>地區</label>
              <select v-model="advancedFilters.selectedArea">
                <option value="全部">全部</option>
                <option v-for="(area, index) in advancedFilters.area" :key="index" :value="area">{{ area }}</option>
              </select>
            </div>
            <div class="form-group">
              <button class="reset-btn" @click="resetFilters">重設篩選</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 結果計數 -->
      <div class="results-count">
        <h5>顯示 {{ displayedCards.length }} 項結果</h5>
      </div>

      <!-- 優惠卡片區域 -->
      <div class="cards-container">
        <router-link v-for="card in displayedCards" :key="card.id"
          :to="{ name: 'StoreDetail', params: { id: card.id } }" class="store-card">
          <div class="card-image">
            <img :src="`/images/discountStore/${card.id}.jpg`" alt="store-image" />
          </div>
          <div class="card-content">
            <h4 class="store-name">{{ card.name }}</h4>
            <p class="discount-info">{{ card.shortContent }}</p>
            <p class="location-info">{{ card.address }}</p>
            <div class="tags">
              <span class="tag">{{ card.category }}</span>
              <span class="tag">{{ card.area }}</span>
              <span class="tag">{{ card.tag }}</span>
            </div>
          </div>
        </router-link>
      </div>

      <!-- 分頁控制 -->
      <div class="pagination-container">
        <div class="page-control">
          <span>目前在第</span>
          <select class="page-select" v-model="currentPage">
            <option v-for="page in totalPages" :key="page" :value="page">{{ page }}</option>
          </select>
          <span>頁 共有 {{ totalItems }} 筆資料，每頁顯示</span>
          <select class="page-select" v-model="pageSize">
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
          <span>筆</span>
        </div>

        <div class="pagination">
          <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">上一頁</button>
          <button v-for="page in visiblePages" :key="page" class="page-btn" :class="{ active: currentPage === page }"
            @click="currentPage = page">{{ page }}</button>
          <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">下一頁</button>
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
      searchKeyword: '',
      currentPage: 1,
      pageSize: 15,
      stores: storeData.stores,
      isAdvancedSearchOpen: false,
      advancedFilters: {
        selectedCategory: '全部', // 新增：當前選中的類別
        selectedArea: '全部',     // 新增：當前選中的區域
        sortBy: 'default',
        category: ["川式料理", "中式麵食", "中式小吃", "台式甜點", "韓式料理", "日式料理", "中式點心", "台式早午餐", "飲品茶點", "中式料理"],
        area: ["西屯區", "北屯區", "南屯區"],
      }
    };
  },
  computed: {
    filteredCards() {
      // 先用關鍵字過濾
      let filtered = this.stores.filter(card =>
        card.name.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
        card.shortContent.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
        card.category.toLowerCase().includes(this.searchKeyword.toLowerCase())
      );

      // 根據選擇的類別篩選
      if (this.advancedFilters.selectedCategory !== '全部') {
        filtered = filtered.filter(card =>
          card.category === this.advancedFilters.selectedCategory
        );
      }

      // 根據選擇的區域篩選
      if (this.advancedFilters.selectedArea !== '全部') {
        filtered = filtered.filter(card =>
          card.area.includes(this.advancedFilters.selectedArea)
        );
      }

      // 根據選擇的排序方式進行排序
      switch (this.advancedFilters.sortBy) {
        case 'popularityDesc':
          filtered = _.orderBy(filtered, ['popularity'], ['desc']);
          break;
        case 'popularityAsc':
          filtered = _.orderBy(filtered, ['popularity'], ['asc']);
          break;
        default:
          // 預設排序，可以保持原本的順序或加入其他預設排序邏輯
          break;
      }

      return filtered;
    },
    displayedCards() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredCards.slice(start, end);
    },
    totalItems() {
      return this.filteredCards.length;
    },
    totalPages() {
      return Math.ceil(this.totalItems / this.pageSize);
    },
    visiblePages() {
      const pages = [];
      let start = Math.max(1, this.currentPage - 2);
      let end = Math.min(start + 4, this.totalPages);
      if (end - start < 4) {
        start = Math.max(1, end - 4);
      }
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },
  },
  methods: {
    toggleAdvancedSearch() {
      this.isAdvancedSearchOpen = !this.isAdvancedSearchOpen;
    },
    resetFilters() {
      this.advancedFilters.selectedCategory = '全部';
      this.advancedFilters.selectedArea = '全部';
      this.advancedFilters.sortBy = 'default';
      this.searchKeyword = '';
    },
  }
};
</script>

<style scoped>
.discounts-container {
  padding: 2rem 1rem;
  background-color: #f8f9fa;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: rgba(186, 0, 67, 0.9);
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
  cursor: pointer;
}

.advanced-search-btn:hover {
  background: rgba(186, 0, 67, 0.2);
}

.results-count {
  color: rgba(186, 0, 67, 0.9);
  margin: 1rem 0;
}

.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.store-card {
  flex: 0 0 calc(33.333% - 1.33rem);
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
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
  background: white;
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

.pagination-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding: 1rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.page-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-select {
  padding: 0.5rem;
  border: 1px solid rgba(186, 0, 67, 0.3);
  border-radius: 0.5rem;
  background: white;
  color: rgba(186, 0, 67, 0.9);
}

.pagination {
  display: flex;
  gap: 0.5rem;
}

.page-btn {
  padding: 0.5rem 1rem;
  border: 1px solid rgba(186, 0, 67, 0.3);
  border-radius: 0.5rem;
  background: white;
  color: rgba(186, 0, 67, 0.9);
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  background: rgba(186, 0, 67, 0.1);
}

.page-btn.active {
  background: rgba(186, 0, 67, 0.9);
  color: white;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .cards-container {
    grid-template-columns: 1fr;
  }

  .pagination-container {
    flex-direction: column;
    gap: 1rem;
  }

  .page-control {
    flex-wrap: wrap;
    justify-content: center;
  }

  .store-card {
    text-decoration: none;
    color: inherit;
    cursor: pointer;
  }
}

.more-btn {
  display: flex;
  justify-content: flex-end;
  margin-left: auto;
  width: fit-content;
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

/** 進階搜尋區塊 */
.search-filter-container {
  position: relative;
  width: 100%;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.advanced-search-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.advanced-search-btn:hover {
  background: #e9e9e9;
}

.advanced-search-panel {
  width: 100%;
  background: white;
  border-top: 1px solid #ddd;
  /* 改用上邊框來分隔 */
  height: 0;
  /* 初始高度為 0 */
  overflow: hidden;
  /* 隱藏溢出內容 */
  transition: height 0.3s ease;
  /* 改用高度過渡 */
  opacity: 0;
}

.advanced-search-panel.expanded {
  height: auto;
  /* 展開時自動適應內容高度 */
  opacity: 1;
}

.advanced-search-content {
  padding: 15px;
  transform: translateY(-100%);
  /* 初始位置在上方 */
  transition: transform 0.3s ease;
}

.advanced-search-panel.expanded .advanced-search-content {
  transform: translateY(0);
  /* 展開時移動到正確位置 */
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

/** 重設按鈕樣式 */
.reset-btn {
  width: 100%;
  padding: 8px;
  background: rgba(186, 0, 67, 0.1);
  color: rgba(186, 0, 67, 0.9);
  border: 1px solid rgba(186, 0, 67, 0.3);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-btn:hover {
  background: rgba(186, 0, 67, 0.2);
}
</style>