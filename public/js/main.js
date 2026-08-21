/**
 * Stella-Nime - Professional Anime Streaming Homepage Controller
 */

let activeProvider = 'otakudesu';

document.addEventListener('DOMContentLoaded', () => {
  initLiveSearch();
  loadHistory();
  loadHomeContent('otakudesu');
});

/**
 * Switch Active Anime Provider (Otakudesu, Kuronime, Samehadaku)
 */
window.switchSource = function(provider) {
  activeProvider = provider;

  ['btnSrcOtakudesu', 'btnSrcKuronime', 'btnSrcSamehadaku'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.classList.remove('active');
  });

  if (provider === 'otakudesu') document.getElementById('btnSrcOtakudesu')?.classList.add('active');
  if (provider === 'kuronime') document.getElementById('btnSrcKuronime')?.classList.add('active');
  if (provider === 'samehadaku') document.getElementById('btnSrcSamehadaku')?.classList.add('active');

  loadHomeContent(provider);
};

/**
 * Load Watch History from LocalStorage
 */
function loadHistory() {
  const history = StorageManager.getHistory();
  const historySec = document.getElementById('historySection');
  const historyGrid = document.getElementById('historyGrid');

  if (history && history.length > 0) {
    historySec.style.display = 'block';
    historyGrid.innerHTML = history.slice(0, 6).map((item, index) => `
      <div class="anime-poster-card">
        <a href="/watch/${item.episodeSlug}">
          <div class="anime-poster-wrap">
            <span class="card-badge-type">HISTORY</span>
            <span class="card-badge-status">LANJUT</span>
            <img src="${item.poster || DEFAULT_POSTER}" alt="${item.animeTitle}" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='${DEFAULT_POSTER}';">
            <div class="card-bottom-overlay">
              <div class="card-overlay-title">${item.animeTitle}</div>
              <div class="card-overlay-meta">
                <span class="card-ep-text">${item.episodeTitle || 'Episode'}</span>
                <span class="card-rating-text"><i class="fa-solid fa-play"></i> Putar</span>
              </div>
            </div>
          </div>
        </a>
      </div>
    `).join('');
  }
}

/**
 * Helper to generate pseudo-realistic data for anime cards when missing
 */
function extractEpNumber(epStr) {
  if (!epStr) return 1;
  const m = epStr.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 1;
}

/**
 * Render Section 1: Wide Update Card (Matching Reference Images 1 & 3)
 */
function renderUpdateCard(anime) {
  const epNum = extractEpNumber(anime.episode);
  const prevEpNum = epNum > 1 ? epNum - 1 : 1;
  const ratingVal = (7.5 + ((anime.title.length * 7) % 20) / 10).toFixed(1);
  const viewsVal = ((anime.title.length * 43) % 800) + 120;
  const dateStr = anime.release_date || 'Terbaru';

  return `
    <div class="anime-update-card">
      <div class="update-poster-wrap">
        <a href="/anime/${anime.slug}">
          <img src="${anime.poster || DEFAULT_POSTER}" alt="${anime.title}" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='${DEFAULT_POSTER}';">
        </a>
      </div>
      <div class="update-info-wrap">
        <a href="/anime/${anime.slug}" class="update-anime-title" title="${anime.title}">
          ${anime.title}
        </a>
        <div class="update-ep-list">
          <a href="/anime/${anime.slug}" class="update-ep-item">
            <span class="ep-left">
              <i class="fa-solid fa-circle-play"></i> ${anime.episode || 'Episode ' + epNum}
            </span>
            <span class="ep-date">${dateStr}</span>
          </a>
          ${epNum > 1 ? `
            <a href="/anime/${anime.slug}" class="update-ep-item">
              <span class="ep-left">
                <i class="fa-regular fa-circle-play"></i> Episode ${prevEpNum}
              </span>
              <span class="ep-date">Minggu lalu</span>
            </a>
          ` : ''}
        </div>
        <div class="update-meta-row">
          <span class="badge-ongoing-tag">ongoing</span>
          <span class="update-stat-item"><i class="fa-solid fa-list-ul"></i> ${epNum} Eps</span>
          <span class="update-stat-item"><i class="fa-solid fa-eye"></i> ${viewsVal}</span>
          <span class="update-stat-score"><i class="fa-solid fa-star"></i> ${ratingVal}</span>
          ${anime.release_day ? `<span class="update-stat-item"><i class="fa-regular fa-clock"></i> ${anime.release_day}</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

/**
 * Render Section 2: Ranked Poster Card (Matching Reference Images 3 & 4)
 */
function renderRankedCard(anime, index) {
  const epText = anime.episode || 'Ep. ' + extractEpNumber(anime.episode || anime.title);
  const ratingVal = anime.rating || (7.8 + ((index * 3) % 18) / 10).toFixed(1);
  const rankNum = index + 1;

  const targetLink = anime.url?.startsWith('http') && (anime.url.includes('kuronime') || anime.url.includes('samehadaku')) 
    ? anime.url 
    : `/anime/${anime.slug}`;

  return `
    <div class="anime-poster-card">
      <a href="${targetLink}">
        <div class="anime-poster-wrap">
          <span class="card-badge-type">TV</span>
          <span class="card-badge-status">ONGOING</span>
          <span class="card-rank-badge">${rankNum}</span>
          <img src="${anime.poster || DEFAULT_POSTER}" alt="${anime.title}" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='${DEFAULT_POSTER}';">
          <div class="card-bottom-overlay">
            <div class="card-overlay-title" title="${anime.title}">${anime.title}</div>
            <div class="card-overlay-meta">
              <span class="card-ep-text"><i class="fa-solid fa-tv" style="color: var(--primary-light); font-size: 0.7rem; margin-right: 3px;"></i> ${epText}</span>
              <span class="card-rating-text"><i class="fa-solid fa-star"></i> ${ratingVal}</span>
            </div>
          </div>
        </div>
      </a>
    </div>
  `;
}

/**
 * Render Complete Anime Poster Card
 */
function renderCompleteCard(anime, index) {
  const ratingVal = anime.rating || (8.0 + ((index * 2) % 15) / 10).toFixed(1);
  const epCount = anime.total_episodes || 'Tamat';

  return `
    <div class="anime-poster-card">
      <a href="/anime/${anime.slug}">
        <div class="anime-poster-wrap">
          <span class="card-badge-type" style="background: var(--accent-cyan); color: #0b0e14;">COMPLETED</span>
          <span class="card-rank-badge">★</span>
          <img src="${anime.poster || DEFAULT_POSTER}" alt="${anime.title}" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='${DEFAULT_POSTER}';">
          <div class="card-bottom-overlay">
            <div class="card-overlay-title" title="${anime.title}">${anime.title}</div>
            <div class="card-overlay-meta">
              <span class="card-ep-text"><i class="fa-solid fa-check-double" style="color: var(--accent-cyan); font-size: 0.7rem; margin-right: 3px;"></i> ${epCount}</span>
              <span class="card-rating-text"><i class="fa-solid fa-star"></i> ${ratingVal}</span>
            </div>
          </div>
        </div>
      </a>
    </div>
  `;
}

/**
 * Load Home Page Data
 */
async function loadHomeContent(provider = 'otakudesu') {
  const updateGrid = document.getElementById('updateAnimeGrid');
  const ongoingGrid = document.getElementById('ongoingGrid');
  const completeGrid = document.getElementById('completeGrid');
  const updateTitle = document.getElementById('updateSectionTitle');
  const ongoingTitle = document.getElementById('ongoingTitle');
  const completeTitle = document.getElementById('completeTitle');

  if (updateGrid) updateGrid.innerHTML = '<div class="spinner" style="grid-column: 1 / -1; margin: 40px auto;"></div>';
  if (ongoingGrid) ongoingGrid.innerHTML = '<div class="spinner" style="grid-column: 1 / -1; margin: 40px auto;"></div>';
  if (completeGrid) completeGrid.innerHTML = '<div class="spinner" style="grid-column: 1 / -1; margin: 40px auto;"></div>';

  try {
    let data;

    if (provider === 'kuronime') {
      if (updateTitle) updateTitle.innerHTML = '<i class="fa-solid fa-paw"></i> Update Anime Kuronime';
      if (ongoingTitle) ongoingTitle.innerHTML = '<i class="fa-solid fa-fire"></i> Anime Ongoing Kuronime';
      if (completeTitle) completeTitle.innerHTML = '<i class="fa-solid fa-star"></i> Populer Kuronime';
      
      data = await API.getKuronimeHome();
      
      if (updateGrid) {
        updateGrid.innerHTML = data.latest.slice(0, 9).map(anime => renderUpdateCard(anime)).join('');
      }
      if (ongoingGrid) {
        ongoingGrid.innerHTML = data.latest.slice(0, 12).map((anime, i) => renderRankedCard(anime, i)).join('');
      }
      if (completeGrid) {
        completeGrid.innerHTML = data.popular.slice(0, 12).map((anime, i) => renderCompleteCard(anime, i)).join('');
      }

    } else if (provider === 'samehadaku') {
      if (updateTitle) updateTitle.innerHTML = '<i class="fa-solid fa-bolt"></i> Update Anime Samehadaku';
      if (ongoingTitle) ongoingTitle.innerHTML = '<i class="fa-solid fa-fire"></i> Anime Ongoing Samehadaku';
      if (completeTitle) completeTitle.innerHTML = '<i class="fa-solid fa-star"></i> Anime Populer Samehadaku';

      data = await API.getSamehadakuHome();

      if (updateGrid) {
        updateGrid.innerHTML = data.latest.slice(0, 9).map(anime => renderUpdateCard(anime)).join('');
      }
      if (ongoingGrid) {
        ongoingGrid.innerHTML = data.latest.slice(0, 12).map((anime, i) => renderRankedCard(anime, i)).join('');
      }
      if (completeGrid) {
        completeGrid.innerHTML = data.popular.slice(0, 12).map((anime, i) => renderCompleteCard(anime, i)).join('');
      }

    } else {
      // Default Otakudesu
      if (updateTitle) updateTitle.innerHTML = '<i class="fa-regular fa-clock"></i> Update Anime Terbaru';
      if (ongoingTitle) ongoingTitle.innerHTML = '<i class="fa-solid fa-fire"></i> Anime Ongoing Populer';
      if (completeTitle) completeTitle.innerHTML = '<i class="fa-solid fa-check-double"></i> Anime Tamat & Rekomendasi';

      data = await API.getHome();

      // Section 1: Update Anime Terbaru (9 Wide Cards)
      if (data.ongoing && data.ongoing.length > 0) {
        if (updateGrid) {
          updateGrid.innerHTML = data.ongoing.slice(0, 9).map(anime => renderUpdateCard(anime)).join('');
        }
        // Section 2: Ongoing Ranked Grid (#1 - #12)
        if (ongoingGrid) {
          ongoingGrid.innerHTML = data.ongoing.slice(0, 12).map((anime, i) => renderRankedCard(anime, i)).join('');
        }
      } else {
        if (updateGrid) updateGrid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted);">Tidak ada anime ongoing ditemukan.</div>';
        if (ongoingGrid) ongoingGrid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted);">Tidak ada anime ongoing ditemukan.</div>';
      }

      // Section 3: Complete Anime Grid
      if (data.complete && data.complete.length > 0) {
        if (completeGrid) {
          completeGrid.innerHTML = data.complete.slice(0, 12).map((anime, i) => renderCompleteCard(anime, i)).join('');
        }
      } else {
        if (completeGrid) completeGrid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted);">Tidak ada anime complete ditemukan.</div>';
      }
    }

  } catch (error) {
    console.error('Failed to load home content:', error);
    if (updateGrid) updateGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted);">Gagal memuat anime: ${error.message}</div>`;
    if (ongoingGrid) ongoingGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted);">Gagal memuat anime: ${error.message}</div>`;
    if (completeGrid) completeGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted);">Gagal memuat anime: ${error.message}</div>`;
  }
}

/**
 * Live Search Handling with Instant Autocomplete Dropdown & Enter Grid
 */
function initLiveSearch() {
  const input = document.getElementById('searchInput');
  const dropdown = document.getElementById('searchDropdown');
  const resultsSec = document.getElementById('searchResultsSection');
  const resultsGrid = document.getElementById('searchResultsGrid');
  const queryText = document.getElementById('searchQueryText');
  const closeBtn = document.getElementById('closeSearchBtn');

  if (!input || !dropdown) return;

  let debounceTimer = null;

  input.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    clearTimeout(debounceTimer);

    if (!query || query.length < 2) {
      dropdown.classList.remove('show');
      dropdown.innerHTML = '';
      return;
    }

    debounceTimer = setTimeout(async () => {
      try {
        const results = await API.search(query);
        if (results && results.length > 0) {
          dropdown.innerHTML = results.slice(0, 6).map(anime => `
            <a href="/anime/${anime.slug}" class="search-result-item">
              <img src="${anime.poster || DEFAULT_POSTER}" alt="${anime.title}" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='${DEFAULT_POSTER}';">
              <div class="search-result-info">
                <div class="search-result-title">${anime.title}</div>
                <div class="search-result-meta">
                  <span style="color: var(--primary-light);">${anime.status || 'Anime'}</span>
                  ${anime.rating ? `<span><i class="fa-solid fa-star" style="color: var(--accent-cyan);"></i> ${anime.rating}</span>` : ''}
                </div>
              </div>
            </a>
          `).join('');
          dropdown.classList.add('show');
        } else {
          dropdown.innerHTML = '<div style="padding: 14px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">Tidak ditemukan</div>';
          dropdown.classList.add('show');
        }
      } catch (err) {
        console.error('Search dropdown error:', err);
      }
    }, 300);
  });

  input.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = input.value.trim();
      if (!query) return;
      dropdown.classList.remove('show');

      if (resultsSec && resultsGrid && queryText) {
        resultsSec.style.display = 'block';
        queryText.textContent = query;
        resultsGrid.innerHTML = '<div class="spinner" style="grid-column: 1 / -1; margin: 30px auto;"></div>';
        
        window.scrollTo({ top: resultsSec.offsetTop - 80, behavior: 'smooth' });

        try {
          const results = await API.search(query);
          if (results && results.length > 0) {
            resultsGrid.innerHTML = results.map((anime, i) => renderRankedCard(anime, i)).join('');
          } else {
            resultsGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 30px 0;">Tidak ada anime yang cocok dengan kata kunci "${query}".</div>`;
          }
        } catch (err) {
          resultsGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted);">Gagal mencari: ${err.message}</div>`;
        }
      }
    }
  });

  if (closeBtn && resultsSec) {
    closeBtn.addEventListener('click', () => {
      resultsSec.style.display = 'none';
      input.value = '';
    });
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-capsule-wrapper')) {
      dropdown.classList.remove('show');
    }
  });
}
