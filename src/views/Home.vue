<template>
  <div class="slider">
    <div class="slides" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
      <div class="slide">
        <router-link class="dropdown-item" to="/login">
          <img src="/carousel/login.webp" alt="Slide 1">
        </router-link>
      </div>
      <div class="slide">
        <router-link class="dropdown-item" to="/city-movie">
          <img src="/carousel/citymovie.webp" alt="Slide 2">
        </router-link>
      </div>
      <div class="slide">
        <router-link class="dropdown-item" to="/discountstore">
          <img src="/carousel/shop.webp" alt="Slide 3">
        </router-link>
      </div>
    </div>
    <div class="dots">
      <span
          v-for="n in totalSlides"
          :key="n"
          :class="{ active: currentSlide === n - 1 }"
          @click="goToSlide(n - 1)"
      ></span>
    </div>
    <div class="controls">
      <button class="prev" @click="prevSlide">‹</button>
      <button class="next" @click="nextSlide">›</button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'Slider',
  setup() {
    const currentSlide = ref(0);
    const totalSlides = 3;

    const nextSlide = () => {
      currentSlide.value = (currentSlide.value + 1) % totalSlides;
    };

    const prevSlide = () => {
      currentSlide.value =
          (currentSlide.value - 1 + totalSlides) % totalSlides;
    };

    const goToSlide = (index) => {
      currentSlide.value = index;
    };

    return {
      currentSlide,
      totalSlides,
      nextSlide,
      prevSlide,
      goToSlide,
    };
  },
};
</script>

<style scoped>
.slider {
  position: relative;
  overflow: hidden;
  width: 100vw;
  height: auto;
  /* height: 85vh; */
}

.slides {
  display: flex;
  transition: transform 0.5s ease;
}

.slide {
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 100vw;
  height: auto;
  /* height: 85vh; */
  box-sizing: border-box;
  overflow: hidden;
}

.slide img {
  width: 100%;
  height: 100%;
  object-fit:cover;
}

.dots {
  position: absolute;
  bottom: 2%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 10;
}

.dots span {
  width: 12px;
  height: 12px;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.3s;
}

.dots span.active {
  background-color: rgba(255, 255, 255, 0.9);
}

.controls {
  position: absolute;
  top: 50%;
  width: 100%;
  display: flex;
  justify-content: space-between;
  transform: translateY(-50%);
  z-index: 20;
  padding: 0 20px; /* 添加左右間距 */
}

.controls button {
  background: rgba(186, 0, 67, 0.5); /* 改用主題色 */
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px; /* 增加按鈕大小 */
  height: 50px;
  font-size: 30px; /* 增加箭頭大小 */
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease; /* 添加過渡效果 */
  //opacity: 0; /* 預設隱藏 */
}

/* 滑鼠懸停效果 */
.controls button:hover {
  background: rgba(186, 0, 67, 0.8);
  transform: scale(1.1); /* 懸停時放大 */
}

/* 當滑鼠懸停在輪播圖上時顯示按鈕 */
.slider:hover .controls button {
  opacity: 1;
}

/* 左右按鈕個別樣式 */
.controls .prev {
  margin-left: 50px;
}

.controls .next {
  margin-right: 50px;
}

/* 響應式調整 */
@media (max-width: 768px) {
  .controls button {
    width: 40px;
    height: 40px;
    font-size: 24px;
  }
}

@media (max-width: 576px) {
  .controls button {
    width: 35px;
    height: 35px;
    font-size: 20px;
  }
}
</style>
