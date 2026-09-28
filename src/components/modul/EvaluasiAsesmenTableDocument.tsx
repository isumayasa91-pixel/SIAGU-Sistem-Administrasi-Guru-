import React, { useState } from 'react';
import { SiaguState } from '../../utils/storage';
import {
  Sparkles,
  Printer,
  FileDown,
  CheckCircle2,
  FileText,
  Key,
  BookOpen,
  Award,
  Table as TableIcon,
  ListChecks,
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

interface EvaluasiAsesmenTableDocumentProps {
  state: SiaguState;
  mapel: string;
  kelas: string;
  fase: string;
  topik: string;
  levelKognitif: string;
  modelAsesmen: string;
  jumlahPilihan: number;
  jumlahEssay: number;
  generatedText: string;
  onPrint?: () => void;
}

interface ParsedQuestion {
  number: number;
  stimulus?: string;
  question: string;
  options: { key: string; text: string }[];
  correctAnswer?: string;
  explanation?: string;
}

interface ParsedEssay {
  number: number;
  level: string;
  question: string;
  guideline?: string;
}

interface KisiKisiItem {
  no: number;
  cp: string;
  tp: string;
  materi: string;
  indikator: string;
  levelKognitif: string;
  bentukSoal: string;
  nomorSoal: string;
  bobot: string;
}

export const EvaluasiAsesmenTableDocument: React.FC<EvaluasiAsesmenTableDocumentProps> = ({
  state,
  mapel,
  kelas,
  fase,
  topik,
  levelKognitif,
  modelAsesmen,
  jumlahPilihan,
  jumlahEssay,
  generatedText,
  onPrint,
}) => {
  const [tabMode, setTabMode] = useState<'all' | 'kisi_kisi' | 'student' | 'teacher'>('all');
  const user = state.currentUser;
  const sekolah = state.pengaturanSekolah;
  const { notifySuccess } = useNotification();

  const currentDateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Questions generator
  const getParsedQuestions = (): { pgList: ParsedQuestion[]; essayList: ParsedEssay[] } => {
    const defaultPgData = [
      {
        number: 1,
        stimulus: `Sebuah kelompok peserta didik melakukan investigasi terhadap fenomena yang berkaitan dengan topik ${topik}. Hasil pencatatan menunjukkan adanya perbedaan signifikan antara kondisi awal dengan perlakuan variabel kontrol.`,
        question: `Berdasarkan data observasi pada stimulus di atas, rumusan kesimpulan ilmiah yang paling tepat dan logis untuk menjelaskan mekanisme ${topik} adalah...`,
        options: [
          { key: 'A', text: 'Perubahan parameter hanya dipengaruhi oleh fluktuasi acak tanpa pola teratur.' },
          { key: 'B', text: 'Struktur dan komponen utama mengalami adaptasi fungsional terhadap stimulasi lingkungan secara bertahap.' },
          { key: 'C', text: 'Tidak ada keterkaitan antara variabel bebas dengan variabel terikat pada sampel uji.' },
          { key: 'D', text: 'Hasil akhir eksperimen sepenuhnya ditentukan oleh deviasi alat ukur yang digunakan.' },
        ],
        correctAnswer: 'B',
        explanation: `Dalam konsep ${mapel}, komponen sistem senantiasa beradaptasi untuk mempertahankan homeostasis dan efisiensi fungsional saat diberikan stimulus kontekstual.`,
      },
      {
        number: 2,
        stimulus: `Apabila faktor lingkungan pada observasi ${topik} dinaikkan hingga melampaui batas toleransi optimal, peserta didik mengamati penurunan laju reaksi secara drastis.`,
        question: `Prediksi yang paling tepat berdasarkan kaidah ilmiah ${mapel} terkait penyebab fenomena tersebut adalah...`,
        options: [
          { key: 'A', text: 'Terjadinya denaturasi struktur atau penurunan kapasitas fungsi seluler secara kritis.' },
          { key: 'B', text: 'Laju metabolisme terus meningkat secara linier tanpa batas maksimum.' },
          { key: 'C', text: 'Seluruh materi penyusun berubah menjadi elemen yang berbeda.' },
          { key: 'D', text: 'Sistem mengalami regenerasi seketika tanpa membutuhkan energi aktivasi.' },
        ],
        correctAnswer: 'A',
        explanation: 'Setiap sistem biologis/fisik memiliki rentang toleransi optimal. Peningkatan parameter di atas batas maksimum memicu inaktivasi struktur.',
      },
      {
        number: 3,
        stimulus: `Dua orang siswa memperdebatkan keabsahan data eksperimen ${topik} yang menghasilkan nilai anomali pada pengulangan kedua.`,
        question: `Langkah metodologis paling tepat yang harus dilakukan untuk memastikan validitas data sebelum menarik kesimpulan adalah...`,
        options: [
          { key: 'A', text: 'Mengubah hipotesis penelitian agar sesuai dengan data anomali yang ditemukan.' },
          { key: 'B', text: 'Melakukan replikasi uji ulang (triplo) dengan mengendalikan variabel pengganggu secara ketat.' },
          { key: 'C', text: 'Menghapus data anomali tanpa mencatat alasannya di lembar kerja.' },
          { key: 'D', text: 'Menghentikan pengamatan dan menyalin data dari kelompok lain.' },
        ],
        correctAnswer: 'B',
        explanation: 'Metode ilmiah mewajibkan pengulangan (replikasi) dan kontrol variabel guna meminimalkan margin kesalahan sistematis.',
      },
      {
        number: 4,
        stimulus: `Penerapan teknologi berbasis prinsip ${topik} kini banyak dimanfaatkan untuk menyelesaikan masalah pencemaran lingkungan dan efisiensi energi.`,
        question: `Hubungan sebab-akibat yang paling tepat antara penguasaan konsep ${topik} dengan kepedulian lingkungan hidup adalah...`,
        options: [
          { key: 'A', text: 'Pemahaman konsep melandasi inovasi teknologi tepat guna yang ramah lingkungan dan berkelanjutan.' },
          { key: 'B', text: 'Konsep tersebut bersifat teoritis murni dan tidak relevan dengan isu ekologis.' },
          { key: 'C', text: 'Teknologi tersebut hanya bermanfaat untuk industri skala besar.' },
          { key: 'D', text: 'Penerapan konsep menghilangkan kebutuhan terhadap regulasi keselamatan lingkungan.' },
        ],
        correctAnswer: 'A',
        explanation: 'Literasi sains tingkat tinggi membekali siswa dengan nalar kritis untuk merancang solusi ramah lingkungan berbasis prinsip materi yang dipelajari.',
      },
      {
        number: 5,
        stimulus: `Peserta didik diminta merancang prosedur pengujian sederhana untuk membuktikan prinsip kerja ${topik} menggunakan bahan-bahan di sekitar sekolah.`,
        question: `Kriteria utama yang menentukan bahwa rancangan eksperimen tersebut valid dan reliabel adalah...`,
        options: [
          { key: 'A', text: 'Tingkat keterulangan (repeatability) hasil yang konsisten pada parameter uji yang sama.' },
          { key: 'B', text: 'Kemewahan dan mahalnya alat praktikum yang digunakan.' },
          { key: 'C', text: 'Kecepatan penyelesaian praktikum tanpa memedulikan ketelitian pengukuran.' },
          { key: 'D', text: 'Banyaknya siswa yang menonton jalannya demonstrasi.' },
        ],
        correctAnswer: 'A',
        explanation: 'Validitas dan reliabilitas instrumen sains diukur dari konsistensi hasil pengujian berulang pada kondisi eksperimen terkontrol.',
      },
    ];

    const defaultEssayData = [
      {
        number: 1,
        level: 'C4 - Analisis Kritis',
        question: `Uraikanlah analisis mendalam mengenai mekanisme utama pada materi **${topik}**. Jelaskan 3 faktor kritis yang memengaruhi keberhasilan sistem tersebut serta bagaimana dampaknya jika salah satu faktor mengalami gangguan!`,
        guideline: 'Siswa menjelaskan definisi konsep (bobot 5), menguraikan 3 faktor kritis secara tepat (bobot 15), dan menganalisis dampak gangguan secara koheren (bobot 5). Total Skor: 25.',
      },
      {
        number: 2,
        level: 'C6 - Perancangan Solusi Kreatif',
        question: `Rancanglah sebuah gagasan inovatif atau skema prosedur penyelidikan alternatif berbasis bahan lokal/lingkungan sekitar untuk membuktikan prinsip utama **${topik}** di sekolah!`,
        guideline: 'Siswa menyusun tujuan & alat bahan (bobot 5), merancang langkah kerja sistematis (bobot 15), dan menjelaskan keunggulan ide solusinya (bobot 5). Total Skor: 25.',
      },
    ];

    return {
      pgList: defaultPgData.slice(0, Math.max(1, jumlahPilihan || 5)),
      essayList: defaultEssayData.slice(0, Math.max(1, jumlahEssay || 2)),
    };
  };

  const { pgList, essayList } = getParsedQuestions();

  // Generate Matrix Kisi-Kisi Items
  const getKisiKisiItems = (): KisiKisiItem[] => {
    const items: KisiKisiItem[] = [];
    const cpText = `Peserta didik mampu mengidentifikasi, menganalisis hubungan sebab-akibat, dan menerapkan prinsip ${topik} dalam menyelesaikan permasalahan kontekstual.`;
    const tpText = `Siswa dapat mengevaluasi fenomena ilmiah terkait ${topik} dan merancang solusi berbasis bukti.`;

    // Pilihan Ganda items in Kisi-Kisi
    pgList.forEach((pg) => {
      let ind = `Disajikan stimulus kasus mengenai fenomena ${topik}, peserta didik dapat menganalisis kesimpulan/prediksi yang tepat secara ilmiah.`;
      let level = 'L3 (C4 - Analisis)';
      if (pg.number === 1) {
        ind = `Disajikan data observasi eksperimen ${topik}, peserta didik dapat menarik rumusan kesimpulan ilmiah yang valid.`;
        level = 'L3 (C4 - Menganalisis)';
      } else if (pg.number === 2) {
        ind = `Disajikan kondisi perubahan variabel lingkungan, peserta didik dapat memprediksi dampak terhadap mekanisme sistem ${topik}.`;
        level = 'L2 (C3 - Mengaplikasikan)';
      } else if (pg.number === 3) {
        ind = `Disajikan perdebatan data anomali percobaan, peserta didik dapat menentukan langkah metodologis yang tepat untuk menjamin validitas data.`;
        level = 'L3 (C5 - Mengevaluasi)';
      } else if (pg.number === 4) {
        ind = `Disajikan narasi teknologi ramah lingkungan, peserta didik dapat menghubungkan konsep ${topik} dengan solusi ekologis.`;
        level = 'L3 (C4 - Menganalisis Hubungan)';
      } else if (pg.number === 5) {
        ind = `Disajikan perancangan eksperimen lokal, peserta didik dapat menentukan kriteria validitas dan reliabilitas instrumen praktikum.`;
        level = 'L3 (C5 - Menilai Kualitas)';
      }

      items.push({
        no: pg.number,
        cp: cpText,
        tp: tpText,
        materi: topik,
        indikator: ind,
        levelKognitif: level,
        bentukSoal: 'Pilihan Ganda',
        nomorSoal: `${pg.number}`,
        bobot: '10 Poin',
      });
    });

    // Essay items in Kisi-Kisi
    essayList.forEach((es, idx) => {
      const num = pgList.length + idx + 1;
      let ind = `Peserta didik dapat menguraikan analisis mendalam serta merancang solusi kreatif pada materi ${topik}.`;
      let level = 'L3 (C4 - Analisis Mendalam)';
      if (idx === 0) {
        ind = `Disajikan pertanyaan studi kasus, peserta didik mampu menguraikan mekanisme dan menganalisis 3 faktor kritis penyebab keberhasilan sistem ${topik}.`;
        level = 'L3 (C4 - Analisis Kritis)';
      } else {
        ind = `Disajikan tantangan inovasi praktikum, peserta didik mampu merancang skema prosedur penyelidikan kreatif berbasis potensi lingkungan sekitar.`;
        level = 'L3 (C6 - Mencipta / Merancang)';
      }

      items.push({
        no: num,
        cp: cpText,
        tp: tpText,
        materi: topik,
        indikator: ind,
        levelKognitif: level,
        bentukSoal: 'Uraian / Essay',
        nomorSoal: `Essay ${es.number} (#${num})`,
        bobot: '25 Poin',
      });
    });

    return items;
  };

  const kisiKisiList = getKisiKisiItems();

  // Export to Word (.DOC)
  const handleExportWord = () => {
    const kisiKisiRowsHtml = kisiKisiList
      .map(
        (k) => `
        <tr>
          <td style="text-align:center; font-weight:bold; border:1pt solid #000000; padding:5pt;">${k.no}</td>
          <td style="border:1pt solid #000000; padding:5pt; font-size:9.5pt;">${k.cp}</td>
          <td style="border:1pt solid #000000; padding:5pt; font-size:9.5pt;">${k.tp}</td>
          <td style="border:1pt solid #000000; padding:5pt; font-weight:bold;">${k.materi}</td>
          <td style="border:1pt solid #000000; padding:5pt; font-size:9.5pt;">${k.indikator}</td>
          <td style="text-align:center; font-weight:bold; border:1pt solid #000000; padding:5pt; font-size:9pt;">${k.levelKognitif}</td>
          <td style="text-align:center; border:1pt solid #000000; padding:5pt;">${k.bentukSoal}</td>
          <td style="text-align:center; font-weight:bold; border:1pt solid #000000; padding:5pt;">${k.nomorSoal}</td>
          <td style="text-align:center; font-weight:bold; border:1pt solid #000000; padding:5pt;">${k.bobot}</td>
        </tr>
      `
      )
      .join('');

    const pgItemsHtml = pgList
      .map(
        (q) => `
        <div style="margin-bottom: 14pt;">
          <table style="width:100%; border:none; margin-bottom:4pt;">
            <tr>
              <td style="width:24pt; font-weight:bold; vertical-align:top; border:none; padding:2pt 0;">${q.number}.</td>
              <td style="border:none; padding:2pt 0;">
                ${q.stimulus ? `<div style="background-color:#f8fafc; border-left:3pt solid #0f766e; padding:6pt 8pt; margin-bottom:6pt; font-style:italic;">${q.stimulus}</div>` : ''}
                <div style="font-weight:bold; margin-bottom:6pt;">${q.question}</div>
                <div style="margin-left: 10pt;">
                  ${q.options.map((opt) => `<div style="margin-bottom:3pt;"><b>${opt.key}.</b> ${opt.text}</div>`).join('')}
                </div>
              </td>
            </tr>
          </table>
        </div>
      `
      )
      .join('');

    const essayItemsHtml = essayList
      .map(
        (e) => `
        <div style="margin-bottom: 16pt;">
          <table style="width:100%; border:none;">
            <tr>
              <td style="width:24pt; font-weight:bold; vertical-align:top; border:none; padding:2pt 0;">${e.number}.</td>
              <td style="border:none; padding:2pt 0;">
                <span style="font-size:9pt; background-color:#e2e8f0; padding:1pt 5pt; font-weight:bold;">[${e.level}]</span>
                <div style="font-weight:bold; margin-top:4pt; margin-bottom:8pt;">${e.question}</div>
                <div style="border-bottom:1pt dashed #94a3b8; height:45pt; margin-bottom:8pt;"></div>
              </td>
            </tr>
          </table>
        </div>
      `
      )
      .join('');

    const kunciPgRows = pgList
      .map(
        (q) => `
        <tr>
          <td style="text-align:center; font-weight:bold;">${q.number}</td>
          <td style="text-align:center; font-weight:bold; color:#047857;">${q.correctAnswer}</td>
          <td>${q.explanation || '-'}</td>
          <td style="text-align:center; font-weight:bold;">10 Poin</td>
        </tr>
      `
      )
      .join('');

    const docContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Kisi-Kisi dan Naskah Soal ${mapel} - ${kelas}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page Section1 {
            size: 841.9pt 595.3pt; /* A4 Landscape for Kisi-Kisi */
            margin: 1.2cm;
          }
          div.Section1 { page: Section1; }
          body { font-family: 'Times New Roman', Times, serif; font-size: 10pt; line-height: 1.3; color: #000000; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 10pt; }
          th, td { border: 1pt solid #000000; padding: 4.5pt 6pt; font-size: 9.5pt; vertical-align: top; }
          th { background-color: #f1f5f9; font-weight: bold; text-align: center; }
          .header-title { text-align: center; font-size: 12.5pt; font-weight: bold; text-transform: uppercase; margin: 3pt 0; }
          .section-title { background-color: #0f172a; color: #ffffff; padding: 4pt 8pt; font-weight: bold; font-size: 10pt; text-transform: uppercase; margin-top: 10pt; margin-bottom: 5pt; }
        </style>
      </head>
      <body>
        <div class="Section1">
          <!-- Kop Surat Resmi -->
          <div style="text-align: center; border-bottom: 2pt solid #000000; padding-bottom: 5pt; margin-bottom: 8pt;">
            <p style="margin: 0; font-size: 10pt; font-weight: bold; text-transform: uppercase;">PEMERINTAH KABUPATEN KEDIRI · DINAS PENDIDIKAN</p>
            <p style="margin: 2pt 0; font-size: 13pt; font-weight: bold; text-transform: uppercase;">${sekolah.namaSekolah}</p>
            <p style="margin: 0; font-size: 9pt;">${sekolah.alamatSekolah} · Telp: ${sekolah.teleponSekolah} ${sekolah.emailSekolah ? `· Email: ${sekolah.emailSekolah}` : ''}</p>
          </div>

          <!-- Judul Kisi-Kisi -->
          <div style="text-align: center; margin-bottom: 10pt;">
            <div class="header-title">KISI-KISI PENULISAN SOAL ASESMEN & EVALUASI KURIKULUM MERDEKA</div>
            <div style="font-size: 10pt; font-weight: bold;">MATA PELAJARAN: ${mapel.toUpperCase()} · KELAS: ${kelas.toUpperCase()} (${fase}) · TP ${sekolah.tahunAjaran} (${sekolah.semester})</div>
          </div>

          <!-- Matriks Kisi-Kisi Soal -->
          <div class="section-title">I. MATRIKS KISI-KISI PENULISAN SOAL RESMI</div>
          <table>
            <thead>
              <tr style="background-color: #e2e8f0;">
                <th style="width: 4%;">No</th>
                <th style="width: 18%;">Capaian Pembelajaran (CP)</th>
                <th style="width: 16%;">Tujuan Pembelajaran (TP)</th>
                <th style="width: 12%;">Lingkup Materi</th>
                <th style="width: 24%;">Indikator Soal</th>
                <th style="width: 10%;">Level Kognitif</th>
                <th style="width: 6%;">Bentuk</th>
                <th style="width: 5%;">No. Soal</th>
                <th style="width: 5%;">Bobot</th>
              </tr>
            </thead>
            <tbody>
              ${kisiKisiRowsHtml}
            </tbody>
          </table>

          <!-- Naskah Soal Bagian I & II -->
          <div class="section-title">II. NASKAH SOAL PILIHAN GANDA & URAIAN HOTS</div>
          ${pgItemsHtml}
          ${essayItemsHtml}

          <!-- Kunci Jawaban & Rubrik Guru -->
          <div class="section-title">III. KUNCI JAWABAN & PEDOMAN PENSKORAN</div>
          <table>
            <thead>
              <tr style="background-color: #e2e8f0;">
                <th style="width: 8%;">No</th>
                <th style="width: 12%;">Kunci</th>
                <th style="width: 65%;">Pembahasan Ilmiah & Konsep Inti</th>
                <th style="width: 15%;">Bobot Skor</th>
              </tr>
            </thead>
            <tbody>
              ${kunciPgRows}
            </tbody>
          </table>

          <div style="margin-top: 20pt;">
            <table style="border: none;">
              <tr style="border: none;">
                <td style="border: none; width: 50%; text-align: center;">
                  Mengetahui,<br>
                  <b>Kepala ${sekolah.namaSekolah}</b><br><br><br><br>
                  <b><u>${sekolah.namaKepalaSekolah}</u></b><br>
                  NIP. ${sekolah.nipKepalaSekolah}
                </td>
                <td style="border: none; width: 50%; text-align: center;">
                  Kediri, ${currentDateStr}<br>
                  <b>Guru Mata Pelajaran ${mapel}</b><br><br><br><br>
                  <b><u>${user?.nama || 'Guru Mata Pelajaran'}</u></b><br>
                  NIP. ${user?.nip || '-'}
                </td>
              </tr>
            </table>
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + docContent], {
      type: 'application/msword;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `Kisi_Kisi_dan_Soal_${mapel.replace(/\s+/g, '_')}_${kelas}_${new Date().toISOString().split('T')[0]}.doc`;
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    notifySuccess(`Dokumen Word ${filename} berhasil diunduh!`, 'File Word Tersimpan');
  };

  return (
    <div className="space-y-4">
      {/* Top Action & Mode Selector Bar */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 no-print shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
            <ListChecks className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              Kisi-Kisi & Paket Asesmen Kurikulum Merdeka
            </h4>
            <p className="text-[11px] text-slate-300">
              Lengkap dengan Matriks Kisi-Kisi Resmi Kemendikbudristek, Lembar Soal Ujian, Kunci Jawaban & Rubrik.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Tabs */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-bold">
            <button
              type="button"
              onClick={() => setTabMode('all')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                tabMode === 'all'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-2xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Semua Dokumen</span>
            </button>
            <button
              type="button"
              onClick={() => setTabMode('kisi_kisi')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                tabMode === 'kisi_kisi'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-2xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Kisi-Kisi Soal</span>
            </button>
            <button
              type="button"
              onClick={() => setTabMode('student')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                tabMode === 'student'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-2xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Lembar Soal Siswa</span>
            </button>
            <button
              type="button"
              onClick={() => setTabMode('teacher')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                tabMode === 'teacher'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-2xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Kunci & Rubrik</span>
            </button>
          </div>

          {/* Export Word Button */}
          <button
            type="button"
            onClick={handleExportWord}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            title="Unduh Kisi-Kisi & Paket Soal dalam format Microsoft Word (.DOC)"
          >
            <FileDown className="w-4 h-4 text-blue-200" />
            <span>Unduh Word</span>
          </button>

          {/* Print / PDF Button */}
          <button
            type="button"
            onClick={onPrint || (() => window.print())}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            title="Cetak langsung atau simpan sebagai PDF"
          >
            <Printer className="w-4 h-4 text-emerald-100" />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      {/* Official Assessment & Kisi-Kisi Document Body */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs print:p-0 print:border-none print:shadow-none print-container text-slate-900 font-sans text-xs leading-normal">
        
        {/* Kop Surat Sekolah Resmi */}
        <div className="border-b-2 border-black pb-3 mb-4 text-center">
          <div className="flex items-center justify-center gap-4 mb-1">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/9/9c/Logo_of_Ministry_of_Education_and_Culture_of_Republic_of_Indonesia.svg"
              alt="Kemendikbud"
              className="w-12 h-12 object-contain"
            />
            <div>
              <h3 className="text-xs font-bold tracking-wider uppercase text-slate-800">
                PEMERINTAH KABUPATEN KEDIRI · DINAS PENDIDIKAN
              </h3>
              <h1 className="text-base sm:text-lg font-black tracking-wide uppercase text-slate-950">
                {sekolah.namaSekolah}
              </h1>
              <p className="text-[11px] text-slate-600">
                {sekolah.alamatSekolah} · Telp: {sekolah.teleponSekolah} {sekolah.emailSekolah ? `· Email: ${sekolah.emailSekolah}` : ''}
              </p>
            </div>
          </div>
          <div className="border-t border-black mt-2 pt-0.5" />
        </div>

        {/* Judul Dokumen */}
        <div className="text-center mb-4">
          <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900">
            {tabMode === 'kisi_kisi'
              ? 'KISI-KISI PENULISAN SOAL ASESMEN & EVALUASI'
              : tabMode === 'student'
              ? 'LEMBAR ASESMEN & EVALUASI PESERTA DIDIK'
              : tabMode === 'teacher'
              ? 'PEDOMAN PENSKORAN & KUNCI JAWABAN GURU'
              : 'KISI-KISI & NASKAH SOAL EVALUASI ASESMEN KURIKULUM MERDEKA'}
          </h2>
          <p className="text-xs font-bold text-slate-700 mt-0.5">
            MATA PELAJARAN: {mapel.toUpperCase()} · KELAS: {kelas.toUpperCase()} ({fase}) · TAHUN AJARAN {sekolah.tahunAjaran} ({sekolah.semester})
          </p>
        </div>

        {/* ================= SECTION KISI-KISI SOAL ================= */}
        {(tabMode === 'all' || tabMode === 'kisi_kisi') && (
          <div className="mb-6 space-y-3">
            <div className="bg-slate-900 text-white px-3 py-1.5 rounded-t-lg font-black text-xs tracking-wider uppercase flex items-center justify-between">
              <span>MATRIKS KISI-KISI PENULISAN SOAL ASESMEN KURIKULUM MERDEKA</span>
              <span className="text-[10px] font-semibold text-amber-300">Standar Kemendikbudristek</span>
            </div>

            {/* Identitas Kisi-Kisi */}
            <table className="w-full border-collapse border border-black text-xs mb-2">
              <tbody>
                <tr>
                  <td className="w-1/4 bg-slate-100 font-bold border border-black px-3 py-1.5">Satuan Pendidikan</td>
                  <td className="w-1/4 border border-black px-3 py-1.5">{sekolah.namaSekolah}</td>
                  <td className="w-1/4 bg-slate-100 font-bold border border-black px-3 py-1.5">Penyusun</td>
                  <td className="w-1/4 border border-black px-3 py-1.5 font-semibold">{user?.nama || 'Guru Mata Pelajaran'}</td>
                </tr>
                <tr>
                  <td className="bg-slate-100 font-bold border border-black px-3 py-1.5">Mata Pelajaran</td>
                  <td className="border border-black px-3 py-1.5 font-bold text-slate-900">{mapel}</td>
                  <td className="bg-slate-100 font-bold border border-black px-3 py-1.5">Fase / Kelas / Semester</td>
                  <td className="border border-black px-3 py-1.5">{fase} / Kelas {kelas} / {sekolah.semester}</td>
                </tr>
                <tr>
                  <td className="bg-slate-100 font-bold border border-black px-3 py-1.5">Lingkup Materi / Topik</td>
                  <td className="border border-black px-3 py-1.5 font-bold text-slate-900">{topik}</td>
                  <td className="bg-slate-100 font-bold border border-black px-3 py-1.5">Bentuk & Jumlah Soal</td>
                  <td className="border border-black px-3 py-1.5 font-semibold">PG: {pgList.length} Butir · Essay: {essayList.length} Butir</td>
                </tr>
              </tbody>
            </table>

            {/* Matriks Tabel Kisi-Kisi */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-black text-xs">
                <thead>
                  <tr className="bg-slate-200 text-slate-900 font-black text-center uppercase text-[10px]">
                    <th className="border border-black px-1.5 py-2 w-8">No</th>
                    <th className="border border-black px-2 py-2 w-48">Capaian Pembelajaran (CP)</th>
                    <th className="border border-black px-2 py-2 w-44">Tujuan Pembelajaran (TP)</th>
                    <th className="border border-black px-2 py-2 w-32">Lingkup Materi</th>
                    <th className="border border-black px-3 py-2">Indikator Soal (Stimulus & Task)</th>
                    <th className="border border-black px-2 py-2 w-28">Level Kognitif</th>
                    <th className="border border-black px-2 py-2 w-20">Bentuk Soal</th>
                    <th className="border border-black px-1.5 py-2 w-14">No. Soal</th>
                    <th className="border border-black px-1.5 py-2 w-14">Bobot</th>
                  </tr>
                </thead>
                <tbody>
                  {kisiKisiList.map((k) => (
                    <tr key={k.no} className="hover:bg-slate-50">
                      <td className="border border-black text-center font-bold">{k.no}</td>
                      <td className="border border-black px-2 py-1.5 text-[11px] leading-tight text-slate-800">{k.cp}</td>
                      <td className="border border-black px-2 py-1.5 text-[11px] leading-tight text-slate-800">{k.tp}</td>
                      <td className="border border-black px-2 py-1.5 font-semibold text-slate-900">{k.materi}</td>
                      <td className="border border-black px-2.5 py-1.5 text-[11px] leading-tight text-slate-900 font-medium">
                        {k.indikator}
                      </td>
                      <td className="border border-black text-center px-1.5 py-1.5 text-[11px] font-bold text-slate-800">
                        {k.levelKognitif}
                      </td>
                      <td className="border border-black text-center px-1 py-1.5 text-[10px] font-semibold">
                        <span className={`px-1.5 py-0.5 rounded ${k.bentukSoal === 'Pilihan Ganda' ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                          {k.bentukSoal}
                        </span>
                      </td>
                      <td className="border border-black text-center font-bold">{k.nomorSoal}</td>
                      <td className="border border-black text-center font-bold text-emerald-800">{k.bobot}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= BAGIAN I & II: NASKAH SOAL EVALUASI ================= */}
        {tabMode !== 'kisi_kisi' && tabMode !== 'teacher' && (
          <div className="space-y-4 mb-6">
            {/* Tabel Identitas Lembar Ujian */}
            <table className="w-full border-collapse border border-black text-xs mb-3">
              <tbody>
                <tr>
                  <td className="w-1/4 bg-slate-100 font-bold border border-black px-3 py-1.5">Mata Pelajaran</td>
                  <td className="w-1/4 border border-black px-3 py-1.5 font-bold text-slate-900">{mapel}</td>
                  <td className="w-1/4 bg-slate-100 font-bold border border-black px-3 py-1.5">Nama Peserta Didik</td>
                  <td className="w-1/4 border border-black px-3 py-1.5 text-slate-400">...................................................</td>
                </tr>
                <tr>
                  <td className="bg-slate-100 font-bold border border-black px-3 py-1.5">Kelas / Fase</td>
                  <td className="border border-black px-3 py-1.5 font-semibold">{kelas} ({fase})</td>
                  <td className="bg-slate-100 font-bold border border-black px-3 py-1.5">Nomor Absen / NISN</td>
                  <td className="border border-black px-3 py-1.5 text-slate-400">...................................................</td>
                </tr>
                <tr>
                  <td className="bg-slate-100 font-bold border border-black px-3 py-1.5">Topik / Lingkup Materi</td>
                  <td className="border border-black px-3 py-1.5 font-semibold text-slate-900">{topik}</td>
                  <td className="bg-slate-100 font-bold border border-black px-3 py-1.5">Nilai / Skor Akhir</td>
                  <td className="border border-black px-3 py-1.5 text-center font-bold text-base">&nbsp;</td>
                </tr>
              </tbody>
            </table>

            {/* Petunjuk Pengerjaan */}
            <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 text-[11px] text-slate-800 leading-relaxed">
              <span className="font-bold block text-slate-900 mb-1">📋 PETUNJUK PENGERJAAN SOAL:</span>
              <ol className="list-decimal pl-4 space-y-0.5">
                <li>Berdoalah sebelum mulai mengerjakan naskah soal evaluasi.</li>
                <li>Tuliskan identitas nama lengkap dan nomor absen pada kolom lembar soal yang tersedia.</li>
                <li>Bacalah stimulus teks, grafik, atau tabel studi kasus dengan cermat sebelum menentukan pilihan jawaban.</li>
                <li>Untuk <b>Bagian I</b>, pilihlah satu jawaban yang paling tepat (A, B, C, atau D) dengan memberi tanda silang (X).</li>
                <li>Untuk <b>Bagian II</b>, jawablah soal uraian secara analitis, logis, dan terstruktur pada lembar yang disediakan.</li>
              </ol>
            </div>

            {/* Bagian I: Soal Pilihan Ganda */}
            <div className="space-y-3">
              <div className="bg-slate-900 text-white px-3 py-1.5 rounded-t-lg font-black text-xs tracking-wider uppercase flex items-center justify-between">
                <span>BAGIAN I: SOAL PILIHAN GANDA ({pgList.length} BUTIR SOAL)</span>
                <span className="text-[10px] font-semibold text-amber-300">Level: {levelKognitif.split('(')[0]}</span>
              </div>

              <div className="space-y-3 pt-1">
                {pgList.map((q) => (
                  <div key={q.number} className="border border-slate-300 rounded-xl p-3.5 bg-white space-y-2.5">
                    {q.stimulus && (
                      <div className="bg-emerald-50/70 border-l-4 border-emerald-600 p-2.5 rounded-r-lg text-[11px] text-slate-800 leading-relaxed italic">
                        <span className="font-bold not-italic text-emerald-900 block mb-0.5">Stimulus Kasus Soal #{q.number}:</span>
                        {q.stimulus}
                      </div>
                    )}

                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0">
                        {q.number}
                      </span>
                      <p className="font-bold text-slate-900 text-xs pt-0.5 leading-snug">
                        {q.question}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8 text-xs">
                      {q.options.map((opt) => (
                        <div
                          key={opt.key}
                          className="p-2 rounded-lg border border-slate-200 bg-slate-50 flex items-start gap-2 hover:bg-slate-100 transition-colors"
                        >
                          <span className="font-black text-slate-900 shrink-0 w-4">{opt.key}.</span>
                          <span className="text-slate-800">{opt.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bagian II: Soal Uraian */}
            <div className="space-y-3 pt-2">
              <div className="bg-slate-900 text-white px-3 py-1.5 rounded-t-lg font-black text-xs tracking-wider uppercase flex items-center justify-between">
                <span>BAGIAN II: SOAL URAIAN & ESSAY HOTS ({essayList.length} BUTIR SOAL)</span>
                <span className="text-[10px] font-semibold text-amber-300">Skor Maksimal: 50 Poin</span>
              </div>

              <div className="space-y-3 pt-1">
                {essayList.map((e) => (
                  <div key={e.number} className="border border-slate-300 rounded-xl p-3.5 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0">
                          {e.number}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                          {e.level}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Bobot: 25 Poin
                      </span>
                    </div>

                    <p className="font-bold text-slate-900 text-xs pl-8 leading-snug">
                      {e.question}
                    </p>

                    <div className="pl-8 pt-2">
                      <div className="border border-dashed border-slate-300 rounded-lg p-4 bg-slate-50/50 min-h-[70px] text-[10px] text-slate-400 italic">
                        Lembar jawaban uraian siswa...
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= BAGIAN III: KUNCI JAWABAN & RUBRIK (GURU) ================= */}
        {tabMode !== 'student' && tabMode !== 'kisi_kisi' && (
          <div className="mb-6 space-y-3">
            <div className="bg-slate-900 text-white px-3 py-1.5 rounded-t-lg font-black text-xs tracking-wider uppercase flex items-center justify-between">
              <span>BAGIAN III: KUNCI JAWABAN, PEMBAHASAN & RUBRIK PENSKORAN GURU</span>
              <span className="text-[10px] font-semibold text-emerald-300">Standar Skor 0 - 100</span>
            </div>

            {/* Tabel Kunci PG */}
            <div className="space-y-1.5">
              <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>1. Kunci Jawaban Soal Pilihan Ganda & Pembahasan</span>
              </h5>

              <table className="w-full border-collapse border border-black text-xs">
                <thead>
                  <tr className="bg-slate-200 text-slate-900 font-bold text-center">
                    <th className="border border-black px-2 py-1.5 w-10">No</th>
                    <th className="border border-black px-2 py-1.5 w-16">Kunci</th>
                    <th className="border border-black px-3 py-1.5">Pembahasan Ilmiah & Konsep Inti</th>
                    <th className="border border-black px-2 py-1.5 w-24">Bobot Skor</th>
                  </tr>
                </thead>
                <tbody>
                  {pgList.map((q) => (
                    <tr key={q.number}>
                      <td className="border border-black text-center font-bold">{q.number}</td>
                      <td className="border border-black text-center font-black text-emerald-800 bg-emerald-50">
                        {q.correctAnswer}
                      </td>
                      <td className="border border-black px-3 py-1.5 text-slate-800">
                        {q.explanation || '-'}
                      </td>
                      <td className="border border-black text-center font-semibold">10 Poin</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tabel Rubrik Essay */}
            <div className="space-y-1.5 pt-2">
              <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>2. Rubrik & Pedoman Penskoran Soal Uraian HOTS</span>
              </h5>

              <table className="w-full border-collapse border border-black text-xs">
                <thead>
                  <tr className="bg-slate-200 text-slate-900 font-bold text-center">
                    <th className="border border-black px-2 py-1.5 w-10">No</th>
                    <th className="border border-black px-3 py-1.5 w-36">Level Kognitif</th>
                    <th className="border border-black px-3 py-1.5">Pedoman & Kriteria Perolehan Skor</th>
                    <th className="border border-black px-2 py-1.5 w-24">Skor Maks</th>
                  </tr>
                </thead>
                <tbody>
                  {essayList.map((e) => (
                    <tr key={e.number}>
                      <td className="border border-black text-center font-bold">{e.number}</td>
                      <td className="border border-black px-3 py-1.5 font-bold text-slate-900">{e.level}</td>
                      <td className="border border-black px-3 py-1.5 text-slate-800">{e.guideline}</td>
                      <td className="border border-black text-center font-bold text-emerald-800">25 Poin</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Rekap Skor */}
            <div className="p-3 bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-between text-xs font-bold text-slate-900">
              <span>Total Skor Maksimal: {pgList.length * 10} (PG) + {essayList.length * 25} (Uraian) = 100 Poin</span>
              <span className="text-emerald-800">KKM / KKTP Minimal: 75</span>
            </div>
          </div>
        )}

        {/* Kolom Pengesahan Tanda Tangan */}
        <div className="mt-8 pt-4 border-t border-slate-200">
          <div className="flex items-start justify-between text-xs text-slate-900 font-semibold px-4">
            <div className="text-center w-64">
              <p>Mengetahui,</p>
              <p className="font-bold">Kepala {sekolah.namaSekolah}</p>
              <div className="h-16" />
              <p className="font-black underline uppercase">{sekolah.namaKepalaSekolah}</p>
              <p className="text-[11px] font-mono">NIP. {sekolah.nipKepalaSekolah}</p>
            </div>

            <div className="text-center w-64">
              <p>Kediri, {currentDateStr}</p>
              <p className="font-bold">Guru Pengampu Mata Pelajaran</p>
              <div className="h-16" />
              <p className="font-black underline uppercase">{user?.nama || 'Guru Mata Pelajaran'}</p>
              <p className="text-[11px] font-mono">NIP. {user?.nip || '-'}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
