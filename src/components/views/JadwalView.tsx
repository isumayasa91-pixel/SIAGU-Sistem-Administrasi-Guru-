import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Building2,
  Trash2,
  Edit,
  BookOpen,
} from 'lucide-react';
import { SiaguState } from '../../utils/storage';
import { JadwalMengajar } from '../../types/siagu';
import { useNotification } from '../../context/NotificationContext';
import { getTeacherMapelForKelas, getVisibleKelas, getVisibleMapelForKelas } from '../../utils/guruAssignment';

interface JadwalViewProps {
  state: SiaguState;
  onUpdateJadwal: (updatedRecords: JadwalMengajar[]) => void;
}

export const JadwalView: React.FC<JadwalViewProps> = ({ state, onUpdateJadwal }) => {
  const [selectedHari, setSelectedHari] = useState<JadwalMengajar['hari']>('Senin');

  const user = state.currentUser;
  const isSiswa = user?.role === 'siswa';
  const visibleClasses = getVisibleKelas(user, state);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingJadwalId, setEditingJadwalId] = useState<string | null>(null);
  const { notifySuccess } = useNotification();

  const activeKelas =
    visibleClasses.find((k) => k.id === state.activeKelasId) ||
    state.kelas.find((k) => k.id === state.activeKelasId) ||
    visibleClasses[0] ||
    state.kelas[0];

  const teacherMapel = getTeacherMapelForKelas(user, activeKelas.id, state);

  const [formHari, setFormHari] = useState<JadwalMengajar['hari']>('Senin');
  const [formJamKe, setFormJamKe] = useState<number>(1);
  const [formJamMulai, setFormJamMulai] = useState<string>('07:30');
  const [formJamSelesai, setFormJamSelesai] = useState<string>('09:00');
  const [formKelasId, setFormKelasId] = useState<string>(activeKelas.id);
  const [formMapelId, setFormMapelId] = useState<string>(teacherMapel.id);
  const [formRuangan, setFormRuangan] = useState<string>('R. Lab IPA 1');
  const [formTopik, setFormTopik] = useState<string>('');

  const hariList: JadwalMengajar['hari'][] = [
    'Senin',
    'Selasa',
    'Rabu',
    'Kamis',
    'Jumat',
    'Sabtu',
  ];

  // Filter schedule strictly according to assigned classes
  const teacherJadwalAll = state.jadwal.filter((j) => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'siswa') return j.kelasId === state.activeKelasId;
    
    // Guru: show schedules for assigned classes
    return visibleClasses.some((k) => k.id === j.kelasId);
  });

  const filteredJadwal = teacherJadwalAll.filter((j) => j.hari === selectedHari);

  const handleChangeFormKelas = (newKelasId: string) => {
    setFormKelasId(newKelasId);
    const assignedMapel = getTeacherMapelForKelas(user, newKelasId, state);
    setFormMapelId(assignedMapel.id);
  };

  const handleOpenAddModal = () => {
    if (isSiswa) return;
    const curMapel = getTeacherMapelForKelas(user, activeKelas.id, state);
    setEditingJadwalId(null);
    setFormHari(selectedHari);
    setFormJamKe(1);
    setFormJamMulai('07:30');
    setFormJamSelesai('09:00');
    setFormKelasId(activeKelas.id);
    setFormMapelId(curMapel.id);
    setFormRuangan('R. Lab IPA 1');
    setFormTopik('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (j: JadwalMengajar) => {
    if (isSiswa) return;
    setEditingJadwalId(j.id);
    setFormHari(j.hari);
    setFormJamKe(j.jamKe);
    setFormJamMulai(j.jamMulai);
    setFormJamSelesai(j.jamSelesai);
    setFormKelasId(j.kelasId);
    setFormMapelId(j.mapelId);
    setFormRuangan(j.ruangan);
    setFormTopik(j.topikRencana || '');
    setIsModalOpen(true);
  };

  const handleSaveJadwal = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSiswa) return;

    if (editingJadwalId) {
      const updatedList = state.jadwal.map((j) => {
        if (j.id === editingJadwalId) {
          return {
            ...j,
            hari: formHari,
            jamKe: Number(formJamKe),
            jamMulai: formJamMulai,
            jamSelesai: formJamSelesai,
            kelasId: formKelasId,
            mapelId: formMapelId,
            ruangan: formRuangan,
            topikRencana: formTopik,
          };
        }
        return j;
      });
      onUpdateJadwal(updatedList);
      notifySuccess(`Perubahan jadwal ${formHari} jam ke-${formJamKe} berhasil disimpan!`, 'Jadwal Berhasil Disimpan');
    } else {
      const newRecord: JadwalMengajar = {
        id: `J_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        hari: formHari,
        jamKe: Number(formJamKe),
        jamMulai: formJamMulai,
        jamSelesai: formJamSelesai,
        kelasId: formKelasId,
        mapelId: formMapelId,
        ruangan: formRuangan,
        topikRencana: formTopik,
      };
      onUpdateJadwal([...state.jadwal, newRecord]);
      notifySuccess(`Jadwal mengajar baru ${formHari} jam ke-${formJamKe} berhasil disimpan!`, 'Jadwal Berhasil Disimpan');
    }

    setIsModalOpen(false);
  };

  const handleDeleteJadwal = (id: string) => {
    if (isSiswa) return;
    if (confirm('Hapus sesi jadwal mengajar ini?')) {
      onUpdateJadwal(state.jadwal.filter((j) => j.id !== id));
      notifySuccess('Sesi jadwal mengajar berhasil dihapus.', 'Jadwal Dihapus');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <span>{isSiswa ? 'Jadwal Pembelajaran Kelas' : 'Jadwal Mengajar Mingguan Guru'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sesi KBM, alokasi jam, ruangan lab/kelas, serta topik materi pembelajaran.
          </p>
        </div>

        {!isSiswa && (
          <button
            onClick={handleOpenAddModal}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Sesi Mengajar</span>
          </button>
        )}
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-1 bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs overflow-x-auto">
        {hariList.map((hari) => {
          const isActive = selectedHari === hari;
          const count = teacherJadwalAll.filter((j) => j.hari === hari).length;
          return (
            <button
              key={hari}
              onClick={() => setSelectedHari(hari)}
              className={`flex-1 min-w-[100px] py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>{hari}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Timetable Cards for Selected Day */}
      <div className="space-y-3">
        {filteredJadwal.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-dashed border-slate-300 text-center">
            <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">
              Tidak Ada Sesi Pembelajaran Hari {selectedHari}
            </p>
          </div>
        ) : (
          filteredJadwal.map((j) => (
            <div
              key={j.id}
              className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:border-emerald-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center shrink-0">
                  <span className="text-[9px] text-slate-300 font-bold uppercase">Sesi</span>
                  <span className="text-lg font-black">{j.jamKe}</span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-slate-900">
                      Kelas {j.kelasId}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100/80 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      <span>{j.ruangan}</span>
                    </span>
                  </div>

                  <p className="text-xs font-medium text-slate-700 mt-1.5">
                    Mata Pelajaran: <span className="font-bold text-slate-900">{j.mapelId}</span>
                  </p>

                  {j.topikRencana && (
                    <p className="text-xs text-slate-500 mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      Topik: <span className="font-medium text-slate-800">{j.topikRencana}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-0 border-slate-100">
                <div className="text-right">
                  <div className="text-sm font-black font-mono text-slate-900">
                    {j.jamMulai} - {j.jamSelesai}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">Waktu Indonesia Tengah</div>
                </div>

                {!isSiswa && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(j)}
                      className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Sesi Jadwal"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteJadwal(j.id)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Sesi Jadwal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Schedule Modal (Non-Siswa Only) */}
      {!isSiswa && isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              {editingJadwalId ? 'Edit Sesi Mengajar' : 'Tambah Sesi Mengajar Baru'}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Konfigurasi hari, waktu, kelas, dan topik materi.
            </p>

            <form onSubmit={handleSaveJadwal} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hari</label>
                  <select
                    value={formHari}
                    onChange={(e) => setFormHari(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
                  >
                    {hariList.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jam Ke-</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formJamKe}
                    onChange={(e) => setFormJamKe(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    value={formJamMulai}
                    onChange={(e) => setFormJamMulai(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    value={formJamSelesai}
                    onChange={(e) => setFormJamSelesai(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    required
                  />
                </div>
              </div>

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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ruangan / Lab</label>
                  <input
                    type="text"
                    placeholder="e.g. R. Lab IPA 1"
                    value={formRuangan}
                    onChange={(e) => setFormRuangan(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                    required
                  />
                </div>
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

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rencana Topik Materi</label>
                <input
                  type="text"
                  placeholder="e.g. Klasifikasi Organel Sel"
                  value={formTopik}
                  onChange={(e) => setFormTopik(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
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
                  {editingJadwalId ? 'Simpan Perubahan' : 'Simpan Sesi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
