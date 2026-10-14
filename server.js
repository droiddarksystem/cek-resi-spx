const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const HISTORY_FILE = path.join(__dirname, 'data', 'history.json');

// Pastikan folder data ada
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// Init history file
if (!fs.existsSync(HISTORY_FILE)) {
  fs.writeFileSync(HISTORY_FILE, '[]');
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ===== Helper =====
function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function loadHistory() {
  try {
    return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveHistory(data) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(data, null, 2));
}

function cleanResi(text) {
  if (!text) return '';
  let cleaned = String(text).trim().toUpperCase();
  const match = cleaned.match(/SPX[A-Z0-9]{8,}/i);
  if (match) return match[0].toUpperCase();
  return cleaned.replace(/[^A-Z0-9]/g, '');
}

// ===== API: Track Resi (Proxy) =====
app.get('/api/track', async (req, res) => {
  try {
    let resi = cleanResi(req.query.resi || '');
    if (!resi || resi.length < 8) {
      return res.status(400).json({ success: false, message: 'Nomor resi tidak valid' });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const secrets = [
      'MGViZmZmZTYzZDJhNDgxY2Y1N2ZlN2Q1ZWJkYzlmZDY=',
      '0ebfffe63d2a481cf57fe7d5ebdc9fd6',
      'MGViZmZmZTYzZDJhNDgxY2Y1N2ZlN2Q1ZWJkYzlmZDY'
    ];

    let result = null;

    for (const secret of secrets) {
      try {
        const raw = resi + timestamp + secret;
        const hash = sha256(raw);
        const url = `https://spx.co.id/api/v2/fleet_order/tracking/search?sls_tracking_number=${encodeURIComponent(resi)}|${timestamp}${hash}`;

        const response = await fetch(url, {
          headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' },
          timeout: 8000
        });

        if (!response.ok) continue;

        const data = await response.json();
        if (data && (data.data || data.retcode === 0)) {
          result = data;
          break;
        }
      } catch (e) {
        // coba secret berikutnya
      }
    }

    // Simpan ke history
    const history = loadHistory();
    const entry = {
      resi,
      time: new Date().toISOString(),
      success: !!result,
      status: result?.data?.status || result?.data?.current_status || (result ? 'Ditemukan' : 'Gagal')
    };
    history.unshift(entry);
    // Batasi 100 history terakhir
    if (history.length > 100) history.length = 100;
    saveHistory(history);

    if (result) {
      return res.json({ success: true, resi, data: result });
    } else {
      return res.json({ 
        success: false, 
        resi, 
        message: 'Gagal mengambil data dari SPX. Coba buka situs resmi.',
        officialUrl: `https://spx.co.id/?trackingNumber=${encodeURIComponent(resi)}`
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ===== API: History =====
app.get('/api/history', (req, res) => {
  const history = loadHistory();
  res.json({ success: true, data: history });
});

app.delete('/api/history', (req, res) => {
  saveHistory([]);
  res.json({ success: true, message: 'History dihapus' });
});

// Fallback ke index.html untuk PWA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚀 Cek Resi SPX berjalan di http://localhost:${PORT}`);
  console.log(`   Buka di browser / PDA lalu install sebagai PWA\n`);
});
