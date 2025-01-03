<template>
  <div class="ticket-card">
    <div class="ticket-header">
      <h5>{{ ticket.movieTitle }}</h5>
      <span :class="getStatusClass(ticket.status)">
        {{ getStatusText(ticket.status) }}
      </span>
    </div>

    <div class="ticket-body">
      <div class="movie-info">
        <p>
          <i class="fas fa-calendar"></i>
          {{ formatDateTime(ticket.showTime) }}
        </p>
        <p>
          <i class="fas fa-map-marker-alt"></i>
          {{ ticket.hall }}
        </p>
        <p>
          <i class="fas fa-chair"></i>
          {{ ticket.seatNumber }}
        </p>
        <p v-if="ticket.price">
          <i class="fas fa-dollar-sign"></i>
          NT$ {{ formatPrice(ticket.price) }}
        </p>
      </div>

      <div class="movie-details" v-if="ticket.moviePoster">
        <img
            :src="ticket.moviePoster"
            :alt="ticket.movieTitle"
            class="movie-poster"
            @error="handleImageError"
        >
        <div class="movie-meta">
          <p v-if="ticket.movieDirector"><strong>導演：</strong>{{ ticket.movieDirector }}</p>
          <p v-if="ticket.movieCast"><strong>演員：</strong>{{ ticket.movieCast }}</p>
          <p v-if="ticket.movieDuration"><strong>片長：</strong>{{ ticket.movieDuration }}分鐘</p>
          <p v-if="ticket.movieRating"><strong>分級：</strong>{{ ticket.movieRating }}</p>
          <p v-if="ticket.movieGenre"><strong>類型：</strong>{{ ticket.movieGenre }}</p>
        </div>
      </div>

      <div class="qr-code" v-if="shouldShowQRCode">
        <img :src="ticket.qrCode" alt="QR Code" class="qr-image" @error="handleQRError">
        <p class="qr-hint">請出示QR碼於影城櫃台驗票入場</p>
        <p class="qr-expiry" v-if="ticket.expiryTime">
          有效期限至：{{ formatDateTime(ticket.expiryTime) }}
        </p>
      </div>
    </div>

    <div class="ticket-footer">
      <button
          class="btn btn-outline-secondary"
          @click="handleDownload"
          v-if="isValidTicket"
      >
        下載電子票券
      </button>
      <button
          class="btn btn-outline-primary"
          @click="handleShowDetail"
          :disabled="!isValidTicket"
      >
        查看詳情
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TicketCard',

  props: {
    ticket: {
      type: Object,
      required: true,
      validator(ticket) {
        return ticket.movieTitle &&
            ticket.status &&
            ticket.showTime;
      }
    }
  },

  computed: {
    isValidTicket() {
      return this.ticket.status === 'VALID';
    },

    shouldShowQRCode() {
      return this.ticket.qrCode &&
          this.isValidTicket &&
          new Date(this.ticket.showTime) > new Date();
    }
  },

  methods: {
    formatDateTime(datetime) {
      if (!datetime) return '';
      try {
        const options = {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        };
        return new Date(datetime).toLocaleString('zh-TW', options);
      } catch (error) {
        console.error('Date formatting error:', error);
        return datetime;
      }
    },

    formatPrice(price) {
      return Number(price).toLocaleString('zh-TW');
    },

    getStatusClass(status) {
      const classes = {
        'VALID': 'status-valid',
        'USED': 'status-used',
        'EXPIRED': 'status-expired',
        'CANCELLED': 'status-cancelled',
        'REFUNDED': 'status-refunded'
      };
      return `status ${classes[status] || 'status-default'}`;
    },

    getStatusText(status) {
      const texts = {
        'VALID': '可使用',
        'USED': '已使用',
        'EXPIRED': '已過期',
        'CANCELLED': '已取消',
        'REFUNDED': '已退票'
      };
      return texts[status] || '未知狀態';
    },

    handleImageError(e) {
      e.target.src = '/images/default-movie-poster.jpg';
    },

    handleQRError(e) {
      e.target.style.display = 'none';
      this.$emit('qr-error', this.ticket);
    },

    handleDownload() {
      this.$emit('download-ticket', {
        ...this.ticket,
        downloadTime: new Date().toISOString()
      });
    },

    handleShowDetail() {
      if (this.isValidTicket) {
        this.$emit('show-detail', this.ticket);
      }
    }
  }
};
</script>

<style scoped>
.ticket-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: transform 0.2s ease;
}

.ticket-card:hover {
  transform: translateY(-2px);
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.ticket-header h5 {
  margin: 0;
  color: #2c3e50;
  font-weight: 600;
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-valid {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-used {
  background-color: #eceff1;
  color: #546e7a;
}

.status-expired {
  background-color: #ffebee;
  color: #c62828;
}

.status-cancelled {
  background-color: #fff3e0;
  color: #ef6c00;
}

.status-refunded {
  background-color: #e3f2fd;
  color: #1565c0;
}

.ticket-body {
  margin-bottom: 1.5rem;
}

.movie-info p {
  margin-bottom: 0.75rem;
  color: #546e7a;
  display: flex;
  align-items: center;
}

.movie-info i {
  width: 20px;
  margin-right: 0.75rem;
  color: #BA0043;
}

.movie-details {
  display: flex;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.movie-poster {
  width: 120px;
  height: 180px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.movie-meta p {
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
  color: #546e7a;
}

.movie-meta strong {
  color: #2c3e50;
  margin-right: 0.5rem;
}

.qr-code {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.qr-image {
  width: 150px;
  height: 150px;
  margin-bottom: 1rem;
}

.qr-hint {
  color: #BA0043;
  font-size: 0.9rem;
  margin: 0;
}

.ticket-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn {
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 120px;
}

.btn-outline-primary {
  color: #BA0043;
  border: 2px solid #BA0043;
}

.btn-outline-primary:hover:not(:disabled) {
  background-color: #BA0043;
  color: white;
}

.btn-outline-secondary {
  color: #546e7a;
  border: 2px solid #546e7a;
}

.btn-outline-secondary:hover {
  background-color: #546e7a;
  color: white;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .ticket-card {
    padding: 1rem;
  }

  .movie-details {
    flex-direction: column;
  }

  .movie-poster {
    width: 100%;
    height: 200px;
    margin-bottom: 1rem;
    margin-right: 0;
  }

  .ticket-footer {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
}

</style>
