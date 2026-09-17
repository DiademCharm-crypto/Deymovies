// ==========================================
// DEYMFLIX - Filipino Movies & Series Data
// ==========================================
// Add NEW Filipino movies/series HERE (not in app.js).
// They merge into the main `movies` list automatically and appear in
// Tagalog rows, explore filters, search, and the player like any other title.
// IMPORTANT: this file must load BEFORE app.js on every page.
// ==========================================

const filipinoMovieData = [
  { 
    id: "Love, Ngo", 
    imdbId: "tt42111424",
    title: "Love, Ngo", 
    isFilipino: true,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/ix86rEFrhvH3pJtCX7FBpjdKahG.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/lovengo.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Filipiñana", 
    imdbId: "tt29512008",
    title: "Filipiñana", 
    isFilipino: true,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/paJZyL5uwTJZLlWbEcN6MbFLGYA.jpg",
    manualEmbed: "https://deymflix01.s3.us-east-005.backblazeb2.com/Tagalog+Movies/Filipi%C3%B1ana+%E2%80%93+DLPAPS.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Ganito, Ganyan, Ganoon", 
    imdbId: "tt39741670",
    title: "Ganito, Ganyan, Ganoon", 
    isFilipino: true,
    poster: "https://deymflix01.s3.us-east-005.backblazeb2.com/Tagalog+Movies/This%2C+That+and+Everything+in+Between.mp4",
    manualEmbed: "https://video.deymflix.eu.cc/lovengo.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Us in the End (Tayo sa Wakas)", 
    imdbId: "tt39554253",
    title: "Us in the End (Tayo sa Wakas)", 
    isFilipino: true,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/jWK3fep9bswDb6EuarNgoIihDBa.jpg",
    manualEmbed: "https://deymflix01.s3.us-east-005.backblazeb2.com/Tagalog+Movies/Us.In.The.End.2026.1080p.WEB-DLH264-TRICKFLIX+(1).mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Wonderful Nightmare", 
    imdbId: "tt39602729",
    title: "Wonderful Nightmare", 
    isFilipino: true,
    poster: "https://deymflix01.s3.us-east-005.backblazeb2.com/Tagalog+Movies/Wonderful+Nightmare.mp4",
    manualEmbed: "https://video.deymflix.eu.cc/lovengo.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "A Special Memory", 
    imdbId: "tt40269077",
    title: "A Special Memory", 
    isFilipino: true,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/1ucCvNfCUlhacBZseLik4IWg797.jpg",
    manualEmbed: "https://deymflix01.s3.us-east-005.backblazeb2.com/Tagalog+Movies/A+Special+Memory.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Until She Remembers", 
    imdbId: "tt39310310",
    title: "Until She Remembers", 
    isFilipino: true,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/xLjqaHCbdX8Rh3vRvR9XQbgGk85.jpg",
    manualEmbed: "https://deymflix01.s3.us-east-005.backblazeb2.com/Tagalog+Movies/Until+She+Remembers+%E2%80%93+DLPAPS.mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Call Me Mother", 
    imdbId: "tt37539162",
    title: "Call Me Mother", 
    isFilipino: true,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/kMc1VvhyRdK9w43jaurzfxmnH4x.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Call%20Me%20Mother%202025%201080p%20Filipino%20WEB-DL%20HEVC%20x265%205%201-BONE.mkv",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Almost Us", 
    imdbId: "tt39734954",
    title: "Almost Us", 
    synopsis: "RR has always been in love with his best friend, Janine. But she's infatuated with Kenzo, the star of her own fan fiction. The film explores the complicated space between love, timing, and the relationships that leave us wondering, 'What if?'",
    isFilipino: true,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/gQurSKUKrCFHa90ydVJRtSMyjLB.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Almost%20Us%202026%201080p%20Filipino%20WEB-DL%20HEVC%20x265%205%201-BONE.mkv",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Ma'am Chief: Shakedown in Seoul", 
    imdbId: "tt29513611",
    title: "Ma'am Chief: Shakedown in Seoul", 
    isFilipino: true,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/uCUgMEGPbZrnGLDjDXRteffT9JM.jpg",
    manualEmbed: "https://deymflix01.s3.us-east-005.backblazeb2.com/movie+1/Maam.Chief.Shakedown.in.Seoul.2023-1080p(1).mp4",
    trailerEmbed: "",
    isSeries: false
  },
  { 
    id: "Love-U-Lots", 
    imdbId: "tt43619010",
    title: "Love U Lots", 
    synopsis: "Heartbroken Estong meets the mysterious Ysa and finds himself drawn to her. He soon learns that loving Ysa means accepting the many versions of her. A romantic comedy series about two ex-lovers who rekindle their feelings at a time when the two are already married.",
    isFilipino: true,
    poster: "https://m.media-amazon.com/images/M/MV5BNmQ1OWEyNWEtMDk2Yy00YmEwLTkzMGQtNTJjMGFhZmI4NjNhXkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg",
    manualEmbed: "https://deymflix01.s3.us-east-005.backblazeb2.com/Love+U+Lots/Love.U.Lots.(2026).VONE.S01E01.1080p.WEB-DL.AAC2.0.x264-DarkRip.mkv",
    trailerEmbed: "",
    isSeries: true
  }
];

// Merge into the main movies array (runs when app.js loads; guarded so a missing file can never break the site)
if (typeof window !== "undefined") {
  window.__deymflixMergeFilipino = function (moviesArray) {
    filipinoMovieData.forEach(function (m) {
      if (!moviesArray.some(function (x) { return x.id === m.id; })) moviesArray.push(m);
    });
  };
}
