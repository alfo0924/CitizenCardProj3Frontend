<template>
    <div class="partner-store">
      <h1 class="title">逢甲市政府特約商店</h1>
      <div class="description">
        <p>食衣住行育樂等各種優惠應有盡有，盡情享受特約商店帶來的折扣和優惠！</p>
      </div>
      <div class="store-list">
        <div v-for="store in stores" :key="store.id" class="store-card">
          <img :src="store.image" :alt="store.name" class="store-image" />
          <h2 class="store-name">{{ store.name }}</h2>
          <p class="store-description">{{ store.description }}</p>
          <button @click="visitStore(store.link)" class="store-button">前往商店</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "PartnerStore",
    data() {
      return {
        stores: [
          {
            id: 1,
            name: "商店 A",
            description: "提供各種服飾優惠。",
            image: "/images/store_a.jpg",
            link: "https://example.com/store-a",
          },
          {
            id: 2,
            name: "商店 B",
            description: "餐飲享 8 折優惠。",
            image: "/images/store_b.jpg",
            link: "https://example.com/store-b",
          },
          // 更多商店資料...
        ],
      };
    },
    methods: {
      visitStore(link) {
        window.open(link, "_blank");
      },
    },
  };
  </script>
  
  <style scoped>
  .partner-store {
    padding: 20px;
    text-align: center;
  }
  .title {
    font-size: 2rem;
    color: #BA0043;
  }
  .description p {
    margin: 0 auto 20px;
    font-size: 1.2rem;
    max-width: 600px;
    color: #555;
  }
  .store-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 20px;
  }
  .store-card {
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 10px;
    width: 250px;
    text-align: center;
    padding: 15px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  .store-image {
    width: 100%;
    height: auto;
    border-radius: 8px;
  }
  .store-name {
    font-size: 1.5rem;
    color: #333;
    margin: 10px 0;
  }
  .store-description {
    color: #777;
    font-size: 1rem;
  }
  .store-button {
    background-color: #BA0043;
    color: #fff;
    border: none;
    padding: 10px 20px;
    font-size: 1rem;
    cursor: pointer;
    border-radius: 5px;
    transition: background-color 0.3s;
  }
  .store-button:hover {
    background-color: #a00000;
  }
  </style>
  