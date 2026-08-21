const axios = require('axios');
const cheerio = require('cheerio');

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
 * Get Samehadaku Homepage (Latest Episode & Popular)
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

    const latest = recentList.map(item => ({
      title: cleanTitle(item.title) || item.title || '',
      slug: item.animeId || item.slug || '',
      episode: item.episodes ? `Episode ${item.episodes}` : 'Episode Terbaru',
      release_day: 'Terbaru',
      release_date: item.releasedOn || 'Baru Rilis',
      type: item.type || 'Anime',
      poster: item.poster || item.thumbnail || '',
      source: 'samehadaku'
    }));

    const popular = top10List.map(item => ({
      title: cleanTitle(item.title) || item.title || '',
      slug: item.animeId || item.slug || '',
      total_episodes: item.episodes ? `${item.episodes} Ep` : 'Ongoing',
      rating: item.score ? `★ ${item.score}` : '★ 8.6',
      release_date: 'Populer',
      type: item.type || 'TV',
      poster: item.poster || item.thumbnail || '',
      source: 'samehadaku'
    }));

    return { latest, popular };
  } catch (err) {
    console.error('Samehadaku scraper error:', err.message);
    return { latest: [], popular: [] };
  }
}

/**
 * Search Samehadaku Anime
 */
async function searchAnime(query) {
  if (!query) return [];
  try {
    const res = await axios.get(`${SAMEHADAKU_API_URL}/search?q=${encodeURIComponent(query)}`, {
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

module.exports = {
  getHome,
  searchAnime
};
