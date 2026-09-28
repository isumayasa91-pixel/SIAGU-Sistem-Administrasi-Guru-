import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  BarChart3,
  CalendarDays,
  BookOpenCheck,
  Users,
  Building2,
  Settings,
  Sparkles,
  Printer,
  GraduationCap,
} from 'lucide-react';
import { ActiveTab, UserRole } from '../types/siagu';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  userRole?: UserRole;
  unsubmittedAttendanceCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  userRole = 'guru',
  unsubmittedAttendanceCount = 0,
}) => {
  const allTabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'absensi',
      label: userRole === 'siswa' ? 'Cek Rekap Absensi' : 'Absensi Harian',
      icon: <CheckSquare className="w-4 h-4" />,
      badge: userRole !== 'siswa' && unsubmittedAttendanceCount > 0 ? unsubmittedAttendanceCount : undefined,
    },
    {
      id: 'nilai',
      label: userRole === 'siswa' ? 'Cek Rapor & Nilai' : 'Nilai Siswa',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'jadwal',
      label: userRole === 'siswa' ? 'Jadwal Pembelajaran' : 'Jadwal Mengajar',
      icon: <CalendarDays className="w-4 h-4" />,
    },
    {
      id: 'jurnal',
      label: 'Jurnal KBM',
      icon: <BookOpenCheck className="w-4 h-4" />,
    },
    {
      id: 'siswa',
      label: 'Data Siswa',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'kelola_kelas',
      label: 'Data Kelas & Excel',
      icon: <Building2 className="w-4 h-4 text-emerald-600" />,
    },
    {
      id: 'pengaturan',
      label: 'Pengaturan',
      icon: <Settings className="w-4 h-4" />,
    },
    {
      id: 'ai_assistant',
      label: 'AI Guru Gemini',
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
    },
    {
      id: 'laporan',
      label: 'Cetak Laporan',
      icon: <Printer className="w-4 h-4" />,
    },
  ];

  // If role === 'siswa', filter ONLY Nilai, Absensi, and Jadwal!
  const tabs = userRole === 'siswa'
    ? allTabs.filter((t) => t.id === 'nilai' || t.id === 'absensi' || t.id === 'jadwal')
    : allTabs;

  return (
    <nav className="bg-white border-b border-slate-200 no-print overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 py-2">
          {userRole === 'siswa' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-800 rounded-lg border border-blue-200 text-xs font-bold mr-2 shrink-0">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>Portal Siswa</span>
            </div>
          )}

          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-rose-500 text-white">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
