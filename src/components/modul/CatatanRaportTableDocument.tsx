import React, { useState } from 'react';
import { SiaguState } from '../../utils/storage';
import { Siswa } from '../../types/siagu';
import {
  Sparkles,
  Printer,
  FileDown,
  CheckCircle2,
  Copy,
  Check,
  UserCheck,
  HeartHandshake,
  Award,
  BookOpen,
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

interface CatatanRaportTableDocumentProps {
  state: SiaguState;
  siswa: Siswa | undefined;
  kelas: string;
  nilaiRekap: { nilaiAkhir: number; predikat: string; statusTuntas: boolean } | null;
  absensiRekap: { persenHadir: number; hadir: number; sakit: number; izin: number; alpa: number } | null;
  kelebihan: string;
  perbaikan: string;
  generatedText: string;
  onPrint?: () => void;
}

export const CatatanRaportTableDocument: React.FC<CatatanRaportTableDocumentProps> = ({
  state,
  siswa,
  kelas,
  nilaiRekap,
  absensiRekap,
  kelebihan,
  perbaikan,
  generatedText,
  onPrint,
}) => {
  const [selectedOption, setSelectedOption] = useState<number>(1);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const user = state.currentUser;
  const sekolah = state.pengaturanSekolah;
  const { notifySuccess } = useNotification();

  const currentDateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const siswaNama = siswa?.nama || 'Peserta Didik';
  const siswaNisn = siswa?.nisn || '-';
  const nilaiAkhir = nilaiRekap ? nilaiRekap.nilaiAkhir : 85;
  const predikat = nilaiRekap ? nilaiRekap.predikat : 'A';
  const persenHadir = absensiRekap ? `${absensiRekap.persenHadir}%` : '100%';

  // 3 High-Quality Variational Narrative Options
  const narasiOptions = [
    {
      id: 1,
      tag: 'Opsi 1: Gaya Formal & Edukatif',
      deskripsi: 'Standar Rapor Nasional Kemendikbudristek (Bahasa baku, objektif, dan terstruktur).',
      narasi: `Ananda ${siswaNama} menunjukkan pencapaian kompetensi yang sangat memuaskan pada seluruh capaian pembelajaran semester ini. Memiliki nalar kritis yang baik, konsisten mengumpulkan tugas tepat waktu, serta berpartisipasi aktif dalam kegiatan KBM dengan nilai rata-rata ${nilaiAkhir} (${predikat}). Terus pertahankan kedisiplinan dan semangat belajar menuju semester berikutnya.`,
      catatanOrangTua: `Terima kasih kepada Bapak/Ibu atas sinergi dan pendampingan belajar yang konsisten di rumah sehingga Ananda dapat meraih hasil optimal.`,
    },
    {
      id: 2,
      tag: 'Opsi 2: Gaya Motivatif & Humanis',
      deskripsi: 'Membangkitkan Semangat & Apresiasi Karakter (Hangat, inspiratif, dan menyentuh hati).',
      narasi: `Selamat atas kerja keras dan pencapaian luar biasa Ananda ${siswaNama} di semester ini! Sikap santun, empati, dan gotong royong yang Ananda tunjukkan menjadi teladan positif bagi teman-teman sekelas. Percayalah pada potensi hebat yang ada di dalam dirimu, teruslah berani mencoba hal baru, dan capailah impianmu setinggi langit!`,
      catatanOrangTua: `Mohon Bapak/Ibu senantiasa memberikan apresiasi dan ruang eksplorasi minat bakat Ananda di rumah agar rasa percaya dirinya semakin berkembang.`,
    },
    {
      id: 3,
      tag: 'Opsi 3: Gaya Ringkas & Fokus Target',
      deskripsi: 'To-The-Point & Berorientasi Langkah Konkret (Padat, jelas, dan terukur).',
      narasi: `Capaian akademik sangat baik dengan predikat ${predikat} dan kehadiran ${persenHadir}. Kelebihan: ${kelebihan || 'Kritis dalam diskusi dan tuntas tugas'}. Rekomendasi pengembangan: ${perbaikan || 'Tingkatkan keterampilan kepemimpinan kelompok dan pertahankan konsistensi belajar'}.`,
      catatanOrangTua: `Dukungan orang tua dalam memfasilitasi waktu belajar mandiri di rumah sangat diapresiasi untuk menjaga kestabilan prestasi Ananda.`,
    },
  ];

  const handleCopyNarasi = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    notifySuccess('Catatan narasi raport berhasil disalin ke papan klip!', 'Tersalin');
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  // Export to Word (.DOC)
  const handleExportWord = () => {
    const tableOptionsHtml = narasiOptions
      .map(
        (opt) => `
        <div style="margin-bottom: 14pt;">
          <div style="background-color: #0f172a; color: #ffffff; padding: 4pt 8pt; font-weight: bold; font-size: 10.5pt; text-transform: uppercase;">
            ${opt.tag}
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-top: 4pt;">
            <tr>
              <td style="width: 25%; font-weight: bold; background-color: #f8fafc; border: 1pt solid #000000; padding: 6pt;">Karakteristik Gaya</td>
              <td style="border: 1pt solid #000000; padding: 6pt;">${opt.deskripsi}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; background-color: #f8fafc; border: 1pt solid #000000; padding: 6pt;">Narasi Catatan Raport</td>
              <td style="border: 1pt solid #000000; padding: 6pt; font-style: italic; line-height: 1.4;">"${opt.narasi}"</td>
            </tr>
            <tr>
              <td style="font-weight: bold; background-color: #f8fafc; border: 1pt solid #000000; padding: 6pt;">Pesan untuk Orang Tua</td>
              <td style="border: 1pt solid #000000; padding: 6pt;">"${opt.catatanOrangTua}"</td>
            </tr>
          </table>
        </div>
      `
      )
      .join('');

    const docContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Catatan Rapor Siswa - ${siswaNama}</title>
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
          }
          div.Section1 { page: Section1; }
          body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.35; color: #000000; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 12pt; }
          th, td { border: 1pt solid #000000; padding: 5pt 7pt; font-size: 10pt; vertical-align: top; }
          th { background-color: #f1f5f9; font-weight: bold; text-align: center; }
          .header-title { text-align: center; font-size: 13pt; font-weight: bold; text-transform: uppercase; margin: 4pt 0; }
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
          <div style="text-align: center; margin-bottom: 12pt;">
            <div class="header-title">LEMBAR CATATAN RAPORT & CAPAIAN BELAJAR SISWA</div>
            <div style="font-size: 10.5pt; font-weight: bold;">KURIKULUM MERDEKA · TAHUN AJARAN ${sekolah.tahunAjaran} (${sekolah.semester})</div>
          </div>

          <!-- Tabel Identitas Siswa & Capaian -->
          <table>
            <tr>
              <td style="width: 25%; font-weight: bold; background-color: #f8fafc;">Nama Lengkap Siswa</td>
              <td style="width: 25%; font-weight: bold;">${siswaNama}</td>
              <td style="width: 25%; font-weight: bold; background-color: #f8fafc;">Kelas / Fase</td>
              <td style="width: 25%; font-weight: bold;">${kelas}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; background-color: #f8fafc;">NISN / No. Induk</td>
              <td>${siswaNisn}</td>
              <td style="font-weight: bold; background-color: #f8fafc;">Tingkat Kehadiran</td>
              <td style="font-weight: bold;">${persenHadir} (H:${absensiRekap?.hadir || 0} S:${absensiRekap?.sakit || 0} I:${absensiRekap?.izin || 0} A:${absensiRekap?.alpa || 0})</td>
            </tr>
            <tr>
              <td style="font-weight: bold; background-color: #f8fafc;">Nilai Rata-rata Akademik</td>
              <td style="font-weight: bold; color: #047857;">${nilaiAkhir} (Predikat ${predikat})</td>
              <td style="font-weight: bold; background-color: #f8fafc;">Status Ketercapaian TP</td>
              <td style="font-weight: bold;">${nilaiRekap?.statusTuntas ? 'Tuntas / Memuaskan' : 'Perlu Bimbingan'}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; background-color: #f8fafc;">Kelebihan & Potensi Siswa</td>
              <td colspan="3">${kelebihan || 'Aktif dalam diskusi kelompok dan tekun dalam menyelesaikan tugas'}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; background-color: #f8fafc;">Rekomendasi Pengembangan</td>
              <td colspan="3">${perbaikan || 'Pertahankan prestasi belajar dan asah kepemimpinan mandiri'}</td>
            </tr>
          </table>

          <!-- Opsi Narasi Catatan Raport -->
          ${tableOptionsHtml}

          <!-- Kolom Pengesahan Tanda Tangan -->
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
                  <b>Wali Kelas / Guru Pembimbing</b><br><br><br><br>
                  <b><u>${user?.nama || 'Wali Kelas'}</u></b><br>
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
    const filename = `Catatan_Rapor_${siswaNama.replace(/\s+/g, '_')}_${kelas}_${new Date().toISOString().split('T')[0]}.doc`;
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    notifySuccess(`Dokumen Catatan Rapor ${filename} berhasil diunduh!`, 'File Word Tersimpan');
  };

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 no-print shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-400/30">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              Format Tabel Resmi Catatan Rapor Kurikulum Merdeka
            </h4>
            <p className="text-[11px] text-slate-300">
              Menampilkan 3 opsi narasi deskripsi capaian siswa, pesan orang tua, dan rekap nilai siap cetak/unduh.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export to Word Button */}
          <button
            type="button"
            onClick={handleExportWord}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            title="Unduh Catatan Rapor dalam format Microsoft Word (.DOC)"
          >
            <FileDown className="w-4 h-4 text-blue-200" />
            <span>Unduh Word</span>
          </button>

          {/* Print / Save PDF Button */}
          <button
            type="button"
            onClick={onPrint || (() => window.print())}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            title="Cetak langsung ke Printer atau Simpan sebagai PDF"
          >
            <Printer className="w-4 h-4 text-emerald-100" />
            <span>Cetak / PDF</span>
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
        <div className="text-center mb-4">
          <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900">
            LEMBAR CATATAN RAPOR & CAPAIAN PERKEMBANGAN SISWA
          </h2>
          <p className="text-xs font-bold text-slate-700 mt-0.5">
            SEMESTER {sekolah.semester.toUpperCase()} · TAHUN PELAJARAN {sekolah.tahunAjaran}
          </p>
        </div>

        {/* Tabel Identitas Siswa & Capaian Belajar */}
        <div className="mb-5 space-y-2">
          <div className="bg-slate-900 text-white px-3 py-1.5 rounded-t-lg font-black text-xs tracking-wider uppercase flex items-center justify-between">
            <span>I. IDENTITAS SISWA & REKAPITULASI CAPAIAN</span>
            <span className="text-[10px] font-semibold text-emerald-300">Kurikulum Merdeka</span>
          </div>

          <table className="w-full border-collapse border border-black text-xs">
            <tbody>
              <tr>
                <td className="w-1/4 bg-slate-100 font-bold border border-black px-3 py-2">Nama Peserta Didik</td>
                <td className="w-1/4 border border-black px-3 py-2 font-bold text-slate-900">{siswaNama}</td>
                <td className="w-1/4 bg-slate-100 font-bold border border-black px-3 py-2">Kelas / Rombel</td>
                <td className="w-1/4 border border-black px-3 py-2 font-semibold">{kelas}</td>
              </tr>
              <tr>
                <td className="bg-slate-100 font-bold border border-black px-3 py-2">Nomor Induk / NISN</td>
                <td className="border border-black px-3 py-2 font-mono">{siswaNisn}</td>
                <td className="bg-slate-100 font-bold border border-black px-3 py-2">Persentase Kehadiran</td>
                <td className="border border-black px-3 py-2 font-semibold">
                  {persenHadir} <span className="text-[10px] text-slate-600 font-normal">(H:{absensiRekap?.hadir || 0}, S:{absensiRekap?.sakit || 0}, I:{absensiRekap?.izin || 0}, A:{absensiRekap?.alpa || 0})</span>
                </td>
              </tr>
              <tr>
                <td className="bg-slate-100 font-bold border border-black px-3 py-2">Rata-rata Nilai Akademik</td>
                <td className="border border-black px-3 py-2 font-bold text-emerald-800">
                  {nilaiAkhir} (Predikat {predikat})
                </td>
                <td className="bg-slate-100 font-bold border border-black px-3 py-2">Status Ketercapaian TP</td>
                <td className="border border-black px-3 py-2 font-bold">
                  {nilaiRekap?.statusTuntas ? (
                    <span className="text-emerald-800">✓ Tuntas Memuaskan</span>
                  ) : (
                    <span className="text-amber-800">Perlu Bimbingan Tambahan</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="bg-slate-100 font-bold border border-black px-3 py-2 align-top">Potensi & Kelebihan Siswa</td>
                <td className="border border-black px-3 py-2" colSpan={3}>
                  {kelebihan || 'Menunjukkan minat tinggi dalam kegiatan pembelajaran, aktif berdiskusi kelompok, serta tekun menyelesaikan tugas-tugas terstruktur.'}
                </td>
              </tr>
              <tr>
                <td className="bg-slate-100 font-bold border border-black px-3 py-2 align-top">Rekomendasi Pengembangan</td>
                <td className="border border-black px-3 py-2" colSpan={3}>
                  {perbaikan || 'Pertahankan prestasi belajar yang baik dan terus tingkatkan rasa percaya diri serta kemandirian eksplorasi ilmu pengetahuan.'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tabel 3 Variasi Opsi Narasi Catatan Raport */}
        <div className="mb-6 space-y-3">
          <div className="bg-slate-900 text-white px-3 py-1.5 rounded-t-lg font-black text-xs tracking-wider uppercase flex items-center justify-between">
            <span>II. MATRIKS PILIHAN VARIASI CATATAN NARASI RAPORT</span>
            <span className="text-[10px] font-semibold text-amber-300">Pilih Salah Satu untuk Rapor</span>
          </div>

          <div className="space-y-3">
            {narasiOptions.map((opt) => (
              <div
                key={opt.id}
                className={`border-2 rounded-xl p-3.5 transition-all ${
                  selectedOption === opt.id
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-black text-[11px] flex items-center justify-center">
                      {opt.id}
                    </span>
                    <h5 className="font-bold text-slate-900 text-xs">{opt.tag}</h5>
                    <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                      ({opt.deskripsi})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 no-print">
                    <button
                      type="button"
                      onClick={() => setSelectedOption(opt.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        selectedOption === opt.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {selectedOption === opt.id ? '✓ Opsi Terpilih' : 'Pilih Opsi Ini'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyNarasi(opt.narasi, opt.id)}
                      className="px-2 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                      title="Salin teks narasi ini"
                    >
                      {copiedIndex === opt.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-700 block mb-0.5">📝 Narasi Rapor Siswa:</span>
                    <p className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-900 leading-relaxed font-medium italic">
                      "{opt.narasi}"
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-slate-700 block mb-0.5">👨‍👩‍👧 Pesan Khusus Orang Tua / Wali:</span>
                    <p className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-slate-700 leading-relaxed text-[11px]">
                      "{opt.catatanOrangTua}"
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

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
              <p className="font-bold">Wali Kelas {kelas}</p>
              <div className="h-16" />
              <p className="font-black underline uppercase">{user?.nama || 'Wali Kelas'}</p>
              <p className="text-[11px] font-mono">NIP. {user?.nip || '-'}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
