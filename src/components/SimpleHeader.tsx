import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Download,
  Plus,
  Check,
  ChevronDown,
  FileText,
  Layers,
  Search,
} from 'lucide-react';
import { CitationStyle, Project } from '../types';

export type SimpleTab = 'generator' | 'editor' | 'tools';

interface SimpleHeaderProps {
  activeTab: SimpleTab;
  onSelectTab: (tab: SimpleTab) => void;
  documentTitle: string;
  onUpdateTitle: (title: string) => void;
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (proj: Project) => void;
  onNewProject: () => void;
  onExport: () => void;
  isSaved: boolean;
  totalWords: number;
  citationStyle: CitationStyle;
  onChangeCitationStyle: (style: CitationStyle) => void;
}

export const SimpleHeader: React.FC<SimpleHeaderProps> = ({
  activeTab,
  onSelectTab,
  documentTitle,
  onUpdateTitle,
  projects,
  activeProject,
  onSelectProject,
  onNewProject,
  onExport,
  isSaved,
  totalWords,
  citationStyle,
  onChangeCitationStyle,
}) => {
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isCitationDropdownOpen, setIsCitationDropdownOpen] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 select-none shadow-xs">
      {/* Colorful Rainbow Accent Stripe at top */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-rose-500 via-purple-500 to-cyan-400" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        {/* Left: Brand + Project Switcher */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Logo */}
          <div
            onClick={() => onSelectTab('generator')}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition transform">
              <Sparkles className="w-4 h-4 text-white drop-shadow-xs" />
            </div>
            <div className="flex items-center">
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-amber-500 via-rose-500 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Young Mind
              </span>
              <span className="hidden sm:inline-block text-[10px] ml-1.5 px-2 py-0.5 rounded-full font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
                AI
              </span>
            </div>
          </div>

          <div className="h-4 w-[1px] bg-slate-200 hidden md:block" />

          {/* Project Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
              title="Switch Manuscript Project"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              <span className="truncate max-w-[130px] sm:max-w-[180px]">
                {activeProject?.title || documentTitle || 'Current Manuscript'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isProjectDropdownOpen && (
              <div className="absolute left-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Manuscripts
                </div>
                <div className="max-h-56 overflow-y-auto">
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelectProject(p);
                        setIsProjectDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                        activeProject?.id === p.id
                          ? 'text-indigo-600 font-semibold bg-indigo-50/70'
                          : 'text-slate-700'
                      }`}
                    >
                      <span className="truncate">{p.title}</span>
                      {activeProject?.id === p.id && <Check className="w-3.5 h-3.5 shrink-0 ml-2 text-indigo-600" />}
                    </button>
                  ))}
                </div>
                <div className="border-t border-slate-100 mt-1 pt-1 px-1">
                  <button
                    onClick={() => {
                      setIsProjectDropdownOpen(false);
                      onNewProject();
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs text-indigo-600 hover:bg-indigo-50 rounded-lg flex items-center gap-1.5 font-medium cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Research Project
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Main Navigation Tabs with Vibrant Active Color Accents */}
        <div className="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200">
          <button
            id="nav-generator-tab"
            onClick={() => onSelectTab('generator')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition cursor-pointer ${
              activeTab === 'generator'
                ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Paper Generator</span>
          </button>

          <button
            id="nav-editor-tab"
            onClick={() => onSelectTab('editor')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-300" />
            <span>Manuscript Editor</span>
          </button>

          <button
            id="nav-tools-tab"
            onClick={() => onSelectTab('tools')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition cursor-pointer ${
              activeTab === 'tools'
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-violet-300" />
            <span>Research Tools</span>
          </button>
        </div>

        {/* Right: Citation Style + Word Count + Save + Export */}
        <div className="flex items-center gap-2">
          {/* Citation Format Selector */}
          <div className="relative">
            <button
              onClick={() => setIsCitationDropdownOpen(!isCitationDropdownOpen)}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-semibold text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100/70 border border-indigo-200 rounded-lg transition cursor-pointer"
              title="Citation Format"
            >
              <span>{citationStyle}</span>
              <ChevronDown className="w-3 h-3 text-indigo-400" />
            </button>

            {isCitationDropdownOpen && (
              <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                {(['IEEE', 'APA 7', 'MLA', 'Chicago', 'Harvard', 'Vancouver'] as CitationStyle[]).map((style) => (
                  <button
                    key={style}
                    onClick={() => {
                      onChangeCitationStyle(style);
                      setIsCitationDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-mono flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                      citationStyle === style ? 'text-indigo-600 font-bold bg-indigo-50/60' : 'text-slate-700'
                    }`}
                  >
                    <span>{style}</span>
                    {citationStyle === style && <Check className="w-3 h-3 text-indigo-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Word Count Pill */}
          <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg">
            <span>{totalWords.toLocaleString()}</span>
            <span className="text-emerald-500">words</span>
          </div>

          {/* Save status badge */}
          <div
            className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500 font-medium px-2 py-1 rounded-md bg-slate-50"
            title={isSaved ? 'All changes saved locally' : 'Unsaved changes in document'}
          >
            <div className={`w-2 h-2 rounded-full ${isSaved ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]' : 'bg-amber-400 animate-pulse'}`} />
            <span>{isSaved ? 'Saved' : 'Editing'}</span>
          </div>

          {/* Colorful Export Button */}
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 rounded-lg shadow-sm shadow-purple-500/20 transition cursor-pointer"
            title="Export to Markdown, PDF, LaTeX, or Word"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>
    </header>
  );
};
