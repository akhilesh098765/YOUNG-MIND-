import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Sparkles,
  Brain,
  Flame,
  Bot,
  Globe,
  CheckCircle2,
  Copy,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Quote,
  Code,
  Bold,
  Italic,
  List,
  Heading1,
  Heading2,
  FileText,
  Search,
  Eye,
  Edit3,
  Columns,
  Check,
  Zap,
  RefreshCw,
  Shield,
  Download,
  FileDown,
  Printer,
} from 'lucide-react';
import { CitationItem, CitationStyle, PaperSection, GeneratedPaper } from '../types';
import { DirectSelectionPopover, SelectionState } from './DirectSelectionPopover';
import { exportPaperToDocx, exportPaperToTxt, exportPaperToPdf } from '../utils/paperExport';

interface SimpleEditorProps {
  documentTitle: string;
  onChangeTitle: (title: string) => void;
  authors: string;
  onChangeAuthors: (authors: string) => void;
  affiliations: string;
  onChangeAffiliations: (affiliations: string) => void;
  sections: PaperSection[];
  activeSectionId: string;
  onSelectSection: (id: string) => void;
  onUpdateSection: (id: string, title: string, content: string) => void;
  onAddSection: (afterIndex?: number) => void;
  onDeleteSection: (id: string) => void;
  citations: CitationItem[];
  citationStyle: CitationStyle;
  onOpenCitationModal: (sectionId: string) => void;
  onOpenParaphraseModal: (text: string, sectionId: string) => void;
  onAutoGeneratePaper?: (paper: GeneratedPaper) => void;
}

export const SimpleEditor: React.FC<SimpleEditorProps> = ({
  documentTitle,
  onChangeTitle,
  authors,
  onChangeAuthors,
  affiliations,
  onChangeAffiliations,
  sections,
  activeSectionId,
  onSelectSection,
  onUpdateSection,
  onAddSection,
  onDeleteSection,
  citations,
  citationStyle,
  onOpenCitationModal,
  onOpenParaphraseModal,
  onAutoGeneratePaper,
}) => {
  const [showOutline, setShowOutline] = useState(true);
  const [outlineFilter, setOutlineFilter] = useState('');
  const [viewModes, setViewModes] = useState<Record<string, 'edit' | 'preview' | 'split'>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [generatingSectionId, setGeneratingSectionId] = useState<string | null>(null);
  const [autoGenerateTopic, setAutoGenerateTopic] = useState('');
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [autoGenSuccessMsg, setAutoGenSuccessMsg] = useState<string | null>(null);

  // Direct Selection & Export State
  const [selectionState, setSelectionState] = useState<SelectionState | null>(null);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [editorToast, setEditorToast] = useState<string | null>(null);

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Mouse selection listener inside manuscript editor
  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('.DirectSelectionPopover') || target.closest('[data-popover-ignore]')) {
        return;
      }
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) return;

      const text = sel.toString().trim();
      if (text.length >= 6) {
        try {
          const range = sel.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const secElement = target.closest('[data-section-id]') as HTMLElement | null;
          const sectionId = secElement?.getAttribute('data-section-id') || activeSectionId;

          setSelectionState({
            text,
            rect,
            sectionId,
          });
        } catch {
          // Fallback
        }
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeSectionId]);

  const getEditorPaperObject = (): GeneratedPaper => {
    const totalWords = sections.reduce((acc, s) => acc + s.content.trim().split(/\s+/).filter(Boolean).length, 0);
    return {
      id: `paper-editor-${Date.now()}`,
      query: documentTitle || 'Academic Manuscript',
      title: documentTitle || 'Academic Manuscript',
      subtitle: `Citation Style: ${citationStyle}`,
      authors: authors || 'Lead Researcher',
      affiliation: affiliations || 'Young Mind Scholarly Consortium',
      abstract: sections[0]?.content || 'Academic manuscript prepared in Young Mind.',
      keywords: ['Scholarly Research', 'Empirical Study'],
      citationStyle,
      modelUsed: 'Gemini 3.8 Flash Academic',
      createdAt: new Date().toISOString(),
      sections: sections.map((s) => ({
        id: s.id,
        title: s.title,
        content: s.content,
        wordCount: s.content.trim().split(/\s+/).filter(Boolean).length,
      })),
      references: citations.map((c, idx) => ({
        id: c.id || `ref-${idx + 1}`,
        index: idx + 1,
        citation: c.fullBibliography || `${c.authors} (${c.year}). ${c.title}.`,
        doi: c.doi,
      })),
      metrics: {
        wordCount: totalWords,
        readingTimeMinutes: Math.max(1, Math.ceil(totalWords / 200)),
        citationsCount: citations.length,
        equationsCount: 3,
        tablesCount: 2,
      },
      fullMarkdown: '',
    };
  };

  const handleExportDocx = async () => {
    setIsExporting('docx');
    try {
      await exportPaperToDocx(getEditorPaperObject());
      setEditorToast('Word (.docx) document generated and downloaded!');
    } catch (err) {
      console.error('Word export error:', err);
      setEditorToast('Failed to export Word document.');
    } finally {
      setIsExporting(null);
      setTimeout(() => setEditorToast(null), 3000);
    }
  };

  const handleExportTxt = () => {
    setIsExporting('txt');
    try {
      exportPaperToTxt(getEditorPaperObject());
      setEditorToast('Text file (.txt) generated and downloaded!');
    } catch (err) {
      console.error('Text export error:', err);
    } finally {
      setIsExporting(null);
      setTimeout(() => setEditorToast(null), 3000);
    }
  };

  const handleExportPdf = () => {
    setIsExporting('pdf');
    try {
      exportPaperToPdf(getEditorPaperObject());
      setEditorToast('Academic PDF (.pdf) generated and downloaded!');
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsExporting(null);
      setTimeout(() => setEditorToast(null), 3000);
    }
  };

  const handleReplaceSelection = (original: string, newText: string, sectionId?: string) => {
    // Find section to replace text
    const targetSec = sections.find((s) => s.id === sectionId) || sections.find((s) => s.content.includes(original));
    if (targetSec) {
      const updatedContent = targetSec.content.replace(original, newText);
      onUpdateSection(targetSec.id, targetSec.title, updatedContent);
      setEditorToast(`Passage refined & updated in "${targetSec.title}"!`);
      setTimeout(() => setEditorToast(null), 3500);
    }
  };

  const handleInsertAfterSelection = (original: string, newText: string, sectionId?: string) => {
    handleReplaceSelection(original, `${original}\n\n${newText}`, sectionId);
  };

  const handleTriggerAutoGenerate = async (topicToUse?: string) => {
    const query = (topicToUse || autoGenerateTopic).trim();
    if (!query) return;

    setIsAutoGenerating(true);
    setAutoGenSuccessMsg(null);

    try {
      const res = await fetch('/api/research/search-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          citationStyle,
          domain: 'Scholarly Research',
          targetLength: 'standard',
          includeLatex: true,
          includeTables: true,
        }),
      });

      if (!res.ok) throw new Error('Failed to auto-generate paper');
      const data = await res.json();

      if (data.paper) {
        if (onAutoGeneratePaper) {
          onAutoGeneratePaper(data.paper);
        } else {
          onChangeTitle(data.paper.title);
          onChangeAuthors(data.paper.authors);
          onChangeAffiliations(data.paper.affiliation);
        }
        setAutoGenSuccessMsg(`Whole paper generated (${data.paper.metrics?.wordCount || 3500} words, ${data.paper.sections?.length || 6} sections)!`);
        setTimeout(() => setAutoGenSuccessMsg(null), 5000);
        setAutoGenerateTopic('');
      }
    } catch (err: any) {
      console.error('Auto generate paper error:', err);
      alert('Could not auto-generate paper: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsAutoGenerating(false);
    }
  };

  const filteredSections = sections.filter((s) =>
    s.title.toLowerCase().includes(outlineFilter.toLowerCase())
  );

  const scrollToSection = (id: string) => {
    onSelectSection(id);
    const el = sectionRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getViewMode = (id: string): 'edit' | 'preview' | 'split' => {
    return viewModes[id] || 'edit';
  };

  const setSectionViewMode = (id: string, mode: 'edit' | 'preview' | 'split') => {
    setViewModes((prev) => ({ ...prev, [id]: mode }));
  };

  const handleCopySection = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleQuickModelAction = async (secId: string, actionType: 'math' | 'critique' | 'polish' | 'citations') => {
    const sec = sections.find((s) => s.id === secId);
    if (!sec) return;
    setGeneratingSectionId(secId);

    try {
      let promptText = '';
      if (actionType === 'math') {
        promptText = `Provide formal LaTeX mathematical derivations and algorithmic complexity bounds for this academic section:\n${sec.content}`;
      } else if (actionType === 'critique') {
        promptText = `Perform a rigorous peer-review evaluation and identify methodological limitations, vulnerabilities, and potential counter-arguments for this section:\n${sec.content}`;
      } else if (actionType === 'polish') {
        promptText = `Elevate this section into publication-ready journal prose with rigorous formal academic tone and clear transitions:\n${sec.content}`;
      } else if (actionType === 'citations') {
        promptText = `Provide global scholarly comparative synthesis with standard academic citations for:\n${sec.content}`;
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: promptText,
          mode: actionType,
          context: `Paper Title: ${documentTitle}\nSection: ${sec.title}`,
        }),
      });

      const data = await res.json();
      if (data.reply) {
        const appended = `${sec.content}\n\n${data.reply}`;
        onUpdateSection(secId, sec.title, appended);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingSectionId(null);
    }
  };

  // Quick text formatting helpers
  const applyFormat = (secId: string, format: string) => {
    const sec = sections.find((s) => s.id === secId);
    if (!sec) return;

    let addition = '';
    if (format === 'bold') addition = '**bold text**';
    else if (format === 'italic') addition = '*italic text*';
    else if (format === 'h2') addition = '\n\n## Subheading\n';
    else if (format === 'quote') addition = '\n\n> Academic citation quote...\n';
    else if (format === 'code') addition = '\n\n```python\n# Algorithmic formulation\n```\n';
    else if (format === 'math') addition = '\n\n$$\n\\mathcal{L}_{defense} = \\mathbb{E}_{(x,y)} [\\ell(f_\\theta(x), y)] + \\lambda \\Omega(\\nabla_x f)\n$$\n';
    else if (format === 'list') addition = '\n\n- Point 1\n- Point 2\n- Point 3\n';

    onUpdateSection(secId, sec.title, sec.content + addition);
  };

  // Simple Markdown renderer helper for preview
  const renderSimpleMarkdown = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-3 font-serif text-slate-800 leading-relaxed text-[15px]">
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-sans font-bold text-base text-slate-900 mt-4 mb-2">
                {line.replace('### ', '')}
              </h4>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h3 key={idx} className="font-sans font-bold text-lg text-slate-900 mt-5 mb-2 pb-1 border-b border-slate-200">
                {line.replace('## ', '')}
              </h3>
            );
          }
          if (line.startsWith('# ')) {
            return (
              <h2 key={idx} className="font-sans font-extrabold text-xl text-slate-900 mt-6 mb-3">
                {line.replace('# ', '')}
              </h2>
            );
          }
          if (line.startsWith('> ')) {
            return (
              <blockquote
                key={idx}
                className="border-l-3 border-indigo-500 pl-4 py-1 italic text-slate-600 bg-indigo-50/30 rounded-r text-sm"
              >
                {line.replace('> ', '')}
              </blockquote>
            );
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <li key={idx} className="ml-5 list-disc text-slate-700">
                {line.slice(2)}
              </li>
            );
          }
          if (line.startsWith('$$') && line.endsWith('$$') && line.length > 4) {
            return (
              <div key={idx} className="my-2 p-3 bg-slate-50 border border-slate-200 rounded font-mono text-center text-xs text-indigo-900 overflow-x-auto">
                {line.replace(/\$\$/g, '')}
              </div>
            );
          }
          if (line.trim() === '') {
            return <div key={idx} className="h-1" />;
          }
          return (
            <p key={idx} className="text-slate-800 leading-relaxed">
              {line}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-50">
      {/* 1. Collapsible Clean Document Outline */}
      {showOutline ? (
        <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 select-none">
          {/* Outline Header */}
          <div className="p-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-900 tracking-tight">Outline</span>
              <span className="text-[10px] text-slate-400 font-mono">({sections.length})</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onAddSection()}
                className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded transition cursor-pointer"
                title="Add Section"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowOutline(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition cursor-pointer"
                title="Collapse Outline"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Filter */}
          <div className="px-3 py-2 border-b border-slate-100">
            <div className="relative flex items-center">
              <Search className="w-3 h-3 text-slate-400 absolute left-2" />
              <input
                type="text"
                value={outlineFilter}
                onChange={(e) => setOutlineFilter(e.target.value)}
                placeholder="Filter sections..."
                className="w-full text-xs pl-7 pr-2 py-1 rounded border border-slate-200 focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          {/* Section Items */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredSections.map((sec, idx) => {
              const isActive = sec.id === activeSectionId;
              const wordCount = sec.content.trim().split(/\s+/).filter(Boolean).length;
              return (
                <div
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`group p-2 rounded-md text-xs cursor-pointer transition flex items-start justify-between gap-2 ${
                    isActive
                      ? 'bg-indigo-50 border border-indigo-200 text-indigo-950 font-medium'
                      : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs">{sec.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {wordCount} words
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                      isActive ? 'text-indigo-600' : 'text-slate-300 opacity-0 group-hover:opacity-100'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Add Section Button Footer */}
          <div className="p-2 border-t border-slate-100">
            <button
              onClick={() => onAddSection()}
              className="w-full py-1.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-600" />
              <span>Add New Section</span>
            </button>
          </div>
        </aside>
      ) : (
        /* Collapsed expand tab */
        <div className="border-r border-slate-200 bg-white p-1 flex flex-col items-center">
          <button
            onClick={() => setShowOutline(true)}
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded transition cursor-pointer"
            title="Expand Outline"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Main Center Writing Canvas */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* ⚡ Instant Automatic Whole Paper Generator */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50/60 to-indigo-50/50 border border-emerald-300/80 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 bg-emerald-600 text-white rounded-lg shadow-xs">
                  <Zap className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <span>Auto-Generate Whole Research Paper At Once</span>
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-200/80 text-emerald-900 rounded-full font-mono font-medium">
                      One-Click Synthesis
                    </span>
                  </h3>
                  <p className="text-[11px] text-emerald-800/80 mt-0.5">
                    Type any research topic, hypothesis, or thesis. Generates title, abstract, mathematical model, empirical experiments, and citations at once.
                  </p>
                </div>
              </div>

              {autoGenSuccessMsg && (
                <div className="text-xs bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-lg flex items-center gap-1.5 font-medium shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{autoGenSuccessMsg}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-emerald-700/60 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={autoGenerateTopic}
                  onChange={(e) => setAutoGenerateTopic(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleTriggerAutoGenerate();
                    }
                  }}
                  placeholder="Enter research topic (e.g., 'Transformer Latency Optimization in Edge AI', 'CRISPR Off-Target Modeling')... Press Enter"
                  className="w-full text-xs bg-white pl-9 pr-3 py-2.5 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-inner text-slate-800 placeholder-slate-400 font-medium"
                />
              </div>

              <button
                onClick={() => handleTriggerAutoGenerate()}
                disabled={isAutoGenerating || !autoGenerateTopic.trim()}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition shrink-0 cursor-pointer"
              >
                {isAutoGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating Whole Paper...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate at Once</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Document Header Card with Colorful Top Stripe */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-rose-500 via-purple-600 to-cyan-500" />
            <div>
              <label className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider font-mono">
                Document Title
              </label>
              <input
                type="text"
                value={documentTitle}
                onChange={(e) => onChangeTitle(e.target.value)}
                className="w-full font-serif font-bold text-2xl sm:text-3xl text-slate-900 border-b border-transparent hover:border-slate-200 focus:border-indigo-500 focus:outline-none transition py-1"
                placeholder="Enter academic paper title..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Authors &amp; Degrees
                </label>
                <input
                  type="text"
                  value={authors}
                  onChange={(e) => onChangeAuthors(e.target.value)}
                  className="w-full text-xs text-slate-700 border-b border-transparent hover:border-slate-200 focus:border-indigo-400 focus:outline-none transition py-0.5"
                  placeholder="e.g. Dr. A. Sharma, Prof. K. Patel"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Affiliations &amp; Laboratory
                </label>
                <input
                  type="text"
                  value={affiliations}
                  onChange={(e) => onChangeAffiliations(e.target.value)}
                  className="w-full text-xs text-slate-700 border-b border-transparent hover:border-slate-200 focus:border-indigo-400 focus:outline-none transition py-0.5"
                  placeholder="e.g. Dept. of Computer Science & Advanced Systems Lab"
                />
              </div>
            </div>

            {/* Document stats & Direct Export bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span>
                  <strong className="text-slate-800">{sections.length}</strong> sections
                </span>
                <span>
                  <strong className="text-slate-800">{citations.length}</strong> citations
                </span>
                <span>
                  Citation Style: <strong className="text-indigo-600 font-mono">{citationStyle}</strong>
                </span>
              </div>

              {/* Direct Export Buttons for Editor */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-400 mr-1 uppercase tracking-wider">Direct Export:</span>
                <button
                  onClick={handleExportDocx}
                  disabled={isExporting !== null}
                  className="px-2.5 py-1 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition border border-blue-200 flex items-center gap-1 cursor-pointer font-bold disabled:opacity-50"
                  title="Generate & Download Microsoft Word (.docx)"
                >
                  {isExporting === 'docx' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                  )}
                  <span>Word (.docx)</span>
                </button>

                <button
                  onClick={handleExportTxt}
                  disabled={isExporting !== null}
                  className="px-2.5 py-1 text-xs text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg transition border border-amber-200 flex items-center gap-1 cursor-pointer font-bold disabled:opacity-50"
                  title="Generate & Download Plain Text (.txt)"
                >
                  {isExporting === 'txt' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
                  ) : (
                    <FileDown className="w-3.5 h-3.5 text-amber-600" />
                  )}
                  <span>Text (.txt)</span>
                </button>

                <button
                  onClick={handleExportPdf}
                  disabled={isExporting !== null}
                  className="px-2.5 py-1 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition border border-rose-200 flex items-center gap-1 cursor-pointer font-bold disabled:opacity-50"
                  title="Generate & Download Academic PDF (.pdf)"
                >
                  {isExporting === 'pdf' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-600" />
                  ) : (
                    <Printer className="w-3.5 h-3.5 text-rose-600" />
                  )}
                  <span>PDF</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sections List */}
          <div className="space-y-6">
            {sections.map((sec, index) => {
              const isActive = sec.id === activeSectionId;
              const viewMode = getViewMode(sec.id);
              const wordCount = sec.content.trim().split(/\s+/).filter(Boolean).length;
              const isGenerating = generatingSectionId === sec.id;

              return (
                <div
                  key={sec.id}
                  data-section-id={sec.id}
                  ref={(el) => {
                    sectionRefs.current[sec.id] = el;
                  }}
                  onClick={() => onSelectSection(sec.id)}
                  className={`bg-white rounded-xl border transition duration-200 overflow-hidden shadow-2xs ${
                    isActive
                      ? 'border-indigo-300 ring-1 ring-indigo-200/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Section Top Header & Action Bar */}
                  <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2">
                    {/* Title Input */}
                    <div className="flex-1 min-w-[200px] flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-400">{index + 1}.</span>
                      <input
                        type="text"
                        value={sec.title}
                        onChange={(e) => onUpdateSection(sec.id, e.target.value, sec.content)}
                        className="font-sans font-bold text-sm text-slate-900 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-indigo-400 focus:outline-none transition w-full py-0.5"
                        placeholder="Section title..."
                      />
                    </div>

                    {/* Right Tools: View Toggle & Formatting Buttons */}
                    <div className="flex items-center gap-1.5">
                      {/* View mode toggle (Edit / Preview / Split) */}
                      <div className="flex items-center bg-slate-200/60 p-0.5 rounded-md text-slate-600">
                        <button
                          onClick={() => setSectionViewMode(sec.id, 'edit')}
                          className={`p-1 rounded text-xs transition cursor-pointer ${
                            viewMode === 'edit' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                          }`}
                          title="Edit Markdown"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSectionViewMode(sec.id, 'split')}
                          className={`p-1 rounded text-xs transition cursor-pointer ${
                            viewMode === 'split' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                          }`}
                          title="Split View (Edit & Preview)"
                        >
                          <Columns className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSectionViewMode(sec.id, 'preview')}
                          className={`p-1 rounded text-xs transition cursor-pointer ${
                            viewMode === 'preview' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                          }`}
                          title="Read Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Copy section */}
                      <button
                        onClick={() => handleCopySection(sec.id, sec.content)}
                        className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition cursor-pointer"
                        title="Copy section text"
                      >
                        {copiedId === sec.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Delete section (if > 1) */}
                      {sections.length > 1 && (
                        <button
                          onClick={() => onDeleteSection(sec.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                          title="Delete section"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Young Mind AI Quick Actions Bar */}
                  <div className="px-5 py-2.5 bg-gradient-to-r from-amber-50/50 via-rose-50/30 to-indigo-50/50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    {/* Young Mind AI Quick Actions */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-2xs mr-1">
                        Young Mind:
                      </span>
                      <button
                        onClick={() => handleQuickModelAction(sec.id, 'math')}
                        disabled={isGenerating}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-semibold flex items-center gap-1 transition cursor-pointer disabled:opacity-50 shadow-2xs"
                        title="Derive LaTeX math formulas, proofs, and asymptotic complexity"
                      >
                        <Brain className="w-3 h-3 text-indigo-600" />
                        <span>LaTeX Proof</span>
                      </button>

                      <button
                        onClick={() => handleQuickModelAction(sec.id, 'critique')}
                        disabled={isGenerating}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-semibold flex items-center gap-1 transition cursor-pointer disabled:opacity-50 shadow-2xs"
                        title="Peer review evaluation & limitation audit"
                      >
                        <Shield className="w-3 h-3 text-amber-600" />
                        <span>Peer Review</span>
                      </button>

                      <button
                        onClick={() => handleQuickModelAction(sec.id, 'polish')}
                        disabled={isGenerating}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-semibold flex items-center gap-1 transition cursor-pointer disabled:opacity-50 shadow-2xs"
                        title="Publication-ready prose enhancement and transitions"
                      >
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span>Academic Polish</span>
                      </button>

                      <button
                        onClick={() => handleQuickModelAction(sec.id, 'citations')}
                        disabled={isGenerating}
                        className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-semibold flex items-center gap-1 transition cursor-pointer disabled:opacity-50 shadow-2xs"
                        title="Global comparative literature context and scholarly citations"
                      >
                        <BookOpen className="w-3 h-3 text-purple-600" />
                        <span>Citations</span>
                      </button>
                    </div>

                    {/* Editorial Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onOpenParaphraseModal(sec.content, sec.id)}
                        className="px-2 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium flex items-center gap-1 transition cursor-pointer"
                        title="Open 9-Mode Academic Paraphraser"
                      >
                        <span>Paraphrase</span>
                      </button>

                      <button
                        onClick={() => onOpenCitationModal(sec.id)}
                        className="px-2 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium flex items-center gap-1 transition cursor-pointer"
                        title="Insert Citation"
                      >
                        <Quote className="w-3 h-3 text-indigo-600" />
                        <span>Cite</span>
                      </button>
                    </div>
                  </div>

                  {/* Clean Markdown Formatting Bar (for edit mode) */}
                  {(viewMode === 'edit' || viewMode === 'split') && (
                    <div className="px-5 py-1.5 border-b border-slate-100 bg-white flex items-center gap-1 text-slate-500 overflow-x-auto">
                      <button
                        onClick={() => applyFormat(sec.id, 'bold')}
                        className="p-1 hover:bg-slate-100 hover:text-slate-900 rounded text-xs transition cursor-pointer"
                        title="Bold"
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => applyFormat(sec.id, 'italic')}
                        className="p-1 hover:bg-slate-100 hover:text-slate-900 rounded text-xs transition cursor-pointer"
                        title="Italic"
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => applyFormat(sec.id, 'h2')}
                        className="p-1 hover:bg-slate-100 hover:text-slate-900 rounded text-xs transition cursor-pointer font-bold font-mono"
                        title="Subheading"
                      >
                        H2
                      </button>
                      <button
                        onClick={() => applyFormat(sec.id, 'math')}
                        className="p-1 hover:bg-slate-100 hover:text-slate-900 rounded text-xs transition cursor-pointer font-mono"
                        title="LaTeX Equation ($$)"
                      >
                        ∑
                      </button>
                      <button
                        onClick={() => applyFormat(sec.id, 'code')}
                        className="p-1 hover:bg-slate-100 hover:text-slate-900 rounded text-xs transition cursor-pointer"
                        title="Code snippet"
                      >
                        <Code className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => applyFormat(sec.id, 'quote')}
                        className="p-1 hover:bg-slate-100 hover:text-slate-900 rounded text-xs transition cursor-pointer"
                        title="Blockquote"
                      >
                        <Quote className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => applyFormat(sec.id, 'list')}
                        className="p-1 hover:bg-slate-100 hover:text-slate-900 rounded text-xs transition cursor-pointer"
                        title="Bullet list"
                      >
                        <List className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Section Content Area (Edit / Preview / Split) */}
                  <div className="p-5">
                    {isGenerating && (
                      <div className="mb-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center gap-2 text-xs text-indigo-900 animate-pulse">
                        <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
                        <span>AI Reasoning Engine is synthesizing output for this section...</span>
                      </div>
                    )}

                    {viewMode === 'edit' && (
                      <textarea
                        value={sec.content}
                        onChange={(e) => onUpdateSection(sec.id, sec.title, e.target.value)}
                        className="w-full min-h-[220px] font-serif text-[15px] text-slate-900 leading-relaxed bg-transparent focus:outline-none resize-y"
                        placeholder="Write or paste academic section content in Markdown..."
                      />
                    )}

                    {viewMode === 'preview' && (
                      <div className="min-h-[220px] py-1">
                        {renderSimpleMarkdown(sec.content)}
                      </div>
                    )}

                    {viewMode === 'split' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[220px]">
                        <div className="border-r border-slate-200 pr-4">
                          <textarea
                            value={sec.content}
                            onChange={(e) => onUpdateSection(sec.id, sec.title, e.target.value)}
                            className="w-full h-full min-h-[200px] font-mono text-xs text-slate-900 leading-relaxed bg-transparent focus:outline-none resize-none"
                            placeholder="Markdown code..."
                          />
                        </div>
                        <div className="pl-2 overflow-y-auto max-h-[400px]">
                          {renderSimpleMarkdown(sec.content)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section Footer Bar */}
                  <div className="px-5 py-2 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-mono text-[11px]">{wordCount} words</span>
                    <button
                      onClick={() => onAddSection(index + 1)}
                      className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Insert Section Below</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Add Section Button */}
          <div className="text-center pt-2 pb-12">
            <button
              onClick={() => onAddSection()}
              className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold inline-flex items-center gap-2 transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>Add Another Academic Section</span>
            </button>
          </div>
        </div>
      </main>

      {/* Interactive Direct Selection Popover for Paraphrase and Tone Change */}
      <DirectSelectionPopover
        selection={selectionState}
        onClose={() => setSelectionState(null)}
        onReplaceText={handleReplaceSelection}
        onInsertAfter={handleInsertAfterSelection}
      />

      {/* Toast Notification */}
      {editorToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{editorToast}</span>
        </div>
      )}
    </div>
  );
};
