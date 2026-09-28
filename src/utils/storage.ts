import {
  Kelas,
  MataPelajaran,
  ProfilGuru,
  Siswa,
  JadwalMengajar,
  JurnalKBM,
  AbsensiRecord,
  NilaiRecord,
  UserAccount,
  PengaturanSekolah,
} from '../types/siagu';
import {
  initialProfilGuru,
  initialKelas,
  initialMapel,
  initialSiswa,
  initialJadwal,
  initialAbsensi,
  initialNilai,
  initialJurnal,
  initialAccounts,
  initialPengaturanSekolah,
} from '../data/initialData';

const STORAGE_KEY = 'siagu_app_data_v6';

export interface SiaguState {
  currentUser: UserAccount | null;
  accounts: UserAccount[];
  pengaturanSekolah: PengaturanSekolah;
  profil: ProfilGuru;
  kelas: Kelas[];
  mapel: MataPelajaran[];
  siswa: Siswa[];
  jadwal: JadwalMengajar[];
  absensi: AbsensiRecord[];
  nilai: NilaiRecord[];
  jurnal: JurnalKBM[];
  activeKelasId: string;
}

export function loadSiaguData(): SiaguState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return getFactoryDefaultData();
    }
    const parsed = JSON.parse(raw);
    return {
      currentUser: parsed.currentUser !== undefined ? parsed.currentUser : null,
      accounts: parsed.accounts || initialAccounts,
      pengaturanSekolah: parsed.pengaturanSekolah || initialPengaturanSekolah,
      profil: parsed.profil || initialProfilGuru,
      kelas: parsed.kelas || initialKelas,
      mapel: parsed.mapel || initialMapel,
      siswa: parsed.siswa || initialSiswa,
      jadwal: parsed.jadwal || initialJadwal,
      absensi: parsed.absensi || initialAbsensi,
      nilai: parsed.nilai || initialNilai,
      jurnal: parsed.jurnal || initialJurnal,
      activeKelasId: parsed.activeKelasId || '7A',
    };
  } catch (err) {
    console.error('Failed to load SIAGU data from localStorage:', err);
    return getFactoryDefaultData();
  }
}

export function saveSiaguData(state: SiaguState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    // Asynchronously push to server for cross-device sync
    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    }).catch(() => {
      // Ignore network errors when offline
    });
  } catch (err) {
    console.error('Failed to save SIAGU data:', err);
  }
}

export async function fetchServerSiaguData(): Promise<SiaguState | null> {
  try {
    const res = await fetch('/api/data');
    if (!res.ok) return null;
    const data = await res.json();
    if (data && !data.empty && Array.isArray(data.siswa)) {
      const serverState: SiaguState = {
        currentUser: null, // Keep login prompt active
        accounts: data.accounts || initialAccounts,
        pengaturanSekolah: data.pengaturanSekolah || initialPengaturanSekolah,
        profil: data.profil || initialProfilGuru,
        kelas: data.kelas || initialKelas,
        mapel: data.mapel || initialMapel,
        siswa: data.siswa || initialSiswa,
        jadwal: data.jadwal || initialJadwal,
        absensi: data.absensi || initialAbsensi,
        nilai: data.nilai || initialNilai,
        jurnal: data.jurnal || initialJurnal,
        activeKelasId: data.activeKelasId || '7A',
      };
      saveSiaguData(serverState);
      return serverState;
    }
  } catch (err) {
    // Return null if network error
  }
  return null;
}

export function getFactoryDefaultData(): SiaguState {
  const state: SiaguState = {
    currentUser: null, // First screen when deployed/opened is Portal Login
    accounts: initialAccounts,
    pengaturanSekolah: initialPengaturanSekolah,
    profil: initialProfilGuru,
    kelas: initialKelas,
    mapel: initialMapel,
    siswa: initialSiswa,
    jadwal: initialJadwal,
    absensi: initialAbsensi,
    nilai: initialNilai,
    jurnal: initialJurnal,
    activeKelasId: '7A',
  };
  saveSiaguData(state);
  return state;
}

export function exportSiaguBackupJSON(state: SiaguState): void {
  const jsonStr = JSON.stringify(state, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `SIAGU_Backup_${state.profil.nama.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
