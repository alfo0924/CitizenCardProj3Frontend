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
}

.controls button {
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.controls button:hover {
  background: rgba(0, 0, 0, 0.8);
}
</style>
