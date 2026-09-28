import React, { useState } from 'react';
import { Printer, Download, Copy, Check, FileText } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

interface LkpdTableDocumentProps {
  content: string;
}

export const LkpdTableDocument: React.FC<LkpdTableDocumentProps> = ({ content }) => {
  const [copied, setCopied] = useState(false);
  const { notifySuccess } = useNotification();

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    notifySuccess('LKPD berhasil disalin ke papan klip.', 'Tersalin');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'LKPD_Kurikulum_Merdeka_SIAGU.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notifySuccess('File LKPD berhasil diunduh.', 'Unduhan Berhasil');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Document Action Header */}
      <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-teal-400" />
          <div>
            <h3 className="text-sm font-black tracking-wide uppercase">Lembar Kerja Peserta Didik (LKPD)</h3>
            <p className="text-[11px] text-slate-300">Sesuai Sintaks Kurikulum Merdeka Kemendikbudristek</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
            <span>{copied ? 'Tersalin' : 'Salin'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak</span>
          </button>
        </div>
      </div>

      {/* Document Render Body */}
      <div className="p-8 overflow-y-auto max-h-[750px] font-sans text-slate-800 bg-slate-50/50 space-y-6">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs prose max-w-none text-xs leading-relaxed whitespace-pre-wrap font-mono">
          {content}
        </div>
      </div>
    </div>
  );
};
