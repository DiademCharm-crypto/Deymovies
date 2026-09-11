// ==========================================
// DEYMFLIX - TV Series & Episodes Handler
// ==========================================

const seriesData = [
  {
    id: "Love-U-Lots",
    title: "Love U Lots",
    isFilipino: true,
    poster: "https://media.themoviedb.org/t/p/w600_and_h900_face/example.jpg",
    seasons: [
      {
        seasonNumber: 1,
        episodes: [
          {
            episodeNumber: 1,
            title: "Episode 1 - The Estranged Girl",
            embedUrl: "https://deymflix01.s3.us-east-005.backblazeb2.com/Love+U+Lots/Love.U.Lots.(2026).VONE.S01E01.1080p.WEB-DL.AAC2.0.x264-DarkRip.mkv"
          },
          {
            episodeNumber: 2,
            title: "Episode 2 - Meet the Others",
            embedUrl: "https://deymflix01.s3.us-east-005.backblazeb2.com/Love+U+Lots/Love.U.Lots.(2026).VONE.S01E02.1080p.WEB-DL.AAC2.0.x264-DarkRip.mkv"
          },
          {
            episodeNumber: 3,
            title: "Episode 3 - Paint Me Closer",
            embedUrl: "https://deymflix01.s3.us-east-005.backblazeb2.com/Love+U+Lots/Love.U.Lots.(2026).VONE.S01E03.1080p.WEB-DL.AAC2.0.x264-DarkRip.mkv"
          },
          {
            episodeNumber: 4,
            title: "Episode 4 - Can't Stay Away",
            embedUrl: "https://deymflix01.s3.us-east-005.backblazeb2.com/Love+U+Lots/Love.U.Lots.(2026).VONE.S01E04.1080p.WEB-DL.AAC2.0.x264-DarkRip.mkv"
          },
          {
            episodeNumber: 5,
            title: "Episode 5 - The Original One",
            embedUrl: "https://deymflix01.s3.us-east-005.backblazeb2.com/Love+U+Lots/Love.U.Lots.(2026).VONE.S01E05.1080p.WEB-DL.AAC2.0.x264-DarkRip.mkv"
          },
          {
            episodeNumber: 6,
            title: "Episode 6 - Clingy Past",
            embedUrl: "https://deymflix01.s3.us-east-005.backblazeb2.com/Love+U+Lots/Love.U.Lots.(2026).VONE.S01E06.1080p.WEB-DL.AAC2.0.x264-DarkRip.mkv"
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
            embedUrl: "https://deymflix01.s3.us-east-005.backblazeb2.com/movie+1/Crew+Girl/Crew.Girl.S01E01.720p.HEVC.x265-MeGusta%5BEZTVx.to%5D.mkv"
          },
          {
            episodeNumber: 2,
            title: "Episode 2 - The Hateful Eight",
            embedUrl: "https://deymflix01.s3.us-east-005.backblazeb2.com/movie+1/Crew+Girl/Crew.Girl.S01E02.720p.HEVC.x265-MeGusta%5BEZTVx.to%5D.mkv"
          },
          {
            episodeNumber: 3,
            title: "Episode 3 - Flight Crew",
            embedUrl: "https://deymflix01.s3.us-east-005.backblazeb2.com/movie+1/Crew+Girl/Crew.Girl.S01E03.720p.HEVC.x265-MeGusta%5BEZTVx.to%5D.mkv"
          },
          {
            episodeNumber: 4,
            title: "Episode 4 - True Rowmance",
            embedUrl: "https://deymflix01.s3.us-east-005.backblazeb2.com/movie+1/Crew+Girl/Crew.Girl.S01E04.720p.HEVC.x265-MeGusta%5BEZTVx.to%5D.mkv"
          },
          {
            episodeNumber: 5,
            title: "Episode 5 - Anatomy of a Fall Formal",
            embedUrl: "https://deymflix01.s3.us-east-005.backblazeb2.com/movie+1/Crew+Girl/Crew.Girl.S01E05.720p.HEVC.x265-MeGusta%5BEZTVx.to%5D.mkv"
          },
          {
            episodeNumber: 6,
            title: "Episode 6 - Bad Break",
            embedUrl: "https://deymflix01.s3.us-east-005.backblazeb2.com/movie+1/Crew+Girl/Crew.Girl.S01E06.720p.HEVC.x265-MeGusta%5BEZTVx.to%5D.mkv"
          },
          {
            episodeNumber: 7,
            title: "Episode 7 - Under Pressure",
            embedUrl: "https://deymflix01.s3.us-east-005.backblazeb2.com/movie+1/Crew+Girl/Crew.Girl.S01E07.720p.HEVC.x265-MeGusta%5BEZTVx.to%5D.mkv"
          },
          {
            episodeNumber: 8,
            title: "Episode 8 - O Coxswain, My Coxswain",
            embedUrl: "https://deymflix01.s3.us-east-005.backblazeb2.com/movie+1/Crew+Girl/Crew.Girl.S01E08.720p.HEVC.x265-MeGusta%5BEZTVx.to%5D.mkv"
          }
        ]
      }
    ]
  }
];

document.addEventListener('DOMContentLoaded', () => {
  initSeriesEpisodes();
});

function initSeriesEpisodes() {
  const urlParams = new URLSearchParams(window.location.search);
  const currentId = urlParams.get('id');

  if (!currentId) return;

  const currentSeries = seriesData.find(s => s.id === currentId);
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
      gap: 10px;
      max-height: 220px;
      overflow-y: auto;
      padding-right: 4px;
    }
    .episode-square-btn {
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 6px;
      color: #ffffff;
      font-size: 0.95rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s ease;
      user-select: none;
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

  descriptionElement.insertAdjacentElement('afterend', seriesSection);

  const seasonSelect = document.getElementById('season-selector');
  seasonSelect.addEventListener('change', (e) => {
    activeSeasonIndex = parseInt(e.target.value);
    renderEpisodesGrid(series.seasons[activeSeasonIndex]);
  });

  renderEpisodesGrid(series.seasons[0]);
}

function renderEpisodesGrid(season) {
  const episodesList = document.getElementById('episodes-list');
  if (!episodesList || !season || !season.episodes) return;

  episodesList.innerHTML = '';

  season.episodes.forEach((ep, idx) => {
    const btn = document.createElement('button');
    btn.className = `episode-square-btn ${idx === 0 ? 'active' : ''}`;
    btn.type = 'button';
    btn.textContent = ep.episodeNumber || (idx + 1);
    btn.title = ep.title || `Episode ${ep.episodeNumber || (idx + 1)}`;

    btn.onclick = () => {
      document.querySelectorAll('.episode-square-btn').forEach(el => el.classList.remove('active'));
      btn.classList.add('active');
      playEpisodeSource(ep);
    };

    episodesList.appendChild(btn);
  });
}

function playEpisodeSource(episode) {
  if (!episode || !episode.embedUrl) return;

  if (typeof currentMovie !== 'undefined') {
    currentMovie.manualEmbed = episode.embedUrl;
    currentMovie._episodeId = currentMovie.id + '-ep' + (episode.episodeNumber || '');
    currentMovie._episodeTitle = currentMovie.title + ' - ' + (episode.title || 'Episode ' + episode.episodeNumber);
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

  if (typeof showToast === 'function') {
    showToast(`Loading Episode ${episode.episodeNumber || ''}...`);
  }
}