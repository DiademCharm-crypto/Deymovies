// AI Reels & Shorts Data Source
const aiReelsData = [
  {
    id: "The-Billionaire's-Illegal-Obsession",
    title: "The Billionaire's Illegal Obsession",
    author: "@deymflix_official",
    poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPGPrD1QWR8SAkZTWf-Hl3QvGPHvcu9nOanYK7NHgeog&s=10",
    videoUrl: "https://video.nbanaapp.eu.cc/%5BAI%5D%20THE%20BILLIONAIRE'S%20ILLEGAL%20OBSESSION%20-%20360p.mp4",
    likes: "12.4K"
  }

];

function renderAIReelsRow() {
  const container = document.getElementById('ai-reels-container');
  if (!container || !Array.isArray(aiReelsData)) return;
  container.innerHTML = '';

  aiReelsData.forEach((reel) => {
    const card = document.createElement('div');
    card.className = 'reel-thumb-card';
    card.onclick = () => {
      window.location.href = `reels.html?id=${encodeURIComponent(reel.id)}`;
    };

    card.innerHTML = `
      <img class="reel-thumb-img" src="${reel.poster}" alt="${reel.title}">
      <div class="reel-overlay-info">
        <span class="reel-badge-tag">AI REEL</span>
        <span class="reel-thumb-title">${reel.title}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderAIReelsRow);
} else {
  renderAIReelsRow();
}