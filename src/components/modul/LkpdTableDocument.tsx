import React, { useState } from 'react';
import { SiaguState } from '../../utils/storage';
import {
  Sparkles,
  Printer,
  FileDown,
  CheckCircle2,
  Copy,
  Check,
  FileText,
  Users,
  Award,
  Layers,
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

interface LkpdTableDocumentProps {
  state: SiaguState;
  mapel: string;
  fase: string;
  tingkatKelas: string;
  kelas: string;
  topik: string;
  model: string;
  aktivitas: string;
  alokasi: string;
  jumlahAnggota: string;
  alatBahan: string;
  tujuan: string;
  generatedText: string;
}

export const LkpdTableDocument: React.FC<LkpdTableDocumentProps> = ({
  state,
  mapel,
  fase,
  tingkatKelas,
  kelas,
  topik,
  model,
  aktivitas,
  alokasi,
  jumlahAnggota,
  alatBahan,
  tujuan,
  generatedText,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const user = state.currentUser;
  const sekolah = state.pengaturanSekolah;
  const { notifySuccess } = useNotification();

  const currentDateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    notifySuccess('LKPD berhasil disalin ke papan klip!', 'Tersalin');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([generatedText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LKPD_${topik.replace(/\s+/g, '_')}_${kelas}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notifySuccess('File LKPD Markdown berhasil diunduh.', 'Unduhan Berhasil');
  };

  const handleExportWord = () => {
    const docContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>LKPD Kurikulum Merdeka - ${sekolah.namaSekolah}</title>
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
          h1, h2, h3 { color: #0f172a; margin-top: 10pt; margin-bottom: 4pt; }
          h1 { font-size: 13pt; text-align: center; }
          h2 { font-size: 11.5pt; }
          h3 { font-size: 10.5pt; }
        </style>
      </head>
      <body>
        <div class="Section1">
          <div style="text-align: center; border-bottom: 2pt solid #000000; padding-bottom: 6pt; margin-bottom: 12pt;">
            <p style="margin: 0; font-size: 10pt; font-weight: bold; text-transform: uppercase;">PEMERINTAH KABUPATEN KEDIRI · DINAS PENDIDIKAN</p>
            <p style="margin: 2pt 0; font-size: 14pt; font-weight: bold; text-transform: uppercase;">${sekolah.namaSekolah}</p>
            <p style="margin: 0; font-size: 9.5pt;">${sekolah.alamatSekolah} · Telp: ${sekolah.teleponSekolah}</p>
          </div>

          <div style="text-align: center; margin-bottom: 15pt;">
            <h2 style="margin: 0; text-transform: uppercase;">LEMBAR KERJA PESERTA DIDIK (LKPD)</h2>
            <p style="margin: 2pt 0; font-weight: bold; font-size: 11pt;">KURIKULUM MERDEKA</p>
          </div>

          <table>
            <tr>
              <td style="width: 25%; font-weight: bold;">Mata Pelajaran</td>
              <td style="width: 75%;">${mapel}</td>
            </tr>
            <tr>
              <td style="font-weight: bold;">Fase / Kelas</td>
              <td>${fase} / ${kelas} (${tingkatKelas})</td>
            </tr>
            <tr>
              <td style="font-weight: bold;">Topik / Materi</td>
              <td>${topik}</td>
            </tr>
            <tr>
              <td style="font-weight: bold;">Model & Sintaks</td>
              <td>${model} (${aktivitas})</td>
            </tr>
            <tr>
              <td style="font-weight: bold;">Alokasi Waktu</td>
              <td>${alokasi}</td>
            </tr>
          </table>

          <div style="margin-bottom: 15pt; border: 1pt solid #000; padding: 8pt;">
            <b>IDENTITAS KELOMPOK / PESERTA DIDIK:</b><br/>
            - Nama Kelompok: ................................................................................<br/>
            - Anggota: 1. ........................................ 2. ........................................<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3. ........................................ 4. ........................................
          </div>

          <div style="white-space: pre-wrap;">
            ${generatedText.replace(/\n/g, '<br/>')}
          </div>

          <div style="margin-top: 30pt;">
            <table style="border: none;">
              <tr style="border: none;">
                <td style="border: none; width: 50%; text-align: center;">
                  Mengetahui,<br>
                  <b>Guru Mata Pelajaran</b><br><br><br><br>
                  <b><u>${user?.nama || 'Guru Pengampu'}</u></b><br>
                  NIP. ${user?.nip || '-'}
                </td>
                <td style="border: none; width: 50%; text-align: center;">
                  Kediri, ${currentDateStr}<br>
                  <b>Ketua Kelompok Siswa</b><br><br><br><br>
                  <b><u>( .................................................... )</u></b><br>
                  NISN. ............................................
                </td>
              </tr>
            </table>
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + docContent], { type: 'application/msword;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `LKPD_${topik.replace(/\s+/g, '_')}_${kelas}.doc`;
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    notifySuccess(`File Word LKPD ${filename} berhasil diunduh!`, 'File Word Tersimpan');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Top Bar Actions */}
      <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/30">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black tracking-wide uppercase">LKPD Terstruktur & Tabel Resmi</h3>
            <p className="text-[11px] text-slate-300">Kurikulum Merdeka Kemendikbudristek · {mapel}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
            <span>{copied ? 'Tersalin' : 'Salin'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportWord}
            className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Unduh Word (.doc)</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadMarkdown}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700"
          >
            <FileDown className="w-3.5 h-3.5 text-slate-300" />
            <span>Unduh .md</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700"
          >
            <Printer className="w-3.5 h-3.5 text-slate-300" />
            <span>Cetak</span>
          </button>
        </div>
      </div>

      {/* Styled Table Document Body */}
      <div className="p-6 sm:p-10 overflow-y-auto max-h-[800px] font-sans text-slate-900 bg-slate-50/50 space-y-6">
        
        {/* Kop Surat Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-1">
          <p className="text-xs font-extrabold tracking-widest text-teal-800 uppercase">PEMERINTAH KABUPATEN KEDIRI · DINAS PENDIDIKAN</p>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 uppercase">{sekolah.namaSekolah}</h1>
          <p className="text-[11px] text-slate-500">{sekolah.alamatSekolah} · Telp: {sekolah.teleponSekolah}</p>
          <div className="border-b-2 border-slate-900 pt-3 mt-2" />
          <h2 className="text-sm font-black text-slate-900 uppercase pt-3">LEMBAR KERJA PESERTA DIDIK (LKPD) BERBASIS SINTAKS</h2>
          <p className="text-xs text-teal-700 font-bold">Kurikulum Merdeka · Pembelajaran Aktif & Kolaboratif</p>
        </div>

        {/* Identity & Metadata Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <table className="w-full text-xs text-left border-collapse">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="bg-slate-100 font-bold p-3 w-1/4 text-slate-700">Mata Pelajaran</td>
                <td className="p-3 font-semibold text-slate-900">{mapel}</td>
                <td className="bg-slate-100 font-bold p-3 w-1/4 text-slate-700">Fase / Kelas</td>
                <td className="p-3 font-semibold text-slate-900">{fase} / {kelas} ({tingkatKelas})</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="bg-slate-100 font-bold p-3 text-slate-700">Topik / Materi Pokok</td>
                <td className="p-3 font-semibold text-slate-900" colSpan={3}>{topik}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="bg-slate-100 font-bold p-3 text-slate-700">Model & Sintaks</td>
                <td className="p-3 font-semibold text-slate-900">{model}</td>
                <td className="bg-slate-100 font-bold p-3 text-slate-700">Alokasi Waktu</td>
                <td className="p-3 font-semibold text-slate-900">{alokasi}</td>
              </tr>
              <tr>
                <td className="bg-slate-100 font-bold p-3 text-slate-700">Bentuk Aktivitas</td>
                <td className="p-3 font-semibold text-slate-900">{aktivitas}</td>
                <td className="bg-slate-100 font-bold p-3 text-slate-700">Jumlah Anggota</td>
                <td className="p-3 font-semibold text-slate-900">{jumlahAnggota}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Group Identity Form Box */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-teal-800 font-bold text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
            <Users className="w-4 h-4 text-teal-600" />
            <span>Identitas Kelompok Kerja Siswa</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-700 block">Nama Kelompok / Meja:</span>
              <div className="border-b border-dashed border-slate-300 pb-1 text-slate-400">......................................................................</div>
              <span className="font-bold text-slate-700 block pt-1">Ketua Kelompok:</span>
              <div className="border-b border-dashed border-slate-300 pb-1 text-slate-400">......................................................................</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-700 block">Daftar Anggota Kelompok:</span>
              <div className="text-[11px] text-slate-600 space-y-1">
                <div>1. .............................................................. (Absen: ....)</div>
                <div>2. .............................................................. (Absen: ....)</div>
                <div>3. .............................................................. (Absen: ....)</div>
                <div>4. .............................................................. (Absen: ....)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Render Generated Markdown Text in Structured Blocks */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs prose max-w-none text-xs leading-relaxed whitespace-pre-wrap font-sans text-slate-800">
          {generatedText}
        </div>

        {/* Bottom Signatures Box */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-6 text-xs mt-6">
          <div className="text-center w-full sm:w-1/2 space-y-12">
            <p className="font-bold text-slate-700">Mengetahui,<br/>Guru Mata Pelajaran {mapel}</p>
            <div>
              <p className="font-black underline text-slate-900">{user?.nama || 'Guru Pengampu'}</p>
              <p className="text-[11px] text-slate-500">NIP. {user?.nip || '-'}</p>
            </div>
          </div>

          <div className="text-center w-full sm:w-1/2 space-y-12">
            <p className="font-bold text-slate-700">Kediri, {currentDateStr}<br/>Perwakilan Kelompok Siswa</p>
            <div>
              <p className="font-black underline text-slate-900">( .................................................... )</p>
              <p className="text-[11px] text-slate-500">NISN. ............................................</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
