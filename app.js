// Featured Hero Movies
const featuredMovies = [
  { 
    id: "movie-10", 
    title: "Masters of the Universe", 
    description: "After being separated for 15 years, the Sword of Power leads Prince Adam back to Eternia, where he discovers his home shattered under the fiendish rule of Skeletor.",
    poster: "https://imgs.search.brave.com/h9zgQg2PUEtOhRulETUtiYpN3z4hS3XUXJ3XXA_yp4w/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzL2MzL2Nk/LzZiL2MzY2Q2YjI3/YzRkMDNiNjhhM2Ez/ZDk2NGZkNTkzY2Rk/LmpwZw", 
    backdrop: "https://images.static-bluray.com/movies/covers/414974_large.jpg?t=1785516327",
    embedUrl: "https://www.youtube.com/embed/5PSNL1qE6VY" 
  },
  { 
    id: "movie-2", 
    title: "Spider-Man: Brand New Day", 
    description: "Peter Parker navigates a refreshed world as old threats re-emerge and test his limits in an unfamiliar landscape.",
    poster: "https://images.static-bluray.com/movies/covers/414974_large.jpg?t=1785516327", 
    backdrop: "https://images.static-bluray.com/movies/covers/414974_large.jpg?t=1785516327",
    embedUrl: "https://www.youtube.com/embed/YoHD9XEInc0" 
  },
  { 
    id: "movie-1", 
    title: "The Odyssey", 
    description: "An epic journey across dangerous waters and uncharted lands as hero Odysseus seeks his path back home.",
    poster: "https://images.static-bluray.com/products/20/165306_6_large.jpg", 
    backdrop: "https://images.static-bluray.com/products/20/165306_6_large.jpg",
    embedUrl: "https://cinema8.com/video/PO8PwYyO" 
  }
];

// Main Grid Movie List
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
  { 
    id: "movie-7", 
    title: "Minions & Monsters", 
    poster: "https://images.static-bluray.com/movies/covers/415858_large.jpg?t=1785869849", 
    embedUrl: "https://cinema8.com/video/PO8PwYyO" 
  },
  { 
    id: "movie-8", 
    title: "Obsession", 
    poster: "https://imgs.search.brave.com/ySkkyiE_HCfd0FWPY3PV60XvjGONR4x1RQr0mP4sAKU/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/LW9yZy93aWtpcGVk/aWEvZW4vdGh1bWIv/MC8wNS9PYnNlc3Np/b25fdGhlYXRyaWNh/bF9wb3N0ZXIuanBl/Zy8yNTBweC1PYnNl/c3Npb25fdGhlYXRyaWNh/bF9wb3N0ZXIuanBlZz91dG1fc291cmNlPWVuLndpa2lw/ZWRpYS5vcmcmdXRt/X2NhbXBhaWduPXBh/cnNlciZ1dG1fY29u/dGVudD10aHVtYm5h/aWw", 
    embedUrl: "https://www.youtube.com/embed/YoHD9XEInc0" 
  },
  { 
    id: "movie-9", 
    title: "Rage of Stars", 
    poster: "https://imgs.search.brave.com/gYEGj9BpVXx7IPEJVuL7E5ty8er4BCeGfQrKcIwQIPY/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS1jYWNoZS5jaW5l/bWF0ZXJpYWwuY29t/L3AvNTAweC9haWtr/dmJteC9yYWdlLW9m/LXN0YXJzLWludGVy/bmF0aW9uYWwtbW92/aWUtcG9zdGVyLmpw/Zz92PTE3ODAzODE4/NTE", 
    embedUrl: "https://www.youtube.com/embed/EXeTwQWrcwY" 
  },
  { 
    id: "movie-10", 
    title: "Toy Story 5", 
    poster: "https://imgs.search.brave.com/h9zgQg2PUEtOhRulETUtiYpN3z4hS3XUXJ3XXA_yp4w/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzL2MzL2Nk/LzZiL2MzY2Q2YjI3/YzRkMDNiNjhhM2Ez/ZDk2NGZkNTkzY2Rk/LmpwZw", 
    embedUrl: "https://www.youtube.com/embed/5PSNL1qE6VY" 
  },
  { 
    id: "movie-11", 
    title: "Pinocchio: Unstrung", 
    poster: "https://imgs.search.brave.com/MdMXnMmAI47oubbzvA92D7MF97IjhCU7GY3vwz6IKf4/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9wcmV2/aWV3LnJlZGQuaXQv/b2ZmaWNpYWwtcGlu/b2NjaGlvLXVuc3Ry/dW5nLXBvc3Rlci12/MC1pb2dqczVqa3V1/bGcxLmpwZWc_d2lk/dGg9NjQwJmNyb3A9/c21hcnQmYXV0bz13/ZWJwJnM9MjNjZGU4/MzdkYTAyYjliN2Zl/YzkzNzIxYTE2ZTdh/OGMxOWFiNGI2YQ", 
    embedUrl: "https://www.youtube.com/embed/zSWdZVtXT7E" 
  },
  { 
    id: "movie-12", 
    title: "Moana: Live Action", 
    poster: "https://imgs.search.brave.com/VpyHgWzTLuLF9w5h__ZjEw3PL071nextd6nZcraNqjA/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9wcmV2/aWV3LnJlZGQuaXQv/bmV3LXBvc3Rlci1m/b3ItZGlzbmV5cy1s/aXZlLWFjdGlvbi1t/b2FuYS12MC10dHRy/OG4xbmp0cWcxLnBu/Zz93aWR0aD02NDAm/Y3JvcD1zbWFydCZh/dXRvPXdlYnAmcz1l/MDNiZTdlYTI1Zjdk/NGMyYzJmZmMxNmRm/ZTkwNDhiM2ExYWQ2/Nzgx", 
    embedUrl: "https://www.youtube.com/embed/YoHD9XEInc0" 
  }
];

function createMovieCard(movie) {
  const card = document.createElement('div');
  card.className = 'movie-card clickable';
  card.onclick = () => {
    window.location.href = `player.html?id=${movie.id}`;
  };

  const fallbackUrl = 'https://via.placeholder.com/300x450/1f1f1f/ffffff?text=No+Poster';

  card.innerHTML = `
    <div class="thumbnail-placeholder">
      <img src="${movie.poster}" 
           alt="${movie.title}" 
           class="movie-poster" 
           loading="lazy" 
           onerror="this.onerror=null;this.src='${fallbackUrl}';">
    </div>
    <div class="movie-title">${movie.title}</div>
  `;
  return card;
}