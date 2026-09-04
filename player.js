document.addEventListener('DOMContentLoaded', () => {
  const videoContainer = document.getElementById('video-container');
  const playerOverlay = document.getElementById('player-overlay');
  const playerTitle = document.getElementById('player-title');
  const infoMovieTitle = document.getElementById('info-movie-title');
  const infoMovieSynopsis = document.getElementById('info-movie-synopsis');
  const iframePlayer = document.getElementById('movie-iframe-player');

  let fadeTimeout = null;

  // --- Auto-Hide Controls Function (1.5s timer) ---
  function resetControlsTimer() {
    if (!playerOverlay) return;

    playerOverlay.classList.remove('fade-out');
    clearTimeout(fadeTimeout);

    // Hide controls after 1.5 seconds (1500 milliseconds) of inactivity
    fadeTimeout = setTimeout(() => {
      playerOverlay.classList.add('fade-out');
    }, 1500);
  }

  // --- Register Interaction Event Listeners ---
  if (videoContainer) {
    videoContainer.addEventListener('mousemove', resetControlsTimer);
    videoContainer.addEventListener('click', resetControlsTimer);
    videoContainer.addEventListener('touchstart', resetControlsTimer);

    // Start timer on initial page load
    resetControlsTimer();
  }

  // --- Load Movie Data via URL ID Parameter ---
  const urlParams = new URLSearchParams(window.location.search);
  const movieId = urlParams.get('id');

  if (movieId && typeof movies !== 'undefined') {
    const selectedMovie = movies.find(m => m.id === movieId || m.title === movieId);

    if (selectedMovie) {
      if (playerTitle) playerTitle.textContent = selectedMovie.title;
      if (infoMovieTitle) infoMovieTitle.textContent = selectedMovie.title;
      if (infoMovieSynopsis && selectedMovie.description) {
        infoMovieSynopsis.textContent = selectedMovie.description;
      }

      // Set video source URL
      if (iframePlayer) {
        iframePlayer.src = selectedMovie.manualEmbed || cleanDriveLink(selectedMovie.poster);
      }
    } else {
      if (playerTitle) playerTitle.textContent = movieId;
      if (infoMovieTitle) infoMovieTitle.textContent = movieId;
    }
  }
});

// --- Utility Functions ---
function seekVideo(seconds) {
  // Seek placeholder for manual embeds
}

function togglePlayPause() {
  // Toggle play/pause state
}

function toggleFullscreen() {
  const container = document.getElementById('video-container');
  if (!document.fullscreenElement) {
    if (container.requestFullscreen) {
      container.requestFullscreen();
    } else if (container.webkitRequestFullscreen) {
      container.webkitRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}