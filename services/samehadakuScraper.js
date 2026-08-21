const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://samehadaku.me';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8',
    'Referer': BASE_URL,
    'Origin': BASE_URL
  }
});

function extractSlug(url) {
  if (!url) return '';
  const match = url.match(/\/(?:anime|episode|blog)\/([^\/]+)\/?/) || url.match(/\/([^\/]+)\/?$/);
  return match ? match[1] : url.replace(BASE_URL, '').replace(/\//g, '');
}

/**
 * Clean messy scraped title
 */
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
  const { data } = await client.get('/');
  const $ = cheerio.load(data);

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
        url: href
      });
    }
  });

  return {
    latest: latest.slice(0, 24),
    popular: latest.slice(0, 12)
  };
}

/**
 * Search Samehadaku Anime
 */
async function searchAnime(query) {
  if (!query || query.trim().length === 0) return [];
  const { data } = await client.get(`/?s=${encodeURIComponent(query.trim())}`);
  const $ = cheerio.load(data);

  const results = [];
  $('article, .animposx, .bsx, .post-show ul li').each((_, el) => {
    const item = $(el);
    const rawTitle = item.find('h2, .title, a').first().text().trim();
    const title = cleanTitle(rawTitle) || rawTitle;
    const href = item.find('a').first().attr('href') || '';
    const slug = extractSlug(href);
    const poster = item.find('img').attr('src') || item.find('img').attr('data-src') || '';
    const rating = item.find('.score, .rating').text().trim();

    if (title && slug && !results.some(r => r.slug === slug)) {
      results.push({
        title,
        slug,
        rating,
        poster,
        url: href
      });
    }
  });

  return results;
}

/**
 * Get Samehadaku Episode Detail
 */
async function getEpisodeDetail(slug) {
  const url = `/${slug}/`;
  const { data } = await client.get(url);
  const $ = cheerio.load(data);

  const title = $('h1.entry-title, h1').first().text().trim();
  const iframeSrc = $('.player-embed iframe, #pembed iframe, iframe').first().attr('src') || '';

  // Extract downloads
  const downloads = [];
  $('.download-eps ul li, .download ul li').each((_, el) => {
    const text = $(el).find('strong, b').text().trim() || $(el).text().split('-')[0].trim();
    const links = [];
    $(el).find('a').each((_, aEl) => {
      links.push({
        server: $(aEl).text().trim(),
        url: $(aEl).attr('href')
      });
    });
    if (links.length > 0) {
      downloads.push({
        quality: text,
        links
      });
    }
  });

  return {
    title,
    slug,
    default_stream_url: iframeSrc,
    downloads
  };
}

module.exports = {
  getHome,
  searchAnime,
  getEpisodeDetail
};
