/**
 * Stella-Nime - LocalStorage & Global Storage Manager with Cloud Sync
 */

var DEFAULT_POSTER = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80';

if (typeof window !== 'undefined') {
  window.DEFAULT_POSTER = DEFAULT_POSTER;
}

const STORAGE_KEYS = {
  BOOKMARKS: 'stella_nime_bookmarks',
  HISTORY: 'stella_nime_history'
};

const StorageManager = {
  // --- Bookmarks ---
  getBookmarks() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKMARKS)) || [];
    } catch (e) {
      return [];
    }
  },

  isBookmarked(slug) {
    const list = this.getBookmarks();
    return list.some(item => item.slug === slug);
  },

  toggleBookmark(anime) {
    const list = this.getBookmarks();
    const index = list.findIndex(item => item.slug === anime.slug);
    let isAdded = false;

    if (index >= 0) {
      list.splice(index, 1);
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(list));
      isAdded = false;
    } else {
      list.unshift({
        slug: anime.slug,
        title: anime.title,
        poster: anime.poster,
        score: anime.score || '',
        savedAt: Date.now()
      });
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(list));
      isAdded = true;
    }

    // Trigger Cloud Sync if user is logged in
    if (typeof AuthManager !== 'undefined' && AuthManager.isLoggedIn()) {
      AuthManager.syncWithServer();
    }

    return isAdded;
  },

  // --- Watch History ---
  getHistory() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY)) || [];
    } catch (e) {
      return [];
    }
  },

  saveHistory(item) {
    // item: { episodeSlug, episodeTitle, animeSlug, animeTitle, poster, lastWatchedAt }
    const list = this.getHistory();
    const filtered = list.filter(h => h.animeSlug !== item.animeSlug);
    filtered.unshift({
      ...item,
      lastWatchedAt: Date.now()
    });
    // Keep max 50 items
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(filtered.slice(0, 50)));

    // Trigger Cloud Sync if user is logged in
    if (typeof AuthManager !== 'undefined' && AuthManager.isLoggedIn()) {
      AuthManager.syncWithServer();
    }
  },

  clearHistory() {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    if (typeof AuthManager !== 'undefined' && AuthManager.isLoggedIn()) {
      AuthManager.syncWithServer();
    }
  }
};

if (typeof window !== 'undefined') {
  window.StorageManager = StorageManager;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StorageManager, DEFAULT_POSTER, STORAGE_KEYS };
}
