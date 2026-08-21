/**
 * Stella-Nime - Anime Detail Controller (anime.js)
 */

let currentAnime = null;
let episodesList = [];
let isAscending = false;

document.addEventListener('DOMContentLoaded', () => {
  initNavbarSearch();
  const pathParts = window.location.pathname.split('/');
  const slug = pathParts[pathParts.length - 1] || new URLSearchParams(window.location.search).get('slug');

  if (slug) {
    loadAnimeDetail(slug);
  } else {
    document.getElementById('loadingState').innerHTML = '<p style="color: var(--text-muted);">Slug anime tidak ditemukan.</p>';
  }
});

async function loadAnimeDetail(slug) {
  const loading = document.getElementById('loadingState');
  const container = document.getElementById('detailContainer');

  try {
    const data = await API.getAnime(slug);
    currentAnime = { ...data, slug };
    document.title = `${data.title} Sub Indo | StellaNime`;

    // Populate metadata
    document.getElementById('animeTitle').textContent = data.title;
    document.getElementById('animeJapanese').textContent = data.japanese_title || '';
    const posterImg = document.getElementById('animePoster');
    posterImg.src = data.poster || DEFAULT_POSTER;
    posterImg.onerror = function() { this.onerror = null; this.src = DEFAULT_POSTER; };
    document.getElementById('animeSynopsis').textContent = data.synopsis || 'Sinopsis belum tersedia.';

    // Pills (Score, Type, Status, Episodes, Studio, etc.)
    const pillsContainer = document.getElementById('animePills');
    const pills = [];
    const scoreVal = data.score || data.info?.score;
    const statusVal = data.status || data.info?.status;
    const typeVal = data.type || data.info?.type;
    const epsVal = data.total_episodes || data.info?.total_episodes || (data.episodes ? `${data.episodes.length}` : '');
    const durVal = data.duration || data.info?.duration;
    const studioVal = data.studio || data.info?.studios;
    const relVal = data.release_date || data.info?.released;

    if (scoreVal) pills.push(`<div class="meta-pill score-pill"><i class="fa-solid fa-star"></i> <strong>${scoreVal}</strong></div>`);
    if (statusVal) pills.push(`<div class="meta-pill"><i class="fa-solid fa-circle-info" style="color: var(--primary-light);"></i> <strong>${statusVal}</strong></div>`);
    if (typeVal) pills.push(`<div class="meta-pill"><i class="fa-solid fa-film"></i> ${typeVal}</div>`);
    if (epsVal) pills.push(`<div class="meta-pill"><i class="fa-solid fa-list-ol"></i> ${epsVal} Ep</div>`);
    if (durVal) pills.push(`<div class="meta-pill"><i class="fa-solid fa-clock"></i> ${durVal}</div>`);
    if (studioVal) pills.push(`<div class="meta-pill"><i class="fa-solid fa-building"></i> ${studioVal}</div>`);
    if (relVal) pills.push(`<div class="meta-pill"><i class="fa-solid fa-calendar"></i> ${relVal}</div>`);
    pillsContainer.innerHTML = pills.join('');

    // Genres
    const genresContainer = document.getElementById('animeGenres');
    if (data.genres && data.genres.length > 0) {
      genresContainer.innerHTML = data.genres.map(g => `
        <a href="/genres?slug=${g.slug}" class="genre-tag">${g.name}</a>
      `).join('');
    } else {
      genresContainer.innerHTML = '';
    }

    // Bookmark Button
    const bookmarkBtn = document.getElementById('btnBookmark');
    updateBookmarkButton(slug, bookmarkBtn);
    bookmarkBtn.addEventListener('click', () => {
      StorageManager.toggleBookmark({
        slug,
        title: data.title,
        poster: data.poster,
        score: data.score
      });
      updateBookmarkButton(slug, bookmarkBtn);
    });

    // Episodes
    episodesList = data.episodes || [];
    document.getElementById('episodeCount').textContent = episodesList.length;

    // First Episode Button
    const firstEpBtn = document.getElementById('btnFirstEpisode');
    if (episodesList.length > 0) {
      const ep1 = [...episodesList].reverse()[0];
      firstEpBtn.href = `/watch/${ep1.slug}`;
      firstEpBtn.innerHTML = `<i class="fa-solid fa-play"></i> Tonton Episode 1`;
    } else {
      firstEpBtn.style.display = 'none';
    }

    renderEpisodes(episodesList);

    // Episode search & sort
    document.getElementById('epSearchInput').addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      const filtered = episodesList.filter(ep => ep.title.toLowerCase().includes(q));
      renderEpisodes(filtered);
    });

    document.getElementById('epOrderBtn').addEventListener('click', () => {
      isAscending = !isAscending;
      episodesList.reverse();
      renderEpisodes(episodesList);
      document.getElementById('epOrderBtn').innerHTML = isAscending 
        ? `<i class="fa-solid fa-arrow-up-short-wide"></i> Terlama`
        : `<i class="fa-solid fa-arrow-down-short-wide"></i> Terbaru`;
    });

    // Batch download rendering (if available)
    if (data.batch && (data.batch.url || data.batch.downloads)) {
      const batchSec = document.getElementById('batchSection');
      const batchContent = document.getElementById('batchContent');
      batchSec.style.display = 'block';
      if (data.batch.downloads && data.batch.downloads.length > 0) {
        batchContent.innerHTML = `
          <table class="batch-table">
            <thead>
              <tr>
                <th>Kualitas</th>
                <th>Ukuran</th>
                <th>Link Unduh</th>
              </tr>
            </thead>
            <tbody>
              ${data.batch.downloads.map(d => `
                <tr>
                  <td><strong>${d.quality}</strong></td>
                  <td>${d.size || '-'}</td>
                  <td>
                    ${d.links.map(l => `<a href="${l.url}" target="_blank" class="batch-link">${l.name}</a>`).join('')}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }
    }

    loading.style.display = 'none';
    container.style.display = 'block';

  } catch (error) {
    console.error('Failed to load anime detail:', error);
    loading.innerHTML = `<p style="color: var(--text-muted);">Gagal memuat anime: ${error.message}</p>`;
  }
}

function renderEpisodes(list) {
  const grid = document.getElementById('episodesGrid');
  if (list.length === 0) {
    grid.innerHTML = '<div style="grid-column: 1 / -1; color: var(--text-muted); text-align: center; padding: 20px;">Episode tidak ditemukan.</div>';
    return;
  }

  grid.innerHTML = list.map(ep => `
    <a href="/watch/${ep.slug}" class="episode-btn">
      <span style="display: flex; align-items: center; gap: 8px;">
        <i class="fa-solid fa-play" style="color: var(--primary-light); font-size: 0.75rem;"></i> 
        <span>${ep.title}</span>
      </span>
      <span style="font-size: 0.72rem; color: var(--text-dim);">${ep.release_date || ''}</span>
    </a>
  `).join('');
}

function updateBookmarkButton(slug, btn) {
  const isSaved = StorageManager.isBookmarked(slug);
  if (isSaved) {
    btn.innerHTML = '<i class="fa-solid fa-bookmark" style="color: var(--accent-cyan);"></i> Tersimpan di Library';
    btn.classList.add('active');
  } else {
    btn.innerHTML = '<i class="fa-regular fa-bookmark"></i> Simpan ke Library';
    btn.classList.remove('active');
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
