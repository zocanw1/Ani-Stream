/**
 * Stella-Nime - Cinema Player Controller (watch.js)
 */

let episodeData = null;
let currentEpisodeSlug = '';
let currentQuality = '360p';
let currentActiveServer = 'Default';

// Normalized mirrors list: [{ quality: '360p', server: 'Blogger', content: '...', serverId: '...' }]
let normalizedMirrors = [];

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
    if (!episodeData) throw new Error('Data episode tidak ditemukan.');

    const titleText = episodeData.title || slug;
    document.title = `Nonton ${titleText} Sub Indo | StellaNime`;

    // Title & Header Links
    document.getElementById('episodeTitle').textContent = titleText;
    const animeSlug = episodeData.anime_slug || episodeData.animeId;

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
      episodeTitle: titleText,
      animeSlug: animeSlug || slug,
      animeTitle: episodeData.anime_title || titleText.replace(/Episode\s+\d+.*$/i, '').trim() || 'Anime',
      poster: parentPoster || episodeData.poster || DEFAULT_POSTER
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

    const prevSlug = episodeData.prev_episode || episodeData.prev_episode_slug || episodeData.prevEpisode?.episodeId;
    const nextSlug = episodeData.next_episode || episodeData.next_episode_slug || episodeData.nextEpisode?.episodeId;

    if (prevSlug) {
      prevBtn.href = `/watch/${prevSlug}`;
      prevBtn.classList.remove('disabled');
    } else {
      prevBtn.classList.add('disabled');
      prevBtn.href = 'javascript:void(0)';
    }

    if (nextSlug) {
      nextBtn.href = `/watch/${nextSlug}`;
      nextBtn.classList.remove('disabled');
    } else {
      nextBtn.classList.add('disabled');
      nextBtn.href = 'javascript:void(0)';
    }

    // Set Default Player Stream
    const player = document.getElementById('videoPlayer');
    const defaultStream = episodeData.default_stream || episodeData.default_stream_url || episodeData.defaultStreamingUrl;
    if (defaultStream) {
      player.src = defaultStream;
    }

    // Normalize Mirrors
    normalizeMirrorsData();

    // Render Quality Tabs & Server Mirrors
    initQualityAndServers();

    // Render Download Table
    renderDownloads(episodeData.downloads || episodeData.downloadUrl);

    loading.style.display = 'none';
    container.style.display = 'grid';

  } catch (error) {
    console.error('Failed to load episode stream:', error);
    loading.innerHTML = `<p style="color: var(--text-muted);">Gagal memuat video episode: ${error.message}</p>`;
  }
}

function normalizeMirrorsData() {
  normalizedMirrors = [];
  const rawMirrors = episodeData.mirrors;

  if (Array.isArray(rawMirrors)) {
    rawMirrors.forEach(m => {
      normalizedMirrors.push({
        quality: m.quality || 'HD',
        server: m.server || 'Server',
        content: m.data_content || m.content || m.serverId || '',
        serverId: m.serverId || ''
      });
    });
  } else if (rawMirrors && typeof rawMirrors === 'object') {
    Object.keys(rawMirrors).forEach(key => {
      const qName = key.replace(/^m/, '');
      const list = rawMirrors[key] || [];
      list.forEach(s => {
        normalizedMirrors.push({
          quality: qName,
          server: s.name || s.server || 'Server',
          content: s.content || s.data_content || '',
          serverId: s.serverId || ''
        });
      });
    });
  }
}

function initQualityAndServers() {
  const tabs = document.querySelectorAll('.quality-tab-btn');

  // Find available qualities
  const availableQualities = new Set(normalizedMirrors.map(m => m.quality.toLowerCase()));

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentQuality = tab.dataset.quality;
      renderServerButtons(currentQuality);
    });
  });

  // Determine initial active quality
  if (availableQualities.has('720p')) currentQuality = '720p';
  else if (availableQualities.has('480p')) currentQuality = '480p';
  else if (availableQualities.has('360p')) currentQuality = '360p';
  else if (availableQualities.has('1080p')) currentQuality = '1080p';

  // Set active tab in UI
  tabs.forEach(t => {
    if (t.dataset.quality === currentQuality) t.classList.add('active');
    else t.classList.remove('active');
  });

  renderServerButtons(currentQuality);
}

function renderServerButtons(quality) {
  const serverGrid = document.getElementById('serverButtonsGrid');
  const matchingServers = normalizedMirrors.filter(m => m.quality.toLowerCase() === quality.toLowerCase());

  let html = `
    <button class="server-btn ${currentActiveServer === 'Default' ? 'active' : ''}" onclick="switchStreamDefault()">
      <i class="fa-solid fa-play"></i> Default Stream
    </button>
  `;

  if (matchingServers.length > 0) {
    matchingServers.forEach((s, idx) => {
      const isSelected = currentActiveServer === `${quality}-${s.server}`;
      html += `
        <button class="server-btn ${isSelected ? 'active' : ''}" onclick="switchMirror('${quality}', ${idx}, '${s.server}')">
          <i class="fa-solid fa-server"></i> ${s.server.toUpperCase()}
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
  const defaultStream = episodeData.default_stream || episodeData.default_stream_url || episodeData.defaultStreamingUrl;
  if (defaultStream) {
    player.src = defaultStream;
  }
  renderServerButtons(currentQuality);
};

window.switchMirror = async function(quality, serverIndex, serverName) {
  const matchingServers = normalizedMirrors.filter(m => m.quality.toLowerCase() === quality.toLowerCase());
  const targetServer = matchingServers[serverIndex];

  if (!targetServer) return;

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
      currentEpisodeSlug,
      targetServer.serverId
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

  // Normalize download list
  const list = Array.isArray(downloads) ? downloads : (downloads.qualities || []);

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
        ${list.map(item => `
          <tr>
            <td><strong>${item.quality || item.title || 'HD'}</strong></td>
            <td>${item.size || '-'}</td>
            <td>
              ${(item.links || item.serverList || []).map(l => `<a href="${l.url}" target="_blank" rel="noopener noreferrer" class="batch-link"><i class="fa-solid fa-cloud-arrow-down"></i> ${l.server || l.title || 'Download'}</a>`).join('')}
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
        animeTitle: animeDetail.title || (episodeData && episodeData.title?.replace(/Episode\s+\d+.*$/i, '').trim()) || 'Anime',
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
            <span style="font-size: 0.72rem; color: var(--text-dim);">${ep.date || ''}</span>
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
