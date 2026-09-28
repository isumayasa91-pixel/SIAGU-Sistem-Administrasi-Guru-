import React, { useState } from 'react';
import {
  Settings,
  Building2,
  User,
  ShieldCheck,
  Save,
  Plus,
  Trash2,
  Download,
  RefreshCw,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';
import { SiaguState } from '../../utils/storage';
import { PengaturanSekolah, ProfilGuru, UserAccount } from '../../types/siagu';

interface PengaturanViewProps {
  state: SiaguState;
  onUpdatePengaturanSekolah: (updated: PengaturanSekolah) => void;
  onUpdateProfilGuru: (updated: ProfilGuru) => void;
  onUpdateAccounts: (updated: UserAccount[]) => void;
  onExportBackup: () => void;
  onImportBackup: (importedState: SiaguState) => void;
  onResetDefault: () => void;
}

export const PengaturanView: React.FC<PengaturanViewProps> = ({
  state,
  onUpdatePengaturanSekolah,
  onUpdateProfilGuru,
  onUpdateAccounts,
  onExportBackup,
  onImportBackup,
  onResetDefault,
}) => {
  const isAdmin = state.currentUser?.role === 'admin';

  // If not admin, default to 'profil' tab
  const [activeSubTab, setActiveTool] = useState<'sekolah' | 'profil' | 'akun' | 'sistem'>(
    isAdmin ? 'sekolah' : 'profil'
  );
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Form State: Data Sekolah & Logos (Admin Only)
  const [sekNama, setSekNama] = useState<string>(state.pengaturanSekolah.namaSekolah);
  const [sekNpsn, setSekNpsn] = useState<string>(state.pengaturanSekolah.npsn);
  const [sekKabupaten, setSekKabupaten] = useState<string>(
    state.pengaturanSekolah.namaKabupaten || 'Pemerintah Kota Denpasar'
  );
  const [sekAlamat, setSekAlamat] = useState<string>(state.pengaturanSekolah.alamatSekolah);
  const [sekTelp, setSekTelp] = useState<string>(state.pengaturanSekolah.teleponSekolah);
  const [sekKepsek, setSekKepsek] = useState<string>(state.pengaturanSekolah.namaKepalaSekolah);
  const [sekNipKepsek, setSekNipKepsek] = useState<string>(state.pengaturanSekolah.nipKepalaSekolah);
  const [sekThn, setSekThn] = useState<string>(state.pengaturanSekolah.tahunAjaran);
  const [sekSemester, setSekSemester] = useState<'Ganjil' | 'Genap'>(state.pengaturanSekolah.semester);

  // Logo Base64 URLs
  const [logoSekolahUrl, setLogoSekolahUrl] = useState<string>(
    state.pengaturanSekolah.logoSekolahUrl || ''
  );
  const [logoKabupatenUrl, setLogoKabupatenUrl] = useState<string>(
    state.pengaturanSekolah.logoKabupatenUrl || ''
  );

  // Form State: Profil Logged In User (Guru / Siswa / Admin)
  const currentUser = state.currentUser;
  const [profNama, setProfNama] = useState<string>(currentUser?.nama || state.profil.nama);
  const [profNip, setProfNip] = useState<string>(currentUser?.nip || state.profil.nip);
  const [profEmail, setProfEmail] = useState<string>(currentUser?.email || state.profil.email);
  const [profMapel, setProfMapel] = useState<string>(
    currentUser?.mataPelajaran || state.profil.mataPelajaranUtama
  );
  const [profPassword, setProfPassword] = useState<string>(currentUser?.password || '123456');
  const [profFotoUrl, setProfFotoUrl] = useState<string>(
    currentUser?.fotoUrl || state.profil.fotoUrl || ''
  );

  // New Account Modal Form State (Admin Only)
  const [isAddAccountOpen, setIsAddAccountOpen] = useState<boolean>(false);
  const [newAccUser, setNewAccUser] = useState<string>('');
  const [newAccNama, setNewAccNama] = useState<string>('');
  const [newAccRole, setNewAccRole] = useState<'guru' | 'admin'>('guru');
  const [newAccPass, setNewAccPass] = useState<string>('123456');

  const triggerSuccessNotification = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Image Upload Helper to Base64
  const handleImageFileRead = (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (base64Url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('Ukuran file gambar maksimal 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        callback(evt.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSekolah = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Akses Ditolak: Hanya Admin yang berhak mengelola data sekolah.');
      return;
    }

    const updatedSekolah: PengaturanSekolah = {
      namaSekolah: sekNama,
      npsn: sekNpsn,
      namaKabupaten: sekKabupaten,
      alamatSekolah: sekAlamat,
      teleponSekolah: sekTelp,
      namaKepalaSekolah: sekKepsek,
      nipKepalaSekolah: sekNipKepsek,
      tahunAjaran: sekThn,
      semester: sekSemester,
      logoSekolahUrl,
      logoKabupatenUrl,
    };
    onUpdatePengaturanSekolah(updatedSekolah);

    // Update ProfilGuru school info
    onUpdateProfilGuru({
      ...state.profil,
      sekolah: sekNama,
      alamatSekolah: sekAlamat,
      teleponSekolah: sekTelp,
      tahunAjaran: sekThn,
      semester: sekSemester,
    });

    triggerSuccessNotification();
  };

  const handleSaveProfil = (e: React.FormEvent) => {
    e.preventDefault();

    // Update ProfilGuru
    onUpdateProfilGuru({
      ...state.profil,
      nama: profNama,
      nip: profNip,
      email: profEmail,
      mataPelajaranUtama: profMapel,
      fotoUrl: profFotoUrl,
    });

    // Update current user account & list
    if (currentUser) {
      const updatedAccounts = state.accounts.map((acc) => {
        if (acc.id === currentUser.id) {
          return {
            ...acc,
            nama: profNama,
            nip: profNip,
            email: profEmail,
            password: profPassword,
            mataPelajaran: profMapel,
            fotoUrl: profFotoUrl,
          };
        }
        return acc;
      });
      onUpdateAccounts(updatedAccounts);
    }

    triggerSuccessNotification();
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    const newAcc: UserAccount = {
      id: `U_${Date.now()}`,
      username: newAccUser,
      nama: newAccNama,
      role: newAccRole,
      password: newAccPass,
      email: `${newAccUser}@smp.belajar.id`,
    };
    onUpdateAccounts([...state.accounts, newAcc]);
    setIsAddAccountOpen(false);
    triggerSuccessNotification();
  };

  const handleDeleteAccount = (id: string, nama: string) => {
    if (!isAdmin) return;
    if (confirm(`Hapus akun pengguna ${nama}?`)) {
      onUpdateAccounts(state.accounts.filter((a) => a.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" />
            <span>{isAdmin ? 'Pengaturan Master Sekolah & Pengguna' : 'Pengaturan Profil Pengguna'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isAdmin
              ? 'Konfigurasi identitas sekolah, logo Pemda/Sekolah, serta manajemen akun sistem.'
              : `Pengaturan foto profil dan kata sandi untuk ${currentUser?.nama || 'Pengguna'}.`}
          </p>
        </div>

        {savedSuccess && (
          <div className="px-3.5 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm animate-pulse">
            <CheckCircle2 className="w-4 h-4" />
            <span>Pengaturan Berhasil Disimpan!</span>
          </div>
        )}
      </div>

      {/* Sub-Tab Selectors */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto">
        {/* Data Sekolah Sub-tab: VISIBLE FOR ADMIN ONLY */}
        {isAdmin && (
          <button
            onClick={() => setActiveTool('sekolah')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'sekolah'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Data & Logo Sekolah (Portal Admin)</span>
          </button>
        )}

        <button
          onClick={() => setActiveTool('profil')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'profil'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Foto & Profil Saya</span>
        </button>

        {/* Kelola Akun Sub-tab: VISIBLE FOR ADMIN ONLY */}
        {isAdmin && (
          <button
            onClick={() => setActiveTool('akun')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'akun'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Kelola Akun Guru ({state.accounts.length})</span>
          </button>
        )}

        {/* Backup & System Reset Sub-tab */}
        <button
          onClick={() => setActiveTool('sistem')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'sistem'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Backup Data</span>
        </button>
      </div>

      {/* Sub-Tab 1: Data Sekolah & Logos (ADMIN ONLY) */}
      {isAdmin && activeSubTab === 'sekolah' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs max-w-3xl">
          <h2 className="text-base font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">
            Identitas Master Sekolah, Logo Pemda & Logo Sekolah (Portal Admin)
          </h2>

          <form onSubmit={handleSaveSekolah} className="space-y-6">
            {/* Logo Upload Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              {/* Logo Kabupaten / Pemda Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Logo Pemerintah Kabupaten / Kota / Pemda
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl border border-slate-300 bg-white flex items-center justify-center overflow-hidden shrink-0">
                    {logoKabupatenUrl ? (
                      <img
                        src={logoKabupatenUrl}
                        alt="Logo Pemda"
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <Building2 className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileRead(e, setLogoKabupatenUrl)}
                      className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white cursor-pointer"
                    />
                    {logoKabupatenUrl && (
                      <button
                        type="button"
                        onClick={() => setLogoKabupatenUrl('')}
                        className="text-[10px] text-rose-600 font-bold hover:underline block"
                      >
                        Hapus Logo Pemda
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Logo Sekolah Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Logo Resmi Sekolah
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl border border-slate-300 bg-white flex items-center justify-center overflow-hidden shrink-0">
                    {logoSekolahUrl ? (
                      <img
                        src={logoSekolahUrl}
                        alt="Logo Sekolah"
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileRead(e, setLogoSekolahUrl)}
                      className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white cursor-pointer"
                    />
                    {logoSekolahUrl && (
                      <button
                        type="button"
                        onClick={() => setLogoSekolahUrl('')}
                        className="text-[10px] text-rose-600 font-bold hover:underline block"
                      >
                        Hapus Logo Sekolah
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* School Text Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Pemerintah Daerah / Kabupaten / Kota
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pemerintah Kota Denpasar"
                  value={sekKabupaten}
                  onChange={(e) => setSekKabupaten(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Resmi Sekolah
                </label>
                <input
                  type="text"
                  value={sekNama}
                  onChange={(e) => setSekNama(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">NPSN Sekolah</label>
                <input
                  type="text"
                  value={sekNpsn}
                  onChange={(e) => setSekNpsn(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Telepon Sekolah</label>
                <input
                  type="text"
                  value={sekTelp}
                  onChange={(e) => setSekTelp(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Lengkap Sekolah</label>
              <textarea
                rows={2}
                value={sekAlamat}
                onChange={(e) => setSekAlamat(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Kepala Sekolah</label>
                <input
                  type="text"
                  value={sekKepsek}
                  onChange={(e) => setSekKepsek(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">NIP Kepala Sekolah</label>
                <input
                  type="text"
                  value={sekNipKepsek}
                  onChange={(e) => setSekNipKepsek(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tahun Ajaran</label>
                <input
                  type="text"
                  value={sekThn}
                  onChange={(e) => setSekThn(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Semester Berjalan</label>
                <select
                  value={sekSemester}
                  onChange={(e) => setSekSemester(e.target.value as 'Ganjil' | 'Genap')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                >
                  <option value="Ganjil">Semester Ganjil</option>
                  <option value="Genap">Semester Genap</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Data & Logo Sekolah</span>
            </button>
          </form>
        </div>
      )}

      {/* Sub-Tab 2: Profil Logged In User & Photo Upload (For All Roles) */}
      {activeSubTab === 'profil' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs max-w-2xl">
          <h2 className="text-base font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">
            Profil & Foto Pengguna Saya ({currentUser?.role.toUpperCase()})
          </h2>

          <form onSubmit={handleSaveProfil} className="space-y-5">
            {/* Photo Avatar Upload */}
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="w-20 h-20 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-2xl overflow-hidden shrink-0 ring-4 ring-emerald-500/20">
                {profFotoUrl ? (
                  <img
                    src={profFotoUrl}
                    alt="Foto Profil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{profNama.charAt(0)}</span>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Unggah Foto Profil Baru
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageFileRead(e, setProfFotoUrl)}
                  className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white cursor-pointer"
                />
                {profFotoUrl && (
                  <button
                    type="button"
                    onClick={() => setProfFotoUrl('')}
                    className="text-[10px] text-rose-600 font-bold hover:underline block"
                  >
                    Hapus Foto Profil
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
              <input
                type="text"
                value={profNama}
                onChange={(e) => setProfNama(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">NIP / NISN Pengguna</label>
                <input
                  type="text"
                  value={profNip}
                  onChange={(e) => setProfNip(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Resmi</label>
                <input
                  type="email"
                  value={profEmail}
                  onChange={(e) => setProfEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  required
                />
              </div>
            </div>

            {currentUser?.role !== 'siswa' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mata Pelajaran Utama / Bidang</label>
                <input
                  type="text"
                  value={profMapel}
                  onChange={(e) => setProfMapel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ganti Password / Kata Sandi</label>
              <input
                type="password"
                value={profPassword}
                onChange={(e) => setProfPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                required
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Perbarui Profil & Foto</span>
            </button>
          </form>
        </div>
      )}

      {/* Sub-Tab 3: Kelola Pengguna Accounts (ADMIN ONLY) */}
      {isAdmin && activeSubTab === 'akun' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Daftar Akun Guru & Admin Sistem</h2>
            <button
              onClick={() => setIsAddAccountOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Akun Baru (Admin)</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="py-3 px-4">Nama Pengguna</th>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4 text-center">Peran (Role)</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4 text-center">Aksi (Admin)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
                {state.accounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold overflow-hidden shrink-0">
                          {acc.fotoUrl ? (
                            <img src={acc.fotoUrl} alt={acc.nama} className="w-full h-full object-cover" />
                          ) : (
                            acc.nama.charAt(0)
                          )}
                        </div>
                        <span className="font-bold text-slate-900">{acc.nama}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{acc.username}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          acc.role === 'admin'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {acc.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{acc.email}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDeleteAccount(acc.id, acc.nama)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Akun"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-Tab 4: Backup & System Reset */}
      {activeSubTab === 'sistem' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs max-w-xl space-y-6">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            Pemeliharaan Data & Backup Sistem
          </h2>

          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Unduh Cadangan Data (Backup JSON)</h3>
                <p className="text-slate-500 mt-0.5">
                  Simpan seluruh data nilai, absensi, jadwal, logo, dan jurnal ke file komputer.
                </p>
              </div>
              <button
                onClick={onExportBackup}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Backup</span>
              </button>
            </div>

            {isAdmin && (
              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/60 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-amber-900">Reset ke Data Bawaan Awal</h3>
                  <p className="text-amber-800 mt-0.5">
                    Kembalikan seluruh database ke preset sampel bawaan pabrik.
                  </p>
                </div>
                <button
                  onClick={onResetDefault}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Add Account (ADMIN ONLY) */}
      {isAdmin && isAddAccountOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Tambah Akun Pengguna Baru</h2>
            <p className="text-xs text-slate-500 mb-4">Buat akses login baru untuk Guru atau Admin.</p>

            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={newAccNama}
                  onChange={(e) => setNewAccNama(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Username Login</label>
                  <input
                    type="text"
                    value={newAccUser}
                    onChange={(e) => setNewAccUser(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Peran (Role)</label>
                  <select
                    value={newAccRole}
                    onChange={(e) => setNewAccRole(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  >
                    <option value="guru">Guru</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kata Sandi Initial</label>
                <input
                  type="password"
                  value={newAccPass}
                  onChange={(e) => setNewAccPass(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddAccountOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
