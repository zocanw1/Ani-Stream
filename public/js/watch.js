/**
 * Stella-Nime - Cinema Player Controller (watch.js)
 */

let episodeData = null;
let currentEpisodeSlug = '';
let currentQuality = '360p';
let currentActiveServer = 'Default';

document.addEventListener('DOMContentLoaded', () => {
  initNavbarSearch();
  const pathParts = window.location.pathname.split('/');
  currentEpisodeSlug = pathParts[pathParts.length - 1] || new URLSearchParams(window.location.search).get('slug');

  if (currentEpisodeSlug) {
    loadEpisode(currentEpisodeSlug);
  } else {
    document.getElementById('loadingState').innerHTML = '<p style="color: var(--text-muted);">Slug episode tidak valid.</p>';
  }
});

async function loadEpisode(slug) {
  const loading = document.getElementById('loadingState');
  const container = document.getElementById('watchContainer');

  try {
    episodeData = await API.getEpisode(slug);
    document.title = `Nonton ${episodeData.title} Sub Indo | StellaNime`;

    // Title & Header Links
    document.getElementById('episodeTitle').textContent = episodeData.title;
    const animeSlug = episodeData.anime_slug;

    // Look up parent anime poster from bookmarks or history
    let parentPoster = '';
    const bookmarks = StorageManager.getBookmarks();
    const matchedBm = bookmarks.find(b => b.slug === animeSlug || b.slug === slug);
    if (matchedBm && matchedBm.poster) {
      parentPoster = matchedBm.poster;
    } else {
      const history = StorageManager.getHistory();
      const matchedHist = history.find(h => h.animeSlug === animeSlug || h.animeSlug === slug);
      if (matchedHist && matchedHist.poster) {
        parentPoster = matchedHist.poster;
      }
    }

    // Save to Watch History
    StorageManager.saveHistory({
      episodeSlug: slug,
      episodeTitle: episodeData.title,
      animeSlug: animeSlug || slug,
      animeTitle: episodeData.title.split('Episode')[0].trim() || 'Anime',
      poster: parentPoster || DEFAULT_POSTER
    });

    if (animeSlug) {
      document.getElementById('backToAnimeLink').href = `/anime/${animeSlug}`;
      document.getElementById('allEpBtn').href = `/anime/${animeSlug}`;
      loadSidebarEpisodes(animeSlug, slug);
    } else {
      document.getElementById('backToAnimeLink').style.display = 'none';
      document.getElementById('allEpBtn').style.display = 'none';
    }

    // Prev / Next Navigation
    const prevBtn = document.getElementById('prevEpBtn');
    const nextBtn = document.getElementById('nextEpBtn');

    if (episodeData.prev_episode_slug) {
      prevBtn.href = `/watch/${episodeData.prev_episode_slug}`;
      prevBtn.classList.remove('disabled');
    } else {
      prevBtn.classList.add('disabled');
      prevBtn.href = 'javascript:void(0)';
    }

    if (episodeData.next_episode_slug) {
      nextBtn.href = `/watch/${episodeData.next_episode_slug}`;
      nextBtn.classList.remove('disabled');
    } else {
      nextBtn.classList.add('disabled');
      nextBtn.href = 'javascript:void(0)';
    }

    // Set Default Player Stream
    const player = document.getElementById('videoPlayer');
    if (episodeData.default_stream_url) {
      player.src = episodeData.default_stream_url;
    }

    // Render Quality Tabs & Server Mirrors
    initQualityAndServers();

    // Render Download Table
    renderDownloads(episodeData.downloads);

    loading.style.display = 'none';
    container.style.display = 'grid';

  } catch (error) {
    console.error('Failed to load episode stream:', error);
    loading.innerHTML = `<p style="color: var(--text-muted);">Gagal memuat video episode: ${error.message}</p>`;
  }
}

function initQualityAndServers() {
  const tabs = document.querySelectorAll('.quality-tab-btn');
  const mirrors = episodeData.mirrors || {};

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentQuality = tab.dataset.quality;
      renderServerButtons(currentQuality);
    });
  });

  // Default to 360p or whatever is available
  if (mirrors.m360p && mirrors.m360p.length > 0) {
    currentQuality = '360p';
  } else if (mirrors.m480p && mirrors.m480p.length > 0) {
    currentQuality = '480p';
  } else if (mirrors.m720p && mirrors.m720p.length > 0) {
    currentQuality = '720p';
  }

  // Set active tab
  tabs.forEach(t => {
    if (t.dataset.quality === currentQuality) t.classList.add('active');
    else t.classList.remove('active');
  });

  renderServerButtons(currentQuality);
}

function renderServerButtons(quality) {
  const serverGrid = document.getElementById('serverButtonsGrid');
  const qualityKey = `m${quality}`;
  const serverList = (episodeData.mirrors && episodeData.mirrors[qualityKey]) || [];

  let html = `
    <button class="server-btn ${currentActiveServer === 'Default' ? 'active' : ''}" onclick="switchStreamDefault()">
      <i class="fa-solid fa-play"></i> Default Stream
    </button>
  `;

  if (serverList.length > 0) {
    serverList.forEach((s, idx) => {
      const isSelected = currentActiveServer === `${quality}-${s.name}`;
      html += `
        <button class="server-btn ${isSelected ? 'active' : ''}" onclick="switchMirror('${quality}', ${idx}, '${s.name}')">
          <i class="fa-solid fa-server"></i> ${s.name.toUpperCase()}
        </button>
      `;
    });
  } else {
    html += `<span style="font-size: 0.8rem; color: var(--text-dim); margin-left: 10px; align-self: center;">Mirror tidak tersedia untuk resolusi ini.</span>`;
  }

  serverGrid.innerHTML = html;
}

window.switchStreamDefault = function() {
  currentActiveServer = 'Default';
  const player = document.getElementById('videoPlayer');
  if (episodeData.default_stream_url) {
    player.src = episodeData.default_stream_url;
  }
  renderServerButtons(currentQuality);
};

window.switchMirror = async function(quality, serverIndex, serverName) {
  const qualityKey = `m${quality}`;
  const serverList = episodeData.mirrors[qualityKey];
  const targetServer = serverList[serverIndex];

  if (!targetServer || !targetServer.content) return;

  currentActiveServer = `${quality}-${serverName}`;
  renderServerButtons(quality);

  const spinner = document.getElementById('playerSpinner');
  const player = document.getElementById('videoPlayer');

  spinner.style.display = 'flex';

  try {
    const res = await API.resolveMirror(
      targetServer.content,
      episodeData.actions?.nonce_action,
      episodeData.actions?.stream_action,
      currentEpisodeSlug
    );

    if (res && res.stream_url) {
      player.src = res.stream_url;
    } else {
      alert('Gagal mendapatkan URL video dari mirror ini. Silakan coba mirror lain.');
    }
  } catch (err) {
    console.error('Mirror switch error:', err);
    alert(`Gagal beralih ke mirror ${serverName}: ${err.message}`);
  } finally {
    spinner.style.display = 'none';
  }
};

function renderDownloads(downloads) {
  const sec = document.getElementById('downloadSection');
  const grid = document.getElementById('downloadButtonsGrid');
  if (!downloads || downloads.length === 0) {
    sec.style.display = 'none';
    return;
  }

  sec.style.display = 'block';
  grid.innerHTML = `
    <table class="batch-table">
      <thead>
        <tr>
          <th>Kualitas</th>
          <th>Ukuran</th>
          <th>Link Download</th>
        </tr>
      </thead>
      <tbody>
        ${downloads.map(item => `
          <tr>
            <td><strong>${item.quality}</strong></td>
            <td>${item.size || '-'}</td>
            <td>
              ${item.links.map(l => `<a href="${l.url}" target="_blank" rel="noopener noreferrer" class="batch-link"><i class="fa-solid fa-cloud-arrow-down"></i> ${l.server}</a>`).join('')}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function loadSidebarEpisodes(animeSlug, activeEpSlug) {
  const listEl = document.getElementById('sidebarEpisodesList');
  const countEl = document.getElementById('sidebarCount');

  try {
    const animeDetail = await API.getAnime(animeSlug);
    if (animeDetail && animeDetail.poster) {
      StorageManager.saveHistory({
        episodeSlug: currentEpisodeSlug,
        episodeTitle: (episodeData && episodeData.title) || 'Episode',
        animeSlug: animeSlug,
        animeTitle: animeDetail.title || (episodeData && episodeData.title.split('Episode')[0].trim()) || 'Anime',
        poster: animeDetail.poster
      });
    }
    if (animeDetail.episodes && animeDetail.episodes.length > 0) {
      if (countEl) countEl.textContent = `${animeDetail.episodes.length} Ep`;
      listEl.innerHTML = animeDetail.episodes.map(ep => {
        const isActive = ep.slug === activeEpSlug;
        return `
          <a href="/watch/${ep.slug}" class="sidebar-ep-item ${isActive ? 'active' : ''}">
            <span>${isActive ? '<i class="fa-solid fa-play" style="margin-right: 6px; color: var(--primary-light);"></i>' : ''}${ep.title}</span>
            <span style="font-size: 0.72rem; color: var(--text-dim);">${ep.release_date || ''}</span>
          </a>
        `;
      }).join('');
    }
  } catch (e) {
    console.warn('Sidebar episodes load failed:', e);
  }
}

function initNavbarSearch() {
  const input = document.getElementById('searchInput');
  const dropdown = document.getElementById('searchDropdown');
  let timer;

  if (!input || !dropdown) return;

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
          dropdown.innerHTML = results.slice(0, 5).map(anime => `
            <a href="/anime/${anime.slug}" class="search-result-item">
              <img src="${anime.poster || DEFAULT_POSTER}" alt="${anime.title}" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='${DEFAULT_POSTER}';">
              <div class="search-result-info">
                <div class="search-result-title">${anime.title}</div>
                <div class="search-result-meta">${anime.status || 'Anime'}</div>
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

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-capsule-wrapper')) {
      dropdown.classList.remove('show');
    }
  });
}
