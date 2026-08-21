/**
 * Stella-Nime - YouTube Anime Controller (youtube.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbarSearch();
  loadChannels();
  loadDefaultVideos();

  // YouTube Search
  const searchBtn = document.getElementById('btnYtSearch');
  const searchInput = document.getElementById('ytSearchInput');

  searchBtn.addEventListener('click', performYtSearch);
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') performYtSearch();
  });

  // Modal Close
  const modal = document.getElementById('videoModal');
  const closeBtn = document.getElementById('btnCloseModal');
  const iframe = document.getElementById('modalIframe');

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    iframe.src = '';
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      iframe.src = '';
    }
  });
});

async function loadChannels() {
  const container = document.getElementById('channelsGrid');
  try {
    const channels = await API.getYoutubeChannels();
    container.innerHTML = channels.map(ch => `
      <div class="channel-card">
        <img src="${ch.avatar || DEFAULT_POSTER}" alt="${ch.name}" class="channel-avatar" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='${DEFAULT_POSTER}';">
        <div style="flex: 1; min-width: 0;">
          <div style="font-size: 1rem; font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 6px;">
            ${ch.name} <i class="fa-solid fa-circle-check" style="color: var(--accent-cyan); font-size: 0.85rem;"></i>
          </div>
          <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">${ch.description}</div>
          <div style="margin-top: 8px;">
            <button class="tab-btn active" style="font-size: 0.75rem; padding: 3px 10px;" onclick="searchByChannel('${ch.name}')">
              Lihat Serial Anime <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed to load channels:', err);
  }
}

async function loadDefaultVideos() {
  performYtSearch('Muse Indonesia Anime Sub Indo Full Episode');
}

window.searchByChannel = function(channelName) {
  document.getElementById('ytSearchInput').value = channelName;
  performYtSearch(`${channelName} anime full episode sub indo`);
};

async function performYtSearch(customQuery) {
  const query = typeof customQuery === 'string' ? customQuery : document.getElementById('ytSearchInput').value.trim();
  if (!query) return;

  const grid = document.getElementById('videosGrid');
  const titleEl = document.getElementById('videoSectionTitle');
  grid.innerHTML = '<div class="spinner" style="grid-column: 1 / -1; margin: 40px auto;"></div>';
  titleEl.innerHTML = `<i class="fa-brands fa-youtube" style="color: #ff0000;"></i> Hasil Pencarian: "${query}"`;

  try {
    const results = await API.searchYoutube(query);
    if (results && results.length > 0) {
      grid.innerHTML = results.map(video => `
        <div class="movie-card" onclick="openVideoPlayer('${video.videoId}', '${video.title.replace(/'/g, "\\'")}')" style="cursor: pointer;">
          <div class="card-poster-wrap" style="aspect-ratio: 16 / 9;">
            <img src="${video.poster || DEFAULT_POSTER}" alt="${video.title}" class="card-poster" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='${DEFAULT_POSTER}';">
            <div class="card-badge" style="background: rgba(255, 0, 0, 0.85); color: #fff;">
              <i class="fa-brands fa-youtube"></i> ${video.duration || 'Video'}
            </div>
            <div class="card-play-overlay">
              <div class="card-play-icon" style="background: #ff0000;"><i class="fa-solid fa-play"></i></div>
            </div>
          </div>
          <div class="card-body">
            <div class="card-title" title="${video.title}">${video.title}</div>
            <div class="card-meta">
              <span>${video.channel}</span>
              <span style="color: var(--accent-cyan);">${video.views || ''}</span>
            </div>
          </div>
        </div>
      `).join('');
    } else {
      grid.innerHTML = '<div style="grid-column: 1 / -1; color: var(--text-muted); text-align: center; padding: 40px 0;">Tidak ada video anime ditemukan.</div>';
    }
  } catch (err) {
    grid.innerHTML = `<div style="grid-column: 1 / -1; color: var(--primary); text-align: center;">Gagal memuat video: ${err.message}</div>`;
  }
}

window.openVideoPlayer = function(videoId, title) {
  const modal = document.getElementById('videoModal');
  const iframe = document.getElementById('modalIframe');
  const titleEl = document.getElementById('modalVideoTitle');

  titleEl.textContent = title;
  iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
  modal.style.display = 'flex';
};

function initNavbarSearch() {
  const input = document.getElementById('searchInput');
  const dropdown = document.getElementById('searchDropdown');
  let timer;

  input.addEventListener('input', (e) => {
    clearTimeout(timer);
    const q = e.target.value.trim();
    if (!q || q.length < 2) {
      dropdown.classList.remove('show');
      return;
    }
    timer = setTimeout(async () => {
      try {
        const results = await API.search(q);
        if (results && results.length > 0) {
          dropdown.innerHTML = results.slice(0, 5).map(m => `
            <a href="/anime/${m.slug}" class="search-result-item">
              <img src="${m.poster || DEFAULT_POSTER}" alt="${m.title}" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='${DEFAULT_POSTER}';">
              <div class="search-result-info">
                <div class="search-result-title">${m.title}</div>
                <div class="search-result-meta">${m.status || 'Anime'}</div>
              </div>
            </a>
          `).join('');
          dropdown.classList.add('show');
        }
      } catch (err) {}
    }, 300);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && input.value.trim()) {
      window.location.href = `/?search=${encodeURIComponent(input.value.trim())}`;
    }
  });
}
