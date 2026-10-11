import React from 'react';
import {
  Search,
  FileText,
  Bookmark,
  Award,
  BookOpen,
  Sparkles,
  FileSearch,
  CheckCheck,
  ShieldCheck,
  BarChart2,
  Layers,
  Settings,
  Download,
  MessageSquare,
  Plus,
} from 'lucide-react';

interface EditorialSideNavProps {
  currentView: string;
  onSelectView: (view: string) => void;
  onOpenSearch: () => void;
  onOpenEthics: () => void;
  onOpenAdmin: () => void;
  onOpenExport: () => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
}

export const EditorialSideNav: React.FC<EditorialSideNavProps> = ({
  currentView,
  onSelectView,
  onOpenSearch,
  onOpenEthics,
  onOpenAdmin,
  onOpenExport,
  onToggleChat,
  isChatOpen,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Layers, shortcut: 'Home' },
    { id: 'paper-wizard', label: 'Paper Wizard', icon: FileText, shortcut: 'Paper' },
    { id: 'review-paper', label: 'Review & Matrix', icon: Bookmark, shortcut: 'Review' },
    { id: 'thesis-wizard', label: 'Thesis Studio', icon: Award, shortcut: 'Thesis' },
    { id: 'book-writer', label: 'Book Writer', icon: BookOpen, shortcut: 'Book' },
    { id: 'research-gap', label: '9-D Gap Engine', icon: Sparkles, shortcut: 'Gaps' },
    { id: 'academic-editor', label: 'Document Editor', icon: FileSearch, shortcut: 'Editor' },
    { id: 'paraphraser', label: 'AI Paraphraser', icon: CheckCheck, shortcut: 'Tone' },
    { id: 'citations', label: 'Citation Manager', icon: Bookmark, shortcut: 'Bib' },
    { id: 'web-research', label: 'Web Research', icon: Search, shortcut: 'Search' },
    { id: 'dataset-assistant', label: 'Dataset Guide', icon: BarChart2, shortcut: 'Data' },
  ];

  return (
    <aside className="w-18 sm:w-20 bg-white border-r border-[#e8e8e6] flex flex-col items-center py-6 gap-6 z-30 select-none flex-shrink-0">
      {/* Brand Icon Button */}
      <button
        onClick={() => onSelectView('dashboard')}
        className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs tracking-wider cursor-pointer shadow-xs hover:scale-105 transition"
        title="Young Mind AI"
      >
        YM
      </button>

      {/* Primary Tool Icons */}
      <div className="flex-1 flex flex-col items-center gap-3 overflow-y-auto w-full py-1 scrollbar-none">
        {/* Quick Search Button */}
        <button
          onClick={onOpenSearch}
          className="w-10 h-10 rounded-full border border-[#e8e8e6] bg-white hover:bg-black hover:text-white hover:border-black flex items-center justify-center text-slate-700 transition cursor-pointer group relative"
          title="Search & Command (⌘K)"
        >
          <Search className="w-4 h-4" />
          <span className="absolute left-14 px-2 py-1 bg-black text-white text-[10px] font-mono tracking-wider rounded opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
            Search ⌘K
          </span>
        </button>

        <div className="w-6 h-px bg-[#e8e8e6] my-1" />

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-10 h-10 rounded-full border transition cursor-pointer flex items-center justify-center group relative ${
                isActive
                  ? 'bg-black text-white border-black shadow-xs'
                  : 'bg-white text-slate-700 border-[#e8e8e6] hover:border-black hover:text-black'
              }`}
              title={item.label}
            >
              <Icon className="w-4 h-4" />
              <span className="absolute left-14 px-2.5 py-1 bg-black text-white text-[11px] font-sans tracking-wide rounded opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50 shadow-md">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Utility Icons */}
      <div className="flex flex-col items-center gap-2.5 pt-4 border-t border-[#e8e8e6] w-full">
        {/* AI Co-Pilot Drawer */}
        <button
          onClick={onToggleChat}
          className={`w-10 h-10 rounded-full border transition cursor-pointer flex items-center justify-center group relative ${
            isChatOpen
              ? 'bg-black text-white border-black'
              : 'bg-white text-slate-700 border-[#e8e8e6] hover:border-black'
          }`}
          title="AI Research Co-Pilot"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="absolute left-14 px-2.5 py-1 bg-black text-white text-[11px] font-sans rounded opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
            Research AI
          </span>
        </button>

        {/* Export */}
        <button
          onClick={onOpenExport}
          className="w-10 h-10 rounded-full border border-[#e8e8e6] bg-white hover:border-black text-slate-700 hover:text-black flex items-center justify-center transition cursor-pointer group relative"
          title="Export Manuscript"
        >
          <Download className="w-4 h-4" />
          <span className="absolute left-14 px-2.5 py-1 bg-black text-white text-[11px] font-sans rounded opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
            Export
          </span>
        </button>

        {/* Ethics */}
        <button
          onClick={onOpenEthics}
          className="w-10 h-10 rounded-full border border-[#e8e8e6] bg-white hover:border-black text-slate-700 hover:text-black flex items-center justify-center transition cursor-pointer group relative"
          title="Academic Ethics & Provenance"
        >
          <ShieldCheck className="w-4 h-4" />
          <span className="absolute left-14 px-2.5 py-1 bg-black text-white text-[11px] font-sans rounded opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
            Ethics Code
          </span>
        </button>

        {/* System Settings */}
        <button
          onClick={onOpenAdmin}
          className="w-10 h-10 rounded-full border border-[#e8e8e6] bg-white hover:border-black text-slate-700 hover:text-black flex items-center justify-center transition cursor-pointer group relative"
          title="Metrics & Settings"
        >
          <Settings className="w-4 h-4" />
          <span className="absolute left-14 px-2.5 py-1 bg-black text-white text-[11px] font-sans rounded opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
            Metrics
          </span>
        </button>
      </div>
    </aside>
  );
};
