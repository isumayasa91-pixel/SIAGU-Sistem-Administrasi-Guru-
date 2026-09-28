import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  MessageSquare,
  Edit,
  Trash2,
  MapPin,
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { SiaguState } from '../../utils/storage';
import { Siswa, JenisKelamin } from '../../types/siagu';
import { formatNoHpWhatsApp } from '../../utils/calculations';
import { useNotification } from '../../context/NotificationContext';

interface SiswaViewProps {
  state: SiaguState;
  onUpdateSiswa: (updatedList: Siswa[]) => void;
}

export const SiswaView: React.FC<SiswaViewProps> = ({ state, onUpdateSiswa }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingSiswaId, setEditingSiswaId] = useState<string | null>(null);
  const { notifySuccess, notifyError } = useNotification();

  const isAdmin = state.currentUser?.role === 'admin';

  // Form State
  const [formNis, setFormNis] = useState<string>('');
  const [formNisn, setFormNisn] = useState<string>('');
  const [formNama, setFormNama] = useState<string>('');
  const [formKelasId, setFormKelasId] = useState<string>(state.activeKelasId);
  const [formJK, setFormJK] = useState<JenisKelamin>('L');
  const [formOrtu, setFormOrtu] = useState<string>('');
  const [formHp, setFormHp] = useState<string>('');
  const [formAlamat, setFormAlamat] = useState<string>('');

  // Excel Import State
  const [isExcelModalOpen, setIsExcelModalOpen] = useState<boolean>(false);
  const [excelTargetKelasId, setExcelTargetKelasId] = useState<string>(state.activeKelasId);
  const [excelRows, setExcelRows] = useState<any[]>([]);
  const [excelFileName, setExcelFileName] = useState<string>('');
  const [successImportMsg, setSuccessImportMsg] = useState<string>('');

  const activeKelas =
    state.kelas.find((k) => k.id === state.activeKelasId) || state.kelas[0];
  const siswaInActiveKelas = state.siswa.filter(
    (s) => s.kelasId === state.activeKelasId
  );

  const filteredSiswa = siswaInActiveKelas.filter(
    (s) =>
      s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.includes(searchQuery) ||
      s.nis.includes(searchQuery)
  );

  const handleOpenAdd = () => {
    if (!isAdmin) {
      alert('Akses Ditolak: Hanya Admin yang berhak menambah data siswa.');
      return;
    }
    setEditingSiswaId(null);
    setFormNis(`23${Math.floor(10 + Math.random() * 80)}`);
    setFormNisn(`0081234${Math.floor(100 + Math.random() * 800)}`);
    setFormNama('');
    setFormKelasId(state.activeKelasId);
    setFormJK('L');
    setFormOrtu('');
    setFormHp('0812345678');
    setFormAlamat('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Siswa) => {
    if (!isAdmin) {
      alert('Akses Ditolak: Hanya Admin yang berhak mengedit data siswa.');
      return;
    }
    setEditingSiswaId(s.id);
    setFormNis(s.nis);
    setFormNisn(s.nisn);
    setFormNama(s.nama);
    setFormKelasId(s.kelasId);
    setFormJK(s.jenisKelamin);
    setFormOrtu(s.namaOrangTua);
    setFormHp(s.noHpOrangTua);
    setFormAlamat(s.alamat || '');
    setIsModalOpen(true);
  };

  const handleSaveSiswa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    if (editingSiswaId) {
      const updatedList = state.siswa.map((s) => {
        if (s.id === editingSiswaId) {
          return {
            ...s,
            nis: formNis,
            nisn: formNisn,
            nama: formNama,
            kelasId: formKelasId,
            jenisKelamin: formJK,
            namaOrangTua: formOrtu,
            noHpOrangTua: formHp,
            alamat: formAlamat,
          };
        }
        return s;
      });
      onUpdateSiswa(updatedList);
    } else {
      const newSiswa: Siswa = {
        id: `S_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        nis: formNis,
        nisn: formNisn,
        nama: formNama,
        kelasId: formKelasId,
        jenisKelamin: formJK,
        namaOrangTua: formOrtu,
        noHpOrangTua: formHp,
        alamat: formAlamat,
      };
      onUpdateSiswa([...state.siswa, newSiswa]);
      notifySuccess(`Data siswa ${formNama} berhasil disimpan!`, 'Data Siswa Disimpan');
    }

    setIsModalOpen(false);
  };

  const handleDeleteSiswa = (id: string, nama: string) => {
    if (!isAdmin) {
      alert('Akses Ditolak: Hanya Admin yang berhak menghapus data siswa.');
      return;
    }
    if (confirm(`Apakah Anda yakin ingin menghapus data siswa ${nama}?`)) {
      onUpdateSiswa(state.siswa.filter((s) => s.id !== id));
      notifySuccess(`Data siswa ${nama} berhasil dihapus.`, 'Data Dihapus');
    }
  };

  const handleOpenWaParent = (noHp: string, namaSiswa: string, namaOrtu: string) => {
    const formatted = formatNoHpWhatsApp(noHp);
    const text = encodeURIComponent(
      `Yth. Bapak/Ibu ${namaOrtu},\n\nPemberitahuan dari ${state.profil.nama} (Guru ${state.profil.sekolah}) mengenai putra/putri Anda ${namaSiswa}.\n\nTerima kasih.`
    );
    window.open(`https://wa.me/${formatted}?text=${text}`, '_blank');
  };

  // Excel Upload Logic (Admin Only)
  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonRows: any[] = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

        if (jsonRows.length === 0) {
          notifyError('File Excel kosong atau format tidak terbaca.', 'File Kosong');
          return;
        }

        setExcelRows(jsonRows);
        notifySuccess(`File Excel berisi ${jsonRows.length} data siswa siap diimpor.`, 'File Berhasil Dibaca');
      } catch (err) {
        notifyError('Gagal membaca file Excel/CSV data siswa.', 'Kesalahan File');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDownloadExcelTemplate = () => {
    const sampleData = [
      {
        NIS: '2401',
        NISN: '0089876501',
        'Nama Lengkap Siswa': 'Ahmad Fauzi Putera',
        'Jenis Kelamin (L/P)': 'L',
        'Nama Orang Tua / Wali': 'Bambang Fauzi',
        'No HP Orang Tua': '081234567890',
        Alamat: 'Jl. Merdeka No. 10 Denpasar',
      },
      {
        NIS: '2402',
        NISN: '0089876502',
        'Nama Lengkap Siswa': 'Ni Putu Anindya Kirana',
        'Jenis Kelamin (L/P)': 'P',
        'Nama Orang Tua / Wali': 'I Wayan Kirana',
        'No HP Orang Tua': '081234567891',
        Alamat: 'Jl. Gatot Subroto No. 45 Denpasar',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Siswa');
    XLSX.writeFile(workbook, 'Template_Data_Siswa_SIAGU.xlsx');
    notifySuccess('File template upload data siswa berhasil diunduh dan disimpan!', 'File Berhasil Disimpan');
  };

  const handleConfirmExcelImport = () => {
    if (!isAdmin) return;
    if (excelRows.length === 0) return;

    const importedList: Siswa[] = excelRows.map((row, i) => {
      const nama = row['Nama Lengkap Siswa'] || row['Nama'] || row['NAMA'] || `Siswa ${i + 1}`;
      const nis = String(row['NIS'] || row['Nis'] || Math.floor(1000 + Math.random() * 8000));
      const nisn = String(
        row['NISN'] || row['Nisn'] || `008${Math.floor(1000000 + Math.random() * 8000000)}`
      );
      const jkRaw = String(row['Jenis Kelamin (L/P)'] || row['JK'] || 'L').toUpperCase();
      const jenisKelamin: JenisKelamin = jkRaw.startsWith('P') ? 'P' : 'L';
      const namaOrangTua =
        row['Nama Orang Tua / Wali'] || row['Nama Orang Tua'] || row['Ortu'] || 'Orang Tua';
      const noHpOrangTua = String(
        row['No HP Orang Tua'] || row['No HP'] || row['No WA'] || '081234567890'
      );
      const alamat = String(row['Alamat'] || '');

      return {
        id: `S_XL_${Date.now()}_${i}`,
        nis,
        nisn,
        nama,
        kelasId: excelTargetKelasId,
        jenisKelamin,
        namaOrangTua,
        noHpOrangTua,
        alamat,
      };
    });

    onUpdateSiswa([...state.siswa, ...importedList]);
    notifySuccess(
      `Berhasil mengimpor & menyimpan ${importedList.length} siswa ke Kelas ${excelTargetKelasId}!`,
      'File Berhasil Diimpor & Disimpan'
    );
    setSuccessImportMsg(`Berhasil mengimpor ${importedList.length} siswa ke Kelas ${excelTargetKelasId}!`);
    setExcelRows([]);
    setExcelFileName('');
    setTimeout(() => {
      setSuccessImportMsg('');
      setIsExcelModalOpen(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <span>Data Siswa & Orang Tua · {activeKelas.namaKelas}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Direktori biodata siswa, NISN, dan kontak WhatsApp orang tua.
          </p>
        </div>

        {/* Action Buttons: Visible for Admin ONLY */}
        {isAdmin ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setExcelTargetKelasId(state.activeKelasId);
                setIsExcelModalOpen(true);
              }}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Upload Excel (Admin)</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Siswa</span>
            </button>
          </div>
        ) : (
          <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Mode Baca Guru (Penambahan & Upload Excel dilakukan oleh Admin)</span>
          </div>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Cari berdasarkan nama siswa, NIS, atau NISN..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
        />
      </div>

      {/* Student Directory Table / Cards */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Lengkap Siswa</th>
                <th className="py-3 px-4 w-28 text-center">L/P</th>
                <th className="py-3 px-4 w-32">NIS / NISN</th>
                <th className="py-3 px-4">Nama Orang Tua / Wali</th>
                <th className="py-3 px-4 w-36">Kontak Orang Tua</th>
                {isAdmin && <th className="py-3 px-4 w-24 text-center">Aksi (Admin)</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
              {filteredSiswa.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="py-8 text-center text-slate-500">
                    Tidak ada data siswa ditemukan untuk kelas ini.
                  </td>
                </tr>
              ) : (
                filteredSiswa.map((s, idx) => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3 px-4 text-center font-mono text-slate-500">
                      {idx + 1}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{s.nama}</div>
                      {s.alamat && (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{s.alamat}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          s.jenisKelamin === 'L'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {s.jenisKelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-600">
                      <div>NIS: {s.nis}</div>
                      <div className="text-[11px] text-slate-400">
                        NISN: {s.nisn}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {s.namaOrangTua}
                    </td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() =>
                          handleOpenWaParent(s.noHpOrangTua, s.nama, s.namaOrangTua)
                        }
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{s.noHpOrangTua}</span>
                      </button>
                    </td>

                    {/* Edit & Delete Action Buttons (Admin Only) */}
                    {isAdmin && (
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(s)}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Biodata Siswa"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSiswa(s.id, s.nama)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Siswa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Siswa (Admin Only) */}
      {isAdmin && isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              {editingSiswaId ? 'Ubah Biodata Siswa' : 'Tambah Siswa Baru (Admin)'}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Lengkapi informasi NISN, kelas, dan kontak orang tua/wali.
            </p>

            <form onSubmit={handleSaveSiswa} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  placeholder="e.g. I Gede Danendra"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NIS</label>
                  <input
                    type="text"
                    value={formNis}
                    onChange={(e) => setFormNis(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NISN</label>
                  <input
                    type="text"
                    value={formNisn}
                    onChange={(e) => setFormNisn(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={formJK}
                    onChange={(e) => setFormJK(e.target.value as JenisKelamin)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
                  >
                    <option value="L">Laki-Laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Orang Tua / Wali</label>
                <input
                  type="text"
                  placeholder="e.g. I Wayan Pratama"
                  value={formOrtu}
                  onChange={(e) => setFormOrtu(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">No. HP / WA Orang Tua</label>
                <input
                  type="text"
                  placeholder="e.g. 08123456789"
                  value={formHp}
                  onChange={(e) => setFormHp(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Rumah</label>
                <input
                  type="text"
                  placeholder="e.g. Jl. Melati No. 12 Denpasar"
                  value={formAlamat}
                  onChange={(e) => setFormAlamat(e.target.value)}
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
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Upload Excel (Admin Only) */}
      {isAdmin && isExcelModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  <span>Upload & Impor Excel Siswa (Portal Admin)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Unggah file Excel (.xlsx, .xls) atau CSV untuk memasukkan siswa secara kolektif.
                </p>
              </div>

              <button
                onClick={handleDownloadExcelTemplate}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Template Excel</span>
              </button>
            </div>

            {successImportMsg && (
              <div className="p-4 bg-emerald-500 text-white rounded-2xl text-xs font-bold text-center mb-4 flex items-center justify-center gap-2 animate-bounce">
                <CheckCircle2 className="w-4 h-4" />
                <span>{successImportMsg}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Kelas Tujuan Impor
                </label>
                <select
                  value={excelTargetKelasId}
                  onChange={(e) => setExcelTargetKelasId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900"
                >
                  {state.kelas.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.namaKelas} (Wali Kelas: {k.waliKelas})
                    </option>
                  ))}
                </select>
              </div>

              {/* Upload Drop Box */}
              <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 p-6 rounded-2xl text-center bg-slate-50/60 transition-colors">
                <Upload className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-900">
                  {excelFileName ? `File Terpilih: ${excelFileName}` : 'Pilih file Excel (.xlsx / .csv)'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Kolom yang dikenali: NIS, NISN, Nama Lengkap Siswa, Jenis Kelamin (L/P), Nama Ortu, No HP Ortu
                </p>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleExcelFileChange}
                  className="mt-3 text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white cursor-pointer"
                />
              </div>

              {/* Excel Preview */}
              {excelRows.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-slate-900 block mb-2">
                    Pratinjau Data Excel ({excelRows.length} Siswa Terbaca):
                  </span>

                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-slate-100 font-bold text-slate-700">
                          <th className="p-2 border-b">No</th>
                          <th className="p-2 border-b">Nama Siswa</th>
                          <th className="p-2 border-b">NISN</th>
                          <th className="p-2 border-b">JK</th>
                          <th className="p-2 border-b">Nama Ortu</th>
                          <th className="p-2 border-b">No HP Ortu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                        {excelRows.map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-2 font-mono">{i + 1}</td>
                            <td className="p-2 font-bold">{r['Nama Lengkap Siswa'] || r['Nama'] || '—'}</td>
                            <td className="p-2 font-mono">{r['NISN'] || '—'}</td>
                            <td className="p-2">{r['Jenis Kelamin (L/P)'] || r['JK'] || 'L'}</td>
                            <td className="p-2">{r['Nama Orang Tua / Wali'] || r['Ortu'] || '—'}</td>
                            <td className="p-2 font-mono">{r['No HP Orang Tua'] || r['No HP'] || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsExcelModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmExcelImport}
                  disabled={excelRows.length === 0}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
                >
                  Konfirmasi Impor ({excelRows.length} Siswa)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
