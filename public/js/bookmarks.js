/**
 * Stella-Nime - Bookmarks & History Controller (bookmarks.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbarSearch();
  loadBookmarksView();
  loadHistoryView();

  const clearBtn = document.getElementById('clearHistoryBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Yakin ingin menghapus seluruh riwayat tontonan?')) {
        StorageManager.clearHistory();
        loadHistoryView();
      }
    });
  }
});

function loadBookmarksView() {
  const bookmarks = StorageManager.getBookmarks();
  const countEl = document.getElementById('bookmarkCount');
  const grid = document.getElementById('bookmarksGrid');

  countEl.textContent = bookmarks.length;

  if (bookmarks.length === 0) {
    grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 30px;">Belum ada anime yang Anda simpan ke library. Klik tombol "Simpan ke Library" di halaman detail anime.</div>';
    return;
  }

  grid.innerHTML = bookmarks.map(anime => `
    <div class="anime-poster-card">
      <a href="/anime/${anime.slug}">
        <div class="anime-poster-wrap">
          <span class="card-badge-type">SAVED</span>
          <span class="card-rank-badge"><i class="fa-solid fa-bookmark" style="color: var(--primary-light);"></i></span>
          <img src="${anime.poster || DEFAULT_POSTER}" alt="${anime.title}" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='${DEFAULT_POSTER}';">
          <div class="card-bottom-overlay">
            <div class="card-overlay-title" title="${anime.title}">${anime.title}</div>
            <div class="card-overlay-meta">
              <span class="card-ep-text"><i class="fa-solid fa-play" style="color: var(--primary-light); font-size: 0.7rem; margin-right: 3px;"></i> Nonton</span>
              <span class="card-rating-text"><i class="fa-solid fa-star"></i> ${anime.score || '8.5'}</span>
            </div>
          </div>
        </div>
      </a>
    </div>
  `).join('');
}

function loadHistoryView() {
  const history = StorageManager.getHistory();
  const grid = document.getElementById('historyGrid');

  if (history.length === 0) {
    grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 30px;">Belum ada riwayat tontonan.</div>';
    return;
  }

  // Cross-fill missing posters from matching anime in history or bookmarks
  const bookmarks = StorageManager.getBookmarks();
  const posterMap = new Map();
  [...bookmarks, ...history].forEach(item => {
    const slug = item.animeSlug || item.slug;
    const p = item.poster;
    if (slug && p && !p.includes('unsplash') && !posterMap.has(slug)) {
      posterMap.set(slug, p);
    }
  });

  grid.innerHTML = history.map(item => {
    const animeSlug = item.animeSlug || item.slug;
    let posterUrl = item.poster;
    if (!posterUrl || posterUrl.includes('unsplash')) {
      posterUrl = posterMap.get(animeSlug) || DEFAULT_POSTER;
    }

    return `
      <div class="anime-poster-card">
        <a href="/watch/${item.episodeSlug}">
          <div class="anime-poster-wrap">
            <span class="card-badge-type">HISTORY</span>
            <span class="card-badge-status">LANJUT</span>
            <img src="${posterUrl}" alt="${item.animeTitle}" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='${DEFAULT_POSTER}';">
            <div class="card-bottom-overlay">
              <div class="card-overlay-title" title="${item.animeTitle}">${item.animeTitle}</div>
              <div class="card-overlay-meta">
                <span class="card-ep-text">${item.episodeTitle || 'Episode'}</span>
                <span class="card-rating-text"><i class="fa-solid fa-play"></i> Putar</span>
              </div>
            </div>
          </div>
        </a>
      </div>
    `;
  }).join('');
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
