/**
 * Stella-Nime - Schedule Controller (schedule.js)
 */

let scheduleData = {};
let activeDay = '';

document.addEventListener('DOMContentLoaded', () => {
  initNavbarSearch();
  loadSchedule();
});

async function loadSchedule() {
  const loading = document.getElementById('scheduleLoading');
  const tabs = document.getElementById('dayTabs');
  const grid = document.getElementById('scheduleGrid');

  try {
    scheduleData = await API.getSchedule();
    const days = Object.keys(scheduleData);

    if (days.length === 0) {
      loading.innerHTML = '<p style="color: var(--text-muted);">Jadwal rilis tidak tersedia.</p>';
      return;
    }

    // Determine current day in Indonesian
    const indonesianDays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const currentDayName = indonesianDays[new Date().getDay()];
    activeDay = days.includes(currentDayName) ? currentDayName : days[0];

    // Render Tabs
    tabs.innerHTML = days.map(day => `
      <button class="source-tab-btn ${day === activeDay ? 'active' : ''}" onclick="selectDay('${day}')">
        <i class="fa-regular fa-clock"></i> ${day}
      </button>
    `).join('');

    renderAnimeForDay(activeDay);

    loading.style.display = 'none';
    grid.style.display = 'grid';

  } catch (error) {
    console.error('Failed to load schedule:', error);
    loading.innerHTML = `<p style="color: var(--text-muted);">Gagal memuat jadwal: ${error.message}</p>`;
  }
}

window.selectDay = function(day) {
  activeDay = day;
  const tabs = document.querySelectorAll('#dayTabs .source-tab-btn');
  tabs.forEach(t => {
    if (t.textContent.includes(day)) t.classList.add('active');
    else t.classList.remove('active');
  });
  renderAnimeForDay(day);
};

function renderAnimeForDay(day) {
  const grid = document.getElementById('scheduleGrid');
  const list = scheduleData[day] || [];

  if (list.length === 0) {
    grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 30px;">Tidak ada jadwal anime rilis untuk hari ini.</div>';
    return;
  }

  grid.innerHTML = list.map(anime => `
    <a href="/anime/${anime.slug}" class="episode-btn">
      <span style="display: flex; align-items: center; gap: 8px;">
        <i class="fa-solid fa-circle-play" style="color: var(--primary-light); font-size: 0.8rem;"></i>
        <span>${anime.title}</span>
      </span>
      <i class="fa-solid fa-chevron-right" style="color: var(--text-dim); font-size: 0.75rem;"></i>
    </a>
  `).join('');
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
