import React, { useState } from 'react';
import {
  BookOpenCheck,
  Plus,
  Calendar,
  FileText,
  Trash2,
  Edit,
  Users,
  Printer,
} from 'lucide-react';
import { SiaguState } from '../../utils/storage';
import { JurnalKBM } from '../../types/siagu';

interface JurnalViewProps {
  state: SiaguState;
  onUpdateJurnal: (updatedRecords: JurnalKBM[]) => void;
  onNavigateToReport?: () => void;
}

export const JurnalView: React.FC<JurnalViewProps> = ({
  state,
  onUpdateJurnal,
  onNavigateToReport,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingJurnalId, setEditingJurnalId] = useState<string | null>(null);

  const [formTanggal, setFormTanggal] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [formKelasId, setFormKelasId] = useState<string>(state.activeKelasId);
  const [formMapelId, setFormMapelId] = useState<string>('IPA');
  const [formMateri, setFormMateri] = useState<string>('');
  const [formTP, setFormTP] = useState<string>('');
  const [formKegiatan, setFormKegiatan] = useState<string>('');
  const [formCatatan, setFormCatatan] = useState<string>('');

  const activeKelas =
    state.kelas.find((k) => k.id === state.activeKelasId) || state.kelas[0];
  const jurnalInActiveKelas = state.jurnal.filter(
    (j) => j.kelasId === state.activeKelasId
  );

  const handleOpenAddModal = () => {
    setEditingJurnalId(null);
    setFormTanggal(new Date().toISOString().split('T')[0]);
    setFormKelasId(state.activeKelasId);
    setFormMapelId('IPA');
    setFormMateri('');
    setFormTP('');
    setFormKegiatan('');
    setFormCatatan('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (j: JurnalKBM) => {
    setEditingJurnalId(j.id);
    setFormTanggal(j.tanggal);
    setFormKelasId(j.kelasId);
    setFormMapelId(j.mapelId);
    setFormMateri(j.materiPokok);
    setFormTP(j.tujuanPembelajaran);
    setFormKegiatan(j.kegiatanPembelajaran);
    setFormCatatan(j.catatanKejadian);
    setIsModalOpen(true);
  };

  const handleSaveJurnal = (e: React.FormEvent) => {
    e.preventDefault();

    // Auto compute attendance counts for formKelasId and formTanggal
    const recordsToday = state.absensi.filter(
      (a) => a.tanggal === formTanggal && a.kelasId === formKelasId
    );

    const hadir = recordsToday.filter((a) => a.status === 'H').length;
    const sakit = recordsToday.filter((a) => a.status === 'S').length;
    const izin = recordsToday.filter((a) => a.status === 'I').length;
    const alpa = recordsToday.filter((a) => a.status === 'A').length;

    if (editingJurnalId) {
      const updatedList = state.jurnal.map((j) => {
        if (j.id === editingJurnalId) {
          return {
            ...j,
            tanggal: formTanggal,
            kelasId: formKelasId,
            mapelId: formMapelId,
            materiPokok: formMateri,
            tujuanPembelajaran: formTP,
            kegiatanPembelajaran: formKegiatan,
            jumlahHadir: hadir > 0 ? hadir : j.jumlahHadir,
            jumlahSakit: sakit > 0 ? sakit : j.jumlahSakit,
            jumlahIzin: izin > 0 ? izin : j.jumlahIzin,
            jumlahAlpa: alpa > 0 ? alpa : j.jumlahAlpa,
            catatanKejadian: formCatatan,
          };
        }
        return j;
      });
      onUpdateJurnal(updatedList);
    } else {
      const newJurnal: JurnalKBM = {
        id: `KBM_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        tanggal: formTanggal,
        kelasId: formKelasId,
        mapelId: formMapelId,
        materiPokok: formMateri,
        tujuanPembelajaran: formTP,
        kegiatanPembelajaran: formKegiatan,
        jumlahHadir: hadir,
        jumlahSakit: sakit,
        jumlahIzin: izin,
        jumlahAlpa: alpa,
        catatanKejadian: formCatatan,
      };
      onUpdateJurnal([newJurnal, ...state.jurnal]);
    }

    setIsModalOpen(false);
  };

  const handleDeleteJurnal = (id: string) => {
    if (confirm('Hapus entri jurnal mengajar ini?')) {
      onUpdateJurnal(state.jurnal.filter((j) => j.id !== id));
    }
  };

  const handlePrint = () => {
    if (onNavigateToReport) {
      onNavigateToReport();
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpenCheck className="w-5 h-5 text-emerald-600" />
            <span>Jurnal Mengajar KBM · {activeKelas.namaKelas}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Catatan harian keterlaksanaan pembelajaran, materi pokok, serta kejadian khusus di kelas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Cetak Jurnal KBM</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
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
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{j.tanggal}</span>
                  </span>
                  <span className="text-xs font-bold text-slate-900">
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
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              {editingJurnalId ? 'Edit Jurnal Mengajar KBM' : 'Input Jurnal Mengajar KBM'}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Isi pokok materi, kegiatan pembelajaran, dan refleksi kejadian di kelas.
            </p>

            <form onSubmit={handleSaveJurnal} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={formTanggal}
                    onChange={(e) => setFormTanggal(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kelas Target</label>
                  <select
                    value={formKelasId}
                    onChange={(e) => setFormKelasId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
                  >
                    {state.kelas.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.namaKelas}
                      </option>
                    ))}
                  </select>
                </div>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Kejadian / Refleksi Guru</label>
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
