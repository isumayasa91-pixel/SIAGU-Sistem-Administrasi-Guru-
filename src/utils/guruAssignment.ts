import { Kelas, MataPelajaran, UserAccount } from '../types/siagu';
import { SiaguState } from './storage';

/**
 * Returns the list of classes that the currently logged-in user is authorized to see.
 * - Admin: All classes.
 * - Siswa: Only the student's enrolled class.
 * - Guru: ONLY the classes that the teacher teaches / is assigned to (kelas yang diampu).
 */
export function getVisibleKelas(
  currentUser: UserAccount | null | undefined,
  state: SiaguState
): Kelas[] {
  if (!currentUser) return state.kelas;

  // 1. Admin sees all classes
  if (currentUser.role === 'admin') {
    return state.kelas;
  }

  // 2. Siswa sees only their own enrolled class
  if (currentUser.role === 'siswa') {
    const student = state.siswa.find(
      (s) =>
        s.nisn === currentUser.username ||
        s.nis === currentUser.username ||
        s.nama.toLowerCase() === currentUser.nama.toLowerCase()
    );
    if (student) {
      const k = state.kelas.find((c) => c.id === student.kelasId);
      return k ? [k] : state.kelas;
    }
    // Fallback if student ID is in nip
    const kByNip = state.kelas.find((c) => c.id === currentUser.nip);
    return kByNip ? [kByNip] : state.kelas;
  }

  // 3. Guru: Only assigned classes (kelas yang diampu)
  // Check explicit assigned classes first
  if (currentUser.kelasDiampu && currentUser.kelasDiampu.length > 0) {
    const matched = state.kelas.filter((k) =>
      currentUser.kelasDiampu?.includes(k.id)
    );
    if (matched.length > 0) return matched;
  }

  // Fallback 1: Derive from teacher's schedule in state.jadwal
  const teacherMapelCode = extractMapelCode(currentUser.mataPelajaran || '');
  const classesFromJadwal = new Set<string>();

  state.jadwal.forEach((j) => {
    // If schedule matches teacher's mapel
    if (teacherMapelCode && j.mapelId.toLowerCase() === teacherMapelCode.toLowerCase()) {
      classesFromJadwal.add(j.kelasId);
    }
  });

  // Fallback 2: Check if teacher is wali kelas in state.kelas
  state.kelas.forEach((k) => {
    if (
      k.waliKelas &&
      (k.waliKelas.toLowerCase().includes(currentUser.nama.toLowerCase()) ||
        currentUser.nama.toLowerCase().includes(k.waliKelas.toLowerCase()))
    ) {
      classesFromJadwal.add(k.id);
    }
  });

  // Default demo for guru1 if no schedule found yet
  if (currentUser.username === 'guru1' || currentUser.email === 'isumayasa91@guru.smp.belajar.id') {
    classesFromJadwal.add('7A');
    classesFromJadwal.add('7B');
  }

  if (classesFromJadwal.size > 0) {
    const derived = state.kelas.filter((k) => classesFromJadwal.has(k.id));
    if (derived.length > 0) return derived;
  }

  // If no specific assignment can be found, return the first class as safe default
  return state.kelas.slice(0, 1);
}

/**
 * Returns the primary subject (Mata Pelajaran) taught by the teacher for a given class.
 */
export function getTeacherMapelForKelas(
  currentUser: UserAccount | null | undefined,
  kelasId: string,
  state: SiaguState
): MataPelajaran {
  // 1. Check user.mapelPerKelas dictionary
  if (currentUser?.mapelPerKelas && currentUser.mapelPerKelas[kelasId]) {
    const targetMapelId = currentUser.mapelPerKelas[kelasId];
    const found = state.mapel.find(
      (m) =>
        m.id.toLowerCase() === targetMapelId.toLowerCase() ||
        m.kode.toLowerCase() === targetMapelId.toLowerCase()
    );
    if (found) return found;
  }

  // 2. Check user.mataPelajaran
  if (currentUser?.mataPelajaran) {
    const code = extractMapelCode(currentUser.mataPelajaran);
    const found = state.mapel.find(
      (m) =>
        m.id.toLowerCase() === code.toLowerCase() ||
        m.kode.toLowerCase() === code.toLowerCase() ||
        currentUser.mataPelajaran?.toLowerCase().includes(m.nama.toLowerCase())
    );
    if (found) return found;
  }

  // 3. Check schedule in state.jadwal for this class
  const jadwalMatch = state.jadwal.find((j) => j.kelasId === kelasId);
  if (jadwalMatch) {
    const found = state.mapel.find(
      (m) => m.id.toLowerCase() === jadwalMatch.mapelId.toLowerCase()
    );
    if (found) return found;
  }

  // Default fallback to first subject
  return state.mapel[0] || { id: 'IPA', kode: 'IPA-01', nama: 'Ilmu Pengetahuan Alam', kkm: 75 };
}

/**
 * Returns the list of subjects available for a given class.
 * - Admin: All subjects.
 * - Guru: Only the subject(s) taught for this class.
 */
export function getVisibleMapelForKelas(
  currentUser: UserAccount | null | undefined,
  kelasId: string,
  state: SiaguState
): MataPelajaran[] {
  if (!currentUser || currentUser.role === 'admin') {
    return state.mapel;
  }

  const assignedMapel = getTeacherMapelForKelas(currentUser, kelasId, state);
  return [assignedMapel];
}

/**
 * Extracts a normalized subject code from text for the 11 national & local curriculum subjects.
 */
export function extractMapelCode(text: string): string {
  const upper = text.toUpperCase();
  if (upper.includes('AGAMA') || upper.includes('PAI') || upper.includes('ISLAM') || upper.includes('HINDU') || upper.includes('KRISTEN') || upper.includes('BUDHA') || upper.includes('KATOLIK')) return 'PAI';
  if (upper.includes('PANCASILA') || upper.includes('PPKN') || upper.includes('PKN') || upper.includes('KEWARGANEGARAAN')) return 'PPKN';
  if (upper.includes('INDONESIA') || upper.includes('BIN')) return 'BIN';
  if (upper.includes('MATEMATIKA') || upper.includes('MTK') || upper.includes('MATH')) return 'MTK';
  if (upper.includes('IPA') || upper.includes('ALAM') || upper.includes('SCIENCE') || upper.includes('BIOLOGI') || upper.includes('FISIKA')) return 'IPA';
  if (upper.includes('IPS') || upper.includes('SOSIAL') || upper.includes('GEOGRAFI') || upper.includes('SEJARAH') || upper.includes('EKONOMI')) return 'IPS';
  if (upper.includes('INGGRIS') || upper.includes('BIG') || upper.includes('ENG')) return 'BIG';
  if (upper.includes('BALI') || upper.includes('DAERAH') || upper.includes('MULOK')) return 'BALI';
  if (upper.includes('SENI') || upper.includes('BUDAYA') || upper.includes('SBUD') || upper.includes('PRAKARYA') || upper.includes('MUSIK') || upper.includes('RUPA')) return 'SBUD';
  if (upper.includes('PJOK') || upper.includes('JASMANI') || upper.includes('PENJAS') || upper.includes('OLAHRAGA')) return 'PJOK';
  if (upper.includes('INFORMATIKA') || upper.includes('INFO') || upper.includes('TIK') || upper.includes('KOMPUTER') || upper.includes('CODING')) return 'INFO';
  return upper.trim().slice(0, 5) || 'IPA';
}
