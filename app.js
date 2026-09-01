// Featured Hero Movies
const featuredMovies = [
  { 
    id: "movie-10", 
    title: "Toy Story 5", 
    description: "Buzz, Woody, Jessie and the rest of the gang come face-to-face with Lilypad, a brand-new tablet device that arrives with her own disruptive ideas about what is best for Bonnie. Will playtime ever be the same?",
    poster: "https://imgs.search.brave.com/h9zgQg2PUEtOhRulETUtiYpN3z4hS3XUXJ3XXA_yp4w/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzL2MzL2Nk/LzZiL2MzY2Q2YjI3/YzRkMDNiNjhhM2Ez/ZDk2NGZkNTkzY2Rk/LmpwZw", 
    backdrop: "https://imgs.search.brave.com/h9zgQg2PUEtOhRulETUtiYpN3z4hS3XUXJ3XXA_yp4w/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzL2MzL2Nk/LzZiL2MzY2Q2YjI3/YzRkMDNiNjhhM2Ez/ZDk2NGZkNTkzY2Rk/LmpwZw",
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
    embedUrl: "https://cinema8.com/video/jXax7PlD" 
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
    embedUrl: "https://cinema8.com/video/WDezkkzX" 
  },
  { 
    id: "movie-8", 
    title: "Obsession", 
    poster: "https://imgs.search.brave.com/qplOF7u91YUhQwW1YNSv_590d0dDoj9vPnWoKmsYDxM/rs:fit:200:200:1:0/g:ce/aHR0cHM6Ly93d3cu/Y2luZW1hdGVyaWFs/LmNvbS9wLzI5N3gv/NzBieHhnZXcvb2Jz/ZXNzaW9uLW1vdmll/LXBvc3Rlci1tZC5q/cGc_dj0xNzczMjky/MDc2", 
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
  },
    { 
    id: "movie-13", 
    title: "Coyote vs. Acme", 
    poster: "https://imgs.search.brave.com/xCDb3Ky3fb0Pbpt86dGyUBlmkVAV8BoCxSlpiFG_M7A/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvZW4vdGh1bWIv/Yy9jMC9Db3lvdGVf/dnMuX0FjbWVfcG9z/dGVyLmpwZy8yNTBw/eC1Db3lvdGVfdnMu/X0FjbWVfcG9zdGVy/LmpwZz91dG1fc291/cmNlPWVuLndpa2lw/ZWRpYS5vcmcmdXRt/X2NhbXBhaWduPXBh/cnNlciZ1dG1fY29u/dGVudD10aHVtYm5h/aWw", 
    embedUrl: "https://cinema8.com/video/PO8PwYyO" 
  },
  { 
    id: "movie-14", 
    title: "Colony", 
    poster: "https://imgs.search.brave.com/8WXNHyEh0ZiR1bNrNb8cAvDx9uRhpxgjR_WIctYHKIs/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4u/Y2luZW1hdGVyaWFs/LmNvbS9wLzI5N3gv/dG5oYzlnNGwvdGhl/LWNvbG9ueS1jYW5h/ZGlhbi1tb3ZpZS1w/b3N0ZXItbWQuanBn/P3Y9MTQ1NjUzNzI1/NQ", 
    embedUrl: "https://www.youtube.com/embed/YoHD9XEInc0" 
  },
  { 
    id: "movie-15", 
    title: "Ghost in the Cell", 
    poster: "https://imgs.search.brave.com/jgTns-M62HQD31GyRCqOo9AyRFjUxZQXbDf6bnz8yKo/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NzEzckQzejRRaUwu/anBn", 
    embedUrl: "https://www.youtube.com/embed/EXeTwQWrcwY" 
  },
  { 
    id: "movie-16", 
    title: "The Secret Woman", 
    poster: "https://imgs.search.brave.com/oj_xZhgh-rBa1y1JrYzTiBuBYUP9nL4BoZ_a7Zhuspg/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4u/bW92aWVmb25lLmNv/bS9pbWFnZS1hc3Nl/dHMvMTYzMTgwNy81/RkM1dlVIRnowZmJK/T2QwYmh5ekpwQ1NM/cmMuanBnP2Q9NDgw/eDcyMCZxPTUw", 
    embedUrl: "https://www.youtube.com/embed/5PSNL1qE6VY" 
  },
  { 
    id: "movie-17", 
    title: "Barreda", 
    poster: "https://imgs.search.brave.com/XmG-m315QZDyb0VrM5fJXS-NZlETg4K-roswsCe5wag/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWFn/ZS50bWRiLm9yZy90/L3AvdzM0Mi9obnIw/UWtaU0RMbHJKVHZV/MmVjY282NXdjSG8u/anBn", 
    embedUrl: "https://www.youtube.com/embed/zSWdZVtXT7E" 
  },
  { 
    id: "movie-18", 
    title: "Buddy", 
    poster: "https://imgs.search.brave.com/o4M4f5vbK3TD9i8qgqTOiryTThH3f3YSuVLo-c2Kwmg/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NTE0b2ZyUkJLekwu/anBn", 
    embedUrl: "https://www.youtube.com/embed/YoHD9XEInc0" 
  },
  { 
    id: "movie-19", 
    title: "The Whisper Man", 
    poster: "https://imgs.search.brave.com/B1Ln0L4od39f0q-RuIA4gCpxkbR5QKQ0i2zpYqBV0rk/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zLm1v/dmllaW5zaWRlci5j/b20vaW1hZ2VzL3Ro/ZS13aGlzcGVyLW1h/bi9wLzE1MC8xMDAw/NTAwX20xNzg0MDQ4/MzgyLmpwZw", 
    embedUrl: "https://cinema8.com/video/PO8PwYyO" 
  },
  { 
    id: "movie-20", 
    title: "Yellow Mirror", 
    poster: "https://imgs.search.brave.com/O5n5dlJUgRhGLrRKoaNgo7-N93Mh1aNAiU9WCdZfSNM/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMuc2ltcHNvbnN3/aWtpLmNvbS9pbWFn/ZXMvdGh1bWIvNC80/Zi9ZZWxsb3dfTWly/cm9yX3Bvc3Rlcl8x/LnBuZy8yNTBweC1Z/ZWxsb3dfTWlycm9y/X3Bvc3Rlcl8xLnBu/Zw", 
    embedUrl: "https://www.youtube.com/embed/YoHD9XEInc0" 
  },
  { 
    id: "movie-21", 
    title: "The Dog Stars", 
    poster: "https://imgs.search.brave.com/Gs4f-bk4uJaeT8pJZMzTY2x1QYngb5RZP17eIPd9at4/rs:fit:500:0:1:0/g:ce/aHR0cDovL3d3dy5p/bXBhd2FyZHMuY29t/LzIwMjYvcG9zdGVy/cy9kb2dfc3RhcnMu/anBn", 
    embedUrl: "https://www.youtube.com/embed/EXeTwQWrcwY" 
  },
  { 
    id: "movie-22", 
    title: "It Ends", 
    poster: "https://i2.wp.com/image.tmdb.org/t/p/w185/6dfAGvZWbJnzWfSZ8gxFj63BNAH.jpg?resize=178,267", 
    embedUrl: "https://www.youtube.com/embed/5PSNL1qE6VY" 
  },
  { 
    id: "movie-23", 
    title: "Irumudi", 
    poster: "https://imgs.search.brave.com/qFDmhIhu_WNMP7_XCXajYhbo_cQYrHKv9qYS4rdUYrk/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9heHNt/d2lvcW1mM2MuY29t/cGF0Lm9iamVjdHN0/b3JhZ2UuYXAtaHlk/ZXJhYmFkLTEub3Jh/Y2xlY2xvdWQuY29t/L3N0YXRpYy5maWxt/eWZvY3VzLmNvbS93/cC1jb250ZW50L3Vw/bG9hZHMvMjAyNi8w/Ni9Qcm9maWxlLVBp/Yy0yMDI2LTA2LTEw/VDA4NDQzOC4wNjIu/cG5n", 
    embedUrl: "https://www.youtube.com/embed/zSWdZVtXT7E" 
  },
  { 
    id: "movie-24", 
    title: "Insidious: Out of the Further", 
    poster: "https://imgs.search.brave.com/jm4zMsoLfH-sXmLkiVwKzG8aCHU4mktXNkKnRFa_uro/rs:fit:500:0:1:0/g:ce/aHR0cDovL3d3dy5p/bXBhd2FyZHMuY29t/LzIwMjYvcG9zdGVy/cy9pbnNpZGlvdXNf/b3V0X29mX3RoZV9m/dXJ0aGVyLmpwZw", 
    embedUrl: "https://www.youtube.com/embed/YoHD9XEInc0" 
  },
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