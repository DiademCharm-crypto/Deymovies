// Featured Hero Movies
const featuredMovies = [
  { 
    id: "Toy Story 5", 
    tmdbId: "1084244", 
    title: "Toy Story 5", 
    description: "Buzz, Woody, Jessie and the rest of the gang come face-to-face with Lilypad, a brand-new tablet device that arrives with her own disruptive ideas about what is best for Bonnie.",
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/sfQtVlIHljToOwYjhe21KPGzZWK.jpg", 
    backdrop: "https://media.themoviedb.org/t/p/w600_and_h900_face/sfQtVlIHljToOwYjhe21KPGzZWK.jpg",
    manualEmbed: "https://www.youtube.com/embed/5PSNL1qE6VY"
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
    backdrop: "https://media.themoviedb.org/t/p/w600_and_h900_face/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg",
    manualEmbed: "https://cinema8.com/video/9X6wd1PJ"
  }
];

// Main Grid Movie Library
const movies = [
  { 
    id: "Love, Ngo", 
    tmdbId: "1700944",
    title: "Love, Ngo", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/ix86rEFrhvH3pJtCX7FBpjdKahG.jpg",
    manualEmbed: "https://drive.google.com/file/d/1yAhozDLERfnZeUvXNEoGilFZ5HB8SVMR/preview"
  },
  { 
    id: "Call Me Mother", 
    tmdbId: "1510688",
    title: "Call Me Mother", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/kMc1VvhyRdK9w43jaurzfxmnH4x.jpg",
    manualEmbed: "https://cinema8.com/video/zX0ERn9J"
  },
  { 
    id: "The Odyssey", 
    tmdbId: "1368337",
    title: "The Odyssey", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg",
    manualEmbed: "https://cinema8.com/video/9X6wd1PJ"
  },
  { 
    id: "Spider-Man: Brand New Day", 
    tmdbId: "969681",
    title: "Spider-Man: Brand New Day", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg"

  },
  { 
    id: "Mutiny", 
    tmdbId: "1288445",
    title: "Mutiny", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/pu2VxGlpGwffOx292w18b1tv96j.jpg",
    manualEmbed: "https://cinema8.com/video/jXax7PlD"
  },
  { 
    id: "The Last Sunrise", 
    tmdbId: "1516698",
    title: "The Last Sunrise", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/3PWJqDfygN0YNNjWsDUOXclCp3h.jpg"
  },
  { 
    id: "Facing El Chapo", 
    tmdbId: "1621552",
    title: "Facing El Chapo", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/z8eF0ACFFKtIZ4pUeo02PCzxRVO.jpg"
  },
  { 
    id: "Toxic: A Fairy Tale for Grown-ups", 
    tmdbId: "1213243",
    title: "Toxic: A Fairy Tale for Grown-ups", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/oiIPU4lvnI0Ag2K9cyAi44eCaoE.jpg"
  },
  { 
    id: "Minions & Monsters", 
    tmdbId: "1315772",
    title: "Minions & Monsters", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/4LwvU9SZc8QQzW1X1FAPhNbXnEU.jpg",
    manualEmbed: "https://cinema8.com/video/WDezkkzX"
  },
  { 
    id: "Obsession", 
    tmdbId: "1339713",
    title: "Obsession", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/bRwnj8WEKBCvmfeUNOukJPwB43K.jpg"
  },
  { 
    id: "Rage of Stars", 
    tmdbId: "1323244",
    title: "Rage of Stars", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/oLld47ZT1I3iecM3OWhIphohQUJ.jpg"
  },
  { 
    id: "Toy Story 5", 
    tmdbId: "1084244",
    title: "Toy Story 5", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/sfQtVlIHljToOwYjhe21KPGzZWK.jpg"
  },
  { 
    id: "Pinocchio: Unstrung", 
    tmdbId: "1232569",
    title: "Pinocchio: Unstrung", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/eUJXk3bTvLBi5Zcb0BCedZU7lVL.jpg"
  },
  { 
    id: "Moana: Live Action", 
    tmdbId: "1108427",
    title: "Moana: Live Action", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/zKVgiv5qHCvCLT4A2ymJi5QeXDH.jpg"
  },
  { 
    id: "Coyote vs. Acme", 
    tmdbId: "1204680",
    title: "Coyote vs. Acme", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/vhv7lBWYM0DUuNU2a0V7Rhq21dD.jpg"
  },
  { 
    id: "Colony", 
    tmdbId: "1375646",
    title: "Colony", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/tN799oUR0f1gUKDYdMNrDaY7I51.jpg"
  },
  { 
    id: "Ghost in the Cell", 
    tmdbId: "1393326",
    title: "Ghost in the Cell", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/zxcMdx0w5Zmg8yZuuiS7CJ8vOea.jpg"
  },
  { 
    id: "The Secret Woman", 
    tmdbId: "1631807",
    title: "The Secret Woman", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/5FC5vUHFz0fbJOd0bhyzJpCSLrc.jpg"
  },
  { 
    id: "Barreda", 
    tmdbId: "1471168",
    title: "Barreda", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/hnr0QkZSDLlrJTvU2ecco65wcHo.jpg"
  },
  { 
    id: "Buddy", 
    tmdbId: "1514026",
    title: "Buddy", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6Lh4ZlsAISFQFVfLZ90sE9ycVnN.jpg"
  },
  { 
    id: "The Whisper Man", 
    tmdbId: "860508",
    title: "The Whisper Man", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6UqflU8Qqkz7Dq4swJPqs0ZJjY4.jpg"
  },
  { 
    id: "Yellow Mirror", 
    tmdbId: "1729723",
    title: "Yellow Mirror", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/1zdGvJAuuXC7dA3eV61OtUJNyjQ.jpg"
  },
  { 
    id: "The Dog Stars", 
    tmdbId: "1384216",
    title: "The Dog Stars", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/5O616X9vmRzQdB68PHzBewPittd.jpg"
  },
  { 
    id: "It Ends", 
    tmdbId: "1422011",
    title: "It Ends", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6dfAGvZWbJnzWfSZ8gxFj63BNAH.jpg"
  },
  { 
    id: "Irumudi", 
    tmdbId: "1441228",
    title: "Irumudi", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/sPePQmJRKkB14sGjB7zBkLJkaTW.jpg"
  },
  { 
    id: "Insidious: Out of the Further", 
    tmdbId: "1291595",
    title: "Insidious: Out of the Further", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/4tTrW9dXCByS5wt2pXVWb58zNjz.jpg"
  },
  { 
    id: "Sunny Dancer", 
    tmdbId: "1280015",
    title: "Sunny Dancer", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/mXdejPfToSVFlEzv1QYoIh2N53e.jpg"
  },
  { 
    id: "The Brink of War", 
    tmdbId: "192139",
    title: "The Brink of War", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/hFborW6HmffKL05GIWlkTFdvVpN.jpg"
  },
  { 
    id: "Untold Raygun: Breaking Badly", 
    tmdbId: "1739202",
    title: "Untold Raygun: Breaking Badly", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/3pnlJjsGtrUp3cPEOLzkR0sPQAK.jpg"
  },
  { 
    id: "Just Play Dead", 
    tmdbId: "1480574",
    title: "Just Play Dead", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/glALx6QaIgw1u4joXsnfHTjWi6D.jpg"
  },
  { 
    id: "The Wrong Girls", 
    tmdbId: "1226699",
    title: "The Wrong Girls", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/iEJshwO6g4WKTP4HJgCHRTJMWEd.jpg"
  },
  { 
    id: "I Want Your Sex", 
    tmdbId: "1288059",
    title: "I Want Your Sex", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/pR7SIX3AwqdoD96OI44oLG98e7g.jpg"
  },
  { 
    id: "Gohan", 
    tmdbId: "1319522",
    title: "Gohan", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/4LwvU9SZc8QQzW1X1FAPhNbXnEU.jpg"
  },
  { 
    id: "The Weightmovie-32", 
    tmdbId: "1433583",
    title: "The Weight", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/8i5iZV50CoEtmDCFM7RSxCkpE8h.jpg"
  },
  { 
    id: "The Mongooose", 
    tmdbId: "1294189",
    title: "The Mongooose", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/eSS5mvSG84UUuvtbHel5Yu3Wik4.jpg"
  },
  { 
    id: "The Gentleman Theif", 
    tmdbId: "1458215",
    title: "The Gentleman Theif", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/oMutDMODnbCZf46w0dK4wncQmDB.jpg"
  },
  { 
    id: "Man of War", 
    tmdbId: "1705729",
    title: "Man of War", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/vt0RqHlqfUzeiBEVQvp43yY2076.jpg"
  },
  { 
    id: "Hadestown: The Musical", 
    tmdbId: "1439808",
    title: "Hadestown: The Musical", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/iJNVygzkuOSCOdCPNI1nLSeF7sz.jpg"
  },
  { 
    id: "Her Private Hell", 
    tmdbId: "1469342",
    title: "Her Private Hell", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/kiFacg75KVjy0AM3S4QmbPas8zL.jpg"
  },
  { 
    id: "Batman: Knightfall Part 1: Knightfall", 
    tmdbId: "1560520",
    title: "Batman: Knightfall Part 1: Knightfall", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/360qdtu2hLnqMu8SVHMywn420w1.jpg"
  },
  { 
    id: "Motor City", 
    tmdbId: "87513",
    title: "Motor City", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/dx2dblJL3GAKcXXXPjC2FSaMTWW.jpg"
  },
  { 
    id: "PAW Patrol: The Dino Movie", 
    tmdbId: "1185806",
    title: "PAW Patrol: The Dino Movie", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/qnin56Syy5rbG7KCaxWY7SPuy6p.jpg"
  },
  { 
    id: "Bury the Devil", 
    tmdbId: "1432706",
    title: "Bury the Devil", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/yQ3GeVsebrhOPIBhIdoSslbndEv.jpg"
  },
  { 
    id: "The Oldham Man and the Sea", 
    tmdbId: "1682276",
    title: "The Oldham Man and the Sea", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/wcfuythlTfVXm0yZHnBWGxXoUjt.jpg"
  },
  { 
    id: "The Birthday Party", 
    tmdbId: "1339175",
    title: "The Birthday Party", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/sXN4IvB4hM2AYYx9BhdzhokrjvH.jpg"
  },
  { 
    id: "Yellow Eyes", 
    tmdbId: "1314826",
    title: "Yellow Eyes", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/tdIqb0g8fimv2bXIEZdWu6Zfywt.jpg"
  },
  { 
    id: "The End of Oak Street", 
    tmdbId: "1101383",
    title: "The End of Oak Street", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/fYXqpgPmHMphSF2W30GbTeJVIa5.jpg",
    manualEmbed: "https://cinema8.com/video/PO8PwYyO"
  },
  { 
    id: "Pose", 
    tmdbId: "79084",
    title: "Pose", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/5f23i30nFJz0nrd3DGheOCqXa2P.jpg"
  },
  { 
    id: "Truly Naked", 
    tmdbId: "1281195",
    title: "Truly Naked", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/y23B9EnC0LDw8zMKlpXJauyLH7k.jpg",
    manualEmbed: "https://cinema8.com/video/jXax7PlD"
  },
  { 
    id: "Camp Rock 3", 
    tmdbId: "1493400",
    title: "Camp Rock 3", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/rS7byWK9cfPfdLeFNlRIaJxH9mN.jpg"
  },
  { 
    id: "Your Attention Please", 
    tmdbId: "1629373",
    title: "Your Attention Please", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/lVzZJlBP8EqWtx9EF0LIT55ve3H.jpg"
  },
  { 
    id: "Narcissist's Playbook", 
    tmdbId: "1680072",
    title: "Narcissist's Playbook", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/nuI0XoN1p92MpVlSNtkxFzM3u6p.jpg"
  },
  { 
    id: "Gail Daughtry and the Celebrity Sex Pass", 
    tmdbId: "1476682",
    title: "Gail Daughtry and the Celebrity Sex Pass", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/98T4bnMjJs71WOVZoeY8edZhfgZ.jpg",
    manualEmbed: "https://cinema8.com/video/WDezkkzX"
  },
  { 
    id: "The Foreign Exchange Student 2: The Hunt", 
    tmdbId: "1031637",
    title: "The Foreign Exchange Student 2: The Hunt", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/aHy0ZifxTGN8QpF0QGUVXrIvCky.jpg"
  },
  { 
    id: "The Drop Spot", 
    tmdbId: "1057920",
    title: "The Drop Spot", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/iZL6f4sFwYOnh2CPm8IKu3TxyHn.jpg"
  },
  { 
    id: "The Exit Row", 
    tmdbId: "900717",
    title: "The Exit Row", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/v1nJW1hBICXyFyMOG2sm7GVj3Il.jpg"
  },
  { 
    id: "Free Fall", 
    tmdbId: "814855",
    title: "Free Fall", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/m1OGsVkwnEbf4frMtn2VS1nHjlv.jpg"
  },
  { 
    id: "Don't Say Good Luck", 
    tmdbId: "1504358",
    title: "Don't Say Good Luck", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/dgTKahWonzVLeN8Lm22WR2S7D0A.jpg"
  },
  { 
    id: "All Night Wrong", 
    tmdbId: "1361969",
    title: "All Night Wrong", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/jFN9LcCG4a02wRWm2qfJ6nLY8BO.jpg"
  },
  { 
    id: "Dreams", 
    tmdbId: "31710990",
    title: "Dreams", 
    poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3t5Mh7vMpC7DMa0cW3cH4g3atqaoAHIsHNet_NEqQog&s=10"
  },
  { 
    id: "Travis Barker: Louder Than Fear", 
    tmdbId: "1695225",
    title: "Travis Barker: Louder Than Fear", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/nFjdTYHi7tRjijf3utArceQFtRi.jpg"
  },
  { 
    id: "Night Nurse", 
    tmdbId: "1596260",
    title: "Night Nurse", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/cvj1d5avMYRxK8FVpq07UqLrcbZ.jpg"
  },
  { 
    id: "Air Force Elite: Thunderbirds", 
    tmdbId: "1457515",
    title: "Air Force Elite: Thunderbirds", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/hsJtBhMxNDGzW5KcQ9qz3EQGnEt.jpg"
  },
  { 
    id: "Saccharine", 
    tmdbId: "1363387",
    title: "Saccharine", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/bCHPB5WZy4T0Rerh1GTuQLzU0rF.jpg"
  },
  { 
    id: "Young Washington", 
    tmdbId: "1308767",
    title: "Young Washington", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6CdoTKnRQHJkjRGxTefFGkPQplB.jpg"
  },
  { 
    id: "Our Hero, Balthazar", 
    tmdbId: "1465557",
    title: "Our Hero, Balthazar", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/mxVTarvl5OLoU9YWIYygby6R0KI.jpg"
  },
  { 
    id: "The Last Guest of the Holloway Motel", 
    tmdbId: "1465790",
    title: "The Last Guest of the Holloway Motel", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/yF7gHhdRINMkj9ez4Dxx4kbkWv.jpg"
  },
  { 
    id: "The Invite", 
    tmdbId: "950028",
    title: "The Invite", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/b7Dr8Chzse8VagexAporUu2RtLx.jpg"
  },
  { 
    id: "Jackass: Best and Last", 
    tmdbId: "1612018",
    title: "Jackass: Best and Last", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/tfgccePxnswMqhmtxafliLlcCVR.jpg"
  },
  { 
    id: "The Last House", 
    tmdbId: "1284041",
    title: "The Last House", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6JU7E8Vv2M11egkctWVOScxWR75.jpg"
  },
  { 
    id: "Casa Grande", 
    tmdbId: "1469164",
    title: "Casa Grande", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/mE9E4nsGM91Cf4b1s6nOOdUAE9P.jpg"
  },
  { 
    id: "The Isolate Theif", 
    tmdbId: "1404304",
    title: "The Isolate Theif", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/gmmCh2BvTKp0YGT2FYG0eOQJELi.jpg"
  },
  { 
    id: "Housemaid", 
    tmdbId: "1368166",
    title: "Housemaid", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/cWsBscZzwu5brg9YjNkGewRUvJX.jpg"
  },
  { 
    id: "Lucky Strike", 
    tmdbId: "1594914",
    title: "Lucky Strike", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/7AEBdyGYXumXWmMFeynE8227KeZ.jpg"
  },
  { 
    id: "Jailhouse to Milhouse", 
    tmdbId: "1184341",
    title: "Jailhouse to Milhouse", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/9QR5hejamYx2nMtxUHNO96bFsoK.jpg"
  },
  { 
    id: "Jimmie & Stevie Ray Vaughan: Brothers in Blues", 
    tmdbId: "1092074",
    title: "Jimmie & Stevie Ray Vaughan: Brothers in Blues", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6wBUhmgMjf6bqvfrgKsHEUxwH7T.jpg"
  },
  { 
    id: "Submerged: The Hunley", 
    tmdbId: "1741192",
    title: "Submerged: The Hunley", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/zY3xxTscRu7RMSVECppWQQyxHA6.jpg"
  },
  { 
    id: "The Christmas Spirit", 
    tmdbId: "882109",
    title: "The Christmas Spirit", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/6a8nocaDfYOehQzeqZMvni9WqVq.jpg"
  },
  { 
    id: "Soulm8te", 
    tmdbId: "1307118",
    title: "Soulm8te", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/bNErActDctl6cdUGw9pnjSCmyhQ.jpg"
  },
  { 
    id: "Time and Water", 
    tmdbId: "1596278",
    title: "Time and Water", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/1hksIYHtsHCG70nZKbnrYBPk600.jpg"
  },
  { 
    id: "Maddie's Secret", 
    tmdbId: "1517868",
    title: "Maddie's Secret", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/vADal7sH7E9xFr4w2k4V3EPSzF6.jpg"
  },
  { 
    id: "Nightborn", 
    tmdbId: "964849",
    title: "Nightborn", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/e9ALgOANOJbcFpw84MbafK3xvD2.jpg"
  },
  { 
    id: "Rose of Nevada", 
    tmdbId: "1399525",
    title: "Rose of Nevada", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/aDBZ2PGgUbcGjyX7ZCXLOk4AFQH.jpg"
  },
  { 
    id: "Snoopy Presents: There's No Place Like Home Snoopy", 
    tmdbId: "1698575",
    title: "Snoopy Presents: There's No Place Like Home Snoopy", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/YbC4SlzE030BgxWdKDdlatMh5W.jpg"
  },
  { 
    id: "The Devil's Mouth", 
    tmdbId: "1409853",
    title: "The Devil's Mouth", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/dx2dblJL3GAKcXXXPjC2FSaMTWW.jpg"
  },
  { 
    id: "Neglected", 
    tmdbId: "1185806",
    title: "Neglected", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/A0gqKFmJ7OArcFob49PErNvzN66.jpg"
  },
  { 
    id: "Oracle of the Dragon", 
    tmdbId: "1731443",
    title: "Oracle of the Dragon", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/lxVFFVIdXDnQCAFAllCrNfPDHFv.jpg"
  },
  { 
    id: "Leviticus", 
    tmdbId: "1564614",
    title: "Leviticus", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/gnAsZvBygplNpp8PtjoTEYv3VPB.jpg"
  },
  { 
    id: "Cold War 1994", 
    tmdbId: "1499071",
    title: "Cold War 1994", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/9C3ZxhGJvdpxmNC5PhkBMwzTMRT.jpg"
  },
  { 
    id: "Supergirl", 
    tmdbId: "1081003",
    title: "Supergirl", 
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/uhzRnTW4DM13UQBvZP3eVNzQTuz.jpg"
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