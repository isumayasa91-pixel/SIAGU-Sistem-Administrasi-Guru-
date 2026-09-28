import React, { useState } from 'react';
import {
  Printer,
  FileText,
  Calendar,
  Building2,
  Users,
  BookOpenCheck,
} from 'lucide-react';
import { SiaguState } from '../../utils/storage';
import { calculateNilaiSiswa, calculateAbsensiSiswa } from '../../utils/calculations';

interface LaporanViewProps {
  state: SiaguState;
}

type LaporanType = 'rekap_nilai' | 'rekap_absensi' | 'jurnal_kbm';

export const LaporanView: React.FC<LaporanViewProps> = ({ state }) => {
  const [reportType, setReportType] = useState<LaporanType>('jurnal_kbm');

  const activeKelas =
    state.kelas.find((k) => k.id === state.activeKelasId) || state.kelas[0];
  const siswaList = state.siswa.filter((s) => s.kelasId === state.activeKelasId);
  const currentMapelObj = state.mapel[0];
  const jurnalInActiveKelas = state.jurnal.filter(
    (j) => j.kelasId === state.activeKelasId
  );

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Bar for Report Config (Hidden when printing) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-600" />
            <span>Cetak Rekap & Laporan Resmi Kop Sekolah</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pilih format dokumen resmi untuk dicetak langsung atau disimpan sebagai PDF.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setReportType('jurnal_kbm')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                reportType === 'jurnal_kbm'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Jurnal KBM
            </button>

            <button
              onClick={() => setReportType('rekap_nilai')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                reportType === 'rekap_nilai'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rekap Nilai
            </button>

            <button
              onClick={() => setReportType('rekap_absensi')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                reportType === 'rekap_absensi'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rekap Presensi
            </button>
          </div>

          <button
            onClick={handleTriggerPrint}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Official Printable Report Container */}
      <div className="bg-white p-8 md:p-12 rounded-2xl border border-slate-200/80 shadow-md print-container">
        
        {/* Official Kop Sekolah */}
        <div className="flex items-center justify-between border-b-4 border-double border-slate-900 pb-4 mb-6 gap-4 text-center">
          {/* Logo Kabupaten / Pemda (Left) */}
          <div className="w-20 h-20 flex items-center justify-center shrink-0">
            {state.pengaturanSekolah.logoKabupatenUrl ? (
              <img
                src={state.pengaturanSekolah.logoKabupatenUrl}
                alt="Logo Pemda"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="w-16 h-16 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400 font-bold p-1">
                Logo Pemda
              </div>
            )}
          </div>

          {/* School Header Text (Center) */}
          <div className="flex-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-700">
              {state.pengaturanSekolah.namaKabupaten || 'Pemerintah Kota Denpasar'} · Dinas Pendidikan
            </h2>
            <h1 className="text-xl font-black uppercase text-slate-900 tracking-tight mt-0.5">
              {state.pengaturanSekolah.namaSekolah}
            </h1>
            <p className="text-[11px] text-slate-600 font-medium mt-0.5">
              {state.pengaturanSekolah.alamatSekolah} · Telp: {state.pengaturanSekolah.teleponSekolah} · NPSN: {state.pengaturanSekolah.npsn}
            </p>
          </div>

          {/* Logo Sekolah (Right) */}
          <div className="w-20 h-20 flex items-center justify-center shrink-0">
            {state.pengaturanSekolah.logoSekolahUrl ? (
              <img
                src={state.pengaturanSekolah.logoSekolahUrl}
                alt="Logo Sekolah"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="w-16 h-16 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400 font-bold p-1">
                Logo Sekolah
              </div>
            )}
          </div>
        </div>

        {/* Document Title Header */}
        <div className="text-center mb-6">
          <h3 className="text-base font-extrabold uppercase text-slate-900 underline tracking-wider">
            {reportType === 'jurnal_kbm' && 'JURNAL PELAKSANAAN KEGIATAN BELAJAR MENGAJAR (KBM)'}
            {reportType === 'rekap_nilai' && 'LAPORAN REKAPITULASI NILAI CAPAIAN PEMBELAJARAN'}
            {reportType === 'rekap_absensi' && 'LAPORAN REKAPITULASI PRESENSI KEHADIRAN SISWA'}
          </h3>
          <p className="text-xs text-slate-600 font-bold mt-1">
            Tahun Ajaran {state.pengaturanSekolah.tahunAjaran} — Semester {state.pengaturanSekolah.semester}
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-800 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <div><span className="text-slate-500">Mata Pelajaran:</span> <b>{state.profil.mataPelajaranUtama}</b></div>
            <div><span className="text-slate-500">Kelas Target:</span> <b>{activeKelas.namaKelas}</b></div>
          </div>
          <div>
            <div><span className="text-slate-500">Guru Pengampu:</span> <b>{state.profil.nama}</b></div>
            <div><span className="text-slate-500">NIP Guru:</span> <b>{state.profil.nip}</b></div>
          </div>
        </div>

        {/* Table Content: Jurnal KBM */}
        {reportType === 'jurnal_kbm' && (
          <div className="overflow-x-auto">
            {jurnalInActiveKelas.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-300 rounded-lg">
                Belum ada data jurnal KBM tercatat untuk {activeKelas.namaKelas}.
              </div>
            ) : (
              <table className="w-full text-left border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-slate-100 text-[11px] font-bold text-slate-900 uppercase">
                    <th className="border border-slate-300 py-2 px-3 text-center w-10">No</th>
                    <th className="border border-slate-300 py-2 px-3 w-28">Tanggal</th>
                    <th className="border border-slate-300 py-2 px-3">Materi Pokok / Pembahasan</th>
                    <th className="border border-slate-300 py-2 px-3">Tujuan Pembelajaran (TP)</th>
                    <th className="border border-slate-300 py-2 px-3 text-center w-28">Kehadiran</th>
                    <th className="border border-slate-300 py-2 px-3">Catatan / Refleksi</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-slate-800">
                  {jurnalInActiveKelas.map((j, idx) => (
                    <tr key={j.id} className="border-b border-slate-200">
                      <td className="border border-slate-300 py-2.5 px-3 text-center font-mono">{idx + 1}</td>
                      <td className="border border-slate-300 py-2.5 px-3 font-mono font-bold whitespace-nowrap">{j.tanggal}</td>
                      <td className="border border-slate-300 py-2.5 px-3 font-bold">{j.materiPokok}</td>
                      <td className="border border-slate-300 py-2.5 px-3">{j.tujuanPembelajaran}</td>
                      <td className="border border-slate-300 py-2.5 px-3 text-center font-mono text-[11px]">
                        H:{j.jumlahHadir} S:{j.jumlahSakit} I:{j.jumlahIzin} A:{j.jumlahAlpa}
                      </td>
                      <td className="border border-slate-300 py-2.5 px-3 text-slate-700 italic">
                        {j.catatanKejadian || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Table Content: Rekap Nilai */}
        {reportType === 'rekap_nilai' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-[11px] font-bold text-slate-900 uppercase">
                  <th className="border border-slate-300 py-2 px-3 text-center w-10">No</th>
                  <th className="border border-slate-300 py-2 px-3">NISN</th>
                  <th className="border border-slate-300 py-2 px-3">Nama Siswa</th>
                  <th className="border border-slate-300 py-2 px-3 text-center">Rata Tugas</th>
                  <th className="border border-slate-300 py-2 px-3 text-center">Rata UH</th>
                  <th className="border border-slate-300 py-2 px-3 text-center">PTS</th>
                  <th className="border border-slate-300 py-2 px-3 text-center">PAS</th>
                  <th className="border border-slate-300 py-2 px-3 text-center font-bold">Nilai Akhir</th>
                  <th className="border border-slate-300 py-2 px-3 text-center">Predikat</th>
                  <th className="border border-slate-300 py-2 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-800">
                {siswaList.map((s, idx) => {
                  const rekap = calculateNilaiSiswa(
                    s,
                    state.nilai,
                    'IPA',
                    currentMapelObj?.kkm || 75
                  );
                  return (
                    <tr key={s.id} className="border-b border-slate-200">
                      <td className="border border-slate-300 py-2 px-3 text-center font-mono">{idx + 1}</td>
                      <td className="border border-slate-300 py-2 px-3 font-mono">{s.nisn}</td>
                      <td className="border border-slate-300 py-2 px-3 font-bold">{s.nama}</td>
                      <td className="border border-slate-300 py-2 px-3 text-center font-mono">{rekap.rataTugas || '-'}</td>
                      <td className="border border-slate-300 py-2 px-3 text-center font-mono">{rekap.rataUH || '-'}</td>
                      <td className="border border-slate-300 py-2 px-3 text-center font-mono">{rekap.nilaiPTS ?? '-'}</td>
                      <td className="border border-slate-300 py-2 px-3 text-center font-mono">{rekap.nilaiPAS ?? '-'}</td>
                      <td className="border border-slate-300 py-2 px-3 text-center font-mono font-black">{rekap.nilaiAkhir}</td>
                      <td className="border border-slate-300 py-2 px-3 text-center font-extrabold">{rekap.predikat}</td>
                      <td className="border border-slate-300 py-2 px-3 text-center font-bold">
                        {rekap.statusTuntas ? 'TUNTAS' : 'REMIDIAL'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Content: Rekap Absensi */}
        {reportType === 'rekap_absensi' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-[11px] font-bold text-slate-900 uppercase">
                  <th className="border border-slate-300 py-2 px-3 text-center w-10">No</th>
                  <th className="border border-slate-300 py-2 px-3">NISN</th>
                  <th className="border border-slate-300 py-2 px-3">Nama Siswa</th>
                  <th className="border border-slate-300 py-2 px-3 text-center">Hadir (H)</th>
                  <th className="border border-slate-300 py-2 px-3 text-center">Sakit (S)</th>
                  <th className="border border-slate-300 py-2 px-3 text-center">Izin (I)</th>
                  <th className="border border-slate-300 py-2 px-3 text-center">Alpa (A)</th>
                  <th className="border border-slate-300 py-2 px-3 text-center font-bold">% Kehadiran</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-800">
                {siswaList.map((s, idx) => {
                  const stat = calculateAbsensiSiswa(s.id, state.absensi);
                  return (
                    <tr key={s.id} className="border-b border-slate-200">
                      <td className="border border-slate-300 py-2 px-3 text-center font-mono">{idx + 1}</td>
                      <td className="border border-slate-300 py-2 px-3 font-mono">{s.nisn}</td>
                      <td className="border border-slate-300 py-2 px-3 font-bold">{s.nama}</td>
                      <td className="border border-slate-300 py-2 px-3 text-center font-mono text-emerald-700 font-bold">{stat.hadir}</td>
                      <td className="border border-slate-300 py-2 px-3 text-center font-mono text-amber-700">{stat.sakit}</td>
                      <td className="border border-slate-300 py-2 px-3 text-center font-mono text-blue-700">{stat.izin}</td>
                      <td className="border border-slate-300 py-2 px-3 text-center font-mono text-rose-700">{stat.alpa}</td>
                      <td className="border border-slate-300 py-2 px-3 text-center font-mono font-black">{stat.persenHadir}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Signature Blocks */}
        <div className="mt-12 grid grid-cols-2 gap-8 text-center text-xs font-medium text-slate-900">
          <div>
            <p>Mengetahui,</p>
            <p className="font-bold mt-1">Kepala Sekolah {state.pengaturanSekolah.namaSekolah}</p>
            <div className="h-16" />
            <p className="font-bold underline">{state.pengaturanSekolah.namaKepalaSekolah}</p>
            <p className="text-[10px] text-slate-600 font-mono">NIP: {state.pengaturanSekolah.nipKepalaSekolah}</p>
          </div>

          <div>
            <p>Denpasar, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-bold mt-1">Guru Mata Pelajaran</p>
            <div className="h-16" />
            <p className="font-bold underline">{state.profil.nama}</p>
            <p className="text-[10px] text-slate-600 font-mono">NIP: {state.profil.nip}</p>
          </div>
        </div>

      </div>

    </div>
  );
};
