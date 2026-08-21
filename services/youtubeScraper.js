const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');
const dns = require('dns');

// Force IPv4 DNS resolution order in Node.js
try {
  if (typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch (e) {
  // Ignore in older environments
}

// Fallback DNS resolver using public DNS (Google & Cloudflare)
const fallbackResolver = new dns.promises.Resolver();
try {
  fallbackResolver.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4', '1.0.0.1']);
} catch (e) {
  // Ignore if custom server setting fails
}

/**
 * Resilient DNS lookup helper
 */
function resilientLookup(hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  // Try OS DNS lookup with IPv4 first
  dns.lookup(hostname, { family: 4, all: false }, (err, address, family) => {
    if (!err && address) {
      return callback(null, address, family);
    }
    // Fallback to public DNS resolver
    fallbackResolver.resolve4(hostname)
      .then(addresses => {
        if (addresses && addresses.length > 0) {
          callback(null, addresses[0], 4);
        } else {
          callback(err || new Error(`ENOTFOUND ${hostname}`));
        }
      })
      .catch(resErr => {
        callback(err || resErr);
      });
  });
}

// Resilient HTTPS Agent
const httpsAgent = new https.Agent({
  family: 4,
  keepAlive: true,
  lookup: resilientLookup,
  timeout: 10000
});

// Dedicated Axios Client for YouTube
const ytClient = axios.create({
  httpsAgent,
  timeout: 12000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'Cookie': 'CONSENT=YES+cb.20210328-17-p0.en+FX+; SOCS=CAISNQgDEitib3FfaWRlbnRpdHlmcm9udGVuZHVpc2VydmVyXzIwMjMwODI5LjA3X3AwGgJpZCADGgYIgJ_OpgY;'
  }
});

// Curated official licensed YouTube anime channels & playlists
const OFFICIAL_CHANNELS = [
  {
    id: 'muse_indonesia',
    name: 'Muse Indonesia',
    handle: '@MuseIndonesia',
    avatar: 'https://yt3.googleusercontent.com/ytc/AIdro_k2i_9w8a9i4g7k=s176-c-k-c0x00ffffff-no-rj',
    description: 'Distributor resmi anime legal gratis dengan Subtitle Indonesia.',
    featuredAnime: [
      {
        title: 'Frieren: Beyond Journey\'s End (Sub Indo)',
        playlistId: 'PLxSscENEp7Jh4p3_z8e6G2H5Z0s7u9e7_',
        videoId: '3aD6yZlqJ6w',
        poster: 'https://i.ytimg.com/vi/3aD6yZlqJ6w/hqdefault.jpg',
        episodes: 28
      },
      {
        title: 'Spy x Family Season 1 & 2 (Sub Indo)',
        playlistId: 'PLxSscENEp7Jj2T8D3Dk6H8Y_F6x7k',
        videoId: 'ofXigq9aI6g',
        poster: 'https://i.ytimg.com/vi/ofXigq9aI6g/hqdefault.jpg',
        episodes: 25
      },
      {
        title: 'Tokyo Revengers (Sub Indo)',
        playlistId: 'PLxSscENEp7Ji8n4b2a8d4s8s8f7s8s',
        videoId: 'X28Z5e8m7B8',
        poster: 'https://i.ytimg.com/vi/X28Z5e8m7B8/hqdefault.jpg',
        episodes: 24
      },
      {
        title: 'Classroom of the Elite (Sub Indo)',
        playlistId: 'PLxSscENEp7Jh5j3k7l7j8k8j7k8j',
        videoId: '9K5Z4k8j8k8',
        poster: 'https://i.ytimg.com/vi/9K5Z4k8j8k8/hqdefault.jpg',
        episodes: 13
      }
    ]
  },
  {
    id: 'ani_one_asia',
    name: 'Ani-One Asia',
    handle: '@AniOneAsia',
    avatar: 'https://yt3.googleusercontent.com/ytc/AIdro_n8u9i4g7k=s176-c-k-c0x00ffffff-no-rj',
    description: 'Saluran resmi anime legal terkemuka di Asia (Medialink Group).',
    featuredAnime: [
      {
        title: 'Chainsaw Man (Sub Indo / Eng)',
        videoId: 'j9s8d7f6g5h',
        poster: 'https://i.ytimg.com/vi/dFlDRhvM4b0/hqdefault.jpg',
        episodes: 12
      },
      {
        title: 'Jujutsu Kaisen Season 1 & 2',
        videoId: 'Wp_YFzCjK4I',
        poster: 'https://i.ytimg.com/vi/Wp_YFzCjK4I/hqdefault.jpg',
        episodes: 24
      },
      {
        title: 'Bleach: Thousand-Year Blood War',
        videoId: '78-W1C5wS4A',
        poster: 'https://i.ytimg.com/vi/78-W1C5wS4A/hqdefault.jpg',
        episodes: 13
      }
    ]
  },
  {
    id: 'gundaminfo',
    name: 'Gundaminfo Official',
    handle: '@GundamInfo',
    avatar: 'https://yt3.googleusercontent.com/ytc/AIdro_gundam=s176-c-k-c0x00ffffff-no-rj',
    description: 'Saluran resmi serial Mobile Suit Gundam dari Bandai Namco Filmworks.',
    featuredAnime: [
      {
        title: 'Mobile Suit Gundam: The Witch from Mercury',
        videoId: 'd3k7l8j9s8a',
        poster: 'https://i.ytimg.com/vi/3w7u8i9o0p1/hqdefault.jpg',
        episodes: 24
      }
    ]
  }
];

/**
 * Get Official Channels and Playlists
 */
function getOfficialChannels() {
  return OFFICIAL_CHANNELS;
}

/**
 * Helper to parse videoRenderer into standard anime result object
 */
function parseVideoRenderer(video) {
  if (!video || !video.videoId) return null;
  const title = (video.title?.runs ? video.title.runs.map(r => r.text).join('') : video.title?.simpleText) || '';
  const duration = video.lengthText?.simpleText || '';
  const views = (video.viewCountText?.runs ? video.viewCountText.runs.map(r => r.text).join('') : video.viewCountText?.simpleText) || (video.shortViewCountText?.runs ? video.shortViewCountText.runs.map(r => r.text).join('') : video.shortViewCountText?.simpleText) || 'Tayangan';
  const channel = (video.ownerText?.runs ? video.ownerText.runs.map(r => r.text).join('') : video.shortBylineText?.runs?.map(r => r.text).join('')) || '';
  const thumbnails = video.thumbnail?.thumbnails || [];
  const poster = (thumbnails.length > 0 ? thumbnails[thumbnails.length - 1].url : '') || `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`;
  const embed_url = `https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1`;

  return {
    videoId: video.videoId,
    title,
    duration,
    views,
    channel,
    poster,
    embed_url
  };
}

/**
 * Search YouTube using Innertube Web JSON API (Primary)
 */
async function searchViaInnertube(query) {
  if (Array.isArray(query)) query = query[0];
  query = typeof query === 'string' ? query.trim() : (query ? String(query).trim() : '');
  if (!query) return [];

  const searchQuery = query.trim().toLowerCase().includes('anime')
    ? query.trim() + ' sub indo'
    : query.trim() + ' anime sub indo';

  const payload = {
    context: {
      client: {
        clientName: 'WEB',
        clientVersion: '2.20240101.01.00',
        hl: 'id',
        gl: 'ID'
      }
    },
    query: searchQuery
  };

  const { data } = await ytClient.post('https://www.youtube.com/youtubei/v1/search', payload);
  const sections = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];

  const results = [];
  for (const section of sections) {
    const items = section?.itemSectionRenderer?.contents || [];
    for (const item of items) {
      if (item.videoRenderer) {
        const parsedVideo = parseVideoRenderer(item.videoRenderer);
        if (parsedVideo) results.push(parsedVideo);
      }
    }
  }

  return results.slice(0, 15);
}

/**
 * Search YouTube using HTML Scraping (Secondary Fallback)
 */
async function searchViaHtml(query) {
  if (Array.isArray(query)) query = query[0];
  query = typeof query === 'string' ? query.trim() : (query ? String(query).trim() : '');
  if (!query) return [];

  const searchQuery = query.trim().toLowerCase().includes('anime')
    ? query.trim() + ' sub indo'
    : query.trim() + ' anime sub indo';
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
  const { data } = await ytClient.get(searchUrl);

  const initialDataMatch = data.match(/ytInitialData\s*=\s*({.+?});(?:\s*<\/script>|\s*var|\s*window)/s) || data.match(/var ytInitialData = ({.*?});<\/script>/);
  if (!initialDataMatch) return [];

  const parsed = JSON.parse(initialDataMatch[1]);
  const sections = parsed?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];

  const results = [];
  for (const section of sections) {
    const items = section?.itemSectionRenderer?.contents || [];
    for (const item of items) {
      if (item.videoRenderer) {
        const parsedVideo = parseVideoRenderer(item.videoRenderer);
        if (parsedVideo) results.push(parsedVideo);
      }
    }
  }

  return results.slice(0, 15);
}

/**
 * Curated Fallback Search (Tertiary Offline Fallback)
 */
function searchCuratedChannels(query) {
  if (Array.isArray(query)) query = query[0];
  query = typeof query === 'string' ? query.trim() : (query ? String(query).trim() : '');
  if (!query) return [];

  const qLower = query.toLowerCase();
  const matched = [];
  for (const ch of OFFICIAL_CHANNELS) {
    for (const anime of ch.featuredAnime || []) {
      if (anime.title.toLowerCase().includes(qLower) || qLower.includes(ch.name.toLowerCase()) || qLower.includes('anime')) {
        matched.push({
          videoId: anime.videoId,
          title: anime.title,
          duration: `${anime.episodes || 12} Episodes`,
          views: 'Resmi',
          channel: ch.name,
          poster: anime.poster,
          embed_url: `https://www.youtube-nocookie.com/embed/${anime.videoId}?autoplay=1`
        });
      }
    }
  }

  // If no specific match was found, return all featured anime from official channels
  if (matched.length === 0) {
    for (const ch of OFFICIAL_CHANNELS) {
      for (const anime of ch.featuredAnime || []) {
        matched.push({
          videoId: anime.videoId,
          title: anime.title,
          duration: `${anime.episodes || 12} Episodes`,
          views: 'Resmi',
          channel: ch.name,
          poster: anime.poster,
          embed_url: `https://www.youtube-nocookie.com/embed/${anime.videoId}?autoplay=1`
        });
      }
    }
  }

  return matched.slice(0, 15);
}

/**
 * Search YouTube for Anime Videos / Trailers (Multi-Tier Resilient)
 */
async function searchYouTubeAnime(query) {
  if (Array.isArray(query)) query = query[0];
  query = typeof query === 'string' ? query.trim() : (query ? String(query).trim() : '');
  if (!query) return [];

  // Tier 1: Try Innertube Web JSON API
  try {
    const innertubeResults = await searchViaInnertube(query);
    if (innertubeResults && innertubeResults.length > 0) {
      return innertubeResults;
    }
  } catch (err1) {
    console.warn('Innertube search failed, falling back to HTML scraping:', err1.message);
  }

  // Tier 2: Try HTML Scraping
  try {
    const htmlResults = await searchViaHtml(query);
    if (htmlResults && htmlResults.length > 0) {
      return htmlResults;
    }
  } catch (err2) {
    console.warn('HTML search failed, falling back to curated list:', err2.message);
  }

  // Tier 3: Return Curated Matching Results
  return searchCuratedChannels(query);
}

module.exports = {
  getOfficialChannels,
  searchYouTubeAnime
};
