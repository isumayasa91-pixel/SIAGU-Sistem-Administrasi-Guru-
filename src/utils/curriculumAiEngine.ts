/**
 * SIAGU Curriculum Merdeka Client-Side Generator Engine
 * Guarantees zero downtime, offline capability, and seamless export on Vercel & GitHub Pages.
 */

export interface CurriculumMeta {
  mapel?: string;
  fase?: string;
  tingkatKelas?: string;
  kelas?: string;
  topik?: string;
  model?: string;
  alokasi?: string;
  dimensi?: string[];
  tujuan?: string;
  aktivitasType?: string;
  jumlahAnggota?: string;
  alatBahan?: string;
  siswaNama?: string;
  nilai?: string;
  predikat?: string;
  kehadiran?: string;
  levelKognitif?: string;
  modelAsesmen?: string;
  jumlahPilihan?: number;
  jumlahEssay?: number;
}

export function generateClientCurriculumDocument(
  toolType: 'modul_ajar' | 'lkpd' | 'soal_hots' | 'catatan_raport',
  meta: CurriculumMeta,
  _prompt?: string
): string {
  const mapel = meta.mapel || 'Ilmu Pengetahuan Alam';
  const fase = meta.fase || 'Fase D (SMP Kelas 7, 8, 9)';
  const tingkatKelas = meta.tingkatKelas || 'Kelas 7';
  const kelas = meta.kelas || `${tingkatKelas} (7A)`;
  const topik = meta.topik || 'Pengamatan Struktur Sel dan Mikroskop';
  const model = meta.model || 'Problem-Based Learning (PBL)';
  const alokasi = meta.alokasi || '2 x 40 menit (1 Pertemuan)';
  const tujuan =
    meta.tujuan ||
    'Peserta didik mampu menganalisis karakteristik, struktur, dan fungsi komponen utama materi melalui aktivitas penyelidikan ilmiah serta mempresentasikannya dengan percaya diri.';
  const dimensi =
    meta.dimensi && meta.dimensi.length > 0
      ? meta.dimensi.join(', ')
      : 'Penalaran Kritis, Kolaborasi, Kreativitas, Kemandirian, Keimanan dan Ketaqwaan terhadap Tuhan YME';

  // ================= 1. LKPD GENERATOR =================
  if (toolType === 'lkpd') {
    const aktivitas = meta.aktivitasType || 'Eksperimen & Penyelidikan Ilmiah Terpandu';
    const kelompok = meta.jumlahAnggota || '4 - 5 Peserta Didik';
    const alatBahan = meta.alatBahan || 'Alat tulis, lembar observasi, bahan sampel materi, dan panduan belajar.';

    // Generate steps according to learning syntax
    let sintaksSteps: { step: string; sintaks: string; instruksi: string }[] = [];

    if (model.includes('PBL') || model.includes('Masalah')) {
      sintaksSteps = [
        {
          step: 'Tahap 1',
          sintaks: 'Orientasi terhadap Masalah',
          instruksi: `Bacalah stimulus studi kasus kontekstual mengenai ${topik}. Tuliskan rumusan pertanyaan penyelidikan yang ingin kelompok kalian buktikan secara objektif.`,
        },
        {
          step: 'Tahap 2',
          sintaks: 'Organisasi Belajar Kelompok',
          instruksi: `Bagi tugas setiap anggota kelompok (Ketua/Moderator, Pengamat Data, Notulen Laporan, Juru Bicara Presentasi). Siapkan ${alatBahan}.`,
        },
        {
          step: 'Tahap 3',
          sintaks: 'Penyelidikan Mandiri & Kolaboratif',
          instruksi: `Lakukan langkah-langkah observasi praktikum/eksplorasi konsep ${topik}. Catat setiap data kuantitatif dan kualitatif pada Tabel Lembar Pengamatan secara jujur.`,
        },
        {
          step: 'Tahap 4',
          sintaks: 'Pengembangan & Penyajian Hasil',
          instruksi: `Diskusikan pertanyaan analisis bersama kelompok. Rangkum kesimpulan komprehensif dan siapkan pemaparan untuk sesi diskusi kelas.`,
        },
        {
          step: 'Tahap 5',
          sintaks: 'Evaluasi & Refleksi Penyelidikan',
          instruksi: `Tanggapi masukan dari kelompok lain dan bimbingan guru. Refleksikan proses belajar serta perbaiki draf laporan akhir kelompok.`,
        },
      ];
    } else if (model.includes('PjBL') || model.includes('Proyek')) {
      sintaksSteps = [
        {
          step: 'Tahap 1',
          sintaks: 'Penetapan Pertanyaan Mendasar',
          instruksi: `Identifikasi tantangan riil di lingkungan sekitar yang berkaitan erat dengan materi ${topik}. Tentukan fokus proyek inovatif yang akan dirancang.`,
        },
        {
          step: 'Tahap 2',
          sintaks: 'Perancangan Desain Proyek',
          instruksi: `Susun rancangan produk/karya, tentukan pembagian peran kelompok, serta daftarkan alat dan bahan lokal yang diperlukan.`,
        },
        {
          step: 'Tahap 3',
          sintaks: 'Penyusunan Jadwal Pelaksanaan',
          instruksi: `Tetapkan lini masa kerja (tahap persiapan, pengerjaan produk, uji coba kelayakan, dan penyusunan laporan mini).`,
        },
        {
          step: 'Tahap 4',
          sintaks: 'Monitoring & Realisasi Karya',
          instruksi: `Kerjakan proyek secara kolaboratif sesuai jadwal. Konsultasikan kendala yang dihadapi kepada guru secara berkala.`,
        },
        {
          step: 'Tahap 5',
          sintaks: 'Uji Coba & Penilaian Produk',
          instruksi: `Lakukan pengujian hasil karya proyek. Catat kelebihan, keterbatasan, dan efektivitas solusi yang diciptakan.`,
        },
        {
          step: 'Tahap 6',
          sintaks: 'Evaluasi Pengalaman Belajar',
          instruksi: `Presentasikan hasil karya proyek di hadapan kelas dan buat lembar refleksi pengalaman belajar kelompok.`,
        },
      ];
    } else {
      sintaksSteps = [
        {
          step: 'Tahap 1',
          sintaks: 'Stimulasi (Stimulation)',
          instruksi: `Cermati data, gambar, atau fenomena pemantik yang disajikan guru mengenai konsep dasar ${topik}.`,
        },
        {
          step: 'Tahap 2',
          sintaks: 'Identifikasi Masalah (Problem Statement)',
          instruksi: `Rumuskan hipotesis kerja sementara berdasarkan permasalahan yang ditemukan.`,
        },
        {
          step: 'Tahap 3',
          sintaks: 'Pengumpulan Data (Data Collection)',
          instruksi: `Lakukan penggalian informasi melalui eksperimen, studi pustaka, atau observasi lapangan terkait ${topik}.`,
        },
        {
          step: 'Tahap 4',
          sintaks: 'Pengolahan Data (Data Processing)',
          instruksi: `Olah dan klasifikasikan data hasil temuan ke dalam tabel analisis data pengamatan.`,
        },
        {
          step: 'Tahap 5',
          sintaks: 'Pembuktian (Verification)',
          instruksi: `Bandingkan temuan kelompok dengan teori rujukan pada buku teks untuk menguji kebenaran hipotesis awal.`,
        },
        {
          step: 'Tahap 6',
          sintaks: 'Menarik Kesimpulan (Generalization)',
          instruksi: `Rumuskan kesimpulan umum materi yang telah dibuktikan bersama seluruh anggota kelompok.`,
        },
      ];
    }

    return `# LEMBAR KERJA PESERTA DIDIK (LKPD) KURIKULUM MERDEKA
**Satuan Pendidikan:** SMP Negeri 3 Kediri  
**Mata Pelajaran:** ${mapel}  
**Fase / Tingkat Kelas:** ${fase} / ${kelas}  
**Topik Pembelajaran:** ${topik}  
**Model Pembelajaran:** ${model}  
**Bentuk Aktivitas:** ${aktivitas}  
**Alokasi Waktu:** ${alokasi}  
**Dimensi Profil Lulusan:** ${dimensi}  

---

### IDENTITAS KELOMPOK:
- **Nama Kelompok / Meja:** ................................................................
- **Ketua Kelompok:** ................................................................
- **Anggota Kelompok:**
  1. ................................................................ (Absen: ....)
  2. ................................................................ (Absen: ....)
  3. ................................................................ (Absen: ....)
  4. ................................................................ (Absen: ....)
  5. ................................................................ (Absen: ....)

---

### A. TUJUAN PEMBELAJARAN & INDIKATOR KINERJA
1. ${tujuan}
2. Melalui kerja sama kelompok, peserta didik mampu mengumpulkan data penyelidikan secara cermat dan bertanggung jawab.
3. Peserta didik mampu mengomunikasikan hasil investigasi dan menyajikan argumen ilmiah berbasis bukti.

---

### B. STIMULUS KASUS KONTEKSTUAL (ORIENTASI MASALAH)
Perhatikan fenomena kontekstual berikut:
*"Dalam kehidupan sehari-hari, fenomena terkait **${topik}** memegang peranan krusial dalam menjaga keseimbangan sistem dan mendukung produktivitas. Sekelompok peserta didik menemukan bahwa terjadi perbedaan karakteristik yang signifikan ketika variabel lingkungan mengalami perubahan mendadak. Mengapa hal tersebut bisa terjadi? Faktor apa sajakah yang mempengaruhinya, dan bagaimana kita dapat mengukurnya secara ilmiah?"*

**Pertanyaan Pemantik Penyelidikan:**
1. Berdasarkan fenomena di atas, masalah pokok apa yang perlu kelompok kalian selidiki?
   *Jawaban Kelompok:* ............................................................................................................
2. Tuliskan dugaan sementara (hipotesis) kelompok kalian!
   *Hipotesis:* .......................................................................................................................

---

### C. ALAT, BAHAN & SUMBER BELAJAR
- **Alat dan Bahan:** ${alatBahan}
- **Sumber Belajar:** Buku Siswa ${mapel} Kurikulum Merdeka, lembar materi ajar, dan media pengamatan digital.

---

### D. LANGKAH-LANGKAH KERJA BERBASIS SINTAKS ${model.toUpperCase()}
${sintaksSteps.map((s) => `#### ${s.step}: ${s.sintaks}
> **Instruksi Kerja:** ${s.instruksi}
*Catatan Pelaksanaan Kelompok:*
........................................................................................................................................
`).join('\n')}

---

### E. TABEL LEMBAR PENGAMATAN & DATA HASIL INVESTIGASI

| No | Komponen / Parameter yang Diamati | Hasil Pengamatan Kualitatif | Nilai / Data Kuantitatif | Keterangan / Analisis Awal |
|:--:|:----------------------------------|:----------------------------|:-------------------------|:---------------------------|
| 1  | Sampel Uji A (Kondisi Normal)     | ........................... | ........................ | .......................... |
| 2  | Sampel Uji B (Perlakuan Khusus)   | ........................... | ........................ | .......................... |
| 3  | Interaksi Antar Komponen          | ........................... | ........................ | .......................... |
| 4  | Perubahan Fungsional Terukur      | ........................... | ........................ | .......................... |

---

### F. PERTANYAAN ANALISIS & DISKUSI KRITIS KELOMPOK
1. **Analisis Komparatif:** Bandingkan data pada sampel A dan sampel B. Perbedaan mendasar apakah yang paling mencolok dan apa penyebab utamanya?
   *Jawab:* ......................................................................................................................................
2. **Kaitan Konseptual:** Bagaimana hubungan sebab-akibat antara materi **${topik}** dengan fenomena stimulus di awal pembelajaran?
   *Jawab:* ......................................................................................................................................
3. **Penerapan Nyata:** Usulkan 1 (satu) solusi atau aplikasi praktis dari temuan ini yang dapat diterapkan di sekolah atau rumah!
   *Jawab:* ......................................................................................................................................

---

### G. KESIMPULAN BELAJAR KELOMPOK
Berdasarkan seluruh rangkaian aktivitas penyelidikan dan analisis data, kelompok kami menyimpulkan bahwa:
> ........................................................................................................................................................
> ........................................................................................................................................................

---

### H. LEMBAR REFLEKSI DIRI PESERTA DIDIK
Beri tanda centang (✓) pada skala perasaan dan isi refleksi singkat:
- [ ] 😊 Sangat Paham & Menyenangkan
- [ ] 😐 Cukup Paham, Perlu Tambahan Latihan
- [ ] 🙁 Masih Bingung pada Bagian Tertentu

*Hal paling menarik yang saya pelajari hari ini:* .....................................................................................  
*Hal yang masih ingin saya pelajari lebih lanjut:* ..................................................................................

---

### I. RUBRIK PENILAIAN KINERJA LKPD (GURU)

| No | Kriteria Penilaian | Skor 1 (Perlu Bimbingan) | Skor 2 (Cukup) | Skor 3 (Baik) | Skor 4 (Sangat Baik) | Skor Perolehan |
|:--:|:-------------------|:-------------------------|:---------------|:--------------|:---------------------|:--------------:|
| 1  | Keaktifan & Kolaborasi | Pasif dalam kelompok | Cukup aktif | Aktif berpartisipasi | Sangat inisiatif & memimpin | ...... / 4 |
| 2  | Ketelitian Data | Data tidak lengkap | Data kurang rapi | Data lengkap & rapi | Sangat teliti & objektif | ...... / 4 |
| 3  | Kedalaman Analisis | Menjawab seadanya | Menjawab sederhana | Analisis tepat | Analisis kritis & mendalam | ...... / 4 |
| 4  | Kesimpulan & Presentasi | Tidak ada kesimpulan | Kesimpulan kurang utuh | Kesimpulan tepat | Kesimpulan runtut & lugas | ...... / 4 |

**Nilai Akhir LKPD = (Total Skor Perolehan / 16) x 100 = .............**  
**Paraf Guru Pembimbing:** ........................  **Tanggal:** ........................`;
  }

  // ================= 2. SOAL HOTS GENERATOR =================
  if (toolType === 'soal_hots') {
    const kognitif = meta.levelKognitif || 'Level 3 (C4 Analisis, C5 Evaluasi, C6 Kreasi)';
    const stimulus = meta.modelAsesmen || 'Kontekstual AKM / Literasi Numerasi';

    return `# PAKET ASESMEN & SOAL HOTS KURIKULUM MERDEKA
**Satuan Pendidikan:** SMP Negeri 3 Kediri  
**Mata Pelajaran:** ${mapel}  
**Fase / Tingkat Kelas:** ${fase} / ${kelas}  
**Topik Pembelajaran:** ${topik}  
**Level Kognitif Target:** ${kognitif}  
**Model Asesmen Stimulus:** ${stimulus}  
**Tahun Pelajaran:** 2025/2026  

---

### MATRIKS KISI-KISI PENULISAN SOAL ASESMEN

| No | Capaian Pembelajaran (CP) | Tujuan Pembelajaran (TP) | Lingkup Materi | Indikator Soal | Level Kognitif | Bentuk Soal | No. Soal | Bobot |
|:--:|:--------------------------|:-------------------------|:---------------|:---------------|:--------------:|:-----------:|:--------:|:-----:|
| 1  | Pemahaman Konseptual Sains | Menganalisis karakteristik komponen utama | ${topik} | Disajikan stimulus kasus, siswa mampu membedakan variabel penentu fenomena | L3 (C4) | PG | 1 | 10 |
| 2  | Penerapan Konsep & Solusi | Memprediksi respon adaptif sistem | ${topik} | Disajikan data tren, siswa mampu memprediksi dampak perubahan lingkungan | L3 (C5) | PG | 2 | 10 |
| 3  | Metode Ilmiah & Evaluasi | Merancang validasi data pengamatan | ${topik} | Siswa mampu menentukan variabel kontrol mitigasi anomali data | L3 (C5) | PG | 3 | 10 |
| 4  | Pemecahan Masalah Nyata | Menghubungkan teori dengan kasus riil | ${topik} | Siswa menganalisis relasi sebab-akibat fenomena di lingkungan masyarakat | L3 (C4) | PG | 4 | 10 |
| 5  | Evaluasi Rancangan Eksperimen | Menilai efektivitas metodologi | ${topik} | Siswa menentukan parameter validitas instrumen pengukuran mandiri | L3 (C5) | PG | 5 | 10 |
| 6  | Analisis Komprehensif | Menganalisis faktor kritis keberhasilan | ${topik} | Siswa menguraikan mekanisme kerja dan mitigasi kendala sistem | L3 (C4) | Uraian | 1 | 25 |
| 7  | Perancangan Solusi Kreatif | Merancang inovasi terapan kontekstual | ${topik} | Siswa mendesain gagasan aplikatif berbahan lokal untuk mengatasi isu lokal | L3 (C6) | Uraian | 2 | 25 |

---

### PETUNJUK PENGERJAAN SOAL:
1. Bacalah basmalah/doa dan identitas Anda pada lembar jawaban yang tersedia.
2. Cermati setiap stimulus bacaan, grafik, dan tabel data sebelum menentukan pilihan jawaban.
3. Kerjakan terlebih dahulu butir soal yang Anda anggap paling mudah.

---

### BAGIAN I: SOAL PILIHAN GANDA BERBASIS STIMULUS HOTS

#### Stimulus Bacaan 1 (Konteks Lingkungan & Eksperimen):
*Dalam investigasi ilmiah di laboratorium sekolah mengenai materi **${topik}**, kelompok peserta didik mengamati dua perlakuan berbeda. Pada kelompok kontrol dengan kondisi normal, laju proses berlangsung stabil. Namun pada kelompok perlakuan dengan fluktuasi intensitas variabel, diperoleh data yang menunjukkan lonjakan awal diikuti kestabilan pada titik ambang tertentu.*

**1. Berdasarkan data stimulus di atas, manakah pernyataan paling tepat yang menerangkan mekanisme respons internal sistem terhadap rangsangan tersebut?**  
A. Komponen sistem mengalami kerusakan permanen seketika saat terpapar variabel.  
B. Terjadi penyesuaian fungsional dan homeostasis guna menyeimbangkan laju proses menuju kestabilan baru.  
C. Fluktuasi lingkungan sama sekali tidak memberikan dampak pada aktivitas fisiologis/struktur materi.  
D. Respons hanya terjadi jika tidak ada variabel pengganggu lain di sekitarnya.  
*Kunci Jawaban: B*

**2. Apabila intensitas variabel dinaikkan hingga melampaui batas toleransi maksimum (*threshold*), prediksi paling logis yang akan terjadi adalah...**  
A. Efisiensi kerja sistem menurun tajam akibat gangguan struktural atau denaturasi fungsional.  
B. Sistem akan beradaptasi tanpa batas dan menghasilkan keluaran eksponensial.  
C. Komponen inti berganti menjadi substansi yang tidak memiliki sifat asal.  
D. Laju reaksi berhenti seketika tanpa ada sisa residu pengamatan.  
*Kunci Jawaban: A*

**3. Untuk menjamin bahwa data hasil pengamatan memiliki tingkat validitas dan reliabilitas tinggi, langkah metodologis terpenting yang wajib diterapkan siswa adalah...**  
A. Mengubah hipotesis penelitian agar selaras dengan data sementara.  
B. Melakukan replikasi pengukuran minimal 3 kali pengulangan serta menjaga variabel kontrol tetap konstan.  
C. Menghilangkan data pengamatan yang nilainya berbeda dari kelompok lain.  
D. Mempercepat durasi eksperimen agar tidak terpengaruh kelelahan pengamat.  
*Kunci Jawaban: B*

**4. Dalam kehidupan bermasyarakat, pemahaman konsep ${topik} dapat diaplikasikan secara optimal untuk...**  
A. Menghasilkan inovasi ramah lingkungan dan efisiensi pemanfaatan sumber daya lokal.  
B. Menggantikan seluruh prosedur standar keselamatan di tempat kerja.  
C. Menghindari penggunaan teknologi modern dalam kehidupan sehari-hari.  
D. Menghilangkan ketergantungan manusia terhadap kelestarian alam sekitar.  
*Kunci Jawaban: A*

**5. Seorang siswa merancang alat peraga sederhana berbahan barang bekas untuk mendemonstrasikan prinsip ${topik}. Kriteria utama untuk menyatakan bahwa alat peraga tersebut berhasil secara edukatif adalah...**  
A. Keindahan warna dan kemewahan aksesoris yang ditempelkan.  
B. Kemampuan alat memperagakan konsep ilmiah secara akurat, presisi, dan mudah dipahami siswa lain.  
C. Ukuran fisik alat peraga yang paling besar di antara kelompok lain.  
D. Waktu pembuatan yang paling singkat tanpa uji coba awal.  
*Kunci Jawaban: B*

---

### BAGIAN II: SOAL ESSAY / URAIAN HOTS

**Soal Uraian 1 (C4 - Analisis Sistem & Sebab-Akibat):**  
Jelaskanlah mekanisme kerja keterkaitan antar-komponen utama pada topik **${topik}**. Identifikasi minimal 2 (dua) faktor kritis yang dapat memicu ketidakseimbangan sistem, serta jelaskan langkah konkrit yang dapat dilakukan untuk mengatasinya!

**Soal Uraian 2 (C6 - Kreasi Inovasi & Problem Solving):**  
Di lingkungan sekolah atau tempat tinggal Anda, terjadi permasalahan kontekstual yang berkaitan dengan materi ini. Rancanglah sebuah gagasan solusi aplikatif atau prosedur penyelidikan mandiri sederhana yang memanfaatkan kearifan lokal/bahan sekitar untuk memecahkan persoalan tersebut secara berkelanjutan!

---

### KUNCI JAWABAN & PEMBAHASAN MENDALAM:
1. **Soal PG 1 (B):** Dalam konsep ${mapel}, sistem biologis dan materi senantiasa beradaptasi dinamis untuk menjaga keseimbangan (homeostasis).
2. **Soal PG 2 (A):** Setiap sistem memiliki rentang toleransi optimal; peningkatan di luar kapasitas optimum memicu denaturasi fungsional.
3. **Soal PG 3 (B):** Standar metode ilmiah mewajibkan replikasi (*triplo*) dan pengendalian variabel bebas/kontrol guna meminimalkan galat (*error margin*).
4. **Soal PG 4 (A):** Pemahaman sains kontekstual bermuara pada kesadaran ekologis dan inovasi teknologi tepat guna yang ramah lingkungan.
5. **Soal PG 5 (B):** Validitas instrumen pembelajaran ditentukan oleh ketepatan representasi konsep ilmiah (*conceptual accuracy*).

---

### PEDOMAN PENSKORAN & RUBRIK PENILAIAN ANALITIK (SKOR 0 - 100):
- **Bagian I: Pilihan Ganda (5 Butir x 10 Poin):** Maksimal 50 Poin
- **Bagian II: Soal Essay 1:** Maksimal 25 Poin (Identifikasi komponen: 10, Analisis sebab-akibat: 10, Koherensi bahasa: 5)
- **Bagian II: Soal Essay 2:** Maksimal 25 Poin (Orisinalitas gagasan: 10, Kelayakan implementasi: 10, Argumen logis: 5)
- **Skor Total Akhir:** 50 + 25 + 25 = 100 Poin.`;
  }

  // ================= 3. CATATAN RAPORT GENERATOR =================
  if (toolType === 'catatan_raport') {
    const nama = meta.siswaNama || 'Peserta Didik';
    const nilai = meta.nilai || '85';
    const predikat = meta.predikat || 'A';
    const kehadiran = meta.kehadiran || '98%';

    return `# NARASI CATATAN WALI KELAS & CAPAIAN RAPORT SISWA
**Nama Peserta Didik:** ${nama}  
**Kelas / Fase:** ${kelas} / ${fase}  
**Nilai Rata-Rata Capaian:** ${nilai} (Predikat ${predikat})  
**Tingkat Kehadiran:** ${kehadiran}  
**Tahun Pelajaran:** 2025/2026 Semester Ganjil  

---

### 🌟 OPSI 1: GAYA FORMAL & EDUKATIF (Standar Rapor Nasional Kemendikbudristek)
> *"Ananda **${nama}** menunjukkan penguasaan kompetensi yang sangat membanggakan dalam seluruh capaian pembelajaran semester ini. Menunjukkan nalar kritis yang tangguh, kemampuan memecahkan masalah yang teruji, serta kedisiplinan yang tinggi dalam menyelesaikan penugasan terstruktur. Pertahankan etos belajar unggul ini untuk terus berprestasi di jenjang berikutnya."*

---

### 💡 OPSI 2: GAYA MOTIVATIF & HUMANIS (Membangun Karakter & Potensi)
> *"Selamat atas kerja keras dan capaian luar biasa Ananda **${nama}** di semester ini! Sikap santun, kepedulian sosial, dan semangat gotong royong yang Ananda tunjukkan menjadi teladan yang sangat berharga bagi rekan-rekan di kelas. Teruslah percaya pada kekuatan impianmu, asah kreativitas tanpa henti, dan jadilah pribadi pembelajar sepanjang hayat!"*

---

### 🎯 OPSI 3: GAYA RINGKAS & FOKUS TARGET (To-The-Point & Actionable)
> *"Capaian akademik sangat baik dengan predikat **${predikat}** dan persentase kehadiran optimal (${kehadiran}). Rekomendasi pengembangan semester depan: Terus pertajam kemampuan kepemimpinan kelompok dan perluas eksplorasi literasi mandiri untuk memaksimalkan potensi kepemimpinan Ananda."*

---

### 👨‍👩‍👧 CATATAN KHUSUS UNTUK ORANG TUA / WALI SISWA:
> *"Apresiasi dan terima kasih yang setinggi-tingginya kami sampaikan kepada Bapak/Ibu Wali atas kerja sama dan pendampingan penuh kasih di rumah. Sinergi antara sekolah dan keluarga adalah kunci utama keberhasilan ananda. Mohon terus dampingi Ananda dengan ruang dialog yang terbuka dan penguatan karakter positif."*`;
  }

  // ================= 4. MODUL AJAR (RPP) GENERATOR =================
  return `# MODUL AJAR KURIKULUM MERDEKA
**Satuan Pendidikan:** SMP Negeri 3 Kediri  
**Mata Pelajaran:** ${mapel}  
**Fase Kurikulum:** ${fase}  
**Tingkat Kelas:** ${kelas}  
**Alokasi Waktu:** ${alokasi}  
**Model Pembelajaran:** ${model}  
**Dimensi Profil Lulusan:** ${dimensi}  

---

## I. INFORMASI UMUM

### A. Identitas Modul
- **Penyusun:** Guru Mata Pelajaran ${mapel}
- **Satuan Pendidikan:** SMP Negeri 3 Kediri
- **Tahun Penyusunan:** 2025/2026
- **Jenjang / Fase:** Sekolah Menengah Pertama (SMP) / ${fase}
- **Kelas / Semester:** ${kelas} / Semester Ganjil
- **Alokasi Waktu:** ${alokasi}

### B. Kompetensi Awal
Peserta didik telah memiliki pemahaman mendasar mengenai pengamatan objek lingkungan sekitar serta mampu menggunakan instrumen pengamatan secara aman dan bertanggung jawab.

### C. Dimensi Profil Lulusan & Karakter Siswa
- **${dimensi}**

### D. Sarana dan Prasarana
- **Media Pembelajaran:** Lembar Kerja Peserta Didik (LKPD), Proyektor LCD, Laptop, Papan Tulis Interaktif.
- **Alat dan Bahan:** Instrumen praktikum/peraga, sampel bahan observasi, alat tulis.
- **Sumber Belajar:** Buku Guru & Siswa Kurikulum Merdeka Kemendikbudristek, ensiklopedia digital, video kontekstual.

### E. Target & Karakteristik Peserta Didik
- Peserta didik reguler/tipikal: umum, tidak ada kesulitan belajar dalam mencerna konsep ajar (32 siswa heterogen).

---

## II. KOMPONEN INTI

### A. Tujuan Pembelajaran (TP)
${tujuan}

### B. Pemahaman Bermakna
Peserta didik memahami bahwa penguasaan mendalam atas topik **${topik}** menjadi landasan esensial dalam memecahkan masalah nyata, melatih nalar kritis, dan menciptakan inovasi ramah lingkungan.

### C. Pertanyaan Pemantik
1. Mengapa materi **${topik}** memiliki peran sangat krusial dalam kehidupan kita sehari-hari?
2. Bagaimana cara membuktikan kebenaran suatu fenomena sains secara objektif melalui metode investigasi ilmiah?

---

## III. KEGIATAN PEMBELAJARAN LENGKAP

### 1. Kegiatan Pendahuluan (10 - 15 Menit)
- **Kondisi Awal:** Guru membuka KBM dengan salam, doa bersama, dan memeriksa kehadiran peserta didik dengan penuh kehangatan.
- **Apersepsi & Motivasi:** Mengaitkan materi prasyarat dengan topik **${topik}** melalui tayangan fenomena pemantik.
- **Orientasi:** Menyampaikan tujuan pembelajaran, alokasi waktu, serta garis besar sintaks **${model}**.

### 2. Kegiatan Inti (${model}) (50 - 60 Menit)
- **Tahap 1 (Orientasi pada Masalah):** Siswa mengamati stimulus kasus kontekstual mengenai **${topik}** dan merumuskan pertanyaan kunci penyelidikan.
- **Tahap 2 (Organisasi Belajar):** Siswa berkelompok (4-5 orang), menerima LKPD, dan membagi tugas peran secara kolaboratif.
- **Tahap 3 (Penyelidikan Terbimbing):** Kelompok melakukan observasi, pengumpulan data, dan studi pustaka dengan fasilitasi guru.
- **Tahap 4 (Pengembangan Hasil Karya):** Kelompok menyusun laporan hasil penyelidikan dan menyiapkan presentasi kelas.
- **Tahap 5 (Evaluasi & Refleksi):** Presentasi kelompok, tanggapan antar-teman, klarifikasi konsep oleh guru, dan apresiasi bersama.

### 3. Kegiatan Penutup (10 - 15 Menit)
- Peserta didik bersama guru merangkum simpulan materi pembelajaran hari ini.
- Refleksi pembelajaran (apa yang paling dipahami, hal yang menarik, dan tantangan yang dialami).
- Guru menyampaikan rencana tindak lanjut (tugas tindak lanjut / jadwal pertemuan berikutnya) serta menutup dengan doa dan salam.

---

## IV. ASESMEN & EVALUASI
1. **Asesmen Diagnostik:** Tanya-jawab lisan di awal pembelajaran untuk memetakan kesiapan awal murid.
2. **Asesmen Formatif:** Observasi sikap Profil Pelajar Pancasila dan penilaian kinerja kelompok menggunakan LKPD.
3. **Asesmen Sumatif:** Tes pemahaman konsep melalui naskah soal HOTS di akhir bab.

---

## V. PENGAYAAN & REMEDIAL
- **Pengayaan:** Penugasan proyek telaah mandiri artikel ilmiah bagi siswa dengan ketuntasan tinggi.
- **Remedial:** Bimbingan tutor sebaya pada indikator yang belum tuntas.

---

## VI. LAMPIRAN
- **Lembar Kerja Peserta Didik (LKPD)** terstruktur
- **Bahan Bacaan Guru dan Peserta Didik**
- **Glosarium Istilah & Daftar Pustaka Standar Kemendikbudristek**`;
}
