import React, { useState } from 'react';
import {
  BarChart3,
  Plus,
  Download,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  Edit,
  Trash2,
  Printer,
} from 'lucide-react';
import { SiaguState } from '../../utils/storage';
import { NilaiRecord, KategoriNilai, Siswa } from '../../types/siagu';
import { calculateNilaiSiswa } from '../../utils/calculations';

interface NilaiViewProps {
  state: SiaguState;
  onUpdateNilai: (updatedRecords: NilaiRecord[]) => void;
  onNavigateToReport?: () => void;
}

export const NilaiView: React.FC<NilaiViewProps> = ({
  state,
  onUpdateNilai,
  onNavigateToReport,
}) => {
  const [selectedMapel, setSelectedMapel] = useState<string>('IPA');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isSiswa = state.currentUser?.role === 'siswa';

  // Modal State for Adding New Grade
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formSiswaId, setFormSiswaId] = useState<string>('');
  const [formKategori, setFormKategori] = useState<KategoriNilai>('Tugas');
  const [formNamaPenilaian, setFormNamaPenilaian] = useState<string>('Tugas 1');
  const [formCP, setFormCP] = useState<string>('TP 7.1');
  const [formSkor, setFormSkor] = useState<number>(80);
  const [formTanggal, setFormTanggal] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Modal State for Editing Existing Grade Record
  const [editingRecord, setEditingRecord] = useState<NilaiRecord | null>(null);
  const [manageSiswa, setManageSiswa] = useState<Siswa | null>(null);

  const activeKelas =
    state.kelas.find((k) => k.id === state.activeKelasId) || state.kelas[0];
  const siswaList = state.siswa.filter((s) => s.kelasId === state.activeKelasId);
  const currentMapelObj = state.mapel.find((m) => m.id === selectedMapel) || state.mapel[0];

  const filteredSiswa = siswaList.filter(
    (s) =>
      s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.includes(searchQuery)
  );

  const handleOpenAddModal = (siswaId?: string) => {
    if (isSiswa) return;
    setFormSiswaId(siswaId || siswaList[0]?.id || '');
    setFormKategori('Tugas');
    setFormNamaPenilaian('Tugas Praktikum 1');
    setFormCP('TP 7.1 Identifikasi Sel');
    setFormSkor(80);
    setIsModalOpen(true);
  };

  const handleOpenManageModal = (s: Siswa) => {
    setManageSiswa(s);
  };

  const handleOpenEditRecordModal = (rec: NilaiRecord) => {
    setEditingRecord(rec);
  };

  const handleSaveNewNilai = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSiswa) return;
    if (!formSiswaId) return;

    const newRecord: NilaiRecord = {
      id: `N_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      siswaId: formSiswaId,
      kelasId: state.activeKelasId,
      mapelId: selectedMapel === 'ALL' ? 'IPA' : selectedMapel,
      kategori: formKategori,
      namaPenilaian: formNamaPenilaian,
      capaianPembelajaran: formCP,
      skor: Number(formSkor),
      tanggal: formTanggal,
    };

    onUpdateNilai([...state.nilai, newRecord]);
    setIsModalOpen(false);
  };

  const handleSaveEditedNilai = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    const updatedList = state.nilai.map((n) => {
      if (n.id === editingRecord.id) {
        return editingRecord;
      }
      return n;
    });

    onUpdateNilai(updatedList);
    setEditingRecord(null);
  };

  const handleDeleteNilaiRecord = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus komponen nilai ini?')) {
      onUpdateNilai(state.nilai.filter((n) => n.id !== id));
    }
  };

  const handlePrint = () => {
    if (onNavigateToReport) {
      onNavigateToReport();
    } else {
      window.print();
    }
  };

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += `Rekap Nilai Kelas ${activeKelas.namaKelas} - ${currentMapelObj?.nama}\n`;
    csvContent += 'No,NISN,Nama Siswa,Rata Tugas,Rata UH,PTS,PAS,Nilai Akhir,Predikat,Status\n';

    filteredSiswa.forEach((s, idx) => {
      const rekap = calculateNilaiSiswa(s, state.nilai, selectedMapel, currentMapelObj?.kkm || 75);
      csvContent += `${idx + 1},"${s.nisn}","${s.nama}",${rekap.rataTugas},${rekap.rataUH},${rekap.nilaiPTS ?? ''},${rekap.nilaiPAS ?? ''},${rekap.nilaiAkhir},${rekap.predikat},${rekap.statusTuntas ? 'Tuntas' : 'Perlu Bimbingan'}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Nilai_${activeKelas.namaKelas}_${selectedMapel}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <span>{isSiswa ? 'Cek Rapor & Nilai Siswa' : 'Matrix Nilai Siswa'} · {activeKelas.namaKelas}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Capaian pembelajaran, rekap nilai tugas, UH, PTS, PAS, dan status KKM ({currentMapelObj?.kkm || 75}).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Mapel Selector */}
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedMapel}
              onChange={(e) => setSelectedMapel(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              {state.mapel.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nama} ({m.kode})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Cetak Data Nilai</span>
          </button>

          {!isSiswa && (
            <button
              onClick={() => handleOpenAddModal()}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Input Nilai</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Cari siswa berdasarkan nama atau NISN..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
        />
      </div>

      {/* Grade Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4 w-28 text-center">Rata Tugas</th>
                <th className="py-3 px-4 w-28 text-center">Rata UH</th>
                <th className="py-3 px-4 w-24 text-center">PTS</th>
                <th className="py-3 px-4 w-24 text-center">PAS</th>
                <th className="py-3 px-4 w-28 text-center">Nilai Akhir</th>
                <th className="py-3 px-4 w-24 text-center">Predikat</th>
                <th className="py-3 px-4 w-32 text-center">Status KKM</th>
                <th className="py-3 px-4 w-24 text-center">Opsi Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
              {filteredSiswa.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    Tidak ada siswa ditemukan.
                  </td>
                </tr>
              ) : (
                filteredSiswa.map((s, idx) => {
                  const rekap = calculateNilaiSiswa(
                    s,
                    state.nilai,
                    selectedMapel,
                    currentMapelObj?.kkm || 75
                  );

                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-center font-mono text-slate-500">
                        {idx + 1}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{s.nama}</div>
                        <div className="text-[11px] text-slate-500">NISN: {s.nisn}</div>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-800">
                        {rekap.rataTugas > 0 ? rekap.rataTugas : '-'}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-800">
                        {rekap.rataUH > 0 ? rekap.rataUH : '-'}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-800">
                        {rekap.nilaiPTS !== null ? rekap.nilaiPTS : '-'}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-800">
                        {rekap.nilaiPAS !== null ? rekap.nilaiPAS : '-'}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-extrabold text-slate-900 text-sm">
                        {rekap.nilaiAkhir > 0 ? rekap.nilaiAkhir : '-'}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-xs font-extrabold border ${
                            rekap.predikat === 'A'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : rekap.predikat === 'B'
                              ? 'bg-blue-100 text-blue-800 border-blue-300'
                              : rekap.predikat === 'C'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-rose-100 text-rose-800 border-rose-300'
                          }`}
                        >
                          {rekap.predikat}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {rekap.statusTuntas ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Tuntas</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Remidial</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenManageModal(s)}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit & Kelola Nilai Siswa Ini"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {!isSiswa && (
                            <button
                              onClick={() => handleOpenAddModal(s.id)}
                              className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Tambah Skor Baru"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Manage/Edit Student Scores List */}
      {manageSiswa && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Edit & Rincian Nilai: {manageSiswa.nama}
                </h2>
                <p className="text-xs text-slate-500">
                  NISN: {manageSiswa.nisn} · Mapel: {currentMapelObj.nama}
                </p>
              </div>

              {!isSiswa && (
                <button
                  onClick={() => {
                    handleOpenAddModal(manageSiswa.id);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Skor</span>
                </button>
              )}
            </div>

            {/* List of NilaiRecords for this Student */}
            {(() => {
              const studentRecords = state.nilai.filter(
                (n) => n.siswaId === manageSiswa.id && n.mapelId === selectedMapel
              );

              if (studentRecords.length === 0) {
                return (
                  <p className="text-xs text-slate-500 text-center py-6">
                    Belum ada entri nilai tercatat untuk mata pelajaran ini.
                  </p>
                );
              }

              return (
                <div className="space-y-2">
                  {studentRecords.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900">{rec.namaPenilaian}</span>
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded-md font-bold uppercase text-[10px]">
                            {rec.kategori}
                          </span>
                        </div>
                        {rec.capaianPembelajaran && (
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            TP: {rec.capaianPembelajaran}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 mt-0.5">Tanggal: {rec.tanggal}</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-base font-black font-mono text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg">
                          {rec.skor}
                        </span>

                        {!isSiswa && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditRecordModal(rec)}
                              className="p-1.5 text-slate-600 hover:text-emerald-700 bg-white rounded-lg border border-slate-200 cursor-pointer"
                              title="Edit Nilai Ini"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteNilaiRecord(rec.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 bg-white rounded-lg border border-slate-200 cursor-pointer"
                              title="Hapus Nilai Ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            <div className="flex items-center justify-end pt-4 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={() => setManageSiswa(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Grade */}
      {!isSiswa && isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              Input Nilai Baru ({currentMapelObj.nama})
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Pilih siswa, kategori asesmen, dan masukkan skor (0 - 100).
            </p>

            <form onSubmit={handleSaveNewNilai} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Siswa
                </label>
                <select
                  value={formSiswaId}
                  onChange={(e) => setFormSiswaId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  {siswaList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama} ({s.nisn})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kategori Nilai
                  </label>
                  <select
                    value={formKategori}
                    onChange={(e) =>
                      setFormKategori(e.target.value as KategoriNilai)
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Tugas">Tugas / Praktikum</option>
                    <option value="UH">Ulangan Harian (UH)</option>
                    <option value="PTS">PTS (Tengah Sem)</option>
                    <option value="PAS">PAS (Akhir Sem)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Skor (0 - 100)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formSkor}
                    onChange={(e) => setFormSkor(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Penilaian / Judul
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tugas 1 Pengamatan Sel"
                  value={formNamaPenilaian}
                  onChange={(e) => setFormNamaPenilaian(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Capaian Pembelajaran (TP / KD)
                </label>
                <input
                  type="text"
                  placeholder="e.g. TP 7.1 Identifikasi Struktur Sel"
                  value={formCP}
                  onChange={(e) => setFormCP(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  Simpan Nilai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Single NilaiRecord */}
      {!isSiswa && editingRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              Edit Skor Nilai Siswa
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Ubah skor, judul penilaian, atau capaian pembelajaran.
            </p>

            <form onSubmit={handleSaveEditedNilai} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kategori Nilai
                  </label>
                  <select
                    value={editingRecord.kategori}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, kategori: e.target.value as KategoriNilai })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
                  >
                    <option value="Tugas">Tugas / Praktikum</option>
                    <option value="UH">Ulangan Harian (UH)</option>
                    <option value="PTS">PTS (Tengah Sem)</option>
                    <option value="PAS">PAS (Akhir Sem)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Skor (0 - 100)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editingRecord.skor}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, skor: Number(e.target.value) })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Penilaian / Judul
                </label>
                <input
                  type="text"
                  value={editingRecord.namaPenilaian}
                  onChange={(e) =>
                    setEditingRecord({ ...editingRecord, namaPenilaian: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Capaian Pembelajaran (TP / KD)
                </label>
                <input
                  type="text"
                  value={editingRecord.capaianPembelajaran || ''}
                  onChange={(e) =>
                    setEditingRecord({ ...editingRecord, capaianPembelajaran: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
