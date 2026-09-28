import React, { useState } from 'react';
import { Lock, User, AlertCircle, LogIn, GraduationCap, Eye, EyeOff } from 'lucide-react';
import { UserAccount } from '../../types/siagu';
import { SiaguState } from '../../utils/storage';

interface LoginViewProps {
  state: SiaguState;
  onLoginSuccess: (user: UserAccount) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ state, onLoginSuccess }) => {
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showUsername, setShowUsername] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const logoSekolah = state.pengaturanSekolah.logoSekolahUrl;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const usernameTrimmed = usernameInput.trim();

    if (!usernameTrimmed || !passwordInput) {
      setErrorMsg('Harap isi username (NISN/ID) dan kata sandi.');
      return;
    }

    // 1. Check in state.accounts (Guru & Admin)
    const foundAccount = state.accounts.find(
      (acc) => acc.username.toLowerCase() === usernameTrimmed.toLowerCase()
    );

    if (foundAccount) {
      if (foundAccount.password && foundAccount.password !== passwordInput) {
        setErrorMsg('Kata sandi / password tidak sesuai.');
        return;
      }
      onLoginSuccess(foundAccount);
      return;
    }

    // 2. Check in state.siswa (Student login using NISN or NIS as username and password)
    const matchedSiswa = state.siswa.find(
      (s) =>
        s.nisn === usernameTrimmed ||
        s.nis === usernameTrimmed ||
        s.nama.toLowerCase() === usernameTrimmed.toLowerCase()
    );

    if (matchedSiswa) {
      // Check if password matches NISN, NIS, or 'siswa123'
      const isValidPass =
        passwordInput === matchedSiswa.nisn ||
        passwordInput === matchedSiswa.nis ||
        passwordInput === 'siswa123';

      if (!isValidPass) {
        setErrorMsg(`Kata sandi siswa tidak sesuai. Gunakan NISN (${matchedSiswa.nisn}) sebagai password.`);
        return;
      }

      // Create dynamic student account session
      const studentAccount: UserAccount = {
        id: `U_SISWA_${matchedSiswa.id}`,
        username: matchedSiswa.nisn,
        nama: matchedSiswa.nama,
        role: 'siswa',
        nip: matchedSiswa.nisn,
        email: `${matchedSiswa.nisn}@siswa.smp.belajar.id`,
        mataPelajaran: `Siswa ${matchedSiswa.nama}`,
        jabatan: `Siswa Kelas ${matchedSiswa.kelasId}`,
      };

      onLoginSuccess(studentAccount);
      return;
    }

    setErrorMsg(
      `Username / NISN "${usernameInput}" tidak terdaftar di database sekolah.`
    );
  };

  return (
    <div className="min-h-screen bg-slate-200 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Background Radial Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-300/80 relative z-10 space-y-6">
        
        {/* Header Dynamic School Logo & Title */}
        <div className="text-center">
          {/* Only School Logo Display */}
          <div className="flex items-center justify-center mb-3">
            {logoSekolah ? (
              <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-200 p-1.5 flex items-center justify-center overflow-hidden shadow-2xs">
                <img
                  src={logoSekolah}
                  alt="Logo Sekolah"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md font-black text-2xl tracking-tight">
                S
              </div>
            )}
          </div>

          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            SIAGU Login Portal
          </h1>
          <p className="text-xs font-semibold text-slate-600 mt-1">
            {state.pengaturanSekolah.namaSekolah}
          </p>
          {state.pengaturanSekolah.namaKabupaten && (
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              {state.pengaturanSekolah.namaKabupaten}
            </p>
          )}
        </div>

        {/* Info Banner for Students */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-[11px] font-medium text-blue-900 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 shrink-0 text-blue-600" />
          <span>
            <b>Siswa / Orang Tua:</b> Masukkan <b>NISN</b> sebagai Username dan Password.
          </span>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Clean Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Username (NIP Guru / NISN Siswa)
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
              <input
                type={showUsername ? 'text' : 'password'}
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Masukkan username / NISN..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowUsername(!showUsername)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded-md"
                title={showUsername ? 'Sembunyikan Username' : 'Tampilkan Username'}
              >
                {showUsername ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Kata Sandi / Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Masukkan kata sandi / NISN..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded-md"
                title={showPassword ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-extrabold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Masuk ke SIAGU</span>
          </button>
        </form>

        <div className="text-center text-[11px] text-slate-400 font-medium border-t border-slate-100 pt-4">
          Sistem Administrasi Guru & Siswa v2.5 · Kurikulum Merdeka
        </div>

      </div>

    </div>
  );
};
