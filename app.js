const movies = [
  { 
    id: "movie-1", 
    title: "The Odyssey", 
    poster: "https://images.static-bluray.com/products/20/165306_6_large.jpg", 
    embedUrl: "https://cinema8.com/video/PO8PwYyO" 
  },
  { 
    id: "movie-2", 
    title: "Spider-Man: Brand New Day", 
    poster: "https://images.static-bluray.com/movies/covers/414974_large.jpg?t=1785516327", 
    embedUrl: "https://www.youtube.com/embed/YoHD9XEInc0" 
  },
  { 
    id: "movie-3", 
    title: "Mutiny", 
    poster: "https://images.static-bluray.com/movies/covers/410477_large.jpg?t=1775747898", 
    embedUrl: "https://www.youtube.com/embed/EXeTwQWrcwY" 
  },
  { 
    id: "movie-4", 
    title: "The Last Sunrise", 
    poster: "https://imgs.search.brave.com/29Ko0z7B7g8Dp0yqF5qb2F9eNFqrqJBrVlxdl5uOVPs/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMwMS5ueXQuY29t/L2NsLWFzc2V0LWlt/YWdlcy9tb3ZpZXMv/bW92aWUtdHQzNzY1/NDA5Ni5qcGc", 
    embedUrl: "https://www.youtube.com/embed/5PSNL1qE6VY" 
  },
{ 
    id: "movie-5", 
    title: "Facing El Chapo", 
    poster: "https://imgs.search.brave.com/jkV22GHXiF_nQgyIudfPpQMlcMsme-Rlil-cGKKmkHU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/a2lub2NoZWNrLmNv/bS9pL3c9MzI1L3Rz/ZW9tYXJnZjYuanBn", 
    embedUrl: "https://www.youtube.com/embed/zSWdZVtXT7E" 
  },
  { 
    id: "movie-6", 
    title: "Toxic: A Fairy Tale for Grown-ups", 
    poster: "https://imgs.search.brave.com/_K5PvY7b2lvu06Cuma5KRld6H6VryQYhunLyIVwXEj8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/ZGlzdHJpY3QuaW4v/bW92aWVzLWFzc2V0/cy9pbWFnZXMvY2lu/ZW1hLzItZTExMzc4/ODAtMWQ0My0xMWYx/LTk3OGEtY2ZlNmEy/ZTQwYTVlLmpwZz9p/bT1SZXNpemUsd2lk/dGg9MzIw", 
    embedUrl: "https://www.youtube.com/embed/YoHD9XEInc0" 
  },
];

function createMovieCard(movie) {
  const card = document.createElement('div');
  card.className = 'movie-card clickable';
  card.onclick = () => {
    window.location.href = `player.html?id=${movie.id}`;
  };

  card.innerHTML = `
    <div class="thumbnail-placeholder">
      <img src="${movie.poster}" alt="${movie.title}" class="movie-poster" loading="lazy">
    </div>
    <div class="movie-title">${movie.title}</div>
  `;
  return card;
}