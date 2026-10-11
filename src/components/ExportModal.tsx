import React, { useState } from 'react';
import { Download, X, FileText, Code, Bookmark, Printer, CheckCircle2 } from 'lucide-react';
import { Project } from '../types';
import { exportProjectToDocx, exportProjectToTxt, exportProjectToPdf } from '../utils/paperExport';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProject: Project | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, activeProject }) => {
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  if (!isOpen || !activeProject) return null;

  const exportFormats = [
    {
      id: 'docx',
      name: 'Microsoft Word (.docx)',
      desc: 'Standard OOXML academic document with heading hierarchies and margin standards.',
      icon: FileText,
      ext: '.docx',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      id: 'pdf',
      name: 'Printable Academic PDF (.pdf)',
      desc: 'Clean serif publication format with title headers, metadata block, and page breaks.',
      icon: Printer,
      ext: '.pdf',
      color: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    {
      id: 'latex',
      name: 'LaTeX Source (.tex)',
      desc: 'IEEE / ACM standard conference class with math packages and bibliography environment.',
      icon: Code,
      ext: '.tex',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      id: 'bib',
      name: 'BibTeX Bibliography (.bib)',
      desc: 'Cryptographically indexed citation ledger ready for Overleaf and Texmaker integration.',
      icon: Bookmark,
      ext: '.bib',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'md',
      name: 'Markdown Source (.md)',
      desc: 'Portable GitHub-compatible markdown manuscript with formatted code blocks.',
      icon: FileText,
      ext: '.md',
      color: 'bg-slate-100 text-slate-800 border-slate-200',
    },
    {
      id: 'txt',
      name: 'Plain Text (.txt)',
      desc: 'Clean unformatted plain text for terminal pipelines and NLP processing.',
      icon: FileText,
      ext: '.txt',
      color: 'bg-amber-50 text-amber-800 border-amber-200',
    },
  ];

  const handleDownload = async (format: string) => {
    setDownloadingFormat(format);
    try {
      if (format === 'docx') {
        await exportProjectToDocx(activeProject);
      } else if (format === 'txt') {
        exportProjectToTxt(activeProject);
      } else if (format === 'pdf') {
        exportProjectToPdf(activeProject);
      } else {
        const url = `/api/export/${activeProject.id}/${format}`;
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeProject.title.slice(0, 30)}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Export download error:', err);
    } finally {
      setTimeout(() => setDownloadingFormat(null), 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Download className="w-4 h-4 text-indigo-600" />
            <span>Export Academic Manuscript</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <div className="text-xs text-slate-400">Target Project</div>
            <h3 className="text-sm font-bold text-slate-900">{activeProject.title}</h3>
            <span className="text-[11px] text-indigo-600 font-medium">{activeProject.domain}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {exportFormats.map((fmt) => {
              const Icon = fmt.icon;
              const isDownloading = downloadingFormat === fmt.id;
              return (
                <div
                  key={fmt.id}
                  onClick={() => handleDownload(fmt.id)}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 transition cursor-pointer flex items-start gap-3 group"
                >
                  <div className={`p-2 rounded-lg border ${fmt.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition flex items-center justify-between">
                      <span>{fmt.name}</span>
                      {isDownloading && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{fmt.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
          <span>All exports adhere to standard academic typography guidelines</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
