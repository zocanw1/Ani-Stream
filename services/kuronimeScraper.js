const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://kuronime.sbs';

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

function cleanKuronimeTitle(raw) {
  if (!raw) return '';
  return raw
    .replace(/^TV\s*/i, '')
    .replace(/\s*\d+\s+Views.*$/i, '')
    .replace(/Subtitle\s+Indonesia.*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Get Kuronime Homepage (Latest Episode & Popular)
 */
async function getHome() {
  const { data } = await client.get('/');
  const $ = cheerio.load(data);

  const latest = [];
  const popular = [];

  $('.bsx, article.bs').each((_, el) => {
    const item = $(el);
    const rawTitle = item.find('.title, h2, h3, a').first().text().trim();
    const title = cleanKuronimeTitle(rawTitle) || rawTitle;
    const href = item.find('a').first().attr('href') || '';
    const slug = href.replace(BASE_URL, '').replace(/^\/+|\/+$/g, '');
    const imgEl = item.find('img[itemprop="image"], img.wp-post-image, .limit > img, img[src*="wp-content/uploads"], img[data-src*="wp-content/uploads"]').first();
    const poster = imgEl.attr('src') || imgEl.attr('data-src') || imgEl.attr('data-lazy-src') || item.find('img').last().attr('src') || '';
    const epMatch = rawTitle.match(/Episode\s+(\d+)/i) || item.text().match(/Episode\s+(\d+)/i);
    const episode = epMatch ? `Episode ${epMatch[1]}` : (item.find('.epx, .bt .ep').text().trim() || 'Episode Terbaru');
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
 * Search Kuronime Anime
 */
async function searchAnime(query) {
  if (!query || query.trim().length === 0) return [];
  const { data } = await client.get(`/?s=${encodeURIComponent(query.trim())}`);
  const $ = cheerio.load(data);

  const results = [];
  $('.bsx, article.bs').each((_, el) => {
    const item = $(el);
    const rawTitle = item.find('.title, h2, h3, a').first().text().trim();
    const title = cleanKuronimeTitle(rawTitle) || rawTitle;
    const href = item.find('a').first().attr('href') || '';
    const slug = href.replace(BASE_URL, '').replace(/^\/+|\/+$/g, '');
    const imgEl = item.find('img[itemprop="image"], img.wp-post-image, .limit > img, img[src*="wp-content/uploads"], img[data-src*="wp-content/uploads"]').first();
    const poster = imgEl.attr('src') || imgEl.attr('data-src') || imgEl.attr('data-lazy-src') || item.find('img').last().attr('src') || '';
    const type = item.find('.typez').text().trim() || 'Anime';

    if (title && slug && !results.some(r => r.slug === slug)) {
      results.push({
        title,
        slug,
        type,
        poster,
        url: href
      });
    }
  });

  return results;
}

/**
 * Get Kuronime Episode Detail & Embed Streams
 */
async function getEpisodeDetail(slug) {
  const url = `/${slug}/`;
  const { data } = await client.get(url);
  const $ = cheerio.load(data);

  const title = $('h1.entry-title, h1').first().text().trim();
  const rawIframe = $('#pembed iframe, iframe#iframedc, .player-embed iframe').first().attr('src') || '';

  // Extract mirror selects if any
  const mirrors = [];
  $('.mirror option, select.mirror option').each((_, el) => {
    const val = $(el).attr('value');
    const name = $(el).text().trim();
    if (val && val.length > 5) {
      try {
        const decoded = Buffer.from(val, 'base64').toString('utf-8');
        const srcMatch = decoded.match(/src=["']([^"']+)["']/i);
        if (srcMatch) {
          mirrors.push({
            name,
            stream_url: srcMatch[1]
          });
        }
      } catch (e) {}
    }
  });

  // Extract previous and next episode links
  const prevUrl = $('.naveps .nvs a[rel="prev"], .prev-post a').attr('href') || '';
  const nextUrl = $('.naveps .nvs a[rel="next"], .next-post a').attr('href') || '';

  return {
    title,
    slug,
    default_stream_url: rawIframe || (mirrors[0]?.stream_url || ''),
    mirrors,
    prev_slug: prevUrl ? prevUrl.replace(BASE_URL, '').replace(/^\/+|\/+$/g, '') : null,
    next_slug: nextUrl ? nextUrl.replace(BASE_URL, '').replace(/^\/+|\/+$/g, '') : null
  };
}

module.exports = {
  getHome,
  searchAnime,
  getEpisodeDetail
};
