<template>
  <div class="slider">
    <div
        class="slides"
        :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
    >
      <!-- Slide 1 -->
      <div class="slide">
        <img src="/carousel/citymovie.webp" alt="City Movie" loading="lazy">
        <div class="slide-content">
          <h2>City Movie</h2>
          <p>享受最新電影體驗</p>
          <button class="btn-primary" @click="goToMovies">立即訂票</button>
        </div>
      </div>

      <!-- Slide 2 -->
      <div class="slide">
        <img src="/carousel/shop.webp" alt="Special Offers" loading="lazy">
        <div class="slide-content">
          <h2>特惠商店</h2>
          <p>探索更多優惠</p>
          <button class="btn-primary" @click="goToShop">查看詳情</button>
        </div>
      </div>
    </div>

    <!-- Navigation Arrows -->
    <button class="nav-btn prev" @click="prevSlide" aria-label="Previous slide">
      <i class="fas fa-chevron-left"></i>
    </button>
    <button class="nav-btn next" @click="nextSlide" aria-label="Next slide">
      <i class="fas fa-chevron-right"></i>
    </button>

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
import { useRouter } from 'vue-router'

export default {
  name: 'Slider',

  setup() {
    const router = useRouter()
    const currentSlide = ref(0)
    const totalSlides = 2
    let intervalId
    let touchStartX = 0
    let touchEndX = 0

    // 輪播控制
    const nextSlide = () => {
      currentSlide.value = (currentSlide.value + 1) % totalSlides
    }

    const prevSlide = () => {
      currentSlide.value = currentSlide.value === 0 ? totalSlides - 1 : currentSlide.value - 1
    }

    const goToSlide = (index) => {
      currentSlide.value = index
      restartAutoSlide()
    }

    // 自動輪播
    const startAutoSlide = () => {
      intervalId = setInterval(nextSlide, 5000)
    }

    const stopAutoSlide = () => {
      clearInterval(intervalId)
    }

    const restartAutoSlide = () => {
      stopAutoSlide()
      startAutoSlide()
    }

    // 觸控處理
    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX
      stopAutoSlide()
    }

    const handleTouchMove = (e) => {
      touchEndX = e.touches[0].clientX
    }

    const handleTouchEnd = () => {
      const swipeThreshold = 50
      const diff = touchStartX - touchEndX

      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          nextSlide()
        } else {
          prevSlide()
        }
      }

      startAutoSlide()
    }

    // 導航功能
    const goToMovies = () => {
      router.push('/movies')
    }

    const goToShop = () => {
      router.push('/stores')
    }

    // 生命週期
    onMounted(() => {
      startAutoSlide()
    })

    onUnmounted(() => {
      stopAutoSlide()
    })

    return {
      currentSlide,
      totalSlides,
      nextSlide,
      prevSlide,
      goToSlide,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      goToMovies,
      goToShop
    }
  }
}
</script>

<style scoped>
.slider {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: calc(100vh - var(--header-height));
  background-color: #000;
}

.slides {
  display: flex;
  transition: transform 0.5s ease;
  height: 100%;
  touch-action: pan-y pinch-zoom;
}

.slide {
  position: relative;
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.slide:hover img {
  transform: scale(1.05);
}

/* Slide Content */
.slide-content {
  position: absolute;
  bottom: 20%;
  left: 10%;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  z-index: 2;
}

.slide-content h2 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.slide-content p {
  font-size: 1.5rem;
  margin-bottom: 2rem;
}

.btn-primary {
  padding: 0.75rem 2rem;
  font-size: 1.2rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
}

/* Navigation Buttons */
.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  color: white;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 2;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.4);
}

.prev {
  left: 20px;
}

.next {
  right: 20px;
}

/* Dot Indicators */
.dots {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 2;
}

.dots span {
  width: 12px;
  height: 12px;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dots span:hover {
  background-color: rgba(255, 255, 255, 0.8);
}

.dots span.active {
  background-color: white;
  transform: scale(1.2);
}

/* 響應式設計 */
@media (max-width: 1200px) {
  .slide-content h2 {
    font-size: 2.5rem;
  }

  .slide-content p {
    font-size: 1.25rem;
  }
}

@media (max-width: 768px) {
  .slider {
    height: 60vh;
  }

  .slide-content {
    text-align: center;
    left: 50%;
    transform: translateX(-50%);
    width: 90%;
  }

  .slide-content h2 {
    font-size: 2rem;
  }

  .slide-content p {
    font-size: 1rem;
  }

  .btn-primary {
    padding: 0.5rem 1.5rem;
    font-size: 1rem;
  }

  .nav-btn {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .slider {
    height: 50vh;
  }

  .slide-content h2 {
    font-size: 1.5rem;
  }

  .slide-content p {
    font-size: 0.875rem;
  }

  .nav-btn {
    width: 35px;
    height: 35px;
    font-size: 1rem;
  }

  .dots span {
    width: 8px;
    height: 8px;
  }
}
</style>
