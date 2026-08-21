const axios = require('axios');

const SAMEHADAKU_API_URL = 'https://www.sankavollerei.com/anime/samehadaku';

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/html, */*'
};

function cleanTitle(raw) {
  if (!raw) return '';
  return raw
    .replace(/^TV\s+Episode\s+\d+\s*/i, '')
    .replace(/^Movie\s*/i, '')
    .replace(/^OVA\s*/i, '')
    .replace(/Episode\s+\d+.*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Get Samehadaku Homepage (Ongoing / Recent & Popular / Complete)
 */
async function getHome() {
  try {
    const res = await axios.get(`${SAMEHADAKU_API_URL}/home`, {
      headers: BROWSER_HEADERS,
      timeout: 10000
    });

    const apiData = res.data?.data || res.data;
    const recentList = apiData.recent?.animeList || apiData.recent?.anime || apiData.recent || [];
    const top10List = apiData.top10?.animeList || apiData.top10?.anime || apiData.top10 || [];

    const ongoing = recentList.map(item => ({
      title: cleanTitle(item.title) || item.title || '',
      slug: item.animeId || item.slug || '',
      episode: item.episodes ? `Episode ${item.episodes}` : 'Episode Terbaru',
      release_day: 'Terbaru',
      release_date: item.releasedOn || 'Baru Rilis',
      type: item.type || 'Anime',
      poster: item.poster || item.thumbnail || '',
      source: 'samehadaku'
    }));

    const complete = top10List.map(item => ({
      title: cleanTitle(item.title) || item.title || '',
      slug: item.animeId || item.slug || '',
      total_episodes: item.episodes ? `${item.episodes} Ep` : 'Ongoing',
      rating: item.score ? `★ ${item.score}` : '★ 8.6',
      release_date: 'Populer',
      type: item.type || 'TV',
      poster: item.poster || item.thumbnail || '',
      source: 'samehadaku'
    }));

    return { ongoing, complete, latest: ongoing, popular: complete };
  } catch (err) {
    console.error('Samehadaku getHome error:', err.message);
    return { ongoing: [], complete: [], latest: [], popular: [] };
  }
}

/**
 * Search Anime
 */
async function searchAnime(query) {
  if (!query || !query.trim()) return [];
  try {
    const res = await axios.get(`${SAMEHADAKU_API_URL}/search?q=${encodeURIComponent(query.trim())}`, {
      headers: BROWSER_HEADERS,
      timeout: 10000
    });
    const apiData = res.data?.data || res.data;
    const list = apiData.animeList || apiData.anime || apiData || [];

    return list.map(item => ({
      title: cleanTitle(item.title) || item.title || '',
      slug: item.animeId || item.slug || '',
      poster: item.poster || item.thumbnail || '',
      rating: item.score ? `★ ${item.score}` : '',
      genres: (item.genreList || []).map(g => ({ name: g.title || g.name, slug: g.genreId || g.slug })),
      source: 'samehadaku'
    }));
  } catch (err) {
    console.error('Samehadaku search error:', err.message);
    return [];
  }
}

/**
 * Get Anime Detail by slug
 */
async function getAnimeDetail(slug) {
  try {
    const res = await axios.get(`${SAMEHADAKU_API_URL}/anime/${slug}`, {
      headers: BROWSER_HEADERS,
      timeout: 10000
    });

    const d = res.data?.data || res.data;
    if (!d) return null;

    const animeTitle = (d.title && d.title.trim()) || d.english || d.japanese || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const episodes = (d.episodeList || []).map(ep => ({
      title: typeof ep.title === 'number' ? `Episode ${ep.title}` : (ep.title || `Episode ${ep.episodeId?.split('-').pop() || ''}`),
      slug: ep.episodeId || ep.slug || '',
      date: ep.releasedOn || '',
      url: `/watch/${ep.episodeId || ep.slug || ''}`
    }));

    const genres = (d.genreList || []).map(g => ({
      name: g.title || g.name || '',
      slug: g.genreId || g.slug || ''
    }));

    const info = {
      japanese: d.japanese || '',
      english: d.english || '',
      synonyms: d.synonyms || '',
      status: d.status || '',
      type: d.type || '',
      duration: d.duration || '',
      total_episodes: d.episodes || '',
      season: d.season || '',
      studios: d.studios || '',
      producers: d.producers || '',
      released: d.aired || '',
      score: d.score || ''
    };

    const batch = (d.batchList || []).map(b => ({
      quality: b.title || 'Batch',
      links: (b.serverList || []).map(s => ({ name: s.title, url: s.url }))
    }));

    return {
      title: animeTitle,
      poster: d.poster || '',
      synopsis: typeof d.synopsis === 'string' ? d.synopsis : (Array.isArray(d.synopsis?.paragraphs) ? d.synopsis.paragraphs.join('\n\n') : ''),
      info,
      genres,
      episodes,
      batch
    };
  } catch (err) {
    console.error(`Samehadaku anime detail error for ${slug}:`, err.message);
    return null;
  }
}

/**
 * Get Episode Data & Video Streaming
 */
async function getEpisode(slug) {
  try {
    const res = await axios.get(`${SAMEHADAKU_API_URL}/episode/${slug}`, {
      headers: BROWSER_HEADERS,
      timeout: 10000
    });

    const d = res.data?.data || res.data;
    if (!d) return null;

    const mirrors = [];
    if (d.server?.qualities) {
      d.server.qualities.forEach(q => {
        const qualityName = q.title || 'HD';
        (q.serverList || []).forEach(s => {
          mirrors.push({
            quality: qualityName,
            server: s.title || 'Server',
            data_content: s.serverId || s.url || '',
            serverId: s.serverId || ''
          });
        });
      });
    }

    const downloads = [];
    if (d.downloadUrl?.qualities) {
      d.downloadUrl.qualities.forEach(q => {
        downloads.push({
          quality: q.title || 'HD',
          size: '',
          links: (q.serverList || []).map(s => ({ name: s.title, url: s.url }))
        });
      });
    }

    return {
      title: d.title || slug,
      anime_title: d.title?.replace(/Episode\s+\d+.*$/i, '').trim() || '',
      anime_slug: d.animeId || '',
      default_stream: d.defaultStreamingUrl || '',
      prev_episode: d.prevEpisode?.episodeId || '',
      next_episode: d.nextEpisode?.episodeId || '',
      mirrors,
      downloads
    };
  } catch (err) {
    console.error(`Samehadaku episode error for ${slug}:`, err.message);
    return null;
  }
}

/**
 * Resolve Mirror Server ID to Stream URL
 */
async function resolveServer(serverId) {
  try {
    const res = await axios.get(`${SAMEHADAKU_API_URL}/server/${serverId}`, {
      headers: BROWSER_HEADERS,
      timeout: 10000
    });
    const url = res.data?.data?.url || res.data?.data || res.data?.url;
    if (url) {
      return { stream_url: url };
    }
  } catch (err) {
    console.error(`Samehadaku server resolution error for ${serverId}:`, err.message);
  }
  return null;
}

/**
 * Get Release Schedule
 */
async function getSchedule() {
  try {
    const res = await axios.get(`${SAMEHADAKU_API_URL}/schedule`, {
      headers: BROWSER_HEADERS,
      timeout: 10000
    });

    const d = res.data?.data || res.data;
    const daysList = d.days || d || [];
    const schedule = {};

    if (Array.isArray(daysList)) {
      daysList.forEach(dayItem => {
        const dayName = dayItem.day || dayItem.title || 'Jadwal';
        schedule[dayName] = (dayItem.animeList || []).map(a => ({
          title: a.title,
          slug: a.animeId || a.slug || '',
          url: `/anime/${a.animeId || a.slug || ''}`
        }));
      });
    }

    return schedule;
  } catch (err) {
    console.error('Samehadaku schedule error:', err.message);
    return {};
  }
}

/**
 * Get Genre List
 */
async function getGenres() {
  try {
    const res = await axios.get(`${SAMEHADAKU_API_URL}/genres`, {
      headers: BROWSER_HEADERS,
      timeout: 10000
    });
    const d = res.data?.data || res.data;
    const list = d.genreList || d || [];
    return list.map(g => ({
      name: g.title || g.name || '',
      slug: g.genreId || g.slug || '',
      url: `/genres/${g.genreId || g.slug || ''}`
    }));
  } catch (err) {
    console.error('Samehadaku genres error:', err.message);
    return [];
  }
}

/**
 * Get Anime by Genre Slug & Page
 */
async function getAnimeByGenre(slug, page = 1) {
  try {
    const res = await axios.get(`${SAMEHADAKU_API_URL}/genres/${slug}?page=${page}`, {
      headers: BROWSER_HEADERS,
      timeout: 10000
    });
    const d = res.data?.data || res.data;
    const list = d.animeList || d.anime || d || [];

    const animeList = list.map(item => ({
      title: cleanTitle(item.title) || item.title || '',
      slug: item.animeId || item.slug || '',
      poster: item.poster || item.thumbnail || '',
      rating: item.score ? `★ ${item.score}` : '',
      episodes: item.episodes || '',
      genres: (item.genreList || []).map(g => ({ name: g.title || g.name, slug: g.genreId || g.slug })),
      url: `/anime/${item.animeId || item.slug || ''}`
    }));

    return {
      anime: animeList,
      page,
      has_next: list.length >= 10,
      has_prev: page > 1
    };
  } catch (err) {
    console.error(`Samehadaku anime by genre error for ${slug}:`, err.message);
    return { anime: [], page: 1, has_next: false, has_prev: false };
  }
}

module.exports = {
  getHome,
  searchAnime,
  getAnimeDetail,
  getEpisode,
  resolveServer,
  getSchedule,
  getGenres,
  getAnimeByGenre
};
