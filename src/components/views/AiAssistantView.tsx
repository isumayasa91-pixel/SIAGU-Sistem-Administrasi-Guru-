import React, { useState, useEffect } from 'react';
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
  FileDown,
  Printer,
  Award,
  Users,
  CheckCircle2,
  Zap,
  GraduationCap,
  Layers,
  BookCheck,
  Flame,
  FileSpreadsheet,
  Table as TableIcon,
} from 'lucide-react';
import { SiaguState } from '../../utils/storage';
import { calculateNilaiSiswa, calculateAbsensiSiswa } from '../../utils/calculations';
import { getTeacherMapelForKelas, getVisibleKelas } from '../../utils/guruAssignment';
import { useNotification } from '../../context/NotificationContext';
import { ModulAjarTableDocument } from '../modul/ModulAjarTableDocument';
import { EvaluasiAsesmenTableDocument } from '../modul/EvaluasiAsesmenTableDocument';
import { CatatanRaportTableDocument } from '../modul/CatatanRaportTableDocument';

interface AiAssistantViewProps {
  state: SiaguState;
}

type AiToolMode = 'modul_ajar' | 'soal_hots' | 'catatan_raport';

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({ state }) => {
  const [activeTool, setActiveTool] = useState<AiToolMode>('modul_ajar');
  const [viewMode, setViewMode] = useState<'table' | 'markdown'>('table');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [resultText, setResultText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { notifySuccess, notifyError } = useNotification();

  const user = state.currentUser;
  const visibleClasses = getVisibleKelas(user, state);
  const [selectedKelasId, setSelectedKelasId] = useState<string>(
    visibleClasses.find((k) => k.id === state.activeKelasId)?.id || visibleClasses[0]?.id || state.kelas[0].id
  );

  const activeTeacherMapel = getTeacherMapelForKelas(user, selectedKelasId, state);
  const activeKelasObj = state.kelas.find((k) => k.id === selectedKelasId) || state.kelas[0];
  const activeSiswaList = state.siswa.filter((s) => s.kelasId === selectedKelasId);

  // Sync selected class when active class in header changes
  useEffect(() => {
    if (visibleClasses.some((k) => k.id === state.activeKelasId)) {
      setSelectedKelasId(state.activeKelasId);
    }
  }, [state.activeKelasId]);

  // ==================== Form States for Modul Ajar ====================
  const [maMapel, setMaMapel] = useState<string>(activeTeacherMapel.nama);
  const [maFase, setMaFase] = useState<string>('Fase D (SMP)');
  const [maTingkatKelas, setMaTingkatKelas] = useState<string>('Kelas 7');
  const [maTopik, setMaTopik] = useState<string>('Pengamatan Struktur Sel & Mikroskop');
  const [maModel, setMaModel] = useState<string>('Problem-Based Learning (PBL)');
  const [maAlokasi, setMaAlokasi] = useState<string>('2 x 40 menit (1 Pertemuan)');
  const [maDimensiPancasila, setMaDimensiPancasila] = useState<string[]>([
    'Keimanan dan Ketaqwaan terhadap Tuhan YME',
    'Penalaran Kritis',
    'Kreativitas',
    'Kolaborasi',
  ]);
  const [maTujuan, setMaTujuan] = useState<string>(
    'Siswa mampu menganalisis organel sel tumbuhan dan hewan serta mempresentasikan hasil preparat basah dengan teliti.'
  );

  // ==================== Form States for Soal HOTS ====================
  const [soalMapel, setSoalMapel] = useState<string>(activeTeacherMapel.nama);
  const [soalFase, setSoalFase] = useState<string>('Fase D (SMP)');
  const [soalTingkatKelas, setSoalTingkatKelas] = useState<string>('Kelas 7');
  const [soalTopik, setSoalTopik] = useState<string>('Struktur Sel, Jaringan & Keanekaragaman Hayati');
  const [soalLevelKognitif, setSoalLevelKognitif] = useState<string>('Level 3 (C4 Analisis, C5 Evaluasi, C6 Kreasi)');
  const [soalModel, setSoalModel] = useState<string>('Kontekstual AKM / Literasi Numerasi');
  const [soalJumlahPilihan, setSoalJumlahPilihan] = useState<number>(5);
  const [soalJumlahEssay, setSoalJumlahEssay] = useState<number>(2);

  // ==================== Form States for Catatan Raport ====================
  const [raportSiswaId, setRaportSiswaId] = useState<string>(activeSiswaList[0]?.id || '');
  const [raportKelebihan, setRaportKelebihan] = useState<string>(
    'Memiliki rasa ingin tahu yang tinggi, aktif bertanya dalam diskusi kelompok, dan teliti saat praktikum.'
  );
  const [raportPerbaikan, setRaportPerbaikan] = useState<string>(
    'Perlu terus mempertahankan semangat belajar dan meningkatkan ketepatan waktu dalam mengumpulkan tugas mandiri.'
  );

  // Auto-sync mapel fields and grade level when selectedKelasId changes
  useEffect(() => {
    const curMapel = getTeacherMapelForKelas(user, selectedKelasId, state);
    setMaMapel(curMapel.nama);
    setSoalMapel(curMapel.nama);
    
    // Auto-detect grade level from class name
    const currentClassObj = state.kelas.find((k) => k.id === selectedKelasId);
    if (currentClassObj) {
      const name = currentClassObj.namaKelas.toUpperCase();
      if (name.includes('7') || name.includes('VII')) {
        setMaTingkatKelas('Kelas 7');
        setSoalTingkatKelas('Kelas 7');
      } else if (name.includes('8') || name.includes('VIII')) {
        setMaTingkatKelas('Kelas 8');
        setSoalTingkatKelas('Kelas 8');
      } else if (name.includes('9') || name.includes('IX')) {
        setMaTingkatKelas('Kelas 9');
        setSoalTingkatKelas('Kelas 9');
      }
    }

    const studentsInClass = state.siswa.filter((s) => s.kelasId === selectedKelasId);
    if (studentsInClass.length > 0 && !studentsInClass.some((s) => s.id === raportSiswaId)) {
      setRaportSiswaId(studentsInClass[0].id);
    }
  }, [selectedKelasId]);

  const selectedSiswaObj = activeSiswaList.find((s) => s.id === raportSiswaId) || activeSiswaList[0];

  // Calculate live stats for selected student
  const studentNilaiRekap = selectedSiswaObj
    ? calculateNilaiSiswa(selectedSiswaObj, state.nilai, activeTeacherMapel.id, activeTeacherMapel.kkm)
    : null;
  const studentAbsensiRekap = selectedSiswaObj
    ? calculateAbsensiSiswa(selectedSiswaObj.id, state.absensi)
    : null;

  // Auto-populate student academic summary into raport fields
  const handleAutoFillStudentData = () => {
    if (!selectedSiswaObj || !studentNilaiRekap || !studentAbsensiRekap) return;

    let positiveText = '';
    let improvementText = '';

    if (studentNilaiRekap.nilaiAkhir >= 90) {
      positiveText = `Sangat unggul dalam penguasaan materi ${activeTeacherMapel.nama} (Nilai Akhir: ${studentNilaiRekap.nilaiAkhir}, Predikat A). Menunjukkan pemahaman konsep yang luar biasa serta kepemimpinan positif dalam pembelajaran.`;
    } else if (studentNilaiRekap.nilaiAkhir >= 80) {
      positiveText = `Menguasai materi ${activeTeacherMapel.nama} dengan sangat baik (Nilai Akhir: ${studentNilaiRekap.nilaiAkhir}, Predikat B). Mampu menyelesaikan asesmen tugas dan UH secara mandiri dan tuntas di atas KKM (${activeTeacherMapel.kkm}).`;
    } else if (studentNilaiRekap.statusTuntas) {
      positiveText = `Mencapai ketuntasan belajar yang baik pada mata pelajaran ${activeTeacherMapel.nama} (Nilai: ${studentNilaiRekap.nilaiAkhir}). Berpartisipasi aktif dalam kegiatan belajar mengajar di kelas.`;
    } else {
      positiveText = `Memiliki potensi yang baik dan selalu menunjukkan iktikad untuk belajar pada mata pelajaran ${activeTeacherMapel.nama}.`;
    }

    if (studentAbsensiRekap.hadir >= 10 && studentAbsensiRekap.alpa === 0) {
      positiveText += ` Memiliki rekam kehadiran yang sangat disiplin (${studentAbsensiRekap.persenHadir}% hadir).`;
    }

    if (studentNilaiRekap.nilaiAkhir >= 85) {
      improvementText = `Pertahankan prestasi yang gemilang ini dan terus kembangkan kemampuan analisis bernalar kritis ke tingkat yang lebih tinggi.`;
    } else if (!studentNilaiRekap.statusTuntas) {
      improvementText = `Diharapkan lebih fokus dan meluangkan waktu untuk pendalaman materi serta latihan soal mandiri agar capaian pembelajaran dapat melampaui KKM secara optimal.`;
    } else {
      improvementText = `Tingkatkan lagi keaktifan bertanya serta ketelitian dalam pengerjaan lembar kerja agar memperoleh nilai yang semakin maksimal.`;
    }

    if (studentAbsensiRekap.sakit > 2 || studentAbsensiRekap.izin > 2) {
      improvementText += ` Jaga kesehatan agar konsistensi kehadiran di sekolah tetap optimal.`;
    }

    setRaportKelebihan(positiveText);
    setRaportPerbaikan(improvementText);
    notifySuccess(`Data akademik & presensi ${selectedSiswaObj.nama} berhasil dimuat ke form!`, 'Data Terisi Otomatis');
  };

  const handleTogglePancasila = (dimensi: string) => {
    if (maDimensiPancasila.includes(dimensi)) {
      setMaDimensiPancasila(maDimensiPancasila.filter((d) => d !== dimensi));
    } else {
      setMaDimensiPancasila([...maDimensiPancasila, dimensi]);
    }
  };

  const handleGenerateAI = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setResultText('');

    let prompt = '';
    let systemInstruction = '';

    if (activeTool === 'modul_ajar') {
      systemInstruction =
        'Anda adalah Pakar Pengembang Kurikulum Merdeka Kemendikbudristek Indonesia. Hasilkan Modul Ajar (RPP) yang komprehensif, inspiratif, terstruktur rapi, berpusat pada siswa (student-centered), dan siap digunakan langsung oleh guru di kelas.';
      prompt = `Buatkan Dokumen Lengkap MODUL AJAR KURIKULUM MERDEKA dengan rincian:
- Satuan Pendidikan: ${state.pengaturanSekolah.namaSekolah}
- Mata Pelajaran: ${maMapel}
- Fase Kurikulum: ${maFase}
- Tingkat Kelas: ${maTingkatKelas} (Rombel ${activeKelasObj.namaKelas})
- Topik / Materi Pembelajaran: ${maTopik}
- Model Pembelajaran: ${maModel}
- Alokasi Waktu: ${maAlokasi}
- Dimensi Profil Lulusan & Karakter: ${maDimensiPancasila.join(', ')}
- Tujuan Pembelajaran: ${maTujuan}

Sajikan modul ajar secara sistematis dengan struktur:
1. INFORMASI UMUM (Identitas Modul, Kompetensi Awal, Dimensi Profil Lulusan / Karakter Siswa, Sarana & Prasarana, Target Peserta Didik, Model Pembelajaran)
2. KOMPONEN INTI (Tujuan Pembelajaran, Pemahaman Bermakna, Pertanyaan Pemantik, Persiapan Pembelajaran)
3. KEGIATAN PEMBELAJARAN LENGKAP (Pendahuluan [10-15 Menit], Kegiatan Inti berbasis sintaks ${maModel} secara bertahap [50-60 Menit], Penutup [10-15 Menit])
4. ASESMEN & EVALUASI (Asesmen Diagnostik, Asesmen Formatif saat proses KBM, Asesmen Sumatif/LKPD)
5. PENGAYAAN & REMEDIAL
6. REFLEKSI GURU & PESERTA DIDIK
7. LAMPIRAN (Ringkasan Materi Bahan Bacaan Siswa, Glosarium, dan Daftar Pustaka).`;
    } else if (activeTool === 'soal_hots') {
      systemInstruction =
        'Anda adalah Pengembang Asesmen Standar Nasional Kemendikbudristek. Buatkan paket kisi-kisi dan naskah soal evaluasi berkualitas tinggi dengan stimulus kasus kontekstual, tingkat kesukaran HOTS, kunci jawaban, dan rubrik penskoran.';
      prompt = `Buatkan Paket KISI-KISI & SOAL EVALUASI ASESMEN KURIKULUM MERDEKA:
- Mata Pelajaran: ${soalMapel}
- Fase Kurikulum: ${soalFase}
- Tingkat Kelas: ${soalTingkatKelas} (Rombel ${activeKelasObj.namaKelas})
- Materi / Topik: ${soalTopik}
- Tingkat Kognitif: ${soalLevelKognitif}
- Model Asesmen: ${soalModel}
- Jumlah Pilihan Ganda: ${soalJumlahPilihan} butir (Opsi A, B, C, D)
- Jumlah Uraian / Essay: ${soalJumlahEssay} butir

Format penyajian harus mencakup secara terstruktur:
1. MATRIKS KISI-KISI PENULISAN SOAL ASESMEN (Tabel Matriks: No, Capaian Pembelajaran, Tujuan Pembelajaran, Lingkup Materi, Indikator Soal, Level Kognitif L1/L2/L3, Bentuk Soal, Nomor Soal, Bobot)
2. PETUNJUK PENGERJAAN SOAL
3. BAGIAN I: SOAL PILIHAN GANDA (Sertakan stimulus kasus kontekstual, nomor urut berurutan, opsi A-D)
4. BAGIAN II: SOAL ESSAY / URAIAN HOTS (Analisis studi kasus, pemecahan masalah kontekstual)
5. KUNCI JAWABAN LENGKAP & PEMBAHASAN MENDALAM
6. PEDOMAN PENSKORAN & RUBRIK PENILAIAN ANALITIK (Skor 0-100).`;
    } else if (activeTool === 'catatan_raport') {
      systemInstruction =
        'Anda adalah Wali Kelas dan Konselor Pendidikan berpengalaman. Susunlah narasi catatan raport yang bijak, menyentuh hati, memotivasi, santun, serta memberikan arah pengembangan karakter yang jelas bagi siswa dan orang tua.';
      prompt = `Buatkan Narasi CATATAN WALI KELAS & CAPAIAN RAPORT SISWA SEMESTER KURIKULUM MERDEKA:
- Nama Siswa: ${selectedSiswaObj?.nama || 'Siswa'}
- NISN: ${selectedSiswaObj?.nisn || '-'}
- Kelas: ${activeKelasObj.namaKelas}
- Nilai Rata-rata / Capaian Akademik: ${studentNilaiRekap ? `${studentNilaiRekap.nilaiAkhir} (Predikat ${studentNilaiRekap.predikat} - ${studentNilaiRekap.statusTuntas ? 'Tuntas' : 'Perlu Bimbingan'})` : 'Baik'}
- Kehadiran: ${studentAbsensiRekap ? `${studentAbsensiRekap.persenHadir}% (Hadir: ${studentAbsensiRekap.hadir}, Sakit: ${studentAbsensiRekap.sakit}, Izin: ${studentAbsensiRekap.izin}, Alpa: ${studentAbsensiRekap.alpa})` : 'Baik'}
- Potensi & Kelebihan Siswa: ${raportKelebihan}
- Rekomendasi & Hal yang Perlu Ditingkatkan: ${raportPerbaikan}

Susun 3 VARIASI OPSI CATATAN NARASI RAPORT:
1. Opsi 1 (Gaya Formal & Apresiatif): Bahasa baku edukatif, menekankan capaian akademik dan apresiasi karakter.
2. Opsi 2 (Gaya Motivatif & Humanis): Bahasa santun, ramah, hangat, membesarkan hati dan membakar semangat belajar anak.
3. Opsi 3 (Gaya Ringkas & Fokus Target): Bahasa padat, to-the-point, jelas poin kelebihan dan langkah konkret semester depan.

Berikan juga 1 Catatan Khusus untuk Orang Tua/Wali Siswa untuk pendampingan belajar di rumah.`;
    }

    const metaPayload = {
      mapel: activeTool === 'modul_ajar' ? maMapel : activeTool === 'soal_hots' ? soalMapel : activeTeacherMapel.nama,
      kelas: activeKelasObj.namaKelas,
      topik: activeTool === 'modul_ajar' ? maTopik : activeTool === 'soal_hots' ? soalTopik : '',
      model: maModel,
      alokasi: maAlokasi,
      dimensi: maDimensiPancasila,
      tujuan: maTujuan,
      siswaNama: selectedSiswaObj?.nama || 'Peserta Didik',
      nilai: studentNilaiRekap ? `${studentNilaiRekap.nilaiAkhir}` : '85',
      predikat: studentNilaiRekap ? studentNilaiRekap.predikat : 'A',
      kehadiran: studentAbsensiRekap ? `${studentAbsensiRekap.persenHadir}%` : '100%',
    };

    try {
      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          systemInstruction,
          toolType: activeTool,
          meta: metaPayload,
        }),
      });

      const rawText = await res.text();
      let data: any = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch (pErr) {
        console.warn('Could not parse JSON response:', rawText);
        throw new Error('Respons server tidak valid. Silakan coba sesaat lagi.');
      }

      if (!res.ok && !data.text) {
        throw new Error(data.error || 'Gagal terhubung dengan server AI Gemini.');
      }

      const generatedContent = data.text || 'Tidak ada teks yang dihasilkan.';
      setResultText(generatedContent);
      notifySuccess(
        `Dokumen ${activeTool === 'modul_ajar' ? 'Modul Ajar' : activeTool === 'soal_hots' ? 'Soal HOTS' : 'Catatan Raport'} berhasil digenerate AI!`,
        'AI Gemini Berhasil'
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat memproses generator AI Gemini.');
      notifyError(err.message || 'Gagal menghasilkan dokumen AI.', 'Kesalahan AI');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = () => {
    if (!resultText) return;
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    notifySuccess('Seluruh teks hasil AI berhasil disalin ke papan klip.', 'Tersalin');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadFile = () => {
    if (!resultText) return;
    const blob = new Blob([resultText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `${activeTool}_${activeKelasObj.namaKelas}_${new Date().toISOString().split('T')[0]}.md`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    notifySuccess(`File ${filename} berhasil diunduh ke perangkat Anda!`, 'File Berhasil Disimpan');
  };

  const handleDownloadWord = () => {
    if (!resultText) return;
    const sekolah = state.pengaturanSekolah;
    const currentDateStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const docContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${activeTool.toUpperCase()} - ${activeKelasObj.namaKelas}</title>
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
          h1, h2, h3 { color: #0f172a; margin-top: 10pt; margin-bottom: 4pt; }
          h1 { font-size: 13pt; text-align: center; }
          h2 { font-size: 11.5pt; }
          h3 { font-size: 10.5pt; }
          pre, code { font-family: 'Courier New', monospace; font-size: 9.5pt; }
        </style>
      </head>
      <body>
        <div class="Section1">
          <div style="text-align: center; border-bottom: 2pt solid #000000; padding-bottom: 6pt; margin-bottom: 12pt;">
            <p style="margin: 0; font-size: 10pt; font-weight: bold; text-transform: uppercase;">PEMERINTAH KABUPATEN KEDIRI · DINAS PENDIDIKAN</p>
            <p style="margin: 2pt 0; font-size: 14pt; font-weight: bold; text-transform: uppercase;">${sekolah.namaSekolah}</p>
            <p style="margin: 0; font-size: 9.5pt;">${sekolah.alamatSekolah} · Telp: ${sekolah.teleponSekolah} ${sekolah.emailSekolah ? `· Email: ${sekolah.emailSekolah}` : ''}</p>
          </div>
          
          <div style="white-space: pre-wrap; font-family: inherit;">
            ${resultText.replace(/\n/g, '<br/>')}
          </div>

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
                  <b>Guru Pengampu</b><br><br><br><br>
                  <b><u>${user?.nama || 'Guru Pengampu'}</u></b><br>
                  NIP. ${user?.nip || '-'}
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
    const filename = `${activeTool}_${activeKelasObj.namaKelas}_${new Date().toISOString().split('T')[0]}.doc`;
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    notifySuccess(`Dokumen Word ${filename} berhasil diunduh!`, 'File Word Tersimpan');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-radial from-white to-transparent pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-extrabold border border-amber-400/30 flex items-center gap-1.5 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Gemini 3.8 Assistant · SIAGU</span>
            </span>
            <span className="text-xs text-emerald-200 font-semibold hidden sm:inline">
              Kurikulum Merdeka Edition
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Generator Pembelajaran & Raport AI
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
            Asisten cerdas bagi guru untuk merancang <b>Modul Ajar RPP</b>, menyusun <b>Paket Soal HOTS & Rubrik Penskoran</b>, serta mengompilasi <b>Catatan Raport Naratif Siswa</b> secara otomatis.
          </p>
        </div>

        {/* Quick Context Indicator */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 text-xs shrink-0 self-start md:self-center">
          <div className="flex items-center gap-2 text-emerald-300 font-bold mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>Konteks Kelas & Guru:</span>
          </div>
          <div className="font-bold text-white">{activeKelasObj.namaKelas} · {activeTeacherMapel.nama}</div>
          <div className="text-[11px] text-slate-300 mt-0.5">{user?.nama || state.profil.nama}</div>
        </div>
      </div>

      {/* Tool Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* Tab 1: Modul Ajar */}
        <button
          onClick={() => {
            setActiveTool('modul_ajar');
            setResultText('');
            setErrorMessage('');
          }}
          className={`p-4 rounded-2xl border transition-all text-left cursor-pointer flex items-start gap-3.5 relative overflow-hidden ${
            activeTool === 'modul_ajar'
              ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-900 shadow-md ring-2 ring-emerald-500/40'
              : 'bg-white text-slate-800 border-slate-200/80 hover:border-emerald-300 shadow-2xs'
          }`}
        >
          <div className={`p-2.5 rounded-xl shrink-0 ${activeTool === 'modul_ajar' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-emerald-50 text-emerald-600'}`}>
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${activeTool === 'modul_ajar' ? 'text-emerald-300' : 'text-emerald-700'}`}>
              Perencanaan KBM
            </span>
            <h3 className="text-sm font-black block mt-0.5">Modul Ajar (RPP)</h3>
            <span className={`text-xs block mt-1 ${activeTool === 'modul_ajar' ? 'text-slate-300' : 'text-slate-500'}`}>
              Sintaks PBL/PjBL, Alokasi & Profil Pancasila
            </span>
          </div>
        </button>

        {/* Tab 2: Soal HOTS & Rubrik */}
        <button
          onClick={() => {
            setActiveTool('soal_hots');
            setResultText('');
            setErrorMessage('');
          }}
          className={`p-4 rounded-2xl border transition-all text-left cursor-pointer flex items-start gap-3.5 relative overflow-hidden ${
            activeTool === 'soal_hots'
              ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-900 shadow-md ring-2 ring-amber-500/40'
              : 'bg-white text-slate-800 border-slate-200/80 hover:border-amber-300 shadow-2xs'
          }`}
        >
          <div className={`p-2.5 rounded-xl shrink-0 ${activeTool === 'soal_hots' ? 'bg-amber-500 text-white shadow-sm' : 'bg-amber-50 text-amber-600'}`}>
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${activeTool === 'soal_hots' ? 'text-amber-300' : 'text-amber-700'}`}>
              Evaluasi & Asesmen
            </span>
            <h3 className="text-sm font-black block mt-0.5">Soal HOTS & Rubrik</h3>
            <span className={`text-xs block mt-1 ${activeTool === 'soal_hots' ? 'text-slate-300' : 'text-slate-500'}`}>
              Pilihan Ganda & Essay + Kunci & Skor
            </span>
          </div>
        </button>

        {/* Tab 3: Catatan Raport Siswa */}
        <button
          onClick={() => {
            setActiveTool('catatan_raport');
            setResultText('');
            setErrorMessage('');
          }}
          className={`p-4 rounded-2xl border transition-all text-left cursor-pointer flex items-start gap-3.5 relative overflow-hidden ${
            activeTool === 'catatan_raport'
              ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-900 shadow-md ring-2 ring-purple-500/40'
              : 'bg-white text-slate-800 border-slate-200/80 hover:border-purple-300 shadow-2xs'
          }`}
        >
          <div className={`p-2.5 rounded-xl shrink-0 ${activeTool === 'catatan_raport' ? 'bg-purple-500 text-white shadow-sm' : 'bg-purple-50 text-purple-600'}`}>
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${activeTool === 'catatan_raport' ? 'text-purple-300' : 'text-purple-700'}`}>
              Laporan Semester
            </span>
            <h3 className="text-sm font-black block mt-0.5">Catatan Raport Siswa</h3>
            <span className={`text-xs block mt-1 ${activeTool === 'catatan_raport' ? 'text-slate-300' : 'text-slate-500'}`}>
              Narasi Berbasis Data Akademik & Presensi
            </span>
          </div>
        </button>

      </div>

      {/* Main Generator Workspace (Grid: Left Form 5 cols, Right Preview 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form Parameter Panel */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-black text-slate-900">
                {activeTool === 'modul_ajar' && 'Parameter Modul Ajar Kurikulum Merdeka'}
                {activeTool === 'soal_hots' && 'Parameter Soal HOTS & Rubrik Asesmen'}
                {activeTool === 'catatan_raport' && 'Parameter Narasi Catatan Raport Siswa'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Sesuaikan opsi di bawah lalu klik Generate AI.
              </p>
            </div>
          </div>

          {/* Class & Subject Selector (Global for all AI tools) */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kelas Target</label>
              <select
                value={selectedKelasId}
                onChange={(e) => setSelectedKelasId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {visibleClasses.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.namaKelas}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mata Pelajaran</label>
              <input
                type="text"
                value={activeTool === 'modul_ajar' ? maMapel : activeTool === 'soal_hots' ? soalMapel : activeTeacherMapel.nama}
                onChange={(e) => {
                  if (activeTool === 'modul_ajar') setMaMapel(e.target.value);
                  else if (activeTool === 'soal_hots') setSoalMapel(e.target.value);
                }}
                className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800"
              />
            </div>
          </div>

          {/* ================= Tool 1: Modul Ajar Form ================= */}
          {activeTool === 'modul_ajar' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fase Kurikulum</label>
                  <select
                    value={maFase}
                    onChange={(e) => setMaFase(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Fase D (SMP Kelas 7, 8, 9)">Fase D (SMP Kelas 7, 8, 9)</option>
                    <option value="Fase A (SD Kelas 1 - 2)">Fase A (SD Kelas 1-2)</option>
                    <option value="Fase B (SD Kelas 3 - 4)">Fase B (SD Kelas 3-4)</option>
                    <option value="Fase C (SD Kelas 5 - 6)">Fase C (SD Kelas 5-6)</option>
                    <option value="Fase E (SMA/SMK Kelas 10)">Fase E (SMA/SMK Kelas 10)</option>
                    <option value="Fase F (SMA/SMK Kelas 11 - 12)">Fase F (SMA/SMK Kelas 11-12)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tingkat Kelas</label>
                  <select
                    value={maTingkatKelas}
                    onChange={(e) => setMaTingkatKelas(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Kelas 7">Kelas 7 (Fase D - Awal)</option>
                    <option value="Kelas 8">Kelas 8 (Fase D - Madya)</option>
                    <option value="Kelas 9">Kelas 9 (Fase D - Akhir)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Alokasi Waktu</label>
                  <input
                    type="text"
                    value={maAlokasi}
                    onChange={(e) => setMaAlokasi(e.target.value)}
                    placeholder="e.g. 2 x 40 menit (1 Pertemuan)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Materi Pokok / Topik Pembelajaran</label>
                <input
                  type="text"
                  value={maTopik}
                  onChange={(e) => setMaTopik(e.target.value)}
                  placeholder="e.g. Pengamatan Struktur Sel dan Mikroskop"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Model Pembelajaran</label>
                <select
                  value={maModel}
                  onChange={(e) => setMaModel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
                >
                  <option value="Problem-Based Learning (PBL)">Problem-Based Learning (PBL - Berbasis Masalah)</option>
                  <option value="Project-Based Learning (PjBL)">Project-Based Learning (PjBL - Berbasis Proyek)</option>
                  <option value="Discovery Learning">Discovery Learning (Penemuan Mandiri)</option>
                  <option value="Inquiry-Based Learning">Inquiry Learning (Penyelidikan Ilmiah)</option>
                  <option value="Differentiated Instruction">Diferensiasi Pembelajaran (Konten, Proses, Produk)</option>
                </select>
              </div>

              {/* Dimensi Profil Lulusan / Karakter Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Dimensi Profil Lulusan & Karakter (Pilih yang Relevan):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Keimanan dan Ketaqwaan terhadap Tuhan YME',
                    'Kewargaan',
                    'Penalaran Kritis',
                    'Kreativitas',
                    'Kolaborasi',
                    'Kemandirian',
                    'Kesehatan',
                    'Komunikasi',
                  ].map((dimensi) => {
                    const isSelected = maDimensiPancasila.includes(dimensi);
                    return (
                      <button
                        type="button"
                        key={dimensi}
                        onClick={() => handleTogglePancasila(dimensi)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {dimensi}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Capaian & Tujuan Pembelajaran</label>
                <textarea
                  rows={3}
                  value={maTujuan}
                  onChange={(e) => setMaTujuan(e.target.value)}
                  placeholder="e.g. Siswa dapat menganalisis perbedaan sel tumbuhan dan hewan melalui praktikum..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* ================= Tool 2: Soal HOTS Form ================= */}
          {activeTool === 'soal_hots' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fase Kurikulum</label>
                  <select
                    value={soalFase}
                    onChange={(e) => setSoalFase(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Fase D (SMP Kelas 7, 8, 9)">Fase D (SMP Kelas 7, 8, 9)</option>
                    <option value="Fase A (SD Kelas 1 - 2)">Fase A (SD Kelas 1-2)</option>
                    <option value="Fase B (SD Kelas 3 - 4)">Fase B (SD Kelas 3-4)</option>
                    <option value="Fase C (SD Kelas 5 - 6)">Fase C (SD Kelas 5-6)</option>
                    <option value="Fase E (SMA/SMK Kelas 10)">Fase E (SMA/SMK Kelas 10)</option>
                    <option value="Fase F (SMA/SMK Kelas 11 - 12)">Fase F (SMA/SMK Kelas 11-12)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tingkat Kelas</label>
                  <select
                    value={soalTingkatKelas}
                    onChange={(e) => setSoalTingkatKelas(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Kelas 7">Kelas 7 (Fase D - Awal)</option>
                    <option value="Kelas 8">Kelas 8 (Fase D - Madya)</option>
                    <option value="Kelas 9">Kelas 9 (Fase D - Akhir)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Topik / Lingkup Materi</label>
                <input
                  type="text"
                  value={soalTopik}
                  onChange={(e) => setSoalTopik(e.target.value)}
                  placeholder="e.g. Sistem Peredaran Darah Manusia & Penyakit Terkait"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Level Kognitif</label>
                  <select
                    value={soalLevelKognitif}
                    onChange={(e) => setSoalLevelKognitif(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
                  >
                    <option value="Level 3 (C4 Analisis, C5 Evaluasi, C6 Kreasi)">HOTS (C4 Analisis, C5 Evaluasi, C6 Kreasi)</option>
                    <option value="Level 2 (C3 Aplikasi & Penerapan Kasus)">MOTS (C3 Penerapan / Aplikasi Kasus)</option>
                    <option value="Level 1 (C1 Pengetahuan & C2 Pemahaman)">LOTS (C1 Pengetahuan & C2 Pemahaman)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Model Stimulus Soal</label>
                  <select
                    value={soalModel}
                    onChange={(e) => setSoalModel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
                  >
                    <option value="Kontekstual AKM / Literasi Numerasi">AKM (Literasi / Data Kontekstual)</option>
                    <option value="Eksperimen / Hasil Praktikum Lab">Studi Kasus Percobaan / Lab</option>
                    <option value="Studi Masalah Kehidupan Sehari-hari">Penyelesaian Masalah Nyata</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jumlah Pilihan Ganda</label>
                  <input
                    type="number"
                    min={1}
                    max={15}
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
                    max={5}
                    value={soalJumlahEssay}
                    onChange={(e) => setSoalJumlahEssay(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 text-xs text-emerald-950 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Otomatis menyusun Matriks Kisi-Kisi Penulisan Soal (CP, TP, Indikator, Level Kognitif).</span>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Otomatis menyertakan Kunci Jawaban Lengkap, Pembahasan Ilmiah, dan Rubrik Penskoran Skor 0-100.</span>
                </div>
              </div>
            </div>
          )}

          {/* ================= Tool 3: Catatan Raport Form ================= */}
          {activeTool === 'catatan_raport' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Siswa ({activeKelasObj.namaKelas})</label>
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

              {/* Live Student Card Snapshot */}
              {selectedSiswaObj && studentNilaiRekap && studentAbsensiRekap && (
                <div className="p-3.5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-emerald-300">
                      {selectedSiswaObj.nama}
                    </span>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">
                      NISN: {selectedSiswaObj.nisn}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-white/10 p-1.5 rounded-lg">
                      <span className="text-[10px] text-slate-300 block">Nilai Akhir</span>
                      <b className="text-base text-emerald-400">{studentNilaiRekap.nilaiAkhir}</b>
                      <span className="text-[10px] text-slate-300 block">({studentNilaiRekap.predikat})</span>
                    </div>

                    <div className="bg-white/10 p-1.5 rounded-lg">
                      <span className="text-[10px] text-slate-300 block">Status KKM</span>
                      <b className={`text-xs block mt-1 ${studentNilaiRekap.statusTuntas ? 'text-emerald-300' : 'text-amber-300'}`}>
                        {studentNilaiRekap.statusTuntas ? 'Tuntas' : 'Bimbingan'}
                      </b>
                    </div>

                    <div className="bg-white/10 p-1.5 rounded-lg">
                      <span className="text-[10px] text-slate-300 block">Kehadiran</span>
                      <b className="text-base text-teal-300">{studentAbsensiRekap.persenHadir}%</b>
                      <span className="text-[10px] text-slate-300 block">H:{studentAbsensiRekap.hadir} S:{studentAbsensiRekap.sakit}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAutoFillStudentData}
                    className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>Muat Rekomendasi dari Database Siswa</span>
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Capaian Positif & Kelebihan Siswa</label>
                <textarea
                  rows={2}
                  value={raportKelebihan}
                  onChange={(e) => setRaportKelebihan(e.target.value)}
                  placeholder="e.g. Menguasai materi dengan sangat baik, kritis dalam praktikum..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rekomendasi / Aspek Perlu Ditingkatkan</label>
                <textarea
                  rows={2}
                  value={raportPerbaikan}
                  onChange={(e) => setRaportPerbaikan(e.target.value)}
                  placeholder="e.g. Pertahankan prestasi dan tingkatkan ketelitian pengerjaan tugas..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                />
              </div>
            </div>
          )}

          {/* Action Trigger Button */}
          <button
            onClick={handleGenerateAI}
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-2xl text-xs font-extrabold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>AI Gemini Sedang Menyusun Dokumen...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>
                  {activeTool === 'modul_ajar' && 'Hasilkan Modul Ajar (RPP) AI'}
                  {activeTool === 'soal_hots' && 'Hasilkan Paket Soal HOTS AI'}
                  {activeTool === 'catatan_raport' && 'Hasilkan Catatan Raport AI'}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Right Output & Preview Area */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col justify-between min-h-[500px]">
          <div>
            {/* Output Header Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Hasil Dokumen AI Gemini 3.8
                </h3>
              </div>

              {resultText && (
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setViewMode('table')}
                      className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        viewMode === 'table'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <TableIcon className="w-3.5 h-3.5" />
                      <span>Format Tabel Resmi</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('markdown')}
                      className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        viewMode === 'markdown'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Teks Asli</span>
                    </button>
                  </div>

                  <button
                    onClick={handleCopyText}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Teks</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownloadWord}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Unduh Dokumen Microsoft Word (.doc)"
                  >
                    <FileDown className="w-3.5 h-3.5 text-blue-600" />
                    <span>Unduh Word (.DOC)</span>
                  </button>

                  <button
                    onClick={handleDownloadFile}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Unduh Berkas Markdown (.md)"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-600" />
                    <span>Unduh .MD</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Cetak Langsung atau Simpan sebagai PDF"
                  >
                    <Printer className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Cetak / PDF</span>
                  </button>
                </div>
              )}
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold mb-4 flex items-center gap-2">
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Body Content / Loading / Empty Placeholder */}
            {isLoading ? (
              <div className="py-20 text-center space-y-4">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="w-16 h-16 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
                  <Sparkles className="w-6 h-6 text-amber-500 absolute inset-0 m-auto" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    AI Gemini sedang menyusun dokumen Kurikulum Merdeka...
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Menyusun data terstruktur, format tabel matriks, dan dokumen terstandarisasi Kemendikbudristek.
                  </p>
                </div>
              </div>
            ) : resultText ? (
              activeTool === 'modul_ajar' && viewMode === 'table' ? (
                <div className="overflow-x-auto max-h-[700px] overflow-y-auto print:max-h-none print:overflow-visible">
                  <ModulAjarTableDocument
                    state={state}
                    mapel={maMapel}
                    fase={maFase}
                    kelas={`${maTingkatKelas} (${activeKelasObj.namaKelas})`}
                    topik={maTopik}
                    model={maModel}
                    alokasi={maAlokasi}
                    dimensiList={maDimensiPancasila}
                    tujuan={maTujuan}
                    generatedText={resultText}
                    onPrint={handlePrint}
                  />
                </div>
              ) : activeTool === 'soal_hots' && viewMode === 'table' ? (
                <div className="overflow-x-auto max-h-[700px] overflow-y-auto print:max-h-none print:overflow-visible">
                  <EvaluasiAsesmenTableDocument
                    state={state}
                    mapel={soalMapel}
                    kelas={`${soalTingkatKelas} (${activeKelasObj.namaKelas})`}
                    fase={soalFase}
                    topik={soalTopik}
                    levelKognitif={soalLevelKognitif}
                    modelAsesmen={soalModel}
                    jumlahPilihan={soalJumlahPilihan}
                    jumlahEssay={soalJumlahEssay}
                    generatedText={resultText}
                    onPrint={handlePrint}
                  />
                </div>
              ) : activeTool === 'catatan_raport' && viewMode === 'table' ? (
                <div className="overflow-x-auto max-h-[700px] overflow-y-auto print:max-h-none print:overflow-visible">
                  <CatatanRaportTableDocument
                    state={state}
                    siswa={selectedSiswaObj}
                    kelas={activeKelasObj.namaKelas}
                    nilaiRekap={studentNilaiRekap}
                    absensiRekap={studentAbsensiRekap}
                    kelebihan={raportKelebihan}
                    perbaikan={raportPerbaikan}
                    generatedText={resultText}
                    onPrint={handlePrint}
                  />
                </div>
              ) : (
                <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 max-h-[600px] overflow-y-auto print:max-h-none print:border-none print:bg-transparent">
                  <div className="text-xs leading-relaxed text-slate-800 space-y-3 whitespace-pre-line font-sans font-medium">
                    {resultText}
                  </div>
                </div>
              )
            ) : (
              <div className="py-20 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-black text-slate-800">
                  Hasil Dokumen AI Akan Tampil di Sini
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Pilih modul yang diinginkan di atas, lengkapi parameter pembelajaran, lalu klik tombol Hasilkan Dokumen.
                </p>
              </div>
            )}
          </div>

          {resultText && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Status: Dokumen siap disalin atau dicetak untuk administrasi KBM.</span>
              <span className="text-emerald-700 font-bold">● AI Model Ready</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
