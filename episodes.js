// ==========================================
// DEYMFLIX - TV Series & Episodes Handler
// (Filipino/English series. K-Drama series → kdrama-episode.js)
//
// MANUAL DOWNLOAD LINKS (optional, per series or per episode):
//   Add to any series object:     manualDownload: "https://…/file.mp4",
//                                 manualDownloadSub: "https://…/subs.srt"
//   …or to a single episode:      manualDownload: "…", manualDownloadSub: "…"
// The Download button prefers the episode link, then the series link,
// then the direct CDN file, then embed stream capture. Titles with NO
// link anywhere show a polite "cannot be downloaded" dialog.
// Google Drive share links are also fine — the app converts them to
// direct downloads automatically.
 // ==========================================

const seriesData = [
  {
    id: "Love-U-Lots",
    title: "Love U Lots",
    isFilipino: true,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/qOjY3XE4C4prKGmFyJaPxANrhxI.jpg",
    seasons: [
      {
        seasonNumber: 1,
        episodes: [
          {
            episodeNumber: 1,
            title: "Episode 1 - The Estranged Girl",
            embedUrl: "https://deymflix-media.b-cdn.net/Love+U+Lots/Love.U.Lots.(2026).VONE.S01E01.1080p.WEB-DL.AAC2.0.x264-DarkRip.mkv"
          },
          {
            episodeNumber: 2,
            title: "Episode 2 - Meet the Others",
            embedUrl: "https://deymflix-media.b-cdn.net/Love+U+Lots/Love.U.Lots.(2026).VONE.S01E02.1080p.WEB-DL.AAC2.0.x264-DarkRip.mkv"
          },
          {
            episodeNumber: 3,
            title: "Episode 3 - Paint Me Closer",
            embedUrl: "https://deymflix-media.b-cdn.net/Love+U+Lots/Love.U.Lots.(2026).VONE.S01E03.1080p.WEB-DL.AAC2.0.x264-DarkRip.mkv"
          },
          {
            episodeNumber: 4,
            title: "Episode 4 - Can't Stay Away",
            embedUrl: "https://deymflix-media.b-cdn.net/Love+U+Lots/Love.U.Lots.(2026).VONE.S01E04.1080p.WEB-DL.AAC2.0.x264-DarkRip.mkv"
          },
          {
            episodeNumber: 5,
            title: "Episode 5 - The Original One",
            embedUrl: "https://deymflix-media.b-cdn.net/Love+U+Lots/Love.U.Lots.(2026).VONE.S01E05.1080p.WEB-DL.AAC2.0.x264-DarkRip.mkv"
          },
          {
            episodeNumber: 6,
            title: "Episode 6 - Clingy Past",
            embedUrl: "https://deymflix-media.b-cdn.net/Love+U+Lots/Love.U.Lots.(2026).VONE.S01E06.1080p.WEB-DL.AAC2.0.x264-DarkRip.mkv"
          }
        ]
      }
    ]
  },
  {
    id: "Crew-Girl",
    title: "Crew Girl",
    isFilipino: false,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/tzf21i1ETZEu7i787ED3WThROH.jpg",
    seasons: [
      {
        seasonNumber: 1,
        episodes: [
          {
            episodeNumber: 1,
            title: "Episode 1 - The Catch",
            embedUrl: "https://deymflix-media.b-cdn.net/English+Series/Crew+Girl/Crew.Girl.S01e01.720P.Hevc.X265-Megusta%5BEztvx.To%5D.mp4"
          },
          {
            episodeNumber: 2,
            title: "Episode 2 - The Hateful Eight",
            embedUrl: "https://deymflix-media.b-cdn.net/English+Series/Crew+Girl/Crew.Girl.S01e02.720P.Hevc.X265-Megusta%5BEztvx.To%5D.mp4"
          },
          {
            episodeNumber: 3,
            title: "Episode 3 - Flight Crew",
            embedUrl: "https://deymflix-media.b-cdn.net/English+Series/Crew+Girl/Crew.Girl.S01e03.720P.Hevc.X265-Megusta%5BEztvx.To%5D.mp4"
          },
          {
            episodeNumber: 4,
            title: "Episode 4 - True Rowmance",
            embedUrl: "https://deymflix-media.b-cdn.net/English+Series/Crew+Girl/Crew.Girl.S01e04.720P.Hevc.X265-Megusta%5BEztvx.To%5D.mp4"
          },
          {
            episodeNumber: 5,
            title: "Episode 5 - Anatomy of a Fall Formal",
            embedUrl: "https://deymflix-media.b-cdn.net/English+Series/Crew+Girl/Crew.Girl.S01e05.720P.Hevc.X265-Megusta%5BEztvx.To%5D.mp4"
          },
          {
            episodeNumber: 6,
            title: "Episode 6 - Bad Break",
            embedUrl: "https://deymflix-media.b-cdn.net/English+Series/Crew+Girl/Crew.Girl.S01e06.720P.Hevc.X265-Megusta%5BEztvx.To%5D.mp4"
          },
          {
            episodeNumber: 7,
            title: "Episode 7 - Under Pressure",
            embedUrl: "https://deymflix-media.b-cdn.net/English+Series/Crew+Girl/Crew.Girl.S01e07.720P.Hevc.X265-Megusta%5BEztvx.To%5D.mp4"
          },
          {
            episodeNumber: 8,
            title: "Episode 8 - O Coxswain, My Coxswain",
            embedUrl: "https://deymflix-media.b-cdn.net/English+Series/Crew+Girl/Crew.Girl.S01e08.720P.Hevc.X265-Megusta%5BEztvx.To%5D.mp4"
          }
        ]
      }
    ]
  },
  {
    id: "The Mentalist",
    title: "The Mentalist",
    isFilipino: false,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/acYXu4KaDj1NIkMgObnhe4C4a0T.jpg",
    seasons: [
      {
        seasonNumber: 1,
        episodes: [
          {
            episodeNumber: 1,
            title: "Episode 1 - The Catch",
            embedUrl: "cos:tv/5920/1/1"
          },
          {
            episodeNumber: 2,
            title: "Episode 2 - The Hateful Eight",
            embedUrl: "cos:tv/5920/1/2"
          },
          {
            episodeNumber: 3,
            title: "Episode 3 - Flight Crew",
            embedUrl: "cos:tv/5920/1/3"
          },
          {
            episodeNumber: 4,
            title: "Episode 4 - True Rowmance",
            embedUrl: "cos:tv/5920/1/4"
          },
          {
            episodeNumber: 5,
            title: "Episode 5 - Anatomy of a Fall Formal",
            embedUrl: "cos:tv/5920/1/5"
          },
          {
            episodeNumber: 6,
            title: "Episode 6 - Bad Break",
            embedUrl: "cos:tv/5920/1/6"
          },
          {
            episodeNumber: 7,
            title: "Episode 7 - Under Pressure",
            embedUrl: "cos:tv/5920/1/7"
          },
          {
            episodeNumber: 8,
            title: "Episode 8 - O Coxswain, My Coxswain",
            embedUrl: "cos:tv/5920/1/8"
          },
          {
            episodeNumber: 9,
            title: "Episode 1 - The Catch",
            embedUrl: "cos:tv/5920/1/9"
          },
          {
            episodeNumber: 10,
            title: "Episode 2 - The Hateful Eight",
            embedUrl: "cos:tv/5920/1/10"
          },
          {
            episodeNumber: 11,
            title: "Episode 3 - Flight Crew",
            embedUrl: "cos:tv/5920/1/11"
          },
          {
            episodeNumber: 12,
            title: "Episode 4 - True Rowmance",
            embedUrl: "cos:tv/5920/1/12"
          },
          {
            episodeNumber: 13,
            title: "Episode 5 - Anatomy of a Fall Formal",
            embedUrl: "cos:tv/5920/1/13"
          },
          {
            episodeNumber: 14,
            title: "Episode 6 - Bad Break",
            embedUrl: "cos:tv/5920/1/14"
          },
          {
            episodeNumber: 15,
            title: "Episode 7 - Under Pressure",
            embedUrl: "cos:tv/5920/1/15"
          },
          {
            episodeNumber: 16,
            title: "Episode 8 - O Coxswain, My Coxswain",
            embedUrl: "cos:tv/5920/1/16"
          },
          {
            episodeNumber: 17,
            title: "Episode 1 - The Catch",
            embedUrl: "cos:tv/5920/1/17"
          },
          {
            episodeNumber: 18,
            title: "Episode 2 - The Hateful Eight",
            embedUrl: "cos:tv/5920/1/18"
          },
          {
            episodeNumber: 19,
            title: "Episode 3 - Flight Crew",
            embedUrl: "cos:tv/5920/1/19"
          },
          {
            episodeNumber: 20,
            title: "Episode 4 - True Rowmance",
            embedUrl: "cos:tv/5920/1/20"
          },
          {
            episodeNumber: 21,
            title: "Episode 5 - Anatomy of a Fall Formal",
            embedUrl: "cos:tv/5920/1/21"
          },
          {
            episodeNumber: 22,
            title: "Episode 6 - Bad Break",
            embedUrl: "cos:tv/5920/1/22"
          },
          {
            episodeNumber: 23,
            title: "Episode 7 - Under Pressure",
            embedUrl: "cos:tv/5920/1/23"
          },
          {
            episodeNumber: 24,
            title: "Episode 8 - O Coxswain, My Coxswain",
            embedUrl: "cos:tv/5920/1/24"
          }
        ]
      },
      {
        seasonNumber: 2,
        episodes: [
          {
            episodeNumber: 1,
            title: "Episode 1 - The Catch",
            embedUrl: "cos:tv/5920/2/1"
          },
          {
            episodeNumber: 2,
            title: "Episode 2 - The Hateful Eight",
            embedUrl: "cos:tv/5920/2/2"
          },
          {
            episodeNumber: 3,
            title: "Episode 3 - Flight Crew",
            embedUrl: "cos:tv/5920/2/3"
          },
          {
            episodeNumber: 4,
            title: "Episode 4 - True Rowmance",
            embedUrl: "cos:tv/5920/2/4"
          },
          {
            episodeNumber: 5,
            title: "Episode 5 - Anatomy of a Fall Formal",
            embedUrl: "cos:tv/5920/1/5"
          },
          {
            episodeNumber: 6,
            title: "Episode 6 - Bad Break",
            embedUrl: "cos:tv/5920/2/6"
          },
          {
            episodeNumber: 7,
            title: "Episode 7 - Under Pressure",
            embedUrl: "cos:tv/5920/2/7"
          },
          {
            episodeNumber: 8,
            title: "Episode 8 - O Coxswain, My Coxswain",
            embedUrl: "cos:tv/5920/2/8"
          },
          {
            episodeNumber: 9,
            title: "Episode 1 - The Catch",
            embedUrl: "cos:tv/5920/2/9"
          },
          {
            episodeNumber: 10,
            title: "Episode 2 - The Hateful Eight",
            embedUrl: "cos:tv/5920/2/10"
          },
          {
            episodeNumber: 11,
            title: "Episode 3 - Flight Crew",
            embedUrl: "cos:tv/5920/2/11"
          },
          {
            episodeNumber: 12,
            title: "Episode 4 - True Rowmance",
            embedUrl: "cos:tv/5920/2/12"
          },
          {
            episodeNumber: 13,
            title: "Episode 5 - Anatomy of a Fall Formal",
            embedUrl: "cos:tv/5920/2/13"
          },
          {
            episodeNumber: 14,
            title: "Episode 6 - Bad Break",
            embedUrl: "cos:tv/5920/2/14"
          },
          {
            episodeNumber: 15,
            title: "Episode 7 - Under Pressure",
            embedUrl: "cos:tv/5920/2/15"
          },
          {
            episodeNumber: 16,
            title: "Episode 8 - O Coxswain, My Coxswain",
            embedUrl: "cos:tv/5920/2/16"
          },
          {
            episodeNumber: 17,
            title: "Episode 1 - The Catch",
            embedUrl: "cos:tv/5920/2/17"
          },
          {
            episodeNumber: 18,
            title: "Episode 2 - The Hateful Eight",
            embedUrl: "cos:tv/5920/2/18"
          },
          {
            episodeNumber: 19,
            title: "Episode 3 - Flight Crew",
            embedUrl: "cos:tv/5920/2/19"
          },
          {
            episodeNumber: 20,
            title: "Episode 4 - True Rowmance",
            embedUrl: "cos:tv/5920/2/20"
          },
          {
            episodeNumber: 21,
            title: "Episode 5 - Anatomy of a Fall Formal",
            embedUrl: "cos:tv/5920/2/21"
          },
          {
            episodeNumber: 22,
            title: "Episode 6 - Bad Break",
            embedUrl: "cos:tv/5920/2/22"
          },
          {
            episodeNumber: 23,
            title: "Episode 7 - Under Pressure",
            embedUrl: "cos:tv/5920/2/23"
          }
    
        ]
      },
      {
        seasonNumber: 3,
        episodes: [
          {
            episodeNumber: 1,
            title: "Episode 1 - The Catch",
            embedUrl: "cos:tv/5920/3/1"
          },
          {
            episodeNumber: 2,
            title: "Episode 2 - The Hateful Eight",
            embedUrl: "cos:tv/5920/3/2"
          },
          {
            episodeNumber: 3,
            title: "Episode 3 - Flight Crew",
            embedUrl: "cos:tv/5920/3/3"
          },
          {
            episodeNumber: 4,
            title: "Episode 4 - True Rowmance",
            embedUrl: "cos:tv/5920/3/4"
          },
          {
            episodeNumber: 5,
            title: "Episode 5 - Anatomy of a Fall Formal",
            embedUrl: "cos:tv/5920/3/5"
          },
          {
            episodeNumber: 6,
            title: "Episode 6 - Bad Break",
            embedUrl: "cos:tv/5920/3/6"
          },
          {
            episodeNumber: 7,
            title: "Episode 7 - Under Pressure",
            embedUrl: "cos:tv/5920/3/7"
          },
          {
            episodeNumber: 8,
            title: "Episode 8 - O Coxswain, My Coxswain",
            embedUrl: "cos:tv/5920/3/8"
          },
          {
            episodeNumber: 9,
            title: "Episode 1 - The Catch",
            embedUrl: "cos:tv/5920/3/9"
          },
          {
            episodeNumber: 10,
            title: "Episode 2 - The Hateful Eight",
            embedUrl: "cos:tv/5920/3/10"
          },
          {
            episodeNumber: 11,
            title: "Episode 3 - Flight Crew",
            embedUrl: "cos:tv/5920/3/11"
          },
          {
            episodeNumber: 12,
            title: "Episode 4 - True Rowmance",
            embedUrl: "cos:tv/5920/3/12"
          },
          {
            episodeNumber: 13,
            title: "Episode 5 - Anatomy of a Fall Formal",
            embedUrl: "cos:tv/5920/3/13"
          },
          {
            episodeNumber: 14,
            title: "Episode 6 - Bad Break",
            embedUrl: "cos:tv/5920/3/14"
          },
          {
            episodeNumber: 15,
            title: "Episode 7 - Under Pressure",
            embedUrl: "cos:tv/5920/3/15"
          },
          {
            episodeNumber: 16,
            title: "Episode 8 - O Coxswain, My Coxswain",
            embedUrl: "cos:tv/5920/3/16"
          },
          {
            episodeNumber: 17,
            title: "Episode 1 - The Catch",
            embedUrl: "cos:tv/5920/3/17"
          },
          {
            episodeNumber: 18,
            title: "Episode 2 - The Hateful Eight",
            embedUrl: "cos:tv/5920/3/18"
          },
          {
            episodeNumber: 19,
            title: "Episode 3 - Flight Crew",
            embedUrl: "cos:tv/5920/3/19"
          },
          {
            episodeNumber: 20,
            title: "Episode 4 - True Rowmance",
            embedUrl: "cos:tv/5920/3/20"
          },
          {
            episodeNumber: 21,
            title: "Episode 5 - Anatomy of a Fall Formal",
            embedUrl: "cos:tv/5920/3/21"
          },
          {
            episodeNumber: 22,
            title: "Episode 6 - Bad Break",
            embedUrl: "cos:tv/5920/3/22"
          },
          {
            episodeNumber: 23,
            title: "Episode 7 - Under Pressure",
            embedUrl: "cos:tv/5920/3/23"
          },
          {
            episodeNumber: 24,
            title: "Episode 8 - O Coxswain, My Coxswain",
            embedUrl: "cos:tv/5920/3/24"
          }
        ]
      },
      {
        seasonNumber: 4,
        episodes: [
          {
            episodeNumber: 1,
            title: "Episode 1 - The Catch",
            embedUrl: "cos:tv/5920/4/1"
          },
          {
            episodeNumber: 2,
            title: "Episode 2 - The Hateful Eight",
            embedUrl: "cos:tv/5920/4/2"
          },
          {
            episodeNumber: 3,
            title: "Episode 3 - Flight Crew",
            embedUrl: "cos:tv/5920/4/3"
          },
          {
            episodeNumber: 4,
            title: "Episode 4 - True Rowmance",
            embedUrl: "cos:tv/5920/4/4"
          },
          {
            episodeNumber: 5,
            title: "Episode 5 - Anatomy of a Fall Formal",
            embedUrl: "cos:tv/5920/4/5"
          },
          {
            episodeNumber: 6,
            title: "Episode 6 - Bad Break",
            embedUrl: "cos:tv/5920/4/6"
          },
          {
            episodeNumber: 7,
            title: "Episode 7 - Under Pressure",
            embedUrl: "cos:tv/5920/4/7"
          },
          {
            episodeNumber: 8,
            title: "Episode 8 - O Coxswain, My Coxswain",
            embedUrl: "cos:tv/5920/4/8"
          },
          {
            episodeNumber: 9,
            title: "Episode 1 - The Catch",
            embedUrl: "cos:tv/5920/4/9"
          },
          {
            episodeNumber: 10,
            title: "Episode 2 - The Hateful Eight",
            embedUrl: "cos:tv/5920/4/10"
          },
          {
            episodeNumber: 11,
            title: "Episode 3 - Flight Crew",
            embedUrl: "cos:tv/5920/4/11"
          },
          {
            episodeNumber: 12,
            title: "Episode 4 - True Rowmance",
            embedUrl: "cos:tv/5920/4/12"
          },
          {
            episodeNumber: 13,
            title: "Episode 5 - Anatomy of a Fall Formal",
            embedUrl: "cos:tv/5920/4/13"
          },
          {
            episodeNumber: 14,
            title: "Episode 6 - Bad Break",
            embedUrl: "cos:tv/5920/4/14"
          },
          {
            episodeNumber: 15,
            title: "Episode 7 - Under Pressure",
            embedUrl: "cos:tv/5920/4/15"
          },
          {
            episodeNumber: 16,
            title: "Episode 8 - O Coxswain, My Coxswain",
            embedUrl: "cos:tv/5920/4/16"
          },
          {
            episodeNumber: 17,
            title: "Episode 1 - The Catch",
            embedUrl: "cos:tv/5920/4/17"
          },
          {
            episodeNumber: 18,
            title: "Episode 2 - The Hateful Eight",
            embedUrl: "cos:tv/5920/4/18"
          },
          {
            episodeNumber: 19,
            title: "Episode 3 - Flight Crew",
            embedUrl: "cos:tv/5920/4/19"
          },
          {
            episodeNumber: 20,
            title: "Episode 4 - True Rowmance",
            embedUrl: "cos:tv/5920/4/20"
          },
          {
            episodeNumber: 21,
            title: "Episode 5 - Anatomy of a Fall Formal",
            embedUrl: "cos:tv/5920/4/21"
          },
          {
            episodeNumber: 22,
            title: "Episode 6 - Bad Break",
            embedUrl: "cos:tv/5920/4/22"
          },
          {
            episodeNumber: 23,
            title: "Episode 7 - Under Pressure",
            embedUrl: "cos:tv/5920/4/23"
          },
          {
            episodeNumber: 24,
            title: "Episode 8 - O Coxswain, My Coxswain",
            embedUrl: "cos:tv/5920/4/24"
          }
        ]
      },
      {
        seasonNumber: 5,
        episodes: [
          {
            episodeNumber: 1,
            title: "Episode 1 - The Catch",
            embedUrl: "cos:tv/5920/5/1"
          },
          {
            episodeNumber: 2,
            title: "Episode 2 - The Hateful Eight",
            embedUrl: "cos:tv/5920/5/2"
          },
          {
            episodeNumber: 3,
            title: "Episode 3 - Flight Crew",
            embedUrl: "cos:tv/5920/5/3"
          },
          {
            episodeNumber: 4,
            title: "Episode 4 - True Rowmance",
            embedUrl: "cos:tv/5920/5/4"
          },
          {
            episodeNumber: 5,
            title: "Episode 5 - Anatomy of a Fall Formal",
            embedUrl: "cos:tv/5920/5/5"
          },
          {
            episodeNumber: 6,
            title: "Episode 6 - Bad Break",
            embedUrl: "cos:tv/5920/5/6"
          },
          {
            episodeNumber: 7,
            title: "Episode 7 - Under Pressure",
            embedUrl: "cos:tv/5920/5/7"
          },
          {
            episodeNumber: 8,
            title: "Episode 8 - O Coxswain, My Coxswain",
            embedUrl: "cos:tv/5920/5/8"
          },
          {
            episodeNumber: 9,
            title: "Episode 1 - The Catch",
            embedUrl: "cos:tv/5920/5/9"
          },
          {
            episodeNumber: 10,
            title: "Episode 2 - The Hateful Eight",
            embedUrl: "cos:tv/5920/5/10"
          },
          {
            episodeNumber: 11,
            title: "Episode 3 - Flight Crew",
            embedUrl: "cos:tv/5920/5/11"
          },
          {
            episodeNumber: 12,
            title: "Episode 4 - True Rowmance",
            embedUrl: "cos:tv/5920/5/12"
          },
          {
            episodeNumber: 13,
            title: "Episode 5 - Anatomy of a Fall Formal",
            embedUrl: "cos:tv/5920/5/13"
          },
          {
            episodeNumber: 14,
            title: "Episode 6 - Bad Break",
            embedUrl: "cos:tv/5920/5/14"
          },
          {
            episodeNumber: 15,
            title: "Episode 7 - Under Pressure",
            embedUrl: "cos:tv/5920/5/15"
          },
          {
            episodeNumber: 16,
            title: "Episode 8 - O Coxswain, My Coxswain",
            embedUrl: "cos:tv/5920/5/16"
          },
          {
            episodeNumber: 17,
            title: "Episode 1 - The Catch",
            embedUrl: "cos:tv/5920/5/17"
          },
          {
            episodeNumber: 18,
            title: "Episode 2 - The Hateful Eight",
            embedUrl: "cos:tv/5920/5/18"
          },
          {
            episodeNumber: 19,
            title: "Episode 3 - Flight Crew",
            embedUrl: "cos:tv/5920/5/19"
          },
          {
            episodeNumber: 20,
            title: "Episode 4 - True Rowmance",
            embedUrl: "cos:tv/5920/5/20"
          },
          {
            episodeNumber: 21,
            title: "Episode 5 - Anatomy of a Fall Formal",
            embedUrl: "cos:tv/5920/5/21"
          },
          {
            episodeNumber: 22,
            title: "Episode 6 - Bad Break",
            embedUrl: "cos:tv/5920/5/22"
          },
          {
            episodeNumber: 23,
            title: "Episode 7 - Under Pressure",
            embedUrl: "cos:tv/5920/5/23"
          }
      
        ]
      },
      {
        seasonNumber: 6,
        episodes: [
          {
            episodeNumber: 1,
            title: "Episode 1 - The Catch",
            embedUrl: "cos:tv/5920/6/1"
          },
          {
            episodeNumber: 2,
            title: "Episode 2 - The Hateful Eight",
            embedUrl: "cos:tv/5920/6/2"
          },
          {
            episodeNumber: 3,
            title: "Episode 3 - Flight Crew",
            embedUrl: "cos:tv/5920/6/3"
          },
          {
            episodeNumber: 4,
            title: "Episode 4 - True Rowmance",
            embedUrl: "cos:tv/5920/6/4"
          },
          {
            episodeNumber: 5,
            title: "Episode 5 - Anatomy of a Fall Formal",
            embedUrl: "cos:tv/5920/6/5"
          },
          {
            episodeNumber: 6,
            title: "Episode 6 - Bad Break",
            embedUrl: "cos:tv/5920/6/6"
          },
          {
            episodeNumber: 7,
            title: "Episode 7 - Under Pressure",
            embedUrl: "cos:tv/5920/6/7"
          },
          {
            episodeNumber: 8,
            title: "Episode 8 - O Coxswain, My Coxswain",
            embedUrl: "cos:tv/5920/6/8"
          },
          {
            episodeNumber: 9,
            title: "Episode 1 - The Catch",
            embedUrl: "cos:tv/5920/6/9"
          },
          {
            episodeNumber: 10,
            title: "Episode 2 - The Hateful Eight",
            embedUrl: "cos:tv/5920/6/10"
          },
          {
            episodeNumber: 11,
            title: "Episode 3 - Flight Crew",
            embedUrl: "cos:tv/5920/6/11"
          },
          {
            episodeNumber: 12,
            title: "Episode 4 - True Rowmance",
            embedUrl: "cos:tv/5920/6/12"
          },
          {
            episodeNumber: 13,
            title: "Episode 5 - Anatomy of a Fall Formal",
            embedUrl: "cos:tv/5920/6/13"
          },
          {
            episodeNumber: 14,
            title: "Episode 6 - Bad Break",
            embedUrl: "cos:tv/5920/6/14"
          },
          {
            episodeNumber: 15,
            title: "Episode 7 - Under Pressure",
            embedUrl: "cos:tv/5920/6/15"
          },
          {
            episodeNumber: 16,
            title: "Episode 8 - O Coxswain, My Coxswain",
            embedUrl: "cos:tv/5920/6/16"
          },
          {
            episodeNumber: 17,
            title: "Episode 1 - The Catch",
            embedUrl: "cos:tv/5920/6/17"
          },
          {
            episodeNumber: 18,
            title: "Episode 2 - The Hateful Eight",
            embedUrl: "cos:tv/5920/6/18"
          },
          {
            episodeNumber: 19,
            title: "Episode 3 - Flight Crew",
            embedUrl: "cos:tv/5920/6/19"
          },
          {
            episodeNumber: 20,
            title: "Episode 4 - True Rowmance",
            embedUrl: "cos:tv/5920/6/20"
          },
          {
            episodeNumber: 21,
            title: "Episode 5 - Anatomy of a Fall Formal",
            embedUrl: "cos:tv/5920/6/21"
          },
          {
            episodeNumber: 22,
            title: "Episode 6 - Bad Break",
            embedUrl: "cos:tv/5920/6/22"
          },
          {
            episodeNumber: 23,
            title: "Episode 7 - Under Pressure",
            embedUrl: "cos:tv/5920/6/23"
          }
      
        ]
      },
      {
        seasonNumber: 7,
        episodes: [
          {
            episodeNumber: 1,
            title: "Episode 1 - The Catch",
            embedUrl: "cos:tv/5920/7/1"
          },
          {
            episodeNumber: 2,
            title: "Episode 2 - The Hateful Eight",
            embedUrl: "cos:tv/5920/7/2"
          },
          {
            episodeNumber: 3,
            title: "Episode 3 - Flight Crew",
            embedUrl: "cos:tv/5920/7/3"
          },
          {
            episodeNumber: 4,
            title: "Episode 4 - True Rowmance",
            embedUrl: "cos:tv/5920/7/4"
          },
          {
            episodeNumber: 5,
            title: "Episode 5 - Anatomy of a Fall Formal",
            embedUrl: "cos:tv/5920/7/5"
          },
          {
            episodeNumber: 6,
            title: "Episode 6 - Bad Break",
            embedUrl: "cos:tv/5920/7/6"
          },
          {
            episodeNumber: 7,
            title: "Episode 7 - Under Pressure",
            embedUrl: "cos:tv/5920/7/7"
          },
          {
            episodeNumber: 8,
            title: "Episode 8 - O Coxswain, My Coxswain",
            embedUrl: "cos:tv/5920/7/8"
          },
          {
            episodeNumber: 9,
            title: "Episode 1 - The Catch",
            embedUrl: "cos:tv/5920/7/9"
          },
          {
            episodeNumber: 10,
            title: "Episode 2 - The Hateful Eight",
            embedUrl: "cos:tv/5920/7/10"
          },
          {
            episodeNumber: 11,
            title: "Episode 3 - Flight Crew",
            embedUrl: "cos:tv/5920/7/11"
          },
          {
            episodeNumber: 12,
            title: "Episode 4 - True Rowmance",
            embedUrl: "cos:tv/5920/7/12"
          },
          {
            episodeNumber: 13,
            title: "Episode 5 - Anatomy of a Fall Formal",
            embedUrl: "cos:tv/5920/7/13"
          },
          {
            episodeNumber: 14,
            title: "Episode 6 - Bad Break",
            embedUrl: "cos:tv/5920/7/14"
          },
          {
            episodeNumber: 15,
            title: "Episode 7 - Under Pressure",
            embedUrl: "cos:tv/5920/7/15"
          },
          {
            episodeNumber: 16,
            title: "Episode 8 - O Coxswain, My Coxswain",
            embedUrl: "cos:tv/5920/7/16"
          },
          {
            episodeNumber: 17,
            title: "Episode 1 - The Catch",
            embedUrl: "cos:tv/5920/7/17"
          },
          {
            episodeNumber: 18,
            title: "Episode 2 - The Hateful Eight",
            embedUrl: "cos:tv/5920/7/18"
          },
          {
            episodeNumber: 19,
            title: "Episode 3 - Flight Crew",
            embedUrl: "cos:tv/5920/7/19"
          },
          {
            episodeNumber: 20,
            title: "Episode 4 - True Rowmance",
            embedUrl: "cos:tv/5920/7/20"
          },
          {
            episodeNumber: 21,
            title: "Episode 5 - Anatomy of a Fall Formal",
            embedUrl: "cos:tv/5920/7/21"
          },
          {
            episodeNumber: 22,
            title: "Episode 6 - Bad Break",
            embedUrl: "cos:tv/5920/7/22"
          },
          {
            episodeNumber: 23,
            title: "Episode 7 - Under Pressure",
            embedUrl: "cos:tv/5920/7/23"
          }
      
        ]
      },
    ]
  },


  // NOTE: K-Drama series episodes live in kdrama-episode.js now.
  // This file is for non-K-Drama series only (Filipino/English).
];

document.addEventListener('DOMContentLoaded', () => {
  initSeriesEpisodes();
});

function initSeriesEpisodes() {
  const urlParams = new URLSearchParams(window.location.search);
  const currentId = urlParams.get('id');

  if (!currentId) return;

  // Tolerant id match: URLs treat '+' as a space, so "The+Scandal" arrives as
  // "The Scandal". Compare normalized forms so both spellings resolve.
  const normId = v => String(v || '').toLowerCase().replace(/[\s\+]+/g, '-');
  const currentSeries = seriesData.find(s => s.id === currentId || normId(s.id) === normId(currentId));
  if (!currentSeries || !currentSeries.seasons || currentSeries.seasons.length === 0) return;

  injectEpisodesUI(currentSeries);
}

function injectEpisodesUI(series) {
  const descriptionElement = document.querySelector('.movie-description') || 
                             document.querySelector('.video-info-box') || 
                             document.querySelector('#movie-description-container');

  if (!descriptionElement) return;
  if (document.getElementById('episodes-container-section')) return;

  const seriesSection = document.createElement('div');
  seriesSection.className = 'episodes-container-section';
  seriesSection.id = 'episodes-container-section';

  const style = document.createElement('style');
  style.textContent = `
    .episodes-container-section {
      margin-top: 18px;
      margin-bottom: 20px;
      padding: 14px;
      background: #141414;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
    }
    /* PC MODE: align with the 80% centered band above + dark red theme */
    @media (min-width: 769px) {
      .episodes-container-section {
        width: 80%;
        margin-left: auto;
        margin-right: auto;
        background: linear-gradient(135deg, #0a0a0a 0%, #1a0a0e 50%, #0a0a0a 100%);
        border: 1px solid rgba(229, 9, 20, 0.25);
        border-radius: 16px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      }
    }
    .episodes-header-flex {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      flex-wrap: wrap;
      gap: 10px;
    }
    .episodes-title-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .episodes-title-text {
      font-size: 1rem;
      font-weight: 800;
      color: #ffffff;
    }
    .filipino-badge-chip {
      font-size: 0.62rem;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      color: #e50914;
      border: 1px solid rgba(229, 9, 20, 0.5);
      background: rgba(229, 9, 20, 0.15);
      padding: 2px 8px;
      border-radius: 20px;
    }
    .season-select-dropdown {
      background: #1f1f1f;
      color: #ffffff;
      border: 1px solid #333333;
      border-radius: 6px;
      padding: 6px 12px;
      font-size: 0.82rem;
      font-weight: 700;
      outline: none;
      cursor: pointer;
    }
    .episodes-square-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      max-height: 150px;
      overflow-y: auto;
      padding-right: 4px;
      scrollbar-width: thin;
      scrollbar-color: #333 transparent;
    }
    .episode-square-btn {
      width: 38px;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 6px;
      color: #ffffff;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      user-select: none;
      flex: 0 0 auto;
    }
    .episode-square-btn:hover {
      background: rgba(229, 9, 20, 0.2);
      border-color: #e50914;
      color: #ffffff;
    }
    .episode-square-btn.active {
      background: #e50914;
      border-color: #e50914;
      color: #ffffff;
      box-shadow: 0 0 10px rgba(229, 9, 20, 0.5);
    }
    /* Mobile & in-app: tighter squares and a lower scroll cap so the grid
       stays neat instead of eating the whole page (user screenshot). */
    @media (max-width: 768px) {
      .episodes-square-grid { max-height: 118px; gap: 7px; }
      .episode-square-btn { width: 34px; height: 34px; font-size: 0.78rem; }
    }
  `;
  document.head.appendChild(style);

  let activeSeasonIndex = 0;
  const filipinoTagHtml = series.isFilipino ? `<span class="filipino-badge-chip">Pinoy Series</span>` : '';

  seriesSection.innerHTML = `
    <div class="episodes-header-flex">
      <div class="episodes-title-group">
        <span class="episodes-title-text">Episodes</span>
        ${filipinoTagHtml}
      </div>
      <select id="season-selector" class="season-select-dropdown">
        ${series.seasons.map((s, idx) => `<option value="${idx}">Season ${s.seasonNumber}</option>`).join('')}
      </select>
    </div>
    <div id="episodes-list" class="episodes-square-grid"></div>
  `;

  // Place the Episodes box BEFORE the Info/Cast tabs (inside the info box)
  // so the order reads: title → synopsis → Episodes → Info/Cast.
  const pcTabsEl = document.getElementById('pc-tabs');
  if (pcTabsEl) {
    pcTabsEl.insertAdjacentElement('beforebegin', seriesSection);
  } else {
    descriptionElement.insertAdjacentElement('afterend', seriesSection);
  }

  const seasonSelect = document.getElementById('season-selector');
  seasonSelect.addEventListener('change', (e) => {
    activeSeasonIndex = parseInt(e.target.value);
    renderEpisodesGrid(series.seasons[activeSeasonIndex]);
  });

  // ── CURRENT EPISODE (?s=N&ep=M deep link, or the player's resume pick) ──
  // Open the grid on that season and highlight the episode the player is
  // ACTUALLY loading. The episode itself comes from the player's single
  // resolver (currentMovie._episodeSeason/_episodeNum) — re-reading the URL
  // here was how the bar could end up on one episode while the video played
  // another after a reload.
  try {
    const m = (typeof currentMovie !== 'undefined' && currentMovie) ? currentMovie : null;
    const qp = new URLSearchParams(window.location.search);
    const dlEp = (m && m._episodeNum) || parseInt(qp.get('ep') || '0', 10) || 0;
    const dlS = (m && m._episodeSeason) || parseInt(qp.get('s') || '0', 10) || 0;
    if (dlEp && m) {
      let si = series.seasons.findIndex(x => Number(x.seasonNumber) === dlS);
      if (si < 0) si = 0;
      activeSeasonIndex = si;
      seasonSelect.value = String(si);
      renderEpisodesGrid(series.seasons[si], dlEp);
      const target = (series.seasons[si].episodes || []).find(x => Number(x.episodeNumber) === dlEp);
      if (target) {
        // keep the label identical to what the resolver stamped (real title)
        currentMovie._episodeTitle = currentMovie.title + ' - ' + (target.title || 'Episode ' + dlEp);
        currentMovie._episodeName = target.title || '';
        if (typeof updateEpisodeTitleOverlay === 'function') {
          try { updateEpisodeTitleOverlay(); } catch (e2) {}
        }
      }
      const btn = document.querySelector('.episode-square-btn.active');
      if (btn) { try { btn.scrollIntoView({ block: 'nearest' }); } catch (e3) {} }
      return; // this render is final — skip the default render below
    }
  } catch (e) {}

  renderEpisodesGrid(series.seasons[activeSeasonIndex]);
}

function renderEpisodesGrid(season, highlightEp) {
  const episodesList = document.getElementById('episodes-list');
  if (!episodesList || !season || !season.episodes) return;

  episodesList.innerHTML = '';

  // Highlight the requested episode; if it doesn't exist in this season (a
  // stale link), fall back to the first button so the bar ALWAYS shows which
  // episode is playing instead of showing none.
  const hasHighlight = highlightEp !== undefined && highlightEp !== null && Number(highlightEp) > 0
    && (season.episodes || []).some(ep => Number(ep.episodeNumber) === Number(highlightEp));

  season.episodes.forEach((ep, idx) => {
    const btn = document.createElement('button');
    const isActive = hasHighlight
      ? (Number(ep.episodeNumber) === Number(highlightEp))
      : (idx === 0);
    btn.className = `episode-square-btn ${isActive ? 'active' : ''}`;
    btn.type = 'button';
    btn.textContent = ep.episodeNumber || (idx + 1);
    btn.title = ep.title || `Episode ${ep.episodeNumber || (idx + 1)}`;            btn.onclick = () => {
            document.querySelectorAll('.episode-square-btn').forEach(el => el.classList.remove('active'));
            btn.classList.add('active');
            playEpisodeSource(ep, season);
          };

    episodesList.appendChild(btn);
  });
}

// Keep the VISIBLE episode bar in step with what is playing. The grid can be
// showing another season (the flat Episodes panel switches across seasons),
// so after every switch we re-render it for the episode's own season — the
// active square always means the episode you are watching.
function refreshEpisodesUI() {
  try {
    if (typeof currentMovie === 'undefined' || !currentMovie) return;
    if (!document.getElementById('episodes-list')) return;   // no grid on this page
    const normId = v => String(v || '').toLowerCase().replace(/[\s\+]+/g, '-');
    const series = seriesData.find(s => s.id === currentMovie.id || normId(s.id) === normId(currentMovie.id));
    if (!series || !series.seasons || !series.seasons.length) return;
    let si = series.seasons.findIndex(s => Number(s.seasonNumber) === Number(currentMovie._episodeSeason || 1));
    if (si < 0) si = 0;
    activeSeasonIndex = si;
    const sel = document.getElementById('season-selector');
    if (sel) sel.value = String(si);
    renderEpisodesGrid(series.seasons[si], currentMovie._episodeNum);
  } catch (e) {}
}
window.__dfxRefreshEpisodesUI = refreshEpisodesUI;

function playEpisodeSource(episode, season) {
  if (!episode || !episode.embedUrl) return;

  // Reset subtitles so auto-load fires for the new episode
  try {
    const dp = document.getElementById('direct-video-player');
    if (dp) { dp.querySelectorAll('track').forEach(t => t.remove()); }
    if (typeof subtitleActive !== 'undefined') subtitleActive = false;
    const offBtn = document.getElementById('btn-subtitle-off');
    if (offBtn) offBtn.classList.remove('show');
    const sBtn = document.getElementById('btn-settings');
    if (sBtn) sBtn.classList.remove('subtitle-active-badge');
  } catch(e) {}

  if (typeof currentMovie !== 'undefined') {
    // Episode metadata for episode-aware subtitle matching + the season-aware
    // Continue-Watching key: "<id>-s2-ep3" (old "<id>-ep3" keys still
    // resolve). ONE resolver does this for every entry path — the player's
    // dfxStampEpisode(); the inline block below is the fallback for an older
    // player build.
    var _sn = (season && season.seasonNumber) || currentMovie._episodeSeason || 1;
    var _ep = episode.episodeNumber || 1;
    var stamped = (typeof window.dfxStampEpisode === 'function') ? window.dfxStampEpisode(_sn, _ep) : null;
    if (!stamped) {
      currentMovie.manualEmbed = episode.embedUrl;
      currentMovie._episodeId = currentMovie.id + '-s' + _sn + '-ep' + _ep;
      currentMovie._episodeTitle = currentMovie.title + ' - ' + (episode.title || 'Episode ' + _ep);
      currentMovie._episodeSeason = _sn;
      currentMovie._episodeNum = _ep;
      currentMovie._episodeName = episode.title || '';
      currentMovie._subtitleUrl = episode.subtitleUrl || '';
      // MANUAL DOWNLOAD LINK for this episode (falls back to the series-level
      // link). Read by the Download button in app.js: manual link > direct
      // file > embed capture > "cannot be downloaded" dialog.
      currentMovie.manualDownload = episode.manualDownload || currentMovie.manualDownload || '';
      currentMovie.manualDownloadSub = episode.manualDownloadSub || currentMovie.manualDownloadSub || '';
    }
    // The passed episode's HLS playlist always wins (even when the resolver
    // stamped an equivalent episode object from seriesData).
    if (episode.hlsUrl) currentMovie._episodeHlsUrl = episode.hlsUrl;
    else delete currentMovie._episodeHlsUrl;
    // Keep the URL honest: reload / share now reopen THIS episode, never ep1.
    if (typeof window.dfxSyncEpisodeUrl === 'function') {
      try { window.dfxSyncEpisodeUrl(_sn, _ep); } catch (e) {}
    }
  }

  // Load a manually assigned subtitle file for this episode, if provided
  // Usage: add  subtitleUrl: "https://.../S01E03.srt"  next to embedUrl in episodes.js
  if (episode.subtitleUrl && typeof enableSubtitleTrack === 'function' && typeof srtToVtt === 'function') {
    fetch(episode.subtitleUrl)
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
      .then(srt => {
        enableSubtitleTrack(srtToVtt(srt, 0), 'Episode Subtitle', 'en', srt);
        if (typeof showToast === 'function') showToast('Subtitle loaded for Episode ' + (episode.episodeNumber || ''));
      })
      .catch(() => {
        if (typeof showToast === 'function') showToast('Could not load the episode subtitle file.');
      });
  }

  if (typeof loadEmbed === 'function') {
    loadEmbed();
  } else {
    const directPlayer = document.getElementById('direct-video-player');
    if (directPlayer) {
      directPlayer.src = episode.embedUrl;
      directPlayer.play().catch(() => {});
    }
  }

  // Per-episode UI state (mid-roll ad cycle, next-episode countdown) and the
  // visible episode bar follow the switch — every entry path lands here.
  if (typeof window.dfxOnEpisodeSwitch === 'function') { try { window.dfxOnEpisodeSwitch(); } catch (e) {} }
  refreshEpisodesUI();

  if (typeof showToast === 'function') {
    showToast(`Loading Episode ${episode.episodeNumber || ''}...`);
  }
}