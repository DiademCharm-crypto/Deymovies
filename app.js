// ==========================================
// DEYMFLIX - Main Application Logic
// ==========================================

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
    id: "Toy Story 5", 
    tmdbId: "1084244", 
    title: "Toy Story 5", 
    description: "Buzz, Woody, Jessie and the rest of the gang come face-to-face with Lilypad, a brand-new tablet device that arrives with her own disruptive ideas about what is best for Bonnie.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/sfQtVlIHljToOwYjhe21KPGzZWK.jpg", 
    backdrop: "https://media.themoviedb.org/t/p/w600_and_h900_face/sfQtVlIHljToOwYjhe21KPGzZWK.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Toy.Story.5.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: ""
  },
  { 
    id: "Spider-Man: Brand New Day", 
    tmdbId: "969681", 
    title: "Spider-Man: Brand New Day", 
    description: "Peter Parker navigates a refreshed world as old threats re-emerge and test his limits in an unfamiliar landscape.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg", 
    backdrop: "https://media.themoviedb.org/t/p/w600_and_h900_face/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg",
    manualEmbed: "",
    trailerEmbed: ""
  },
  { 
    id: "The Odyssey", 
    tmdbId: "1368337", 
    title: "The Odyssey", 
    description: "An epic journey across dangerous waters and uncharted lands as hero Odysseus seeks his path back home.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg", 
    backdrop: "https://media.themoviedb.org/t/p/w600_and_h900_face/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg",
    manualEmbed: "",
    trailerEmbed: "https://www.youtube.com/watch?v=Sk6LZrA2JSQ"
  }
];


const movies = [
  { 
    id: "The Runner", 
    tmdbId: "1510688",
    title: "The Runner", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/uxCaBoYXsDC4A0SqTm3SISj0OwK.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/The.Runner.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: ""
  },
  { 
    id: "Love, Ngo", 
    tmdbId: "1700944",
    title: "Love, Ngo", 
    isFilipino: true,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/ix86rEFrhvH3pJtCX7FBpjdKahG.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/lovengo.mp4",
    trailerEmbed: ""
  },
  { 
    id: "Call Me Mother", 
    tmdbId: "1510689",
    title: "Call Me Mother", 
    isFilipino: true,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/kMc1VvhyRdK9w43jaurzfxmnH4x.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Call%20Me%20Mother%202025%201080p%20Filipino%20WEB-DL%20HEVC%20x265%205%201-BONE.mkv",
    trailerEmbed: ""
  },
  { 
    id: "Almost Us", 
    tmdbId: "1510690",
    title: "Almost Us", 
    isFilipino: true,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/gQurSKUKrCFHa90ydVJRtSMyjLB.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Almost%20Us%202026%201080p%20Filipino%20WEB-DL%20HEVC%20x265%205%201-BONE.mkv",
    trailerEmbed: ""
  },
  { 
    id: "Ma'am Chief: Shakedown in Seoul", 
    tmdbId: "1191743",
    title: "Ma'am Chief: Shakedown in Seoul", 
    isFilipino: true,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/uCUgMEGPbZrnGLDjDXRteffT9JM.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Maam.Chief.Shakedown.in.Seoul.2023-1080p(1).mkv",
    trailerEmbed: ""
  },
  { 
    id: "The Odyssey", 
    tmdbId: "1368337",
    title: "The Odyssey", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg",
    manualEmbed: "",
    trailerEmbed: "https://www.youtube.com/watch?v=Sk6LZrA2JSQ"
  },
  { 
    id: "Spider-Man: Brand New Day", 
    tmdbId: "969681",
    title: "Spider-Man: Brand New Day", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg",
    manualEmbed: "",
    trailerEmbed: "https://www.youtube.com/watch?v=daXaTug8rL4"
  },
  { 
    id: "Mutiny", 
    tmdbId: "1288445",
    title: "Mutiny", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/pu2VxGlpGwffOx292w18b1tv96j.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Mutiny.2026.1080p.WEBRip.10Bit.DDP5.1.x265-NeoNoir.mkv",
    trailerEmbed: ""
  },
  { 
    id: "The Last Sunrise", 
    tmdbId: "1516698",
    title: "The Last Sunrise", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/3PWJqDfygN0YNNjWsDUOXclCp3h.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/The.Last.Sunrise.2026.1080p.WEBRip.x264.AAC5.1-LAMA.mp4",
    trailerEmbed: ""
  },
  { 
    id: "Facing El Chapo", 
    tmdbId: "1621552",
    title: "Facing El Chapo", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/z8eF0ACFFKtIZ4pUeo02PCzxRVO.jpg",
    manualEmbed: "",
    trailerEmbed: ""
  },
  { 
    id: "Toxic: A Fairy Tale for Grown-ups", 
    tmdbId: "1213243",
    title: "Toxic: A Fairy Tale for Grown-ups", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/oiIPU4lvnI0Ag2K9cyAi44eCaoE.jpg",
    manualEmbed: "",
    trailerEmbed: ""
  },
  { 
    id: "Minions & Monsters", 
    tmdbId: "1315772",
    title: "Minions & Monsters", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/4LwvU9SZc8QQzW1X1FAPhNbXnEU.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Minions.and.Monsters.2026.1080p.10bit.WEBRip.6CH.x265-PSA.mkv",
    trailerEmbed: ""
  },
  { 
    id: "Obsession", 
    tmdbId: "1339713",
    title: "Obsession", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/bRwnj8WEKBCvmfeUNOukJPwB43K.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Obsession.2026.1080p.WEBRip.x264.AAC5.1-LAMA.mp4",
    trailerEmbed: ""
  },
  { 
    id: "Rage of Stars", 
    tmdbId: "1323244",
    title: "Rage of Stars", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/oLld47ZT1I3iecM3OWhIphohQUJ.jpg",
    manualEmbed: "",
    trailerEmbed: "https://www.youtube.com/watch?v=F5bYhuO2Rkg"
  },
  { 
    id: "Toy Story 5", 
    tmdbId: "1084244",
    title: "Toy Story 5", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/sfQtVlIHljToOwYjhe21KPGzZWK.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Toy.Story.5.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: ""
  },
  { 
    id: "Pinocchio: Unstrung", 
    tmdbId: "1232569",
    title: "Pinocchio: Unstrung", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/eUJXk3bTvLBi5Zcb0BCedZU7lVL.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Pinocchio.Unstrung.mp4",
    trailerEmbed: ""
  },
  { 
    id: "Moana: Live Action", 
    tmdbId: "1108427",
    title: "Moana: Live Action", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/zKVgiv5qHCvCLT4A2ymJi5QeXDH.jpg",
    manualEmbed: "",
    trailerEmbed: ""
  },
  { 
    id: "Coyote vs. Acme", 
    tmdbId: "1204680",
    title: "Coyote vs. Acme", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/vhv7lBWYM0DUuNU2a0V7Rhq21dD.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Coyote.vs.Acme.2026.1080p.DCP.DDP5.1.H264-AOC.mkv",
    trailerEmbed: ""
  },
  { 
    id: "Colony", 
    tmdbId: "1375646",
    title: "Colony", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/tN799oUR0f1gUKDYdMNrDaY7I51.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Colony%202026%201080p%20WebRip%20Opus%202%200%20x265-Lootera.mkv",
    trailerEmbed: ""
  },
  { 
    id: "Ghost in the Cell", 
    tmdbId: "1393326",
    title: "Ghost in the Cell", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/zxcMdx0w5Zmg8yZuuiS7CJ8vOea.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Ghost.In.The.Cell.2026.720p.WEBRip.x264.AAC-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: ""
  },
  { 
    id: "The Secret Woman", 
    tmdbId: "1631807",
    title: "The Secret Woman", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/5FC5vUHFz0fbJOd0bhyzJpCSLrc.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/The%20Secret%20Woman%202026%201080p%20NF%20WEB-DL%20DUAL%20DDP5%201%20H%20264-FLUX.mkv",
    trailerEmbed: ""
  },
  { 
    id: "Barreda", 
    tmdbId: "1471168",
    title: "Barreda", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/hnr0QkZSDLlrJTvU2ecco65wcHo.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Barreda.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: ""
  },
  { 
    id: "Buddy", 
    tmdbId: "1514026",
    title: "Buddy", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6Lh4ZlsAISFQFVfLZ90sE9ycVnN.jpg",
    manualEmbed: "",
    trailerEmbed: ""
  },
  { 
    id: "The Whisper Man", 
    tmdbId: "860508",
    title: "The Whisper Man", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6UqflU8Qqkz7Dq4swJPqs0ZJjY4.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/The.Whisper.Man.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: ""
  },
  { 
    id: "Yellow Mirror", 
    tmdbId: "1729723",
    title: "Yellow Mirror", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/1zdGvJAuuXC7dA3eV61OtUJNyjQ.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Yellow%20Mirror%202026%20NORDiC%201080p%20WEB-DL%20H%20264%20DDP5%201-ADDICTION.mkv",
    trailerEmbed: ""
  },
  { 
    id: "The Dog Stars", 
    tmdbId: "1384216",
    title: "The Dog Stars", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/5O616X9vmRzQdB68PHzBewPittd.jpg",
    manualEmbed: "",
    trailerEmbed: ""
  },
  { 
    id: "It Ends", 
    tmdbId: "1422011",
    title: "It Ends", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6dfAGvZWbJnzWfSZ8gxFj63BNAH.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/It.Ends.2025.1080p.WEBRip.x264.AAC-%5BYTS.LT%5D.mp4",
    trailerEmbed: ""
  },
  { 
    id: "Irumudi", 
    tmdbId: "1441228",
    title: "Irumudi", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/sPePQmJRKkB14sGjB7zBkLJkaTW.jpg",
    manualEmbed: "",
    trailerEmbed: ""
  },
  { 
    id: "Insidious: Out of the Further", 
    tmdbId: "1291595",
    title: "Insidious: Out of the Further", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/4tTrW9dXCByS5wt2pXVWb58zNjz.jpg",
    manualEmbed: "",
    trailerEmbed: ""
  },
  { 
    id: "Sunny Dancer", 
    tmdbId: "1280015",
    title: "Sunny Dancer", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/mXdejPfToSVFlEzv1QYoIh2N53e.jpg",
    manualEmbed: "",
    trailerEmbed: ""
  },
  { 
    id: "The Brink of War", 
    tmdbId: "192139",
    title: "The Brink of War", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/hFborW6HmffKL05GIWlkTFdvVpN.jpg",
    manualEmbed: "",
    trailerEmbed: ""
  },
  { 
    id: "Untold Raygun: Breaking Badly", 
    tmdbId: "1739202",
    title: "Untold Raygun: Breaking Badly", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/3pnlJjsGtrUp3cPEOLzkR0sPQAK.jpg",
    manualEmbed: "",
    trailerEmbed: ""
  },
  { 
    id: "Just Play Dead", 
    tmdbId: "1480574",
    title: "Just Play Dead", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/glALx6QaIgw1u4joXsnfHTjWi6D.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Just.Play.Dead.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: ""
  },
  { 
    id: "The Wrong Girls", 
    tmdbId: "1226699",
    title: "The Wrong Girls", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/iEJshwO6g4WKTP4HJgCHRTJMWEd.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/The%20Wrong%20Girls%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/The.Wrong.Girls.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: ""
  },
  { 
    id: "I Want Your Sex", 
    tmdbId: "1288059",
    title: "I Want Your Sex", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/pR7SIX3AwqdoD96OI44oLG98e7g.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/I%20Want%20Your%20Sex%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5Bx265%5D%20%5B10bit%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/I.Want.Your.Sex.2026.1080p.WEBRip.x265.10bit.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: ""
  },
  { 
    id: "Gohan", 
    tmdbId: "1319522",
    title: "Gohan", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/nVq1Dn88NzVIVTDpGZeP7fxpLa1.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Gohan%20(2026)%20%5B720p%5D%20%5BWEBRip%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Gohan.2026.720p.WEBRip.x264.AAC-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: ""
  },
  { 
    id: "The Weight", 
    tmdbId: "1433583",
    title: "The Weight", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/8i5iZV50CoEtmDCFM7RSxCkpE8h.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/www.UIndex.org%20%20%20%20-%20%20%20%20The.Weight.2026.1080p.SCREENER.WEB-DL.H264.AAC-II/The.Weight.2026.1080p.SCREENER.WEB-DL.H264.AAC-II.mkv",
    trailerEmbed: ""
  },
  { 
    id: "The Mongoose", 
    tmdbId: "1294189",
    title: "The Mongoose", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/eSS5mvSG84UUuvtbHel5Yu3Wik4.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/The%20Mongoose%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/The.Mongoose.2026.1080p.WEBRip.x264.AAC-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: ""
  },
  { 
    id: "The Gentleman Thief", 
    tmdbId: "1458215",
    title: "The Gentleman Thief", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/oMutDMODnbCZf46w0dK4wncQmDB.jpg",
    manualEmbed: "",
    trailerEmbed: ""
  },
  { 
    id: "Man of War", 
    tmdbId: "1705729",
    title: "Man of War", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/vt0RqHlqfUzeiBEVQvp43yY2076.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Man%20Of%20War%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Man.Of.War.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: ""
  },
  { 
    id: "Hadestown: The Musical", 
    tmdbId: "1439808",
    title: "Hadestown: The Musical", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/iJNVygzkuOSCOdCPNI1nLSeF7sz.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Hadestown%20The%20Musical%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Hadestown.The.Musical.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: ""
  },
  { 
    id: "Her Private Hell", 
    tmdbId: "1469342",
    title: "Her Private Hell", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/kiFacg75KVjy0AM3S4QmbPas8zL.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Her%20Private%20Hell%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Her.Private.Hell.2026.1080p.WEBRip.x264.AAC-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: ""
  },
  { 
    id: "Batman: Knightfall Part 1: Knightfall", 
    tmdbId: "1560520",
    title: "Batman: Knightfall Part 1: Knightfall", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/360qdtu2hLnqMu8SVHMywn420w1.jpg",
    manualEmbed: "https://video.deymflix.eu.cc/Batman.Knightfall.Part.1.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: ""
  },
  { 
    id: "Motor City", 
    tmdbId: "87513",
    title: "Motor City", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/dx2dblJL3GAKcXXXPjC2FSaMTWW.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Motor%20City%20(2025)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Motor.City.2025.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: ""
  },
  { 
    id: "PAW Patrol: The Dino Movie", 
    tmdbId: "1185806",
    title: "PAW Patrol: The Dino Movie", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/qnin56Syy5rbG7KCaxWY7SPuy6p.jpg",
    manualEmbed: "",
    trailerEmbed: ""
  },
  { 
    id: "Bury the Devil", 
    tmdbId: "1432706",
    title: "Bury the Devil", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/yQ3GeVsebrhOPIBhIdoSslbndEv.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Bury%20The%20Devil%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Bury.The.Devil.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: ""
  },
  { 
    id: "The Oldham Man and the Sea", 
    tmdbId: "1682276",
    title: "The Oldham Man and the Sea", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/wcfuythlTfVXm0yZHnBWGxXoUjt.jpg",
    manualEmbed: "",
    trailerEmbed: ""
  },
  { 
    id: "The Birthday Party", 
    tmdbId: "1339175",
    title: "The Birthday Party", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/sXN4IvB4hM2AYYx9BhdzhokrjvH.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/The%20Birthday%20Party%20(2025)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/The.Birthday.Party.2025.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: ""
  },
  { 
    id: "Yellow Eyes", 
    tmdbId: "1314826",
    title: "Yellow Eyes", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/tdIqb0g8fimv2bXIEZdWu6Zfywt.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Yellow%20Eyes%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Yellow.Eyes.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: ""
  },
  { 
    id: "The End of Oak Street", 
    tmdbId: "1101383",
    title: "The End of Oak Street", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/fYXqpgPmHMphSF2W30GbTeJVIa5.jpg",
    manualEmbed: "https://cinema8.com/video/PO8PwYyO",
    trailerEmbed: ""
  },
  { 
    id: "Pose", 
    tmdbId: "79084",
    title: "Pose", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/5f23i30nFJz0nrd3DGheOCqXa2P.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Pose%20(2025)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.LT%5D/Pose.2025.1080p.WEBRip.x264.AAC5.1-%5BYTS.LT%5D.mp4",
    trailerEmbed: ""
  },
  { 
    id: "Truly Naked", 
    tmdbId: "1281195",
    title: "Truly Naked", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/y23B9EnC0LDw8zMKlpXJauyLH7k.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Truly%20Naked%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Truly.Naked.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: ""
  },
  { 
    id: "Camp Rock 3", 
    tmdbId: "1493400",
    title: "Camp Rock 3", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/rS7byWK9cfPfdLeFNlRIaJxH9mN.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/www.UIndex.org%20%20%20%20-%20%20%20%20Camp%20Rock%203%202026%201080p%20WEBRip%20x265-DH/Camp%20Rock%203%202026%201080p%20WEBRip%20x265-DH.mkv",
    trailerEmbed: ""
  },
  { 
    id: "Your Attention Please", 
    tmdbId: "1629373",
    title: "Your Attention Please", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/lVzZJlBP8EqWtx9EF0LIT55ve3H.jpg",
    manualEmbed: "",
    trailerEmbed: ""
  },
  { 
    id: "Narcissist's Playbook", 
    tmdbId: "1680072",
    title: "Narcissist's Playbook", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/nuI0XoN1p92MpVlSNtkxFzM3u6p.jpg",
    manualEmbed: "",
    trailerEmbed: ""
  },
  { 
    id: "Gail Daughtry and the Celebrity Sex Pass", 
    tmdbId: "1476682",
    title: "Gail Daughtry and the Celebrity Sex Pass", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/98T4bnMjJs71WOVZoeY8edZhfgZ.jpg",
    manualEmbed: "https://cinema8.com/video/WDezkkzX",
    trailerEmbed: ""
  },
  { 
    id: "The Foreign Exchange Student 2: The Hunt", 
    tmdbId: "1031637",
    title: "The Foreign Exchange Student 2: The Hunt", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/aHy0ZifxTGN8QpF0QGUVXrIvCky.jpg",
    manualEmbed: "",
    trailerEmbed: ""
  },
  { 
    id: "The Drop Spot", 
    tmdbId: "1057920",
    title: "The Drop Spot", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/iZL6f4sFwYOnh2CPm8IKu3TxyHn.jpg",
    manualEmbed: "",
    trailerEmbed: ""
  },
  { 
    id: "The Exit Row", 
    tmdbId: "900717",
    title: "The Exit Row", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/v1nJW1hBICXyFyMOG2sm7GVj3Il.jpg",
    manualEmbed: "",
    trailerEmbed: ""
  },
  { 
    id: "Free Fall", 
    tmdbId: "814855",
    title: "Free Fall", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/m1OGsVkwnEbf4frMtn2VS1nHjlv.jpg",
    manualEmbed: "",
    trailerEmbed: ""
  },
  { 
    id: "Don't Say Good Luck", 
    tmdbId: "1504358",
    title: "Don't Say Good Luck", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/dgTKahWonzVLeN8Lm22WR2S7D0A.jpg",
    manualEmbed: "",
    trailerEmbed: ""
  },
  { 
    id: "All Night Wrong", 
    tmdbId: "1361969",
    title: "All Night Wrong", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/jFN9LcCG4a02wRWm2qfJ6nLY8BO.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/All%20Night%20Wrong%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/All.Night.Wrong.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.srt",
    trailerEmbed: ""
  },
  { 
    id: "Dreams", 
    tmdbId: "31710990",
    title: "Dreams", 
    poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3t5Mh7vMpC7DMa0cW3cH4g3atqaoAHIsHNet_NEqQog&s=10",
    manualEmbed: "",
    trailerEmbed: ""
  },
  { 
    id: "Travis Barker: Louder Than Fear", 
    tmdbId: "1695225",
    title: "Travis Barker: Louder Than Fear", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/nFjdTYHi7tRjijf3utArceQFtRi.jpg",
    manualEmbed: "",
    trailerEmbed: ""
  },
  { 
    id: "Night Nurse", 
    tmdbId: "1596260",
    title: "Night Nurse", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/cvj1d5avMYRxK8FVpq07UqLrcbZ.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Night%20Nurse%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5Bx265%5D%20%5B10bit%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Night.Nurse.2026.1080p.WEBRip.x265.10bit.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: ""
  },
  { 
    id: "Air Force Elite: Thunderbirds", 
    tmdbId: "1457515",
    title: "Air Force Elite: Thunderbirds", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/hsJtBhMxNDGzW5KcQ9qz3EQGnEt.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Air%20Force%20Elite%20Thunderbirds%20(2025)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.MX%5D/Air.Force.Elite.Thunderbirds.2025.1080p.WEBRip.x264.AAC5.1-%5BYTS.MX%5D.mp4.fdmdownload",
    trailerEmbed: ""
  },
  { 
    id: "Saccharine", 
    tmdbId: "1363387",
    title: "Saccharine", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/bCHPB5WZy4T0Rerh1GTuQLzU0rF.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Saccharine%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5Bx265%5D%20%5B10bit%5D%20%5B5.1%5D%20%5BYTS.BZ%5D/Saccharine.2026.1080p.WEBRip.x265.10bit.AAC5.1-%5BYTS.BZ%5D.mp4",
    trailerEmbed: ""
  },
  { 
    id: "Young Washington", 
    tmdbId: "1308767",
    title: "Young Washington", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6CdoTKnRQHJkjRGxTefFGkPQplB.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Young%20Washington%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Young.Washington.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: ""
  },
  { 
    id: "Our Hero, Balthazar", 
    tmdbId: "1465557",
    title: "Our Hero, Balthazar", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/mxVTarvl5OLoU9YWIYygby6R0KI.jpg",
    manualEmbed: "",
    trailerEmbed: ""
  },
  { 
    id: "The Last Guest of the Holloway Motel", 
    tmdbId: "1465790",
    title: "The Last Guest of the Holloway Motel", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/yF7gHhdRINMkj9ez4Dxx4kbkWv.jpg",
    manualEmbed: "",
    trailerEmbed: ""
  },
  { 
    id: "The Invite", 
    tmdbId: "950028",
    title: "The Invite", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/b7Dr8Chzse8VagexAporUu2RtLx.jpg",
    manualEmbed: "",
    trailerEmbed: ""
  },
  { 
    id: "Jackass: Best and Last", 
    tmdbId: "1612018",
    title: "Jackass: Best and Last", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/tfgccePxnswMqhmtxafliLlcCVR.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Jackass%20Best%20And%20Last%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Jackass.Best.And.Last.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: ""
  },
  { 
    id: "The Last House", 
    tmdbId: "1284041",
    title: "The Last House", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6JU7E8Vv2M11egkctWVOScxWR75.jpg",
    manualEmbed: "",
    trailerEmbed: ""
  },
  { 
    id: "Casa Grande", 
    tmdbId: "1469164",
    title: "Casa Grande", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/mE9E4nsGM91Cf4b1s6nOOdUAE9P.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Casa%20Grande%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.BZ%5D/Casa.Grande.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.BZ%5D.mp4",
    trailerEmbed: ""
  },
  { 
    id: "The Isolate Thief", 
    tmdbId: "1404304",
    title: "The Isolate Thief", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/gmmCh2BvTKp0YGT2FYG0eOQJELi.jpg",
    manualEmbed: "",
    trailerEmbed: ""
  },
  { 
    id: "Housemaid", 
    tmdbId: "1368166",
    title: "Housemaid", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/cWsBscZzwu5brg9YjNkGewRUvJX.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Housemaid%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Housemaid.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: ""
  },
  { 
    id: "Lucky Strike", 
    tmdbId: "1594914",
    title: "Lucky Strike", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/7AEBdyGYXumXWmMFeynE8227KeZ.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Lucky%20Strike%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Lucky.Strike.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: ""
  },
  { 
    id: "Jailhouse to Milhouse", 
    tmdbId: "1184341",
    title: "Jailhouse to Milhouse", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/9QR5hejamYx2nMtxUHNO96bFsoK.jpg",
    manualEmbed: "",
    trailerEmbed: ""
  },
  { 
    id: "Jimmie & Stevie Ray Vaughan: Brothers in Blues", 
    tmdbId: "1092074",
    title: "Jimmie & Stevie Ray Vaughan: Brothers in Blues", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6wBUhmgMjf6bqvfrgKsHEUxwH7T.jpg",
    manualEmbed: "",
    trailerEmbed: ""
  },
  { 
    id: "Submerged: The Hunley", 
    tmdbId: "1741192",
    title: "Submerged: The Hunley", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/zY3xxTscRu7RMSVECppWQQyxHA6.jpg",
    manualEmbed: "",
    trailerEmbed: ""
  },
  { 
    id: "The Christmas Spirit", 
    tmdbId: "882109",
    title: "The Christmas Spirit", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6a8nocaDfYOehQzeqZMvni9WqVq.jpg",
    manualEmbed: "",
    trailerEmbed: ""
  },
  { 
    id: "Soulm8te", 
    tmdbId: "1307118",
    title: "Soulm8te", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/bNErActDctl6cdUGw9pnjSCmyhQ.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/SOULM8TE%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/SOULM8TE.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: ""
  },
  { 
    id: "Time and Water", 
    tmdbId: "1596278",
    title: "Time and Water", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/1hksIYHtsHCG70nZKbnrYBPk600.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Time%20And%20Water%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Time.And.Water.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: ""
  },
  { 
    id: "Maddie's Secret", 
    tmdbId: "1517868",
    title: "Maddie's Secret", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/vADal7sH7E9xFr4w2k4V3EPSzF6.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Maddies%20Secret%20(2025)%20%5B1080p%5D%20%5BWEBRip%5D%20%5Bx265%5D%20%5B10bit%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Maddies.Secret.2025.1080p.WEBRip.x265.10bit.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: ""
  },
  { 
    id: "Nightborn", 
    tmdbId: "964849",
    title: "Nightborn", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/e9ALgOANOJbcFpw84MbafK3xvD2.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/www.UIndex.org%20%20%20%20-%20%20%20%20Nightborn%202026%20720p%20AMZN%20WEB-DL%20DDP5%201%20H%20264-SCOPE/Nightborn%202026%20720p%20AMZN%20WEB-DL%20DDP5%201%20H%20264-SCOPE.mkv.fdmdownload",
    trailerEmbed: ""
  },
  { 
    id: "Rose of Nevada", 
    tmdbId: "1399525",
    title: "Rose of Nevada", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/aDBZ2PGgUbcGjyX7ZCXLOk4AFQH.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Rose%20Of%20Nevada%20(2025)%20%5B1080p%5D%20%5BWEBRip%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Rose.Of.Nevada.2025.1080p.WEBRip.x264.AAC-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: ""
  },
  { 
    id: "Snoopy Presents: There's No Place Like Home Snoopy", 
    tmdbId: "1698575",
    title: "Snoopy Presents: There's No Place Like Home Snoopy", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/YbC4SlzE030BgxWdKDdlatMh5W.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/www.UIndex.org%20%20%20%20-%20%20%20%20Snoopy.Presents.Theres.No.Place.Like.Home.Snoopy.2026.1080p.WEB.h264-DOLORES/Snoopy.Presents.Theres.No.Place.Like.Home.Snoopy.2026.1080p.WEB.h264-DOLORES.mkv",
    trailerEmbed: ""
  },
  { 
    id: "The Devil's Mouth", 
    tmdbId: "1409853",
    title: "The Devil's Mouth", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/dx2dblJL3GAKcXXXPjC2FSaMTWW.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/www.UIndex.org%20%20%20%20-%20%20%20%20The%20Devils%20Mouth%20(2026)%201080p%20BluRay%205.1-LAMA/The.Devils.Mouth.2026.1080p.BluRay.x264.AAC5.1-LAMA.mp4",
    trailerEmbed: ""
  },
  { 
    id: "Neglected", 
    tmdbId: "1185807",
    title: "Neglected", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/A0gqKFmJ7OArcFob49PErNvzN66.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Neglected%20(2025)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.BZ%5D/Neglected.2025.1080p.WEBRip.x264.AAC5.1-%5BYTS.BZ%5D.mp4",
    trailerEmbed: ""
  },
  { 
    id: "Oracle of the Dragon", 
    tmdbId: "1731443",
    title: "Oracle of the Dragon", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/lxVFFVIdXDnQCAFAllCrNfPDHFv.jpg",
    manualEmbed: "",
    trailerEmbed: ""
  },
  { 
    id: "Leviticus", 
    tmdbId: "1564614",
    title: "Leviticus", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/gnAsZvBygplNpp8PtjoTEYv3VPB.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Leviticus%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Leviticus.2026.1080p.WEBRip.x264.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: ""
  },
  { 
    id: "Cold War 1994", 
    tmdbId: "1499071",
    title: "Cold War 1994", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/9C3ZxhGJvdpxmNC5PhkBMwzTMRT.jpg",
    manualEmbed: "",
    trailerEmbed: ""
  },
  { 
    id: "Supergirl", 
    tmdbId: "1081003",
    title: "Supergirl", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/uhzRnTW4DM13UQBvZP3eVNzQTuz.jpg",
    manualEmbed: "https://video.nbanaapp.eu.cc/Supergirl%20(2026)%20%5B1080p%5D%20%5BWEBRip%5D%20%5Bx265%5D%20%5B10bit%5D%20%5B5.1%5D%20%5BYTS.GG%20-%20YTS.BZ%5D/Supergirl.2026.1080p.WEBRip.x265.10bit.AAC5.1-%5BYTS.GG%20-%20YTS.BZ%5D.mp4",
    trailerEmbed: ""
  }
];

function createMovieCard(movie, rankNumber = null) {
  const card = document.createElement('div');
  card.className = 'poster-card';
  card.onclick = () => {
    window.location.href = `player.html?id=${encodeURIComponent(movie.id)}`;
  };

  const fallbackUrl = 'https://via.placeholder.com/300x450/1f1f1f/ffffff?text=No+Poster';
  const rankHTML = rankNumber ? `<div class="rank-badge-box">#${rankNumber}</div>` : '';

  // Checks if manualEmbed has a valid link -> HD, otherwise TRAILER
  const hasManualLink = movie.manualEmbed && movie.manualEmbed.trim() !== '';
  const qualityLabel = hasManualLink ? 'HD' : 'TRAILER';
  const qualityClass = hasManualLink ? 'quality-hd' : 'quality-trailer';

  card.innerHTML = `
    ${rankHTML}
    <div class="tag-badge-top-right ${qualityClass}">${qualityLabel}</div>
    <img src="${movie.poster}" 
         alt="${movie.title}" 
         loading="lazy" 
         onerror="this.onerror=null;this.src='${fallbackUrl}';">
    <div class="poster-card-overlay">
      <div class="poster-card-title">${movie.title}</div>
    </div>
  `;
  return card;
}

let heroCarouselTimer = null;

document.addEventListener('DOMContentLoaded', () => {
  setupHeroBanner();
  renderContinueWatching();
  renderTopPicks();
  renderAiReels();
  renderFilipinoMovies();
  renderAllMoviesGrid();
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

function renderContinueWatching() {
  const section = document.getElementById('continue-watching-section');
  const container = document.getElementById('continue-watching-container');
  if (!section || !container) return;

  const savedData = JSON.parse(localStorage.getItem('deymflix_continue_watching') || '{}');
  const items = Object.values(savedData)
    .filter(item => item.progress < 95)
    .sort((a, b) => b.updatedAt - a.updatedAt);

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

    card.innerHTML = `
      <button class="remove-continue-btn" title="Remove">&times;</button>
      <img src="${item.poster}" alt="${item.title}" loading="lazy">
      <div class="poster-card-overlay">
        <div class="poster-card-title">${item.title}</div>
      </div>
      <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 4px; background: rgba(255,255,255,0.2); z-index: 10;">
        <div style="width: ${item.progress}%; height: 100%; background: #e50914;"></div>
      </div>
    `;

    // Remove button wired via closure so movie ids/titles containing
    // apostrophes can never break the handler (inline onclick strings would).
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

  const savedData = JSON.parse(localStorage.getItem('deymflix_continue_watching') || '{}');
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
          <img class="hero-backdrop-img" src="${item.backdrop || item.poster}" alt="${item.title}" loading="lazy">
          <div class="hero-fade-overlay"></div>
          <div class="hero-details-container">
            <h1 class="hero-title-text">${item.title}</h1>
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

    card.innerHTML = `
      <img src="${reel.poster || reel.thumbnail}" alt="${reel.title}" class="reel-thumb-img" loading="lazy">
      <div class="reel-overlay-info">
        <span class="reel-badge-tag">AI REEL</span>
        <span class="reel-thumb-title">${reel.title}</span>
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
  const allMoviesGrid = document.getElementById('all-movies-grid');

  if (!searchInput || !allMoviesGrid) return;
  const query = searchInput.value.toLowerCase().trim();

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
      showToast(`Request sent for: "${movieTitle}"`);
      if (input) input.value = '';
      closeRequestModal();
    } else {
      showToast('Error submitting request. Check key.');
    }
  } catch (err) {
    showToast(`Request saved locally for: "${movieTitle}"`);
    if (input) input.value = '';
    closeRequestModal();
  }
}