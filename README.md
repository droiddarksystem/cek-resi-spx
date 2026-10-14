# Cek Resi SPX Express (PWA + Backend + History)

Aplikasi cek resi **SPX Express** lengkap dengan:

- ✅ Input manual + **Scan kamera** (HP)
- ✅ **PDA / Handheld Scanner** ready (tembak barcode)
- ✅ **PWA** (bisa diinstall di HP/PDA)
- ✅ **Backend** Node.js (proxy API + simpan history)
- ✅ **History** pengecekan resi

## Cara Menjalankan

### 1. Install dependencies
```bash
cd cek-resi-spx
npm install
```

### 2. Jalankan server
```bash
npm start
```

Buka browser di: **http://localhost:3000**

### 3. Install sebagai PWA
- Di Chrome/Edge HP → klik menu → **Install app** / **Add to Home Screen**
- Di PDA yang support browser modern juga bisa

## Fitur

| Fitur | Keterangan |
|-------|------------|
| Cek via API | Backend memproxy endpoint internal SPX |
| History | Disimpan di server (file `data/history.json`) |
| PDA Mode | Input selalu fokus, auto submit saat scan |
| Kamera | Scan QR/Barcode untuk HP |
| Offline | Service Worker cache halaman utama |

## Catatan

- Endpoint internal SPX **tidak resmi** dan bisa berubah.
- Untuk production, sebaiknya deploy ke VPS / Railway / Render.
- History dibatasi 100 entri terakhir.

## Struktur
```
cek-resi-spx/
├── public/
│   ├── index.html      # Frontend + PWA
│   ├── manifest.json
│   ├── sw.js           # Service Worker
│   ├── icon-192.png
│   └── icon-512.png
├── data/               # History disimpan di sini
├── server.js           # Backend Express
├── package.json
└── README.md
```

---
Dibuat dengan bantuan Grok
