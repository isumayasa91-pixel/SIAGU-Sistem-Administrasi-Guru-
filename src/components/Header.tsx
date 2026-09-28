import React, { useRef } from 'react';
import {
  Calendar,
  Download,
  Upload,
  RefreshCw,
  Building2,
  LogOut,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  CloudCheck,
  Save,
} from 'lucide-react';
import { SiaguState, saveSiaguData } from '../utils/storage';
import { useNotification } from '../context/NotificationContext';
import { getTeacherMapelForKelas, getVisibleKelas } from '../utils/guruAssignment';

interface HeaderProps {
  state: SiaguState;
  onChangeActiveKelas: (kelasId: string) => void;
  onChangeSemester: (semester: 'Ganjil' | 'Genap') => void;
  onExportBackup: () => void;
  onImportBackup: (importedState: SiaguState) => void;
  onResetDefault: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  state,
  onChangeActiveKelas,
  onChangeSemester,
  onExportBackup,
  onImportBackup,
  onResetDefault,
  onLogout,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = state.currentUser;
  const { notifySuccess, notifyError, lastSavedAt } = useNotification();

  const visibleKelas = getVisibleKelas(user, state);
  const activeMapelObj = getTeacherMapelForKelas(user, state.activeKelasId, state);

  const handleCloudSave = () => {
    saveSiaguData(state);
    notifySuccess(
      'Data berhasil disimpan ke server central! Data otomatis tersinkron dan dapat dibuka di HP, laptop, atau PC lain walau dengan akun/email berbeda.',
      '💾 Sinkronisasi Cloud Berhasil'
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.siswa && parsed.kelas) {
          onImportBackup(parsed);
          notifySuccess(
            `File cadangan (${file.name}) berhasil diimpor & seluruh data tersimpan ke sistem!`,
            'File Berhasil Disimpan'
          );
        } else {
          notifyError('File JSON tidak valid untuk format data SIAGU.', 'Gagal Membaca File');
        }
      } catch (err) {
        notifyError('Gagal memproses file JSON cadangan.', 'Kesalahan File');
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand & Logo */}
          <div className="flex items-center gap-3 shrink-0">
            {state.pengaturanSekolah.logoSekolahUrl ? (
              <img
                src={state.pengaturanSekolah.logoSekolahUrl}
                alt="Logo Sekolah"
                className="w-10 h-10 rounded-xl object-contain bg-white border border-slate-200 p-0.5 shadow-xs"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md font-bold text-xl tracking-tight">
                S
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  SIAGU
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200/60">
                  v2.5 Merdeka
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block truncate max-w-[200px]">
                {state.pengaturanSekolah.namaSekolah}
              </p>
            </div>
          </div>

          {/* Zone 2: Global Context Selectors (Class & Semester) */}
          <div className="hidden md:flex items-center gap-2.5 bg-slate-100/90 p-1.5 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 px-1.5 font-bold">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{user?.role === 'guru' ? 'Kelas Diampu:' : 'Kelas:'}</span>
            </div>
            <div className="flex items-center gap-1">
              {visibleKelas.map((k) => {
                const isActive = k.id === state.activeKelasId;
                const kMapel = getTeacherMapelForKelas(user, k.id, state);
                return (
                  <button
                    key={k.id}
                    onClick={() => onChangeActiveKelas(k.id)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200'
                    }`}
                    title={`Beralih ke ${k.namaKelas} · Mata Pelajaran: ${kMapel.nama}`}
                  >
                    <span>{k.namaKelas}</span>
                    {user?.role === 'guru' && (
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                          isActive
                            ? 'bg-emerald-800 text-emerald-100'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {kMapel.kode || kMapel.id}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Subject Indicator Badge for Guru */}
            {user?.role === 'guru' && (
              <div
                className="hidden xl:flex items-center gap-1.5 px-2 py-0.5 bg-white rounded-lg border border-emerald-200 text-[11px] font-bold text-slate-800 shadow-2xs"
                title={`Mata Pelajaran Kelas ${state.activeKelasId}: ${activeMapelObj.nama} (KKM: ${activeMapelObj.kkm})`}
              >
                <span className="text-[10px] text-slate-400 font-semibold">Mapel:</span>
                <span className="text-emerald-700">{activeMapelObj.nama}</span>
              </div>
            )}

            <div className="h-4 w-px bg-slate-300 mx-0.5" />

            <div className="flex items-center gap-1 text-xs text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={state.pengaturanSekolah.semester}
                onChange={(e) =>
                  onChangeSemester(e.target.value as 'Ganjil' | 'Genap')
                }
                className="bg-white border border-slate-200 rounded-lg text-xs font-semibold px-2 py-1 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="Ganjil">
                  {state.pengaturanSekolah.tahunAjaran} - Ganjil
                </option>
                <option value="Genap">
                  {state.pengaturanSekolah.tahunAjaran} - Genap
                </option>
              </select>
            </div>
          </div>

          {/* Zone 3: Teacher Profile & Data Utilities */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />

            {/* Live Save Status Badge */}
            {lastSavedAt && (
              <div
                className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[11px] font-bold shadow-2xs"
                title={`Seluruh data aman. Terakhir disimpan: ${lastSavedAt.toLocaleTimeString('id-ID')}`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Tersimpan</span>
              </div>
            )}

            {/* Export/Import & Cloud Save Utilities */}
            <div className="hidden lg:flex items-center gap-1.5">
              <button
                onClick={handleCloudSave}
                title="Simpan & Sinkronkan Data ke Server Central (Dapat dibuka di HP/Laptop lain)"
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5 text-amber-300" />
                <span>Simpan Data</span>
              </button>

              <button
                onClick={onExportBackup}
                title="Unduh Backup Data JSON"
                className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors text-xs font-medium cursor-pointer"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                title="Pulihkan / Impor Data JSON"
                className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors text-xs font-medium cursor-pointer"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden lg:block" />

            {/* User Avatar Badge & Logout */}
            <div className="flex items-center gap-2 pl-1">
              <div
                className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-xs overflow-hidden ${
                  user?.role === 'admin'
                    ? 'bg-purple-800 ring-2 ring-purple-400/40'
                    : 'bg-emerald-700 ring-2 ring-emerald-400/40'
                }`}
              >
                {user?.fotoUrl || state.profil.fotoUrl ? (
                  <img
                    src={user?.fotoUrl || state.profil.fotoUrl}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{user?.nama ? user.nama.charAt(0) : 'G'}</span>
                )}
              </div>

              <div className="hidden xl:block text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 truncate max-w-[130px]">
                    {user?.nama || state.profil.nama}
                  </span>
                  <span
                    className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md ${
                      user?.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {user?.role || 'Guru'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium truncate max-w-[130px]">
                  {user?.role === 'admin' ? 'Administrator Sistem' : state.profil.mataPelajaranUtama}
                </p>
              </div>

              <button
                onClick={onLogout}
                className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1 font-bold text-xs"
                title="Keluar / Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>

          </div>

        </div>

        {/* Mobile Sub-strip: Assigned Classes & Active Mapel */}
        <div className="md:hidden pt-2 pb-1 border-t border-slate-100 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              {user?.role === 'guru' ? 'Diampu:' : 'Kelas:'}
            </span>
            {visibleKelas.map((k) => {
              const isActive = k.id === state.activeKelasId;
              const kMapel = getTeacherMapelForKelas(user, k.id, state);
              return (
                <button
                  key={k.id}
                  onClick={() => onChangeActiveKelas(k.id)}
                  className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {k.namaKelas}
                  {user?.role === 'guru' && ` (${kMapel.kode || kMapel.id})`}
                </button>
              );
            })}
          </div>

          {user?.role === 'guru' && (
            <div className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0 truncate max-w-[140px]">
              Mapel: {activeMapelObj.nama}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
