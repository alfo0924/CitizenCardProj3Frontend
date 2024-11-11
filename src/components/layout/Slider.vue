<template>
    <div class="slider">
      <div
        class="slides"
        :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
      >
        <!-- Slide 1 -->
        <div class="slide">
          <img src="/carousel/citymovie.webp" alt="Slide 1">
        </div>
        
        <!-- Slide 2 -->
        <div class="slide">
          <img src="/carousel/shop.webp" alt="Slide 2">
        </div>
      </div>
  
      <!-- Dot Indicators -->
      <div class="dots">
        <span
          v-for="n in totalSlides"
          :key="n"
          :class="{ active: currentSlide === n - 1 }"
          @click="goToSlide(n - 1)"
        ></span>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, onUnmounted } from 'vue'
  
  export default {
    name: 'Slider',
    setup() {
      const currentSlide = ref(0)
      const totalSlides = 2
      let intervalId
  
      const nextSlide = () => {
        currentSlide.value = (currentSlide.value + 1) % totalSlides
      }
  
      const goToSlide = (index) => {
        currentSlide.value = index
      }
  
      const startAutoSlide = () => {
        intervalId = setInterval(nextSlide, 3000) // Change slide every 3 seconds
      }
  
      const stopAutoSlide = () => {
        clearInterval(intervalId)
      }
  
      onMounted(() => {
        startAutoSlide()
      })
  
      onUnmounted(() => {
        stopAutoSlide()
      })
  
      return {
        currentSlide,
        totalSlides,
        goToSlide,
      }
    }
  }
  </script>
  <style scoped>
  .slider {
    position: relative;
    overflow: hidden;
    width: 100vw; /* 讓 slider 佔滿整個視窗寬度 */
    height: 100vh; /* 讓 slider 佔滿整個視窗高度 */
  }

  .slides {
    display: flex;
    transition: transform 0.5s ease;
    width: 100vw;
    height: 100vh;
  }

  .slide {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100vw;
    height: 100vh;
    box-sizing: border-box;
    overflow: hidden; /* 防止任何溢出內容顯示 */
  }

  .slide img {
    width: 100%;
    height: 100%;
    object-fit: contain; /* 確保圖片完整顯示而不裁切 */
    max-width: 100%;
    max-height: 100%;
  }

  /* Dot Indicators */
  .dots {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 10px;
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
    background-color: rgba(255, 255, 255, 0.9); /* 突顯當前點 */
  }
</style>
