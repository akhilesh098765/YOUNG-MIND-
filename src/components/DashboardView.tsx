import React from 'react';
import { ArrowRight, ChevronRight, FileText, ExternalLink, Sparkles } from 'lucide-react';
import { Project } from '../types';

interface DashboardViewProps {
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (p: Project) => void;
  onNavigate: (view: string) => void;
  onNewProject: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  activeProject,
  onSelectProject,
  onNavigate,
  onNewProject,
}) => {
  const stages = [
    {
      step: 'Stage 01',
      title: 'Gap Discovery',
      desc: 'Pinpoint unresolved scientific challenges & literature voids using our 9-D gap engine.',
      targetView: 'research-gap',
    },
    {
      step: 'Stage 02',
      title: 'Survey Hub',
      desc: 'Query arXiv, PubMed and deconstruct published papers into methodology and results.',
      targetView: 'web-research',
    },
    {
      step: 'Stage 03',
      title: 'Writing Suite',
      desc: 'Comprehensive 20-section publication generator for IEEE, ACM, and Springer standards.',
      targetView: 'paper-wizard',
    },
    {
      step: 'Stage 04',
      title: 'Manuscript Studio',
      desc: 'Refine tone, audit similarity, and export your work to DOCX or LaTeX.',
      targetView: 'academic-editor',
    },
  ];

  const secondarySuites = [
    {
      id: 'review-paper',
      step: 'Systematic',
      title: 'Review Paper & PRISMA Matrix',
      desc: 'Synthesizes literature classifications and automatically generates a 7-column comparative benchmarking table.',
    },
    {
      id: 'thesis-wizard',
      step: 'Academic Degree',
      title: 'Thesis & Dissertation Studio',
      desc: 'Doctoral PhD, M.Tech, and MS structural generator with institutional certificates, declarations, and chapters.',
    },
    {
      id: 'book-writer',
      step: 'Monograph',
      title: 'Scholarly Book & Chapters',
      desc: 'Multi-chapter academic book architect with preface, target audience difficulty, and chapter expansions.',
    },
    {
      id: 'paraphraser',
      step: 'Integrity',
      title: '9-Mode Academic Paraphraser',
      desc: 'Restructure prose across 9 registers while strictly preserving equations and citations.',
    },
  ];

  const activeDoc = activeProject?.documents[0];
  const sectionCount = activeDoc?.sections?.length || 0;
  const citationCount = activeProject?.citations?.length || 0;

  return (
    <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16 py-10 lg:py-14 font-sans select-none">
      {/* Top Header Label */}
      <div className="flex justify-between items-baseline mb-12 sm:mb-16 pb-6 border-b border-[#e8e8e6]">
        <span className="mono text-slate-500 font-bold tracking-widest text-[11px]">
          Young Mind / v.2.4
        </span>
        <div className="tag-badge text-slate-700 bg-black/5 font-semibold text-[10px]">
          Academic Dashboard
        </div>
      </div>

      {/* Hero Headline in Cormorant Garamond Serif Italic */}
      <h1 className="serif-display italic font-semibold text-4xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tight text-neutral-900 mb-8">
        Accelerating the pursuit of <br className="hidden sm:inline" />
        new knowledge.
      </h1>

      <p className="text-base sm:text-lg max-w-2xl leading-relaxed text-neutral-600 mb-14 font-normal">
        An AI-powered platform for research papers, books, and thesis writing. All drafts are biblio-validated with zero fabrication protocols.
      </p>

      {/* 4 Primary Stages Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10 border-b border-[#e8e8e6] pb-14">
        {stages.map((st) => (
          <div
            key={st.step}
            onClick={() => onNavigate(st.targetView)}
            className="border-t border-[#e8e8e6] pt-5 group cursor-pointer hover:border-black transition"
          >
            <span className="mono text-slate-400 group-hover:text-black font-semibold text-[10px] tracking-wider transition">
              {st.step}
            </span>
            <h3 className="serif-display italic font-semibold text-2xl sm:text-3xl text-neutral-900 my-2 group-hover:underline">
              {st.title}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              {st.desc}
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-black opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Launch Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>

      {/* Current Work Section */}
      {activeProject && (
        <div className="border-t border-b border-[#e8e8e6] py-10 my-10">
          <div className="flex items-center justify-between">
            <span className="mono text-slate-500 font-bold text-[10px] tracking-widest">
              Current Work &middot; {activeProject.type.toUpperCase()}
            </span>
            <button
              onClick={() => onNavigate('academic-editor')}
              className="text-xs font-semibold text-black hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Open in Editor</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <h2 className="serif-display italic font-semibold text-2xl sm:text-4xl text-neutral-900 mt-4 max-w-3xl leading-snug">
            {activeProject.title}
          </h2>

          <p className="text-xs sm:text-sm text-neutral-500 mt-2 max-w-2xl">
            {activeProject.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-8 sm:gap-14 pt-6 border-t border-[#e8e8e6]">
            <div>
              <span className="mono text-slate-400 text-[9px] block mb-1">Sections</span>
              <strong className="text-base sm:text-lg font-mono text-neutral-900">
                {sectionCount} / 20
              </strong>
            </div>

            <div>
              <span className="mono text-slate-400 text-[9px] block mb-1">Citations</span>
              <strong className="text-base sm:text-lg font-mono text-neutral-900">
                {String(citationCount).padStart(2, '0')} Validated
              </strong>
            </div>

            <div>
              <span className="mono text-slate-400 text-[9px] block mb-1">Integrity</span>
              <strong className="text-base sm:text-lg font-semibold text-emerald-700">
                Verified
              </strong>
            </div>

            <div>
              <span className="mono text-slate-400 text-[9px] block mb-1">DOI Protocol</span>
              <strong className="text-base sm:text-lg font-mono text-neutral-900">
                Crossref &le;15%
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* Secondary Academic Suites */}
      <div className="pt-4 space-y-6">
        <div className="flex items-center justify-between border-b border-[#e8e8e6] pb-3">
          <span className="mono text-slate-500 font-bold text-[10px] tracking-widest">
            Specialized Scholarly Frameworks
          </span>
          <span className="text-xs text-slate-400 font-mono">04 Engines</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {secondarySuites.map((suite) => (
            <div
              key={suite.id}
              onClick={() => onNavigate(suite.id)}
              className="p-5 border border-[#e8e8e6] hover:border-black bg-white transition cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="tag-badge text-[9px]">{suite.step}</span>
                <span className="text-xs opacity-0 group-hover:opacity-100 transition text-black">&rarr;</span>
              </div>
              <h4 className="serif-display italic font-semibold text-xl text-neutral-900 group-hover:underline">
                {suite.title}
              </h4>
              <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed">
                {suite.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
