// Featured Hero Movies
const featuredMovies = [
  { 
    id: "movie-10", 
    tmdbId: "1022789", // Toy Story 5
    title: "Toy Story 5", 
    description: "Buzz, Woody, Jessie and the rest of the gang come face-to-face with Lilypad, a brand-new tablet device that arrives with her own disruptive ideas about what is best for Bonnie.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/sfQtVlIHljToOwYjhe21KPGzZWK.jpg", 
    backdrop: "https://media.themoviedb.org/t/p/w600_and_h900_face/sfQtVlIHljToOwYjhe21KPGzZWK.jpg",
    embedUrl: "https://www.youtube.com/embed/5PSNL1qE6VY" 
  },
  { 
    id: "movie-2", 
    tmdbId: "1196470", // Spider-Man: Brand New Day
    title: "Spider-Man: Brand New Day", 
    description: "Peter Parker navigates a refreshed world as old threats re-emerge and test his limits in an unfamiliar landscape.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg", 
    backdrop: "https://media.themoviedb.org/t/p/w600_and_h900_face/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg",
    embedUrl: "https://www.youtube.com/embed/YoHD9XEInc0" 
  },
  { 
    id: "movie-1", 
    tmdbId: "1168194", // The Odyssey
    title: "The Odyssey", 
    description: "An epic journey across dangerous waters and uncharted lands as hero Odysseus seeks his path back home.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg", 
    backdrop: "https://media.themoviedb.org/t/p/w600_and_h900_face/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg",
    embedUrl: "https://cinema8.com/video/PO8PwYyO" 
  }
];

// Main Grid Movie Library
const movies = [
  { 
    id: "movie-1", 
    tmdbId: "1368337",
    title: "The Odyssey", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg", 
    embedUrl: "https://cinema8.com/video/PO8PwYyO" 
  },
  { 
    id: "movie-2", 
    tmdbId: "969681",
    title: "Spider-Man: Brand New Day", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg", 
    embedUrl: "https://www.youtube.com/embed/YoHD9XEInc0" 
  },
  { 
    id: "movie-3", 
    tmdbId: "1288445",
    title: "Mutiny", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/pu2VxGlpGwffOx292w18b1tv96j.jpg", 
    embedUrl: "https://cinema8.com/video/jXax7PlD" 
  },
  { 
    id: "movie-4", 
    tmdbId: "1516698",
    title: "The Last Sunrise", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/3PWJqDfygN0YNNjWsDUOXclCp3h.jpg", 
    embedUrl: "https://www.youtube.com/embed/5PSNL1qE6VY" 
  },
  { 
    id: "movie-5", 
    tmdbId: "1621552",
    title: "Facing El Chapo", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/z8eF0ACFFKtIZ4pUeo02PCzxRVO.jpg", 
    embedUrl: "https://www.youtube.com/embed/zSWdZVtXT7E" 
  },
  { 
    id: "movie-6", 
    tmdbId: "1213243",
    title: "Toxic: A Fairy Tale for Grown-ups", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/oiIPU4lvnI0Ag2K9cyAi44eCaoE.jpg", 
    embedUrl: "https://www.youtube.com/embed/YoHD9XEInc0" 
  },
  { 
    id: "movie-7", 
    tmdbId: "1315772",
    title: "Minions & Monsters", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/4LwvU9SZc8QQzW1X1FAPhNbXnEU.jpg", 
    embedUrl: "https://cinema8.com/video/WDezkkzX" 
  },
  { 
    id: "movie-8", 
    tmdbId: "1339713",
    title: "Obsession", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/bRwnj8WEKBCvmfeUNOukJPwB43K.jpg", 
    embedUrl: "https://www.youtube.com/embed/YoHD9XEInc0" 
  },
  { 
    id: "movie-9", 
    tmdbId: "1323244",
    title: "Rage of Stars", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/oLld47ZT1I3iecM3OWhIphohQUJ.jpg", 
    embedUrl: "https://www.youtube.com/embed/EXeTwQWrcwY" 
  },
  { 
    id: "movie-10", 
    tmdbId: "1084244",
    title: "Toy Story 5", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/sfQtVlIHljToOwYjhe21KPGzZWK.jpg", 
    embedUrl: "https://www.youtube.com/embed/5PSNL1qE6VY" 
  },
  { 
    id: "movie-11", 
    tmdbId: "1232569",
    title: "Pinocchio: Unstrung", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/eUJXk3bTvLBi5Zcb0BCedZU7lVL.jpg", 
    embedUrl: "https://www.youtube.com/embed/zSWdZVtXT7E" 
  },
  { 
    id: "movie-12", 
    tmdbId: "1108427",
    title: "Moana: Live Action", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/zKVgiv5qHCvCLT4A2ymJi5QeXDH.jpg", 
    embedUrl: "https://www.youtube.com/embed/YoHD9XEInc0" 
  },
  { 
    id: "movie-13", 
    tmdbId: "1204680",
    title: "Coyote vs. Acme", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/vhv7lBWYM0DUuNU2a0V7Rhq21dD.jpg", 
    embedUrl: "https://cinema8.com/video/PO8PwYyO" 
  },
  { 
    id: "movie-14", 
    tmdbId: "1375646",
    title: "Colony", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/tN799oUR0f1gUKDYdMNrDaY7I51.jpg", 
    embedUrl: "https://www.youtube.com/embed/YoHD9XEInc0" 
  },
  { 
    id: "movie-15", 
    tmdbId: "1393326",
    title: "Ghost in the Cell", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/zxcMdx0w5Zmg8yZuuiS7CJ8vOea.jpg", 
    embedUrl: "https://www.youtube.com/embed/EXeTwQWrcwY" 
  },
  { 
    id: "movie-16", 
    tmdbId: "1631807",
    title: "The Secret Woman", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/5FC5vUHFz0fbJOd0bhyzJpCSLrc.jpg", 
    embedUrl: "https://www.youtube.com/embed/5PSNL1qE6VY" 
  },
  { 
    id: "movie-17", 
    tmdbId: "1471168",
    title: "Barreda", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/hnr0QkZSDLlrJTvU2ecco65wcHo.jpg", 
    embedUrl: "https://www.youtube.com/embed/zSWdZVtXT7E" 
  },
  { 
    id: "movie-18", 
    tmdbId: "1514026",
    title: "Buddy", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6Lh4ZlsAISFQFVfLZ90sE9ycVnN.jpg", 
    embedUrl: "https://www.youtube.com/embed/YoHD9XEInc0" 
  },
  { 
    id: "movie-19", 
    tmdbId: "860508",
    title: "The Whisper Man", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6UqflU8Qqkz7Dq4swJPqs0ZJjY4.jpg", 
    embedUrl: "https://cinema8.com/video/PO8PwYyO" 
  },
  { 
    id: "movie-20", 
    tmdbId: "1729723",
    title: "Yellow Mirror", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/1zdGvJAuuXC7dA3eV61OtUJNyjQ.jpg", 
    embedUrl: "https://www.youtube.com/embed/YoHD9XEInc0" 
  },
  { 
    id: "movie-21", 
    tmdbId: "1384216",
    title: "The Dog Stars", 
    poster: "https://imgs.search.brave.com/Gs4f-bk4uJaeT8pJZMzTY2x1QYngb5RZP17eIPd9at4/rs:fit:500:0:1:0/g:ce/aHR0cDovL3d3dy5p/bXBhd2FyZHMuY29t/LzIwMjYvcG9zdGVy/cy9kb2dfc3RhcnMu/anBn", 
    embedUrl: "https://www.youtube.com/embed/EXeTwQWrcwY" 
  },
  { 
    id: "movie-22", 
    tmdbId: "1422011",
    title: "It Ends", 
    poster: "https://i2.wp.com/image.tmdb.org/t/p/w185/6dfAGvZWbJnzWfSZ8gxFj63BNAH.jpg?resize=178,267", 
    embedUrl: "https://www.youtube.com/embed/5PSNL1qE6VY" 
  },
  { 
    id: "movie-23", 
    tmdbId: "1441228",
    title: "Irumudi", 
    poster: "https://imgs.search.brave.com/qFDmhIhu_WNMP7_XCXajYhbo_cQYrHKv9qYS4rdUYrk/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9heHNt/d2lvcW1mM2MuY29t/cGF0Lm9iamVjdHN0/b3JhZ2UuYXAtaHlk/ZXJhYmFkLTEub3Jh/Y2xlY2xvdWQuY29t/L3N0YXRpYy5maWxt/eWZvY3VzLmNvbS93/cC1jb250ZW50L3Vw/bG9hZHMvMjAyNi8w/Ni9Qcm9maWxlLVBp/Yy0yMDI2LTA2LTEw/VDA4NDQzOC4wNjIu/cG5n", 
    embedUrl: "https://www.youtube.com/embed/zSWdZVtXT7E" 
  },
  { 
    id: "movie-24", 
    tmdbId: "1291595",
    title: "Insidious: Out of the Further", 
    poster: "https://imgs.search.brave.com/jm4zMsoLfH-sXmLkiVwKzG8aCHU4mktXNkKnRFa_uro/rs:fit:500:0:1:0/g:ce/aHR0cDovL3d3dy5p/bXBhd2FyZHMuY29t/LzIwMjYvcG9zdGVy/cy9pbnNpZGlvdXNf/b3V0X29mX3RoZV9m/dXJ0aGVyLmpwZw", 
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