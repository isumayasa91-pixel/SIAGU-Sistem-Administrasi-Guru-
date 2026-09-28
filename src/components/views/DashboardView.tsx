import React from 'react';
import {
  Users,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen,
  Calendar,
  AlertTriangle,
  QrCode,
  FileSpreadsheet,
} from 'lucide-react';
import { SiaguState } from '../../utils/storage';
import { ActiveTab } from '../../types/siagu';
import { calculateNilaiSiswa } from '../../utils/calculations';

interface DashboardViewProps {
  state: SiaguState;
  onNavigate: (tab: ActiveTab) => void;
  onOpenQrScanner: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  state,
  onNavigate,
  onOpenQrScanner,
}) => {
  const activeKelas = state.kelas.find((k) => k.id === state.activeKelasId) || state.kelas[0];
  const siswaInActiveKelas = state.siswa.filter((s) => s.kelasId === state.activeKelasId);

  // Today's date string
  const todayStr = new Date().toISOString().split('T')[0];
  const daysIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const dayNameToday = daysIndo[new Date().getDay()];

  // Today's Schedule
  const jadwalToday = state.jadwal.filter(
    (j) => j.hari === dayNameToday || j.hari === 'Senin' // fallback demo
  );

  // Today's Attendance in active class
  const absensiTodayActive = state.absensi.filter(
    (a) => a.tanggal === todayStr && a.kelasId === state.activeKelasId
  );

  const totalSiswaCount = siswaInActiveKelas.length;
  const recordedCount = absensiTodayActive.length;
  const hadirCount = absensiTodayActive.filter((a) => a.status === 'H').length;
  const sakitCount = absensiTodayActive.filter((a) => a.status === 'S').length;
  const izinCount = absensiTodayActive.filter((a) => a.status === 'I').length;
  const alpaCount = absensiTodayActive.filter((a) => a.status === 'A').length;

  const persenKehadiran =
    totalSiswaCount > 0 && recordedCount > 0
      ? Math.round((hadirCount / totalSiswaCount) * 100)
      : recordedCount === 0
      ? 0
      : 100;

  // Grade averages in active class
  const rekapNilaiList = siswaInActiveKelas.map((s) =>
    calculateNilaiSiswa(s, state.nilai, 'IPA', 75)
  );

  const avgClassGrade =
    rekapNilaiList.length > 0
      ? Math.round(
          (rekapNilaiList.reduce((acc, curr) => acc + curr.nilaiAkhir, 0) /
            rekapNilaiList.length) *
            10
        ) / 10
      : 0;

  const countPredikatA = rekapNilaiList.filter((r) => r.predikat === 'A').length;
  const countPredikatB = rekapNilaiList.filter((r) => r.predikat === 'B').length;
  const countPredikatC = rekapNilaiList.filter((r) => r.predikat === 'C').length;
  const countPredikatD = rekapNilaiList.filter((r) => r.predikat === 'D').length;

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-radial from-white to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
                {state.currentUser?.role === 'admin'
                  ? 'Portal Administrator'
                  : state.currentUser?.role === 'siswa'
                  ? 'Portal Siswa'
                  : 'Selamat Datang Guru'}
              </span>
              <span className="text-xs text-slate-300 font-medium">
                {dayNameToday}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {state.currentUser?.nama || state.profil.nama}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
              {state.currentUser?.role === 'admin'
                ? `Pengelolaan data master sekolah, rombel kelas, akun guru, dan direktori siswa di ${state.pengaturanSekolah.namaSekolah}.`
                : `Pantau administrasi ${activeKelas.namaKelas} · Mata Pelajaran ${state.profil.mataPelajaranUtama} di ${state.profil.sekolah}.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('absensi')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Input Absensi Hari Ini</span>
            </button>

            <button
              onClick={onOpenQrScanner}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Scan QR Presensi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Siswa {activeKelas.namaKelas}
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {totalSiswaCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">Siswa Aktif</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span>Wali Kelas:</span>
            <span className="font-semibold text-slate-700 truncate">{activeKelas.waliKelas}</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Rata-Rata Nilai
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {avgClassGrade}
            </span>
            <span className={`text-xs font-semibold ${avgClassGrade >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>
              / 100 (KKM: 75)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {countPredikatA + countPredikatB} dari {totalSiswaCount} siswa di atas KKM
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Kehadiran Hari Ini
            </span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {persenKehadiran}%
            </span>
            <span className="text-xs text-slate-500 font-medium">
              ({hadirCount}/{totalSiswaCount} Hadir)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-2">
            <span className="text-amber-600 font-medium">S: {sakitCount}</span>
            <span>·</span>
            <span className="text-blue-600 font-medium">I: {izinCount}</span>
            <span>·</span>
            <span className="text-rose-600 font-medium">A: {alpaCount}</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Jadwal Sesi Hari Ini
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {jadwalToday.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">Sesi Mengajar</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 truncate">
            {jadwalToday.length > 0 ? `Sesi 1: ${jadwalToday[0].jamMulai} - Kelas ${jadwalToday[0].kelasId}` : 'Tidak ada jadwal mengajar hari ini'}
          </div>
        </div>

      </div>

      {/* Main Grid: Today's Schedule Widget & Grade Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Teaching Schedule Today */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Jadwal Mengajar Hari Ini ({dayNameToday})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitoring ruangan dan topik pembelajaran yang dipersiapkan
              </p>
            </div>
            <button
              onClick={() => onNavigate('jadwal')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Mingguan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {jadwalToday.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">Tidak Ada Sesi Mengajar Hari Ini</p>
              <p className="text-[11px] text-slate-500 mt-1">Gunakan waktu untuk merekap nilai atau menyiapkan Modul Ajar AI.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jadwalToday.map((j, idx) => (
                <div
                  key={j.id}
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="px-3 py-2 bg-slate-900 text-white rounded-lg text-center shrink-0">
                      <span className="text-[10px] font-medium block uppercase text-slate-300">Jam Ke</span>
                      <span className="text-base font-extrabold">{j.jamKe}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          Kelas {j.kelasId}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">·</span>
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          {j.ruangan}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-600 mt-1">
                        Topik: <span className="text-slate-800">{j.topikRencana || 'Materi Pokok Semester'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-200/60">
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 block tabular-nums">
                        {j.jamMulai} - {j.jamSelesai}
                      </span>
                      <span className="text-[10px] text-slate-500">WITA</span>
                    </div>

                    <button
                      onClick={() => onNavigate('jurnal')}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Isi Jurnal
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick AI Tool Promotion */}
          <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-emerald-200/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">
                  Butuh Modul Ajar atau Soal HOTS Baru?
                </h3>
                <p className="text-[11px] text-slate-600">
                  Gunakan Asisten Guru Gemini untuk menyusun RPP Kurikulum Merdeka secara otomatis.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('ai_assistant')}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer"
            >
              Buka AI Guru
            </button>
          </div>
        </div>

        {/* Right Column: Grade Predicate Distribution & Quick Shortcuts */}
        <div className="space-y-6">
          
          {/* Grade Distribution */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
            <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center justify-between">
              <span>Sebaran Predikat Nilai</span>
              <span className="text-xs font-semibold text-slate-500">{activeKelas.namaKelas}</span>
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Berdasarkan akumulasi Tugas, UH, dan PTS/PAS
            </p>

            <div className="space-y-3">
              {/* Predikat A */}
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Sangat Baik (A ≥ 90)</span>
                  <span className="font-bold text-emerald-700">{countPredikatA} Siswa</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${totalSiswaCount > 0 ? (countPredikatA / totalSiswaCount) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Predikat B */}
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Baik (B: 80-89)</span>
                  <span className="font-bold text-blue-700">{countPredikatB} Siswa</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${totalSiswaCount > 0 ? (countPredikatB / totalSiswaCount) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Predikat C */}
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Cukup (C: 75-79)</span>
                  <span className="font-bold text-amber-700">{countPredikatC} Siswa</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${totalSiswaCount > 0 ? (countPredikatC / totalSiswaCount) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Predikat D */}
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Perlu Bimbingan (D &lt; 75)</span>
                  <span className="font-bold text-rose-700">{countPredikatD} Siswa</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-rose-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${totalSiswaCount > 0 ? (countPredikatD / totalSiswaCount) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={() => onNavigate('nilai')}
                className="text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Kelola Matrix Nilai Lengkap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
            <h2 className="text-base font-bold text-slate-900 mb-3">Aksi Cepat Guru</h2>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onNavigate('nilai')}
                className="p-3 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200/80 rounded-xl text-left transition-colors cursor-pointer group"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-900 block">Input Nilai</span>
                <span className="text-[10px] text-slate-500">Tugas & UH</span>
              </button>

              <button
                onClick={() => onNavigate('laporan')}
                className="p-3 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200/80 rounded-xl text-left transition-colors cursor-pointer group"
              >
                <BookOpen className="w-4 h-4 text-purple-600 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-900 block">Cetak Rekap</span>
                <span className="text-[10px] text-slate-500">Format Kop Raport</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
