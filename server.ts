import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));

// Database storage file path on server
const DB_FILE = path.join(__dirname, 'siagu_db.json');

// Helper to get GoogleGenAI instance safely
function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  return new GoogleGenAI(apiKey ? { apiKey } : {});
}

// GET /api/data - Fetch central database state across all devices
app.get('/api/data', (req, res) => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const rawData = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(rawData);
      return res.json(parsed);
    }
  } catch (error) {
    console.error('[SIAGU Server] Error reading DB file:', error);
  }
  return res.json({ empty: true });
});

// POST /api/data - Sync and persist database state across all devices
app.post('/api/data', (req, res) => {
  try {
    const bodyData = req.body;
    if (!bodyData || typeof bodyData !== 'object') {
      return res.status(400).json({ error: 'Payload tidak valid.' });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(bodyData, null, 2));
    return res.json({ success: true, timestamp: new Date().toISOString() });
  } catch (error: any) {
    console.error('[SIAGU Server] Error saving DB file:', error);
    return res.status(500).json({ error: 'Gagal menyimpan data ke server DB.' });
  }
});

// Server-side AI API endpoint for SIAGU Teacher Assistant
app.post('/api/gemini/generate', async (req, res) => {
  try {
    const { prompt, systemInstruction, toolType, meta } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt wajib diisi.' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

    if (apiKey) {
      try {
        const ai = getAiClient();
        const sysMsg = systemInstruction
          ? systemInstruction +
            '\n\nGunakan Bahasa Indonesia formal, sopan, terstruktur dengan format Markdown yang rapi dan profesional sesuai standar Kurikulum Merdeka Kemendikbudristek.'
          : 'Anda adalah Asisten Guru Ahli Kurikulum Merdeka Indonesia (SIAGU AI Assistant). Berikan dokumen terstruktur, praktis, serta langsung dapat digunakan oleh guru dalam administrasi kelas.';

        // Use gemini-3.8-flash as primary fast model
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: sysMsg,
            temperature: 0.7,
          },
        });

        if (response && response.text) {
          return res.json({ text: response.text, provider: 'gemini-3.8-flash' });
        }
      } catch (geminiError: any) {
        console.warn('[SIAGU AI] Primary Gemini call failed, trying backup fallback:', geminiError?.message);
      }
    }

    // High-quality deterministic generator fallback if API is unreachable / offline
    const fallbackText = generateStructuredFallback(toolType, meta, prompt);
    return res.json({
      text: fallbackText,
      provider: 'siagu-curriculum-engine',
    });
  } catch (error: any) {
    console.error('[SIAGU AI] Endpoint error:', error);
    return res.status(500).json({
      error: error?.message || 'Terjadi kesalahan pada server AI.',
    });
  }
});

// Fallback generator for complete Kurikulum Merdeka standard document
function generateStructuredFallback(toolType: string | undefined, meta: any, prompt: string): string {
  const mapel = meta?.mapel || 'Ilmu Pengetahuan Alam';
  const kelas = meta?.kelas || 'Kelas 7';
  const topik = meta?.topik || 'Pengamatan Struktur Sel dan Mikroskop';
  const model = meta?.model || 'Problem-Based Learning (PBL)';
  const alokasi = meta?.alokasi || '2 x 40 Menit (1 Pertemuan)';
  const tujuan = meta?.tujuan || 'Siswa mampu menganalisis konsep dan mempresentasikan hasil kerja kelompok.';
  const dimensi = meta?.dimensi ? meta.dimensi.join(', ') : 'Keimanan dan Ketaqwaan terhadap Tuhan YME, Penalaran Kritis, Kreativitas, Kolaborasi, Kemandirian, Kesehatan, Komunikasi';

  if (toolType === 'soal_hots' || prompt.includes('SOAL EVALUASI')) {
    return `# PAKET ASESMEN & SOAL HOTS KURIKULUM MERDEKA
**Mata Pelajaran:** ${mapel}  
**Kelas / Fase:** ${kelas}  
**Topik Pembelajaran:** ${topik}  
**Level Kognitif:** Level 3 (C4 Analisis, C5 Evaluasi, C6 Kreasi)  
**Standar Asesmen:** Kontekstual AKM & Literasi Numerasi  

---

### PETUNJUK PENGERJAAN:
1. Bacalah stimulus teks, grafik, dan tabel kasus dengan cermat sebelum menjawab.
2. Kerjakan soal pilihan ganda dengan memilih opsi yang paling tepat (A, B, C, atau D).
3. Kerjakan soal uraian dengan menguraikan langkah analisis dan argumen yang logis.

---

### BAGIAN I: SOAL PILIHAN GANDA (HOTS)

#### Stimulus Kasus 1:
*Sebuah kelompok peneliti di sekolah melakukan pengamatan terhadap pengaruh faktor lingkungan pada topik **${topik}**. Dari data pengamatan selama 5 hari, diperoleh grafik yang menunjukkan fluktuasi signifikan pada sampel kontrol dibanding sampel uji.*

**1. Berdasarkan data pengamatan pada stimulus di atas, manakah kesimpulan paling tepat yang menjelaskan fenomena tersebut?**  
A. Perubahan terjadi karena faktor eksternal mendominasi seluruh proses biologis.  
B. Struktur dan komponen utama mengalami adaptasi fungsional terhadap stimulasi lingkungan.  
C. Tidak ada korelasi antara variabel bebas dengan hasil pengamatan sampel.  
D. Hasil akhir hanya dipengaruhi oleh kesalahan instrumen pengukuran.  
*Jawaban Benar: B*

**2. Jika kondisi lingkungan pada penelitian dinaikkan secara ekstrem, prediksi yang paling logis menurut konsep ${mapel} adalah...**  
A. Terjadi penurunan efisiensi kerja sistem secara bertahap hingga mencapai titik kritis.  
B. Seluruh proses akan berhenti seketika tanpa adanya kompensasi metabolisme.  
C. Laju reaksi meningkat tanpa batas maksimum.  
D. Karakteristik dasar materi berubah menjadi senyawa yang sama sekali berbeda.  
*Jawaban Benar: A*

**3. Manakah langkah mitigasi terbaik yang dapat dirancang oleh siswa untuk memvalidasi keakuratan data pengamatan?**  
A. Menambah jumlah pengulangan (*replikasi*) dan mengontrol variabel pengganggu dengan teliti.  
B. Mengubah hipotesis penelitian agar sesuai dengan hasil pengamatan sementara.  
C. Mengabaikan data anomali yang tidak sesuai dengan teori buku teks.  
D. Mengurangi durasi observasi agar data tidak terpengaruh waktu.  
*Jawaban Benar: A*

**4. Analisislah hubungan sebab-akibat antara pemahaman konsep ${topik} dengan pemecahan masalah kehidupan nyata sehari-hari!**  
A. Pemahaman materi memungkinkan efisiensi dalam penerapan teknologi terapan dan konservasi.  
B. Konsep tersebut hanya bersifat teoritis dan tidak memiliki aplikasi praktis.  
C. Hubungan sebab-akibat hanya berlaku pada skala laboratorium tertutup.  
D. Penguasaan konsep menggantikan kebutuhan akan prosedur keselamatan kerja.  
*Jawaban Benar: A*

**5. Seorang siswa merancang eksperimen alternatif menggunakan alat sederhana. Kriteria evaluasi terpenting untuk menilai validitas rancangan tersebut adalah...**  
A. Tingkat keterulangan (*repeatability*) dan kesesuaian variabel kontrol yang ditetapkan.  
B. Kecepatan waktu penyelesaian eksperimen dibanding kelompok lain.  
C. Kemewahan bahan dan instrumen yang digunakan.  
D. Banyaknya anggota kelompok yang terlibat saat demonstrasi.  
*Jawaban Benar: A*

---

### BAGIAN II: SOAL ESSAY / URAIAN HOTS

**Soal 1 (C4 - Analisis Masalah):**  
Uraikanlah analisis komparatif mengenai mekanisme kerja pada **${topik}**. Jelaskan 3 faktor kritis yang menentukan keberhasilan sistem tersebut serta dampaknya jika salah satu faktor mengalami gangguan!

**Soal 2 (C6 - Perancangan Solusi / Kreasi):**  
Rancanglah sebuah gagasan inovatif atau prosedur praktikum sederhana berbasis bahan lokal untuk membuktikan prinsip utama **${topik}** di lingkungan sekitar sekolah!

---

### KUNCI JAWABAN & PEMBAHASAN MENDALAM:
1. **Kunci Soal 1 (B):** Sesuai teori dasar ${mapel}, komponen biologis/fisik senantiasa beradaptasi guna mempertahankan homeostasis dan efisiensi fungsional.
2. **Kunci Soal 2 (A):** Setiap sistem memiliki batas toleransi optimum. Kenaikan variabel melebihi batas optimum memicu denaturasi atau penurunan fungsi.
3. **Kunci Soal 3 (A):** Kaidah metode ilmiah mewajibkan replikasi dan kontrol variabel ketat guna meminimalkan *error margin*.
4. **Kunci Soal 4 (A):** Pengetahuan ilmiah kontekstual berkontribusi langsung pada inovasi ramah lingkungan dan pemecahan isu sosial.
5. **Kunci Soal 5 (A):** Validitas instrumen ditentukan oleh konsistensi hasil ukur pada parameter yang sama.

---

### RUBRIK PENSKORAN & EVALUASI ANALITIK (SKOR 0 - 100):
- **Pilihan Ganda (5 Butir x 10 Poin):** Maksimal 50 Poin
- **Soal Essay 1 (Analisis):** Maksimal 25 Poin (Kriteria: Kedalaman analisis 10, Argumen ilmiah 10, Koherensi 5)
- **Soal Essay 2 (Solusi/Kreasi):** Maksimal 25 Poin (Kriteria: Orisinalitas ide 10, Kelayakan implementasi 10, Sistematika 5)
- **Total Skor Akhir:** 100 Poin`;
  }

  if (toolType === 'catatan_raport' || prompt.includes('CATATAN WALI KELAS')) {
    const nama = meta?.siswaNama || 'Peserta Didik';
    const nilai = meta?.nilai || '85';
    const predikat = meta?.predikat || 'A';
    return `# NARASI CATATAN WALI KELAS & CAPAIAN RAPORT
**Nama Siswa:** ${nama}  
**Kelas:** ${kelas}  
**Capaian Nilai:** ${nilai} (Predikat ${predikat})  
**Tahun Ajaran:** 2025/2026 Kurikulum Merdeka  

---

### 🌟 OPSI 1: GAYA FORMAL & EDUKATIF (Standar Rapor Nasional)
> *"Ananda **${nama}** menunjukkan penguasaan kompetensi yang sangat memuaskan pada seluruh capaian pembelajaran semester ini. Memiliki nalar kritis yang baik, aktif berpartisipasi dalam diskusi kelas, serta senantiasa menyelesaikan tugas-tugas terstruktur dengan tuntas di atas kriteria KKM. Pertahankan dedikasi belajar yang luar biasa ini menuju semester berikutnya."*

---

### 💡 OPSI 2: GAYA MOTIVATIF & HUMANIS (Membangun Karakter)
> *"Selamat atas pencapaian gemilang Ananda **${nama}** di semester ini! Sikap santun, gotong royong, dan rasa ingin tahu yang tinggi menjadikan Ananda teladan yang positif bagi teman-teman di kelas. Teruslah percaya pada potensi diri, asah kreativitas tanpa henti, dan raihlah cita-cita setinggi bintang di langit!"*

---

### 🎯 OPSI 3: GAYA RINGKAS & FOKUS TARGET (To-The-Point)
> *"Capaian akademik sangat baik dengan predikat **${predikat}** dan disiplin kehadiran optimal. Rekomendasi pengembangan: Terus tingkatkan kemampuan eksplorasi mandiri dan kepemimpinan dalam kerja kelompok untuk memaksimalkan potensi unggul Ananda."*

---

### 👨‍👩‍👧 CATATAN KHUSUS UNTUK ORANG TUA / WALI:
> *"Terima kasih yang tulus kepada Bapak/Ibu atas sinergi dan pendampingan belajar yang konsisten di rumah. Mohon terus memberikan motivasi dan apresiasi atas setiap proses tumbuh kembang Ananda agar semangat belajarnya senantiasa terjaga optimal."*`;
  }

  // Default: Modul Ajar Kurikulum Merdeka
  return `# MODUL AJAR KURIKULUM MERDEKA
**Satuan Pendidikan:** SMP Negeri 3 Kediri  
**Mata Pelajaran:** ${mapel}  
**Fase / Kelas:** ${kelas}  
**Alokasi Waktu:** ${alokasi}  
**Model Pembelajaran:** ${model}  

---

## I. INFORMASI UMUM

### A. Identitas Modul
- **Penyusun:** Guru Mata Pelajaran ${mapel}
- **Tahun Penyusunan:** 2025/2026
- **Jenjang Sekolah:** Sekolah Menengah Pertama (SMP)
- **Topik / Materi:** ${topik}

### B. Kompetensi Awal
Peserta didik telah memahami konsep dasar sains dan lingkungan serta memiliki keterampilan dasar dalam melakukan observasi terstruktur.

### C. Dimensi Profil Lulusan & Karakter Siswa
- **${dimensi}**

### D. Sarana dan Prasarana
- Media Pembelajaran: Lembar Kerja Peserta Didik (LKPD), Slide Presentasi, Papan Tulis, Perangkat LCD Proyektor.
- Alat dan Bahan: Sampel objek praktikum/materi ajar, instrumen observasi, alat tulis.
- Sumber Belajar: Buku Panduan Guru dan Siswa Kemendikbudristek, video pembelajaran kontekstual.

### E. Target Peserta Didik
- Peserta didik reguler/tipikal: umum, tidak ada kesulitan dalam mencerna dan memahami materi ajar.

---

## II. KOMPONEN INTI

### A. Tujuan Pembelajaran (TP)
${tujuan}

### B. Pemahaman Bermakna
Peserta didik memahami bahwa pemahaman mendalam tentang **${topik}** sangat esensial dalam memecahkan permasalahan nyata dan memelihara keseimbangan lingkungan hidup.

### C. Pertanyaan Pemantik
1. Mengapa materi **${topik}** sangat penting dalam kehidupan kita sehari-hari?
2. Bagaimana kita dapat membuktikan hubungan sebab-akibat dari fenomena tersebut secara ilmiah?

---

## III. KEGIATAN PEMBELAJARAN LENGKAP

### 1. Kegiatan Pendahuluan (10 - 15 Menit)
- Guru membuka pembelajaran dengan salam hangat, berdoa bersama, dan memeriksa kehadiran peserta didik.
- Guru mengondisikan suasana belajar yang aman, inklusif, dan menyenangkan.
- **Apersepsi & Motivasi:** Guru mengaitkan materi sebelumnya dengan topik **${topik}** melalui tayangan gambar/video pemantik.
- Guru menyampaikan tujuan pembelajaran, alokasi waktu, serta kriteria penilaian yang akan digunakan.

### 2. Kegiatan Inti (${model}) (55 - 60 Menit)
- **Fase 1 (Orientasi pada Masalah):** Peserta didik mengamati studi kasus kontekstual yang disajikan guru mengenai **${topik}**.
- **Fase 2 (Mengorganisasikan Peserta Didik):** Guru membagi peserta didik ke dalam kelompok heterogen (4-5 siswa) dan membagikan Lembar Kerja Peserta Didik (LKPD).
- **Fase 3 (Membimbing Penyelidikan Mandiri & Kelompok):** Peserta didik mengumpulkan informasi, melakukan eksplorasi data, dan berdiskusi aktif dengan bimbingan guru.
- **Fase 4 (Mengembangkan & Menyajikan Hasil Karya):** Setiap kelompok menyusun laporan mini hasil analisis dan mempresentasikan temuan mereka di depan kelas.
- **Fase 5 (Menganalisis & Mengevaluasi Proses Pemecahan Masalah):** Guru memberikan umpan balik konstruktif, meluruskan miskonsepsi, dan mengapresiasi partisipasi seluruh kelompok.

### 3. Kegiatan Penutup (10 - 15 Menit)
- Peserta didik bersama guru menyimpulkan poin-poin utama pembelajaran.
- **Refleksi:** Peserta didik menyampaikan apa yang telah dipahami dan hal yang masih perlu diperdalam.
- Guru memberikan tindak lanjut (tugas pengayaan/remedial) dan menginformasikan agenda pertemuan berikutnya.
- Pembelajaran ditutup dengan doa bersama dan salam penutup.

---

## IV. ASESMEN & EVALUASI

1. **Asesmen Diagnostik:** Tanya jawab lisan di awal pembelajaran untuk memetakan kesiapan belajar.
2. **Asesmen Formatif:** Observasi sikap Profil Pelajar Pancasila dan rubrik keaktifan diskusi kelompok saat KBM berlangsung.
3. **Asesmen Sumatif:** Penilaian Lembar Kerja Peserta Didik (LKPD) dan tes pemahaman konsep di akhir bab.

---

## V. PENGAYAAN & REMEDIAL
- **Pengayaan:** Diberikan kepada peserta didik dengan capaian tinggi berupa analisis literatur artikel ilmiah lanjutan.
- **Remedial:** Bimbingan tutor sebaya atau penugasan terfokus pada indikator kompetensi yang belum tuntas.

---

## VI. LAMPIRAN
- **Lembar Kerja Peserta Didik (LKPD)** terstruktur
- **Bahan Bacaan Guru dan Siswa**
- **Glosarium Istilah & Daftar Pustaka**`;
}

// Development vs Production Middlewares
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true, port: 3000 },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`[SIAGU Server] Running at http://0.0.0.0:${PORT}`);
});
