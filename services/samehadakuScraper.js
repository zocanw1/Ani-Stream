const axios = require('axios');
const cheerio = require('cheerio');

const SAMEHADAKU_MIRRORS = [
  'https://samehadaku.care',
  'https://www.sankavollerei.com/anime/samehadaku',
  'https://samehadaku.email',
  'https://samehadaku.how'
];

let activeBaseUrl = SAMEHADAKU_MIRRORS[0];

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8',
  'Sec-Ch-Ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"'
};

async function fetchSamehadaku(path = '') {
  let lastError = null;
  const mirrors = [activeBaseUrl, ...SAMEHADAKU_MIRRORS.filter(m => m !== activeBaseUrl)];

  for (const mirror of mirrors) {
    try {
      const cleanPath = path.startsWith('/') ? path : '/' + path;
      // SankaVollerei REST API format
      if (mirror.includes('sankavollerei')) {
        const apiPath = cleanPath === '/' ? '/home' : cleanPath;
        const res = await axios.get(`${mirror}${apiPath}`, { timeout: 8000 });
        if (res.status === 200 && res.data) {
          activeBaseUrl = mirror;
          return { isApi: true, data: res.data.data || res.data };
        }
      }

      const res = await axios.get(`${mirror}${cleanPath}`, {
        timeout: 8000,
        headers: {
          ...BROWSER_HEADERS,
          'Referer': mirror,
          'Origin': mirror
        }
      });

      if (res.status === 200 && res.data) {
        activeBaseUrl = mirror;
        return { isApi: false, data: res.data };
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Gagal memuat data dari mirror Samehadaku');
}

function extractSlug(url) {
  if (!url) return '';
  const match = url.match(/\/(?:anime|episode|blog)\/([^\/]+)\/?/) || url.match(/\/([^\/]+)\/?$/);
  return match ? match[1] : url.replace(/https?:\/\/[^\/]+\//, '').replace(/\//g, '');
}

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
 * Get Samehadaku Homepage
 */
async function getHome() {
  const result = await fetchSamehadaku('/');

  if (result.isApi) {
    const apiData = result.data;
    const latest = (apiData.recent?.anime || apiData.recent || []).map(item => ({
      title: item.title || '',
      slug: item.slug || item.animeId || '',
      episode: item.episode ? `Episode ${item.episode}` : 'Episode Terbaru',
      type: item.type || 'Anime',
      poster: item.poster || item.thumbnail || '',
      source: 'samehadaku'
    }));

    const popular = (apiData.top10?.anime || apiData.top10 || []).map(item => ({
      title: item.title || '',
      slug: item.slug || item.animeId || '',
      rating: item.score ? `★ ${item.score}` : '8.5',
      type: item.type || 'TV',
      poster: item.poster || item.thumbnail || '',
      source: 'samehadaku'
    }));

    return { latest, popular };
  }

  const $ = cheerio.load(result.data);
  const latest = [];
  const popular = [];

  $('article, .post-show ul li, .animposx, .bsx').each((_, el) => {
    const item = $(el);
    const rawTitle = item.find('h2, .title, a').first().text().trim();
    const title = cleanTitle(rawTitle) || rawTitle;
    const href = item.find('a').first().attr('href') || '';
    const slug = extractSlug(href);
    const poster = item.find('img').attr('src') || item.find('img').attr('data-src') || '';
    const epMatch = rawTitle.match(/Episode\s+(\d+)/i) || item.text().match(/Episode\s+(\d+)/i);
    const episode = epMatch ? `Episode ${epMatch[1]}` : (item.find('.epz, .epx, .bt .ep').text().trim() || 'Episode Terbaru');
    const type = item.find('.typez').text().trim() || 'Anime';

    if (title && slug && !latest.some(l => l.slug === slug)) {
      latest.push({
        title,
        slug,
        episode,
        type,
        poster,
        source: 'samehadaku'
      });
    }
  });

  return { latest: latest.slice(0, 18), popular: latest.slice(0, 10) };
}

/**
 * Search Samehadaku
 */
async function searchAnime(query) {
  if (!query) return [];
  const result = await fetchSamehadaku(`/?s=${encodeURIComponent(query)}`);
  if (result.isApi) return result.data || [];

  const $ = cheerio.load(result.data);
  const results = [];

  $('article, .animposx, .bsx').each((_, el) => {
    const item = $(el);
    const title = item.find('h2, .title').text().trim();
    const url = item.find('a').first().attr('href') || '';
    const slug = extractSlug(url);
    const poster = item.find('img').attr('src') || item.find('img').attr('data-src') || '';

    if (title && slug) {
      results.push({
        title: cleanTitle(title) || title,
        slug,
        poster,
        source: 'samehadaku'
      });
    }
  });

  return results;
}

module.exports = {
  getHome,
  searchAnime
};
