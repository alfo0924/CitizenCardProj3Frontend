<template>
  <div class="coupon-card">
    <div class="coupon-header">
      <h5>{{ coupon.title }}</h5>
      <span :class="getStatusClass(coupon.status)">
        {{ getStatusText(coupon.status) }}
      </span>
    </div>

    <div class="coupon-body">
      <p class="description">{{ coupon.description }}</p>
      <div class="discount-info">
        <p v-if="coupon.discountType === 'PERCENTAGE'">
          折扣: {{ coupon.discountValue }}%
        </p>
        <p v-else>
          折抵金額: ${{ coupon.discountValue }}
        </p>
      </div>
      <p class="expiry-date">
        <i class="fas fa-clock"></i>
        有效期限：{{ formatDate(coupon.expiryDate) }}
      </p>
    </div>

    <div class="coupon-footer">
      <button
          class="btn btn-outline-primary"
          @click="$emit('use', coupon.id)"
          :disabled="!isValid"
      >
        {{ getButtonText }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CouponCard',

  props: {
    coupon: {
      type: Object,
      required: true
    }
  },

  computed: {
    isValid() {
      return this.coupon.status === 'VALID' &&
          new Date(this.coupon.expiryDate) > new Date();
    },

    getButtonText() {
      if (this.coupon.status === 'USED') return '已使用';
      if (this.coupon.status === 'EXPIRED') return '已過期';
      return '使用優惠券';
    }
  },

  methods: {
    formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    },

    getStatusClass(status) {
      return {
        'status-valid': status === 'VALID',
        'status-used': status === 'USED',
        'status-expired': status === 'EXPIRED'
      };
    },

    getStatusText(status) {
      const statusMap = {
        'VALID': '可使用',
        'USED': '已使用',
        'EXPIRED': '已過期'
      };
      return statusMap[status] || '未知';
    }
  }
}
</script>

<style scoped>
.coupon-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.coupon-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.coupon-header h5 {
  margin: 0;
  color: #333;
}

.status-valid {
  color: #28a745;
}

.status-used {
  color: #6c757d;
}

.status-expired {
  color: #dc3545;
}

.coupon-body {
  margin-bottom: 1rem;
}

.description {
  color: #666;
  margin-bottom: 0.5rem;
}

.discount-info {
  font-weight: bold;
  color: #BA0043;
  margin-bottom: 0.5rem;
}

.expiry-date {
  color: #666;
  font-size: 0.9rem;
}

.expiry-date i {
  margin-right: 0.5rem;
  color: #BA0043;
}

.coupon-footer {
  text-align: right;
}

.btn-outline-primary {
  color: #BA0043;
  border-color: #BA0043;
}

.btn-outline-primary:hover:not(:disabled) {
  background-color: #BA0043;
  color: white;
}

.btn-outline-primary:disabled {
  color: #6c757d;
  border-color: #6c757d;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .coupon-card {
    padding: 1rem;
  }
}
</style>
