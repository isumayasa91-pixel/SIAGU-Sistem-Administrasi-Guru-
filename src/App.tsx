import React, { useState, useEffect } from 'react';
import {
  SiaguState,
  loadSiaguData,
  saveSiaguData,
  fetchServerSiaguData,
  exportSiaguBackupJSON,
  getFactoryDefaultData,
} from './utils/storage';
import {
  ActiveTab,
  AbsensiRecord,
  NilaiRecord,
  JadwalMengajar,
  JurnalKBM,
  Siswa,
  Kelas,
  UserAccount,
  PengaturanSekolah,
  ProfilGuru,
} from './types/siagu';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/views/DashboardView';
import { AbsensiView } from './components/views/AbsensiView';
import { NilaiView } from './components/views/NilaiView';
import { JadwalView } from './components/views/JadwalView';
import { JurnalView } from './components/views/JurnalView';
import { SiswaView } from './components/views/SiswaView';
import { KelasView } from './components/views/KelasView';
import { PengaturanView } from './components/views/PengaturanView';
import { AiAssistantView } from './components/views/AiAssistantView';
import { LaporanView } from './components/views/LaporanView';
import { QrScannerModal } from './components/modals/QrScannerModal';
import { LoginView } from './components/auth/LoginView';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import { getTeacherMapelForKelas, getVisibleKelas } from './utils/guruAssignment';

function AppContent() {
  const [state, setState] = useState<SiaguState>(() => loadSiaguData());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const { notifySuccess, notifySaved, notifyInfo } = useNotification();

  // Fetch initial central database state on mount for cross-device sync
  useEffect(() => {
    fetchServerSiaguData().then((serverData) => {
      if (serverData) {
        setState((prev) => ({
          ...serverData,
          currentUser: prev.currentUser, // Keep logged in session if active
        }));
      }
    });
  }, []);

  // Sync state to central storage & local storage whenever state updates
  useEffect(() => {
    saveSiaguData(state);
  }, [state]);

  // If user is logged in, validate and ensure activeKelasId is within visible/assigned classes
  useEffect(() => {
    if (!state.currentUser) return;
    const visibleClasses = getVisibleKelas(state.currentUser, state);
    if (visibleClasses.length > 0) {
      const isCurrentValid = visibleClasses.some((k) => k.id === state.activeKelasId);
      if (!isCurrentValid) {
        setState((prev) => ({ ...prev, activeKelasId: visibleClasses[0].id }));
      }
    }
  }, [state.currentUser, state.kelas]);

  // If user is logged in as Siswa, restrict activeTab to allowed student views
  useEffect(() => {
    if (state.currentUser?.role === 'siswa') {
      if (activeTab !== 'nilai' && activeTab !== 'absensi' && activeTab !== 'jadwal') {
        setActiveTab('nilai');
      }
    }
  }, [state.currentUser?.role, activeTab]);

  const handleLoginSuccess = (user: UserAccount) => {
    let targetKelasId = state.activeKelasId;
    if (user.role === 'siswa') {
      const s = state.siswa.find((st) => st.nisn === user.username || st.nis === user.username);
      if (s) {
        targetKelasId = s.kelasId;
      }
    } else if (user.role === 'guru') {
      // Teachers only see their assigned classes (kelas yang diampu)
      const visibleClasses = getVisibleKelas(user, state);
      if (visibleClasses.length > 0) {
        const isCurrentValid = visibleClasses.some((k) => k.id === targetKelasId);
        if (!isCurrentValid) {
          targetKelasId = visibleClasses[0].id;
        }
      }
    }

    const assignedMapel = getTeacherMapelForKelas(user, targetKelasId, state);

    setState((prev) => ({
      ...prev,
      currentUser: user,
      activeKelasId: targetKelasId,
      profil: {
        ...prev.profil,
        mataPelajaranUtama: assignedMapel.nama,
      },
    }));

    if (user.role === 'guru') {
      const visibleClasses = getVisibleKelas(user, state);
      const classNames = visibleClasses.map((k) => k.namaKelas).join(', ');
      notifySuccess(
        `Login berhasil! Kelas yang diampu: ${classNames || targetKelasId} (Mapel: ${assignedMapel.nama})`,
        `Selamat Datang, ${user.nama}!`
      );
    } else {
      notifySuccess(`Selamat datang kembali, ${user.nama}!`, 'Login Berhasil');
    }

    if (user.role === 'siswa') {
      setActiveTab('nilai');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    setState((prev) => ({ ...prev, currentUser: null }));
    notifyInfo('Sesi akun Anda telah berhasil ditutup.', 'Berhasil Logout');
  };

  const handleChangeActiveKelas = (kelasId: string) => {
    const teacherMapel = getTeacherMapelForKelas(state.currentUser, kelasId, state);
    setState((prev) => ({
      ...prev,
      activeKelasId: kelasId,
      profil: {
        ...prev.profil,
        mataPelajaranUtama: teacherMapel.nama,
      },
    }));
    notifyInfo(`Beralih ke Kelas ${kelasId} · Mapel: ${teacherMapel.nama} (${teacherMapel.kode})`, 'Kelas Aktif');
  };

  const handleChangeSemester = (semester: 'Ganjil' | 'Genap') => {
    setState((prev) => ({
      ...prev,
      pengaturanSekolah: { ...prev.pengaturanSekolah, semester },
      profil: { ...prev.profil, semester },
    }));
    notifySuccess(`Semester berhasil diubah ke ${semester} dan disimpan.`, 'Pengaturan Disimpan');
  };

  const handleUpdateAbsensi = (updatedRecords: AbsensiRecord[]) => {
    setState((prev) => ({ ...prev, absensi: updatedRecords }));
    notifySaved('Data Presensi', 'Rekaman absensi siswa berhasil disimpan ke sistem.');
  };

  const handleUpdateNilai = (updatedRecords: NilaiRecord[]) => {
    setState((prev) => ({ ...prev, nilai: updatedRecords }));
    notifySaved('Data Nilai', 'Data capaian nilai siswa berhasil disimpan.');
  };

  const handleUpdateJadwal = (updatedRecords: JadwalMengajar[]) => {
    setState((prev) => ({ ...prev, jadwal: updatedRecords }));
    notifySaved('Jadwal Pelajaran', 'Jadwal mengajar berhasil disimpan.');
  };

  const handleUpdateJurnal = (updatedRecords: JurnalKBM[]) => {
    setState((prev) => ({ ...prev, jurnal: updatedRecords }));
    notifySaved('Jurnal KBM', 'Agenda kegiatan belajar mengajar berhasil disimpan.');
  };

  const handleUpdateSiswa = (updatedList: Siswa[]) => {
    setState((prev) => ({ ...prev, siswa: updatedList }));
    notifySaved('Data Siswa', 'Data master siswa berhasil disimpan.');
  };

  const handleUpdateKelas = (updatedKelas: Kelas[]) => {
    setState((prev) => ({ ...prev, kelas: updatedKelas }));
    notifySaved('Data Kelas', 'Data rombel/kelas berhasil disimpan.');
  };

  const handleUpdatePengaturanSekolah = (updated: PengaturanSekolah) => {
    setState((prev) => ({ ...prev, pengaturanSekolah: updated }));
    notifySaved('Pengaturan Sekolah', 'Data sekolah dan logo berhasil disimpan.');
  };

  const handleUpdateProfilGuru = (updated: ProfilGuru) => {
    setState((prev) => ({ ...prev, profil: updated }));
    notifySaved('Profil Pengguna', 'Data profil & foto berhasil diperbarui.');
  };

  const handleUpdateAccounts = (updatedAccounts: UserAccount[]) => {
    setState((prev) => ({ ...prev, accounts: updatedAccounts }));
    notifySaved('Akun Pengguna', 'Data akun login berhasil diperbarui.');
  };

  const handleClearAbsensi = () => {
    setState((prev) => ({ ...prev, absensi: [] }));
    notifySuccess('Seluruh data presensi telah berhasil dikosongkan.', 'Data Dihapus');
  };

  const handleClearNilai = () => {
    setState((prev) => ({ ...prev, nilai: [] }));
    notifySuccess('Seluruh data nilai telah berhasil dikosongkan.', 'Data Dihapus');
  };

  const handleClearJadwal = () => {
    setState((prev) => ({ ...prev, jadwal: [] }));
    notifySuccess('Seluruh data jadwal telah berhasil dikosongkan.', 'Data Dihapus');
  };

  const handleClearJurnal = () => {
    setState((prev) => ({ ...prev, jurnal: [] }));
    notifySuccess('Seluruh data jurnal KBM telah berhasil dikosongkan.', 'Data Dihapus');
  };

  const handleClearSiswa = () => {
    setState((prev) => ({ ...prev, siswa: [] }));
    notifySuccess('Seluruh data siswa telah berhasil dikosongkan.', 'Data Dihapus');
  };

  const handleClearKelas = () => {
    setState((prev) => ({ ...prev, kelas: [] }));
    notifySuccess('Seluruh data kelas telah berhasil dikosongkan.', 'Data Dihapus');
  };

  const handleExportBackup = () => {
    exportSiaguBackupJSON(state);
    notifySuccess('File cadangan data (backup .json) berhasil diunduh ke komputer Anda.', 'File Berhasil Disimpan');
  };

  const handleImportBackup = (importedState: SiaguState) => {
    setState(importedState);
    saveSiaguData(importedState);
    notifySuccess('File cadangan berhasil diimpor & seluruh data tersimpan ke sistem!', 'Data Berhasil Dipulihkan');
  };

  const handleResetDefault = () => {
    if (confirm('Apakah Anda yakin ingin mengembalikan data ke sampel bawaan awal?')) {
      const defaultState = getFactoryDefaultData();
      setState(defaultState);
      notifySuccess('Seluruh database telah dikembalikan ke sampel data bawaan pabrik.', 'Reset Berhasil');
    }
  };

  // If user is not logged in, show Login Screen
  if (!state.currentUser) {
    return <LoginView state={state} onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Header */}
      <Header
        state={state}
        onChangeActiveKelas={handleChangeActiveKelas}
        onChangeSemester={handleChangeSemester}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onResetDefault={handleResetDefault}
        onLogout={handleLogout}
      />

      {/* Main Navigation Tabs */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        userRole={state.currentUser.role}
      />

      {/* View Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            state={state}
            onNavigate={setActiveTab}
            onOpenQrScanner={() => setIsQrModalOpen(true)}
          />
        )}

        {activeTab === 'absensi' && (
          <AbsensiView
            state={state}
            onUpdateAbsensi={handleUpdateAbsensi}
            onOpenQrScanner={() => setIsQrModalOpen(true)}
            onNavigateToReport={() => setActiveTab('laporan')}
          />
        )}

        {activeTab === 'nilai' && (
          <NilaiView
            state={state}
            onUpdateNilai={handleUpdateNilai}
            onNavigateToReport={() => setActiveTab('laporan')}
          />
        )}

        {activeTab === 'jadwal' && (
          <JadwalView
            state={state}
            onUpdateJadwal={handleUpdateJadwal}
          />
        )}

        {activeTab === 'jurnal' && (
          <JurnalView
            state={state}
            onUpdateJurnal={handleUpdateJurnal}
            onNavigateToReport={() => setActiveTab('laporan')}
          />
        )}

        {activeTab === 'siswa' && (
          <SiswaView
            state={state}
            onUpdateSiswa={handleUpdateSiswa}
          />
        )}

        {activeTab === 'kelola_kelas' && (
          <KelasView
            state={state}
            onUpdateKelas={handleUpdateKelas}
            onUpdateSiswa={handleUpdateSiswa}
            onChangeActiveKelas={handleChangeActiveKelas}
          />
        )}

        {activeTab === 'pengaturan' && (
          <PengaturanView
            state={state}
            onUpdatePengaturanSekolah={handleUpdatePengaturanSekolah}
            onUpdateProfilGuru={handleUpdateProfilGuru}
            onUpdateAccounts={handleUpdateAccounts}
            onClearAbsensi={handleClearAbsensi}
            onClearNilai={handleClearNilai}
            onClearJadwal={handleClearJadwal}
            onClearJurnal={handleClearJurnal}
            onClearSiswa={handleClearSiswa}
            onClearKelas={handleClearKelas}
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
            onResetDefault={handleResetDefault}
          />
        )}

        {activeTab === 'ai_assistant' && (
          <AiAssistantView state={state} />
        )}

        {activeTab === 'laporan' && (
          <LaporanView
            state={state}
            onChangeActiveKelas={handleChangeActiveKelas}
          />
        )}
      </main>

      {/* QR Presensi Simulator Modal */}
      <QrScannerModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        state={state}
        onUpdateAbsensi={handleUpdateAbsensi}
      />

      {/* Quiet Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            <b>SIAGU</b> — Sistem Administrasi Guru · Akses: <b className="text-slate-800">{state.currentUser.nama} ({state.currentUser.role.toUpperCase()})</b>
          </div>
          <div>
            {state.pengaturanSekolah.namaSekolah} · Semester {state.pengaturanSekolah.semester} {state.pengaturanSekolah.tahunAjaran}
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
}

