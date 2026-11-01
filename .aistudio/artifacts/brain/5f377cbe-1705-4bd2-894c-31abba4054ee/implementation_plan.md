# SIP-BMD: Perbaikan Persistensi Data, Tombol Hapus Pegawai & Fitur Pelepasan Aset

Rencana komprehensif untuk mengatasi masalah data kembali ke awal setelah lama tidak digunakan, memperbaiki fungsi tombol hapus pegawai yang terputus, serta menambahkan alur kerja lengkap Pelepasan Aset BMD bagi aparatur sipil yang pindah tugas atau pensiun lengkap dengan Berita Acara Serah Terima Pengembalian resmi.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> Berdasarkan konfirmasi pada tahap klarifikasi sebelumnya, seluruh rekomendasi telah disetujui:
> 1. **Alur Pelepasan Aset**: Pengguna dapat memilih untuk mengembalikan aset ke stok gudang (*Tersedia*) atau langsung mengalihkan penguasaannya ke pegawai pengganti (*Mutasi Pemakai*).
> 2. **Status Kepegawaian**: Sistem menyediakan status spesifik (`Mutasi/Pindah`, `Pensiun`, atau `Non-Aktif`) setelah seluruh aset diserahkan/dilepas, dengan riwayat penguasaan barang tetap tersimpan rapi untuk keperluan audit BPK/Inspektorat.
> 3. **Dokumen Resmi**: Disediakan format dokumen cetak resmi **Berita Acara Pengembalian/Pelepasan Barang Milik Daerah (BAP-BMD)** lengkap dengan kop dinas Pemkot Banjarmasin, data rincian barang, dan blok tanda tangan para pihak.

---

### 1. Overview & Core Concept

- **Problem Statement**:
  - Aplikasi kehilangan perubahan data dan kembali ke seed awal saat lama tidak dibuka karena fallback `getPegawai()` / `getBarang()` membaca `localStorage` yang terhapus browser tanpa memastikan status koleksi Firestore aktual.
  - Tombol hapus pegawai pada tabel tidak memicu tindakan apa pun karena elemen dialog konfirmasi (`ConfirmModal`) belum terpasang di JSX `PegawaiView.tsx`.
  - Belum tersedia fitur tata kelola BMD saat pegawai mutasi keluar atau memasuki masa purna tugas (pensiun), sehingga status barang menggantung.
- **Solusi yang Dibangun**:
  - **Sistem Sinkronisasi Awet & Kuat**: Memperbaiki `StorageService` dan `FirestoreService` dengan inisialisasi cloud yang aman. Menambahkan fallback cache persisten dan penanda koleksi, sehingga data Firestore yang telah disimpan tidak akan pernah tertimpa oleh data bawaan (seed) meskipun browser membersihkan `localStorage` atau aplikasi lama tidak dibuka.
  - **Pemasangan Dialog Hapus Pegawai**: Menghubungkan state `deleteTarget` di `PegawaiView.tsx` ke `<ConfirmModal>` dengan proteksi pelepasan aset terlebih dahulu jika pegawai masih menguasai aset BMD.
  - **Modul Pelepasan Aset Pegawai**: Menambahkan tombol aksi khusus *"Lepas / Kembalikan Aset"* pada kartu/tabel pegawai yang memiliki barang, memunculkan modal serah terima pelepasan aset (pilihan: Gudang / Pegawai Pengganti), memperbarui status pegawai ke *Mutasi/Pindah* atau *Pensiun*, serta menerbitkan Berita Acara Pelepasan Aset siap cetak/ekspor PDF.

---

### 2. User Experience & Visual Design

#### A. Identitas Warna & Visual
Aplikasi menerapkan palet resmi yang diminta dengan standar kontras WCAG AA:
- **Latar Belakang Utama**: `#F3F4F6` (Light Neutral Gray)
- **Komponen Kartu & Modal**: `#FFFFFF` (Pure White) dengan border lembut `#E5E7EB`
- **Header & Tombol Utama**: `#0F766E` (Deep Teal) dengan teks putih kontras
- **Aksen / Highlight / Active State**: `#CCFBF1` (Pastel Aqua / Teal Light)
- **Teks Utama**: `#111827` (Near Black)
- **Teks Sekunder**: `#6B7280` (Cool Gray)
- **Aksen Peringatan & Status**:
  - *Aktif*: Badge hijau lembut teks `#047857` bg `#ECFDF5`
  - *Mutasi/Pindah*: Badge biru lembut teks `#1D4ED8` bg `#EFF6FF`
  - *Pensiun*: Badge ungu lembut teks `#6D28D9` bg `#F5F3FF`
  - *Non-Aktif*: Badge netral teks `#4B5563` bg `#F3F4F6`

#### B. Alur Pengguna (User Flows)
1. **Flow Pelepasan Aset Pegawai (Pindah / Pensiun)**:
   - Pengguna membuka tab *Pegawai (Pemakai BMD)*.
   - Pada baris pegawai dengan status aktif yang memegang aset, terdapat tombol aksi *"Pelepasan Aset"* dengan ikon khusus serah terima.
   - Muncul modal **Pelepasan Aset BMD**:
     - Menampilkan daftar semua aset yang saat ini dikuasai pegawai tersebut.
     - Pengguna memilih alasan pelepasan: *Mutasi / Pindah Tugas*, *Purna Tugas (Pensiun)*, atau *Penarikan Dinas Rutin*.
     - Pengguna menentukan tujuan aset per-barang atau sekaligus: *Kembalikan ke Gudang (Tersedia)* atau *Alihkan ke Pegawai Pengganti*.
     - Masukkan Nomor Berita Acara & Tanggal Pelepasan.
     - Pilih Pejabat Penyerah & Penerima.
   - Klik *"Konfirmasi & Terbitkan Berita Acara"*:
     - Seluruh barang diupdate status penguasaannya di database.
     - Status pegawai diubah menjadi `Mutasi/Pindah` atau `Pensiun`.
     - Tampil modal pratinjau dokumen resmi **Berita Acara Pengembalian BMD** dengan tombol Cetak / Simpan.

2. **Flow Hapus Pegawai**:
   - Pengguna mengklik ikon hapus (Trash) pada tabel pegawai.
   - Jika pegawai masih memegang aset, muncul peringatan ramah: *"Pegawai masih memegang X barang BMD. Silakan lakukan pelepasan aset terlebih dahulu sebelum menghapus data."*
   - Jika tidak memegang aset, muncul konfirmasi hapus via `ConfirmModal`.
   - Data terhapus seketika dari UI dan dihapus permanen dari Firestore & local storage.

---

### 3. Key Product Decisions & Trade-Offs

- **Pemisahan Antara Pelepasan Aset vs Hapus Akun Pegawai**:
  - *Keputusan*: Pegawai yang pindah atau pensiun **tidak langsung dihapus**, melainkan dialihkan statusnya ke `Mutasi/Pindah` atau `Pensiun` dengan aset dilepaskan.
  - *Alasan*: Tata kelola barang milik daerah mewajibkan rekam jejak historis pemakai aset untuk pemeriksaan Badan Pemeriksa Keuangan (BPK) dan Aparat Pengawasan Intern Pemerintah (APIP). Opsi hapus permanen tetap tersedia bagi data yang keliru diinput.
- **Penyimpanan Cloud-First dengan Smart Local Fallback**:
  - *Keputusan*: `StorageService` tidak lagi mengandalkan `isCloudDatabaseEmpty` yang rentan salah baca ketika koneksi lambat. Sebaliknya, Firestore menggunakan penanda koleksi `system_meta/init_flag` dan penyimpanan dokumen terstruktur.
  - *Alasan*: Mencegah aplikasi mereset kembali ke data awal ketika dibuka setelah sekian minggu/bulan atau saat local storage browser dibersihkan.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SIP-BMD UI Layer (React)                       │
├──────────────────┬──────────────────────┬──────────────────────────────┤
│  PegawaiView     │  PelepasanAsetModal  │  BeritaAcaraPelepasanModal   │
│  - Tombol Hapus  │  - Pilih Barang      │  - Kop Pemkot Banjarmasin    │
│  - Tombol Lepas  │  - Tujuan: Gudang /  │  - Rincian Barang Dikembalikan│
│  - Filter Status │    Pegawai Pengganti │  - Tanda Tangan Para Pihak   │
└─────────┬────────┴──────────┬───────────┴──────────────┬───────────────┘
          │                   │                          │
          ▼                   ▼                          ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 StorageService & State Synchronization                 │
│  - syncWithCloud(): Deteksi cloud data tanpa menimpa data pengguna    │
│  - executePelepasanAset(): Mutasi barang + update status pegawai       │
│  - deletePegawai(): Validasi kepemilikan aset + delete local & cloud   │
└─────────────────────────────────┬──────────────────────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Cloud Firestore Persistence                        │
│  - Collection 'pegawai'    : CRUD dokumen pegawai & status mutasi      │
│  - Collection 'barang'     : Update status ketersediaan & pemakai      │
│  - Collection 'pelimpahan' : Riwayat serah terima & berita acara       │
│  - Collection 'pelepasan'  : Arsip resmi dokumen pelepasan aset        │
└────────────────────────────────────────────────────────────────────────┘
```

#### Struktur Data Tambahan
1. **Model Pelepasan Aset (`PelepasanAsetRecord`)**:
   - `id`: string
   - `nomorBAP`: string (format: `027/.../BAP-BMD/ITK-BJM/2026`)
   - `tanggal`: string
   - `idPegawaiAsal`: string
   - `namaPegawaiAsal`: string
   - `nipPegawaiAsal`: string
   - `alasan`: `'Mutasi' | 'Pensiun' | 'Pengembalian'`
   - `daftarBarang`: `{ idBarang: string; namaBarang: string; kodeBarang: string; kondisi: string; tujuan: 'Gudang' | 'PegawaiLain'; idPegawaiBaru?: string; namaPegawaiBaru?: string }[]`
   - `idPejabatPenyimpan`: string
   - `catatan`: string

2. **Perluasan Status Pegawai**:
   - Status: `'Aktif' | 'Mutasi/Pindah' | 'Pensiun' | 'Non-Aktif'`

3. **Perbaikan Persistence Engine**:
   - Menghilangkan loop re-seeding yang menimpa data lama di `src/services/storage.ts`.
   - Menggunakan `onSnapshot` atau update terkawal ke Firestore untuk menjaga sinkronisasi dua arah.

---

### 5. Pembaruan: Pembersihan Data Pegawai Lama & Batasan 150 Pegawai

1. **Pembersihan Data Pegawai Lama**:
   - Seluruh nama pegawai lama telah dihapus (`pegawaiList` = `[]`) pada aplikasi dan Cloud Firestore, memberikan lembar kosong yang siap digunakan untuk menambahkan data pegawai baru.
   - Seluruh barang inventaris (BMD) yang sebelumnya dipegang oleh mantan pegawai telah dikembalikan statusnya menjadi `'Tersedia'` di ruangan/gudang dan siap dilimpahkan ke pegawai baru.
2. **Kapasitas Maksimal 150 Orang**:
   - Kuota data pegawai dibatasi maksimal 150 orang baik penambahan manual maupun impor file Excel.
   - Paginasi tabel responsif (10, 25, 50, 100 per halaman) dengan navigasi halaman pertama, sebelumnya, berikutnya, dan terakhir.
   - Tersedia tombol aksi cepat "Kosongkan Pegawai" dengan modal konfirmasi keamanan di header.
   - Tersedia tombol opsional "Muat Contoh 150 Pegawai" untuk kemudahan simulasi.
3. **Pelestarian Seluruh Fitur Eksisting**:
   - Master Unit Kerja (SET, IRBAN I-IV, IRBAN Khusus) tetap terjaga.
   - Master Ruangan dan Lokasi Aset tetap terjaga.
   - KOP dinas resmi dengan logo Pemkot Banjarmasin tetap terintegrasi.
   - Dokumen BAST, SK Pemegang, SPTJM, dan BAP Pelepasan Aset dalam format cetak landscape/PDF tetap berfungsi penuh.

---

### 7. Pembaruan: Format Baku Penulisan Tanggal BAST & Sinkronisasi Serentak (SK & SPTJM)

1. **Aturan Baku Penulisan Naskah Dinas BAST**:
   - Menyelaraskan susunan kalimat pembuka Berita Acara Serah Terima (BAST) sesuai kaidah tata naskah dinas resmi:
     `Pada hari ini [Hari] tanggal [Terbilang] bulan [Bulan] tahun [Terbilang] ([dd-mm-yyyy]), bertempat di Kantor Inspektorat Kota Banjarmasin, kami yang bertanda tangan di bawah ini:`
   - Menghilangkan tanda kurung terpisah yang sebelumnya memotong alur kata (`(27)` dan `(2026)`), serta menyempurnakan ejaan, tanda baca titik ganda, dan titik nama pejabat.
   - Menyediakan pilihan gaya penulisan pada toolbar dokumen:
     - **Format Standar Resmi**: dengan kode tanggal numerik di akhir `(dd-mm-yyyy)`.
     - **Format Terbilang Murni**: tanpa angka dalam tanda kurung.
     - **Format Tanggal Lengkap**: dengan tanggal lengkap dalam tanda kurung `(dd MMMM yyyy)`.
2. **Fleksibilitas Pengaturan Tanggal & Sinkronisasi 3 Dokumen**:
   - Tanggal tetap dapat disesuaikan sewaktu-waktu oleh pengguna melalui pemilih tanggal (*Date Picker*).
   - Nama hari secara otomatis dihitung dan mengikuti tanggal yang dipilih tanpa risiko kesalahan manual.
   - Tanggal yang dipilih serentak otomatis diterapkan pada ketiga dokumen resmi: **BAST**, **SK Penetapan Pemakai BMD**, dan **SPTJM**, serta langsung tersimpan ke Cloud Firestore.
