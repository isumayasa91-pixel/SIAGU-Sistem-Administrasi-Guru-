import React from 'react';
import { SiaguState } from '../../utils/storage';
import { Sparkles, Printer, CheckCircle2, FileDown, FileText } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

interface ModulAjarTableDocumentProps {
  state: SiaguState;
  mapel: string;
  fase: string;
  kelas: string;
  topik: string;
  model: string;
  alokasi: string;
  dimensiList: string[];
  tujuan: string;
  generatedText: string;
  onPrint?: () => void;
}

export const ModulAjarTableDocument: React.FC<ModulAjarTableDocumentProps> = ({
  state,
  mapel,
  fase,
  kelas,
  topik,
  model,
  alokasi,
  dimensiList,
  tujuan,
  generatedText,
  onPrint,
}) => {
  const user = state.currentUser;
  const sekolah = state.pengaturanSekolah;
  const { notifySuccess } = useNotification();

  const currentDateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Synthesizing realistic activities based on model
  const getActivityPhases = () => {
    if (model.includes('PBL') || model.includes('Problem')) {
      return [
        {
          fase: 'Fase 1: Orientasi Peserta Didik pada Masalah',
          guru: `Guru menyajikan fenomena/kasus kontekstual terkait topik ${topik} melalui gambar/video pemantik dan membimbing siswa merumuskan pertanyaan penyelidikan.`,
          siswa: 'Peserta didik mencermati stimulus masalah, mengajukan tanggapan awal, dan mencatat fokus permasalahan yang akan diinvestigasi.',
          karakter: 'Penalaran Kritis, Keimanan & Ketaqwaan',
          waktu: '10 Menit',
        },
        {
          fase: 'Fase 2: Mengorganisasikan Peserta Didik untuk Belajar',
          guru: 'Guru membagi kelas ke dalam kelompok heterogen (4-5 siswa), membagikan Lembar Kerja Peserta Didik (LKPD), dan menjelaskan petunjuk kerja.',
          siswa: 'Peserta didik berkumpul bersama kelompok, membagi peran dan tanggung jawab tugas, serta membaca panduan investigasi LKPD.',
          karakter: 'Kolaborasi, Kewargaan, Komunikasi',
          waktu: '10 Menit',
        },
        {
          fase: 'Fase 3: Membimbing Penyelidikan Mandiri & Kelompok',
          guru: `Guru memfasilitasi jalannya eksperimen/eksplorasi data mengenai ${topik}, memonitor keterlibatan siswa, dan memberikan bimbingan bagi kelompok yang kesulitan.`,
          siswa: 'Peserta didik melakukan pengumpulan data, pengamatan objek, dan menganalisis hubungan sebab-akibat bersama anggota kelompok.',
          karakter: 'Kemandirian, Penalaran Kritis, Kesehatan',
          waktu: '20 Menit',
        },
        {
          fase: 'Fase 4: Mengembangkan dan Menyajikan Hasil Karya',
          guru: 'Guru mengarahkan setiap kelompok menyusun laporan mini hasil diskusi LKPD dan memfasilitasi presentasi kelompok di depan kelas.',
          siswa: 'Peserta didik menyusun kesimpulan kelompok secara kreatif, mempresentasikan hasil kerja, dan menanggapi pertanyaan kelompok lain.',
          karakter: 'Kreativitas, Komunikasi, Kolaborasi',
          waktu: '15 Menit',
        },
        {
          fase: 'Fase 5: Menganalisis & Mengevaluasi Proses Pemecahan Masalah',
          guru: 'Guru memberikan penguatan materi, mengklarifikasi miskonsepsi, dan memberikan apresiasi terhadap proses kerja seluruh kelompok.',
          siswa: 'Peserta didik merefleksikan proses penyelidikan yang telah dilakukan dan menarik simpulan konsep umum yang telah dipelajari.',
          karakter: 'Penalaran Kritis, Kemandirian',
          waktu: '10 Menit',
        },
      ];
    }

    if (model.includes('Project') || model.includes('PjBL')) {
      return [
        {
          fase: 'Fase 1: Penentuan Pertanyaan Mendasar',
          guru: `Guru menstimulasi siswa dengan proyek nyata berbasis topik ${topik} dan membimbing penentuan pertanyaan pengarah proyek.`,
          siswa: 'Peserta didik mendiskusikan tantangan proyek dan merumuskan ide produk yang akan dihasilkan.',
          karakter: 'Kreativitas, Penalaran Kritis',
          waktu: '15 Menit',
        },
        {
          fase: 'Fase 2: Mendesain Perencanaan Proyek',
          guru: 'Guru membimbing siswa merancang tahapan proyek, pembagian peran kelompok, serta pemilihan alat dan bahan praktikum.',
          siswa: 'Peserta didik menyusun proposal mini desain produk dan rencana kerja kelompok.',
          karakter: 'Kolaborasi, Kemandirian, Komunikasi',
          waktu: '15 Menit',
        },
        {
          fase: 'Fase 3: Menyusun Jadwal Pembuatan Proyek',
          guru: 'Guru menyepakati batas waktu (timeline) dan tahapan penyelesaian proyek bersama peserta didik.',
          siswa: 'Peserta didik mengorganisasikan jadwal kerja dan tahapan uji coba produk.',
          karakter: 'Kemandirian, Kolaborasi',
          waktu: '10 Menit',
        },
        {
          fase: 'Fase 4: Memonitor Keaktifan & Perkembangan Proyek',
          guru: 'Guru memantau progres pembuatan proyek kelompok dan memberikan arahan teknis.',
          siswa: 'Peserta didik melaksanakan pembuatan produk dan mencatat kendala yang dihadapi.',
          karakter: 'Penalaran Kritis, Kesehatan',
          waktu: '15 Menit',
        },
        {
          fase: 'Fase 5: Menguji Hasil & Evaluasi Pengalaman',
          guru: 'Guru menilai kelayakan produk kelompok dan memandu sesi gelar karya / refleksi proyek.',
          siswa: 'Peserta didik memamerkan karya, melakukan uji fungsi produk, dan mengevaluasi pengalaman belajar.',
          karakter: 'Kreativitas, Komunikasi, Keimanan',
          waktu: '10 Menit',
        },
      ];
    }

    // Default / Discovery / Inquiry
    return [
      {
        fase: 'Fase 1: Pemberian Rangsangan (Stimulation)',
        guru: `Guru memberikan stimulus fenomena menarik terkait ${topik} untuk memancing rasa ingin tahu peserta didik.`,
        siswa: 'Peserta didik mengamati demonstrasi/media dan merespons pertanyaan awal dari guru.',
        karakter: 'Keimanan & Ketaqwaan, Penalaran Kritis',
        waktu: '10 Menit',
      },
      {
        fase: 'Fase 2: Identifikasi Masalah (Problem Statement)',
        guru: 'Guru membimbing peserta didik merumuskan hipotesis dan pertanyaan investigasi terkait materi.',
        siswa: 'Peserta didik menentukan hipotesis kerja dalam kelompok belajar.',
        karakter: 'Penalaran Kritis, Kolaborasi',
        waktu: '10 Menit',
      },
      {
        fase: 'Fase 3: Pengumpulan Data (Data Collection)',
        guru: 'Guru memfasilitasi lembar observasi dan bahan eksplorasi bagi tiap kelompok.',
        siswa: 'Peserta didik mengumpulkan informasi dari buku teks, pengamatan sampel, dan sumber belajar.',
        karakter: 'Kemandirian, Kolaborasi, Kesehatan',
        waktu: '20 Menit',
      },
      {
        fase: 'Fase 4: Pengolahan Data (Data Processing)',
        guru: 'Guru memonitor keaktifan diskusi kelompok saat menganalisis data temuan.',
        siswa: 'Peserta didik mendiskusikan data hasil observasi dan menyusun laporan kelompok.',
        karakter: 'Kreativitas, Komunikasi',
        waktu: '15 Menit',
      },
      {
        fase: 'Fase 5: Pembuktian & Menarik Kesimpulan (Generalization)',
        guru: 'Guru membimbing presentasi kelas dan menyimpulkan konsep bersama seluruh siswa.',
        siswa: 'Peserta didik mempresentasikan hasil temuan dan merumuskan kesimpulan akhir.',
        karakter: 'Komunikasi, Penalaran Kritis, Kewargaan',
        waktu: '10 Menit',
      },
    ];
  };

  const activityPhases = getActivityPhases();

  // Export to Microsoft Word (.DOC)
  const handleExportWord = () => {
    const tableActivityRowsHtml = activityPhases
      .map(
        (p, idx) => `
        <tr>
          <td style="text-align:center; font-weight:bold; border:1pt solid #000000; padding:6pt;">${idx + 2}</td>
          <td style="font-weight:bold; border:1pt solid #000000; padding:6pt;">${p.fase}</td>
          <td style="border:1pt solid #000000; padding:6pt;">
            <p style="margin:0 0 4pt 0;"><b>Guru:</b> ${p.guru}</p>
            <p style="margin:0;"><b>Siswa:</b> ${p.siswa}</p>
          </td>
          <td style="border:1pt solid #000000; padding:6pt;">${p.karakter}</td>
          <td style="text-align:center; font-weight:bold; border:1pt solid #000000; padding:6pt;">${p.waktu}</td>
        </tr>
      `
      )
      .join('');

    const dimensiBadgesHtml = dimensiList
      .map(
        (d) =>
          `<span style="display:inline-block; background-color:#f1f5f9; border:1pt solid #cbd5e1; padding:2pt 6pt; margin:2pt; font-weight:bold; font-size:9.5pt;">✓ ${d}</span>`
      )
      .join(' ');

    const docContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Modul Ajar ${mapel} - ${kelas}</title>
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
            size: 595.3pt 841.9pt; /* A4 */
            margin: 1.5cm 1.5cm 1.5cm 1.5cm;
            mso-header-margin: 35.4pt;
            mso-footer-margin: 35.4pt;
            mso-paper-source: 0;
          }
          div.Section1 { page: Section1; }
          body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.35; color: #000000; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 12pt; }
          th, td { border: 1pt solid #000000; padding: 5pt 7pt; font-size: 10pt; vertical-align: top; }
          th { background-color: #f1f5f9; font-weight: bold; text-align: center; }
          .header-title { text-align: center; font-size: 13pt; font-weight: bold; text-transform: uppercase; margin: 4pt 0; }
          .section-title { background-color: #0f172a; color: #ffffff; padding: 4pt 8pt; font-weight: bold; font-size: 10.5pt; text-transform: uppercase; margin-top: 12pt; margin-bottom: 4pt; }
          .bg-label { background-color: #f8fafc; font-weight: bold; width: 25%; }
        </style>
      </head>
      <body>
        <div class="Section1">
          <!-- Kop Surat Resmi -->
          <div style="text-align: center; border-bottom: 2pt solid #000000; padding-bottom: 6pt; margin-bottom: 10pt;">
            <p style="margin: 0; font-size: 10pt; font-weight: bold; text-transform: uppercase;">PEMERINTAH KABUPATEN KEDIRI · DINAS PENDIDIKAN</p>
            <p style="margin: 2pt 0; font-size: 14pt; font-weight: bold; text-transform: uppercase;">${sekolah.namaSekolah}</p>
            <p style="margin: 0; font-size: 9.5pt;">${sekolah.alamatSekolah} · Telp: ${sekolah.teleponSekolah} ${sekolah.emailSekolah ? `· Email: ${sekolah.emailSekolah}` : ''}</p>
          </div>

          <!-- Judul Dokumen -->
          <div style="text-align: center; margin-bottom: 14pt;">
            <div class="header-title">MODUL AJAR KURIKULUM MERDEKA</div>
            <div style="font-size: 10.5pt; font-weight: bold;">MATA PELAJARAN: ${mapel.toUpperCase()} · TAHUN PELAJARAN ${sekolah.tahunAjaran} (${sekolah.semester})</div>
          </div>

          <!-- Section 1: Informasi Umum -->
          <div class="section-title">I. INFORMASI UMUM & IDENTITAS MODUL</div>
          <table>
            <tr>
              <td class="bg-label">Nama Penyusun</td>
              <td style="width: 25%; font-weight: bold;">${user?.nama || 'Guru Mata Pelajaran'}</td>
              <td class="bg-label">Satuan Pendidikan</td>
              <td style="width: 25%;">${sekolah.namaSekolah}</td>
            </tr>
            <tr>
              <td class="bg-label">Mata Pelajaran</td>
              <td style="font-weight: bold;">${mapel}</td>
              <td class="bg-label">Fase / Kelas / Semester</td>
              <td>${fase} / Kelas ${kelas} / ${sekolah.semester}</td>
            </tr>
            <tr>
              <td class="bg-label">Topik / Lingkup Materi</td>
              <td colspan="3" style="font-weight: bold;">${topik}</td>
            </tr>
            <tr>
              <td class="bg-label">Alokasi Waktu</td>
              <td>${alokasi}</td>
              <td class="bg-label">Model Pembelajaran</td>
              <td style="font-weight: bold;">${model}</td>
            </tr>
            <tr>
              <td class="bg-label">Target Peserta Didik</td>
              <td colspan="3">Peserta didik reguler/tipikal: umum, tidak ada kesulitan dalam mencerna dan memahami materi ajar.</td>
            </tr>
            <tr>
              <td class="bg-label">Dimensi Profil Lulusan & Karakter</td>
              <td colspan="3">${dimensiBadgesHtml}</td>
            </tr>
            <tr>
              <td class="bg-label">Sarana & Prasarana</td>
              <td colspan="3">Lembar Kerja Peserta Didik (LKPD), Papan Tulis, LCD Proyektor, Alat Praktikum Kontekstual, Buku Panduan Guru & Siswa Kemendikbudristek.</td>
            </tr>
          </table>

          <!-- Section 2: Komponen Inti -->
          <div class="section-title">II. KOMPONEN INTI PEMBELAJARAN</div>
          <table>
            <tr>
              <td class="bg-label">Tujuan Pembelajaran (TP)</td>
              <td colspan="2">${tujuan}</td>
            </tr>
            <tr>
              <td class="bg-label">Pemahaman Bermakna</td>
              <td colspan="2">Peserta didik memahami bahwa penguasaan konsep <b>${topik}</b> sangat esensial dalam memecahkan permasalahan nyata dalam kehidupan sehari-hari serta menumbuhkan nalar ilmiah yang berkelanjutan.</td>
            </tr>
            <tr>
              <td class="bg-label">Pertanyaan Pemantik</td>
              <td colspan="2">
                1. Mengapa kita perlu mempelajari konsep ${topik} dalam kehidupan sehari-hari?<br>
                2. Bagaimana cara membuktikan kebenaran fenomena tersebut melalui pengamatan langsung?<br>
                3. Apa solusi kreatif yang dapat kita rancang jika terjadi ketidaksesuaian pada hasil eksperimen?
              </td>
            </tr>
          </table>

          <!-- Section 3: Matriks Kegiatan KBM -->
          <div class="section-title">III. MATRIKS KEGIATAN PEMBELAJARAN (SINTAKS KBM)</div>
          <table>
            <thead>
              <tr style="background-color: #e2e8f0;">
                <th style="width: 5%;">No</th>
                <th style="width: 25%;">Tahapan & Sintaks</th>
                <th style="width: 45%;">Deskripsi Aktivitas Guru & Peserta Didik</th>
                <th style="width: 15%;">Profil Lulusan</th>
                <th style="width: 10%;">Waktu</th>
              </tr>
            </thead>
            <tbody>
              <tr style="background-color: #f8fafc;">
                <td style="text-align: center; font-weight: bold;">1</td>
                <td style="font-weight: bold;">Kegiatan Pendahuluan<br><span style="font-size: 8.5pt; font-weight: normal;">Apersepsi & Motivasi</span></td>
                <td>
                  <p style="margin: 0 0 3pt 0;">• <b>Guru:</b> Membuka KBM dengan salam, memimpin doa, mengecek presensi, mengondisikan kelas, dan mengaitkan materi pemantik.</p>
                  <p style="margin: 0;">• <b>Siswa:</b> Merespons salam, berdoa dengan khusyuk, menyimak tujuan pembelajaran dan kriteria penilaian.</p>
                </td>
                <td>Keimanan & Ketaqwaan, Komunikasi</td>
                <td style="text-align: center; font-weight: bold;">10-15 Mnt</td>
              </tr>
              ${tableActivityRowsHtml}
              <tr style="background-color: #f8fafc;">
                <td style="text-align: center; font-weight: bold;">${activityPhases.length + 2}</td>
                <td style="font-weight: bold;">Kegiatan Penutup<br><span style="font-size: 8.5pt; font-weight: normal;">Refleksi & Doa</span></td>
                <td>
                  <p style="margin: 0 0 3pt 0;">• <b>Guru:</b> Membimbing kesimpulan, memfasilitasi refleksi bersama, mengumumkan rencana remedial/pengayaan, dan menutup dengan doa.</p>
                  <p style="margin: 0;">• <b>Siswa:</b> Menyampaikan refleksi pembelajaran hari ini, mencatat tugas tindak lanjut, dan berdoa bersama.</p>
                </td>
                <td>Penalaran Kritis, Keimanan & Ketaqwaan</td>
                <td style="text-align: center; font-weight: bold;">10-15 Mnt</td>
              </tr>
            </tbody>
          </table>

          <!-- Section 4: Asesmen -->
          <div class="section-title">IV. MATRIKS RENCANA ASESMEN & EVALUASI</div>
          <table>
            <thead>
              <tr style="background-color: #e2e8f0;">
                <th style="width: 5%;">No</th>
                <th style="width: 25%;">Jenis Asesmen</th>
                <th style="width: 30%;">Bentuk & Instrumen</th>
                <th style="width: 25%;">Aspek yang Dinilai</th>
                <th style="width: 15%;">Kriteria / KKTP</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="text-align:center; font-weight:bold;">1</td>
                <td style="font-weight:bold;">Asesmen Diagnostik (Awal)</td>
                <td>Tanya jawab lisan & Kuis pemantik</td>
                <td>Kesiapan belajar & prasyarat konsep</td>
                <td>Siap / Butuh Bimbingan</td>
              </tr>
              <tr>
                <td style="text-align:center; font-weight:bold;">2</td>
                <td style="font-weight:bold;">Asesmen Formatif (Proses)</td>
                <td>Lembar Observasi Sikap & Rubrik LKPD</td>
                <td>Kolaborasi, Nalar Kritis, Komunikasi</td>
                <td>Skala Kinerja 1 - 4</td>
              </tr>
              <tr>
                <td style="text-align:center; font-weight:bold;">3</td>
                <td style="font-weight:bold;">Asesmen Sumatif (Akhir)</td>
                <td>Tes Tertulis (Paket Soal HOTS)</td>
                <td>Penguasaan tujuan pembelajaran materi ${topik}</td>
                <td style="font-weight:bold;">KKM Minimal: 75</td>
              </tr>
            </tbody>
          </table>

          <!-- Section 5: Pengayaan & Remedial -->
          <div class="section-title">V. PROGRAM PENGAYAAN & REMEDIAL</div>
          <table>
            <tr>
              <td class="bg-label">Program Pengayaan</td>
              <td>Diberikan kepada peserta didik dengan capaian tinggi (nilai ≥ 85) berupa penugasan analisis studi kasus lanjutan atau eksplorasi artikel sains kontekstual.</td>
            </tr>
            <tr>
              <td class="bg-label">Program Remedial</td>
              <td>Diberikan kepada peserta didik yang belum mencapai KKTP melalui bimbingan tutor sebaya atau pembelajaran ulang pada indikator kompetensi yang belum tuntas.</td>
            </tr>
          </table>

          <!-- Section 6: Lembar Pengesahan -->
          <div style="margin-top: 25pt;">
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
    const filename = `Modul_Ajar_${mapel.replace(/\s+/g, '_')}_${kelas}_${new Date().toISOString().split('T')[0]}.doc`;
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
      {/* Action Toolbar for Print / Export View */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 no-print shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              Format Tabel Modul Ajar Resmi Kurikulum Merdeka
            </h4>
            <p className="text-[11px] text-slate-300">
              Tertata rapi dalam tabel matriks standar Kemendikbudristek, siap dicetak langsung ke PDF atau diunduh sebagai berkas Word.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export to Word Button */}
          <button
            type="button"
            onClick={handleExportWord}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            title="Unduh Modul Ajar dalam format Microsoft Word (.DOC)"
          >
            <FileDown className="w-4 h-4 text-blue-200" />
            <span>Unduh Word (.DOC)</span>
          </button>

          {/* Print / Save PDF Button */}
          <button
            type="button"
            onClick={onPrint || (() => window.print())}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            title="Cetak langsung ke Printer atau Simpan sebagai PDF"
          >
            <Printer className="w-4 h-4 text-emerald-100" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Official Table Document Body */}
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

        {/* Document Header Title */}
        <div className="text-center mb-5">
          <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900">
            MODUL AJAR KURIKULUM MERDEKA
          </h2>
          <p className="text-xs font-bold text-slate-700 mt-0.5">
            MATA PELAJARAN: {mapel.toUpperCase()} · TAHUN PELAJARAN {sekolah.tahunAjaran} ({sekolah.semester})
          </p>
        </div>

        {/* ================= SECTION 1: TABEL IDENTITAS & INFORMASI UMUM ================= */}
        <div className="mb-6 space-y-2">
          <div className="bg-slate-900 text-white px-3 py-1.5 rounded-t-lg font-black text-xs tracking-wider uppercase flex items-center justify-between">
            <span>I. INFORMASI UMUM & IDENTITAS MODUL</span>
            <span className="text-[10px] font-semibold text-emerald-300">Kurikulum Merdeka</span>
          </div>

          <table className="w-full border-collapse border border-black text-xs">
            <tbody>
              <tr>
                <td className="w-1/4 bg-slate-100 font-bold border border-black px-3 py-2">Nama Penyusun</td>
                <td className="w-1/4 border border-black px-3 py-2 font-semibold">{user?.nama || 'Guru Mata Pelajaran'}</td>
                <td className="w-1/4 bg-slate-100 font-bold border border-black px-3 py-2">Satuan Pendidikan</td>
                <td className="w-1/4 border border-black px-3 py-2">{sekolah.namaSekolah}</td>
              </tr>
              <tr>
                <td className="bg-slate-100 font-bold border border-black px-3 py-2">Mata Pelajaran</td>
                <td className="border border-black px-3 py-2 font-bold text-emerald-950">{mapel}</td>
                <td className="bg-slate-100 font-bold border border-black px-3 py-2">Fase / Kelas / Semester</td>
                <td className="border border-black px-3 py-2 font-semibold">{fase} / Kelas {kelas} / {sekolah.semester}</td>
              </tr>
              <tr>
                <td className="bg-slate-100 font-bold border border-black px-3 py-2">Topik / Lingkup Materi</td>
                <td className="border border-black px-3 py-2 font-bold text-slate-900" colSpan={3}>
                  {topik}
                </td>
              </tr>
              <tr>
                <td className="bg-slate-100 font-bold border border-black px-3 py-2">Alokasi Waktu</td>
                <td className="border border-black px-3 py-2 font-semibold">{alokasi}</td>
                <td className="bg-slate-100 font-bold border border-black px-3 py-2">Model Pembelajaran</td>
                <td className="border border-black px-3 py-2 font-bold text-slate-900">{model}</td>
              </tr>
              <tr>
                <td className="bg-slate-100 font-bold border border-black px-3 py-2">Target Peserta Didik</td>
                <td className="border border-black px-3 py-2" colSpan={3}>
                  Peserta didik reguler/tipikal: umum, tidak ada kesulitan dalam mencerna dan memahami materi ajar.
                </td>
              </tr>
              <tr>
                <td className="bg-slate-100 font-bold border border-black px-3 py-2 align-top">
                  Dimensi Profil Lulusan & Karakter Siswa
                </td>
                <td className="border border-black px-3 py-2" colSpan={3}>
                  <div className="flex flex-wrap gap-1.5">
                    {dimensiList.map((dim, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-[11px] font-bold text-slate-800"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{dim}</span>
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
              <tr>
                <td className="bg-slate-100 font-bold border border-black px-3 py-2">Sarana & Prasarana</td>
                <td className="border border-black px-3 py-2" colSpan={3}>
                  Lembar Kerja Peserta Didik (LKPD), Papan Tulis, LCD Proyektor, Alat Praktikum Kontekstual, Buku Panduan Guru & Siswa Kemendikbudristek.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ================= SECTION 2: TABEL KOMPONEN INTI ================= */}
        <div className="mb-6 space-y-2">
          <div className="bg-slate-900 text-white px-3 py-1.5 rounded-t-lg font-black text-xs tracking-wider uppercase">
            II. KOMPONEN INTI PEMBELAJARAN
          </div>

          <table className="w-full border-collapse border border-black text-xs">
            <tbody>
              <tr>
                <td className="w-1/3 bg-slate-100 font-bold border border-black px-3 py-2 align-top">
                  Tujuan Pembelajaran (TP)
                </td>
                <td className="border border-black px-3 py-2 font-medium text-slate-900" colSpan={2}>
                  {tujuan}
                </td>
              </tr>
              <tr>
                <td className="bg-slate-100 font-bold border border-black px-3 py-2 align-top">
                  Pemahaman Bermakna
                </td>
                <td className="border border-black px-3 py-2" colSpan={2}>
                  Peserta didik memahami bahwa penguasaan konsep <b>{topik}</b> sangat esensial dalam memecahkan permasalahan nyata dalam kehidupan sehari-hari serta menumbuhkan kesadaran ilmiah yang berkelanjutan.
                </td>
              </tr>
              <tr>
                <td className="bg-slate-100 font-bold border border-black px-3 py-2 align-top">
                  Pertanyaan Pemantik
                </td>
                <td className="border border-black px-3 py-2" colSpan={2}>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Mengapa kita perlu mempelajari konsep <b>{topik}</b> dalam kehidupan sehari-hari?</li>
                    <li>Bagaimana cara kita membuktikan kebenaran fenomena tersebut melalui pengamatan langsung?</li>
                    <li>Apa solusi kreatif yang dapat kita rancang jika terjadi ketidaksesuaian pada pengamatan?</li>
                  </ol>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ================= SECTION 3: TABEL MATRIKS KEGIATAN PEMBELAJARAN ================= */}
        <div className="mb-6 space-y-2">
          <div className="bg-slate-900 text-white px-3 py-1.5 rounded-t-lg font-black text-xs tracking-wider uppercase flex items-center justify-between">
            <span>III. MATRIKS KEGIATAN PEMBELAJARAN (SINTAKS KBM)</span>
            <span className="text-[10px] font-semibold text-emerald-300">Model: {model}</span>
          </div>

          <table className="w-full border-collapse border border-black text-xs">
            <thead>
              <tr className="bg-slate-200 text-slate-900 font-black text-center text-[11px] uppercase">
                <th className="border border-black px-2 py-2 w-10">No</th>
                <th className="border border-black px-3 py-2 w-48">Tahapan & Sintaks</th>
                <th className="border border-black px-3 py-2">Deskripsi Aktivitas Guru & Peserta Didik</th>
                <th className="border border-black px-3 py-2 w-36">Profil Lulusan</th>
                <th className="border border-black px-2 py-2 w-20">Alokasi Waktu</th>
              </tr>
            </thead>
            <tbody>
              {/* Pendahuluan */}
              <tr className="bg-slate-50">
                <td className="border border-black text-center font-bold">1</td>
                <td className="border border-black px-3 py-2 font-bold text-slate-900">
                  Kegiatan Pendahuluan
                  <span className="block text-[10px] font-normal text-slate-600">Apersepsi & Orientasi</span>
                </td>
                <td className="border border-black px-3 py-2 space-y-1">
                  <p>• <b>Guru:</b> Membuka KBM dengan salam, memimpin doa, mengecek presensi siswa, mengondisikan kelas yang menyenangkan, dan mengaitkan materi pemantik.</p>
                  <p>• <b>Siswa:</b> Merespons salam, berdoa dengan khusyuk, menyimak tujuan pembelajaran dan kriteria penilaian yang disampaikan guru.</p>
                </td>
                <td className="border border-black px-3 py-2 text-[11px] font-semibold text-slate-800">
                  Keimanan & Ketaqwaan, Komunikasi
                </td>
                <td className="border border-black text-center font-bold whitespace-nowrap">
                  10 - 15 Menit
                </td>
              </tr>

              {/* Kegiatan Inti (Sintaks per Fase) */}
              {activityPhases.map((phase, idx) => (
                <tr key={idx}>
                  <td className="border border-black text-center font-bold">{idx + 2}</td>
                  <td className="border border-black px-3 py-2 font-bold text-slate-900">
                    {phase.fase}
                  </td>
                  <td className="border border-black px-3 py-2 space-y-1">
                    <p>• <b>Guru:</b> {phase.guru}</p>
                    <p>• <b>Siswa:</b> {phase.siswa}</p>
                  </td>
                  <td className="border border-black px-3 py-2 text-[11px] font-semibold text-slate-800">
                    {phase.karakter}
                  </td>
                  <td className="border border-black text-center font-bold whitespace-nowrap">
                    {phase.waktu}
                  </td>
                </tr>
              ))}

              {/* Penutup */}
              <tr className="bg-slate-50">
                <td className="border border-black text-center font-bold">{activityPhases.length + 2}</td>
                <td className="border border-black px-3 py-2 font-bold text-slate-900">
                  Kegiatan Penutup
                  <span className="block text-[10px] font-normal text-slate-600">Refleksi & Evaluasi</span>
                </td>
                <td className="border border-black px-3 py-2 space-y-1">
                  <p>• <b>Guru:</b> Membimbing kesimpulan, memfasilitasi refleksi bersama, mengumumkan rencana remedial/pengayaan, dan menutup dengan doa.</p>
                  <p>• <b>Siswa:</b> Menyampaikan refleksi pembelajaran hari ini, mencatat tugas tindak lanjut, dan berdoa bersama.</p>
                </td>
                <td className="border border-black px-3 py-2 text-[11px] font-semibold text-slate-800">
                  Penalaran Kritis, Keimanan & Ketaqwaan
                </td>
                <td className="border border-black text-center font-bold whitespace-nowrap">
                  10 - 15 Menit
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ================= SECTION 4: TABEL MATRIKS ASESMEN & EVALUASI ================= */}
        <div className="mb-6 space-y-2">
          <div className="bg-slate-900 text-white px-3 py-1.5 rounded-t-lg font-black text-xs tracking-wider uppercase">
            IV. MATRIKS RENCANA ASESMEN & EVALUASI HASIL BELAJAR
          </div>

          <table className="w-full border-collapse border border-black text-xs">
            <thead>
              <tr className="bg-slate-200 text-slate-900 font-black text-center text-[11px] uppercase">
                <th className="border border-black px-2 py-2 w-10">No</th>
                <th className="border border-black px-3 py-2 w-36">Bentuk Asesmen</th>
                <th className="border border-black px-3 py-2 w-44">Teknik & Instrumen</th>
                <th className="border border-black px-3 py-2">Aspek / Indikator yang Dinilai</th>
                <th className="border border-black px-3 py-2 w-40">Kriteria Ketercapaian</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black text-center font-bold">1</td>
                <td className="border border-black px-3 py-2 font-bold">Asesmen Diagnostik (Awal)</td>
                <td className="border border-black px-3 py-2">Tanya jawab lisan & Kuis pemantik singkat</td>
                <td className="border border-black px-3 py-2">Kesiapan belajar dan pemahaman prasyarat materi</td>
                <td className="border border-black px-3 py-2 text-slate-800">Kategori: Siap / Berkembang / Butuh Bimbingan</td>
              </tr>
              <tr>
                <td className="border border-black text-center font-bold">2</td>
                <td className="border border-black px-3 py-2 font-bold">Asesmen Formatif (Proses)</td>
                <td className="border border-black px-3 py-2">Lembar Observasi Sikap & Rubrik Diskusi LKPD</td>
                <td className="border border-black px-3 py-2">Keaktifan kolaborasi kelompok, nalar kritis, dan komunikasi</td>
                <td className="border border-black px-3 py-2 text-slate-800">Rubrik Skala Kinerja (Skor 1 - 4)</td>
              </tr>
              <tr>
                <td className="border border-black text-center font-bold">3</td>
                <td className="border border-black px-3 py-2 font-bold">Asesmen Sumatif (Akhir)</td>
                <td className="border border-black px-3 py-2">Tes Tertulis (Paket Soal HOTS & Uraian)</td>
                <td className="border border-black px-3 py-2">Penguasaan capaian tujuan pembelajaran materi {topik}</td>
                <td className="border border-black px-3 py-2 font-bold text-slate-900">KKM / KKTP: Nilai Minimal 75</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ================= SECTION 5: TABEL PROGRAM PENGAYAAN & REMEDIAL ================= */}
        <div className="mb-6 space-y-2">
          <div className="bg-slate-900 text-white px-3 py-1.5 rounded-t-lg font-black text-xs tracking-wider uppercase">
            V. PROGRAM PENGAYAAN & REMEDIAL
          </div>

          <table className="w-full border-collapse border border-black text-xs">
            <tbody>
              <tr>
                <td className="w-1/4 bg-slate-100 font-bold border border-black px-3 py-2">Program Pengayaan</td>
                <td className="border border-black px-3 py-2">
                  Diberikan kepada peserta didik dengan capaian tinggi (nilai ≥ 85) berupa penugasan analisis studi kasus lanjutan atau eksplorasi artikel sains kontekstual.
                </td>
              </tr>
              <tr>
                <td className="bg-slate-100 font-bold border border-black px-3 py-2">Program Remedial</td>
                <td className="border border-black px-3 py-2">
                  Diberikan kepada peserta didik yang belum mencapai KKTP melalui bimbingan tutor sebaya atau pembelajaran ulang pada indikator kompetensi yang belum tuntas.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ================= SECTION 6: KOLOM PENGESAHAN TANDA TANGAN RESMI ================= */}
        <div className="mt-8 pt-4 border-t border-slate-200">
          <div className="flex items-start justify-between text-xs text-slate-900 font-semibold px-4">
            <div className="text-center w-64">
              <p>Mengetahui,</p>
              <p className="font-bold">Kepala {sekolah.namaSekolah}</p>
              <div className="h-20" />
              <p className="font-black underline uppercase">{sekolah.namaKepalaSekolah}</p>
              <p className="text-[11px] font-mono">NIP. {sekolah.nipKepalaSekolah}</p>
            </div>

            <div className="text-center w-64">
              <p>Kediri, {currentDateStr}</p>
              <p className="font-bold">Guru Mata Pelajaran {mapel}</p>
              <div className="h-20" />
              <p className="font-black underline uppercase">{user?.nama || 'Guru Mata Pelajaran'}</p>
              <p className="text-[11px] font-mono">NIP. {user?.nip || '-'}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
