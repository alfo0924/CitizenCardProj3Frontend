<template>
    <div class="city-movie">
      <h1 class="title">CityMovie 電影資訊</h1>
      <div class="movie-list">
        <div v-for="movie in movies" :key="movie.id" class="movie-card">
          <img :src="movie.poster" :alt="movie.title" class="movie-poster" />
          <h2 class="movie-title">{{ movie.title }}</h2>
          <p class="movie-description">{{ movie.description }}</p>
          <button @click="bookMovie(movie.id)" class="movie-button">立即訂票</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "CityMovie",
    data() {
      return {
        movies: [
          {
            id: 1,
            title: "電影 A",
            description: "精彩的動作片。",
            poster: "/images/movie_a.jpg",
          },
          {
            id: 2,
            title: "電影 B",
            description: "感人的愛情故事。",
            poster: "/images/movie_b.jpg",
          },
          // 更多電影資料...
        ],
      };
    },
    methods: {
      bookMovie(movieId) {
        this.$router.push({ name: "booking", params: { id: movieId } });
      },
    },
  };
  </script>
  
  <style scoped>
  .city-movie {
    padding: 20px;
    text-align: center;
  }
  .title {
    font-size: 2rem;
    color: #BA0043;
  }
  .movie-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 20px;
  }
  .movie-card {
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 10px;
    width: 250px;
    text-align: center;
    padding: 15px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  .movie-poster {
    width: 100%;
    height: auto;
    border-radius: 8px;
  }
  .movie-title {
    font-size: 1.5rem;
    color: #333;
    margin: 10px 0;
  }
  .movie-description {
    color: #777;
    font-size: 1rem;
  }
  .movie-button {
    background-color: #BA0043;
    color: #fff;
    border: none;
    padding: 10px 20px;
    font-size: 1rem;
    cursor: pointer;
    border-radius: 5px;
    transition: background-color 0.3s;
  }
  .movie-button:hover {
    background-color: #a00000;
  }
  </style>
  