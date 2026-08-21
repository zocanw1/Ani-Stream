const axios = require('axios');
const cheerio = require('cheerio');
const querystring = require('querystring');

const BASE_URL = 'https://otakudesu.blog';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'Referer': BASE_URL,
    'Origin': BASE_URL
  }
});

function extractSlug(url) {
  if (!url) return '';
  const match = url.match(/\/(?:anime|episode|genres)\/([^\/]+)\/?/);
  return match ? match[1] : url.replace(BASE_URL, '').replace(/\//g, '');
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
 * Get Anime Detail & Episode List
 */
async function getAnimeDetail(slug) {
  const url = `/anime/${slug}/`;
  const { data } = await client.get(url);
  const $ = cheerio.load(data);

  const info = {};
  $('.infozingle > p').each((_, el) => {
    const text = $(el).text();
    const parts = text.split(':');
    if (parts.length >= 2) {
      const key = parts[0].trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
      const val = parts.slice(1).join(':').trim();
      info[key] = val;
    }
  });

  const title = $('.infozingle p:contains("Judul")').text().replace(/Judul\s*:\s*/i, '').trim() ||
                $('.fotoanime h1').text().trim() ||
                $('h1.entry-title').text().trim() ||
                slug.replace(/-/g, ' ');
  const poster = $('.fotoanime > img').attr('src') || $('.wp-post-image').attr('src') || '';
  const synopsis = $('.sinopc > p').map((_, el) => $(el).text().trim()).get().join('\n\n') ||
                   $('.entry-content p').first().text().trim();

  // Extract Genres
  const genres = [];
  $('.infozingle p:contains("Genre") a').each((_, el) => {
    genres.push({
      name: $(el).text().trim(),
      slug: extractSlug($(el).attr('href'))
    });
  });

  // Extract Episodes
  const episodes = [];
  $('.episodelist ul > li').each((_, el) => {
    const item = $(el);
    const epLink = item.find('a');
    const epTitle = epLink.text().trim();
    const epUrl = epLink.attr('href') || '';
    const epSlug = extractSlug(epUrl);
    const releaseDate = item.find('.zee-date').text().trim() || item.text().replace(epTitle, '').trim();

    if (epTitle && epSlug && epUrl.includes('/episode/')) {
      const epNumMatch = epTitle.match(/Episode\s+(\d+(?:\.\d+)?)/i);
      const epNumber = epNumMatch ? epNumMatch[1] : '';

      episodes.push({
        title: epTitle,
        slug: epSlug,
        episode_number: epNumber,
        release_date: releaseDate,
        url: epUrl
      });
    }
  });

  // Extract Batch link if exists
  let batch = null;
  const batchEl = $('.episodelist').find('ul li a[href*="/batch/"]').first();
  if (batchEl.length > 0) {
    batch = {
      title: batchEl.text().trim(),
      url: batchEl.attr('href')
    };
  }

  return {
    title,
    japanese_title: info.japanese || '',
    score: info.skor || info.score || '',
    producer: info.produser || '',
    type: info.tipe || '',
    status: info.status || '',
    total_episodes: info.total_episode || '',
    duration: info.durasi || '',
    release_date: info.tanggal_rilis || '',
    studio: info.studio || '',
    genres,
    synopsis,
    poster,
    episodes,
    batch
  };
}

/**
 * Get Episode Stream & Mirrors & Download Links
 */
async function getEpisodeDetail(episodeSlug) {
  const url = `/episode/${episodeSlug}/`;
  const response = await client.get(url);
  const data = response.data;
  const cookies = response.headers['set-cookie'] ? response.headers['set-cookie'].map(c => c.split(';')[0]).join('; ') : '';
  const $ = cheerio.load(data);

  const title = $('h1.posttl').text().trim() || $('h1').first().text().trim();
  
  // Navigation Links
  const prevUrl = $('.flir a:contains("Previous")').attr('href') || '';
  const nextUrl = $('.flir a:contains("Next")').attr('href') || '';
  const allEpisodesUrl = $('.flir a:contains("See All Episodes")').attr('href') || '';

  const prevEpisodeSlug = prevUrl ? extractSlug(prevUrl) : null;
  const nextEpisodeSlug = nextUrl ? extractSlug(nextUrl) : null;
  const animeSlug = allEpisodesUrl ? extractSlug(allEpisodesUrl) : '';

  // Default embed stream
  let defaultStreamUrl = '';
  const iframeMatch = data.match(/<div class="responsive-embed-stream"[\s\S]*?<iframe[^>]+src="([^">]+)"/i);
  if (iframeMatch) {
    defaultStreamUrl = iframeMatch[1];
  } else {
    const rawIframe = $('iframe').first().attr('src');
    if (rawIframe) defaultStreamUrl = rawIframe;
  }

  // Extract action hashes from inline scripts
  const nonceMatch = data.match(/action:\s*["']([a-f0-9]{32})["']\s*\}\}\)\.done\(\(\{\s*data:\s*a\s*\}\)\s*=>\s*\{\s*window\.__x__nonce\s*=\s*a/);
  const streamMatch = data.match(/data:\s*\{\s*\.\.\.e,\s*nonce:\s*(?:window\.__x__nonce|a),\s*action:\s*["']([a-f0-9]{32})["']/);

  const getNonceAction = nonceMatch ? nonceMatch[1] : 'aa1208d27f29ca340c92c66d1926f13f';
  const getStreamAction = streamMatch ? streamMatch[1] : '2a3505c93b0035d3f455df82bf976b84';

  // Extract Mirrors grouped by quality
  const mirrors = {
    m360p: [],
    m480p: [],
    m720p: []
  };

  $('.mirrorstream > ul').each((_, ulEl) => {
    const className = $(ulEl).attr('class') || '';
    const qualityMatch = className.match(/m(\d+p)/i);
    const qualityKey = qualityMatch ? `m${qualityMatch[1].toLowerCase()}` : 'm360p';

    $(ulEl).find('li a').each((_, aEl) => {
      const serverName = $(aEl).text().trim();
      const content = $(aEl).attr('data-content');
      if (content) {
        try {
          const parsed = JSON.parse(Buffer.from(content, 'base64').toString('utf-8'));
          if (!mirrors[qualityKey]) mirrors[qualityKey] = [];
          mirrors[qualityKey].push({
            name: serverName,
            quality: parsed.q || (qualityMatch ? qualityMatch[1] : '360p'),
            content: content,
            data: parsed
          });
        } catch (e) {}
      }
    });
  });

  // Extract Download Links
  const downloads = [];
  $('.download ul > li').each((_, liEl) => {
    const item = $(liEl);
    const text = item.text();
    const resolutionMatch = text.match(/(?:Mp4|MKV)\s+(\d+p)/i) || text.match(/(\d+p)/i);
    const sizeMatch = text.match(/([\d\.]+\s*(?:MB|GB|KB))/i);

    const format = text.includes('MKV') ? 'MKV' : 'MP4';
    const quality = resolutionMatch ? resolutionMatch[1] : '';
    const size = sizeMatch ? sizeMatch[1] : '';

    const links = [];
    item.find('a').each((_, aEl) => {
      const server = $(aEl).text().trim();
      const linkUrl = $(aEl).attr('href');
      if (server && linkUrl && !linkUrl.startsWith('javascript:')) {
        links.push({
          server,
          url: linkUrl
        });
      }
    });

    if (links.length > 0) {
      downloads.push({
        format,
        quality: quality ? `${format} ${quality}` : format,
        size,
        links
      });
    }
  });

  return {
    title,
    anime_slug: animeSlug,
    prev_episode_slug: prevEpisodeSlug,
    next_episode_slug: nextEpisodeSlug,
    default_stream_url: defaultStreamUrl,
    mirrors,
    downloads,
    actions: {
      nonce_action: getNonceAction,
      stream_action: getStreamAction
    },
    cookies
  };
}

/**
 * Resolve Mirror Stream Iframe
 */
async function resolveMirrorStream(mirrorContent, nonceAction = 'aa1208d27f29ca340c92c66d1926f13f', streamAction = '2a3505c93b0035d3f455df82bf976b84', pageUrl = BASE_URL) {
  let parsedContent;
  try {
    parsedContent = JSON.parse(Buffer.from(mirrorContent, 'base64').toString('utf-8'));
  } catch (e) {
    throw new Error('Invalid mirror data-content payload');
  }

  // 1. Get Nonce
  const noncePost = querystring.stringify({ action: nonceAction });
  const nonceResp = await axios.post(`${BASE_URL}/wp-admin/admin-ajax.php`, noncePost, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      'X-Requested-With': 'XMLHttpRequest',
      'Referer': pageUrl,
      'Origin': BASE_URL
    }
  });

  const nonce = nonceResp.data?.data;
  if (!nonce) {
    throw new Error('Gagal mendapatkan sesi autentikasi stream (nonce)');
  }

  // 2. Get Decrypted Stream
  const streamPost = querystring.stringify({
    ...parsedContent,
    nonce: nonce,
    action: streamAction
  });

  const streamResp = await axios.post(`${BASE_URL}/wp-admin/admin-ajax.php`, streamPost, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      'X-Requested-With': 'XMLHttpRequest',
      'Referer': pageUrl,
      'Origin': BASE_URL
    }
  });

  const encodedHtml = streamResp.data?.data;
  if (!encodedHtml) {
    throw new Error('Stream tidak tersedia untuk server ini');
  }

  const decodedHtml = Buffer.from(encodedHtml, 'base64').toString('utf-8');
  const iframeSrcMatch = decodedHtml.match(/src=["']([^"']+)["']/i);
  const streamUrl = iframeSrcMatch ? iframeSrcMatch[1] : '';

  return {
    raw_html: decodedHtml,
    stream_url: streamUrl
  };
}

/**
 * Get Weekly Release Schedule
 */
async function getSchedule() {
  const { data } = await client.get('/jadwal-rilis/');
  const $ = cheerio.load(data);

  const schedule = {};
  $('.kgjdwl321 .kglist321, .kglist321').each((_, el) => {
    const day = $(el).find('h2').text().trim();
    const animeList = [];

    $(el).find('ul > li').each((_, li) => {
      const a = $(li).find('a');
      const title = a.text().trim();
      const url = a.attr('href') || '';
      const slug = extractSlug(url);
      if (title && slug) {
        animeList.push({ title, slug, url });
      }
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
async function getGenreList() {
  const { data } = await client.get('/genre-list/');
  const $ = cheerio.load(data);

  const genres = [];
  $('.genres > li > a').each((_, el) => {
    const title = $(el).text().trim();
    const url = $(el).attr('href') || '';
    const slug = extractSlug(url);
    if (title && slug) {
      genres.push({ title, slug, url });
    }
  });

  return genres;
}

/**
 * Get Anime by Genre with pagination
 */
async function getAnimeByGenre(genreSlug, page = 1) {
  const pagePath = page > 1 ? `/genres/${genreSlug}/page/${page}/` : `/genres/${genreSlug}/`;
  const { data } = await client.get(pagePath);
  const $ = cheerio.load(data);

  const results = [];
  $('.col-anime').each((_, el) => {
    const item = $(el);
    const title = item.find('.col-anime-title a').text().trim();
    const url = item.find('.col-anime-title a').attr('href') || '';
    const slug = extractSlug(url);
    const poster = item.find('.col-anime-cover img').attr('src') || '';
    const studio = item.find('.col-anime-studio').text().trim();
    const eps = item.find('.col-anime-eps').text().trim();
    const rating = item.find('.col-anime-rating').text().trim();
    const synopsis = item.find('.col-synopsis').text().trim();

    if (title && slug) {
      results.push({
        title,
        slug,
        poster,
        studio,
        episodes: eps,
        rating,
        synopsis,
        url
      });
    }
  });

  const hasNextPage = $('.pagination .next').length > 0;

  return {
    genre: genreSlug,
    page: parseInt(page),
    has_next: hasNextPage,
    anime: results
  };
}

module.exports = {
  getHome,
  searchAnime,
  getAnimeDetail,
  getEpisodeDetail,
  resolveMirrorStream,
  getSchedule,
  getGenreList,
  getAnimeByGenre
};
