export type JenisKelamin = 'L' | 'P';

export type StatusAbsensi = 'H' | 'S' | 'I' | 'A'; // Hadir, Sakit, Izin, Alpa

export interface Siswa {
  id: string;
  nis: string;
  nisn: string;
  nama: string;
  kelasId: string; // e.g. '7A'
  jenisKelamin: JenisKelamin;
  namaOrangTua: string;
  noHpOrangTua: string;
  alamat?: string;
  catatanKhusus?: string;
}

export interface Kelas {
  id: string; // e.g., '7A', '7B', '8A'
  namaKelas: string;
  tingkat: number; // 7, 8, 9
  waliKelas: string;
  tahunAjaran: string; // e.g. "2025/2026"
  semester: 'Ganjil' | 'Genap';
}

export interface MataPelajaran {
  id: string;
  kode: string;
  nama: string;
  kkm: number; // e.g. 75
}

export interface AbsensiRecord {
  id: string;
  tanggal: string; // YYYY-MM-DD
  kelasId: string;
  siswaId: string;
  status: StatusAbsensi;
  keterangan?: string;
  jamInput: string; // e.g. "07:15"
}

export type KategoriNilai = 'Tugas' | 'UH' | 'PTS' | 'PAS';

export interface NilaiRecord {
  id: string;
  siswaId: string;
  kelasId: string;
  mapelId: string;
  kategori: KategoriNilai;
  namaPenilaian: string; // e.g., "Tugas 1 - Sel & Jaringan", "UH 2 - Ekosistem"
  capaianPembelajaran?: string; // e.g., "TP 7.1 Memahami Klasifikasi Sel"
  skor: number; // 0-100
  tanggal: string;
}

export interface RekapNilaiSiswa {
  siswa: Siswa;
  nilaiTugas: number[];
  nilaiUH: number[];
  nilaiPTS: number | null;
  nilaiPAS: number | null;
  rataTugas: number;
  rataUH: number;
  nilaiAkhir: number;
  predikat: 'A' | 'B' | 'C' | 'D';
  statusTuntas: boolean;
  catatanSikap?: string;
}

export interface JadwalMengajar {
  id: string;
  hari: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
  jamKe: number; // 1, 2, 3...
  jamMulai: string; // e.g. "07:30"
  jamSelesai: string; // e.g. "09:00"
  kelasId: string;
  mapelId: string;
  ruangan: string;
  topikRencana?: string;
}

export interface JurnalKBM {
  id: string;
  tanggal: string;
  jamKe?: string; // e.g. "Jam 1-2", "Jam 3-4", "Jam 5-7"
  kelasId: string;
  mapelId: string;
  materiPokok: string;
  tujuanPembelajaran: string;
  kegiatanPembelajaran: string;
  jumlahHadir: number;
  jumlahSakit: number;
  jumlahIzin: number;
  jumlahAlpa: number;
  catatanKejadian: string;
}

export type UserRole = 'guru' | 'admin' | 'siswa';

export interface UserAccount {
  id: string;
  username: string;
  nama: string;
  role: UserRole;
  nip?: string;
  email: string;
  password?: string;
  mataPelajaran?: string;
  jabatan?: string;
  fotoUrl?: string;
  kelasDiampu?: string[]; // Daftar ID kelas yang diampu guru, misal: ['7A', '7B']
  mapelPerKelas?: Record<string, string>; // Mapel yang diajarkan per kelas, misal: { '7A': 'IPA', '7B': 'IPA' }
}

export interface PengaturanSekolah {
  namaSekolah: string;
  npsn: string;
  alamatSekolah: string;
  teleponSekolah: string;
  namaKepalaSekolah: string;
  nipKepalaSekolah: string;
  tahunAjaran: string;
  semester: 'Ganjil' | 'Genap';
  emailSekolah?: string;
  websiteSekolah?: string;
  logoSekolahUrl?: string;
  logoKabupatenUrl?: string;
  namaKabupaten?: string;
  // Kop Surat fields
  kopBaris1?: string;
  kopBaris2?: string;
  kopBaris3?: string;
  kopAlamat?: string;
  kopKontak?: string;
  kopWebsiteEmail?: string;
  kopKotaSurat?: string;
  kopTampilkanLogoKiri?: boolean;
  kopTampilkanLogoKanan?: boolean;
  kopGarisTipe?: 'double' | 'single' | 'none';
}

export interface ProfilGuru {
  nama: string;
  nip: string;
  email: string;
  sekolah: string;
  alamatSekolah: string;
  tahunAjaran: string;
  semester: 'Ganjil' | 'Genap';
  mataPelajaranUtama: string;
  teleponSekolah: string;
  fotoUrl?: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'absensi'
  | 'nilai'
  | 'jadwal'
  | 'jurnal'
  | 'siswa'
  | 'kelola_kelas'
  | 'pengaturan'
  | 'ai_assistant'
  | 'laporan';
