require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const axios = require('axios');

// Services
const scraper = require('./services/otakudesuScraper');
const kuronime = require('./services/kuronimeScraper');
const samehadaku = require('./services/samehadakuScraper');
const youtube = require('./services/youtubeScraper');
const mal = require('./services/malService');
const userService = require('./services/userService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// 1. OTAKUDESU API ROUTES
// ==========================================

// Home (Ongoing & Complete Anime with Multi-Source Fallback)
app.get('/api/home', async (req, res) => {
  try {
    const data = await scraper.getHome();
    if (data && data.ongoing && data.ongoing.length > 0) {
      return res.json({ success: true, data });
    }
  } catch (e) {
    console.warn('Otakudesu notice:', e.message);
  }

  // Fallback to Samehadaku cloud API (100% active on Vercel)
  try {
    const sameData = await samehadaku.getHome();
    const ongoing = sameData.latest || [];
    const complete = sameData.popular || [];
    return res.json({
      success: true,
      data: {
        ongoing,
        complete
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memuat beranda anime: ' + err.message });
  }
});

// Search Anime
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    if (!query.trim()) {
      return res.json({ success: true, data: [] });
    }
    let data = [];
    try {
      data = await scraper.searchAnime(query);
    } catch (e) {}

    if (!data || data.length === 0) {
      try {
        data = await samehadaku.searchAnime(query);
      } catch (e) {}
    }

    res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Error in /api/search:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Pencarian anime gagal' });
  }
});

// Anime Detail
app.get('/api/anime/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    let data = null;
    try {
      data = await scraper.getAnimeDetail(slug);
    } catch (e) {}

    if (!data || !data.title) {
      data = await samehadaku.getAnimeDetail(slug);
    }

    if (!data) {
      return res.status(404).json({ success: false, message: 'Detail anime tidak ditemukan' });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error(`Error in /api/anime/${slug}:`, error.message);
    res.status(500).json({ success: false, message: error.message || 'Gagal memuat detail anime' });
  }
});

// Episode Detail (Stream + Mirrors + Downloads)
app.get('/api/episode/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    let data = null;
    try {
      data = await scraper.getEpisode(slug);
    } catch (e) {}

    if (!data || (!data.default_stream && (!data.mirrors || data.mirrors.length === 0))) {
      data = await samehadaku.getEpisode(slug);
    }

    if (!data) {
      return res.status(404).json({ success: false, message: 'Episode anime tidak ditemukan' });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error(`Error in /api/episode/${slug}:`, error.message);
    res.status(500).json({ success: false, message: error.message || 'Gagal memuat episode anime' });
  }
});

// Resolve Mirror Stream / Server ID
app.post('/api/mirror', async (req, res) => {
  try {
    const { content, nonce_action, stream_action, episode_slug, serverId } = req.body;
    const targetServerId = serverId || content;

    // Check if it's a Samehadaku server ID
    if (targetServerId && !targetServerId.includes('action=')) {
      try {
        const sameResult = await samehadaku.resolveServer(targetServerId);
        if (sameResult && sameResult.stream_url) {
          return res.json({ success: true, data: sameResult });
        }
      } catch (e) {}
    }

    if (!content) {
      return res.status(400).json({ success: false, message: 'Parameter content / serverId wajib disertakan' });
    }

    const data = await scraper.resolveMirror(content, nonce_action, stream_action, episode_slug);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error in /api/mirror:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Gagal memuat mirror stream video' });
  }
});

// Samehadaku Server Resolution Direct
app.get('/api/samehadaku/server/:serverId', async (req, res) => {
  try {
    const data = await samehadaku.resolveServer(req.params.serverId);
    if (!data) return res.status(404).json({ success: false, message: 'Server tidak ditemukan' });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Schedule
app.get('/api/schedule', async (req, res) => {
  try {
    let data = null;
    try {
      data = await scraper.getSchedule();
    } catch (e) {}

    if (!data || Object.keys(data).length === 0) {
      data = await samehadaku.getSchedule();
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error in /api/schedule:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Gagal memuat jadwal rilis' });
  }
});

// Genres
app.get('/api/genres', async (req, res) => {
  try {
    let data = [];
    try {
      data = await scraper.getGenres();
    } catch (e) {}

    if (!data || data.length === 0) {
      data = await samehadaku.getGenres();
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error in /api/genres:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Gagal memuat daftar genre' });
  }
});

// Anime by Genre
app.get('/api/genres/:slug', async (req, res) => {
  const { slug } = req.params;
  const page = parseInt(req.query.page) || 1;
  try {
    let data = null;
    try {
      data = await scraper.getAnimeByGenre(slug, page);
    } catch (e) {}

    if (!data || !data.anime || data.anime.length === 0) {
      data = await samehadaku.getAnimeByGenre(slug, page);
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error(`Error in /api/genres/${slug}:`, error.message);
    res.status(500).json({ success: false, message: error.message || 'Gagal memuat anime berdasarkan genre' });
  }
});

// ==========================================
// 2. KURONIME API ROUTES
// ==========================================
app.get('/api/kuronime/home', async (req, res) => {
  try {
    const data = await kuronime.getHome();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/kuronime/search', async (req, res) => {
  try {
    const data = await kuronime.searchAnime(req.query.q || '');
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/kuronime/episode/:slug', async (req, res) => {
  try {
    const data = await kuronime.getEpisodeDetail(req.params.slug);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 3. SAMEHADAKU API ROUTES
// ==========================================
app.get('/api/samehadaku/home', async (req, res) => {
  try {
    const data = await samehadaku.getHome();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/samehadaku/search', async (req, res) => {
  try {
    const data = await samehadaku.searchAnime(req.query.q || '');
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/samehadaku/episode/:slug', async (req, res) => {
  try {
    const data = await samehadaku.getEpisodeDetail(req.params.slug);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 4. YOUTUBE OFFICIAL ANIME ROUTES
// ==========================================
app.get('/api/youtube/channels', (req, res) => {
  const data = youtube.getOfficialChannels();
  res.json({ success: true, data });
});

app.get('/api/youtube/search', async (req, res) => {
  try {
    let query = req.query.q;
    if (Array.isArray(query)) query = query[0];
    query = typeof query === 'string' ? query.trim() : (query ? String(query).trim() : '');
    if (!query) query = 'anime episode sub indo';
    const data = await youtube.searchYouTubeAnime(query);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 5. MYANIMELIST "SERU-SERUAN" & FUN ROUTES
// ==========================================
app.get('/api/mal/top', async (req, res) => {
  try {
    const data = await mal.getTopAnime();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/mal/characters', async (req, res) => {
  try {
    const data = await mal.getTopCharacters();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/mal/quote', (req, res) => {
  const data = mal.getRandomQuote();
  res.json({ success: true, data });
});

app.get('/api/mal/quotes', (req, res) => {
  const data = mal.getAllQuotes();
  res.json({ success: true, data });
});

app.get('/api/mal/quiz', (req, res) => {
  const data = mal.getRandomQuiz();
  res.json({ success: true, data });
});

// ==========================================
// 6. IMAGE PROXY ROUTE (Hotlink Protection Bypass)
// ==========================================
app.get('/api/proxy/image', async (req, res) => {
  try {
    const imageUrl = req.query.url;
    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Parameter url wajib disertakan' });
    }

    // Validate URL
    let parsedUrl;
    try {
      parsedUrl = new URL(imageUrl);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return res.status(400).json({ success: false, message: 'Protokol URL tidak valid (harus http atau https)' });
      }
    } catch (e) {
      return res.status(400).json({ success: false, message: 'URL gambar tidak valid' });
    }

    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Referer': parsedUrl.origin,
        'Origin': parsedUrl.origin,
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      }
    });

    const contentType = response.headers['content-type'] || 'image/jpeg';
    res.set({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*'
    });
    res.send(Buffer.from(response.data));
  } catch (error) {
    console.error('Image proxy error:', error.message);
    const status = error.response?.status || 500;
    res.status(status).json({ success: false, message: 'Gagal memuat gambar melalui proxy' });
  }
});

// ==========================================
// 7. USER AUTHENTICATION (Register & Login) & CLOUD SYNC
// ==========================================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, name } = req.body;
    const user = await userService.registerUser({ username, password, name });
    res.json({ success: true, message: 'Pendaftaran berhasil!', data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Gagal mendaftar' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await userService.loginUser({ username, password });
    res.json({ success: true, message: 'Login berhasil!', data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Gagal login' });
  }
});

// Get Current User Profile & Synced History
app.get('/api/user/me', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User ID tidak disertakan' });
    }
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Sync History & Bookmarks to Cloud Database
app.post('/api/user/sync', async (req, res) => {
  try {
    const { userId, history, bookmarks } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID wajib disertakan' });
    }
    const updatedUser = await userService.syncUserData(userId, { history, bookmarks });
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
    }
    res.json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// FRIENDLY HTML PAGE ROUTES
// ==========================================
app.get('/anime/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'anime.html'));
});

app.get('/watch/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'watch.html'));
});

app.get('/schedule', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'schedule.html'));
});

app.get('/genres', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'genres.html'));
});

app.get('/bookmarks', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'bookmarks.html'));
});

app.get('/fun', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'fun.html'));
});

app.get('/youtube', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'youtube.html'));
});

app.get('/auth/google/callback', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'callback.html'));
});

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`===========================================`);
  console.log(`🚀 Stella-Nime running on http://localhost:${PORT}`);
  console.log(`🌟 Sources: Otakudesu, Kuronime, Samehadaku, YouTube, MyAnimeList`);
  console.log(`===========================================`);
});
