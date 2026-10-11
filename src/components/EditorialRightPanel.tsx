import React from 'react';
import { Project } from '../types';
import { ShieldCheck, Plus, Download, Sparkles, FolderOpen, ExternalLink } from 'lucide-react';

interface EditorialRightPanelProps {
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (proj: Project) => void;
  onNewProject: () => void;
  onOpenEthics: () => void;
  onOpenExport: () => void;
  onNavigateToEditor: () => void;
}

export const EditorialRightPanel: React.FC<EditorialRightPanelProps> = ({
  projects,
  activeProject,
  onSelectProject,
  onNewProject,
  onOpenEthics,
  onOpenExport,
  onNavigateToEditor,
}) => {
  return (
    <aside className="w-76 xl:w-80 bg-white border-l border-[#e8e8e6] p-6 lg:p-7 flex flex-col gap-8 h-full overflow-y-auto select-none flex-shrink-0">
      {/* Black Ethics Alert Banner */}
      <div
        onClick={onOpenEthics}
        className="bg-black text-white p-5 cursor-pointer hover:bg-neutral-900 transition group rounded-xs shadow-xs"
      >
        <span className="mono block mb-2 text-[#888888] text-[10px] tracking-widest font-bold">
          Ethics Notice
        </span>
        <p className="text-xs leading-relaxed text-neutral-300">
          Authors remain fully accountable for citations and Institutional Ethics compliance. Fabrication is strictly prohibited.
        </p>
        <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-400 group-hover:text-white pt-2 border-t border-neutral-800">
          <span>Read Protocol</span>
          <span>&rarr;</span>
        </div>
      </div>

      {/* Active Project Archive */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-[#e8e8e6] pb-2">
          <span className="mono text-slate-500 font-bold text-[10px] tracking-wider">
            Active Project Archive
          </span>
          <button
            onClick={onNewProject}
            className="text-xs font-semibold text-black hover:underline cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>New</span>
          </button>
        </div>

        <div className="space-y-1">
          {projects.map((proj) => {
            const isSelected = activeProject?.id === proj.id;
            const doc = proj.documents[0];
            const sectionCount = doc?.sections?.length || 0;

            return (
              <div
                key={proj.id}
                onClick={() => onSelectProject(proj)}
                className={`py-3 transition cursor-pointer border-b border-[#e8e8e6] group ${
                  isSelected
                    ? 'border-l-2 border-black pl-3 bg-neutral-50/50'
                    : 'hover:bg-neutral-50/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="tag-badge">
                    {isSelected ? 'Active' : proj.type.toUpperCase()}
                  </span>
                  <span className="mono text-slate-400 text-[9px]">
                    {String(sectionCount).padStart(2, '0')} {sectionCount === 1 ? 'Section' : 'Sections'}
                  </span>
                </div>
                <span className="font-semibold text-xs text-slate-900 group-hover:underline block line-clamp-2 leading-snug">
                  {proj.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Session Metrics */}
      <div className="space-y-2">
        <span className="mono text-slate-500 font-bold text-[10px] tracking-wider block border-b border-[#e8e8e6] pb-2">
          Session Metrics
        </span>

        <div className="flex justify-between items-center py-2.5 border-b border-[#e8e8e6] text-xs">
          <span className="text-slate-500">Verification</span>
          <strong className="font-mono text-slate-800 font-semibold">4.0.2</strong>
        </div>

        <div className="flex justify-between items-center py-2.5 border-b border-[#e8e8e6] text-xs">
          <span className="text-slate-500">Integrity Guard</span>
          <strong className="text-emerald-700 font-semibold">Active</strong>
        </div>

        <div className="flex justify-between items-center py-2.5 border-b border-[#e8e8e6] text-xs">
          <span className="text-slate-500">AI Architecture</span>
          <strong className="font-mono text-slate-800 text-[11px]">Gemini Pro / Flash</strong>
        </div>

        <div className="flex justify-between items-center py-2.5 border-b border-[#e8e8e6] text-xs">
          <span className="text-slate-500">DOI Validator</span>
          <strong className="text-slate-800 text-[11px]">Crossref Grounded</strong>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="mt-auto space-y-2.5 pt-4">
        <button
          onClick={onNewProject}
          className="w-full bg-black hover:bg-neutral-800 text-white p-3.5 text-xs font-semibold mono tracking-widest cursor-pointer transition shadow-xs"
        >
          Start New Research
        </button>

        <button
          onClick={onOpenExport}
          className="w-full bg-white hover:bg-neutral-100 text-black border border-black p-3 text-xs font-semibold mono tracking-widest cursor-pointer transition"
        >
          Export Manuscript
        </button>
      </div>
    </aside>
  );
};
