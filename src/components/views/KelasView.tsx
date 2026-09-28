import React, { useState } from 'react';
import {
  Building2,
  Plus,
  FileSpreadsheet,
  Upload,
  Download,
  Trash2,
  Edit,
  Users,
  CheckCircle2,
  ShieldAlert,
  BookOpen,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { SiaguState } from '../../utils/storage';
import { Kelas, Siswa, JenisKelamin } from '../../types/siagu';
import { useNotification } from '../../context/NotificationContext';
import { getTeacherMapelForKelas, getVisibleKelas } from '../../utils/guruAssignment';

interface KelasViewProps {
  state: SiaguState;
  onUpdateKelas: (updatedKelas: Kelas[]) => void;
  onUpdateSiswa: (updatedSiswa: Siswa[]) => void;
  onChangeActiveKelas?: (kelasId: string) => void;
}

export const KelasView: React.FC<KelasViewProps> = ({
  state,
  onUpdateKelas,
  onUpdateSiswa,
  onChangeActiveKelas,
}) => {
  const [isAddKelasModalOpen, setIsAddKelasModalOpen] = useState<boolean>(false);
  const [editingKelasId, setEditingKelasId] = useState<string | null>(null);
  const { notifySuccess, notifyError } = useNotification();

  const user = state.currentUser;
  const isAdmin = user?.role === 'admin';
  const visibleClasses = getVisibleKelas(user, state);

  // Form State: Add/Edit Kelas
  const [formKelasNama, setFormKelasNama] = useState<string>('');
  const [formTingkat, setFormTingkat] = useState<number>(7);
  const [formWaliKelas, setFormWaliKelas] = useState<string>(state.profil.nama);

  // Excel Import States
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [targetImportKelasId, setTargetImportKelasId] = useState<string>(state.activeKelasId);
  const [parsedExcelRows, setParsedExcelRows] = useState<any[]>([]);
  const [excelFileName, setExcelFileName] = useState<string>('');
  const [importSuccessMsg, setImportSuccessMsg] = useState<string>('');

  const handleOpenAddKelas = () => {
    if (!isAdmin) {
      alert('Akses Ditolak: Hanya Admin yang berhak membuat rombel kelas baru.');
      return;
    }
    setEditingKelasId(null);
    setFormKelasNama('Kelas 8B');
    setFormTingkat(8);
    setFormWaliKelas(state.profil.nama);
    setIsAddKelasModalOpen(true);
  };

  const handleOpenEditKelas = (k: Kelas) => {
    if (!isAdmin) {
      alert('Akses Ditolak: Hanya Admin yang berhak mengedit data kelas.');
      return;
    }
    setEditingKelasId(k.id);
    setFormKelasNama(k.namaKelas);
    setFormTingkat(k.tingkat);
    setFormWaliKelas(k.waliKelas);
    setIsAddKelasModalOpen(true);
  };

  const handleSaveKelas = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    if (editingKelasId) {
      const updated = state.kelas.map((k) => {
        if (k.id === editingKelasId) {
          return {
            ...k,
            namaKelas: formKelasNama,
            tingkat: formTingkat,
            waliKelas: formWaliKelas,
          };
        }
        return k;
      });
      onUpdateKelas(updated);
      notifySuccess(`Perubahan data ${formKelasNama} berhasil disimpan!`, 'Data Kelas Disimpan');
    } else {
      const newId = formKelasNama.replace(/[^a-zA-Z0-9]/g, '');
      const newKelas: Kelas = {
        id: newId || `K_${Date.now()}`,
        namaKelas: formKelasNama,
        tingkat: formTingkat,
        waliKelas: formWaliKelas,
        tahunAjaran: state.pengaturanSekolah.tahunAjaran,
        semester: state.pengaturanSekolah.semester,
      };
      onUpdateKelas([...state.kelas, newKelas]);
      notifySuccess(`Data kelas baru ${formKelasNama} berhasil disimpan!`, 'Data Kelas Disimpan');
    }

    setIsAddKelasModalOpen(false);
  };

  const handleDeleteKelas = (id: string, nama: string) => {
    if (!isAdmin) {
      alert('Akses Ditolak: Hanya Admin yang berhak menghapus data kelas.');
      return;
    }
    if (confirm(`Hapus kelas ${nama}? Data siswa di kelas ini akan tetap tersimpan.`)) {
      onUpdateKelas(state.kelas.filter((k) => k.id !== id));
      notifySuccess(`Kelas ${nama} berhasil dihapus.`, 'Data Dihapus');
    }
  };

  // Excel File Parsing with XLSX SheetJS
  const handleExcelFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (jsonRows.length === 0) {
          notifyError('File Excel kosong atau format tidak terbaca.', 'File Kosong');
          return;
        }

        setParsedExcelRows(jsonRows);
        notifySuccess(`File Excel berisi ${jsonRows.length} data siswa siap diimpor.`, 'File Berhasil Dibaca');
      } catch (err) {
        notifyError('Gagal membaca file Excel. Pastikan format file .xlsx, .xls, atau .csv', 'Kesalahan File');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDownloadSampleExcel = () => {
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
    notifySuccess('File template data siswa berhasil diunduh dan disimpan!', 'File Berhasil Disimpan');
  };

  const handleConfirmImportExcel = () => {
    if (!isAdmin) return;
    if (parsedExcelRows.length === 0) return;

    const importedSiswaList: Siswa[] = parsedExcelRows.map((row, index) => {
      const nama =
        row['Nama Lengkap Siswa'] || row['Nama'] || row['NAMA'] || `Siswa ${index + 1}`;
      const nis = String(row['NIS'] || row['Nis'] || Math.floor(1000 + Math.random() * 8000));
      const nisn = String(
        row['NISN'] || row['Nisn'] || `008${Math.floor(1000000 + Math.random() * 8000000)}`
      );
      const jkRaw = String(row['Jenis Kelamin (L/P)'] || row['JK'] || row['L/P'] || 'L').toUpperCase();
      const jenisKelamin: JenisKelamin = jkRaw.startsWith('P') ? 'P' : 'L';
      const namaOrangTua =
        row['Nama Orang Tua / Wali'] || row['Nama Orang Tua'] || row['Ortu'] || 'Orang Tua Siswa';
      const noHpOrangTua = String(
        row['No HP Orang Tua'] || row['No HP'] || row['No WA'] || '081234567890'
      );
      const alamat = String(row['Alamat'] || '');

      return {
        id: `S_XL_${Date.now()}_${index}`,
        nis,
        nisn,
        nama,
        kelasId: targetImportKelasId,
        jenisKelamin,
        namaOrangTua,
        noHpOrangTua,
        alamat,
      };
    });

    onUpdateSiswa([...state.siswa, ...importedSiswaList]);
    notifySuccess(
      `Berhasil mengimpor & menyimpan ${importedSiswaList.length} siswa ke Kelas ${targetImportKelasId}!`,
      'File Berhasil Diimpor & Disimpan'
    );
    setImportSuccessMsg(
      `Berhasil mengimpor ${importedSiswaList.length} siswa ke Kelas ${targetImportKelasId}!`
    );
    setParsedExcelRows([]);
    setExcelFileName('');
    setTimeout(() => {
      setImportSuccessMsg('');
      setIsImportModalOpen(false);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <span>Kelola Data Kelas & Upload Excel Siswa</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manajemen rombel kelas, wali kelas, serta impor daftar siswa kolektif dari file Excel/CSV.
          </p>
        </div>

        {isAdmin ? (
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setTargetImportKelasId(state.activeKelasId);
                setIsImportModalOpen(true);
              }}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Upload Data Excel (Admin)</span>
            </button>

            <button
              onClick={handleOpenAddKelas}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kelas Baru</span>
            </button>
          </div>
        ) : (
          <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Pengelolaan Rombel & Upload Excel Dikelola Admin</span>
          </div>
        )}
      </div>

      {/* Teacher Assigned Class Notice */}
      {user?.role === 'guru' && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-medium text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Menampilkan <b>{visibleClasses.length} kelas yang Anda ampu</b> ({visibleClasses.map((c) => c.namaKelas).join(', ')}). Rombel kelas lain dikelola terpusat oleh Admin.
            </span>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-xl border border-emerald-200 shrink-0">
            Guru: {user.nama}
          </span>
        </div>
      )}

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(isAdmin ? state.kelas : visibleClasses).map((k) => {
          const siswaCount = state.siswa.filter((s) => s.kelasId === k.id).length;
          const isActive = k.id === state.activeKelasId;
          const kMapel = getTeacherMapelForKelas(user, k.id, state);

          return (
            <div
              key={k.id}
              className={`p-5 rounded-2xl border transition-all ${
                isActive
                  ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-900 shadow-md ring-2 ring-emerald-500/30'
                  : 'bg-white text-slate-900 border-slate-200/80 shadow-2xs hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Tingkat {k.tingkat}
                </span>

                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditKelas(k)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isActive ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900'
                      }`}
                      title="Edit Kelas"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteKelas(k.id, k.namaKelas)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isActive ? 'text-rose-400 hover:bg-rose-500/20' : 'text-slate-400 hover:text-rose-600'
                      }`}
                      title="Hapus Kelas"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <h3 className="text-xl font-black">{k.namaKelas}</h3>
              <p className={`text-xs mt-1 font-medium ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                Wali Kelas: <b className={isActive ? 'text-white' : 'text-slate-800'}>{k.waliKelas}</b>
              </p>

              {user?.role === 'guru' && (
                <div
                  className={`mt-2.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                  <span>Mapel: {kMapel.nama} ({kMapel.kode})</span>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-slate-200/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>{siswaCount} Siswa Terdaftar</span>
                </div>

                {onChangeActiveKelas && !isActive && (
                  <button
                    onClick={() => onChangeActiveKelas(k.id)}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                  >
                    Pilih Kelas
                  </button>
                )}

                {isAdmin && (
                  <button
                    onClick={() => {
                      setTargetImportKelasId(k.id);
                      setIsImportModalOpen(true);
                    }}
                    className={`font-bold hover:underline cursor-pointer flex items-center gap-1 ${
                      isActive ? 'text-emerald-300' : 'text-emerald-700'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import Excel</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit Kelas (Admin Only) */}
      {isAdmin && isAddKelasModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              {editingKelasId ? 'Edit Data Kelas' : 'Tambah Rombel Kelas Baru (Admin)'}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Konfigurasi nama kelas, tingkat SMP (7, 8, 9), dan Wali Kelas.
            </p>

            <form onSubmit={handleSaveKelas} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Kelas</label>
                <input
                  type="text"
                  placeholder="e.g. Kelas 8B"
                  value={formKelasNama}
                  onChange={(e) => setFormKelasNama(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tingkat Kelas</label>
                  <select
                    value={formTingkat}
                    onChange={(e) => setFormTingkat(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  >
                    <option value={7}>Tingkat 7</option>
                    <option value={8}>Tingkat 8</option>
                    <option value={9}>Tingkat 9</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Wali Kelas</label>
                  <input
                    type="text"
                    value={formWaliKelas}
                    onChange={(e) => setFormWaliKelas(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddKelasModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
                >
                  Simpan Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Upload Excel / CSV (Admin Only) */}
      {isAdmin && isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  <span>Upload & Impor Data Excel Siswa (Portal Admin)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Unggah file Excel (.xlsx, .xls) atau CSV untuk memasukkan daftar siswa secara otomatis.
                </p>
              </div>

              <button
                onClick={handleDownloadSampleExcel}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Template Excel</span>
              </button>
            </div>

            {importSuccessMsg && (
              <div className="p-4 bg-emerald-500 text-white rounded-2xl text-xs font-bold text-center mb-4 flex items-center justify-center gap-2 animate-bounce">
                <CheckCircle2 className="w-4 h-4" />
                <span>{importSuccessMsg}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Kelas Tujuan Impor
                </label>
                <select
                  value={targetImportKelasId}
                  onChange={(e) => setTargetImportKelasId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900"
                >
                  {state.kelas.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.namaKelas} (Wali Kelas: {k.waliKelas})
                    </option>
                  ))}
                </select>
              </div>

              {/* Upload Drop Area */}
              <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 p-6 rounded-2xl text-center bg-slate-50/60 transition-colors">
                <Upload className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-900">
                  {excelFileName ? `File Terpilih: ${excelFileName}` : 'Klik untuk pilih file Excel (.xlsx / .csv)'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Kolom yang didukung: NIS, NISN, Nama Lengkap Siswa, Jenis Kelamin (L/P), Nama Ortu, No HP Ortu
                </p>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleExcelFileUpload}
                  className="mt-3 text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white cursor-pointer"
                />
              </div>

              {/* Parsed Excel Preview Table */}
              {parsedExcelRows.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900">
                      Pratinjau Data ({parsedExcelRows.length} Siswa Terdeteksi):
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-slate-100 font-bold text-slate-700">
                          <th className="p-2 border-b">No</th>
                          <th className="p-2 border-b">Nama Siswa</th>
                          <th className="p-2 border-b">NISN</th>
                          <th className="p-2 border-b">JK</th>
                          <th className="p-2 border-b">Nama Ortu</th>
                          <th className="p-2 border-b">No HP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                        {parsedExcelRows.map((r, i) => (
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
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImportExcel}
                  disabled={parsedExcelRows.length === 0}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
                >
                  Konfirmasi Impor ({parsedExcelRows.length} Siswa)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
