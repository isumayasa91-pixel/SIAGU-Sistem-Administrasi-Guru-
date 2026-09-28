import React, { useState } from 'react';
import {
  BookOpenCheck,
  Plus,
  Calendar,
  Clock,
  FileText,
  Trash2,
  Edit,
  Users,
  Printer,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  UserCheck,
} from 'lucide-react';
import { SiaguState } from '../../utils/storage';
import { JurnalKBM, AbsensiRecord } from '../../types/siagu';
import { useNotification } from '../../context/NotificationContext';
import { getTeacherMapelForKelas, getVisibleKelas } from '../../utils/guruAssignment';

interface JurnalViewProps {
  state: SiaguState;
  onUpdateJurnal: (updatedRecords: JurnalKBM[]) => void;
  onUpdateAbsensi?: (updatedRecords: AbsensiRecord[]) => void;
  onNavigateToReport?: () => void;
}

export const JurnalView: React.FC<JurnalViewProps> = ({
  state,
  onUpdateJurnal,
  onUpdateAbsensi,
  onNavigateToReport,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingJurnalId, setEditingJurnalId] = useState<string | null>(null);
  const [showAttendanceDetails, setShowAttendanceDetails] = useState<boolean>(false);
  const { notifySuccess } = useNotification();
  const user = state.currentUser;
  const visibleClasses = getVisibleKelas(user, state);

  const activeKelas =
    visibleClasses.find((k) => k.id === state.activeKelasId) ||
    state.kelas.find((k) => k.id === state.activeKelasId) ||
    visibleClasses[0] ||
    state.kelas[0];

  const teacherMapel = getTeacherMapelForKelas(user, activeKelas.id, state);

  const jamMengajarList = [
    'Jam 1-2',
    'Jam 1-3',
    'Jam 3-4',
    'Jam 3-5',
    'Jam 4-5',
    'Jam 4-6',
    'Jam 5-6',
    'Jam 5-7',
    'Jam 6-7',
    'Jam 6-8',
    'Jam 7-8',
    'Jam 7-9',
  ];

  const [formTanggal, setFormTanggal] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [formJamKe, setFormJamKe] = useState<string>('Jam 1-2');
  const [formKelasId, setFormKelasId] = useState<string>(activeKelas.id);
  const [formMapelId, setFormMapelId] = useState<string>(teacherMapel.id);
  const [formMateri, setFormMateri] = useState<string>('');
  const [formTP, setFormTP] = useState<string>('');
  const [formKegiatan, setFormKegiatan] = useState<string>('');
  const [formCatatan, setFormCatatan] = useState<string>('');

  // Filter journal records for active class
  const jurnalInActiveKelas = state.jurnal.filter((j) => j.kelasId === activeKelas.id);

  // Real-time attendance computation for formKelasId and formTanggal
  const classStudents = state.siswa.filter((s) => s.kelasId === formKelasId);

  const dateAttendanceMap = new Map<string, AbsensiRecord>();
  state.absensi.forEach((a) => {
    if (a.tanggal === formTanggal && a.kelasId === formKelasId) {
      dateAttendanceMap.set(a.siswaId, a);
    }
  });

  let hadirCount = 0;
  let sakitCount = 0;
  let izinCount = 0;
  let alpaCount = 0;

  const studentsWithStatus = classStudents.map((s) => {
    const rec = dateAttendanceMap.get(s.id);
    const status = rec ? rec.status : 'H';
    if (status === 'H') hadirCount++;
    else if (status === 'S') sakitCount++;
    else if (status === 'I') izinCount++;
    else if (status === 'A') alpaCount++;
    return {
      siswa: s,
      status,
      catatan: rec?.keterangan || '',
      recordId: rec?.id,
    };
  });

  const absentStudents = studentsWithStatus.filter((item) => item.status !== 'H');

  const handleQuickSetAttendance = (siswaId: string, newStatus: 'H' | 'S' | 'I' | 'A') => {
    if (!onUpdateAbsensi) return;
    const existing = state.absensi.find(
      (a) => a.siswaId === siswaId && a.tanggal === formTanggal && a.kelasId === formKelasId
    );

    let updatedAbsensi: AbsensiRecord[];
    if (existing) {
      updatedAbsensi = state.absensi.map((a) =>
        a.id === existing.id ? { ...a, status: newStatus } : a
      );
    } else {
      const newRec: AbsensiRecord = {
        id: `ABS_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        siswaId,
        kelasId: formKelasId,
        tanggal: formTanggal,
        status: newStatus,
        jamInput: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      updatedAbsensi = [...state.absensi, newRec];
    }
    onUpdateAbsensi(updatedAbsensi);
  };

  const handleAutoInsertAbsenceNote = () => {
    if (absentStudents.length === 0) {
      const msg = `Semua siswa (${classStudents.length} orang) hadir lengkap. KBM berlangsung tertib dan kondusif.`;
      setFormCatatan((prev) => (prev ? `${prev}\n${msg}` : msg));
      notifySuccess('Keterangan seluruh siswa hadir disalin ke catatan.', 'Catatan Disinkronkan');
      return;
    }

    const sakitList = absentStudents
      .filter((s) => s.status === 'S')
      .map((s) => s.siswa.nama + (s.catatan ? ` (${s.catatan})` : ''));
    const izinList = absentStudents
      .filter((s) => s.status === 'I')
      .map((s) => s.siswa.nama + (s.catatan ? ` (${s.catatan})` : ''));
    const alpaList = absentStudents
      .filter((s) => s.status === 'A')
      .map((s) => s.siswa.nama + (s.catatan ? ` (${s.catatan})` : ''));

    const parts: string[] = [];
    if (sakitList.length > 0) parts.push(`Sakit (${sakitList.length}): ${sakitList.join(', ')}`);
    if (izinList.length > 0) parts.push(`Izin (${izinList.length}): ${izinList.join(', ')}`);
    if (alpaList.length > 0) parts.push(`Alpa (${alpaList.length}): ${alpaList.join(', ')}`);

    const summaryText = `Presensi KBM: Hadir ${hadirCount}/${classStudents.length} siswa. ${parts.join('. ')}.`;
    setFormCatatan((prev) => (prev ? `${prev}\n${summaryText}` : summaryText));
    notifySuccess('Rincian siswa sakit/izin/alpa berhasil disalin ke catatan kejadian!', 'Catatan Disinkronkan');
  };

  const handleOpenAddModal = () => {
    const curMapel = getTeacherMapelForKelas(user, activeKelas.id, state);
    setEditingJurnalId(null);
    setFormTanggal(new Date().toISOString().split('T')[0]);
    setFormJamKe('Jam 1-2');
    setFormKelasId(activeKelas.id);
    setFormMapelId(curMapel.id);
    setFormMateri('');
    setFormTP('');
    setFormKegiatan('');
    setFormCatatan('');
    setShowAttendanceDetails(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (j: JurnalKBM) => {
    setEditingJurnalId(j.id);
    setFormTanggal(j.tanggal);
    setFormJamKe(j.jamKe || 'Jam 1-2');
    setFormKelasId(j.kelasId);
    setFormMapelId(j.mapelId);
    setFormMateri(j.materiPokok);
    setFormTP(j.tujuanPembelajaran);
    setFormKegiatan(j.kegiatanPembelajaran);
    setFormCatatan(j.catatanKejadian);
    setShowAttendanceDetails(false);
    setIsModalOpen(true);
  };

  const handleChangeFormKelas = (newKelasId: string) => {
    setFormKelasId(newKelasId);
    const assignedMapel = getTeacherMapelForKelas(user, newKelasId, state);
    setFormMapelId(assignedMapel.id);
  };

  const handleSaveJurnal = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingJurnalId) {
      const updatedList = state.jurnal.map((j) => {
        if (j.id === editingJurnalId) {
          return {
            ...j,
            tanggal: formTanggal,
            jamKe: formJamKe,
            kelasId: formKelasId,
            mapelId: formMapelId,
            materiPokok: formMateri,
            tujuanPembelajaran: formTP,
            kegiatanPembelajaran: formKegiatan,
            jumlahHadir: hadirCount,
            jumlahSakit: sakitCount,
            jumlahIzin: izinCount,
            jumlahAlpa: alpaCount,
            catatanKejadian: formCatatan,
          };
        }
        return j;
      });
      onUpdateJurnal(updatedList);
      notifySuccess('Perubahan Jurnal KBM berhasil disimpan!', 'Jurnal Berhasil Disimpan');
    } else {
      const newJurnal: JurnalKBM = {
        id: `KBM_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        tanggal: formTanggal,
        jamKe: formJamKe,
        kelasId: formKelasId,
        mapelId: formMapelId,
        materiPokok: formMateri,
        tujuanPembelajaran: formTP,
        kegiatanPembelajaran: formKegiatan,
        jumlahHadir: hadirCount,
        jumlahSakit: sakitCount,
        jumlahIzin: izinCount,
        jumlahAlpa: alpaCount,
        catatanKejadian: formCatatan,
      };
      onUpdateJurnal([newJurnal, ...state.jurnal]);
      notifySuccess('Agenda Jurnal KBM baru berhasil disimpan!', 'Jurnal Berhasil Disimpan');
    }

    setIsModalOpen(false);
  };

  const handleDeleteJurnal = (id: string) => {
    if (confirm('Hapus entri jurnal mengajar ini?')) {
      onUpdateJurnal(state.jurnal.filter((j) => j.id !== id));
      notifySuccess('Entri jurnal berhasil dihapus.', 'Jurnal Dihapus');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold border border-emerald-400/30 flex items-center gap-1.5 shadow-2xs">
              <BookOpenCheck className="w-3.5 h-3.5" />
              <span>Agenda Harian & Portofolio Guru</span>
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Jurnal KBM · Kelas {activeKelas.namaKelas}
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Catatan materi pokok, tujuan pembelajaran, ringkasan aktivitas kelas, dan sinkronisasi presensi siswa secara real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onNavigateToReport && (
            <button
              onClick={onNavigateToReport}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer border border-white/20"
            >
              <Printer className="w-4 h-4 text-emerald-300" />
              <span>Cetak Rekap Jurnal</span>
            </button>
          )}

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Isi Jurnal Hari Ini</span>
          </button>
        </div>
      </div>

      {/* Logbook Entries */}
      <div className="space-y-4">
        {jurnalInActiveKelas.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-dashed border-slate-300 text-center">
            <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">Belum Ada Jurnal Mengajar</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Catat jurnal mengajar harian Anda untuk melengkapi portofolio administrasi guru.
            </p>
          </div>
        ) : (
          jurnalInActiveKelas.map((j) => (
            <div
              key={j.id}
              className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:border-emerald-300 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{j.tanggal}</span>
                  </span>
                  <span className="px-2 py-1 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-extrabold border border-emerald-200 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{j.jamKe || 'Jam 1-2'}</span>
                  </span>
                  <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-lg">
                    Kelas {j.kelasId} · {j.mapelId}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      H: <b className="text-emerald-700">{j.jumlahHadir}</b> · S: <b className="text-amber-700">{j.jumlahSakit}</b> · I: <b className="text-blue-700">{j.jumlahIzin}</b> · A: <b className="text-rose-700">{j.jumlahAlpa}</b>
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenEditModal(j)}
                    className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit Jurnal"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteJurnal(j.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                    title="Hapus Entri Jurnal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  {j.materiPokok}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  <b>Tujuan Pembelajaran:</b> {j.tujuanPembelajaran}
                </p>
              </div>

              {j.kegiatanPembelajaran && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-700 whitespace-pre-line">
                  <span className="font-bold text-slate-900 block mb-1">
                    Ringkasan Kegiatan KBM:
                  </span>
                  {j.kegiatanPembelajaran}
                </div>
              )}

              {j.catatanKejadian && (
                <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200/60 text-xs text-amber-900">
                  <span className="font-bold block mb-0.5">Catatan Kejadian / Refleksi Guru:</span>
                  {j.catatanKejadian}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal Add/Edit Jurnal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {editingJurnalId ? 'Edit Jurnal Mengajar KBM' : 'Input Jurnal Mengajar KBM'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Isi agenda materi, jam mengajar, dan sinkronkan presensi siswa hari ini.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveJurnal} className="space-y-4">
              {/* Row 1: Tanggal & Jam Mengajar */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal KBM</label>
                  <input
                    type="date"
                    value={formTanggal}
                    onChange={(e) => setFormTanggal(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jam Mengajar (Sesi KBM)</label>
                  <select
                    value={formJamKe}
                    onChange={(e) => setFormJamKe(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    {jamMengajarList.map((jam) => (
                      <option key={jam} value={jam}>
                        {jam}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Kelas & Mapel */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kelas Target (Diampu)</label>
                  <select
                    value={formKelasId}
                    onChange={(e) => handleChangeFormKelas(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
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
                  <select
                    value={formMapelId}
                    onChange={(e) => setFormMapelId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {state.mapel.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nama} ({m.kode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Live Attendance Sync Panel */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-black text-slate-900">
                      Presensi Siswa Hari Ini ({formTanggal})
                    </span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                      {classStudents.length} Siswa di Kelas {formKelasId}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAttendanceDetails(!showAttendanceDetails)}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{showAttendanceDetails ? 'Sembunyikan Rincian Siswa' : 'Kelola Presensi Siswa'}</span>
                    {showAttendanceDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Summary Badges */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-emerald-100/70 border border-emerald-200/80 rounded-xl p-2">
                    <span className="text-[10px] font-bold text-emerald-800 block">Hadir (H)</span>
                    <b className="text-base font-extrabold text-emerald-900">{hadirCount}</b>
                  </div>

                  <div className="bg-amber-100/70 border border-amber-200/80 rounded-xl p-2">
                    <span className="text-[10px] font-bold text-amber-800 block">Sakit (S)</span>
                    <b className="text-base font-extrabold text-amber-900">{sakitCount}</b>
                  </div>

                  <div className="bg-blue-100/70 border border-blue-200/80 rounded-xl p-2">
                    <span className="text-[10px] font-bold text-blue-800 block">Izin (I)</span>
                    <b className="text-base font-extrabold text-blue-900">{izinCount}</b>
                  </div>

                  <div className="bg-rose-100/70 border border-rose-200/80 rounded-xl p-2">
                    <span className="text-[10px] font-bold text-rose-800 block">Alpa (A)</span>
                    <b className="text-base font-extrabold text-rose-900">{alpaCount}</b>
                  </div>
                </div>

                {/* Absence Summary & Quick Copy Button */}
                {absentStudents.length > 0 ? (
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-rose-700 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Siswa Tidak Masuk ({absentStudents.length} Orang):</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleAutoInsertAbsenceNote}
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                        title="Salin rincian siswa sakit/izin/alpa ke Catatan Refleksi Guru"
                      >
                        <Copy className="w-3 h-3 text-emerald-600" />
                        <span>Salin ke Catatan Guru</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {absentStudents.map((item) => (
                        <span
                          key={item.siswa.id}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-bold border flex items-center gap-1 ${
                            item.status === 'S'
                              ? 'bg-amber-50 text-amber-900 border-amber-300'
                              : item.status === 'I'
                              ? 'bg-blue-50 text-blue-900 border-blue-300'
                              : 'bg-rose-50 text-rose-900 border-rose-300'
                          }`}
                        >
                          <span>{item.siswa.nama}</span>
                          <span className="text-[9px] uppercase px-1 py-0.2 bg-white/80 rounded font-extrabold">
                            {item.status === 'S' ? 'Sakit' : item.status === 'I' ? 'Izin' : 'Alpa'}
                          </span>
                          {item.catatan && <span className="text-[10px] text-slate-500">({item.catatan})</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-50/80 p-2 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 font-semibold flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Semua siswa hadir lengkap pada tanggal ini.</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAutoInsertAbsenceNote}
                      className="text-[10px] text-emerald-800 underline font-bold cursor-pointer"
                    >
                      Salin ke Catatan
                    </button>
                  </div>
                )}

                {/* Expandable Quick Attendance Editor */}
                {showAttendanceDetails && (
                  <div className="bg-white p-3 rounded-xl border border-slate-200 max-h-48 overflow-y-auto space-y-1.5 divide-y divide-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Ubah Cepat Presensi Siswa ({formKelasId}):
                    </span>
                    {studentsWithStatus.map((item, idx) => (
                      <div key={item.siswa.id} className="pt-1.5 flex items-center justify-between gap-2 text-xs">
                        <span className="font-bold text-slate-800 truncate">
                          {idx + 1}. {item.siswa.nama}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {(['H', 'S', 'I', 'A'] as const).map((st) => (
                            <button
                              type="button"
                              key={st}
                              onClick={() => handleQuickSetAttendance(item.siswa.id, st)}
                              className={`w-6 h-6 rounded-md text-[10px] font-extrabold transition-all cursor-pointer ${
                                item.status === st
                                  ? st === 'H'
                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                    : st === 'S'
                                    ? 'bg-amber-500 text-white shadow-2xs'
                                    : st === 'I'
                                    ? 'bg-blue-600 text-white shadow-2xs'
                                    : 'bg-rose-600 text-white shadow-2xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Materi Pokok / Pembahasan</label>
                <input
                  type="text"
                  placeholder="e.g. Pengamatan Struktur Sel Tumbuhan & Sel Hewan"
                  value={formMateri}
                  onChange={(e) => setFormMateri(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tujuan Pembelajaran (TP)</label>
                <input
                  type="text"
                  placeholder="e.g. Siswa dapat membedakan organel sel tumbuhan melalui mikroskop"
                  value={formTP}
                  onChange={(e) => setFormTP(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ringkasan Kegiatan Pembelajaran</label>
                <textarea
                  rows={3}
                  placeholder="1. Pendahuluan & Apersepsi&#10;2. Praktikum kelompok pengamatan preparat&#10;3. Presentasi LKPD"
                  value={formKegiatan}
                  onChange={(e) => setFormKegiatan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Catatan Kejadian / Refleksi Guru</label>
                  <button
                    type="button"
                    onClick={handleAutoInsertAbsenceNote}
                    className="text-[10px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Sisipkan Ringkasan Presensi Siswa</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  placeholder="e.g. Siswa antusias, 2 siswa perlu pendampingan saat pemfokusan lensa mikroskop."
                  value={formCatatan}
                  onChange={(e) => setFormCatatan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
                >
                  {editingJurnalId ? 'Simpan Perubahan' : 'Simpan Jurnal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
