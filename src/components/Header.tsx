import React from 'react';
import {
  Menu,
  Search,
  Download,
  MessageSquare,
  Activity,
  Plus,
  ChevronRight,
  ShieldCheck,
  FolderOpen,
} from 'lucide-react';
import { Project } from '../types';

interface HeaderProps {
  currentView: string;
  onSelectView: (view: string) => void;
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (proj: Project) => void;
  onNewProjectClick: () => void;
  onExportClick: () => void;
  onAdminClick: () => void;
  onEthicsClick: () => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
  onToggleSidebarMobile: () => void;
  onOpenCommandPalette: () => void;
  isRightPanelOpen: boolean;
  onToggleRightPanel: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onSelectView,
  projects,
  activeProject,
  onSelectProject,
  onNewProjectClick,
  onExportClick,
  onAdminClick,
  onEthicsClick,
  onToggleChat,
  isChatOpen,
  onToggleSidebarMobile,
  onOpenCommandPalette,
  isRightPanelOpen,
  onToggleRightPanel,
}) => {
  const viewTitles: Record<string, { title: string; category: string }> = {
    dashboard: { title: 'Dashboard', category: 'Workspace' },
    'paper-wizard': { title: 'Research Paper Wizard', category: 'Writing Suite' },
    'review-paper': { title: 'Review Paper & Matrix', category: 'Writing Suite' },
    'book-writer': { title: 'Book & Monograph Studio', category: 'Writing Suite' },
    'thesis-wizard': { title: 'Thesis / Dissertation', category: 'Writing Suite' },
    'research-gap': { title: '9-D Research Gap Discovery', category: 'Discovery' },
    'academic-editor': { title: 'Manuscript Studio', category: 'Integrity' },
    paraphraser: { title: '9-Mode Academic Paraphraser', category: 'Integrity' },
    plagiarism: { title: 'Plagiarism & Similarity', category: 'Integrity' },
    citations: { title: 'Citation Manager & DOI', category: 'Integrity' },
    'pdf-analyzer': { title: 'PDF & Paper Deconstructor', category: 'Discovery' },
    'web-research': { title: 'Scholarly Web Research', category: 'Discovery' },
    'dataset-assistant': { title: 'Dataset Diagnostics', category: 'Data' },
    'figures-tables': { title: 'Figures & Schematics', category: 'Data' },
  };

  const currentInfo = viewTitles[currentView] || { title: 'Academic Studio', category: 'Workspace' };

  return (
    <header className="bg-white border-b border-[#e8e8e6] sticky top-0 z-30 select-none">
      <div className="px-4 sm:px-8 h-15 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Editorial Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleSidebarMobile}
            className="p-1.5 text-black hover:bg-neutral-100 rounded-sm lg:hidden cursor-pointer"
            title="Toggle Navigation"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 text-xs min-w-0">
            <span
              onClick={() => onSelectView('dashboard')}
              className="mono text-slate-400 hover:text-black cursor-pointer hidden sm:inline"
            >
              Young Mind
            </span>
            <span className="text-[#e8e8e6] hidden sm:inline">/</span>
            <span className="mono text-slate-400 hidden md:inline">
              {currentInfo.category}
            </span>
            <span className="text-[#e8e8e6] hidden md:inline">/</span>
            <span className="font-semibold text-neutral-900 truncate font-sans text-xs">
              {currentInfo.title}
            </span>
          </div>
        </div>

        {/* Center: Command Palette Trigger */}
        <div className="flex-1 max-w-sm mx-2 hidden sm:block">
          <button
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between px-3 py-1.5 bg-[#fdfdfc] hover:bg-neutral-50 border border-[#e8e8e6] rounded-sm text-xs text-slate-400 transition cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-black transition" />
              <span className="group-hover:text-slate-700 transition truncate text-[11px] font-sans">
                Search tools or jump to section...
              </span>
            </div>
            <kbd className="mono text-[9px] px-1.5 py-0.5 bg-neutral-100 text-slate-500 rounded border border-[#e8e8e6]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Mobile search trigger */}
          <button
            onClick={onOpenCommandPalette}
            className="p-1.5 text-slate-700 hover:text-black sm:hidden cursor-pointer"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Active Project Dropdown */}
          <div className="hidden lg:flex items-center gap-1.5 pl-2 pr-1 py-1 border border-[#e8e8e6] bg-[#fdfdfc] rounded-sm text-xs">
            <span className="mono text-slate-400 text-[9px]">PROJ:</span>
            <select
              value={activeProject?.id || ''}
              onChange={(e) => {
                const found = projects.find((p) => p.id === e.target.value);
                if (found) onSelectProject(found);
              }}
              className="bg-transparent text-xs font-semibold text-neutral-900 focus:outline-none max-w-[140px] truncate cursor-pointer font-sans"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
            <button
              onClick={onNewProjectClick}
              title="New Project"
              className="p-0.5 text-slate-500 hover:text-black hover:bg-neutral-100 rounded transition"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Export Action */}
          <button
            onClick={onExportClick}
            className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white text-xs font-semibold mono tracking-wider transition cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* AI Co-Pilot Drawer */}
          <button
            onClick={onToggleChat}
            className={`px-3 py-1.5 border text-xs font-semibold mono tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              isChatOpen
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white text-neutral-900 border-[#e8e8e6] hover:border-black'
            }`}
          >
            <MessageSquare className="w-3 h-3" />
            <span className="hidden sm:inline">AI Co-Pilot</span>
          </button>

          {/* Toggle Utility Panel for Small Desktops/Laptops */}
          <button
            onClick={onToggleRightPanel}
            title="Toggle Utility Archive Panel"
            className="p-2 text-slate-500 hover:text-black hover:bg-neutral-100 rounded cursor-pointer lg:hidden"
          >
            <FolderOpen className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
