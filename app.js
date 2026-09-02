// Featured Hero Movies
const featuredMovies = [
  { 
    id: "movie-10", 
    tmdbId: "1084244", 
    title: "Toy Story 5", 
    description: "Buzz, Woody, Jessie and the rest of the gang come face-to-face with Lilypad, a brand-new tablet device that arrives with her own disruptive ideas about what is best for Bonnie.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/sfQtVlIHljToOwYjhe21KPGzZWK.jpg", 
    backdrop: "https://media.themoviedb.org/t/p/w600_and_h900_face/sfQtVlIHljToOwYjhe21KPGzZWK.jpg",
    manualEmbed: "https://www.youtube.com/embed/5PSNL1qE6VY" // Example manual link
  },
  { 
    id: "movie-2", 
    tmdbId: "1196470", 
    title: "Spider-Man: Brand New Day", 
    description: "Peter Parker navigates a refreshed world as old threats re-emerge and test his limits in an unfamiliar landscape.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg", 
    backdrop: "https://media.themoviedb.org/t/p/w600_and_h900_face/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg"
  },
  { 
    id: "movie-1", 
    tmdbId: "1368337", 
    title: "The Odyssey", 
    description: "An epic journey across dangerous waters and uncharted lands as hero Odysseus seeks his path back home.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg", 
    backdrop: "https://media.themoviedb.org/t/p/w600_and_h900_face/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg",
    manualEmbed: "https://cinema8.com/video/PO8PwYyO" // Example manual link
  }
];

// Main Grid Movie Library
const movies = [
  { 
    id: "movie-1", 
    tmdbId: "1368337",
    title: "The Odyssey", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg",
    manualEmbed: "https://cinema8.com/video/PO8PwYyO"
  },
  { 
    id: "movie-2", 
    tmdbId: "1196470",
    title: "Spider-Man: Brand New Day", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg"
  },
  { 
    id: "movie-3", 
    tmdbId: "1288445",
    title: "Mutiny", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/pu2VxGlpGwffOx292w18b1tv96j.jpg",
    manualEmbed: "https://cinema8.com/video/jXax7PlD"
  },
  { 
    id: "movie-4", 
    tmdbId: "1516698",
    title: "The Last Sunrise", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/3PWJqDfygN0YNNjWsDUOXclCp3h.jpg"
  },
  { 
    id: "movie-5", 
    tmdbId: "1621552",
    title: "Facing El Chapo", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/z8eF0ACFFKtIZ4pUeo02PCzxRVO.jpg"
  },
  { 
    id: "movie-6", 
    tmdbId: "1213243",
    title: "Toxic: A Fairy Tale for Grown-ups", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/oiIPU4lvnI0Ag2K9cyAi44eCaoE.jpg"
  },
  { 
    id: "movie-7", 
    tmdbId: "1315772",
    title: "Minions & Monsters", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/4LwvU9SZc8QQzW1X1FAPhNbXnEU.jpg",
    manualEmbed: "https://cinema8.com/video/WDezkkzX"
  },
  { 
    id: "movie-8", 
    tmdbId: "1339713",
    title: "Obsession", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/bRwnj8WEKBCvmfeUNOukJPwB43K.jpg"
  },
  { 
    id: "movie-9", 
    tmdbId: "1323244",
    title: "Rage of Stars", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/oLld47ZT1I3iecM3OWhIphohQUJ.jpg"
  },
  { 
    id: "movie-10", 
    tmdbId: "1084244",
    title: "Toy Story 5", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/sfQtVlIHljToOwYjhe21KPGzZWK.jpg"
  },
  { 
    id: "movie-11", 
    tmdbId: "1232569",
    title: "Pinocchio: Unstrung", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/eUJXk3bTvLBi5Zcb0BCedZU7lVL.jpg"
  },
  { 
    id: "movie-12", 
    tmdbId: "1108427",
    title: "Moana: Live Action", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/zKVgiv5qHCvCLT4A2ymJi5QeXDH.jpg"
  },
  { 
    id: "movie-13", 
    tmdbId: "1204680",
    title: "Coyote vs. Acme", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/vhv7lBWYM0DUuNU2a0V7Rhq21dD.jpg"
  },
  { 
    id: "movie-14", 
    tmdbId: "1375646",
    title: "Colony", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/tN799oUR0f1gUKDYdMNrDaY7I51.jpg"
  },
  { 
    id: "movie-15", 
    tmdbId: "1393326",
    title: "Ghost in the Cell", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/zxcMdx0w5Zmg8yZuuiS7CJ8vOea.jpg"
  },
  { 
    id: "movie-16", 
    tmdbId: "1631807",
    title: "The Secret Woman", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/5FC5vUHFz0fbJOd0bhyzJpCSLrc.jpg"
  },
  { 
    id: "movie-17", 
    tmdbId: "1471168",
    title: "Barreda", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/hnr0QkZSDLlrJTvU2ecco65wcHo.jpg"
  },
  { 
    id: "movie-18", 
    tmdbId: "1514026",
    title: "Buddy", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6Lh4ZlsAISFQFVfLZ90sE9ycVnN.jpg"
  },
  { 
    id: "movie-19", 
    tmdbId: "860508",
    title: "The Whisper Man", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6UqflU8Qqkz7Dq4swJPqs0ZJjY4.jpg"
  },
  { 
    id: "movie-20", 
    tmdbId: "1729723",
    title: "Yellow Mirror", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/1zdGvJAuuXC7dA3eV61OtUJNyjQ.jpg"
  },
  { 
    id: "movie-21", 
    tmdbId: "1384216",
    title: "The Dog Stars", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6dfAGvZWbJnzWfSZ8gxFj63BNAH.jpg"
  },
  { 
    id: "movie-22", 
    tmdbId: "1422011",
    title: "It Ends", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6dfAGvZWbJnzWfSZ8gxFj63BNAH.jpg"
  },
  { 
    id: "movie-23", 
    tmdbId: "1441228",
    title: "Irumudi", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/mXdejPfToSVFlEzv1QYoIh2N53e.jpg"
  },
  { 
    id: "movie-24", 
    tmdbId: "1291595",
    title: "Insidious: Out of the Further", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/mXdejPfToSVFlEzv1QYoIh2N53e.jpg"
  },
  { 
    id: "movie-25", 
    tmdbId: "1280015",
    title: "Sunny Dancer", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/mXdejPfToSVFlEzv1QYoIh2N53e.jpg"
  },
  { 
    id: "movie-26", 
    tmdbId: "192139",
    title: "The Brink of War", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/hFborW6HmffKL05GIWlkTFdvVpN.jpg"
  },
  { 
    id: "movie-27", 
    tmdbId: "1739202",
    title: "Untold Raygun: Breaking Badly", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/3pnlJjsGtrUp3cPEOLzkR0sPQAK.jpg"
  },
  { 
    id: "movie-28", 
    tmdbId: "1480574",
    title: "Just Play Dead", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/glALx6QaIgw1u4joXsnfHTjWi6D.jpg"
  },
  { 
    id: "movie-29", 
    tmdbId: "1226699",
    title: "The Wrong Girls", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/iEJshwO6g4WKTP4HJgCHRTJMWEd.jpg"
  },
  { 
    id: "movie-30", 
    tmdbId: "1288059",
    title: "I Want Your Sex", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/pR7SIX3AwqdoD96OI44oLG98e7g.jpg"
  },
  { 
    id: "movie-31", 
    tmdbId: "1319522",
    title: "Gohan", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/4LwvU9SZc8QQzW1X1FAPhNbXnEU.jpg"
  },
  { 
    id: "movie-32", 
    tmdbId: "1433583",
    title: "The Weight", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/8i5iZV50CoEtmDCFM7RSxCkpE8h.jpg"
  },
  { 
    id: "movie-33", 
    tmdbId: "1294189",
    title: "The Mongooose", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/eSS5mvSG84UUuvtbHel5Yu3Wik4.jpg"
  },
  { 
    id: "movie-34", 
    tmdbId: "1458215",
    title: "The Gentleman Theif", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/oMutDMODnbCZf46w0dK4wncQmDB.jpg"
  },
  { 
    id: "movie-35", 
    tmdbId: "1705729",
    title: "Man of War", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/vt0RqHlqfUzeiBEVQvp43yY2076.jpg"
  },
  { 
    id: "movie-36", 
    tmdbId: "1439808",
    title: "Hadestown: The Musical", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/iJNVygzkuOSCOdCPNI1nLSeF7sz.jpg"
  },
  { 
    id: "movie-37", 
    tmdbId: "1469342",
    title: "Her Private Hell", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/kiFacg75KVjy0AM3S4QmbPas8zL.jpg"
  },
  { 
    id: "movie-38", 
    tmdbId: "1560520",
    title: "Batman: Knightfall Part 1: Knightfall", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/360qdtu2hLnqMu8SVHMywn420w1.jpg"
  },
  { 
    id: "movie-39", 
    tmdbId: "87513",
    title: "Motor City", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/dx2dblJL3GAKcXXXPjC2FSaMTWW.jpg"
  },
  { 
    id: "movie-40", 
    tmdbId: "1185806",
    title: "PAW Patrol: The Dino Movie", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/qnin56Syy5rbG7KCaxWY7SPuy6p.jpg"
  },
  { 
    id: "movie-41", 
    tmdbId: "1432706",
    title: "Bury the Devil", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/yQ3GeVsebrhOPIBhIdoSslbndEv.jpg"
  },
  { 
    id: "movie-42", 
    tmdbId: "1682276",
    title: "The Oldham Man and the Sea", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/wcfuythlTfVXm0yZHnBWGxXoUjt.jpg"
  },
  { 
    id: "movie-43", 
    tmdbId: "1339175",
    title: "The Birthday Party", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/sXN4IvB4hM2AYYx9BhdzhokrjvH.jpg"
  },
  { 
    id: "movie-44", 
    tmdbId: "1314826",
    title: "Yellow Eyes", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/tdIqb0g8fimv2bXIEZdWu6Zfywt.jpg"
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