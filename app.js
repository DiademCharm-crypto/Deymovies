// ==========================================
// DEYMFLIX - Main Application Logic
// ==========================================
// This file holds the movie catalog (`movies`) plus the hero billboard, row
// carousels, search, My List, history and player helpers for every page.
// App-mode (Sketchware WebView) tweaks live at the BOTTOM of this file.
// Never overwrite this file with a partial copy — see the warning near the end.

// Polyfill: requestIdleCallback is not supported in Safari/iOS
if (!window.requestIdleCallback) {
  window.requestIdleCallback = function (cb, opts) {
    var delay = (opts && opts.timeout) || 0;
    return setTimeout(function () {
      cb({ didTimeout: false, timeRemaining: function () { return 50; } });
    }, delay);
  };
  window.cancelIdleCallback = function (id) { clearTimeout(id); };
}

// Security Utility: Sanitize user inputs and dynamic text to prevent XSS
function sanitizeHTML(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"']/g, function (m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m];
  });
}

// Link Cleaner Utility
function cleanDriveLink(url) {
  if (!url) return '';
  if (url.includes('drive.google.com') && url.includes('/view')) {
    return url.replace(/\/view.*$/, '/preview');
  }
  return url;
}

// ── HERO FEATURED (auto-picked: top-rated 2026 titles we actually host) ──
// Regenerate with _tools/_pick_featured.cjs-style query: 2026 + manualEmbed,
// sorted by rating. 5 slides — edit freely, this is just the starting set.
const featuredMovies = [
  {
    "id": "Batman: Knightfall Part 1: Knightfall",
    "imdbId": "tt32333324",
    "title": "Batman: Knightfall Part 1: Knightfall",
    "releaseDate": "2026-06-23",
    "rating": 9.2,
    "poster": "https://media.themoviedb.org/t/p/w600_and_h900_face/360qdtu2hLnqMu8SVHMywn420w1.jpg",
    "backdrop": "https://media.themoviedb.org/t/p/w600_and_h900_face/360qdtu2hLnqMu8SVHMywn420w1.jpg",
    "manualEmbed": "https://deymflix-r2-1.b-cdn.net/Batman.Knightfall.Part.1.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    "trailerEmbed": "https://www.youtube.com/watch?v=90HAqMk7qv0",
    "isSeries": false
  },
  {
    "id": "Hadestown: The Musical",
    "imdbId": "tt36307021",
    "title": "Hadestown: The Musical",
    "releaseDate": "2026-07-23",
    "rating": 9,
    "poster": "https://media.themoviedb.org/t/p/w600_and_h900_face/iJNVygzkuOSCOdCPNI1nLSeF7sz.jpg",
    "backdrop": "https://media.themoviedb.org/t/p/w600_and_h900_face/iJNVygzkuOSCOdCPNI1nLSeF7sz.jpg",
    "manualEmbed": "https://deymflix-r2-2.b-cdn.net/Hadestown%20The%20Musical%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Hadestown.The.Musical.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    "trailerEmbed": "https://www.youtube.com/watch?v=Xvuvun5sVbY",
    "isSeries": false
  },
  {
    "id": "Facing El Chapo",
    "imdbId": "tt39390497",
    "title": "Facing El Chapo",
    "releaseDate": "2026-08-21",
    "rating": 8.8,
    "poster": "https://media.themoviedb.org/t/p/w600_and_h900_face/z8eF0ACFFKtIZ4pUeo02PCzxRVO.jpg",
    "backdrop": "https://media.themoviedb.org/t/p/w600_and_h900_face/z8eF0ACFFKtIZ4pUeo02PCzxRVO.jpg",
    "manualEmbed": "https://deymflix-media.b-cdn.net/movie+1/Facing.El.Chapo.2026.1080p.NF.WEB-DL.Multi.AAC5.1.AV1-4kHdHub.Com.mkv",
    "trailerEmbed": "https://www.youtube.com/watch?v=cCBC4HX4XqE",
    "isSeries": false
  },
  {
    "id": "The+Ordinary+Jackpot",
    "imdbId": "tt44072314",
    "title": "The Ordinary Jackpot",
    "releaseDate": "2026-09-10",
    "rating": 10,
    "poster": "https://media.themoviedb.org/t/p/w600_and_h900_face/3jLoiPorNssIfLlEuw8Om7ujca6.jpg",
    "backdrop": "https://media.themoviedb.org/t/p/w600_and_h900_face/3jLoiPorNssIfLlEuw8Om7ujca6.jpg",
    "manualEmbed": "https://deymflix-media.b-cdn.net/K-DRAMA/The+Ordinary+Jackpot+720p/Watch+The+Ordinary+Jackpot+-+S1-E1+Free.mp4",
    "trailerEmbed": "https://www.youtube.com/watch?v=vAtzkLX_8no",
    "isSeries": true
  },
  {
    "id": "Teach+You+a+Lesson",
    "imdbId": "tt34809853",
    "title": "Teach You a Lesson",
    "releaseDate": "2026-06-05",
    "rating": 9.4,
    "poster": "https://media.themoviedb.org/t/p/w600_and_h900_face/fMECSPrTmRClSViMsXFYmiYIcWP.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/vyG93jhmPL7tBIhRtCLa5mdBKob.jpg",
    "manualEmbed": "cos:tv/276161/1/1",
    "trailerEmbed": "https://www.youtube.com/watch?v=LdezlX84py0",
    "isSeries": true
  }
];

const movies = [
  { 
    id: "The Runner", 
    imdbId: "tt34564059",
    title: "The Runner", 
    releaseDate: "2026-09-03",
    rating: 6.8,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/uxCaBoYXsDC4A0SqTm3SISj0OwK.jpg",
    manualEmbed: "https://deymflix-r2-1.b-cdn.net/The.Runner.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=zz4rsZLcauY",
    isSeries: false
  },

  { 
    id: "Moana: Live Action", 
    imdbId: "tt27419466",
    title: "Moana: Live Action", 
    releaseDate: "2026-07-08",
    rating: 7.4,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/zKVgiv5qHCvCLT4A2ymJi5QeXDH.jpg",
    manualEmbed: "https://deymflix-r2-2.b-cdn.net/Moana.2026.1080p.WEBRip.x264.AAC5.1-YTS.GG.-.YTS.BZ.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=n7f6hlKsxxo",
    isSeries: false
  },
  { 
    id: "Crew-Girl", 
    imdbId: "tt38218082",
    title: "Crew Girl", 
    releaseDate: "2026-09-10",
    rating: 8.2,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/tzf21i1ETZEu7i787ED3WThROH.jpg",
    manualEmbed: "https://deymflix-media.b-cdn.net/English+Series/Crew+Girl/Crew.Girl.S01e01.720P.Hevc.X265-Megusta%5BEztvx.To%5D.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=Xs5qsfqp-tA",
    isSeries: true
  },
  { 
    id: "Love-U-Lots", 
    title: "Love U Lots", 
    releaseDate: "2026-07-24", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/qOjY3XE4C4prKGmFyJaPxANrhxI.jpg",
    manualEmbed: "https://deymflix-media.b-cdn.net/Love+U+Lots/Love.U.Lots.(2026).VONE.S01E01.1080p.WEB-DL.AAC2.0.x264-DarkRip.mkv",
    trailerEmbed: "https://www.youtube.com/watch?v=xUcVh_3IUi4",
    isSeries: true,
    isFilipino: true
  },
  { 
    id: "Mayday", 
    imdbId: "tt28014327",
    title: "Mayday", 
    releaseDate: "2026-09-03",
    rating: 8,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/hVXjX1jLZ1ljFSNGXpjJfbTUOa7.jpg",
    manualEmbed: "https://deymflix-media.b-cdn.net/movie+1/%5BSh4dy%5DMayday.2026.4K.atmos.mkv",
    trailerEmbed: "https://www.youtube.com/watch?v=om5Un9X720M",
    isSeries: false
  },
  ...((typeof filipinoMovieData !== "undefined") ? filipinoMovieData : []),
  ...((typeof kdramaData !== "undefined") ? kdramaData : []),
  { 
    id: "The Odyssey", 
    imdbId: "tt33764258", 
    title: "The Odyssey", 
    releaseDate: "2026-07-15",
    rating: 8,
    synopsis: "The Odyssey is a 2026 epic action fantasy film written and directed by Christopher Nolan, who produced it with his wife Emma Thomas. An adaptation of Homer's ancient Greek epic poem the Odyssey, it stars an ensemble cast including Matt Damon, Tom Holland, Anne Hathaway, Robert Pattinson, Lupita Nyong'o, Samantha Morton, Zendaya, and Charlize Theron. In the film, Odysseus (Damon), the Greek king of Ithaca, undergoes a long and perilous journey home after the Trojan War and encounters mythical beings as he attempts to reunite with his wife Penelope (Hathaway).",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg", 
    manualEmbed: "cos:movie/1368337", 
    trailerEmbed: "https://www.youtube.com/watch?v=Sk6LZrA2JSQ",
    isSeries: false
  },
  { 
    id: "Spider-Man: Brand New Day", 
    imdbId: "tt22084616",
    title: "Spider-Man: Brand New Day", 
    releaseDate: "2026-07-29",
    rating: 7.9,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg",
    manualEmbed: "cos:movie/969681",
    trailerEmbed: "https://www.youtube.com/watch?v=daXaTug8rL4",
    isSeries: false
  },
  { 
    id: "Mutiny", 
    imdbId: "tt32338669",
    title: "Mutiny", 
    releaseDate: "2026-08-19",
    rating: 7.1,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/pu2VxGlpGwffOx292w18b1tv96j.jpg",
    manualEmbed: "https://deymflix-r2-1.b-cdn.net/Mutiny.2026.1080p.WEBRip.10Bit.DDP5.1.x265-NeoNoir.mkv",
    trailerEmbed: "https://www.youtube.com/watch?v=FKSdXH89jbo",
    isSeries: false
  },
  { 
    id: "The Last Sunrise", 
    imdbId: "tt37654096",
    title: "The Last Sunrise", 
    releaseDate: "2026-08-26",
    rating: 6.8,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/3PWJqDfygN0YNNjWsDUOXclCp3h.jpg",
    manualEmbed: "https://deymflix-r2-1.b-cdn.net/The.Last.Sunrise.2026.1080p.WEBRip.x264.AAC5.1-LAMA.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=NhI2UpkFAFw",
    isSeries: false
  },
  { 
    id: "Facing El Chapo", 
    imdbId: "tt39390497",
    title: "Facing El Chapo", 
    releaseDate: "2026-08-21",
    rating: 8.8,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/z8eF0ACFFKtIZ4pUeo02PCzxRVO.jpg",
    manualEmbed: "https://deymflix-media.b-cdn.net/movie+1/Facing.El.Chapo.2026.1080p.NF.WEB-DL.Multi.AAC5.1.AV1-4kHdHub.Com.mkv",
    trailerEmbed: "https://www.youtube.com/watch?v=cCBC4HX4XqE",
    isSeries: false
  },
  { 
    id: "Toxic: A Fairy Tale for Grown-ups", 
    imdbId: "tt27530512",
    title: "Toxic: A Fairy Tale for Grown-ups", 
    releaseDate: "2026-08-26",
    rating: 8,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/oiIPU4lvnI0Ag2K9cyAi44eCaoE.jpg",
    manualEmbed: "cos:movie/1213243",
    trailerEmbed: "https://www.youtube.com/watch?v=f5M1d7r2UNQ",
    isSeries: false
  },
  { 
    id: "Minions & Monsters", 
    imdbId: "tt32890033",
    title: "Minions & Monsters", 
    releaseDate: "2026-06-24",
    rating: 7.6,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/4LwvU9SZc8QQzW1X1FAPhNbXnEU.jpg",
    manualEmbed: "https://deymflix-r2-1.b-cdn.net/Minions.and.Monsters.2026.1080p.10bit.WEBRip.6CH.x265-PSA.mkv",
    trailerEmbed: "https://www.youtube.com/watch?v=ZSdOwt-G49w",
    isSeries: false
  },
  { 
    id: "Obsession", 
    imdbId: "tt37287335",
    title: "Obsession", 
    releaseDate: "2026-05-13",
    rating: 8.2,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/bRwnj8WEKBCvmfeUNOukJPwB43K.jpg",
    manualEmbed: "https://deymflix-r2-1.b-cdn.net/Obsession.2026.1080p.WEBRip.x264.AAC5.1-LAMA.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=gMC8kkwbIQQ",
    isSeries: false
  },
  { 
    id: "Rage of Stars", 
    imdbId: "tt29512655",
    title: "Rage of Stars", 
    releaseDate: "2026-08-06",
    rating: 6.6,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/oLld47ZT1I3iecM3OWhIphohQUJ.jpg",
    manualEmbed: "cos:movie/1323244",
    trailerEmbed: "https://www.youtube.com/watch?v=F5bYhuO2Rkg",
    isSeries: false
  },
  { 
    id: "Toy Story 5", 
    imdbId: "tt29355505",
    title: "Toy Story 5", 
    releaseDate: "2026-06-17",
    rating: 8.3,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/sfQtVlIHljToOwYjhe21KPGzZWK.jpg",
    manualEmbed: "https://deymflix-r2-1.b-cdn.net/Toy.Story.5.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=c51ND9Hdbw0",
    isSeries: false
  },
  { 
    id: "Pinocchio: Unstrung", 
    imdbId: "tt30887701",
    title: "Pinocchio: Unstrung", 
    releaseDate: "2026-07-22",
    rating: 6.6,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/eUJXk3bTvLBi5Zcb0BCedZU7lVL.jpg",
    manualEmbed: "https://deymflix-r2-1.b-cdn.net/Pinocchio.Unstrung.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=uApioBmGpAc",
    isSeries: false
  },
  { 
    id: "Coyote vs. Acme", 
    imdbId: "tt1756855",
    title: "Coyote vs. Acme", 
    releaseDate: "2026-08-20",
    rating: 7.6,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/vhv7lBWYM0DUuNU2a0V7Rhq21dD.jpg",
    manualEmbed: "https://deymflix-r2-1.b-cdn.net/Coyote.vs.Acme.2026.1080p.DCP.DDP5.1.H264-AOC.mkv",
    trailerEmbed: "https://www.youtube.com/watch?v=H-43VeYGiPM",
    isSeries: false
  },
  { 
    id: "Colony", 
    imdbId: "tt34385135",
    title: "Colony", 
    releaseDate: "2026-05-21",
    rating: 8.1,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/tN799oUR0f1gUKDYdMNrDaY7I51.jpg",
    manualEmbed: "https://deymflix-r2-1.b-cdn.net/Colony%202026%201080p%20WebRip%20Opus%202%200%20x265-Lootera.mkv",
    trailerEmbed: "https://www.youtube.com/watch?v=Je122ZNo6uw",
    isSeries: false
  },
  { 
    id: "Ghost in the Cell", 
    imdbId: "tt9000310",
    title: "Ghost in the Cell", 
    releaseDate: "2026-04-16",
    rating: 7.2,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/zxcMdx0w5Zmg8yZuuiS7CJ8vOea.jpg",
    manualEmbed: "https://deymflix-r2-1.b-cdn.net/Ghost.In.The.Cell.2026.720p.WEBRip.x264.AAC-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=_gxKcg8_pGc",
    isSeries: false
  },
  { 
    id: "The Secret Woman", 
    imdbId: "tt37275992",
    title: "The Secret Woman", 
    releaseDate: "2026-08-28",
    rating: 6.4,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/5FC5vUHFz0fbJOd0bhyzJpCSLrc.jpg",
    manualEmbed: "https://deymflix-r2-1.b-cdn.net/The%20Secret%20Woman%202026%201080p%20NF%20WEB-DL%20DUAL%20DDP5%201%20H%20264-FLUX.mkv",
    trailerEmbed: "https://www.youtube.com/watch?v=FldeGkt4e4k",
    isSeries: false
  },
  { 
    id: "Barreda", 
    imdbId: "tt43706402",
    title: "Barreda", 
    releaseDate: "2026-08-28",
    rating: 7.2,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/hnr0QkZSDLlrJTvU2ecco65wcHo.jpg",
    manualEmbed: "https://deymflix-r2-1.b-cdn.net/Barreda.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=6Otcjy6Vp3A",
    isSeries: false
  },
  { 
    id: "Buddy", 
    imdbId: "tt37281055",
    title: "Buddy", 
    releaseDate: "2026-08-27",
    rating: 7.7,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6Lh4ZlsAISFQFVfLZ90sE9ycVnN.jpg",
    manualEmbed: "cos:movie/1514026",
    trailerEmbed: "https://www.youtube.com/watch?v=O1fNEHX9tSM",
    isSeries: false
  },
  { 
    id: "The Whisper Man", 
    imdbId: "tt11561116",
    title: "The Whisper Man", 
    releaseDate: "2026-08-27",
    rating: 6.9,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6UqflU8Qqkz7Dq4swJPqs0ZJjY4.jpg",
    manualEmbed: "https://deymflix-r2-1.b-cdn.net/The.Whisper.Man.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=ZHRR-1CKYIQ",
    isSeries: false
  },
  { 
    id: "Yellow Mirror", 
    imdbId: "tt43141030",
    title: "Yellow Mirror", 
    releaseDate: "2026-08-26",
    rating: 8.2,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/1zdGvJAuuXC7dA3eV61OtUJNyjQ.jpg",
    manualEmbed: "https://deymflix-r2-1.b-cdn.net/Yellow%20Mirror%202026%20NORDiC%201080p%20WEB-DL%20H%20264%20DDP5%201-ADDICTION.mkv",
    trailerEmbed: "https://www.youtube.com/watch?v=-R2DVd3bWlA",
    isSeries: false
  },
  { 
    id: "The Dog Stars", 
    imdbId: "tt21285562",
    title: "The Dog Stars", 
    releaseDate: "2026-08-26",
    rating: 6.6,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/5O616X9vmRzQdB68PHzBewPittd.jpg",
    manualEmbed: "cos:movie/1384216",
    trailerEmbed: "https://www.youtube.com/watch?v=-xSxaE1ClEE",
    isSeries: false
  },
  { 
    id: "It Ends", 
    imdbId: "tt35519455",
    title: "It Ends", 
    releaseDate: "2026-08-21",
    rating: 5.4,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6dfAGvZWbJnzWfSZ8gxFj63BNAH.jpg",
    manualEmbed: "https://deymflix-r2-1.b-cdn.net/It.Ends.2025.1080p.WEBRip.x264.AAC-%5BYTS.LT%5D.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=zFszhQLMNXU",
    isSeries: false
  },
  { 
    id: "Irumudi", 
    imdbId: "tt39108319",
    title: "Irumudi", 
    releaseDate: "2026-08-20",
    rating: 6.6,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/sPePQmJRKkB14sGjB7zBkLJkaTW.jpg",
    manualEmbed: "cos:movie/1441228",
    trailerEmbed: "https://www.youtube.com/watch?v=lqlYx4MdsAY",
    isSeries: false
  },
  { 
    id: "Insidious: Out of the Further", 
    imdbId: "tt32393988",
    title: "Insidious: Out of the Further", 
    releaseDate: "2026-08-19",
    rating: 6.5,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/4tTrW9dXCByS5wt2pXVWb58zNjz.jpg",
    manualEmbed: "cos:movie/1291595",
    trailerEmbed: "https://www.youtube.com/watch?v=jxU8FU3o75A",
    isSeries: false
  },
  { 
    id: "Sunny Dancer", 
    imdbId: "tt32212403",
    title: "Sunny Dancer", 
    releaseDate: "2026-08-12",
    rating: 7,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/mXdejPfToSVFlEzv1QYoIh2N53e.jpg",
    manualEmbed: "cos:movie/1280015",
    trailerEmbed: "https://www.youtube.com/watch?v=UQxRhHK_Bmw",
    isSeries: false
  },
  { 
    id: "The Brink of War", 
    imdbId: "tt33070884",
    title: "The Brink of War", 
    releaseDate: "2026-08-13",
    rating: 7.1,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/hFborW6HmffKL05GIWlkTFdvVpN.jpg",
    manualEmbed: "cos:movie/192139",
    trailerEmbed: "https://www.youtube.com/watch?v=ATdMxG1QwEM",
    isSeries: false
  },
  { 
    id: "Just Play Dead", 
    imdbId: "tt36948232",
    title: "Just Play Dead", 
    releaseDate: "2026-08-28",
    rating: 5.9,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/glALx6QaIgw1u4joXsnfHTjWi6D.jpg",
    manualEmbed: "https://deymflix-r2-1.b-cdn.net/Just.Play.Dead.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=LlAajeOoFBo",
    isSeries: false
  },
  { 
    id: "The Wrong Girls", 
    imdbId: "tt35060353",
    title: "The Wrong Girls", 
    releaseDate: "2026-08-14",
    rating: 6.1,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/iEJshwO6g4WKTP4HJgCHRTJMWEd.jpg",
    manualEmbed: "https://deymflix-r2-2.b-cdn.net/The%20Wrong%20Girls%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/The.Wrong.Girls.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=zrcg8YHSys8",
    isSeries: false
  },
  { 
    id: "I Want Your Sex", 
    imdbId: "tt32332915",
    title: "I Want Your Sex", 
    releaseDate: "2026-07-29",
    rating: 6.1,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/pR7SIX3AwqdoD96OI44oLG98e7g.jpg",
    manualEmbed: "https://deymflix-r2-1.b-cdn.net/I%20Want%20Your%20Sex%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5Bx265%5D%20%5B10bit%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/I.Want.Your.Sex.2026.1080p.WEBRip.x265.10bit.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=kjkTmTmC1iA",
    isSeries: false
  },
  { 
    id: "Gohan", 
    imdbId: "tt36958999",
    title: "Gohan", 
    releaseDate: "2026-04-02",
    rating: 7.1,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/nVq1Dn88NzVIVTDpGZeP7fxpLa1.jpg",
    manualEmbed: "https://deymflix-r2-2.b-cdn.net/Gohan%20(2026)%20%5B720p%5D%20%5BWEBRip%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Gohan.2026.720p.WEBRip.x264.AAC-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=upaQ2e1KHKU",
    isSeries: false
  },
  { 
    id: "The Weight", 
    imdbId: "tt10794054",
    title: "The Weight", 
    releaseDate: "2026-09-16",
    rating: 6.9,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/8i5iZV50CoEtmDCFM7RSxCkpE8h.jpg",
    manualEmbed: "https://deymflix-r2-2.b-cdn.net/www.UIndex.org%20%20%20%20-%20%20%20%20The.Weight.2026.1080p.SCREENER.WEB-DL.H264.AAC-II/The.Weight.2026.1080p.SCREENER.WEB-DL.H264.AAC-II.mkv",
    trailerEmbed: "https://www.youtube.com/watch?v=7YpuMymmiJ8",
    isSeries: false
  },
  { 
    id: "The Mongoose", 
    imdbId: "tt13611778",
    title: "The Mongoose", 
    releaseDate: "2026-10-29",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/eSS5mvSG84UUuvtbHel5Yu3Wik4.jpg",
    manualEmbed: "https://deymflix-r2-2.b-cdn.net/The%20Mongoose%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/The.Mongoose.2026.1080p.WEBRip.x264.AAC-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=aHrMFtt40_Q",
    isSeries: false
  },
  { 
    id: "The Gentleman Thief", 
    imdbId: "tt36415524",
    title: "The Gentleman Thief", 
    releaseDate: "2026-07-31",
    rating: 5.7,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/oMutDMODnbCZf46w0dK4wncQmDB.jpg",
    manualEmbed: "cos:movie/1458215",
    trailerEmbed: "https://www.youtube.com/watch?v=0LB3yWX1R8Y",
    isSeries: false
  },
  { 
    id: "Man of War", 
    imdbId: "tt34584846",
    title: "Man of War", 
    releaseDate: "2026-07-03",
    rating: 6.6,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/vt0RqHlqfUzeiBEVQvp43yY2076.jpg",
    manualEmbed: "https://deymflix-r2-2.b-cdn.net/Man%20Of%20War%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Man.Of.War.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=E6_E8gIWwZA",
    isSeries: false
  },
  { 
    id: "Hadestown: The Musical", 
    imdbId: "tt36307021",
    title: "Hadestown: The Musical", 
    releaseDate: "2026-07-23",
    rating: 9,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/iJNVygzkuOSCOdCPNI1nLSeF7sz.jpg",
    manualEmbed: "https://deymflix-r2-2.b-cdn.net/Hadestown%20The%20Musical%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Hadestown.The.Musical.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=Xvuvun5sVbY",
    isSeries: false
  },
  { 
    id: "Her Private Hell", 
    imdbId: "tt36629665",
    title: "Her Private Hell", 
    releaseDate: "2026-07-23",
    rating: 5.1,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/kiFacg75KVjy0AM3S4QmbPas8zL.jpg",
    manualEmbed: "https://deymflix-r2-2.b-cdn.net/Her%20Private%20Hell%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Her.Private.Hell.2026.1080p.WEBRip.x264.AAC-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=C7E-0t1TfzM",
    isSeries: false
  },
  { 
    id: "Batman: Knightfall Part 1: Knightfall", 
    imdbId: "tt32333324",
    title: "Batman: Knightfall Part 1: Knightfall", 
    releaseDate: "2026-06-23",
    rating: 9.2,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/360qdtu2hLnqMu8SVHMywn420w1.jpg",
    manualEmbed: "https://deymflix-r2-1.b-cdn.net/Batman.Knightfall.Part.1.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=90HAqMk7qv0",
    isSeries: false
  },
  { 
    id: "Motor City", 
    imdbId: "tt2012616",
    title: "Motor City", 
    releaseDate: "2026-07-23",
    rating: 6.2,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/dx2dblJL3GAKcXXXPjC2FSaMTWW.jpg",
    manualEmbed: "https://deymflix-r2-2.b-cdn.net/Motor%20City%20(2025)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Motor.City.2025.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=t6RklhKu9os",
    isSeries: false
  },
  { 
    id: "PAW Patrol: The Dino Movie", 
    imdbId: "tt29356163",
    title: "PAW Patrol: The Dino Movie", 
    releaseDate: "2026-07-23",
    rating: 8.1,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/qnin56Syy5rbG7KCaxWY7SPuy6p.jpg",
    manualEmbed: "https://deymflix-media.b-cdn.net/movie+1/PAW.Patrol.The.Dino.Movie.2026.1080p.AMZN.WEB-DL.DDP5.1.H.265-KyoGo.mkv",
    trailerEmbed: "https://www.youtube.com/watch?v=xgI5iYmOf5Q",
    isSeries: false
  },
  { 
    id: "Bury the Devil", 
    imdbId: "tt29719182",
    title: "Bury the Devil", 
    releaseDate: "2026-03-06",
    rating: 5.7,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/yQ3GeVsebrhOPIBhIdoSslbndEv.jpg",
    manualEmbed: "https://deymflix-r2-2.b-cdn.net/Bury%20The%20Devil%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Bury.The.Devil.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=ce2udMp6oEc",
    isSeries: false
  },
  { 
    id: "The Oldham Man and the Sea", 
    imdbId: "tt40642027",
    title: "The Oldham Man and the Sea", 
    releaseDate: "2026-01-01",
    rating: 5,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/wcfuythlTfVXm0yZHnBWGxXoUjt.jpg",
    manualEmbed: "cos:movie/1682276",
    trailerEmbed: "https://www.youtube.com/watch?v=M77vGXP281g",
    isSeries: false
  },
  { 
    id: "The Birthday Party", 
    imdbId: "tt33269988",
    title: "The Birthday Party", 
    releaseDate: "2026-04-17",
    rating: 5.3,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/sXN4IvB4hM2AYYx9BhdzhokrjvH.jpg",
    manualEmbed: "https://deymflix-r2-2.b-cdn.net/The%20Birthday%20Party%20(2025)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/The.Birthday.Party.2025.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=7dujBWLtscc",
    isSeries: false
  },
  { 
    id: "Yellow Eyes", 
    imdbId: "tt32881432",
    title: "Yellow Eyes", 
    releaseDate: "2026-08-18",
    rating: 4.8,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/tdIqb0g8fimv2bXIEZdWu6Zfywt.jpg",
    manualEmbed: "https://deymflix-r2-2.b-cdn.net/Yellow%20Eyes%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Yellow.Eyes.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=QMfl_n0rxm4",
    isSeries: false
  },
  { 
    id: "The End of Oak Street", 
    imdbId: "tt27165187",
    title: "The End of Oak Street", 
    releaseDate: "2026-08-12",
    rating: 7,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/fYXqpgPmHMphSF2W30GbTeJVIa5.jpg",
    manualEmbed: "https://cinema8.com/video/PO8PwYyO",
    trailerEmbed: "https://www.youtube.com/watch?v=3oB9AxspVow",
    isSeries: false
  },
  { 
    id: "Pose", 
    imdbId: "tt42577081",
    title: "Pose", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/5f23i30nFJz0nrd3DGheOCqXa2P.jpg",
    manualEmbed: "https://deymflix-r2-2.b-cdn.net/Pose%20(2025)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.LT%5D/Pose.2025.1080p.WEBRip.x264.AAC5.1-%5BYTS.LT%5D.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=1fzXcG5w1J4",
    isSeries: false
  },
  { 
    id: "Truly Naked", 
    imdbId: "tt8760666",
    title: "Truly Naked", 
    releaseDate: "2026-04-15",
    rating: 6.6,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/y23B9EnC0LDw8zMKlpXJauyLH7k.jpg",
    manualEmbed: "https://deymflix-r2-2.b-cdn.net/Truly%20Naked%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Truly.Naked.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=c-2G-drcASo",
    isSeries: false
  },
  { 
    id: "Camp Rock 3", 
    imdbId: "tt6743524",
    title: "Camp Rock 3", 
    releaseDate: "2026-08-13",
    rating: 6.5,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/rS7byWK9cfPfdLeFNlRIaJxH9mN.jpg",
    manualEmbed: "https://deymflix-r2-2.b-cdn.net/www.UIndex.org%20%20%20%20-%20%20%20%20Camp%20Rock%203%202026%201080p%20WEBRip%20x265-DH/Camp%20Rock%203%202026%201080p%20WEBRip%20x265-DH.mkv",
    trailerEmbed: "https://www.youtube.com/watch?v=02-RDIZ5Rdw",
    isSeries: false
  },
  { 
    id: "Your Attention Please", 
    imdbId: "tt39402045",
    title: "Your Attention Please", 
    releaseDate: "2026-03-12",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/lVzZJlBP8EqWtx9EF0LIT55ve3H.jpg",
    manualEmbed: "cos:movie/1629373",
    trailerEmbed: "https://www.youtube.com/watch?v=fFto77Y_Z1Q",
    isSeries: false
  },
  { 
    id: "Narcissist's Playbook", 
    imdbId: "tt28353545",
    title: "Narcissist's Playbook", 
    releaseDate: "2026-05-03",
    rating: 5,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/nuI0XoN1p92MpVlSNtkxFzM3u6p.jpg",
    manualEmbed: "cos:movie/1680072",
    trailerEmbed: "https://www.youtube.com/watch?v=Nna8DQUIrJY",
    isSeries: false
  },
  { 
    id: "Gail Daughtry and the Celebrity Sex Pass", 
    imdbId: "tt36834010",
    title: "Gail Daughtry and the Celebrity Sex Pass", 
    releaseDate: "2026-07-09",
    rating: 6.2,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/98T4bnMjJs71WOVZoeY8edZhfgZ.jpg",
    manualEmbed: "https://cinema8.com/video/WDezkkzX",
    trailerEmbed: "https://www.youtube.com/watch?v=X3aWsJKo0yA",
    isSeries: false
  },
  { 
    id: "The Foreign Exchange Student 2: The Hunt", 
    imdbId: "tt22525816",
    title: "The Foreign Exchange Student 2: The Hunt", 
    releaseDate: "2022-10-04",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/aHy0ZifxTGN8QpF0QGUVXrIvCky.jpg",
    manualEmbed: "cos:movie/1031637",
    trailerEmbed: "https://www.youtube.com/watch?v=WQOiOS0cTAg",
    isSeries: false
  },
  { 
    id: "The Drop Spot", 
    imdbId: "tt16383058",
    title: "The Drop Spot", 
    releaseDate: "2022-12-06",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/iZL6f4sFwYOnh2CPm8IKu3TxyHn.jpg",
    manualEmbed: "cos:movie/1057920",
    trailerEmbed: "https://www.youtube.com/watch?v=d0E8ZsvjGlM",
    isSeries: false
  },
  { 
    id: "The Exit Row", 
    imdbId: "tt14858346",
    title: "The Exit Row", 
    releaseDate: "2023-03-28",
    rating: 2,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/v1nJW1hBICXyFyMOG2sm7GVj3Il.jpg",
    manualEmbed: "cos:movie/900717",
    trailerEmbed: "https://www.youtube.com/watch?v=oD--vuD29TU",
    isSeries: false
  },
  { 
    id: "Free Fall", 
    imdbId: "tt12267114",
    title: "Free Fall", 
    releaseDate: "2021-04-02",
    rating: 8,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/m1OGsVkwnEbf4frMtn2VS1nHjlv.jpg",
    manualEmbed: "cos:movie/814855",
    trailerEmbed: "https://www.youtube.com/watch?v=7ZDSYBkcH2U",
    isSeries: false
  },
  { 
    id: "Don't Say Good Luck", 
    imdbId: "tt36590417",
    title: "Don't Say Good Luck", 
    releaseDate: "2026-08-13",
    rating: 7.2,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/dgTKahWonzVLeN8Lm22WR2S7D0A.jpg",
    manualEmbed: "cos:movie/1504358",
    trailerEmbed: "https://www.youtube.com/watch?v=bvWqHSFkO5s",
    isSeries: false
  },
  { 
    id: "All Night Wrong", 
    imdbId: "tt18316986",
    title: "All Night Wrong", 
    releaseDate: "2026-08-14",
    rating: 5.7,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/jFN9LcCG4a02wRWm2qfJ6nLY8BO.jpg",
    manualEmbed: "cos:movie/1361969",
    trailerEmbed: "https://www.youtube.com/watch?v=3HmV37lxfbc",
    isSeries: false
  },
  { 
    id: "Dreams", 
    imdbId: "tt31710990",
    title: "Dreams", 
    releaseDate: "2025-07-10",
    rating: 6.1,
    poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3t5Mh7vMpC7DMa0cW3cH4g3atqaoAHIsHNet_NEqQog&s=10",
    manualEmbed: "cos:movie/1134463",
    trailerEmbed: "https://www.youtube.com/watch?v=JFxsDmJeW0k",
    isSeries: false
  },
  { 
    id: "Travis Barker: Louder Than Fear", 
    imdbId: "tt42009731",
    title: "Travis Barker: Louder Than Fear", 
    releaseDate: "2026-06-13",
    rating: 8.1,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/nFjdTYHi7tRjijf3utArceQFtRi.jpg",
    manualEmbed: "cos:movie/1695225",
    trailerEmbed: "https://www.youtube.com/watch?v=QOsVdlr0Q1I",
    isSeries: false
  },
  { 
    id: "Night Nurse", 
    imdbId: "tt38906892",
    title: "Night Nurse", 
    releaseDate: "2026-07-10",
    rating: 4.9,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/cvj1d5avMYRxK8FVpq07UqLrcbZ.jpg",
    manualEmbed: "https://deymflix-r2-2.b-cdn.net/Night%20Nurse%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5Bx265%5D%20%5B10bit%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Night.Nurse.2026.1080p.WEBRip.x265.10bit.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "https://www.youtube.com/results?search_query=Night+Nurse+trailer",
    isSeries: false
  },
  { 
    id: "Air Force Elite: Thunderbirds", 
    imdbId: "tt35628532",
    title: "Air Force Elite: Thunderbirds", 
    releaseDate: "2025-05-22",
    rating: 6.9,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/hsJtBhMxNDGzW5KcQ9qz3EQGnEt.jpg",
    manualEmbed: "cos:movie/1457515",
    trailerEmbed: "https://www.youtube.com/watch?v=0-BjU97fvPM",
    isSeries: false
  },
  { 
    id: "Saccharine", 
    imdbId: "tt35050712",
    title: "Saccharine", 
    releaseDate: "2026-05-22",
    rating: 6.9,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/bCHPB5WZy4T0Rerh1GTuQLzU0rF.jpg",
    manualEmbed: "https://deymflix-r2-2.b-cdn.net/Saccharine%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5Bx265%5D%20%5B10bit%5D%20%5B5.1%5D%20%5BYTS.BZ%5D/Saccharine.2026.1080p.WEBRip.x265.10bit.AAC5.1-%5BYTS.BZ%5D.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=uIY13LD3RUY",
    isSeries: false
  },
  { 
    id: "Young Washington", 
    imdbId: "tt32104007",
    title: "Young Washington", 
    releaseDate: "2026-07-02",
    rating: 7.8,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6CdoTKnRQHJkjRGxTefFGkPQplB.jpg",
    manualEmbed: "https://deymflix-r2-2.b-cdn.net/Young%20Washington%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Young.Washington.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=LJek-kc384w",
    isSeries: false
  },
  { 
    id: "Our Hero, Balthazar", 
    imdbId: "tt36589928",
    title: "Our Hero, Balthazar", 
    releaseDate: "2026-03-27",
    rating: 6.6,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/mxVTarvl5OLoU9YWIYygby6R0KI.jpg",
    manualEmbed: "cos:movie/1465557",
    trailerEmbed: "https://www.youtube.com/watch?v=Tk9JGDxsYKs",
    isSeries: false
  },
  { 
    id: "The Last Guest of the Holloway Motel", 
    imdbId: "tt36591750",
    title: "The Last Guest of the Holloway Motel", 
    releaseDate: "2026-05-22",
    rating: 8,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/yF7gHhdRINMkj9ez4Dxx4kbkWv.jpg",
    manualEmbed: "cos:movie/1465790",
    trailerEmbed: "https://www.youtube.com/watch?v=2Vg7CDyNMuw",
    isSeries: false
  },
  { 
    id: "The Invite", 
    imdbId: "tt14173636",
    title: "The Invite", 
    releaseDate: "2026-06-25",
    rating: 7.2,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/b7Dr8Chzse8VagexAporUu2RtLx.jpg",
    manualEmbed: "cos:movie/950028",
    trailerEmbed: "https://www.youtube.com/watch?v=OJ19I9q_hOQ",
    isSeries: false
  },
  { 
    id: "Jackass: Best and Last", 
    imdbId: "tt39316472",
    title: "Jackass: Best and Last", 
    releaseDate: "2026-06-25",
    rating: 7.5,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/tfgccePxnswMqhmtxafliLlcCVR.jpg",
    manualEmbed: "https://deymflix-r2-2.b-cdn.net/Jackass%20Best%20And%20Last%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Jackass.Best.And.Last.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=sNwzFhGwA94",
    isSeries: false
  },
  { 
    id: "The Last House", 
    imdbId: "tt32268156",
    title: "The Last House", 
    releaseDate: "2026-08-06",
    rating: 6.9,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6JU7E8Vv2M11egkctWVOScxWR75.jpg",
    manualEmbed: "cos:movie/1284041",
    trailerEmbed: "https://www.youtube.com/watch?v=MLxgaz2Zp1k",
    isSeries: false
  },
  { 
    id: "Casa Grande", 
    imdbId: "tt35887288",
    title: "Casa Grande", 
    releaseDate: "2026-05-01",
    rating: 7,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/mE9E4nsGM91Cf4b1s6nOOdUAE9P.jpg",
    manualEmbed: "https://deymflix-r2-2.b-cdn.net/Casa%20Grande%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.BZ%5D/Casa.Grande.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.BZ%5D.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=iIFEYdBGJoU",
    isSeries: false
  },
  { 
    id: "The Isolate Thief", 
    imdbId: "tt35051162",
    title: "The Isolate Thief", 
    releaseDate: "2026-07-10",
    rating: 6.7,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/gmmCh2BvTKp0YGT2FYG0eOQJELi.jpg",
    manualEmbed: "cos:movie/1404304",
    trailerEmbed: "https://www.youtube.com/watch?v=3eVoGaI8mpo",
    isSeries: false
  },
  { 
    id: "Housemaid", 
    imdbId: "tt27543632",
    title: "Housemaid", 
    releaseDate: "2025-12-18",
    rating: 7.3,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/cWsBscZzwu5brg9YjNkGewRUvJX.jpg",
    manualEmbed: "https://deymflix-r2-2.b-cdn.net/Housemaid%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Housemaid.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=48CtX6OgU3s",
    isSeries: false
  },
  { 
    id: "Lucky Strike", 
    imdbId: "tt19035928",
    title: "Lucky Strike", 
    releaseDate: "2026-06-26",
    rating: 6.8,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/7AEBdyGYXumXWmMFeynE8227KeZ.jpg",
    manualEmbed: "https://deymflix-r2-2.b-cdn.net/Lucky%20Strike%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Lucky.Strike.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=vtEnjikCXyA",
    isSeries: false
  },
  { 
    id: "Jailhouse to Milhouse", 
    imdbId: "tt28642484",
    title: "Jailhouse to Milhouse", 
    releaseDate: "2023-10-14",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/9QR5hejamYx2nMtxUHNO96bFsoK.jpg",
    manualEmbed: "cos:movie/1184341",
    trailerEmbed: "https://www.youtube.com/watch?v=LoDuEWrrPI0",
    isSeries: false
  },
  { 
    id: "Jimmie & Stevie Ray Vaughan: Brothers in Blues", 
    imdbId: "tt22409096",
    title: "Jimmie & Stevie Ray Vaughan: Brothers in Blues", 
    releaseDate: "2023-03-21",
    rating: 7.4,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6wBUhmgMjf6bqvfrgKsHEUxwH7T.jpg",
    manualEmbed: "cos:movie/1092074",
    trailerEmbed: "https://www.youtube.com/watch?v=MbsqUfzwL-w",
    isSeries: false
  },
  { 
    id: "Submerged: The Hunley", 
    imdbId: "tt22335468",
    title: "Submerged: The Hunley", 
    releaseDate: "2022-11-15",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/zY3xxTscRu7RMSVECppWQQyxHA6.jpg",
    manualEmbed: "cos:movie/1741192",
    trailerEmbed: "https://www.youtube.com/watch?v=bfEqFbIvn20",
    isSeries: false
  },
  { 
    id: "The Christmas Spirit", 
    imdbId: "tt10047464",
    title: "The Christmas Spirit", 
    releaseDate: "2022-10-14",
    rating: 3.5,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6a8nocaDfYOehQzeqZMvni9WqVq.jpg",
    manualEmbed: "cos:movie/882109",
    trailerEmbed: "https://www.youtube.com/watch?v=TzS1uOOL_-M",
    isSeries: false
  },
  { 
    id: "Soulm8te", 
    imdbId: "tt32654916",
    title: "Soulm8te", 
    releaseDate: "2026-07-31",
    rating: 7.4,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/bNErActDctl6cdUGw9pnjSCmyhQ.jpg",
    manualEmbed: "https://deymflix-r2-2.b-cdn.net/SOULM8TE%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/SOULM8TE.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=gpMQ1bYbDnc",
    isSeries: false
  },
  { 
    id: "Time and Water", 
    imdbId: "tt39163015",
    title: "Time and Water", 
    releaseDate: "2026-05-29",
    rating: 6.3,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/1hksIYHtsHCG70nZKbnrYBPk600.jpg",
    manualEmbed: "https://deymflix-r2-2.b-cdn.net/Time%20And%20Water%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Time.And.Water.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=6oR0iVwdY7M",
    isSeries: false
  },
  { 
    id: "Maddie's Secret", 
    imdbId: "tt37675037",
    title: "Maddie's Secret", 
    releaseDate: "2026-06-19",
    rating: 5.9,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/vADal7sH7E9xFr4w2k4V3EPSzF6.jpg",
    manualEmbed: "https://deymflix-r2-2.b-cdn.net/Maddies%20Secret%20(2025)%20%5B1080p%5D%20%5BWEBRip%5D%20%5Bx265%5D%20%5B10bit%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Maddies.Secret.2025.1080p.WEBRip.x265.10bit.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=8ZvsjbF785g",
    isSeries: false
  },
  { 
    id: "Nightborn", 
    imdbId: "tt34383465",
    title: "Nightborn", 
    releaseDate: "2026-07-01",
    rating: 6,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/e9ALgOANOJbcFpw84MbafK3xvD2.jpg",
    manualEmbed: "cos:movie/964849",
    trailerEmbed: "https://www.youtube.com/watch?v=QCYdpK5b5-4",
    isSeries: false
  },
  { 
    id: "Rose of Nevada", 
    imdbId: "tt35674521",
    title: "Rose of Nevada", 
    releaseDate: "2026-04-24",
    rating: 6.4,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/aDBZ2PGgUbcGjyX7ZCXLOk4AFQH.jpg",
    manualEmbed: "https://deymflix-r2-2.b-cdn.net/Rose%20Of%20Nevada%20(2025)%20%5B1080p%5D%20%5BWEBRip%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Rose.Of.Nevada.2025.1080p.WEBRip.x264.AAC-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=suFnFzUNXJ4",
    isSeries: false
  },
  { 
    id: "Snoopy Presents: There's No Place Like Home Snoopy", 
    imdbId: "tt42839367",
    title: "Snoopy Presents: There's No Place Like Home Snoopy", 
    releaseDate: "2026-07-30",
    rating: 8.5,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/YbC4SlzE030BgxWdKDdlatMh5W.jpg",
    manualEmbed: "https://deymflix-r2-2.b-cdn.net/www.UIndex.org%20%20%20%20-%20%20%20%20Snoopy.Presents.Theres.No.Place.Like.Home.Snoopy.2026.1080p.WEB.h264-DOLORES/Snoopy.Presents.Theres.No.Place.Like.Home.Snoopy.2026.1080p.WEB.h264-DOLORES.mkv",
    trailerEmbed: "https://www.youtube.com/watch?v=A-NQmpNsZIc",
    isSeries: false
  },
  { 
    id: "The Devil's Mouth", 
    imdbId: "tt36958312",
    title: "The Devil's Mouth", 
    releaseDate: "2026-07-29",
    rating: 6.5,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/dx2dblJL3GAKcXXXPjC2FSaMTWW.jpg",
    manualEmbed: "https://deymflix-r2-2.b-cdn.net/www.UIndex.org%20%20%20%20-%20%20%20%20The%20Devils%20Mouth%20(2026)%201080p%20BluRay%205.1-LAMA/The.Devils.Mouth.2026.1080p.BluRay.x264.AAC5.1-LAMA.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=2bp4Viru6Xc",
    isSeries: false
  },
  { 
    id: "Neglected", 
    imdbId: "tt35224721",
    title: "Neglected", 
    releaseDate: "2026-05-08",
    rating: 6.3,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/A0gqKFmJ7OArcFob49PErNvzN66.jpg",
    manualEmbed: "https://deymflix-r2-2.b-cdn.net/Neglected%20(2025)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.BZ%5D/Neglected.2025.1080p.WEBRip.x264.AAC5.1-%5BYTS.BZ%5D.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=LHCfP3tozTU",
    isSeries: false
  },
  { 
    id: "Oracle of the Dragon", 
    imdbId: "tt44127317",
    title: "Oracle of the Dragon", 
    releaseDate: "2026-07-14", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/lxVFFVIdXDnQCAFAllCrNfPDHFv.jpg",
    manualEmbed: "cos:movie/1731443",
    trailerEmbed: "https://www.youtube.com/watch?v=m22-nh9DiXw",
    isSeries: false
  },
  { 
    id: "Leviticus", 
    imdbId: "tt39143902",
    title: "Leviticus", 
    releaseDate: "2026-06-17",
    rating: 6.8,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/gnAsZvBygplNpp8PtjoTEYv3VPB.jpg",
    manualEmbed: "https://deymflix-r2-2.b-cdn.net/Leviticus%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Leviticus.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=gfkLVd23T64",
    isSeries: false
  },
  { 
    id: "Cold War 1994", 
    imdbId: "tt36576750",
    title: "Cold War 1994", 
    releaseDate: "2026-05-01",
    rating: 6.5,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/9C3ZxhGJvdpxmNC5PhkBMwzTMRT.jpg",
    manualEmbed: "cos:movie/1499071",
    trailerEmbed: "https://www.youtube.com/watch?v=ni1mMiXVzOI",
    isSeries: false
  },
  { 
    id: "Supergirl", 
    imdbId: "tt8814476",
    title: "Supergirl", 
    releaseDate: "2026-06-24",
    rating: 6.7,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/uhzRnTW4DM13UQBvZP3eVNzQTuz.jpg",
    manualEmbed: "https://deymflix-r2-2.b-cdn.net/Supergirl%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5Bx265%5D%20%5B10bit%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Supergirl.2026.1080p.WEBRip.x265.10bit.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=s1-pfiVMKAs",
    isSeries: false
  },
  { 
    id: "The Mentalist", 
    imdbId: "tt1196946",
    title: "The Mentalist", 
    releaseDate: "2008-09-23",
    rating: 8.4,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/acYXu4KaDj1NIkMgObnhe4C4a0T.jpg",
    manualEmbed: "cos:tv/5920/1/1",
    trailerEmbed: "",
    isSeries: true
  },

  // ── 2020–2025 English catalog (__DFX_NEW_ENGLISH__) ──
  {
    id: "Resident Evil: Welcome to Raccoon City",
    imdbId: "tt6920084",
    title: "Resident Evil: Welcome to Raccoon City",
    releaseDate: "2021-11-24",
    rating: 5.9,
    synopsis: "Once the booming home of pharmaceutical giant Umbrella Corporation, Raccoon City is now a dying Midwestern town. The company’s exodus left the city a wasteland…with great evil brewing below the surface. When that evil is unleashed, the townspeople are forever…changed…and a small group of survivors must work together to uncover the truth behind Umbrella and make it through the night.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/bArhvjRHl535XMaSh9VjInF2mSZ.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/wYtEvBmpBRXPdwGgr1gcWiwJSI7.jpg",
    manualEmbed: "cos:movie/460458",
    trailerEmbed: "https://www.youtube.com/watch?v=IQqqAWMIIAQ",
    isSeries: false
  },
  {
    id: "War of the Worlds",
    imdbId: "tt13186306",
    title: "War of the Worlds",
    releaseDate: "2025-07-29",
    rating: 4,
    synopsis: "Will Radford is a top analyst for Homeland Security who tracks potential threats through a mass surveillance program, until one day an attack by an unknown entity leads him to question whether the government is hiding something from him... and from the rest of the world.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/yvirUYrva23IudARHn3mMGVxWqM.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/iZLqwEwUViJdSkGVjePGhxYzbDb.jpg",
    manualEmbed: "cos:movie/755898",
    trailerEmbed: "https://www.youtube.com/watch?v=d9erkpdh5o0",
    isSeries: false
  },
  {
    id: "Avatar: Fire and Ash",
    imdbId: "tt1757678",
    title: "Avatar: Fire and Ash",
    releaseDate: "2025-12-17",
    rating: 7.6,
    synopsis: "In the wake of the devastating war against the RDA and the loss of their eldest son, Jake Sully and Neytiri face a new threat on Pandora: the Ash People, a violent and power-hungry Na'vi tribe led by the ruthless Varang. Jake's family must fight for their survival and the future of Pandora in a conflict that pushes them to their emotional and physical limits.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/bRBeSHfGHwkEpImlhxPmOcUsaeg.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/iN41Ccw4DctL8npfmYg1j5Tr1eb.jpg",
    manualEmbed: "cos:movie/83533",
    trailerEmbed: "https://www.youtube.com/watch?v=Ma1x7ikpid8",
    isSeries: false
  },
  {
    id: "Zootopia 2",
    imdbId: "tt26443597",
    title: "Zootopia 2",
    releaseDate: "2025-11-26",
    rating: 7.7,
    synopsis: "After cracking the biggest case in Zootopia's history, rookie cops Judy Hopps and Nick Wilde find themselves on the twisting trail of a great mystery when Gary De'Snake arrives and turns the animal metropolis upside down. To crack the case, Judy and Nick must go undercover to unexpected new parts of town, where their growing partnership is tested like never before.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/oJ7g2CifqpStmoYQyaLQgEU32qO.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/lgotja3xMoJZbynwHfcQcJAEMWH.jpg",
    manualEmbed: "cos:movie/1084242",
    trailerEmbed: "https://www.youtube.com/watch?v=sEgPQ7HKoBA",
    isSeries: false
  },
  {
    id: "Spider-Man: No Way Home",
    imdbId: "tt10872600",
    title: "Spider-Man: No Way Home",
    releaseDate: "2021-12-15",
    rating: 7.9,
    synopsis: "Peter Parker is unmasked and no longer able to separate his normal life from the high-stakes of being a super-hero. When he asks for help from Doctor Strange the stakes become even more dangerous, forcing him to discover what it truly means to be Spider-Man.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/iQFcwSGbZXMkeyKrxbPnwnRo5fl.jpg",
    manualEmbed: "cos:movie/634649",
    trailerEmbed: "https://www.youtube.com/watch?v=1mTjfMFyPi8",
    isSeries: false
  },
  {
    id: "Deadpool & Wolverine",
    imdbId: "tt6263850",
    title: "Deadpool & Wolverine",
    releaseDate: "2024-07-24",
    rating: 7.6,
    synopsis: "A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit-up again with an even more reluctant Wolverine.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/by8z9Fe8y7p4jo2YlW2SZDnptyT.jpg",
    manualEmbed: "cos:movie/533535",
    trailerEmbed: "https://www.youtube.com/watch?v=Idh8n5XuYIA",
    isSeries: false
  },
  {
    id: "The Wild Robot",
    imdbId: "tt29623480",
    title: "The Wild Robot",
    releaseDate: "2024-09-12",
    rating: 8.3,
    synopsis: "After a shipwreck, an intelligent robot called Roz is stranded on an uninhabited island. To survive the harsh environment, Roz bonds with the island's animals and cares for an orphaned baby goose.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/wTnV3PCVW5O92JMrFvvrRcV39RU.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/1pmXyN3sKeYoUhu5VBZiDU4BX21.jpg",
    manualEmbed: "cos:movie/1184918",
    trailerEmbed: "https://www.youtube.com/watch?v=VUCNBAmse04",
    isSeries: false
  },
  {
    id: "Dune: Part Two",
    imdbId: "tt15239678",
    title: "Dune: Part Two",
    releaseDate: "2024-02-27",
    rating: 8.1,
    synopsis: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, Paul endeavors to prevent a terrible future only he can foresee.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/eZ239CUp1d6OryZEBPnO2n87gMG.jpg",
    manualEmbed: "cos:movie/693134",
    trailerEmbed: "https://www.youtube.com/watch?v=U2Qp5pL3ovA",
    isSeries: false
  },
  {
    id: "Spider-Man: Across the Spider-Verse",
    imdbId: "tt9362722",
    title: "Spider-Man: Across the Spider-Verse",
    releaseDate: "2023-05-31",
    rating: 8.4,
    synopsis: "After reuniting with Gwen Stacy, Brooklyn’s full-time, friendly neighborhood Spider-Man is catapulted across the Multiverse, where he encounters the Spider Society, a team of Spider-People charged with protecting the Multiverse's very existence. But when the heroes clash on how to handle a new threat, Miles finds himself pitted against the other Spiders and must set out on his own to save those he loves most.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/kVd3a9YeLGkoeR50jGEXM6EqseS.jpg",
    manualEmbed: "cos:movie/569094",
    trailerEmbed: "https://www.youtube.com/watch?v=yFrxzaBLDQM",
    isSeries: false
  },
  {
    id: "Jurassic World Rebirth",
    imdbId: "tt31036941",
    title: "Jurassic World Rebirth",
    releaseDate: "2025-06-23",
    rating: 6.3,
    synopsis: "Five years after the events of Jurassic World Dominion, covert operations expert Zora Bennett is contracted to lead a skilled team on a top-secret mission to secure genetic material from the world's three most massive dinosaurs. When Zora's operation intersects with a civilian family whose boating expedition was capsized, they all find themselves stranded on an island where they come face-to-face with a sinister, shocking discovery that's been hidden from the world for decades.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/1RICxzeoNCAO5NpcRMIgg1XT6fm.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/zNriRTr0kWwyaXPzdg1EIxf0BWk.jpg",
    manualEmbed: "cos:movie/1234821",
    trailerEmbed: "https://www.youtube.com/watch?v=2ZhB-YO5Tnk",
    isSeries: false
  },
  {
    id: "Top Gun: Maverick",
    imdbId: "tt1745960",
    title: "Top Gun: Maverick",
    releaseDate: "2022-05-21",
    rating: 8.2,
    synopsis: "After more than thirty years of service as one of the Navy’s top aviators, and dodging the advancement in rank that would ground him, Pete “Maverick” Mitchell finds himself training a detachment of TOP GUN graduates for a specialized mission the likes of which no living pilot has ever seen.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/n0YuM4f5lvGAP6MAW2kBIzugXnc.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/AaV1YIdWKnjAIAOe8UUKBFm327v.jpg",
    manualEmbed: "cos:movie/361743",
    trailerEmbed: "https://www.youtube.com/watch?v=Klc__shdj88",
    isSeries: false
  },
  {
    id: "Dune",
    imdbId: "tt1160419",
    title: "Dune",
    releaseDate: "2021-09-15",
    rating: 7.8,
    synopsis: "Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe to ensure the future of his family and his people. As malevolent forces explode into conflict over the planet's exclusive supply of the most precious resource in existence - a commodity capable of unlocking humanity's greatest potential - only those who can conquer their fear will survive.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/v1tRXZ4JtD2Iv6fjkPvT4GiwslV.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/zRKQW58MBEY078AxkHxEJzUskCl.jpg",
    manualEmbed: "cos:movie/438631",
    trailerEmbed: "https://www.youtube.com/watch?v=w0HgHet0sxg",
    isSeries: false
  },
  {
    id: "Oppenheimer",
    imdbId: "tt15398776",
    title: "Oppenheimer",
    releaseDate: "2023-07-19",
    rating: 8,
    synopsis: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/neeNHeXjMF5fXoCJRsOmkNGC7q.jpg",
    manualEmbed: "cos:movie/872585",
    trailerEmbed: "https://www.youtube.com/watch?v=qiuSBWVdgLI",
    isSeries: false
  },
  {
    id: "The Batman",
    imdbId: "tt1877830",
    title: "The Batman",
    releaseDate: "2022-03-01",
    rating: 7.7,
    synopsis: "In his second year of fighting crime, Batman uncovers corruption in Gotham City that connects to his own family while facing a serial killer known as the Riddler.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/rvtdN5XkWAfGX6xDuPL6yYS2seK.jpg",
    manualEmbed: "cos:movie/414906",
    trailerEmbed: "https://www.youtube.com/watch?v=vc7_mH2PWHs",
    isSeries: false
  },
  {
    id: "Superman",
    imdbId: "tt5950044",
    title: "Superman",
    releaseDate: "2025-07-09",
    rating: 7.3,
    synopsis: "Superman, a journalist in Metropolis, embarks on a journey to reconcile his Kryptonian heritage with his human upbringing as Clark Kent.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/ldyfo0BKmz5rWtJJKCvwaNS4cJT.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/yRBc6WY3r1Fz5Cjd6DhSvzqunED.jpg",
    manualEmbed: "cos:movie/1061474",
    trailerEmbed: "https://www.youtube.com/watch?v=MikgqM0LXr4",
    isSeries: false
  },
  {
    id: "Avatar: The Way of Water",
    imdbId: "tt1630029",
    title: "Avatar: The Way of Water",
    releaseDate: "2022-12-14",
    rating: 7.6,
    synopsis: "Set more than a decade after the events of the first film, learn the story of the Sully family (Jake, Neytiri, and their kids), the trouble that follows them, the lengths they go to keep each other safe, the battles they fight to stay alive, and the tragedies they endure.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/kJsPVzdyBrYHLomuNv5SJDXUQ2f.jpg",
    manualEmbed: "cos:movie/76600",
    trailerEmbed: "https://www.youtube.com/watch?v=o5F8MOz_IDw",
    isSeries: false
  },
  {
    id: "F1",
    imdbId: "tt16311594",
    title: "F1",
    releaseDate: "2025-06-25",
    rating: 7.8,
    synopsis: "Racing legend Sonny Hayes is coaxed out of retirement to lead a struggling Formula 1 team—and mentor a young hotshot driver—while chasing one more chance at glory.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/9PXZIUsSDh4alB80jheWX4fhZmy.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/lkDYN0whyE82mcM20rwtwjbniKF.jpg",
    manualEmbed: "cos:movie/911430",
    trailerEmbed: "https://www.youtube.com/watch?v=ge_ABjtYx88",
    isSeries: false
  },
  {
    id: "KPop Demon Hunters",
    imdbId: "tt14205554",
    title: "KPop Demon Hunters",
    releaseDate: "2025-06-20",
    rating: 8,
    synopsis: "When K-pop superstars Rumi, Mira and Zoey aren't selling out stadiums, they're using their secret powers to protect their fans from supernatural threats.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/zT7Lhw3BhJbMkRqm9Zlx2YGMsY0.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/w3Bi0wygeFQctn6AqFTwhGNXRwL.jpg",
    manualEmbed: "cos:movie/803796",
    trailerEmbed: "https://www.youtube.com/watch?v=AzCAwdp1uIQ",
    isSeries: false
  },
  {
    id: "Inside Out 2",
    imdbId: "tt22022452",
    title: "Inside Out 2",
    releaseDate: "2024-06-11",
    rating: 7.5,
    synopsis: "Teenager Riley's mind headquarters is undergoing a sudden demolition to make room for something entirely unexpected: new Emotions! Joy, Sadness, Anger, Fear and Disgust, who’ve long been running a successful operation by all accounts, aren’t sure how to feel when Anxiety shows up. And it looks like she’s not alone.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/p5ozvmdgsmbWe0H8Xk7Rc8SCwAB.jpg",
    manualEmbed: "cos:movie/1022789",
    trailerEmbed: "https://www.youtube.com/watch?v=u69y5Ie519M",
    isSeries: false
  },
  {
    id: "Guardians of the Galaxy Vol. 3",
    imdbId: "tt6791350",
    title: "Guardians of the Galaxy Vol. 3",
    releaseDate: "2023-05-03",
    rating: 7.9,
    synopsis: "Peter Quill, still reeling from the loss of Gamora, must rally his team around him to defend the universe along with protecting one of their own. A mission that, if not completed successfully, could quite possibly lead to the end of the Guardians as we know them.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/5YZbUmjbMa3ClvSW1Wj3D6XGolb.jpg",
    manualEmbed: "cos:movie/447365",
    trailerEmbed: "https://www.youtube.com/watch?v=AAE5VZktooM",
    isSeries: false
  },
  {
    id: "Fast X",
    imdbId: "tt5433140",
    title: "Fast X",
    releaseDate: "2023-05-17",
    rating: 7,
    synopsis: "Over many missions and against impossible odds, Dom Toretto and his family have outsmarted, out-nerved and outdriven every foe in their path. Now, they confront the most lethal opponent they've ever faced: A terrifying threat emerging from the shadows of the past who's fueled by blood revenge, and who is determined to shatter this family and destroy everything—and everyone—that Dom loves, forever.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/fiVW06jE7z9YnO4trhaMEdclSiC.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/4XM8DUTQb3lhLemJC51Jx4a2EuA.jpg",
    manualEmbed: "cos:movie/385687",
    trailerEmbed: "https://www.youtube.com/watch?v=eoOaKN4qCKw",
    isSeries: false
  },
  {
    id: "Moana 2",
    imdbId: "tt13622970",
    title: "Moana 2",
    releaseDate: "2024-11-21",
    rating: 7,
    synopsis: "After receiving an unexpected call from her wayfinding ancestors, Moana journeys alongside Maui and a new crew to the far seas of Oceania and into dangerous, long-lost waters for an adventure unlike anything she's ever faced.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/aLVkiINlIeCkcZIzb7XHzPYgO6L.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/vYqt6kb4lcF8wwqsMMaULkP9OEn.jpg",
    manualEmbed: "cos:movie/1241982",
    trailerEmbed: "https://www.youtube.com/watch?v=JdSl4RMNtGE",
    isSeries: false
  },
  {
    id: "Weapons",
    imdbId: "tt26581740",
    title: "Weapons",
    releaseDate: "2025-08-04",
    rating: 7.3,
    synopsis: "When all but one child from the same class mysteriously vanish on the same night at exactly the same time, a community is left questioning who or what is behind their disappearance.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/cpf7vsRZ0MYRQcnLWteD5jK9ymT.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/8VyTWJrNEyV2MTWvniDVp0MpOAe.jpg",
    manualEmbed: "cos:movie/1078605",
    trailerEmbed: "https://www.youtube.com/watch?v=QKHySfXqN0I",
    isSeries: false
  },
  {
    id: "Mission: Impossible - The Final Reckoning",
    imdbId: "tt9603208",
    title: "Mission: Impossible - The Final Reckoning",
    releaseDate: "2025-05-17",
    rating: 7.2,
    synopsis: "Ethan Hunt and team continue their search for the terrifying AI known as the Entity — which has infiltrated intelligence networks all over the globe — with the world's governments and a mysterious ghost from Hunt's past on their trail. Joined by new allies and armed with the means to shut the Entity down for good, Hunt is in a race against time to prevent the world as we know it from changing forever.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/iKPsC9EFUafRP9SrUznI61getVP.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/538U9snNc2fpnOmYXAPUh3zn31H.jpg",
    manualEmbed: "cos:movie/575265",
    trailerEmbed: "https://www.youtube.com/watch?v=G1VBfMCZVkw",
    isSeries: false
  },
  {
    id: "The Fantastic 4: First Steps",
    imdbId: "tt10676052",
    title: "The Fantastic 4: First Steps",
    releaseDate: "2025-07-23",
    rating: 6.9,
    synopsis: "Against the vibrant backdrop of a 1960s-inspired, retro-futuristic world, Marvel's First Family is forced to balance their roles as heroes with the strength of their family bond, while defending Earth from a ravenous space god called Galactus and his enigmatic Herald, Silver Surfer.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/nf5qaSEvyYSNeFH0YhSs5EsBLX9.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/s94NjfKkcSczZ1FembwmQZwsuwY.jpg",
    manualEmbed: "cos:movie/617126",
    trailerEmbed: "https://www.youtube.com/watch?v=LJa5wv93YGM",
    isSeries: false
  },
  {
    id: "Thunderbolts*",
    imdbId: "tt20969586",
    title: "Thunderbolts*",
    releaseDate: "2025-04-30",
    rating: 7.3,
    synopsis: "After finding themselves ensnared in a death trap, seven disillusioned castoffs must embark on a dangerous mission that will force them to confront the darkest corners of their pasts.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/hqcexYHbiTBfDIdDWxrxPtVndBX.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/rthMuZfFv4fqEU4JVbgSW9wQ8rs.jpg",
    manualEmbed: "cos:movie/986056",
    trailerEmbed: "https://www.youtube.com/watch?v=7rs_HhSA7XY",
    isSeries: false
  },
  {
    id: "Sinners",
    imdbId: "tt31193180",
    title: "Sinners",
    releaseDate: "2025-04-16",
    rating: 7.5,
    synopsis: "Trying to leave their troubled lives behind, twin brothers return to their hometown to start again, only to discover that an even greater evil is waiting to welcome them back.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/fWPgbnt2LSqkQ6cdQc0SZN9CpLm.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/nAxGnGHOsfzufThz20zgmRwKur3.jpg",
    manualEmbed: "cos:movie/1233413",
    trailerEmbed: "https://www.youtube.com/watch?v=l2h2lC0vlX4",
    isSeries: false
  },
  {
    id: "Predator: Badlands",
    imdbId: "tt31227572",
    title: "Predator: Badlands",
    releaseDate: "2025-11-05",
    rating: 7.8,
    synopsis: "Cast out from his clan, a young Predator finds an unlikely ally in a damaged android and embarks on a treacherous journey in search of the ultimate adversary.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/pHpq9yNUIo6aDoCXEBzjSolywgz.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/82lM4GJ9uuNvNDOEpxFy77uv4Ak.jpg",
    manualEmbed: "cos:movie/1242898",
    trailerEmbed: "https://www.youtube.com/watch?v=LkBqjfg8TGM",
    isSeries: false
  },
  {
    id: "Everything Everywhere All at Once",
    imdbId: "tt6710474",
    title: "Everything Everywhere All at Once",
    releaseDate: "2022-03-24",
    rating: 7.7,
    synopsis: "An aging Chinese immigrant is swept up in an insane adventure, where she alone can save what's important to her by connecting with the lives she could have led in other universes.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/u68AjlvlutfEIcpmbYpKcdi09ut.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/fIwiFha3WPu5nHkBeMQ4GzEk0Hv.jpg",
    manualEmbed: "cos:movie/545611",
    trailerEmbed: "https://www.youtube.com/watch?v=wxN1T1uxQ2g",
    isSeries: false
  },
  {
    id: "Venom: The Last Dance",
    imdbId: "tt16366836",
    title: "Venom: The Last Dance",
    releaseDate: "2024-10-22",
    rating: 6.7,
    synopsis: "Eddie and Venom are on the run. Hunted by both of their worlds and with the net closing in, the duo are forced into a devastating decision that will bring the curtains down on Venom and Eddie's last dance.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/vGXptEdgZIhPg3cGlc7e8sNPC2e.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/3V4kLQg0kSqPLctI5ziYWabAZYF.jpg",
    manualEmbed: "cos:movie/912649",
    trailerEmbed: "https://www.youtube.com/watch?v=FKBN1qAzW3s",
    isSeries: false
  },
  {
    id: "The Substance",
    imdbId: "tt17526714",
    title: "The Substance",
    releaseDate: "2024-09-07",
    rating: 7.1,
    synopsis: "A fading celebrity decides to use a black market drug, a cell-replicating substance that temporarily creates a younger, better version of herself.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/lqoMzCcZYEFK729d6qzt349fB4o.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/bVSOgrxasVJF6V71T7v2KfBRSzu.jpg",
    manualEmbed: "cos:movie/933260",
    trailerEmbed: "https://www.youtube.com/watch?v=lR5nlovVgvQ",
    isSeries: false
  },
  {
    id: "A Minecraft Movie",
    imdbId: "tt3566834",
    title: "A Minecraft Movie",
    releaseDate: "2025-03-31",
    rating: 6.2,
    synopsis: "Four misfits find themselves struggling with ordinary problems when they are suddenly pulled through a mysterious portal into the Overworld: a bizarre, cubic wonderland that thrives on imagination. To get back home, they'll have to master this world while embarking on a magical quest with an unexpected, expert crafter, Steve.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/yFHHfHcUgGAxziP1C3lLt0q2T4s.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/2Nti3gYAX513wvhp8IiLL6ZDyOm.jpg",
    manualEmbed: "cos:movie/950387",
    trailerEmbed: "https://www.youtube.com/watch?v=aSh_L6bvaCQ",
    isSeries: false
  },
  {
    id: "Sonic the Hedgehog 3",
    imdbId: "tt18259086",
    title: "Sonic the Hedgehog 3",
    releaseDate: "2024-12-19",
    rating: 7.6,
    synopsis: "Sonic, Knuckles, and Tails reunite against a powerful new adversary, Shadow, a mysterious villain with powers unlike anything they have faced before. With their abilities outmatched in every way, Team Sonic must seek out an unlikely alliance in hopes of stopping Shadow and protecting the planet.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/d8Ryb8AunYAuycVKDp5HpdWPKgC.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/zOpe0eHsq0A2NvNyBbtT6sj53qV.jpg",
    manualEmbed: "cos:movie/939243",
    trailerEmbed: "https://www.youtube.com/watch?v=LH1J1EbqCaI",
    isSeries: false
  },
  {
    id: "Puss in Boots: The Last Wish",
    imdbId: "tt3915174",
    title: "Puss in Boots: The Last Wish",
    releaseDate: "2022-12-07",
    rating: 8.2,
    synopsis: "Puss in Boots discovers that his passion for adventure has taken its toll: He has burned through eight of his nine lives, leaving him with only one life left. Puss sets out on an epic journey to find the mythical Last Wish and restore his nine lives.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/kuf6dutpsT0vSVehic3EZIqkOBt.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/jr8tSoJGj33XLgFBy6lmZhpGQNu.jpg",
    manualEmbed: "cos:movie/315162",
    trailerEmbed: "https://www.youtube.com/watch?v=tHb7WlgyaUc",
    isSeries: false
  },
  {
    id: "How to Train Your Dragon",
    imdbId: "tt26743210",
    title: "How to Train Your Dragon",
    releaseDate: "2025-06-06",
    rating: 7.9,
    synopsis: "On the rugged isle of Berk, where Vikings and dragons have been bitter enemies for generations, Hiccup stands apart, defying centuries of tradition when he befriends Toothless, a feared Night Fury dragon. Their unlikely bond reveals the true nature of dragons, challenging the very foundations of Viking society.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/53dsJ3oEnBhTBVMigWJ9tkA5bzJ.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/8J6UlIFcU7eZfq9iCLbgc8Auklg.jpg",
    manualEmbed: "cos:movie/1087192",
    trailerEmbed: "https://www.youtube.com/watch?v=OWEq2Pf8qpk",
    isSeries: false
  },
  {
    id: "Wrath of Man",
    imdbId: "tt11083552",
    title: "Wrath of Man",
    releaseDate: "2021-04-22",
    rating: 7.6,
    synopsis: "A cold and mysterious new security guard for a Los Angeles cash truck company surprises his co-workers when he unleashes precision skills during a heist. The crew is left wondering who he is and where he came from. Soon, the marksman's ultimate motive becomes clear as he takes dramatic and irrevocable steps to settle a score.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/M7SUK85sKjaStg4TKhlAVyGlz3.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/70AV2Xx5FQYj20labp0EGdbjI6E.jpg",
    manualEmbed: "cos:movie/637649",
    trailerEmbed: "https://www.youtube.com/watch?v=wo1kO8m2Nik",
    isSeries: false
  },
  {
    id: "The Super Mario Bros. Movie",
    imdbId: "tt6718170",
    title: "The Super Mario Bros. Movie",
    releaseDate: "2023-04-05",
    rating: 7.6,
    synopsis: "While working underground to fix a water main, Brooklyn plumbers—and brothers—Mario and Luigi are transported down a mysterious pipe and wander into a magical new world. But when the brothers are separated, Mario embarks on an epic quest to find Luigi.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/9n2tJBplPbgR2ca05hS5CKXwP2c.jpg",
    manualEmbed: "cos:movie/502356",
    trailerEmbed: "https://www.youtube.com/watch?v=RjNcTBXTk4I",
    isSeries: false
  },
  {
    id: "John Wick: Chapter 4",
    imdbId: "tt10366206",
    title: "John Wick: Chapter 4",
    releaseDate: "2023-03-21",
    rating: 7.7,
    synopsis: "With the price on his head ever increasing, John Wick uncovers a path to defeating The High Table. But before he can earn his freedom, Wick must face off against a new enemy with powerful alliances across the globe and forces that turn old friends into foes.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/7I6VUdPj6tQECNHdviJkUHD2u89.jpg",
    manualEmbed: "cos:movie/603692",
    trailerEmbed: "https://www.youtube.com/watch?v=yjRHZEUamCc",
    isSeries: false
  },
  {
    id: "The Suicide Squad",
    imdbId: "tt6334354",
    title: "The Suicide Squad",
    releaseDate: "2021-07-28",
    rating: 7.4,
    synopsis: "Supervillains Harley Quinn, Bloodsport, Peacemaker and a collection of nutty cons at Belle Reve prison join the super-secret, super-shady Task Force X as they are dropped off at the remote, enemy-infused island of Corto Maltese.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/q61qEyssk2ku3okWICKArlAdhBn.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/jlGmlFOcfo8n5tURmhC7YVd4Iyy.jpg",
    manualEmbed: "cos:movie/436969",
    trailerEmbed: "https://www.youtube.com/watch?v=eg5ciqQzmK0",
    isSeries: false
  },
  {
    id: "Lilo & Stitch",
    imdbId: "tt11655566",
    title: "Lilo & Stitch",
    releaseDate: "2025-05-17",
    rating: 7.2,
    synopsis: "The wildly funny and touching story of a lonely Hawaiian girl and the fugitive alien who helps to mend her broken family.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/ckQzKpQJO4ZQDCN5evdpKcfm7Ys.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/7Zx3wDG5bBtcfk8lcnCWDOLM4Y4.jpg",
    manualEmbed: "cos:movie/552524",
    trailerEmbed: "https://www.youtube.com/watch?v=VWqJifMMgZE",
    isSeries: false
  },
  {
    id: "Kraven the Hunter",
    imdbId: "tt8790086",
    title: "Kraven the Hunter",
    releaseDate: "2024-12-11",
    rating: 6.4,
    synopsis: "Kraven Kravinoff's complex relationship with his ruthless gangster father, Nikolai, starts him down a path of vengeance with brutal consequences, motivating him to become not only the greatest hunter in the world, but also one of its most feared.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/1GvBhRxY6MELDfxFrete6BNhBB5.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/bGGjyPqtNc8hhGkPo8W8D8t90bW.jpg",
    manualEmbed: "cos:movie/539972",
    trailerEmbed: "https://www.youtube.com/watch?v=hR1-ihzff3I",
    isSeries: false
  },
  {
    id: "The Running Man",
    imdbId: "tt14107334",
    title: "The Running Man",
    releaseDate: "2025-11-11",
    rating: 6.7,
    synopsis: "Desperate to save his sick daughter, working-class Ben Richards is convinced by The Running Man's charming but ruthless producer to enter the deadly competition game as a last resort. But Ben's defiance, instincts, and grit turn him into an unexpected fan favorite — and a threat to the entire system. As ratings skyrocket, so does the danger, and Ben must outwit not just the Hunters, but a nation addicted to watching him fall.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/dKL78O9zxczVgjtNcQ9UkbYLzqX.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/aHj7d7wSLqrg5cjAcgHhiGr97Ih.jpg",
    manualEmbed: "cos:movie/798645",
    trailerEmbed: "https://www.youtube.com/watch?v=_iHJHYjq7XI",
    isSeries: false
  },
  {
    id: "Barbie",
    imdbId: "tt1517268",
    title: "Barbie",
    releaseDate: "2023-07-19",
    rating: 6.9,
    synopsis: "Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land. However, when they get a chance to go to the real world, they soon discover the joys and perils of living among humans.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/1esAE8sLJRWWFsLLeh5r3g2WanI.jpg",
    manualEmbed: "cos:movie/346698",
    trailerEmbed: "https://www.youtube.com/watch?v=Y1IgAEejvqM",
    isSeries: false
  },
  {
    id: "The Beekeeper",
    imdbId: "tt15314262",
    title: "The Beekeeper",
    releaseDate: "2024-01-08",
    rating: 7.3,
    synopsis: "One man's campaign for vengeance takes on national stakes after he is revealed to be a former operative of a powerful and clandestine organization known as Beekeepers.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/A7EByudX0eOzlkQ2FIbogzyazm2.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/f0ACHVpV707zqu4etZrXnWNdSgL.jpg",
    manualEmbed: "cos:movie/866398",
    trailerEmbed: "https://www.youtube.com/watch?v=CHKn-yDCE2w",
    isSeries: false
  },
  {
    id: "The Gorge",
    imdbId: "tt13654226",
    title: "The Gorge",
    releaseDate: "2025-02-13",
    rating: 7.7,
    synopsis: "Two highly trained operatives grow close from a distance after being sent to guard opposite sides of a mysterious gorge. When an evil below emerges, they must work together to survive what lies within.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/7iMBZzVZtG0oBug4TfqDb9ZxAOa.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/9nhjGaFLKtddDPtPaX5EmKqsWdH.jpg",
    manualEmbed: "cos:movie/950396",
    trailerEmbed: "https://www.youtube.com/watch?v=rUSdnuOLebE",
    isSeries: false
  },
  {
    id: "Captain America: Brave New World",
    imdbId: "tt14513804",
    title: "Captain America: Brave New World",
    releaseDate: "2025-02-12",
    rating: 6,
    synopsis: "After meeting with newly elected U.S. President Thaddeus Ross, Sam finds himself in the middle of an international incident. He must discover the reason behind a nefarious global plot before the true mastermind has the entire world seeing red.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/pzIddUEMWhWzfvLI3TwxUG2wGoi.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/ce3prrjh9ZehEl5JinNqr4jIeaB.jpg",
    manualEmbed: "cos:movie/822119",
    trailerEmbed: "https://www.youtube.com/watch?v=5PSzFLV-EyQ",
    isSeries: false
  },
  {
    id: "Killers of the Flower Moon",
    imdbId: "tt5537002",
    title: "Killers of the Flower Moon",
    releaseDate: "2023-10-18",
    rating: 7.4,
    synopsis: "When oil is discovered in 1920s Oklahoma under Osage Nation land, the Osage people are murdered one by one—until the FBI steps in to unravel the mystery.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/dB6Krk806zeqd0YNp2ngQ9zXteH.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/acvE3RWjDLgvbL2RtcyzkrsAyNV.jpg",
    manualEmbed: "cos:movie/466420",
    trailerEmbed: "https://www.youtube.com/watch?v=1oZUCkJEuvo",
    isSeries: false
  },
  {
    id: "Babylon",
    imdbId: "tt10640346",
    title: "Babylon",
    releaseDate: "2022-12-22",
    rating: 7.3,
    synopsis: "A tale of outsized ambition and outrageous excess, tracing the rise and fall of multiple characters in an era of unbridled decadence and depravity during Hollywood's transition from silent films to sound films in the late 1920s.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/wjOHjWCUE0YzDiEzKv8AfqHj3ir.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/5fxTB08O7CW1hAcN2MWOKodp1h1.jpg",
    manualEmbed: "cos:movie/615777",
    trailerEmbed: "https://www.youtube.com/watch?v=OumYv1aE1VI",
    isSeries: false
  },
  {
    id: "The Brutalist",
    imdbId: "tt8999762",
    title: "The Brutalist",
    releaseDate: "2024-12-20",
    rating: 6.9,
    synopsis: "When an innovative modern architect flees post-war Europe, he is given the opportunity to rebuild his legacy. Set during the dawn of the modern United States (in Pennsylvania), his wife joins him, and their lives are forever changed by a demanding, wealthy patron.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/vP7Yd6couiAaw9jgMd5cjMRj3hQ.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/hmZnqijPaaACjenDkrbWcCmcADI.jpg",
    manualEmbed: "cos:movie/549509",
    trailerEmbed: "https://www.youtube.com/watch?v=GdRXPAHIEW4",
    isSeries: false
  },
  {
    id: "Fall",
    imdbId: "tt15325794",
    title: "Fall",
    releaseDate: "2022-08-11",
    rating: 7.1,
    synopsis: "For best friends Becky and Hunter, life is all about conquering fears and pushing limits. But after they climb 2,000 feet to the top of a remote, abandoned radio tower, they find themselves stranded with no way down. Now Becky and Hunter's expert climbing skills will be put to the ultimate test as they desperately fight to survive the elements, a lack of supplies, and vertigo-inducing heights.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/spCAxD99U1A6jsiePFoqdEcY0dG.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/hT3OqvzMqCQuJsUjZnQwA5NuxgK.jpg",
    manualEmbed: "cos:movie/985939",
    trailerEmbed: "https://www.youtube.com/watch?v=FNk7Cu4sJOs",
    isSeries: false
  },
  {
    id: "Doctor Strange in the Multiverse of Madness",
    imdbId: "tt9419884",
    title: "Doctor Strange in the Multiverse of Madness",
    releaseDate: "2022-05-04",
    rating: 7.2,
    synopsis: "Doctor Strange, with the help of mystical allies both old and new, traverses the mind-bending and dangerous alternate realities of the Multiverse to confront a mysterious new adversary.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/ddJcSKbcp4rKZTmuyWaMhuwcfMz.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/lv3TXqhpaIxkclIHbhN2MRMOemQ.jpg",
    manualEmbed: "cos:movie/453395",
    trailerEmbed: "https://www.youtube.com/watch?v=Rf8LAYJSOL8",
    isSeries: false
  },
  {
    id: "Kingdom of the Planet of the Apes",
    imdbId: "tt11389872",
    title: "Kingdom of the Planet of the Apes",
    releaseDate: "2024-05-08",
    rating: 7.1,
    synopsis: "Several generations following Caesar's reign, apes – now the dominant species – live harmoniously while humans have been reduced to living in the shadows. As a new tyrannical ape leader builds his empire, one young ape undertakes a harrowing journey that will cause him to question all he's known about the past and to make choices that will define a future for apes and humans alike.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/gKkl37BQuKTanygYQG1pyYgLVgf.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/fypydCipcWDKDTTCoPucBsdGYXW.jpg",
    manualEmbed: "cos:movie/653346",
    trailerEmbed: "https://www.youtube.com/watch?v=Tg1FesR8X90",
    isSeries: false
  },
  {
    id: "Meg 2: The Trench",
    imdbId: "tt9224104",
    title: "Meg 2: The Trench",
    releaseDate: "2023-08-02",
    rating: 6.4,
    synopsis: "An exploratory dive into the deepest depths of the ocean of a daring research team spirals into chaos when a malevolent mining operation threatens their mission and forces them into a high-stakes battle for survival.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/4m1Au3YkjqsxF8iwQy0fPYSxE0h.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/5mzr6JZbrqnqD8rCEvPhuCE5Fw2.jpg",
    manualEmbed: "cos:movie/615656",
    trailerEmbed: "https://www.youtube.com/watch?v=dG91B3hHyY4",
    isSeries: false
  },
  {
    id: "Wicked: For Good",
    imdbId: "tt19847976",
    title: "Wicked: For Good",
    releaseDate: "2025-11-19",
    rating: 6.6,
    synopsis: "As an angry mob rises against the Wicked Witch, Glinda and Elphaba must unite one last time with honesty and empathy to fulfill their shared destiny and change the fate of Oz forever.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/si9tolnefLSUKaqQEGz1bWArOaL.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/cGbPBHKSFO7hSIjxkb3KOaGdOep.jpg",
    manualEmbed: "cos:movie/967941",
    trailerEmbed: "https://www.youtube.com/watch?v=R2Xubj7lazE",
    isSeries: false
  },
  {
    id: "28 Years Later",
    imdbId: "tt10548174",
    title: "28 Years Later",
    releaseDate: "2025-06-18",
    rating: 6.6,
    synopsis: "Twenty-eight years after the Rage virus outbreak, a heavily-defended island survives connected to the mainland by a single causeway. When one of the group leaves the island into the dark heart of the mainland, he discovers secrets, wonders, and horrors that have mutated not only the infected but other survivors as well.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/n5FygjEppOvac6yEaowi26nTyw3.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/6WqqEjiycNvDLjbEClM1zCwIbDD.jpg",
    manualEmbed: "cos:movie/1100988",
    trailerEmbed: "https://www.youtube.com/watch?v=IYGG55qwQZQ",
    isSeries: false
  },
  {
    id: "Snow White",
    imdbId: "tt6208148",
    title: "Snow White",
    releaseDate: "2025-03-19",
    rating: 4.3,
    synopsis: "Following the benevolent King's disappearance, the Evil Queen dominated the once fair land with a cruel streak. Princess Snow White flees the castle when the Queen, in her jealousy over Snow White's inner beauty, tries to kill her. Deep into the dark woods, she stumbles upon seven magical dwarves and a young bandit named Jonathan. Together, they strive to survive the Queen's relentless pursuit and aspire to take back the kingdom.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/oLxWocqheC8XbXbxqJ3x422j9PW.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/tyfO9jHgkhypUFizRVYD0bytPjP.jpg",
    manualEmbed: "cos:movie/447273",
    trailerEmbed: "https://www.youtube.com/watch?v=KsSoo5K8CpA",
    isSeries: false
  },
  {
    id: "Mufasa: The Lion King",
    imdbId: "tt13186482",
    title: "Mufasa: The Lion King",
    releaseDate: "2024-12-18",
    rating: 7.3,
    synopsis: "Mufasa, a cub lost and alone, meets a sympathetic lion named Taka, the heir to a royal bloodline. The chance meeting sets in motion an expansive journey of a group of misfits searching for their destiny.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/jbOSUAWMGzGL1L4EaUF8K6zYFo7.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/1w8kutrRucTd3wlYyu5QlUDMiG1.jpg",
    manualEmbed: "cos:movie/762509",
    trailerEmbed: "https://www.youtube.com/watch?v=lMXh6vjiZrI",
    isSeries: false
  },
  {
    id: "Ballerina",
    imdbId: "tt7181546",
    title: "Ballerina",
    releaseDate: "2025-06-04",
    rating: 7.3,
    synopsis: "Taking place during the events of John Wick: Chapter 3 – Parabellum, Eve Macarro begins her training in the assassin traditions of the Ruska Roma.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/2VUmvqsHb6cEtdfscEA6fqqVzLg.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/1yktYsxkmUtUFTUnCAUaqG6FEiz.jpg",
    manualEmbed: "cos:movie/541671",
    trailerEmbed: "https://www.youtube.com/watch?v=b9Rr9ygb-ac",
    isSeries: false
  },
  {
    id: "Red One",
    imdbId: "tt14948432",
    title: "Red One",
    releaseDate: "2024-10-31",
    rating: 7,
    synopsis: "After Santa Claus (codename: Red One) is kidnapped, the North Pole's Head of Security must team up with the world's most infamous tracker in a globe-trotting, action-packed mission to save Christmas.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/cdqLnri3NEGcmfnqwk2TSIYtddg.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/rOmUuQEZfPXglwFs5ELLLUDKodL.jpg",
    manualEmbed: "cos:movie/845781",
    trailerEmbed: "https://www.youtube.com/watch?v=7l3hfD74X-4",
    isSeries: false
  },
  {
    id: "One Battle After Another",
    imdbId: "tt30144839",
    title: "One Battle After Another",
    releaseDate: "2025-09-23",
    rating: 7.3,
    synopsis: "Washed-up revolutionary Bob exists in a state of stoned paranoia, surviving off-grid with his spirited, self-reliant daughter, Willa. When his evil nemesis resurfaces after 16 years and she goes missing, the former radical scrambles to find her, father and daughter both battling the consequences of his past.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/lbBWwxBht4JFP5PsuJ5onpMqugW.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/zpEWFNqoN8Qg1SzMMHmaGyOBTdW.jpg",
    manualEmbed: "cos:movie/1054867",
    trailerEmbed: "https://www.youtube.com/watch?v=u6GVb4p7oD4",
    isSeries: false
  },
  {
    id: "Despicable Me 4",
    imdbId: "tt7510222",
    title: "Despicable Me 4",
    releaseDate: "2024-06-20",
    rating: 7,
    synopsis: "Gru and Lucy and their girls—Margo, Edith and Agnes—welcome a new member to the Gru family, Gru Jr., who is intent on tormenting his dad. Gru also faces a new nemesis in Maxime Le Mal and his femme fatale girlfriend Valentina, forcing the family to go on the run.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/wWba3TaojhK7NdycRhoQpsG0FaH.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/twsxsfao6ZOVvT8LfudH603MMi6.jpg",
    manualEmbed: "cos:movie/519182",
    trailerEmbed: "https://www.youtube.com/watch?v=LtNYaH61dXY",
    isSeries: false
  },
  {
    id: "Black Adam",
    imdbId: "tt6443346",
    title: "Black Adam",
    releaseDate: "2022-10-19",
    rating: 6.8,
    synopsis: "Nearly 5,000 years after he was bestowed with the almighty powers of the Egyptian gods—and imprisoned just as quickly—Black Adam is freed from his earthly tomb, ready to unleash his unique form of justice on the modern world.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/rCtreCr4xiYEWDQTebybolIh6Xe.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/bQXAqRx2Fgc46uCVWgoPz5L5Dtr.jpg",
    manualEmbed: "cos:movie/436270",
    trailerEmbed: "https://www.youtube.com/watch?v=mkomfZHG5q4",
    isSeries: false
  },
  {
    id: "No Time to Die",
    imdbId: "tt2382320",
    title: "No Time to Die",
    releaseDate: "2021-09-29",
    rating: 7.3,
    synopsis: "Bond has left active service and is enjoying a tranquil life in Jamaica. His peace is short-lived when his old friend Felix Leiter from the CIA turns up asking for help. The mission to rescue a kidnapped scientist turns out to be far more treacherous than expected, leading Bond onto the trail of a mysterious villain armed with dangerous new technology.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/iUgygt3fscRoKWCV1d0C7FbM9TP.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/bz7pwNGCbV576COsDcYN9MbEACC.jpg",
    manualEmbed: "cos:movie/370172",
    trailerEmbed: "https://www.youtube.com/watch?v=N_gD9-Oa0fg",
    isSeries: false
  },
  {
    id: "Thor: Love and Thunder",
    imdbId: "tt10648342",
    title: "Thor: Love and Thunder",
    releaseDate: "2022-07-06",
    rating: 6.4,
    synopsis: "After his retirement is interrupted by Gorr the God Butcher, a galactic killer who seeks the extinction of the gods, Thor Odinson enlists the help of King Valkyrie, Korg, and ex-girlfriend Jane Foster, who now wields Mjolnir as the Mighty Thor. Together they embark upon a harrowing cosmic adventure to uncover the mystery of the God Butcher’s vengeance and stop him before it’s too late.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/pIkRyD18kl4FhoCNQuWxWu5cBLM.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/jsoz1HlxczSuTx0mDl2h0lxy36l.jpg",
    manualEmbed: "cos:movie/616037",
    trailerEmbed: "https://www.youtube.com/watch?v=Go8nTmfrQd8",
    isSeries: false
  },
  {
    id: "Godzilla x Kong: The New Empire",
    imdbId: "tt14539740",
    title: "Godzilla x Kong: The New Empire",
    releaseDate: "2024-03-27",
    rating: 7,
    synopsis: "Following their explosive showdown, Godzilla and Kong must reunite against a colossal undiscovered threat hidden within our world, challenging their very existence – and our own.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/z1p34vh7dEOnLDmyCrlUVLuoDzd.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/gvLG3Fnznkxl4SmYfcK8gUuqxM8.jpg",
    manualEmbed: "cos:movie/823464",
    trailerEmbed: "https://www.youtube.com/watch?v=m2u6RfmTXt0",
    isSeries: false
  },
  {
    id: "Bullet Train",
    imdbId: "tt12593682",
    title: "Bullet Train",
    releaseDate: "2022-07-20",
    rating: 7.4,
    synopsis: "Unlucky assassin Ladybug is determined to do his job peacefully after one too many gigs gone off the rails. Fate, however, may have other plans, as Ladybug's latest mission puts him on a collision course with lethal adversaries from around the globe—all with connected, yet conflicting, objectives—on the world's fastest train.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/j8szC8OgrejDQjjMKSVXyaAjw3V.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/y2Ca1neKke2mGPMaHzlCNDVZqsK.jpg",
    manualEmbed: "cos:movie/718930",
    trailerEmbed: "https://www.youtube.com/watch?v=EGeJczJvWns",
    isSeries: false
  },
  {
    id: "A Working Man",
    imdbId: "tt9150192",
    title: "A Working Man",
    releaseDate: "2025-03-26",
    rating: 6.7,
    synopsis: "Levon Cade left behind a decorated military career in the black ops to live a simple life working construction. But when his boss's daughter, who is like family to him, is taken by human traffickers, his search to bring her home uncovers a world of corruption far greater than he ever could have imagined.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6FRFIogh3zFnVWn7Z6zcYnIbRcX.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/fTrQsdMS2MUw00RnzH0r3JWHhts.jpg",
    manualEmbed: "cos:movie/1197306",
    trailerEmbed: "https://www.youtube.com/watch?v=mdfrG2cLK58",
    isSeries: false
  },
  {
    id: "Black Widow",
    imdbId: "tt3480822",
    title: "Black Widow",
    releaseDate: "2021-07-07",
    rating: 7.1,
    synopsis: "Natasha Romanoff, also known as Black Widow, confronts the darker parts of her ledger when a dangerous conspiracy with ties to her past arises. Pursued by a force that will stop at nothing to bring her down, Natasha must deal with her history as a spy and the broken relationships left in her wake long before she became an Avenger.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/qAZ0pzat24kLdO3o8ejmbLxyOac.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/keIxh0wPr2Ymj0Btjh4gW7JJ89e.jpg",
    manualEmbed: "cos:movie/497698",
    trailerEmbed: "https://www.youtube.com/watch?v=Fp9pNPdNwjI",
    isSeries: false
  },
  {
    id: "Now You See Me: Now You Don't",
    imdbId: "tt4712810",
    title: "Now You See Me: Now You Don't",
    releaseDate: "2025-11-12",
    rating: 6.4,
    synopsis: "The original Four Horsemen reunite with a new generation of illusionists to take on powerful diamond heiress Veronika Vanderberg, who leads a criminal empire built on money laundering and trafficking. The new and old magicians must overcome their differences to work together on their most ambitious heist yet.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/oD3Eey4e4Z259XLm3eD3WGcoJAh.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/ufqytAlziHq5pljKByGJ8IKhtEZ.jpg",
    manualEmbed: "cos:movie/425274",
    trailerEmbed: "https://www.youtube.com/watch?v=lLWESUfW-0A",
    isSeries: false
  },
  {
    id: "Black Panther: Wakanda Forever",
    imdbId: "tt9114286",
    title: "Black Panther: Wakanda Forever",
    releaseDate: "2022-11-09",
    rating: 7,
    synopsis: "Queen Ramonda, Shuri, M’Baku, Okoye and the Dora Milaje fight to protect their nation from intervening world powers in the wake of King T’Challa’s death.  As the Wakandans strive to embrace their next chapter, the heroes must band together with the help of War Dog Nakia and Everett Ross and forge a new path for the kingdom of Wakanda.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/sv1xJUazXeYqALzczSZ3O6nkH75.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/83H0C66AcvkwpG2738VCTHMY9uv.jpg",
    manualEmbed: "cos:movie/505642",
    trailerEmbed: "https://www.youtube.com/watch?v=_Z3QKkl1WyM",
    isSeries: false
  },
  {
    id: "The Gentlemen",
    imdbId: "tt8367814",
    title: "The Gentlemen",
    releaseDate: "2020-01-01",
    rating: 7.7,
    synopsis: "American expat Mickey Pearson has built a highly profitable marijuana empire in London. When word gets out that he’s looking to cash out of the business forever it triggers plots, schemes, bribery and blackmail in an attempt to steal his domain out from under him.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/jtrhTYB7xSrJxR1vusu99nvnZ1g.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/hClLP88yMIuhslwSVxtYrvWmxfp.jpg",
    manualEmbed: "cos:movie/522627",
    trailerEmbed: "https://www.youtube.com/watch?v=KlXsguV9g0E",
    isSeries: false
  },
  {
    id: "Jurassic World Dominion",
    imdbId: "tt8041270",
    title: "Jurassic World Dominion",
    releaseDate: "2022-06-01",
    rating: 6.6,
    synopsis: "Four years after Isla Nublar was destroyed, dinosaurs now live—and hunt—alongside humans all over the world. This fragile balance will reshape the future and determine, once and for all, whether human beings are to remain the apex predators on a planet they now share with history's most fearsome creatures.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/jbAvCACjLf1ZG0unB2tdmx5HAf1.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/9hk5iiycq7ukRAAXQiJT9HZX3SX.jpg",
    manualEmbed: "cos:movie/507086",
    trailerEmbed: "https://www.youtube.com/watch?v=DtQycgMD4HQ",
    isSeries: false
  },
  {
    id: "Kung Fu Panda 4",
    imdbId: "tt21692408",
    title: "Kung Fu Panda 4",
    releaseDate: "2024-03-02",
    rating: 7,
    synopsis: "Po is gearing up to become the spiritual leader of his Valley of Peace, but also needs someone to take his place as Dragon Warrior. As such, he will train a new kung fu practitioner for the spot and will encounter a villain called the Chameleon who conjures villains from the past.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/3ffPx9jqg0yj9y1KWeagT7D20CB.jpg",
    manualEmbed: "cos:movie/1011985",
    trailerEmbed: "https://www.youtube.com/watch?v=d2OONzqh2jk",
    isSeries: false
  },
  {
    id: "Mickey 17",
    imdbId: "tt12299608",
    title: "Mickey 17",
    releaseDate: "2025-02-28",
    rating: 6.8,
    synopsis: "Unlikely hero Mickey Barnes finds himself in the extraordinary circumstance of working for an employer who demands the ultimate commitment to the job… to die, for a living.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/edKpE9B5qN3e559OuMCLZdW1iBZ.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/9PRKAdrDvAdCfg3EcApLTfzGsEt.jpg",
    manualEmbed: "cos:movie/696506",
    trailerEmbed: "https://www.youtube.com/watch?v=tA1s65o_kYM",
    isSeries: false
  },
  {
    id: "Alien: Romulus",
    imdbId: "tt18412256",
    title: "Alien: Romulus",
    releaseDate: "2024-08-13",
    rating: 7.2,
    synopsis: "While scavenging the deep ends of a derelict space station, a group of young space colonizers come face to face with the most terrifying life form in the universe.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/2uSWRTtCG336nuBiG8jOTEUKSy8.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/iYqSQaWDttQIQzsxg9xHyg0bttG.jpg",
    manualEmbed: "cos:movie/945961",
    trailerEmbed: "https://www.youtube.com/watch?v=x0XDEhP4MQs",
    isSeries: false
  },
  {
    id: "The Equalizer 3",
    imdbId: "tt17024450",
    title: "The Equalizer 3",
    releaseDate: "2023-08-30",
    rating: 7.3,
    synopsis: "Robert McCall finds himself at home in Southern Italy but he discovers his friends are under the control of local crime bosses. As events turn deadly, McCall knows what he has to do: become his friends' protector by taking on the mafia.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/b0Ej6fnXAP8fK75hlyi2jKqdhHz.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/gystuaqp5AkVqqu3Nf0564zeOv4.jpg",
    manualEmbed: "cos:movie/926393",
    trailerEmbed: "https://www.youtube.com/watch?v=fQfrzHFmVe8",
    isSeries: false
  },
  {
    id: "Transformers: Rise of the Beasts",
    imdbId: "tt5090568",
    title: "Transformers: Rise of the Beasts",
    releaseDate: "2023-06-06",
    rating: 7.2,
    synopsis: "When a new threat capable of destroying the entire planet emerges, Optimus Prime and the Autobots must team up with a powerful faction known as the Maximals. With the fate of humanity hanging in the balance, humans Noah and Elena will do whatever it takes to help the Transformers as they engage in the ultimate battle to save Earth.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/gPbM0MK8CP8A174rmUwGsADNYKD.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/2vFuG6bWGyQUzYS9d69E5l85nIz.jpg",
    manualEmbed: "cos:movie/667538",
    trailerEmbed: "https://www.youtube.com/watch?v=ZtuFgnxQMrA",
    isSeries: false
  },
  {
    id: "Sonic the Hedgehog",
    imdbId: "tt3794354",
    title: "Sonic the Hedgehog",
    releaseDate: "2020-02-12",
    rating: 7.3,
    synopsis: "Powered with incredible speed, Sonic The Hedgehog embraces his new home on Earth. That is, until Sonic sparks the attention of super-uncool evil genius Dr. Robotnik. Now it’s super-villain vs. super-sonic in an all-out race across the globe to stop Robotnik from using Sonic’s unique power for world domination.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/aQvJ5WPzZgYVDrxLX4R6cLJCEaQ.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/stmYfCUGd8Iy6kAMBr6AmWqx8Bq.jpg",
    manualEmbed: "cos:movie/454626",
    trailerEmbed: "https://www.youtube.com/watch?v=szby7ZHLnkA",
    isSeries: false
  },
  {
    id: "Road House",
    imdbId: "tt3359350",
    title: "Road House",
    releaseDate: "2024-03-08",
    rating: 6.9,
    synopsis: "Ex-UFC fighter Dalton takes a job as a bouncer at a Florida Keys roadhouse, only to discover that this paradise is not all it seems.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/fDEdtS4P0gJsxHDIt8dG8TR5dx1.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/clFFCapyGpE7KD4Jsu5pUbFBZF4.jpg",
    manualEmbed: "cos:movie/359410",
    trailerEmbed: "https://www.youtube.com/watch?v=Y0ZsLudtfjI",
    isSeries: false
  },
  {
    id: "The Bad Guys",
    imdbId: "tt8115900",
    title: "The Bad Guys",
    releaseDate: "2022-03-17",
    rating: 7.5,
    synopsis: "When the Bad Guys, a crew of criminal animals, are finally caught after years of heists and being the world’s most-wanted villains, Mr. Wolf brokers a deal to save them all from prison.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6fcFmdVLCCbf1gFt8HlC6BRj8pt.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/a8w3luV9uCjveB8v7grHfvXVOFJ.jpg",
    manualEmbed: "cos:movie/629542",
    trailerEmbed: "https://www.youtube.com/watch?v=zpDuBXB_glk",
    isSeries: false
  },
  {
    id: "Migration",
    imdbId: "tt6495056",
    title: "Migration",
    releaseDate: "2023-12-06",
    rating: 7.4,
    synopsis: "After a migrating duck family alights on their pond with thrilling tales of far-flung places, the Mallard family embarks on a family road trip, from New England, to New York City, to tropical Jamaica.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/ldfCF9RhR40mppkzmftxapaHeTo.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/gklkxY0veMajdCiGe6ggsh07VG2.jpg",
    manualEmbed: "cos:movie/940551",
    trailerEmbed: "https://www.youtube.com/watch?v=hWbfohXIdEU",
    isSeries: false
  },
  {
    id: "Gladiator II",
    imdbId: "tt9218128",
    title: "Gladiator II",
    releaseDate: "2024-11-13",
    rating: 6.6,
    synopsis: "Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius is forced to enter the Colosseum after his home is conquered by the tyrannical Emperors who now lead Rome with an iron fist. With rage in his heart and the future of the Empire at stake, Lucius must look to his past to find strength and honor to return the glory of Rome to its people.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/tOqIwliWMovSIZ9DyvHcHI7p2im.jpg",
    manualEmbed: "cos:movie/558449",
    trailerEmbed: "https://www.youtube.com/watch?v=TQwSz88ITAE",
    isSeries: false
  },
  {
    id: "The Bad Guys 2",
    imdbId: "tt30017619",
    title: "The Bad Guys 2",
    releaseDate: "2025-07-24",
    rating: 7.6,
    synopsis: "The now-reformed Bad Guys are trying (very, very hard) to be good, but instead find themselves hijacked into a high-stakes, globe-trotting heist, masterminded by a new team of criminals they never saw coming: The Bad Girls.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/26oSPnq0ct59l07QOXZKyzsiRtN.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/jvpkBenB6hv19WWYVlaiow8zklq.jpg",
    manualEmbed: "cos:movie/1175942",
    trailerEmbed: "https://www.youtube.com/watch?v=HvLHYox_Vq8",
    isSeries: false
  },
  {
    id: "Mission: Impossible - Dead Reckoning Part One",
    imdbId: "tt9603212",
    title: "Mission: Impossible - Dead Reckoning Part One",
    releaseDate: "2023-07-08",
    rating: 7.5,
    synopsis: "Ethan Hunt and his IMF team embark on their most dangerous mission yet: To track down a terrifying new weapon that threatens all of humanity before it falls into the wrong hands. With control of the future and the world's fate at stake and dark forces from Ethan's past closing in, a deadly race around the globe begins. Confronted by a mysterious, all-powerful enemy, Ethan must consider that nothing can matter more than his mission—not even the lives of those he cares about most.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/NNxYkU70HPurnNCSiCjYAmacwm.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/628Dep6AxEtDxjZoGP78TsOxYbK.jpg",
    manualEmbed: "cos:movie/575264",
    trailerEmbed: "https://www.youtube.com/watch?v=HurjfO_TDlQ",
    isSeries: false
  },
  {
    id: "Zack Snyder's Justice League",
    imdbId: "tt12361974",
    title: "Zack Snyder's Justice League",
    releaseDate: "2021-03-18",
    rating: 8.1,
    synopsis: "Determined to ensure Superman's ultimate sacrifice was not in vain, Bruce Wayne aligns forces with Diana Prince with plans to recruit a team of metahumans to protect the world from an approaching threat of catastrophic proportions.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/tnAuB8q5vv7Ax9UAEje5Xi4BXik.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/9WoLTsRgrupkvCgs3bhsl2EjLhs.jpg",
    manualEmbed: "cos:movie/791373",
    trailerEmbed: "https://www.youtube.com/watch?v=ui37YKQ9AC4",
    isSeries: false
  },
  {
    id: "Turning Red",
    imdbId: "tt8097030",
    title: "Turning Red",
    releaseDate: "2022-03-10",
    rating: 7.3,
    synopsis: "Thirteen-year-old Mei is experiencing the awkwardness of being a teenager with a twist – when she gets too excited, she transforms into a giant red panda.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/qsdjk9oAKSQMWs0Vt5Pyfh6O4GZ.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/fOy2Jurz9k6RnJnMUMRDAgBwru2.jpg",
    manualEmbed: "cos:movie/508947",
    trailerEmbed: "https://www.youtube.com/watch?v=XdKzUbAiswE",
    isSeries: false
  },
  {
    id: "Shang-Chi and the Legend of the Ten Rings",
    imdbId: "tt9376612",
    title: "Shang-Chi and the Legend of the Ten Rings",
    releaseDate: "2021-09-01",
    rating: 7.5,
    synopsis: "Shang-Chi must confront the past he thought he left behind when he is drawn into the web of the mysterious Ten Rings organization.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/9f2Q0U3IOsLgrI2HkvldwSABZy5.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/r7K6Xt0RX4Mw0cAbZVw5cyb1Tux.jpg",
    manualEmbed: "cos:movie/566525",
    trailerEmbed: "https://www.youtube.com/watch?v=8YjFbMbfXaQ",
    isSeries: false
  },
  {
    id: "The Flash",
    imdbId: "tt0439572",
    title: "The Flash",
    releaseDate: "2023-06-13",
    rating: 6.6,
    synopsis: "When his attempt to save his family inadvertently alters the future, Barry Allen becomes trapped in a reality in which General Zod has returned and there are no Super Heroes to turn to. In order to save the world that he is in and return to the future that he knows, Barry's only hope is to race for his life. But will making the ultimate sacrifice be enough to reset the universe?",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/rktDFPbfHfUbArZ6OOOKsXcv0Bm.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/yF1eOkaYvwiORauRCPWznV9xVvi.jpg",
    manualEmbed: "cos:movie/298618",
    trailerEmbed: "https://www.youtube.com/watch?v=jprhe-cWKGs",
    isSeries: false
  },
  {
    id: "Furiosa: A Mad Max Saga",
    imdbId: "tt12037194",
    title: "Furiosa: A Mad Max Saga",
    releaseDate: "2024-05-22",
    rating: 7.4,
    synopsis: "As the world falls, young Furiosa is snatched from the Green Place of Many Mothers into the hands of a great biker horde led by the warlord Dementus. Sweeping through the wasteland, they encounter the citadel presided over by Immortan Joe. The two tyrants wage war for dominance, and Furiosa must survive many trials as she puts together the means to find her way home.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/iADOJ8Zymht2JPMoy3R7xceZprc.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/raph7qjAGTMXaIjVxt6ZDSXRzUr.jpg",
    manualEmbed: "cos:movie/786892",
    trailerEmbed: "https://www.youtube.com/watch?v=LYV3001u574",
    isSeries: false
  },
  {
    id: "Evil Dead Rise",
    imdbId: "tt13345606",
    title: "Evil Dead Rise",
    releaseDate: "2023-04-12",
    rating: 7,
    synopsis: "A reunion between two estranged sisters gets cut short by the rise of flesh-possessing demons, thrusting them into a primal battle for survival as they face the most nightmarish version of family imaginable.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/5ik4ATKmNtmJU6AYD0bLm56BCVM.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/7bWxAsNPv9CXHOhZbJVlj2KxgfP.jpg",
    manualEmbed: "cos:movie/713704",
    trailerEmbed: "https://www.youtube.com/watch?v=sI2JcVku4Gk",
    isSeries: false
  },
  {
    id: "The Ministry of Ungentlemanly Warfare",
    imdbId: "tt5177120",
    title: "The Ministry of Ungentlemanly Warfare",
    releaseDate: "2024-04-18",
    rating: 7,
    synopsis: "During World War II, the British Army assigns a group of competent soldiers to carry out a mission against the Nazi forces behind enemy lines... A true story about a secret British WWII organization — the Special Operations Executive. Founded by Winston Churchill, their irregular warfare against the Germans helped to change the course of the war, and gave birth to modern black operations.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/8aF0iAKH9MJMYAZdi0Slg77RYa2.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/hm21I7yc6oYBogTloET3eXsVPlq.jpg",
    manualEmbed: "cos:movie/799583",
    trailerEmbed: "https://www.youtube.com/watch?v=zvwDen1Wrx8",
    isSeries: false
  },
  {
    id: "Transformers One",
    imdbId: "tt8864596",
    title: "Transformers One",
    releaseDate: "2024-09-11",
    rating: 8,
    synopsis: "The untold origin story of Optimus Prime and Megatron, better known as sworn enemies, but once were friends bonded like brothers who changed the fate of Cybertron forever.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/iRCgqpdVE4wyLQvGYU3ZP7pAtUc.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/cMfokHWle5lfCreoV08cbmkKv6G.jpg",
    manualEmbed: "cos:movie/698687",
    trailerEmbed: "https://www.youtube.com/watch?v=jaVcDaozGgc",
    isSeries: false
  },
  {
    id: "The Amateur",
    imdbId: "tt0899043",
    title: "The Amateur",
    releaseDate: "2025-04-09",
    rating: 6.9,
    synopsis: "After his life is turned upside down when his wife is killed in a London terrorist attack, a brilliant but introverted CIA decoder takes matters into his own hands when his supervisors refuse to take action.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/SNEoUInCa5fAgwuEBMIMBGvkkh.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/aD7FXrm2GErTmzrIFBntPyhAqS9.jpg",
    manualEmbed: "cos:movie/1087891",
    trailerEmbed: "https://www.youtube.com/watch?v=DCWcK4c-F8Q",
    isSeries: false
  },
  {
    id: "The Hunger Games: The Ballad of Songbirds & Snakes",
    imdbId: "tt10545296",
    title: "The Hunger Games: The Ballad of Songbirds & Snakes",
    releaseDate: "2023-11-15",
    rating: 7,
    synopsis: "64 years before he becomes the tyrannical president of Panem, Coriolanus Snow sees a chance for a change in fortunes when he mentors Lucy Gray Baird, the female tribute from District 12.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/mBaXZ95R2OxueZhvQbcEWy2DqyO.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/bk1TitfD4YIGrM6AvljonMCtfnl.jpg",
    manualEmbed: "cos:movie/695721",
    trailerEmbed: "https://www.youtube.com/watch?v=NxW_X4kzeus",
    isSeries: false
  },
  {
    id: "Smile 2",
    imdbId: "tt29268110",
    title: "Smile 2",
    releaseDate: "2024-10-16",
    rating: 6.6,
    synopsis: "About to embark on a new world tour, global pop sensation Skye Riley begins experiencing increasingly terrifying and inexplicable events. Overwhelmed by the escalating horrors and the pressures of fame, Skye is forced to face her dark past to regain control of her life before it spirals out of control.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/ht8Uv9QPv9y7K0RvUyJIaXOZTfd.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/iR79ciqhtaZ9BE7YFA1HpCHQgX4.jpg",
    manualEmbed: "cos:movie/1100782",
    trailerEmbed: "https://www.youtube.com/watch?v=FU_bAopCcSE",
    isSeries: false
  },
  {
    id: "Civil War",
    imdbId: "tt17279496",
    title: "Civil War",
    releaseDate: "2024-04-10",
    rating: 6.8,
    synopsis: "In the near future, a group of war journalists attempt to survive while reporting the truth as the United States stands on the brink of civil war.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/sh7Rg8Er3tFcN9BpKIPOMvALgZd.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/t2SXZ7KLriaLyf5QT8Iar6fSOGp.jpg",
    manualEmbed: "cos:movie/929590",
    trailerEmbed: "https://www.youtube.com/watch?v=c2G18nIVpNE",
    isSeries: false
  },
  {
    id: "The Fall Guy",
    imdbId: "tt1684562",
    title: "The Fall Guy",
    releaseDate: "2024-04-24",
    rating: 6.9,
    synopsis: "Fresh off an almost career-ending accident, stuntman Colt Seavers has to track down a missing movie star, solve a conspiracy and try to win back the love of his life while still doing his day job.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/e7olqFmzcIX5c23kX4zSmLPJi8c.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/2rjI2uXmjitMAaXVO21r9ao7v2j.jpg",
    manualEmbed: "cos:movie/746036",
    trailerEmbed: "https://www.youtube.com/watch?v=EySdVK0NK1Y",
    isSeries: false
  },
  {
    id: "Final Destination Bloodlines",
    imdbId: "tt9619824",
    title: "Final Destination Bloodlines",
    releaseDate: "2025-05-14",
    rating: 7,
    synopsis: "Plagued by a violent recurring nightmare, college student Stefanie heads home to track down the one person who might be able to break the cycle and save her family from the grisly demise that inevitably awaits them all.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6WxhEvFsauuACfv8HyoVX6mZKFj.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/uIpJPDNFoeX0TVml9smPrs9KUVx.jpg",
    manualEmbed: "cos:movie/574475",
    trailerEmbed: "https://www.youtube.com/watch?v=xitSoRbHJ50",
    isSeries: false
  },
  {
    id: "Ant-Man and the Wasp: Quantumania",
    imdbId: "tt10954600",
    title: "Ant-Man and the Wasp: Quantumania",
    releaseDate: "2023-02-15",
    rating: 6.2,
    synopsis: "Super-Hero partners Scott Lang and Hope van Dyne, along with with Hope's parents Janet van Dyne and Hank Pym, and Scott's daughter Cassie Lang, find themselves exploring the Quantum Realm, interacting with strange new creatures and embarking on an adventure that will push them beyond the limits of what they thought possible.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/qnqGbB22YJ7dSs4o6M7exTpNxPz.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/m8JTwHFwX7I7JY5fPe4SjqejWag.jpg",
    manualEmbed: "cos:movie/640146",
    trailerEmbed: "https://www.youtube.com/watch?v=5WfTEZJnv_8",
    isSeries: false
  },
  {
    id: "Wicked",
    imdbId: "tt1262426",
    title: "Wicked",
    releaseDate: "2024-10-16",
    rating: 6.9,
    synopsis: "In the land of Oz, ostracized and misunderstood green-skinned Elphaba is forced to share a room with the popular aristocrat Glinda at Shiz University, and the two's unlikely friendship is tested as they begin to fulfill their respective destinies as Glinda the Good and the Wicked Witch of the West.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/xDGbZ0JJ3mYaGKy4Nzd9Kph6M9L.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/w22GVYotTIVC1dUd58mRhwPqiS.jpg",
    manualEmbed: "cos:movie/402431",
    trailerEmbed: "https://www.youtube.com/watch?v=pqi45Qhq3CI",
    isSeries: false
  },
  {
    id: "Marty Supreme",
    imdbId: "tt32916440",
    title: "Marty Supreme",
    releaseDate: "2025-12-19",
    rating: 7.4,
    synopsis: "Marty Mauser, a young man with a dream no one respects, goes to hell and back in pursuit of greatness.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/lYWEXbQgRTR4ZQleSXAgRbxAjvq.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/6h7w8R4BA7vubEmEEW5vYEjuoz6.jpg",
    manualEmbed: "cos:movie/1317288",
    trailerEmbed: "https://www.youtube.com/watch?v=s9gSuKaKcqM",
    isSeries: false
  },
  {
    id: "Companion",
    imdbId: "tt26584495",
    title: "Companion",
    releaseDate: "2025-01-22",
    rating: 7,
    synopsis: "During a weekend getaway at a secluded lakeside estate, a group of friends finds themselves entangled in a web of secrets, deception, and advanced technology. As tensions rise and loyalties are tested, they uncover unsettling truths about themselves and the world around them.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/oCoTgC3UyWGfyQ9thE10ulWR7bn.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/sc1abgWNXc29wSBaerrjGBih06l.jpg",
    manualEmbed: "cos:movie/1084199",
    trailerEmbed: "https://www.youtube.com/watch?v=Qr_kX0D3DNA",
    isSeries: false
  },
  {
    id: "The Conjuring: Last Rites",
    imdbId: "tt22898462",
    title: "The Conjuring: Last Rites",
    releaseDate: "2025-09-03",
    rating: 6.9,
    synopsis: "Paranormal investigators Ed and Lorraine Warren take on one last terrifying case involving mysterious entities they must confront.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/byWgphT74ClOVa8EOGzYDkl8DVL.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/i8MupUe4xgmYXoRNAQMYvuoexSU.jpg",
    manualEmbed: "cos:movie/1038392",
    trailerEmbed: "https://www.youtube.com/watch?v=p4aWdkM5xF8",
    isSeries: false
  },
  {
    id: "Uncharted",
    imdbId: "tt1464335",
    title: "Uncharted",
    releaseDate: "2022-02-10",
    rating: 6.9,
    synopsis: "A young street-smart, Nathan Drake and his wisecracking partner Victor “Sully” Sullivan embark on a dangerous pursuit of “the greatest treasure never found” while also tracking clues that may lead to Nathan’s long-lost brother.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/rJHC1RUORuUhtfNb4Npclx0xnOf.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/fwrqW8Lp5VQuppFrODd4iJ8LySE.jpg",
    manualEmbed: "cos:movie/335787",
    trailerEmbed: "https://www.youtube.com/watch?v=l-LD16Yzi2c",
    isSeries: false
  },
  {
    id: "Black Bag",
    imdbId: "tt30988739",
    title: "Black Bag",
    releaseDate: "2025-03-12",
    rating: 6.4,
    synopsis: "When intelligence agent Kathryn Woodhouse is suspected of betraying the nation, her husband – also a legendary agent – faces the ultimate test of whether to be loyal to his marriage, or his country.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/hHPovtU4b96LHcoeEwRkGHI5btw.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/gxO51FVgADhYGGnnRPIlutVqb30.jpg",
    manualEmbed: "cos:movie/1233575",
    trailerEmbed: "https://www.youtube.com/watch?v=n_56L6WzLT8",
    isSeries: false
  },
  {
    id: "The Naked Gun",
    imdbId: "tt3402138",
    title: "The Naked Gun",
    releaseDate: "2025-07-30",
    rating: 6.3,
    synopsis: "Only one man has the particular set of skills... to lead Police Squad and save the world: Lt. Frank Drebin Jr. Following in his father's footsteps, he must solve a murder case to prevent Police Squad from closure.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/rwla9vqzrKVVKVKiOuROTIXGsxj.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/1wi1hcbl6KYqARjdQ4qrBWZdiau.jpg",
    manualEmbed: "cos:movie/1035259",
    trailerEmbed: "https://www.youtube.com/watch?v=uLguU7WLreA",
    isSeries: false
  },
  {
    id: "The Marvels",
    imdbId: "tt10676048",
    title: "The Marvels",
    releaseDate: "2023-11-08",
    rating: 5.9,
    synopsis: "When her duties send her to an anomalous wormhole linked to a Kree revolutionary, Carol's powers become entangled with that of Jersey City super-fan Kamala Khan, aka Ms. Marvel, and Carol's estranged niece, now S.A.B.E.R. astronaut Captain Monica Rambeau. Together, this unlikely trio must team up and learn to work in concert to save the universe.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/9GBhzXMFjgcZ3FdR9w3bUMMTps5.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/feSiISwgEpVzR1v3zv2n2AU4ANJ.jpg",
    manualEmbed: "cos:movie/609681",
    trailerEmbed: "https://www.youtube.com/watch?v=uwmDH12MAA4",
    isSeries: false
  },
  {
    id: "Insidious: The Red Door",
    imdbId: "tt13405778",
    title: "Insidious: The Red Door",
    releaseDate: "2023-07-05",
    rating: 6.5,
    synopsis: "To put their demons to rest once and for all, Josh Lambert and a college-aged Dalton Lambert must go deeper into The Further than ever before, facing their family's dark past and a host of new and more horrifying terrors that lurk behind the red door.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/d07phJqCx6z5wILDYqkyraorDPi.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/i2GVEvltEu3BXn5crBSxgKuTaca.jpg",
    manualEmbed: "cos:movie/614479",
    trailerEmbed: "https://www.youtube.com/watch?v=gexw4P68kbg",
    isSeries: false
  },
  {
    id: "Frankenstein",
    imdbId: "tt1312221",
    title: "Frankenstein",
    releaseDate: "2025-10-17",
    rating: 7.6,
    synopsis: "Dr. Victor Frankenstein, a brilliant but egotistical scientist, brings a creature to life in a monstrous experiment that ultimately leads to the undoing of both the creator and his tragic creation.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/g4JtvGlQO7DByTI6frUobqvSL3R.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/hpXBJxLD2SEf8l2CspmSeiHrBKX.jpg",
    manualEmbed: "cos:movie/1062722",
    trailerEmbed: "https://www.youtube.com/watch?v=9WZllcEgWrM",
    isSeries: false
  },
  {
    id: "Soul",
    imdbId: "tt2948372",
    title: "Soul",
    releaseDate: "2020-12-25",
    rating: 8.1,
    synopsis: "Joe Gardner is a middle school teacher with a love for jazz music. After a successful audition at the Half Note Club, he suddenly gets into an accident that separates his soul from his body and is transported to the You Seminar, a center in which souls develop and gain passions before being transported to a newborn child. Joe must enlist help from the other souls-in-training, like 22, a soul who has spent eons in the You Seminar, in order to get back to Earth.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/hm58Jw4Lw8OIeECIq5qyPYhAeRJ.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/rQaHA74pevnGsxcKGaoZVGWe9TC.jpg",
    manualEmbed: "cos:movie/508442",
    trailerEmbed: "https://www.youtube.com/watch?v=Gs--6c7Hn_A",
    isSeries: false
  },
  {
    id: "Anora",
    imdbId: "tt28607951",
    title: "Anora",
    releaseDate: "2024-10-14",
    rating: 7.1,
    synopsis: "A young sex worker from Brooklyn gets her chance at a Cinderella story when she meets and impulsively marries the son of an oligarch. Once the news reaches Russia, her fairytale is threatened as his parents set out to get the marriage annulled.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/cgXk2tNYhJZLXdBDO5DidAVzQ82.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/qvyOfwTC3qdbzkqdXWSSEMHtjBZ.jpg",
    manualEmbed: "cos:movie/1064213",
    trailerEmbed: "https://www.youtube.com/watch?v=8m6UrWMl18M",
    isSeries: false
  },
  {
    id: "Aquaman and the Lost Kingdom",
    imdbId: "tt9663764",
    title: "Aquaman and the Lost Kingdom",
    releaseDate: "2023-12-20",
    rating: 6.5,
    synopsis: "Black Manta seeks revenge on Aquaman for his father's death. Wielding the Black Trident's power, he becomes a formidable foe. To defend Atlantis, Arthur (Aquaman) forges an alliance with his imprisoned brother. They must protect the kingdom.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/7lTnXOy0iNtBAdRP3TZvaKJ77F6.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/bckxSN9ueOgm0gJpVJmPQrecWul.jpg",
    manualEmbed: "cos:movie/572802",
    trailerEmbed: "https://www.youtube.com/watch?v=4cSkHPW-MPE",
    isSeries: false
  },
  {
    id: "Barbarian",
    imdbId: "tt15791034",
    title: "Barbarian",
    releaseDate: "2022-08-29",
    rating: 6.9,
    synopsis: "In town for a job interview, a young woman arrives at her Airbnb late at night only to find that it has been mistakenly double-booked and a strange man is already staying there. Against her better judgement, she decides to stay the night anyway.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/idT5mnqPcJgSkvpDX7pJffBzdVH.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/kSeU4uk19t82k6Cao7hc6ktDYhF.jpg",
    manualEmbed: "cos:movie/913290",
    trailerEmbed: "https://www.youtube.com/watch?v=Dr89pmKrqkI",
    isSeries: false
  },
  {
    id: "Fantastic Beasts: The Secrets of Dumbledore",
    imdbId: "tt4123432",
    title: "Fantastic Beasts: The Secrets of Dumbledore",
    releaseDate: "2022-04-06",
    rating: 6.6,
    synopsis: "Professor Albus Dumbledore knows the powerful, dark wizard Gellert Grindelwald is moving to seize control of the wizarding world. Unable to stop him alone, he entrusts magizoologist Newt Scamander to lead an intrepid team of wizards and witches. They soon encounter an array of old and new beasts as they clash with Grindelwald's growing legion of followers.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/3c5GNLB4yRSLBby0trHoA1DSQxQ.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/zGLHX92Gk96O1DJvLil7ObJTbaL.jpg",
    manualEmbed: "cos:movie/338953",
    trailerEmbed: "https://www.youtube.com/watch?v=Fo6TfHkLW6Y",
    isSeries: false
  },
  {
    id: "X",
    imdbId: "tt13560574",
    title: "X",
    releaseDate: "2022-03-17",
    rating: 6.7,
    synopsis: "In 1979, a group of young filmmakers set out to make an adult film in rural Texas, but when their reclusive, elderly hosts catch them in the act, the cast find themselves fighting for their lives.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/lopZSVtXzhFY603E9OqF7O1YKsh.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/o375tDNib7tihlkWdtLW1fQhNL1.jpg",
    manualEmbed: "cos:movie/760104",
    trailerEmbed: "https://www.youtube.com/watch?v=Awg3cWuHfoc",
    isSeries: false
  },
  {
    id: "Free Guy",
    imdbId: "tt6264654",
    title: "Free Guy",
    releaseDate: "2021-08-11",
    rating: 7.4,
    synopsis: "A bank teller discovers he is actually a background player in an open-world video game, and decides to become the hero of his own story. Now, in a world where there are no limits, he is determined to be the guy who saves his world his way before it's too late.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/dxraF0qPr1OEgJk17ltQTO84kQF.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/rOJb0yQOCny0bPjg8bCLw8DyAD7.jpg",
    manualEmbed: "cos:movie/550988",
    trailerEmbed: "https://www.youtube.com/watch?v=cttnRmcr_ME",
    isSeries: false
  },
  {
    id: "Tenet",
    imdbId: "tt6723592",
    title: "Tenet",
    releaseDate: "2020-08-22",
    rating: 7.2,
    synopsis: "Armed with only one word - Tenet - and fighting for the survival of the entire world, the Protagonist journeys through a twilight world of international espionage on a mission that will unfold in something beyond real time.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/aCIFMriQh8rvhxpN1IWGgvH0Tlg.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/mQOUyqDybTqxl73hO5LujCZsM1o.jpg",
    manualEmbed: "cos:movie/577922",
    trailerEmbed: "https://www.youtube.com/watch?v=KJP5RunZUKk",
    isSeries: false
  },
  {
    id: "Poor Things",
    imdbId: "tt14230458",
    title: "Poor Things",
    releaseDate: "2023-12-07",
    rating: 7.6,
    synopsis: "Brought back to life by an unorthodox scientist, a young woman runs off with a lawyer on a whirlwind adventure across the continents. Free from the prejudices of her times, she grows steadfast in her purpose to stand for equality and liberation.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/zh6IdheEYinU4TPtorWsjx6qPQE.jpg",
    manualEmbed: "cos:movie/792307",
    trailerEmbed: "https://www.youtube.com/watch?v=-EfYJWRw2FM",
    isSeries: false
  },
  {
    id: "The Conjuring: The Devil Made Me Do It",
    imdbId: "tt7069210",
    title: "The Conjuring: The Devil Made Me Do It",
    releaseDate: "2021-05-25",
    rating: 7.3,
    synopsis: "Paranormal investigators Ed and Lorraine Warren encounter what would become one of the most sensational cases from their files. The fight for the soul of a young boy takes them beyond anything they'd ever seen before, to mark the first time in U.S. history that a murder suspect would claim demonic possession as a defense.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/xbSuFiJbbBWCkyCCKIMfuDCA4yV.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/p26c040MErns7DJYhisa1CpVB5i.jpg",
    manualEmbed: "cos:movie/423108",
    trailerEmbed: "https://www.youtube.com/watch?v=tLFnRAzcaEc",
    isSeries: false
  },
  {
    id: "The Little Mermaid",
    imdbId: "tt5971474",
    title: "The Little Mermaid",
    releaseDate: "2023-05-18",
    rating: 6.2,
    synopsis: "The youngest of King Triton’s daughters, and the most defiant, Ariel longs to find out more about the world beyond the sea, and while visiting the surface, falls for the dashing Prince Eric. With mermaids forbidden to interact with humans, Ariel makes a deal with the evil sea witch, Ursula, which gives her a chance to experience life on land, but ultimately places her life – and her father’s crown – in jeopardy.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/ym1dxyOk4jFcSl4Q2zmRrA5BEEN.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/pbMbDlOAkVuvnxovBA2ENin59xH.jpg",
    manualEmbed: "cos:movie/447277",
    trailerEmbed: "https://www.youtube.com/watch?v=kpGo2_d3oYE",
    isSeries: false
  },
  {
    id: "Sing 2",
    imdbId: "tt6467266",
    title: "Sing 2",
    releaseDate: "2021-12-01",
    rating: 7.8,
    synopsis: "Buster and his new cast now have their sights set on debuting a new show at the Crystal Tower Theater in glamorous Redshore City. But with no connections, he and his singers must sneak into the Crystal Entertainment offices, run by the ruthless wolf mogul Jimmy Crystal, where the gang pitches the ridiculous idea of casting the lion rock legend Clay Calloway in their show. Buster must embark on a quest to find the now-isolated Clay and persuade him to return to the stage.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/aWeKITRFbbwY8txG5uCj4rMCfSP.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/ztiFxuG0gC6wQ8y7JZFYbCQyN4Y.jpg",
    manualEmbed: "cos:movie/438695",
    trailerEmbed: "https://www.youtube.com/watch?v=EPZu5MA2uqI",
    isSeries: false
  },
  {
    id: "Five Nights at Freddy's",
    imdbId: "tt4589218",
    title: "Five Nights at Freddy's",
    releaseDate: "2023-10-25",
    rating: 7.3,
    synopsis: "Recently fired and desperate for work, a troubled young man named Mike agrees to take a position as a night security guard at an abandoned theme restaurant: Freddy Fazbear's Pizzeria. But he soon discovers that nothing at Freddy's is what it seems.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/7BpNtNfxuocYEVREzVMO75hso1l.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/7NRGAtu8E4343NSKwhkgmVRDINw.jpg",
    manualEmbed: "cos:movie/507089",
    trailerEmbed: "https://www.youtube.com/watch?v=X4d_v-HyR4o",
    isSeries: false
  },
  {
    id: "Nosferatu",
    imdbId: "tt5040012",
    title: "Nosferatu",
    releaseDate: "2024-12-25",
    rating: 6.7,
    synopsis: "A gothic tale of obsession between a haunted young woman and the terrifying vampire infatuated with her, causing untold horror in its wake.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/5qGIxdEO841C0tdY8vOdLoRVrr0.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/gprjiZWY43vxSKngMha1wfb5TGG.jpg",
    manualEmbed: "cos:movie/426063",
    trailerEmbed: "https://www.youtube.com/watch?v=nulvWqYUM8k",
    isSeries: false
  },
  {
    id: "Bad Boys: Ride or Die",
    imdbId: "tt4919268",
    title: "Bad Boys: Ride or Die",
    releaseDate: "2024-06-05",
    rating: 7.3,
    synopsis: "After their late former Captain is framed, Lowrey and Burnett try to clear his name, only to end up on the run themselves.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/oGythE98MYleE6mZlGs5oBGkux1.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/3q01ACG0MWm0DekhvkPFCXyPZSu.jpg",
    manualEmbed: "cos:movie/573435",
    trailerEmbed: "https://www.youtube.com/watch?v=uWLNl_KQCAU",
    isSeries: false
  },
  {
    id: "Bring Her Back",
    imdbId: "tt32246771",
    title: "Bring Her Back",
    releaseDate: "2025-05-19",
    rating: 7.3,
    synopsis: "Following the death of their father, a brother and sister are sent to live with a foster mother, only to learn that she is hiding a terrifying secret.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/1Q3GlCXGYWELifxANYZ5OVMRVZl.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/2IIKts2A9vnUdM9tTC76B8tDmuZ.jpg",
    manualEmbed: "cos:movie/1151031",
    trailerEmbed: "https://www.youtube.com/watch?v=1I15ttCedfY",
    isSeries: false
  },
  {
    id: "The Monkey",
    imdbId: "tt27714946",
    title: "The Monkey",
    releaseDate: "2025-02-10",
    rating: 6,
    synopsis: "When twin brothers find a mysterious wind-up monkey, a series of outrageous deaths tear their family apart. Twenty-five years later, the monkey begins a new killing spree forcing the estranged brothers to confront the cursed toy.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/aGDekyIb0yfmnuLZciCozRPk2TE.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/cjZ7No0DX2L3ielLSoUOMYPw7C.jpg",
    manualEmbed: "cos:movie/1124620",
    trailerEmbed: "https://www.youtube.com/watch?v=KPxmK_ihDO8",
    isSeries: false
  },
  {
    id: "Heads of State",
    imdbId: "tt13357520",
    title: "Heads of State",
    releaseDate: "2025-06-24",
    rating: 6.8,
    synopsis: "The UK Prime Minister and US President have a public rivalry that risks their countries' alliance. But when they become targets of a powerful enemy, they're forced to rely on each other as they go on a wild, multinational run. Allied with Noel, a brilliant MI6 agent, they must find a way to thwart a conspiracy that threatens the free world.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/lVgE5oLzf7ABmzyASEVcjYyHI41.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/vJbEUMeI2AxBUZKjP6ZVeVNNTLh.jpg",
    manualEmbed: "cos:movie/749170",
    trailerEmbed: "https://www.youtube.com/watch?v=f70LlXPC7VI",
    isSeries: false
  },
  {
    id: "Karate Kid: Legends",
    imdbId: "tt1674782",
    title: "Karate Kid: Legends",
    releaseDate: "2025-05-08",
    rating: 7,
    synopsis: "After a family tragedy, kung fu prodigy Li Fong is uprooted from his home in Beijing and forced to move to New York City with his mother. When a new friend needs his help, Li enters a karate competition – but his skills alone aren't enough. Li's kung fu teacher Mr. Han enlists original Karate Kid Daniel LaRusso for help, and Li learns a new way to fight, merging their two styles into one for the ultimate martial arts showdown.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/c90Lt7OQGsOmhv6x4JoFdoHzw5l.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/7Q2CmqIVJuDAESPPp76rWIiA0AD.jpg",
    manualEmbed: "cos:movie/1011477",
    trailerEmbed: "https://www.youtube.com/watch?v=LhRXf-yEQqA",
    isSeries: false
  },
  {
    id: "Encanto",
    imdbId: "tt2953050",
    title: "Encanto",
    releaseDate: "2021-10-13",
    rating: 7.6,
    synopsis: "The tale of an extraordinary family, the Madrigals, who live hidden in the mountains of Colombia, in a magical house, in a vibrant town, in a wondrous, charmed place called an Encanto. The magic of the Encanto has blessed every child in the family—every child except one, Mirabel. But when she discovers that the magic surrounding the Encanto is in danger, Mirabel decides that she, the only ordinary Madrigal, might just be her exceptional family's last hope.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/4j0PNHkMr5ax3IA8tjtxcmPU3QT.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/3G1Q5xF40HkUBJXxt2DQgQzKTp5.jpg",
    manualEmbed: "cos:movie/568124",
    trailerEmbed: "https://www.youtube.com/watch?v=CaimKeDcudo",
    isSeries: false
  },
  {
    id: "Trolls World Tour",
    imdbId: "tt6587640",
    title: "Trolls World Tour",
    releaseDate: "2020-03-11",
    rating: 7.2,
    synopsis: "Queen Poppy and Branch make a surprising discovery — there are other Troll worlds beyond their own, and their distinct differences create big clashes between these various tribes. When a mysterious threat puts all of the Trolls across the land in danger, Poppy, Branch, and their band of friends must embark on an epic quest to create harmony among the feuding Trolls to unite them against certain doom.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/7W0G3YECgDAfnuiHG91r8WqgIOe.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/qsxhnirlp7y4Ae9bd11oYJSX59j.jpg",
    manualEmbed: "cos:movie/446893",
    trailerEmbed: "https://www.youtube.com/watch?v=08AExF6dETA",
    isSeries: false
  },
  {
    id: "The Accountant²",
    imdbId: "tt7068946",
    title: "The Accountant²",
    releaseDate: "2025-04-23",
    rating: 7.1,
    synopsis: "When an old acquaintance is murdered, Wolff is compelled to solve the case. Realizing more extreme measures are necessary, Wolff recruits his estranged and highly lethal brother, Brax, to help. In partnership with Marybeth Medina, they uncover a deadly conspiracy, becoming targets of a ruthless network of killers who will stop at nothing to keep their secrets buried.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/lUvfTcOZiK0sdcX0WNLPbMyKjGm.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/yBDvgpyynDsbMyK21FoQu1c2wYR.jpg",
    manualEmbed: "cos:movie/870028",
    trailerEmbed: "https://www.youtube.com/watch?v=RwXDphhQ9Tg",
    isSeries: false
  },
  {
    id: "Nobody 2",
    imdbId: "tt28996126",
    title: "Nobody 2",
    releaseDate: "2025-08-13",
    rating: 6.9,
    synopsis: "Former assassin Hutch Mansell takes his family on a nostalgic vacation to a small-town theme park, only to be pulled back into violence when they clash with a corrupt operator, a crooked sheriff, and a ruthless crime boss.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/svXVRoRSu6zzFtCzkRsjZS7Lqpd.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/82C04rTiXYZ7c8XZv91Nu53w82Y.jpg",
    manualEmbed: "cos:movie/1007734",
    trailerEmbed: "https://www.youtube.com/watch?v=UGOvEad8qd4",
    isSeries: false
  },
  {
    id: "Death on the Nile",
    imdbId: "tt7657566",
    title: "Death on the Nile",
    releaseDate: "2022-02-09",
    rating: 6.4,
    synopsis: "Belgian sleuth Hercule Poirot's Egyptian vacation aboard a glamorous river steamer turns into a terrifying search for a murderer when a picture-perfect couple's idyllic honeymoon is tragically cut short.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/kVr5zIAFSPRQ57Y1zE7KzmhzdMQ.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/lRbDyjI7HEaXxflFQbYpqHRGFBJ.jpg",
    manualEmbed: "cos:movie/505026",
    trailerEmbed: "https://www.youtube.com/watch?v=dZRqB0JLizw",
    isSeries: false
  },
  {
    id: "The Creator",
    imdbId: "tt11858890",
    title: "The Creator",
    releaseDate: "2023-09-27",
    rating: 7,
    synopsis: "Amid a future war between the human race and the forces of artificial intelligence, a hardened ex-special forces agent grieving the disappearance of his wife, is recruited to hunt down and kill the Creator, the elusive architect of advanced AI who has developed a mysterious weapon with the power to end the war—and mankind itself.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/3dSivDtOuyxLDxPH4v2tcNG1fP7.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/kjQBrc00fB2RjHZB3PGR4w9ibpz.jpg",
    manualEmbed: "cos:movie/670292",
    trailerEmbed: "https://www.youtube.com/watch?v=MAZuGdi32bk",
    isSeries: false
  },
  {
    id: "Beetlejuice Beetlejuice",
    imdbId: "tt2049403",
    title: "Beetlejuice Beetlejuice",
    releaseDate: "2024-09-04",
    rating: 6.9,
    synopsis: "After a family tragedy, three generations of the Deetz family return home to Winter River. Still haunted by Betelgeuse, Lydia's life is turned upside down when her teenage daughter, Astrid, accidentally opens the portal to the Afterlife.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/kKgQzkUCnQmeTPkyIwHly2t6ZFI.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/kF8ljC7Y4p1UsmKBi2LxelZpqw.jpg",
    manualEmbed: "cos:movie/917496",
    trailerEmbed: "https://www.youtube.com/watch?v=xnbAxOEiMis",
    isSeries: false
  },
  {
    id: "Dungeons & Dragons: Honor Among Thieves",
    imdbId: "tt2906216",
    title: "Dungeons & Dragons: Honor Among Thieves",
    releaseDate: "2023-03-23",
    rating: 7.4,
    synopsis: "A charming thief and a band of unlikely adventurers undertake an epic heist to retrieve a lost relic, but things go dangerously awry when they run afoul of the wrong people.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/v7UF7ypAqjsFZFdjksjQ7IUpXdn.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/AdBXP8e6K3FYdDrMx3Wr6WZqCYF.jpg",
    manualEmbed: "cos:movie/493529",
    trailerEmbed: "https://www.youtube.com/watch?v=9LLOLEBlVIA",
    isSeries: false
  },
  {
    id: "Eternals",
    imdbId: "tt9032400",
    title: "Eternals",
    releaseDate: "2021-11-03",
    rating: 6.8,
    synopsis: "The Eternals are a team of ancient aliens who have been living on Earth in secret for thousands of years. When an unexpected tragedy forces them out of the shadows, they are forced to reunite against mankind’s most ancient enemy, the Deviants.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/lFByFSLV5WDJEv3KabbdAF959F2.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/c6H7Z4u73ir3cIoCteuhJh7UCAR.jpg",
    manualEmbed: "cos:movie/524434",
    trailerEmbed: "https://www.youtube.com/watch?v=x_me3xsvDgk",
    isSeries: false
  },
  {
    id: "Venom: Let There Be Carnage",
    imdbId: "tt7097896",
    title: "Venom: Let There Be Carnage",
    releaseDate: "2021-09-30",
    rating: 6.7,
    synopsis: "After finding a host body in investigative reporter Eddie Brock, the alien symbiote must face a new enemy, Carnage, the alter ego of serial killer Cletus Kasady.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/pzKsRuKLFmYrW5Q0q8E8G78Tcgo.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/eENEf62tMXbhyVvdcXlnQz2wcuT.jpg",
    manualEmbed: "cos:movie/580489",
    trailerEmbed: "https://www.youtube.com/watch?v=GVwq2HlKYpE",
    isSeries: false
  },
  {
    id: "Scream VI",
    imdbId: "tt17663992",
    title: "Scream VI",
    releaseDate: "2023-03-08",
    rating: 6.9,
    synopsis: "Following the latest Ghostface killings, the four survivors leave Woodsboro behind and start a fresh chapter.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/wDWwtvkRRlgTiUr6TyLSMX8FCuZ.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/k6ANeyxAfMRi5xhxIXv1Scn9vc2.jpg",
    manualEmbed: "cos:movie/934433",
    trailerEmbed: "https://www.youtube.com/watch?v=1Ie2qmAOc6Q",
    isSeries: false
  },
  {
    id: "Bad Boys for Life",
    imdbId: "tt1502397",
    title: "Bad Boys for Life",
    releaseDate: "2020-01-15",
    rating: 7.1,
    synopsis: "Marcus and Mike are forced to confront new threats, career changes, and midlife crises as they join the newly created elite team AMMO of the Miami police department to take down the ruthless Armando Armas, the vicious leader of a Miami drug cartel.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/y95lQLnuNKdPAzw9F9Ab8kJ80c3.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/eAIHqfS3kXm7kZl4j7ZBfdegyEz.jpg",
    manualEmbed: "cos:movie/38700",
    trailerEmbed: "https://www.youtube.com/watch?v=R228yPrwqTo",
    isSeries: false
  },
  {
    id: "Glass Onion: A Knives Out Mystery",
    imdbId: "tt11564570",
    title: "Glass Onion: A Knives Out Mystery",
    releaseDate: "2022-11-23",
    rating: 7,
    synopsis: "World-famous detective Benoit Blanc heads to Greece to peel back the layers of a mystery surrounding a tech billionaire and his eclectic crew of friends.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/vDGr1YdrlfbU9wxTOdpf3zChmv9.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/y3uOfZAYwLkbvhunswBCskNMrfI.jpg",
    manualEmbed: "cos:movie/661374",
    trailerEmbed: "https://www.youtube.com/watch?v=gj5ibYSz8C0",
    isSeries: false
  },
  {
    id: "The Nun II",
    imdbId: "tt10160976",
    title: "The Nun II",
    releaseDate: "2023-09-06",
    rating: 6.6,
    synopsis: "In 1956 France, a priest is violently murdered, and Sister Irene begins to investigate. She once again comes face-to-face with a powerful evil.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/5gzzkR7y3hnY8AD1wXjCnVlHba5.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/27jtaS1oCiLK5Y7P6iOXG2yj1Nc.jpg",
    manualEmbed: "cos:movie/968051",
    trailerEmbed: "https://www.youtube.com/watch?v=QF-oyCwaArU",
    isSeries: false
  },
  {
    id: "Subservience",
    imdbId: "tt24871974",
    title: "Subservience",
    releaseDate: "2024-08-15",
    rating: 6.6,
    synopsis: "With his wife out sick, a struggling father brings home a lifelike AI, only to have his self-aware new help want everything her new family has to offer... Like the affection of her owner and she'll kill to get it.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/gBenxR01Uy0Ev9RTIw6dVBPoyQU.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/co7oxvpWxgd6FZU24DnljDDHYQA.jpg",
    manualEmbed: "cos:movie/1064028",
    trailerEmbed: "https://www.youtube.com/watch?v=z6DLdqf0Bs0",
    isSeries: false
  },
  {
    id: "Nobody",
    imdbId: "tt7888964",
    title: "Nobody",
    releaseDate: "2021-03-18",
    rating: 7.9,
    synopsis: "Hutch Mansell, a suburban dad, overlooked husband, nothing neighbor — a \"nobody.\" When two thieves break into his home one night, Hutch's unknown long-simmering rage is ignited and propels him on a brutal path that will uncover dark secrets he fought to leave behind.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/oBgWY00bEFeZ9N25wWVyuQddbAo.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/61MrK5U4w4MVL1vfwoG12zYPJ8B.jpg",
    manualEmbed: "cos:movie/615457",
    trailerEmbed: "https://www.youtube.com/watch?v=wZti8QKBWPo",
    isSeries: false
  },
  {
    id: "The Idea of You",
    imdbId: "tt9466114",
    title: "The Idea of You",
    releaseDate: "2024-05-02",
    rating: 7.2,
    synopsis: "40-year-old single mom Solène begins an unexpected romance with 24-year-old Hayes Campbell, the lead singer of August Moon, the hottest boy band on the planet. As they begin a whirlwind romance, it isn't long before Hayes' superstar status poses unavoidable challenges to their relationship, and Solène soon discovers that life in the glare of his spotlight might be more than she bargained for.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/Y5P4Q3q8nrruZ9aD3wXeJS2Plg.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/sI6uCeF8mUlZx22mFfHSi9W3XQ9.jpg",
    manualEmbed: "cos:movie/843527",
    trailerEmbed: "https://www.youtube.com/watch?v=pz6qx4n2Ewc",
    isSeries: false
  },
  {
    id: "Elemental",
    imdbId: "tt15789038",
    title: "Elemental",
    releaseDate: "2023-06-14",
    rating: 7.6,
    synopsis: "In a city where fire, water, land and air residents live together, a fiery young woman and a go-with-the-flow guy will discover something elemental: how much they have in common.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/4Y1WNkd88JXmGfhtWR7dmDAo1T2.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/4fLZUr1e65hKPPVw0R3PmKFKxj1.jpg",
    manualEmbed: "cos:movie/976573",
    trailerEmbed: "https://www.youtube.com/watch?v=hXzcyx9V0xw",
    isSeries: false
  },
  {
    id: "Challengers",
    imdbId: "tt16426418",
    title: "Challengers",
    releaseDate: "2024-04-18",
    rating: 6.9,
    synopsis: "Tennis player turned coach Tashi has taken her husband, Art, and transformed him into a world-famous Major champion. To jolt him out of his recent losing streak, she signs him up for a \"Challenger\" event — close to the lowest level of pro tournament — where he finds himself standing across the net from his former best friend and Tashi's former boyfriend.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/H6vke7zGiuLsz4v4RPeReb9rsv.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/tq8COKsI99Bivjd4CZIYVGoKcIx.jpg",
    manualEmbed: "cos:movie/937287",
    trailerEmbed: "https://www.youtube.com/watch?v=-2N3hmRmwHQ",
    isSeries: false
  },
  {
    id: "Don't Look Up",
    imdbId: "tt11286314",
    title: "Don't Look Up",
    releaseDate: "2021-12-08",
    rating: 7.1,
    synopsis: "Two astronomers go on a media tour to warn humankind of a planet-killing comet hurtling toward Earth. The response from a distracted world: Meh.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/th4E1yqsE8DGpAseLiUrI60Hf8V.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/nvxrQQspxmSblCYDtvDAbVFX8Jt.jpg",
    manualEmbed: "cos:movie/646380",
    trailerEmbed: "https://www.youtube.com/watch?v=RbIxYm3mKzI",
    isSeries: false
  },
  {
    id: "Aftersun",
    imdbId: "tt19770238",
    title: "Aftersun",
    releaseDate: "2022-10-21",
    rating: 7.6,
    synopsis: "Sophie reflects on the shared joy and private melancholy of a holiday she took with her father twenty years earlier. Memories fill the gaps between camcorder footages as she tries to reconcile the father she knew with the troubled man she didn't.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/evKz85EKouVbIr51zy5fOtpNRPg.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/4jdduww9j5RyzO4ITRcuBFhqNN1.jpg",
    manualEmbed: "cos:movie/965150",
    trailerEmbed: "https://www.youtube.com/watch?v=4A34B1DIGl8",
    isSeries: false
  },
  {
    id: "The King's Man",
    imdbId: "tt6856242",
    title: "The King's Man",
    releaseDate: "2021-12-22",
    rating: 6.7,
    synopsis: "As a collection of history's worst tyrants and criminal masterminds gather to plot a war to wipe out millions, one man must race against time to stop them.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/iMjSfMUuCkCE7z5fzGtjeDusPD3.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/oQPbZ5e6J9fuAyv4Gl0mMZMIyPI.jpg",
    manualEmbed: "cos:movie/476669",
    trailerEmbed: "https://www.youtube.com/watch?v=_0vKejp3rvA",
    isSeries: false
  },
  {
    id: "The Long Walk",
    imdbId: "tt10374610",
    title: "The Long Walk",
    releaseDate: "2025-09-10",
    rating: 6.9,
    synopsis: "In a dystopian 1970s America, fifty teenage boys take part in a deadly annual walking contest, forced to maintain a minimum pace or be executed, until only one survivor remains.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/wobVTa99eW0ht6c1rNNzLkazPtR.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/2dlt9I2ga6hweywz9zsFUz1PVii.jpg",
    manualEmbed: "cos:movie/604079",
    trailerEmbed: "https://www.youtube.com/watch?v=Toj3Zxun7aQ",
    isSeries: false
  },
  {
    id: "Anyone but You",
    imdbId: "tt26047818",
    title: "Anyone but You",
    releaseDate: "2023-12-21",
    rating: 6.7,
    synopsis: "After an amazing first date, Bea and Ben’s fiery attraction turns ice cold — until they find themselves unexpectedly reunited at a destination wedding in Australia. So they do what any two mature adults would do: pretend to be a couple.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/5qHoazZiaLe7oFBok7XlUhg96f2.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/j9eOeLlTGoHoM8BNUJVNyWmIvCi.jpg",
    manualEmbed: "cos:movie/1072790",
    trailerEmbed: "https://www.youtube.com/watch?v=biOxRfgF8Rs",
    isSeries: false
  },
  {
    id: "Smile",
    imdbId: "tt15474916",
    title: "Smile",
    releaseDate: "2022-09-23",
    rating: 6.7,
    synopsis: "After witnessing a bizarre, traumatic incident involving a patient, Dr. Rose Cotter starts experiencing frightening occurrences that she can't explain.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/aPqcQwu4VGEewPhagWNncDbJ9Xp.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/kMZIMqEXO5MFd5Y1Ha2jZZF4pvF.jpg",
    manualEmbed: "cos:movie/882598",
    trailerEmbed: "https://www.youtube.com/watch?v=-8d987Wtkxs",
    isSeries: false
  },
  {
    id: "Wake Up Dead Man: A Knives Out Mystery",
    imdbId: "tt14364480",
    title: "Wake Up Dead Man: A Knives Out Mystery",
    releaseDate: "2025-11-26",
    rating: 7.2,
    synopsis: "When young priest Jud Duplenticy is sent to assist charismatic firebrand Monsignor Jefferson Wicks, it’s clear that all is not well in the pews. After a sudden and seemingly impossible murder rocks the town, the lack of an obvious suspect prompts local police chief Geraldine Scott to join forces with renowned detective Benoit Blanc to unravel a mystery that defies all logic.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/iV9LM8aUb83BjCCx2RUnKE5sSQg.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/fiRDzpcJe7qz3yIR43hdXIE3NHv.jpg",
    manualEmbed: "cos:movie/812583",
    trailerEmbed: "https://www.youtube.com/watch?v=0hc8yz5-d5Y",
    isSeries: false
  },
  {
    id: "The Northman",
    imdbId: "tt11138512",
    title: "The Northman",
    releaseDate: "2022-04-07",
    rating: 7,
    synopsis: "Prince Amleth is on the verge of becoming a man when his father is brutally murdered by his uncle, who kidnaps the boy's mother. Two decades later, Amleth is now a Viking who's on a mission to save his mother, kill his uncle and avenge his father.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/aSSJMnHknzKjlZ6zybwD7eyJ4Po.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/qZYvF1M7y8Gfp4S6OBHbYfB0Lgc.jpg",
    manualEmbed: "cos:movie/639933",
    trailerEmbed: "https://www.youtube.com/watch?v=6WrpvCmv0hk",
    isSeries: false
  },
  {
    id: "Guy Ritchie's The Covenant",
    imdbId: "tt4873118",
    title: "Guy Ritchie's The Covenant",
    releaseDate: "2023-04-19",
    rating: 7.7,
    synopsis: "After an ambush, Afghan interpreter Ahmed goes to Herculean lengths to save US Army Sergeant John Kinley's life. When Kinley learns that Ahmed and his family were not given safe passage to America as promised, he must return to the war zone and repay his debt.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/kVG8zFFYrpyYLoHChuEeOGAd6Ru.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/eTvN54pd83TrSEOz6wbsXEJktCV.jpg",
    manualEmbed: "cos:movie/882569",
    trailerEmbed: "https://www.youtube.com/watch?v=02PPMPArNEQ",
    isSeries: false
  },
  {
    id: "Minions: The Rise of Gru",
    imdbId: "tt5113044",
    title: "Minions: The Rise of Gru",
    releaseDate: "2022-06-29",
    rating: 7.3,
    synopsis: "A fanboy of a supervillain supergroup known as the Vicious 6, Gru hatches a plan to become evil enough to join them, with the backup of his followers, the Minions.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/wKiOkZTN9lUUUNZLmtnwubZYONg.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/wZS4xSfPtk1NPQnx9zsT5R2WhCu.jpg",
    manualEmbed: "cos:movie/438148",
    trailerEmbed: "https://www.youtube.com/watch?v=HhIl_XJ-OGA",
    isSeries: false
  },
  {
    id: "Red, White & Royal Blue",
    imdbId: "tt10172266",
    title: "Red, White & Royal Blue",
    releaseDate: "2023-07-27",
    rating: 7.9,
    synopsis: "After an altercation between Alex, the president's son, and Britain's Prince Henry at a royal event becomes tabloid fodder, their long-running feud now threatens to drive a wedge in U.S./British relations. When the rivals are forced into a staged truce, their icy relationship begins to thaw and the friction between them sparks something deeper than they ever expected.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/dD3vhyDRCCT90hf4rldHU6Wu3Va.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/qrnwOY3hpu3oVUUYKRgWJxTtMQ3.jpg",
    manualEmbed: "cos:movie/930094",
    trailerEmbed: "https://www.youtube.com/watch?v=pt56IC8gDZ4",
    isSeries: false
  },
  {
    id: "Elio",
    imdbId: "tt4900148",
    title: "Elio",
    releaseDate: "2025-06-18",
    rating: 6.9,
    synopsis: "Elio, a space fanatic with an active imagination, finds himself on a cosmic misadventure where he must form new bonds with eccentric alien lifeforms, navigate a crisis of intergalactic proportions and somehow discover who he is truly meant to be.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/7z8jDiTZZco9moIKpTUImFtTy7o.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/ukPu5xYOBAnh5H46uK4aQOirW2b.jpg",
    manualEmbed: "cos:movie/1022787",
    trailerEmbed: "https://www.youtube.com/watch?v=yH5zbV7eweM",
    isSeries: false
  },
  {
    id: "TRON: Ares",
    imdbId: "tt6604188",
    title: "TRON: Ares",
    releaseDate: "2025-10-08",
    rating: 6.5,
    synopsis: "A highly sophisticated Program called Ares is sent from the digital world into the real world on a dangerous mission, marking humankind's first encounter with A.I. beings.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/chpWmskl3aKm1aTZqUHRCtviwPy.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/pUNfHmVqfwRdILhCkU8TdysVOXo.jpg",
    manualEmbed: "cos:movie/533533",
    trailerEmbed: "https://www.youtube.com/watch?v=gNa0j4mQo1k",
    isSeries: false
  },
  {
    id: "Prey",
    imdbId: "tt11866324",
    title: "Prey",
    releaseDate: "2022-08-05",
    rating: 7.6,
    synopsis: "When danger threatens her camp, the fierce and highly skilled Comanche warrior Naru sets out to protect her people. But the prey she stalks turns out to be a highly evolved alien predator with a technically advanced arsenal.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/2FKjLRt7oK1bRRIrxgWmthbBdFh.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/7ZO9yoEU2fAHKhmJWfAc2QIPWJg.jpg",
    manualEmbed: "cos:movie/766507",
    trailerEmbed: "https://www.youtube.com/watch?v=wZ7LytagKlc",
    isSeries: false
  },
  {
    id: "The Mitchells vs. the Machines",
    imdbId: "tt7979580",
    title: "The Mitchells vs. the Machines",
    releaseDate: "2021-04-22",
    rating: 7.8,
    synopsis: "A quirky, dysfunctional family's road trip is upended when they find themselves in the middle of the robot apocalypse and suddenly become humanity's unlikeliest last hope.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/mI2Di7HmskQQ34kz0iau6J1vr70.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/vsZLf5uog08pAnfsMuDWrsLWUUF.jpg",
    manualEmbed: "cos:movie/501929",
    trailerEmbed: "https://www.youtube.com/watch?v=_ak5dFt8Ar0",
    isSeries: false
  },
  {
    id: "Ghostbusters: Afterlife",
    imdbId: "tt4513678",
    title: "Ghostbusters: Afterlife",
    releaseDate: "2021-11-18",
    rating: 7.3,
    synopsis: "When single mom Callie and her two kids Trevor and Phoebe arrive in a small Oklahoma town, they begin to discover their connection to the original Ghostbusters and the secret legacy their grandfather left behind.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/sg4xJaufDiQl7caFEskBtQXfD4x.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/EnDlndEvw6Ptpp8HIwmRcSSNKQ.jpg",
    manualEmbed: "cos:movie/425909",
    trailerEmbed: "https://www.youtube.com/watch?v=G_ua10EMbSg",
    isSeries: false
  },
  {
    id: "Extraction 2",
    imdbId: "tt12263384",
    title: "Extraction 2",
    releaseDate: "2023-06-09",
    rating: 7.4,
    synopsis: "Back from the brink of death, highly skilled commando Tyler Rake takes on another dangerous mission: saving the imprisoned family of a ruthless gangster.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/7gKI9hpEMcZUQpNgKrkDzJpbnNS.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/wRxLAw4l17LqiFcPLkobriPTZAw.jpg",
    manualEmbed: "cos:movie/697843",
    trailerEmbed: "https://www.youtube.com/watch?v=Y274jZs5s7s",
    isSeries: false
  },
  {
    id: "Birds of Prey (and the Fantabulous Emancipation of One Harley Quinn)",
    imdbId: "tt7713068",
    title: "Birds of Prey (and the Fantabulous Emancipation of One Harley Quinn)",
    releaseDate: "2020-02-05",
    rating: 6.9,
    synopsis: "Harley Quinn joins forces with a singer, an assassin and a police detective to help a young girl who had a hit placed on her after she stole a rare diamond from a crime lord.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/h4VB6m0RwcicVEZvzftYZyKXs6K.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/3zBjU7mXlzxJKAStRzlNDZRGT0m.jpg",
    manualEmbed: "cos:movie/495764",
    trailerEmbed: "https://www.youtube.com/watch?v=q2u2raiIlm0",
    isSeries: false
  },
  {
    id: "Freakier Friday",
    imdbId: "tt31956415",
    title: "Freakier Friday",
    releaseDate: "2025-08-06",
    rating: 6.7,
    synopsis: "Years after Tess and Anna endured an identity crisis, Anna now has a daughter of her own and a soon-to-be stepdaughter. As they navigate the myriad challenges that come when two families merge, Tess and Anna discover lightning might indeed strike twice.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/9wV65OmsjLAqBfDnYTkMPutXH8j.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/yQy9Y3p5INwkfTuHSnzYnz4MCV3.jpg",
    manualEmbed: "cos:movie/1125257",
    trailerEmbed: "https://www.youtube.com/watch?v=IyJzhtJEtoU",
    isSeries: false
  },
  {
    id: "Joker: Folie à Deux",
    imdbId: "tt11315808",
    title: "Joker: Folie à Deux",
    releaseDate: "2024-10-01",
    rating: 5.4,
    synopsis: "While struggling with his dual identity, Arthur Fleck not only stumbles upon true love, but also finds the music that's always been inside him.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/if8QiqCI7WAGImKcJCfzp6VTyKA.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/AVWlQpVhpudyFsSh3OQIieHHYf.jpg",
    manualEmbed: "cos:movie/889737",
    trailerEmbed: "https://www.youtube.com/watch?v=fiqqAI0e4Nc",
    isSeries: false
  },
  {
    id: "Sonic the Hedgehog 2",
    imdbId: "tt12412888",
    title: "Sonic the Hedgehog 2",
    releaseDate: "2022-03-30",
    rating: 7.4,
    synopsis: "After settling in Green Hills, Sonic is eager to prove he has what it takes to be a true hero. His test comes when Dr. Robotnik returns, this time with a new partner, Knuckles, in search for an emerald that has the power to destroy civilizations. Sonic teams up with his own sidekick, Tails, and together they embark on a globe-trotting journey to find the emerald before it falls into the wrong hands.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6DrHO1jr3qVrViUO6s6kFiAGM7.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/xuLA0pii2IMJW2puT7EvJtgpg0H.jpg",
    manualEmbed: "cos:movie/675353",
    trailerEmbed: "https://www.youtube.com/watch?v=47r8FXYZWNU",
    isSeries: false
  },
  {
    id: "It Ends with Us",
    imdbId: "tt10655524",
    title: "It Ends with Us",
    releaseDate: "2024-08-07",
    rating: 7,
    synopsis: "When a woman's first love suddenly reenters her life, her relationship with a charming, but abusive neurosurgeon is upended, and she realizes she must learn to rely on her own strength to make an impossible choice for her future.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/AjV6jFJ2YFIluYo4GQf13AA1tqu.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/8yPSYhooj8nyBbmV3GVdLDwuE7e.jpg",
    manualEmbed: "cos:movie/1079091",
    trailerEmbed: "https://www.youtube.com/watch?v=r-GQvSc5ZGw",
    isSeries: false
  },
  {
    id: "Terrifier 3",
    imdbId: "tt27911000",
    title: "Terrifier 3",
    releaseDate: "2024-10-09",
    rating: 6.8,
    synopsis: "Five years after surviving Art the Clown's Halloween massacre, Sienna and Jonathan are still struggling to rebuild their shattered lives. As the holiday season approaches, they try to embrace the Christmas spirit and leave the horrors of the past behind. But just when they think they're safe, Art returns, determined to turn their holiday cheer into a new nightmare. The festive season quickly unravels as Art unleashes his twisted brand of terror, proving that no holiday is safe.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/ju10W5gl3PPK3b7TjEmVOZap51I.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/bHfGHipZ32Oec94FDJO4mWs3aZ5.jpg",
    manualEmbed: "cos:movie/1034541",
    trailerEmbed: "https://www.youtube.com/watch?v=0EDDtgWnSeY",
    isSeries: false
  },
  {
    id: "Black Phone 2",
    imdbId: "tt29644189",
    title: "Black Phone 2",
    releaseDate: "2025-10-15",
    rating: 6.6,
    synopsis: "Four years after defeating The Grabber, Finney Blake is struggling with life after captivity. When his younger sister Gwen begins receiving calls in her dreams from the Black Phone and seeing disturbing visions of three boys being stalked at a winter camp, the siblings become determined to solve the mystery and confront a killer who has grown more powerful in death and more significant to them than either could imagine.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/vBOpqxW0SDhACwEO2LZT29DuNG2.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/6zKjoOOb3OZnZuiHtQZn4Kd69Gq.jpg",
    manualEmbed: "cos:movie/1197137",
    trailerEmbed: "https://www.youtube.com/watch?v=pWNucAcRoBY",
    isSeries: false
  },
  {
    id: "Indiana Jones and the Dial of Destiny",
    imdbId: "tt1462764",
    title: "Indiana Jones and the Dial of Destiny",
    releaseDate: "2023-06-25",
    rating: 6.5,
    synopsis: "Finding himself in a new era, and approaching retirement, Indy wrestles with fitting into a world that seems to have outgrown him. But as the tentacles of an all-too-familiar evil return in the form of an old rival, Indy must don his hat and pick up his whip once more to make sure an ancient and powerful artifact doesn't fall into the wrong hands.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/Af4bXE63pVsb2FtbW8uYIyPBadD.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/57JocxmicOoAMhkUSmdKBlpZWMT.jpg",
    manualEmbed: "cos:movie/335977",
    trailerEmbed: "https://www.youtube.com/watch?v=eQfMbSe7F2g",
    isSeries: false
  },
  {
    id: "Godzilla vs. Kong",
    imdbId: "tt5034838",
    title: "Godzilla vs. Kong",
    releaseDate: "2021-03-24",
    rating: 7.5,
    synopsis: "In a time when monsters walk the Earth, humanity’s fight for its future sets Godzilla and Kong on a collision course that will see the two most powerful forces of nature on the planet collide in a spectacular battle for the ages.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/pgqgaUx1cJb5oZQQ5v0tNARCeBp.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/wWqTMWkEw6HouLd1zPZbZWxtAPr.jpg",
    manualEmbed: "cos:movie/399566",
    trailerEmbed: "https://www.youtube.com/watch?v=odM92ap8_c0",
    isSeries: false
  },
  {
    id: "Past Lives",
    imdbId: "tt13238346",
    title: "Past Lives",
    releaseDate: "2023-06-02",
    rating: 7.7,
    synopsis: "After decades apart, childhood friends Nora and Hae Sung are reunited in New York for one fateful weekend as they confront notions of destiny, love, and the choices that make a life.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/7HR38hMBl23lf38MAN63y4pKsHz.jpg",
    manualEmbed: "cos:movie/666277",
    trailerEmbed: "https://www.youtube.com/watch?v=kA244xewjcI",
    isSeries: false
  },
  {
    id: "Cruella",
    imdbId: "tt3228774",
    title: "Cruella",
    releaseDate: "2021-05-26",
    rating: 8,
    synopsis: "In 1970s London amidst the punk rock revolution, a young grifter named Estella is determined to make a name for herself with her designs. She befriends a pair of young thieves who appreciate her appetite for mischief, and together they are able to build a life for themselves on the London streets. One day, Estella’s flair for fashion catches the eye of the Baroness von Hellman, a fashion legend who is devastatingly chic and terrifyingly haute. But their relationship sets in motion a course of events and revelations that will cause Estella to embrace her wicked side and become the raucous, fashionable and revenge-bent Cruella.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/hjS9mH8KvRiGHgjk6VUZH7OT0Ng.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/6MKr3KgOLmzOP6MSuZERO41Lpkt.jpg",
    manualEmbed: "cos:movie/337404",
    trailerEmbed: "https://www.youtube.com/watch?v=jpZrVxvG3mk",
    isSeries: false
  },
  {
    id: "A Quiet Place Part II",
    imdbId: "tt8332922",
    title: "A Quiet Place Part II",
    releaseDate: "2021-05-21",
    rating: 7.4,
    synopsis: "Following the events at home, the Abbott family now face the terrors of the outside world. Forced to venture into the unknown, they realize that the creatures that hunt by sound are not the only threats that lurk beyond the sand path.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/4q2hz2m8hubgvijz8Ez0T2Os2Yv.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/uuBYYlbfiYD7ny5VNj46NG14ykR.jpg",
    manualEmbed: "cos:movie/520763",
    trailerEmbed: "https://www.youtube.com/watch?v=BpdDN9d9Jio",
    isSeries: false
  },
  {
    id: "The Garfield Movie",
    imdbId: "tt5779228",
    title: "The Garfield Movie",
    releaseDate: "2024-04-30",
    rating: 6.9,
    synopsis: "Garfield, the world-famous, Monday-hating, lasagna-loving indoor cat, is about to have a wild outdoor adventure! After an unexpected reunion with his long-lost father – scruffy street cat Vic – Garfield and his canine friend Odie are forced from their perfectly pampered life into joining Vic in a hilarious, high-stakes heist.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/p6AbOJvMQhBmffd0PIv0u8ghWeY.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/P82NAcEsLIYgQtrtn36tYsj41m.jpg",
    manualEmbed: "cos:movie/748783",
    trailerEmbed: "https://www.youtube.com/watch?v=yk2Ej59DnrE",
    isSeries: false
  },
  {
    id: "Bugonia",
    imdbId: "tt12300742",
    title: "Bugonia",
    releaseDate: "2025-10-23",
    rating: 7.3,
    synopsis: "Two conspiracy obsessed young men kidnap the high-powered CEO of a major company, convinced that she is an alien intent on destroying planet Earth.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/rSdOua3wKMEaFWDcKAYWRjXQWOt.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/tN3pTxkQoP96wtaEahYuRVdUWb2.jpg",
    manualEmbed: "cos:movie/701387",
    trailerEmbed: "https://www.youtube.com/watch?v=7VBigr-JHB0",
    isSeries: false
  },
  {
    id: "Talk to Me",
    imdbId: "tt10638522",
    title: "Talk to Me",
    releaseDate: "2023-07-26",
    rating: 7.1,
    synopsis: "When a group of friends discover how to conjure spirits using an embalmed hand, they become hooked on the new thrill, until one of them goes too far and unleashes terrifying supernatural forces.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/kdPMUMJzyYAc4roD52qavX0nLIC.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/46Os8U0DEPmI0OnvKDxucl6SLVZ.jpg",
    manualEmbed: "cos:movie/1008042",
    trailerEmbed: "https://www.youtube.com/watch?v=PGo4wfCejsk",
    isSeries: false
  },
  {
    id: "Space Jam: A New Legacy",
    imdbId: "tt3554046",
    title: "Space Jam: A New Legacy",
    releaseDate: "2021-07-08",
    rating: 6.6,
    synopsis: "When LeBron and his young son Dom are trapped in a digital space by a rogue A.I., LeBron must get them home safe by leading Bugs, Lola Bunny and the whole gang of notoriously undisciplined Looney Tunes to victory over the A.I.'s digitized champions on the court. It's Tunes versus Goons in the highest-stakes challenge of his life.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/5bFK5d3mVTAvBCXi5NPWH0tYjKl.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/8s4h9friP6Ci3adRGahHARVd76E.jpg",
    manualEmbed: "cos:movie/379686",
    trailerEmbed: "https://www.youtube.com/watch?v=RCsEKvz2mxs",
    isSeries: false
  },
  {
    id: "The Croods: A New Age",
    imdbId: "tt2850386",
    title: "The Croods: A New Age",
    releaseDate: "2020-11-25",
    rating: 7.4,
    synopsis: "Searching for a safer habitat, the prehistoric Crood family discovers an idyllic, walled-in paradise that meets all of its needs. Unfortunately, they must also learn to live with the Bettermans -- a family that's a couple of steps above the Croods on the evolutionary ladder. As tensions between the new neighbors start to rise, a new threat soon propels both clans on an epic adventure that forces them to embrace their differences, draw strength from one another, and survive together.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/tbVZ3Sq88dZaCANlUcewQuHQOaE.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/ytTQoYkdpsgtfDWrNFCei8Mfbxu.jpg",
    manualEmbed: "cos:movie/529203",
    trailerEmbed: "https://www.youtube.com/watch?v=hy4vAqF9Ko0",
    isSeries: false
  },
  {
    id: "Speak No Evil",
    imdbId: "tt27534307",
    title: "Speak No Evil",
    releaseDate: "2024-09-11",
    rating: 7.1,
    synopsis: "When an American family is invited to spend the weekend at the idyllic country estate of a charming British family they befriended on vacation, what begins as a dream holiday soon warps into a snarled psychological nightmare.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/dA4N6uWOnEMgbxXwFX7qX7adzs8.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/1fL2S8LKxCVE9KoPRBXeagmBtex.jpg",
    manualEmbed: "cos:movie/1114513",
    trailerEmbed: "https://www.youtube.com/watch?v=iSIuxrjTMk0",
    isSeries: false
  },
  {
    id: "No Hard Feelings",
    imdbId: "tt15671028",
    title: "No Hard Feelings",
    releaseDate: "2023-06-15",
    rating: 6.7,
    synopsis: "On the brink of losing her childhood home, Maddie discovers an intriguing job listing: wealthy helicopter parents looking for someone to “date” their introverted 19-year-old son, Percy, before he leaves for college. To her surprise, Maddie soon discovers the awkward Percy is no sure thing.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/gD72DhJ7NbfxvtxGiAzLaa0xaoj.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/rRcNmiH55Tz0ugUsDUGmj8Bsa4V.jpg",
    manualEmbed: "cos:movie/884605",
    trailerEmbed: "https://www.youtube.com/watch?v=7psP7xBEa28",
    isSeries: false
  },
  {
    id: "Anaconda",
    imdbId: "tt33244668",
    title: "Anaconda",
    releaseDate: "2025-12-24",
    rating: 5.8,
    synopsis: "A group of friends facing mid-life crises head to the rainforest with the intention of remaking their favorite movie from their youth, only to find themselves in a fight for their lives against natural disasters, giant snakes and violent criminals.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/hBxN6dwrANN1ic3a4G9x6JZcR3C.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/swxhEJsAWms6X1fDZ4HdbvYBSf9.jpg",
    manualEmbed: "cos:movie/1234731",
    trailerEmbed: "https://www.youtube.com/watch?v=LFLyvzIZjK4",
    isSeries: false
  },
  {
    id: "Trap",
    imdbId: "tt26753003",
    title: "Trap",
    releaseDate: "2024-07-31",
    rating: 6.2,
    synopsis: "A father and teen daughter attend a pop concert, where they realize they're at the center of a dark and sinister event.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/jwoaKYVqPgYemFpaANL941EF94R.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/dCgrFY6uTqhEpyhe8MzP1oExyLt.jpg",
    manualEmbed: "cos:movie/1032823",
    trailerEmbed: "https://www.youtube.com/watch?v=mps1HbpECIA",
    isSeries: false
  },
  {
    id: "Caught Stealing",
    imdbId: "tt1493274",
    title: "Caught Stealing",
    releaseDate: "2025-08-26",
    rating: 6.8,
    synopsis: "Burned-out ex-baseball player Hank Thompson unexpectedly finds himself embroiled in a dangerous struggle for survival amidst the criminal underbelly of late 1990s New York City, forced to navigate a treacherous underworld he never imagined.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/cvda8s5J8YaHjTyEyXQpvD6f3iV.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/41043LV7mfluH8iXEUPVseCDAv5.jpg",
    manualEmbed: "cos:movie/1245993",
    trailerEmbed: "https://www.youtube.com/watch?v=6mIvD-GN-p4",
    isSeries: false
  },
  {
    id: "The Voyeurs",
    imdbId: "tt11235772",
    title: "The Voyeurs",
    releaseDate: "2021-08-25",
    rating: 6.5,
    synopsis: "When Pippa and Thomas move into their dream apartment, they notice that their windows look directly into the apartment opposite – inviting them to witness the volatile relationship of the attractive couple across the street. But what starts as a simple curiosity turns into full-blown obsession with increasingly dangerous consequences.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/8Y4XOIWhpOvSOEn8XrxbkH9yAXO.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/5KGrBXvE0cYDwqfEaymvNBVspkJ.jpg",
    manualEmbed: "cos:movie/645710",
    trailerEmbed: "https://www.youtube.com/watch?v=_fiCdELSwwI",
    isSeries: false
  },
  {
    id: "The Whale",
    imdbId: "tt13833688",
    title: "The Whale",
    releaseDate: "2022-12-09",
    rating: 7.8,
    synopsis: "A reclusive English teacher suffering from severe obesity attempts to reconnect with his estranged teenage daughter for one last chance at redemption.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/jQ0gylJMxWSL490sy0RrPj1Lj7e.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/46FRuCeAn6TrS4F1P4F9zhyCpyo.jpg",
    manualEmbed: "cos:movie/785084",
    trailerEmbed: "https://www.youtube.com/watch?v=nWiQodhMvz4",
    isSeries: false
  },
  {
    id: "After We Fell",
    imdbId: "tt13069986",
    title: "After We Fell",
    releaseDate: "2021-09-01",
    rating: 7,
    synopsis: "Just as Tessa's life begins to become unglued, nothing is what she thought it would be. Not her friends nor her family. The only person that she should be able to rely on is Hardin, who is furious when he discovers the massive secret that she's been keeping. Before Tessa makes the biggest decision of her life, everything changes because of revelations about her family.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/dU4HfnTEJDf9KvxGS9hgO7BVeju.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/mxdiaM2tsx8M6W3zLgiPwAkhQfq.jpg",
    manualEmbed: "cos:movie/744275",
    trailerEmbed: "https://www.youtube.com/watch?v=NYdNN6C9hfI",
    isSeries: false
  },
  {
    id: "Heretic",
    imdbId: "tt28015403",
    title: "Heretic",
    releaseDate: "2024-10-31",
    rating: 7,
    synopsis: "Two young missionaries are forced to prove their faith when they knock on the wrong door and are greeted by a diabolical Mr. Reed, becoming ensnared in his deadly game of cat-and-mouse.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/fr96XzlzsONrQrGfdLMiwtQjott.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/ag66gJCiZ06q1GSJuQlhGLi3Udx.jpg",
    manualEmbed: "cos:movie/1138194",
    trailerEmbed: "https://www.youtube.com/watch?v=jpWUOxRozZg",
    isSeries: false
  },
  {
    id: "Five Nights at Freddy's 2",
    imdbId: "tt30274401",
    title: "Five Nights at Freddy's 2",
    releaseDate: "2025-12-03",
    rating: 6.6,
    synopsis: "One year since the supernatural nightmare at Freddy Fazbear's Pizza, the stories about what transpired there have been twisted into a campy local legend, inspiring the town's first ever Fazfest. With the truth kept from her, Abby sneaks out to reconnect with Freddy, Bonnie, Chica, and Foxy, setting into motion a terrifying series of events that will reveal dark secrets about the real origin of Freddy's, and unleash a decades-hidden horror.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/udAxQEORq2I5wxI97N2TEqdhzBE.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/54BOXpX2ieTXMDzHymdDMnUIzYG.jpg",
    manualEmbed: "cos:movie/1228246",
    trailerEmbed: "https://www.youtube.com/watch?v=NQypHE9_Fm4",
    isSeries: false
  },
  {
    id: "Wonder Woman 1984",
    imdbId: "tt7126948",
    title: "Wonder Woman 1984",
    releaseDate: "2020-12-16",
    rating: 6.3,
    synopsis: "A botched store robbery places Wonder Woman in a global battle against a powerful and mysterious ancient force that puts her powers in jeopardy.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/8UlWHLMpgZm9bx6QYh0NFoq67TZ.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/egg7KFi18TSQc1s24RMmR9i2zO6.jpg",
    manualEmbed: "cos:movie/464052",
    trailerEmbed: "https://www.youtube.com/watch?v=EMgbWouN4wE",
    isSeries: false
  },
  {
    id: "Raya and the Last Dragon",
    imdbId: "tt5109280",
    title: "Raya and the Last Dragon",
    releaseDate: "2021-03-03",
    rating: 7.8,
    synopsis: "Long ago, in the fantasy world of Kumandra, humans and dragons lived together in harmony. But when an evil force threatened the land, the dragons sacrificed themselves to save humanity. Now, 500 years later, that same evil has returned and it’s up to a lone warrior, Raya, to track down the legendary last dragon to restore the fractured land and its divided people.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/5nVhgCzxKbK47OLIKxCR1syulOn.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/zmX7ObPaRfiCmY6LMalUb1bJDKj.jpg",
    manualEmbed: "cos:movie/527774",
    trailerEmbed: "https://www.youtube.com/watch?v=3UFWsEY8Hdc",
    isSeries: false
  },
  {
    id: "Gran Turismo",
    imdbId: "tt4495098",
    title: "Gran Turismo",
    releaseDate: "2023-08-09",
    rating: 7.7,
    synopsis: "The ultimate wish-fulfillment tale of a teenage Gran Turismo player whose gaming skills won him a series of Nissan competitions to become an actual professional racecar driver.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/51tqzRtKMMZEYUpSYkrUE7v9ehm.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/xFYpUmB01nswPgbzi8EOCT1ZYFu.jpg",
    manualEmbed: "cos:movie/980489",
    trailerEmbed: "https://www.youtube.com/watch?v=ZCYHn8mvyF8",
    isSeries: false
  },
  {
    id: "The Black Phone",
    imdbId: "tt7144666",
    title: "The Black Phone",
    releaseDate: "2022-06-16",
    rating: 7.5,
    synopsis: "Finney Blake, a shy but clever 13-year-old boy, is abducted by a sadistic killer and trapped in a soundproof basement where screaming is of little use. When a disconnected phone on the wall begins to ring, Finney discovers that he can hear the voices of the killer’s previous victims. And they are dead set on making sure that what happened to them doesn’t happen to Finney.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/p9ZUzCyy9wRTDuuQexkQ78R2BgF.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/AfvIjhDu9p64jKcmohS4hsPG95Q.jpg",
    manualEmbed: "cos:movie/756999",
    trailerEmbed: "https://www.youtube.com/watch?v=nQWAVkx8O74",
    isSeries: false
  },
  {
    id: "Operation Fortune: Ruse de Guerre",
    imdbId: "tt7985704",
    title: "Operation Fortune: Ruse de Guerre",
    releaseDate: "2023-01-04",
    rating: 6.5,
    synopsis: "Special agent Orson Fortune and his team of operatives recruit one of Hollywood's biggest movie stars to help them on an undercover mission when the sale of a deadly new weapons technology threatens to disrupt the world order.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/uo7vWfQUlVwueYTDRicXOJa8Oow.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/sNnPbPopZxGO3s7Hd5qcqoMyLXl.jpg",
    manualEmbed: "cos:movie/739405",
    trailerEmbed: "https://www.youtube.com/watch?v=WdZ-BWWQcWQ",
    isSeries: false
  },
  {
    id: "Roofman",
    imdbId: "tt4627382",
    title: "Roofman",
    releaseDate: "2025-10-06",
    rating: 7.1,
    synopsis: "A former Army Ranger and struggling father turns to robbing McDonald’s restaurants by cutting holes in their roofs, earning him the nickname \"Roofman.\" After escaping prison, he secretly lives inside a Toys “R” Us for six months, surviving undetected while planning his next move. But when he falls for a divorced mom drawn to his undeniable charm, his double life begins to unravel, setting off a compelling and suspenseful game of cat and mouse as his past closes in.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/wXDFtcnYtevleGzCmAD2ReQnJ4l.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/E7hhuSZ1U5xymN2Olg2EOr4N4P.jpg",
    manualEmbed: "cos:movie/1242419",
    trailerEmbed: "https://www.youtube.com/watch?v=IHikM7vFXsA",
    isSeries: false
  },
  {
    id: "A Man Called Otto",
    imdbId: "tt7405458",
    title: "A Man Called Otto",
    releaseDate: "2022-12-28",
    rating: 7.7,
    synopsis: "When a lively young family moves in next door, grumpy widower Otto Anderson meets his match in a quick-witted, pregnant woman named Marisol, leading to an unlikely friendship that turns his world upside down.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/130H1gap9lFfiTF9iDrqNIkFvC9.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/v2LilmCylr3bL9TCZSj6syjowZh.jpg",
    manualEmbed: "cos:movie/937278",
    trailerEmbed: "https://www.youtube.com/watch?v=XvbGalkHKPY",
    isSeries: false
  },
  {
    id: "The Family Plan",
    imdbId: "tt16431870",
    title: "The Family Plan",
    releaseDate: "2023-12-14",
    rating: 7.2,
    synopsis: "Dan Morgan is many things: a devoted husband, a loving father, a celebrated car salesman. He's also a former assassin. And when his past catches up to his present, he's forced to take his unsuspecting family on a road trip unlike any other.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/jLLtx3nTRSLGPAKl4RoIv1FbEBr.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/arNhhBd88bP3Bjoe4HT8MFE1JQA.jpg",
    manualEmbed: "cos:movie/1029575",
    trailerEmbed: "https://www.youtube.com/watch?v=ns8weNznn1Y",
    isSeries: false
  },
  {
    id: "Scream",
    imdbId: "tt11245972",
    title: "Scream",
    releaseDate: "2022-01-12",
    rating: 6.7,
    synopsis: "Twenty-five years after a streak of brutal murders shocked the quiet town of Woodsboro, a new killer has donned the Ghostface mask and begins targeting a group of teenagers to resurrect secrets from the town’s deadly past.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/nD4M4Bx457ryLuKYpxFwQ2IBJ5w.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/ifUfE79O1raUwbaQRIB7XnFz5ZC.jpg",
    manualEmbed: "cos:movie/646385",
    trailerEmbed: "https://www.youtube.com/watch?v=nRwLyKIBNU8",
    isSeries: false
  },
  {
    id: "The Tomorrow War",
    imdbId: "tt9777666",
    title: "The Tomorrow War",
    releaseDate: "2021-09-03",
    rating: 7.5,
    synopsis: "The world is stunned when a group of time travelers arrive from the year 2051 to deliver an urgent message: Thirty years in the future, mankind is losing a global war against a deadly alien species. The only hope for survival is for soldiers and civilians from the present to be transported to the future and join the fight. Among those recruited is high school teacher and family man Dan Forester. Determined to save the world for his young daughter, Dan teams up with a brilliant scientist and his estranged father in a desperate quest to rewrite the fate of the planet.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/34nDCQZwaEvsy4CFO5hkGRFDCVU.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/yizL4cEKsVvl17Wc1mGEIrQtM2F.jpg",
    manualEmbed: "cos:movie/588228",
    trailerEmbed: "https://www.youtube.com/watch?v=RQjEbkV-9ZM",
    isSeries: false
  },
  {
    id: "Greenland",
    imdbId: "tt7737786",
    title: "Greenland",
    releaseDate: "2020-07-29",
    rating: 7.1,
    synopsis: "John Garrity, his estranged wife and their young son embark on a perilous journey to find sanctuary as a planet-killing comet hurtles toward Earth. Amid terrifying accounts of cities getting levelled, the Garritys experience the best and worst in humanity. As the countdown to the global apocalypse approaches zero, their incredible trek culminates in a desperate and last-minute flight to a possible safe haven.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/bNo2mcvSwIvnx8K6y1euAc1TLVq.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/2Fk3AB8E9dYIBc2ywJkxk8BTyhc.jpg",
    manualEmbed: "cos:movie/524047",
    trailerEmbed: "https://www.youtube.com/watch?v=d4s9XNChIRk",
    isSeries: false
  },
  {
    id: "I Know What You Did Last Summer",
    imdbId: "tt4045450",
    title: "I Know What You Did Last Summer",
    releaseDate: "2025-07-16",
    rating: 5.6,
    synopsis: "When five friends inadvertently cause a deadly car accident, they cover up their involvement and make a pact to keep it a secret rather than face the consequences. A year later, their past comes back to haunt them and they're forced to confront a horrifying truth: someone knows what they did last summer…and is hell-bent on revenge.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/8FP2ObEGIiQYQCf83gL4ZVzwZF8.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/gVPjIcYo1gTaACF43OMsralrcUS.jpg",
    manualEmbed: "cos:movie/1083433",
    trailerEmbed: "https://www.youtube.com/watch?v=IceTkSOSNJI",
    isSeries: false
  },
  {
    id: "The Menu",
    imdbId: "tt9764362",
    title: "The Menu",
    releaseDate: "2022-11-17",
    rating: 7.2,
    synopsis: "A young couple travels to a remote island to eat at an exclusive restaurant where the chef has prepared a lavish menu, with some shocking surprises.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/fPtUgMcLIboqlTlPrq0bQpKK8eq.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/4vSBj7BYsyuKCx96EJzGyp20WfY.jpg",
    manualEmbed: "cos:movie/593643",
    trailerEmbed: "https://www.youtube.com/watch?v=C_uTkUGcHv4",
    isSeries: false
  },
  {
    id: "Hamnet",
    imdbId: "tt14905854",
    title: "Hamnet",
    releaseDate: "2025-11-26",
    rating: 7.7,
    synopsis: "The powerful story of love and loss that inspired the creation of Shakespeare's timeless masterpiece, Hamlet.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/vbeyOZm2bvBXcbgPD3v6o94epPX.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/yt9m5CiU2MZkQoNl1kqLPODNR4t.jpg",
    manualEmbed: "cos:movie/858024",
    trailerEmbed: "https://www.youtube.com/watch?v=xYcgQMxQwmk",
    isSeries: false
  },
  {
    id: "A Complete Unknown",
    imdbId: "tt11563598",
    title: "A Complete Unknown",
    releaseDate: "2024-12-25",
    rating: 7.1,
    synopsis: "New York, early 1960s. Against the backdrop of a vibrant music scene and tumultuous cultural upheaval, an enigmatic 19-year-old from Minnesota arrives in the West Village with his guitar and revolutionary talent, destined to change the course of American music.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/llWl3GtNoXosbvYboelmoT459NM.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/otugS74HEHdca4aTCtt8HtXvPYV.jpg",
    manualEmbed: "cos:movie/661539",
    trailerEmbed: "https://www.youtube.com/watch?v=ob4SHtT6cC0",
    isSeries: false
  },
  {
    id: "Wonka",
    imdbId: "tt6166392",
    title: "Wonka",
    releaseDate: "2023-12-06",
    rating: 7,
    synopsis: "Willy Wonka – chock-full of ideas and determined to change the world one delectable bite at a time – is proof that the best things in life begin with a dream, and if you’re lucky enough to meet Willy Wonka, anything is possible.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/qhb1qOilapbapxWQn9jtRCMwXJF.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/uIk2g2bRkNwNywKZIhC5oIU94Kh.jpg",
    manualEmbed: "cos:movie/787699",
    trailerEmbed: "https://www.youtube.com/watch?v=vCcGYxy6PNA",
    isSeries: false
  },
  {
    id: "The Lord of the Rings: The War of the Rohirrim",
    imdbId: "tt14824600",
    title: "The Lord of the Rings: The War of the Rohirrim",
    releaseDate: "2024-12-05",
    rating: 6.5,
    synopsis: "A sudden attack by Wulf, a clever and traitorous lord of Rohan seeking vengeance for the death of his father, forces Helm Hammerhand, the King of Rohan, and his people to make a daring last stand in the ancient stronghold of the Hornburg.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/23WCoDo6wzBfzbX7BGTNwVUqZfi.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/ie8OSgIHEl6yQiGJ90dsyBWOpQA.jpg",
    manualEmbed: "cos:movie/839033",
    trailerEmbed: "https://www.youtube.com/watch?v=gCUg6Td5fgQ",
    isSeries: false
  },
  {
    id: "Conclave",
    imdbId: "tt20215234",
    title: "Conclave",
    releaseDate: "2024-10-25",
    rating: 7.2,
    synopsis: "After the unexpected death of the Pope, Cardinal Lawrence is tasked with managing the covert and ancient ritual of electing a new one. Sequestered in the Vatican with the Catholic Church’s most powerful leaders until the process is complete, Lawrence finds himself at the center of a conspiracy that could lead to its downfall.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/m5x8D0bZ3eKqIVWZ5y7TnZ2oTVg.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/eZzNdjNDvaSoyywy9ICg2UmFwul.jpg",
    manualEmbed: "cos:movie/974576",
    trailerEmbed: "https://www.youtube.com/watch?v=t915aZmyEBg",
    isSeries: false
  },
  {
    id: "Blink Twice",
    imdbId: "tt14858658",
    title: "Blink Twice",
    releaseDate: "2024-08-21",
    rating: 6.7,
    synopsis: "When tech billionaire Slater King meets cocktail waitress Frida at his fundraising gala, he invites her to join him and his friends on a dream vacation on his private island. But despite the epic setting, beautiful people, ever-flowing champagne, and late-night dance parties, Frida can sense that there’s something sinister hiding beneath the island’s lush façade.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/lZGOK0I2DJSRlEPNOAFTSNxSjDD.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/NqqLef2ITlK8olXT4iFuUXFwSh.jpg",
    manualEmbed: "cos:movie/840705",
    trailerEmbed: "https://www.youtube.com/watch?v=jmCCQ80iAf8",
    isSeries: false
  },
  {
    id: "Girl in the Basement",
    imdbId: "tt13269536",
    title: "Girl in the Basement",
    releaseDate: "2021-02-27",
    rating: 7.6,
    synopsis: "Sara is a teen girl who is looking forward to her 18th birthday to move away from her controlling father Don. But before she could even blow out the candles, Don imprisons her in the basement of their home.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/tPP9n6r5QrIKPnshnJqE7klptj2.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/vDR2h5uQNgWyx3fsEVnEOcNFibZ.jpg",
    manualEmbed: "cos:movie/801335",
    trailerEmbed: "https://www.youtube.com/watch?v=a7VGn_0Vsx8",
    isSeries: false
  },
  {
    id: "The Lost City",
    imdbId: "tt13320622",
    title: "The Lost City",
    releaseDate: "2022-03-23",
    rating: 6.4,
    synopsis: "Reclusive author Loretta Sage writes about exotic places in her popular adventure novels that feature a handsome cover model named Alan. While on tour promoting her new book with Alan, Loretta gets kidnapped by an eccentric billionaire who hopes she can lead him to the ancient city's lost treasure that featured in her latest story. Alan, determined to prove he can be a hero in real life and not just on the pages of her books, sets off to rescue her.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/rnheO8cFvCYcmZsDrBoabJbKLFE.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/1Ds7xy7ILo8u2WWxdnkJth1jQVT.jpg",
    manualEmbed: "cos:movie/752623",
    trailerEmbed: "https://www.youtube.com/watch?v=5f9VcZqxFO4",
    isSeries: false
  },
  {
    id: "Luck",
    imdbId: "tt7214954",
    title: "Luck",
    releaseDate: "2022-08-05",
    rating: 7.8,
    synopsis: "Suddenly finding herself in the never-before-seen Land of Luck, the unluckiest person in the world must unite with the magical creatures there to turn her luck around.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/1HOYvwGFioUFL58UVvDRG6beEDm.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/sKvQUSyqsFq8e1ts6oo3Xp3dPH2.jpg",
    manualEmbed: "cos:movie/585511",
    trailerEmbed: "https://www.youtube.com/watch?v=xSG5UX0EQVg",
    isSeries: false
  },
  {
    id: "The Iron Claw",
    imdbId: "tt21064584",
    title: "The Iron Claw",
    releaseDate: "2023-12-21",
    rating: 7.5,
    synopsis: "The true story of the inseparable Von Erich brothers, who made history in the intensely competitive world of professional wrestling in the early 1980s. Through tragedy and triumph, under the shadow of their domineering father and coach, the brothers seek larger-than-life immortality on the biggest stage in sports.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/s2VLjcykJfwplJNGT5iEeCA0mRx.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/4l65BWqJBl7hBwdIwp2nQdwsOuw.jpg",
    manualEmbed: "cos:movie/850165",
    trailerEmbed: "https://www.youtube.com/watch?v=8KVsaoveTbw",
    isSeries: false
  },
  {
    id: "Fountain of Youth",
    imdbId: "tt27075958",
    title: "Fountain of Youth",
    releaseDate: "2025-05-19",
    rating: 6.2,
    synopsis: "A treasure-hunting mastermind assembles a team for a life-changing adventure. But to outwit and outrun threats at every turn, he'll need someone even smarter than he is: his estranged sister.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/4iWjGghUj2uyHo2Hyw8NFBvsNGm.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/arGs8D4RfUfsk7vMiMjDi6Mtabv.jpg",
    manualEmbed: "cos:movie/1098006",
    trailerEmbed: "https://www.youtube.com/watch?v=-7S28bH8iDs",
    isSeries: false
  },
  {
    id: "Babygirl",
    imdbId: "tt30057084",
    title: "Babygirl",
    releaseDate: "2024-12-25",
    rating: 5.7,
    synopsis: "A high-powered CEO puts her career and family on the line when she begins a torrid affair with her much younger intern.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/ilwO6elz3mLV9CToT7C8pjVeKX0.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/s7vWRjcfRVMW8tBIxhC3UhKxRoo.jpg",
    manualEmbed: "cos:movie/1097549",
    trailerEmbed: "https://www.youtube.com/watch?v=9XXoNB0lVGo",
    isSeries: false
  },
  {
    id: "Mortal Kombat",
    imdbId: "tt0293429",
    title: "Mortal Kombat",
    releaseDate: "2021-04-07",
    rating: 7,
    synopsis: "Washed-up MMA fighter Cole Young, unaware of his heritage, and hunted by Emperor Shang Tsung's best warrior, Sub-Zero, seeks out and trains with Earth's greatest champions as he prepares to stand against the enemies of Outworld in a high stakes battle for the universe.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/nkayOAUBUu4mMvyNf9iHSUiPjF1.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/6ELCZlTA5lGUops70hKdB83WJxH.jpg",
    manualEmbed: "cos:movie/460465",
    trailerEmbed: "https://www.youtube.com/watch?v=jBa_aHwCbC4",
    isSeries: false
  },
  {
    id: "The Electric State",
    imdbId: "tt7766378",
    title: "The Electric State",
    releaseDate: "2025-02-24",
    rating: 6.5,
    synopsis: "An orphaned teen hits the road with a mysterious robot to find her long-lost brother, teaming up with a smuggler and his wisecracking sidekick.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/sI2NiMU8o65hmIMY0JI9CjJ0p7f.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/2n7lYEeIbucsEQCswRcVB6ZYmMP.jpg",
    manualEmbed: "cos:movie/777443",
    trailerEmbed: "https://www.youtube.com/watch?v=QIw6ITiwgBU",
    isSeries: false
  },
  {
    id: "Luca",
    imdbId: "tt12801262",
    title: "Luca",
    releaseDate: "2021-06-17",
    rating: 7.8,
    synopsis: "Luca and his best friend Alberto experience an unforgettable summer on the Italian Riviera. But all the fun is threatened by a deeply-held secret: they are sea monsters from another world just below the water’s surface.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/9x4i9uKGXt8IiiIF5Ey0DIoY738.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/620hnMVLu6RSZW6a5rwO8gqpt0t.jpg",
    manualEmbed: "cos:movie/508943",
    trailerEmbed: "https://www.youtube.com/watch?v=mYfJxlgR2jw",
    isSeries: false
  },
  {
    id: "Until Dawn",
    imdbId: "tt30955489",
    title: "Until Dawn",
    releaseDate: "2025-04-23",
    rating: 6.3,
    synopsis: "One year after her sister Melanie mysteriously disappeared, Clover and her friends head into the remote valley where she vanished in search of answers. Exploring an abandoned visitor center, they find themselves stalked by a masked killer and horrifically murdered one by one...only to wake up and find themselves back at the beginning of the same evening.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/bLY5yN4MKVynZ2HMZWElTOGBgBe.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/3xKJ0nyUTlySmMBCpOcsuSnFPI1.jpg",
    manualEmbed: "cos:movie/1232546",
    trailerEmbed: "https://www.youtube.com/watch?v=xR3lVHnh0Gg",
    isSeries: false
  },
  {
    id: "Nope",
    imdbId: "tt10954984",
    title: "Nope",
    releaseDate: "2022-07-20",
    rating: 6.8,
    synopsis: "Residents in a lonely gulch of inland California bear witness to an uncanny, chilling discovery.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/AcKVlWaNVVVFQwro3nLXqPljcYA.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/yRutvYkM3OP8N9oqqfjSK1VC7fs.jpg",
    manualEmbed: "cos:movie/762504",
    trailerEmbed: "https://www.youtube.com/watch?v=fJKNxP-tjIQ",
    isSeries: false
  },
  {
    id: "The Matrix Resurrections",
    imdbId: "tt10838180",
    title: "The Matrix Resurrections",
    releaseDate: "2021-12-16",
    rating: 6.3,
    synopsis: "Plagued by strange memories, Neo's life takes an unexpected turn when he finds himself back inside the Matrix.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/8c4a8kE7PizaGQQnditMmI1xbRp.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/eNI7PtK6DEYgZmHWP9gQNuff8pv.jpg",
    manualEmbed: "cos:movie/624860",
    trailerEmbed: "https://www.youtube.com/watch?v=nNpvWBuTfrc",
    isSeries: false
  },
  {
    id: "The Phoenician Scheme",
    imdbId: "tt30840798",
    title: "The Phoenician Scheme",
    releaseDate: "2025-05-23",
    rating: 6.5,
    synopsis: "Wealthy businessman Zsa-zsa Korda appoints his only daughter, a nun, as sole heir to his estate. As Korda embarks on a new enterprise, they soon become the target of scheming tycoons, foreign terrorists, and determined assassins.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/iXxIUVqpQAlyy98UjUlzjkMYuj6.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/bajke0ThKJ2V2iHE9DDYOJGdS7a.jpg",
    manualEmbed: "cos:movie/1137350",
    trailerEmbed: "https://www.youtube.com/watch?v=GEuMnPl2WI4",
    isSeries: false
  },
  {
    id: "PAW Patrol: The Movie",
    imdbId: "tt11832046",
    title: "PAW Patrol: The Movie",
    releaseDate: "2021-08-09",
    rating: 7.3,
    synopsis: "Ryder and the pups are called to Adventure City to stop Mayor Humdinger from turning the bustling metropolis into a state of chaos.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/jXavWyam2VPR6bOhLwwuP3K2Hw4.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/a17F3zXnmuwqxfiDa46mtlosjrv.jpg",
    manualEmbed: "cos:movie/675445",
    trailerEmbed: "https://www.youtube.com/watch?v=LRMTr2VZcr8",
    isSeries: false
  },
  {
    id: "Ambulance",
    imdbId: "tt4998632",
    title: "Ambulance",
    releaseDate: "2022-03-16",
    rating: 6.6,
    synopsis: "Decorated veteran Will Sharp, desperate for money to cover his wife's medical bills, asks for help from his adoptive brother Danny. A charismatic career criminal, Danny instead offers him a score: the biggest bank heist in Los Angeles history: $32 million.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/hUbgg3mMSbY9PlpTxBo4IFUVSd6.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/peJmavN1H3Js9SiqQbPNs8Hgwgr.jpg",
    manualEmbed: "cos:movie/763285",
    trailerEmbed: "https://www.youtube.com/watch?v=tFWOyZNHjX8",
    isSeries: false
  },
  {
    id: "Back in Action",
    imdbId: "tt21191806",
    title: "Back in Action",
    releaseDate: "2025-01-15",
    rating: 6.4,
    synopsis: "Fifteen years after vanishing from the CIA to start a family, elite spies Matt and Emily jump back into the world of espionage when their cover is blown.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/3L3l6LsiLGHkTG4RFB2aBA6BttB.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/mkxGpqh4yOYqtENv01IrDcesFRf.jpg",
    manualEmbed: "cos:movie/993710",
    trailerEmbed: "https://www.youtube.com/watch?v=MV2nYw6gL_w",
    isSeries: false
  },
  {
    id: "Hotel Transylvania: Transformania",
    imdbId: "tt9848626",
    title: "Hotel Transylvania: Transformania",
    releaseDate: "2022-01-31",
    rating: 7,
    synopsis: "When Van Helsing's mysterious invention, the \"Monsterfication Ray,\" goes haywire, Drac and his monster pals are all transformed into humans, and Johnny becomes a monster. In their new mismatched bodies, Drac and Johnny must team up and race across the globe to find a cure before it's too late, and before they drive each other crazy.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/teCy1egGQa0y8ULJvlrDHQKnxBL.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/7QabKu8tizoqy8qCZJXljdSpP4A.jpg",
    manualEmbed: "cos:movie/585083",
    trailerEmbed: "https://www.youtube.com/watch?v=6suJohjIvfo",
    isSeries: false
  },
  {
    id: "Death of a Unicorn",
    imdbId: "tt28443655",
    title: "Death of a Unicorn",
    releaseDate: "2025-03-17",
    rating: 6.4,
    synopsis: "A father and daughter accidentally hit and kill a unicorn while en route to a weekend retreat, where his billionaire boss seeks to exploit the creature’s miraculous curative properties.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/xWlF2i51zUq7BUq4iJte1g9NyIM.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/4rLaMBcCJ1pMq72vCulBMPsbAyh.jpg",
    manualEmbed: "cos:movie/1153714",
    trailerEmbed: "https://www.youtube.com/watch?v=aQOle3MHnGs",
    isSeries: false
  },
  {
    id: "Abigail",
    imdbId: "tt27489557",
    title: "Abigail",
    releaseDate: "2024-04-16",
    rating: 6.6,
    synopsis: "A group of criminals kidnap a teenage ballet dancer, the daughter of a notorious gang leader, in order to obtain a ransom of $50 million, but over time, they discover that she is not just an ordinary girl. After the kidnappers begin to diminish, one by one, they discover, to their increasing horror, that they are locked inside with no normal little girl.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/5gKKSoD3iezjoL7YqZONjmyAiRA.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/2TPoqmatGDfBOiRxqNoL11ncCJe.jpg",
    manualEmbed: "cos:movie/1111873",
    trailerEmbed: "https://www.youtube.com/watch?v=xtAL2x58hns",
    isSeries: false
  },
  {
    id: "The Boss Baby: Family Business",
    imdbId: "tt6932874",
    title: "The Boss Baby: Family Business",
    releaseDate: "2021-07-01",
    rating: 7.3,
    synopsis: "The Templeton brothers — Tim and his Boss Baby little bro Ted — have become adults and drifted away from each other. But a new boss baby with a cutting-edge approach and a can-do attitude is about to bring them together again … and inspire a new family business.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/aQ7huOn3F0iJCJrFezS8p9WEsri.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/yBov7O4eXDcBLDpZrOHZzFr8rIl.jpg",
    manualEmbed: "cos:movie/459151",
    trailerEmbed: "https://www.youtube.com/watch?v=-rF2j6K5FoM",
    isSeries: false
  },
  {
    id: "Damsel",
    imdbId: "tt13452446",
    title: "Damsel",
    releaseDate: "2024-03-07",
    rating: 7,
    synopsis: "A young woman's marriage to a charming prince turns into a fierce fight for survival when she's offered up as a sacrifice to a fire-breathing dragon.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/AgHbB9DCE9aE57zkHjSmseszh6e.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/deLWkOLZmBNkm8p16igfapQyqeq.jpg",
    manualEmbed: "cos:movie/763215",
    trailerEmbed: "https://www.youtube.com/watch?v=iM150ZWovZM",
    isSeries: false
  },
  {
    id: "Blue Beetle",
    imdbId: "tt9362930",
    title: "Blue Beetle",
    releaseDate: "2023-08-16",
    rating: 6.6,
    synopsis: "Recent college grad Jaime Reyes returns home full of aspirations for his future, only to find that home is not quite as he left it. As he searches to find his purpose in the world, fate intervenes when Jaime unexpectedly finds himself in possession of an ancient relic of alien biotechnology: the Scarab.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/mXLOHHc1Zeuwsl4xYKjKh2280oL.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/bVyFGnX8kt0XtJXdx2F1HyOkIic.jpg",
    manualEmbed: "cos:movie/565770",
    trailerEmbed: "https://www.youtube.com/watch?v=4wxyy8Rcz4k",
    isSeries: false
  },
  {
    id: "The Holdovers",
    imdbId: "tt14849194",
    title: "The Holdovers",
    releaseDate: "2023-10-27",
    rating: 7.6,
    synopsis: "A curmudgeonly instructor at a New England prep school is forced to remain on campus during Christmas break to babysit the handful of students with nowhere to go. Eventually, he forms an unlikely bond with one of them — a damaged, brainy troublemaker — and with the school’s head cook, who has just lost a son in Vietnam.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/VHSzNBTwxV8vh7wylo7O9CLdac.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/A99WMiz0ASpH9coOFrxSEuwTWx0.jpg",
    manualEmbed: "cos:movie/840430",
    trailerEmbed: "https://www.youtube.com/watch?v=AhKLpJmHhIg",
    isSeries: false
  },
  {
    id: "M3GAN 2.0",
    imdbId: "tt26342662",
    title: "M3GAN 2.0",
    releaseDate: "2025-06-25",
    rating: 7.1,
    synopsis: "After the underlying tech for M3GAN is stolen and misused by a powerful defense contractor to create a military-grade weapon known as Amelia, M3GAN's creator Gemma realizes that the only option is to resurrect M3GAN and give her a few upgrades, making her faster, stronger, and more lethal.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/oekamLQrwlJjRNmfaBE4llIvkir.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/cT9ZfwoPDk8JbgkessmQgxAWiaM.jpg",
    manualEmbed: "cos:movie/1071585",
    trailerEmbed: "https://www.youtube.com/watch?v=1FeiTZMtwLA",
    isSeries: false
  },
  {
    id: "The Adam Project",
    imdbId: "tt2463208",
    title: "The Adam Project",
    releaseDate: "2022-03-11",
    rating: 7,
    synopsis: "After accidentally crash-landing in 2022, time-traveling fighter pilot Adam Reed teams up with his 12-year-old self on a mission to save the future.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/wFjboE0aFZNbVOF05fzrka9Fqyx.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/ewUqXnwiRLhgmGhuksOdLgh49Ch.jpg",
    manualEmbed: "cos:movie/696806",
    trailerEmbed: "https://www.youtube.com/watch?v=IE8HIsIrq4o",
    isSeries: false
  },
  {
    id: "Tom & Jerry",
    imdbId: "tt1361336",
    title: "Tom & Jerry",
    releaseDate: "2021-02-10",
    rating: 6.7,
    synopsis: "Tom the cat and Jerry the mouse get kicked out of their home and relocate to a fancy New York hotel, where a scrappy employee named Kayla will lose her job if she can’t evict Jerry before a high-class wedding at the hotel. Her solution? Hiring Tom to get rid of the pesky mouse.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/8XZI9QZ7Pm3fVkigWJPbrXCMzjq.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/69USXLJEXcgMzlhZi7bmaCORxHn.jpg",
    manualEmbed: "cos:movie/587807",
    trailerEmbed: "https://www.youtube.com/watch?v=kP9TfCWaQT4",
    isSeries: false
  },
  {
    id: "Terrifier 2",
    imdbId: "tt10403420",
    title: "Terrifier 2",
    releaseDate: "2022-10-06",
    rating: 6.7,
    synopsis: "A year after the Miles County massacre, Art the Clown is resurrected by a sinister entity. Art returns home, where he must hunt down and destroy teenage Sienna and her younger brother Jonathan on Halloween. As the body count rises, the siblings fight to stay alive while uncovering the true nature of Art's evil intent.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/qEAlwXbYk6IHA4ztoS2XFFaa7Xo.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/4QJtcL4D3abqdX6Snrk8ciRkroa.jpg",
    manualEmbed: "cos:movie/663712",
    trailerEmbed: "https://www.youtube.com/watch?v=x5DhuDSArTI",
    isSeries: false
  },
  {
    id: "Ruby Gillman, Teenage Kraken",
    imdbId: "tt27155038",
    title: "Ruby Gillman, Teenage Kraken",
    releaseDate: "2023-06-28",
    rating: 7.1,
    synopsis: "Ruby Gillman, a sweet and awkward high school student, discovers she's a direct descendant of the warrior kraken queens. The kraken are sworn to protect the oceans of the world against the vain, power-hungry mermaids. Destined to inherit the throne from her commanding grandmother, Ruby must use her newfound powers to protect those she loves most.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/8ChIb3WzYAcza1vrXR56v510MWk.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/r2u2MOaOLWSi6onaAo37Vf39xGy.jpg",
    manualEmbed: "cos:movie/1040148",
    trailerEmbed: "https://www.youtube.com/watch?v=u4uyD8FFUIw",
    isSeries: false
  },
  {
    id: "The Killer",
    imdbId: "tt1136617",
    title: "The Killer",
    releaseDate: "2023-10-25",
    rating: 6.6,
    synopsis: "After a fateful miss, an assassin battles his employers, and himself, on an international manhunt he insists isn't personal.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/ipkcgvN7h3yZnbYowthloHLKsf4.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/f9Atch0jlzcOT9RbF8UccqfNOpd.jpg",
    manualEmbed: "cos:movie/800158",
    trailerEmbed: "https://www.youtube.com/watch?v=5S7FR_HCg9g",
    isSeries: false
  },
  {
    id: "The Lost Bus",
    imdbId: "tt21103218",
    title: "The Lost Bus",
    releaseDate: "2025-09-19",
    rating: 7,
    synopsis: "A determined father risks everything to rescue a dedicated teacher and her students from a raging wildfire.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/4IPxzGlE17fJAwUTMul4opMeutA.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/wofTDrrNvySkjrv2v34jqpPZAP6.jpg",
    manualEmbed: "cos:movie/1236470",
    trailerEmbed: "https://www.youtube.com/watch?v=kQFiO88d_gk",
    isSeries: false
  },
  {
    id: "Jungle Cruise",
    imdbId: "tt0870154",
    title: "Jungle Cruise",
    releaseDate: "2021-07-28",
    rating: 7.3,
    synopsis: "Dr. Lily Houghton enlists the aid of wisecracking skipper Frank Wolff to take her down the Amazon in his dilapidated boat. Together, they search for an ancient tree that holds the power to heal – a discovery that will change the future of medicine.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/yKy9ELL8CON5sqDg4yIvBb5LTZL.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/7WJjFviFBffEJvkAms4uWwbcVUk.jpg",
    manualEmbed: "cos:movie/451048",
    trailerEmbed: "https://www.youtube.com/watch?v=hJZ82pwwJqA",
    isSeries: false
  },
  {
    id: "A Haunting in Venice",
    imdbId: "tt22687790",
    title: "A Haunting in Venice",
    releaseDate: "2023-09-13",
    rating: 6.6,
    synopsis: "Celebrated sleuth Hercule Poirot, now retired and living in self-imposed exile in Venice, reluctantly attends a Halloween séance at a decaying, haunted palazzo. When one of the guests is murdered, the detective is thrust into a sinister world of shadows and secrets.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/l6iwxT0NbVw6QiF08YTIuTnXS82.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/qB9wshRySHgN2MibLOlsW6YalqD.jpg",
    manualEmbed: "cos:movie/945729",
    trailerEmbed: "https://www.youtube.com/watch?v=rbinYSVdGE0",
    isSeries: false
  },
  {
    id: "CODA",
    imdbId: "tt10366460",
    title: "CODA",
    releaseDate: "2021-08-13",
    rating: 7.9,
    synopsis: "As a CODA (Child of Deaf Adults), Ruby is the only hearing person in her deaf family. When the family's fishing business is threatened, Ruby finds herself torn between pursuing her love of music and her fear of abandoning her parents.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/BzVjmm8l23rPsijLiNLUzuQtyd.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/v85FlkbMYKa5du1glm0YfYNsL2n.jpg",
    manualEmbed: "cos:movie/776503",
    trailerEmbed: "https://www.youtube.com/watch?v=0pmfrE1YL4I",
    isSeries: false
  },
  {
    id: "A House of Dynamite",
    imdbId: "tt32376165",
    title: "A House of Dynamite",
    releaseDate: "2025-10-02",
    rating: 6.4,
    synopsis: "When a single, unattributed missile is launched at the United States, a race begins to determine who is responsible and how to respond.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/eB3Tl6xo9VNiN6YIi9XV44v6dab.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/5SVRVwBfHCIkffiq0MmbdvnHWSz.jpg",
    manualEmbed: "cos:movie/1290159",
    trailerEmbed: "https://www.youtube.com/watch?v=_wpw2QHJNco",
    isSeries: false
  },
  {
    id: "Dolittle",
    imdbId: "tt6673612",
    title: "Dolittle",
    releaseDate: "2020-01-02",
    rating: 6.6,
    synopsis: "After losing his wife seven years earlier, the eccentric Dr. John Dolittle, famed doctor and veterinarian of Queen Victoria’s England, hermits himself away behind the high walls of Dolittle Manor with only his menagerie of exotic animals for company. But when the young queen falls gravely ill, a reluctant Dolittle is forced to set sail on an epic adventure to a mythical island in search of a cure, regaining his wit and courage as he crosses old adversaries and discovers wondrous creatures.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/3Nt3v1uzUgfSuVARD1AnI9g9Zl9.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/xcUf6yIheo78btFqihlRLftdR3M.jpg",
    manualEmbed: "cos:movie/448119",
    trailerEmbed: "https://www.youtube.com/watch?v=zjm6rDgKNMY",
    isSeries: false
  },
  {
    id: "Argylle",
    imdbId: "tt15009428",
    title: "Argylle",
    releaseDate: "2024-01-31",
    rating: 6,
    synopsis: "When the plots of reclusive author Elly Conway's fictional espionage novels begin to mirror the covert actions of a real-life spy organization, quiet evenings at home become a thing of the past. Accompanied by her cat Alfie and Aidan, a cat-allergic spy, Elly races across the world to stay one step ahead of the killers as the line between Conway's fictional world and her real one begins to blur.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/siduVKgOnABO4WH4lOwPQwaGwJp.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/mY3CRicUMaX3Btxv8yspud75UJu.jpg",
    manualEmbed: "cos:movie/848538",
    trailerEmbed: "https://www.youtube.com/watch?v=Sy6eNs3EW3E",
    isSeries: false
  },
  {
    id: "The Hunt",
    imdbId: "tt8244784",
    title: "The Hunt",
    releaseDate: "2020-03-11",
    rating: 6.7,
    synopsis: "Twelve strangers wake up in a clearing. They don't know where they are—or how they got there. In the shadow of a dark internet conspiracy theory, ruthless elitists gather at a remote location to hunt humans for sport. But their master plan is about to be derailed when one of the hunted turns the tables on her pursuers.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/wxPhn4ef1EAo5njxwBkAEVrlJJG.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/evo3crueRIK9Eutb3lnDLVbD2xD.jpg",
    manualEmbed: "cos:movie/514847",
    trailerEmbed: "https://www.youtube.com/watch?v=xoWmwsPU5cQ",
    isSeries: false
  },
  {
    id: "Creed III",
    imdbId: "tt11145118",
    title: "Creed III",
    releaseDate: "2023-03-01",
    rating: 7.1,
    synopsis: "After dominating the boxing world, Adonis Creed has thrived in his career and family life. When a childhood friend and former boxing prodigy, Damian Anderson, resurfaces after serving a long sentence in prison, he is eager to prove that he deserves his shot in the ring. The face-off between former friends is more than just a fight. To settle the score, Adonis must put his future on the line to battle Damian — a fighter with nothing to lose.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/cvsXj3I9Q2iyyIo95AecSd1tad7.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/gOIztYywR291pC4k3IpDq7Vj3Kj.jpg",
    manualEmbed: "cos:movie/677179",
    trailerEmbed: "https://www.youtube.com/watch?v=xTaIZo8OJYE",
    isSeries: false
  },
  {
    id: "Expend4bles",
    imdbId: "tt3291150",
    title: "Expend4bles",
    releaseDate: "2023-09-15",
    rating: 6,
    synopsis: "Armed with every weapon they can get their hands on and the skills to use them, The Expendables are the world’s last line of defense and the team that gets called when all other options are off the table. But new team members with new styles and tactics are going to give “new blood” a whole new meaning.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/iwsMu0ehRPbtaSxqiaUDQB9qMWT.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/rMvPXy8PUjj1o8o1pzgQbdNCsvj.jpg",
    manualEmbed: "cos:movie/299054",
    trailerEmbed: "https://www.youtube.com/watch?v=Cm3Z1jEjHHc",
    isSeries: false
  },
  {
    id: "Teenage Mutant Ninja Turtles: Mutant Mayhem",
    imdbId: "tt8589698",
    title: "Teenage Mutant Ninja Turtles: Mutant Mayhem",
    releaseDate: "2023-07-31",
    rating: 7.2,
    synopsis: "After years of being sheltered from the human world, the Turtle brothers set out to win the hearts of New Yorkers and be accepted as normal teenagers through heroic acts. Their new friend April O'Neil helps them take on a mysterious crime syndicate, but they soon get in over their heads when an army of mutants is unleashed upon them.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/gyh0eECE2IqrW8GWl3KoHBfc45j.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/2Cpg8hUn60PK9CW9d5SWf605Ah8.jpg",
    manualEmbed: "cos:movie/614930",
    trailerEmbed: "https://www.youtube.com/watch?v=JhXRNRmuYcc",
    isSeries: false
  },
  {
    id: "Onward",
    imdbId: "tt7146812",
    title: "Onward",
    releaseDate: "2020-02-29",
    rating: 7.6,
    synopsis: "In a suburban fantasy world, two teenage elf brothers embark on an extraordinary quest to discover if there is still a little magic left out there.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/f4aul3FyD3jv3v4bul1IrkWZvzq.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/bcT8CaBIj086WVD7K529h78eujb.jpg",
    manualEmbed: "cos:movie/508439",
    trailerEmbed: "https://www.youtube.com/watch?v=HxKXiQvyG_o",
    isSeries: false
  },
  {
    id: "Madame Web",
    imdbId: "tt11057302",
    title: "Madame Web",
    releaseDate: "2024-02-14",
    rating: 5.3,
    synopsis: "Forced to confront revelations about her past, paramedic Cassandra Webb forges a relationship with three young women destined for powerful futures...if they can all survive a deadly present.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/rULWuutDcN5NvtiZi4FRPzRYWSh.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/pwGmXVKUgKN13psUjlhC9zBcq1o.jpg",
    manualEmbed: "cos:movie/634492",
    trailerEmbed: "https://www.youtube.com/watch?v=s_76M4c4LTo",
    isSeries: false
  },
  {
    id: "Dumb Money",
    imdbId: "tt13957560",
    title: "Dumb Money",
    releaseDate: "2023-09-15",
    rating: 6.7,
    synopsis: "Vlogger Keith Gill sinks his life savings into GameStop stock and posts about it. When social media starts blowing up, so do his life and the lives of everyone following him. As a stock tip becomes a movement, everyone gets rich—until the billionaires fight back, and both sides find their worlds turned upside down.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/e9u7luSxFKOZgPTB9XHFnPArGdP.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/dTOQaHP4PjDXU2JwDF6UYqGqRT0.jpg",
    manualEmbed: "cos:movie/792293",
    trailerEmbed: "https://www.youtube.com/watch?v=_VxRoOZNaR8",
    isSeries: false
  },
  {
    id: "The First Omen",
    imdbId: "tt5672290",
    title: "The First Omen",
    releaseDate: "2024-04-03",
    rating: 6.8,
    synopsis: "When a young American woman is sent to Rome to begin a life of service to the church, she encounters a darkness that causes her to question her own faith and uncovers a terrifying conspiracy that hopes to bring about the birth of evil incarnate.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/tnsDyNNkOxYUyjD8CNJoAla6YvY.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/mIBG74mhGEJnBubhYLkCtvplcNr.jpg",
    manualEmbed: "cos:movie/437342",
    trailerEmbed: "https://www.youtube.com/watch?v=6GMiIRitv5s",
    isSeries: false
  },
  {
    id: "The Invisible Man",
    imdbId: "tt1051906",
    title: "The Invisible Man",
    releaseDate: "2020-02-26",
    rating: 7.1,
    synopsis: "When Cecilia's abusive ex takes his own life and leaves her his fortune, she suspects his death was a hoax. As a series of coincidences turn lethal, Cecilia works to prove that she is being hunted by someone nobody can see.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/5EufsDwXdY2CVttYOk2WtYhgKpa.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/tweDJNQzBGgsWVF5MC8JhSAk07p.jpg",
    manualEmbed: "cos:movie/570670",
    trailerEmbed: "https://www.youtube.com/watch?v=WO_FJdiY9dA",
    isSeries: false
  },
  {
    id: "Land of Bad",
    imdbId: "tt19864802",
    title: "Land of Bad",
    releaseDate: "2024-02-09",
    rating: 7.3,
    synopsis: "When a Delta Force special ops mission goes terribly wrong, Air Force drone pilot Reaper has 48 hours to remedy what has devolved into a wild rescue operation. With no weapons and no communication other than the drone above, the ground mission suddenly becomes a full-scale battle when the team is discovered by the enemy.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/h3jYanWMEJq6JJsCopy1h7cT2Hs.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/iKqItVltY6r0eJeIRdIZV8IrBpz.jpg",
    manualEmbed: "cos:movie/969492",
    trailerEmbed: "https://www.youtube.com/watch?v=hHmA-Tg4Juo",
    isSeries: false
  },
  {
    id: "Rebel Moon - Part One: A Child of Fire",
    imdbId: "tt14998742",
    title: "Rebel Moon - Part One: A Child of Fire",
    releaseDate: "2023-12-15",
    rating: 6.2,
    synopsis: "When the ruthless forces of the Motherworld threaten a quiet farming village on a distant moon, a mysterious outsider becomes its best hope for survival.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/ui4DrH1cKk2vkHshcUcGt2lKxCm.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/w4d1jESRZK12oTMMgmh0IWqlHw.jpg",
    manualEmbed: "cos:movie/848326",
    trailerEmbed: "https://www.youtube.com/watch?v=zUTQ8atM_9U",
    isSeries: false
  },
  {
    id: "Red Notice",
    imdbId: "tt7991608",
    title: "Red Notice",
    releaseDate: "2021-11-04",
    rating: 6.7,
    synopsis: "An Interpol-issued Red Notice is a global alert to hunt and capture the world's most wanted. But when a daring heist brings together the FBI's top profiler and two rival criminals, there's no telling what will happen.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/lAXONuqg41NwUMuzMiFvicDET9Y.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/p34WRcgkN2QIHcds5FtFiSpV3PC.jpg",
    manualEmbed: "cos:movie/512195",
    trailerEmbed: "https://www.youtube.com/watch?v=Pj0wz7zu3Ms",
    isSeries: false
  },
  {
    id: "The SpongeBob Movie: Sponge on the Run",
    imdbId: "tt4823776",
    title: "The SpongeBob Movie: Sponge on the Run",
    releaseDate: "2020-08-14",
    rating: 7.4,
    synopsis: "When his best friend Gary is suddenly snatched away, SpongeBob takes Patrick on a madcap mission far beyond Bikini Bottom to save their pink-shelled pal.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/jlJ8nDhMhCYJuzOw3f52CP1W8MW.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/wu1uilmhM4TdluKi2ytfz8gidHf.jpg",
    manualEmbed: "cos:movie/400160",
    trailerEmbed: "https://www.youtube.com/watch?v=s4TAfaddV4w",
    isSeries: false
  },
  {
    id: "The New Mutants",
    imdbId: "tt4682266",
    title: "The New Mutants",
    releaseDate: "2020-08-26",
    rating: 6,
    synopsis: "Five young mutants, just discovering their abilities while held in a secret facility against their will, fight to escape their past sins and save themselves.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/xiDGcXJTvu1lazFRYip6g1eLt9c.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/1MoeNacOltBWojkStjhT3svBTOK.jpg",
    manualEmbed: "cos:movie/340102",
    trailerEmbed: "https://www.youtube.com/watch?v=W_vJhUAOFpI",
    isSeries: false
  },
  {
    id: "Ghostbusters: Frozen Empire",
    imdbId: "tt21235248",
    title: "Ghostbusters: Frozen Empire",
    releaseDate: "2024-03-20",
    rating: 6.4,
    synopsis: "The Spengler family returns to where it all started - the iconic New York City firehouse - to team up with the original Ghostbusters, who've developed a top-secret research lab to take busting ghosts to the next level. But when the discovery of an ancient artifact unleashes an evil force, Ghostbusters new and old must join forces to protect their home and save the world from a second Ice Age.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/e1J2oNzSBdou01sUvriVuoYp0pJ.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/5cCfqeUH2f5Gnu7Lh9xepY9TB6x.jpg",
    manualEmbed: "cos:movie/967847",
    trailerEmbed: "https://www.youtube.com/watch?v=X7Di42uUaF0",
    isSeries: false
  },
  {
    id: "Napoleon",
    imdbId: "tt13287846",
    title: "Napoleon",
    releaseDate: "2023-11-22",
    rating: 6.3,
    synopsis: "An epic that details the checkered rise and fall of French Emperor Napoleon Bonaparte and his relentless journey to power through the prism of his addictive, volatile relationship with his wife, Josephine.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/ytFOXyghxLzAM4KZyazDdEkM66q.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/33pMXav77ICRnceEBLhL8lXTywv.jpg",
    manualEmbed: "cos:movie/753342",
    trailerEmbed: "https://www.youtube.com/watch?v=KPr42qEdhnU",
    isSeries: false
  },
  {
    id: "The Gray Man",
    imdbId: "tt1649418",
    title: "The Gray Man",
    releaseDate: "2022-07-13",
    rating: 6.9,
    synopsis: "When a shadowy CIA agent uncovers damning agency secrets, he's hunted across the globe by a sociopathic rogue operative who's put a bounty on his head.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/8cXbitsS6dWQ5gfMTZdorpAAzEH.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/2u1YBNBlSwvBReyvI7i5z5ykQXP.jpg",
    manualEmbed: "cos:movie/725201",
    trailerEmbed: "https://www.youtube.com/watch?v=OryyR6ad2rQ",
    isSeries: false
  },
  {
    id: "Nuremberg",
    imdbId: "tt29567915",
    title: "Nuremberg",
    releaseDate: "2025-11-06",
    rating: 7.6,
    synopsis: "In postwar Germany, an American psychiatrist must determine whether Nazi prisoners are fit to go on trial for war crimes, and finds himself in a complex battle of intellect and ethics with Hermann Göring, Hitler's right-hand man.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/xthXNYltOOm80vW5Kxjzxx5gvQ6.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/bf5TG9RODkPXmtJSgf8Iymof1wl.jpg",
    manualEmbed: "cos:movie/1214931",
    trailerEmbed: "https://www.youtube.com/watch?v=YWlCCVnZ4bo",
    isSeries: false
  },
  {
    id: "Last Night in Soho",
    imdbId: "tt9639470",
    title: "Last Night in Soho",
    releaseDate: "2021-10-09",
    rating: 7.3,
    synopsis: "A young girl, passionate about fashion design, is mysteriously able to enter the 1960s where she encounters her idol, a dazzling wannabe singer. But 1960s London is not what it seems, and time seems to be falling apart with shady consequences.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/n1ZRmjlk1BJTY7aASqACfPAaLn2.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/nPWy5KISy7BbUOQcg588dflKzTL.jpg",
    manualEmbed: "cos:movie/576845",
    trailerEmbed: "https://www.youtube.com/watch?v=XgNrL4Kf7yU",
    isSeries: false
  },
  {
    id: "Elvis",
    imdbId: "tt3704428",
    title: "Elvis",
    releaseDate: "2022-06-22",
    rating: 7.4,
    synopsis: "The life story of Elvis Presley as seen through the complicated relationship with his enigmatic manager, Colonel Tom Parker.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/qBOKWqAFbveZ4ryjJJwbie6tXkQ.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/rLo9T9jEg67UZPq3midjLnTUYYi.jpg",
    manualEmbed: "cos:movie/614934",
    trailerEmbed: "https://www.youtube.com/watch?v=ZbrmBotVIGw",
    isSeries: false
  },
  {
    id: "Together",
    imdbId: "tt31184028",
    title: "Together",
    releaseDate: "2025-07-14",
    rating: 6.9,
    synopsis: "Years into their relationship, Tim and Millie find themselves at a crossroads as they move to the country, abandoning all that is familiar in their lives except each other. With tensions already flaring, a nightmarish encounter with a mysterious, unnatural force threatens to corrupt their lives, their love, and their flesh.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/80slKYVM5teFH3kz6ouWrZXveqj.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/39Niij05MXfibXBsHiUU0Ml0POX.jpg",
    manualEmbed: "cos:movie/1242011",
    trailerEmbed: "https://www.youtube.com/watch?v=9bqIwMH3En8",
    isSeries: false
  },
  {
    id: "A Quiet Place: Day One",
    imdbId: "tt13433802",
    title: "A Quiet Place: Day One",
    releaseDate: "2024-06-26",
    rating: 6.6,
    synopsis: "As New York City is invaded by alien creatures who hunt by sound, a woman named Sam fights to survive with her cat.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/hU42CRk14JuPEdqZG3AWmagiPAP.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/6XjMwQTvnICBz6TguiDKkDVHvgS.jpg",
    manualEmbed: "cos:movie/762441",
    trailerEmbed: "https://www.youtube.com/watch?v=E-WIb4ATfT8",
    isSeries: false
  },
  {
    id: "I Saw the TV Glow",
    imdbId: "tt15574270",
    title: "I Saw the TV Glow",
    releaseDate: "2024-05-03",
    rating: 6.2,
    synopsis: "In late-90s suburbia, a lonely teenager meets a girl at school who introduces him to a mysterious late-night T.V. show — a vision of a supernatural world pulsing beneath their own. As time goes on, however, questions begin to arise about why the show sometimes seems more real than their own lives. In the pale glow of the television, their view of reality begins to crack.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/hS4GYkYpN1rfl4GIxyc02sCyfAj.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/jKulL2hdp5S7dVbpoItAtdCyzXI.jpg",
    manualEmbed: "cos:movie/858017",
    trailerEmbed: "https://www.youtube.com/watch?v=kymDzCgPwj0",
    isSeries: false
  },
  {
    id: "Spiral: From the Book of Saw",
    imdbId: "tt10342730",
    title: "Spiral: From the Book of Saw",
    releaseDate: "2021-05-12",
    rating: 5.9,
    synopsis: "Working in the shadow of an esteemed police veteran, brash Detective Ezekiel “Zeke” Banks and his rookie partner take charge of a grisly investigation into murders that are eerily reminiscent of the city’s gruesome past.  Unwittingly entrapped in a deepening mystery, Zeke finds himself at the center of the killer’s morbid game.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/cTvSDfBuXTZTdRCNduGMANd7VEP.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/g15PR8eQV9DehSWlagvdnJZqoRq.jpg",
    manualEmbed: "cos:movie/602734",
    trailerEmbed: "https://www.youtube.com/watch?v=7dgjBjEpMsM",
    isSeries: false
  },
  {
    id: "Ron's Gone Wrong",
    imdbId: "tt7504818",
    title: "Ron's Gone Wrong",
    releaseDate: "2021-10-14",
    rating: 7.9,
    synopsis: "In a world where walking, talking, digitally connected bots have become children's best friends, an 11-year-old finds that his robot buddy doesn't quite work the same as the others do.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/plzgQAXIEHm4Y92ktxU6fedUc0x.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/sdL37sfUBth7mdkAolI83bXAl7L.jpg",
    manualEmbed: "cos:movie/482321",
    trailerEmbed: "https://www.youtube.com/watch?v=8I8nMtzN05s",
    isSeries: false
  },
  {
    id: "IF",
    imdbId: "tt11152168",
    title: "IF",
    releaseDate: "2024-05-08",
    rating: 6.9,
    synopsis: "After discovering she can see everyone's imaginary friends, a girl embarks on a magical adventure to reconnect forgotten imaginary friends with their kids.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/xbKFv4KF3sVYuWKllLlwWDmuZP7.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/nxxCPRGTzxUH8SFMrIsvMmdxHti.jpg",
    manualEmbed: "cos:movie/639720",
    trailerEmbed: "https://www.youtube.com/watch?v=TP47e3-nmw8",
    isSeries: false
  },
  {
    id: "The Green Knight",
    imdbId: "tt9243804",
    title: "The Green Knight",
    releaseDate: "2021-07-29",
    rating: 6.6,
    synopsis: "An epic fantasy adventure based on the timeless Arthurian legend, The Green Knight tells the story of Sir Gawain, King Arthur's reckless and headstrong nephew, who embarks on a daring quest to confront the eponymous Green Knight, a gigantic emerald-skinned stranger and tester of men.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/if4hw3Ou5Sav9Em7WWHj66mnywp.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/kIQc0kkqIYTo65x5XjlKgqdDQ6a.jpg",
    manualEmbed: "cos:movie/559907",
    trailerEmbed: "https://www.youtube.com/watch?v=sS6ksY8xWCY",
    isSeries: false
  },
  {
    id: "Infinite",
    imdbId: "tt6654210",
    title: "Infinite",
    releaseDate: "2021-09-09",
    rating: 6.6,
    synopsis: "Evan McCauley has skills he never learned and memories of places he has never visited. Self-medicated and on the brink of a mental breakdown, a secret group that call themselves “Infinites” come to his rescue, revealing that his memories are real.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/niw2AKHz6XmwiRMLWaoyAOAti0G.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/wjQXZTlFM3PVEUmKf1sUajjygqT.jpg",
    manualEmbed: "cos:movie/581726",
    trailerEmbed: "https://www.youtube.com/watch?v=a3RDnD9YVxA",
    isSeries: false
  },
  {
    id: "Train Dreams",
    imdbId: "tt29768334",
    title: "Train Dreams",
    releaseDate: "2025-11-05",
    rating: 7.3,
    synopsis: "A logger leads a life of quiet grace as he experiences love and loss during an era of monumental change in early 20th-century America.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/jnaOmD9PmAkNjgVtCn17o7clOYe.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/u5NWHVhZ6HWc1fXnqn82cMar5St.jpg",
    manualEmbed: "cos:movie/1241983",
    trailerEmbed: "https://www.youtube.com/watch?v=6voWeM-xQ4Y",
    isSeries: false
  },
  {
    id: "Shazam! Fury of the Gods",
    imdbId: "tt10151854",
    title: "Shazam! Fury of the Gods",
    releaseDate: "2023-03-15",
    rating: 6.4,
    synopsis: "Billy Batson and his foster siblings, who transform into superheroes by saying \"Shazam!\", are forced to get back into action and fight the Daughters of Atlas, who they must stop from using a weapon that could destroy the world.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/3GrRgt6CiLIUXUtoktcv1g2iwT5.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/kQV9sV0IbastbU5FYxuYwxfMawz.jpg",
    manualEmbed: "cos:movie/594767",
    trailerEmbed: "https://www.youtube.com/watch?v=AIc671o9yCI",
    isSeries: false
  },
  {
    id: "The Father",
    imdbId: "tt10272386",
    title: "The Father",
    releaseDate: "2020-12-23",
    rating: 8.1,
    synopsis: "A man refuses all assistance from his daughter as he ages and, as he tries to make sense of his changing circumstances, he begins to doubt his loved ones, his own mind and even the fabric of his reality.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/pr3bEQ517uMb5loLvjFQi8uLAsp.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/h3weAFgg06GqchI2xDfufBgSFTj.jpg",
    manualEmbed: "cos:movie/600354",
    trailerEmbed: "https://www.youtube.com/watch?v=g0ox9ExOA1M",
    isSeries: false
  },
  {
    id: "The Old Guard 2",
    imdbId: "tt14961624",
    title: "The Old Guard 2",
    releaseDate: "2025-07-01",
    rating: 5.9,
    synopsis: "Andy and her team of immortal warriors fight with renewed purpose as they face a powerful new foe threatening their mission to protect humanity.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/wqfu3bPLJaEWJVk3QOm0rKhxf1A.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/fd9K7ZDfzRAcbLh8JlG4HIKbtuR.jpg",
    manualEmbed: "cos:movie/846422",
    trailerEmbed: "https://www.youtube.com/watch?v=lyivgZ074PY",
    isSeries: false
  },
  {
    id: "Wish",
    imdbId: "tt11304740",
    title: "Wish",
    releaseDate: "2023-11-13",
    rating: 6.2,
    synopsis: "Asha, a sharp-witted idealist, makes a wish so powerful that it is answered by a cosmic force – a little ball of boundless energy called Star. Together, Asha and Star confront a most formidable foe - the ruler of Rosas, King Magnifico - to save her community and prove that when the will of one courageous human connects with the magic of the stars, wondrous things can happen.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/nesuSdJakNkf0zs7OfoasB6Clxf.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/ehumsuIBbgAe1hg343oszCLrAfI.jpg",
    manualEmbed: "cos:movie/1022796",
    trailerEmbed: "https://www.youtube.com/watch?v=eQPeGiCH7A0",
    isSeries: false
  },
  {
    id: "Warfare",
    imdbId: "tt31434639",
    title: "Warfare",
    releaseDate: "2025-04-09",
    rating: 7.1,
    synopsis: "A platoon of Navy SEALs embarks on a dangerous mission in Ramadi, Iraq, with the chaos and brotherhood of war retold through their memories of the event.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/l39TlELomwysfsr37vrvCV6rmaQ.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/30jbD8Er4aB7FbfUbyZLORMDnJN.jpg",
    manualEmbed: "cos:movie/1241436",
    trailerEmbed: "https://www.youtube.com/watch?v=JER0Fkyy3tw",
    isSeries: false
  },
  {
    id: "Eternity",
    imdbId: "tt24950660",
    title: "Eternity",
    releaseDate: "2025-11-10",
    rating: 7.1,
    synopsis: "In an afterlife where souls have one week to decide where to spend eternity, Joan is faced with the impossible choice between the man she spent her life with and her first love, who died young and has waited decades for her to arrive.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/yiwGcjfDKXD5PqQnyKUU9kspWQQ.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/fuacZLpnohQtLD0AhtCErcPVL98.jpg",
    manualEmbed: "cos:movie/1259102",
    trailerEmbed: "https://www.youtube.com/watch?v=GzkoY6hUvQQ",
    isSeries: false
  },
  {
    id: "Kinds of Kindness",
    imdbId: "tt22408160",
    title: "Kinds of Kindness",
    releaseDate: "2024-05-30",
    rating: 6.5,
    synopsis: "A triptych fable following a man without choice who tries to take control of his own life; a policeman who is alarmed that his wife who was missing-at-sea has returned and seems a different person; and a woman determined to find a specific someone with a special ability, who is destined to become a prodigious spiritual leader.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/50lPmjIpDs8gKfgK7fPIeKzpllh.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/dNplOw9U5IzlY7nNiaMS0JSVobp.jpg",
    manualEmbed: "cos:movie/1029955",
    trailerEmbed: "https://www.youtube.com/watch?v=NGOL2_mI9Hw",
    isSeries: false
  },
  {
    id: "The Last Duel",
    imdbId: "tt4244994",
    title: "The Last Duel",
    releaseDate: "2021-10-13",
    rating: 7.4,
    synopsis: "King Charles VI declares that Knight Jean de Carrouges settle his dispute with his squire, Jacques Le Gris, by challenging him to a duel.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/zjrJE0fpzPvX8saJXj8VNfcjBoU.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/4LrL40XecjGLRpX5I2gzMTUt04l.jpg",
    manualEmbed: "cos:movie/617653",
    trailerEmbed: "https://www.youtube.com/watch?v=mgygUwPJvYk",
    isSeries: false
  },
  {
    id: "Borderlands",
    imdbId: "tt4978420",
    title: "Borderlands",
    releaseDate: "2024-08-07",
    rating: 5.5,
    synopsis: "Returning to her home planet, an infamous bounty hunter forms an unexpected alliance with a team of unlikely heroes. Together, they battle monsters and dangerous bandits to protect a young girl who holds the key to unimaginable power.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/4JGoZu1ZKFpMJTWAP35PCfkMgu8.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/mKOBdgaEFguADkJhfFslY7TYxIh.jpg",
    manualEmbed: "cos:movie/365177",
    trailerEmbed: "https://www.youtube.com/watch?v=Icnysn53neU",
    isSeries: false
  },
  {
    id: "Cocaine Bear",
    imdbId: "tt14209916",
    title: "Cocaine Bear",
    releaseDate: "2023-02-22",
    rating: 6,
    synopsis: "Inspired by a true story, an oddball group of cops, criminals, tourists and teens converge in a Georgia forest where a 500-pound black bear goes on a murderous rampage after unintentionally ingesting cocaine.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/gOnmaxHo0412UVr1QM5Nekv1xPi.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/a2tys4sD7xzVaogPntGsT1ypVoT.jpg",
    manualEmbed: "cos:movie/804150",
    trailerEmbed: "https://www.youtube.com/watch?v=DuWEEKeJLMI",
    isSeries: false
  },
  {
    id: "Enola Holmes",
    imdbId: "tt7846844",
    title: "Enola Holmes",
    releaseDate: "2020-09-22",
    rating: 7.2,
    synopsis: "While searching for her missing mother, intrepid teen Enola Holmes uses her sleuthing skills to outsmart big brother Sherlock and help a runaway lord.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/riYInlsq2kf1AWoGm80JQW5dLKp.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/kMe4TKMDNXTKptQPAdOF0oZHq3V.jpg",
    manualEmbed: "cos:movie/497582",
    trailerEmbed: "https://www.youtube.com/watch?v=1d0Zf9sXlHk",
    isSeries: false
  },
  {
    id: "Flight Risk",
    imdbId: "tt10078772",
    title: "Flight Risk",
    releaseDate: "2025-01-22",
    rating: 5.9,
    synopsis: "A pilot transports a U.S. Marshal accompanying a government witness to a trial in New York. As they cross the Alaskan wilderness, tensions soar and trust is tested, as not everyone on board is who they seem.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/q0bCG4NX32iIEsRFZqRtuvzNCyZ.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/hwlyY7LJdEFbCPaGNXiskKKmJ5X.jpg",
    manualEmbed: "cos:movie/1126166",
    trailerEmbed: "https://www.youtube.com/watch?v=uaodj8Myt3A",
    isSeries: false
  },
  {
    id: "Hitman's Wife's Bodyguard",
    imdbId: "tt8385148",
    title: "Hitman's Wife's Bodyguard",
    releaseDate: "2021-06-14",
    rating: 6.6,
    synopsis: "The world’s most lethal odd couple – bodyguard Michael Bryce and hitman Darius Kincaid – are back on another life-threatening mission. Still unlicensed and under scrutiny, Bryce is forced into action by Darius's even more volatile wife, the infamous international con artist Sonia Kincaid. As Bryce is driven over the edge by his two most dangerous protectees, the trio get in over their heads in a global plot and soon find that they are all that stand between Europe and a vengeful and powerful madman.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6zwGWDpY8Zu0L6W4SYWERBR8Msw.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/bjIPzixuWnOzxDG25WaXKuy9lYZ.jpg",
    manualEmbed: "cos:movie/522931",
    trailerEmbed: "https://www.youtube.com/watch?v=qRZYZ3g8l54",
    isSeries: false
  },
  {
    id: "Twisters",
    imdbId: "tt12584954",
    title: "Twisters",
    releaseDate: "2024-07-10",
    rating: 6.8,
    synopsis: "As storm season intensifies, the paths of former storm chaser Kate Carter and reckless social-media superstar Tyler Owens collide when terrifying phenomena never seen before are unleashed. The pair and their competing teams find themselves squarely in the paths of multiple storm systems converging over central Oklahoma in the fight of their lives.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/pjnD08FlMAIXsfOLKQbvmO0f0MD.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/58D6ZAvOKxlHjyX9S8qNKSBE9Y.jpg",
    manualEmbed: "cos:movie/718821",
    trailerEmbed: "https://www.youtube.com/watch?v=AZbEi95SuMg",
    isSeries: false
  },
  {
    id: "Trolls Band Together",
    imdbId: "tt14362112",
    title: "Trolls Band Together",
    releaseDate: "2023-10-12",
    rating: 7.2,
    synopsis: "When Branch's brother, Floyd, is kidnapped for his musical talents by a pair of nefarious pop-star villains, Branch and Poppy embark on a harrowing and emotional journey to reunite the other brothers and rescue Floyd from a fate even worse than pop-culture obscurity.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/3ySgD2xwasTHOK6R9bNZiEwKgYo.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/mDW6z7I6de6JbUgPOkAEZwKbg7G.jpg",
    manualEmbed: "cos:movie/901362",
    trailerEmbed: "https://www.youtube.com/watch?v=vDrUY5sZFds",
    isSeries: false
  },
  {
    id: "Army of the Dead",
    imdbId: "tt0993840",
    title: "Army of the Dead",
    releaseDate: "2021-05-14",
    rating: 6.2,
    synopsis: "Following a zombie outbreak in Las Vegas, a group of mercenaries take the ultimate gamble: venturing into the quarantine zone to pull off the greatest heist ever attempted.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/gCIsRxzcxvmuLYeAvWgoOuSxszF.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/c0izdYdnTe4uMRifHgvTA85wPz0.jpg",
    manualEmbed: "cos:movie/503736",
    trailerEmbed: "https://www.youtube.com/watch?v=tI1JGPhYBS8",
    isSeries: false
  },
  {
    id: "Greyhound",
    imdbId: "tt6048922",
    title: "Greyhound",
    releaseDate: "2020-07-09",
    rating: 7.4,
    synopsis: "A first-time captain leads a convoy of allied ships carrying thousands of soldiers across the treacherous waters of the \"Black Pit\" to the front lines of WWII. With no air cover protection for 5 days, the captain and his convoy must battle the surrounding enemy Nazi U-boats in order to give the allies a chance to win the war.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/kjMbDciooTbJPofVXgAoFjfX8Of.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/xXBnM6uSTk6qqCf0SRZKXcga9Ba.jpg",
    manualEmbed: "cos:movie/516486",
    trailerEmbed: "https://www.youtube.com/watch?v=5Byeq_hyh2U",
    isSeries: false
  },
  {
    id: "Teen Wolf: The Movie",
    imdbId: "tt15486810",
    title: "Teen Wolf: The Movie",
    releaseDate: "2023-01-18",
    rating: 7.4,
    synopsis: "The wolves are howling once again, as a terrifying ancient evil emerges in Beacon Hills. Scott McCall, no longer a teenager yet still an Alpha, must gather new allies and reunite trusted friends to fight back against this powerful and deadly enemy.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/wAkpPm3wcHRqZl8XjUI3Y2chYq2.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/96SADhPnkXnVN3KaRKsDeBovLcm.jpg",
    manualEmbed: "cos:movie/877703",
    trailerEmbed: "https://www.youtube.com/watch?v=3NbHKvuvI5A",
    isSeries: false
  },
  {
    id: "In the Lost Lands",
    imdbId: "tt4419684",
    title: "In the Lost Lands",
    releaseDate: "2025-02-27",
    rating: 6.4,
    synopsis: "A queen sends the powerful and feared sorceress Gray Alys to the ghostly wilderness of the Lost Lands in search of a magical power, where she and her guide, the drifter Boyce, must outwit and outfight both man and demon.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/dDlfjR7gllmr8HTeN6rfrYhTdwX.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/oI5uHu7lrQ0mBBH1c8OHCAkCq4x.jpg",
    manualEmbed: "cos:movie/324544",
    trailerEmbed: "https://www.youtube.com/watch?v=CMyrp5Vk3mU",
    isSeries: false
  },
  {
    id: "The Sea Beast",
    imdbId: "tt9288046",
    title: "The Sea Beast",
    releaseDate: "2022-06-24",
    rating: 7.3,
    synopsis: "When a young girl stows away on the ship of a legendary sea monster hunter, they launch an epic journey into uncharted waters — and make history to boot.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/9Zfv4Ap1e8eKOYnZPtYaWhLkk0d.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/wUwizGzbTk5CTiKBnE4Pq1MONwD.jpg",
    manualEmbed: "cos:movie/560057",
    trailerEmbed: "https://www.youtube.com/watch?v=P-E-IGQCsPo",
    isSeries: false
  },
  {
    id: "After Everything",
    imdbId: "tt15334488",
    title: "After Everything",
    releaseDate: "2023-09-13",
    rating: 6.9,
    synopsis: "Besieged by writer’s block and the crushing breakup with Tessa, Hardin travels to Portugal in search of a woman he wronged in the past – and to find himself. Hoping to win back Tessa, he realizes he needs to change his ways before he can make the ultimate commitment.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/uQxjZGU6rxSPSMeAJPJQlmfV3ys.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/fH7kYS9qEOkhFQZc0Dcoa9MFjje.jpg",
    manualEmbed: "cos:movie/820525",
    trailerEmbed: "https://www.youtube.com/watch?v=NsmopvKNSE4",
    isSeries: false
  },
  {
    id: "The Little Things",
    imdbId: "tt10016180",
    title: "The Little Things",
    releaseDate: "2021-01-28",
    rating: 6.4,
    synopsis: "Deputy Sheriff Joe \"Deke\" Deacon joins forces with Sgt. Jim Baxter to search for a serial killer who's terrorizing Los Angeles. As they track the culprit, Baxter is unaware that the investigation is dredging up echoes of Deke's past, uncovering disturbing secrets that could threaten more than his case.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/tLO1aD1ghdtVMT32z2sRmzgYKYd.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/9TW4zKd2FFZgqR8k5vf4oZofPMR.jpg",
    manualEmbed: "cos:movie/602269",
    trailerEmbed: "https://www.youtube.com/watch?v=1HZAnkxdYuA",
    isSeries: false
  },
  {
    id: "Those Who Wish Me Dead",
    imdbId: "tt3215824",
    title: "Those Who Wish Me Dead",
    releaseDate: "2021-05-05",
    rating: 6.6,
    synopsis: "A young boy finds himself pursued by two assassins in the Montana wilderness, with a survival expert determined to protect him, and a forest fire threatening to consume them all.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/xCEg6KowNISWvMh8GvPSxtdf9TO.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/ouOojiypBE6CD1aqcHPVq7cJf2R.jpg",
    manualEmbed: "cos:movie/578701",
    trailerEmbed: "https://www.youtube.com/watch?v=sV6VNNjBkcE",
    isSeries: false
  },
  {
    id: "The Fabelmans",
    imdbId: "tt14208870",
    title: "The Fabelmans",
    releaseDate: "2022-11-11",
    rating: 7.6,
    synopsis: "Growing up in post-World War II era Arizona, young Sammy Fabelman aspires to become a filmmaker as he reaches adolescence, but soon discovers a shattering family secret and explores how the power of films can help him see the truth.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/h7llKkqkkJtJrTOaDLuVeUYDQ7I.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/xQyGkQ8ICa4lgifGr3oZjkm3AJ2.jpg",
    manualEmbed: "cos:movie/804095",
    trailerEmbed: "https://www.youtube.com/watch?v=9wAKUa487aw",
    isSeries: false
  },
  {
    id: "Saw X",
    imdbId: "tt21807222",
    title: "Saw X",
    releaseDate: "2023-09-27",
    rating: 7.1,
    synopsis: "Between the events of 'Saw' and 'Saw II', a sick and desperate John Kramer travels to Mexico for a risky and experimental medical procedure in hopes of a miracle cure for his cancer, only to discover the entire operation is a scam to defraud the most vulnerable. Armed with a newfound purpose, the infamous serial killer returns to his work, turning the tables on the con artists in his signature visceral way through devious, deranged, and ingenious traps.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/u7Lp1Hi8aBS73jv4KRMIv5aK4ax.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/uUJp5I4IbzuhdUiEx4R9OAoFpbz.jpg",
    manualEmbed: "cos:movie/951491",
    trailerEmbed: "https://www.youtube.com/watch?v=t3PzUo4P21c",
    isSeries: false
  },
  {
    id: "DC League of Super-Pets",
    imdbId: "tt8912936",
    title: "DC League of Super-Pets",
    releaseDate: "2022-07-27",
    rating: 7.1,
    synopsis: "When Superman and the rest of the Justice League are kidnapped, Krypto the Super-Dog must convince a rag-tag shelter pack - Ace the hound, PB the potbellied pig, Merton the turtle and Chip the squirrel - to master their own newfound powers and help him rescue the superheroes.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/qpPMewlugFaejXjz4YNDnpTniFX.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/xfNHRI2f5kHGvogxLd0C5sB90L7.jpg",
    manualEmbed: "cos:movie/539681",
    trailerEmbed: "https://www.youtube.com/watch?v=xEbpPP-_1Ig",
    isSeries: false
  },
  {
    id: "The Woman King",
    imdbId: "tt8093700",
    title: "The Woman King",
    releaseDate: "2022-09-16",
    rating: 7.6,
    synopsis: "The story of the Agojie, the all-female unit of warriors who protected the African Kingdom of Dahomey in the 1800s with skills and a fierceness unlike anything the world has ever seen, and General Nanisca as she trains the next generation of recruits and readies them for battle against an enemy determined to destroy their way of life.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/438QXt1E3WJWb3PqNniK0tAE5c1.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/dOtH7s8gIP6lt3WfeK4ws8udI3E.jpg",
    manualEmbed: "cos:movie/724495",
    trailerEmbed: "https://www.youtube.com/watch?v=3RDaPV_rJ1Y",
    isSeries: false
  },
  {
    id: "Halloween Ends",
    imdbId: "tt10665342",
    title: "Halloween Ends",
    releaseDate: "2022-10-12",
    rating: 6,
    synopsis: "Four years after the events of Halloween in 2018, Laurie has decided to liberate herself from fear and rage and embrace life. But when a young man is accused of killing a boy he was babysitting, it ignites a cascade of violence and terror that will force Laurie to finally confront the evil she can’t control, once and for all.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/q06saepaXeBdkMibuN4R2fXmgIw.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/aTovumsNlDjof7YVoU5nW2RHaYn.jpg",
    manualEmbed: "cos:movie/616820",
    trailerEmbed: "https://www.youtube.com/watch?v=s0vtbxLa-N8",
    isSeries: false
  },
  {
    id: "The Pope's Exorcist",
    imdbId: "tt13375076",
    title: "The Pope's Exorcist",
    releaseDate: "2023-04-05",
    rating: 6.9,
    synopsis: "Father Gabriele Amorth, Chief Exorcist of the Vatican, investigates a young boy's terrifying possession and ends up uncovering a centuries-old conspiracy the Vatican has desperately tried to keep hidden.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/jFC4LS5qTAT3PinzdEzINfu1CV9.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/3oqmk6mNWPatBKcjOOJLp5WW9zN.jpg",
    manualEmbed: "cos:movie/758323",
    trailerEmbed: "https://www.youtube.com/watch?v=YJXqvnT_rsk",
    isSeries: false
  },
  {
    id: "The Forever Purge",
    imdbId: "tt10327252",
    title: "The Forever Purge",
    releaseDate: "2021-06-30",
    rating: 6.9,
    synopsis: "All the rules are broken as a sect of lawless marauders decides that the annual Purge does not stop at daybreak and instead should never end as they chase a group of immigrants who they want to punish because of their harsh historical past.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/lB068qa6bQ0QKYKyC2xnYGvYjl7.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/ciKBP3tgzUxp7sHFNZxofBXUS8k.jpg",
    manualEmbed: "cos:movie/602223",
    trailerEmbed: "https://www.youtube.com/watch?v=xOrXpK-rUaI",
    isSeries: false
  },
  {
    id: "The Guardians of the Galaxy Holiday Special",
    imdbId: "tt13623136",
    title: "The Guardians of the Galaxy Holiday Special",
    releaseDate: "2022-11-24",
    rating: 7.1,
    synopsis: "On a mission to make Christmas unforgettable for Quill, the Guardians head to Earth in search of the perfect present.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/8dqXyslZ2hv49Oiob9UjlGSHSTR.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/rfnmMYuZ6EKOBvQLp2wqP21v7sI.jpg",
    manualEmbed: "cos:movie/774752",
    trailerEmbed: "https://www.youtube.com/watch?v=OYhFFQl4fLs",
    isSeries: false
  },
  {
    id: "The Watchers",
    imdbId: "tt26736843",
    title: "The Watchers",
    releaseDate: "2024-06-06",
    rating: 6.3,
    synopsis: "A young artist gets stranded in an extensive, immaculate forest in western Ireland, where, after finding shelter, she becomes trapped alongside three strangers, stalked by mysterious creatures each night.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/vZVEUPychdvZLrTNwWErr9xZFmu.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/whnFKx0Y54Ktg6o2TiwbnQfXdZf.jpg",
    manualEmbed: "cos:movie/1086747",
    trailerEmbed: "https://www.youtube.com/watch?v=dYo91Fq9tKY",
    isSeries: false
  },
  {
    id: "Longlegs",
    imdbId: "tt23468450",
    title: "Longlegs",
    releaseDate: "2024-07-10",
    rating: 6.5,
    synopsis: "FBI Agent Lee Harker is a gifted new recruit assigned to the unsolved case of an elusive serial killer. As the case takes complex turns, unearthing evidence of the occult, Harker discovers a personal connection to the merciless killer and must race against time to stop him before he claims the lives of another innocent family.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/1EwNyiiNFd863H4e8nWEzutnZD7.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/6ToGkmqn0KG0UGGGUAC1Ww0e5CM.jpg",
    manualEmbed: "cos:movie/1226578",
    trailerEmbed: "https://www.youtube.com/watch?v=FXOtkvx25gI",
    isSeries: false
  },
  {
    id: "The Ice Age Adventures of Buck Wild",
    imdbId: "tt13634480",
    title: "The Ice Age Adventures of Buck Wild",
    releaseDate: "2022-01-28",
    rating: 6.5,
    synopsis: "The fearless one-eyed weasel Buck teams up with mischievous possum brothers Crash & Eddie as they head off on a new adventure into Buck's home: The Dinosaur World.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/9ginbMWmt9y7PIHW1c9hnbIVWPm.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/tleIOY1MS8DIe6v7x6gg7lRCOfA.jpg",
    manualEmbed: "cos:movie/774825",
    trailerEmbed: "https://www.youtube.com/watch?v=DSbpMKROvnc",
    isSeries: false
  },
  {
    id: "Carry-On",
    imdbId: "tt21382296",
    title: "Carry-On",
    releaseDate: "2024-12-05",
    rating: 6.9,
    synopsis: "An airport security officer races to outsmart a mysterious traveler forcing him to let a dangerous item slip onto a Christmas Eve flight.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/sjMN7DRi4sGiledsmllEw5HJjPy.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/rhc8Mtuo3Kh8CndnlmTNMF8o9pU.jpg",
    manualEmbed: "cos:movie/1005331",
    trailerEmbed: "https://www.youtube.com/watch?v=KS0XacjMmOc",
    isSeries: false
  },
  {
    id: "Mulan",
    imdbId: "tt4566758",
    title: "Mulan",
    releaseDate: "2020-09-04",
    rating: 6.8,
    synopsis: "When the Emperor of China issues a decree that one man per family must serve in the Imperial Chinese Army to defend the country from Huns, Hua Mulan, the eldest daughter of an honored warrior, steps in to take the place of her ailing father. She is spirited, determined and quick on her feet. Disguised as a man by the name of Hua Jun, she is tested every step of the way and must harness her innermost strength and embrace her true potential.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/aKx1ARwG55zZ0GpRvU2WrGrCG9o.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/zMrk2G3XsnfYKiIp1NEfdtvDyBH.jpg",
    manualEmbed: "cos:movie/337401",
    trailerEmbed: "https://www.youtube.com/watch?v=R-eFm--k21c",
    isSeries: false
  },
  {
    id: "Materialists",
    imdbId: "tt30253473",
    title: "Materialists",
    releaseDate: "2025-06-12",
    rating: 6.3,
    synopsis: "A young, ambitious New York City matchmaker finds herself torn between the perfect match and her imperfect ex.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/eDo0pNruy0Qgj6BdTyHIR4cxHY8.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/lqwwGkwJHtz9QgKtz4zeY19YgDg.jpg",
    manualEmbed: "cos:movie/1136867",
    trailerEmbed: "https://www.youtube.com/watch?v=9gjeXsTsxqY",
    isSeries: false
  },
  {
    id: "Happy Gilmore 2",
    imdbId: "tt31868189",
    title: "Happy Gilmore 2",
    releaseDate: "2025-07-25",
    rating: 6.5,
    synopsis: "Happy Gilmore isn't done with golf — not by a long shot. Since his retirement after his first Tour Championship win, Gilmore returns to finance his daughter's ballet classes.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/E3dPHPJigkXwuiE0n1vzz0se8a.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/dRgfr6i95s4qEZkdtWdJP495E75.jpg",
    manualEmbed: "cos:movie/1263256",
    trailerEmbed: "https://www.youtube.com/watch?v=YKzRPFvky9Y",
    isSeries: false
  },
  {
    id: "Asteroid City",
    imdbId: "tt14230388",
    title: "Asteroid City",
    releaseDate: "2023-06-08",
    rating: 6.5,
    synopsis: "In an American desert town circa 1955, the itinerary of a Junior Stargazer/Space Cadet convention is spectacularly disrupted by world-changing events.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/hfo7pvL9Fys7rocfL4VOzw9qDEQ.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/iloUOSs3Rcq3aMr04CrGRWVVBkq.jpg",
    manualEmbed: "cos:movie/747188",
    trailerEmbed: "https://www.youtube.com/watch?v=9FXCSXuGTF4",
    isSeries: false
  },
  {
    id: "Arthur the King",
    imdbId: "tt10720352",
    title: "Arthur the King",
    releaseDate: "2024-02-22",
    rating: 7.5,
    synopsis: "Over the course of ten days and 435 miles, an unbreakable bond is forged between pro adventure racer Michael Light and a scrappy street dog companion dubbed Arthur. As the team is pushed to their outer limits of endurance in the race, Arthur redefines what victory, loyalty and friendship truly mean.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/zkKB3kOun5DKAkm61pHvLbrjxfa.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/jw4SNkaSgbrO7VJPsZUZqbBg1Ph.jpg",
    manualEmbed: "cos:movie/618588",
    trailerEmbed: "https://www.youtube.com/watch?v=wjDJNEPghNY",
    isSeries: false
  },
  {
    id: "Day Shift",
    imdbId: "tt13314558",
    title: "Day Shift",
    releaseDate: "2022-08-05",
    rating: 6.7,
    synopsis: "An LA vampire hunter has a week to come up with the cash to pay for his kid's tuition and braces. Trying to make a living these days just might kill him.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/tkl7n5r542S40hnYDI27lGNCACu.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/yjZM4QrgA7PqX18Es6DxvJQH3ba.jpg",
    manualEmbed: "cos:movie/755566",
    trailerEmbed: "https://www.youtube.com/watch?v=GN_IwBptKi4",
    isSeries: false
  },
  {
    id: "We Live in Time",
    imdbId: "tt27131358",
    title: "We Live in Time",
    releaseDate: "2024-10-10",
    rating: 7.2,
    synopsis: "An up-and-coming chef and a recent divorcée find their lives forever changed when a chance encounter brings them together, in a decade-spanning, deeply moving romance.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/oeDNBgnlGF6rnyX1P1K8Vl2f3lW.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/4t8IXJF4umwCfbdpeKLvlN3zkKp.jpg",
    manualEmbed: "cos:movie/1100099",
    trailerEmbed: "https://www.youtube.com/watch?v=MH02yagHaNw",
    isSeries: false
  },
  {
    id: "The Boogeyman",
    imdbId: "tt3427252",
    title: "The Boogeyman",
    releaseDate: "2023-05-31",
    rating: 6.4,
    synopsis: "Still reeling from the tragic death of their mother, a teenage girl and her younger sister find themselves plagued by a sadistic presence in their house and struggle to get their grieving father to pay attention before it’s too late.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/pYwZdnXVnVxAr7dx4MEK7tTK9gI.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/6OnDSJThAbF6GxXNXNmcusGjBDy.jpg",
    manualEmbed: "cos:movie/532408",
    trailerEmbed: "https://www.youtube.com/watch?v=p8BDtwMYFa4",
    isSeries: false
  },
  {
    id: "Fantasy Island",
    imdbId: "tt0983946",
    title: "Fantasy Island",
    releaseDate: "2020-02-12",
    rating: 5.7,
    synopsis: "A group of contest winners arrive at an island hotel to live out their dreams, only to find themselves trapped in nightmare scenarios.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/8ZMrZGGW65ePWIgRn1260nA1uUm.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/dzfiE2VHY362dGI62XfZ2iI87CT.jpg",
    manualEmbed: "cos:movie/539537",
    trailerEmbed: "https://www.youtube.com/watch?v=AuDROG1g6bM",
    isSeries: false
  },
  {
    id: "Violent Night",
    imdbId: "tt12003946",
    title: "Violent Night",
    releaseDate: "2022-11-30",
    rating: 7.2,
    synopsis: "When a team of mercenaries breaks into a wealthy family compound on Christmas Eve, taking everyone inside hostage, the team isn’t prepared for a surprise combatant: Santa Claus is on the grounds, and he’s about to show why this Nick is no saint.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/e8CpMgdyihz9Td7amQDqubPuzfN.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/sBOenwOZGRN5nZZGw4TxwtnfrEf.jpg",
    manualEmbed: "cos:movie/899112",
    trailerEmbed: "https://www.youtube.com/watch?v=a53e4HHnx_s",
    isSeries: false
  },
  {
    id: "Fly Me to the Moon",
    imdbId: "tt1896747",
    title: "Fly Me to the Moon",
    releaseDate: "2024-07-10",
    rating: 6.8,
    synopsis: "Sparks fly in all directions as marketing maven Kelly Jones, brought in to fix NASA's public image, wreaks havoc on Apollo 11 launch director Cole Davis' already difficult task of putting a man on the moon. When the White House deems the mission too important to fail, Jones is directed to stage a fake moon landing as backup, and the countdown truly begins.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/gjk8YdXpItoC1in53FCrZMFIuBx.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/4ItXEyVPj6wb9AdhsltcqYE6f5f.jpg",
    manualEmbed: "cos:movie/956842",
    trailerEmbed: "https://www.youtube.com/watch?v=1ZO5k948MkY",
    isSeries: false
  },
  {
    id: "Roald Dahl's The Witches",
    imdbId: "tt0805647",
    title: "Roald Dahl's The Witches",
    releaseDate: "2020-10-26",
    rating: 6.3,
    synopsis: "In late 1967, a young orphaned boy goes to live with his loving grandma in the rural Alabama town of Demopolis. As the boy and his grandmother encounter some deceptively glamorous but thoroughly diabolical witches, she wisely whisks him away to a seaside resort. Regrettably, they arrive at precisely the same time that the world's Grand High Witch has gathered.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/betExZlgK0l7CZ9CsCBVcwO1OjL.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/4lWr2j3ZSEe8qlt3W3ma8TiiMQB.jpg",
    manualEmbed: "cos:movie/531219",
    trailerEmbed: "https://www.youtube.com/watch?v=9nlhmJF5FNI",
    isSeries: false
  },
  {
    id: "Orphan: First Kill",
    imdbId: "tt11851548",
    title: "Orphan: First Kill",
    releaseDate: "2022-07-27",
    rating: 6.6,
    synopsis: "After escaping from an Estonian psychiatric facility, Leena Klammer travels to America by impersonating Esther, the missing daughter of a wealthy family. But when her mask starts to slip, she is put against a mother who will protect her family from the murderous “child” at any cost.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/pHkKbIRoCe7zIFvqan9LFSaQAde.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/e77LAFvZq5KteWsKxuc5nP9B6OD.jpg",
    manualEmbed: "cos:movie/760161",
    trailerEmbed: "https://www.youtube.com/watch?v=_uX6of3vBu0",
    isSeries: false
  },
  {
    id: "Predator: Killer of Killers",
    imdbId: "tt36463894",
    title: "Predator: Killer of Killers",
    releaseDate: "2025-06-05",
    rating: 7.8,
    synopsis: "While three of the fiercest warriors in human history—a Viking raider, a ninja in feudal Japan, and a WWII pilot—are killers in their own right, they are merely prey for their new opponent: the ultimate killer of killers.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/2XDQa6EmFHSA37j1t0w88vpWqj9.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/3AGZKVr2DPT9H53gYtkSEC1tK1E.jpg",
    manualEmbed: "cos:movie/1376434",
    trailerEmbed: "https://www.youtube.com/watch?v=fbddYji1F8s",
    isSeries: false
  },
  {
    id: "Morbius",
    imdbId: "tt5108870",
    title: "Morbius",
    releaseDate: "2022-03-30",
    rating: 5.9,
    synopsis: "Dangerously ill with a rare blood disorder, and determined to save others suffering his same fate, Dr. Michael Morbius attempts a desperate gamble. What at first appears to be a radical success soon reveals itself to be a remedy potentially worse than the disease.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/Av8Z2jZhEm1FLkFzMThzz9hndJF.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/jzWT0zd8U77fqWg5WgUfYaMzSFz.jpg",
    manualEmbed: "cos:movie/526896",
    trailerEmbed: "https://www.youtube.com/watch?v=wG2TjtueeSU",
    isSeries: false
  },
  {
    id: "The Banshees of Inisherin",
    imdbId: "tt11813216",
    title: "The Banshees of Inisherin",
    releaseDate: "2022-10-20",
    rating: 7.5,
    synopsis: "Two lifelong friends find themselves at an impasse when one abruptly ends their relationship, with alarming consequences for both of them.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/4yFG6cSPaCaPhyJ1vtGOtMD1lgh.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/1vXD5HXqkhvsXFHE7KmCPZGPR1e.jpg",
    manualEmbed: "cos:movie/674324",
    trailerEmbed: "https://www.youtube.com/watch?v=9-R9u2UD3FU",
    isSeries: false
  },
  {
    id: "Wish Dragon",
    imdbId: "tt5562070",
    title: "Wish Dragon",
    releaseDate: "2021-01-15",
    rating: 7.9,
    synopsis: "Determined teen Din is longing to reconnect with his childhood best friend when he meets a wish-granting dragon who shows him the magic of possibilities.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/lnPf6hzANL6pVQTxUlsNYSuhT5l.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/4kIRrW1AlHP5Idne8CPHeQt8nR5.jpg",
    manualEmbed: "cos:movie/550205",
    trailerEmbed: "https://www.youtube.com/watch?v=uWIRyU5fuzU",
    isSeries: false
  },
  {
    id: "Haunted Mansion",
    imdbId: "tt1695843",
    title: "Haunted Mansion",
    releaseDate: "2023-07-26",
    rating: 6.4,
    synopsis: "A woman and her son enlist a motley crew of so-called spiritual experts to help rid their home of supernatural squatters.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/8Im6DknDVxRiGXc5t8rVOJyzuNx.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/Als2QyqbLgT5G3rwTGJta8QQfqP.jpg",
    manualEmbed: "cos:movie/616747",
    trailerEmbed: "https://www.youtube.com/watch?v=iB_1o3c19y0",
    isSeries: false
  },
  {
    id: "The Banker",
    imdbId: "tt6285944",
    title: "The Banker",
    releaseDate: "2020-03-06",
    rating: 7.6,
    synopsis: "In the 1960s, two entrepreneurs hatch an ingenious business plan to fight for housing integration—and equal access to the American Dream.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/biXzsw22U6vSd0XktmZwAOc4uik.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/3ciAiEBD4yxZYoXMxEnZF6Q0u58.jpg",
    manualEmbed: "cos:movie/627725",
    trailerEmbed: "https://www.youtube.com/watch?v=J_-nk9-sMus",
    isSeries: false
  },
  {
    id: "The Zone of Interest",
    imdbId: "tt7160372",
    title: "The Zone of Interest",
    releaseDate: "2023-12-15",
    rating: 7,
    synopsis: "The commandant of Auschwitz, Rudolf Höss, and his wife Hedwig, strive to build a dream life for their family in a house and garden next to the camp.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/hUu9zyZmDd8VZegKi1iK1Vk0RYS.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/pnTSOKcYnvdpQNQElAtJM1rWOxH.jpg",
    manualEmbed: "cos:movie/467244",
    trailerEmbed: "https://www.youtube.com/watch?v=GFNtVaAuVYY",
    isSeries: false
  },
  {
    id: "Where the Crawdads Sing",
    imdbId: "tt9411972",
    title: "Where the Crawdads Sing",
    releaseDate: "2022-07-14",
    rating: 7.5,
    synopsis: "Abandoned by her family, Kya raises herself all alone in the marshes outside of her small town. When her former boyfriend is found dead, Kya is instantly branded by the local townspeople and law enforcement as the prime suspect for his murder.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/n1el846gLDXfhOvrRCsyvaAOQWv.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/fsHxHpREPdE299Bl7RvKb1HKk9U.jpg",
    manualEmbed: "cos:movie/682507",
    trailerEmbed: "https://www.youtube.com/watch?v=hoSHYfCqgK0",
    isSeries: false
  },
  {
    id: "Deep Water",
    imdbId: "tt2180339",
    title: "Deep Water",
    releaseDate: "2022-03-17",
    rating: 5.8,
    synopsis: "A well-to-do husband who allows his wife to have affairs in order to avoid a divorce becomes a prime suspect in the disappearance of her lovers.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6yRMyWwjuhKg6IU66uiZIGhaSc8.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/lcITbesmy0IBO6TXTAgQHJE6Asx.jpg",
    manualEmbed: "cos:movie/619979",
    trailerEmbed: "https://www.youtube.com/watch?v=90JsrQwE5CA",
    isSeries: false
  },
  {
    id: "Ghosted",
    imdbId: "tt15326988",
    title: "Ghosted",
    releaseDate: "2023-04-18",
    rating: 6.9,
    synopsis: "Salt-of-the-earth Cole falls head over heels for enigmatic Sadie—but then makes the shocking discovery that she's a secret agent. Before they can decide on a second date, Cole and Sadie are swept away on an international adventure to save the world.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/liLN69YgoovHVgmlHJ876PKi5Yi.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/pp3QUzMXfP7q0ocmE1b15FH6PQ6.jpg",
    manualEmbed: "cos:movie/868759",
    trailerEmbed: "https://www.youtube.com/watch?v=IAdCsNtEuBU",
    isSeries: false
  },
  {
    id: "Hit Man",
    imdbId: "tt20215968",
    title: "Hit Man",
    releaseDate: "2024-05-16",
    rating: 6.8,
    synopsis: "A mild-mannered professor moonlighting as a fake hit man in police stings ignites a chain reaction of trouble when he falls for a potential client.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/oil3EZwKFp3CWxZnfGfGglesvm9.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/nv6F6tz7r61DUhE7zgHwLJFcTYp.jpg",
    manualEmbed: "cos:movie/974635",
    trailerEmbed: "https://www.youtube.com/watch?v=9a7C7Bxsm90",
    isSeries: false
  },
  {
    id: "Pearl",
    imdbId: "tt18925334",
    title: "Pearl",
    releaseDate: "2022-09-16",
    rating: 7.2,
    synopsis: "Trapped on her family’s isolated farm, Pearl must tend to her ailing father under the bitter and overbearing watch of her devout mother. Lusting for a glamorous life like she’s seen in the movies, Pearl’s ambitions, temptations, and repressions collide.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/ulBLIBqvdnf4H6JBt0OpMCU1ECn.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/fdzpbJ0xdyjMUY4DqN6cOpESA1X.jpg",
    manualEmbed: "cos:movie/949423",
    trailerEmbed: "https://www.youtube.com/watch?v=L5PW5r3pEOg",
    isSeries: false
  },
  {
    id: "Lightyear",
    imdbId: "tt10298810",
    title: "Lightyear",
    releaseDate: "2022-06-15",
    rating: 6.9,
    synopsis: "Legendary Space Ranger Buzz Lightyear embarks on an intergalactic adventure alongside a group of ambitious recruits and his robot companion Sox.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/ox4goZd956BxqJH6iLwhWPL9ct4.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/hwUxHPkuUleJeoick4uZsrKDXxF.jpg",
    manualEmbed: "cos:movie/718789",
    trailerEmbed: "https://www.youtube.com/watch?v=fppZVPueuCk",
    isSeries: false
  },
  {
    id: "Novocaine",
    imdbId: "tt29603959",
    title: "Novocaine",
    releaseDate: "2025-03-03",
    rating: 6.8,
    synopsis: "When the girl of his dreams is kidnapped, everyman Nate turns his inability to feel pain into an unexpected strength in his fight to get her back.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/xmMHGz9dVRaMY6rRAlEX4W0Wdhm.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/lyBH2mFFU6qrHwD5QKotL2JnEb6.jpg",
    manualEmbed: "cos:movie/1195506",
    trailerEmbed: "https://www.youtube.com/watch?v=99BLnkAlC1M",
    isSeries: false
  },
  {
    id: "Eddington",
    imdbId: "tt31176520",
    title: "Eddington",
    releaseDate: "2025-07-16",
    rating: 6.5,
    synopsis: "In May of 2020, a standoff between a small-town sheriff and mayor sparks a powder keg as neighbor is pitted against neighbor in Eddington, New Mexico.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/4GIqZUgPZ146BhibsPHMHef2nXX.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/5PJkK2iVXRO1ydrtgwuJdevmnOe.jpg",
    manualEmbed: "cos:movie/648878",
    trailerEmbed: "https://www.youtube.com/watch?v=ytyBfsqN3eI",
    isSeries: false
  },
  {
    id: "Sound of Freedom",
    imdbId: "tt7599146",
    title: "Sound of Freedom",
    releaseDate: "2023-07-03",
    rating: 8,
    synopsis: "The story of Tim Ballard, a former US government agent, who quits his job in order to devote his life to rescuing children from global sex traffickers.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/qA5kPYZA7FkVvqcEfJRoOy4kpHg.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/7JqWWLCajnt6XWCrRlgvtsYP0u6.jpg",
    manualEmbed: "cos:movie/678512",
    trailerEmbed: "https://www.youtube.com/watch?v=hyyyKcfJRGQ",
    isSeries: false
  },
  {
    id: "The Old Guard",
    imdbId: "tt7556122",
    title: "The Old Guard",
    releaseDate: "2020-07-09",
    rating: 7.1,
    synopsis: "Four undying warriors who've secretly protected humanity for centuries become targeted for their mysterious powers just as they discover a new immortal.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/cjr4NWURcVN3gW5FlHeabgBHLrY.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/m0ObOaJBerZ3Unc74l471ar8Iiy.jpg",
    manualEmbed: "cos:movie/547016",
    trailerEmbed: "https://www.youtube.com/watch?v=aK-X2d0lJ_s",
    isSeries: false
  },
  {
    id: "The Harder They Fall",
    imdbId: "tt10696784",
    title: "The Harder They Fall",
    releaseDate: "2021-10-22",
    rating: 6.6,
    synopsis: "Gunning for revenge, outlaw Nat Love saddles up with his gang to take down enemy Rufus Buck, a ruthless crime boss who just got sprung from prison.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/su9WzL7lwUZPhjH6eZByAYFx2US.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/d0mpUFKzoPwF1KsdjHpkkaYSvKm.jpg",
    manualEmbed: "cos:movie/618162",
    trailerEmbed: "https://www.youtube.com/watch?v=Poc55U2RPMw",
    isSeries: false
  },
  {
    id: "Monster Hunter",
    imdbId: "tt6475714",
    title: "Monster Hunter",
    releaseDate: "2020-12-03",
    rating: 6.5,
    synopsis: "A portal transports Cpt. Artemis and an elite unit of soldiers to a strange world where powerful monsters rule with deadly ferocity. Faced with relentless danger, the team encounters a mysterious hunter who may be their only hope to find a way home.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/1UCOF11QCw8kcqvce8LKOO6pimh.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/8tNX8s3j1O0eqilOQkuroRLyOZA.jpg",
    manualEmbed: "cos:movie/458576",
    trailerEmbed: "https://www.youtube.com/watch?v=BeON-bSbrL4",
    isSeries: false
  },
  {
    id: "A Real Pain",
    imdbId: "tt21823606",
    title: "A Real Pain",
    releaseDate: "2024-11-01",
    rating: 6.8,
    synopsis: "Mismatched cousins David and Benji reunite for a tour through Poland to honor their beloved grandmother. The adventure takes a turn when the pair's old tensions resurface against the backdrop of their family history.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/yaTFjMNh8D78dDHrglivOTv5YOx.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/fViElUGfdoZjtnVxvSpJX8TwxY6.jpg",
    manualEmbed: "cos:movie/1013850",
    trailerEmbed: "https://www.youtube.com/watch?v=E_sjoa8aHpc",
    isSeries: false
  },
  {
    id: "Guillermo del Toro's Pinocchio",
    imdbId: "tt1488589",
    title: "Guillermo del Toro's Pinocchio",
    releaseDate: "2022-11-09",
    rating: 8,
    synopsis: "During the rise of fascism in Mussolini's Italy, a wooden boy brought magically to life struggles to live up to his father's expectations.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/vx1u0uwxdlhV2MUzj4VlcMB0N6m.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/e782pDRAlu4BG0ahd777n8zfPzZ.jpg",
    manualEmbed: "cos:movie/555604",
    trailerEmbed: "https://www.youtube.com/watch?v=Od2NW1sfRdA",
    isSeries: false
  },
  {
    id: "Nightmare Alley",
    imdbId: "tt7740496",
    title: "Nightmare Alley",
    releaseDate: "2021-12-02",
    rating: 6.9,
    synopsis: "An ambitious carnival man with a talent for manipulating people with a few well-chosen words hooks up with a female psychologist who is even more dangerous than he is.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/vfn1feL0V9HNSXuLLpaxAW8O6LO.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/g0YNGpmlXsgHfhGnJz3c5uyzZ1B.jpg",
    manualEmbed: "cos:movie/597208",
    trailerEmbed: "https://www.youtube.com/watch?v=Q81Yf46Oj3s",
    isSeries: false
  },
  {
    id: "Don't Worry Darling",
    imdbId: "tt10731256",
    title: "Don't Worry Darling",
    releaseDate: "2022-09-21",
    rating: 6.8,
    synopsis: "Alice and Jack are lucky to be living in the idealized community of Victory, the experimental company town housing the men who work for the top-secret Victory Project and their families. But when cracks in their idyllic life begin to appear, exposing flashes of something much more sinister lurking beneath the attractive façade, Alice can’t help questioning exactly what they’re doing in Victory, and why.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/wjAJWfuE5OQm5zerlOAbTxdHFMV.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/tfCNMP37jRX3TOetuce7FLkxNKa.jpg",
    manualEmbed: "cos:movie/619730",
    trailerEmbed: "https://www.youtube.com/watch?v=bW9aRVXIwaY",
    isSeries: false
  },
  {
    id: "M3GAN",
    imdbId: "tt8760708",
    title: "M3GAN",
    releaseDate: "2022-12-28",
    rating: 7,
    synopsis: "A brilliant toy company roboticist uses artificial intelligence to develop M3GAN, a life-like doll programmed to emotionally bond with her newly orphaned niece. But when the doll's programming works too well, she becomes overprotective of her new friend with terrifying results.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/d9nBoowhjiiYc4FBNtQkPY7c11H.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/qd4EKTuudkws9lW76Dn9C0tnuVA.jpg",
    manualEmbed: "cos:movie/536554",
    trailerEmbed: "https://www.youtube.com/watch?v=OoDHM_A1axc",
    isSeries: false
  },
  {
    id: "Immaculate",
    imdbId: "tt23137390",
    title: "Immaculate",
    releaseDate: "2024-03-20",
    rating: 6.2,
    synopsis: "An American nun embarks on a new journey when she joins a remote convent in the Italian countryside. However, her warm welcome quickly turns into a living nightmare when she discovers her new home harbours a sinister secret and unspeakable horrors.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/zyopv7D5j7cfswG0NYiA14qAdPC.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/oC198kEoJIctNCxtFYBzydKULmN.jpg",
    manualEmbed: "cos:movie/1041613",
    trailerEmbed: "https://www.youtube.com/watch?v=11gb7q1tosI",
    isSeries: false
  },
  {
    id: "Beau Is Afraid",
    imdbId: "tt13521006",
    title: "Beau Is Afraid",
    releaseDate: "2023-04-14",
    rating: 6.7,
    synopsis: "Following the sudden death of his mother, a mild-mannered but anxiety-ridden man confronts his darkest fears as he embarks on an epic odyssey back home.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/wgVkkjigF31r1nZV80uV0xNIoun.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/atvEgnjjXN5QvFDThXVz4nyU9yi.jpg",
    manualEmbed: "cos:movie/798286",
    trailerEmbed: "https://www.youtube.com/watch?v=XrCg9G_OHAA",
    isSeries: false
  },
  {
    id: "Love Lies Bleeding",
    imdbId: "tt19637052",
    title: "Love Lies Bleeding",
    releaseDate: "2024-03-07",
    rating: 6.6,
    synopsis: "Reclusive gym manager Lou falls hard for Jackie, an ambitious bodybuilder headed through town to Las Vegas in pursuit of her dream. But their love ignites violence, pulling them deep into the web of Lou’s criminal family.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/xImj8RLe39YK0lyVu9kXv7ApN8p.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/oMiKHO3H5RixfLsiU5Vumhlp5sj.jpg",
    manualEmbed: "cos:movie/948549",
    trailerEmbed: "https://www.youtube.com/watch?v=AULR_GPteNQ",
    isSeries: false
  },
  {
    id: "The Crow",
    imdbId: "tt1340094",
    title: "The Crow",
    releaseDate: "2024-08-21",
    rating: 5.8,
    synopsis: "Soulmates Eric and Shelly are brutally murdered when the demons of her dark past catch up with them. Given the chance to save his true love by sacrificing himself, Eric sets out to seek merciless revenge on their killers, traversing the worlds of the living and the dead to put the wrong things right.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/g8TbOXrNMuqq7AaKqdvqS2oG4ob.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/503LUrI9juBk1rktOPzxyMUTDEu.jpg",
    manualEmbed: "cos:movie/957452",
    trailerEmbed: "https://www.youtube.com/watch?v=4CLE3pWAAr8",
    isSeries: false
  },
  {
    id: "Heart of Stone",
    imdbId: "tt13603966",
    title: "Heart of Stone",
    releaseDate: "2023-08-09",
    rating: 6.7,
    synopsis: "An intelligence operative for a shadowy global peacekeeping agency races to stop a hacker from stealing its most valuable — and dangerous — weapon.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/vB8o2p4ETnrfiWEgVxHmHWP9yRl.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/m1k24MwmoqAdKMPJDaBLwdB5Tps.jpg",
    manualEmbed: "cos:movie/724209",
    trailerEmbed: "https://www.youtube.com/watch?v=LOHrNvFH3F8",
    isSeries: false
  },
  {
    id: "65",
    imdbId: "tt12261776",
    title: "65",
    releaseDate: "2023-03-02",
    rating: 6,
    synopsis: "65 million years ago, the only 2 survivors of a spaceship from Somaris that crash-landed on Earth, must fend off dinosaurs to reach the escape vessel in time before an imminent asteroid strike threatens to destroy the planet.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/rzRb63TldOKdKydCvWJM8B6EkPM.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/eSVu1FvGPy86TDo4hQbpuHx55DJ.jpg",
    manualEmbed: "cos:movie/700391",
    trailerEmbed: "https://www.youtube.com/watch?v=M6YfhX83Cj8",
    isSeries: false
  },
  {
    id: "The Apprentice",
    imdbId: "tt8368368",
    title: "The Apprentice",
    releaseDate: "2024-10-09",
    rating: 6.8,
    synopsis: "A young Donald Trump, eager to make his name as a hungry scion of a wealthy family in 1970s New York, comes under the spell of Roy Cohn, the cutthroat attorney who would help create the Donald Trump we know today. Cohn sees in Trump the perfect protégé—someone with raw ambition, a hunger for success, and a willingness to do whatever it takes to win.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/549Hdul2BgPnZMhqFxp6npp2opr.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/kv9xVrxfLpudBLyYf1QvLCpUQuy.jpg",
    manualEmbed: "cos:movie/1182047",
    trailerEmbed: "https://www.youtube.com/watch?v=bvPRxy9kmSg",
    isSeries: false
  },
  {
    id: "Rental Family",
    imdbId: "tt14142060",
    title: "Rental Family",
    releaseDate: "2025-11-20",
    rating: 7.7,
    synopsis: "An American actor in Tokyo struggles to find purpose until he lands an unusual gig: working for a Japanese 'rental family' agency, playing stand-in roles for strangers. As he immerses himself in his clients' worlds, he begins to form genuine bonds that blur the lines between performance and reality.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/A5lswNlytTUrnMWsuD0NFfhZlf3.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/euoXeFAOt9o7yAWA9zGZk7DdZWZ.jpg",
    manualEmbed: "cos:movie/1208348",
    trailerEmbed: "https://www.youtube.com/watch?v=dWSSjaIGdDI",
    isSeries: false
  },
  {
    id: "Chip 'n Dale: Rescue Rangers",
    imdbId: "tt3513500",
    title: "Chip 'n Dale: Rescue Rangers",
    releaseDate: "2022-05-20",
    rating: 7,
    synopsis: "Decades since their successful television series was canceled, Chip has succumbed to a life of suburban domesticity as an insurance salesman. Dale, meanwhile, has had CGI surgery and works the nostalgia convention circuit, desperate to relive his glory days. When a former cast mate mysteriously disappears, Chip and Dale must repair their broken friendship and take on their Rescue Rangers detective personas once again to save their friend’s life.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/7UGmn8TyWPPzkjhLUW58cOUHjPS.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/qK7Ssnrfvrt65F66A1thvehfQg2.jpg",
    manualEmbed: "cos:movie/420821",
    trailerEmbed: "https://www.youtube.com/watch?v=RW0xBFB-QLw",
    isSeries: false
  },
  {
    id: "The Unholy",
    imdbId: "tt9419056",
    title: "The Unholy",
    releaseDate: "2021-03-31",
    rating: 6.5,
    synopsis: "Alice is a young hearing-impaired girl who, after a supposed visitation from the Virgin Mary, is inexplicably able to hear, speak and heal the sick. As word spreads and people from near and far flock to witness her miracles, a disgraced journalist hoping to revive his career visits the small New England town to investigate. When terrifying events begin to happen all around, he starts to question if these phenomena are the works of the Virgin Mary or something much more sinister.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/bShgiEQoPnWdw4LBrYT5u18JF34.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/jw6ASGRT2gi8EjCImpGtbiJ9NQ9.jpg",
    manualEmbed: "cos:movie/632357",
    trailerEmbed: "https://www.youtube.com/watch?v=NmQiJPLYzPI",
    isSeries: false
  },
  {
    id: "Extraction",
    imdbId: "tt8936646",
    title: "Extraction",
    releaseDate: "2020-04-23",
    rating: 7.3,
    synopsis: "A hardened gun-for-hire's latest mission becomes a soul-searching race to survive when he's sent into Bangladesh to rescue a drug lord's kidnapped son.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/nygOUcBKPHFTbxsYRFZVePqgPK6.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/2QSZ4CPd8AoljAL76qM30dFft07.jpg",
    manualEmbed: "cos:movie/545609",
    trailerEmbed: "https://www.youtube.com/watch?v=L6P3nI6VnlY",
    isSeries: false
  },
  {
    id: "The Unforgivable",
    imdbId: "tt11233960",
    title: "The Unforgivable",
    releaseDate: "2021-11-24",
    rating: 7.4,
    synopsis: "A woman is released from prison after serving a sentence for a violent crime and re-enters a society that refuses to forgive her past.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/1b3dNFDuE7i05TJlXrIC571yR01.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/kbOB9DGl8qwhDRcXOmXfmcmadeD.jpg",
    manualEmbed: "cos:movie/645886",
    trailerEmbed: "https://www.youtube.com/watch?v=JNUjx7LZoiU",
    isSeries: false
  },
  {
    id: "Chaos Walking",
    imdbId: "tt2076822",
    title: "Chaos Walking",
    releaseDate: "2021-02-24",
    rating: 6.5,
    synopsis: "Two unlikely companions embark on a perilous adventure through the badlands of an unexplored planet as they try to escape a dangerous and disorienting reality, where all inner thoughts are seen and heard by everyone.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/xAYGdGBGptNkisXRpmhZSry6SPF.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/qCPLtXrTB10UsgAFxsWOB44gDPu.jpg",
    manualEmbed: "cos:movie/412656",
    trailerEmbed: "https://www.youtube.com/watch?v=nRf4ZgzHoVw",
    isSeries: false
  },
  {
    id: "Wrong Turn",
    imdbId: "tt9110170",
    title: "Wrong Turn",
    releaseDate: "2021-01-26",
    rating: 6,
    synopsis: "Jen and a group of friends set out to hike the Appalachian Trail. Despite warnings to stick to the trail, the hikers stray off course—and cross into land inhabited by The Foundation, a hidden community of mountain dwellers who use deadly means to protect their way of life.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/4U1SBHmwHkNA0eHZ2n1CuiC1K1g.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/8p8VIkTyeL9udfYJJHewWdhRLEO.jpg",
    manualEmbed: "cos:movie/630586",
    trailerEmbed: "https://www.youtube.com/watch?v=rDdGpjjtq-o",
    isSeries: false
  },
  {
    id: "STRAW",
    imdbId: "tt32550101",
    title: "STRAW",
    releaseDate: "2025-06-05",
    rating: 7.7,
    synopsis: "What will be her last straw? A devastatingly bad day pushes a hardworking single mother to the breaking point — and into a shocking act of desperation.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/t3cmnXYtxJb9vVL1ThvT2CWSe1n.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/fnbWrDx8w8Reau4F1tFqoGuGmDZ.jpg",
    manualEmbed: "cos:movie/1426776",
    trailerEmbed: "https://www.youtube.com/watch?v=k1vWhii4tkE",
    isSeries: false
  },
  {
    id: "Jackpot!",
    imdbId: "tt26940324",
    title: "Jackpot!",
    releaseDate: "2024-08-13",
    rating: 6.3,
    synopsis: "In the near future, a 'Grand Lottery' has been established - the catch: kill the winner before sundown to legally claim their multi-billion dollar jackpot. When Katie Kim mistakenly finds herself with the winning ticket, she reluctantly joins forces with amateur lottery protection agent Noel Cassidy who must get her to sundown in exchange for a piece of her prize.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/7vv0NTaQGOO7M5ZMerp1vMFJsby.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/7mQ13AV4qd6A43XxXfSoyYQMzhh.jpg",
    manualEmbed: "cos:movie/1094138",
    trailerEmbed: "https://www.youtube.com/watch?v=IW7pIYtpp50",
    isSeries: false
  },
  {
    id: "Ferrari",
    imdbId: "tt3758542",
    title: "Ferrari",
    releaseDate: "2023-12-14",
    rating: 6.4,
    synopsis: "Set during the summer of 1957. Ex-racecar driver, Enzo Ferrari, is in crisis. Bankruptcy stalks the company he and his wife, Laura, built from nothing ten years earlier. Their tempestuous marriage struggles with the mourning for one son and the acknowledgement of another.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/LyCOcGqOTyTmaXu2TK8LfGveIb.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/du11oPPbEoDnUpiREO5tUg47rJd.jpg",
    manualEmbed: "cos:movie/365620",
    trailerEmbed: "https://www.youtube.com/watch?v=8oOVNMjM1Jk",
    isSeries: false
  },
  {
    id: "The Call of the Wild",
    imdbId: "tt7504726",
    title: "The Call of the Wild",
    releaseDate: "2020-02-19",
    rating: 7.5,
    synopsis: "Buck is a big-hearted dog whose blissful domestic life is turned upside down when he is suddenly uprooted from his California home and transplanted to the exotic wilds of the Yukon during the Gold Rush of the 1890s. As the newest rookie on a mail delivery dog sled team—and later its leader—Buck experiences the adventure of a lifetime, ultimately finding his true place in the world and becoming his own master.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/33VdppGbeNxICrFUtW2WpGHvfYc.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/1GZCV0dwIoAn6jpWPfVAbeMTVC2.jpg",
    manualEmbed: "cos:movie/481848",
    trailerEmbed: "https://www.youtube.com/watch?v=5P8R2zAhEwg",
    isSeries: false
  },
  {
    id: "Bones and All",
    imdbId: "tt10168670",
    title: "Bones and All",
    releaseDate: "2022-11-18",
    rating: 7,
    synopsis: "Abandoned by her father, a young woman embarks on a thousand-mile odyssey through the backroads of America where she meets a disenfranchised drifter. But despite their best efforts, all roads lead back to their terrifying pasts and to a final stand that will determine whether their love can survive their otherness.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/dBQuk2LkHjrDsSjueirPQg96GCc.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/8sPxa4sdRvjgRG3GgkO8RQxUR9P.jpg",
    manualEmbed: "cos:movie/791177",
    trailerEmbed: "https://www.youtube.com/watch?v=0Nu7Z9AxGNg",
    isSeries: false
  },
  {
    id: "Halloween Kills",
    imdbId: "tt10665338",
    title: "Halloween Kills",
    releaseDate: "2021-10-14",
    rating: 6.4,
    synopsis: "Michael manages to free himself from Laurie Strode's trap to resume his ritual bloodbath. As she fights for her life from injuries from their last encounter, she inspires her daughter Karen, her granddaughter Allyson, and all of Haddonfield to rise up against the unstoppable monster.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/ir9eyz1mtgsohjvo7UYtqUfFuES.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/fuuZFPc8x6gQ8mLGoBp9vrmcQMT.jpg",
    manualEmbed: "cos:movie/610253",
    trailerEmbed: "https://www.youtube.com/watch?v=hL6R3HmQfPc",
    isSeries: false
  },
  {
    id: "The Life of Chuck",
    imdbId: "tt12908150",
    title: "The Life of Chuck",
    releaseDate: "2025-06-02",
    rating: 7.3,
    synopsis: "In this extraordinary story of an ordinary man, Charles 'Chuck' Krantz experiences the wonder of love, the heartbreak of loss, and the multitudes contained in all of us.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/oumprkO9bThExP8NwxBIBnvBu2v.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/1SgD8XMa6dDSBKbPU4TDe2cmfGK.jpg",
    manualEmbed: "cos:movie/842924",
    trailerEmbed: "https://www.youtube.com/watch?v=jlN1Mmj6YNo",
    isSeries: false
  },
  {
    id: "The Bikeriders",
    imdbId: "tt21454134",
    title: "The Bikeriders",
    releaseDate: "2024-06-19",
    rating: 6.7,
    synopsis: "After a chance encounter, headstrong Kathy is drawn to Benny, member of Midwestern motorcycle club the Vandals. As the club transforms into a dangerous underworld of violence, Benny must choose between Kathy and his loyalty to the club.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/ApMuukdDAOR2rgaFDZIcjfigi64.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/kwGvFyRtGSSm8AFfnRNXoZTQmJj.jpg",
    manualEmbed: "cos:movie/1008409",
    trailerEmbed: "https://www.youtube.com/watch?v=7W0ec8UMnfg",
    isSeries: false
  },
  {
    id: "Good Fortune",
    imdbId: "tt27543578",
    title: "Good Fortune",
    releaseDate: "2025-10-14",
    rating: 6.9,
    synopsis: "A well-meaning but rather inept angel named Gabriel meddles in the lives of a struggling gig worker and a wealthy capitalist.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/rywxUbd4zvHiRP7nOHeDzuQSLIZ.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/nkxtuK4alXlGC87FRNDfAZJIFiB.jpg",
    manualEmbed: "cos:movie/1114967",
    trailerEmbed: "https://www.youtube.com/watch?v=SAMkXY2Ja80",
    isSeries: false
  },
  {
    id: "Plane",
    imdbId: "tt5884796",
    title: "Plane",
    releaseDate: "2023-01-11",
    rating: 6.9,
    synopsis: "After a heroic job of successfully landing his storm-damaged aircraft in a war zone, a fearless pilot finds himself between the agendas of multiple militias planning to take the plane and its passengers hostage.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/oJRsTQR47pyjSJCZYpOfbycpNBR.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/6JU2ysRVOHqav0Hs6BUv4mvvDxZ.jpg",
    manualEmbed: "cos:movie/646389",
    trailerEmbed: "https://www.youtube.com/watch?v=7-6_Ulo7mdk",
    isSeries: false
  },
  {
    id: "Dream Scenario",
    imdbId: "tt21942866",
    title: "Dream Scenario",
    releaseDate: "2023-11-10",
    rating: 6.7,
    synopsis: "Hapless family man Paul Matthews finds his life turned upside down when millions of strangers suddenly start seeing him in their dreams. But when his nighttime appearances take a nightmarish turn, Paul is forced to navigate his newfound stardom.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/eMaAi8wTI5wON8pp33w3BDuGyZ8.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/2WRe1y5S1jGWTKUcSPPmD1Ixq56.jpg",
    manualEmbed: "cos:movie/823482",
    trailerEmbed: "https://www.youtube.com/watch?v=q3x9iUL-74w",
    isSeries: false
  },
  {
    id: "Escape Room: Tournament of Champions",
    imdbId: "tt9844522",
    title: "Escape Room: Tournament of Champions",
    releaseDate: "2021-07-01",
    rating: 6.5,
    synopsis: "Six people unwittingly find themselves locked in another series of escape rooms, slowly uncovering what they have in common to survive... and discovering they've all played the games before.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/jGYJyPzVgrVV2bgClI9uvEZgVLE.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/qo9tN87uTsbXnaAob6aa7U33ayb.jpg",
    manualEmbed: "cos:movie/585216",
    trailerEmbed: "https://www.youtube.com/watch?v=KlfUbZJVInA",
    isSeries: false
  },
  {
    id: "Old",
    imdbId: "tt10954652",
    title: "Old",
    releaseDate: "2021-07-21",
    rating: 6.3,
    synopsis: "A group of families on a tropical holiday discover that the secluded beach where they are staying is somehow causing them to age rapidly – reducing their entire lives into a single day.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/vclShucpUmPhdAOmKgf3B3Z4POD.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/32yqxyLlWcO81UCx51Jfq9aeJdA.jpg",
    manualEmbed: "cos:movie/631843",
    trailerEmbed: "https://www.youtube.com/watch?v=A4U2pMRV9_k",
    isSeries: false
  },
  {
    id: "Harry Potter 20th Anniversary: Return to Hogwarts",
    imdbId: "tt16116174",
    title: "Harry Potter 20th Anniversary: Return to Hogwarts",
    releaseDate: "2022-01-01",
    rating: 7.3,
    synopsis: "An enchanting making-of story told through all-new in-depth interviews and cast conversations, inviting fans on a magical first-person journey through one of the most beloved film franchises of all time.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/jntLBq0MLR3hrwKaTQswxACRPMs.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/8rft8A9nH43IReybFtYt21ezfMK.jpg",
    manualEmbed: "cos:movie/899082",
    trailerEmbed: "https://www.youtube.com/watch?v=fFGS4zZWGoA",
    isSeries: false
  },
  {
    id: "The Strangers: Chapter 1",
    imdbId: "tt22050754",
    title: "The Strangers: Chapter 1",
    releaseDate: "2024-05-15",
    rating: 5.7,
    synopsis: "After their car breaks down in an eerie small town, a young couple are forced to spend the night in a remote cabin. Panic ensues as they are terrorized by three masked strangers who strike with no mercy and seemingly no motives.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/oYsCNpW4k7Pd7ac3uQfBhr2ihtW.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/59AJ2w9tKRSbBpnxKfB5UyIg6Jf.jpg",
    manualEmbed: "cos:movie/1010600",
    trailerEmbed: "https://www.youtube.com/watch?v=3pZUQmZdOi4",
    isSeries: false
  },
  {
    id: "Strange World",
    imdbId: "tt10298840",
    title: "Strange World",
    releaseDate: "2022-11-23",
    rating: 6.2,
    synopsis: "A journey deep into an uncharted and treacherous land, where fantastical creatures await the legendary Clades—a family of explorers whose differences threaten to topple their latest, and by far most crucial, mission.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/a9x70QUXs6uEwtin1SGNKoFXoia.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/5wDBVictj4wUYZ31gR5WzCM9dLD.jpg",
    manualEmbed: "cos:movie/877269",
    trailerEmbed: "https://www.youtube.com/watch?v=jP3Ea3sMiUE",
    isSeries: false
  },
  {
    id: "Underwater",
    imdbId: "tt5774060",
    title: "Underwater",
    releaseDate: "2020-01-08",
    rating: 6.3,
    synopsis: "After an earthquake destroys their underwater station, six researchers must navigate two miles along the dangerous, unknown depths of the ocean floor to make it to safety in a race against time.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/gzlbb3yeVISpQ3REd3Ga1scWGTU.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/tya34K7D4jtDrVbvExyvTx97Aen.jpg",
    manualEmbed: "cos:movie/443791",
    trailerEmbed: "https://www.youtube.com/watch?v=jCFWEzIVILc",
    isSeries: false
  },
  {
    id: "Hocus Pocus 2",
    imdbId: "tt11909878",
    title: "Hocus Pocus 2",
    releaseDate: "2022-09-27",
    rating: 7.1,
    synopsis: "29 years since the Black Flame Candle was last lit, the 17th-century Sanderson sisters are resurrected, and they are looking for revenge. Now it's up to three high school students to stop the ravenous witches from wreaking a new kind of havoc on Salem before dawn on All Hallow's Eve.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/7ze7YNmUaX81ufctGqt0AgHxRtL.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/ml8YBTJq7UkALfI022FWscCQuQW.jpg",
    manualEmbed: "cos:movie/642885",
    trailerEmbed: "https://www.youtube.com/watch?v=idc0EOmKr30",
    isSeries: false
  },
  {
    id: "Den of Thieves 2: Pantera",
    imdbId: "tt8008948",
    title: "Den of Thieves 2: Pantera",
    releaseDate: "2025-01-08",
    rating: 6.6,
    synopsis: "Big Nick is back on the hunt in Europe and closing in on Donnie, who is embroiled in the treacherous and unpredictable world of diamond thieves and the infamous Panther mafia, as they plot a massive heist of the world's largest diamond exchange.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/rxcyxxarD17xMliStDEhM6y2AYQ.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/1mCEzHxDcJdkM3Ye7CTeZ04HVBB.jpg",
    manualEmbed: "cos:movie/604685",
    trailerEmbed: "https://www.youtube.com/watch?v=KG1tks1ICiA",
    isSeries: false
  },
  {
    id: "Havoc",
    imdbId: "tt14123284",
    title: "Havoc",
    releaseDate: "2025-04-25",
    rating: 6.4,
    synopsis: "When a drug heist swerves lethally out of control, a jaded cop fights his way through a corrupt city's criminal underworld to save a politician's son.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/r46leE6PSzLR3pnVzaxx5Q30yUF.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/7rKyFSg6SdLoCRCVoWLjL5k658k.jpg",
    manualEmbed: "cos:movie/668489",
    trailerEmbed: "https://www.youtube.com/watch?v=6txjTWLoSc8",
    isSeries: false
  },
  {
    id: "Licorice Pizza",
    imdbId: "tt11271038",
    title: "Licorice Pizza",
    releaseDate: "2021-11-26",
    rating: 6.9,
    synopsis: "The story of Gary Valentine and Alana Kane growing up, running around and going through the treacherous navigation of first love in the San Fernando Valley, 1973.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/ivXtvzfliGvoJ1DhSHIGyYBToWe.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/fkn5KBUUKxbG7MjOs9poAOAik40.jpg",
    manualEmbed: "cos:movie/718032",
    trailerEmbed: "https://www.youtube.com/watch?v=ofnXPwUPENo",
    isSeries: false
  },
  {
    id: "Strays",
    imdbId: "tt15153532",
    title: "Strays",
    releaseDate: "2023-08-17",
    rating: 7.2,
    synopsis: "When Reggie is abandoned on the mean city streets by his lowlife owner, Doug, Reggie is certain that his beloved owner would never leave him on purpose. But once Reggie falls in with Bug, a fast-talking, foul-mouthed stray who loves his freedom and believes that owners are for suckers, Reggie finally realizes he was in a toxic relationship and begins to see Doug for the heartless sleazeball that he is.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/n1hqbSCtyBAxaXEl1Dj3ipXJAJG.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/1HzL603WOer58xtnrRYdSIL5K04.jpg",
    manualEmbed: "cos:movie/912908",
    trailerEmbed: "https://www.youtube.com/watch?v=26Xq6_g2r6Q",
    isSeries: false
  },
  {
    id: "After Ever Happy",
    imdbId: "tt13070038",
    title: "After Ever Happy",
    releaseDate: "2022-08-24",
    rating: 6.8,
    synopsis: "As a shocking truth about a couple's families emerges, the two lovers discover they are not so different from each other. Tessa is no longer the sweet, simple, good girl she was when she met Hardin — any more than he is the cruel, moody boy she fell so hard for.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/moogpu8rNkEjTgFyLXwhPghft5w.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/rwgmDkIEv8VjAsWx25ottJrFvpO.jpg",
    manualEmbed: "cos:movie/744276",
    trailerEmbed: "https://www.youtube.com/watch?v=hLQ-5exgctI",
    isSeries: false
  },
  {
    id: "The Ice Road",
    imdbId: "tt3758814",
    title: "The Ice Road",
    releaseDate: "2021-06-24",
    rating: 6.7,
    synopsis: "After a remote diamond mine collapses in far northern Canada, an ice road driver must lead an impossible rescue mission over a frozen ocean to save the trapped miners.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/gl1dlX9sKYpiKujq80Yxve7l4yg.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/klQJJGLRxyZUoiWusZ5GA3qAtiq.jpg",
    manualEmbed: "cos:movie/646207",
    trailerEmbed: "https://www.youtube.com/watch?v=_XfS6kjoM24",
    isSeries: false
  },
  {
    id: "Wolfs",
    imdbId: "tt14257582",
    title: "Wolfs",
    releaseDate: "2024-09-20",
    rating: 6.5,
    synopsis: "Hired to cover up a high-profile crime, a fixer soon finds his night spiralling out of control when he's forced to work with an unexpected counterpart.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/vOX1Zng472PC2KnS0B9nRfM8aaZ.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/nSVwus6Vcnw06zqKAa1ioacrpUF.jpg",
    manualEmbed: "cos:movie/877817",
    trailerEmbed: "https://www.youtube.com/watch?v=5RSUcuGIiI0",
    isSeries: false
  },
  {
    id: "Leave the World Behind",
    imdbId: "tt12747748",
    title: "Leave the World Behind",
    releaseDate: "2023-11-22",
    rating: 6.4,
    synopsis: "A family's getaway to a luxurious rental home takes an ominous turn when a cyberattack knocks out their devices—and two strangers appear at their door.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/29rhl1xopxA7JlGVVsf1UHfYPvN.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/5cRw2QHQz5bp7W2KLdSpZoFoTTw.jpg",
    manualEmbed: "cos:movie/726209",
    trailerEmbed: "https://www.youtube.com/watch?v=xM4ILvKeTxs",
    isSeries: false
  },
  {
    id: "Honest Thief",
    imdbId: "tt1838556",
    title: "Honest Thief",
    releaseDate: "2020-09-03",
    rating: 6.5,
    synopsis: "A bank robber tries to turn himself in because he's falling in love and wants to live an honest life...but when he realizes the Feds are more corrupt than him, he must fight back to clear his name.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/zeD4PabP6099gpE0STWJrJrCBCs.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/2M2JxEv3HSpjnZWjY9NOdGgfUd.jpg",
    manualEmbed: "cos:movie/553604",
    trailerEmbed: "https://www.youtube.com/watch?v=_TLtcw7ixRc",
    isSeries: false
  },
  {
    id: "The Protégé",
    imdbId: "tt6079772",
    title: "The Protégé",
    releaseDate: "2021-08-19",
    rating: 6.6,
    synopsis: "Rescued as a child by the legendary assassin Moody and trained in the family business, Anna is the world’s most skilled contract killer. When Moody, the man who was like a father to her and taught her everything she needs to know about trust and survival, is brutally killed, Anna vows revenge. As she becomes entangled with an enigmatic killer whose attraction to her goes way beyond cat and mouse, their confrontation turns deadly and the loose ends of a life spent killing will weave themselves ever tighter.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/iQUj7MptHUlcXpaMLrqRNZRxGA9.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/fbTxsnJcQwuwzCEu9VEiU9lV75Y.jpg",
    manualEmbed: "cos:movie/645788",
    trailerEmbed: "https://www.youtube.com/watch?v=fSqa0a3mGk8",
    isSeries: false
  },
  {
    id: "Rebel Moon - Part Two: The Scargiver",
    imdbId: "tt23137904",
    title: "Rebel Moon - Part Two: The Scargiver",
    releaseDate: "2024-04-19",
    rating: 6,
    synopsis: "The rebels gear up for battle against the ruthless forces of the Motherworld as unbreakable bonds are forged, heroes emerge — and legends are made.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/95gnJZIk2rEkMO0Ch46x5CVjnms.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/FUnAVgaTs5xZWXcVzPJNxd9qGA.jpg",
    manualEmbed: "cos:movie/934632",
    trailerEmbed: "https://www.youtube.com/watch?v=zUTQ8atM_9U",
    isSeries: false
  },
  {
    id: "All of Us Strangers",
    imdbId: "tt21192142",
    title: "All of Us Strangers",
    releaseDate: "2023-12-22",
    rating: 7.4,
    synopsis: "One night in his near-empty tower block in contemporary London, Adam has a chance encounter with a mysterious neighbor, which punctures the rhythm of his everyday life.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/aviJMFZSnnCAsCVyJGaPNx4Ef3i.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/8yjHiSuSEhzR916LcIecuQ8tETG.jpg",
    manualEmbed: "cos:movie/994108",
    trailerEmbed: "https://www.youtube.com/watch?v=ukYlZuKn-mc",
    isSeries: false
  },
  {
    id: "Wolf Man",
    imdbId: "tt4216984",
    title: "Wolf Man",
    releaseDate: "2025-01-15",
    rating: 6.1,
    synopsis: "With his marriage fraying, Blake persuades his wife Charlotte to take a break from the city and visit his remote childhood home in rural Oregon. As they arrive at the farmhouse in the dead of night, they're attacked by an unseen animal and barricade themselves inside the home as the creature prowls the perimeter. But as the night stretches on, Blake begins to behave strangely, transforming into something unrecognizable.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/wpSDzTBfF0Eeo5lzu2w9FTujGqd.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/wwARk7hRIfHfh2n2ubN6N7lvTne.jpg",
    manualEmbed: "cos:movie/710295",
    trailerEmbed: "https://www.youtube.com/watch?v=kAw4PH2IQgo",
    isSeries: false
  },
  {
    id: "MaXXXine",
    imdbId: "tt22048412",
    title: "MaXXXine",
    releaseDate: "2024-07-04",
    rating: 6.3,
    synopsis: "In 1980s Hollywood, adult film star and aspiring actress Maxine Minx finally gets her big break. But as a mysterious killer stalks the starlets of Hollywood, a trail of blood threatens to reveal her sinister past.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/ArvoFK6nlouZRxYmtIOUzKIrg90.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/viKEEaaCaZ0hZ2nGuvIEozlLooL.jpg",
    manualEmbed: "cos:movie/1023922",
    trailerEmbed: "https://www.youtube.com/watch?v=qGxKjwAnn5I",
    isSeries: false
  },
  {
    id: "Juror #2",
    imdbId: "tt27403986",
    title: "Juror #2",
    releaseDate: "2024-10-30",
    rating: 6.9,
    synopsis: "While serving as a juror in a high profile murder trial, family man Justin Kemp finds himself struggling with a serious moral dilemma…one he could use to sway the jury verdict and potentially convict—or free—the accused killer.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/ugQkpGajKFQ8eyOEhGheR0HfWQ.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/wHXyGLjYPm4bHNKFQPCfYWiTeSH.jpg",
    manualEmbed: "cos:movie/1106739",
    trailerEmbed: "https://www.youtube.com/watch?v=czYUXo0R0oA",
    isSeries: false
  },
  {
    id: "The Empty Man",
    imdbId: "tt5867314",
    title: "The Empty Man",
    releaseDate: "2020-10-22",
    rating: 6.2,
    synopsis: "On the trail of a missing girl, an ex-cop comes across a secretive group attempting to summon a terrifying supernatural entity.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/8apzu9JFTUMtOpYkHk6LNPOs3pY.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/hwpbTeZEaKKUfiUjc2FJZpv7uAI.jpg",
    manualEmbed: "cos:movie/516632",
    trailerEmbed: "https://www.youtube.com/watch?v=aistYRvIml0",
    isSeries: false
  },
  {
    id: "Air",
    imdbId: "tt16419074",
    title: "Air",
    releaseDate: "2023-04-05",
    rating: 7.3,
    synopsis: "Discover the game-changing partnership between a then undiscovered Michael Jordan and Nike's fledgling basketball division which revolutionized the world of sports and culture with the Air Jordan brand.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/76AKQPdH3M8cvsFR9K8JsOzVlY5.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/aT3sRVqgpkyCo23fp9myVfKPWbA.jpg",
    manualEmbed: "cos:movie/964980",
    trailerEmbed: "https://www.youtube.com/watch?v=Euy4Yu6B3nU",
    isSeries: false
  },
  {
    id: "Palm Springs",
    imdbId: "tt9484998",
    title: "Palm Springs",
    releaseDate: "2020-07-10",
    rating: 7.3,
    synopsis: "When carefree Nyles and reluctant maid of honor Sarah have a chance encounter at a Palm Springs wedding, things get complicated when they find themselves unable to escape the venue, themselves, or each other.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/gnAfqiV7yO3Jq9IntTmwkcaICqc.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/d7JUXVvjvVCXWs1mlpyO5ESdWdT.jpg",
    manualEmbed: "cos:movie/587792",
    trailerEmbed: "https://www.youtube.com/watch?v=CpBLtXduh_k",
    isSeries: false
  },
  {
    id: "Knock at the Cabin",
    imdbId: "tt15679400",
    title: "Knock at the Cabin",
    releaseDate: "2023-02-01",
    rating: 6.2,
    synopsis: "While vacationing at a remote cabin, a young girl and her two fathers are taken hostage by four armed strangers who demand that the family make an unthinkable choice to avert the apocalypse. With limited access to the outside world, the family must decide what they believe before all is lost.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/dm06L9pxDOL9jNSK4Cb6y139rrG.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/sANUefL2v8VI6fSfK3gWAG3XBt4.jpg",
    manualEmbed: "cos:movie/631842",
    trailerEmbed: "https://www.youtube.com/watch?v=gv_QhoUy-xc",
    isSeries: false
  },
  {
    id: "Renfield",
    imdbId: "tt11358390",
    title: "Renfield",
    releaseDate: "2023-04-07",
    rating: 6.4,
    synopsis: "Having grown sick and tired of his centuries as Dracula's lackey, Renfield finds a new lease on life — and maybe even redemption — when he falls for feisty, perennially angry traffic cop Rebecca Quincy.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/p6yUjhvNGQpFZilKwOKbxQ1eHlo.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/nHbsOoAESokKFaIPQGGHR0jJiAP.jpg",
    manualEmbed: "cos:movie/649609",
    trailerEmbed: "https://www.youtube.com/watch?v=OkMep-7CXCI",
    isSeries: false
  },
  {
    id: "Moonfall",
    imdbId: "tt5834426",
    title: "Moonfall",
    releaseDate: "2022-02-02",
    rating: 6.3,
    synopsis: "A mysterious force knocks the moon from its orbit around Earth and sends it hurtling on a collision course with life as we know it.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/odVv1sqVs0KxBXiA8bhIBlPgalx.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/8QpzqK3nPGxpqpKqhe6QasTGBWQ.jpg",
    manualEmbed: "cos:movie/406759",
    trailerEmbed: "https://www.youtube.com/watch?v=ivIwdQBlS10",
    isSeries: false
  },
  {
    id: "Purple Hearts",
    imdbId: "tt4614584",
    title: "Purple Hearts",
    releaseDate: "2022-07-29",
    rating: 8,
    synopsis: "An aspiring musician agrees to a marriage of convenience with a soon-to-deploy Marine, but a tragedy soon turns their fake relationship all too real.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/4JyNWkryifWbWXJyxcWh3pVya6N.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/jdZM1Gs6DtRGvosgqaXRrIkvYX7.jpg",
    manualEmbed: "cos:movie/762975",
    trailerEmbed: "https://www.youtube.com/watch?v=WTLgg8oRSBE",
    isSeries: false
  },
  {
    id: "House of Gucci",
    imdbId: "tt11214590",
    title: "House of Gucci",
    releaseDate: "2021-11-24",
    rating: 6.6,
    synopsis: "When Patrizia Reggiani, an outsider from humble beginnings, marries into the Gucci family, her unbridled ambition begins to unravel the family legacy and triggers a reckless spiral of betrayal, decadence, revenge, and ultimately… murder.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/oJCQjD2byiVF1EG408F9dBn9ndU.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/6VZF8JVNOgJX56WCapYaqcVQiAw.jpg",
    manualEmbed: "cos:movie/644495",
    trailerEmbed: "https://www.youtube.com/watch?v=eGNnpVKxV6s",
    isSeries: false
  },
  {
    id: "Late Night with the Devil",
    imdbId: "tt14966898",
    title: "Late Night with the Devil",
    releaseDate: "2024-03-19",
    rating: 7.1,
    synopsis: "A live broadcast of a late-night talk show in 1977 goes horribly wrong, unleashing evil into the nation's living rooms.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/mu8LRWT9GHkfiyHm7kgxT6YNvMW.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/umyOinNa6vqqnqoVc9QqzyaapUz.jpg",
    manualEmbed: "cos:movie/938614",
    trailerEmbed: "https://www.youtube.com/watch?v=YeKYfneOH3o",
    isSeries: false
  },
  {
    id: "Murder Mystery 2",
    imdbId: "tt15255288",
    title: "Murder Mystery 2",
    releaseDate: "2023-03-28",
    rating: 6.4,
    synopsis: "After starting their own detective agency, Nick and Audrey Spitz land a career-making case when their billionaire pal is kidnapped from his wedding.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/s1VzVhXlqsevi8zeCMG9A16nEUf.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/AwB7HGeDTrBGkP2WEnNwg8Wa0E4.jpg",
    manualEmbed: "cos:movie/638974",
    trailerEmbed: "https://www.youtube.com/watch?v=LM2F56uK0fs",
    isSeries: false
  },
  {
    id: "Malignant",
    imdbId: "tt3811906",
    title: "Malignant",
    releaseDate: "2021-09-01",
    rating: 6.7,
    synopsis: "Madison is paralyzed by shocking visions of grisly murders, and her torment worsens as she discovers that these waking dreams are in fact terrifying realities with a mysterious tie to her past.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/dGv2BWjzwAz6LB8a8JeRIZL8hSz.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/xnyGhzrfqENfFoiNZ9z4oy63Z9F.jpg",
    manualEmbed: "cos:movie/619778",
    trailerEmbed: "https://www.youtube.com/watch?v=IGP7AB776CQ",
    isSeries: false
  },
  {
    id: "Wolfwalkers",
    imdbId: "tt5198068",
    title: "Wolfwalkers",
    releaseDate: "2020-10-26",
    rating: 8.2,
    synopsis: "In a time of superstition and magic, when wolves are seen as demonic and nature an evil to be tamed, a young apprentice hunter comes to Ireland with her father to wipe out the last pack. But when she saves a wild native girl, their friendship leads her to discover the world of the Wolfwalkers and transform her into the very thing her father is tasked to destroy.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/vqGiNbdc2sDwsnivMMYzwAoSSu6.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/3zTbERSBLh7waK9811RTKGAcG86.jpg",
    manualEmbed: "cos:movie/441130",
    trailerEmbed: "https://www.youtube.com/watch?v=d_Z_tybgPgg",
    isSeries: false
  },
  {
    id: "Night Swim",
    imdbId: "tt9682428",
    title: "Night Swim",
    releaseDate: "2024-01-03",
    rating: 5.5,
    synopsis: "Forced into early retirement by a degenerative illness, former baseball player Ray Waller moves into a new house with his wife and two children. He hopes that the backyard swimming pool will be fun for the kids and provide physical therapy for himself. However, a dark secret from the home's past soon unleashes a malevolent force that drags the family into the depths of inescapable terror.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/gSkfBGdxdialBMM7P02V4hcI6Ij.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/aZ8dBIvpDFp9cp23MfBiY5mWfuy.jpg",
    manualEmbed: "cos:movie/1072342",
    trailerEmbed: "https://www.youtube.com/watch?v=PhlLO3Nb3sY",
    isSeries: false
  },
  {
    id: "Promising Young Woman",
    imdbId: "tt9620292",
    title: "Promising Young Woman",
    releaseDate: "2020-12-13",
    rating: 7.4,
    synopsis: "A young woman, traumatized by a tragic event in her past, seeks out vengeance against those who crossed her path.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/2h4EkRxy36zSsBDkijXSUMJFDaz.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/gESm6yc2MZpSXakgqLF0OlLaRn1.jpg",
    manualEmbed: "cos:movie/582014",
    trailerEmbed: "https://www.youtube.com/watch?v=we5yV7Gc9rY",
    isSeries: false
  },
  {
    id: "Better Man",
    imdbId: "tt14260836",
    title: "Better Man",
    releaseDate: "2024-12-06",
    rating: 7.6,
    synopsis: "Follow Robbie Williams' journey from childhood, to being the youngest member of chart-topping boyband Take That, through to his unparalleled achievements as a record-breaking solo artist – all the while confronting the challenges that stratospheric fame and success can bring.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/fbGCmMp0HlYnAPv28GOENPShezM.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/wP0NGOGf2PG4lHXHWEqFW0kBOye.jpg",
    manualEmbed: "cos:movie/799766",
    trailerEmbed: "https://www.youtube.com/watch?v=KVeH5T4wxkE",
    isSeries: false
  },
  {
    id: "Enola Holmes 2",
    imdbId: "tt14641788",
    title: "Enola Holmes 2",
    releaseDate: "2022-11-03",
    rating: 7.4,
    synopsis: "Enola takes on her first official case as a detective, but to solve the mystery of a missing girl, she'll need help from friends — and brother Sherlock.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/tegBpjM5ODoYoM1NjaiHVLEA0QM.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/rjlG7C5GZfXutoVoE3BJaYGUhk4.jpg",
    manualEmbed: "cos:movie/829280",
    trailerEmbed: "https://www.youtube.com/watch?v=0DIftINqIjo",
    isSeries: false
  },
  {
    id: "Boss Level",
    imdbId: "tt7638348",
    title: "Boss Level",
    releaseDate: "2021-02-19",
    rating: 6.9,
    synopsis: "A former special forces agent is trapped in a time loop and relives his death over and over again. To escape the terrible situation, he must track down those responsible and stop them.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/nt8on8Ge0Lsw0oF6EbmGiDV69Hf.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/1Yc5hIRh3skhsEKLbCHE7v1FBOa.jpg",
    manualEmbed: "cos:movie/513310",
    trailerEmbed: "https://www.youtube.com/watch?v=LfRCwf1VtBE",
    isSeries: false
  },
  {
    id: "The Addams Family 2",
    imdbId: "tt11125620",
    title: "The Addams Family 2",
    releaseDate: "2021-10-01",
    rating: 6.9,
    synopsis: "The Addams get tangled up in more wacky adventures and find themselves involved in hilarious run-ins with all sorts of unsuspecting characters.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/ld7YB9vBRp1GM1DT3KmFWSmtBPB.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/wfrfxivLOBtGMC98tIr2LSOeKSe.jpg",
    manualEmbed: "cos:movie/639721",
    trailerEmbed: "https://www.youtube.com/watch?v=946LiJiMQrQ",
    isSeries: false
  },
  {
    id: "Three Thousand Years of Longing",
    imdbId: "tt9198364",
    title: "Three Thousand Years of Longing",
    releaseDate: "2022-08-24",
    rating: 6.9,
    synopsis: "A solitary scholar discovers an ancient bottle while on a trip to Istanbul and unleashes a djinn who offers her three wishes. Filled with reluctance, she is unable to come up with one, so the djinn tries to inspire her with his stories.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/nS7DNl4A7XnDncZX70UJ8ALAihF.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/90IcDDC47Rck4D2fyZbpZ1rbFZW.jpg",
    manualEmbed: "cos:movie/556694",
    trailerEmbed: "https://www.youtube.com/watch?v=TWGvntl9itE",
    isSeries: false
  },
  {
    id: "The Invitation",
    imdbId: "tt12873562",
    title: "The Invitation",
    releaseDate: "2022-08-24",
    rating: 6,
    synopsis: "After the death of her mother, Evie is approached by an unknown cousin who invites her to a lavish wedding in the English countryside. Soon, she realizes a gothic conspiracy is afoot and must fight for survival as she uncovers twisted secrets in her family’s history.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/jcTq6gIskCsHlKDvCKKouEfiU66.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/wqlwSAATTZTYA60OSeTKsj4ChZh.jpg",
    manualEmbed: "cos:movie/830788",
    trailerEmbed: "https://www.youtube.com/watch?v=9Fzczrdt9K0",
    isSeries: false
  },
  {
    id: "Freaky",
    imdbId: "tt10919380",
    title: "Freaky",
    releaseDate: "2020-11-12",
    rating: 6.5,
    synopsis: "A mystical, ancient dagger causes a notorious serial killer to magically switch bodies with a 17-year-old girl.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/8xC6QSyxrpm0D5A6iyHNemEWBVe.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/ngpC8wikrZDnhjkFQMEjWSh7HAV.jpg",
    manualEmbed: "cos:movie/551804",
    trailerEmbed: "https://www.youtube.com/watch?v=EqPnIcDW9g0",
    isSeries: false
  },
  {
    id: "We Can Be Heroes",
    imdbId: "tt10600398",
    title: "We Can Be Heroes",
    releaseDate: "2020-12-25",
    rating: 5.9,
    synopsis: "When alien invaders capture Earth's superheroes, their kids must learn to work together to save their parents - and the planet.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/1S21HpcKY6uQ9UAw68aICmrJaq6.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/y6FYAhaeFMj9Lsk8OdF2NeWQkbd.jpg",
    manualEmbed: "cos:movie/615677",
    trailerEmbed: "https://www.youtube.com/watch?v=omn2PJEuOTw",
    isSeries: false
  },
  {
    id: "Triangle of Sadness",
    imdbId: "tt7322224",
    title: "Triangle of Sadness",
    releaseDate: "2022-09-18",
    rating: 7,
    synopsis: "A celebrity model couple are invited on a luxury cruise for the uber-rich, helmed by an unhinged, alcoholic captain. What first appears Instagrammable ends catastrophically, leaving the survivors stranded on a desert island in a struggle of hierarchy.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/k9eLozCgCed5FGTSdHu0bBElAV8.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/vNPY4oCSUp7CxbHkKJNRx1fmCl0.jpg",
    manualEmbed: "cos:movie/497828",
    trailerEmbed: "https://www.youtube.com/watch?v=uYDidXdG1Wc",
    isSeries: false
  },
  {
    id: "Clifford the Big Red Dog",
    imdbId: "tt2397461",
    title: "Clifford the Big Red Dog",
    releaseDate: "2021-11-10",
    rating: 7.1,
    synopsis: "As Emily struggles to fit in at home and at school, she discovers a small red puppy who is destined to become her best friend. When Clifford magically undergoes one heck of a growth spurt, becomes a gigantic dog and attracts the attention of a genetics company, Emily and her Uncle Casey have to fight the forces of greed as they go on the run across New York City. Along the way, Clifford affects the lives of everyone around him and teaches Emily and her uncle the true meaning of acceptance and unconditional love.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/30ULVKdjBcQTsj2aOSThXXZNSxF.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/zBkHCpLmHjW2uVURs5uZkaVmgKR.jpg",
    manualEmbed: "cos:movie/585245",
    trailerEmbed: "https://www.youtube.com/watch?v=PsE3aHTkQYk",
    isSeries: false
  },
  {
    id: "Priscilla",
    imdbId: "tt22041854",
    title: "Priscilla",
    releaseDate: "2023-10-27",
    rating: 6.7,
    synopsis: "When teenage Priscilla Beaulieu meets Elvis Presley at a party, the man who is already a meteoric rock-and-roll superstar becomes someone entirely unexpected in private moments: a thrilling crush, an ally in loneliness, a vulnerable best friend.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/uDCeELWWpsNq7ErM61Yuq70WAE9.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/zz219ZRGo0vVIzvKttjx5nXOc2N.jpg",
    manualEmbed: "cos:movie/1020006",
    trailerEmbed: "https://www.youtube.com/watch?v=BK8tT07cY-o",
    isSeries: false
  },
  {
    id: "Saltburn",
    imdbId: "tt17351924",
    title: "Saltburn",
    releaseDate: "2023-11-16",
    rating: 6.9,
    synopsis: "Struggling to find his place at Oxford University, student Oliver Quick finds himself drawn into the world of the charming and aristocratic Felix Catton, who invites him to Saltburn, his eccentric family's sprawling estate, for a summer never to be forgotten.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/zGTfMwG112BC66mpaveVxoWPOaB.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/bAtFhmRHp0f6aHqj1UGTZoPcmQo.jpg",
    manualEmbed: "cos:movie/930564",
    trailerEmbed: "https://www.youtube.com/watch?v=s8l0llLj1uM",
    isSeries: false
  },
  {
    id: "Back to the Outback",
    imdbId: "tt13575806",
    title: "Back to the Outback",
    releaseDate: "2021-12-03",
    rating: 7.6,
    synopsis: "Tired of being locked in a reptile house where humans gawk at them like they are monsters, a ragtag group of Australia’s deadliest creatures plot an escape from their zoo to the Outback, a place where they’ll fit in without being judged.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/jbAUTO7qFN8XFG2LM3bz30vzGFJ.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/5B22eed7ErxFiYAG4Ksb4eLwKNF.jpg",
    manualEmbed: "cos:movie/770254",
    trailerEmbed: "https://www.youtube.com/watch?v=dDNhtB7L8Lk",
    isSeries: false
  },
  {
    id: "King Richard",
    imdbId: "tt9620288",
    title: "King Richard",
    releaseDate: "2021-11-18",
    rating: 7.6,
    synopsis: "The story of how Richard Williams served as a coach to his daughters Venus and Serena, who will soon become two of the most legendary tennis players in history.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/vjpMd1dsEsVBoUhq6iVHXwwFj9n.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/ljCKYCSRMNyZNyke5Lc1I8nW5b2.jpg",
    manualEmbed: "cos:movie/614917",
    trailerEmbed: "https://www.youtube.com/watch?v=_6bsugyNpDU",
    isSeries: false
  },
  {
    id: "Don't Breathe 2",
    imdbId: "tt6246322",
    title: "Don't Breathe 2",
    releaseDate: "2021-08-12",
    rating: 7,
    synopsis: "The Blind Man has been hiding out for several years in an isolated cabin and has taken in and raised a young girl orphaned from a devastating house fire. Their quiet life together is shattered when a group of criminals kidnap the girl, forcing the Blind Man to leave his safe haven to save her.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/aOu6PJVO9RyGAzdUwG6fupu0gpz.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/3ULzK4XTSC1wal11K7459fxnjjA.jpg",
    manualEmbed: "cos:movie/482373",
    trailerEmbed: "https://www.youtube.com/watch?v=dCDLPlZAoeY",
    isSeries: false
  },
  {
    id: "Woman of the Hour",
    imdbId: "tt7737800",
    title: "Woman of the Hour",
    releaseDate: "2024-10-03",
    rating: 6.4,
    synopsis: "An aspiring actress crosses paths with a prolific serial killer in '70s LA when they're cast on an episode of \"The Dating Game.\"",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/nc9ZqrJFbcUdlMg9lxXXtJb24jU.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/n6KXCV9jqUDDL5HCIoKHQ8kD9Fq.jpg",
    manualEmbed: "cos:movie/835113",
    trailerEmbed: "https://www.youtube.com/watch?v=ODUdpwddTQk",
    isSeries: false
  },
  {
    id: "The Thursday Murder Club",
    imdbId: "tt12001534",
    title: "The Thursday Murder Club",
    releaseDate: "2025-08-22",
    rating: 6.6,
    synopsis: "A group of senior sleuths passionate about solving cold cases get plunged into a real-life murder mystery in this comic crime caper.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/jbnazCHr8S2l2glyvjPTpa4NbEw.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/4KN06gns94rQFoYQWDGunK7Cob4.jpg",
    manualEmbed: "cos:movie/744653",
    trailerEmbed: "https://www.youtube.com/watch?v=50DYgzRBhFA",
    isSeries: false
  },
  {
    id: "Monkey Man",
    imdbId: "tt9214772",
    title: "Monkey Man",
    releaseDate: "2024-04-03",
    rating: 6.9,
    synopsis: "Kid is an anonymous young man who ekes out a meager living in an underground fight club where, night after night, wearing a gorilla mask, he is beaten bloody by more popular fighters for cash. After years of suppressed rage, Kid discovers a way to infiltrate the enclave of the city’s sinister elite. As his childhood trauma boils over, his mysteriously scarred hands unleash an explosive campaign of retribution to settle the score with the men who took everything from him.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/4lhR4L2vzzjl68P1zJyCH755Oz4.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/9NSXdVHeSfSHUv49OzLispFcpz1.jpg",
    manualEmbed: "cos:movie/560016",
    trailerEmbed: "https://www.youtube.com/watch?v=aqa3YTtwvaU",
    isSeries: false
  },
  {
    id: "The Order",
    imdbId: "tt26625693",
    title: "The Order",
    releaseDate: "2024-12-05",
    rating: 6.6,
    synopsis: "A string of violent robberies in the Pacific Northwest leads veteran FBI agent Terry Husk into a white supremacist plot to overthrow the federal government.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/r3BPhDb45sy87kNV41Q1TwCL6BS.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/aMbKYfaexixvsBZKc5whYO7yibR.jpg",
    manualEmbed: "cos:movie/1082195",
    trailerEmbed: "https://www.youtube.com/watch?v=pPZaOB4ea-0",
    isSeries: false
  },
  {
    id: "Totally Killer",
    imdbId: "tt11426232",
    title: "Totally Killer",
    releaseDate: "2023-09-28",
    rating: 6.8,
    synopsis: "When the infamous \"Sweet Sixteen Killer\" returns 35 years after his first murder spree to claim another victim, 17-year-old Jamie accidentally travels back in time to 1987, determined to stop the killer before he can start.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/52YBwGJ3cJs54fpBzwnT1lnqgTo.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/qjMDwBWbG5hAP43q3meplZFreFQ.jpg",
    manualEmbed: "cos:movie/974931",
    trailerEmbed: "https://www.youtube.com/watch?v=5vYipYSDhtQ",
    isSeries: false
  },
  {
    id: "No Sudden Move",
    imdbId: "tt11525644",
    title: "No Sudden Move",
    releaseDate: "2021-06-24",
    rating: 6.4,
    synopsis: "A group of criminals are brought together under mysterious circumstances and have to work together to uncover what's really going on when their simple job goes completely sideways.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/kARdPEc4b32GQlHmJXMhGOCplEA.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/ok7RdHhVngnwkvKj09tvtOvypG.jpg",
    manualEmbed: "cos:movie/649409",
    trailerEmbed: "https://www.youtube.com/watch?v=kybqUuHscrM",
    isSeries: false
  },
  {
    id: "Fear Street: 1994",
    imdbId: "tt6566576",
    title: "Fear Street: 1994",
    releaseDate: "2021-06-28",
    rating: 6.7,
    synopsis: "After a series of brutal slayings, a teen and her friends take on an evil force that's plagued their notorious town for centuries.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/9J9Wy39ZjrVmfk7yMkulpcI5sy0.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/vu5Y8qFqlzcboDbbZIMTAgj0KLb.jpg",
    manualEmbed: "cos:movie/591273",
    trailerEmbed: "https://www.youtube.com/watch?v=xBlwPuXDxOs",
    isSeries: false
  },
  {
    id: "After We Collided",
    imdbId: "tt10362466",
    title: "After We Collided",
    releaseDate: "2020-09-02",
    rating: 7.2,
    synopsis: "Tessa finds herself struggling with her complicated relationship with Hardin; she faces a dilemma that could change their lives forever.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/kiX7UYfOpYrMFSAGbI6j1pFkLzQ.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/6hgItrYQEG33y0I7yP2SRl2ei4w.jpg",
    manualEmbed: "cos:movie/613504",
    trailerEmbed: "https://www.youtube.com/watch?v=2SvwX3ux_-8",
    isSeries: false
  },
  {
    id: "Disenchanted",
    imdbId: "tt1596342",
    title: "Disenchanted",
    releaseDate: "2022-11-18",
    rating: 6.6,
    synopsis: "Disillusioned with life in the city, feeling out of place in suburbia, and frustrated that her happily ever after hasn’t been so easy to find, Giselle turns to the magic of Andalasia for help. Accidentally transforming the entire town into a real-life fairy tale and placing her family’s future happiness in jeopardy, she must race against time to reverse the spell and determine what happily ever after truly means to her and her family.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/uyNLq2Dc3s4IOdcYTU8ZtM2lTjb.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/mchDEPh1fkID8nq8IONAGQeiPJg.jpg",
    manualEmbed: "cos:movie/338958",
    trailerEmbed: "https://www.youtube.com/watch?v=DY63dfyn7HQ",
    isSeries: false
  },
  {
    id: "F9",
    imdbId: "tt5433138",
    title: "F9",
    releaseDate: "2021-05-19",
    rating: 7,
    synopsis: "Dominic Toretto and his crew battle the most skilled assassin and high-performance driver they've ever encountered: his forsaken brother.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/deEmLILTPejEb6OGsXRJ5MCvyDW.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/xXHZeb1yhJvnSHPzZDqee0zfMb6.jpg",
    manualEmbed: "cos:movie/385128",
    trailerEmbed: "https://www.youtube.com/watch?v=TfJkFsCn8Zw",
    isSeries: false
  },
  {
    id: "West Side Story",
    imdbId: "tt3581652",
    title: "West Side Story",
    releaseDate: "2021-12-08",
    rating: 6.9,
    synopsis: "Two youngsters from rival New York City gangs fall in love, but tensions between their respective friends build toward tragedy.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/yfz3IUoYYSY32tkb97HlUBGFsnh.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/exnFsbb9c3fDutTsgtJSWcDmZm0.jpg",
    manualEmbed: "cos:movie/511809",
    trailerEmbed: "https://www.youtube.com/watch?v=A5GJLwWiYSg",
    isSeries: false
  },
  {
    id: "Jackass Forever",
    imdbId: "tt11466222",
    title: "Jackass Forever",
    releaseDate: "2022-02-01",
    rating: 6.8,
    synopsis: "The Jackass crew, along with some newcomers, returns for one more round of hilarious, absurd, and dangerous stunts.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/ruHDFumJfW7F2vEqTZEQQ9xT7CA.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/f2J8DpT5bqV0AiI9VVcfiuqKo5l.jpg",
    manualEmbed: "cos:movie/656663",
    trailerEmbed: "https://www.youtube.com/watch?v=p74bzf-beGc",
    isSeries: false
  },
  {
    id: "Memory",
    imdbId: "tt11827628",
    title: "Memory",
    releaseDate: "2022-04-28",
    rating: 6.7,
    synopsis: "Alex, an assassin-for-hire, finds that he's become a target after he refuses to complete a job for a dangerous criminal organization. With the crime syndicate and FBI in hot pursuit, Alex has the skills to stay ahead, except for one thing: he is struggling with severe memory loss, affecting his every move. Alex must question his every action and whom he can ultimately trust.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/4Q1n3TwieoULnuaztu9aFjqHDTI.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/9zXPnbVpaDfTniLBuc5vgXGfzAP.jpg",
    manualEmbed: "cos:movie/818397",
    trailerEmbed: "https://www.youtube.com/watch?v=ye63hQLDj4k",
    isSeries: false
  },
  {
    id: "Ricky Stanicky",
    imdbId: "tt1660648",
    title: "Ricky Stanicky",
    releaseDate: "2024-03-07",
    rating: 6.5,
    synopsis: "When three childhood best friends pull a prank gone wrong, they invent the imaginary Ricky Stanicky to get them out of trouble. Twenty years later, the trio still uses the nonexistent Ricky as a handy alibi for their immature behavior. But when their spouses and partners get suspicious and demand to finally meet the fabled Mr. Stanicky, the guilty trio decide to hire a washed-up actor and raunchy celebrity impersonator to bring him to life.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/oJQdLfrpl4CQsHAKIxd3DJqYTVq.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/wfdHCilp8cNPK7tK4jLgdUT7703.jpg",
    manualEmbed: "cos:movie/1022690",
    trailerEmbed: "https://www.youtube.com/watch?v=WXpBN_31-Cw",
    isSeries: false
  },
  {
    id: "Megalopolis",
    imdbId: "tt10128846",
    title: "Megalopolis",
    releaseDate: "2024-09-25",
    rating: 5.2,
    synopsis: "In a futuristic New York known as New Rome, visionary architect Cesar Catilina dreams of building \"Megalopolis,\" a utopian city that redefines society’s limits. Opposing him is the corrupt Mayor Franklyn Cicero, who clings to power and profit. Between them stands Julia, the mayor’s daughter, whose love for Cesar forces her to choose between loyalty, ambition, and the fate of humanity.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/doVWgLdNyK36nEyyZgVsEWFCO1e.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/1DHbZ1XRvdeXbD2P7W1OJbxqN9b.jpg",
    manualEmbed: "cos:movie/592831",
    trailerEmbed: "https://www.youtube.com/watch?v=WVZd5b--U6w",
    isSeries: false
  },
  {
    id: "The Power of the Dog",
    imdbId: "tt10293406",
    title: "The Power of the Dog",
    releaseDate: "2021-10-25",
    rating: 6.7,
    synopsis: "A domineering but charismatic rancher wages a war of intimidation on his brother's new wife and her teen son, until long-hidden secrets come to light.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/kEy48iCzGnp0ao1cZbNeWR6yIhC.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/gAsHuCQMN7mv4uFIvM4ACQ09hPr.jpg",
    manualEmbed: "cos:movie/600583",
    trailerEmbed: "https://www.youtube.com/watch?v=LRDPo0CHrko",
    isSeries: false
  },
  {
    id: "The Craft: Legacy",
    imdbId: "tt4685762",
    title: "The Craft: Legacy",
    releaseDate: "2020-10-28",
    rating: 6.1,
    synopsis: "An eclectic foursome of aspiring teenage witches get more than they bargained for as they lean into their newfound powers.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/lhMIra0pqWNuD6CIXoTmGwZ0EBS.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/1GyjyL1xFXHQKP8ztci2BPZbFUS.jpg",
    manualEmbed: "cos:movie/590995",
    trailerEmbed: "https://www.youtube.com/watch?v=J60ueFp-jv8",
    isSeries: false
  },
  {
    id: "Drop",
    imdbId: "tt32149847",
    title: "Drop",
    releaseDate: "2025-04-07",
    rating: 6.3,
    synopsis: "Violet, a widowed mother on her first date in years, arrives at an upscale restaurant where she is relieved that her date, Henry, is more charming and handsome than she expected. But their chemistry begins to curdle as Violet begins being irritated and then terrorized by a series of anonymous drops to her phone.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/hSQPSW8aLjsMBfwqGjgJ6HozTkp.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/akBGSguhkAj1TXOdZUcL11e1hpH.jpg",
    manualEmbed: "cos:movie/1249213",
    trailerEmbed: "https://www.youtube.com/watch?v=tZoNPCc-2Vw",
    isSeries: false
  },
  {
    id: "No One Will Save You",
    imdbId: "tt14509110",
    title: "No One Will Save You",
    releaseDate: "2023-09-21",
    rating: 6.7,
    synopsis: "A lonely woman battles extraterrestrials who threaten her future while forcing her to face her past.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/ehGIDAMaYy6Eg0o8ga0oqflDjqW.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/zYlgqIpqJ1VAbvFhRhktAzIybVs.jpg",
    manualEmbed: "cos:movie/820609",
    trailerEmbed: "https://www.youtube.com/watch?v=IcA02w6rm44",
    isSeries: false
  },
  {
    id: "The French Dispatch of the Liberty, Kansas Evening Sun",
    imdbId: "tt8847712",
    title: "The French Dispatch of the Liberty, Kansas Evening Sun",
    releaseDate: "2021-10-21",
    rating: 7,
    synopsis: "The staff of an American magazine based in France puts out its last issue, with stories featuring an artist sentenced to life imprisonment, student riots, and a kidnapping resolved by a chef.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6JXR3KJH5roiBCjWFt09xfgxHZc.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/xS0rl1YrVt51ztzjRf6qoIPZ7TA.jpg",
    manualEmbed: "cos:movie/542178",
    trailerEmbed: "https://www.youtube.com/watch?v=3DOp3A_2fIM",
    isSeries: false
  },
  {
    id: "The Wonderful Story of Henry Sugar",
    imdbId: "tt16968450",
    title: "The Wonderful Story of Henry Sugar",
    releaseDate: "2023-09-20",
    rating: 7.3,
    synopsis: "A rich man learns about a guru who can see without using his eyes. He sets out to master the skill in order to cheat at gambling.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/fDUywEHwHh6nsLnVXAdPN9m4ZUG.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/dS4JR8gmj8UnamjuLEyAkEFoppy.jpg",
    manualEmbed: "cos:movie/923939",
    trailerEmbed: "https://www.youtube.com/watch?v=4RdncisZ_QA",
    isSeries: false
  },
  {
    id: "The Devil All the Time",
    imdbId: "tt7395114",
    title: "The Devil All the Time",
    releaseDate: "2020-09-11",
    rating: 7.2,
    synopsis: "In Knockemstiff, Ohio and its neighboring backwoods, sinister characters converge around young Arvin Russell as he fights the evil forces that threaten him and his family.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/v3wGDRhnik4HSuaMzATkgaqDJLS.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/rUeqBuNDR9zN6vZV9kpEFMtQm0E.jpg",
    manualEmbed: "cos:movie/499932",
    trailerEmbed: "https://www.youtube.com/watch?v=EIzazUv2gtI",
    isSeries: false
  },
  {
    id: "Your Place or Mine",
    imdbId: "tt12823454",
    title: "Your Place or Mine",
    releaseDate: "2023-02-10",
    rating: 6.3,
    synopsis: "When best friends and total opposites Debbie and Peter swap homes for a week, they get a peek into each other's lives that could open the door to love.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/3oFfY1HpzJDlRzKSCBF2sA5mb9U.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/1phS20ufmCOtT8kPBm3izGo6omk.jpg",
    manualEmbed: "cos:movie/703451",
    trailerEmbed: "https://www.youtube.com/watch?v=5JyfgkPMXk0",
    isSeries: false
  },
  {
    id: "Luther: The Fallen Sun",
    imdbId: "tt3155298",
    title: "Luther: The Fallen Sun",
    releaseDate: "2023-02-24",
    rating: 6.6,
    synopsis: "A gruesome serial killer is terrorizing London while brilliant but disgraced detective John Luther sits behind bars. Haunted by his failure to capture the cyber psychopath who now taunts him, Luther decides to break out of prison to finish the job by any means necessary.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/tvX2JltXjmpHLQ7BBijyVc9STv4.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/6oxnVw91yzv9fYwGaz941Mwlwbv.jpg",
    manualEmbed: "cos:movie/722149",
    trailerEmbed: "https://www.youtube.com/watch?v=EGK5qtXuc1Q",
    isSeries: false
  },
  {
    id: "Memoir of a Snail",
    imdbId: "tt23770030",
    title: "Memoir of a Snail",
    releaseDate: "2024-10-17",
    rating: 8.1,
    synopsis: "Forcibly separated from her twin brother when they are orphaned, a melancholic misfit learns how to find confidence within herself amid the clutter of misfortunes and everyday life.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/woaN8CbloH0akyX0E72ayxlJAB4.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/jl2YIADk391yc6Qjy9JhgCRkHJk.jpg",
    manualEmbed: "cos:movie/1064486",
    trailerEmbed: "https://www.youtube.com/watch?v=q47QUYb0hjc",
    isSeries: false
  },
  {
    id: "Elevation",
    imdbId: "tt23558280",
    title: "Elevation",
    releaseDate: "2024-11-07",
    rating: 6.4,
    synopsis: "Post-apocalyptic survivors find refuge in the Rocky Mountains to hide from giant, insect-like creatures that can't live above 8,000 feet. However, when one of them needs life-saving supplies, they risk it all to venture into the danger zone.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/tnfc0NJ3BzhJrGJhkkEd6MHBdq5.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/au3o84ub27qTZiMiEc9UYzN74V3.jpg",
    manualEmbed: "cos:movie/1035048",
    trailerEmbed: "https://www.youtube.com/watch?v=N7pZthBBLOA",
    isSeries: false
  },
  {
    id: "The Hating Game",
    imdbId: "tt8718158",
    title: "The Hating Game",
    releaseDate: "2021-12-09",
    rating: 7.3,
    synopsis: "Resolving to achieve professional success without compromising her ethics, Lucy embarks on a ruthless game of one-upmanship against cold and efficient nemesis Joshua, a rivalry that is complicated by her growing attraction to him.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/prbZxJxGcy07y60eq8lCGMciTYz.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/lghWedsBBl3lPlIs4EpZpP64mUT.jpg",
    manualEmbed: "cos:movie/603661",
    trailerEmbed: "https://www.youtube.com/watch?v=a9toRWhKaqk",
    isSeries: false
  },
  {
    id: "Snake Eyes: G.I. Joe Origins",
    imdbId: "tt8404256",
    title: "Snake Eyes: G.I. Joe Origins",
    releaseDate: "2021-07-22",
    rating: 6.4,
    synopsis: "After saving the life of their heir apparent, tenacious loner Snake Eyes is welcomed into an ancient Japanese clan called the Arashikage where he is taught the ways of the ninja warrior. But, when secrets from his past are revealed, Snake Eyes' honor and allegiance will be tested – even if that means losing the trust of those closest to him.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/uIXF0sQGXOxQhbaEaKOi2VYlIL0.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/2OFg5p9yarI5zZsUWKCRgBgPctj.jpg",
    manualEmbed: "cos:movie/568620",
    trailerEmbed: "https://www.youtube.com/watch?v=Vd2sm63Xwfw",
    isSeries: false
  },
  {
    id: "Borat Subsequent Moviefilm: Delivery of Prodigious Bribe to American Regime for Make Benefit Once Glorious Nation of Kazakhstan",
    imdbId: "tt13143964",
    title: "Borat Subsequent Moviefilm: Delivery of Prodigious Bribe to American Regime for Make Benefit Once Glorious Nation of Kazakhstan",
    releaseDate: "2020-10-23",
    rating: 6.4,
    synopsis: "14 years after making a film about his journey across the USA, Borat risks life and limb when he returns to the United States with his young daughter, and reveals more about the culture, the COVID-19 pandemic, and the political elections.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/3L1Ml5RWjFVfVq3rQENvgFymT0U.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/hbrXbVoE0NuA1ORoSGGYNASagrl.jpg",
    manualEmbed: "cos:movie/740985",
    trailerEmbed: "https://www.youtube.com/watch?v=0Rsa4U8mqkw",
    isSeries: false
  },
  {
    id: "Flamin' Hot",
    imdbId: "tt8105234",
    title: "Flamin' Hot",
    releaseDate: "2023-03-11",
    rating: 8,
    synopsis: "The inspiring true story of Richard Montañez, the Frito Lay janitor who channeled his Mexican American heritage and upbringing to turn the iconic Flamin' Hot Cheetos into a snack that disrupted the food industry and became a global pop culture phenomenon.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/a7KyFMPXj0iY4EoLq1PIGU1WJPw.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/yYEOYzgqPB31mkSsuPdCvXH3zHv.jpg",
    manualEmbed: "cos:movie/626332",
    trailerEmbed: "https://www.youtube.com/watch?v=it7sNRloq-A",
    isSeries: false
  },
  {
    id: "See How They Run",
    imdbId: "tt13640696",
    title: "See How They Run",
    releaseDate: "2022-09-09",
    rating: 6.3,
    synopsis: "In the West End of 1950s London, plans for a movie version of a smash-hit play come to an abrupt halt after a pivotal member of the crew is murdered. When world-weary Inspector Stoppard and eager rookie Constable Stalker take on the case, the two find themselves thrown into a puzzling whodunit within the glamorously sordid theater underground, investigating the mysterious homicide at their own peril.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/r3rpSAi2yukZwr9H2km0WKGODWo.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/cn9GQzCaeYylEV2hymVR8bskRMJ.jpg",
    manualEmbed: "cos:movie/766475",
    trailerEmbed: "https://www.youtube.com/watch?v=Q00qh7Ab6Mk",
    isSeries: false
  },
  {
    id: "Shotgun Wedding",
    imdbId: "tt9686790",
    title: "Shotgun Wedding",
    releaseDate: "2022-12-28",
    rating: 6.2,
    synopsis: "Darcy and Tom gather their families for the ultimate destination wedding but when the entire party is taken hostage, “’Til Death Do Us Part” takes on a whole new meaning. Now, Darcy and Tom must save their loved ones—if they don’t kill each other first.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/t79ozwWnwekO0ADIzsFP1E5SkvR.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/zGoZB4CboMzY1z4G3nU6BWnMDB2.jpg",
    manualEmbed: "cos:movie/758009",
    trailerEmbed: "https://www.youtube.com/watch?v=U8gz0rUzTAY",
    isSeries: false
  },
  {
    id: "The Night House",
    imdbId: "tt9731534",
    title: "The Night House",
    releaseDate: "2021-07-15",
    rating: 6.5,
    synopsis: "Reeling from the unexpected death of her husband, Beth is left alone in the lakeside home he built for her. Soon she begins to uncover her recently deceased husband's disturbing secrets.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/rqs2CXpc4d5FzeP1EZCYItAVo81.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/qbQ219gsHpdx33WSfdCgG9I2Xg5.jpg",
    manualEmbed: "cos:movie/547565",
    trailerEmbed: "https://www.youtube.com/watch?v=W8WQGXkif_s",
    isSeries: false
  },
  {
    id: "I Care a Lot",
    imdbId: "tt9893250",
    title: "I Care a Lot",
    releaseDate: "2021-02-19",
    rating: 6.6,
    synopsis: "A court-appointed legal guardian defrauds her older clients and traps them under her care. But her latest mark comes with some unexpected baggage.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/gKnhEsjNefpKnUdAkn7INzIFLSu.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/pA4J371Gk2F47vyGQOWapcsnOzz.jpg",
    manualEmbed: "cos:movie/601666",
    trailerEmbed: "https://www.youtube.com/watch?v=4lkCCo63nhM",
    isSeries: false
  },
  {
    id: "The Last Voyage of the Demeter",
    imdbId: "tt1001520",
    title: "The Last Voyage of the Demeter",
    releaseDate: "2023-08-09",
    rating: 6.7,
    synopsis: "The crew of the merchant ship Demeter attempts to survive the ocean voyage from Carpathia to London as they are stalked each night by a merciless presence onboard the ship.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/nrtbv6Cew7qC7k9GsYSf5uSmuKh.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/dKC5qWi6S8SKkSzrP6LxTk0cb98.jpg",
    manualEmbed: "cos:movie/635910",
    trailerEmbed: "https://www.youtube.com/watch?v=eQUBghzpgzA",
    isSeries: false
  },
  {
    id: "You Should Have Left",
    imdbId: "tt8201852",
    title: "You Should Have Left",
    releaseDate: "2020-06-18",
    rating: 6.1,
    synopsis: "In an effort to repair their relationship, a couple books a vacation in the countryside for themselves and their daughter. What starts as a perfect retreat begins to fall apart as one loses their grip on reality, and a sinister force tries to tear them apart.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/tpOwE6xsWnu4lKeKbKW0R3iClM.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/chAGSv4DB9s3fsgULpSZQLN7LgN.jpg",
    manualEmbed: "cos:movie/514593",
    trailerEmbed: "https://www.youtube.com/watch?v=Bw0-cV_J9q4",
    isSeries: false
  },
  {
    id: "Rebel Ridge",
    imdbId: "tt11301886",
    title: "Rebel Ridge",
    releaseDate: "2024-08-27",
    rating: 7,
    synopsis: "A former Marine confronts corruption in a small town when local law enforcement unjustly seizes the bag of cash he needs to post his cousin's bail.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/xEt2GSz9z5rSVpIHMiGdtf0czyf.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/cyKH7pDFlxIXluqRyNoHHEpxSDX.jpg",
    manualEmbed: "cos:movie/646097",
    trailerEmbed: "https://www.youtube.com/watch?v=gF3gZicntIw",
    isSeries: false
  },
  {
    id: "Fear Street: 1978",
    imdbId: "tt9701940",
    title: "Fear Street: 1978",
    releaseDate: "2021-07-08",
    rating: 7.2,
    synopsis: "In 1978, two rival groups at Camp Nightwing must band together to solve a terrifying mystery when horrors from their towns' history come alive.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/5dNTxhoGDTHHGqUTdxcr4H1dqlU.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/oMnJhVFr0xVfxy4HPBt1LDKoFgV.jpg",
    manualEmbed: "cos:movie/591274",
    trailerEmbed: "https://www.youtube.com/watch?v=eR2KSY1fipo",
    isSeries: false
  },
  {
    id: "Color Out of Space",
    imdbId: "tt5073642",
    title: "Color Out of Space",
    releaseDate: "2020-01-24",
    rating: 6.1,
    synopsis: "The Gardner family moves to a remote farmstead in rural New England to escape the hustle of the 21st century. They are busy adapting to their new life when a meteorite crashes into their front yard, melts into the earth, and infects both the land and the properties of space-time with a strange, otherworldly colour. To their horror, the family discovers this alien force is gradually mutating every life form that it touches—including them.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/k7rD7LzlsPS4jmE6Siah0QO4tAc.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/vj2gCvD5vZDJ865izTU0J0wJBVc.jpg",
    manualEmbed: "cos:movie/548473",
    trailerEmbed: "https://www.youtube.com/watch?v=agnpaFLo0to",
    isSeries: false
  },
  {
    id: "Chicken Run: Dawn of the Nugget",
    imdbId: "tt8337264",
    title: "Chicken Run: Dawn of the Nugget",
    releaseDate: "2023-12-08",
    rating: 6.9,
    synopsis: "A band of fearless chickens flock together to save poultry-kind from an unsettling new threat: a nearby farm that's cooking up something suspicious.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/eImY0cjbH0bll8EXSqxqEZIZcmY.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/utChUdMhCEWKjHTc8DO5aK8dUVS.jpg",
    manualEmbed: "cos:movie/520758",
    trailerEmbed: "https://www.youtube.com/watch?v=_-Kz67kea8Q",
    isSeries: false
  },
  {
    id: "Lift",
    imdbId: "tt14371878",
    title: "Lift",
    releaseDate: "2024-01-10",
    rating: 6.4,
    synopsis: "An international heist crew, led by Cyrus Whitaker, race to lift $500 million in gold from a passenger plane at 40,000 feet.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/h7wJI6mctrDJ9wMbFfgrBUTn1LT.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/AaModY6YpQmEFzG56ALP1PFLPUU.jpg",
    manualEmbed: "cos:movie/955916",
    trailerEmbed: "https://www.youtube.com/watch?v=QfFasuouxQI",
    isSeries: false
  },
  {
    id: "Pain Hustlers",
    imdbId: "tt15257160",
    title: "Pain Hustlers",
    releaseDate: "2023-10-20",
    rating: 6.6,
    synopsis: "After losing her job, a single mom falls into a lucrative but ultimately dangerous scheme selling prescription drugs.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/m0gM9jE1KmCkXZRqkeNYEQZdVsZ.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/bMRofddQE58ToKM7GtdJy6MuKoY.jpg",
    manualEmbed: "cos:movie/862968",
    trailerEmbed: "https://www.youtube.com/watch?v=HbPeXsdamT4",
    isSeries: false
  },
  {
    id: "Thanksgiving",
    imdbId: "tt1448754",
    title: "Thanksgiving",
    releaseDate: "2023-11-16",
    rating: 6.5,
    synopsis: "After a Black Friday riot ends in tragedy, a mysterious Thanksgiving-inspired killer terrorizes Plymouth, Massachusetts - the birthplace of the holiday. Picking off residents one by one, what begins as random revenge killings are soon revealed to be part of a larger, sinister holiday plan.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/f5f3TEVst1nHHyqgn7Z3tlwnBIH.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/ktHEdqmMWC1wdfPRMRCTZe2OISL.jpg",
    manualEmbed: "cos:movie/1071215",
    trailerEmbed: "https://www.youtube.com/watch?v=rc8vLvZ0fTE",
    isSeries: false
  },
  {
    id: "The Mauritanian",
    imdbId: "tt4761112",
    title: "The Mauritanian",
    releaseDate: "2021-02-12",
    rating: 7.4,
    synopsis: "The true story of the Mauritanian Mohamedou Ould Slahi, who was held at the U.S military's Guantanamo Bay detention center without charges for over a decade and sought help from a defense attorney for his release.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/lIADEa6oH74uUapjsPbNRzxus8M.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/dXQLVJxvScwtUtORAiaAxgikmtC.jpg",
    manualEmbed: "cos:movie/644583",
    trailerEmbed: "https://www.youtube.com/watch?v=N00DwEsSSYU",
    isSeries: false
  },
  {
    id: "Tom Clancy's Without Remorse",
    imdbId: "tt0499097",
    title: "Tom Clancy's Without Remorse",
    releaseDate: "2021-04-30",
    rating: 6.9,
    synopsis: "An elite Navy SEAL uncovers an international conspiracy while seeking justice for the murder of his pregnant wife.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6OnlqShdRinhJwV1uGiRE70lD63.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/fPGeS6jgdLovQAKunNHX8l0avCy.jpg",
    manualEmbed: "cos:movie/567189",
    trailerEmbed: "https://www.youtube.com/watch?v=kRpkRkO9KUI",
    isSeries: false
  },
  {
    id: "Presence",
    imdbId: "tt28249919",
    title: "Presence",
    releaseDate: "2025-01-17",
    rating: 6.1,
    synopsis: "A couple and their children move into a seemingly normal suburban home. When strange events occur, they begin to believe there is something else in the house with them. The presence is about to disrupt their lives in unimaginable ways.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/xZIGHoHj0DF0zdibwa66cRWHdHO.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/eT1L3IVcHUL58wLn48E5dxlea3Z.jpg",
    manualEmbed: "cos:movie/1140535",
    trailerEmbed: "https://www.youtube.com/watch?v=Ay4MJZH6_K8",
    isSeries: false
  },
  {
    id: "The Princess",
    imdbId: "tt13406136",
    title: "The Princess",
    releaseDate: "2022-06-16",
    rating: 6.8,
    synopsis: "A beautiful, strong-willed young royal refuses to wed the cruel sociopath to whom she is betrothed and is kidnapped and locked in a remote tower of her father’s castle. With her scorned, vindictive suitor intent on taking her father’s throne, the princess must protect her family and save the kingdom.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/9pCoqX24a6rE981fY1O3PmhiwrB.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/5PnypKiSj2efSPqThNjTXz8jwOg.jpg",
    manualEmbed: "cos:movie/759175",
    trailerEmbed: "https://www.youtube.com/watch?v=6kFCkfdOfMU",
    isSeries: false
  },
  {
    id: "Strange Darling",
    imdbId: "tt22375054",
    title: "Strange Darling",
    releaseDate: "2024-08-22",
    rating: 6.9,
    synopsis: "Nothing is what it seems when a twisted one-night stand spirals into a serial killer’s vicious murder spree.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/kWNCRgt3ocv19bYO0sk7TRuZuFY.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/I4ofwq3XfmwXAETUs5pjubcMJ0.jpg",
    manualEmbed: "cos:movie/1029281",
    trailerEmbed: "https://www.youtube.com/watch?v=F_F3f_Fqtrc",
    isSeries: false
  },
  {
    id: "TÁR",
    imdbId: "tt14444726",
    title: "TÁR",
    releaseDate: "2022-10-07",
    rating: 7.1,
    synopsis: "As celebrated conductor Lydia Tár starts rehearsals for a career-defining symphony, the consequences of her past choices begin to echo in the present.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/dRVAlaU0vbG6hMf2K45NSiIyoUe.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/84XcRwKHAw4VXdKOYTSW5ARxFEt.jpg",
    manualEmbed: "cos:movie/817758",
    trailerEmbed: "https://www.youtube.com/watch?v=Na6gA1RehsU",
    isSeries: false
  },
  {
    id: "Tarot",
    imdbId: "tt14088510",
    title: "Tarot",
    releaseDate: "2024-05-01",
    rating: 6.3,
    synopsis: "When a group of friends recklessly violate the sacred rule of Tarot readings, they unknowingly unleash an unspeakable evil trapped within the cursed cards. One by one, they come face to face with fate and end up in a race against death.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/gAEUXC37vl1SnM7PXsHTF23I2vq.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/otfoeC96neoOdA4HqsX06OWuzE9.jpg",
    manualEmbed: "cos:movie/719221",
    trailerEmbed: "https://www.youtube.com/watch?v=XNTEjJm4WXg",
    isSeries: false
  },
  {
    id: "The 355",
    imdbId: "tt8356942",
    title: "The 355",
    releaseDate: "2022-01-05",
    rating: 6,
    synopsis: "A group of top female agents from American, British, Chinese, Colombian, and German government agencies are drawn together to try and stop an organization from acquiring a deadly weapon to send the world into chaos.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/xef9Ht77B2igqZv754HNdW8qZCk.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/oSNqhngemquRBzxKSC3ysAmnC5e.jpg",
    manualEmbed: "cos:movie/522016",
    trailerEmbed: "https://www.youtube.com/watch?v=SV0s2S9reT0",
    isSeries: false
  },
  {
    id: "Beverly Hills Cop: Axel F",
    imdbId: "tt3083016",
    title: "Beverly Hills Cop: Axel F",
    releaseDate: "2024-06-20",
    rating: 6.6,
    synopsis: "Forty years after his unforgettable first case in Beverly Hills, Detroit cop Axel Foley returns to do what he does best: solve crimes and cause chaos.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/yE0iZBxkL8aKYNkkeHoUzx5M88c.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/rrwt0u1rW685u9bJ9ougg5HJEHC.jpg",
    manualEmbed: "cos:movie/280180",
    trailerEmbed: "https://www.youtube.com/watch?v=4T4YPfCbPto",
    isSeries: false
  },
  {
    id: "The Unbearable Weight of Massive Talent",
    imdbId: "tt11291274",
    title: "The Unbearable Weight of Massive Talent",
    releaseDate: "2022-04-20",
    rating: 6.8,
    synopsis: "Creatively unfulfilled and facing financial ruin, Nick Cage must accept a $1 million offer to attend the birthday of a dangerous superfan. Things take a wildly unexpected turn when Cage is recruited by a CIA operative and forced to live up to his own legend, channeling his most iconic and beloved on-screen characters in order to save himself and his loved ones.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/bmxCAO0tz79xn40swJAEIJPRnC1.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/m0YjB4VfghKey8Ppsmz8qCd0v1m.jpg",
    manualEmbed: "cos:movie/648579",
    trailerEmbed: "https://www.youtube.com/watch?v=CKTRbKch2K4",
    isSeries: false
  },
  {
    id: "Scoob!",
    imdbId: "tt3152592",
    title: "Scoob!",
    releaseDate: "2020-07-08",
    rating: 7,
    synopsis: "In Scooby-Doo’s greatest adventure yet, see the never-before told story of how lifelong friends Scooby and Shaggy first met and how they joined forces with young detectives Fred, Velma, and Daphne to form the famous Mystery Inc. Now, with hundreds of cases solved, Scooby and the gang face their biggest, toughest mystery ever: an evil plot to unleash the ghost dog Cerberus upon the world. As they race to stop this global “dogpocalypse,” the gang discovers that Scooby has a secret legacy and an epic destiny greater than anyone ever imagined.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/jHo2M1OiH9Re33jYtUQdfzPeUkx.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/sJjuXNHNT7PfzcgkqM3oSIkVOXB.jpg",
    manualEmbed: "cos:movie/385103",
    trailerEmbed: "https://www.youtube.com/watch?v=GzlEnS7MmUo",
    isSeries: false
  },
  {
    id: "Hidden Strike",
    imdbId: "tt6879446",
    title: "Hidden Strike",
    releaseDate: "2023-07-06",
    rating: 6.9,
    synopsis: "Two elite soldiers must escort civilians through a gauntlet of gunfire and explosions.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/zsbolOkw8RhTU4DKOrpf4M7KCmi.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/hld8bMSwbjLGTLTgMKai6OfSSwJ.jpg",
    manualEmbed: "cos:movie/457332",
    trailerEmbed: "https://www.youtube.com/watch?v=l_jEicE6KyQ",
    isSeries: false
  },
  {
    id: "Peter Rabbit 2: The Runaway",
    imdbId: "tt8376234",
    title: "Peter Rabbit 2: The Runaway",
    releaseDate: "2021-03-25",
    rating: 7,
    synopsis: "Peter Rabbit runs away from his human family when he learns they are going to portray him in a bad light in their book. Soon, he crosses paths with an older rabbit who ropes him into a heist.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/cycDz68DtTjJrDJ1fV8EBq2Xdpb.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/5HjzYTihkH7EvOWSE7KcsF6pBMM.jpg",
    manualEmbed: "cos:movie/522478",
    trailerEmbed: "https://www.youtube.com/watch?v=oCR7-3cxL48",
    isSeries: false
  },
  {
    id: "Blonde",
    imdbId: "tt1655389",
    title: "Blonde",
    releaseDate: "2022-09-16",
    rating: 5.9,
    synopsis: "From her volatile childhood as Norma Jeane, through her rise to stardom and romantic entanglements, this reimagined fictional portrait of Hollywood legend Marilyn Monroe blurs the lines of fact and fiction to explore the widening split between her public and private selves.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/mEeHqtnWOR44vLCutEFku2WK6ou.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/sdirxnHDdRmrM55mWfLCFeMdRSn.jpg",
    manualEmbed: "cos:movie/301502",
    trailerEmbed: "https://www.youtube.com/watch?v=aIsFywuZPoQ",
    isSeries: false
  },
  {
    id: "The Pale Blue Eye",
    imdbId: "tt14138650",
    title: "The Pale Blue Eye",
    releaseDate: "2022-12-22",
    rating: 6.8,
    synopsis: "West Point, New York, 1830. When a cadet at the burgeoning military academy is found hanged with his heart cut out, the top brass summons former New York City constable Augustus Landor to investigate. While attempting to solve this grisly mystery, the reluctant detective engages the help of one of the cadets: a strange but brilliant young fellow by the name of Edgar Allan Poe.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/9xkGlFRqrN8btTLU0KQvOfn2PHr.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/b08BDQPq42AoLMfhi7DtTOoYqVu.jpg",
    manualEmbed: "cos:movie/800815",
    trailerEmbed: "https://www.youtube.com/watch?v=ddbL9jvg77w",
    isSeries: false
  },
  {
    id: "The Courier",
    imdbId: "tt8368512",
    title: "The Courier",
    releaseDate: "2020-01-24",
    rating: 7,
    synopsis: "Cold War spy Greville Wynne and his Russian source try to put an end to the Cuban Missile Crisis.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/zFIjKtZrzhmc7HecdFXXjsLR2Ig.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/sFEDBymGs32vSZ5rkfGWYpQpaEf.jpg",
    manualEmbed: "cos:movie/522241",
    trailerEmbed: "https://www.youtube.com/watch?v=Qeo8qs9xohM",
    isSeries: false
  },
  {
    id: "May December",
    imdbId: "tt13651794",
    title: "May December",
    releaseDate: "2023-11-16",
    rating: 6.6,
    synopsis: "Twenty years after their notorious tabloid romance gripped the nation, a married couple buckles under the pressure when an actress arrives to do research for a film about their past.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/zhV7B610l7hjlri4ywikJ18ONuq.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/97MOhHIgU6ZdLcB9DrAhx3WAqrU.jpg",
    manualEmbed: "cos:movie/839369",
    trailerEmbed: "https://www.youtube.com/watch?v=8z3JaevxEMA",
    isSeries: false
  },
  {
    id: "The Outfit",
    imdbId: "tt14114802",
    title: "The Outfit",
    releaseDate: "2022-02-25",
    rating: 7.1,
    synopsis: "Leonard is an English tailor who used to craft suits on London’s world-famous Savile Row. After a personal tragedy, he’s ended up in Chicago, operating a small tailor shop in a rough part of town where he makes beautiful clothes for the only people around who can afford them: a family of vicious gangsters.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/lZa5EB6PVJBT5mxhgZS5ftqdAm6.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/jjXnYpRQMqzylAmYqKL7VFa3l9w.jpg",
    manualEmbed: "cos:movie/799876",
    trailerEmbed: "https://www.youtube.com/watch?v=3UgJL23HxyU",
    isSeries: false
  },
  {
    id: "My Spy",
    imdbId: "tt8242084",
    title: "My Spy",
    releaseDate: "2020-01-09",
    rating: 6.9,
    synopsis: "A hardened CIA operative finds himself at the mercy of a precocious 9-year-old girl, having been sent undercover to surveil her family.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/n2C6jRK9PtPIs99RQhKtqGlsnsO.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/jDb3VV38z6wOdKbGA9jn1bagnfC.jpg",
    manualEmbed: "cos:movie/592834",
    trailerEmbed: "https://www.youtube.com/watch?v=pfAhQSz-j_o",
    isSeries: false
  },
  {
    id: "The War with Grandpa",
    imdbId: "tt4532038",
    title: "The War with Grandpa",
    releaseDate: "2020-08-27",
    rating: 6.4,
    synopsis: "Peter is thrilled that his Grandpa is coming to live with his family. That is, until Grandpa moves into Peter's room, forcing him upstairs into the creepy attic. And though he loves his Grandpa, he wants his room back - so he has no choice but to declare war.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/ltyARDw2EFXZ2H2ERnlEctXPioP.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/a9jZrU7LJk6mAUjmkbEmTiC52l0.jpg",
    manualEmbed: "cos:movie/425001",
    trailerEmbed: "https://www.youtube.com/watch?v=U18vQk1n4tg",
    isSeries: false
  },
  {
    id: "Retribution",
    imdbId: "tt6906292",
    title: "Retribution",
    releaseDate: "2023-08-23",
    rating: 6.5,
    synopsis: "When a mysterious caller plants a bomb under his car seat, a bank executive begins a high-speed chase across the city to complete a specific series of tasks — all with his kids trapped in the back seat.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/oUmmY7QWWn7OhKlcPOnirHJpP1F.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/iiXliCeykkzmJ0Eg9RYJ7F2CWSz.jpg",
    manualEmbed: "cos:movie/762430",
    trailerEmbed: "https://www.youtube.com/watch?v=Sxyzdo-RBKc",
    isSeries: false
  },
  {
    id: "The Contractor",
    imdbId: "tt10323676",
    title: "The Contractor",
    releaseDate: "2022-03-10",
    rating: 6.3,
    synopsis: "After being involuntarily discharged from the U.S. Special Forces, James Harper decides to support his family by joining a private contracting organization alongside his best friend and under the command of a fellow veteran. Overseas on a covert mission, Harper must evade those trying to kill him while making his way back home.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/rJPGPZ5soaG27MK90oKpioSiJE2.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/rSrJW3MHZLWBtiNV3fbVaqNYVpy.jpg",
    manualEmbed: "cos:movie/628900",
    trailerEmbed: "https://www.youtube.com/watch?v=e7glvM8Xh0w",
    isSeries: false
  },
  {
    id: "Amsterdam",
    imdbId: "tt10304142",
    title: "Amsterdam",
    releaseDate: "2022-09-27",
    rating: 6.1,
    synopsis: "In the 1930s, three friends—a doctor, a nurse, and an attorney—witness a murder, become suspects themselves and uncover one of the most outrageous plots in American history.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6sJcVzGCwrDCBMV0DU6eRzA2UxM.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/qyI3NAVrzq0THorufGdY91CK0Ea.jpg",
    manualEmbed: "cos:movie/664469",
    trailerEmbed: "https://www.youtube.com/watch?v=GLs2xxM0e78",
    isSeries: false
  },
  {
    id: "Silent Night",
    imdbId: "tt15799866",
    title: "Silent Night",
    releaseDate: "2023-11-30",
    rating: 6.1,
    synopsis: "A tormented father witnesses his young son die when caught in a gang's crossfire on Christmas Eve. While recovering from a wound that costs him his voice, he makes vengeance his life's mission and embarks on a punishing training regimen in order to avenge his son's death.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/tlcuhdNMKNGEVpGqBZrAaOOf1A6.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/gg4zZoTggZmpAQ32qIrP5dtnkEZ.jpg",
    manualEmbed: "cos:movie/891699",
    trailerEmbed: "https://www.youtube.com/watch?v=eKmEdwQLzoA",
    isSeries: false
  },
  {
    id: "The Exorcist: Believer",
    imdbId: "tt12921446",
    title: "The Exorcist: Believer",
    releaseDate: "2023-10-04",
    rating: 5.8,
    synopsis: "Since his wife's death, Victor has raised his daughter Angela alone. After she and her friend return from a three-day disappearance with missing memories, they begin displaying frightening behavior reminiscent of the MacNeil possession fifty years prior.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/fFXkAlMH2iQrNknv4eq7LGTkcti.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/d7zDEW6AkRCvEOT2Cela4h0F3Nb.jpg",
    manualEmbed: "cos:movie/807172",
    trailerEmbed: "https://www.youtube.com/watch?v=r71FmJBoSDs",
    isSeries: false
  },
  {
    id: "Emma.",
    imdbId: "tt9214832",
    title: "Emma.",
    releaseDate: "2020-02-13",
    rating: 7,
    synopsis: "In 1800s England, a well-meaning but selfish young woman meddles in the love lives of her friends.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/uHpHzbHLSsVmAuuGuQSpyVDZmDc.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/42gqGeyXh4caHP19Tqf8DMRgc7r.jpg",
    manualEmbed: "cos:movie/556678",
    trailerEmbed: "https://www.youtube.com/watch?v=qsOwj0PR5Sk",
    isSeries: false
  },
  {
    id: "I Still Believe",
    imdbId: "tt9779516",
    title: "I Still Believe",
    releaseDate: "2020-03-12",
    rating: 7.6,
    synopsis: "The true-life story of Christian music star Jeremy Camp and his journey of love and loss that looks to prove there is always hope.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/dqA2FCzz4OMmXLitKopzf476RVB.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/bcXDN63bikg2KzqtOIjaj9qUiaj.jpg",
    manualEmbed: "cos:movie/585244",
    trailerEmbed: "https://www.youtube.com/watch?v=7Za7-Q8YURM",
    isSeries: false
  },
  {
    id: "It's What's Inside",
    imdbId: "tt14577874",
    title: "It's What's Inside",
    releaseDate: "2024-01-19",
    rating: 6.5,
    synopsis: "A pre-wedding reunion descends into a psychological nightmare for a group of college friends when a surprise guest arrives with a mysterious suitcase.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6jzwaLoDurD6Jn2ILb42nFcn3xq.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/xU2C64VWhYJMBDrjEsFPbVTWAjN.jpg",
    manualEmbed: "cos:movie/1052280",
    trailerEmbed: "https://www.youtube.com/watch?v=RJBNi0CjX5I",
    isSeries: false
  },
  {
    id: "One Shot",
    imdbId: "tt14199590",
    title: "One Shot",
    releaseDate: "2021-11-05",
    rating: 6.7,
    synopsis: "An elite squad of Navy SEALs, on a covert mission to transport a prisoner off a CIA black site island prison, are trapped when insurgents attack while trying to rescue the same prisoner.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/3OXiTjU30gWtqxmx4BU9RVp2OTv.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/srJ7haOhfykoPOYPQrstOaFem08.jpg",
    manualEmbed: "cos:movie/811592",
    trailerEmbed: "https://www.youtube.com/watch?v=8PmV8GFrZzo",
    isSeries: false
  },
  {
    id: "Love and Monsters",
    imdbId: "tt2222042",
    title: "Love and Monsters",
    releaseDate: "2020-10-16",
    rating: 7.3,
    synopsis: "Seven years since the Monsterpocalypse began, Joel Dawson has been living underground in order to survive. But after reconnecting over radio with his high school girlfriend Aimee, Joel decides to venture out to reunite with her, despite all the dangerous monsters that stand in his way.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/718NnyxyQuBQcGWt9sdelA1Zc3h.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/lA5fOBqTOQBQ1s9lEYYPmNXoYLi.jpg",
    manualEmbed: "cos:movie/590223",
    trailerEmbed: "https://www.youtube.com/watch?v=DdIHtymX_Fc",
    isSeries: false
  },
  {
    id: "The Marksman",
    imdbId: "tt6902332",
    title: "The Marksman",
    releaseDate: "2021-01-15",
    rating: 6.8,
    synopsis: "Jim Hanson’s quiet life is suddenly disturbed by two people crossing the US/Mexico border – a woman and her young son – desperate to flee a Mexican cartel. After a shootout leaves the mother dead, Jim becomes the boy’s reluctant defender. He embraces his role as Miguel’s protector and will stop at nothing to get him to safety, as they go on the run from the relentless assassins.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6vcDalR50RWa309vBH1NLmG2rjQ.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/5Zv5KmgZzdIvXz2KC3n0MyecSNL.jpg",
    manualEmbed: "cos:movie/634528",
    trailerEmbed: "https://www.youtube.com/watch?v=-PNZh5TIJxw",
    isSeries: false
  },
  {
    id: "Knights of the Zodiac",
    imdbId: "tt6528290",
    title: "Knights of the Zodiac",
    releaseDate: "2023-04-27",
    rating: 6.3,
    synopsis: "When a headstrong street orphan, Seiya, in search of his abducted sister unwittingly taps into hidden powers, he discovers he might be the only person alive who can protect a reincarnated goddess, sent to watch over humanity. Can he let his past go and embrace his destiny to become a Knight of the Zodiac?",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/qW4crfED8mpNDadSmMdi7ZDzhXF.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/fLEsa5SKTFgrdUGMHbsWomniak6.jpg",
    manualEmbed: "cos:movie/455476",
    trailerEmbed: "https://www.youtube.com/watch?v=gZ3o0lTfYOs",
    isSeries: false
  },
  {
    id: "The School for Good and Evil",
    imdbId: "tt2935622",
    title: "The School for Good and Evil",
    releaseDate: "2022-10-19",
    rating: 7,
    synopsis: "Best friends Sophie and Agatha navigate an enchanted school for young heroes and villains — and find themselves on opposing sides of the battle between good and evil.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6oZeEu1GDILdwezmZ5e2xWISf1C.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/tSxbUnrnWlR5dQvUgqMI7sACmFD.jpg",
    manualEmbed: "cos:movie/779782",
    trailerEmbed: "https://www.youtube.com/watch?v=aOWFNAmMplU",
    isSeries: false
  },
  {
    id: "Boy Kills World",
    imdbId: "tt13923084",
    title: "Boy Kills World",
    releaseDate: "2024-04-24",
    rating: 6.7,
    synopsis: "When his family is murdered, a deaf-mute named Boy escapes to the jungle and is trained by a mysterious shaman to repress his childish imagination and become an instrument of death.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/25JskXmchcYwj3jHRmcPm738MpB.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/1LOT0yesrW1l98qYzMbzx6vCRbi.jpg",
    manualEmbed: "cos:movie/882059",
    trailerEmbed: "https://www.youtube.com/watch?v=z6NibtjmjOk",
    isSeries: false
  },
  {
    id: "Arcadian",
    imdbId: "tt22939186",
    title: "Arcadian",
    releaseDate: "2024-04-12",
    rating: 6.1,
    synopsis: "In the near future, on a decimated Earth, Paul and his twin sons face terror at night when ferocious creatures awaken. When Paul is nearly killed, the boys come up with a plan for survival, using everything their father taught them to keep him alive.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/h4T8Xeydkw53h9uIbulYsss25UF.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/9s9o9RT9Yj6nDuRJjnJm78WFoFl.jpg",
    manualEmbed: "cos:movie/1051896",
    trailerEmbed: "https://www.youtube.com/watch?v=HNARuSROxbM",
    isSeries: false
  },
  {
    id: "The Guilty",
    imdbId: "tt9421570",
    title: "The Guilty",
    releaseDate: "2021-09-24",
    rating: 6.4,
    synopsis: "A demoted police officer assigned to a call dispatch desk is conflicted when he receives an emergency phone call from a kidnapped woman.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/m8aR1k35oZMOzZ1kYWUyt401mwq.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/5wPWgTvdoVKW6ICeEAg86IBJOBW.jpg",
    manualEmbed: "cos:movie/567748",
    trailerEmbed: "https://www.youtube.com/watch?v=NaB_ERMAZu4",
    isSeries: false
  },
  {
    id: "The Outpost",
    imdbId: "tt3833480",
    title: "The Outpost",
    releaseDate: "2020-06-24",
    rating: 6.9,
    synopsis: "A small unit of U.S. soldiers, alone at the remote Combat Outpost Keating, located deep in the valley of three mountains in Afghanistan, battles to defend against an overwhelming force of Taliban fighters in a coordinated attack. The Battle of Kamdesh, as it was known, was the bloodiest American engagement of the Afghan War in 2009 and Bravo Troop 3-61 CAV became one of the most decorated units of the 19-year conflict.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/saN1UywIQMQNXYx2ag9j2tPwaVl.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/n1RohH2VoK1CdVI2fXvcP19dSlm.jpg",
    manualEmbed: "cos:movie/531876",
    trailerEmbed: "https://www.youtube.com/watch?v=f4LM9a02q9Q",
    isSeries: false
  },
  {
    id: "Justice League Dark: Apokolips War",
    imdbId: "tt11079148",
    title: "Justice League Dark: Apokolips War",
    releaseDate: "2020-05-05",
    rating: 8.2,
    synopsis: "Earth is decimated after intergalactic tyrant Darkseid has devastated the Justice League in a poorly executed war by the DC Super Heroes. Now the remaining bastions of good – the Justice League, Teen Titans, Suicide Squad and assorted others – must regroup, strategize and take the war to Darkseid in order to save the planet and its surviving inhabitants.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/c01Y4suApJ1Wic2xLmaq1QYcfoZ.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/miChhr7EXynB2R5JLvMcz2oBgi2.jpg",
    manualEmbed: "cos:movie/618344",
    trailerEmbed: "https://www.youtube.com/watch?v=tnCkn5xD2jg",
    isSeries: false
  },
  {
    id: "Jeepers Creepers: Reborn",
    imdbId: "tt14121726",
    title: "Jeepers Creepers: Reborn",
    releaseDate: "2022-09-15",
    rating: 5.3,
    synopsis: "Forced to travel to a horror festival with her boyfriend, a young woman begins experiencing premonitions associated with the urban myth of The Creeper. She believes that something supernatural has been summoned — and that she is at the center of it all.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/aGBuiirBIQ7o64FmJxO53eYDuro.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/jpipejVjqn7ifln05xeq9zpvprf.jpg",
    manualEmbed: "cos:movie/717728",
    trailerEmbed: "https://www.youtube.com/watch?v=eNH2bRZ6gJw",
    isSeries: false
  },
  {
    id: "Emancipation",
    imdbId: "tt12530246",
    title: "Emancipation",
    releaseDate: "2022-12-02",
    rating: 7.7,
    synopsis: "Inspired by the gripping true story of a man who would do anything for his family—and for freedom. When Peter, an enslaved man, risks his life to escape and return to his family, he embarks on a perilous journey of love and endurance.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/AkdNXEquLf4GIkwh1dcSB7j0FTY.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/1jZ3wNpON50whGEH7YOcTQrU45B.jpg",
    manualEmbed: "cos:movie/715931",
    trailerEmbed: "https://www.youtube.com/watch?v=C3yHUpR7yv8",
    isSeries: false
  },
  {
    id: "The Lost Daughter",
    imdbId: "tt9100054",
    title: "The Lost Daughter",
    releaseDate: "2021-12-15",
    rating: 6.4,
    synopsis: "A woman's seaside vacation takes a dark turn when her obsession with a young mother forces her to confront secrets from her past.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/t1oLNRFixpFOVsyz1HCqCUW3wiW.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/6jRHaYJyje5RNS3L353udrPU3ME.jpg",
    manualEmbed: "cos:movie/554230",
    trailerEmbed: "https://www.youtube.com/watch?v=bOORjqHVjvo",
    isSeries: false
  },
  {
    id: "News of the World",
    imdbId: "tt6878306",
    title: "News of the World",
    releaseDate: "2020-12-25",
    rating: 6.9,
    synopsis: "A Texan traveling across the wild West bringing the news of the world to local townspeople, agrees to help rescue a young girl who was kidnapped.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/fYQCgVRsQTEfUrP7cW5iAFVYOlh.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/oyBZyY5GdzZdofVVsDda49QmvFP.jpg",
    manualEmbed: "cos:movie/581032",
    trailerEmbed: "https://www.youtube.com/watch?v=zTZDb_iKooI",
    isSeries: false
  },
  {
    id: "Miller's Girl",
    imdbId: "tt8310486",
    title: "Miller's Girl",
    releaseDate: "2024-01-18",
    rating: 6.3,
    synopsis: "A talented young writer embarks on a creative odyssey when her teacher assigns a project that entangles them both.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/ieU0zUj7WhE0GrgpgofRH0sNjbI.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/ifRqavcREHdS0FN9KtVMXghgryK.jpg",
    manualEmbed: "cos:movie/1026436",
    trailerEmbed: "https://www.youtube.com/watch?v=vk2OJZHutBM",
    isSeries: false
  },
  {
    id: "Hypnotic",
    imdbId: "tt8080204",
    title: "Hypnotic",
    releaseDate: "2023-05-11",
    rating: 6.2,
    synopsis: "A detective becomes entangled in a mystery involving his missing daughter and a secret government program while investigating a string of reality-bending crimes.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/3IhGkkalwXguTlceGSl8XUJZOVI.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/d1Vu0DRCeJ43YX98UKMi9xJNwrR.jpg",
    manualEmbed: "cos:movie/536437",
    trailerEmbed: "https://www.youtube.com/watch?v=XAwpu4rQpeQ",
    isSeries: false
  },
  {
    id: "Beautiful Disaster",
    imdbId: "tt2316548",
    title: "Beautiful Disaster",
    releaseDate: "2023-04-04",
    rating: 6.6,
    synopsis: "College freshman Abby tries to distance herself from her dark past while resisting her attraction to bad boy Travis.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/bwdLflvCcOCRPqb1x13KPuYIzVx.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/qOAH7SDZMjzNolkoLS0PPFPMm0L.jpg",
    manualEmbed: "cos:movie/1016121",
    trailerEmbed: "https://www.youtube.com/watch?v=nvaenzyXl4o",
    isSeries: false
  },
  {
    id: "The Midnight Sky",
    imdbId: "tt10539608",
    title: "The Midnight Sky",
    releaseDate: "2020-12-10",
    rating: 5.7,
    synopsis: "A lone scientist in the Arctic races to contact a crew of astronauts returning home to a mysterious global catastrophe.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/l8lXesOLXKS0VYjzWNZN6gDxv2F.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/dueiWzWc81UAgnbDAyH4Gjqnh4n.jpg",
    manualEmbed: "cos:movie/614911",
    trailerEmbed: "https://www.youtube.com/watch?v=Gb8ZbP6qAzE",
    isSeries: false
  },
  {
    id: "The King of Staten Island",
    imdbId: "tt9686708",
    title: "The King of Staten Island",
    releaseDate: "2020-07-22",
    rating: 7,
    synopsis: "Scott has been a case of arrested development ever since his firefighter father died when he was seven. He's now reached his mid-20s having achieved little, chasing a dream of becoming a tattoo artist that seems far out of reach. As his ambitious younger sister heads off to college, Scott is still living with his exhausted ER nurse mother and spends his days smoking weed, hanging with the guys — Oscar, Igor and Richie — and secretly hooking up with his childhood friend Kelsey. But when his mother starts dating a loudmouth firefighter named Ray, it sets off a chain of events that will force Scott to grapple with his grief and take his first tentative steps toward moving forward in life.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/zQFjMmE3K9AX5QrBL1SXIxYQ9jz.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/5rwcd24GGltKiqdPT4G2dmchLr9.jpg",
    manualEmbed: "cos:movie/579583",
    trailerEmbed: "https://www.youtube.com/watch?v=azkVr0VUSTA",
    isSeries: false
  },
  {
    id: "Project Power",
    imdbId: "tt7550000",
    title: "Project Power",
    releaseDate: "2020-08-14",
    rating: 6.4,
    synopsis: "An ex-soldier, a teen and a cop collide in New Orleans as they hunt for the source behind a dangerous new pill that grants users temporary superpowers.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/TnOeov4w0sTtV2gqICqIxVi74V.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/qVygtf2vU15L2yKS4Ke44U4oMdD.jpg",
    manualEmbed: "cos:movie/605116",
    trailerEmbed: "https://www.youtube.com/watch?v=xw1vQgVaYNQ",
    isSeries: false
  },
  {
    id: "Life in a Year",
    imdbId: "tt6598238",
    title: "Life in a Year",
    releaseDate: "2020-11-27",
    rating: 8.2,
    synopsis: "A 17 year old finds out that his girlfriend is dying, so he sets out to give her an entire life, in the last year she has left.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/bP7u19opmHXYeTCUwGjlLldmUMc.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/u6aGN71Hx39iX8Uv4ILRRKHmAXc.jpg",
    manualEmbed: "cos:movie/447362",
    trailerEmbed: "https://www.youtube.com/watch?v=BgmJ14p4Uuk",
    isSeries: false
  },
  {
    id: "Archive",
    imdbId: "tt6882604",
    title: "Archive",
    releaseDate: "2020-08-13",
    rating: 6.4,
    synopsis: "2038: George Almore is working on a true human-equivalent AI, and his latest prototype is almost ready. This sensitive phase is also the riskiest as he has a goal that must be hidden at all costs—being reunited with his dead wife.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/hmz9ySdCqW9FiHpM9JdSCkjQzFA.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/u9YEh2xVAPVTKoaMNlB5tH6pXkm.jpg",
    manualEmbed: "cos:movie/606234",
    trailerEmbed: "https://www.youtube.com/watch?v=m0J0BwIzURI",
    isSeries: false
  },
  {
    id: "Ticket to Paradise",
    imdbId: "tt14109724",
    title: "Ticket to Paradise",
    releaseDate: "2022-09-08",
    rating: 6.4,
    synopsis: "Divorced couple Georgia and David find themselves on a shared mission: they team up and travel to Bali to stop their daughter Lily from making the same mistake they once made 25 years ago.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/1tzERH50P5c2mFWtLbgixzLZS1L.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/n4elrbXCYyhBGHuw3YrUHbwmQBo.jpg",
    manualEmbed: "cos:movie/800939",
    trailerEmbed: "https://www.youtube.com/watch?v=hkP4tVTdsz8",
    isSeries: false
  },
  {
    id: "Pinocchio",
    imdbId: "tt4593060",
    title: "Pinocchio",
    releaseDate: "2022-09-07",
    rating: 6.2,
    synopsis: "A wooden puppet embarks on a thrilling adventure to become a real boy.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/zaZhjKrJeWczQ3AotKoQObppEbH.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/nnUQqlVZeEGuCRx8SaoCU4XVHJN.jpg",
    manualEmbed: "cos:movie/532639",
    trailerEmbed: "https://www.youtube.com/watch?v=gV_0pYoCssc",
    isSeries: false
  },
  {
    id: "The Fallout",
    imdbId: "tt11847410",
    title: "The Fallout",
    releaseDate: "2021-03-17",
    rating: 7.5,
    synopsis: "In the wake of a school tragedy, Vada, Mia and Quinton form a unique and dynamic bond as they navigate the never linear, often confusing journey to heal in a world that feels forever changed.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/4ByHl9XRKR2iXbvF0ZilMRD1RcL.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/2vDftymNaVXhRULlc2ZGHHDsdnD.jpg",
    manualEmbed: "cos:movie/795514",
    trailerEmbed: "https://www.youtube.com/watch?v=Gtl-6RCOl84",
    isSeries: false
  },
  {
    id: "The Tragedy of Macbeth",
    imdbId: "tt10095582",
    title: "The Tragedy of Macbeth",
    releaseDate: "2021-12-05",
    rating: 6.9,
    synopsis: "Macbeth, the Thane of Glamis, receives a prophecy from a trio of witches that one day he will become King of Scotland. Consumed by ambition and spurred to action by his wife, Macbeth murders his king and takes the throne for himself.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/tDNJEhcLbX3jIk3BMCur9pCdaVD.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/lMjY6kMBOHhloz2Ul16fLJn8xuw.jpg",
    manualEmbed: "cos:movie/591538",
    trailerEmbed: "https://www.youtube.com/watch?v=ptqe7s6pO7g",
    isSeries: false
  },
  {
    id: "Cobweb",
    imdbId: "tt9100018",
    title: "Cobweb",
    releaseDate: "2023-07-19",
    rating: 6.4,
    synopsis: "Eight year old Peter is plagued by a mysterious, constant tapping from inside his bedroom wall—one that his parents insist is all in his imagination. As Peter's fear intensifies, he believes that his parents could be hiding a terrible, dangerous secret and questions their trustworthiness.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/cGXFosYUHYjjdKrOmA0bbjvzhKz.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/nYDPmxvl0if5vHBBp7pDYGkTFc7.jpg",
    manualEmbed: "cos:movie/709631",
    trailerEmbed: "https://www.youtube.com/watch?v=hGY0icwlDGY",
    isSeries: false
  },
  {
    id: "Werewolf by Night",
    imdbId: "tt15318872",
    title: "Werewolf by Night",
    releaseDate: "2022-09-25",
    rating: 7,
    synopsis: "On a dark and somber night, a secret cabal of monster hunters emerge from the shadows and gather at the foreboding Bloodstone Temple following the death of their leader. In a strange and macabre memorial to the leader’s life, the attendees are thrust into a mysterious and deadly competition for a powerful relic—a hunt that will ultimately bring them face to face with a dangerous monster.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/mvIvNKRIJPPS7WSFarFhOAGIVnU.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/l1ORpdYr8uFZ9MNYKoq1p6fIc4M.jpg",
    manualEmbed: "cos:movie/894205",
    trailerEmbed: "https://www.youtube.com/watch?v=kyaCzFvWbdM",
    isSeries: false
  },
  {
    id: "One Life",
    imdbId: "tt13097932",
    title: "One Life",
    releaseDate: "2023-12-21",
    rating: 7.8,
    synopsis: "British stockbroker Nicholas Winton visits Czechoslovakia in the 1930s and forms plans to assist in the rescue of Jewish children before the onset of World War II, in an operation that came to be known as the Kindertransport.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/yvnIWt2j8VnDgwKJE2VMiFMa2Qo.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/7kgDHoXEk0EySTczcmaYpPDBFQS.jpg",
    manualEmbed: "cos:movie/760774",
    trailerEmbed: "https://www.youtube.com/watch?v=6ethollg-PI",
    isSeries: false
  },
  {
    id: "Boston Strangler",
    imdbId: "tt2560078",
    title: "Boston Strangler",
    releaseDate: "2023-03-16",
    rating: 6.6,
    synopsis: "Reporters Loretta McLaughlin and Jean Cole bravely pursue the story of the Boston Strangler at great personal risk, putting their own lives on the line in their quest to uncover the truth.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/oZJfw78ZyPmgNJ0YJ8070nKEF4Y.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/254iY5CzFzjnjkP0lUkLpOLvXar.jpg",
    manualEmbed: "cos:movie/881164",
    trailerEmbed: "https://www.youtube.com/watch?v=pe7ERBfYFIE",
    isSeries: false
  },
  {
    id: "Thirteen Lives",
    imdbId: "tt12262116",
    title: "Thirteen Lives",
    releaseDate: "2022-07-18",
    rating: 7.8,
    synopsis: "Based on the true nail-biting mission that captivated the world. Twelve boys and the coach of a Thai soccer team explore the Tham Luang cave when an unexpected rainstorm traps them in a chamber inside the mountain. Entombed behind a maze of flooded cave tunnels, they face impossible odds. A team of world-class divers navigate through miles of dangerous cave networks to discover that finding the boys is only the beginning.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/yi5KcJqFxy0D6yP8nCfcF8gJGg5.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/tHR34A5n0my4maACNdLpWGd6QYq.jpg",
    manualEmbed: "cos:movie/698948",
    trailerEmbed: "https://www.youtube.com/watch?v=R068Si4eb3Y",
    isSeries: false
  },
  {
    id: "Marry Me",
    imdbId: "tt10223460",
    title: "Marry Me",
    releaseDate: "2022-02-09",
    rating: 6.6,
    synopsis: "After finding out about her fiancé's cheating ways, a pop superstar impulsively marries a total stranger. They must soon decide if two people from such different worlds can find true love.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/ko1JVbGj4bT8IhCWqjBQ6ZtF2t.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/vdQdA6sAqnTbkyxGh6lpoEvNfEG.jpg",
    manualEmbed: "cos:movie/615904",
    trailerEmbed: "https://www.youtube.com/watch?v=Ebv9_rNb5Ig",
    isSeries: false
  },
  {
    id: "Prey for the Devil",
    imdbId: "tt9271672",
    title: "Prey for the Devil",
    releaseDate: "2022-10-23",
    rating: 6.8,
    synopsis: "In response to a global rise in demonic possessions, the Catholic Church reopens exorcism schools to train priests in the Rite of Exorcism. On this spiritual battlefield, an unlikely warrior rises: a young nun, Sister Ann. Thrust onto the spiritual frontline with fellow student Father Dante, Sister Ann finds herself in a battle for the soul of a young girl and soon realizes the Devil has her right where he wants her.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/iCvgemXf2Kpr2LvpDmt5J9NhjKM.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/7dm64SW5L5CCg47kAEAcdCGaq5i.jpg",
    manualEmbed: "cos:movie/676547",
    trailerEmbed: "https://www.youtube.com/watch?v=OkEnG6inG4c",
    isSeries: false
  },
  {
    id: "Atlas",
    imdbId: "tt14856980",
    title: "Atlas",
    releaseDate: "2024-05-23",
    rating: 6.6,
    synopsis: "A brilliant counterterrorism analyst with a deep distrust of AI discovers it might be her only hope when a mission to capture a renegade robot goes awry.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/bcM2Tl5HlsvPBnL8DKP9Ie6vU4r.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/3TNSoa0UHGEzEz5ndXGjJVKo8RJ.jpg",
    manualEmbed: "cos:movie/614933",
    trailerEmbed: "https://www.youtube.com/watch?v=Jokpt_LJpbw",
    isSeries: false
  },
  {
    id: "The Kissing Booth 2",
    imdbId: "tt9784456",
    title: "The Kissing Booth 2",
    releaseDate: "2020-07-24",
    rating: 7.6,
    synopsis: "With college decisions looming, Elle juggles her long-distance romance with Noah, changing relationship with bestie Lee and feelings for a new classmate.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/mb7wQv0adK3kjOUr9n93mANHhPJ.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/bXdCpL1A1mW2sEBiTmYYFnb10XN.jpg",
    manualEmbed: "cos:movie/583083",
    trailerEmbed: "https://www.youtube.com/watch?v=fjVonI2oVeM",
    isSeries: false
  },
  {
    id: "Last Seen Alive",
    imdbId: "tt10242388",
    title: "Last Seen Alive",
    releaseDate: "2022-05-12",
    rating: 6.4,
    synopsis: "After Will Spann's wife suddenly vanishes at a gas station, his desperate search to find her leads him down a dark path that forces him to run from authorities and take the law into his own hands.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/qvqyDj34Uivokf4qIvK4bH0m0qF.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/nAHysRXM17o6TurhobGtL1MCDDH.jpg",
    manualEmbed: "cos:movie/961484",
    trailerEmbed: "https://www.youtube.com/watch?v=PE7Sla2xL7U",
    isSeries: false
  },
  {
    id: "To Catch a Killer",
    imdbId: "tt10275534",
    title: "To Catch a Killer",
    releaseDate: "2023-04-06",
    rating: 6.8,
    synopsis: "Baltimore. New Year's Eve. A talented but troubled police officer is recruited by the FBI's chief investigator to help profile and track down a mass murderer.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/mFp3l4lZg1NSEsyxKrdi0rNK8r1.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/T5xXoFqyc9jNXZIbH4Sw0jwWjw.jpg",
    manualEmbed: "cos:movie/605886",
    trailerEmbed: "https://www.youtube.com/watch?v=qPMi94XLoEA",
    isSeries: false
  },
  {
    id: "Bob Marley: One Love",
    imdbId: "tt8521778",
    title: "Bob Marley: One Love",
    releaseDate: "2024-02-14",
    rating: 6.6,
    synopsis: "Jamaican singer-songwriter Bob Marley overcomes adversity to become the most famous reggae musician in the world.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/1lQftpEARVVB9op4TaYiIbactzG.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/lHPap2xBR7DgWLiu6RsfKESgzAi.jpg",
    manualEmbed: "cos:movie/802219",
    trailerEmbed: "https://www.youtube.com/watch?v=ajw425Kuvtw",
    isSeries: false
  },
  {
    id: "The Out-Laws",
    imdbId: "tt11274492",
    title: "The Out-Laws",
    releaseDate: "2023-07-07",
    rating: 6,
    synopsis: "A straight-laced bank manager is about to marry the love of his life. When his bank is held up by infamous Ghost Bandits during his wedding week, he believes his future in-laws who just arrived in town, are the infamous Out-Laws.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/5dliMQ2ODbGNoq0hlefdnuXQxMw.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/fjWcAbHRxCSR4kLGvsPEhNjR2ts.jpg",
    manualEmbed: "cos:movie/921636",
    trailerEmbed: "https://www.youtube.com/watch?v=R8xepj9wpi4",
    isSeries: false
  },
  {
    id: "Blacklight",
    imdbId: "tt14060094",
    title: "Blacklight",
    releaseDate: "2022-02-10",
    rating: 6.1,
    synopsis: "Travis Block is a shadowy Government agent who specializes in removing operatives whose covers have been exposed. He then has to uncover a deadly conspiracy within his own ranks that reaches the highest echelons of power.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/bv9dy8mnwftdY2j6gG39gCfSFpV.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/tULzz524DuvMxnAuQJpo8dk0EvJ.jpg",
    manualEmbed: "cos:movie/823625",
    trailerEmbed: "https://www.youtube.com/watch?v=k_N9pU4FMOs",
    isSeries: false
  },
  {
    id: "Bill & Ted Face the Music",
    imdbId: "tt1086064",
    title: "Bill & Ted Face the Music",
    releaseDate: "2020-08-27",
    rating: 5.9,
    synopsis: "Yet to fulfill their rock and roll destiny, the stakes are higher than ever for the now middle-aged Bill and Ted who set out on a new adventure when a visitor from the future warns them that only their song can save life as we know it.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/4V2nTPfeB59TcqJcUfQ9ziTi7VN.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/ceVaixg5VUfx8j0N81FT0hRayRm.jpg",
    manualEmbed: "cos:movie/501979",
    trailerEmbed: "https://www.youtube.com/watch?v=1gPGeAYo3yU",
    isSeries: false
  },
  {
    id: "Sweet Girl",
    imdbId: "tt10731768",
    title: "Sweet Girl",
    releaseDate: "2021-08-18",
    rating: 6.6,
    synopsis: "A man vows to bring justice to those responsible for his wife's death while protecting the only family he has left, his daughter.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/cP7odDzzFBD9ycxj2laTeFWGLjD.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/nprqOIEfiMMQx16lgKeLf3rmPrR.jpg",
    manualEmbed: "cos:movie/619297",
    trailerEmbed: "https://www.youtube.com/watch?v=NiFuJV2GLkY",
    isSeries: false
  },
  {
    id: "Bodies Bodies Bodies",
    imdbId: "tt8110652",
    title: "Bodies Bodies Bodies",
    releaseDate: "2022-08-05",
    rating: 6.1,
    synopsis: "In an isolated family mansion, a group of rich 20-somethings decides to play Bodies Bodies Bodies, a game where one of them is secretly a \"killer\" while the rest tries to \"escape\". Things take a turn for the worse when real bodies start turning up, setting off a paranoid and dangerous chain of events.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/hSuTjDmqRdy7Dii8ymnF2WILTeP.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/qYCl28dMJwRTzlbteTrW75szZPN.jpg",
    manualEmbed: "cos:movie/520023",
    trailerEmbed: "https://www.youtube.com/watch?v=cTzGKsZjBOY",
    isSeries: false
  },
  {
    id: "The Babysitter: Killer Queen",
    imdbId: "tt11024272",
    title: "The Babysitter: Killer Queen",
    releaseDate: "2020-09-10",
    rating: 6.3,
    synopsis: "Two years after defeating a satanic cult led by his babysitter Bee, Cole's trying to forget his past and focus on surviving high school. But when old enemies unexpectedly return, Cole will once again have to outsmart the forces of evil.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/imy1OoT1xddt2kqw6hhc4v01e8i.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/qDV3sQRhqyXflUfH6gOTGkPXTaV.jpg",
    manualEmbed: "cos:movie/623491",
    trailerEmbed: "https://www.youtube.com/watch?v=8WzUYkzRgBE",
    isSeries: false
  },
  {
    id: "On the Rocks",
    imdbId: "tt9606374",
    title: "On the Rocks",
    releaseDate: "2020-10-02",
    rating: 6.1,
    synopsis: "Faced with sudden doubts about her marriage, a young New York mother teams up with her larger-than-life playboy father to tail her husband.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/fcijRCmB7yTtloh4Pumy9b1rkwU.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/7FQHLt4iNh2TZ58cAAYrZK0xogg.jpg",
    manualEmbed: "cos:movie/575417",
    trailerEmbed: "https://www.youtube.com/watch?v=Xn3sK4WiviA",
    isSeries: false
  },
  {
    id: "Reminiscence",
    imdbId: "tt3272066",
    title: "Reminiscence",
    releaseDate: "2021-08-18",
    rating: 6.5,
    synopsis: "Nicolas Bannister, a rugged and solitary veteran living in a near-future Miami flooded by rising seas, is an expert in a dangerous occupation: he offers clients the chance to relive any memory they desire. His life changes when he meets a mysterious young woman named Mae. What begins as a simple matter of lost and found becomes a passionate love affair. But when a different client's memories implicate Mae in a series of violent crimes, Bannister must delve through the dark world of the past to uncover the truth about the woman he fell for.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/17siH6wJRQ2jZiqz9BWUhy1UtZ.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/8yhWlFcJ8zCqjfCvLy3lWFuawR1.jpg",
    manualEmbed: "cos:movie/579047",
    trailerEmbed: "https://www.youtube.com/watch?v=_BggT--yxf0",
    isSeries: false
  },
  {
    id: "The Union",
    imdbId: "tt12610390",
    title: "The Union",
    releaseDate: "2024-08-15",
    rating: 6,
    synopsis: "A New Jersey construction worker goes from regular guy to aspiring spy when his long-lost high school sweetheart recruits him for an espionage mission.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/d9CTnTHip1RbVi2OQbA2LJJQAGI.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/4ft6TR9wA6bra0RLL6G7JFDQ5t1.jpg",
    manualEmbed: "cos:movie/704239",
    trailerEmbed: "https://www.youtube.com/watch?v=vea9SdnRMyg",
    isSeries: false
  },
  {
    id: "Gunpowder Milkshake",
    imdbId: "tt8368408",
    title: "Gunpowder Milkshake",
    releaseDate: "2021-07-14",
    rating: 6.3,
    synopsis: "To protect an 8-year-old girl, a dangerous assassin reunites with her mother and her lethal associates to take down a ruthless crime syndicate and its army of henchmen.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/56ofGPMOZCwlTjTao5fB7vnGOoj.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/7OxkZIH9dkDQlXhwWggyCSrXmwd.jpg",
    manualEmbed: "cos:movie/574060",
    trailerEmbed: "https://www.youtube.com/watch?v=YLMT5uXjFLY",
    isSeries: false
  },
  {
    id: "Upgraded",
    imdbId: "tt21830902",
    title: "Upgraded",
    releaseDate: "2024-02-07",
    rating: 7.2,
    synopsis: "Ana is an ambitious intern dreaming of a career in the art world while trying to impress her demanding boss Claire. When she's upgraded to first class on a work trip, she meets handsome Will, and Ana pretends to be her boss– a white lie that sets off a glamorous chain of events, romance and opportunity, until her fib threatens to surface.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/uhOXS17gRpTwA85WsZLlYFK3rz0.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/77Fqz6PFCSnWySDOmEL6ZPcaYIl.jpg",
    manualEmbed: "cos:movie/1014590",
    trailerEmbed: "https://www.youtube.com/watch?v=P3_dj7BnHp8",
    isSeries: false
  },
  {
    id: "Missing",
    imdbId: "tt10855768",
    title: "Missing",
    releaseDate: "2023-01-19",
    rating: 7.4,
    synopsis: "When her mother disappears while on vacation in Colombia with her new boyfriend, June’s search for answers is hindered by international red tape. Stuck thousands of miles away in Los Angeles, June creatively uses all the latest technology at her fingertips to try and find her before it’s too late. But as she digs deeper, her digital sleuthing raises more questions than answers... and when June unravels secrets about her mom, she discovers that she never really knew her at all.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/wEOUYSU5Uf8J7152PT6jdb5233Y.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/tVH1qEFyKiCpP6kNDFyXKW2Tiif.jpg",
    manualEmbed: "cos:movie/768362",
    trailerEmbed: "https://www.youtube.com/watch?v=seBixtcx19E",
    isSeries: false
  },
  {
    id: "In the Heights",
    imdbId: "tt1321510",
    title: "In the Heights",
    releaseDate: "2021-06-10",
    rating: 7.1,
    synopsis: "The story of Usnavi, a bodega owner who has mixed feelings about closing his store and retiring to the Dominican Republic or staying in Washington Heights.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/lbf7wmrYRieR8fNFLnGiypMoPm1.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/uEJuqp08dH6IQwZJGASlPZOXqKu.jpg",
    manualEmbed: "cos:movie/467909",
    trailerEmbed: "https://www.youtube.com/watch?v=lCYrqpng9QA",
    isSeries: false
  },
  {
    id: "No Exit",
    imdbId: "tt7550014",
    title: "No Exit",
    releaseDate: "2022-02-24",
    rating: 6.8,
    synopsis: "Stranded at a rest stop in the mountains during a blizzard, a recovering addict discovers a kidnapped child hidden in a car belonging to one of the people inside the building which sets her on a terrifying struggle to identify who among them is the kidnapper.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/5cnLoWq9o5tuLe1Zq4BTX4LwZ2B.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/epE4VnwJkqWEQIYLvWYxBj277W3.jpg",
    manualEmbed: "cos:movie/833425",
    trailerEmbed: "https://www.youtube.com/watch?v=GFvupyiNEz0",
    isSeries: false
  },
  {
    id: "The Witcher: Nightmare of the Wolf",
    imdbId: "tt11657662",
    title: "The Witcher: Nightmare of the Wolf",
    releaseDate: "2021-08-22",
    rating: 7.4,
    synopsis: "Escaping from poverty to become a witcher, Vesemir slays monsters for coin and glory, but when a new menace rises, he must face the demons of his past.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/3sLz2yv6vBDWqBbd8rdnNeoJ2kJ.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/orGlr1vHTgbDkGJPwuBjd8ncVjQ.jpg",
    manualEmbed: "cos:movie/666243",
    trailerEmbed: "https://www.youtube.com/watch?v=J365hQpaWRw",
    isSeries: false
  },
  {
    id: "Run (2020)",
    imdbId: "tt8633478",
    title: "Run",
    releaseDate: "2020-11-20",
    rating: 7.2,
    synopsis: "Chloe, a teenager who is confined to a wheelchair, is homeschooled by her mother, Diane. Chloe soon becomes suspicious of her mother and begins to suspect that she may be harboring a dark secret.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/ilHG4EayOVoYeKqslspY3pR4wzC.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/rLchzndbDRy41J9X363pMePbV5x.jpg",
    manualEmbed: "cos:movie/546121",
    trailerEmbed: "https://www.youtube.com/watch?v=z_v0icKzgw0",
    isSeries: false
  },
  {
    id: "Men",
    imdbId: "tt13841850",
    title: "Men",
    releaseDate: "2022-05-20",
    rating: 6.1,
    synopsis: "In the aftermath of a personal tragedy, Harper retreats alone to the beautiful English countryside, hoping to find a place to heal. But someone — or something — from the surrounding woods appears to be stalking her, and what begins as simmering dread becomes a fully-formed nightmare, inhabited by her darkest memories and fears.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/jo1Kv3P3UgDVk7JnUFr2Cl8WWUM.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/4N2FuCTuqH3h4dw9XPFtsnDPSz7.jpg",
    manualEmbed: "cos:movie/780609",
    trailerEmbed: "https://www.youtube.com/watch?v=pt81CJcWZy8",
    isSeries: false
  },
  {
    id: "Infinity Pool",
    imdbId: "tt10365998",
    title: "Infinity Pool",
    releaseDate: "2023-01-27",
    rating: 6,
    synopsis: "While staying at an isolated island resort, James and Em are enjoying a perfect vacation of pristine beaches, exceptional staff, and soaking up the sun. But guided by the seductive and mysterious Gabi, they venture outside the resort grounds and find themselves in a culture filled with violence, hedonism, and untold horror. A tragic accident leaves them facing a zero tolerance policy for crime: either you'll be executed, or, if you’re rich enough to afford it, you can watch yourself die instead.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/cQKyNm0Nz6KWiDBQF9w4aZAmOfC.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/1xhcEecvRJXQ2OAVO7l9btlrN6D.jpg",
    manualEmbed: "cos:movie/667216",
    trailerEmbed: "https://www.youtube.com/watch?v=W5mfHz-5dx8",
    isSeries: false
  },
  {
    id: "The Good Nurse",
    imdbId: "tt4273800",
    title: "The Good Nurse",
    releaseDate: "2022-10-19",
    rating: 6.9,
    synopsis: "Suspicious that her colleague is responsible for a series of mysterious patient deaths, a nurse risks her own life to uncover the truth.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/rSq6cq0LCcbro10jbEaPTEb3WmW.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/x2U0R60Z7hmJxZixzsGZfjFJbve.jpg",
    manualEmbed: "cos:movie/541134",
    trailerEmbed: "https://www.youtube.com/watch?v=e0DQevX-GZs",
    isSeries: false
  },
  {
    id: "Gretel & Hansel",
    imdbId: "tt9086228",
    title: "Gretel & Hansel",
    releaseDate: "2020-01-30",
    rating: 6,
    synopsis: "A long time ago in a distant fairy tale countryside, a young girl leads her little brother into a dark wood in desperate search of food and work, only to stumble upon a nexus of terrifying evil.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/mBBBXseq4k4dI63k06XIrsc02j8.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/en1XAePgWqNSXb82luUMmo5u3cF.jpg",
    manualEmbed: "cos:movie/542224",
    trailerEmbed: "https://www.youtube.com/watch?v=NiMNMpMo-gQ",
    isSeries: false
  },
  {
    id: "Obi-Wan Kenobi: A Jedi's Return",
    imdbId: "tt21860836",
    title: "Obi-Wan Kenobi: A Jedi's Return",
    releaseDate: "2022-09-07",
    rating: 6.8,
    synopsis: "This special explores the return of Obi-Wan Kenobi and Anakin Skywalker to the screen, as well as Ewan McGregor and Hayden Christensen to their classic roles. Director Deborah Chow leads the cast and crew as they create new heroes and villains that live alongside new incarnations of beloved Star Wars characters, and an epic story that dramatically bridges the saga films.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/vQGgvXjoMZf8x1m3BHsMxVXPyck.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/c8jqJ502BzvkCXy2enrao1PuQEE.jpg",
    manualEmbed: "cos:movie/1015606",
    trailerEmbed: "https://www.youtube.com/watch?v=4WaC8k3WVl8",
    isSeries: false
  },
  {
    id: "No Way Up",
    imdbId: "tt16253418",
    title: "No Way Up",
    releaseDate: "2024-01-18",
    rating: 6.2,
    synopsis: "Characters from different backgrounds are thrown together when the plane they're travelling on crashes into the Pacific Ocean. A nightmare fight for survival ensues with the air supply running out and dangers creeping in from all sides.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/hu40Uxp9WtpL34jv3zyWLb5zEVY.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/4woSOUD0equAYzvwhWBHIJDCM88.jpg",
    manualEmbed: "cos:movie/1096197",
    trailerEmbed: "https://www.youtube.com/watch?v=e1k1PC0TtmE",
    isSeries: false
  },
  {
    id: "Army of Thieves",
    imdbId: "tt13024674",
    title: "Army of Thieves",
    releaseDate: "2021-10-27",
    rating: 6.8,
    synopsis: "A mysterious woman recruits bank teller Ludwig Dieter to lead a group of aspiring thieves on a top-secret heist during the early stages of the zombie apocalypse.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/j04Oepj3LGTWSb1ltXm0pcy50Xq.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/bo4evsmoKb16AD1OhHgVOlgJtBw.jpg",
    manualEmbed: "cos:movie/796499",
    trailerEmbed: "https://www.youtube.com/watch?v=Ith2WetKXlg",
    isSeries: false
  },
  {
    id: "Beast",
    imdbId: "tt13223398",
    title: "Beast",
    releaseDate: "2022-08-11",
    rating: 6.5,
    synopsis: "A recently widowed man and his two teenage daughters travel to a game reserve in South Africa. However, their journey of healing soon turns into a fight for survival when a bloodthirsty lion starts to stalk them.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/f18rGcLlawKjNC5KRh36S0mvRlY.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/pz7bGOUNJXyPKJ2GcJN6nhwBnCs.jpg",
    manualEmbed: "cos:movie/760741",
    trailerEmbed: "https://www.youtube.com/watch?v=oQMc7Sq36mI",
    isSeries: false
  },
  {
    id: "The Greatest Beer Run Ever",
    imdbId: "tt10268488",
    title: "The Greatest Beer Run Ever",
    releaseDate: "2022-09-23",
    rating: 7.5,
    synopsis: "Chickie wants to support his friends fighting in Vietnam, so he does something wild—personally bring them American beer. What starts as a well-meaning journey quickly changes Chickie's life and perspective.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/ggf37TpcKaxwguhvtNn6MQpyqBn.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/7bjaAcbrJDVvdF2Uew6rGp9Tp05.jpg",
    manualEmbed: "cos:movie/597922",
    trailerEmbed: "https://www.youtube.com/watch?v=NqxziDlZOIo",
    isSeries: false
  },
  {
    id: "Artemis Fowl",
    imdbId: "tt3089630",
    title: "Artemis Fowl",
    releaseDate: "2020-05-29",
    rating: 5.5,
    synopsis: "Artemis Fowl is a 12-year-old genius and descendant of a long line of criminal masterminds. He soon finds himself in an epic battle against a race of powerful underground fairies who may be behind his father's disappearance.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/tI8ocADh22GtQFV28vGHaBZVb0U.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/uL2s9Snfjb9AvImGGQLDnMpfzge.jpg",
    manualEmbed: "cos:movie/475430",
    trailerEmbed: "https://www.youtube.com/watch?v=rA0NnDagh28",
    isSeries: false
  },
  {
    id: "The Rental",
    imdbId: "tt10003008",
    title: "The Rental",
    releaseDate: "2020-07-23",
    rating: 5.6,
    synopsis: "Two couples on an oceanside getaway grow suspicious that the host of their seemingly perfect rental house may be spying on them. Before long, what should have been a celebratory weekend trip turns into something far more sinister.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/3ynPnBXQVT2Y0s19fDIPlWKUlxH.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/hwzBIfrje4mGYC1WiPGee2ZDYI6.jpg",
    manualEmbed: "cos:movie/587496",
    trailerEmbed: "https://www.youtube.com/watch?v=MGdcTUMGxB0",
    isSeries: false
  },
  {
    id: "Ava",
    imdbId: "tt8784956",
    title: "Ava",
    releaseDate: "2020-07-02",
    rating: 5.8,
    synopsis: "A black ops assassin is forced to fight for her own survival after a job goes dangerously wrong.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/qzA87Wf4jo1h8JMk9GilyIYvwsA.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/54yOImQgj8i85u9hxxnaIQBRUuo.jpg",
    manualEmbed: "cos:movie/539885",
    trailerEmbed: "https://www.youtube.com/watch?v=ozUuAcGOhPs",
    isSeries: false
  },
  {
    id: "Mortal Kombat Legends: Scorpion's Revenge",
    imdbId: "tt9580138",
    title: "Mortal Kombat Legends: Scorpion's Revenge",
    releaseDate: "2020-04-12",
    rating: 8.1,
    synopsis: "After the vicious slaughter of his family by stone-cold mercenary Sub-Zero, Hanzo Hasashi is exiled to the torturous Netherrealm. There, in exchange for his servitude to the sinister Quan Chi, he’s given a chance to avenge his family – and is resurrected as Scorpion, a lost soul bent on revenge. Back on Earthrealm, Lord Raiden gathers a team of elite warriors – Shaolin monk Liu Kang, Special Forces officer Sonya Blade, and action star Johnny Cage – an unlikely band of heroes with one chance to save humanity. To do this, they must defeat Shang Tsung's horde of Outworld gladiators and reign over the Mortal Kombat tournament.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/iBvo3qOPcmhlqAaJcXcQHtx2qLk.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/vw3zNfzvnVNF7nIjpiEgcdznfeC.jpg",
    manualEmbed: "cos:movie/664767",
    trailerEmbed: "https://www.youtube.com/watch?v=P87QXvvav7Y",
    isSeries: false
  },
  {
    id: "The Trial of the Chicago 7",
    imdbId: "tt1070874",
    title: "The Trial of the Chicago 7",
    releaseDate: "2020-09-25",
    rating: 7.7,
    synopsis: "What was supposed to be a peaceful protest turned into a violent clash with the police. What followed was one of the most notorious trials in history.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/ahf5cVdooMAlDRiJOZQNuLqa1Is.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/v8Nf6Y1qL1Q3PWTBezXNPPaXqza.jpg",
    manualEmbed: "cos:movie/556984",
    trailerEmbed: "https://www.youtube.com/watch?v=FVb6EdKDBfU",
    isSeries: false
  },
  {
    id: "Vacation Friends",
    imdbId: "tt3626476",
    title: "Vacation Friends",
    releaseDate: "2021-08-27",
    rating: 7,
    synopsis: "When a straight-laced couple that has fun with a rowdy couple on vacation in Mexico return to the States, they discover that the crazy couple they met in Mexico followed them back home and decide to play tricks on them.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/cCyJeTAct07ORPJPHyzxCrVtZzh.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/o0UGl6icA4DbhmDNgdZ5AWvuTtM.jpg",
    manualEmbed: "cos:movie/653349",
    trailerEmbed: "https://www.youtube.com/watch?v=UuK21YmfpsE",
    isSeries: false
  },
  {
    id: "Don't Move",
    imdbId: "tt24807110",
    title: "Don't Move",
    releaseDate: "2024-10-24",
    rating: 6.3,
    synopsis: "A grieving woman in a secluded forest encounters a killer who injects her with a paralytic drug. As her body shuts down, her fight for survival begins.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/cRDJxdnRb7ikKd6fVJTrGeaL34v.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/6Rjsm5khNaYa4Gnw4iHnGX2E34T.jpg",
    manualEmbed: "cos:movie/1063877",
    trailerEmbed: "https://www.youtube.com/watch?v=q0GpvLLMVQ4",
    isSeries: false
  },
  {
    id: "Cherry",
    imdbId: "tt9130508",
    title: "Cherry",
    releaseDate: "2021-02-26",
    rating: 7.3,
    synopsis: "Cherry drifts from college dropout to army medic in Iraq—anchored only by his one true love, Emily. But after returning from the war with PTSD, his life spirals into drugs and crime as he struggles to find his place in the world.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/pwDvkDyaHEU9V7cApQhbcSJMG1w.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/kzXUQnrUnHUGHuwWbgf9KpoU3qr.jpg",
    manualEmbed: "cos:movie/544401",
    trailerEmbed: "https://www.youtube.com/watch?v=H5bH6O0bErk",
    isSeries: false
  },
  {
    id: "Sound of Metal",
    imdbId: "tt5363618",
    title: "Sound of Metal",
    releaseDate: "2020-11-20",
    rating: 7.7,
    synopsis: "Metal drummer Ruben begins to lose his hearing. When a doctor tells him his condition will worsen, he thinks his career and life is over. His girlfriend Lou checks the former addict into a rehab for the deaf hoping it will prevent a relapse and help him adapt to his new life. After being welcomed and accepted just as he is, Ruben must choose between his new normal and the life he once knew.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/3178oOJKKPDeQ2legWQvMPpllv.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/7b5R8FfGUzlxfhOkPpL3xyIeuyF.jpg",
    manualEmbed: "cos:movie/502033",
    trailerEmbed: "https://www.youtube.com/watch?v=VFOrGkAvjAE",
    isSeries: false
  },
  {
    id: "Roald Dahl's Matilda the Musical",
    imdbId: "tt3447590",
    title: "Roald Dahl's Matilda the Musical",
    releaseDate: "2022-11-25",
    rating: 6.8,
    synopsis: "An extraordinary young girl discovers her superpower and summons the remarkable courage, against all odds, to help others change their stories, whilst also taking charge of her own destiny. Standing up for what's right, she's met with miraculous results.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/ga8R3OiOMMgSvZ4cOj8x7prUNYZ.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/jG52tsazn04F1fe8hPZfVv7ICKt.jpg",
    manualEmbed: "cos:movie/668482",
    trailerEmbed: "https://www.youtube.com/watch?v=mEEMbNS6fzY",
    isSeries: false
  },
  {
    id: "The Night Clerk",
    imdbId: "tt7979142",
    title: "The Night Clerk",
    releaseDate: "2020-02-19",
    rating: 6.2,
    synopsis: "Hotel night clerk Bart Bromley is a highly intelligent young man on the Autism spectrum. When a woman is murdered during his shift, Bart becomes the prime suspect. As the police investigation closes in, Bart makes a personal connection with a beautiful guest named Andrea, but soon realises he must stop the real murderer before she becomes the next victim.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/hPWjid7yMatyIDHvku7lCMN7zSi.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/eUaCIstB8oLNQd62Krt0hgqrjQg.jpg",
    manualEmbed: "cos:movie/526007",
    trailerEmbed: "https://www.youtube.com/watch?v=flDC7Ar2Deg",
    isSeries: false
  },
  {
    id: "The Mother",
    imdbId: "tt6968614",
    title: "The Mother",
    releaseDate: "2023-05-04",
    rating: 6.6,
    synopsis: "A deadly female assassin comes out of hiding to protect the daughter that she gave up years before, while on the run from dangerous men.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/vnRthEZz16Q9VWcP5homkHxyHoy.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/n5NSF8wZeWQHHZtuWgbRAVpqXFR.jpg",
    manualEmbed: "cos:movie/552688",
    trailerEmbed: "https://www.youtube.com/watch?v=8BFdFeOS3oM",
    isSeries: false
  },
  {
    id: "BlackBerry",
    imdbId: "tt21867434",
    title: "BlackBerry",
    releaseDate: "2023-02-13",
    rating: 7.2,
    synopsis: "Two mismatched entrepreneurs – egghead innovator Mike Lazaridis and cut-throat businessman Jim Balsillie – joined forces in an endeavour that was to become a worldwide hit in little more than a decade. The story of the meteoric rise and catastrophic demise of the world's first smartphone.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/nQSvHZDuMlrZdm7ooMo8gb4CXhW.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/cUHxmWfkp6se0Rt10Kr86bMCYDE.jpg",
    manualEmbed: "cos:movie/1016084",
    trailerEmbed: "https://www.youtube.com/watch?v=cXL_HDzBQsM",
    isSeries: false
  },
  {
    id: "Boiling Point",
    imdbId: "tt11127680",
    title: "Boiling Point",
    releaseDate: "2021-07-05",
    rating: 7.3,
    synopsis: "A head chef balances multiple personal and professional crises at a popular restaurant in London.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/kdkk7OBnIL1peW2zwcAAp6O54Jo.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/he0XbwtxDiRnPERvboWMkvXFdAJ.jpg",
    manualEmbed: "cos:movie/807196",
    trailerEmbed: "https://www.youtube.com/watch?v=NX8J7_7_rLw",
    isSeries: false
  },
  {
    id: "Coming 2 America",
    imdbId: "tt6802400",
    title: "Coming 2 America",
    releaseDate: "2021-03-04",
    rating: 6.3,
    synopsis: "Prince Akeem Joffer is set to become King of Zamunda when he discovers he has a son he never knew about in America – a street savvy Queens native named Lavelle. Honoring his royal father's dying wish to groom this son as the crown prince, Akeem and Semmi set off to America once again.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/nWBPLkqNApY5pgrJFMiI9joSI30.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/vKzbIoHhk1z9DWYi8kyFe9Gg0HF.jpg",
    manualEmbed: "cos:movie/484718",
    trailerEmbed: "https://www.youtube.com/watch?v=x5lrkdvEZGg",
    isSeries: false
  },
  {
    id: "Do Revenge",
    imdbId: "tt13327038",
    title: "Do Revenge",
    releaseDate: "2022-09-14",
    rating: 6.4,
    synopsis: "A dethroned queen bee at a posh private high school strikes a secret deal with an unassuming new student to enact revenge on one another’s enemies.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/akIjKJDHcVN4bzifcEarKVPNpoa.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/yWRvAfZmbzk61REYod4WQACDhRj.jpg",
    manualEmbed: "cos:movie/762968",
    trailerEmbed: "https://www.youtube.com/watch?v=rK-JQU_bShc",
    isSeries: false
  },
  {
    id: "Nomadland",
    imdbId: "tt9770150",
    title: "Nomadland",
    releaseDate: "2021-01-29",
    rating: 7.2,
    synopsis: "A woman in her sixties embarks on a journey through the western United States after losing everything in the Great Recession, living as a van-dwelling modern-day nomad.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/8Vc5EOUEIF1EUXuX9eLFf7BvN3P.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/563sRDK3rZS31TXCdTY4lfcwrNK.jpg",
    manualEmbed: "cos:movie/581734",
    trailerEmbed: "https://www.youtube.com/watch?v=BZ4o4jwSaHk",
    isSeries: false
  },
  {
    id: "Happiest Season",
    imdbId: "tt8522006",
    title: "Happiest Season",
    releaseDate: "2020-11-26",
    rating: 7.1,
    synopsis: "A young woman's plans to propose to her girlfriend while at her family's annual holiday party are upended when she discovers her partner hasn't yet come out to her conservative parents.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/vzec9kkOSE93tygyfOktedkeOQ.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/jOWgFmD1H5t6nL7ChbmX8oDFUZl.jpg",
    manualEmbed: "cos:movie/520172",
    trailerEmbed: "https://www.youtube.com/watch?v=PMFul0g5gqI",
    isSeries: false
  },
  {
    id: "Bloodshot",
    imdbId: "tt1634106",
    title: "Bloodshot",
    releaseDate: "2020-03-05",
    rating: 6.7,
    synopsis: "After he and his wife are murdered, marine Ray Garrison is resurrected by a team of scientists. Enhanced with nanotechnology, he becomes a superhuman, biotech killing machine—'Bloodshot'. As Ray first trains with fellow super-soldiers, he cannot recall anything from his former life. But when his memories flood back and he remembers the man that killed both him and his wife, he breaks out of the facility to get revenge, only to discover that there's more to the conspiracy than he thought.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/8WUVHemHFH2ZIP6NWkwlHWsyrEL.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/zlqMASc3vEtdym2OvXgE7fC6onT.jpg",
    manualEmbed: "cos:movie/338762",
    trailerEmbed: "https://www.youtube.com/watch?v=0R-qIOGyEcw",
    isSeries: false
  },
  {
    id: "Palmer",
    imdbId: "tt6857376",
    title: "Palmer",
    releaseDate: "2021-01-28",
    rating: 8.1,
    synopsis: "After 12 years in prison, former high school football star Eddie Palmer returns home to put his life back together—and forms an unlikely bond with Sam, an outcast boy from a troubled home. But Eddie's past threatens to ruin his new life and family.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/xSDdRAjxKAGi8fUBLOqSrBhJmF0.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/mlBmnjDJfsAhvqRVc2aFOjsfh8M.jpg",
    manualEmbed: "cos:movie/458220",
    trailerEmbed: "https://www.youtube.com/watch?v=8jVuOheTNGQ",
    isSeries: false
  },
  {
    id: "Candyman",
    imdbId: "tt9347730",
    title: "Candyman",
    releaseDate: "2021-08-25",
    rating: 6,
    synopsis: "A Chicago artist's sanity starts to unravel, unleashing a terrifying wave of violence when he begins to explore the macabre history of the Candyman.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/dqoshZPLNsXlC1qtz5n34raUyrE.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/g1cMEQnEptUJ7Sv8SRjWBTTHyMv.jpg",
    manualEmbed: "cos:movie/565028",
    trailerEmbed: "https://www.youtube.com/watch?v=TPBH3XO8YEU",
    isSeries: false
  },
  {
    id: "Jolt",
    imdbId: "tt10228134",
    title: "Jolt",
    releaseDate: "2021-07-15",
    rating: 6.5,
    synopsis: "A bouncer with an anger management problem goes on a furious and resentful rampage after the murder of a friend.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/b0fBzqCmHr0a0XkeAdhc02XhKXG.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/wPjtacig0kIkVcTQmXoNt6jbMwo.jpg",
    manualEmbed: "cos:movie/617502",
    trailerEmbed: "https://www.youtube.com/watch?v=3BSSoD73TSk",
    isSeries: false
  },
  {
    id: "To All the Boys: P.S. I Still Love You",
    imdbId: "tt9354842",
    title: "To All the Boys: P.S. I Still Love You",
    releaseDate: "2020-02-03",
    rating: 6.8,
    synopsis: "Lara Jean and Peter have just taken their romance from pretend to officially real when another recipient of one of her love letters enters the picture.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/maib5VlmEqp5xlN8lptnBSftp2o.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/9LsJP9OuIBmBUxZpmVKtUUjF0PA.jpg",
    manualEmbed: "cos:movie/565426",
    trailerEmbed: "https://www.youtube.com/watch?v=LIU4xb61PHc",
    isSeries: false
  },
  {
    id: "Freelance",
    imdbId: "tt15744298",
    title: "Freelance",
    releaseDate: "2023-10-05",
    rating: 6.4,
    synopsis: "An ex-special forces operative takes a job to provide security for a journalist as she interviews a dictator, but a military coup breaks out in the middle of the interview, they are forced to escape into the jungle where they must survive.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/7Bd4EUOqQDKZXA6Od5gkfzRNb0.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/zIYROrkHJPYB3VTiW1L9QVgaQO.jpg",
    manualEmbed: "cos:movie/897087",
    trailerEmbed: "https://www.youtube.com/watch?v=W0k2XerT8Nw",
    isSeries: false
  },
  {
    id: "Leo",
    imdbId: "tt5755238",
    title: "Leo",
    releaseDate: "2023-11-17",
    rating: 7.3,
    synopsis: "Jaded 74-year-old reptile Leo has been stuck in the same Florida classroom for decades with his terrarium-mate turtle. When he learns he only has one year left to live, he plans to escape to experience life on the outside but instead gets caught up in the problems of his anxious students — including an impossibly mean substitute teacher.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/gSOVog7ydsaF1YpgAqBqnKYFGY.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/auXrHU6O17n9Tz11SHReoorjrU6.jpg",
    manualEmbed: "cos:movie/1075794",
    trailerEmbed: "https://www.youtube.com/watch?v=G_AEL-Xo5l8",
    isSeries: false
  },
  {
    id: "Bottoms",
    imdbId: "tt17527468",
    title: "Bottoms",
    releaseDate: "2023-08-25",
    rating: 6.8,
    synopsis: "Unpopular best friends PJ and Josie start a high school self-defense club to meet girls and lose their virginity. They soon find themselves in over their heads when the most popular students start beating each other up in the name of self-defense.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/jeyTQrNEpyE1LZIgVlswYh3sc34.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/1yhQqbi1rZg9EJiOI22i8Xg7vW.jpg",
    manualEmbed: "cos:movie/814776",
    trailerEmbed: "https://www.youtube.com/watch?v=vH5NAahf76s",
    isSeries: false
  },
  {
    id: "The Kissing Booth 3",
    imdbId: "tt12783454",
    title: "The Kissing Booth 3",
    releaseDate: "2021-08-11",
    rating: 6.9,
    synopsis: "It’s the summer before Elle heads to college, and she has a secret decision to make. Elle has been accepted into Harvard, where boyfriend Noah is matriculating, and also Berkeley, where her BFF Lee is headed and has to decide if she should stay or not.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/c7xcqnMDVQ5v1hJBm3AZ5YikNe6.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/oOZM1C3wZtsZtdidVgEazeas7U4.jpg",
    manualEmbed: "cos:movie/727745",
    trailerEmbed: "https://www.youtube.com/watch?v=5fKn0Dhj64w",
    isSeries: false
  },
  {
    id: "Judas and the Black Messiah",
    imdbId: "tt9784798",
    title: "Judas and the Black Messiah",
    releaseDate: "2021-02-12",
    rating: 7.3,
    synopsis: "Bill O'Neal infiltrates the Black Panthers on the orders of FBI Agent Mitchell and J. Edgar Hoover. As Black Panther Chairman Fred Hampton ascends—falling for a fellow revolutionary en route—a battle wages for O’Neal’s soul.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/iIgr75GoqFxe1X5Wz9siOODGe9u.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/fatz1aegtBGh7KS0gipcsw9MqUn.jpg",
    manualEmbed: "cos:movie/583406",
    trailerEmbed: "https://www.youtube.com/watch?v=6ivHf4ODMi4",
    isSeries: false
  },
  {
    id: "He's All That",
    imdbId: "tt4590256",
    title: "He's All That",
    releaseDate: "2021-08-27",
    rating: 6.5,
    synopsis: "To get revenge on her ex-boyfriend, an influencer attempts to transform an unpopular classmate into prom king.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/kW3AG5NHoyq52dcSbMiFB6LyHvk.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/nYQ0fT0xg4HeGWiXGuwSldJNAsJ.jpg",
    manualEmbed: "cos:movie/347626",
    trailerEmbed: "https://www.youtube.com/watch?v=XqTPaRz8Nx8",
    isSeries: false
  },
  {
    id: "Fear Street: 1666",
    imdbId: "tt9701942",
    title: "Fear Street: 1666",
    releaseDate: "2021-07-14",
    rating: 7.1,
    synopsis: "In 1666, a colonial town is gripped by a hysterical witch-hunt that has deadly consequences for centuries to come, and it's up to teenagers in 1994 to finally put an end to their town's curse, before it's too late.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/rmEPtz3Ufzol2VWUAZYzOFaBio3.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/jLeOzQLZJEpmAMDnfKMmORFGuV.jpg",
    manualEmbed: "cos:movie/591275",
    trailerEmbed: "https://www.youtube.com/watch?v=dj3CXY8rKuY",
    isSeries: false
  },
  {
    id: "The Last Kingdom: Seven Kings Must Die",
    imdbId: "tt15767808",
    title: "The Last Kingdom: Seven Kings Must Die",
    releaseDate: "2023-04-14",
    rating: 7.2,
    synopsis: "In the wake of King Edward's death, Uhtred of Bebbanburg and his comrades adventure across a fractured kingdom in the hopes of uniting England at last.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/qcNDxDzd5OW9wE3c8nWxCBQoBrM.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/kEhCztSTP4ixu7R0AIWg8vvcvbb.jpg",
    manualEmbed: "cos:movie/948713",
    trailerEmbed: "https://www.youtube.com/watch?v=eqCYw_o5lng",
    isSeries: false
  },
  {
    id: "Let Him Go",
    imdbId: "tt9340860",
    title: "Let Him Go",
    releaseDate: "2020-11-05",
    rating: 6.8,
    synopsis: "Following the loss of their son, a retired sheriff and his wife leave their Montana ranch to rescue their young grandson from the clutches of a dangerous family living off the grid in the Dakotas.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/EsLZoT8oHhQlGd1QpdbnvnwTzO.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/ZLD4pjmMLt9I3t1a7SFJBekIh1.jpg",
    manualEmbed: "cos:movie/596161",
    trailerEmbed: "https://www.youtube.com/watch?v=bE8pwEF-3TI",
    isSeries: false
  },
  {
    id: "Family Switch",
    imdbId: "tt14227048",
    title: "Family Switch",
    releaseDate: "2023-11-30",
    rating: 6.4,
    synopsis: "When the Walker family members switch bodies with each other during a rare planetary alignment, their hilarious journey to find their way back to normal will bring them closer together than they ever thought possible.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/g8Gwitm4CtZBSYhLeSY4Z3Xwwcg.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/fc2pEZgr0ltmyzLl4cO9JInOg6l.jpg",
    manualEmbed: "cos:movie/798021",
    trailerEmbed: "https://www.youtube.com/watch?v=SWh4c9EVqGM",
    isSeries: false
  },
  {
    id: "Finch",
    imdbId: "tt3420504",
    title: "Finch",
    releaseDate: "2021-11-04",
    rating: 7.8,
    synopsis: "On a post-apocalyptic Earth, a robot, built to protect the life of his dying creator's beloved dog, learns about life, love, friendship, and what it means to be human.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/eEJtzD1F05xDipFEDY98CTH5yZn.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/uoc358GH6Yl7TufbUKHkETPu64B.jpg",
    manualEmbed: "cos:movie/522402",
    trailerEmbed: "https://www.youtube.com/watch?v=-0bYWnP3jH4",
    isSeries: false
  },
  {
    id: "Hustle",
    imdbId: "tt8009428",
    title: "Hustle",
    releaseDate: "2022-06-03",
    rating: 7.7,
    synopsis: "After discovering a once-in-a-lifetime player with a rocky past abroad, a down on his luck basketball scout takes it upon himself to bring the phenom to the States without his team's approval. Against the odds, they have one final shot to prove they have what it takes to make it in the NBA.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/xWic7kPq13oRxYjbGLApXCnc7pz.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/hGr0FrLI74vqpBWTBOPloDBwOAK.jpg",
    manualEmbed: "cos:movie/705861",
    trailerEmbed: "https://www.youtube.com/watch?v=nM4iy0reaCA",
    isSeries: false
  },
  {
    id: "Dog",
    imdbId: "tt11252248",
    title: "Dog",
    releaseDate: "2022-02-17",
    rating: 7.3,
    synopsis: "An army ranger and his dog embark on a road trip along the Pacific Coast Highway to attend a friend's funeral.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/zHQy4h36WwuCetKS7C3wcT1hkgA.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/cGnaZm6EQOJESde3Vv4v53Zk4gN.jpg",
    manualEmbed: "cos:movie/626735",
    trailerEmbed: "https://www.youtube.com/watch?v=JL6p4IAI23Y",
    isSeries: false
  },
  {
    id: "Brahms: The Boy II",
    imdbId: "tt9173418",
    title: "Brahms: The Boy II",
    releaseDate: "2020-02-20",
    rating: 5.9,
    synopsis: "After a family moves into the Heelshire Mansion, their young son soon makes friends with a life-like doll called Brahms.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/swTC1DSZcvdxTOzmAKrtoUUPiDW.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/jeiVmutYPZyQRSYk7OvyWENGIrA.jpg",
    manualEmbed: "cos:movie/555974",
    trailerEmbed: "https://www.youtube.com/watch?v=ECPfXUW0zt8",
    isSeries: false
  },
  {
    id: "The Lodge",
    imdbId: "tt7347846",
    title: "The Lodge",
    releaseDate: "2020-01-16",
    rating: 6.1,
    synopsis: "When a father is forced to abruptly depart for work, he leaves his children, Aidan and Mia, at their holiday home in the care of his new girlfriend, Grace. Isolated and alone, a blizzard traps them inside the lodge as terrifying events summon specters from Grace's dark past.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/yake2myhbW7c6dKbmwYDy1i40bm.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/2hV2clTCW55dwTLCZcOvvidjjrV.jpg",
    manualEmbed: "cos:movie/474764",
    trailerEmbed: "https://www.youtube.com/watch?v=ohLHereEOM8",
    isSeries: false
  },
  {
    id: "Paranormal Activity: Next of Kin",
    imdbId: "tt10515988",
    title: "Paranormal Activity: Next of Kin",
    releaseDate: "2021-10-29",
    rating: 6.1,
    synopsis: "Margot is a documentary filmmaker looking to meet her long-lost mother and extended family in a secluded Amish community. She and her film crew soon realize the family that welcomes them into their home might be hiding a sinister secret.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/wRy3SwJFE55iL2bfKqECzP2qyrd.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/xAnSELun945cE4kFUD9mI7W3puI.jpg",
    manualEmbed: "cos:movie/609972",
    trailerEmbed: "https://www.youtube.com/watch?v=cyrhAScX80k",
    isSeries: false
  },
  {
    id: "Emily the Criminal",
    imdbId: "tt15255876",
    title: "Emily the Criminal",
    releaseDate: "2022-08-12",
    rating: 6.6,
    synopsis: "Desperate for income, Emily takes a shady gig buying goods with stolen credit cards supplied by a charismatic middleman named Youcef. Seduced by the quick cash and illicit thrills, they hatch a plan to take their business to the next level.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/iZvzMpREGiqDQ5eYbx8z70qPgst.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/rIgVB9OyryTxFnqjPU9ULMbQvR4.jpg",
    manualEmbed: "cos:movie/862965",
    trailerEmbed: "https://www.youtube.com/watch?v=ON6IwdTqQkI",
    isSeries: false
  },
  {
    id: "Things Heard & Seen",
    imdbId: "tt10962368",
    title: "Things Heard & Seen",
    releaseDate: "2021-04-29",
    rating: 5.7,
    synopsis: "A young woman discovers that both her husband and their new home harbor sinister secrets after they leave Manhattan for small-town life.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/9tSkNmGt1K5Lgf0L0BTHHYJNz0W.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/vl8c6eG2i61nqKnU1uXOlYvRalG.jpg",
    manualEmbed: "cos:movie/631060",
    trailerEmbed: "https://www.youtube.com/watch?v=HCAaonjgDEA",
    isSeries: false
  },
  {
    id: "Guns Akimbo",
    imdbId: "tt6902676",
    title: "Guns Akimbo",
    releaseDate: "2020-02-27",
    rating: 6.4,
    synopsis: "An ordinary guy suddenly finds himself forced to fight a gladiator-like battle for a dark website that streams the violence for viewers. In order to survive and rescue his kidnapped ex-girlfriend, he must battle Nix, a heavily armed and much more experienced fighter.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/2kNnf7BwRCEm4bcFkdiE0T4U25s.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/jKnZ3CavwSTsBbgSpAhQU8Z9nOy.jpg",
    manualEmbed: "cos:movie/457335",
    trailerEmbed: "https://www.youtube.com/watch?v=ggxLUtqsouM",
    isSeries: false
  },
  {
    id: "Antlers",
    imdbId: "tt7740510",
    title: "Antlers",
    releaseDate: "2021-10-28",
    rating: 6.2,
    synopsis: "A small-town Oregon teacher and her brother, the local sheriff, discover a young student is harbouring a dangerous secret that could have frightening consequences.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/cMch3tiexw3FdOEeZxMWVel61Xg.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/10sdvlxjeTZNBxPg0PLl4CKU7v0.jpg",
    manualEmbed: "cos:movie/516329",
    trailerEmbed: "https://www.youtube.com/watch?v=2aiYxwVuZ1o",
    isSeries: false
  },
  {
    id: "Kandahar",
    imdbId: "tt5761544",
    title: "Kandahar",
    releaseDate: "2023-05-25",
    rating: 6.8,
    synopsis: "After his mission is exposed, an undercover CIA operative stuck deep in hostile territory in Afghanistan must fight his way out, alongside his Afghan translator, to an extraction point in Kandahar, all whilst avoiding elite enemy forces and foreign spies tasked with hunting them down.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/lCanGgsqF4xD2WA5NF8PWeT3IXd.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/c6Splshb8lb2Q9OvUfhpqXl7uP0.jpg",
    manualEmbed: "cos:movie/717930",
    trailerEmbed: "https://www.youtube.com/watch?v=WHs6z9RPGtA",
    isSeries: false
  },
  {
    id: "American Fiction",
    imdbId: "tt23561236",
    title: "American Fiction",
    releaseDate: "2023-11-10",
    rating: 7.2,
    synopsis: "A novelist fed up with the establishment profiting from \"Black\" entertainment uses a pen name to write a book that propels him into the heart of hypocrisy and the madness he claims to disdain.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/57MFWGHarg9jid7yfDTka4RmcMU.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/3mpgltEMgPf8zFtPnAWdDVN8ZT1.jpg",
    manualEmbed: "cos:movie/1056360",
    trailerEmbed: "https://www.youtube.com/watch?v=5_4RlHpqVWM",
    isSeries: false
  },
  {
    id: "Oddity",
    imdbId: "tt26470109",
    title: "Oddity",
    releaseDate: "2024-07-19",
    rating: 6.7,
    synopsis: "After the brutal murder of her twin sister, Darcy goes after those responsible by using haunted items as her tools for revenge.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/3Z9c1tbUhP0QruRjczPHnbx3U2D.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/6GhU4BJnqLSaAuz0yQBq3RfdzsF.jpg",
    manualEmbed: "cos:movie/1216191",
    trailerEmbed: "https://www.youtube.com/watch?v=ktIqbb0TS7s",
    isSeries: false
  },
  {
    id: "Till Death",
    imdbId: "tt11804152",
    title: "Till Death",
    releaseDate: "2021-07-02",
    rating: 6.7,
    synopsis: "After a romantic evening at their secluded lake house, a woman wakes up handcuffed to her dead husband. Trapped and isolated in the dead of winter, she must fight off hired killers to escape her late spouse's twisted plan.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/bvwMvrX2XqZVOz35YuYbFx3Iggr.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/rInMNJipAil3iIcBltPiGRkNAG7.jpg",
    manualEmbed: "cos:movie/672741",
    trailerEmbed: "https://www.youtube.com/watch?v=Wfmb1-UEpW4",
    isSeries: false
  },
  {
    id: "Firestarter",
    imdbId: "tt1798632",
    title: "Firestarter",
    releaseDate: "2022-05-12",
    rating: 5.4,
    synopsis: "For more than a decade, parents Andy and Vicky have been on the run, desperate to hide their daughter Charlie from a shadowy federal agency that wants to harness her unprecedented gift for creating fire into a weapon of mass destruction. Andy has taught Charlie how to defuse her power, which is triggered by anger or pain. But as Charlie turns 11, the fire becomes harder and harder to control. After an incident reveals the family's location, a mysterious operative is deployed to hunt down the family and seize Charlie once and for all. Charlie has other plans.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/jjBdPcQ0bplBnv2XgElKLoeFDuM.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/lwFKeONjTUSbqaaGdJL8vJq2LK1.jpg",
    manualEmbed: "cos:movie/532710",
    trailerEmbed: "https://www.youtube.com/watch?v=59MJfJPP5eo",
    isSeries: false
  },
  {
    id: "Reptile",
    imdbId: "tt13274016",
    title: "Reptile",
    releaseDate: "2023-09-29",
    rating: 6.7,
    synopsis: "Following the brutal murder of a young real estate agent, a hardened detective attempts to uncover the truth in a case where nothing is as it seems, and by doing so dismantles the illusions in his own life.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/bk4WUvoXSqPQGrhOAtt3AR0sUZf.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/nrp2khEM6JWFqqNLeub1J6Qafe0.jpg",
    manualEmbed: "cos:movie/866463",
    trailerEmbed: "https://www.youtube.com/watch?v=KS1cNkZ9o1U",
    isSeries: false
  },
  {
    id: "Willy's Wonderland",
    imdbId: "tt8114980",
    title: "Willy's Wonderland",
    releaseDate: "2021-02-12",
    rating: 6,
    synopsis: "When his car breaks down, a quiet loner agrees to clean an abandoned family fun center in exchange for repairs. He soon finds himself waging war against possessed animatronic mascots while trapped inside Willy's Wonderland.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/keEnkeAvifw8NSEC4f6WsqeLJgF.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/jFINtstDUh0vHOGImpMAmLrPcXy.jpg",
    manualEmbed: "cos:movie/643586",
    trailerEmbed: "https://www.youtube.com/watch?v=0v27rfaoB2Y",
    isSeries: false
  },
  {
    id: "White Noise",
    imdbId: "tt6160448",
    title: "White Noise",
    releaseDate: "2022-11-25",
    rating: 5.6,
    synopsis: "Jack Gladney, professor of Hitler studies at The-College-on-the-Hill, husband to Babette, and father to four children/stepchildren, is torn asunder by a chemical spill from a rail car that releases an \"Airborne Toxic Event\" forcing Jack to confront his biggest fear - his own mortality.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/kesxNdLZlmGoTRspDHU1WgdEuGw.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/4QB2TfxmzgMDLmsVVk1HM4tt7ef.jpg",
    manualEmbed: "cos:movie/744594",
    trailerEmbed: "https://www.youtube.com/watch?v=SgwKZAMx_gM",
    isSeries: false
  },
  {
    id: "Spenser Confidential",
    imdbId: "tt8629748",
    title: "Spenser Confidential",
    releaseDate: "2020-03-06",
    rating: 6.5,
    synopsis: "Spenser, a former Boston patrolman who just got out from prison, teams up with Hawk, an aspiring fighter, to unravel the truth behind the death of two police officers.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/fePczipv6ZzDO2uoww4vTAu2Sq3.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/ftODZXaXpWtV5XFD8gS9n9KwLDr.jpg",
    manualEmbed: "cos:movie/581600",
    trailerEmbed: "https://www.youtube.com/watch?v=bgKEoHNi3Uc",
    isSeries: false
  },
  {
    id: "Texas Chainsaw Massacre",
    imdbId: "tt11755740",
    title: "Texas Chainsaw Massacre",
    releaseDate: "2022-02-18",
    rating: 5.2,
    synopsis: "After nearly 50 years of hiding, Leatherface returns to terrorize a group of idealistic influencers who accidentally disrupt his carefully shielded world in a remote Texas town.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/7sKiGNWFM15WNyY7LYd5vmb3brO.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/aTSA5zMWlVFTYBIZxTCMbLkfOtb.jpg",
    manualEmbed: "cos:movie/632727",
    trailerEmbed: "https://www.youtube.com/watch?v=zcI6SFiK_yk",
    isSeries: false
  },
  {
    id: "Unhinged",
    imdbId: "tt10059518",
    title: "Unhinged",
    releaseDate: "2020-07-16",
    rating: 6.4,
    synopsis: "Rachel is a divorced single mother whose bad day gets even worse. She's running late to drop her son off at school when she honks her horn impatiently at a fellow driver during rush-hour traffic. After an exchange of words, she soon realizes that the mysterious man is following her and her young son in his truck. A case of road rage quickly escalates, at horrifyingly psychotic proportions, into full-blown terror as Rachel discovers the psychopath's sinister plan for revenge. He is single-mindedly determined to teach her a deadly lesson.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/xfIcONZO4AiWpzm3jEpbR4llzVX.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/wXk9y36eTmNl6XwEuOfw6yNNClr.jpg",
    manualEmbed: "cos:movie/625568",
    trailerEmbed: "https://www.youtube.com/watch?v=vNJ0szhjvdM",
    isSeries: false
  },
  {
    id: "Chemical Hearts",
    imdbId: "tt5843876",
    title: "Chemical Hearts",
    releaseDate: "2020-08-21",
    rating: 7.3,
    synopsis: "When a hopelessly romantic high school senior falls for a mysterious new classmate, it sets them both on an unexpected journey that teaches them about love, loss, and most importantly themselves.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/q1MNlZYqhoD4U7sd7pjxD6SUf4z.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/pGTXJcZQIgqzFZlWy6KxlamlTHK.jpg",
    manualEmbed: "cos:movie/621013",
    trailerEmbed: "https://www.youtube.com/watch?v=GuS5BZTUVJs",
    isSeries: false
  },
  {
    id: "To All the Boys: Always and Forever",
    imdbId: "tt10676012",
    title: "To All the Boys: Always and Forever",
    releaseDate: "2021-02-12",
    rating: 7.5,
    synopsis: "Senior year of high school takes center stage as Lara Jean returns from a family trip to Korea and considers her college plans — with and without Peter.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/iepqdM52f4w75fNcvgRF5QoIAjm.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/qjhcTGnjxYJqwBGlDzZkYWmne6e.jpg",
    manualEmbed: "cos:movie/614409",
    trailerEmbed: "https://www.youtube.com/watch?v=2jPdejek5QA",
    isSeries: false
  },
  {
    id: "The Woman in Cabin 10",
    imdbId: "tt7130300",
    title: "The Woman in Cabin 10",
    releaseDate: "2025-10-09",
    rating: 6.2,
    synopsis: "On a lavish yacht for an assignment, a journalist sees a passenger go overboard. But when no one believes her, she risks her life to uncover the truth.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/4kpdyePOlcELQQJcxXPF5GB1Adw.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/9IHZeCusOd7RUaQpUrQJlKqjsUZ.jpg",
    manualEmbed: "cos:movie/1290879",
    trailerEmbed: "https://www.youtube.com/watch?v=1QbfJzTPY4w",
    isSeries: false
  },
  {
    id: "The Christmas Chronicles: Part Two",
    imdbId: "tt11057644",
    title: "The Christmas Chronicles: Part Two",
    releaseDate: "2020-11-18",
    rating: 6.5,
    synopsis: "Kate Pierce is reluctantly spending Christmas with her mom’s new boyfriend and his son Jack. But when the North Pole and Christmas are threatened to be destroyed, Kate and Jack are unexpectedly pulled into a new adventure with Santa Claus.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6sG0kbEvAi3RRLcGGU5h8l3qAPa.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/mxVpkHclXPgWxo62SJ0a0YcUzgC.jpg",
    manualEmbed: "cos:movie/654028",
    trailerEmbed: "https://www.youtube.com/watch?v=HVzBwSOcBaI",
    isSeries: false
  },
  {
    id: "Nimona",
    imdbId: "tt19500164",
    title: "Nimona",
    releaseDate: "2023-06-23",
    rating: 7.9,
    synopsis: "A knight framed for a tragic crime teams with a scrappy, shape-shifting teen to prove his innocence.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/2NQljeavtfl22207D1kxLpa4LS3.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/sidvlo7V8VMyskNKGwua0Tarbol.jpg",
    manualEmbed: "cos:movie/961323",
    trailerEmbed: "https://www.youtube.com/watch?v=f_fuHRyQbOc",
    isSeries: false
  },
  {
    id: "I'm Thinking of Ending Things",
    imdbId: "tt7939766",
    title: "I'm Thinking of Ending Things",
    releaseDate: "2020-08-28",
    rating: 6.5,
    synopsis: "Nothing is as it seems when a woman experiencing misgivings about her new boyfriend joins him on a road trip to meet his parents at their remote farm.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/5ynWWapdl45hJXUh0KIevxSG9JQ.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/bMKGU5HFHPvg67ybbNXnBvpFEp0.jpg",
    manualEmbed: "cos:movie/500840",
    trailerEmbed: "https://www.youtube.com/watch?v=cDTg62vsV4U",
    isSeries: false
  },
  {
    id: "The Social Dilemma",
    imdbId: "tt11464826",
    title: "The Social Dilemma",
    releaseDate: "2020-01-26",
    rating: 7.5,
    synopsis: "This documentary-drama hybrid explores the dangerous human impact of social networking, with tech experts sounding the alarm on their own creations.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/jcaM6V2tCtu6iMHDsGLBUbaYgYp.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/iYqoT9VBGdGTuLl3cjfbG7ZXDkP.jpg",
    manualEmbed: "cos:movie/656690",
    trailerEmbed: "https://www.youtube.com/watch?v=uaaC57tcci0",
    isSeries: false
  },
  {
    id: "Outside the Wire",
    imdbId: "tt10451914",
    title: "Outside the Wire",
    releaseDate: "2021-01-15",
    rating: 6.3,
    synopsis: "In the near future, a drone pilot is sent into a deadly militarized zone and must work with an android officer to locate a doomsday device.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6XYLiMxHAaCsoyrVo38LBWMw2p8.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/lOSdUkGQmbAl5JQ3QoHqBZUbZhC.jpg",
    manualEmbed: "cos:movie/775996",
    trailerEmbed: "https://www.youtube.com/watch?v=u8ZsUivELbs",
    isSeries: false
  },
  {
    id: "Synchronic",
    imdbId: "tt9016974",
    title: "Synchronic",
    releaseDate: "2020-10-23",
    rating: 6.3,
    synopsis: "Two New Orleans paramedics' lives are ripped apart after encountering a series of horrific deaths linked to a designer drug with bizarre, otherworldly effects.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/wgm4gdJwb7iSYX0uBsRAZmHQmPm.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/zh1M8fE2vQ0BKxYzIvMYan7ryV.jpg",
    manualEmbed: "cos:movie/549294",
    trailerEmbed: "https://www.youtube.com/watch?v=fl_kzTQvPVw",
    isSeries: false
  },
  {
    id: "tick, tick... BOOM!",
    imdbId: "tt8721424",
    title: "tick, tick... BOOM!",
    releaseDate: "2021-11-11",
    rating: 7.6,
    synopsis: "On the brink of turning 30, a promising theater composer navigates love, friendship and the pressure to create something great before time runs out.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/DPmfcuR8fh8ROYXgdjrAjSGA0o.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/rKe3MR2u4ZZ0y9uKivzKJRrqBCe.jpg",
    manualEmbed: "cos:movie/537116",
    trailerEmbed: "https://www.youtube.com/watch?v=YJserno8tyU",
    isSeries: false
  },
  {
    id: "Spaceman",
    imdbId: "tt11097384",
    title: "Spaceman",
    releaseDate: "2024-02-23",
    rating: 6.7,
    synopsis: "Six months into a solo mission, a lonely astronaut confronts the cracks in his marriage with help from a mysterious creature he discovers on his ship.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/f46WvKEsBn98WJbPJcO47ZoKn6B.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/9ZFNRs58TTnvf3utagd0uSJluXa.jpg",
    manualEmbed: "cos:movie/636706",
    trailerEmbed: "https://www.youtube.com/watch?v=rNZ0xKaCdus",
    isSeries: false
  },
  {
    id: "Spencer",
    imdbId: "tt12536294",
    title: "Spencer",
    releaseDate: "2021-11-04",
    rating: 6.7,
    synopsis: "During her Christmas holidays with the royal family at the Sandringham estate in Norfolk, England, Diana decides to leave her marriage to Prince Charles.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/7GcqdBKaMM9BWXWN07BirBMkcBF.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/67qC43OXQESGJCYg7IJHN5F66X0.jpg",
    manualEmbed: "cos:movie/716612",
    trailerEmbed: "https://www.youtube.com/watch?v=WllZh9aekDg",
    isSeries: false
  },
  {
    id: "Operation Mincemeat",
    imdbId: "tt1879016",
    title: "Operation Mincemeat",
    releaseDate: "2022-04-01",
    rating: 6.5,
    synopsis: "In 1943, two British intelligence officers concoct Operation Mincemeat, wherein their plan to drop a corpse with false papers off the coast of Spain would fool Nazi spies into believing the Allied forces were planning to attack by way of Greece rather than Sicily.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/tfdfh1mK24VujxT5z11732asxdR.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/oZtoyj3rhOST8FUtIXUqblIYmCv.jpg",
    manualEmbed: "cos:movie/661231",
    trailerEmbed: "https://www.youtube.com/watch?v=zwkSyrN0mvY",
    isSeries: false
  },
  {
    id: "Crimes of the Future",
    imdbId: "tt14549466",
    title: "Crimes of the Future",
    releaseDate: "2022-05-25",
    rating: 6,
    synopsis: "With his partner Caprice, celebrity performance artist Saul Tenser publicly showcases the metamorphosis of his organs in avant-garde performances. An investigator from the National Organ Registry obsessively tracks their movements, which is when a mysterious group is revealed... Their mission — to use Tenser's notoriety to shed light on the next phase of human evolution.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/RAFYMC0NgK9In9aGY6k6wsIL8w.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/sqdsuvy8X6Maila4IAc7deMtPAA.jpg",
    manualEmbed: "cos:movie/819876",
    trailerEmbed: "https://www.youtube.com/watch?v=3NlKgKpKcgc",
    isSeries: false
  },
  {
    id: "Hubie Halloween",
    imdbId: "tt10682266",
    title: "Hubie Halloween",
    releaseDate: "2020-10-07",
    rating: 5.9,
    synopsis: "Hubie Dubois, despite his devotion to his hometown of Salem, Massachusetts (and its legendary Halloween celebration), is a figure of mockery for kids and adults alike. But this year, something really is going bump in the night, and it’s up to Hubie to save Halloween.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/dbhC6qRydXyRmpUdcl9bL9rARya.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/aOeshAxAhiDVIiHsXVFmF6bgclh.jpg",
    manualEmbed: "cos:movie/617505",
    trailerEmbed: "https://www.youtube.com/watch?v=kY3SuNvqQPw",
    isSeries: false
  },
  {
    id: "Senior Year",
    imdbId: "tt5315212",
    title: "Senior Year",
    releaseDate: "2022-05-11",
    rating: 5.9,
    synopsis: "A 37-year-old woman wakes up from a 22-year coma, and returns to the high school where she was once a popular cheerleader to finish her senior year and become prom queen.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6UqbcDQhCYpxboK58Z0eVfdeHcT.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/3FJ53wbpjSAGY98KYiHJ4DQccDr.jpg",
    manualEmbed: "cos:movie/800937",
    trailerEmbed: "https://www.youtube.com/watch?v=HCtDkpe89aY",
    isSeries: false
  },
  {
    id: "Mr. Harrigan's Phone",
    imdbId: "tt12908110",
    title: "Mr. Harrigan's Phone",
    releaseDate: "2022-09-28",
    rating: 6.4,
    synopsis: "Craig, a young boy living in a small town befriends an older, reclusive billionaire, Mr. Harrigan. The two form a bond over books and an iPhone, but when the man passes away the boy discovers that not everything dead is gone.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/gPn9e8eP7TeKQU4IeWAMzOajR40.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/jEdiZMbWkw8iWE8dBqLzyhwxAYd.jpg",
    manualEmbed: "cos:movie/723419",
    trailerEmbed: "https://www.youtube.com/watch?v=4Un_ker71dg",
    isSeries: false
  },
  {
    id: "Tetris",
    imdbId: "tt12758060",
    title: "Tetris",
    releaseDate: "2023-03-15",
    rating: 7.8,
    synopsis: "In 1988, American video game salesman Henk Rogers discovers the video game Tetris. When he sets out to bring the game to the world, he enters a dangerous web of lies and corruption behind the Iron Curtain.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/4F2QwCOYHJJjecSvdOjStuVLkpu.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/4avmIRBBOs9b4DKoenf8SWWJJP7.jpg",
    manualEmbed: "cos:movie/726759",
    trailerEmbed: "https://www.youtube.com/watch?v=-BLM1naCfME",
    isSeries: false
  },
  {
    id: "We Bare Bears: The Movie",
    imdbId: "tt10474606",
    title: "We Bare Bears: The Movie",
    releaseDate: "2020-06-30",
    rating: 7.8,
    synopsis: "When Grizz, Panda, and Ice Bear's love of food trucks and viral videos get out of hand, the brothers are now chased away from their home and embark on a trip to Canada, where they can live in peace.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/khtIr0Gxtz52T10RRQZ42o1a5Ry.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/pO1SnM5a1fEsYrFaVZW78Wb0zRJ.jpg",
    manualEmbed: "cos:movie/677638",
    trailerEmbed: "https://www.youtube.com/watch?v=0ZNsLy2IwcY",
    isSeries: false
  },
  {
    id: "Spirited",
    imdbId: "tt10999120",
    title: "Spirited",
    releaseDate: "2022-11-10",
    rating: 6.8,
    synopsis: "Each Christmas Eve, the Ghost of Christmas Present selects one dark soul to be reformed by a visit from three spirits. But this season, he picked the wrong Scrooge. Clint Briggs turns the tables on his ghostly host until Present finds himself reexamining his own past, present and future.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/h3zAzTMs5EP3cKusOxFNGSFE1WI.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/fHDvGGPFry65ou79WLi6JsjCZrM.jpg",
    manualEmbed: "cos:movie/632856",
    trailerEmbed: "https://www.youtube.com/watch?v=tnAJntI3NNs",
    isSeries: false
  },
  {
    id: "Minari",
    imdbId: "tt10633456",
    title: "Minari",
    releaseDate: "2021-02-12",
    rating: 7.3,
    synopsis: "A Korean American family moves to an Arkansas farm in search of its own American dream. Amidst the challenges of this new life in the strange and rugged Ozarks, they discover the undeniable resilience of family and what really makes a home.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6mPNdmjdbVKPITv3LLCmQoKs9Zw.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/bKCpRjjTKcr3KAITmwjVMobbBYg.jpg",
    manualEmbed: "cos:movie/615643",
    trailerEmbed: "https://www.youtube.com/watch?v=KQ0gFidlro8",
    isSeries: false
  },
  {
    id: "The Vault",
    imdbId: "tt9742794",
    title: "The Vault",
    releaseDate: "2021-03-04",
    rating: 6.8,
    synopsis: "Madrid, Spain, 2010. While the whole city follows the national team's successful participation in the World Cup, a group of daring thieves look for a way into one of the most secure and guarded places on the planet.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/kWhXubAiIcHW0xn5GThflqaKZqh.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/s1ohP4iE2Lg2TVBJILOkbTsGGgu.jpg",
    manualEmbed: "cos:movie/630004",
    trailerEmbed: "https://www.youtube.com/watch?v=rU2LmSVElDM",
    isSeries: false
  },
  {
    id: "The Woman in the Window",
    imdbId: "tt6111574",
    title: "The Woman in the Window",
    releaseDate: "2021-05-13",
    rating: 6,
    synopsis: "An agoraphobic woman living alone in New York begins spying on her new neighbors only to witness a disturbing act of violence.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/wcrjc1uwQaqoqtqi67Su4VCOYo0.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/gUttUEqsrvaMlK5oL5TSQ54iE96.jpg",
    manualEmbed: "cos:movie/520663",
    trailerEmbed: "https://www.youtube.com/watch?v=v_0GJg_Jnlo",
    isSeries: false
  },
  {
    id: "Cinderella",
    imdbId: "tt10155932",
    title: "Cinderella",
    releaseDate: "2021-09-03",
    rating: 6.3,
    synopsis: "Cinderella, an orphaned girl with an evil stepmother, has big dreams and with the help of her Fabulous Godmother, she perseveres to make them come true.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/clDFqATL4zcE7LzUwkrVj3zHvk7.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/7ZiMrbitgbyio4eOzFKRruPKu5G.jpg",
    manualEmbed: "cos:movie/593910",
    trailerEmbed: "https://www.youtube.com/watch?v=T1NeHRuPpoM",
    isSeries: false
  },
  {
    id: "The Wrong Missy",
    imdbId: "tt9619798",
    title: "The Wrong Missy",
    releaseDate: "2020-05-13",
    rating: 6.1,
    synopsis: "A guy meets the woman of his dreams and invites her to his company's corporate retreat, but realizes he sent the invite to the wrong person.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/A2YlIrzypvhS3vTFMcDkG3xLvac.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/1xQtvgay8rDwSaZPwyhcecqV8UD.jpg",
    manualEmbed: "cos:movie/582596",
    trailerEmbed: "https://www.youtube.com/watch?v=2Cwaneq2w-4",
    isSeries: false
  },
  {
    id: "The Wonder",
    imdbId: "tt9288822",
    title: "The Wonder",
    releaseDate: "2022-11-02",
    rating: 6.6,
    synopsis: "Haunted by her past, a nurse travels from England to a remote Irish village in 1862 to investigate a young girl's supposedly miraculous fast.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/wZvZgA7IkDX78UilzqBGh0QTQvC.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/hJN3ZaueIDWFO5FfxoXdiP6Y4oH.jpg",
    manualEmbed: "cos:movie/823766",
    trailerEmbed: "https://www.youtube.com/watch?v=htybz7XscIY",
    isSeries: false
  },
  {
    id: "The Turning",
    imdbId: "tt7510346",
    title: "The Turning",
    releaseDate: "2020-01-23",
    rating: 5.7,
    synopsis: "A young woman quits her teaching job to become a private tutor and governess for two wealthy young kids, but soon starts to suspect there’s more to their house than meets the eye.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/uiMHiHp9eAjJty8rddoUnL9G5fU.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/tYm0Yk9k9W0hb9Xy4coOXqoGfNT.jpg",
    manualEmbed: "cos:movie/492611",
    trailerEmbed: "https://www.youtube.com/watch?v=rl33gU2APIs",
    isSeries: false
  },
  {
    id: "Stillwater",
    imdbId: "tt10696896",
    title: "Stillwater",
    releaseDate: "2021-07-29",
    rating: 6.6,
    synopsis: "Bill Baker, an American oil-rig roughneck from Oklahoma, travels to Marseille to visit his estranged daughter, Allison, who is in prison for a murder she claims she did not commit. Confronted with language barriers, cultural differences, and a complicated legal system, Bill builds a new life for himself in France as he makes it his personal mission to exonerate his daughter.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/1lrPR7ah1KElPKnCsxmIRE1OlIh.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/70xJCPOvP16XnrtO9WSkCek12sv.jpg",
    manualEmbed: "cos:movie/616651",
    trailerEmbed: "https://www.youtube.com/watch?v=9cq1lPPeMUY",
    isSeries: false
  },
  {
    id: "Pig",
    imdbId: "tt11003218",
    title: "Pig",
    releaseDate: "2021-07-16",
    rating: 6.6,
    synopsis: "A truffle hunter who lives alone in the Oregon wilderness must visit Portland to find the mysterious person who stole his beloved foraging pig.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/1InMm4Mbjx8wCKvIy5gglo5i3HN.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/uFvueAhlKsXQacjiKxGBgnBqarf.jpg",
    manualEmbed: "cos:movie/635731",
    trailerEmbed: "https://www.youtube.com/watch?v=1i-_CRKdh4Y",
    isSeries: false
  },
  {
    id: "Hellraiser",
    imdbId: "tt0887261",
    title: "Hellraiser",
    releaseDate: "2022-09-28",
    rating: 6.2,
    synopsis: "A young woman struggling with addiction comes into possession of an ancient puzzle box, unaware that its purpose is to summon the Cenobites, a group of sadistic supernatural beings from another dimension.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/f9ZAIUxTTk23vo1BC9Ur1Rx5c2E.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/3r3tZgKTw1554hcFoUfydLHE38w.jpg",
    manualEmbed: "cos:movie/338947",
    trailerEmbed: "https://www.youtube.com/watch?v=oUlgwJNdu2I",
    isSeries: false
  },
  {
    id: "The Way Back",
    imdbId: "tt8544498",
    title: "The Way Back",
    releaseDate: "2020-03-05",
    rating: 6.6,
    synopsis: "A former basketball all-star, who has lost his wife and family foundation in a struggle with addiction, attempts to regain his soul and salvation by becoming the coach of a disparate ethnically mixed high school basketball team at his alma mater.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/ylPnfaphW3FrLBUVwAREVtiL9My.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/iTLGqoHkiSqUts9nPIdYLPtOz8C.jpg",
    manualEmbed: "cos:movie/529485",
    trailerEmbed: "https://www.youtube.com/watch?v=GhtTc7R8yBk",
    isSeries: false
  },
  {
    id: "The Dig",
    imdbId: "tt3661210",
    title: "The Dig",
    releaseDate: "2021-01-14",
    rating: 6.9,
    synopsis: "As WWII looms, a wealthy widow hires an amateur archaeologist to excavate the burial mounds on her estate. When they make a historic discovery, the echoes of Britain's past resonate in the face of its uncertain future‎.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/dFDNb9Gk1kyLRcconpj7Mc7C7IL.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/wQhe2YJnB9AAS08RqwMeKN2ywUr.jpg",
    manualEmbed: "cos:movie/532865",
    trailerEmbed: "https://www.youtube.com/watch?v=JZQz0rkNajo",
    isSeries: false
  },
  {
    id: "Watcher",
    imdbId: "tt12004038",
    title: "Watcher",
    releaseDate: "2022-06-03",
    rating: 6.5,
    synopsis: "As a serial killer stalks the city, Julia — a young actress who just moved to town with her husband — notices a mysterious stranger watching her from across the street.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/dXCjoI3jdtBrwPHgVsyNLkl8Rvs.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/2cQMVHBaP1wK0UBX5SGDahB3lp3.jpg",
    manualEmbed: "cos:movie/807356",
    trailerEmbed: "https://www.youtube.com/watch?v=KDc6ZLo8sjc",
    isSeries: false
  },
  {
    id: "Gabriel's Inferno: Part III",
    imdbId: "tt13535456",
    title: "Gabriel's Inferno: Part III",
    releaseDate: "2020-11-19",
    rating: 8.3,
    synopsis: "The final part of the film adaption of the erotic romance novel Gabriel's Inferno written by an anonymous Canadian author under the pen name Sylvain Reynard.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/fYtHxTxlhzD4QWfEbrC1rypysSD.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/cY9X3gHcu4zK9vAy3s77xyorm0d.jpg",
    manualEmbed: "cos:movie/761053",
    trailerEmbed: "https://www.youtube.com/watch?v=mjPUGem9SaY",
    isSeries: false
  },
  {
    id: "You People",
    imdbId: "tt14826022",
    title: "You People",
    releaseDate: "2023-01-20",
    rating: 5.6,
    synopsis: "A new couple and their families reckon with modern love amid culture clashes, societal expectations and generational differences.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/x5E4TndwASNkaK2hwgeYfsIVo2x.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/c9yVIqnrD6fyYhNzNcvAoU6CFG.jpg",
    manualEmbed: "cos:movie/866413",
    trailerEmbed: "https://www.youtube.com/watch?v=pCMHc-IFAB0",
    isSeries: false
  },
  {
    id: "They Cloned Tyrone",
    imdbId: "tt9873892",
    title: "They Cloned Tyrone",
    releaseDate: "2023-06-14",
    rating: 6.6,
    synopsis: "A series of eerie events thrusts an unlikely trio onto the trail of a nefarious government conspiracy lurking directly beneath their neighborhood.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/hnzXoDaK346U4ByfvQenu2DZnTg.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/9mXBHMSDLi0Ty0HXcnLtQnqNBmI.jpg",
    manualEmbed: "cos:movie/736769",
    trailerEmbed: "https://www.youtube.com/watch?v=2S3M1xFVdVg",
    isSeries: false
  },
  {
    id: "Pieces of a Woman",
    imdbId: "tt11161474",
    title: "Pieces of a Woman",
    releaseDate: "2020-12-30",
    rating: 7,
    synopsis: "When a young mother's home birth ends in unfathomable tragedy, she begins a year-long odyssey of mourning that fractures relationships with loved ones in this deeply personal story of a woman learning to live alongside her loss.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/OgUfLlhfBFx5BPK6LzBWFvBW1w.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/izNpxVcjKbF9BiYF4GVqxCOfewL.jpg",
    manualEmbed: "cos:movie/641662",
    trailerEmbed: "https://www.youtube.com/watch?v=1zLKbMAZNGI",
    isSeries: false
  },
  {
    id: "Slumberland",
    imdbId: "tt13320662",
    title: "Slumberland",
    releaseDate: "2022-11-18",
    rating: 7.3,
    synopsis: "A young girl discovers a secret map to the dreamworld of Slumberland, and with the help of an eccentric outlaw, she traverses dreams and flees nightmares, with the hope that she will be able to see her late father again.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/tfae1vtjzlE73DPJGlHq88sZKX3.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/6tAYyCxF0T5oUIH95zMBC3X3W5T.jpg",
    manualEmbed: "cos:movie/668461",
    trailerEmbed: "https://www.youtube.com/watch?v=D7WhLZj5-LY",
    isSeries: false
  },
  {
    id: "Kate",
    imdbId: "tt7737528",
    title: "Kate",
    releaseDate: "2021-09-10",
    rating: 6.6,
    synopsis: "A ruthless criminal operative has less than 24 hours to exact revenge on her enemies and in the process forms an unexpected bond with the daughter of one of her past victims.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/uJgdT1boTSP0dDIjdTgGleg71l4.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/byflnwPMumyvrCW9SfO5Miq3647.jpg",
    manualEmbed: "cos:movie/597891",
    trailerEmbed: "https://www.youtube.com/watch?v=MysGjRS9jFU",
    isSeries: false
  },
  {
    id: "Fresh",
    imdbId: "tt13403046",
    title: "Fresh",
    releaseDate: "2022-03-03",
    rating: 6.9,
    synopsis: "Frustrated by scrolling dating apps only to end up on lame, tedious dates, Noa takes a chance by giving her number to the awkwardly charming Steve after a produce-section meet-cute at the grocery store.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/tlu71AgaL3EQBBCNGsAwZLPbV5D.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/oVv5l6L5Wi5j3gd4P2vt0YvVMOg.jpg",
    manualEmbed: "cos:movie/787752",
    trailerEmbed: "https://www.youtube.com/watch?v=wKk5VAK1GZQ",
    isSeries: false
  },
  {
    id: "The Silencing",
    imdbId: "tt7149730",
    title: "The Silencing",
    releaseDate: "2020-07-18",
    rating: 6.5,
    synopsis: "A reformed hunter becomes involved in a deadly game of cat and mouse when he and the local sheriff set out to track a vicious killer who may have kidnapped his daughter years ago.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/dnN1ncxEOO1TY0gYL2FWxJqlhlL.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/kmbpYvhUsEdJFBqcDy7ESoXmknX.jpg",
    manualEmbed: "cos:movie/603119",
    trailerEmbed: "https://www.youtube.com/watch?v=xLXZl1JF85c",
    isSeries: false
  },
  {
    id: "Hillbilly Elegy",
    imdbId: "tt6772802",
    title: "Hillbilly Elegy",
    releaseDate: "2020-11-09",
    rating: 6.7,
    synopsis: "An urgent phone call pulls a Yale Law student back to his Ohio hometown, where he reflects on three generations of family history and his own future.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/aA0D6DKIfLtXYNy94Qq2IW5NiGR.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/kCqWQ24m7TjA0RllQMn0JYrcy4a.jpg",
    manualEmbed: "cos:movie/592984",
    trailerEmbed: "https://www.youtube.com/watch?v=KW_3aaoSOYg",
    isSeries: false
  },
  {
    id: "The Willoughbys",
    imdbId: "tt5206260",
    title: "The Willoughbys",
    releaseDate: "2020-04-22",
    rating: 7,
    synopsis: "When the four Willoughby children are abandoned by their selfish parents, they must learn how to adapt their Old-Fashioned values to the contemporary world in order to create something new: The Modern Family.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/9WrMmjdZvpxLQh1tCQ9tOd1asOb.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/3C7jcMtTpBmzzTbUWPKhMJyvDJO.jpg",
    manualEmbed: "cos:movie/560044",
    trailerEmbed: "https://www.youtube.com/watch?v=HnG4ag3Nkes",
    isSeries: false
  },
  {
    id: "Night Teeth",
    imdbId: "tt10763820",
    title: "Night Teeth",
    releaseDate: "2021-10-20",
    rating: 6.4,
    synopsis: "A college student moonlighting as a chauffeur picks up two mysterious women for a night of party-hopping across LA. But when he uncovers their bloodthirsty intentions—and their dangerous, shadowy underworld—he must fight to stay alive.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/1i8SJSdjAqd6PI5lPxhPaYKhUU3.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/xmqXQOGxFaUCZr9wXrD2WD2V3aT.jpg",
    manualEmbed: "cos:movie/669671",
    trailerEmbed: "https://www.youtube.com/watch?v=ZNu-G-rd4H4",
    isSeries: false
  },
  {
    id: "Host",
    imdbId: "tt12749596",
    title: "Host",
    releaseDate: "2020-09-10",
    rating: 6.6,
    synopsis: "Six friends hire a medium to hold a séance via Zoom during lockdown — but they get far more than they bargained for as things quickly go wrong. When an evil spirit starts invading their homes, they begin to realise they might not survive the night.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/h7dZpJDORYs5c56dydbrLFkEXpE.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/buop8brXQ8gGiOPrVTxZZUqE8Oa.jpg",
    manualEmbed: "cos:movie/723072",
    trailerEmbed: "https://www.youtube.com/watch?v=SNlKbqHqGcY",
    isSeries: false
  },
  {
    id: "Samaritan",
    imdbId: "tt5500218",
    title: "Samaritan",
    releaseDate: "2022-08-25",
    rating: 6.6,
    synopsis: "Thirteen year old Sam Cleary suspects that his mysteriously reclusive neighbor Mr. Smith is actually the legendary vigilante Samaritan, who was reported dead 25 years ago. With crime on the rise and the city on the brink of chaos, Sam makes it his mission to coax his neighbor out of hiding to save the city from ruin.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/zgH8Ej50n2cvJCMJrxd4twEwSqz.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/hYZ4a0JvPETdfgJJ9ZzyFufq8KQ.jpg",
    manualEmbed: "cos:movie/629176",
    trailerEmbed: "https://www.youtube.com/watch?v=9FKnTxSC16E",
    isSeries: false
  },
  {
    id: "Voyagers",
    imdbId: "tt9664108",
    title: "Voyagers",
    releaseDate: "2021-04-08",
    rating: 6,
    synopsis: "With the future of the human race at stake, a group of young men and women -- bred for intelligence and obedience -- embark on an expedition to colonize a distant planet. When they uncover disturbing secrets about the mission, they defy their training and begin to explore their most primitive natures. As life on the ship descends into chaos, they soon become consumed by fear, lust and an insatiable hunger for power.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/xvM8auqa0dckJefuKVGAWG9dFN.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/9dBSwftCzkC4K4zgMZTwcm58VUR.jpg",
    manualEmbed: "cos:movie/597890",
    trailerEmbed: "https://www.youtube.com/watch?v=EwJkexUBSeg",
    isSeries: false
  },
  {
    id: "Songbird",
    imdbId: "tt12592252",
    title: "Songbird",
    releaseDate: "2020-12-10",
    rating: 6.2,
    synopsis: "During a pandemic lockdown, Nico, a young man with rare immunity, must overcome martial law, murderous vigilantes and a powerful family to reunite with his love, Sara.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/pm7pstYup0ZHpImjT0k6YyxGVkX.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/aqm0i13UOmow0K30gB1hrNYpJca.jpg",
    manualEmbed: "cos:movie/721625",
    trailerEmbed: "https://www.youtube.com/watch?v=IgxXSfto6Vo",
    isSeries: false
  },
  {
    id: "Superman: Red Son",
    imdbId: "tt10985510",
    title: "Superman: Red Son",
    releaseDate: "2020-02-24",
    rating: 7.1,
    synopsis: "Set in the thick of the Cold War, Red Son introduces us to a Superman who landed in the USSR during the 1950s and grows up to become a Soviet symbol that fights for the preservation of Stalin’s brand of communism.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/frSfz7olCSQsp2SmTyu2ciGGQiX.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/uehwVV9xuALZ2SXeHGiX4Ay5dR7.jpg",
    manualEmbed: "cos:movie/618355",
    trailerEmbed: "https://www.youtube.com/watch?v=n0s0FJfyqGk",
    isSeries: false
  },
  {
    id: "YES DAY",
    imdbId: "tt8521876",
    title: "YES DAY",
    releaseDate: "2021-03-11",
    rating: 6.7,
    synopsis: "A mom and dad who usually say no decide to say yes to their kids' wildest requests — with a few ground rules — on a whirlwind day of fun and adventure.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/rejrD9ovTHJbfmpLM0mbEliEPV6.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/cJwkku3SPprS0Splfgh8VFRd0xn.jpg",
    manualEmbed: "cos:movie/638597",
    trailerEmbed: "https://www.youtube.com/watch?v=Y-3Vr8Ut8d0",
    isSeries: false
  },
  {
    id: "The Half of It",
    imdbId: "tt9683478",
    title: "The Half of It",
    releaseDate: "2020-05-01",
    rating: 7.1,
    synopsis: "Shy, straight-A student Ellie is hired by sweet but inarticulate jock Paul, who needs help wooing the most popular girl in school. But their new and unlikely friendship gets tricky when Ellie discovers she has feelings for the same girl.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/jC1PNXGET1ZZQyrJvdFhPfXdPP1.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/8YSpQBdGvuvSj9pLsY2yoUb9fZn.jpg",
    manualEmbed: "cos:movie/597219",
    trailerEmbed: "https://www.youtube.com/watch?v=B-yhF7IScUE",
    isSeries: false
  },
  {
    id: "The Card Counter",
    imdbId: "tt11196036",
    title: "The Card Counter",
    releaseDate: "2021-09-03",
    rating: 6.1,
    synopsis: "William Tell just wants to play cards. His spartan existence on the casino trail is shattered when he is approached by Cirk, a vulnerable and angry young man seeking help to execute his plan for revenge on a military colonel. Tell sees a chance at redemption through his relationship with Cirk.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/y5DNLVg0gPiGSkuK4yFc4fjQ42Q.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/mE0sGZ4CyzibmBG7FYan5CIKuag.jpg",
    manualEmbed: "cos:movie/643532",
    trailerEmbed: "https://www.youtube.com/watch?v=7RvVT1cDiNc",
    isSeries: false
  },
  {
    id: "All the Bright Places",
    imdbId: "tt3907584",
    title: "All the Bright Places",
    releaseDate: "2020-02-28",
    rating: 7.6,
    synopsis: "Two teens facing personal struggles form a powerful bond as they embark on a cathartic journey chronicling the wonders of Indiana.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/4SafxuMKQiw4reBiWKVZJpJn80I.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/tcrNJfyNEIqaBR8Ogkgnq5xQJnf.jpg",
    manualEmbed: "cos:movie/342470",
    trailerEmbed: "https://www.youtube.com/watch?v=zfQXKVCudec",
    isSeries: false
  },
  {
    id: "Cry Macho",
    imdbId: "tt1924245",
    title: "Cry Macho",
    releaseDate: "2021-09-16",
    rating: 5.9,
    synopsis: "A one-time rodeo star and washed-up horse breeder takes a job from an ex-boss to bring the man's young son home from Mexico.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/esrzqq7Ud8yoslFTu3J5HqTJVOQ.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/g6wufgtycJCP508tlC3crSYFCgC.jpg",
    manualEmbed: "cos:movie/749274",
    trailerEmbed: "https://www.youtube.com/watch?v=JVc8SI5CAKw",
    isSeries: false
  },
  {
    id: "Shadow in the Cloud",
    imdbId: "tt9691136",
    title: "Shadow in the Cloud",
    releaseDate: "2021-01-01",
    rating: 5.8,
    synopsis: "A WWII pilot traveling with top secret documents on a B-17 Flying Fortress encounters an evil presence on board the flight.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/t7EUMSlfUN3jUSZUJOLURAzJzZs.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/aHYUj0hICtWZ5tPiCIm6pWUcjYK.jpg",
    manualEmbed: "cos:movie/675327",
    trailerEmbed: "https://www.youtube.com/watch?v=hCToNAb7QGU",
    isSeries: false
  },
  {
    id: "Holidate",
    imdbId: "tt9866072",
    title: "Holidate",
    releaseDate: "2020-10-27",
    rating: 7,
    synopsis: "Fed up with being single on holidays, two strangers agree to be each other's platonic plus-ones all year long, only to catch real feelings along the way.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/oXCLSlCRWWHsSSwLJSVIC0DDWsE.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/8veOfB9RbSzFki0Rq3IQIGsFfhC.jpg",
    manualEmbed: "cos:movie/615665",
    trailerEmbed: "https://www.youtube.com/watch?v=hxaaAoI57fk",
    isSeries: false
  },
  {
    id: "Alone",
    imdbId: "tt7711170",
    title: "Alone",
    releaseDate: "2020-09-10",
    rating: 6.4,
    synopsis: "A recently widowed traveler is kidnapped by a cold blooded killer, only to escape into the wilderness where she is forced to battle against the elements as her pursuer closes in on her.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/n9OzZmPMnVrV0cMQ7amX0DtBkQH.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/iJiyR6hhMpgsx8nPppHjnbugh9f.jpg",
    manualEmbed: "cos:movie/509635",
    trailerEmbed: "https://www.youtube.com/watch?v=NoP2mJiCzWQ",
    isSeries: false
  },
  {
    id: "A Boy Called Christmas",
    imdbId: "tt10187208",
    title: "A Boy Called Christmas",
    releaseDate: "2021-11-24",
    rating: 7.3,
    synopsis: "An ordinary young boy called Nikolas sets out on an extraordinary adventure into the snowy north in search of his father who is on a quest to discover the fabled village of the elves, Elfhelm. Taking with him a headstrong reindeer called Blitzen and a loyal pet mouse, Nikolas soon meets his destiny in this magical and endearing story that proves nothing is impossible…",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/1sRejtiHOZGggZd9RcmdqbapLM5.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/odKqOY6VE6C59YAdGHB0b5Havye.jpg",
    manualEmbed: "cos:movie/615666",
    trailerEmbed: "https://www.youtube.com/watch?v=aFI_aiidke0",
    isSeries: false
  },
  {
    id: "Escape from Pretoria",
    imdbId: "tt5797184",
    title: "Escape from Pretoria",
    releaseDate: "2020-03-06",
    rating: 7.2,
    synopsis: "South Africa, 1978. Tim Jenkin and Stephen Lee, two white political activists from the African National Congress imprisoned by the apartheid regime, put a plan in motion to escape from the infamous Pretoria Prison.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/8GGS0jkFFCnmdStvZED6NL6V7gd.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/vwbmp3vvX4U0VjinaQktYOBt5kW.jpg",
    manualEmbed: "cos:movie/502425",
    trailerEmbed: "https://www.youtube.com/watch?v=fKwsz6ua5EM",
    isSeries: false
  },
  {
    id: "A Fall from Grace",
    imdbId: "tt11390036",
    title: "A Fall from Grace",
    releaseDate: "2020-01-17",
    rating: 7,
    synopsis: "When a law-abiding woman gets indicted for murdering her husband, her lawyer soon realizes that a larger conspiracy may be at work.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/uQqmFcKOSg7RVtaIKOTtv1vWQPx.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/qeoAcUAw1xNYJ9PP7m1Wc7kKZZQ.jpg",
    manualEmbed: "cos:movie/651070",
    trailerEmbed: "https://www.youtube.com/watch?v=eVXwBwQdBrg",
    isSeries: false
  },
  {
    id: "Thunder Force",
    imdbId: "tt10121392",
    title: "Thunder Force",
    releaseDate: "2021-04-09",
    rating: 5.5,
    synopsis: "In a world where supervillains are commonplace, two estranged childhood best friends reunite after one devises a treatment that gives them powers to protect their city.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/3mKMWP5OokB7QpcOMA1yl8BXFAF.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/z7HLq35df6ZpRxdMAE0qE3Ge4SJ.jpg",
    manualEmbed: "cos:movie/615678",
    trailerEmbed: "https://www.youtube.com/watch?v=qnx6-YLXFwg",
    isSeries: false
  },
  {
    id: "Spiderhead",
    imdbId: "tt9783600",
    title: "Spiderhead",
    releaseDate: "2022-06-15",
    rating: 5.8,
    synopsis: "A prisoner in a state-of-the-art penitentiary begins to question the purpose of the emotion-controlling drugs he's testing for a pharmaceutical genius.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/7COPO5B9AOKIB4sEkvNu0wfve3c.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/ulkWS7Atv0vv33KVCSAmNizAmJd.jpg",
    manualEmbed: "cos:movie/615469",
    trailerEmbed: "https://www.youtube.com/watch?v=BfsNfFoA0J0",
    isSeries: false
  },
  {
    id: "Saint Maud",
    imdbId: "tt7557108",
    title: "Saint Maud",
    releaseDate: "2020-10-09",
    rating: 6.5,
    synopsis: "Having recently found God, self-effacing young nurse Maud arrives at a plush home to care for Amanda, a hedonistic dancer left frail from a chronic illness. When a chance encounter with a former colleague throws up hints of a dark past, it becomes clear there is more to sweet Maud than meets the eye.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/ArNYeeDFLVye7JpqLElYdbE6fOa.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/1WKxsnrhLoKPHcTyph7lhZnAMjR.jpg",
    manualEmbed: "cos:movie/575776",
    trailerEmbed: "https://www.youtube.com/watch?v=JZKjVoHtlYw",
    isSeries: false
  },
  {
    id: "The In Between",
    imdbId: "tt8851148",
    title: "The In Between",
    releaseDate: "2022-02-11",
    rating: 7.3,
    synopsis: "After surviving a car accident that took the life of her boyfriend, a teenage girl believes he's attempting to reconnect with her from the after world.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/7RcyjraM1cB1Uxy2W9ZWrab4KCw.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/334KZ2yt18AjPN9VmJw68sEkc7U.jpg",
    manualEmbed: "cos:movie/818750",
    trailerEmbed: "https://www.youtube.com/watch?v=26z3pzzQYYA",
    isSeries: false
  },
  {
    id: "The Map of Tiny Perfect Things",
    imdbId: "tt11080108",
    title: "The Map of Tiny Perfect Things",
    releaseDate: "2021-02-12",
    rating: 7.1,
    synopsis: "Two teenagers trapped in an endless time loop set out to find all the tiny things that make that one day perfect.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6y3ev0rJFbHA1hU22UPmmfzBjrG.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/gg9zZB9xLPWmuxOpKw0HX0QLMN6.jpg",
    manualEmbed: "cos:movie/672647",
    trailerEmbed: "https://www.youtube.com/watch?v=ZOxsfKQWrUg",
    isSeries: false
  },
  {
    id: "Choose or Die",
    imdbId: "tt11514780",
    title: "Choose or Die",
    releaseDate: "2022-04-15",
    rating: 5.2,
    synopsis: "In pursuit of an unclaimed $125,000 prize, a broke college dropout decides to play an obscure, 1980s survival computer game. But the game curses her, and she’s faced with dangerous choices and reality-warping challenges. After a series of unexpectedly terrifying moments, she realizes she’s no longer playing for the money but for her life.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/jEYE5BPFd5FuPa1judcjpW6xqKp.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/isxWigGBWpXtc2xOxybiYWxHzWm.jpg",
    manualEmbed: "cos:movie/838484",
    trailerEmbed: "https://www.youtube.com/watch?v=7vUQYzZ_UZc",
    isSeries: false
  },
  {
    id: "Antebellum",
    imdbId: "tt10065694",
    title: "Antebellum",
    releaseDate: "2020-09-02",
    rating: 6.3,
    synopsis: "Successful author Veronica finds herself trapped in a horrifying reality and must uncover the mind-bending mystery before it's too late.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/irkse1FMm9dWemwlxKJ7RINT9Iy.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/vSZOMuSfXScuxExCtxZsDIFDQCI.jpg",
    manualEmbed: "cos:movie/627290",
    trailerEmbed: "https://www.youtube.com/watch?v=7MPib67BDHY",
    isSeries: false
  },
  {
    id: "Me Time",
    imdbId: "tt14309446",
    title: "Me Time",
    releaseDate: "2022-08-26",
    rating: 5.8,
    synopsis: "With his family away, a devoted stay-at-home dad enjoys his first me time in years by joining his hard-partying old friend on a wild birthday adventure.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/bkjPoisqAavXUvtoirxTEcLLQyI.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/5FFpcmPzD5mhLom7bymZq7Py8eT.jpg",
    manualEmbed: "cos:movie/862551",
    trailerEmbed: "https://www.youtube.com/watch?v=Mmq_NVwLN_g",
    isSeries: false
  },
  {
    id: "The Princess Switch: Switched Again",
    imdbId: "tt11199410",
    title: "The Princess Switch: Switched Again",
    releaseDate: "2020-11-19",
    rating: 6.8,
    synopsis: "When Duchess Margaret unexpectedly inherits the throne & hits a rough patch with Kevin, it’s up to Stacy to save the day before a new lookalike — party girl Fiona — foils their plans.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/4vOmeimnVCdojwvc4icyeYUCydJ.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/zCHe8ckyufHVUZaoHu2DiF8evET.jpg",
    manualEmbed: "cos:movie/643882",
    trailerEmbed: "https://www.youtube.com/watch?v=f9OVdmIxkso",
    isSeries: false
  },
  {
    id: "Radioactive",
    imdbId: "tt6017756",
    title: "Radioactive",
    releaseDate: "2020-03-11",
    rating: 6.6,
    synopsis: "The story of Nobel Prize winner Maria Skłodowska-Curie and her extraordinary scientific discoveries—through the prism of her marriage to husband Pierre—and the seismic and transformative effects their discovery of radium had on the 20th century.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/akHIQu8W3rOgT28r25ggXaKcQIr.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/iFFC0ILEzcCGI8fJzixI9lI5n8o.jpg",
    manualEmbed: "cos:movie/480857",
    trailerEmbed: "https://www.youtube.com/watch?v=mU0oOUTo5zo",
    isSeries: false
  },
  {
    id: "Fatherhood",
    imdbId: "tt4733624",
    title: "Fatherhood",
    releaseDate: "2021-06-18",
    rating: 7.5,
    synopsis: "A widowed new dad copes with doubts, fears, heartache and dirty diapers as he sets out to raise his daughter on his own. Inspired by a true story.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/wvqO1gTAMZIFGi3Ioq1BN6KV95R.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/miOnymJ0dN2psWBB8Vleo3fUyrc.jpg",
    manualEmbed: "cos:movie/607259",
    trailerEmbed: "https://www.youtube.com/watch?v=T3mwUEoZdrI",
    isSeries: false
  },
  {
    id: "Devotion",
    imdbId: "tt7693316",
    title: "Devotion",
    releaseDate: "2022-11-23",
    rating: 7.1,
    synopsis: "The harrowing true story of two elite US Navy fighter pilots during the Korean War. Their heroic sacrifices would ultimately make them the Navy's most celebrated wingmen.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/26yQPXymbWeCLKwcmyL8dRjAzth.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/tY36rkGlREg5m9CaguckR8jZCye.jpg",
    manualEmbed: "cos:movie/653851",
    trailerEmbed: "https://www.youtube.com/watch?v=nIvBBd8pU1s",
    isSeries: false
  },
  {
    id: "Friends: The Reunion",
    imdbId: "tt11337862",
    title: "Friends: The Reunion",
    releaseDate: "2021-05-27",
    rating: 7.8,
    synopsis: "The cast of Friends reunites for a once-in-a-lifetime celebration of the hit series, an unforgettable evening filled with iconic memories, uncontrollable laughter, happy tears, and special guests.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/bT3c4TSOP8vBmMoXZRDPTII6eDa.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/qPlAgjG4xy7utjf5L14FZ8kaiWl.jpg",
    manualEmbed: "cos:movie/691179",
    trailerEmbed: "https://www.youtube.com/watch?v=RasWhgd4vao",
    isSeries: false
  },
  {
    id: "Da 5 Bloods",
    imdbId: "tt9777644",
    title: "Da 5 Bloods",
    releaseDate: "2020-06-12",
    rating: 6.4,
    synopsis: "Four African-American Vietnam veterans return to Vietnam. They are in search of the remains of their fallen squad leader and the promise of buried treasure. These heroes battle forces of humanity and nature while confronted by the lasting ravages of the immorality of the Vietnam War.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/yx4cp1ljJMDSFeEex0Zjv45b55E.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/Aq5Zhj9iaTF6BEKNk05dlUxeHKa.jpg",
    manualEmbed: "cos:movie/581859",
    trailerEmbed: "https://www.youtube.com/watch?v=D5RDTPfsLAI",
    isSeries: false
  },
  {
    id: "The House",
    imdbId: "tt11703050",
    title: "The House",
    releaseDate: "2022-01-14",
    rating: 7,
    synopsis: "Across different eras, a poor family, an anxious developer and a fed-up landlady become tied to the same mysterious house in this animated dark comedy.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/xhE1EYcD6U7m5R8AT7yf29CCxia.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/hk4PwhKhT7q7jp1lvA8aiYqDluy.jpg",
    manualEmbed: "cos:movie/926899",
    trailerEmbed: "https://www.youtube.com/watch?v=wqbZlAEUb5w",
    isSeries: false
  },
  {
    id: "Copshop",
    imdbId: "tt5748448",
    title: "Copshop",
    releaseDate: "2021-09-09",
    rating: 6.3,
    synopsis: "On the run from a lethal assassin, a wily con artist devises a scheme to hide out inside a small-town police station. However, when the hit man turns up at the precinct, an unsuspecting rookie cop finds herself caught in the crosshairs.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/9LEWWWEhS7SZXFDuH1YYhs0VFct.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/jIkH6cy0Haa1cyitn6gtKmE3lxu.jpg",
    manualEmbed: "cos:movie/738652",
    trailerEmbed: "https://www.youtube.com/watch?v=uFlyLJbzCt4",
    isSeries: false
  },
  {
    id: "The Deep House",
    imdbId: "tt11686490",
    title: "The Deep House",
    releaseDate: "2021-06-30",
    rating: 6,
    synopsis: "While diving in a remote French lake, a couple of YouTubers who specialise in underwater exploration videos discover a house submerged in the deep waters. What was initially a unique finding soon turns into a nightmare when they discover that the house was the scene of atrocious crimes. Trapped, with their oxygen reserves falling dangerously, they realise the worst is yet to come: they are not alone in the house.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/5xhAPxRr64oQPEFnUOrttuI4ZEU.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/hzPcEqyxZauvKZmUT2aJxntWPVf.jpg",
    manualEmbed: "cos:movie/672582",
    trailerEmbed: "https://www.youtube.com/watch?v=hgqjv1endGY",
    isSeries: false
  },
  {
    id: "The Exorcism of God",
    imdbId: "tt10362566",
    title: "The Exorcism of God",
    releaseDate: "2022-03-11",
    rating: 7.1,
    synopsis: "An American priest working in Mexico is considered a saint by many local parishioners. However, due to a botched exorcism, he carries a secret that’s eating him alive until he gets an opportunity to face his demon one final time.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/hangTmbxpSV4gpHG7MgSlCWSSFa.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/mjIuTXM4FhLAT1apxHULetAZAfj.jpg",
    manualEmbed: "cos:movie/836225",
    trailerEmbed: "https://www.youtube.com/watch?v=VdLI8I4jZD0",
    isSeries: false
  },
  {
    id: "I Came By",
    imdbId: "tt15083184",
    title: "I Came By",
    releaseDate: "2022-08-19",
    rating: 6.3,
    synopsis: "A rebellious young graffiti artist, who targets the homes of the wealthy elite, discovers a shocking secret that leads him on a journey endangering himself and those closest to him.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/pFB9jZDl52jBNbMPVSlISXD1ggS.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/14wIOjYCtfbO9EHTqCbiU9wncMz.jpg",
    manualEmbed: "cos:movie/852448",
    trailerEmbed: "https://www.youtube.com/watch?v=bwHGegiFykU",
    isSeries: false
  },
  {
    id: "Over the Moon",
    imdbId: "tt7488208",
    title: "Over the Moon",
    releaseDate: "2020-10-16",
    rating: 7.2,
    synopsis: "Fueled by memories of her mother, resourceful Fei Fei builds a rocket to the moon on a mission to prove the existence of a legendary moon goddess.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/lG0TF0wj1n9p9CPy5xlIUIkF56a.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/htBUhLSS7FfHtydgYxUWjL3J1Q1.jpg",
    manualEmbed: "cos:movie/560050",
    trailerEmbed: "https://www.youtube.com/watch?v=P_zuK_pergw",
    isSeries: false
  },
  {
    id: "Interceptor",
    imdbId: "tt14174940",
    title: "Interceptor",
    releaseDate: "2022-05-26",
    rating: 6,
    synopsis: "A U.S. Army Captain uses her years of tactical training to save humanity from sixteen nuclear missiles launched at the U.S. as a violent attack threatens her remote missile interceptor station.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/jBKNAfANo4e3rzJtb7aHfYNd7b3.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/i2tcQ9nDJpdJELPA82eCd7Irasd.jpg",
    manualEmbed: "cos:movie/831946",
    trailerEmbed: "https://www.youtube.com/watch?v=OQSoII4Bj1o",
    isSeries: false
  },
  {
    id: "Luckiest Girl Alive",
    imdbId: "tt4595186",
    title: "Luckiest Girl Alive",
    releaseDate: "2022-09-30",
    rating: 6.5,
    synopsis: "A successful woman in New York City finds her life upended when she is forced to confront a dark truth that threatens to unravel her meticulously crafted life.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/e0vrbTmTf2ZcW5CIS9qJ8FDbsU9.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/iHc14vucwUMl6WuvQa4iPfoEdy9.jpg",
    manualEmbed: "cos:movie/799546",
    trailerEmbed: "https://www.youtube.com/watch?v=B_XUlbPW-eY",
    isSeries: false
  },
  {
    id: "Belfast",
    imdbId: "tt12789558",
    title: "Belfast",
    releaseDate: "2021-11-12",
    rating: 7,
    synopsis: "Buddy is a young boy on the cusp of adolescence, whose life is filled with familial love, childhood hijinks, and a blossoming romance. Yet, with his beloved hometown caught up in increasing turmoil, his family faces a momentous choice: hope the conflict will pass or leave everything they know behind for a new life.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/3mInLZyPOVLsZRsBwNHi3UJXXnm.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/l1Z9PLy8AXiqlZmFEgiGWeSFdSX.jpg",
    manualEmbed: "cos:movie/777270",
    trailerEmbed: "https://www.youtube.com/watch?v=C658p987SQI",
    isSeries: false
  },
  {
    id: "The Tinder Swindler",
    imdbId: "tt14992922",
    title: "The Tinder Swindler",
    releaseDate: "2022-02-02",
    rating: 7,
    synopsis: "Posing as a wealthy, jet-setting diamond mogul, an Israeli conman wooed women online then conned them out of millions of dollars. Now, some victims plan for payback.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/iLUSFjdavIf0SrP7ldoQ1xomQVC.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/iiq2cWUYblgfvaVn0h3xZMZK65j.jpg",
    manualEmbed: "cos:movie/923632",
    trailerEmbed: "https://www.youtube.com/watch?v=2-Sp692UNqo",
    isSeries: false
  },
  {
    id: "The Dry",
    imdbId: "tt5144174",
    title: "The Dry",
    releaseDate: "2021-01-01",
    rating: 6.8,
    synopsis: "Aaron Falk returns to his drought-stricken hometown to attend a tragic funeral. But his return opens a decades-old wound - the unsolved death of a teenage girl.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/zM12bfL2TEqVRXjiQIFUWUMLcCg.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/sGIfwDYvfU0h1G7pGWEhdEi9hT2.jpg",
    manualEmbed: "cos:movie/567797",
    trailerEmbed: "https://www.youtube.com/watch?v=WS091OoMtuk",
    isSeries: false
  },
  {
    id: "Maestro",
    imdbId: "tt5535276",
    title: "Maestro",
    releaseDate: "2023-11-22",
    rating: 6.2,
    synopsis: "A towering and fearless love story chronicling the lifelong relationship between Leonard Bernstein and Felicia Montealegre Cohn Bernstein. A love letter to life and art, Maestro at its core is an emotionally epic portrayal of family and love.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/kxj7rMco6RNYsVcNwuGAIlfWu64.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/et0G74BxoBgNQEZBkUcVhsgeRFF.jpg",
    manualEmbed: "cos:movie/523607",
    trailerEmbed: "https://www.youtube.com/watch?v=xvmBVJhs4TA",
    isSeries: false
  },
  {
    id: "Malcolm & Marie",
    imdbId: "tt12676326",
    title: "Malcolm & Marie",
    releaseDate: "2021-01-29",
    rating: 7,
    synopsis: "As a filmmaker and his girlfriend return home from his movie premiere, smoldering tensions and painful revelations push them toward a romantic reckoning.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/bdidDnAZwchN5vTenoNuhGPJTri.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/xLsM5yTg9he5PWXXbrwzw1Wg8xp.jpg",
    manualEmbed: "cos:movie/722913",
    trailerEmbed: "https://www.youtube.com/watch?v=CGZmwsK58M8",
    isSeries: false
  },
  {
    id: "Mank",
    imdbId: "tt10618286",
    title: "Mank",
    releaseDate: "2020-11-13",
    rating: 6.7,
    synopsis: "1930s Hollywood is reevaluated through the eyes of scathing social critic and alcoholic screenwriter Herman J. Mankiewicz as he races to finish the screenplay of Citizen Kane.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/4yzTcAtvzyZLLto4z04xobUK9el.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/hBOH4PNnhcGPgZbZjBwkx9gnNxI.jpg",
    manualEmbed: "cos:movie/614560",
    trailerEmbed: "https://www.youtube.com/watch?v=aSfX-nrg-lI",
    isSeries: false
  },
  {
    id: "Uglies",
    imdbId: "tt13186604",
    title: "Uglies",
    releaseDate: "2024-09-12",
    rating: 5.7,
    synopsis: "In a futuristic dystopia with enforced beauty standards, a teen awaiting mandatory cosmetic surgery embarks on a journey to find her missing friend.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/jaUu9zHtbcFwrB5Y1DNYE09HMex.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/y4NzXdvpJdwRmsnOT7HdkmHh6Yn.jpg",
    manualEmbed: "cos:movie/748167",
    trailerEmbed: "https://www.youtube.com/watch?v=OhcOHkgTrQQ",
    isSeries: false
  },
  {
    id: "Eurovision Song Contest: The Story of Fire Saga",
    imdbId: "tt8580274",
    title: "Eurovision Song Contest: The Story of Fire Saga",
    releaseDate: "2020-06-26",
    rating: 6.4,
    synopsis: "Two small-town singers chase their pop star dreams at a global music competition, where high stakes, scheming rivals and onstage mishaps test their bond.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/9zrbgYyFvwH8sy5mv9eT25xsAzL.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/jMO1icztaUUEUApdAQx0cZOt7b8.jpg",
    manualEmbed: "cos:movie/531454",
    trailerEmbed: "https://www.youtube.com/watch?v=7q6Co-nd0lM",
    isSeries: false
  },
  {
    id: "Mother/Android",
    imdbId: "tt13029044",
    title: "Mother/Android",
    releaseDate: "2021-12-17",
    rating: 5.8,
    synopsis: "Georgia and her boyfriend Sam go on a treacherous journey to escape their country, which is caught in an unexpected war with artificial intelligence. Days away from the arrival of their first child, the couple must face No Man’s Land—a stronghold of the android uprising—in hopes of reaching safety before giving birth.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/rO3nV9d1wzHEWsC7xgwxotjZQpM.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/bty8QfyiEc5hCyZbSmfsvc9ITJc.jpg",
    manualEmbed: "cos:movie/739413",
    trailerEmbed: "https://www.youtube.com/watch?v=JRl214mDZ-g",
    isSeries: false
  },
  {
    id: "Swallow",
    imdbId: "tt8372298",
    title: "Swallow",
    releaseDate: "2020-01-15",
    rating: 6.6,
    synopsis: "Hunter, a newly pregnant housewife, finds herself increasingly compelled to consume dangerous objects. As her husband and his family tighten their control over her life, she must confront the dark secret behind her new obsession.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/40Zrwud1EVxNvcjQkotZo7jmr4L.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/cJNsnbaQnR3Be86gXbwm1oFmH5V.jpg",
    manualEmbed: "cos:movie/586461",
    trailerEmbed: "https://www.youtube.com/watch?v=auVZKcxV7XQ",
    isSeries: false
  },
  {
    id: "Fatman",
    imdbId: "tt10310140",
    title: "Fatman",
    releaseDate: "2020-10-19",
    rating: 5.6,
    synopsis: "A rowdy, unorthodox Santa Claus is fighting to save his declining business. Meanwhile, Billy, a neglected and precocious 12 year old, hires a hit man to kill Santa after receiving a lump of coal in his stocking.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/4n8QNNdk4BOX9Dslfbz5Dy6j1HK.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/ckfwfLkl0CkafTasoRw5FILhZAS.jpg",
    manualEmbed: "cos:movie/602211",
    trailerEmbed: "https://www.youtube.com/watch?v=DWfPGIMDhNw",
    isSeries: false
  },
  {
    id: "Possessor",
    imdbId: "tt5918982",
    title: "Possessor",
    releaseDate: "2020-10-02",
    rating: 6.4,
    synopsis: "Tasya Vos, an elite corporate assassin, uses brain-implant technology to take control of other people’s bodies to terminate high profile targets. As she sinks deeper into her latest assignment, Vos becomes trapped inside a mind that threatens to obliterate her.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/xC9GZeJZ3NagdkGg9nLQx0aPG6J.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/owTL741kAuvJDKYnXKJCgTRGRud.jpg",
    manualEmbed: "cos:movie/435615",
    trailerEmbed: "https://www.youtube.com/watch?v=ahn56QWkD0Y",
    isSeries: false
  },
  {
    id: "Kimi",
    imdbId: "tt14128670",
    title: "Kimi",
    releaseDate: "2022-02-10",
    rating: 6.2,
    synopsis: "A tech worker with agoraphobia discovers recorded evidence of a violent crime but is met with resistance when she tries to report it. Seeking justice, she must do the thing she fears the most: leave her apartment.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/okNgwtxIWzGsNlR3GsOS0i0Qgbn.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/mruT954ve6P1zquaRs6XG0hA5k9.jpg",
    manualEmbed: "cos:movie/800510",
    trailerEmbed: "https://www.youtube.com/watch?v=67S8ru4K4x4",
    isSeries: false
  },
  {
    id: "Injustice",
    imdbId: "tt5012504",
    title: "Injustice",
    releaseDate: "2021-10-09",
    rating: 7.3,
    synopsis: "When Lois Lane is killed, an unhinged Superman decides to take control of the Earth. Determined to stop him, Batman creates a team of freedom-fighting heroes. But when superheroes go to war, can the world survive?",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/rzrSeqqpm1BwJ3tcTznztBtLLSD.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/4gWUlxECoziJ9TrGNfymNYxZf6Z.jpg",
    manualEmbed: "cos:movie/831405",
    trailerEmbed: "https://www.youtube.com/watch?v=EofvPQAyYp8",
    isSeries: false
  },
  {
    id: "Lou",
    imdbId: "tt5315210",
    title: "Lou",
    releaseDate: "2022-09-23",
    rating: 6.5,
    synopsis: "A young girl is kidnapped during a powerful storm. Her mother joins forces with her mysterious neighbour to set off in pursuit of the kidnapper. Their journey will test their limits and expose the dark secrets of their past.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/djM2s4wSaATn4jVB33cV05PEbV7.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/rgZ3hdzgMgYgzvBfwNEVW01bpK1.jpg",
    manualEmbed: "cos:movie/429473",
    trailerEmbed: "https://www.youtube.com/watch?v=QILhvR4QPsQ",
    isSeries: false
  },
  {
    id: "Ma Rainey's Black Bottom",
    imdbId: "tt10514222",
    title: "Ma Rainey's Black Bottom",
    releaseDate: "2020-11-25",
    rating: 6.6,
    synopsis: "Tensions rise when the trailblazing Mother of the Blues and her band gather at a Chicago recording studio in 1927. Adapted from August Wilson's play.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/pvtyxijaBrCSbByXLcUIDDSvc40.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/4mK222kB3vyrNjYl8eHliYacvJS.jpg",
    manualEmbed: "cos:movie/615667",
    trailerEmbed: "https://www.youtube.com/watch?v=ord7gP151vk",
    isSeries: false
  },
  {
    id: "The Last Days of American Crime",
    imdbId: "tt1552211",
    title: "The Last Days of American Crime",
    releaseDate: "2020-06-05",
    rating: 6.4,
    synopsis: "In the not-too-distant future, as a final response to crime and terrorism, the U.S. government plans to broadcast a signal that will make it impossible for anyone to knowingly break the law.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/ygCQnDEqUEIamBpdQdDYnFfxvgM.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/t93doi7EzoqLFckidrGGnukFPwd.jpg",
    manualEmbed: "cos:movie/339095",
    trailerEmbed: "https://www.youtube.com/watch?v=gdWxGwiuhnU",
    isSeries: false
  },
  {
    id: "Feel the Beat",
    imdbId: "tt10714856",
    title: "Feel the Beat",
    releaseDate: "2020-06-19",
    rating: 7.5,
    synopsis: "After failing to make it on Broadway, April returns to her hometown and reluctantly begins training a misfit group of young dancers for a competition.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/Af2jt7m9GLFpR4V11xOsFmT8OKD.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/fZBQOScjDT8TAipEyCkLVeDTu5c.jpg",
    manualEmbed: "cos:movie/707886",
    trailerEmbed: "https://www.youtube.com/watch?v=PhLSDnxLp-M",
    isSeries: false
  },
  {
    id: "Love Hard",
    imdbId: "tt10752004",
    title: "Love Hard",
    releaseDate: "2021-11-05",
    rating: 6.9,
    synopsis: "An LA girl, unlucky in love, falls for an East Coast guy on a dating app and decides to surprise him for Christmas, only to discover that she's been catfished. But the object of her affection actually lives in the same town, and the guy who duped her offers to set them up if she pretends to be his own girlfriend for the holidays.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/issJnV3iSZCMxUHXJPnqC56d7PE.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/pa0Mq5rGm2QnzdpFmugTu4Mghf.jpg",
    manualEmbed: "cos:movie/734265",
    trailerEmbed: "https://www.youtube.com/watch?v=3boMRfx6cjE",
    isSeries: false
  },
  {
    id: "Death to 2020",
    imdbId: "tt13567480",
    title: "Death to 2020",
    releaseDate: "2020-12-27",
    rating: 6.5,
    synopsis: "2020: A year so [insert adjective of choice here], even the creators of Black Mirror couldn't make it up… but that doesn't mean they don't have a little something to add. This comedy event that tells the story of the dreadful year that was — and perhaps still is? The documentary-style special weaves together some of the world's most (fictitious) renowned voices with real-life archival footage.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/w9FPFsPkeiBDn6WwDHFgniWdVJm.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/xxEec408VQY7TIvtpxdkUM3Fux6.jpg",
    manualEmbed: "cos:movie/773655",
    trailerEmbed: "https://www.youtube.com/watch?v=veUqfcyZ_Bo",
    isSeries: false
  },
  {
    id: "Gabriel's Inferno",
    imdbId: "tt11316854",
    title: "Gabriel's Inferno",
    releaseDate: "2020-05-29",
    rating: 8.4,
    synopsis: "An intriguing and sinful exploration of seduction, forbidden love, and redemption, Gabriel's Inferno is a captivating and wildly passionate tale of one man's escape from his own personal hell as he tries to earn the impossible--forgiveness and love.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/oyG9TL7FcRP4EZ9Vid6uKzwdndz.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/nIkcTtuhmkl1GZO2LfZi7SwFz7F.jpg",
    manualEmbed: "cos:movie/696374",
    trailerEmbed: "https://www.youtube.com/watch?v=kgWFjmiqHmQ",
    isSeries: false
  },
  {
    id: "The Weekend Away",
    imdbId: "tt14817272",
    title: "The Weekend Away",
    releaseDate: "2022-03-03",
    rating: 6.1,
    synopsis: "When her best friend vanishes during a girls' trip to Croatia, Beth races to figure out what happened. But each clue yields another unsettling deception.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6MS0QEl7UK2gdFFbHfNwuYlsq4H.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/ogBxTYI7TDSnkUONkwK4R8hM1lE.jpg",
    manualEmbed: "cos:movie/840882",
    trailerEmbed: "https://www.youtube.com/watch?v=820j10lEAec",
    isSeries: false
  },
  {
    id: "Relic",
    imdbId: "tt9072352",
    title: "Relic",
    releaseDate: "2020-07-03",
    rating: 6.1,
    synopsis: "When elderly mother Edna inexplicably vanishes, her daughter rushes to the family's decaying home, finding clues of her increasing dementia scattered around the house in her absence.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/3wZ0gxLqsPleneFSTZILmM3BE8Q.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/beNLniUH5DLbLbiqQgAJkiIlgpw.jpg",
    manualEmbed: "cos:movie/539181",
    trailerEmbed: "https://www.youtube.com/watch?v=XWhZDQkq0bw",
    isSeries: false
  },
  {
    id: "His House",
    imdbId: "tt8508734",
    title: "His House",
    releaseDate: "2020-01-27",
    rating: 6.4,
    synopsis: "After making a harrowing escape from war-torn South Sudan, a young refugee couple struggle to adjust to their new life in a small English town that has an unspeakable evil lurking beneath the surface.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/s6XxJEe4ovVTMgmGmKeO87OFANU.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/bNZB25TQxt0jEVgJOJ09tD2es7k.jpg",
    manualEmbed: "cos:movie/575774",
    trailerEmbed: "https://www.youtube.com/watch?v=DYY0QJhlXjc",
    isSeries: false
  },
  {
    id: "Rebecca",
    imdbId: "tt2235695",
    title: "Rebecca",
    releaseDate: "2020-10-16",
    rating: 6.3,
    synopsis: "After a whirlwind romance with a wealthy widower, a naïve bride moves to his family estate but can't escape the haunting shadow of his late wife.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/kGhllBArW7ImDycSMIG5bj6GEPL.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/rVkptIl9QkhpB5xM6BnUAHOJ43b.jpg",
    manualEmbed: "cos:movie/505379",
    trailerEmbed: "https://www.youtube.com/watch?v=LFVhB54UqvQ",
    isSeries: false
  },
  {
    id: "Winnie the Pooh: Blood and Honey",
    imdbId: "tt19623240",
    title: "Winnie the Pooh: Blood and Honey",
    releaseDate: "2023-01-26",
    rating: 4.9,
    synopsis: "After Christopher Robin abandons them for college, Pooh and Piglet embark on a bloody rampage as they search for a new source of food.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/y3iPrVHicDBcx2N6eamv0jbHH6H.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/jEybIB7yl3zgEdTHukaiR8b9yJp.jpg",
    manualEmbed: "cos:movie/980078",
    trailerEmbed: "https://www.youtube.com/watch?v=dcpcwARBMJ4",
    isSeries: false
  },
  {
    id: "Home Team",
    imdbId: "tt14592064",
    title: "Home Team",
    releaseDate: "2022-01-28",
    rating: 6.6,
    synopsis: "Two years after a Super Bowl win when NFL head coach Sean Payton is suspended, he goes back to his hometown and finds himself reconnecting with his 12-year-old son by coaching his Pop Warner football team.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/zTwfMV1hm1DIrMo8BGyZKskhSPr.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/aGDtBTmSKa1TRmpWwcvqtCQP09v.jpg",
    manualEmbed: "cos:movie/817648",
    trailerEmbed: "https://www.youtube.com/watch?v=xppbyXSxPlo",
    isSeries: false
  },
  {
    id: "Dangerous Lies",
    imdbId: "tt10183816",
    title: "Dangerous Lies",
    releaseDate: "2020-04-30",
    rating: 6.3,
    synopsis: "After losing her waitressing job, Katie Franklin takes a job as a caretaker to a wealthy elderly man in his sprawling, empty Chicago estate. The two grow close, but when he unexpectedly passes away and names Katie as his sole heir, she and her husband Adam are pulled into a complex web of lies, deception, and murder. If she's going to survive, Katie will have to question everyone's motives — even the people she loves.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6G1v6iFroz0Xw3VNxhMWjiS5hLa.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/tuqv0jb0o7sBOivgkagKJHuO6X4.jpg",
    manualEmbed: "cos:movie/689723",
    trailerEmbed: "https://www.youtube.com/watch?v=EzJJo0whbJ4",
    isSeries: false
  },
  {
    id: "Clouds",
    imdbId: "tt6473066",
    title: "Clouds",
    releaseDate: "2020-10-09",
    rating: 8.2,
    synopsis: "Young musician Zach Sobiech discovers his cancer has spread, leaving him just a few months to live. With limited time, he follows his dream and makes an album, unaware that it will soon be a viral music phenomenon.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/2YvT3pdGngzpbAuxamTz4ZlabnT.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/L7DIiAdP8DnNqOh7454ZrTYspR.jpg",
    manualEmbed: "cos:movie/630566",
    trailerEmbed: "https://www.youtube.com/watch?v=OWEgUhWU4g4",
    isSeries: false
  },
  {
    id: "Work It",
    imdbId: "tt10276470",
    title: "Work It",
    releaseDate: "2020-08-07",
    rating: 7.5,
    synopsis: "A brilliant but clumsy high school senior vows to get into her late father's alma mater by transforming herself and a misfit squad into dance champions.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/b5XfICAvUe8beWExBz97i0Qw4Qh.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/oAcV4179Kdpvb2xk9TtS8Ewrp8q.jpg",
    manualEmbed: "cos:movie/612706",
    trailerEmbed: "https://www.youtube.com/watch?v=OqcP_wkcl2I",
    isSeries: false
  },
  {
    id: "Falling for Christmas",
    imdbId: "tt14715170",
    title: "Falling for Christmas",
    releaseDate: "2022-11-10",
    rating: 6.2,
    synopsis: "An engaged, spoiled hotel heiress finds herself in the care of a handsome, blue-collar lodge owner and his precocious daughter after getting amnesia in a skiing accident.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/zgtkXLJagDMlW4iXTCojL5guDeu.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/iVtpnbPE91vmi3LmcOXycEblwPA.jpg",
    manualEmbed: "cos:movie/833097",
    trailerEmbed: "https://www.youtube.com/watch?v=bsNIJd45jYM",
    isSeries: false
  },
  {
    id: "The White Tiger",
    imdbId: "tt6571548",
    title: "The White Tiger",
    releaseDate: "2021-01-13",
    rating: 7,
    synopsis: "An ambitious Indian driver uses his wit and cunning to escape from poverty and rise to the top. An epic journey based on the New York Times bestseller.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/5JnmseS3DZ6ad2VMbrnbGCs8Rst.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/wz4BoW7k5LNluY4PmxHBU1IS5Bc.jpg",
    manualEmbed: "cos:movie/628534",
    trailerEmbed: "https://www.youtube.com/watch?v=35jJNyFuYKQ",
    isSeries: false
  },
  {
    id: "2067",
    imdbId: "tt1918734",
    title: "2067",
    releaseDate: "2020-10-01",
    rating: 5.5,
    synopsis: "A lowly utility worker is called to the future by a mysterious radio signal, he must leave his dying wife to embark on a journey that will force him to face his deepest fears in an attempt to change the fabric of reality and save humankind from its greatest environmental crisis yet.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/7D430eqZj8y3oVkLFfsWXGRcpEG.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/5UkzNSOK561c2QRy2Zr4AkADzLT.jpg",
    manualEmbed: "cos:movie/528085",
    trailerEmbed: "https://www.youtube.com/watch?v=xKv_Ic8b1VE",
    isSeries: false
  },
  {
    id: "Moxie",
    imdbId: "tt6432466",
    title: "Moxie",
    releaseDate: "2021-03-03",
    rating: 7.2,
    synopsis: "Inspired by her mom's rebellious past and a confident new friend, a shy 16-year-old publishes an anonymous zine calling out sexism at her school.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/aLBo1Ca9PggcWY98ItW5ZkdxTuA.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/aKIrKbszS7Kq0aTGTCRTYMp1EDX.jpg",
    manualEmbed: "cos:movie/583689",
    trailerEmbed: "https://www.youtube.com/watch?v=Sf34qI1hjKU",
    isSeries: false
  },
  {
    id: "Shiva Baby",
    imdbId: "tt11317142",
    title: "Shiva Baby",
    releaseDate: "2021-03-26",
    rating: 7.1,
    synopsis: "College student Danielle must cover her tracks when she unexpectedly runs into her sugar daddy at a shiva - with her parents, ex-girlfriend and family friends also in attendance.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/4sdqVsT6SHqtbCYZS7bhVoEftlL.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/feQvRl67oc4AOWN4LhAwkrMWdX4.jpg",
    manualEmbed: "cos:movie/664300",
    trailerEmbed: "https://www.youtube.com/watch?v=1ribuR9hVv4",
    isSeries: false
  },
  {
    id: "Awake",
    imdbId: "tt10418662",
    title: "Awake",
    releaseDate: "2021-06-09",
    rating: 5.8,
    synopsis: "After a sudden global event wipes out all electronics and takes away humankind’s ability to sleep, chaos quickly begins to consume the world. Only Jill, an ex-soldier with a troubled past, may hold the key to a cure in the form of her own daughter. The question is, can Jill safely deliver her daughter and save the world before she herself loses her mind.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/d8WJFQyNNAEmuGeDwxPhBpx0G4B.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/3RMbkXS4ocMmoJyAD3ZsWbm32Kx.jpg",
    manualEmbed: "cos:movie/615658",
    trailerEmbed: "https://www.youtube.com/watch?v=2fuowcxdrYc",
    isSeries: false
  },
  {
    id: "My Octopus Teacher",
    imdbId: "tt12888462",
    title: "My Octopus Teacher",
    releaseDate: "2020-09-04",
    rating: 7.9,
    synopsis: "After years of swimming every day in the freezing ocean at the tip of Africa, Craig Foster meets an unlikely teacher: a young octopus who displays remarkable curiosity. Visiting her den and tracking her movements for months on end he eventually wins the animal’s trust and they develop a never-before-seen bond between human and wild animal.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/hvTVZb7hBC8tZAGoEhH5eiMJu2B.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/sW7VOrkHKYIeV9PaYc5IqGU2XK8.jpg",
    manualEmbed: "cos:movie/682110",
    trailerEmbed: "https://www.youtube.com/watch?v=3s0LTDhqe5A",
    isSeries: false
  },
  {
    id: "The Royal Treatment",
    imdbId: "tt13989030",
    title: "The Royal Treatment",
    releaseDate: "2022-01-20",
    rating: 6.7,
    synopsis: "Isabella runs her own salon and isn’t afraid to speak her mind, while Prince Thomas runs his own country and is about to marry for duty rather than love. When Izzy and her fellow stylists get the opportunity of a lifetime to do the hair for the royal wedding, she and Prince Thomas learn that taking control of their own destiny requires following their hearts.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/mYAv0YUoXJzLxIdEirOken8Quwf.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/on1p1AdcfxmlyHhVXoycWt75D8H.jpg",
    manualEmbed: "cos:movie/790142",
    trailerEmbed: "https://www.youtube.com/watch?v=KWxJXZ3S3-g",
    isSeries: false
  },
  {
    id: "If Anything Happens I Love You",
    imdbId: "tt11768948",
    title: "If Anything Happens I Love You",
    releaseDate: "2020-11-20",
    rating: 7.7,
    synopsis: "Grieving parents journey through an emotional void as they mourn the loss of a child after a tragic school shooting.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/85tDhACvKDQxQoJhBYLvDU0ik1n.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/tfhKc6tMxBVZuiipbXWUYdXyMYj.jpg",
    manualEmbed: "cos:movie/713776",
    trailerEmbed: "https://www.youtube.com/watch?v=n18AbC8qfiw",
    isSeries: false
  },
  {
    id: "Gabriel's Inferno: Part II",
    imdbId: "tt13535454",
    title: "Gabriel's Inferno: Part II",
    releaseDate: "2020-07-31",
    rating: 8.3,
    synopsis: "Professor Gabriel Emerson finally learns the truth about Julia Mitchell's identity, but his realization comes a moment too late. Julia is done waiting for the well-respected Dante specialist to remember her and wants nothing more to do with him. Can Gabriel win back her heart before she finds love in another's arms?",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/x5o8cLZfEXMoZczTYWLrUo1P7UJ.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/jtAI6OJIWLWiRItNSZoWjrsUtmi.jpg",
    manualEmbed: "cos:movie/724089",
    trailerEmbed: "https://www.youtube.com/watch?v=5g02v1oz5Y0",
    isSeries: false
  },
  {
    id: "Return of the Tooth Fairy",
    imdbId: "tt11082246",
    title: "Return of the Tooth Fairy",
    releaseDate: "2020-06-15",
    rating: 6.5,
    synopsis: "The Tooth Fairy is back. 15 years after the events of the first movie, Corey, now grown up but mentally scarred has gone to a class reunion. However, the Tooth Fairy is back, and this time - You better have flossed properly.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/n8XFS2FVStaBPS2vLqUuH2bAjVf.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/meIF4dCPCh80gsBY5cM4E3jSKRd.jpg",
    manualEmbed: "cos:movie/708336",
    isSeries: false
  },

];

// Latest episode across all seasons of a series (reads seriesData from episodes.js).
// Guarded so pages without episodes.js (or with no match) never break card rendering.
function getLatestEpisodeNumber(seriesId) {
  try {
    if (typeof seriesData === 'undefined' || !Array.isArray(seriesData)) return null;
    const series = seriesData.find(s => s.id === seriesId);
    if (!series || !Array.isArray(series.seasons) || series.seasons.length === 0) return null;
    let latest = null;
    series.seasons.forEach(season => {
      if (!Array.isArray(season.episodes)) return;
      // Highest season number wins; compare episode numbers within it
      season.episodes.forEach(ep => {
        const total = (season.seasonNumber || 1) * 1000 + (ep.episodeNumber || 0);
        if (latest === null || total > latest) latest = total;
      });
    });
    if (latest === null) return null;
    const seasonNum = Math.floor(latest / 1000);
    const epNum = latest % 1000;
    return seasonNum > 1 ? ('S' + seasonNum + 'E' + epNum) : String(epNum);
  } catch (e) { return null; }
}

// Total episode count across all seasons of a series (for "N Episodes" badges).
function getTotalEpisodeCount(seriesId) {
  try {
    if (typeof seriesData === 'undefined' || !Array.isArray(seriesData)) return null;
    const series = seriesData.find(s => s.id === seriesId);
    if (!series || !Array.isArray(series.seasons)) return null;
    let count = 0;
    series.seasons.forEach(season => {
      if (Array.isArray(season.episodes)) count += season.episodes.length;
    });
    return count > 0 ? count : null;
  } catch (e) { return null; }
}

function createMovieCard(movie, rankNumber = null) {
  const card = document.createElement('div');
  card.className = 'poster-card';
  card.onclick = () => {
    window.location.href = `player.html?id=${encodeURIComponent(movie.id)}`;
  };

  const fallbackUrl = 'https://via.placeholder.com/300x450/1f1f1f/ffffff?text=No+Poster';
  const rankHTML = rankNumber ? `<div class="rank-badge-box">#${sanitizeHTML(String(rankNumber))}</div>` : '';

  const hasManualLink = movie.manualEmbed && movie.manualEmbed.trim() !== '';
  // K-Drama series: badge shows completion status instead of HD/Trailer.
  //   completed: true            → "Complete"
  //   still airing (default)     → "Updated to Ep N" (N = latest episode in seriesData)
  let qualityLabel = hasManualLink ? 'HD' : 'TRAILER';
  let qualityClass = hasManualLink ? 'quality-hd' : 'quality-trailer';
  if (movie.isKdrama && movie.isSeries) {
    if (movie.completed) {
      // Completed: show the episode count, e.g. "8 Episodes" (Netflix convention).
      // Falls back to "Complete" when no episode data exists yet.
      const total = getTotalEpisodeCount(movie.id);
      qualityLabel = total ? (total + ' Episodes') : 'Complete';
      qualityClass = 'quality-complete';
    } else {
      const latest = getLatestEpisodeNumber(movie.id);
      qualityLabel = latest ? ('Updated to Ep. ' + latest) : 'Ongoing';
      qualityClass = 'quality-updated';
    }
  }

  const safeTitle = sanitizeHTML(movie.title);
  const safePoster = sanitizeHTML(movie.poster);

  card.innerHTML = `
    ${rankHTML}
    <div class="tag-badge-top-right ${qualityClass}">${qualityLabel}</div>
    <img src="${safePoster}" 
         alt="${safeTitle}" 
         loading="lazy" 
         onerror="this.onerror=null;this.src='${fallbackUrl}';">
    <div class="poster-card-overlay">
      <div class="poster-card-title">${safeTitle}</div>
    </div>
  `;
  // PC hover trailer preview (index.html only, no-op elsewhere)
  if (typeof HOVER_PREVIEW !== 'undefined' && HOVER_PREVIEW.isEnabled && HOVER_PREVIEW.isEnabled()) {
    HOVER_PREVIEW.attach(card, movie);
  }
  return card;
}

let heroCarouselTimer = null;

// ============================================
// NETFLIX-STYLE HOVER TRAILER PREVIEW (PC only)
// Hovering a poster for ~600ms starts a muted
// trailer preview ON the card (scaled up, absolutely
// positioned — the grid/poster sizes never change).
// index.html + category.html.
// ============================================
const HOVER_PREVIEW = (function () {
  // index.html + category.html (category pages use the same .poster-card grid).
  // Path+search are tested together so /category.html?type=tagalog matches.
  const isIndexPage = /(^|\/)index\.html($|\?|#)/.test(window.location.pathname + window.location.search) ||
                      /(^|\/)category\.html($|\?|#)/.test(window.location.pathname + window.location.search) ||
                      window.location.pathname === '/' || window.location.pathname === '';
  // Re-evaluated on every use. The old one-shot (hover: hover) and (pointer: fine)
  // check broke on Windows touchscreen laptops — the touchscreen is the PRIMARY
  // pointer there, so (pointer: fine) failed even with a mouse attached.
  // any-* variants are true whenever a mouse/trackpad is present at all.
  // Desktop-only feature (hover). Mobile long-press preview was removed by
  // request — phones go straight to the player on tap.
  function isEnabled() {
    if (!isIndexPage) return false;
    // Any real desktop window. The any-hover/any-pointer checks below already
    // exclude touch-only devices; the old 900px floor made the feature dead in
    // narrow windows and embedded preview panes.
    if (window.innerWidth < 560) return false;
    return window.matchMedia('(any-hover: hover)').matches &&
           window.matchMedia('(any-pointer: fine)').matches;
  }

  const state = {
    timer: null,
    activeCard: null,
    activeMovieId: null,
    activeMovie: null,  // movie object for the panel buttons
    trailerCache: {},   // movieId -> youtube key ('' = none found)
    detailsCache: {},   // movieId -> details payload (reuses player's endpoint)
    inflight: {}        // movieId -> Promise<string>
  };
  function apiBase() {
    try { return (window.__DEYMFLIX_CONFIG__ && window.__DEYMFLIX_CONFIG__.API_BASE) || ''; }
    catch (e) { return ''; }
  }

  function pageName() {
    const p = window.location.pathname.split('/').pop();
    return p || 'index.html';
  }

  // Resolve a YouTube trailer key for a movie: local trailerEmbed first,
  // then TMDB via the shared server endpoint (cached server-side too).
  function resolveTrailerKey(movie) {
    const id = movie && movie.id;
    if (!id) return Promise.resolve('');
    if (state.trailerCache[id] !== undefined) return Promise.resolve(state.trailerCache[id]);
    if (state.inflight[id]) return state.inflight[id];

    // 1) Manual YouTube trailer from app data
    const manual = (movie.trailerEmbed || '').trim();
    if (manual) {
      const m = manual.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
      if (m) {
        state.trailerCache[id] = m[1];
        return Promise.resolve(m[1]);
      }
    }

    // 2) TMDB videos through the server (needs imdb id)
    const imdb = movie.imdbId || movie.tmdbId || '';
    if (/^tt\d{5,}$/.test(imdb)) {
      const qs = new URLSearchParams({ title: movie.title || '' });
      const yr = (movie.releaseDate || movie.year || '').toString().match(/\d{4}/);
      if (yr) qs.set('year', yr[0]);
      state.inflight[id] = fetch(apiBase() + '/api/tmdb/details/' + encodeURIComponent(imdb) + '?' + qs.toString())
        .then(r => r.ok ? r.json() : { found: false })
        .then(j => {
          const key = (j && j.trailerKey) || '';
          state.trailerCache[id] = key;
          return key;
        })
        .catch(() => { state.trailerCache[id] = ''; return ''; })
        .finally(() => { delete state.inflight[id]; });
      return state.inflight[id];
    }

    state.trailerCache[id] = '';
    return Promise.resolve('');
  }

  // One global floating panel (NOT inside the card) — Netflix-style landscape
  // preview that hovers OVER the grid, anchored to the hovered card.
  // Layout: video / title / Play+Bookmark buttons / match% · year / genres
  function getPanel() {
    let pv = document.getElementById('hover-preview-panel');
    let backdrop = document.getElementById('hover-preview-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'hover-preview-backdrop';
      backdrop.className = 'hp-backdrop';
      document.body.appendChild(backdrop);
      backdrop.addEventListener('touchstart', function () { clearPreview(); }, { passive: true });
      backdrop.addEventListener('mousedown', function () { clearPreview(); });
    }
    if (!pv) {
      pv = document.createElement('div');
      pv.id = 'hover-preview-panel';
      pv.className = 'hover-preview';
      pv.innerHTML =
        '<div class="hp-video"><div class="hp-loading">Loading</div></div>' +
        '<div class="hp-info">' +
          '<div class="hp-title"></div>' +
          '<div class="hp-actions">' +
            '<button class="hp-btn hp-play" title="Play" aria-label="Play">' +
              '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>' +
            '</button>' +
            '<button class="hp-btn hp-bookmark" title="Add to Bookmarks" aria-label="Add to Bookmarks">' +
              '<svg class="hp-bm-plus" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>' +
              '<svg class="hp-bm-check" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>' +
            '</button>' +
          '</div>' +
          '<div class="hp-meta"><span class="hp-match"></span><span class="hp-year"></span></div>' +
          '<div class="hp-genres"></div>' +
        '</div>';
      document.body.appendChild(pv);
      wirePanelButtons(pv);
      // Leaving the panel closes it (unless moving back onto the card — the
      // card's mouseenter restarts the preview in that case)
      pv.addEventListener('mouseleave', function (e) {
        if (state.activeCard && e.relatedTarget && state.activeCard.contains(e.relatedTarget)) return;
        clearPreview();
      });
    }
    return pv;
  }

  // Play + bookmark buttons on the panel (delegated — panel is recreated often)
  function wirePanelButtons(pv) {
    pv.addEventListener('click', function (e) { e.stopPropagation(); });
    const play = pv.querySelector('.hp-play');
    if (play) play.addEventListener('click', function (e) {
      e.stopPropagation();
      const m = state.activeMovie || currentMovieForPanel();
      if (!m) return;
      window.location.href = 'player.html?id=' + encodeURIComponent(m.id);
    });
    const bm = pv.querySelector('.hp-bookmark');
    if (bm) bm.addEventListener('click', function (e) {
      e.stopPropagation();
      const m = state.activeMovie || currentMovieForPanel();
      if (!m) return;
      if (typeof addToMyList === 'function' && typeof getMyList === 'function') {
        const inList = getMyList().some(function (x) { return x.id === m.id; });
        if (!inList) {
          addToMyList(m);
          updateBookmarkBtnState(pv, m);
        }
      }
    });
  }

  function currentMovieForPanel() {
    const id = state.activeMovieId;
    const pool = (typeof movies !== 'undefined' && Array.isArray(movies) ? movies : [])
      .concat(typeof featuredMovies !== 'undefined' ? featuredMovies : []);
    return pool.find(function (x) { return x && x.id === id; }) || null;
  }

  function updateBookmarkBtnState(pv, movie) {
    const bm = pv.querySelector('.hp-bookmark');
    if (!bm) return;
    const inList = (typeof getMyList === 'function') && getMyList().some(function (x) { return x.id === movie.id; });
    bm.classList.toggle('in-list', inList);
    bm.title = inList ? 'In Bookmarks' : 'Add to Bookmarks';
  }

  // Fill match% / year / genres from the TMDB details endpoint (cached)
  function fetchDetailsForPanel(movie) {
    const id = movie && movie.id;
    if (!id) return Promise.resolve(null);
    if (state.detailsCache[id]) return Promise.resolve(state.detailsCache[id]);
    const imdb = movie.imdbId || movie.tmdbId || '';
    if (!/^tt\d{5,}$/.test(imdb)) return Promise.resolve(null);
    const qs = new URLSearchParams({ title: movie.title || '' });
    const yr = (movie.releaseDate || movie.year || '').toString().match(/\d{4}/);
    if (yr) qs.set('year', yr[0]);
    return fetch(apiBase() + '/api/tmdb/details/' + encodeURIComponent(imdb) + '?' + qs.toString())
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { if (j && j.found) { state.detailsCache[id] = j; } return j || null; })
      .catch(function () { return null; });
  }

  function fillInfoRows(movie) {
    const pv = document.getElementById('hover-preview-panel');
    if (!pv) return;
    const matchEl = pv.querySelector('.hp-match');
    const yearEl = pv.querySelector('.hp-year');
    const genresEl = pv.querySelector('.hp-genres');
    // Graceful fallbacks from local data while/instead of TMDB
    const localYear = (movie.releaseDate || movie.year || '').toString().match(/\d{4}/);
    if (yearEl) yearEl.textContent = localYear ? localYear[0] : '';
    if (genresEl) genresEl.textContent = (movie.genres && movie.genres.length) ? movie.genres.join(' · ') : '';
    fetchDetailsForPanel(movie).then(function (d) {
      // user may have un-hovered during the fetch
      if (document.getElementById('hover-preview-panel') !== pv) return;
      if (!d) return;
      if (matchEl) {
        const pct = Math.round((d.score || 0) * 10);
        matchEl.textContent = pct > 0 ? pct + '% Match' : '';
      }
      if (yearEl) {
        const y = (d.releaseDate || '').match(/\d{4}/);
        if (y) yearEl.textContent = y[0];
      }
      if (genresEl && d.genres && d.genres.length) {
        genresEl.textContent = d.genres.slice(0, 3).join(' · ');
      }
    });
  }

  function mountPreview(card, movie) {
    const pv = getPanel();
    pv.classList.remove('visible');
    // Panel grows taller (video + info block) — recompute height from the real box
    const rect = card.getBoundingClientRect();
    const W = 340;
    const H = W * 9 / 16 + 150;          // 16:9 video + title/buttons/meta/genres
    let left = rect.left + rect.width / 2 - W / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - W - 12));
    let top = rect.top + rect.height / 2 - H / 2;
    top = Math.max(80, Math.min(top, window.innerHeight - H - 90));
    pv.style.left = Math.round(left) + 'px';
    pv.style.top = Math.round(top) + 'px';
    // Title + rows; buttons reflect current bookmark state
    const t = pv.querySelector('.hp-title');
    if (t) t.textContent = movie.title || '';
    updateBookmarkBtnState(pv, movie);
    fillInfoRows(movie);
    state.activeMovie = movie;
    // Show the poster in the video area right away (no blank box while the
    // trailer lookup runs); playYouTube swaps in the iframe when a key exists.
    const vid0 = pv.querySelector('.hp-video');
    if (vid0 && !vid0.querySelector('iframe')) {
      vid0.innerHTML = '<img class="hp-fallback" loading="lazy" src="' + (movie.backdrop || movie.poster || '') + '" alt="">';
    }
    // Reveal on the next frame so the transition plays
    requestAnimationFrame(function () { pv.classList.add('visible'); });
  }
  function playYouTube(card, movie, key) {
    const pv = document.getElementById('hover-preview-panel');
    if (!pv) return;
    const vid = pv.querySelector('.hp-video');
    if (!vid) return;
    if (key) {
      vid.innerHTML =
        '<iframe src="https://www.youtube.com/embed/' + encodeURIComponent(key) +
        '?autoplay=1&mute=1&controls=0&modestbranding=1&playsinline=1&loop=1&playlist=' +
        encodeURIComponent(key) + '&rel=0&enablejsapi=1" allow="autoplay; encrypted-media" ' +
        'title="trailer" tabindex="-1"></iframe>' +
        '<button class="hp-mute-toggle" title="Sound on/off" aria-label="Toggle sound">🔇</button>';
      const iframe = vid.querySelector('iframe');
      const cmd = function (func, args) {
        try { iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: func, args: args || [] }), '*'); } catch (e) {}
      };
      // WHY MUTED AT FIRST: browsers block audible autoplay until the user has
      // clicked somewhere on the page (hover doesn't count). We start muted —
      // always allowed — then auto-try to unmute once playback begins. If the
      // user has clicked anything since loading, sound comes on; the speaker
      // button is the manual fallback (same pattern as Netflix previews).
      setTimeout(function () {
        if (!document.body.contains(iframe)) return;
        cmd('unMute');
        cmd('setVolume', [100]);
        const btn = vid.querySelector('.hp-mute-toggle');
        if (btn) btn.textContent = '🔊';
      }, 900);
      // Bulletproof loop: the loop=1 param is flaky in some embeds, so restart
      // explicitly when the player reports the video ended.
      cmd('addEventListener', ['onStateChange']);
      const onMsg = function (ev) {
        if (!iframe.isConnected || ev.source !== iframe.contentWindow) return;
        try {
          const d = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data;
          const ended = (d && d.event === 'onStateChange' && d.info === 0) ||
                        (d && d.event === 'infoDelivery' && d.info && d.info.playerState === 0);
          if (ended) { cmd('seekTo', [0]); cmd('playVideo'); }
        } catch (e) {}
      };
      window.addEventListener('message', onMsg);
      state.panelMsgCleanup = function () { window.removeEventListener('message', onMsg); };
      // Speaker toggle
      const muteBtn = vid.querySelector('.hp-mute-toggle');
      if (muteBtn) {
        muteBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          const muted = muteBtn.textContent === '🔇';
          if (muted) { cmd('unMute'); cmd('setVolume', [100]); muteBtn.textContent = '🔊'; }
          else { cmd('mute'); muteBtn.textContent = '🔇'; }
        });
      }
    } else {
      // No trailer: Netflix-style static fallback — the poster fills the video area
      vid.innerHTML = '<img class="hp-fallback" loading="lazy" src="' + (movie.backdrop || movie.poster || '') + '" alt="">';
    }
  }

  function clearPreview() {
    if (state.timer) { clearTimeout(state.timer); state.timer = null; }
    if (state.panelMsgCleanup) { state.panelMsgCleanup(); state.panelMsgCleanup = null; }
    const pv = document.getElementById('hover-preview-panel');
    if (pv) pv.remove(); // iframe removed = playback + network stop instantly
    const bd = document.getElementById('hover-preview-backdrop');
    if (bd) bd.classList.remove('visible');
    state.activeCard = null;
    state.activeMovieId = null;
    state.activeMovie = null;
  }

  // The panel is fixed-position — close it when the page moves under it
  window.addEventListener('scroll', function () { if (state.activeCard) clearPreview(); }, { passive: true });
  window.addEventListener('resize', function () { if (state.activeCard) clearPreview(); }, { passive: true });

  function attach(card, movie) {
    if (!isEnabled() || !card || card.dataset.hpBound === '1') return;
    card.dataset.hpBound = '1';

    card.addEventListener('mouseenter', function () {
      if (!isEnabled()) return;
      // RE-FIRE GUARD: when the panel mounts under a stationary cursor, Chrome
      // recomputes the hover chain and fires a synthetic mouseenter on the card
      // ~10ms later. Without this guard that re-fire ran clearPreview() (killing
      // the panel 7ms after mount) and restarted the 600ms timer → an infinite
      // mount/kill flicker loop where the trailer iframe never survived. That's
      // why some posters played and others didn't: it depends on whether the
      // mounted panel overlaps the cursor position for that card's geometry.
      if (state.activeCard === card) return; // already previewing THIS card — ignore layout-shift re-fires
      clearPreview();
      state.activeCard = card;
      state.activeMovieId = movie.id;
      state.timer = setTimeout(async function () {
        if (state.activeCard !== card) return; // hover moved on
        // Mount the panel IMMEDIATELY with the poster in the video area —
        // the old code waited for the TMDB trailer lookup and showed nothing
        // at all when a movie had no trailer (most 2026 titles don't yet).
        mountPreview(card, movie);
        const key = await resolveTrailerKey(movie);
        if (state.activeCard !== card) return; // hover left during fetch
        playYouTube(card, movie, key);          // key='' → poster fallback stays
      }, 600);
    });

    // If the pointer moves onto the panel itself (the panel covers the card),
    // the card would fire mouseleave and kill the preview. Keep it alive when
    // the pointer is moving INTO the panel — close only when leaving both.
    card.addEventListener('mouseleave', function (e) {
      if (state.activeCard !== card) return; // not mine — don't kill another card's preview
      const pv = document.getElementById('hover-preview-panel');
      if (pv && e.relatedTarget && pv.contains(e.relatedTarget)) return;
      clearPreview();
    });
  }

  // Bind to every poster card on index.html — including dynamically rendered ones
  function bindAll() {
    if (!isEnabled()) return;
    document.querySelectorAll('.poster-card:not([data-hp-bound])').forEach(function (card) {
      const movie = movieByIdForCard(card);
      if (movie) attach(card, movie);
    });
  }

  // Cards don't carry the movie object — recover it from the click target URL
  function movieByIdForCard(card) {
    const img = card.querySelector('img[loading="lazy"]');
    if (!img) return null;
    const onclick = card.getAttribute('onclick') || '';
    const m = onclick.match(/player\.html\?id=([^"']+)/);
    if (m) {
      const id = decodeURIComponent(m[1]);
      const pool = (typeof movies !== 'undefined' && Array.isArray(movies) ? movies : [])
        .concat(typeof featuredMovies !== 'undefined' ? featuredMovies : [])
        .concat(typeof continueWatchingPool !== 'undefined' ? continueWatchingPool : []);
      const found = pool.find(function (x) { return x && x.id === id; });
      if (found) return found;
    }
    // Continue-watching cards build hrefs in JS (no onclick attr) — match by title
    const titleEl = card.querySelector('.poster-card-title');
    if (titleEl) {
      const pool = (typeof movies !== 'undefined' && Array.isArray(movies) ? movies : []);
      return pool.find(function (x) { return x && x.title === titleEl.textContent; }) || null;
    }
    return null;
  }

  // Public: called after each render pass
  function refresh() { if (isEnabled()) setTimeout(bindAll, 50); }

  return { attach: attach, refresh: refresh, isEnabled: isEnabled };
})();

document.addEventListener('DOMContentLoaded', () => {
  setupHeroBanner();
  renderContinueWatching();
  renderTopPicks();
  setupSearchHandlers();
  setupDragScroll();

  // Stagger remaining sections for faster perceived load
  requestIdleCallback(() => {
    renderAiReels();
    requestIdleCallback(() => {
      renderFilipinoMovies();
      renderKdramas();
      requestIdleCallback(() => {
        renderAllMoviesGrid();
        renderBecauseYouWatched();
      });
    });
  }, { timeout: 500 });

  // Continue-watching cards are built inline (not via createMovieCard) —
  // bind hover previews to them after the DOM settles.
  if (typeof HOVER_PREVIEW !== 'undefined' && HOVER_PREVIEW.isEnabled && HOVER_PREVIEW.isEnabled()) {
    setTimeout(() => HOVER_PREVIEW.refresh(), 300);
  }
});

function setupDragScroll() {
  document.querySelectorAll('.top-picks-scroll, .horizontal-scroll, .reels-horizontal-scroll').forEach(container => {
    let isDown = false;
    let startX;
    let scrollLeft;

    container.addEventListener('mousedown', (e) => {
      isDown = true;
      container.style.cursor = 'grabbing';
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    });

    container.addEventListener('mouseleave', () => {
      isDown = false;
      container.style.cursor = 'grab';
    });

    container.addEventListener('mouseup', () => {
      isDown = false;
      container.style.cursor = 'grab';
    });

    container.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.5;
      container.scrollLeft = scrollLeft - walk;
    });
  });
}

function showToast(message) {
  const toastNotification = document.getElementById('loading-toast');
  if (!toastNotification) return;
  toastNotification.textContent = message;
  toastNotification.classList.add('show');
  setTimeout(() => {
    toastNotification.classList.remove('show');
  }, 2000);
}

function renderContinueWatching() {
  const section = document.getElementById('continue-watching-section');
  const container = document.getElementById('continue-watching-container');
  if (!section || !container) return;

  let savedData = {};
  try {
    savedData = JSON.parse(localStorage.getItem('deymflix_continue_watching') || '{}');
  } catch (e) {
    savedData = {};
  }

  // Continue Watching = unfinished only. Finished movies (user completed them
  // or progress hit 95%+) are removed here; they still appear on the History page.
  // ONE CARD PER SERIES: episode entries (new keys "<id>-s<n>-ep<m>", legacy
  // keys "<id>-ep<m>", and plain "<id>" rows written before season support)
  // are grouped by their series base id and only the most recently watched
  // entry is shown — exactly like Netflix. Going back to season 1 later just
  // moves the series' single card to that episode; it never spawns extra
  // cards. True movies (no episode keys sharing their id) pass through.
  const byBase = {};
  // New season-aware keys: "<id>-s<n>-ep<m>". Legacy: "<id>-ep<m>" — its base
  // is the plain id; both must land in the SAME series group.
  const epKeyRe = /^(.*)-s\d+-ep\d+$/;
  const legacyEpKeyRe = /^(.*)-ep\d+$/;
  Object.keys(savedData).forEach(key => {
    const it = savedData[key];
    if (!it || it.finished || Number(it.progress) >= 95) return;
    let base = key, isEpisode = false, sNum = null, eNum = null;
    let m = epKeyRe.exec(key);
    if (m) {
      base = m[1]; isEpisode = true;
      const sm = /-s(\d+)-ep(\d+)$/.exec(key);
      sNum = parseInt(sm[1], 10); eNum = parseInt(sm[2], 10);
    } else {
      m = legacyEpKeyRe.exec(key);
      if (m) { base = m[1]; isEpisode = true; eNum = parseInt(/-ep(\d+)$/.exec(key)[1], 10); }
    }
    it._baseId = base;
    it._key = key;
    it._isEpisode = isEpisode;
    it._season = sNum;
    it._epNum = eNum;
    const prev = byBase[base];
    if (!prev || (it.updatedAt || 0) > (prev.updatedAt || 0)) byBase[base] = it;
  });
  const items = Object.keys(byBase).map(b => byBase[b]);
  items.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

  if (items.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  container.innerHTML = '';

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'poster-card';
    card.style.position = 'relative';

    card.onclick = () => {
      // series card: deep-link straight to the exact season + episode so the
      // player opens THAT episode with its saved position (not ep1).
      // Legacy episode keys (no season) still deep-link the episode; the
      // player defaults them to season 1.
      if (item._isEpisode) {
        const sPart = item._season ? ('&s=' + item._season) : '';
        window.location.href = `player.html?id=${encodeURIComponent(item._baseId)}${sPart}&ep=${item._epNum}`;
      } else {
        window.location.href = `player.html?id=${encodeURIComponent(item.id)}`;
      }
    };

    const safeTitle = sanitizeHTML(item.title);
    const safePoster = sanitizeHTML(item.poster);
    const safeProgress = Math.min(100, Math.max(0, Number(item.progress) || 0));

    // Netflix-style badge: 'Finished' at 95%+, otherwise the % watched
    const badgeHTML = safeProgress >= 95
      ? '<div class="mylist-progress-badge">Finished</div>'
      : (safeProgress > 0 ? `<div class="mylist-progress-badge">${Math.round(safeProgress)}% watched</div>` : '');

    card.innerHTML = `
      <button class="remove-continue-btn" title="Remove">&times;</button>
      <img src="${safePoster}" alt="${safeTitle}" loading="lazy">
      ${badgeHTML}
      <div class="poster-card-overlay">
        <div class="poster-card-title">${safeTitle}</div>
      </div>
      <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 4px; background: rgba(255,255,255,0.2); z-index: 10;">
        <div style="width: ${safeProgress}%; height: 100%; background: #e50914;"></div>
      </div>
    `;

    const removeBtn = card.querySelector('.remove-continue-btn');
    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        // series card: removing clears EVERY episode entry of that series,
        // so older episodes can't resurface as a new "latest" card
        if (item._baseId) removeSeriesContinueWatching(item._baseId, e);
        else removeContinueWatching(item.id, e);
      });
    }

    container.appendChild(card);
  });

  // The recommendation row is derived from this history, so it re-renders
  // whenever the history changes (including the X button removing a card).
  renderBecauseYouWatched();
}

// Remove every episode entry of one series (card X button on the series card)
function removeSeriesContinueWatching(baseId, event) {
  event.stopPropagation();
  let savedData = {};
  try {
    savedData = JSON.parse(localStorage.getItem('deymflix_continue_watching') || '{}');
  } catch (e) {}
  const re = new RegExp('^' + String(baseId).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '-s\\d+-ep\\d+$');
  Object.keys(savedData).forEach(k => { if (re.test(k)) delete savedData[k]; });
  localStorage.setItem('deymflix_continue_watching', JSON.stringify(savedData));
  renderContinueWatching();
  showToast('Removed from Continue Watching');
}

function removeContinueWatching(movieId, event) {
  event.stopPropagation();
  let savedData = {};
  try {
    savedData = JSON.parse(localStorage.getItem('deymflix_continue_watching') || '{}');
  } catch (e) {}

  delete savedData[movieId];
  localStorage.setItem('deymflix_continue_watching', JSON.stringify(savedData));
  renderContinueWatching();
  showToast('Removed from Continue Watching');
}


// Global TMDB base (also used by setupHeroBanner — the HOVER_PREVIEW closure
// has its own copy, but that one is not in scope at top level).
function dfxTmdbBase() {
  try {
    var cfg = window.__DEYMFLIX_CONFIG__ || {};
    return cfg.API_BASE || window.__API_BASE__ || '';
  } catch (e) { return ''; }
}

function setupHeroBanner() {
  const heroWrapper = document.getElementById('hero-billboard-wrapper') || document.querySelector('.hero-wrapper');
  if (!heroWrapper || !featuredMovies || featuredMovies.length === 0) return;

  heroWrapper.innerHTML = `
    <div class="hero-carousel-track" id="hero-carousel-track">
      ${featuredMovies.map((item, idx) => `
        <div class="hero-slide-item" data-hero-idx="${idx}" onclick="window.location.href='player.html?id=${encodeURIComponent(item.id)}'">
          <img class="hero-backdrop-img" src="${sanitizeHTML(item.backdrop || item.poster)}" alt="${sanitizeHTML(item.title)}" loading="lazy">
          <div class="hero-fade-overlay"></div>
          <div class="hero-details-container">
            <div class="hero-kicker"><span class="hero-n-badge">DEYMFLIX</span><span class="hero-top10">Featured</span></div>
            <h1 class="hero-title-text">${sanitizeHTML(item.title)}</h1>
            <div class="hero-meta-row">
              <span class="hero-match"></span>
              <span class="hero-year"></span>
              <span class="hero-genres"></span>
            </div>
            <p class="hero-synopsis"></p>
            <div class="hero-btn-row">
              <button class="hero-action-btn">▶ Watch Now</button>
              <button class="hero-info-btn" aria-label="More info">ⓘ More Info</button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
    <div class="hero-dots" id="hero-dots">
      ${featuredMovies.map((_, i) => `<button class="hero-dot${i === 0 ? ' active' : ''}" data-dot-idx="${i}" aria-label="Featured ${i + 1}"></button>`).join('')}
    </div>
  `;

  const track = document.getElementById('hero-carousel-track');
  if (!track) return;

  // ── HERO ENRICHMENT: match% / year / genres / synopsis per slide ──
  // Uses the same TMDB details endpoint as the hover-preview panel; local
  // fallbacks keep the rows useful when TMDB is unavailable.
  featuredMovies.forEach((item, idx) => {
    const slide = track.querySelector('[data-hero-idx="' + idx + '"]');
    if (!slide) return;
    const matchEl = slide.querySelector('.hero-match');
    const yearEl = slide.querySelector('.hero-year');
    const genEl = slide.querySelector('.hero-genres');
    const synEl = slide.querySelector('.hero-synopsis');
    const localYear = (item.releaseDate || item.year || '').toString().match(/\d{4}/);
    if (yearEl && localYear) yearEl.textContent = localYear[0];
    if (genEl && item.genres && item.genres.length) genEl.textContent = item.genres.slice(0, 3).join(' · ');
    const imdb = item.imdbId || '';
    if (!/^tt\d{5,}$/.test(imdb)) return;
    const qs = new URLSearchParams({ title: item.title || '' });
    if (localYear) qs.set('year', localYear[0]);
    fetch(dfxTmdbBase() + '/api/tmdb/details/' + encodeURIComponent(imdb) + '?' + qs.toString())
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d || !d.found) return;
        if (matchEl) {
          const pct = Math.round((d.score || 0) * 10);
          if (pct > 0) matchEl.textContent = pct + '% Match';
        }
        const y = (d.releaseDate || '').match(/\d{4}/);
        if (y && yearEl) yearEl.textContent = y[0];
        if (d.genres && d.genres.length && genEl) genEl.textContent = d.genres.slice(0, 3).join(' · ');
        if (d.overview && synEl) {
          const short = d.overview.length > 180 ? d.overview.slice(0, 177).replace(/\s+\S*$/, '') + '…' : d.overview;
          synEl.textContent = short;
        }
      })
      .catch(() => {});
  });

  // More Info = same player page (details view); Watch Now stays primary
  track.querySelectorAll('.hero-info-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const slide = btn.closest('.hero-slide-item');
      const idx = slide ? slide.getAttribute('data-hero-idx') : '0';
      const item = featuredMovies[Number(idx)];
      if (item) window.location.href = 'player.html?id=' + encodeURIComponent(item.id);
    });
  });

  // ── DOTS: click to jump + auto-sync with the carousel position ──
  const dotsBox = document.getElementById('hero-dots');
  const dots = dotsBox ? Array.from(dotsBox.querySelectorAll('.hero-dot')) : [];
  function syncDots() {
    if (!dots.length) return;
    const slideW = track.firstElementChild ? track.firstElementChild.clientWidth : 1;
    const idx = Math.round(track.scrollLeft / slideW);
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }
  dots.forEach((d, i) => d.addEventListener('click', (e) => {
    e.stopPropagation();
    const slideW = track.firstElementChild ? track.firstElementChild.clientWidth : 0;
    track.scrollTo({ left: i * slideW, behavior: 'smooth' });
  }));
  track.addEventListener('scroll', syncDots, { passive: true });

  startAutoScroll(track);
  track.addEventListener('touchstart', () => clearInterval(heroCarouselTimer), { passive: true });
  track.addEventListener('mousedown', () => clearInterval(heroCarouselTimer));
  track.addEventListener('mouseleave', () => startAutoScroll(track));
  track.addEventListener('touchend', () => startAutoScroll(track));
}

function startAutoScroll(track) {
  if (heroCarouselTimer) clearInterval(heroCarouselTimer);

  heroCarouselTimer = setInterval(() => {
    const slideWidth = track.firstElementChild ? track.firstElementChild.clientWidth : 0;
    const maxScroll = track.scrollWidth - track.clientWidth;

    if (track.scrollLeft >= maxScroll - 5) {
      track.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      track.scrollBy({ left: slideWidth, behavior: 'smooth' });
    }
  }, 5000);
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

function renderAiReels() {
  const container = document.getElementById('ai-reels-container');
  if (!container) return;
  container.innerHTML = '';

  const reelsData = typeof aiReelsData !== 'undefined' ? aiReelsData : [];
  if (reelsData.length === 0) return;

  reelsData.slice(0, 12).forEach(reel => {
    const card = document.createElement('div');
    card.className = 'reel-thumb-card';
    card.onclick = () => {
      window.location.href = `reels.html?id=${encodeURIComponent(reel.id)}`;
    };

    const safeTitle = sanitizeHTML(reel.title);
    const safePoster = sanitizeHTML(reel.poster || reel.thumbnail);

    card.innerHTML = `
      <img src="${safePoster}" alt="${safeTitle}" class="reel-thumb-img" loading="lazy">
      <div class="reel-overlay-info">
        <span class="reel-badge-tag">AI REEL</span>
        <span class="reel-thumb-title">${safeTitle}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderFilipinoMovies() {
  const container = document.getElementById('filipino-movies-container');
  if (!container) return;
  container.innerHTML = '';

  const filipinoMovies = movies.filter(m => m.isFilipino || m.genre?.includes('Filipino') || m.country === 'PH');
  const displayList = filipinoMovies.slice(0, 10);

  displayList.forEach(movie => {
    container.appendChild(createMovieCard(movie));
  });
}

function renderKdramas() {
  const container = document.getElementById('kdrama-container');
  if (!container) return;
  container.innerHTML = '';

  const kdramas = movies.filter(m => m.isKdrama);
  if (kdramas.length === 0) {
    // Row stays hidden when the list is empty — no empty gaps on the home page
    const section = container.closest('.content-section');
    if (section) section.style.display = 'none';
    return;
  }
  const section = container.closest('.content-section');
  if (section) section.style.display = '';

  // Newest releases first so freshly added titles surface in the row
  // (dfxSortByNewest is hoisted below and keeps catalog order for undated entries).
  dfxSortByNewest(kdramas).slice(0, 10).forEach(movie => {
    container.appendChild(createMovieCard(movie));
  });
}

// Newest-first ordering for the All Movies surfaces: releaseDate descending.
// Entries with no release date keep their original relative order, at the end.
function dfxReleaseTimestamp(movie) {
  if (!movie || !movie.releaseDate) return -Infinity;
  const t = Date.parse(movie.releaseDate);
  return isNaN(t) ? -Infinity : t;
}

function dfxSortByNewest(list) {
  return (list || []).slice().sort((a, b) => {
    const ta = dfxReleaseTimestamp(a), tb = dfxReleaseTimestamp(b);
    if (ta === tb) return 0; // stable: keeps catalog order for undated titles
    return tb > ta ? 1 : -1;
  });
}

function renderAllMoviesGrid() {
  const allMoviesGrid = document.getElementById('all-movies-grid');
  if (!allMoviesGrid) return;
  allMoviesGrid.innerHTML = '';

  const displayBatch = dfxSortByNewest(movies).slice(0, 16);
  displayBatch.forEach(movie => {
    allMoviesGrid.appendChild(createMovieCard(movie));
  });
}

function setupSearchHandlers() {
  const searchInput = document.getElementById('search-input');
  const searchForm = document.getElementById('search-form');
  const isCategoryPage = window.location.pathname.includes('category.html');

  if (!searchInput) return;

  // On category page, use handleCategorySearch instead
  if (isCategoryPage) {
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        searchInput.blur();
        if (typeof handleCategorySearch === 'function') handleCategorySearch();
      });
    }
    return;
  }

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

  // ENTER IS A NO-OP everywhere (PC keyboard, mobile keyboards, IME confirm):
  // search is live-as-you-type, so Enter adds nothing — and on Android the
  // IME "Search" key used to resubmit/reload the page. We swallow it in BOTH
  // the keydown and the form-submit paths, without stopping the input's
  // normal composition behavior.
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      try { searchInput.blur(); } catch (err) {} // politely closes mobile keyboards
      return;
    }
    if (e.key === 'Escape') {
      searchInput.value = '';
      hideSuggestions();
      resetHomeState();
      searchInput.blur();
    }
  });

  if (searchForm) {
    // form submit (Enter in some mobile browsers arrives this way): killed
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      try { searchInput.blur(); } catch (err) {}
      return; // nothing happens — live filtering already did the work
    });
  }
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
    const safeTitle = sanitizeHTML(movie.title);
    const safePoster = sanitizeHTML(movie.poster);

    item.innerHTML = `
      <img src="${safePoster}" alt="${safeTitle}" loading="lazy">
      <span class="suggestion-title">${safeTitle}</span>
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
  const allMoviesGrid = document.getElementById('all-movies-grid');

  if (!searchInput || !allMoviesGrid) return;
  const query = searchInput.value.toLowerCase().trim();

  // If query is empty, reset to normal home state instead of hiding everything
  if (!query) {
    resetHomeState();
    return;
  }

  if (homeSectionsWrapper) homeSectionsWrapper.classList.add('hide-for-search');

  const filtered = movies.filter(m => m.title.toLowerCase().includes(query));
  allMoviesGrid.innerHTML = '';

  if (filtered.length === 0) {
    allMoviesGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: #aaaaaa; padding: 50px 0;">No matching movies found.</div>`;
  } else {
    filtered.forEach(m => allMoviesGrid.appendChild(createMovieCard(m)));
  }
}

function resetHomeState() {
  const homeSectionsWrapper = document.getElementById('home-sections-wrapper');
  if (homeSectionsWrapper) homeSectionsWrapper.classList.remove('hide-for-search');
  renderAllMoviesGrid();
}

function openRequestModal() {
  const modal = document.getElementById('request-modal');
  if (modal) modal.style.display = 'flex';
}

function closeRequestModal() {
  const modal = document.getElementById('request-modal');
  if (modal) modal.style.display = 'none';
}

async function submitMovieRequest() {
  const input = document.getElementById('modal-request-input');
  const movieTitle = input ? input.value.trim() : '';

  if (!movieTitle) {
    showToast('Please enter a movie title.');
    return;
  }

  showToast(`Sending request...`);

  try {
    const formData = new FormData();
    formData.append('access_key', 'f128f943-dee1-4f4f-9f27-0290cfd380df');
    formData.append('subject', 'New Movie Request - DEYMFLIX');
    formData.append('movie_requested', movieTitle);

    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    });

    const result = await res.json();
    if (result.success) {
      showToast(`Request sent for: "${sanitizeHTML(movieTitle)}"`);
      if (input) input.value = '';
      closeRequestModal();
    } else {
      showToast('Error submitting request. Check key.');
    }
  } catch (err) {
    showToast(`Request saved locally for: "${sanitizeHTML(movieTitle)}"`);
    if (input) input.value = '';
    closeRequestModal();
  }
}

// DEVELOPER INFO MODAL
function openDeveloperInfo() {
  const modal = document.getElementById('developer-modal');
  if (modal) modal.classList.add('open');
}

function closeDeveloperInfo() {
  const modal = document.getElementById('developer-modal');
  if (modal) modal.classList.remove('open');
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeDeveloperInfo();
});

// ==========================================================
// BOTTOM NAVIGATION BAR LOGIC
// ==========================================================

// Add body class for bottom nav padding
document.body.classList.add('has-bottom-nav');

// Hide bottom nav on player and reels pages
const isPlayerOrReels = window.location.pathname.includes('player.html') || window.location.pathname.includes('reels.html');
if (isPlayerOrReels) {
  document.body.classList.remove('has-bottom-nav');
  setTimeout(() => {
    const nav = document.querySelector('.bottom-nav');
    if (nav) nav.classList.add('hidden');
  }, 100);
}

// Coming Soon Tooltip
let comingSoonTimeout = null;
function showComingSoon(e) {
  if (e) e.preventDefault();
  const tooltip = document.getElementById('coming-soon-tooltip');
  if (!tooltip) return;
  tooltip.classList.add('show');
  if (comingSoonTimeout) clearTimeout(comingSoonTimeout);
  comingSoonTimeout = setTimeout(() => tooltip.classList.remove('show'), 2500);
}

// My List Modal
function getMyList() {
  try {
    return JSON.parse(localStorage.getItem('deymflix_my_list') || '[]');
  } catch { return []; }
}

function addToMyList(movie) {
  const list = getMyList();
  if (!list.find(m => m.id === movie.id)) {
    list.unshift({ id: movie.id, title: movie.title, poster: movie.poster });
    localStorage.setItem('deymflix_my_list', JSON.stringify(list));
    showToast(`Added to Bookmarks`);
  }
}

function removeFromMyList(movieId) {
  let list = getMyList();
  list = list.filter(m => m.id !== movieId);
  localStorage.setItem('deymflix_my_list', JSON.stringify(list));
  renderMyList();
}

function openMyListModal() {
  const modal = document.getElementById('mylist-modal');
  if (!modal) return;
  renderMyList();
  modal.classList.add('show');
}

function closeMyListModal() {
  const modal = document.getElementById('mylist-modal');
  if (modal) modal.classList.remove('show');
}

function renderMyList() {
  const body = document.getElementById('mylist-modal-body');
  if (!body) return;
  const list = getMyList();
  if (list.length === 0) {
    body.innerHTML = '<div class="mylist-empty"><div class="mylist-empty-icon">🔖</div><p>Your list is empty.<br>Tap the bookmark icon on any movie to save it here.</p></div>';
    return;
  }
  body.innerHTML = '<div class="mylist-grid">' + list.map(m => `
    <div class="mylist-item" onclick="window.location.href='player.html?id=${encodeURIComponent(m.id)}'">
      <img src="${sanitizeHTML(m.poster)}" alt="${sanitizeHTML(m.title)}" loading="lazy">
      <div class="mylist-item-overlay">
        <div class="mylist-item-title">${sanitizeHTML(m.title)}</div>
      </div>
      <button class="mylist-remove-btn" onclick="event.stopPropagation(); removeFromMyList('${sanitizeHTML(m.id)}')">✕</button>
    </div>
  `).join('') + '</div>';
}

// Close My List modal on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMyListModal();
});

// Close My List modal on backdrop click
document.addEventListener('click', (e) => {
  const modal = document.getElementById('mylist-modal');
  if (modal && e.target === modal) closeMyListModal();
});

// ═══════════════════════════════════════════════════════════════
// ⚠️ DO NOT REPLACE THIS FILE WITH ONLY THIS BLOCK.
// Everything above (the `movies` catalog and every row/hero/search renderer)
// is the site. On 2026-09-24 this file was overwritten with just this app-mode
// block, which blacked out the whole site (empty hero, empty rows) until it was
// restored from the GitHub history. When changing app-mode behaviour, edit THIS
// BLOCK ONLY and leave the rest of the file untouched.
// ═══════════════════════════════════════════════════════════════
// APP-MODE EXTRAS (Android WebView only — invisible in browsers)
//
// ── PWA: service worker (offline shell + poster cache) ──
// Skipped in the Android app (its WebView already has native offline + the
// firewall); Safari/Chrome browsers get the installable, offline-capable site.
try {
  if ('serviceWorker' in navigator && !/DeymflixApp/i.test(navigator.userAgent || '')) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }
} catch (e) {}

// The Sketchware app identifies itself by appending " DeymflixApp/1.4"
// to its WebView user agent, and exposes a JS bridge named "DeymflixApp".
// Browsers never match the UA, so none of this UI ever appears for them.
//
// v160.3 CHANGES
//  - 2-arg toggleFullscreen(enter, isVideo): only the VIDEO element rotates
//    the phone landscape now (Netflix/LokLok). Page fullscreen keeps portrait.
//  - The Request nav item is REMOVED in app mode (the 6-slot bar didn't fit);
//    a "Request a Movie" button is shown at the bottom of the footer instead.
//  - Downloads nav item stays.
// ═══════════════════════════════════════════════════════════════
(function () {
  const IS_APP = /DeymflixApp/i.test(navigator.userAgent || '');
  window.DFX_IS_APP = IS_APP;
  if (!IS_APP) return;

  // v1.4g added the isVideo parameter to the bridge; old v1.4f APKs crash on
  // unknown bridge signatures, so they keep the safe 1-arg behavior.
  const APP_VG = /DeymflixApp\/1\.4g/i.test(navigator.userAgent || '');

  // Tag <html> so CSS can hide browser-only affordances (e.g. the footer
  // "Get the Android App" button makes no sense inside the app itself)
  document.documentElement.classList.add('dfx-app');

  const DL_ICON = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>';
  const REQ_ICON = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>';

  // ── 1) Bottom nav: Downloads added, Request removed (app mode only) ──
  function addDownloadsNavItem() {
    const nav = document.querySelector('.bottom-nav-items');
    if (!nav) return;
    // Request doesn't fit beside Downloads -- the footer button replaces it
    const req = nav.querySelector('[data-page="request"]');
    if (req) req.remove();
    if (!nav.querySelector('[data-page="downloads"]')) {
      const li = document.createElement('li');
      li.className = 'bottom-nav-item';
      li.setAttribute('data-page', 'downloads');
      li.innerHTML = '<span class="bottom-nav-icon">' + DL_ICON + '</span>' +
                     '<span class="bottom-nav-label">Downloads</span>';
      li.addEventListener('click', function () {
        try {
          if (window.DeymflixApp && typeof window.DeymflixApp.openDownloads === 'function') {
            window.DeymflixApp.openDownloads();
            return;
          }
        } catch (e) { /* bridge not ready -- fall through */ }
        window.location.href = 'downloads.html'; // graceful fallback inside the app
      });
      nav.appendChild(li);
    }
  }

  // ── 2) Player: Download button beside the bookmark button ──
  function getCurrentDirectVideoUrl() {
    let url = window._dfxDownloadUrl || '';
    if (!url) {
      try {
        const v = document.getElementById('main-video') || document.querySelector('video');
        url = (v && v.currentSrc) || (v && v.src) || '';
      } catch (e) { url = ''; }
    }
    if (!url || /^(blob:|data:)/i.test(url)) return '';
    if (!/^https?:/i.test(url)) return '';
    // Same-origin files (site pages, posters) are never downloads
    try {
      if (new URL(url, location.href).origin === location.origin) return '';
    } catch (e) { return ''; }
    return url;
  }

  // MANUAL DOWNLOAD LINKS (per movie/episode, optional):
  //   1) window.__dfxDownloadLink / window.__dfxDownloadSub  — set by the
  //      player for the CURRENT episode (manualDownload / manualDownloadSub
  //      on the episode object) — most specific, wins first.
  //   2) cm.manualDownload / cm.manualDownloadSub — on the movie object
  //      (or per-episode before episode stamping overwrote it).
  // Movies/series WITHOUT any manual link fall back to the embed stream
  // capture, and if that is impossible the user gets a clear
  // "cannot be downloaded" dialog.
  function getCurrentManualDownload() {
    const cm = window.__dfxCurrentMovie || null;
    let url = (typeof window.__dfxDownloadLink === 'string' && window.__dfxDownloadLink) ||
              (cm && cm.manualDownload) || '';
    let sub = (typeof window.__dfxDownloadSub === 'string' && window.__dfxDownloadSub) ||
              (cm && cm.manualDownloadSub) || '';
    if (!url || !/^https?:/i.test(url)) return null;
    return { url: url, sub: sub && /^https?:/i.test(sub) ? sub : '' };
  }

  window.requestMovieDownload = function () {
    const titleEl = document.getElementById('current-title');
    let title = (titleEl && titleEl.textContent || 'Video').trim();
    // Episode downloads must match their subtitle file ("Series ep3")
    const cm0 = window.__dfxCurrentMovie || null;
    if (cm0 && cm0._episodeNum) title += ' ep' + cm0._episodeNum;

    // 1) MANUAL LINK — always beats everything (works in episodes AND movies)
    const manual = getCurrentManualDownload();
    if (manual) {
      const qm2 = manual.url.match(/(\d{3,4})p/);
      const quality2 = qm2 ? qm2[1] + 'p' : '';
      try {
        if (window.DeymflixApp && typeof window.DeymflixApp.requestDownload === 'function') {
          window.DeymflixApp.requestDownload(manual.url, title, quality2, (cm0 && cm0.poster) || '');
          return;
        }
      } catch (e) { /* fall through to link fallback */ }
      const a2 = document.createElement('a');
      a2.href = manual.url;
      a2.rel = 'noopener';
      document.body.appendChild(a2);
      a2.click();
      a2.remove();
      return;
    }

    // 2) DIRECT FILE currently playing (CDN mp4/mkv episodes, movies)
    const url = getCurrentDirectVideoUrl();
    if (url) {
      const qm = url.match(/(\d{3,4})p/);
      const quality = qm ? qm[1] + 'p' : '';
      try {
        if (window.DeymflixApp && typeof window.DeymflixApp.requestDownload === 'function') {
          window.DeymflixApp.requestDownload(url, title, quality, (cm0 && cm0.poster) || '');
          return;
        }
      } catch (e) { /* fall through to link fallback */ }
      // Fallback: a plain navigable link -- the app's DownloadListener catches it
      const a = document.createElement('a');
      a.href = url;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
      return;
    }

    // 3) EMBED playing — IDM-style stream capture (native engine).
    // The player.html capture-phase hook already armed it + showed the
    // badge when _cosActive; only call the bridge ourselves if that hook
    // is somehow missing (avoids double "waiting for stream" toasts).
    try {
      if (window._cosActive && window.DeymflixApp &&
          typeof window.DeymflixApp.requestEmbedDownload === 'function') {
        const _dlb = document.getElementById('download-btn');
        if (!_dlb || !_dlb._cosHooked) window.DeymflixApp.requestEmbedDownload();
        return;
      }
    } catch (e) { /* fall through */ }

    // 4) Nothing downloadable — clear branded dialog instead of a silent no
    if (typeof dfxShowNoDownloadDialog === 'function') { dfxShowNoDownloadDialog(title); return; }
    showToast('This title cannot be downloaded.');
  };

  function addDownloadButton() {
    const row = document.querySelector('#video-info-box .title-actions');
    if (!row || document.getElementById('download-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'download-btn';
    btn.className = 'action-btn';
    btn.title = 'Download';
    btn.setAttribute('aria-label', 'Download');
    btn.innerHTML = DL_ICON;
    btn.addEventListener('click', window.requestMovieDownload);
    row.appendChild(btn);
  }

  // ── 3) Footer: Request-a-Movie button at the very bottom (app mode only) ──
  function addFooterRequestButton() {
    if (document.getElementById('dfx-app-request-btn')) return;
    const footer = document.querySelector('footer.site-footer');
    if (!footer) return;
    const btn = document.createElement('button');
    btn.id = 'dfx-app-request-btn';
    btn.className = 'dfx-app-request-btn';
    btn.innerHTML = REQ_ICON + '<span><strong>Request a Movie</strong>' +
      '<small>Can\'t find a title? Tell us and we\'ll add it</small></span>';
    btn.addEventListener('click', function () {
      try { if (typeof openRequestModal === 'function') { openRequestModal(); return; } } catch (e) {}
      // Modal missing on this page (player): fall back to the home page
      window.location.href = 'index.html#request';
    });
    const legal = footer.querySelector('.footer-legal');
    if (legal) footer.insertBefore(btn, legal); else footer.appendChild(btn);
  }

  function initAppOnlyUi() {
    addDownloadsNavItem();
    addFooterRequestButton();
    if (!document.querySelector('.video-container')) return; // player page only
    addDownloadButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAppOnlyUi);
  } else {
    initAppOnlyUi();
  }
  window.addEventListener('load', addFooterRequestButton);

  // ── 4) Player page: fullscreen orientation is handled by the bridge ──
  document.addEventListener('DOMContentLoaded', function () {
    if (!document.querySelector('.video-container')) return;
    try {
      if (window.DeymflixApp && typeof window.DeymflixApp.setSecure === 'function') {
        window.DeymflixApp.setSecure(false); // never blanket-block the site screens
      }
    } catch (e) {}
    if (typeof screen !== 'undefined' && screen.orientation && screen.orientation.unlock) {
      try { screen.orientation.unlock(); } catch (e) {}
    }
  });
})();

/* ══════════════════════════════════════════════════════════════════════════
   HOME POLISH — "Because you watched", poster fade-in, Android install banner
   One self-contained block: delete it and the app behaves exactly as before.
   ══════════════════════════════════════════════════════════════════════════ */

// ── Recommendation row: "Because you watched <title>" ─────────────────────
// Built purely from the watch history already stored on the device: the most
// recent title decides the genre, then the row offers same-genre titles the
// viewer has NOT already started. No API call, no account, nothing leaves the
// device — and it disappears the moment there is no history to learn from.

// The catalog carries no genre field at all (checked: 0 of 992 entries have
// one), so taste is read from the shelves that DO exist — K-drama, Tagalog PH,
// everything else — combined with rating, which nearly every entry has. That
// keeps the row working with zero network calls, so it still shows up offline
// and inside the Android app.
function dfxShelfOf(movie) {
  if (!movie) return 'movies';
  if (movie.isKdrama) return 'kdrama';
  if (movie.isFilipino) return 'filipino';
  return 'movies';
}
function dfxShelfCategoryUrl(shelf) {
  return 'category.html?type=' + (shelf === 'kdrama' ? 'kdrama' : shelf === 'filipino' ? 'tagalog' : 'all');
}

function dfxWatchedIds() {
  const ids = new Set();
  try {
    const saved = JSON.parse(localStorage.getItem('deymflix_continue_watching') || '{}');
    Object.keys(saved).forEach(k => {
      ids.add(String(k).replace(/-s\d+-ep\d+$/, '').replace(/-ep\d+$/, ''));
      if (saved[k] && saved[k].id) ids.add(String(saved[k].id));
    });
  } catch (e) {}
  return ids;
}

function renderBecauseYouWatched() {
  const wrapper = document.getElementById('home-sections-wrapper');
  const anchor = document.getElementById('continue-watching-section');
  if (!wrapper || !anchor) return;   // not the home page

  const sectionId = 'because-you-watched-section';
  const kill = () => { const s = document.getElementById(sectionId); if (s) s.remove(); };

  let saved = {};
  try { saved = JSON.parse(localStorage.getItem('deymflix_continue_watching') || '{}'); } catch (e) { return kill(); }
  const history = Object.keys(saved)
    .map(k => ({ key: k, item: saved[k] }))
    .filter(e => e.item && e.item.title)
    .sort((a, b) => (b.item.updatedAt || 0) - (a.item.updatedAt || 0));
  if (!history.length || typeof movies === 'undefined') return kill();

  // The most recently watched title is the seed.
  const baseId = String(history[0].key).replace(/-s\d+-ep\d+$/, '').replace(/-ep\d+$/, '');
  const seed = movies.find(m => m.id === baseId)
    || movies.find(m => m.id === history[0].item.id)
    || movies.find(m => m.title === history[0].item.title);
  if (!seed) return kill();
  // Same shelf as the seed, best rated first (tie-break: newest), minus
  // anything already started and minus anything without artwork.
  const shelf = dfxShelfOf(seed);
  const watched = dfxWatchedIds();
  const picks = movies
    .filter(m => m && m.id !== seed.id && !watched.has(String(m.id)) && m.poster
      && Number(m.rating) > 0 && dfxShelfOf(m) === shelf)
    .sort((a, b) => (Number(b.rating) - Number(a.rating)) || (dfxReleaseTimestamp(b) - dfxReleaseTimestamp(a)))
    .slice(0, 12);
  if (picks.length < 4) return kill();   // too few to look like a real row

  let section = document.getElementById(sectionId);
  if (!section) {
    section = document.createElement('section');
    section.className = 'content-section';
    section.id = sectionId;
    anchor.insertAdjacentElement('afterend', section);
  }
  // textContent for the title: the movie name is user data, never HTML
  const moreUrl = dfxShelfCategoryUrl(shelf);
  section.innerHTML =
    '<div class="section-header-flex"><h2 class="section-header-title"></h2>' +
    '<a class="see-all-link" href="' + moreUrl + '">View All ❯</a></div>' +
    '<div class="horizontal-scroll" id="because-you-watched-container"></div>';
  section.querySelector('.section-header-title').textContent = 'Because you watched ' + seed.title;

  const container = document.getElementById('because-you-watched-container');
  container.innerHTML = '';
  picks.forEach(movie => container.appendChild(createMovieCard(movie)));
  if (typeof HOVER_PREVIEW !== 'undefined' && HOVER_PREVIEW.refresh) {
    setTimeout(() => HOVER_PREVIEW.refresh(), 120);
  }
}

// ── Poster fade-in ────────────────────────────────────────────────────────
// Cards shimmer (theme-v2.css §14) until their artwork arrives, then the image
// fades in over the shimmer. One observer covers every grid on every page, so
// nothing needs to be wired up per renderer. A failed image is revealed too —
// a poster must never stay invisible.
(function dfxPosterFadeIn() {
  const SEL = '.poster-card img, .reel-thumb-card img, .explore-card img, .mylist-item img, .top-picks-scroll img, .horizontal-scroll img';
  const ready = (img) => { try { img.classList.add('is-ready'); } catch (e) {} };
  function wire(img) {
    if (!img || img.tagName !== 'IMG' || img._dfxWired) return;
    img._dfxWired = true;
    if (img.complete && img.naturalWidth) return ready(img);   // already cached
    img.addEventListener('load', () => ready(img), { once: true });
    img.addEventListener('error', () => ready(img), { once: true });
  }
  function scan(node) {
    if (!node || node.nodeType !== 1) return;
    if (node.tagName === 'IMG' && node.matches && node.matches(SEL)) wire(node);
    if (node.querySelectorAll) node.querySelectorAll(SEL).forEach(wire);
  }
  try {
    new MutationObserver((muts) => {
      for (const m of muts) for (const n of m.addedNodes) scan(n);
    }).observe(document.documentElement, { childList: true, subtree: true });
    const boot = () => scan(document.body);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
    // Safety net: a cached image inserted mid-render can finish before its
    // listener exists. Sweep for anything wired but not yet revealed, and stop
    // after a minute — a poster must never be able to stay hidden.
    let sweeps = 0;
    const sweep = setInterval(() => {
      document.querySelectorAll('img').forEach((img) => {
        if (img._dfxWired && !img.classList.contains('is-ready') && img.complete && img.naturalWidth) ready(img);
      });
      if (++sweeps > 30) clearInterval(sweep);
    }, 2000);
  } catch (e) {}
})();

// ── Android install banner ────────────────────────────────────────────────
// The site has been installable for a while (manifest + service worker) but the
// browser's own prompt was never surfaced. This shows a small brand bar when
// Chrome offers the install, and steps aside everywhere it does not belong:
// inside the native app (its WebView appends "DeymflixApp" to the user agent),
// once the app is already installed, and after the user dismisses it.
(function dfxInstallBanner() {
  const KEY = 'dfx_install_dismissed';
  const inApp = /DeymflixApp/i.test(navigator.userAgent) || !!window.DeymflixApp;
  const standalone = (function () {
    try { return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true; } catch (e) { return false; }
  })();
  const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if (inApp || standalone || window.top !== window.self) return;
  try { if (localStorage.getItem(KEY) === '1') return; } catch (e) {}

  let deferred = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e;
    show();
  });

  let built = false;
  function show() {
    if (built || !document.body) return;
    built = true;
    const bar = document.createElement('div');
    bar.id = 'dfx-install-banner';
    bar.innerHTML =
      '<img src="icons/icon-192.png?v=2" alt="" width="38" height="38">' +
      '<div class="dfx-ib-text"><strong>Install DEYMFLIX</strong>' +
      '<span>' + (deferred ? 'Full screen, faster, works offline.' : 'Tap Share, then \u201cAdd to Home Screen\u201d.') + '</span></div>' +
      '<button class="dfx-ib-go" type="button">' + (deferred ? 'Install' : 'Got it') + '</button>' +
      '<button class="dfx-ib-x" type="button" aria-label="Dismiss">&times;</button>';
    document.body.appendChild(bar);
    bar.querySelector('.dfx-ib-go').addEventListener('click', async () => {
      if (deferred && deferred.prompt) {
        try { deferred.prompt(); await deferred.userChoice; } catch (e) {}
        deferred = null;
      }
      close(bar);
    });
    bar.querySelector('.dfx-ib-x').addEventListener('click', () => {
      try { localStorage.setItem(KEY, '1'); } catch (e) {}
      close(bar);
    });
    requestAnimationFrame(() => bar.classList.add('show'));
  }
  function close(bar) {
    bar.classList.remove('show');
    setTimeout(() => { try { bar.remove(); } catch (e) {} }, 260);
  }
  // iOS never fires beforeinstallprompt, so offer the manual route there.
  window.addEventListener('load', () => { if (isiOS) setTimeout(show, 5000); });
})();
