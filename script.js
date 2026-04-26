// ===================================
//   BERSIHKU — script.js v2 (Full)
// ===================================

/* ── STORAGE ─────────────────────────────────── */
const DB = {
  get: k => { try { return JSON.parse(localStorage.getItem('bk_' + k)); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem('bk_' + k, JSON.stringify(v)); } catch(e) { console.warn('Storage full', e); } },
  del: k => localStorage.removeItem('bk_' + k),
};

/* ── HELPERS ─────────────────────────────────── */
function todayStr() {
  const d = new Date();
  const b = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  return `${d.getDate()} ${b[d.getMonth()]} ${d.getFullYear()}`;
}
function nowStr() {
  const d = new Date();
  return d.toLocaleDateString('id-ID') + ' ' + d.toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'});
}
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── SEED DATA ───────────────────────────────── */
const SEED = {
  users: [
    { username: 'guru',  password: 'guru123',  role: 'guru',  nama: 'Pak Budi' },
    { username: 'siswa', password: 'siswa123', role: 'siswa', nama: 'Andi Pratama' },
  ],
  kelas: [
    { id: 1, nama: '7A' }, { id: 2, nama: '7B' },
    { id: 3, nama: '8A' }, { id: 4, nama: '8B' },
    { id: 5, nama: '9A' }, { id: 6, nama: '9B' },
  ],
  jadwal: [
    { id: 1, kelasId: 1, hari: 'Senin',   petugas: 'Budi, Ani, Cika',  tugas: 'Sapu & pel lantai' },
    { id: 2, kelasId: 1, hari: 'Selasa',  petugas: 'Deni, Eka',        tugas: 'Bersihkan papan tulis' },
    { id: 3, kelasId: 1, hari: 'Rabu',    petugas: 'Fajar, Gita',      tugas: 'Buang sampah & sapu' },
    { id: 4, kelasId: 2, hari: 'Senin',   petugas: 'Hana, Irfan',      tugas: 'Sapu kelas' },
    { id: 5, kelasId: 2, hari: 'Kamis',   petugas: 'Joko, Kania',      tugas: 'Pel lantai & lap meja' },
    { id: 6, kelasId: 3, hari: 'Jumat',   petugas: 'Lusi, Miko',       tugas: 'Bersih-bersih umum' },
  ],
  jadwalHistory: [],
  laporan: [
    { id: 1, kelasId: 1, kelasNama: '7A', kondisi: 'Sangat Bersih', pelapor: 'Pak Budi', keterangan: 'Kelas sangat rapi dan bersih', tanggal: todayStr() },
    { id: 2, kelasId: 2, kelasNama: '7B', kondisi: 'Cukup Bersih',  pelapor: 'Pak Budi', keterangan: 'Ada sedikit sampah di sudut',  tanggal: todayStr() },
  ],
  foto: [],
  profil: { nama: 'SMP Negeri 1', kepala: 'Drs. Ahmad Fauzi', alamat: 'Jl. Pendidikan No. 1', tahun: '2025/2026' },
  settings: { darkMode: false, notifEnabled: false, notifJam: '06:00' },
};

/* ── INIT ────────────────────────────────────── */
function initData() {
  if (!DB.get('users'))    DB.set('users',    SEED.users);
  if (!DB.get('kelas'))    DB.set('kelas',    SEED.kelas);
  if (!DB.get('jadwal'))   DB.set('jadwal',   SEED.jadwal);
  if (!DB.get('jadwalH'))  DB.set('jadwalH',  SEED.jadwalHistory);
  if (!DB.get('laporan'))  DB.set('laporan',  SEED.laporan);
  if (!DB.get('foto'))     DB.set('foto',     SEED.foto);
  if (!DB.get('profil'))   DB.set('profil',   SEED.profil);
  if (!DB.get('settings')) DB.set('settings', SEED.settings);
}

document.addEventListener('DOMContentLoaded', () => {
  initData();
  applyTheme();

  // Auto-login jika sesi tersimpan
  const saved = DB.get('currentUser');
  if (saved) {
    initApp(saved);
  }

  checkNotifOnLoad();
});

/* ── AUTH ────────────────────────────────────── */
let currentRole = 'guru';

function selectRole(role, el) {
  currentRole = role;
  document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
}

function togglePassView() {
  const inp = document.getElementById('loginPass');
  if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
}

function doLogin() {
  const u = (document.getElementById('loginUser').value || '').trim();
  const p = document.getElementById('loginPass').value || '';
  const users = DB.get('users') || [];
  const user = users.find(x => x.username === u && x.password === p && x.role === currentRole);

  if (!user) {
    document.getElementById('loginError').classList.remove('hidden');
    return;
  }
  document.getElementById('loginError').classList.add('hidden');
  DB.set('currentUser', user);
  initApp(user);
}

function doLogout() {
  DB.del('currentUser');
  document.getElementById('app').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
}

function getCurrentUser() {
  return DB.get('currentUser');
}

/* ── APP INIT ────────────────────────────────── */
function initApp(user) {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');

  // Hero
  document.getElementById('heroName').textContent = user.nama;
  const profil = DB.get('profil') || SEED.profil;
  document.getElementById('heroSekolah').textContent = profil.nama || 'Platform Kebersihan Sekolah';

  // Badge
  document.getElementById('userBadge').textContent = user.nama + (user.role === 'guru' ? ' 👩‍🏫' : ' 🧑‍🎓');

  // Role-based visibility
  applyRoleUI(user.role === 'guru');

  // Theme
  loadSettingsUI();

  // Selects
  populateKelasSelects();

  // Beranda
  updateStats();
  renderPiketHari();
  renderLaporanTerbaru();

  // Profil form
  loadProfil();
  renderKelasGrid();

  // Users table
  renderUserTable();

  // Show beranda
  const firstLink = document.querySelector('.nav-link');
  showSection('beranda', firstLink);
}

function applyRoleUI(isGuru) {
  document.querySelectorAll('.guru-only').forEach(el => {
    el.style.display = isGuru ? '' : 'none';
  });
}

/* ── NAVIGATION ──────────────────────────────── */
function showSection(id, el) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(a => a.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
  if (el) el.classList.add('active');
  document.querySelector('.nav-links')?.classList.remove('open');

  // Section-specific renders
  if (id === 'jadwal')    { renderJadwal(); renderJadwalHistory(); }
  if (id === 'laporan')   { buildFilterBulan(); renderLaporan(); }
  if (id === 'galeri')    { renderGaleri(); }
  if (id === 'profil')    { renderKelasGrid(); }
  if (id === 'pengaturan'){ renderUserTable(); }
}

function toggleMenu() {
  document.querySelector('.nav-links')?.classList.toggle('open');
}

/* ── THEME ───────────────────────────────────── */
function applyTheme() {
  const s = DB.get('settings') || SEED.settings;
  document.documentElement.setAttribute('data-theme', s.darkMode ? 'dark' : 'light');
  const darkBtn = document.getElementById('darkBtn');
  if (darkBtn) darkBtn.textContent = s.darkMode ? '☀️' : '🌙';
  const dt = document.getElementById('darkToggle');
  if (dt) dt.checked = !!s.darkMode;
}

function toggleDark() {
  const s = DB.get('settings') || SEED.settings;
  s.darkMode = !s.darkMode;
  DB.set('settings', s);
  applyTheme();
}

function toggleDarkFromCheckbox(el) {
  const s = DB.get('settings') || SEED.settings;
  s.darkMode = el.checked;
  DB.set('settings', s);
  applyTheme();
}

function loadSettingsUI() {
  const s = DB.get('settings') || SEED.settings;
  const dt = document.getElementById('darkToggle');
  if (dt) dt.checked = !!s.darkMode;
  const nt = document.getElementById('notifToggle');
  if (nt) nt.checked = !!s.notifEnabled;
  const nj = document.getElementById('notifJam');
  if (nj) nj.value = s.notifJam || '06:00';
  const nr = document.getElementById('notifTimeRow');
  if (nr) nr.style.display = s.notifEnabled ? 'flex' : 'none';
}

/* ── BERANDA / STATS ─────────────────────────── */
function updateStats() {
  const now      = new Date();
  const bulan    = now.getMonth();
  const tahun    = now.getFullYear();
  const laporan  = DB.get('laporan') || [];
  const bulanIni = laporan.filter(l => {
    if (l.tanggalISO) {
      const d = new Date(l.tanggalISO);
      return d.getMonth() === bulan && d.getFullYear() === tahun;
    }
    // fallback: cek tahun di string tanggal "15 Apr 2026"
    const parts = (l.tanggal || '').split(' ');
    return parts[2] === String(tahun) && parseTanggalBulan(parts[1]) === bulan;
  });
  document.getElementById('statKelas').textContent   = (DB.get('kelas') || []).length;
  document.getElementById('statLaporan').textContent = bulanIni.length;
  document.getElementById('statFoto').textContent    = (DB.get('foto')  || []).length;
}

const _BULAN_MAP = {Jan:0,Feb:1,Mar:2,Apr:3,Mei:4,Jun:5,Jul:6,Agu:7,Sep:8,Okt:9,Nov:10,Des:11};
function parseTanggalBulan(b) { return _BULAN_MAP[b] ?? -1; }

function renderPiketHari() {
  const HARI = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const hariIni = HARI[new Date().getDay()];
  const piketTitle = document.getElementById('piketHariTitle');
  if (piketTitle) piketTitle.textContent = `📋 Piket Hari Ini — ${hariIni}`;

  const jadwal = DB.get('jadwal') || [];
  const kelas  = DB.get('kelas')  || [];
  const piket  = jadwal.filter(j => j.hari === hariIni);
  const tbody  = document.getElementById('piketHariBody');
  if (!tbody) return;

  if (!piket.length) {
    tbody.innerHTML = `<tr><td colspan="3" class="empty-state">Tidak ada jadwal piket hari ini.</td></tr>`;
    return;
  }
  tbody.innerHTML = piket.map(j => {
    const k = kelas.find(x => x.id === j.kelasId);
    return `<tr class="today-row">
      <td>${escHtml(k ? k.nama : j.kelasId)}</td>
      <td>${escHtml(j.petugas)}</td>
      <td>${escHtml(j.tugas)}</td>
    </tr>`;
  }).join('');
}

function renderLaporanTerbaru() {
  const laporan = DB.get('laporan') || [];
  const tbody = document.getElementById('laporanTerbaruBody');
  if (!tbody) return;
  const latest = [...laporan].reverse().slice(0, 5);
  if (!latest.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty-state">Belum ada laporan.</td></tr>`;
    return;
  }
  tbody.innerHTML = latest.map(l => `<tr>
    <td>${escHtml(l.kelasNama)}</td>
    <td>${kondisiPill(l.kondisi)}</td>
    <td>${escHtml(l.tanggal)}</td>
    <td>${escHtml(l.pelapor)}</td>
  </tr>`).join('');
}

/* ── KELAS SELECTS ───────────────────────────── */
function populateKelasSelects() {
  const kelas = DB.get('kelas') || [];
  const configs = [
    { id: 'filterKelasJadwal',  prefix: '<option value="">— Pilih Kelas —</option>' },
    { id: 'lapKelas',           prefix: '' },
    { id: 'filterKelasLaporan', prefix: '<option value="">Semua Kelas</option>' },
    { id: 'uploadKelas',        prefix: '' },
    { id: 'filterKelasGaleri',  prefix: '<option value="">Semua Kelas</option>' },
  ];
  configs.forEach(({ id, prefix }) => {
    const sel = document.getElementById(id);
    if (!sel) return;
    const prev = sel.value;
    sel.innerHTML = prefix + kelas.map(k =>
      `<option value="${k.id}">${escHtml(k.nama)}</option>`
    ).join('');
    if (prev) sel.value = prev;
  });
}

/* ── JADWAL ──────────────────────────────────── */
const HARI_LIST = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];

function renderJadwal() {
  const kelasId = parseInt(document.getElementById('filterKelasJadwal')?.value);
  const jadwal  = DB.get('jadwal') || [];
  const user    = getCurrentUser();
  const isGuru  = user && user.role === 'guru';
  const tbody   = document.getElementById('jadwalBody');
  if (!tbody) return;

  if (!kelasId) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty-state">Pilih kelas untuk melihat jadwal.</td></tr>`;
    return;
  }

  const filtered = jadwal
    .filter(j => j.kelasId === kelasId)
    .sort((a, b) => HARI_LIST.indexOf(a.hari) - HARI_LIST.indexOf(b.hari));

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty-state">Belum ada jadwal untuk kelas ini.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(j => `<tr>
    <td><span class="hari-badge">${escHtml(j.hari)}</span></td>
    <td>${escHtml(j.petugas)}</td>
    <td>${escHtml(j.tugas)}</td>
    <td class="guru-only" style="display:${isGuru?'':'none'}">
      <button class="btn-icon" onclick="openModalEditJadwal(${j.id})" title="Edit">✏️</button>
      <button class="btn-icon danger" onclick="deleteJadwal(${j.id})" title="Hapus">🗑️</button>
    </td>
  </tr>`).join('');
}

function renderJadwalHistory() {
  const hist  = DB.get('jadwalH') || [];
  const tbody = document.getElementById('jadwalHistoryBody');
  if (!tbody) return;
  if (!hist.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-state">Belum ada riwayat perubahan.</td></tr>`;
    return;
  }
  tbody.innerHTML = [...hist].reverse().map(h => `<tr>
    <td><span class="pill ${h.aksi === 'Hapus' ? 'pending' : 'done'}">${escHtml(h.aksi)}</span></td>
    <td>${escHtml(h.kelasNama)}</td>
    <td>${escHtml(h.detail)}</td>
    <td>${escHtml(h.oleh)}</td>
    <td>${escHtml(h.waktu)}</td>
  </tr>`).join('');
}

function openModalTambahJadwal() {
  const kelas   = DB.get('kelas') || [];
  const kelasId = parseInt(document.getElementById('filterKelasJadwal')?.value) || (kelas[0]?.id || 0);
  const kelasOpts = kelas.map(k =>
    `<option value="${k.id}" ${k.id === kelasId ? 'selected' : ''}>${escHtml(k.nama)}</option>`
  ).join('');
  const hariOpts = HARI_LIST.map(h => `<option value="${h}">${h}</option>`).join('');

  openModal('➕ Tambah Jadwal Piket', `
    <div class="form-group"><label>Kelas</label><select id="mKelasId">${kelasOpts}</select></div>
    <div class="form-group"><label>Hari</label><select id="mHari">${hariOpts}</select></div>
    <div class="form-group"><label>Petugas</label>
      <input type="text" id="mPetugas" placeholder="Budi, Ani, Cika (pisahkan koma)"/></div>
    <div class="form-group"><label>Tugas</label>
      <input type="text" id="mTugas" placeholder="Sapu & pel lantai, bersihkan papan tulis..."/></div>
    <div class="modal-actions">
      <button class="btn-primary" onclick="saveJadwalItem(null)">Simpan</button>
      <button class="btn-ghost" onclick="closeModal()">Batal</button>
    </div>
  `);
}

function openModalEditJadwal(id) {
  const jadwal  = DB.get('jadwal') || [];
  const kelas   = DB.get('kelas')  || [];
  const j = jadwal.find(x => x.id === id);
  if (!j) return;

  const kelasOpts = kelas.map(k =>
    `<option value="${k.id}" ${k.id === j.kelasId ? 'selected' : ''}>${escHtml(k.nama)}</option>`
  ).join('');
  const hariOpts = HARI_LIST.map(h =>
    `<option value="${h}" ${h === j.hari ? 'selected' : ''}>${h}</option>`
  ).join('');

  openModal('✏️ Edit Jadwal Piket', `
    <div class="form-group"><label>Kelas</label><select id="mKelasId">${kelasOpts}</select></div>
    <div class="form-group"><label>Hari</label><select id="mHari">${hariOpts}</select></div>
    <div class="form-group"><label>Petugas</label>
      <input type="text" id="mPetugas" value="${escHtml(j.petugas)}"/></div>
    <div class="form-group"><label>Tugas</label>
      <input type="text" id="mTugas" value="${escHtml(j.tugas)}"/></div>
    <div class="modal-actions">
      <button class="btn-primary" onclick="saveJadwalItem(${id})">Simpan</button>
      <button class="btn-ghost" onclick="closeModal()">Batal</button>
    </div>
  `);
}

function saveJadwalItem(editId) {
  const kelasId = parseInt(document.getElementById('mKelasId').value);
  const hari    = document.getElementById('mHari').value;
  const petugas = document.getElementById('mPetugas').value.trim();
  const tugas   = document.getElementById('mTugas').value.trim();
  if (!petugas || !tugas) { alert('Mohon lengkapi semua field!'); return; }

  const jadwal    = DB.get('jadwal') || [];
  const kelas     = DB.get('kelas')  || [];
  const kelasNama = (kelas.find(k => k.id === kelasId) || {}).nama || String(kelasId);
  const user      = getCurrentUser();

  if (editId) {
    const idx = jadwal.findIndex(j => j.id === editId);
    if (idx !== -1) jadwal[idx] = { ...jadwal[idx], kelasId, hari, petugas, tugas };
    addJadwalHistory('Edit', kelasNama, `${hari} — ${petugas}`, user?.nama || '—');
  } else {
    jadwal.push({ id: Date.now(), kelasId, hari, petugas, tugas });
    addJadwalHistory('Tambah', kelasNama, `${hari} — ${petugas}`, user?.nama || '—');
  }

  DB.set('jadwal', jadwal);
  closeModal();
  renderJadwal();
  renderJadwalHistory();
  renderPiketHari();
  updateStats();
}

function deleteJadwal(id) {
  if (!confirm('Hapus jadwal ini?')) return;
  const jadwal    = DB.get('jadwal') || [];
  const kelas     = DB.get('kelas')  || [];
  const j         = jadwal.find(x => x.id === id);
  const kelasNama = j ? (kelas.find(k => k.id === j.kelasId) || {}).nama || '' : '';
  const user      = getCurrentUser();

  DB.set('jadwal', jadwal.filter(x => x.id !== id));
  addJadwalHistory('Hapus', kelasNama, j ? `${j.hari} — ${j.petugas}` : '—', user?.nama || '—');
  renderJadwal();
  renderJadwalHistory();
  renderPiketHari();
}

function addJadwalHistory(aksi, kelasNama, detail, oleh) {
  const hist = DB.get('jadwalH') || [];
  hist.push({ aksi, kelasNama, detail, oleh, waktu: nowStr() });
  DB.set('jadwalH', hist);
}

function clearJadwalHistory() {
  if (!confirm('Hapus semua riwayat perubahan jadwal?')) return;
  DB.set('jadwalH', []);
  renderJadwalHistory();
}

function printJadwal() {
  const kelasId = parseInt(document.getElementById('filterKelasJadwal')?.value);
  if (!kelasId) { alert('Pilih kelas terlebih dahulu!'); return; }
  const jadwal  = DB.get('jadwal') || [];
  const kelas   = DB.get('kelas')  || [];
  const profil  = DB.get('profil') || SEED.profil;
  const kelasNama = (kelas.find(k => k.id === kelasId) || {}).nama || '';
  const filtered = jadwal
    .filter(j => j.kelasId === kelasId)
    .sort((a, b) => HARI_LIST.indexOf(a.hari) - HARI_LIST.indexOf(b.hari));

  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html><html><head>
    <title>Jadwal Piket — ${kelasNama}</title>
    <style>
      body  { font-family: Arial, sans-serif; padding: 24px; color: #1a1a1a; }
      h2    { color: #1D9E75; margin-bottom: 4px; }
      .sub  { color: #666; font-size: 12px; margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; font-size: 13px; }
      th    { background: #1D9E75; color: #fff; padding: 9px 12px; text-align: left; }
      td    { padding: 8px 12px; border-bottom: 1px solid #e0e0e0; }
      tr:nth-child(even) td { background: #f9f9f9; }
    </style></head><body>
    <h2>📋 Jadwal Piket — Kelas ${kelasNama}</h2>
    <p class="sub">${profil.nama} &nbsp;|&nbsp; Tahun Ajaran: ${profil.tahun} &nbsp;|&nbsp; Dicetak: ${nowStr()}</p>
    <table>
      <thead><tr><th>Hari</th><th>Petugas</th><th>Tugas</th></tr></thead>
      <tbody>
        ${filtered.map(j => `<tr><td>${j.hari}</td><td>${j.petugas}</td><td>${j.tugas}</td></tr>`).join('')}
      </tbody>
    </table>
    <p style="margin-top:20px;font-size:11px;color:#999;">Total: ${filtered.length} jadwal</p>
    </body></html>`);
  win.document.close();
  win.print();
}

/* ── LAPORAN ─────────────────────────────────── */
function kondisiPill(kondisi) {
  const ok = kondisi === 'Sangat Bersih' || kondisi === 'Bersih';
  return `<span class="pill ${ok ? 'done' : 'pending'}">${escHtml(kondisi)}</span>`;
}

function submitLaporan() {
  const kelasId    = parseInt(document.getElementById('lapKelas').value);
  const kondisi    = document.getElementById('lapKondisi').value;
  const pelapor    = document.getElementById('lapPelapor').value.trim();
  const keterangan = document.getElementById('lapKeterangan').value.trim();

  if (isNaN(kelasId)) { alert('Mohon pilih kelas terlebih dahulu!'); return; }
  if (!pelapor)        { alert('Mohon isi nama pelapor!'); return; }

  const kelas     = DB.get('kelas')   || [];
  const kelasNama = (kelas.find(k => k.id === kelasId) || {}).nama || String(kelasId);

  const laporan = DB.get('laporan') || [];
  laporan.push({
    id: Date.now(), kelasId, kelasNama, kondisi, pelapor, keterangan,
    tanggal: todayStr(),
    tanggalISO: new Date().toISOString().slice(0, 10),
  });
  DB.set('laporan', laporan);

  document.getElementById('lapPelapor').value   = '';
  document.getElementById('lapKeterangan').value = '';

  const msg = document.getElementById('lapSuccessMsg');
  msg.classList.remove('hidden');
  setTimeout(() => msg.classList.add('hidden'), 3000);

  renderLaporan();
  renderLaporanTerbaru();
  updateStats();
  buildFilterBulan();
}

function buildFilterBulan() {
  const laporan = DB.get('laporan') || [];
  const sel = document.getElementById('filterBulanLaporan');
  if (!sel) return;
  const prev = sel.value;
  // Kumpulkan bulan unik
  const bulanSet = new Set();
  laporan.forEach(l => {
    if (l.tanggalISO) bulanSet.add(l.tanggalISO.slice(0, 7)); // "2026-04"
    else {
      const parts = (l.tanggal || '').split(' ');
      if (parts.length === 3) {
        const m = String(parseTanggalBulan(parts[1]) + 1).padStart(2,'0');
        bulanSet.add(`${parts[2]}-${m}`);
      }
    }
  });
  const sorted = [...bulanSet].sort().reverse();
  const NAMA_BULAN = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  sel.innerHTML = '<option value="">Semua Bulan</option>' + sorted.map(ym => {
    const [y, m] = ym.split('-');
    return `<option value="${ym}">${NAMA_BULAN[parseInt(m)-1]} ${y}</option>`;
  }).join('');
  if (prev) sel.value = prev;
}

function renderLaporan() {
  const laporan      = DB.get('laporan') || [];
  const filterKelas  = document.getElementById('filterKelasLaporan')?.value;
  const filterBulan  = document.getElementById('filterBulanLaporan')?.value; // "2026-04"
  const user         = getCurrentUser();
  const isGuru       = user && user.role === 'guru';

  let filtered = [...laporan].reverse();
  if (filterKelas) filtered = filtered.filter(l => String(l.kelasId) === filterKelas);
  if (filterBulan) {
    filtered = filtered.filter(l => {
      if (l.tanggalISO) return l.tanggalISO.startsWith(filterBulan);
      // fallback
      const parts = (l.tanggal || '').split(' ');
      if (parts.length < 3) return false;
      const m = String(parseTanggalBulan(parts[1]) + 1).padStart(2,'0');
      return `${parts[2]}-${m}` === filterBulan;
    });
  }

  const tbody = document.getElementById('laporanBody');
  if (!tbody) return;
  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">Belum ada laporan.</td></tr>`;
    return;
  }
  tbody.innerHTML = filtered.map(l => `<tr>
    <td>${escHtml(l.kelasNama)}</td>
    <td>${kondisiPill(l.kondisi)}</td>
    <td>${escHtml(l.keterangan || '—')}</td>
    <td>${escHtml(l.tanggal)}</td>
    <td>${escHtml(l.pelapor)}</td>
    <td class="guru-only" style="display:${isGuru?'':'none'}">
      <button class="btn-icon" onclick="openModalEditLaporan(${l.id})" title="Edit">✏️</button>
      <button class="btn-icon danger" onclick="deleteLaporan(${l.id})" title="Hapus">🗑️</button>
    </td>
  </tr>`).join('');
}

function openModalEditLaporan(id) {
  const laporan = DB.get('laporan') || [];
  const l = laporan.find(x => x.id === id);
  if (!l) return;
  const kelas = DB.get('kelas') || [];
  const kelasOpts = kelas.map(k =>
    `<option value="${k.id}" ${k.id === l.kelasId ? 'selected':''}>${escHtml(k.nama)}</option>`
  ).join('');
  const kondisiList = ['Sangat Bersih','Bersih','Cukup Bersih','Perlu Perhatian'];
  const kondisiOpts = kondisiList.map(c =>
    `<option ${c === l.kondisi ? 'selected':''}>${c}</option>`
  ).join('');
  openModal('✏️ Edit Laporan', `
    <div class="form-group"><label>Kelas</label><select id="mLapKelas">${kelasOpts}</select></div>
    <div class="form-group"><label>Kondisi</label><select id="mLapKondisi">${kondisiOpts}</select></div>
    <div class="form-group"><label>Dilaporkan Oleh</label>
      <input type="text" id="mLapPelapor" value="${escHtml(l.pelapor)}"/></div>
    <div class="form-group"><label>Keterangan</label>
      <textarea id="mLapKeterangan">${escHtml(l.keterangan || '')}</textarea></div>
    <div class="modal-actions">
      <button class="btn-primary" onclick="saveLaporanEdit(${id})">Simpan</button>
      <button class="btn-ghost" onclick="closeModal()">Batal</button>
    </div>
  `);
}

function saveLaporanEdit(id) {
  const kelasId    = parseInt(document.getElementById('mLapKelas').value);
  const kondisi    = document.getElementById('mLapKondisi').value;
  const pelapor    = document.getElementById('mLapPelapor').value.trim();
  const keterangan = document.getElementById('mLapKeterangan').value.trim();
  if (!pelapor) { alert('Mohon isi nama pelapor!'); return; }

  const laporan   = DB.get('laporan') || [];
  const kelas     = DB.get('kelas')   || [];
  const kelasNama = (kelas.find(k => k.id === kelasId) || {}).nama || String(kelasId);
  const idx       = laporan.findIndex(l => l.id === id);
  if (idx !== -1) laporan[idx] = { ...laporan[idx], kelasId, kelasNama, kondisi, pelapor, keterangan };
  DB.set('laporan', laporan);
  closeModal();
  renderLaporan();
  renderLaporanTerbaru();
}

function deleteLaporan(id) {
  if (!confirm('Hapus laporan ini?')) return;
  const laporan = DB.get('laporan') || [];
  DB.set('laporan', laporan.filter(l => l.id !== id));
  renderLaporan();
  renderLaporanTerbaru();
  updateStats();
}

function exportLaporanPDF() {
  const laporan     = DB.get('laporan') || [];
  const filterKelas = document.getElementById('filterKelasLaporan')?.value;
  let filtered = filterKelas ? laporan.filter(l => String(l.kelasId) === filterKelas) : [...laporan];
  const profil = DB.get('profil') || SEED.profil;

  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html><html><head>
    <title>Laporan Kebersihan — ${profil.nama}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; color: #1a1a1a; }
      h2   { margin-bottom: 4px; color: #1D9E75; }
      .sub { color: #666; font-size: 12px; margin-bottom: 20px; }
      table{ width:100%; border-collapse:collapse; font-size:12px; }
      th   { background:#1D9E75; color:#fff; padding:8px; text-align:left; }
      td   { padding:7px 8px; border-bottom:1px solid #e0e0e0; }
      tr:nth-child(even) td { background:#f5f5f5; }
    </style></head><body>
    <h2>📋 Laporan Kebersihan — ${profil.nama}</h2>
    <p class="sub">Kepala Sekolah: ${profil.kepala} &nbsp;|&nbsp; Tahun Ajaran: ${profil.tahun} &nbsp;|&nbsp; Dicetak: ${nowStr()}</p>
    <table>
      <thead><tr><th>No</th><th>Kelas</th><th>Kondisi</th><th>Keterangan</th><th>Tanggal</th><th>Dilaporkan Oleh</th></tr></thead>
      <tbody>
        ${filtered.map((l, i) => `<tr>
          <td>${i+1}</td><td>${l.kelasNama}</td><td>${l.kondisi}</td>
          <td>${l.keterangan || '—'}</td><td>${l.tanggal}</td><td>${l.pelapor}</td>
        </tr>`).join('')}
      </tbody>
    </table>
    <p style="margin-top:24px; font-size:11px; color:#999;">Total: ${filtered.length} laporan</p>
    </body></html>`);
  win.document.close();
  win.print();
}

/* ── GALERI ──────────────────────────────────── */
let _pendingFiles = [];

function handleFotoSelect(event) {
  _pendingFiles = Array.from(event.target.files).filter(f => f.type.startsWith('image/'));
  if (!_pendingFiles.length) return;

  const preview = document.getElementById('previewFotoArea');
  if (preview) preview.innerHTML = '';

  _pendingFiles.forEach(f => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = document.createElement('img');
      img.src = e.target.result;
      img.style.cssText = 'width:72px;height:72px;object-fit:cover;border-radius:8px;border:1px solid var(--border);';
      preview?.appendChild(img);
    };
    reader.readAsDataURL(f);
  });

  document.getElementById('uploadForm')?.classList.remove('hidden');
}

function simpanFoto() {
  if (!_pendingFiles.length) return;
  const kelasId   = parseInt(document.getElementById('uploadKelas').value);
  if (isNaN(kelasId)) { alert('Mohon pilih kelas terlebih dahulu!'); return; }
  const deskripsi = document.getElementById('uploadDeskripsi').value.trim();
  const kelas     = DB.get('kelas') || [];
  const kelasNama = (kelas.find(k => k.id === kelasId) || {}).nama || String(kelasId);
  const user      = getCurrentUser();

  let done = 0;
  _pendingFiles.forEach(f => {
    const reader = new FileReader();
    reader.onload = e => {
      // Compress via canvas
      const imgEl = new Image();
      imgEl.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 900;
        let w = imgEl.width, h = imgEl.height;
        if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(imgEl, 0, 0, w, h);
        const compressed = canvas.toDataURL('image/jpeg', 0.72);

        const foto = DB.get('foto') || [];
        foto.push({
          id: Date.now() + Math.random(),
          kelasId, kelasNama, deskripsi,
          src: compressed,
          tanggal: todayStr(),
          uploadedBy: user?.nama || '—',
        });
        try { DB.set('foto', foto); }
        catch (e) {
          alert('Penyimpanan penuh! Hapus beberapa foto lama terlebih dahulu.');
          return;
        }

        done++;
        if (done === _pendingFiles.length) {
          batalUpload();
          renderGaleri();
          updateStats();
        }
      };
      imgEl.src = e.target.result;
    };
    reader.readAsDataURL(f);
  });
}

function batalUpload() {
  _pendingFiles = [];
  document.getElementById('uploadForm')?.classList.add('hidden');
  const pa = document.getElementById('previewFotoArea');
  if (pa) pa.innerHTML = '';
  const ud = document.getElementById('uploadDeskripsi');
  if (ud) ud.value = '';
  const fi = document.getElementById('fotoInput');
  if (fi) fi.value = '';
}

function renderGaleri() {
  const foto        = DB.get('foto') || [];
  const filterKelas = document.getElementById('filterKelasGaleri')?.value;
  const user        = getCurrentUser();
  const isGuru      = user && user.role === 'guru';

  let filtered = [...foto].reverse();
  if (filterKelas) filtered = filtered.filter(f => String(f.kelasId) === filterKelas);

  const grid = document.getElementById('fotoGrid');
  if (!grid) return;

  if (!filtered.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;padding:2.5rem;text-align:center;">Belum ada foto tersimpan.</div>`;
    return;
  }

  grid.innerHTML = filtered.map(f => `
    <div class="foto-item" onclick="openLightbox(${f.id})">
      <img src="${f.src}" alt="${escHtml(f.deskripsi || f.kelasNama)}" loading="lazy"/>
      <div class="foto-overlay">
        <span class="foto-label">${escHtml(f.kelasNama)}</span>
        <span class="foto-date">${escHtml(f.tanggal)}</span>
        ${isGuru ? `<button class="foto-del-btn" onclick="event.stopPropagation();deleteFoto(${f.id})" title="Hapus">🗑️</button>` : ''}
      </div>
    </div>
  `).join('');
}

function openLightbox(id) {
  const foto = DB.get('foto') || [];
  const f = foto.find(x => x.id == id);
  if (!f) return;
  document.getElementById('lightboxImg').src = f.src;
  document.getElementById('lightboxInfo').innerHTML =
    `<strong>${escHtml(f.kelasNama)}</strong>${f.deskripsi ? ' · ' + escHtml(f.deskripsi) : ''} · ${escHtml(f.tanggal)} · Oleh: ${escHtml(f.uploadedBy)}`;
  document.getElementById('lightbox').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.add('hidden');
  document.body.style.overflow = '';
}

function deleteFoto(id) {
  if (!confirm('Hapus foto ini?')) return;
  const foto = DB.get('foto') || [];
  DB.set('foto', foto.filter(f => f.id != id));
  renderGaleri();
  updateStats();
}

/* ── PROFIL ──────────────────────────────────── */
function loadProfil() {
  const p = DB.get('profil') || SEED.profil;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
  set('profilNama',   p.nama);
  set('profilKepala', p.kepala);
  set('profilAlamat', p.alamat);
  set('profilTahun',  p.tahun);
  const hs = document.getElementById('heroSekolah');
  if (hs) hs.textContent = p.nama || 'Platform Kebersihan Sekolah';
}

function simpanProfil() {
  DB.set('profil', {
    nama:   document.getElementById('profilNama')?.value.trim()   || '',
    kepala: document.getElementById('profilKepala')?.value.trim() || '',
    alamat: document.getElementById('profilAlamat')?.value.trim() || '',
    tahun:  document.getElementById('profilTahun')?.value.trim()  || '',
  });
  const msg = document.getElementById('profilSuccessMsg');
  msg.classList.remove('hidden');
  setTimeout(() => msg.classList.add('hidden'), 3000);
  loadProfil();
}

function renderKelasGrid() {
  const kelas  = DB.get('kelas') || [];
  const user   = getCurrentUser();
  const isGuru = user && user.role === 'guru';
  const grid   = document.getElementById('kelasGrid');
  if (!grid) return;

  if (!kelas.length) {
    grid.innerHTML = `<p class="empty-state" style="padding:1rem;">Belum ada kelas terdaftar.</p>`;
    return;
  }
  grid.innerHTML = kelas.map(k => `
    <div class="kelas-card">
      <div class="kelas-icon">🏷️</div>
      <div class="kelas-nama">${escHtml(k.nama)}</div>
      ${isGuru ? `<div class="kelas-actions">
        <button class="btn-icon" onclick="openModalEditKelas(${k.id})" title="Edit">✏️</button>
        <button class="btn-icon danger" onclick="deleteKelas(${k.id})" title="Hapus">🗑️</button>
      </div>` : ''}
    </div>
  `).join('');
}

function openModalTambahKelas() {
  openModal('➕ Tambah Kelas', `
    <div class="form-group">
      <label>Nama Kelas</label>
      <input type="text" id="mNamaKelas" placeholder="Contoh: 7A, 8B, IX IPA..."/>
    </div>
    <div class="modal-actions">
      <button class="btn-primary" onclick="saveKelas(null)">Simpan</button>
      <button class="btn-ghost" onclick="closeModal()">Batal</button>
    </div>
  `);
  setTimeout(() => document.getElementById('mNamaKelas')?.focus(), 100);
}

function openModalEditKelas(id) {
  const kelas = DB.get('kelas') || [];
  const k = kelas.find(x => x.id === id);
  openModal('✏️ Edit Kelas', `
    <div class="form-group">
      <label>Nama Kelas</label>
      <input type="text" id="mNamaKelas" value="${k ? escHtml(k.nama) : ''}"/>
    </div>
    <div class="modal-actions">
      <button class="btn-primary" onclick="saveKelas(${id})">Simpan</button>
      <button class="btn-ghost" onclick="closeModal()">Batal</button>
    </div>
  `);
}

function saveKelas(editId) {
  const nama = document.getElementById('mNamaKelas')?.value.trim();
  if (!nama) { alert('Mohon isi nama kelas!'); return; }

  const kelas = DB.get('kelas') || [];
  if (editId) {
    const idx = kelas.findIndex(k => k.id === editId);
    if (idx !== -1) kelas[idx].nama = nama;
  } else {
    kelas.push({ id: Date.now(), nama });
  }
  DB.set('kelas', kelas);
  closeModal();
  renderKelasGrid();
  populateKelasSelects();
  updateStats();
}

function deleteKelas(id) {
  if (!confirm('Hapus kelas ini? Jadwal dan laporan yang terkait tetap tersimpan.')) return;
  const kelas = DB.get('kelas') || [];
  DB.set('kelas', kelas.filter(k => k.id !== id));
  renderKelasGrid();
  populateKelasSelects();
  updateStats();
}

/* ── PENGATURAN ──────────────────────────────── */
function toggleNotif(el) {
  const s = DB.get('settings') || SEED.settings;
  s.notifEnabled = el.checked;
  DB.set('settings', s);
  const nr = document.getElementById('notifTimeRow');
  if (nr) nr.style.display = el.checked ? 'flex' : 'none';
  if (el.checked) requestNotifPermission();
}

function simpanNotif() {
  const jam = document.getElementById('notifJam')?.value;
  const s = DB.get('settings') || SEED.settings;
  s.notifJam = jam;
  DB.set('settings', s);
  const msg = document.getElementById('notifStatusMsg');
  if (msg) {
    msg.textContent = `✅ Pengingat disimpan — setiap hari jam ${jam}`;
    msg.classList.remove('hidden');
    setTimeout(() => msg.classList.add('hidden'), 3000);
  }
}

function requestNotifPermission() {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') {
    Notification.requestPermission().then(p => {
      const msg = document.getElementById('notifStatusMsg');
      if (!msg) return;
      if (p === 'granted') {
        msg.textContent = '✅ Izin notifikasi diberikan!';
      } else {
        msg.textContent = '⚠️ Izin notifikasi ditolak. Aktifkan di pengaturan browser.';
      }
      msg.classList.remove('hidden');
      setTimeout(() => msg.classList.add('hidden'), 4000);
    });
  }
}

function checkNotifOnLoad() {
  const s = DB.get('settings');
  if (!s?.notifEnabled) return;
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const now = new Date();
  const [hh] = (s.notifJam || '06:00').split(':').map(Number);
  const lastNotif = DB.get('lastNotif');
  const todayDate = now.toDateString();

  if (lastNotif === todayDate) return;
  if (now.getHours() < hh) return;

  const HARI  = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const hariIni = HARI[now.getDay()];
  const jadwal  = DB.get('jadwal') || [];
  const kelas   = DB.get('kelas')  || [];
  const piket   = jadwal.filter(j => j.hari === hariIni);
  const body    = piket.length
    ? piket.map(j => { const k = kelas.find(x => x.id === j.kelasId); return `${k?.nama || j.kelasId}: ${j.petugas}`; }).join(', ')
    : 'Tidak ada jadwal piket hari ini.';

  new Notification('🧹 Bersihku — Pengingat Piket', { body: `${hariIni}: ${body}` });
  DB.set('lastNotif', todayDate);
}

/* ── USER MANAGEMENT ─────────────────────────── */
function renderUserTable() {
  const users = DB.get('users') || [];
  const cur   = getCurrentUser();
  const tbody = document.getElementById('userTable');
  if (!tbody) return;
  tbody.innerHTML = users.map(u => `<tr>
    <td>${escHtml(u.username)}</td>
    <td>${escHtml(u.nama)}</td>
    <td><span class="pill ${u.role === 'guru' ? 'done' : 'pending'}">${u.role}</span></td>
    <td style="display:flex;gap:6px;flex-wrap:wrap;">
      <button class="btn-icon" onclick="openModalGantiPassword('${escHtml(u.username)}')" title="Ganti Password">🔑</button>
      ${cur?.username !== u.username
        ? `<button class="btn-icon danger" onclick="deleteUser('${escHtml(u.username)}')" title="Hapus">🗑️</button>`
        : `<span style="font-size:11px;color:var(--text-muted);align-self:center;">(aktif)</span>`}
    </td>
  </tr>`).join('');
}

function openModalGantiPassword(username) {
  openModal(`🔑 Ganti Password — ${username}`, `
    <div class="form-group"><label>Password Baru</label>
      <input type="password" id="mNewPass" placeholder="Masukkan password baru"/></div>
    <div class="form-group"><label>Konfirmasi Password</label>
      <input type="password" id="mNewPassConfirm" placeholder="Ulangi password baru"/></div>
    <div class="modal-actions">
      <button class="btn-primary" onclick="saveGantiPassword('${username}')">Simpan</button>
      <button class="btn-ghost" onclick="closeModal()">Batal</button>
    </div>
  `);
}

function saveGantiPassword(username) {
  const p1 = document.getElementById('mNewPass')?.value;
  const p2 = document.getElementById('mNewPassConfirm')?.value;
  if (!p1 || p1.length < 4) { alert('Password minimal 4 karakter!'); return; }
  if (p1 !== p2)             { alert('Password tidak cocok!'); return; }

  const users = DB.get('users') || [];
  const idx = users.findIndex(u => u.username === username);
  if (idx !== -1) users[idx].password = p1;
  DB.set('users', users);

  // Update currentUser jika yang diganti adalah akun aktif
  const cur = getCurrentUser();
  if (cur?.username === username) {
    cur.password = p1;
    DB.set('currentUser', cur);
  }

  closeModal();
  showToast(`✅ Password "${username}" berhasil diubah!`);
}

function openModalTambahUser() {
  openModal('👤 Tambah Akun Pengguna', `
    <div class="form-group"><label>Nama Lengkap</label>
      <input type="text" id="mUserNama" placeholder="Nama pengguna"/></div>
    <div class="form-group"><label>Username</label>
      <input type="text" id="mUserUsername" placeholder="Username login"/></div>
    <div class="form-group"><label>Password</label>
      <input type="password" id="mUserPass" placeholder="Password"/></div>
    <div class="form-group"><label>Role</label>
      <select id="mUserRole">
        <option value="siswa">🧑‍🎓 Siswa</option>
        <option value="guru">👩‍🏫 Guru</option>
      </select>
    </div>
    <div class="modal-actions">
      <button class="btn-primary" onclick="saveUser()">Simpan</button>
      <button class="btn-ghost" onclick="closeModal()">Batal</button>
    </div>
  `);
}

function saveUser() {
  const nama     = document.getElementById('mUserNama')?.value.trim();
  const username = document.getElementById('mUserUsername')?.value.trim();
  const password = document.getElementById('mUserPass')?.value;
  const role     = document.getElementById('mUserRole')?.value;
  if (!nama || !username || !password) { alert('Mohon lengkapi semua field!'); return; }

  const users = DB.get('users') || [];
  if (users.find(u => u.username === username)) { alert('Username sudah digunakan!'); return; }
  users.push({ username, password, role, nama });
  DB.set('users', users);
  closeModal();
  renderUserTable();
}

function deleteUser(username) {
  const cur = getCurrentUser();
  if (cur?.username === username) { alert('Tidak bisa menghapus akun yang sedang aktif!'); return; }
  if (!confirm(`Hapus akun "${username}"?`)) return;
  const users = DB.get('users') || [];
  DB.set('users', users.filter(u => u.username !== username));
  renderUserTable();
}

/* ── BACKUP & RESTORE ────────────────────────── */
const DATA_KEYS = ['users','kelas','jadwal','jadwalH','laporan','foto','profil','settings'];

function exportData() {
  const backup = {};
  DATA_KEYS.forEach(k => { backup[k] = DB.get(k); });
  backup._exported = nowStr();
  backup._version  = '2';

  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);

  const a = document.createElement('a');
  const tgl = new Date().toISOString().slice(0,10);
  a.href     = url;
  a.download = `bersihku-backup-${tgl}.json`;
  a.click();
  URL.revokeObjectURL(url);

  showToast('✅ Backup berhasil diunduh!');
}

function importData() {
  const input = document.createElement('input');
  input.type   = 'file';
  input.accept = '.json,application/json';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        // Validasi minimal
        if (!data.kelas && !data.jadwal && !data.laporan) {
          alert('File tidak valid! Pastikan ini adalah file backup Bersihku.');
          return;
        }
        if (!confirm(`Impor data dari file "${file.name}"?\nData saat ini akan digantikan.`)) return;

        DATA_KEYS.forEach(k => { if (data[k] !== undefined) DB.set(k, data[k]); });

        alert('✅ Data berhasil dipulihkan! Halaman akan dimuat ulang.');
        location.reload();
      } catch {
        alert('File rusak atau bukan format JSON yang valid.');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function showToast(msg) {
  let t = document.getElementById('_toast');
  if (!t) {
    t = document.createElement('div');
    t.id = '_toast';
    t.style.cssText = `
      position:fixed; bottom:24px; left:50%; transform:translateX(-50%) translateY(20px);
      background:var(--text); color:var(--surface); padding:10px 20px; border-radius:8px;
      font-size:13px; font-weight:600; z-index:9999;
      opacity:0; transition:opacity .25s, transform .25s; pointer-events:none;
    `;
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  t.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateX(-50%) translateY(20px)';
  }, 2800);
}

/* ── RESET ───────────────────────────────────── */
function resetData() {
  if (!confirm('Reset SEMUA data? Aksi ini tidak bisa dibatalkan!')) return;
  if (!confirm('Konfirmasi sekali lagi — semua jadwal, laporan, foto, dan akun akan terhapus!')) return;
  [...DATA_KEYS, 'currentUser', 'lastNotif'].forEach(k => DB.del(k));
  alert('Data berhasil direset. Halaman akan dimuat ulang.');
  location.reload();
}

/* ── MODAL ───────────────────────────────────── */
function openModal(title, bodyHTML) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = bodyHTML;
  document.getElementById('modalOverlay').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
}

// Close modal on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal();
    closeLightbox();
  }
});