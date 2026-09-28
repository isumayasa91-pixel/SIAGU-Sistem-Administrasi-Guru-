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

export default function App() {
  const [state, setState] = useState<SiaguState>(() => loadSiaguData());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);

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
    }
    setState((prev) => ({ ...prev, currentUser: user, activeKelasId: targetKelasId }));
    if (user.role === 'siswa') {
      setActiveTab('nilai');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    setState((prev) => ({ ...prev, currentUser: null }));
  };

  const handleChangeActiveKelas = (kelasId: string) => {
    setState((prev) => ({ ...prev, activeKelasId: kelasId }));
  };

  const handleChangeSemester = (semester: 'Ganjil' | 'Genap') => {
    setState((prev) => ({
      ...prev,
      pengaturanSekolah: { ...prev.pengaturanSekolah, semester },
      profil: { ...prev.profil, semester },
    }));
  };

  const handleUpdateAbsensi = (updatedRecords: AbsensiRecord[]) => {
    setState((prev) => ({ ...prev, absensi: updatedRecords }));
  };

  const handleUpdateNilai = (updatedRecords: NilaiRecord[]) => {
    setState((prev) => ({ ...prev, nilai: updatedRecords }));
  };

  const handleUpdateJadwal = (updatedRecords: JadwalMengajar[]) => {
    setState((prev) => ({ ...prev, jadwal: updatedRecords }));
  };

  const handleUpdateJurnal = (updatedRecords: JurnalKBM[]) => {
    setState((prev) => ({ ...prev, jurnal: updatedRecords }));
  };

  const handleUpdateSiswa = (updatedList: Siswa[]) => {
    setState((prev) => ({ ...prev, siswa: updatedList }));
  };

  const handleUpdateKelas = (updatedKelas: Kelas[]) => {
    setState((prev) => ({ ...prev, kelas: updatedKelas }));
  };

  const handleUpdatePengaturanSekolah = (updated: PengaturanSekolah) => {
    setState((prev) => ({ ...prev, pengaturanSekolah: updated }));
  };

  const handleUpdateProfilGuru = (updated: ProfilGuru) => {
    setState((prev) => ({ ...prev, profil: updated }));
  };

  const handleUpdateAccounts = (updatedAccounts: UserAccount[]) => {
    setState((prev) => ({ ...prev, accounts: updatedAccounts }));
  };

  const handleClearAbsensi = () => {
    setState((prev) => ({ ...prev, absensi: [] }));
  };

  const handleClearNilai = () => {
    setState((prev) => ({ ...prev, nilai: [] }));
  };

  const handleClearJadwal = () => {
    setState((prev) => ({ ...prev, jadwal: [] }));
  };

  const handleClearJurnal = () => {
    setState((prev) => ({ ...prev, jurnal: [] }));
  };

  const handleClearSiswa = () => {
    setState((prev) => ({ ...prev, siswa: [] }));
  };

  const handleClearKelas = () => {
    setState((prev) => ({ ...prev, kelas: [] }));
  };

  const handleExportBackup = () => {
    exportSiaguBackupJSON(state);
  };

  const handleImportBackup = (importedState: SiaguState) => {
    setState(importedState);
    saveSiaguData(importedState);
  };

  const handleResetDefault = () => {
    if (confirm('Apakah Anda yakin ingin mengembalikan data ke sampel bawaan awal?')) {
      const defaultState = getFactoryDefaultData();
      setState(defaultState);
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
          <LaporanView state={state} />
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
