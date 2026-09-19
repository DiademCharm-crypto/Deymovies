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
    trailerEmbed: "https://www.youtube.com/watch?v=nkpTJeSrDd8",
    isSeries: false
  },
  { 
    id: "Filipiñana", 
    imdbId: "tt29512008",
    title: "Filipiñana", 
    isFilipino: true,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/paJZyL5uwTJZLlWbEcN6MbFLGYA.jpg",
    manualEmbed: "https://deymflix01.s3.us-east-005.backblazeb2.com/Tagalog+Movies/Filipi%C3%B1ana+%E2%80%93+DLPAPS.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=m_HVhPPSeyY",
    isSeries: false
  },
  { 
    id: "Ganito, Ganyan, Ganoon", 
    imdbId: "tt39741670",
    title: "Ganito, Ganyan, Ganoon", 
    isFilipino: true,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/voT1x4FdnBieu1en3CeKhf7N0n8.jpg",
    manualEmbed: "https://deymflix01.s3.us-east-005.backblazeb2.com/Tagalog+Movies/This%2C+That+and+Everything+in+Between.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=ueGNj0fC8rU",
    isSeries: false
  },
  { 
    id: "Us in the End (Tayo sa Wakas)", 
    imdbId: "tt39554253",
    title: "Us in the End (Tayo sa Wakas)", 
    isFilipino: true,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/jWK3fep9bswDb6EuarNgoIihDBa.jpg",
    manualEmbed: "https://deymflix01.s3.us-east-005.backblazeb2.com/Tagalog+Movies/Us.In.The.End.2026.1080p.WEB-DLH264-TRICKFLIX+(1).mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=E1kcUHGLlnI",
    isSeries: false
  },
  { 
    id: "Wonderful Nightmare", 
    imdbId: "tt39602729",
    title: "Wonderful Nightmare", 
    isFilipino: true,
    poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRL77Wnd_A1xbSaSkiIIpZWYPBnhrFZmaK9MEOtnYb78A&s=10",
    manualEmbed: "https://deymflix01.s3.us-east-005.backblazeb2.com/Tagalog+Movies/Wonderful+Nightmare.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=t5ZypDnCq7Q",
    isSeries: false
  },
  { 
    id: "A Special Memory", 
    imdbId: "tt40269077",
    title: "A Special Memory", 
    isFilipino: true,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/1ucCvNfCUlhacBZseLik4IWg797.jpg",
    manualEmbed: "https://deymflix01.s3.us-east-005.backblazeb2.com/Tagalog+Movies/A+Special+Memory.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=HT3dagVqPds",
    isSeries: false
  },
  { 
    id: "Until She Remembers", 
    imdbId: "tt39310310",
    title: "Until She Remembers", 
    isFilipino: true,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/xLjqaHCbdX8Rh3vRvR9XQbgGk85.jpg",
    manualEmbed: "https://deymflix01.s3.us-east-005.backblazeb2.com/Tagalog+Movies/Until+She+Remembers+%E2%80%93+DLPAPS.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=fRND_au0wXo",
    isSeries: false
  },
  { 
    id: "Call Me Mother", 
    imdbId: "tt37539162",
    title: "Call Me Mother", 
    isFilipino: true,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/kMc1VvhyRdK9w43jaurzfxmnH4x.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Call%20Me%20Mother%202025%201080p%20Filipino%20WEB-DL%20HEVC%20x265%205%201-BONE.mkv",
    trailerEmbed: "https://www.youtube.com/watch?v=cFZmGrP108E",
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
    trailerEmbed: "https://www.youtube.com/watch?v=7Syb_uhtdN0",
    isSeries: false
  },
  { 
    id: "The Lotto Winner", 
    imdbId: "tt39377509",
    title: "The Lotto Winner", 
    isFilipino: true,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/sdPxiTp9bf2muVWyxptC5TSsalU.jpg",
    manualEmbed: "https://deymflix01.s3.us-east-005.backblazeb2.com/Tagalog+Movies/The+Lotto+Winner.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=uAtanD32rs8",
    isSeries: false
  },
  { 
    id: "The Loved One", 
    imdbId: "tt39398162",
    title: "The Loved One",
    isFilipino: true,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/rVZQcphJRWVJgQZtWztrauB6Fwe.jpg",
    manualEmbed: "https://deymflix01.s3.us-east-005.backblazeb2.com/Tagalog+Movies/The+Loved+One.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=zvbs8E667tQ",
    isSeries: true
  },
  { 
    id: "UnMarry", 
    imdbId: "tt38779673",
    title: "UnMarry", 
    isFilipino: true,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/tesrfUyiRpiFAaE9OybSoTo12W5.jpg",
    manualEmbed: "https://deymflix01.s3.us-east-005.backblazeb2.com/Tagalog+Movies/UnMarry+%E2%80%93+DLPAPS.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=3bLDu6QxdNE",
    isSeries: false
  },
  { 
    id: "Love You So Bad", 
    imdbId: "tt37982738",
    title: "Love You So Bad", 
    isFilipino: true,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/h2VnqqAbO290tQ6QkynsHhgerjC.jpg",
    manualEmbed: "https://deymflix01.s3.us-east-005.backblazeb2.com/Tagalog+Movies/Love+You+So+Bad+%E2%80%93+DLPAPS_2.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=HkUHfI4DG1E",
    isSeries: false
  },
  { 
    id: "Bar Boys: After School", 
    imdbId: "tt38779645",
    title: "Bar Boys: After School", 
    isFilipino: true,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/4Gb7BfPyMuVWYoCDC8VQLLKgncl.jpg",
    manualEmbed: "https://deymflix01.s3.us-east-005.backblazeb2.com/Tagalog+Movies/Bar+Boys-+After+School.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=K4fQCnApsW8",
    isSeries: false
  },
  { 
    id: "Rekonek", 
    imdbId: "tt38779509",
    title: "Rekonek", 
    isFilipino: true,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/lUcZ7eAzhol9oB3hgfmA8HldPq.jpg",
    manualEmbed: "https://deymflix01.s3.us-east-005.backblazeb2.com/Tagalog+Movies/Rekonek+%E2%80%93+DLPAPS.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=n7csBgJqmKQ",
    isSeries: false
  },
  { 
    id: "Salvageland", 
    imdbId: "tt38882902",
    title: "Salvageland", 
    isFilipino: true,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/3vvQDvrzMPN8sc2n3hLOqrlusDS.jpg",
    manualEmbed: "https://deymflix01.s3.us-east-005.backblazeb2.com/Tagalog+Movies/Salvageland.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=Y1ClNzed-g4",
    isSeries: false
  },
  { 
    id: "Meet, Greet & Bye", 
    imdbId: "tt35929110",
    title: "Meet, Greet & Bye", 
    isFilipino: true,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/7gEBNzmaTiBVG3g0eUDPU3kPbcc.jpg",
    manualEmbed: "https://deymflix01.s3.us-east-005.backblazeb2.com/Tagalog+Movies/Meet%2C+Greet+%26+Bye.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=Mtou4LuxFrg",
    isSeries: false
  },
  { 
    id: "Near Death", 
    imdbId: "tt38797474",
    title: "Near Death", 
    isFilipino: true,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/4zJVQlCM2onUs3at8tTGEiHdS4D.jpg",
    manualEmbed: "https://deymflix01.s3.us-east-005.backblazeb2.com/Tagalog+Movies/Near+Death.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=_WDsgMqFoJw",
    isSeries: false
  },
  { 
    id: "Everyone Knows Every Juan", 
    imdbId: "tt38590407",
    title: "Everyone Knows Every Juan", 
    isFilipino: true,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/lCaEmw7wWqzEuolYJSTWHT5uUKq.jpg",
    manualEmbed: "https://deymflix01.s3.us-east-005.backblazeb2.com/Tagalog+Movies/Everyone+Knows+Every+Juan.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=jZv-Up-P7ik",
    isSeries: true
  },
  { 
    id: "The Last Beergin", 
    imdbId: "tt38590754",
    title: "The Last Beergin", 
    isFilipino: true,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/rdtpEg20TNwu8IOHB2DT7MPbQ9Q.jpg",
    manualEmbed: "https://deymflix01.s3.us-east-005.backblazeb2.com/Tagalog+Movies/The+Last+Beergin+%E2%80%93+DLPAPS.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=C4UMAlD2Khk",
    isSeries: true
  },
  { 
    id: "The Ride", 
    imdbId: "tt38574336",
    title: "The Ride", 
    isFilipino: true,
    poster: "https://m.media-amazon.com/images/M/MV5BNzRhZDIyYzItYjAxYi00MjUwLTk0MjAtMDcwODMzNWIzYjUzXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    manualEmbed: "https://deymflix01.s3.us-east-005.backblazeb2.com/Tagalog+Movies/The+Ride.mp4",
    trailerEmbed: "https://www.youtube.com/watch?v=P-dnzj_iILY",
    isSeries: true
  },
];

// Merge into the main movies array (runs when app.js loads; guarded so a missing file can never break the site)
if (typeof window !== "undefined") {
  window.__deymflixMergeFilipino = function (moviesArray) {
    filipinoMovieData.forEach(function (m) {
      if (!moviesArray.some(function (x) { return x.id === m.id; })) moviesArray.push(m);
    });
  };
}
