/**
 * Stella-Nime - Client API Helper
 */

const API = {
  // 1. Otakudesu
  async getHome() {
    const res = await fetch('/api/home');
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async search(query) {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async getAnime(slug) {
    const res = await fetch(`/api/anime/${slug}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async getEpisode(slug) {
    const res = await fetch(`/api/episode/${slug}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async resolveMirror(content, nonceAction, streamAction, episodeSlug) {
    const res = await fetch('/api/mirror', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        nonce_action: nonceAction,
        stream_action: streamAction,
        episode_slug: episodeSlug
      })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async getSchedule() {
    const res = await fetch('/api/schedule');
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async getGenres() {
    const res = await fetch('/api/genres');
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async getAnimeByGenre(slug, page = 1) {
    const res = await fetch(`/api/genres/${slug}?page=${page}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  // 2. Kuronime
  async getKuronimeHome() {
    const res = await fetch('/api/kuronime/home');
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async searchKuronime(q) {
    const res = await fetch(`/api/kuronime/search?q=${encodeURIComponent(q)}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  // 3. Samehadaku
  async getSamehadakuHome() {
    const res = await fetch('/api/samehadaku/home');
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async searchSamehadaku(q) {
    const res = await fetch(`/api/samehadaku/search?q=${encodeURIComponent(q)}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  // 4. YouTube Official Anime
  async getYoutubeChannels() {
    const res = await fetch('/api/youtube/channels');
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async searchYoutube(q) {
    const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(q)}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  // 5. MyAnimeList Fun & Seru-seruan
  async getMalTop() {
    const res = await fetch('/api/mal/top');
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async getMalCharacters() {
    const res = await fetch('/api/mal/characters');
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async getMalQuote() {
    const res = await fetch('/api/mal/quote');
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async getMalQuiz() {
    const res = await fetch('/api/mal/quiz');
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  }
};

if (typeof window !== 'undefined') {
  window.API = API;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { API, DEFAULT_POSTER };
}
