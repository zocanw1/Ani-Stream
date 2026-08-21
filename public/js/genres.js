/**
 * Stella-Nime - Genre Explorer Controller (genres.js)
 */

let allGenres = [];
let currentGenre = '';
let currentPage = 1;

document.addEventListener('DOMContentLoaded', () => {
  initNavbarSearch();
  const urlParams = new URLSearchParams(window.location.search);
  const slugFromUrl = urlParams.get('slug');
  loadGenres(slugFromUrl);
});

async function loadGenres(initialGenreSlug) {
  const tagCloud = document.getElementById('genresTagCloud');

  try {
    allGenres = await API.getGenres();
    
    if (allGenres.length === 0) {
      tagCloud.innerHTML = '<p style="color: var(--text-muted);">Tidak ada genre ditemukan.</p>';
      return;
    }

    tagCloud.innerHTML = allGenres.map(g => `
      <button class="genre-tag ${g.slug === initialGenreSlug ? 'active' : ''}" onclick="selectGenre('${g.slug}', '${g.title}')" style="cursor: pointer;">
        ${g.title}
      </button>
    `).join('');

    if (initialGenreSlug) {
      const g = allGenres.find(item => item.slug === initialGenreSlug);
      selectGenre(initialGenreSlug, g ? g.title : initialGenreSlug);
    }

  } catch (error) {
    console.error('Failed to load genres:', error);
    tagCloud.innerHTML = `<p style="color: var(--text-muted);">Gagal memuat genre: ${error.message}</p>`;
  }
}

window.selectGenre = function(slug, title) {
  currentGenre = slug;
  currentPage = 1;
  document.getElementById('activeGenreTitle').textContent = title || slug;
  
  // Update active tag style
  const tags = document.querySelectorAll('.genre-tag');
  tags.forEach(t => {
    if (t.textContent.trim().toLowerCase() === (title || slug).toLowerCase()) {
      t.style.background = 'var(--primary)';
      t.style.color = '#ffffff';
    } else {
      t.style.background = 'var(--primary-bg)';
      t.style.color = 'var(--primary-light)';
    }
  });

  loadAnimeForGenre(slug, 1);
};

async function loadAnimeForGenre(slug, page) {
  const sec = document.getElementById('genreResultsSection');
  const grid = document.getElementById('genreAnimeGrid');
  const prevBtn = document.getElementById('prevPageBtn');
  const nextPageBtn = document.getElementById('nextPageBtn');

  sec.style.display = 'block';
  grid.innerHTML = '<div class="spinner" style="grid-column: 1 / -1; margin: 40px auto;"></div>';

  window.scrollTo({ top: sec.offsetTop - 80, behavior: 'smooth' });

  try {
    const data = await API.getAnimeByGenre(slug, page);

    if (data.anime && data.anime.length > 0) {
      grid.innerHTML = data.anime.map((anime, i) => `
        <div class="anime-poster-card">
          <a href="/anime/${anime.slug}">
            <div class="anime-poster-wrap">
              <span class="card-badge-type">GENRE</span>
              <span class="card-rank-badge">★</span>
              <img src="${anime.poster || DEFAULT_POSTER}" alt="${anime.title}" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='${DEFAULT_POSTER}';">
              <div class="card-bottom-overlay">
                <div class="card-overlay-title" title="${anime.title}">${anime.title}</div>
                <div class="card-overlay-meta">
                  <span class="card-ep-text"><i class="fa-solid fa-film" style="color: var(--primary-light); font-size: 0.7rem; margin-right: 3px;"></i> ${anime.episodes || anime.studio || 'Anime'}</span>
                  <span class="card-rating-text"><i class="fa-solid fa-star"></i> ${anime.rating || '8.0'}</span>
                </div>
              </div>
            </div>
          </a>
        </div>
      `).join('');

      // Pagination
      prevBtn.style.display = page > 1 ? 'inline-flex' : 'none';
      prevBtn.onclick = () => { currentPage--; loadAnimeForGenre(slug, currentPage); };

      nextPageBtn.style.display = data.has_next ? 'inline-flex' : 'none';
      nextPageBtn.onclick = () => { currentPage++; loadAnimeForGenre(slug, currentPage); };

    } else {
      grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 40px 0;">Tidak ada anime untuk genre ini.</div>';
      prevBtn.style.display = 'none';
      nextPageBtn.style.display = 'none';
    }

  } catch (error) {
    console.error('Failed to load anime by genre:', error);
    grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted);">Gagal memuat anime: ${error.message}</div>`;
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
