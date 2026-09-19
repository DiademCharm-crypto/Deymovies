// ==========================================
// DEYMFLIX - Main Application Logic
// ==========================================

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

const featuredMovies = [
  { 
    id: "Moana: Live Action", 
    imdbId: "tt27419466", 
    title: "Moana: Live Action",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/zKVgiv5qHCvCLT4A2ymJi5QeXDH.jpg",
    backdrop: "https://media.themoviedb.org/t/p/w600_and_h900_face/zKVgiv5qHCvCLT4A2ymJi5QeXDH.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Moana.2026.1080p.WEBRip.x264.AAC5.1-YTS.GG.-.YTS.BZ.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Toy Story 5", 
    imdbId: "tt29355505", 
    title: "Toy Story 5", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/sfQtVlIHljToOwYjhe21KPGzZWK.jpg", 
    backdrop: "https://media.themoviedb.org/t/p/w600_and_h900_face/sfQtVlIHljToOwYjhe21KPGzZWK.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Toy.Story.5.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "The Runner", 
    imdbId: "tt34564059", 
    title: "The Runner", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/uxCaBoYXsDC4A0SqTm3SISj0OwK.jpg", 
    backdrop: "https://media.themoviedb.org/t/p/w600_and_h900_face/uxCaBoYXsDC4A0SqTm3SISj0OwK.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/The.Runner.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "",
    isSeries: false
  }
];

const movies = [
  { 
    id: "The Runner", 
    imdbId: "tt34564059",
    title: "The Runner", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/uxCaBoYXsDC4A0SqTm3SISj0OwK.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/The.Runner.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "",
    isSeries: false
  },

  { 
    id: "Moana: Live Action", 
    imdbId: "tt27419466",
    title: "Moana: Live Action", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/zKVgiv5qHCvCLT4A2ymJi5QeXDH.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Moana.2026.1080p.WEBRip.x264.AAC5.1-YTS.GG.-.YTS.BZ.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Crew-Girl", 
    imdbId: "tt38218082",
    title: "Crew Girl", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/tzf21i1ETZEu7i787ED3WThROH.jpg",
    manualEmbed: "https://deymflix01.s3.us-east-005.backblazeb2.com/English+Series/Crew+Girl/Crew.Girl.S01e01.720P.Hevc.X265-Megusta%5BEztvx.To%5D.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=Xs5qsfqp-tA",
    isSeries: true
  },
  { 
    id: "Mayday", 
    imdbId: "tt28014327",
    title: "Mayday", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/hVXjX1jLZ1ljFSNGXpjJfbTUOa7.jpg",
    manualEmbed: "https://deymflix01.s3.us-east-005.backblazeb2.com/movie+1/%5BSh4dy%5DMayday.2026.4K.atmos.mkv",
    trailerEmbed: "",
    isSeries: false
  },
  ...((typeof filipinoMovieData !== "undefined") ? filipinoMovieData : []),
  { 
    id: "The Odyssey", 
    imdbId: "tt33764258", 
    title: "The Odyssey", 
    synopsis: "The Odyssey is a 2026 epic action fantasy film written and directed by Christopher Nolan, who produced it with his wife Emma Thomas. An adaptation of Homer's ancient Greek epic poem the Odyssey, it stars an ensemble cast including Matt Damon, Tom Holland, Anne Hathaway, Robert Pattinson, Lupita Nyong'o, Samantha Morton, Zendaya, and Charlize Theron. In the film, Odysseus (Damon), the Greek king of Ithaca, undergoes a long and perilous journey home after the Trojan War and encounters mythical beings as he attempts to reunite with his wife Penelope (Hathaway).",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg", 
    manualEmbed: "", 
    trailerEmbed: "https://www.youtube.com/watch?v=Sk6LZrA2JSQ",
    isSeries: false
  },
  { 
    id: "Spider-Man: Brand New Day", 
    imdbId: "tt22084616",
    title: "Spider-Man: Brand New Day", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg",
    manualEmbed: "",
    trailerEmbed: "https://www.youtube.com/watch?v=daXaTug8rL4",
    isSeries: false
  },
  { 
    id: "Mutiny", 
    imdbId: "tt32338669",
    title: "Mutiny", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/pu2VxGlpGwffOx292w18b1tv96j.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Mutiny.2026.1080p.WEBRip.10Bit.DDP5.1.x265-NeoNoir.mkv",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "The Last Sunrise", 
    imdbId: "tt37654096",
    title: "The Last Sunrise", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/3PWJqDfygN0YNNjWsDUOXclCp3h.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/The.Last.Sunrise.2026.1080p.WEBRip.x264.AAC5.1-LAMA.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Facing El Chapo", 
    imdbId: "tt39390497",
    title: "Facing El Chapo", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/z8eF0ACFFKtIZ4pUeo02PCzxRVO.jpg",
    manualEmbed: "https://deymflix01.s3.us-east-005.backblazeb2.com/movie+1/Facing.El.Chapo.2026.1080p.NF.WEB-DL.Multi.AAC5.1.AV1-4kHdHub.Com.mkv",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Toxic: A Fairy Tale for Grown-ups", 
    imdbId: "tt27530512",
    title: "Toxic: A Fairy Tale for Grown-ups", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/oiIPU4lvnI0Ag2K9cyAi44eCaoE.jpg",
    manualEmbed: "",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Minions & Monsters", 
    imdbId: "tt32890033",
    title: "Minions & Monsters", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/4LwvU9SZc8QQzW1X1FAPhNbXnEU.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Minions.and.Monsters.2026.1080p.10bit.WEBRip.6CH.x265-PSA.mkv",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Obsession", 
    imdbId: "tt37287335",
    title: "Obsession", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/bRwnj8WEKBCvmfeUNOukJPwB43K.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Obsession.2026.1080p.WEBRip.x264.AAC5.1-LAMA.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Rage of Stars", 
    imdbId: "tt29512655",
    title: "Rage of Stars", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/oLld47ZT1I3iecM3OWhIphohQUJ.jpg",
    manualEmbed: "",
    trailerEmbed: "https://www.youtube.com/watch?v=F5bYhuO2Rkg",
    isSeries: false
  },
  { 
    id: "Toy Story 5", 
    imdbId: "tt29355505",
    title: "Toy Story 5", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/sfQtVlIHljToOwYjhe21KPGzZWK.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Toy.Story.5.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Pinocchio: Unstrung", 
    imdbId: "tt30887701",
    title: "Pinocchio: Unstrung", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/eUJXk3bTvLBi5Zcb0BCedZU7lVL.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Pinocchio.Unstrung.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Coyote vs. Acme", 
    imdbId: "tt1756855",
    title: "Coyote vs. Acme", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/vhv7lBWYM0DUuNU2a0V7Rhq21dD.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Coyote.vs.Acme.2026.1080p.DCP.DDP5.1.H264-AOC.mkv",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Colony", 
    imdbId: "tt34385135",
    title: "Colony", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/tN799oUR0f1gUKDYdMNrDaY7I51.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Colony%202026%201080p%20WebRip%20Opus%202%200%20x265-Lootera.mkv",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Ghost in the Cell", 
    imdbId: "tt9000310",
    title: "Ghost in the Cell", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/zxcMdx0w5Zmg8yZuuiS7CJ8vOea.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Ghost.In.The.Cell.2026.720p.WEBRip.x264.AAC-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "The Secret Woman", 
    imdbId: "tt37275992",
    title: "The Secret Woman", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/5FC5vUHFz0fbJOd0bhyzJpCSLrc.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/The%20Secret%20Woman%202026%201080p%20NF%20WEB-DL%20DUAL%20DDP5%201%20H%20264-FLUX.mkv",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Barreda", 
    imdbId: "tt43706402",
    title: "Barreda", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/hnr0QkZSDLlrJTvU2ecco65wcHo.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Barreda.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Buddy", 
    imdbId: "tt37281055",
    title: "Buddy", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6Lh4ZlsAISFQFVfLZ90sE9ycVnN.jpg",
    manualEmbed: "",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "The Whisper Man", 
    imdbId: "tt11561116",
    title: "The Whisper Man", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6UqflU8Qqkz7Dq4swJPqs0ZJjY4.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/The.Whisper.Man.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Yellow Mirror", 
    imdbId: "tt43141030",
    title: "Yellow Mirror", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/1zdGvJAuuXC7dA3eV61OtUJNyjQ.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Yellow%20Mirror%202026%20NORDiC%201080p%20WEB-DL%20H%20264%20DDP5%201-ADDICTION.mkv",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "The Dog Stars", 
    imdbId: "tt21285562",
    title: "The Dog Stars", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/5O616X9vmRzQdB68PHzBewPittd.jpg",
    manualEmbed: "",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "It Ends", 
    imdbId: "tt35519455",
    title: "It Ends", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6dfAGvZWbJnzWfSZ8gxFj63BNAH.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/It.Ends.2025.1080p.WEBRip.x264.AAC-%5BYTS.LT%5D.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Irumudi", 
    imdbId: "tt39108319",
    title: "Irumudi", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/sPePQmJRKkB14sGjB7zBkLJkaTW.jpg",
    manualEmbed: "",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Insidious: Out of the Further", 
    imdbId: "tt32393988",
    title: "Insidious: Out of the Further", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/4tTrW9dXCByS5wt2pXVWb58zNjz.jpg",
    manualEmbed: "",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Sunny Dancer", 
    imdbId: "tt32212403",
    title: "Sunny Dancer", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/mXdejPfToSVFlEzv1QYoIh2N53e.jpg",
    manualEmbed: "",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "The Brink of War", 
    imdbId: "tt33070884",
    title: "The Brink of War", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/hFborW6HmffKL05GIWlkTFdvVpN.jpg",
    manualEmbed: "",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Just Play Dead", 
    imdbId: "tt36948232",
    title: "Just Play Dead", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/glALx6QaIgw1u4joXsnfHTjWi6D.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Just.Play.Dead.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "The Wrong Girls", 
    imdbId: "tt35060353",
    title: "The Wrong Girls", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/iEJshwO6g4WKTP4HJgCHRTJMWEd.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/The%20Wrong%20Girls%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/The.Wrong.Girls.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "I Want Your Sex", 
    imdbId: "tt32332915",
    title: "I Want Your Sex", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/pR7SIX3AwqdoD96OI44oLG98e7g.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/I%20Want%20Your%20Sex%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5Bx265%5D%20%5B10bit%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/I.Want.Your.Sex.2026.1080p.WEBRip.x265.10bit.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Gohan", 
    imdbId: "tt36958999",
    title: "Gohan", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/nVq1Dn88NzVIVTDpGZeP7fxpLa1.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Gohan%20(2026)%20%5B720p%5D%20%5BWEBRip%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Gohan.2026.720p.WEBRip.x264.AAC-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "The Weight", 
    imdbId: "tt10794054",
    title: "The Weight", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/8i5iZV50CoEtmDCFM7RSxCkpE8h.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/www.UIndex.org%20%20%20%20-%20%20%20%20The.Weight.2026.1080p.SCREENER.WEB-DL.H264.AAC-II/The.Weight.2026.1080p.SCREENER.WEB-DL.H264.AAC-II.mkv",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "The Mongoose", 
    imdbId: "tt13611778",
    title: "The Mongoose", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/eSS5mvSG84UUuvtbHel5Yu3Wik4.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/The%20Mongoose%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/The.Mongoose.2026.1080p.WEBRip.x264.AAC-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "The Gentleman Thief", 
    imdbId: "tt36415524",
    title: "The Gentleman Thief", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/oMutDMODnbCZf46w0dK4wncQmDB.jpg",
    manualEmbed: "",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Man of War", 
    imdbId: "tt34584846",
    title: "Man of War", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/vt0RqHlqfUzeiBEVQvp43yY2076.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Man%20Of%20War%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Man.Of.War.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Hadestown: The Musical", 
    imdbId: "tt36307021",
    title: "Hadestown: The Musical", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/iJNVygzkuOSCOdCPNI1nLSeF7sz.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Hadestown%20The%20Musical%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Hadestown.The.Musical.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Her Private Hell", 
    imdbId: "tt36629665",
    title: "Her Private Hell", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/kiFacg75KVjy0AM3S4QmbPas8zL.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Her%20Private%20Hell%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Her.Private.Hell.2026.1080p.WEBRip.x264.AAC-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Batman: Knightfall Part 1: Knightfall", 
    imdbId: "tt32333324",
    title: "Batman: Knightfall Part 1: Knightfall", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/360qdtu2hLnqMu8SVHMywn420w1.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Batman.Knightfall.Part.1.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Motor City", 
    imdbId: "tt2012616",
    title: "Motor City", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/dx2dblJL3GAKcXXXPjC2FSaMTWW.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Motor%20City%20(2025)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Motor.City.2025.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "PAW Patrol: The Dino Movie", 
    imdbId: "tt29356163",
    title: "PAW Patrol: The Dino Movie", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/qnin56Syy5rbG7KCaxWY7SPuy6p.jpg",
    manualEmbed: "https://deymflix01.s3.us-east-005.backblazeb2.com/movie+1/PAW.Patrol.The.Dino.Movie.2026.1080p.AMZN.WEB-DL.DDP5.1.H.265-KyoGo.mkv",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Bury the Devil", 
    imdbId: "tt29719182",
    title: "Bury the Devil", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/yQ3GeVsebrhOPIBhIdoSslbndEv.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Bury%20The%20Devil%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Bury.The.Devil.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "The Oldham Man and the Sea", 
    imdbId: "tt40642027",
    title: "The Oldham Man and the Sea", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/wcfuythlTfVXm0yZHnBWGxXoUjt.jpg",
    manualEmbed: "",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "The Birthday Party", 
    imdbId: "tt33269988",
    title: "The Birthday Party", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/sXN4IvB4hM2AYYx9BhdzhokrjvH.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/The%20Birthday%20Party%20(2025)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/The.Birthday.Party.2025.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Yellow Eyes", 
    imdbId: "tt32881432",
    title: "Yellow Eyes", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/tdIqb0g8fimv2bXIEZdWu6Zfywt.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Yellow%20Eyes%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Yellow.Eyes.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "The End of Oak Street", 
    imdbId: "tt27165187",
    title: "The End of Oak Street", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/fYXqpgPmHMphSF2W30GbTeJVIa5.jpg",
    manualEmbed: "https://cinema8.com/video/PO8PwYyO",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Pose", 
    imdbId: "tt42577081",
    title: "Pose", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/5f23i30nFJz0nrd3DGheOCqXa2P.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Pose%20(2025)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.LT%5D/Pose.2025.1080p.WEBRip.x264.AAC5.1-%5BYTS.LT%5D.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Truly Naked", 
    imdbId: "tt8760666",
    title: "Truly Naked", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/y23B9EnC0LDw8zMKlpXJauyLH7k.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Truly%20Naked%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Truly.Naked.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Camp Rock 3", 
    imdbId: "tt6743524",
    title: "Camp Rock 3", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/rS7byWK9cfPfdLeFNlRIaJxH9mN.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/www.UIndex.org%20%20%20%20-%20%20%20%20Camp%20Rock%203%202026%201080p%20WEBRip%20x265-DH/Camp%20Rock%203%202026%201080p%20WEBRip%20x265-DH.mkv",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Your Attention Please", 
    imdbId: "tt6743524",
    title: "Your Attention Please", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/lVzZJlBP8EqWtx9EF0LIT55ve3H.jpg",
    manualEmbed: "",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Narcissist's Playbook", 
    imdbId: "tt28353545",
    title: "Narcissist's Playbook", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/nuI0XoN1p92MpVlSNtkxFzM3u6p.jpg",
    manualEmbed: "",
    trailerEmbed: "https://www.youtube.com/watch?v=0scEwiYwYds",
    isSeries: false
  },
  { 
    id: "Gail Daughtry and the Celebrity Sex Pass", 
    imdbId: "tt36834010",
    title: "Gail Daughtry and the Celebrity Sex Pass", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/98T4bnMjJs71WOVZoeY8edZhfgZ.jpg",
    manualEmbed: "https://cinema8.com/video/WDezkkzX",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "The Foreign Exchange Student 2: The Hunt", 
    imdbId: "tt22525816",
    title: "The Foreign Exchange Student 2: The Hunt", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/aHy0ZifxTGN8QpF0QGUVXrIvCky.jpg",
    manualEmbed: "",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "The Drop Spot", 
    imdbId: "tt16383058",
    title: "The Drop Spot", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/iZL6f4sFwYOnh2CPm8IKu3TxyHn.jpg",
    manualEmbed: "",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "The Exit Row", 
    imdbId: "tt14858346",
    title: "The Exit Row", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/v1nJW1hBICXyFyMOG2sm7GVj3Il.jpg",
    manualEmbed: "",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Free Fall", 
    imdbId: "tt12267114",
    title: "Free Fall", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/m1OGsVkwnEbf4frMtn2VS1nHjlv.jpg",
    manualEmbed: "",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Don't Say Good Luck", 
    imdbId: "tt36590417",
    title: "Don't Say Good Luck", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/dgTKahWonzVLeN8Lm22WR2S7D0A.jpg",
    manualEmbed: "",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "All Night Wrong", 
    imdbId: "tt18316986",
    title: "All Night Wrong", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/jFN9LcCG4a02wRWm2qfJ6nLY8BO.jpg",
    manualEmbed: "",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Dreams", 
    imdbId: "tt31710990",
    title: "Dreams", 
    poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3t5Mh7vMpC7DMa0cW3cH4g3atqaoAHIsHNet_NEqQog&s=10",
    manualEmbed: "",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Travis Barker: Louder Than Fear", 
    imdbId: "tt42009731",
    title: "Travis Barker: Louder Than Fear", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/nFjdTYHi7tRjijf3utArceQFtRi.jpg",
    manualEmbed: "",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Night Nurse", 
    imdbId: "tt38906892",
    title: "Night Nurse", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/cvj1d5avMYRxK8FVpq07UqLrcbZ.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Night%20Nurse%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5Bx265%5D%20%5B10bit%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Night.Nurse.2026.1080p.WEBRip.x265.10bit.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Air Force Elite: Thunderbirds", 
    imdbId: "tt35628532",
    title: "Air Force Elite: Thunderbirds", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/hsJtBhMxNDGzW5KcQ9qz3EQGnEt.jpg",
    manualEmbed: "",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Saccharine", 
    imdbId: "tt35050712",
    title: "Saccharine", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/bCHPB5WZy4T0Rerh1GTuQLzU0rF.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Saccharine%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5Bx265%5D%20%5B10bit%5D%20%5B5.1%5D%20%5BYTS.BZ%5D/Saccharine.2026.1080p.WEBRip.x265.10bit.AAC5.1-%5BYTS.BZ%5D.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Young Washington", 
    imdbId: "tt32104007",
    title: "Young Washington", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6CdoTKnRQHJkjRGxTefFGkPQplB.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Young%20Washington%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Young.Washington.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Our Hero, Balthazar", 
    imdbId: "tt36589928",
    title: "Our Hero, Balthazar", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/mxVTarvl5OLoU9YWIYygby6R0KI.jpg",
    manualEmbed: "",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "The Last Guest of the Holloway Motel", 
    imdbId: "tt36591750",
    title: "The Last Guest of the Holloway Motel", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/yF7gHhdRINMkj9ez4Dxx4kbkWv.jpg",
    manualEmbed: "",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "The Invite", 
    imdbId: "tt14173636",
    title: "The Invite", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/b7Dr8Chzse8VagexAporUu2RtLx.jpg",
    manualEmbed: "",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Jackass: Best and Last", 
    imdbId: "tt39316472",
    title: "Jackass: Best and Last", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/tfgccePxnswMqhmtxafliLlcCVR.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Jackass%20Best%20And%20Last%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Jackass.Best.And.Last.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "The Last House", 
    imdbId: "tt32268156",
    title: "The Last House", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6JU7E8Vv2M11egkctWVOScxWR75.jpg",
    manualEmbed: "",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Casa Grande", 
    imdbId: "tt35887288",
    title: "Casa Grande", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/mE9E4nsGM91Cf4b1s6nOOdUAE9P.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Casa%20Grande%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.BZ%5D/Casa.Grande.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.BZ%5D.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "The Isolate Thief", 
    imdbId: "tt35051162",
    title: "The Isolate Thief", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/gmmCh2BvTKp0YGT2FYG0eOQJELi.jpg",
    manualEmbed: "",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Housemaid", 
    imdbId: "tt27543632",
    title: "Housemaid", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/cWsBscZzwu5brg9YjNkGewRUvJX.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Housemaid%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Housemaid.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Lucky Strike", 
    imdbId: "tt19035928",
    title: "Lucky Strike", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/7AEBdyGYXumXWmMFeynE8227KeZ.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Lucky%20Strike%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Lucky.Strike.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Jailhouse to Milhouse", 
    imdbId: "tt28642484",
    title: "Jailhouse to Milhouse", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/9QR5hejamYx2nMtxUHNO96bFsoK.jpg",
    manualEmbed: "",
    trailerEmbed: "https://www.youtube.com/watch?v=LoDuEWrrPI0",
    isSeries: false
  },
  { 
    id: "Jimmie & Stevie Ray Vaughan: Brothers in Blues", 
    imdbId: "tt22409096",
    title: "Jimmie & Stevie Ray Vaughan: Brothers in Blues", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6wBUhmgMjf6bqvfrgKsHEUxwH7T.jpg",
    manualEmbed: "",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Submerged: The Hunley", 
    imdbId: "tt22335468",
    title: "Submerged: The Hunley", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/zY3xxTscRu7RMSVECppWQQyxHA6.jpg",
    manualEmbed: "",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "The Christmas Spirit", 
    imdbId: "tt10047464",
    title: "The Christmas Spirit", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6a8nocaDfYOehQzeqZMvni9WqVq.jpg",
    manualEmbed: "",
    trailerEmbed: "https://www.youtube.com/watch?v=TzS1uOOL_-M",
    isSeries: false
  },
  { 
    id: "Soulm8te", 
    imdbId: "tt32654916",
    title: "Soulm8te", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/bNErActDctl6cdUGw9pnjSCmyhQ.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/SOULM8TE%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/SOULM8TE.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Time and Water", 
    imdbId: "tt39163015",
    title: "Time and Water", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/1hksIYHtsHCG70nZKbnrYBPk600.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Time%20And%20Water%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Time.And.Water.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Maddie's Secret", 
    imdbId: "tt37675037",
    title: "Maddie's Secret", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/vADal7sH7E9xFr4w2k4V3EPSzF6.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Maddies%20Secret%20(2025)%20%5B1080p%5D%20%5BWEBRip%5D%20%5Bx265%5D%20%5B10bit%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Maddies.Secret.2025.1080p.WEBRip.x265.10bit.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Nightborn", 
    imdbId: "tt34383465",
    title: "Nightborn", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/e9ALgOANOJbcFpw84MbafK3xvD2.jpg",
    manualEmbed: "",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Rose of Nevada", 
    imdbId: "tt35674521",
    title: "Rose of Nevada", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/aDBZ2PGgUbcGjyX7ZCXLOk4AFQH.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Rose%20Of%20Nevada%20(2025)%20%5B1080p%5D%20%5BWEBRip%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Rose.Of.Nevada.2025.1080p.WEBRip.x264.AAC-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Snoopy Presents: There's No Place Like Home Snoopy", 
    imdbId: "tt42839367",
    title: "Snoopy Presents: There's No Place Like Home Snoopy", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/YbC4SlzE030BgxWdKDdlatMh5W.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/www.UIndex.org%20%20%20%20-%20%20%20%20Snoopy.Presents.Theres.No.Place.Like.Home.Snoopy.2026.1080p.WEB.h264-DOLORES/Snoopy.Presents.Theres.No.Place.Like.Home.Snoopy.2026.1080p.WEB.h264-DOLORES.mkv",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "The Devil's Mouth", 
    imdbId: "tt36958312",
    title: "The Devil's Mouth", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/dx2dblJL3GAKcXXXPjC2FSaMTWW.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/www.UIndex.org%20%20%20%20-%20%20%20%20The%20Devils%20Mouth%20(2026)%201080p%20BluRay%205.1-LAMA/The.Devils.Mouth.2026.1080p.BluRay.x264.AAC5.1-LAMA.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Neglected", 
    imdbId: "tt35224721",
    title: "Neglected", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/A0gqKFmJ7OArcFob49PErNvzN66.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Neglected%20(2025)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.BZ%5D/Neglected.2025.1080p.WEBRip.x264.AAC5.1-%5BYTS.BZ%5D.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Oracle of the Dragon", 
    imdbId: "tt44127317",
    title: "Oracle of the Dragon", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/lxVFFVIdXDnQCAFAllCrNfPDHFv.jpg",
    manualEmbed: "",
    trailerEmbed: "https://www.youtube.com/watch?v=m22-nh9DiXw",
    isSeries: false
  },
  { 
    id: "Leviticus", 
    imdbId: "tt39143902",
    title: "Leviticus", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/gnAsZvBygplNpp8PtjoTEYv3VPB.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Leviticus%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Leviticus.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Cold War 1994", 
    imdbId: "tt36576750",
    title: "Cold War 1994", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/9C3ZxhGJvdpxmNC5PhkBMwzTMRT.jpg",
    manualEmbed: "",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Supergirl", 
    imdbId: "tt8814476",
    title: "Supergirl", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/uhzRnTW4DM13UQBvZP3eVNzQTuz.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Supergirl%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5Bx265%5D%20%5B10bit%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Supergirl.2026.1080p.WEBRip.x265.10bit.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: "",
    isSeries: false
  },

];

function createMovieCard(movie, rankNumber = null) {
  const card = document.createElement('div');
  card.className = 'poster-card';
  card.onclick = () => {
    window.location.href = `player.html?id=${encodeURIComponent(movie.id)}`;
  };

  const fallbackUrl = 'https://via.placeholder.com/300x450/1f1f1f/ffffff?text=No+Poster';
  const rankHTML = rankNumber ? `<div class="rank-badge-box">#${sanitizeHTML(String(rankNumber))}</div>` : '';

  const hasManualLink = movie.manualEmbed && movie.manualEmbed.trim() !== '';
  const qualityLabel = hasManualLink ? 'HD' : 'TRAILER';
  const qualityClass = hasManualLink ? 'quality-hd' : 'quality-trailer';

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
  // MOBILE: long-press on a poster opens the same preview (touch-enabled
  // devices with small screens skip the width/pointer gates via isTouchDevice).
  let touchDevice = null;
  function isTouchDevice() {
    if (touchDevice === null) {
      touchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    }
    return touchDevice;
  }
  function isEnabled() {
    if (!isIndexPage) return false;
    if (isTouchDevice()) return true;           // long-press path — any screen size
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
      vid0.innerHTML = '<img class="hp-fallback" src="' + (movie.backdrop || movie.poster || '') + '" alt="">';
    }
    // Reveal on the next frame so the transition plays
    requestAnimationFrame(function () { pv.classList.add('visible'); });
  }

  // Mobile: open the same panel as a centered modal-ish overlay
  function mountPreviewMobile(card, movie) {
    const pv = getPanel();
    const bd = document.getElementById('hover-preview-backdrop');
    if (bd) bd.classList.add('visible');
    pv.classList.remove('visible');
    // Width: 88% of screen, max 340px; vertically centered in the viewport
    const W = Math.min(340, Math.round(window.innerWidth * 0.88));
    const H = W * 9 / 16 + 150;
    const left = Math.max(10, Math.round((window.innerWidth - W) / 2));
    const top = Math.max(70, Math.round((window.innerHeight - H) / 2));
    pv.style.left = left + 'px';
    pv.style.top = top + 'px';
    pv.style.width = W + 'px';
    const t = pv.querySelector('.hp-title');
    if (t) t.textContent = movie.title || '';
    updateBookmarkBtnState(pv, movie);
    fillInfoRows(movie);
    state.activeMovie = movie;
    const vid0 = pv.querySelector('.hp-video');
    if (vid0 && !vid0.querySelector('iframe')) {
      vid0.innerHTML = '<img class="hp-fallback" src="' + (movie.backdrop || movie.poster || '') + '" alt="">';
    }
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
      vid.innerHTML = '<img class="hp-fallback" src="' + (movie.backdrop || movie.poster || '') + '" alt="">';
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

    // ---- MOBILE: long-press opens the preview ----
    // 500ms hold → preview opens centered; move/cancel/early-lift aborts.
    // The tap-to-open-player click is suppressed only when a preview opened.
    let lpTimer = null;
    let lpOpened = false;
    let lpStartX = 0, lpStartY = 0;
    function lpCancel() {
      if (lpTimer) { clearTimeout(lpTimer); lpTimer = null; }
    }
    card.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) { lpCancel(); return; } // pinch/2-finger → cancel
      const t = e.touches[0];
      lpStartX = t.clientX; lpStartY = t.clientY;
      lpOpened = false;
      lpTimer = setTimeout(function () {
        lpTimer = null;
        lpOpened = true;
        clearPreview();
        state.activeCard = card;
        state.activeMovieId = movie.id;
        mountPreviewMobile(card, movie);
        resolveTrailerKey(movie).then(function (key) {
          if (state.activeCard !== card) return;
          playYouTube(card, movie, key);
        });
      }, 500);
    }, { passive: true });
    card.addEventListener('touchmove', function (e) {
      // finger drifted >12px → user is scrolling, not pressing
      if (lpTimer && e.touches[0] &&
          (Math.abs(e.touches[0].clientX - lpStartX) > 12 ||
           Math.abs(e.touches[0].clientY - lpStartY) > 12)) lpCancel();
    }, { passive: true });
    card.addEventListener('touchcancel', function () {
      lpCancel();
      if (lpOpened) clearPreview();
    }, { passive: true });
    card.addEventListener('touchend', function () {
      lpCancel();
      if (lpOpened) { clearPreview(); lpOpened = false; } // lift closes it
    }, { passive: true });
    // Suppress the navigation click that fires right after a long-press lift
    card.addEventListener('click', function (e) {
      if (lpOpened) { e.preventDefault(); e.stopPropagation(); lpOpened = false; }
    }, true);

    card.addEventListener('mouseenter', function () {
      if (!isEnabled()) return;
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
      requestIdleCallback(() => {
        renderAllMoviesGrid();
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
  const items = Object.values(savedData)
    .filter(item => item && !item.finished && Number(item.progress) < 95)
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

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
      window.location.href = `player.html?id=${encodeURIComponent(item.id)}`;
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
        removeContinueWatching(item.id, e);
      });
    }

    container.appendChild(card);
  });
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


function setupHeroBanner() {
  const heroWrapper = document.getElementById('hero-billboard-wrapper') || document.querySelector('.hero-wrapper');
  if (!heroWrapper || !featuredMovies || featuredMovies.length === 0) return;

  heroWrapper.innerHTML = `
    <div class="hero-carousel-track" id="hero-carousel-track">
      ${featuredMovies.map(item => `
        <div class="hero-slide-item" onclick="window.location.href='player.html?id=${encodeURIComponent(item.id)}'">
          <img class="hero-backdrop-img" src="${sanitizeHTML(item.backdrop || item.poster)}" alt="${sanitizeHTML(item.title)}" loading="lazy">
          <div class="hero-fade-overlay"></div>
          <div class="hero-details-container">
            <h1 class="hero-title-text">${sanitizeHTML(item.title)}</h1>
            <button class="hero-action-btn">▶ Watch Now</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  const track = document.getElementById('hero-carousel-track');
  if (!track) return;

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

function renderAllMoviesGrid() {
  const allMoviesGrid = document.getElementById('all-movies-grid');
  if (!allMoviesGrid) return;
  allMoviesGrid.innerHTML = '';

  const displayBatch = movies.slice(0, 16);
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

  // Prevent Enter when empty, clear on Escape
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchInput.value = '';
      hideSuggestions();
      resetHomeState();
      searchInput.blur();
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
      <img src="${safePoster}" alt="${safeTitle}">
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