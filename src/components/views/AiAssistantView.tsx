import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  FileText,
  Copy,
  Check,
  Loader2,
  RefreshCw,
  Send,
  Download,
} from 'lucide-react';
import { SiaguState } from '../../utils/storage';

interface AiAssistantViewProps {
  state: SiaguState;
}

type AiToolMode = 'modul_ajar' | 'soal_hots' | 'catatan_raport';

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({ state }) => {
  const [activeTool, setActiveTool] = useState<AiToolMode>('modul_ajar');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [resultText, setResultText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Form States for Modul Ajar
  const [maMapel, setMaMapel] = useState<string>(state.profil.mataPelajaranUtama);
  const [maKelas, setMaKelas] = useState<string>(state.activeKelasId);
  const [maTopik, setMaTopik] = useState<string>('Klasifikasi Sel dan Organel Sel');
  const [maAlokasi, setMaAlokasi] = useState<string>('2 x 40 menit (1 Pertemuan)');
  const [maTujuan, setMaTujuan] = useState<string>(
    'Siswa mampu menganalisis struktur sel tumbuhan dan hewan serta menyajikan hasil pengamatan mikroskop.'
  );

  // Form States for Soal HOTS
  const [soalMapel, setSoalMapel] = useState<string>('IPA');
  const [soalTopik, setSoalTopik] = useState<string>('Sistem Pencernaan Manusia & Nutrisi Makanan');
  const [soalJumlahPilihan, setSoalJumlahPilihan] = useState<number>(5);
  const [soalJumlahEssay, setSoalJumlahEssay] = useState<number>(2);
  const [soalTingkat, setSoalTingkat] = useState<string>('HOTS (Analisis & Evaluasi)');

  // Form States for Catatan Raport
  const [raportSiswaId, setRaportSiswaId] = useState<string>(
    state.siswa.filter((s) => s.kelasId === state.activeKelasId)[0]?.id || ''
  );
  const [raportKelebihan, setRaportKelebihan] = useState<string>(
    'Aktif saat diskusi kelompok, teliti dalam praktikum lab, dan kritis bertanya.'
  );
  const [raportPerbaikan, setRaportPerbaikan] = useState<string>(
    'Perlu meningkatkan kerapian pengerjaan laporan tertulis dan konsistensi waktu.'
  );

  const activeSiswaList = state.siswa.filter((s) => s.kelasId === state.activeKelasId);
  const selectedSiswaObj = activeSiswaList.find((s) => s.id === raportSiswaId);

  const handleGenerateAI = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setResultText('');

    let prompt = '';
    let systemInstruction = '';

    if (activeTool === 'modul_ajar') {
      systemInstruction =
        'Anda adalah Pakar Pengembangan Kurikulum Merdeka Kemendikbudristek Indonesia. Susunlah Modul Ajar (RPP) yang lengkap, sistematis, dan langsung dapat diterapkan guru di kelas.';
      prompt = `Buatkan Modul Ajar Kurikulum Merdeka lengkap dengan komponen:
1. IDENTITAS MODUL (Nama Sekolah: ${state.profil.sekolah}, Mata Pelajaran: ${maMapel}, Kelas: ${maKelas}, Alokasi Waktu: ${maAlokasi}, Topik: ${maTopik})
2. PROFIL PELAJAR PANCASILA (Dimensi yang relevan)
3. SARANA & PRASARANA
4. TARGET PESERTA DIDIK & MODEL PEMBELAJARAN
5. TUJUAN PEMBELAJARAN: ${maTujuan}
6. KEGIATAN PEMBELAJARAN (Pendahuluan, Kegiatan Inti berorientasi Student-Centered/PBL/Discovery Learning, Penutup)
7. ASESMEN (Formatif & Sumatif)
8. REFLEKSI GURU & PESERTA DIDIK.`;
    } else if (activeTool === 'soal_hots') {
      systemInstruction =
        'Anda adalah Pengembang Soal Standar Asesmen Nasional Kemendikbudristek. Buatkan paket soal berkualitas tinggi dilengkapi Kunci Jawaban dan Rubrik Penilaian.';
      prompt = `Buatkan paket soal evaluasi untuk:
Mata Pelajaran: ${soalMapel}
Topik/Materi: ${soalTopik}
Tingkat Kesukaran: ${soalTingkat}

Komposisi:
- ${soalJumlahPilihan} Soal Pilihan Ganda (Pilihan A, B, C, D) lengkap dengan Kunci Jawaban dan Pembahasan.
- ${soalJumlahEssay} Soal Uraian/Essay HOTS lengkap dengan Kunci Jawaban dan Pedoman Penskoran/Rubrik.`;
    } else if (activeTool === 'catatan_raport') {
      systemInstruction =
        'Anda adalah Guru Bimbingan dan Wali Kelas yang berpengalaman. Buatkan narasi catatan raport yang membangun, santun, memotivasi, serta memuat apresiasi dan rekomendasi pengembangan diri.';
      prompt = `Buatkan 3 alternatif pilihan Narasi Catatan Wali Kelas/Guru Mata Pelajaran untuk Raport Semester:
Nama Siswa: ${selectedSiswaObj?.nama || 'Siswa'}
Kelas: ${activeKelasIdName(state, state.activeKelasId)}

Capaian & Kelebihan Siswa:
${raportKelebihan}

Hal yang Perlu Ditingkatkan/Dimotivasi:
${raportPerbaikan}

Berikan 3 variasi opsi kalimat:
Opsi 1: Bahasa Formal & Apresiatif
Opsi 2: Bahasa Motivatif & Empatis
Opsi 3: Bahasa Ringkas & Fokus Target.`;
    }

    try {
      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, systemInstruction }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal terhubung dengan server AI.');
      }

      setResultText(data.text || 'Tidak ada teks yang dihasilkan.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat memanggil AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = () => {
    if (!resultText) return;
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-teal-600 to-emerald-700 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-amber-200" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-100">
              AI Asisten Guru SIAGU · Powered by Gemini
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            Generator Perencanaan & Administrasi KBM
          </h1>
          <p className="text-xs text-emerald-100 mt-1 max-w-xl">
            Hemat waktu menyusun Modul Ajar RPP Kurikulum Merdeka, Soal HOTS Asesmen, dan Catatan Raport Siswa secara instan.
          </p>
        </div>
      </div>

      {/* Tool Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => {
            setActiveTool('modul_ajar');
            setResultText('');
          }}
          className={`p-4 rounded-xl border transition-all text-left cursor-pointer flex items-start gap-3 ${
            activeTool === 'modul_ajar'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-500/30'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className={`p-2 rounded-lg shrink-0 ${activeTool === 'modul_ajar' ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold block">Modul Ajar / RPP</h3>
            <span className={`text-[11px] block mt-0.5 ${activeTool === 'modul_ajar' ? 'text-slate-300' : 'text-slate-500'}`}>
              Kurikulum Merdeka Lintas Bab
            </span>
          </div>
        </button>

        <button
          onClick={() => {
            setActiveTool('soal_hots');
            setResultText('');
          }}
          className={`p-4 rounded-xl border transition-all text-left cursor-pointer flex items-start gap-3 ${
            activeTool === 'soal_hots'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-500/30'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className={`p-2 rounded-lg shrink-0 ${activeTool === 'soal_hots' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-600'}`}>
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold block">Soal HOTS & Rubrik</h3>
            <span className={`text-[11px] block mt-0.5 ${activeTool === 'soal_hots' ? 'text-slate-300' : 'text-slate-500'}`}>
              Pilihan Ganda & Essay + Kunci
            </span>
          </div>
        </button>

        <button
          onClick={() => {
            setActiveTool('catatan_raport');
            setResultText('');
          }}
          className={`p-4 rounded-xl border transition-all text-left cursor-pointer flex items-start gap-3 ${
            activeTool === 'catatan_raport'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-500/30'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className={`p-2 rounded-lg shrink-0 ${activeTool === 'catatan_raport' ? 'bg-purple-500 text-white' : 'bg-purple-50 text-purple-600'}`}>
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold block">Catatan Raport Siswa</h3>
            <span className={`text-[11px] block mt-0.5 ${activeTool === 'catatan_raport' ? 'text-slate-300' : 'text-slate-500'}`}>
              Narasi Wali Kelas & Apresiasi
            </span>
          </div>
        </button>
      </div>

      {/* Main Generator Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form (4 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
            {activeTool === 'modul_ajar' && 'Parameter Modul Ajar (RPP)'}
            {activeTool === 'soal_hots' && 'Parameter Soal HOTS & Kunci'}
            {activeTool === 'catatan_raport' && 'Parameter Catatan Raport Siswa'}
          </h2>

          {activeTool === 'modul_ajar' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mata Pelajaran</label>
                <input
                  type="text"
                  value={maMapel}
                  onChange={(e) => setMaMapel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Materi / Topik Bab</label>
                <input
                  type="text"
                  value={maTopik}
                  onChange={(e) => setMaTopik(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alokasi Waktu</label>
                <input
                  type="text"
                  value={maAlokasi}
                  onChange={(e) => setMaAlokasi(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tujuan Pembelajaran Utama</label>
                <textarea
                  rows={3}
                  value={maTujuan}
                  onChange={(e) => setMaTujuan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800"
                />
              </div>
            </>
          )}

          {activeTool === 'soal_hots' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mata Pelajaran</label>
                <input
                  type="text"
                  value={soalMapel}
                  onChange={(e) => setSoalMapel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Topik / Sub-Bab Pembahasan</label>
                <input
                  type="text"
                  value={soalTopik}
                  onChange={(e) => setSoalTopik(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jumlah Pilihan Ganda</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={soalJumlahPilihan}
                    onChange={(e) => setSoalJumlahPilihan(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jumlah Soal Uraian</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={soalJumlahEssay}
                    onChange={(e) => setSoalJumlahEssay(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tingkat Kesukaran / Taksonomi Bloom</label>
                <select
                  value={soalTingkat}
                  onChange={(e) => setSoalTingkat(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
                >
                  <option value="HOTS (Analisis & Evaluasi)">HOTS (Analisis, Evaluasi & Kreasi)</option>
                  <option value="MOTS (Penerapan)">MOTS (Penerapan Aplikasi)</option>
                  <option value="LOTS (Pemahaman dasar)">LOTS (Pemahaman & Pengetahuan)</option>
                </select>
              </div>
            </>
          )}

          {activeTool === 'catatan_raport' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Siswa</label>
                <select
                  value={raportSiswaId}
                  onChange={(e) => setRaportSiswaId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                >
                  {activeSiswaList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama} ({s.nisn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Capaian Positif & Kelebihan Siswa</label>
                <textarea
                  rows={3}
                  value={raportKelebihan}
                  onChange={(e) => setRaportKelebihan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hal yang Perlu Ditingkatkan / Disarani</label>
                <textarea
                  rows={2}
                  value={raportPerbaikan}
                  onChange={(e) => setRaportPerbaikan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800"
                />
              </div>
            </>
          )}

          <button
            onClick={handleGenerateAI}
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Memproses AI Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Hasilkan Dokumen dengan AI</span>
              </>
            )}
          </button>
        </div>

        {/* Right Output Area (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between min-h-[400px]">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>Hasil Output AI Gemini</span>
              </h3>

              {resultText && (
                <button
                  onClick={handleCopyText}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-600" />
                      <span>Salin Teks</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {errorMessage && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium mb-3">
                {errorMessage}
              </div>
            )}

            {isLoading ? (
              <div className="p-12 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-800">
                  AI Gemini sedang menyusun dokumen Kurikulum Merdeka...
                </p>
                <p className="text-[11px] text-slate-500">
                  Menyesuaikan struktur standar Kemendikbudristek & kebutuhan pembelajaran.
                </p>
              </div>
            ) : resultText ? (
              <div className="prose prose-xs max-w-none text-slate-800 leading-relaxed font-sans whitespace-pre-line bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 max-h-[500px] overflow-y-auto">
                {resultText}
              </div>
            ) : (
              <div className="p-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">
                  Hasil Generasi AI Akan Tampil Di Sini
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Atur parameter di panel kiri lalu klik "Hasilkan Dokumen dengan AI".
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

function activeKelasIdName(state: SiaguState, kelasId: string): string {
  const k = state.kelas.find((kl) => kl.id === kelasId);
  return k ? k.namaKelas : kelasId;
}
