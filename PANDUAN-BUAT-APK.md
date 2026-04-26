# 📱 Panduan Membuat APK Android — Bersihku
## SMK Hang Tuah 1

---

## ✅ Yang Sudah Disiapkan

File berikut sudah ditambahkan ke project kamu:
- `manifest.json` — identitas app untuk Android
- `sw.js` — service worker (agar app bisa offline)
- `icons/` — 8 ukuran ikon app
- `capacitor.config.json` — konfigurasi native app
- `index.html` — sudah diupdate dengan tag PWA

---

## 🚀 CARA 1: PWABuilder (TERMUDAH — Tanpa Coding!)

### Langkah-langkah:

**1. Upload ke GitHub Pages (hosting gratis)**

1. Buka https://github.com → Login atau buat akun baru
2. Klik tombol **"New repository"** (tombol hijau di pojok kanan)
3. Isi nama: `bersihku`
4. Centang **"Add a README file"**
5. Klik **"Create repository"**
6. Upload semua file project kamu (index.html, style.css, script.js, manifest.json, sw.js, folder icons/)
   - Klik **"Add file"** → **"Upload files"**
   - Drag & drop semua file
   - Klik **"Commit changes"**
7. Buka **Settings** → **Pages** → Source: pilih **"main"** branch → **Save**
8. Tunggu 1-2 menit → kamu akan dapat URL seperti:
   `https://username-kamu.github.io/bersihku/`

**2. Generate APK di PWABuilder**

1. Buka https://www.pwabuilder.com
2. Paste URL GitHub Pages kamu → Klik **"Start"**
3. Tunggu proses analisis selesai
4. Klik tab **"Android"** → **"Generate Package"**
5. Isi form:
   - **Package ID**: `id.smkhangtah1.bersihku`
   - **App Name**: `Bersihku`
   - **Version**: `1.0.0`
6. Klik **"Generate"** → Download file `.apk` atau `.aab`

**3. Install APK ke HP Android**

1. Kirim file `.apk` ke HP (WhatsApp, email, atau kabel USB)
2. Di HP, buka file `.apk`
3. Jika ada peringatan "Install dari sumber tidak dikenal":
   - Buka **Pengaturan** → **Keamanan** → Aktifkan **"Install aplikasi tidak dikenal"**
4. Tap **Install** → Selesai! ✅

---

## 🔧 CARA 2: Capacitor + Android Studio (Lebih Canggih)

### Prasyarat yang harus diinstall:
- Node.js → https://nodejs.org (pilih versi LTS)
- Android Studio → https://developer.android.com/studio
- Java JDK 17 → https://adoptium.net

### Langkah-langkah:

```bash
# 1. Buka terminal/command prompt di folder bersihku

# 2. Install Capacitor
npm init -y
npm install @capacitor/core @capacitor/cli @capacitor/android

# 3. Inisialisasi Capacitor (sudah ada capacitor.config.json)
npx cap init

# 4. Tambahkan platform Android
npx cap add android

# 5. Sync file web ke Android
npx cap sync android

# 6. Buka di Android Studio
npx cap open android
```

Di Android Studio:
1. Tunggu Gradle selesai sync (bisa 5-10 menit pertama kali)
2. Klik **Build** → **Build Bundle(s)/APK(s)** → **Build APK(s)**
3. File APK ada di: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📋 CARA 3: Install Langsung Sebagai PWA (Tanpa APK!)

Cara paling simpel — tidak perlu APK sama sekali!

1. Hosting di GitHub Pages (ikuti langkah di Cara 1 bagian 1)
2. Buka URL app di **Chrome Android**
3. Tap ikon **⋮** (tiga titik) di pojok kanan atas
4. Pilih **"Add to Home Screen"** atau **"Install App"**
5. Tap **"Install"** → App muncul di layar utama HP! ✅

> **Keuntungan**: Data tersimpan lokal, bisa pakai offline setelah pertama kali dibuka!

---

## ❓ FAQ

**Q: APK bisa disebarkan ke semua guru dan siswa?**
A: Ya! Kirim file .apk lewat WhatsApp/Google Drive. Mereka tinggal install.

**Q: Data antar HP bisa sinkron?**
A: Saat ini data tersimpan lokal di masing-masing HP. Gunakan fitur Backup/Impor untuk transfer data.

**Q: Bisa masuk ke Google Play Store?**
A: Bisa, tapi butuh akun developer Google ($25 sekali bayar) dan APK harus di-sign dengan keystore.

**Q: Aman tidak kalau install dari luar Play Store?**
A: Aman selama file .apk berasal dari sumber terpercaya (diri sendiri atau sekolah).

---

## 📞 Bantuan

Jika ada masalah saat proses pembuatan APK, kamu bisa:
- Cek dokumentasi PWABuilder: https://docs.pwabuilder.com
- Cek dokumentasi Capacitor: https://capacitorjs.com/docs/android

---

*Bersihku v2 — SMK Hang Tuah 1*
