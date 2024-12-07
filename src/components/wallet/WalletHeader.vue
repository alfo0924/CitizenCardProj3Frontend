<template>
  <div class="wallet-header">
    <div class="header-content">
      <h1 class="title">我的票券</h1>

      <ul class="nav nav-tabs">
        <li class="nav-item">
          <a class="nav-link"
             :class="{ active: activeTab === 'movie' }"
             @click="$emit('change-tab', 'movie')">
            電影票
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link"
             :class="{ active: activeTab === 'discount' }"
             @click="$emit('change-tab', 'discount')">
            優惠券
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WalletHeader',

  props: {
    activeTab: {
      type: String,
      required: true,
      validator: value => ['movie', 'discount'].includes(value)
    }
  },

  emits: ['change-tab']
}
</script>

<style scoped>
.wallet-header {
  background-color: white;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.title {
  color: #BA0043;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.nav-tabs {
  border-bottom: 1px solid #dee2e6;
}

.nav-tabs .nav-link {
  color: #495057;
  cursor: pointer;
  border: none;
  padding: 0.5rem 1rem;
  margin-right: 1rem;
}

.nav-tabs .nav-link:hover {
  color: #BA0043;
  border-bottom: 2px solid #BA0043;
}

.nav-tabs .nav-link.active {
  color: #BA0043;
  border-bottom: 2px solid #BA0043;
  font-weight: 500;
}

@media (max-width: 768px) {
  .wallet-header {
    padding: 1rem;
  }

  .title {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
}
</style>
