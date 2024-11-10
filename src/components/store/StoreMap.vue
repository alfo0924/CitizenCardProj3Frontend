<template>
  <div class="store-map-container">
    <!-- Google Map 容器 -->
    <div ref="mapRef" class="map-view"></div>

    <!-- 地圖控制面板 -->
    <div class="map-controls">
      <!-- 定位按鈕 -->
      <button
          class="btn btn-light map-control-btn"
          @click="centerToCurrentLocation"
          :disabled="isLocating"
      >
        <i class="bi" :class="isLocating ? 'bi-arrow-clockwise spin' : 'bi-geo-alt'"></i>
      </button>

      <!-- 縮放控制 -->
      <div class="zoom-controls">
        <button
            class="btn btn-light map-control-btn"
            @click="changeZoom(1)"
        >
          <i class="bi bi-plus"></i>
        </button>
        <button
            class="btn btn-light map-control-btn"
            @click="changeZoom(-1)"
        >
          <i class="bi bi-dash"></i>
        </button>
      </div>
    </div>

    <!-- 商店資訊視窗 -->
    <div
        v-if="selectedStore"
        class="store-info-window"
        :style="infoWindowStyle"
    >
      <div class="card">
        <div class="card-body">
          <button
              type="button"
              class="btn-close float-end"
              @click="closeInfoWindow"
          ></button>
          <h5 class="card-title">{{ selectedStore.name }}</h5>
          <p class="card-text">
            <small>
              <i class="bi bi-geo-alt me-1"></i>
              {{ selectedStore.address }}
            </small>
          </p>
          <p class="card-text" v-if="selectedStore.distance">
            <small class="text-muted">
              <i class="bi bi-arrow-right-circle me-1"></i>
              距離: {{ formatDistance(selectedStore.distance) }}
            </small>
          </p>
          <div class="d-flex justify-content-between align-items-center mt-2">
            <button
                class="btn btn-sm btn-primary"
                @click="viewStoreDetails(selectedStore.id)"
            >
              查看詳情
            </button>
            <button
                class="btn btn-sm btn-outline-primary"
                @click="getDirections(selectedStore)"
            >
              導航前往
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StoreMap',

  props: {
    stores: {
      type: Array,
      required: true
    },
    center: {
      type: Object,
      default: () => ({
        lat: 25.0330,  // 預設台北市中心
        lng: 121.5654
      })
    },
    zoom: {
      type: Number,
      default: 13
    }
  },

  data() {
    return {
      map: null,
      markers: [],
      selectedStore: null,
      infoWindowPosition: { x: 0, y: 0 },
      isLocating: false,
      currentLocationMarker: null,
      mapLoaded: false
    };
  },

  computed: {
    infoWindowStyle() {
      return {
        left: `${this.infoWindowPosition.x}px`,
        top: `${this.infoWindowPosition.y}px`
      };
    }
  },

  methods: {
    async initMap() {
      try {
        // 確保 Google Maps API 已載入
        if (!window.google || !window.google.maps) {
          await this.loadGoogleMapsAPI();
        }

        const mapOptions = {
          center: this.center,
          zoom: this.zoom,
          styles: this.getMapStyles(),
          zoomControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        };

        this.map = new google.maps.Map(this.$refs.mapRef, mapOptions);
        this.mapLoaded = true;
        this.addMarkers();

        // 地圖點擊事件
        this.map.addListener('click', () => {
          this.closeInfoWindow();
        });

      } catch (error) {
        console.error('Failed to initialize map:', error);
        this.$emit('map-error', '地圖載入失敗');
      }
    },

    loadGoogleMapsAPI() {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.VUE_APP_GOOGLE_MAPS_API_KEY}`;
        script.async = true;
        script.defer = true;
        script.onerror = reject;
        script.onload = resolve;
        document.head.appendChild(script);
      });
    },

    addMarkers() {
      // 清除現有標記
      this.clearMarkers();

      this.markers = this.stores.map(store => {
        const marker = new google.maps.Marker({
          position: {
            lat: parseFloat(store.latitude),
            lng: parseFloat(store.longitude)
          },
          map: this.map,
          title: store.name,
          icon: {
            url: this.getMarkerIcon(store.category),
            scaledSize: new google.maps.Size(32, 32)
          }
        });

        // 標記點擊事件
        marker.addListener('click', () => {
          this.handleMarkerClick(store, marker);
        });

        return marker;
      });
    },

    clearMarkers() {
      this.markers.forEach(marker => marker.setMap(null));
      this.markers = [];
    },

    handleMarkerClick(store, marker) {
      this.selectedStore = store;

      // 計算資訊視窗位置
      const markerPosition = marker.getPosition();
      const point = this.map.getProjection().fromLatLngToPoint(markerPosition);
      const scale = Math.pow(2, this.map.getZoom());

      this.infoWindowPosition = {
        x: Math.floor(point.x * scale),
        y: Math.floor(point.y * scale)
      };

      // 移動地圖中心稍微偏移，讓資訊視窗完整顯示
      this.map.panTo(markerPosition);

      this.$emit('marker-click', store.id);
    },

    closeInfoWindow() {
      this.selectedStore = null;
    },

    async centerToCurrentLocation() {
      this.isLocating = true;
      try {
        const position = await this.getCurrentPosition();
        const latLng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        // 更新當前位置標記
        if (this.currentLocationMarker) {
          this.currentLocationMarker.setMap(null);
        }

        this.currentLocationMarker = new google.maps.Marker({
          position: latLng,
          map: this.map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
          }
        });

        this.map.panTo(latLng);
        this.map.setZoom(15);

      } catch (error) {
        console.error('Error getting current location:', error);
        this.$emit('location-error', '無法獲取當前位置');
      } finally {
        this.isLocating = false;
      }
    },

    getCurrentPosition() {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported'));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
    },

    changeZoom(delta) {
      const newZoom = this.map.getZoom() + delta;
      if (newZoom >= 1 && newZoom <= 20) {
        this.map.setZoom(newZoom);
      }
    },

    getMarkerIcon(category) {
      // 根據商店類別返回不同的標記圖示
      const icons = {
        restaurant: '/images/markers/restaurant.png',
        shopping: '/images/markers/shopping.png',
        entertainment: '/images/markers/entertainment.png',
        default: '/images/markers/default.png'
      };
      return icons[category] || icons.default;
    },

    formatDistance(distance) {
      if (distance < 1) {
        return `${Math.round(distance * 1000)}公尺`;
      }
      return `${distance.toFixed(1)}公里`;
    },

    viewStoreDetails(storeId) {
      this.$router.push({
        name: 'store-detail',
        params: { id: storeId }
      });
    },

    getDirections(store) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`;
      window.open(url, '_blank');
    },

    getMapStyles() {
      // 自定義地圖樣式
      return [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        },
        {
          featureType: 'transit',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ];
    }
  },

  watch: {
    stores: {
      handler() {
        if (this.mapLoaded) {
          this.addMarkers();
        }
      },
      deep: true
    },

    center: {
      handler(newCenter) {
        if (this.map) {
          this.map.panTo(newCenter);
        }
      },
      deep: true
    }
  },

  mounted() {
    this.initMap();
  },

  beforeDestroy() {
    if (this.map) {
      this.clearMarkers();
      this.map = null;
    }
  }
};
</script>

<style scoped>
.store-map-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.map-view {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

.map-controls {
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 1;
}

.map-control-btn {
  width: 40px;
  height: 40px;
  margin-bottom: 5px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.zoom-controls {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.store-info-window {
  position: absolute;
  z-index: 2;
  min-width: 250px;
  max-width: 300px;
  transform: translate(-50%, -100%);
  margin-top: -20px;
}

.store-info-window .card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .store-info-window {
    min-width: 200px;
  }
}
</style>
