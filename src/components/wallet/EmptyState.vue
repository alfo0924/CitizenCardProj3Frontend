<template>
  <div class="empty-state">
    <div class="empty-state-icon">
      <i :class="icon"></i>
    </div>
    <h3 class="empty-state-title">{{ title }}</h3>
    <p class="empty-state-message">{{ message }}</p>
    <button
        v-if="actionText"
        class="btn btn-outline-primary"
        @click="$emit('action')"
    >
      {{ actionText }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'EmptyState',

  props: {
    icon: {
      type: String,
      default: 'fas fa-inbox'
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    actionText: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.empty-state-icon {
  font-size: 3rem;
  color: #BA0043;
  margin-bottom: 1rem;
}

.empty-state-title {
  color: #333;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.empty-state-message {
  color: #666;
  margin-bottom: 1.5rem;
}

.btn-outline-primary {
  color: #BA0043;
  border-color: #BA0043;
}

.btn-outline-primary:hover {
  background-color: #BA0043;
  color: white;
}

@media (max-width: 768px) {
  .empty-state {
    padding: 2rem 1rem;
  }

  .empty-state-icon {
    font-size: 2.5rem;
  }

  .empty-state-title {
    font-size: 1.25rem;
  }
}
</style>
