import React from 'react';
import {
  BookOpen,
  FileText,
  Bookmark,
  Award,
  Sparkles,
  FileSearch,
  CheckCheck,
  Search,
  BarChart2,
  Layers,
  ChevronLeft,
  ChevronRight,
  Download,
  ShieldCheck,
  Activity,
  PlusCircle,
  FolderOpen,
  X,
  ExternalLink,
} from 'lucide-react';
import { Project } from '../types';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (proj: Project) => void;
  onNewProject: () => void;
  onExport: () => void;
  onOpenAdmin: () => void;
  onOpenEthics: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  projects,
  activeProject,
  onSelectProject,
  onNewProject,
  onExport,
  onOpenAdmin,
  onOpenEthics,
}) => {
  const navSections = [
    {
      title: 'Workspace',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: Layers, badge: '' },
      ],
    },
    {
      title: 'Writing Suites',
      items: [
        { id: 'paper-wizard', label: 'Research Paper Wizard', icon: FileText, badge: '20 Sec' },
        { id: 'review-paper', label: 'Review Paper & Matrix', icon: Bookmark, badge: 'PRISMA' },
        { id: 'thesis-wizard', label: 'Thesis / Dissertation', icon: Award, badge: 'PhD/MTech' },
        { id: 'book-writer', label: 'Book & Monograph', icon: BookOpen, badge: '' },
      ],
    },
    {
      title: 'Research & Discovery',
      items: [
        { id: 'research-gap', label: '9-D Research Gaps', icon: Sparkles, badge: 'Novelty' },
        { id: 'web-research', label: 'Scholarly Web Search', icon: Search, badge: 'arXiv/PubMed' },
        { id: 'pdf-analyzer', label: 'PDF Paper Analyzer', icon: FileSearch, badge: 'Deconstruct' },
        { id: 'dataset-assistant', label: 'Dataset Diagnostics', icon: BarChart2, badge: 'ML Guide' },
      ],
    },
    {
      title: 'Integrity & Polishing',
      items: [
        { id: 'academic-editor', label: 'Document Editor', icon: FileSearch, badge: 'Studio' },
        { id: 'paraphraser', label: '9-Mode Paraphraser', icon: CheckCheck, badge: 'Tone' },
        { id: 'plagiarism', label: 'Plagiarism & Similarity', icon: Search, badge: 'Audit' },
        { id: 'citations', label: 'Citations & DOI Validator', icon: Bookmark, badge: 'BibTeX' },
        { id: 'figures-tables', label: 'Figures & Schematics', icon: Layers, badge: 'Mermaid' },
      ],
    },
  ];

  const handleItemClick = (id: string) => {
    onSelectView(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col transition-all duration-200 ease-in-out ${
          isCollapsed ? 'w-18' : 'w-68'
        } ${
          isMobileOpen
            ? 'translate-x-0 shadow-2xl'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Branding */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/90 flex-shrink-0">
          {!isCollapsed ? (
            <div
              onClick={() => handleItemClick('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group select-none"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-white group-hover:text-cyan-300 transition">
                    Young Mind
                  </span>
                  <span className="text-[9px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                    AI
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">Academic Writing Suite</span>
              </div>
            </div>
          ) : (
            <div
              onClick={() => handleItemClick('dashboard')}
              className="w-full flex justify-center cursor-pointer"
              title="Young Mind AI"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
          )}

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="p-1 text-slate-400 hover:text-white rounded lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Project Switcher Pill */}
        {!isCollapsed && (
          <div className="p-3 border-b border-slate-800/80 bg-slate-950/40">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 px-1">
              <span className="font-bold uppercase tracking-wider text-[10px]">Active Project</span>
              <button
                onClick={onNewProject}
                className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                title="Create New Project"
              >
                <PlusCircle className="w-3 h-3" />
                <span>New</span>
              </button>
            </div>
            <div className="relative">
              <select
                value={activeProject?.id || ''}
                onChange={(e) => {
                  const found = projects.find((p) => p.id === e.target.value);
                  if (found) onSelectProject(found);
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 truncate cursor-pointer font-medium"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Navigation Links Area */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
          {navSections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none">
                  {sec.title}
                </div>
              )}
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer group relative ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                  >
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                      }`}
                    />
                    {!isCollapsed && (
                      <span className="truncate flex-1 text-left">{item.label}</span>
                    )}
                    {!isCollapsed && item.badge && !isActive && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/80">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer Actions & Collapse Toggle */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-1 flex-shrink-0">
          <button
            onClick={onExport}
            title="Export Manuscript"
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/30 transition cursor-pointer ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <Download className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            {!isCollapsed && <span>Export Manuscript</span>}
          </button>

          <button
            onClick={onOpenEthics}
            title="Academic Ethics Disclaimer"
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-amber-400 hover:text-amber-300 hover:bg-amber-950/30 transition cursor-pointer ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <ShieldCheck className="w-4 h-4 flex-shrink-0 text-amber-400" />
            {!isCollapsed && <span>Ethics &amp; Integrity</span>}
          </button>

          <button
            onClick={onOpenAdmin}
            title="System & AI Token Metrics"
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <Activity className="w-4 h-4 flex-shrink-0 text-indigo-400" />
            {!isCollapsed && <span>System Metrics</span>}
          </button>

          {/* Collapse/Expand button for desktop */}
          <div className="pt-2 border-t border-slate-800/80 hidden lg:block">
            <button
              onClick={onToggleCollapse}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer ${
                isCollapsed ? 'justify-center' : 'justify-between'
              }`}
            >
              {!isCollapsed && <span className="text-[11px]">Collapse Menu</span>}
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
