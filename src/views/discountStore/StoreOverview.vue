<template>
  <div class="container discounts-container">
    <!-- 優惠列表 -->
    <div class="discounts-content">
      <h2 class="page-title">特店優惠總覽</h2>

      <!-- 搜尋和篩選 -->
      <div class="search-filter-container">
        <div class="search-box">
          <span class="search-icon">
            <i class="fas fa-search"></i>
          </span>
          <input type="text" placeholder="搜尋" v-model="searchKeyword">
          <button class="advanced-search-btn">
            <i class="bi bi-filter-left"></i>
            進階搜尋
          </button>
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
    };
  },
  computed: {
    filteredCards() {
      const keyword = this.searchKeyword.toLowerCase();
      return this.stores.filter(card =>
        card.name.toLowerCase().includes(keyword) ||
        card.shortContent.toLowerCase().includes(keyword) ||
        card.category.toLowerCase().includes(keyword)
      );
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
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
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
</style>