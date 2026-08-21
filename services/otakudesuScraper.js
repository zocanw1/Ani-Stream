const axios = require('axios');
const cheerio = require('cheerio');
const querystring = require('querystring');

const BASE_URL = 'https://otakudesu.blog';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 12000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'Sec-Ch-Ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1'
  }
});

function extractSlug(url) {
  if (!url) return '';
  const match = url.match(/\/(?:anime|episode|genres)\/([^\/]+)\/?/);
  return match ? match[1] : url.replace(/https?:\/\/[^\/]+\//, '').replace(/\//g, '');
}

/**
 * Get Home page data (Ongoing & Complete Anime)
 */
async function getHome() {
  const { data } = await client.get('/');
  const $ = cheerio.load(data);

  const ongoing = [];
  const complete = [];

  const rapiSections = $('.rseries .rapi, .rapi');

  // Ongoing Anime (First section)
  if (rapiSections.length > 0) {
    rapiSections.first().find('ul > li').each((_, el) => {
      const item = $(el);
      const title = item.find('.jdlflm').text().trim() || item.find('h2, h3').text().trim();
      const episode = item.find('.epz').text().trim();
      const releaseDay = item.find('.epztipe').text().trim();
      const releaseDate = item.find('.newepz, .newnime').text().trim();
      const poster = item.find('.thumbz img, img').attr('src') || '';
      const url = item.find('.thumb > a, a').first().attr('href') || '';
      const slug = extractSlug(url);

      if (title && slug) {
        ongoing.push({
          title,
          slug,
          episode,
          release_day: releaseDay,
          release_date: releaseDate,
          poster,
          url
        });
      }
    });
  }

  // Complete Anime (Second section)
  if (rapiSections.length > 1) {
    rapiSections.eq(1).find('ul > li').each((_, el) => {
      const item = $(el);
      const title = item.find('.jdlflm').text().trim() || item.find('h2, h3').text().trim();
      const totalEpisodes = item.find('.epz').text().trim();
      const rating = item.find('.epztipe').text().trim();
      const releaseDate = item.find('.newepz, .newnime').text().trim();
      const poster = item.find('.thumbz img, img').attr('src') || '';
      const url = item.find('.thumb > a, a').first().attr('href') || '';
      const slug = extractSlug(url);

      if (title && slug) {
        complete.push({
          title,
          slug,
          total_episodes: totalEpisodes,
          rating,
          release_date: releaseDate,
          poster,
          url
        });
      }
    });
  }

  return { ongoing, complete };
}

/**
 * Search Anime
 */
async function searchAnime(query) {
  if (!query || query.trim().length === 0) return [];
  const { data } = await client.get('/', {
    params: {
      s: query.trim(),
      post_type: 'anime'
    }
  });

  const $ = cheerio.load(data);
  const results = [];

  $('.chivsrc > li').each((_, el) => {
    const item = $(el);
    const title = item.find('h2 > a').text().trim();
    const url = item.find('h2 > a').attr('href') || '';
    const slug = extractSlug(url);
    const poster = item.find('img').attr('src') || '';

    const genres = [];
    let status = '';
    let rating = '';

    item.find('.set').each((_, setEl) => {
      const text = $(setEl).text().trim();
      if (text.includes('Genres')) {
        $(setEl).find('a').each((_, aEl) => {
          genres.push({
            name: $(aEl).text().trim(),
            slug: extractSlug($(aEl).attr('href'))
          });
        });
      } else if (text.includes('Status')) {
        status = text.replace(/Status\s*:\s*/i, '').trim();
      } else if (text.includes('Rating')) {
        rating = text.replace(/Rating\s*:\s*/i, '').trim();
      }
    });

    if (title && slug) {
      results.push({
        title,
        slug,
        poster,
        genres,
        status,
        rating,
        url
      });
    }
  });

  return results;
}

/**
 * Get Anime Detail by slug
 */
async function getAnimeDetail(slug) {
  const { data } = await client.get(`/anime/${slug}/`);
  const $ = cheerio.load(data);

  const title = $('.infozingle .jdlcontent, .fotoanime .entry-title, h1.entry-title').first().text().trim() ||
                $('.infozin .infozingle:contains("Judul") b').parent().text().replace('Judul:', '').trim();
  const poster = $('.fotoanime img').attr('src') || '';
  const synopsis = $('.sinopc').text().trim();

  // Info details from .infozingle
  const info = {};
  $('.infozingle p, .infozin .infozingle').each((_, el) => {
    const text = $(el).text().trim();
    if (text.includes(':')) {
      const [k, ...v] = text.split(':');
      const key = k.trim().toLowerCase().replace(/\s+/g, '_');
      const value = v.join(':').trim();
      if (key && value) {
        info[key] = value;
      }
    }
  });

  // Genres
  const genres = [];
  $('.infozingle:contains("Genre") a, .infozin a[href*="/genres/"]').each((_, el) => {
    genres.push({
      name: $(el).text().trim(),
      slug: extractSlug($(el).attr('href'))
    });
  });

  // Episodes List
  const episodes = [];
  $('.episodelist ul li').each((_, el) => {
    const a = $(el).find('a').first();
    const epTitle = a.text().trim();
    const epUrl = a.attr('href') || '';
    const epDate = $(el).find('.zeebr').text().trim();
    const epSlug = extractSlug(epUrl);

    if (epTitle && epSlug) {
      episodes.push({
        title: epTitle,
        slug: epSlug,
        date: epDate,
        url: epUrl
      });
    }
  });

  // Batch download if available
  const batch = [];
  $('.batchlink ul li').each((_, el) => {
    const quality = $(el).find('strong, b').text().trim();
    const links = [];
    $(el).find('a').each((_, aEl) => {
      links.push({
        name: $(aEl).text().trim(),
        url: $(aEl).attr('href') || ''
      });
    });
    if (quality && links.length > 0) {
      batch.push({ quality, links });
    }
  });

  return {
    title,
    poster,
    synopsis,
    info,
    genres,
    episodes,
    batch
  };
}

/**
 * Get Episode Data & Video Stream Embeds
 */
async function getEpisode(slug) {
  const { data } = await client.get(`/episode/${slug}/`);
  const $ = cheerio.load(data);

  const title = $('.posttl, h1.entry-title').text().trim();
  const animeTitle = $('.flir a[href*="/anime/"]').text().trim();
  const animeUrl = $('.flir a[href*="/anime/"]').attr('href') || '';
  const animeSlug = extractSlug(animeUrl);

  // Default stream iframe
  let defaultStream = $('.responsive-embed-stream iframe, .player-embed iframe, #pembed iframe').attr('src') || '';

  // Previous & Next Episode Navigation
  const prevUrl = $('.flir a:contains("Previous"), .flir a:contains("Prev")').attr('href') || '';
  const nextUrl = $('.flir a:contains("Next")').attr('href') || '';

  const prevEpisode = extractSlug(prevUrl);
  const nextEpisode = extractSlug(nextUrl);

  // Mirror Stream Servers
  const mirrors = [];
  $('.mirrorstream ul').each((_, ul) => {
    const qualityClass = $(ul).attr('class') || '';
    const quality = qualityClass.replace('m', '').replace('p', 'p') || 'Stream';

    $(ul).find('li a').each((_, aEl) => {
      const serverName = $(aEl).text().trim();
      const rawData = $(aEl).attr('data-content') || '';
      mirrors.push({
        quality,
        server: serverName,
        data_content: rawData
      });
    });
  });

  // Download Links
  const downloads = [];
  $('.download ul li').each((_, el) => {
    const quality = $(el).find('strong, b').text().trim();
    const size = $(el).find('i').text().trim();
    const links = [];
    $(el).find('a').each((_, aEl) => {
      links.push({
        name: $(aEl).text().trim(),
        url: $(aEl).attr('href') || ''
      });
    });
    if (quality && links.length > 0) {
      downloads.push({ quality, size, links });
    }
  });

  return {
    title,
    anime_title: animeTitle,
    anime_slug: animeSlug,
    default_stream: defaultStream,
    prev_episode: prevEpisode,
    next_episode: nextEpisode,
    mirrors,
    downloads
  };
}

/**
 * Resolve Mirror Video Embed via AJAX
 */
async function resolveMirror(dataContent, nonceAction = '2a3505c472', streamAction = 'aa1208d27f29ca340c92c66d19261cf5', episodeSlug = '') {
  let content = dataContent;
  try {
    const decoded = Buffer.from(dataContent, 'base64').toString('utf8');
    content = JSON.parse(decoded);
  } catch (e) {}

  const postData = querystring.stringify({
    action: streamAction,
    data: typeof content === 'object' ? JSON.stringify(content) : content,
    nonce: nonceAction
  });

  const res = await axios.post(`${BASE_URL}/wp-admin/admin-ajax.php`, postData, {
    timeout: 10000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
      'Referer': `${BASE_URL}/episode/${episodeSlug}/`,
      'Origin': BASE_URL
    }
  });

  if (res.data) {
    let streamUrl = '';
    if (typeof res.data === 'string') {
      const $ = cheerio.load(res.data);
      streamUrl = $('iframe').attr('src') || res.data;
    } else if (res.data.data) {
      try {
        const rawDecoded = Buffer.from(res.data.data, 'base64').toString('utf8');
        const $ = cheerio.load(rawDecoded);
        streamUrl = $('iframe').attr('src') || rawDecoded;
      } catch (e) {
        streamUrl = res.data.data;
      }
    }

    if (streamUrl) {
      return { stream_url: streamUrl };
    }
  }

  throw new Error('Gagal mengurai video mirror');
}

/**
 * Get Release Schedule
 */
async function getSchedule() {
  const { data } = await client.get('/jadwal-rilis/');
  const $ = cheerio.load(data);

  const schedule = {};

  $('.kglist321').each((_, el) => {
    const day = $(el).find('h2').text().trim();
    const animeList = [];

    $(el).find('ul li a').each((_, aEl) => {
      animeList.push({
        title: $(aEl).text().trim(),
        slug: extractSlug($(aEl).attr('href')),
        url: $(aEl).attr('href') || ''
      });
    });

    if (day && animeList.length > 0) {
      schedule[day] = animeList;
    }
  });

  return schedule;
}

/**
 * Get Genre List
 */
async function getGenres() {
  const { data } = await client.get('/genre-list/');
  const $ = cheerio.load(data);

  const genres = [];
  $('.genres li a').each((_, el) => {
    genres.push({
      name: $(el).text().trim(),
      slug: extractSlug($(el).attr('href')),
      url: $(el).attr('href') || ''
    });
  });

  return genres;
}

/**
 * Get Anime by Genre Slug & Page
 */
async function getAnimeByGenre(slug, page = 1) {
  const pagePath = page > 1 ? `/genres/${slug}/page/${page}/` : `/genres/${slug}/`;
  const { data } = await client.get(pagePath);
  const $ = cheerio.load(data);

  const animeList = [];
  $('.col-anime').each((_, el) => {
    const title = $(el).find('.col-anime-title a').text().trim();
    const url = $(el).find('.col-anime-title a').attr('href') || '';
    const slugEp = extractSlug(url);
    const poster = $(el).find('.col-anime-cover img').attr('src') || '';
    const rating = $(el).find('.col-anime-rating').text().trim();
    const episodes = $(el).find('.col-anime-eps').text().trim();

    const genres = [];
    $(el).find('.col-anime-genre a').each((_, g) => {
      genres.push({
        name: $(g).text().trim(),
        slug: extractSlug($(g).attr('href'))
      });
    });

    if (title && slugEp) {
      animeList.push({
        title,
        slug: slugEp,
        poster,
        rating,
        episodes,
        genres,
        url
      });
    }
  });

  const hasNextPage = $('.pagination .next').length > 0;
  const hasPrevPage = $('.pagination .prev').length > 0;

  return {
    anime: animeList,
    page,
    has_next: hasNextPage,
    has_prev: hasPrevPage
  };
}

module.exports = {
  getHome,
  searchAnime,
  getAnimeDetail,
  getEpisode,
  resolveMirror,
  getSchedule,
  getGenres,
  getAnimeByGenre
};
