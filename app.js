// Link Cleaner Utility
function cleanDriveLink(url) {
  if (!url) return '';
  if (url.includes('drive.google.com') && url.includes('/view')) {
    return url.replace(/\/view.*$/, '/preview');
  }
  return url;
}

// Featured Hero Movies
const featuredMovies = [
  { 
    id: "Toy Story 5", 
    tmdbId: "1084244", 
    title: "Toy Story 5", 
    description: "Buzz, Woody, Jessie and the rest of the gang come face-to-face with Lilypad, a brand-new tablet device that arrives with her own disruptive ideas about what is best for Bonnie.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/sfQtVlIHljToOwYjhe21KPGzZWK.jpg", 
    backdrop: "https://media.themoviedb.org/t/p/w600_and_h900_face/sfQtVlIHljToOwYjhe21KPGzZWK.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Toy.Story.5.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4"
  },
  { 
    id: "Spider-Man: Brand New Day", 
    tmdbId: "969681", 
    title: "Spider-Man: Brand New Day", 
    description: "Peter Parker navigates a refreshed world as old threats re-emerge and test his limits in an unfamiliar landscape.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg", 
    backdrop: "https://media.themoviedb.org/t/p/w600_and_h900_face/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg"
  },
  { 
    id: "The Odyssey", 
    tmdbId: "1368337", 
    title: "The Odyssey", 
    description: "An epic journey across dangerous waters and uncharted lands as hero Odysseus seeks his path back home.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg", 
    backdrop: "https://media.themoviedb.org/t/p/w600_and_h900_face/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg"
  }
];

// Main Grid Movie Library
const movies = [
  { 
    id: "The Runner", 
    tmdbId: "1510688",
    title: "The Runner", 
    description: "A high-stakes thriller following a courier thrust into a deadly race against time across hostile city streets.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/uxCaBoYXsDC4A0SqTm3SISj0OwK.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/The.Runner.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4"
  },
  { 
    id: "Love, Ngo", 
    tmdbId: "1700944",
    title: "Love, Ngo", 
    isFilipino: true,
    description: "A heart-wrenching Filipino romance drama about two souls navigating cultural expectations, sacrifice, and unexpected love.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/ix86rEFrhvH3pJtCX7FBpjdKahG.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/lovengo.mp4"
  },
  { 
    id: "Call Me Mother", 
    tmdbId: "1510688",
    title: "Call Me Mother", 
    isFilipino: true,
    description: "An emotional drama depicting a mother's fierce dedication to keeping her family intact through hardship and betrayals.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/kMc1VvhyRdK9w43jaurzfxmnH4x.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Call%20Me%20Mother%202025%201080p%20Filipino%20WEB-DL%20HEVC%20x265%205%201-BONE.mkv"
  },
  { 
    id: "Almost Us", 
    tmdbId: "1510688",
    title: "Almost Us", 
    isFilipino: true,
    description: "Two former lovers reunite years later, forced to confront unresolved feelings and life choices that pulled them apart.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/gQurSKUKrCFHa90ydVJRtSMyjLB.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Almost%20Us%202026%201080p%20Filipino%20WEB-DL%20HEVC%20x265%205%201-BONE.mkv"
  },
  { 
    id: "The Odyssey", 
    tmdbId: "1368337",
    title: "The Odyssey", 
    description: "An epic journey across dangerous waters and uncharted lands as hero Odysseus seeks his path back home.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg"
  },
  { 
    id: "Spider-Man: Brand New Day", 
    tmdbId: "969681",
    title: "Spider-Man: Brand New Day", 
    description: "Peter Parker navigates a refreshed world as old threats re-emerge and test his limits in an unfamiliar landscape.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg"
  },
  { 
    id: "Mutiny", 
    tmdbId: "1288445",
    title: "Mutiny", 
    description: "When an elite military unit discovers a dark corporate conspiracy, rebellion is their only remaining strategy for survival.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/pu2VxGlpGwffOx292w18b1tv96j.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Mutiny.2026.1080p.WEBRip.10Bit.DDP5.1.x265-NeoNoir.mkv"
  },
  { 
    id: "The Last Sunrise", 
    tmdbId: "1516698",
    title: "The Last Sunrise", 
    description: "A sci-fi drama detailing humanity's final days after the sun fades, following two strangers united in search of hope.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/3PWJqDfygN0YNNjWsDUOXclCp3h.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/The.Last.Sunrise.2026.1080p.WEBRip.x264.AAC5.1-LAMA.mp4"
  },
  { 
    id: "Facing El Chapo", 
    tmdbId: "1621552",
    title: "Facing El Chapo", 
    description: "A gritty crime documentary examining law enforcement operations leading up to the capture of the notorious cartel leader.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/z8eF0ACFFKtIZ4pUeo02PCzxRVO.jpg"
  },
  { 
    id: "Toxic: A Fairy Tale for Grown-ups", 
    tmdbId: "1213243",
    title: "Toxic: A Fairy Tale for Grown-ups", 
    description: "A dark adult drama exploring modern relationships, obsession, and the thin line between passion and destruction.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/oiIPU4lvnI0Ag2K9cyAi44eCaoE.jpg"
  },
  { 
    id: "Minions & Monsters", 
    tmdbId: "1315772",
    title: "Minions & Monsters", 
    description: "The mischievous Yellow Minions encounter mystical creatures in a comedic adventure filled with chaotic mayhem.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/4LwvU9SZc8QQzW1X1FAPhNbXnEU.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Minions.and.Monsters.2026.1080p.10bit.WEBRip.6CH.x265-PSA.mkv"
  },
  { 
    id: "Obsession", 
    tmdbId: "1339713",
    title: "Obsession", 
    description: "A psychological thriller about a detective whose investigation into a cold case consumes his personal life and sanity.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/bRwnj8WEKBCvmfeUNOukJPwB43K.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Obsession.2026.1080p.WEBRip.x264.AAC5.1-LAMA.mp4"
  },
  { 
    id: "Rage of Stars", 
    tmdbId: "1323244",
    title: "Rage of Stars", 
    description: "A space opera detailing intergalactic political strife and pilots defending their home world from annihilation.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/oLld47ZT1I3iecM3OWhIphohQUJ.jpg"
  },
  { 
    id: "Toy Story 5", 
    tmdbId: "1084244",
    title: "Toy Story 5", 
    description: "Buzz, Woody, Jessie and the rest of the gang come face-to-face with Lilypad, a brand-new tablet device that arrives with her own disruptive ideas about what is best for Bonnie.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/sfQtVlIHljToOwYjhe21KPGzZWK.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Toy.Story.5.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4"
  },
  { 
    id: "Pinocchio: Unstrung", 
    tmdbId: "1232569",
    title: "Pinocchio: Unstrung", 
    description: "A twisted horror retelling of the puppet who desired to be human, taking revenge on those who mistreated him.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/eUJXk3bTvLBi5Zcb0BCedZU7lVL.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Pinocchio.Unstrung.mp4"
  },
  { 
    id: "Moana: Live Action", 
    tmdbId: "1108427",
    title: "Moana: Live Action", 
    description: "A cinematic live-action adaptation of the ocean journey of a brave young islander restoring order to her ancestral island.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/zKVgiv5qHCvCLT4A2ymJi5QeXDH.jpg"
  },
  { 
    id: "Coyote vs. Acme", 
    tmdbId: "1204680",
    title: "Coyote vs. Acme", 
    description: "Wile E. Coyote takes the Acme Corporation to court over defective products in a hilarious hybrid live-action court battle.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/vhv7lBWYM0DUuNU2a0V7Rhq21dD.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Coyote.vs.Acme.2026.1080p.DCP.DDP5.1.H264-AOC.mkv"
  },
  { 
    id: "Colony", 
    tmdbId: "1375646",
    title: "Colony", 
    description: "Survivors in an off-world outpost face an unknown alien threat while internal power struggles threaten to breach defense systems.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/tN799oUR0f1gUKDYdMNrDaY7I51.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Colony%202026%201080p%20WebRip%20Opus%202%200%20x265-Lootera.mkv"
  },
  { 
    id: "Ghost in the Cell", 
    tmdbId: "1393326",
    title: "Ghost in the Cell", 
    description: "An inmate discovers paranormal occurrences inside a maximum-security prison block connected to past secret experiments.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/zxcMdx0w5Zmg8yZuuiS7CJ8vOea.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Ghost.In.The.Cell.2026.720p.WEBRip.x264.AAC-%5BYTS.GG%20-%20YTS.BZ%5D.mp4"
  },
  { 
    id: "The Secret Woman", 
    tmdbId: "1631807",
    title: "The Secret Woman", 
    description: "A mysterious woman arrives in a small town, concealing her identity while unraveling local secrets long forgotten.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/5FC5vUHFz0fbJOd0bhyzJpCSLrc.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/The%20Secret%20Woman%202026%201080p%20NF%20WEB-DL%20DUAL%20DDP5%201%20H%20264-FLUX.mkv"  
  },
  { 
    id: "Barreda", 
    tmdbId: "1471168",
    title: "Barreda", 
    description: "A biographical drama chronicling the complex trials and dramatic events surrounding a notorious historic case.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/hnr0QkZSDLlrJTvU2ecco65wcHo.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Barreda.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4"  
  },
  { 
    id: "Buddy", 
    tmdbId: "1514026",
    title: "Buddy", 
    description: "A heartwarming tale of companionship between a stray rescue dog and a young boy facing difficult life changes.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6Lh4ZlsAISFQFVfLZ90sE9ycVnN.jpg"
  },
  { 
    id: "The Whisper Man", 
    tmdbId: "860508",
    title: "The Whisper Man", 
    description: "A widowed father and his son become targeted by a copycat killer who echoes sinister legends from decades prior.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6UqflU8Qqkz7Dq4swJPqs0ZJjY4.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/The.Whisper.Man.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4"  
  },
  { 
    id: "Yellow Mirror", 
    tmdbId: "1729723",
    title: "Yellow Mirror", 
    description: "A Nordic suspense film centering on an antique mirror that reveals disturbing alternate realities to its owners.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/1zdGvJAuuXC7dA3eV61OtUJNyjQ.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Yellow%20Mirror%202026%20NORDiC%201080p%20WEB-DL%20H%20264%20DDP5%201-ADDICTION.mkv"  
  },
  { 
    id: "It Ends", 
    tmdbId: "1422011",
    title: "It Ends", 
    description: "A intense survival story following stranded hikers trying to reach safety during an unexpected mountain blizzard.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6dfAGvZWbJnzWfSZ8gxFj63BNAH.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/It.Ends.2025.1080p.WEBRip.x264.AAC-%5BYTS.LT%5D.mp4"  
  },
  { 
    id: "Just Play Dead", 
    tmdbId: "1480574",
    title: "Just Play Dead", 
    description: "In a home invasion scenario, a family must remain silent and pretend to be deceased to avoid ruthless armed intruders.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/glALx6QaIgw1u4joXsnfHTjWi6D.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Just.Play.Dead.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4"  
  },
  { 
    id: "I Want Your Sex", 
    tmdbId: "1288059",
    title: "I Want Your Sex", 
    description: "A provocative romantic thriller exploring art, desire, and obsession in modern high-fashion circles.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/pR7SIX3AwqdoD96OI44oLG98e7g.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/I%20Want%20Your%20Sex%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5Bx265%5D%20%5B10bit%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/I.Want.Your.Sex.2026.1080p.WEBRip.x265.10bit.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4"  
  },
  { 
    id: "Batman: Knightfall Part 1: Knightfall", 
    tmdbId: "1560520",
    title: "Batman: Knightfall Part 1: Knightfall", 
    description: "Bane orchestrates a massive prison breakout at Arkham Asylum to exhaust Gotham's protector before confronting him directly.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/360qdtu2hLnqMu8SVHMywn420w1.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Batman.Knightfall.Part.1.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4"  
  },
  { 
    id: "The End of Oak Street", 
    tmdbId: "1101383",
    title: "The End of Oak Street", 
    description: "Suburban secrets surface when a quiet neighborhood uncovers mystery surrounding an abandoned house at the edge of town.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/fYXqpgPmHMphSF2W30GbTeJVIa5.jpg",
    manualEmbed: "https://cinema8.com/video/PO8PwYyO"
  },
  { 
    id: "Truly Naked", 
    tmdbId: "1281195",
    title: "Truly Naked", 
    description: "An intimate independent film exploring personal vulnerability, truth, and self-acceptance through real emotional stories.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/y23B9EnC0LDw8zMKlpXJauyLH7k.jpg",
    manualEmbed: "https://cinema8.com/video/jXax7PlD"
  },
  { 
    id: "Gail Daughtry and the Celebrity Sex Pass", 
    tmdbId: "1476682",
    title: "Gail Daughtry and the Celebrity Sex Pass", 
    description: "A comedy involving an ordinary couple navigating unexpected dilemmas after an unusual relationship agreement.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/98T4bnMjJs71WOVZoeY8edZhfgZ.jpg",
    manualEmbed: "https://cinema8.com/video/WDezkkzX"
  }
];

// Reusable Card Generator
function createMovieCard(movie, rankNumber = null) {
  const card = document.createElement('div');
  card.className = 'poster-card';
  card.onclick = () => {
    window.location.href = `player.html?id=${encodeURIComponent(movie.id)}`;
  };

  const fallbackUrl = 'https://via.placeholder.com/300x450/1f1f1f/ffffff?text=No+Poster';
  const rankHTML = rankNumber ? `<div class="rank-badge-box">#${rankNumber}</div>` : '';

  const hasDirectLink = movie.manualEmbed && movie.manualEmbed.trim() !== '';
  const qualityLabel = hasDirectLink ? 'HD' : 'CAM';
  const qualityClass = hasDirectLink ? 'quality-hd' : 'quality-cam';

  card.innerHTML = `
    ${rankHTML}
    <img src="${movie.poster}" 
         alt="${movie.title}" 
         loading="lazy" 
         onerror="this.onerror=null;this.src='${fallbackUrl}';">
    <div class="tag-badge-bottom ${qualityClass}">${qualityLabel}</div>
    <div class="poster-card-title">${movie.title}</div>
  `;
  return card;
}

// Global States
let currentPage = 1;
const itemsPerPage = 16;
let filteredMoviesList = [];

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  filteredMoviesList = [...movies];
  
  setupHeroBanner();
  renderTopPicks();
  renderFilipinoMovies();
  renderPaginatedMovies();
  setupSearchHandlers();
});

function showToast(message) {
  const toastNotification = document.getElementById('loading-toast');
  if (!toastNotification) return;
  toastNotification.textContent = message;
  toastNotification.classList.add('show');
  setTimeout(() => {
    toastNotification.classList.remove('show');
  }, 2000);
}

function setupHeroBanner() {
  if (featuredMovies && featuredMovies.length > 0) {
    const featured = featuredMovies[0];
    const heroBackdrop = document.getElementById('hero-backdrop');
    const heroTitle = document.getElementById('hero-title');
    const heroPlayBtn = document.getElementById('hero-play-btn');

    if (heroBackdrop) heroBackdrop.src = featured.poster;
    if (heroTitle) heroTitle.textContent = featured.title;
    if (heroPlayBtn) {
      heroPlayBtn.onclick = () => {
        window.location.href = `player.html?id=${encodeURIComponent(featured.id)}`;
      };
    }
  }
}

function renderTopPicks() {
  const container = document.getElementById('top-picks-container');
  if (!container) return;
  container.innerHTML = '';

  const picks = movies.slice(0, 10);
  picks.forEach((movie, index) => {
    container.appendChild(createMovieCard(movie, index + 1));
  });
}

function renderFilipinoMovies() {
  const container = document.getElementById('filipino-movies-container');
  if (!container) return;
  container.innerHTML = '';

  const filipinoMovies = movies.filter(m => m.isFilipino || m.genre?.includes('Filipino') || m.country === 'PH');
  const displayList = filipinoMovies.length > 0 ? filipinoMovies : movies.slice(1, 7);

  displayList.forEach(movie => {
    container.appendChild(createMovieCard(movie));
  });
}

function renderPaginatedMovies() {
  const allMoviesGrid = document.getElementById('all-movies-grid');
  if (!allMoviesGrid) return;
  allMoviesGrid.innerHTML = '';

  const totalPages = Math.ceil(filteredMoviesList.length / itemsPerPage) || 1;
  if (currentPage > totalPages) currentPage = totalPages;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageMovies = filteredMoviesList.slice(startIndex, startIndex + itemsPerPage);

  if (pageMovies.length === 0) {
    allMoviesGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: #aaaaaa; padding: 50px 0; font-weight: 700; font-size: 1.1rem;">No matching movies found.</div>`;
  } else {
    pageMovies.forEach(movie => {
      allMoviesGrid.appendChild(createMovieCard(movie));
    });
  }

  renderPaginationControls(totalPages);
}

function renderPaginationControls(totalPages) {
  const pageNumbersGroup = document.getElementById('page-numbers-group');
  const prevPageBtn = document.getElementById('prev-page-btn');
  const nextPageBtn = document.getElementById('next-page-btn');

  if (!pageNumbersGroup) return;
  pageNumbersGroup.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
    btn.textContent = i;
    btn.onclick = () => {
      currentPage = i;
      renderPaginatedMovies();
      scrollToGridTop();
    };
    pageNumbersGroup.appendChild(btn);
  }

  if (prevPageBtn) prevPageBtn.style.display = currentPage === 1 ? 'none' : 'inline-block';
  if (nextPageBtn) nextPageBtn.style.display = currentPage === totalPages ? 'none' : 'inline-block';
}

function handlePageNav(direction) {
  const totalPages = Math.ceil(filteredMoviesList.length / itemsPerPage) || 1;

  if (direction === 'prev' && currentPage > 1) {
    currentPage--;
    renderPaginatedMovies();
    scrollToGridTop();
  } else if (direction === 'next' && currentPage < totalPages) {
    currentPage++;
    renderPaginatedMovies();
    scrollToGridTop();
  }
}

function scrollToGridTop() {
  const gridMainSection = document.getElementById('grid-main-section');
  if (gridMainSection) {
    gridMainSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function setupSearchHandlers() {
  const searchInput = document.getElementById('search-input');
  const searchForm = document.getElementById('search-form');

  if (!searchInput) return;

  const handleTyping = () => {
    const query = searchInput.value.toLowerCase().trim();

    if (query.length > 0) {
      const matched = movies.filter(m => m.title.toLowerCase().includes(query)).slice(0, 5);
      renderSuggestions(matched);
    } else {
      hideSuggestions();
      resetHomeState();
    }
  };

  searchInput.addEventListener('input', handleTyping);
  searchInput.addEventListener('keyup', handleTyping);

  searchInput.addEventListener('search', () => {
    if (searchInput.value.trim() === '') {
      hideSuggestions();
      resetHomeState();
    }
  });

  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      searchInput.blur();
      hideSuggestions();
      executeSearch();
    });
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-overlay-bar')) {
      hideSuggestions();
    }
  });
}

function renderSuggestions(matches) {
  const searchSuggestionsBox = document.getElementById('search-suggestions-box');
  if (!searchSuggestionsBox) return;

  if (matches.length === 0) {
    hideSuggestions();
    return;
  }

  searchSuggestionsBox.innerHTML = '';
  matches.forEach(movie => {
    const item = document.createElement('div');
    item.className = 'suggestion-item';
    item.innerHTML = `
      <img src="${movie.poster}" alt="${movie.title}">
      <span class="suggestion-title">${movie.title}</span>
    `;
    item.onclick = () => {
      window.location.href = `player.html?id=${encodeURIComponent(movie.id)}`;
    };
    searchSuggestionsBox.appendChild(item);
  });

  searchSuggestionsBox.style.display = 'block';
}

function hideSuggestions() {
  const searchSuggestionsBox = document.getElementById('search-suggestions-box');
  if (searchSuggestionsBox) searchSuggestionsBox.style.display = 'none';
}

function executeSearch() {
  const searchInput = document.getElementById('search-input');
  const homeSectionsWrapper = document.getElementById('home-sections-wrapper');
  const gridSectionTitle = document.getElementById('grid-section-title');

  if (!searchInput) return;
  const query = searchInput.value.toLowerCase().trim();

  if (query === '') {
    resetHomeState();
    return;
  }

  if (homeSectionsWrapper) homeSectionsWrapper.classList.add('hide-for-search');

  if (gridSectionTitle) gridSectionTitle.textContent = `Search Results for "${searchInput.value.trim()}"`;

  filteredMoviesList = movies.filter(m => m.title.toLowerCase().includes(query));
  currentPage = 1;
  renderPaginatedMovies();
  scrollToGridTop();
}

function resetHomeState() {
  const homeSectionsWrapper = document.getElementById('home-sections-wrapper');
  const gridSectionTitle = document.getElementById('grid-section-title');

  if (homeSectionsWrapper) homeSectionsWrapper.classList.remove('hide-for-search');
  if (gridSectionTitle) gridSectionTitle.textContent = 'All Movies';

  filteredMoviesList = [...movies];
  currentPage = 1;
  renderPaginatedMovies();
}

function openRequestModal() {
  const modal = document.getElementById('request-modal');
  if (modal) modal.style.display = 'flex';
}

function closeRequestModal() {
  const modal = document.getElementById('request-modal');
  if (modal) modal.style.display = 'none';
}

function submitMovieRequest() {
  const input = document.getElementById('modal-request-input');
  if (input && input.value.trim() !== '') {
    showToast(`Request sent for: "${input.value.trim()}"`);
    input.value = '';
    closeRequestModal();
  } else {
    showToast('Please enter a movie title.');
  }
}