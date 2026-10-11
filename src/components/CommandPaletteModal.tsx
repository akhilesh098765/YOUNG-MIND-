import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  FileText,
  Bookmark,
  BookOpen,
  Award,
  Sparkles,
  FileSearch,
  CheckCheck,
  ShieldCheck,
  BarChart2,
  Layers,
  ArrowRight,
  FolderPlus,
  Download,
  MessageSquare,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { Project } from '../types';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectView: (view: string) => void;
  onNewProject: () => void;
  onExport: () => void;
  onToggleChat: () => void;
  activeProject: Project | null;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectView,
  onNewProject,
  onExport,
  onToggleChat,
  activeProject,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const tools = [
    {
      id: 'dashboard',
      name: 'Workspace Dashboard',
      category: 'Overview',
      desc: 'Overview of academic projects, stats, and quick actions',
      icon: Layers,
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      id: 'arena',
      name: 'Multi-Model AI Arena (ChatGPT, Grok, DeepSeek, Qwen)',
      category: 'Multi-Model AI',
      desc: 'Simultaneously run queries, mathematical proofs, and stress-tests across ChatGPT, Grok, DeepSeek, and Qwen',
      icon: Zap,
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      id: 'paper-wizard',
      name: 'Research Paper Wizard',
      category: 'Writing Suites',
      desc: '20-section publication paper generator with expected results safeguards',
      icon: FileText,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      id: 'review-paper',
      name: 'Review Paper & Literature Matrix',
      category: 'Writing Suites',
      desc: 'Systematic literature review, PRISMA synthesis, and 7-column comparative table',
      icon: Bookmark,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      id: 'thesis-wizard',
      name: 'Thesis & Dissertation Studio',
      category: 'Writing Suites',
      desc: 'PhD, M.Tech, MS, and B.Tech thesis builder with institutional certificates',
      icon: Award,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      id: 'book-writer',
      name: 'Academic Book & Monograph Studio',
      category: 'Writing Suites',
      desc: 'Comprehensive multi-chapter academic book architect and pedagogical notes',
      icon: BookOpen,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      id: 'academic-editor',
      name: 'Academic Document Editor',
      category: 'Writing & Polishing',
      desc: 'Section-wise rich text editor with AI writing assistant and quality heuristics',
      icon: FileSearch,
      color: 'text-slate-700 bg-slate-100',
    },
    {
      id: 'paraphraser',
      name: '9-Mode Academic Paraphraser',
      category: 'Writing & Polishing',
      desc: 'Rewrite prose across 9 registers while preserving math, equations, and citations',
      icon: CheckCheck,
      color: 'text-cyan-600 bg-cyan-50',
    },
    {
      id: 'plagiarism',
      name: 'Plagiarism & Similarity Scanner',
      category: 'Writing & Polishing',
      desc: 'Internal n-gram library check and public scholarly web passage match auditor',
      icon: Search,
      color: 'text-rose-600 bg-rose-50',
    },
    {
      id: 'citations',
      name: 'Citation Manager & DOI Validator',
      category: 'Writing & Polishing',
      desc: 'IEEE, APA 7, MLA, Chicago, Harvard, Vancouver with Crossref verification & BibTeX',
      icon: Bookmark,
      color: 'text-teal-600 bg-teal-50',
    },
    {
      id: 'research-gap',
      name: '9-D Research Gap Discovery',
      category: 'Research & Discovery',
      desc: 'Formulate methodological, dataset, evaluation, and application gaps with research questions',
      icon: Sparkles,
      color: 'text-pink-600 bg-pink-50',
    },
    {
      id: 'web-research',
      name: 'Scholarly Web Research Hub',
      category: 'Research & Discovery',
      desc: 'Search arXiv, PubMed, Crossref, and Semantic Scholar with cryptographic provenance badges',
      icon: Search,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      id: 'pdf-analyzer',
      name: 'PDF & Paper Deconstructor',
      category: 'Research & Discovery',
      desc: 'Extract methodologies, datasets, findings, gaps, and citation data from PDFs',
      icon: FileSearch,
      color: 'text-violet-600 bg-violet-50',
    },
    {
      id: 'dataset-assistant',
      name: 'Dataset Diagnostics & ML Guide',
      category: 'Data & Visuals',
      desc: 'Profile CSV tables, detect missing values, and receive recommended machine learning models',
      icon: BarChart2,
      color: 'text-orange-600 bg-orange-50',
    },
    {
      id: 'figures-tables',
      name: 'Figure & Architecture Diagram Generator',
      category: 'Data & Visuals',
      desc: 'Mermaid.js workflow schematics, system architecture diagrams, and comparison tables',
      icon: Layers,
      color: 'text-indigo-600 bg-indigo-50',
    },
  ];

  const filteredTools = tools.filter(
    (t) =>
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.desc.toLowerCase().includes(query.toLowerCase()) ||
      t.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="px-4 py-3.5 border-b border-slate-200 flex items-center gap-3 bg-slate-50/70">
          <Search className="w-5 h-5 text-indigo-600 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools, workflows, paper sections, or actions (e.g. 'paper', 'paraphrase', 'citations')..."
            className="flex-1 bg-transparent border-none text-sm text-slate-800 focus:outline-none placeholder:text-slate-400 font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold text-slate-500 bg-slate-200/80 rounded border border-slate-300">
            ESC
          </kbd>
        </div>

        {/* Quick Common Actions */}
        {!query && (
          <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-slate-400 font-medium text-[11px] whitespace-nowrap">Quick Actions:</span>
            <button
              onClick={() => {
                onNewProject();
                onClose();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 font-semibold transition whitespace-nowrap cursor-pointer shadow-2xs"
            >
              <FolderPlus className="w-3.5 h-3.5 text-indigo-600" />
              <span>New Project</span>
            </button>
            <button
              onClick={() => {
                onExport();
                onClose();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:text-emerald-600 hover:border-emerald-300 font-semibold transition whitespace-nowrap cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export Manuscript</span>
            </button>
            <button
              onClick={() => {
                onToggleChat();
                onClose();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:text-cyan-600 hover:border-cyan-300 font-semibold transition whitespace-nowrap cursor-pointer shadow-2xs"
            >
              <MessageSquare className="w-3.5 h-3.5 text-cyan-600" />
              <span>Research AI Co-Pilot</span>
            </button>
          </div>
        )}

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredTools.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              No matching academic tools found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredTools.map((t) => {
              const Icon = t.icon;
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    onSelectView(t.id);
                    onClose();
                  }}
                  className="p-3 rounded-xl hover:bg-indigo-50/70 transition flex items-center justify-between group cursor-pointer border border-transparent hover:border-indigo-100"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${t.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition">
                          {t.name}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {t.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{t.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition flex-shrink-0 ml-2" />
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span>Current Project:</span>
            <strong className="text-slate-700 font-semibold truncate max-w-[240px]">
              {activeProject?.title || 'General Workspace'}
            </strong>
          </div>
          <span>Press Enter or click to launch</span>
        </div>
      </div>
    </div>
  );
};
