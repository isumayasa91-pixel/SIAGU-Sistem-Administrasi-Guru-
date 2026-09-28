import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  QrCode,
  Search,
  MessageSquare,
  Users,
  CheckCheck,
  Printer,
} from 'lucide-react';
import { SiaguState } from '../../utils/storage';
import { AbsensiRecord, StatusAbsensi } from '../../types/siagu';
import {
  generateWhatsAppAbsensiText,
  formatNoHpWhatsApp,
} from '../../utils/calculations';

interface AbsensiViewProps {
  state: SiaguState;
  onUpdateAbsensi: (updatedRecords: AbsensiRecord[]) => void;
  onOpenQrScanner: () => void;
  onNavigateToReport?: () => void;
}

export const AbsensiView: React.FC<AbsensiViewProps> = ({
  state,
  onUpdateAbsensi,
  onOpenQrScanner,
  onNavigateToReport,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isSiswa = state.currentUser?.role === 'siswa';

  const activeKelas =
    state.kelas.find((k) => k.id === state.activeKelasId) || state.kelas[0];
  const siswaList = state.siswa.filter((s) => s.kelasId === state.activeKelasId);

  const filteredSiswa = siswaList.filter(
    (s) =>
      s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.includes(searchQuery) ||
      s.nis.includes(searchQuery)
  );

  // Get current absensi records for selectedDate and activeKelasId
  const currentRecordsMap = new Map<string, AbsensiRecord>();
  state.absensi
    .filter((a) => a.tanggal === selectedDate && a.kelasId === state.activeKelasId)
    .forEach((a) => currentRecordsMap.set(a.siswaId, a));

  // Count summaries
  let hadirCount = 0;
  let sakitCount = 0;
  let izinCount = 0;
  let alpaCount = 0;

  siswaList.forEach((s) => {
    const status = currentRecordsMap.get(s.id)?.status || 'H';
    if (status === 'H') hadirCount++;
    else if (status === 'S') sakitCount++;
    else if (status === 'I') izinCount++;
    else if (status === 'A') alpaCount++;
  });

  const handleStatusChange = (
    siswaId: string,
    newStatus: StatusAbsensi,
    keterangan?: string
  ) => {
    if (isSiswa) return;
    const existing = currentRecordsMap.get(siswaId);
    const updatedRecord: AbsensiRecord = {
      id: existing ? existing.id : `A_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      tanggal: selectedDate,
      kelasId: state.activeKelasId,
      siswaId,
      status: newStatus,
      keterangan: keterangan !== undefined ? keterangan : existing?.keterangan || '',
      jamInput: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    const otherRecords = state.absensi.filter(
      (a) =>
        !(
          a.tanggal === selectedDate &&
          a.kelasId === state.activeKelasId &&
          a.siswaId === siswaId
        )
    );

    onUpdateAbsensi([...otherRecords, updatedRecord]);
  };

  const handleKeteranganChange = (siswaId: string, text: string) => {
    if (isSiswa) return;
    const existingStatus = currentRecordsMap.get(siswaId)?.status || 'H';
    handleStatusChange(siswaId, existingStatus, text);
  };

  const handleMarkAllHadir = () => {
    if (isSiswa) return;
    const newRecords: AbsensiRecord[] = siswaList.map((s) => {
      const existing = currentRecordsMap.get(s.id);
      return {
        id: existing ? existing.id : `A_${Date.now()}_${s.id}`,
        tanggal: selectedDate,
        kelasId: state.activeKelasId,
        siswaId: s.id,
        status: 'H',
        keterangan: existing?.keterangan || '',
        jamInput: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
    });

    const otherRecords = state.absensi.filter(
      (a) => !(a.tanggal === selectedDate && a.kelasId === state.activeKelasId)
    );

    onUpdateAbsensi([...otherRecords, ...newRecords]);
  };

  const handleOpenWhatsApp = (siswa: any, status: StatusAbsensi, keterangan?: string) => {
    const formattedPhone = formatNoHpWhatsApp(siswa.noHpOrangTua);
    const message = generateWhatsAppAbsensiText(
      siswa.nama,
      siswa.namaOrangTua,
      activeKelas.namaKelas,
      selectedDate,
      status,
      keterangan,
      state.profil.sekolah
    );

    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
  };

  const handlePrint = () => {
    if (onNavigateToReport) {
      onNavigateToReport();
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Control Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{isSiswa ? 'Cek Rekap Absensi Siswa' : 'Presensi Harian Siswa'} · {activeKelas.namaKelas}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Rekap kehadiran harian siswa (Hadir, Sakit, Izin, Alpa) per tanggal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
            <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Cetak Data Absen</span>
          </button>

          {!isSiswa && (
            <>
              <button
                onClick={handleMarkAllHadir}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Tandai Semua Hadir</span>
              </button>

              <button
                onClick={onOpenQrScanner}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span>Scan QR Kartu</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Summary Counter Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
          <span className="text-[11px] font-semibold text-slate-500 block">Total Siswa</span>
          <span className="text-xl font-extrabold text-slate-900 tabular-nums">
            {siswaList.length}
          </span>
        </div>

        <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200/80 text-center">
          <span className="text-[11px] font-bold text-emerald-700 block">Hadir (H)</span>
          <span className="text-xl font-extrabold text-emerald-800 tabular-nums">
            {hadirCount}
          </span>
        </div>

        <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200/80 text-center">
          <span className="text-[11px] font-bold text-amber-700 block">Sakit (S)</span>
          <span className="text-xl font-extrabold text-amber-800 tabular-nums">
            {sakitCount}
          </span>
        </div>

        <div className="bg-blue-50/80 p-3.5 rounded-xl border border-blue-200/80 text-center">
          <span className="text-[11px] font-bold text-blue-700 block">Izin (I)</span>
          <span className="text-xl font-extrabold text-blue-800 tabular-nums">
            {izinCount}
          </span>
        </div>

        <div className="bg-rose-50/80 p-3.5 rounded-xl border border-rose-200/80 text-center">
          <span className="text-[11px] font-bold text-rose-700 block">Alpa (A)</span>
          <span className="text-xl font-extrabold text-rose-800 tabular-nums">
            {alpaCount}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Cari siswa berdasarkan nama, NIS, atau NISN..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
        />
      </div>

      {/* Attendance List Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4 w-32">NISN</th>
                <th className="py-3 px-4 w-52 text-center">Status Kehadiran</th>
                <th className="py-3 px-4">Keterangan Catatan</th>
                {!isSiswa && <th className="py-3 px-4 w-28 text-center">Notifikasi WA</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
              {filteredSiswa.length === 0 ? (
                <tr>
                  <td colSpan={isSiswa ? 5 : 6} className="py-8 text-center text-slate-500">
                    Siswa tidak ditemukan untuk filter pencarian ini.
                  </td>
                </tr>
              ) : (
                filteredSiswa.map((s, index) => {
                  const record = currentRecordsMap.get(s.id);
                  const currentStatus: StatusAbsensi = record?.status || 'H';
                  const currentNote = record?.keterangan || '';

                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="py-3 px-4 text-center font-mono text-slate-500">
                        {index + 1}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{s.nama}</div>
                        <div className="text-[11px] text-slate-500">
                          Ortu: {s.namaOrangTua}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-600">
                        {s.nisn}
                      </td>

                      {/* Status Toggle Buttons (Read-only if Siswa) */}
                      <td className="py-3 px-4">
                        {isSiswa ? (
                          <div className="text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                                currentStatus === 'H'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : currentStatus === 'S'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : currentStatus === 'I'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : 'bg-rose-100 text-rose-800 border border-rose-200'
                              }`}
                            >
                              {currentStatus === 'H'
                                ? 'Hadir'
                                : currentStatus === 'S'
                                ? 'Sakit'
                                : currentStatus === 'I'
                                ? 'Izin'
                                : 'Alpa'}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/60">
                            <button
                              onClick={() => handleStatusChange(s.id, 'H')}
                              className={`px-2.5 py-1 text-xs font-extrabold rounded-md transition-all cursor-pointer ${
                                currentStatus === 'H'
                                  ? 'bg-emerald-600 text-white shadow-2xs'
                                  : 'text-slate-600 hover:text-emerald-700'
                              }`}
                              title="Hadir"
                            >
                              H
                            </button>

                            <button
                              onClick={() => handleStatusChange(s.id, 'S')}
                              className={`px-2.5 py-1 text-xs font-extrabold rounded-md transition-all cursor-pointer ${
                                currentStatus === 'S'
                                  ? 'bg-amber-500 text-white shadow-2xs'
                                  : 'text-slate-600 hover:text-amber-700'
                              }`}
                              title="Sakit"
                            >
                              S
                            </button>

                            <button
                              onClick={() => handleStatusChange(s.id, 'I')}
                              className={`px-2.5 py-1 text-xs font-extrabold rounded-md transition-all cursor-pointer ${
                                currentStatus === 'I'
                                  ? 'bg-blue-600 text-white shadow-2xs'
                                  : 'text-slate-600 hover:text-blue-700'
                              }`}
                              title="Izin"
                            >
                              I
                            </button>

                            <button
                              onClick={() => handleStatusChange(s.id, 'A')}
                              className={`px-2.5 py-1 text-xs font-extrabold rounded-md transition-all cursor-pointer ${
                                currentStatus === 'A'
                                  ? 'bg-rose-600 text-white shadow-2xs'
                                  : 'text-slate-600 hover:text-rose-700'
                              }`}
                              title="Alpa"
                            >
                              A
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Note Input */}
                      <td className="py-3 px-4 text-slate-700">
                        {isSiswa ? (
                          <span>{currentNote || '—'}</span>
                        ) : (
                          <input
                            type="text"
                            placeholder="Alasan / Keterangan (opsional)..."
                            value={currentNote}
                            onChange={(e) =>
                              handleKeteranganChange(s.id, e.target.value)
                            }
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        )}
                      </td>

                      {/* WA Parent Notify (Guru/Admin only) */}
                      {!isSiswa && (
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() =>
                              handleOpenWhatsApp(s, currentStatus, currentNote)
                            }
                            className="p-2 text-emerald-700 hover:bg-emerald-50 border border-emerald-200/80 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 font-semibold text-xs"
                            title="Kirim pesan WhatsApp ke Orang Tua"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Kirim WA</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
