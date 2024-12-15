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
      </div>

      <div class="movie-details" v-if="ticket.moviePoster">
        <img :src="ticket.moviePoster" :alt="ticket.movieTitle" class="movie-poster">
        <div class="movie-meta">
          <p v-if="ticket.movieDirector"><strong>導演：</strong>{{ ticket.movieDirector }}</p>
          <p v-if="ticket.movieCast"><strong>演員：</strong>{{ ticket.movieCast }}</p>
          <p v-if="ticket.movieDuration"><strong>片長：</strong>{{ ticket.movieDuration }}分鐘</p>
        </div>
      </div>
    </div>

    <div class="ticket-footer">
      <button
          class="btn btn-outline-primary"
          @click="$emit('show-detail', ticket)"
          :disabled="ticket.status !== 'VALID'"
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
      required: true
    }
  },

  methods: {
    formatDateTime(datetime) {
      if (!datetime) return '';
      return new Date(datetime).toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    getStatusClass(status) {
      const classes = {
        'VALID': 'status-valid',
        'USED': 'status-used',
        'EXPIRED': 'status-expired',
        'CANCELLED': 'status-cancelled'
      };
      return classes[status] || 'status-default';
    },

    getStatusText(status) {
      const texts = {
        'VALID': '可使用',
        'USED': '已使用',
        'EXPIRED': '已過期',
        'CANCELLED': '已取消'
      };
      return texts[status] || '未知';
    }
  }
};
</script>

<style scoped>
.ticket-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.ticket-header h5 {
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

.status-cancelled {
  color: #ffc107;
}

.ticket-body {
  margin-bottom: 1rem;
}

.movie-info p {
  margin-bottom: 0.5rem;
  color: #666;
}

.movie-info i {
  margin-right: 0.5rem;
  color: #BA0043;
}

.movie-details {
  display: flex;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.movie-poster {
  width: 100px;
  height: 150px;
  object-fit: cover;
  border-radius: 5px;
  margin-right: 1rem;
}

.movie-meta p {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.ticket-footer {
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
  .ticket-card {
    padding: 1rem;
  }

  .movie-details {
    flex-direction: column;
  }

  .movie-poster {
    margin-bottom: 1rem;
  }
}
</style>
