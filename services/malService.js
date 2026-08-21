const axios = require('axios');
const cheerio = require('cheerio');

const client = axios.create({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
});

// Curated Top Anime Quotes for the Quote Generator
const ANIME_QUOTES = [
  {
    quote: "Jika kamu tidak mengambil risiko, kamu tidak akan pernah bisa menciptakan masa depan.",
    character: "Monkey D. Luffy",
    anime: "One Piece"
  },
  {
    quote: "Rasa takut bukanlah hal yang buruk. Rasa takut memberi tahu kita kelemahan kita sendiri, dan saat kita tahu kelemahan kita, kita bisa menjadi lebih kuat.",
    character: "Gildarts Clive",
    anime: "Fairy Tail"
  },
  {
    quote: "Dunia ini kejam, namun di saat yang sama juga sangat indah.",
    character: "Mikasa Ackerman",
    anime: "Attack on Titan"
  },
  {
    quote: "Bekerja keras tanpa percaya pada diri sendiri adalah hal yang sia-sia.",
    character: "Naruto Uzumaki",
    anime: "Naruto"
  },
  {
    quote: "Jatuh tujuh kali, bangkit delapan kali. Jangan pernah menyerah pada impianmu.",
    character: "Jiraiya",
    anime: "Naruto Shippuden"
  },
  {
    quote: "Bahkan orang terkuat sekalipun pernah merasa tak berdaya. Yang terpenting adalah terus melangkah maju.",
    character: "Kamado Tanjiro",
    anime: "Demon Slayer (Kimetsu no Yaiba)"
  },
  {
    quote: "Waktu yang kita habiskan untuk meratapi masa lalu lebih baik digunakan untuk mempersiapkan masa depan.",
    character: "Levi Ackerman",
    anime: "Attack on Titan"
  },
  {
    quote: "Kekuatan sejati bukanlah tentang seberapa keras pukulanmu, tetapi seberapa besar tekadmu untuk melindungi orang lain.",
    character: "All Might",
    anime: "My Hero Academia"
  },
  {
    quote: "Keberanian bukanlah ketiadaan rasa takut, melainkan tindakan untuk terus maju meskipun kamu merasa takut.",
    character: "Frieren",
    anime: "Sousou no Frieren"
  },
  {
    quote: "Jangan hidup dengan penyesalan. Jalan yang kamu pilih hari ini adalah takdir yang kamu ciptakan sendiri.",
    character: "Portgas D. Ace",
    anime: "One Piece"
  }
];

// Interactive Quiz Questions Pool
const ANIME_QUIZ_POOL = [
  {
    question: "Siapakah karakter utama yang bercita-cita menjadi Raja Bajak Laut?",
    options: ["Roronoa Zoro", "Monkey D. Luffy", "Sanji", "Portgas D. Ace"],
    answerIndex: 1,
    hint: "Karakter ini mengenakan topi jerami dan memakan buah Gomu Gomu no Mi."
  },
  {
    question: "Apa nama teknik pamungkas milik Satoru Gojo yang memadukan Red dan Blue?",
    options: ["Hollow Purple", "Infinite Void", "Domain Expansion", "Black Flash"],
    answerIndex: 0,
    hint: "Warna ungu magis tercipta dari gabungan gaya tolak dan gaya tarik tak terbatas."
  },
  {
    question: "Siapa nama elf mage berusia lebih dari 1000 tahun yang gemar mengumpulkan grimoire sihir unik?",
    options: ["Fern", "Flamme", "Frieren", "Serie"],
    answerIndex: 2,
    hint: "Ia adalah anggota kelompok pahlawan yang berhasil mengalahkan Raja Iblis bersama Himmel."
  },
  {
    question: "Di anime Attack on Titan, apa nama regu prajurit yang bertugas menjelajah ke luar tembok?",
    options: ["Garrison Regiment", "Military Police", "Survey Corps (Scout)", "Yeagerist"],
    answerIndex: 2,
    hint: "Lambang regu ini adalah Wings of Freedom (Sayap Kebebasan)."
  },
  {
    question: "Berapa batas berat beban yang harus diangkat Saitama untuk menjadi One Punch Man?",
    options: ["100 Push-up, 100 Sit-up, 100 Squat, Lari 10km", "Angkat barbel 1000 ton", "Latihan di gravitasi 100x", "Meditasi 10 tahun"],
    answerIndex: 0,
    hint: "Latihan rutin setiap hari tanpa henti sampai rambutnya botak!"
  },
  {
    question: "Siapa Shinigami pemilik Death Note yang sangat menyukai buah apel?",
    options: ["Rem", "Ryuk", "Sidoh", "Gelus"],
    answerIndex: 1,
    hint: "Shinigami berpostur tinggi dengan senyum lebar yang selalu mendampingi Light Yagami."
  }
];

/**
 * Get Top Ranked Anime from MyAnimeList
 */
async function getTopAnime() {
  try {
    const { data } = await client.get('https://myanimelist.net/topanime.php');
    const $ = cheerio.load(data);
    const ranking = [];

    $('.ranking-list').slice(0, 20).each((i, el) => {
      const item = $(el);
      const rank = item.find('.rank span').text().trim() || `${i + 1}`;
      const title = item.find('.title h3 a').text().trim();
      const score = item.find('.score .text').text().trim();
      const poster = item.find('img').attr('data-src') || item.find('img').attr('src') || '';
      const info = item.find('.information').text().trim().replace(/\s+/g, ' ');

      if (title) {
        ranking.push({
          rank,
          title,
          score,
          poster,
          info
        });
      }
    });

    return ranking;
  } catch (err) {
    console.warn('MAL scrape fallback:', err.message);
    return [];
  }
}

/**
 * Get Top Anime Characters from MyAnimeList
 */
async function getTopCharacters() {
  try {
    const { data } = await client.get('https://myanimelist.net/character.php');
    const $ = cheerio.load(data);
    const characters = [];

    $('.ranking-list').slice(0, 20).each((i, el) => {
      const item = $(el);
      const rank = item.find('.rank span').text().trim() || `${i + 1}`;
      const name = item.find('.people a').text().trim();
      const anime = item.find('.title-information').text().trim();
      const favorites = item.find('.favorites').text().trim();
      const image = item.find('img').attr('data-src') || item.find('img').attr('src') || '';

      if (name) {
        characters.push({
          rank,
          name,
          anime,
          favorites,
          image
        });
      }
    });

    return characters;
  } catch (err) {
    console.warn('MAL Characters fallback:', err.message);
    return [];
  }
}

/**
 * Get Random Anime Quote
 */
function getRandomQuote() {
  const randomIndex = Math.floor(Math.random() * ANIME_QUOTES.length);
  return ANIME_QUOTES[randomIndex];
}

/**
 * Get All Anime Quotes
 */
function getAllQuotes() {
  return ANIME_QUOTES;
}

/**
 * Get Random Quiz Question
 */
function getRandomQuiz() {
  const randomIndex = Math.floor(Math.random() * ANIME_QUIZ_POOL.length);
  return ANIME_QUIZ_POOL[randomIndex];
}

module.exports = {
  getTopAnime,
  getTopCharacters,
  getRandomQuote,
  getAllQuotes,
  getRandomQuiz
};
