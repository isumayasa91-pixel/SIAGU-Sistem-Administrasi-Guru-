import React, { useState } from 'react';
import { QrCode, X, CheckCircle2, User, Sparkles } from 'lucide-react';
import { SiaguState } from '../../utils/storage';
import { AbsensiRecord } from '../../types/siagu';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: SiaguState;
  onUpdateAbsensi: (updatedRecords: AbsensiRecord[]) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  state,
  onUpdateAbsensi,
}) => {
  const [lastScannedSiswa, setLastScannedSiswa] = useState<string | null>(null);
  const [nisnInput, setNisnInput] = useState<string>('');

  if (!isOpen) return null;

  const activeKelas =
    state.kelas.find((k) => k.id === state.activeKelasId) || state.kelas[0];
  const siswaList = state.siswa.filter((s) => s.kelasId === state.activeKelasId);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleScanSiswa = (siswaId: string, namaSiswa: string) => {
    const existing = state.absensi.find(
      (a) =>
        a.tanggal === todayStr &&
        a.kelasId === state.activeKelasId &&
        a.siswaId === siswaId
    );

    const newRecord: AbsensiRecord = {
      id: existing ? existing.id : `A_QR_${Date.now()}_${siswaId}`,
      tanggal: todayStr,
      kelasId: state.activeKelasId,
      siswaId,
      status: 'H',
      keterangan: 'Hadir via Scan QR Card',
      jamInput: new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const otherRecords = state.absensi.filter(
      (a) =>
        !(
          a.tanggal === todayStr &&
          a.kelasId === state.activeKelasId &&
          a.siswaId === siswaId
        )
    );

    onUpdateAbsensi([...otherRecords, newRecord]);
    setLastScannedSiswa(namaSiswa);

    setTimeout(() => setLastScannedSiswa(null), 3000);
  };

  const handleManualNisnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = siswaList.find(
      (s) => s.nisn === nisnInput.trim() || s.nis === nisnInput.trim()
    );
    if (found) {
      handleScanSiswa(found.id, found.nama);
      setNisnInput('');
    } else {
      alert('Siswa dengan NIS/NISN tersebut tidak ditemukan di kelas ini.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-2 font-bold shadow-xs">
            <QrCode className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-slate-900">
            Simulator QR Scanner Presensi Siswa
          </h2>
          <p className="text-xs text-slate-500">
            Kelas {activeKelas.namaKelas} · Tap kartu siswa di bawah untuk instant check-in HADIR.
          </p>
        </div>

        {/* Success Alert */}
        {lastScannedSiswa && (
          <div className="mb-4 p-3.5 bg-emerald-500 text-white rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-2 shadow-md animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            <span>Presensi Berhasil: {lastScannedSiswa} (HADIR)</span>
          </div>
        )}

        {/* Manual NISN barcode input */}
        <form onSubmit={handleManualNisnSubmit} className="mb-5">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ketik / Imbas Barcode NISN Siswa..."
              value={nisnInput}
              onChange={(e) => setNisnInput(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              Scan
            </button>
          </div>
        </form>

        {/* Student QR Cards Grid */}
        <div className="border-t border-slate-100 pt-4">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
            Atau Tap Kartu Presensi Siswa {activeKelas.namaKelas}:
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
            {siswaList.map((s) => {
              const isRecordedToday = state.absensi.some(
                (a) =>
                  a.tanggal === todayStr &&
                  a.kelasId === state.activeKelasId &&
                  a.siswaId === s.id &&
                  a.status === 'H'
              );

              return (
                <button
                  key={s.id}
                  onClick={() => handleScanSiswa(s.id, s.nama)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer group flex flex-col justify-between ${
                    isRecordedToday
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                      : 'bg-slate-50 hover:bg-white hover:border-emerald-300 border-slate-200/80 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono text-slate-500">
                      {s.nisn}
                    </span>
                    {isRecordedToday && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    )}
                  </div>
                  <span className="text-xs font-bold block truncate group-hover:text-emerald-700">
                    {s.nama}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 text-center">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Selesai Scan
          </button>
        </div>

      </div>
    </div>
  );
};
