import React, { useState } from 'react';
import {
  Settings,
  Building2,
  User,
  ShieldCheck,
  Save,
  Plus,
  Trash2,
  Edit,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  Image as ImageIcon,
  FileSpreadsheet,
  FileText,
  Eye,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { SiaguState } from '../../utils/storage';
import { PengaturanSekolah, ProfilGuru, UserAccount } from '../../types/siagu';

interface PengaturanViewProps {
  state: SiaguState;
  onUpdatePengaturanSekolah: (updated: PengaturanSekolah) => void;
  onUpdateProfilGuru: (updated: ProfilGuru) => void;
  onUpdateAccounts: (updated: UserAccount[]) => void;
  onClearAbsensi?: () => void;
  onClearNilai?: () => void;
  onClearJadwal?: () => void;
  onClearJurnal?: () => void;
  onClearSiswa?: () => void;
  onClearKelas?: () => void;
  onExportBackup: () => void;
  onImportBackup: (importedState: SiaguState) => void;
  onResetDefault: () => void;
}

export const PengaturanView: React.FC<PengaturanViewProps> = ({
  state,
  onUpdatePengaturanSekolah,
  onUpdateProfilGuru,
  onUpdateAccounts,
  onClearAbsensi,
  onClearNilai,
  onClearJadwal,
  onClearJurnal,
  onClearSiswa,
  onClearKelas,
  onExportBackup,
  onImportBackup,
  onResetDefault,
}) => {
  const isAdmin = state.currentUser?.role === 'admin';

  // If not admin, default to 'profil' tab
  const [activeSubTab, setActiveTool] = useState<'sekolah' | 'kop' | 'profil' | 'akun' | 'sistem'>(
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

  // Form State: Kop Surat (Admin Only)
  const [kopBaris1, setKopBaris1] = useState<string>(
    state.pengaturanSekolah.kopBaris1 ||
      (state.pengaturanSekolah.namaKabupaten ? state.pengaturanSekolah.namaKabupaten.toUpperCase() : 'PEMERINTAH KOTA DENPASAR')
  );
  const [kopBaris2, setKopBaris2] = useState<string>(
    state.pengaturanSekolah.kopBaris2 || 'DINAS PENDIDIKAN KEPEMUDAAN DAN OLAHRAGA'
  );
  const [kopBaris3, setKopBaris3] = useState<string>(
    state.pengaturanSekolah.kopBaris3 || state.pengaturanSekolah.namaSekolah.toUpperCase()
  );
  const [kopAlamat, setKopAlamat] = useState<string>(
    state.pengaturanSekolah.kopAlamat || state.pengaturanSekolah.alamatSekolah
  );
  const [kopKontak, setKopKontak] = useState<string>(
    state.pengaturanSekolah.kopKontak ||
      `Telepon: ${state.pengaturanSekolah.teleponSekolah} · NPSN: ${state.pengaturanSekolah.npsn}`
  );
  const [kopWebsiteEmail, setKopWebsiteEmail] = useState<string>(
    state.pengaturanSekolah.kopWebsiteEmail ||
      `Email: ${state.pengaturanSekolah.emailSekolah || 'info@smpn1merdeka.sch.id'} · Website: ${state.pengaturanSekolah.websiteSekolah || 'www.smpn1merdeka.sch.id'}`
  );
  const [kopKotaSurat, setKopKotaSurat] = useState<string>(
    state.pengaturanSekolah.kopKotaSurat ||
      state.pengaturanSekolah.namaKabupaten?.replace(/^(Pemerintah\s+Kota|Pemerintah\s+Kabupaten|Kota|Kabupaten)\s+/i, '') ||
      'Denpasar'
  );
  const [kopTampilkanLogoKiri, setKopTampilkanLogoKiri] = useState<boolean>(
    state.pengaturanSekolah.kopTampilkanLogoKiri ?? true
  );
  const [kopTampilkanLogoKanan, setKopTampilkanLogoKanan] = useState<boolean>(
    state.pengaturanSekolah.kopTampilkanLogoKanan ?? true
  );
  const [kopGarisTipe, setKopGarisTipe] = useState<'double' | 'single' | 'none'>(
    state.pengaturanSekolah.kopGarisTipe || 'double'
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

  // Edit Account Modal Form State (Admin Only)
  const [editingAccount, setEditingAccount] = useState<UserAccount | null>(null);

  // Excel Guru Upload Modal State (Admin Only)
  const [isExcelGuruModalOpen, setIsExcelGuruModalOpen] = useState<boolean>(false);
  const [excelGuruRows, setExcelGuruRows] = useState<any[]>([]);
  const [excelGuruFileName, setExcelGuruFileName] = useState<string>('');
  const [successGuruImportMsg, setSuccessGuruImportMsg] = useState<string>('');

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
      ...state.pengaturanSekolah,
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
      kopBaris1,
      kopBaris2,
      kopBaris3,
      kopAlamat,
      kopKontak,
      kopWebsiteEmail,
      kopKotaSurat,
      kopTampilkanLogoKiri,
      kopTampilkanLogoKanan,
      kopGarisTipe,
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

  const handleSaveKopSurat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Akses Ditolak: Hanya Admin yang berhak mengedit kop surat.');
      return;
    }

    const updatedSekolah: PengaturanSekolah = {
      ...state.pengaturanSekolah,
      logoSekolahUrl,
      logoKabupatenUrl,
      kopBaris1,
      kopBaris2,
      kopBaris3,
      kopAlamat,
      kopKontak,
      kopWebsiteEmail,
      kopKotaSurat,
      kopTampilkanLogoKiri,
      kopTampilkanLogoKanan,
      kopGarisTipe,
    };
    onUpdatePengaturanSekolah(updatedSekolah);
    triggerSuccessNotification();
  };

  const handleSyncFromSchoolData = () => {
    setKopBaris1(sekKabupaten ? sekKabupaten.toUpperCase() : 'PEMERINTAH KOTA DENPASAR');
    setKopBaris2('DINAS PENDIDIKAN KEPEMUDAAN DAN OLAHRAGA');
    setKopBaris3(sekNama.toUpperCase());
    setKopAlamat(sekAlamat);
    setKopKontak(`Telepon: ${sekTelp} · NPSN: ${sekNpsn} · Akreditasi A`);
    setKopWebsiteEmail(
      `Email: ${state.pengaturanSekolah.emailSekolah || 'info@sekolah.sch.id'} · Website: ${state.pengaturanSekolah.websiteSekolah || 'www.sekolah.sch.id'}`
    );
    setKopKotaSurat(
      sekKabupaten?.replace(/^(Pemerintah\s+Kota|Pemerintah\s+Kabupaten|Kota|Kabupaten)\s+/i, '') ||
        'Denpasar'
    );
    setKopTampilkanLogoKiri(true);
    setKopTampilkanLogoKanan(true);
    setKopGarisTipe('double');
  };

  const handleApplyPresetYayasan = () => {
    setKopBaris1('YAYASAN PENDIDIKAN DAN KEBUDAYAAN NASIONAL');
    setKopBaris2('BADAN PENGELOLA PERGURUAN MENENGAH PERTAMA');
    setKopBaris3(sekNama.toUpperCase());
    setKopAlamat(sekAlamat);
    setKopKontak(`Telepon: ${sekTelp} · NPSN: ${sekNpsn} · Akreditasi A`);
    setKopWebsiteEmail(
      `Email: sekretariat@yayasanpendidikan.sch.id · Website: www.yayasanpendidikan.sch.id`
    );
    setKopKotaSurat(
      sekKabupaten?.replace(/^(Pemerintah\s+Kota|Pemerintah\s+Kabupaten|Kota|Kabupaten)\s+/i, '') ||
        'Denpasar'
    );
    setKopTampilkanLogoKiri(true);
    setKopTampilkanLogoKanan(true);
    setKopGarisTipe('double');
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

  const handleOpenEditAccountModal = (acc: UserAccount) => {
    setEditingAccount({ ...acc });
  };

  const handleSaveEditedAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;

    const updatedAccounts = state.accounts.map((acc) => {
      if (acc.id === editingAccount.id) {
        return editingAccount;
      }
      return acc;
    });

    onUpdateAccounts(updatedAccounts);
    setEditingAccount(null);
    triggerSuccessNotification();
  };

  const handleDeleteAccount = (id: string, nama: string) => {
    if (!isAdmin) return;
    if (confirm(`Hapus akun pengguna ${nama}?`)) {
      onUpdateAccounts(state.accounts.filter((a) => a.id !== id));
    }
  };

  // Excel Upload Data Guru Logic
  const handleExcelGuruFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelGuruFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonRows: any[] = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

        if (jsonRows.length === 0) {
          alert('File Excel data guru kosong atau format tidak terbaca.');
          return;
        }

        setExcelGuruRows(jsonRows);
      } catch (err) {
        alert('Gagal membaca file Excel data guru.');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDownloadGuruExcelTemplate = () => {
    const sampleData = [
      {
        NIP: '19850212 201001 2 004',
        'Nama Lengkap Guru & Gelar': 'Dra. Ni Made Sartika, M.Pd.',
        Username: 'sartika_ipa',
        'Kata Sandi': 'guru123',
        Email: 'sartika@guru.smp.belajar.id',
        'Mata Pelajaran Utama': 'Ilmu Pengetahuan Alam (IPA)',
        'Peran (Guru/Admin)': 'guru',
      },
      {
        NIP: '19880715 201202 1 008',
        'Nama Lengkap Guru & Gelar': 'I Gede Budiarsa, S.Pd.',
        Username: 'budiarsa_mtk',
        'Kata Sandi': 'guru123',
        Email: 'budiarsa@guru.smp.belajar.id',
        'Mata Pelajaran Utama': 'Matematika',
        'Peran (Guru/Admin)': 'guru',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Guru');
    XLSX.writeFile(workbook, 'Template_Upload_Data_Guru_SIAGU.xlsx');
  };

  const handleConfirmGuruExcelImport = () => {
    if (!isAdmin) return;
    if (excelGuruRows.length === 0) return;

    const importedGuruAccounts: UserAccount[] = excelGuruRows.map((row, i) => {
      const nama =
        row['Nama Lengkap Guru & Gelar'] ||
        row['Nama Lengkap'] ||
        row['Nama'] ||
        `Guru Pengampu ${i + 1}`;
      const nip = String(row['NIP'] || row['Nip'] || '');
      const username = String(
        row['Username'] || row['username'] || `guru_${Date.now()}_${i}`
      );
      const password = String(row['Kata Sandi'] || row['Password'] || '123456');
      const email = String(
        row['Email'] || row['email'] || `${username}@guru.smp.belajar.id`
      );
      const mataPelajaran = String(
        row['Mata Pelajaran Utama'] || row['Mapel'] || 'IPA'
      );
      const roleRaw = String(row['Peran (Guru/Admin)'] || row['Role'] || 'guru').toLowerCase();
      const role: 'guru' | 'admin' = roleRaw.includes('admin') ? 'admin' : 'guru';

      return {
        id: `U_XL_${Date.now()}_${i}`,
        username,
        nama,
        nip,
        email,
        password,
        role,
        mataPelajaran,
      };
    });

    onUpdateAccounts([...state.accounts, ...importedGuruAccounts]);
    setSuccessGuruImportMsg(
      `Berhasil mengunggah & membuat ${importedGuruAccounts.length} akun guru baru!`
    );
    setExcelGuruRows([]);
    setExcelGuruFileName('');
    setTimeout(() => {
      setSuccessGuruImportMsg('');
      setIsExcelGuruModalOpen(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" />
            <span>{isAdmin ? 'Pengaturan Master Sekolah & Upload Data Guru' : 'Pengaturan Profil Pengguna'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isAdmin
              ? 'Konfigurasi identitas sekolah, logo Pemda/Sekolah, serta kelola & edit data guru.'
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
            <span>Data & Logo Sekolah</span>
          </button>
        )}

        {/* Edit Kop Surat Sub-tab: VISIBLE FOR ADMIN ONLY */}
        {isAdmin && (
          <button
            onClick={() => setActiveTool('kop')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'kop'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Edit Kop Surat</span>
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

        {/* Kelola Akun & Upload Data Guru Sub-tab: VISIBLE FOR ADMIN ONLY */}
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
            <span>Kelola & Upload Data Guru ({state.accounts.length})</span>
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

      {/* Sub-Tab: Edit Kop Surat Dokumen Resmi (Admin Only) */}
      {activeSubTab === 'kop' && isAdmin && (
        <div className="space-y-6 max-w-5xl">
          {/* Action and Preset Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>Pengaturan & Desain Kop Surat Dokumen Resmi</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Kustomisasi teks instansi, nama sekolah, alamat, kontak, logo ganda, dan garis pembatas untuk seluruh cetak laporan resmi (Rekap Nilai, Rekap Presensi, Jurnal KBM).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSyncFromSchoolData}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200"
                title="Sinkronkan otomatis dari identitas sekolah yang telah tersimpan"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                <span>Muat dari Data Sekolah</span>
              </button>

              <button
                type="button"
                onClick={handleApplyPresetYayasan}
                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-purple-200"
                title="Gunakan format kop surat untuk sekolah swasta / yayasan"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Preset Swasta / Yayasan</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Form Editor (7 cols) */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
                <span>Formulir Teks & Format Kop</span>
                <span className="text-[11px] font-normal text-slate-500">Format standar dinas & kementerian</span>
              </h3>

              <form onSubmit={handleSaveKopSurat} className="space-y-4">
                {/* Baris 1 */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Baris 1: Instansi Induk / Pemerintah Daerah
                  </label>
                  <input
                    type="text"
                    value={kopBaris1}
                    onChange={(e) => setKopBaris1(e.target.value)}
                    placeholder="Contoh: PEMERINTAH KOTA DENPASAR"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
                    required
                  />
                  <span className="text-[10px] text-slate-400">Contoh: PEMERINTAH KOTA DENPASAR / PEMERINTAH PROVINSI BALI</span>
                </div>

                {/* Baris 2 */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Baris 2: Dinas Pendidikan / Badan Pengelola Yayasan
                  </label>
                  <input
                    type="text"
                    value={kopBaris2}
                    onChange={(e) => setKopBaris2(e.target.value)}
                    placeholder="Contoh: DINAS PENDIDIKAN KEPEMUDAAN DAN OLAHRAGA"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
                  />
                  <span className="text-[10px] text-slate-400">Contoh: DINAS PENDIDIKAN KEPEMUDAAN DAN OLAHRAGA</span>
                </div>

                {/* Baris 3 */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Baris 3: Nama Satuan Pendidikan (Teks Utama Besar)
                  </label>
                  <input
                    type="text"
                    value={kopBaris3}
                    onChange={(e) => setKopBaris3(e.target.value)}
                    placeholder="Contoh: SMP NEGERI 1 MERDEKA"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
                    required
                  />
                  <span className="text-[10px] text-slate-400">Tercetak dengan ukuran huruf paling tebal dan menonjol</span>
                </div>

                {/* Baris 4 */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Baris 4: Alamat Lengkap & Kode Pos
                  </label>
                  <input
                    type="text"
                    value={kopAlamat}
                    onChange={(e) => setKopAlamat(e.target.value)}
                    placeholder="Contoh: Jalan Pendidikan No. 45, Denpasar, Bali 80234"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                {/* Baris 5 */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Baris 5: Kontak & Identitas (Telepon, Fax, NPSN, Akreditasi)
                  </label>
                  <input
                    type="text"
                    value={kopKontak}
                    onChange={(e) => setKopKontak(e.target.value)}
                    placeholder="Contoh: Telepon: (0361) 234567 · NPSN: 50102030 · Akreditasi A"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Baris 6 */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Baris 6: Website & Email Resmi
                  </label>
                  <input
                    type="text"
                    value={kopWebsiteEmail}
                    onChange={(e) => setKopWebsiteEmail(e.target.value)}
                    placeholder="Contoh: Email: info@smpn1merdeka.sch.id · Website: www.smpn1merdeka.sch.id"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Kota untuk Tanda Tangan */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kota / Wilayah Surat (Titimangsa Tanda Tangan Laporan)
                  </label>
                  <input
                    type="text"
                    value={kopKotaSurat}
                    onChange={(e) => setKopKotaSurat(e.target.value)}
                    placeholder="Contoh: Denpasar"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <span className="text-[10px] text-slate-400">
                    Otomatis muncul pada blok tanda tangan bawah: &quot;{kopKotaSurat || 'Denpasar'}, [Tanggal Cetak]&quot;
                  </span>
                </div>

                {/* Pengaturan Logo & Garis */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900">
                    Pengaturan Logo & Garis Pembatas
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Logo Kiri Card */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">Logo Kiri (Pemda / Yayasan)</span>
                        <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={kopTampilkanLogoKiri}
                            onChange={(e) => setKopTampilkanLogoKiri(e.target.checked)}
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>Tampilkan</span>
                        </label>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                          {logoKabupatenUrl ? (
                            <img src={logoKabupatenUrl} alt="Logo Kiri" className="max-w-full max-h-full object-contain" />
                          ) : (
                            <span className="text-[9px] text-slate-400 font-bold text-center">Belum Ada</span>
                          )}
                        </div>
                        <div className="space-y-1">
                          <label className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold rounded-lg border border-slate-200 cursor-pointer shadow-2xs">
                            <Upload className="w-3 h-3" />
                            <span>Unggah</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageFileRead(e, setLogoKabupatenUrl)}
                              className="hidden"
                            />
                          </label>
                          {logoKabupatenUrl && (
                            <button
                              type="button"
                              onClick={() => setLogoKabupatenUrl('')}
                              className="block text-[10px] text-rose-600 hover:text-rose-700 font-bold cursor-pointer"
                            >
                              Hapus Logo
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Logo Kanan Card */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">Logo Kanan (Sekolah)</span>
                        <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={kopTampilkanLogoKanan}
                            onChange={(e) => setKopTampilkanLogoKanan(e.target.checked)}
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>Tampilkan</span>
                        </label>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                          {logoSekolahUrl ? (
                            <img src={logoSekolahUrl} alt="Logo Kanan" className="max-w-full max-h-full object-contain" />
                          ) : (
                            <span className="text-[9px] text-slate-400 font-bold text-center">Belum Ada</span>
                          )}
                        </div>
                        <div className="space-y-1">
                          <label className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold rounded-lg border border-slate-200 cursor-pointer shadow-2xs">
                            <Upload className="w-3 h-3" />
                            <span>Unggah</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageFileRead(e, setLogoSekolahUrl)}
                              className="hidden"
                            />
                          </label>
                          {logoSekolahUrl && (
                            <button
                              type="button"
                              onClick={() => setLogoSekolahUrl('')}
                              className="block text-[10px] text-rose-600 hover:text-rose-700 font-bold cursor-pointer"
                            >
                              Hapus Logo
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gaya Garis Pembatas */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Gaya Garis Pembatas Kop Surat
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setKopGarisTipe('double')}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                          kopGarisTipe === 'double'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div>Garis Ganda</div>
                        <div className="mt-1 border-b-4 border-double border-slate-800" />
                        <span className="text-[9px] text-slate-400 block mt-1">Standar Resmi Dinas</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setKopGarisTipe('single')}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                          kopGarisTipe === 'single'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div>Garis Tunggal</div>
                        <div className="mt-1 border-b-2 border-slate-800" />
                        <span className="text-[9px] text-slate-400 block mt-1">Garis Tebal</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setKopGarisTipe('none')}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                          kopGarisTipe === 'none'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div>Tanpa Garis</div>
                        <div className="mt-1 border-b border-dashed border-slate-300" />
                        <span className="text-[9px] text-slate-400 block mt-1">Polos</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Perubahan Kop Surat Resmi</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Live Real-Time WYSIWYG Print Preview (5 cols) */}
            <div className="lg:col-span-5 space-y-3 sticky top-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-emerald-600" />
                  <span>Pratinjau Langsung Kop Surat (Cetak A4)</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Real-time Preview
                </span>
              </div>

              {/* Paper Sheet Preview Mockup */}
              <div className="bg-white p-5 rounded-2xl border border-slate-300 shadow-md space-y-4">
                {/* Official Kop Rendered */}
                <div
                  className={`flex items-center justify-between pb-3 gap-3 text-center ${
                    kopGarisTipe === 'double'
                      ? 'border-b-4 border-double border-slate-900'
                      : kopGarisTipe === 'single'
                      ? 'border-b-2 border-slate-900'
                      : 'border-b border-transparent'
                  }`}
                >
                  {/* Left Logo */}
                  {kopTampilkanLogoKiri && (
                    <div className="w-14 h-14 flex items-center justify-center shrink-0">
                      {logoKabupatenUrl ? (
                        <img src={logoKabupatenUrl} alt="Logo Kiri" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <div className="w-12 h-12 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-[8px] text-slate-400 font-bold p-1 text-center">
                          Logo Kiri
                        </div>
                      )}
                    </div>
                  )}

                  {/* Header Texts */}
                  <div className="flex-1 px-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-800 leading-tight">
                      {kopBaris1 || 'PEMERINTAH KOTA DENPASAR'}
                    </div>
                    {kopBaris2 && (
                      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-700 leading-tight mt-0.5">
                        {kopBaris2}
                      </div>
                    )}
                    <div className="text-sm font-black uppercase text-slate-950 tracking-tight mt-0.5 leading-tight">
                      {kopBaris3 || 'SMP NEGERI 1 MERDEKA'}
                    </div>
                    <div className="text-[8.5px] text-slate-700 font-medium mt-0.5 leading-tight">
                      {kopAlamat || 'Jalan Pendidikan No. 45, Denpasar, Bali 80234'}
                    </div>
                    {kopKontak && (
                      <div className="text-[8px] text-slate-600 font-medium leading-tight">
                        {kopKontak}
                      </div>
                    )}
                    {kopWebsiteEmail && (
                      <div className="text-[7.5px] text-slate-500 font-medium leading-tight">
                        {kopWebsiteEmail}
                      </div>
                    )}
                  </div>

                  {/* Right Logo */}
                  {kopTampilkanLogoKanan && (
                    <div className="w-14 h-14 flex items-center justify-center shrink-0">
                      {logoSekolahUrl ? (
                        <img src={logoSekolahUrl} alt="Logo Kanan" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <div className="w-12 h-12 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-[8px] text-slate-400 font-bold p-1 text-center">
                          Logo Kanan
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Sample Document Title */}
                <div className="text-center pt-1 space-y-1">
                  <div className="text-[10px] font-extrabold uppercase text-slate-900 underline tracking-wider">
                    LAPORAN REKAPITULASI CAPAIAN PEMBELAJARAN
                  </div>
                  <div className="text-[8.5px] text-slate-500">
                    Tahun Ajaran {sekThn} · Semester {sekSemester}
                  </div>
                </div>

                {/* Skeleton preview lines */}
                <div className="space-y-1.5 pt-2">
                  <div className="h-4 bg-slate-100 rounded-md w-full border border-slate-200" />
                  <div className="h-4 bg-slate-50 rounded-md w-full border border-slate-100" />
                  <div className="h-4 bg-slate-50 rounded-md w-full border border-slate-100" />
                </div>

                {/* Signature Preview */}
                <div className="pt-4 grid grid-cols-2 gap-4 text-center text-[8px] font-medium text-slate-800 border-t border-slate-100">
                  <div>
                    <div>Mengetahui,</div>
                    <div className="font-bold">Kepala Sekolah</div>
                    <div className="h-8" />
                    <div className="font-bold underline">{sekKepsek || 'Nama Kepala Sekolah'}</div>
                    <div className="text-[7px] text-slate-500 font-mono">NIP: {sekNipKepsek || '1975...'}</div>
                  </div>
                  <div>
                    <div>{kopKotaSurat || 'Denpasar'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    <div className="font-bold">Guru Pengampu</div>
                    <div className="h-8" />
                    <div className="font-bold underline">{profNama || 'Nama Guru'}</div>
                    <div className="text-[7px] text-slate-500 font-mono">NIP: {profNip || '1988...'}</div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 text-[11px] text-emerald-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  Kop surat yang Anda ubah di sini akan langsung <b>tersinkronisasi secara otomatis</b> pada seluruh dokumen di menu <b>Cetak Laporan</b>.
                </div>
              </div>
            </div>
          </div>
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

      {/* Sub-Tab 3: Kelola & Upload Data Guru (ADMIN ONLY) */}
      {isAdmin && activeSubTab === 'akun' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Daftar Akun Guru & Admin Sistem</h2>
              <p className="text-xs text-slate-500">
                Kelola, edit data guru, atau unggah data guru secara massal via Excel.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsExcelGuruModalOpen(true)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Upload Data Guru (Excel)</span>
              </button>

              <button
                onClick={() => setIsAddAccountOpen(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Akun Baru</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="py-3 px-4">Nama Guru / Pengguna</th>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4 text-center">Peran (Role)</th>
                  <th className="py-3 px-4">Mapel / Bidang</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4 text-center">Aksi & Edit (Admin)</th>
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
                        <div>
                          <span className="font-bold text-slate-900 block">{acc.nama}</span>
                          {acc.nip && <span className="text-[10px] text-slate-400 font-mono">NIP: {acc.nip}</span>}
                        </div>
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
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {acc.mataPelajaran || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{acc.email}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEditAccountModal(acc)}
                          className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Data Guru / Akun Ini"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteAccount(acc.id, acc.nama)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Akun"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
              <>
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
                    <span>Reset All</span>
                  </button>
                </div>

                {/* Hapus Data Spesifik Per Menu */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-rose-600">
                    Hapus Data Spesifik Per Menu (Admin Only)
                  </h3>

                  <div className="grid grid-cols-1 gap-2.5">
                    {/* Hapus Data Presensi */}
                    <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-200/60 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">1. Data Presensi / Absensi</div>
                        <div className="text-[11px] text-slate-500">Tersimpan: <b>{state.absensi.length}</b> rekaman</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Apakah Anda yakin ingin MENGHAPUS SEMUA (${state.absensi.length}) rekaman data presensi?`)) {
                            onClearAbsensi?.();
                            alert('Seluruh data presensi berhasil dihapus.');
                          }
                        }}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Absensi</span>
                      </button>
                    </div>

                    {/* Hapus Data Nilai */}
                    <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-200/60 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">2. Data Nilai Siswa</div>
                        <div className="text-[11px] text-slate-500">Tersimpan: <b>{state.nilai.length}</b> nilai</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Apakah Anda yakin ingin MENGHAPUS SEMUA (${state.nilai.length}) data nilai siswa?`)) {
                            onClearNilai?.();
                            alert('Seluruh data nilai berhasil dihapus.');
                          }
                        }}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Nilai</span>
                      </button>
                    </div>

                    {/* Hapus Data Jurnal KBM */}
                    <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-200/60 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">3. Data Jurnal KBM & Agenda</div>
                        <div className="text-[11px] text-slate-500">Tersimpan: <b>{state.jurnal.length}</b> agenda</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Apakah Anda yakin ingin MENGHAPUS SEMUA (${state.jurnal.length}) data jurnal KBM?`)) {
                            onClearJurnal?.();
                            alert('Seluruh data jurnal KBM berhasil dihapus.');
                          }
                        }}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Jurnal</span>
                      </button>
                    </div>

                    {/* Hapus Jadwal Mengajar */}
                    <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-200/60 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">4. Data Jadwal Mengajar</div>
                        <div className="text-[11px] text-slate-500">Tersimpan: <b>{state.jadwal.length}</b> slot jadwal</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Apakah Anda yakin ingin MENGHAPUS SEMUA (${state.jadwal.length}) slot jadwal mengajar?`)) {
                            onClearJadwal?.();
                            alert('Seluruh data jadwal mengajar berhasil dihapus.');
                          }
                        }}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Jadwal</span>
                      </button>
                    </div>

                    {/* Hapus Data Siswa */}
                    <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-200/60 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">5. Data Master Siswa</div>
                        <div className="text-[11px] text-slate-500">Tersimpan: <b>{state.siswa.length}</b> siswa</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Apakah Anda yakin ingin MENGHAPUS SEMUA (${state.siswa.length}) data siswa?`)) {
                            onClearSiswa?.();
                            alert('Seluruh data siswa berhasil dihapus.');
                          }
                        }}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Siswa</span>
                      </button>
                    </div>

                    {/* Hapus Data Kelas */}
                    <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-200/60 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">6. Data Master Kelas</div>
                        <div className="text-[11px] text-slate-500">Tersimpan: <b>{state.kelas.length}</b> kelas</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Apakah Anda yakin ingin MENGHAPUS SEMUA (${state.kelas.length}) data kelas?`)) {
                            onClearKelas?.();
                            alert('Seluruh data kelas berhasil dihapus.');
                          }
                        }}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Kelas</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal Add Single Account (ADMIN ONLY) */}
      {isAdmin && isAddAccountOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Tambah Akun Pengguna Baru</h2>
            <p className="text-xs text-slate-500 mb-4">Buat akses login baru untuk Guru atau Admin.</p>

            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap & Gelar Guru</label>
                <input
                  type="text"
                  placeholder="e.g. Dra. Ni Made Sartika, M.Pd."
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
                    placeholder="sartika_ipa"
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

      {/* Modal Edit Account (ADMIN ONLY) */}
      {isAdmin && editingAccount && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Edit Data Guru / Akun</h2>
            <p className="text-xs text-slate-500 mb-4">Ubah profil guru, NIP, username, email, atau password.</p>

            <form onSubmit={handleSaveEditedAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap & Gelar Guru</label>
                <input
                  type="text"
                  value={editingAccount.nama}
                  onChange={(e) =>
                    setEditingAccount({ ...editingAccount, nama: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NIP Guru</label>
                  <input
                    type="text"
                    value={editingAccount.nip || ''}
                    onChange={(e) =>
                      setEditingAccount({ ...editingAccount, nip: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Username Login</label>
                  <input
                    type="text"
                    value={editingAccount.username}
                    onChange={(e) =>
                      setEditingAccount({ ...editingAccount, username: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Resmi</label>
                  <input
                    type="email"
                    value={editingAccount.email}
                    onChange={(e) =>
                      setEditingAccount({ ...editingAccount, email: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Peran (Role)</label>
                  <select
                    value={editingAccount.role}
                    onChange={(e) =>
                      setEditingAccount({ ...editingAccount, role: e.target.value as any })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  >
                    <option value="guru">Guru</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mata Pelajaran Utama / Bidang</label>
                <input
                  type="text"
                  value={editingAccount.mataPelajaran || ''}
                  onChange={(e) =>
                    setEditingAccount({ ...editingAccount, mataPelajaran: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password / Kata Sandi</label>
                <input
                  type="text"
                  value={editingAccount.password}
                  onChange={(e) =>
                    setEditingAccount({ ...editingAccount, password: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
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

      {/* Modal Upload Excel Data Guru (ADMIN ONLY) */}
      {isAdmin && isExcelGuruModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  <span>Upload Data Guru via Excel (Portal Admin)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Unggah berkas Excel (.xlsx, .xls) atau CSV untuk mengimpor akun guru secara massal.
                </p>
              </div>

              <button
                onClick={handleDownloadGuruExcelTemplate}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Template Excel Guru</span>
              </button>
            </div>

            {successGuruImportMsg && (
              <div className="p-4 bg-emerald-500 text-white rounded-2xl text-xs font-bold text-center mb-4 flex items-center justify-center gap-2 animate-bounce">
                <CheckCircle2 className="w-4 h-4" />
                <span>{successGuruImportMsg}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Upload Drop Box */}
              <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 p-6 rounded-2xl text-center bg-slate-50/60 transition-colors">
                <Upload className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-900">
                  {excelGuruFileName ? `File Terpilih: ${excelGuruFileName}` : 'Pilih file Excel (.xlsx / .csv)'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Kolom yang dikenali: NIP, Nama Lengkap Guru & Gelar, Username, Kata Sandi, Email, Mata Pelajaran Utama, Peran (Guru/Admin)
                </p>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleExcelGuruFileChange}
                  className="mt-3 text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white cursor-pointer"
                />
              </div>

              {/* Excel Preview */}
              {excelGuruRows.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-slate-900 block mb-2">
                    Pratinjau Data Guru Excel ({excelGuruRows.length} Guru Terbaca):
                  </span>

                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-slate-100 font-bold text-slate-700">
                          <th className="p-2 border-b">No</th>
                          <th className="p-2 border-b">Nama Guru</th>
                          <th className="p-2 border-b">NIP</th>
                          <th className="p-2 border-b">Username</th>
                          <th className="p-2 border-b">Mapel</th>
                          <th className="p-2 border-b">Peran</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                        {excelGuruRows.map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-2 font-mono">{i + 1}</td>
                            <td className="p-2 font-bold">{r['Nama Lengkap Guru & Gelar'] || r['Nama Lengkap'] || r['Nama'] || '—'}</td>
                            <td className="p-2 font-mono">{r['NIP'] || '—'}</td>
                            <td className="p-2 font-mono">{r['Username'] || '—'}</td>
                            <td className="p-2">{r['Mata Pelajaran Utama'] || r['Mapel'] || 'IPA'}</td>
                            <td className="p-2 font-bold uppercase">{r['Peran (Guru/Admin)'] || 'guru'}</td>
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
                  onClick={() => setIsExcelGuruModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmGuruExcelImport}
                  disabled={excelGuruRows.length === 0}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
                >
                  Konfirmasi Unggah ({excelGuruRows.length} Akun Guru)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
