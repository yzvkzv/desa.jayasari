// INISIALISASI SUPABASE
const SUPABASE_URL = 'https://gamugugiizwfcvvhhsjw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_HuTtufic_EwY5ETBd-N1Dw_DBmmsbh5';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 1. KIRIM PENGADUAN DARI WARGA
async function kirimAduan() {
  const nama_warga = document.getElementById('nama_warga').value;
  const telepon = document.getElementById('telepon').value;
  const isi_aduan = document.getElementById('isi_aduan').value;

  if(!nama_warga || !telepon || !isi_aduan) {
    alert('Mohon lengkapi semua data pengaduan!');
    return;
  }

  const { error } = await db.from('pengaduan').insert([{ nama_warga, telepon, isi_aduan, status: 'Menunggu' }]);
  if(error) {
    alert('Gagal mengirim aduan: ' + error.message);
  } else {
    alert('Pengaduan berhasil dikirim ke perangkat Desa Jayasari!');
    document.getElementById('form-aduan').reset();
  }
}

// 2. TAMPILKAN BERITA DI HALAMAN UTAMA (DENGAN FOTO)
async function muatBeritaPublik() {
  const container = document.getElementById('list-berita');
  if(!container) return;

  const { data, error } = await db.from('berita').select('*').order('id', { ascending: false });
  if(error) {
    container.innerHTML = '<p>Gagal memuat berita.</p>';
    return;
  }

  if(data.length === 0) {
    container.innerHTML = '<p>Belum ada berita atau pengumuman yang dipublikasikan.</p>';
    return;
  }

  container.innerHTML = data.map(item => `
    <div class="news-item">
      <small style="color: #666;">Kategori: ${item.kategori}</small>
      <h3 style="color: var(--primary); margin: 5px 0;">${item.judul}</h3>
      ${item.foto_url ? `<img src="${item.foto_url}" alt="Foto Berita" class="news-img">` : ''}
      <p>${item.isi}</p>
    </div>
  `).join('');
}

// 3. LOGIN ADMIN
async function loginAdmin() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const { data, error } = await db.auth.signInWithPassword({ email, password });
  if(error) {
    alert('Login Gagal: Periksa kembali email dan password Anda.');
  } else {
    alert('Login Berhasil!');
    window.location.href = 'admin.html';
  }
}

// 4. CEK SESI ADMIN
async function cekSesiAdmin() {
  const { data: { session } } = await db.auth.getSession();
  if(!session) {
    alert('Akses ditolak! Silakan login terlebih dahulu.');
    window.location.href = 'login.html';
  }
}

// 5. LOGOUT ADMIN
async function logoutAdmin() {
  await db.auth.signOut();
  window.location.href = 'index.html';
}

// 6. TAMBAH BERITA OLEH ADMIN (DENGAN FOTO)
async function tambahBerita() {
  const judul = document.getElementById('judul_berita').value;
  const kategori = document.getElementById('kategori_berita').value;
  const foto_url = document.getElementById('foto_berita').value;
  const isi = document.getElementById('isi_berita').value;

  if(!judul || !kategori || !isi) {
    alert('Judul, kategori, dan isi berita wajib diisi!');
    return;
  }

  const { error } = await db.from('berita').insert([{ judul, kategori, foto_url, isi }]);
  if(error) {
    alert('Gagal menambah berita: ' + error.message);
  } else {
    alert('Berita berhasil dipublish!');
    document.getElementById('judul_berita').value = '';
    document.getElementById('kategori_berita').value = '';
    document.getElementById('foto_berita').value = '';
    document.getElementById('isi_berita').value = '';
    muatAduanAdmin();
  }
}

// 7. TAMPILKAN ADUAN DI DASHBOARD ADMIN
async function muatAduanAdmin() {
  const container = document.getElementById('list-aduan');
  if(!container) return;

  const { data, error } = await db.from('pengaduan').select('*').order('id', { ascending: false });
  if(error) {
    container.innerHTML = '<p>Gagal memuat data aduan.</p>';
    return;
  }

  if(data.length === 0) {
    container.innerHTML = '<p>Belum ada aduan dari warga.</p>';
    return;
  }

  container.innerHTML = data.map(item => `
    <div style="border-bottom: 1px solid #ddd; padding: 10px 0;">
      <strong>Dari: ${item.nama_warga} (${item.telepon})</strong>
      <p>${item.isi_aduan}</p>
      <small style="color: #888;">Status: ${item.status}</small>
    </div>
  `).join('');
}
  
