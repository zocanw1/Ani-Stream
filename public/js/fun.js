/**
 * Stella-Nime - MyAnimeList Fun Zone Controller (fun.js)
 */

let currentQuiz = null;

document.addEventListener('DOMContentLoaded', () => {
  initNavbarSearch();
  loadQuote();
  loadQuiz();
  loadTopCharacters();

  // Quote Button
  const quoteBtn = document.getElementById('btnNewQuote');
  if (quoteBtn) quoteBtn.addEventListener('click', loadQuote);

  // New Quiz Button
  const quizBtn = document.getElementById('btnNewQuiz');
  if (quizBtn) quizBtn.addEventListener('click', loadQuiz);
});

async function loadQuote() {
  const textEl = document.getElementById('quoteText');
  const authorEl = document.getElementById('quoteAuthor');

  try {
    const data = await API.getMalQuote();
    textEl.textContent = `"${data.quote}"`;
    authorEl.innerHTML = `<i class="fa-solid fa-quote-left" style="color: var(--primary-light);"></i> ${data.character} — <span style="color: var(--text-muted); font-weight: 500;">${data.anime}</span>`;
  } catch (err) {
    console.error('Failed to load quote:', err);
  }
}

async function loadQuiz() {
  const qEl = document.getElementById('quizQuestion');
  const optContainer = document.getElementById('quizOptions');
  const expEl = document.getElementById('quizExplanation');

  if (expEl) expEl.style.display = 'none';

  try {
    currentQuiz = await API.getMalQuiz();
    qEl.textContent = currentQuiz.question;

    optContainer.innerHTML = currentQuiz.options.map((opt, idx) => `
      <button class="quiz-option-btn" data-index="${idx}">
        <span style="display: inline-block; width: 26px; height: 26px; border-radius: 50%; background: rgba(255,255,255,0.08); text-align: center; line-height: 26px; font-size: 0.8rem;">
          ${String.fromCharCode(65 + idx)}
        </span>
        <span>${opt}</span>
      </button>
    `).join('');

    const btns = optContainer.querySelectorAll('.quiz-option-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => handleAnswer(parseInt(btn.dataset.index), btns));
    });

  } catch (err) {
    console.error('Failed to load quiz:', err);
  }
}

function handleAnswer(selectedIndex, allButtons) {
  const expEl = document.getElementById('quizExplanation');

  allButtons.forEach(b => b.disabled = true);

  if (selectedIndex === currentQuiz.answerIndex) {
    allButtons[selectedIndex].classList.add('correct');
    if (expEl) {
      expEl.innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--accent-cyan); margin-right: 6px;"></i> <strong>Tepat sekali!</strong> Jawabanmu benar.`;
      expEl.style.display = 'block';
    }
  } else {
    allButtons[selectedIndex].classList.add('wrong');
    allButtons[currentQuiz.answerIndex].classList.add('correct');
    if (expEl) {
      expEl.innerHTML = `<i class="fa-solid fa-circle-xmark" style="color: #ef4444; margin-right: 6px;"></i> <strong>Kurang tepat!</strong> Jawaban yang benar adalah: <u>${currentQuiz.options[currentQuiz.answerIndex]}</u>`;
      expEl.style.display = 'block';
    }
  }
}

async function loadTopCharacters() {
  const grid = document.getElementById('charactersGrid');
  try {
    const data = await API.getMalCharacters();
    if (data && data.length > 0) {
      grid.innerHTML = data.map((char, i) => `
        <div class="anime-poster-card">
          <div class="anime-poster-wrap">
            <span class="card-badge-type">MAL</span>
            <span class="card-rank-badge">#${char.rank || i + 1}</span>
            <img src="${char.image || DEFAULT_POSTER}" alt="${char.name}" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='${DEFAULT_POSTER}';">
            <div class="card-bottom-overlay">
              <div class="card-overlay-title" title="${char.name}">${char.name}</div>
              <div class="card-overlay-meta">
                <span class="card-ep-text">${char.anime || 'Anime'}</span>
                <span class="card-rating-text"><i class="fa-solid fa-heart" style="color: var(--primary-light);"></i> ${char.favorites || ''}</span>
              </div>
            </div>
          </div>
        </div>
      `).join('');
    } else {
      grid.innerHTML = '<div style="grid-column: 1/-1; color: var(--text-muted); text-align: center;">Gagal memuat karakter.</div>';
    }
  } catch (err) {
    grid.innerHTML = `<div style="grid-column: 1/-1; color: var(--text-muted); text-align: center;">Error: ${err.message}</div>`;
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

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-capsule-wrapper')) {
      dropdown.classList.remove('show');
    }
  });
}
