import {
  Siswa,
  NilaiRecord,
  AbsensiRecord,
  RekapNilaiSiswa,
  StatusAbsensi,
} from '../types/siagu';

export function calculateNilaiSiswa(
  siswa: Siswa,
  nilaiList: NilaiRecord[],
  mapelId: string,
  kkm: number = 75
): RekapNilaiSiswa {
  const siswaNilai = nilaiList.filter(
    (n) => n.siswaId === siswa.id && (mapelId === 'ALL' || n.mapelId === mapelId)
  );

  const tugas = siswaNilai.filter((n) => n.kategori === 'Tugas').map((n) => n.skor);
  const uh = siswaNilai.filter((n) => n.kategori === 'UH').map((n) => n.skor);
  const ptsList = siswaNilai.filter((n) => n.kategori === 'PTS').map((n) => n.skor);
  const pasList = siswaNilai.filter((n) => n.kategori === 'PAS').map((n) => n.skor);

  const rataTugas =
    tugas.length > 0 ? tugas.reduce((a, b) => a + b, 0) / tugas.length : 0;
  const rataUH =
    uh.length > 0 ? uh.reduce((a, b) => a + b, 0) / uh.length : 0;
  const nilaiPTS = ptsList.length > 0 ? ptsList[ptsList.length - 1] : null;
  const nilaiPAS = pasList.length > 0 ? pasList[pasList.length - 1] : null;

  // Formula Kurikulum Merdeka / Standar SMP:
  // Formatif (Tugas + UH) = 40%
  // PTS = 30%
  // PAS = 30%
  let totalBobot = 0;
  let totalNilaiWeighted = 0;

  if (tugas.length > 0 || uh.length > 0) {
    const avgFormatif =
      tugas.length > 0 && uh.length > 0
        ? (rataTugas + rataUH) / 2
        : rataTugas || rataUH;
    totalNilaiWeighted += avgFormatif * 0.4;
    totalBobot += 0.4;
  }

  if (nilaiPTS !== null) {
    totalNilaiWeighted += nilaiPTS * 0.3;
    totalBobot += 0.3;
  }

  if (nilaiPAS !== null) {
    totalNilaiWeighted += nilaiPAS * 0.3;
    totalBobot += 0.3;
  }

  const nilaiAkhir =
    totalBobot > 0
      ? Math.round((totalNilaiWeighted / totalBobot) * 10) / 10
      : 0;

  let predikat: 'A' | 'B' | 'C' | 'D' = 'D';
  if (nilaiAkhir >= 90) predikat = 'A';
  else if (nilaiAkhir >= 80) predikat = 'B';
  else if (nilaiAkhir >= kkm) predikat = 'C';
  else predikat = 'D';

  const statusTuntas = nilaiAkhir >= kkm;

  return {
    siswa,
    nilaiTugas: tugas,
    nilaiUH: uh,
    nilaiPTS,
    nilaiPAS,
    rataTugas: Math.round(rataTugas * 10) / 10,
    rataUH: Math.round(rataUH * 10) / 10,
    nilaiAkhir,
    predikat,
    statusTuntas,
  };
}

export function calculateAbsensiSiswa(
  siswaId: string,
  absensiList: AbsensiRecord[]
) {
  const records = absensiList.filter((a) => a.siswaId === siswaId);
  const totalHari = records.length;

  if (totalHari === 0) {
    return { hadir: 0, sakit: 0, izin: 0, alpa: 0, persenHadir: 100, totalHari: 0 };
  }

  const hadir = records.filter((r) => r.status === 'H').length;
  const sakit = records.filter((r) => r.status === 'S').length;
  const izin = records.filter((r) => r.status === 'I').length;
  const alpa = records.filter((r) => r.status === 'A').length;

  const persenHadir = Math.round((hadir / totalHari) * 100);

  return { hadir, sakit, izin, alpa, persenHadir, totalHari };
}

export function generateWhatsAppAbsensiText(
  namaSiswa: string,
  namaOrangTua: string,
  kelas: string,
  tanggal: string,
  status: StatusAbsensi,
  keterangan?: string,
  namaSekolah: string = 'SMP Negeri 1 Merdeka'
): string {
  const statusFull =
    status === 'H'
      ? 'HADIR'
      : status === 'S'
      ? 'SAKIT'
      : status === 'I'
      ? 'IZIN'
      : 'ALPA (Tanpa Keterangan)';

  let text = `Yth. Bapak/Ibu ${namaOrangTua},\n\n`;
  text += `Pemberitahuan dari *${namaSekolah}* mengenai absensi harian putra/putri Anda:\n\n`;
  text += `*Nama*: ${namaSiswa}\n`;
  text += `*Kelas*: ${kelas}\n`;
  text += `*Tanggal*: ${tanggal}\n`;
  text += `*Status Kehadiran*: *${statusFull}*\n`;

  if (keterangan) {
    text += `*Keterangan*: ${keterangan}\n`;
  }

  if (status === 'A') {
    text += `\nMohon konfirmasi kepada Wali Kelas mengenai ketidakhadiran putra/putri Anda. Terima kasih.`;
  } else if (status === 'S') {
    text += `\nSemoga ananda lekas sembuh dan dapat kembali belajar di sekolah. Terima kasih.`;
  } else {
    text += `\nTerima kasih atas perhatian dan kerja samanya.`;
  }

  return encodeURIComponent(text);
}

export function formatNoHpWhatsApp(noHp: string): string {
  let cleaned = noHp.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }
  return cleaned;
}
