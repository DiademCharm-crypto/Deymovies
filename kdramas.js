// ==========================================
// DEYMFLIX - K-Drama (Korean) Series Data
// ==========================================
// Add NEW K-Dramas HERE (not in app.js).
// They merge into the main `movies` list automatically and appear in
// the K-Drama row, explore filters, search, and the player like any other title.
// IMPORTANT: this file must load BEFORE app.js on every page.
// Series entries: pair with an entry in kdrama-episode.js (kdramaSeriesData)
// for episodes. The `id` must match between the two files.
// ==========================================

const kdramaData = [
  
  { 
    id: "The+Scandal", 
    imdbId: "tt36347588",
    title: "The Scandal", 
    isKdrama: true,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/4TU0PcHBIl0wPW5B6aVRGExOnHE.jpg",
    manualEmbed: "https://deymflix-media.b-cdn.net/K-DRAMA/The+Scandal/Episode+1.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=vxyzFk_z-Wc",
    isSeries: true,
    completed: true
  },
  { 
    id: "The+Ordinary+Jackpot", 
    imdbId: "tt44072314",
    title: "The Ordinary Jackpot", 
    isKdrama: true,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/3jLoiPorNssIfLlEuw8Om7ujca6.jpg",
    manualEmbed: "https://deymflix-media.b-cdn.net/K-DRAMA/The+Ordinary+Jackpot+720p/Watch+The+Ordinary+Jackpot+-+S1-E1+Free.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=vxyzFk_z-Wc",
    isSeries: true,
    completed: false
  },
  { 
    id: "My+Bias,+My+Boss", 
    imdbId: "tt43648966",
    title: "My Bias, My Boss", 
    isKdrama: true,
    poster: "https://i.mydramalist.com/mOwKm1_4c.jpg?v=1",
    manualEmbed: "https://deymflix-media.b-cdn.net/K-DRAMA/My+Bias%2C+My+Boss/Episode+1.mkv",
    trailerEmbed: "https://www.youtube.com/watch?v=kiHQZvDHDa0",
    isSeries: true,
    completed: true
  },
  { 
    id: "Mousetrap", 
    imdbId: "tt40247521",
    title: "Mousetrap", 
    isKdrama: true,
    poster: "https://m.media-amazon.com/images/M/MV5BNWIwMWVhNTQtOGQ4Ny00MGFkLThjNzktZWVhNzI4YzFlMGE1XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    manualEmbed: "https://deymflix-media.b-cdn.net/K-DRAMA/Mousetrap/Mousetrap.S01E01.NF.x264.720p.Korean.mkv",
    trailerEmbed: "https://www.youtube.com/watch?v=UCTSqqHeMHw",
    isSeries: true,
    completed: true
  },
  { 
    id: "Spooky+in+Love", 
    imdbId: "tt36347588",
    title: "Spooky in Love", 
    isKdrama: true,
    poster: "https://m.media-amazon.com/images/M/MV5BZGM4MDI4ODYtOTc3ZS00ZDc1LTkzYjgtMjc0OWUyMjFhN2E2XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    manualEmbed: "https://deymflix-media.b-cdn.net/K-DRAMA/Spooky+in+Love+720p/Spooky.in.Love.S01E01.NF.x264.720p.mkv",
    trailerEmbed: "https://www.youtube.com/watch?v=gFvycajlifg",
    isSeries: true,
    completed: true
  },
  { 
    id: "Dream+to+You", 
    imdbId: "tt39028251",
    title: "Dream to You", 
    isKdrama: true,
    poster: "https://m.media-amazon.com/images/M/MV5BZGU5ZTE1ZDEtMWI5Ny00ZDgxLTkyN2UtZjg0OWIzNmMwOWE0XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    manualEmbed: "https://deymflix-media.b-cdn.net/K-DRAMA/The+Scandal/Episode+1.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=CrW2onTvp7s&t=1s",
    isSeries: true,
    completed: true
  },
  { 
    id: "The+Apartment+Job", 
    imdbId: "tt43357366",
    title: "The Apartment Job", 
    isKdrama: true,
    poster: "https://m.media-amazon.com/images/M/MV5BZTFiYzExMWMtNzQxOC00YjRjLTgwOWQtYjczZmMxZmQ0Y2UwXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    manualEmbed: "https://deymflix-media.b-cdn.net/K-DRAMA/The+Scandal/Episode+1.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=aovCC9XFVew",
    isSeries: true,
    completed: true
  },
  { 
    id: "See+You+at+Work+Tomorrow!", 
    imdbId: "tt38960812",
    title: "See You at Work Tomorrow!", 
    isKdrama: true,
    poster: "https://m.media-amazon.com/images/M/MV5BMzFlOTNiMzItNWNiZS00ODIzLWIxODMtYjc4ZjI2N2I4MjI2XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    manualEmbed: "https://deymflix-media.b-cdn.net/K-DRAMA/The+Scandal/Episode+1.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=kBGgK8F3CSU",
    isSeries: true,
    completed: true
  }
  
];

// Merge into the main movies array (runs when app.js loads; guarded so a missing file can never break the site)
if (typeof window !== "undefined") {
  window.__deymflixMergeKdrama = function (moviesArray) {
    kdramaData.forEach(function (m) {
      if (!moviesArray.some(function (x) { return x.id === m.id; })) moviesArray.push(m);
    });
  };
}
