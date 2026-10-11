import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Sparkles,
  ArrowRight,
  Check,
  Copy,
  Printer,
  Download,
  FileText,
  Brain,
  ChevronDown,
  ChevronRight,
  Clock,
  BookOpen,
  Plus,
  RefreshCw,
  Sliders,
  PanelLeftClose,
  PanelLeftOpen,
  Send,
  Zap,
  Quote,
  CheckCircle2,
  Table as TableIcon,
  Layers,
  ArrowUpRight,
  Bookmark,
  Undo2,
  FileDown,
} from 'lucide-react';
import { CitationStyle, GeneratedPaper, PaperSearchResponse, PaperSection } from '../types';
import { DirectSelectionPopover, SelectionState } from './DirectSelectionPopover';
import { exportPaperToDocx, exportPaperToTxt, exportPaperToPdf } from '../utils/paperExport';

interface AcademicPaperStudioProps {
  onOpenInEditor?: (paper: GeneratedPaper) => void;
}

interface PaperHistoryItem {
  id: string;
  query: string;
  timestamp: string;
  paper: GeneratedPaper;
  thoughtProcess?: string;
  thinkingTimeSeconds?: number;
}

const PRESET_TOPICS = [
  {
    title: 'Transformer Latency in Edge AI',
    query: 'Transformer-based Latency Optimization in Edge AI and Embedded Microcontrollers',
    domain: 'Computer Science & AI',
    tag: 'Edge Computing',
  },
  {
    title: 'Quantum Graph Neural Networks',
    query: 'Quantum Graph Neural Networks for Molecular Drug Discovery and Property Prediction',
    domain: 'Quantum Computing & Bioinformatics',
    tag: 'Quantum AI',
  },
  {
    title: 'Zero-Knowledge Privacy Scaling',
    query: 'Zero-Knowledge Rollups for Scalable Decentralized Identity and Privacy-Preserving Transactions',
    domain: 'Cryptography & Distributed Systems',
    tag: 'ZK Proofs',
  },
  {
    title: 'Mitigating Multimodal Hallucinations',
    query: 'Mitigating Hallucinations in Large Vision-Language Models via Contrastive Grounding',
    domain: 'Machine Learning & Vision',
    tag: 'Alignment',
  },
];

const CITATION_STYLES: CitationStyle[] = ['IEEE', 'APA 7', 'Harvard', 'Chicago', 'MLA', 'Vancouver'];

const DOMAINS = [
  'Computer Science & AI',
  'Quantum & Distributed Systems',
  'Materials Science & Energy',
  'Biomedicine & Genomics',
  'Economics & Quantitative Finance',
  'Physics & Mathematics',
];

export const AcademicPaperStudio: React.FC<AcademicPaperStudioProps> = ({
  onOpenInEditor,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCitationStyle, setSelectedCitationStyle] = useState<CitationStyle>('IEEE');
  const [selectedLength, setSelectedLength] = useState<'compact' | 'standard' | 'extended'>('standard');
  const [selectedDomain, setSelectedDomain] = useState('Computer Science & AI');

  // Loading & Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active Paper & Conversation
  const [currentPaper, setCurrentPaper] = useState<GeneratedPaper | null>(null);
  const [thoughtProcess, setThoughtProcess] = useState<string | null>(null);
  const [thinkingTime, setThinkingTime] = useState<number | null>(null);
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(true);
  const [suggestedFollowUps, setSuggestedFollowUps] = useState<string[]>([]);

  // Follow-up Chat
  const [followUpMessages, setFollowUpMessages] = useState<
    Array<{ id: string; role: 'user' | 'assistant'; text: string; timestamp: string }>
  >([]);
  const [followUpInput, setFollowUpInput] = useState('');
  const [isFollowUpLoading, setIsFollowUpLoading] = useState(false);

  // History / Sidebar
  const [history, setHistory] = useState<PaperHistoryItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('');
  const [copiedStatus, setCopiedStatus] = useState(false);

  // Direct Selection & Transformation State
  const [selectionState, setSelectionState] = useState<SelectionState | null>(null);
  const [undoHistory, setUndoHistory] = useState<
    Array<{ original: string; newText: string; sectionId?: string }>
  >([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Listen for text selection inside the academic manuscript
  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Ignore mouse events originating from within the popover
      if (target.closest('.DirectSelectionPopover') || target.closest('[data-popover-ignore]')) {
        return;
      }

      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) {
        return;
      }

      const selectedText = sel.toString().trim();
      if (selectedText.length >= 6) {
        try {
          const range = sel.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const secElement = target.closest('[data-section-id]') as HTMLElement | null;
          const sectionId = secElement?.getAttribute('data-section-id') || undefined;

          setSelectionState({
            text: selectedText,
            rect,
            sectionId,
          });
        } catch {
          // Range error fallback
        }
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  // Generation step timer effect
  useEffect(() => {
    let timer: any;
    let stepTimer: any;
    if (isGenerating) {
      setElapsedSeconds(0);
      timer = setInterval(() => {
        setElapsedSeconds((prev) => +(prev + 0.1).toFixed(1));
      }, 100);

      const steps = [0, 1, 2, 3, 4];
      let s = 0;
      stepTimer = setInterval(() => {
        s = (s + 1) % steps.length;
        setGenerationStep(s);
      }, 700);
    } else {
      clearInterval(timer);
      clearInterval(stepTimer);
    }
    return () => {
      clearInterval(timer);
      clearInterval(stepTimer);
    };
  }, [isGenerating]);

  // Main Generate Handler
  const handleSearchAndGenerate = async (topicToSearch?: string) => {
    const searchQuery = (topicToSearch || query).trim();
    if (!searchQuery || isGenerating) return;

    setIsGenerating(true);
    setErrorMsg(null);
    setFollowUpMessages([]);

    try {
      const response = await fetch('/api/research/search-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          model: 'gemini',
          citationStyle: selectedCitationStyle,
          domain: selectedDomain,
          targetLength: selectedLength,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate research paper');
      }

      const data: PaperSearchResponse = await response.json();
      setCurrentPaper(data.paper);
      setThoughtProcess(data.thoughtProcess || null);
      setThinkingTime(data.thinkingTimeSeconds || 1.8);
      setSuggestedFollowUps(data.suggestedFollowUps || []);
      setIsThinkingExpanded(true);

      // Add to history
      const historyItem: PaperHistoryItem = {
        id: data.paper.id,
        query: searchQuery,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        paper: data.paper,
        thoughtProcess: data.thoughtProcess,
        thinkingTimeSeconds: data.thinkingTimeSeconds,
      };
      setHistory((prev) => [historyItem, ...prev.filter((h) => h.query !== searchQuery)]);

      // Scroll to response
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    } catch {
      setErrorMsg('Failed to generate complete research paper. Please check server connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Follow-up interaction
  const handleSendFollowUp = async (textToSend?: string) => {
    const text = (textToSend || followUpInput).trim();
    if (!text || !currentPaper || isFollowUpLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setFollowUpMessages((prev) => [...prev, userMsg]);
    setFollowUpInput('');
    setIsFollowUpLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini',
          message: `Regarding the research paper "${currentPaper.title}": ${text}`,
          projectContext: `Paper Title: ${currentPaper.title}\nAbstract: ${currentPaper.abstract}`,
        }),
      });

      const data = await res.json();
      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        role: 'assistant' as const,
        text: data.reply || 'Request processed for the research paper.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setFollowUpMessages((prev) => [...prev, assistantMsg]);

      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFollowUpLoading(false);
    }
  };

  const handleNewSearch = () => {
    setCurrentPaper(null);
    setQuery('');
    setFollowUpMessages([]);
    setThoughtProcess(null);
    setErrorMsg(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  };

  const handleCopyPaper = () => {
    if (!currentPaper) return;
    navigator.clipboard.writeText(currentPaper.fullMarkdown);
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 2000);
  };

  const handleExportDocx = async () => {
    if (!currentPaper) return;
    setIsExporting('docx');
    try {
      await exportPaperToDocx(currentPaper);
      setToastMessage('Microsoft Word (.docx) manuscript generated and downloaded!');
    } catch (err) {
      console.error('Word export error:', err);
      setToastMessage('Error exporting Word document.');
    } finally {
      setIsExporting(null);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleExportTxt = () => {
    if (!currentPaper) return;
    setIsExporting('txt');
    try {
      exportPaperToTxt(currentPaper);
      setToastMessage('Plain Text (.txt) manuscript generated and downloaded!');
    } catch (err) {
      console.error('Text export error:', err);
      setToastMessage('Error exporting text file.');
    } finally {
      setIsExporting(null);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleExportPdf = () => {
    if (!currentPaper) return;
    setIsExporting('pdf');
    try {
      exportPaperToPdf(currentPaper);
      setToastMessage('Publication-grade Academic PDF (.pdf) generated and downloaded!');
    } catch (err) {
      console.error('PDF export error:', err);
      setToastMessage('Error generating PDF.');
    } finally {
      setIsExporting(null);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  // Direct Text Selection Replacement in Paper
  const handleReplaceSelection = (original: string, newText: string, sectionId?: string) => {
    if (!currentPaper) return;

    let hasReplaced = false;

    // First check specific section or any section
    const updatedSections = currentPaper.sections.map((sec) => {
      if (sectionId && sec.id !== sectionId) return sec;
      if (sec.content.includes(original)) {
        hasReplaced = true;
        const updatedContent = sec.content.replace(original, newText);
        return {
          ...sec,
          content: updatedContent,
          wordCount: updatedContent.split(/\s+/).filter(Boolean).length,
        };
      }
      return sec;
    });

    let updatedAbstract = currentPaper.abstract;
    if (!hasReplaced && currentPaper.abstract.includes(original)) {
      updatedAbstract = currentPaper.abstract.replace(original, newText);
      hasReplaced = true;
    }

    // Normalized search if exact string has whitespace variations
    if (!hasReplaced) {
      const cleanOriginal = original.trim();
      for (let i = 0; i < updatedSections.length; i++) {
        const sec = updatedSections[i];
        if (sec.content.includes(cleanOriginal)) {
          updatedSections[i] = {
            ...sec,
            content: sec.content.replace(cleanOriginal, newText),
            wordCount: sec.content.split(/\s+/).filter(Boolean).length,
          };
          hasReplaced = true;
          break;
        }
      }
    }

    const newTotalWords = updatedSections.reduce(
      (sum, s) => sum + (s.wordCount || s.content.trim().split(/\s+/).filter(Boolean).length),
      0
    );

    setCurrentPaper({
      ...currentPaper,
      abstract: updatedAbstract,
      sections: updatedSections,
      metrics: {
        ...currentPaper.metrics,
        wordCount: newTotalWords,
        readingTimeMinutes: Math.max(1, Math.ceil(newTotalWords / 200)),
      },
    });

    setUndoHistory((prev) => [{ original, newText, sectionId }, ...prev]);
    setToastMessage('Passage updated directly in paper! (Undo available)');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleInsertAfterSelection = (original: string, newText: string, sectionId?: string) => {
    handleReplaceSelection(original, `${original}\n\n${newText}`, sectionId);
  };

  const handleUndoReplacement = () => {
    if (undoHistory.length === 0 || !currentPaper) return;
    const last = undoHistory[0];
    // Reverse replacement
    let hasReplaced = false;
    const updatedSections = currentPaper.sections.map((sec) => {
      if (last.sectionId && sec.id !== last.sectionId) return sec;
      if (sec.content.includes(last.newText)) {
        hasReplaced = true;
        const updatedContent = sec.content.replace(last.newText, last.original);
        return {
          ...sec,
          content: updatedContent,
          wordCount: updatedContent.split(/\s+/).filter(Boolean).length,
        };
      }
      return sec;
    });

    let updatedAbstract = currentPaper.abstract;
    if (!hasReplaced && currentPaper.abstract.includes(last.newText)) {
      updatedAbstract = currentPaper.abstract.replace(last.newText, last.original);
    }

    setCurrentPaper({
      ...currentPaper,
      abstract: updatedAbstract,
      sections: updatedSections,
    });

    setUndoHistory((prev) => prev.slice(1));
    setToastMessage('Reverted passage to original wording.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleTriggerRefine = (passage: string, sectionId?: string, rect?: DOMRect) => {
    setSelectionState({
      text: passage,
      rect: rect || new DOMRect(window.innerWidth / 2 - 150, 200, 300, 40),
      sectionId,
    });
  };

  const handlePrintPaper = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    if (!currentPaper) return;
    const blob = new Blob([currentPaper.fullMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentPaper.title.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}_Paper.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadLatex = () => {
    if (!currentPaper) return;
    const latex = `\\documentclass[conference]{IEEEtran}
\\usepackage{amsmath,amssymb,amsfonts}
\\usepackage{algorithmic}
\\usepackage{graphicx}
\\usepackage{textcomp}
\\usepackage{xcolor}

\\begin{document}
\\title{${currentPaper.title}}
\\author{\\IEEEauthorblockN{${currentPaper.authors}}
\\IEEEauthorblockA{\\textit{${currentPaper.affiliation}}}}

\\maketitle

\\begin{abstract}
${currentPaper.abstract}
\\end{abstract}

\\begin{IEEEkeywords}
${currentPaper.keywords.join(', ')}
\\end{IEEEkeywords}

${currentPaper.sections.map((s) => `\\section{${s.title}}\n${s.content}\n`).join('\n')}

\\begin{thebibliography}{00}
${currentPaper.references.map((r) => `\\bibitem{ref${r.index}} ${r.citation} DOI: ${r.doi}`).join('\n')}
\\end{thebibliography}

\\end{document}`;

    const blob = new Blob([latex], { type: 'text/x-tex' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentPaper.title.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.tex`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredHistory = history.filter((h) =>
    h.query.toLowerCase().includes(historyFilter.toLowerCase())
  );

  return (
    <div className="flex-1 flex h-full w-full overflow-hidden bg-slate-50 text-slate-900 font-sans">
      {/* Optional History Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-0'
        } transition-all duration-300 ease-in-out bg-white border-r border-slate-200 flex flex-col overflow-hidden shrink-0 z-20`}
      >
        <div className="p-3 border-b border-slate-200 flex items-center justify-between">
          <button
            onClick={handleNewSearch}
            className="flex-1 flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Research Topic</span>
          </button>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 ml-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition cursor-pointer"
            title="Close sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* History Search Filter */}
        {history.length > 0 && (
          <div className="px-3 pt-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value)}
                placeholder="Search history..."
                className="w-full bg-slate-50 text-slate-800 text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}

        {/* History Item List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {history.length === 0 ? (
            <div className="px-3 py-8 text-center text-xs text-slate-400">
              Generated papers will appear in this history list.
            </div>
          ) : (
            filteredHistory.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPaper(item.paper);
                  setThoughtProcess(item.thoughtProcess || null);
                  setThinkingTime(item.thinkingTimeSeconds || null);
                  setQuery(item.query);
                }}
                className={`w-full text-left p-2.5 rounded-lg text-xs transition cursor-pointer flex flex-col gap-1 border ${
                  currentPaper?.id === item.paper.id
                    ? 'bg-indigo-50 text-indigo-900 border-indigo-200 font-semibold'
                    : 'text-slate-700 hover:bg-slate-100 border-transparent'
                }`}
              >
                <div className="truncate font-medium">{item.query}</div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{item.paper.metrics.wordCount} words</span>
                  <span>{item.timestamp}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Main Search & Paper Canvas */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* Top Control Bar */}
        <header className="h-12 border-b border-slate-200/80 bg-white/90 backdrop-blur-xs px-4 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-2">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition cursor-pointer"
                title="Open paper history"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            )}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
              <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-2xs">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <span className="bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 bg-clip-text text-transparent font-extrabold">
                Young Mind
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-100 to-rose-100 text-amber-900 border border-amber-200">
                Synthesis
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {currentPaper && (
              <>
                {/* 1. Direct MS Word (.docx) */}
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
                  <span>Word</span>
                </button>

                {/* 2. Direct Plain Text (.txt) */}
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
                  <span>Text</span>
                </button>

                {/* 3. Direct Academic PDF (.pdf) */}
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

                {/* LaTeX */}
                <button
                  onClick={handleDownloadLatex}
                  className="hidden md:flex px-2 py-1 text-xs text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 rounded-lg transition border border-indigo-200 items-center gap-1 cursor-pointer font-medium"
                  title="Download IEEE LaTeX Source (.tex)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>LaTeX</span>
                </button>

                {/* Copy Markdown */}
                <button
                  onClick={handleCopyPaper}
                  className="hidden lg:flex px-2 py-1 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition border border-slate-200 items-center gap-1 cursor-pointer"
                  title="Copy Full Markdown"
                >
                  {copiedStatus ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedStatus ? 'Copied' : 'MD'}</span>
                </button>

                {onOpenInEditor && (
                  <button
                    id="open-in-editor-btn"
                    onClick={() => onOpenInEditor(currentPaper)}
                    className="px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 rounded-lg transition flex items-center gap-1 shadow-sm shadow-purple-500/25 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Open in Editor</span>
                  </button>
                )}
              </>
            )}

            <button
              onClick={handleNewSearch}
              className="px-2.5 py-1 text-xs font-semibold text-white bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-90 rounded-lg transition flex items-center gap-1 shadow-xs cursor-pointer"
              title="Start New Search"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Paper</span>
            </button>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6 relative bg-gradient-to-b from-indigo-50/30 via-purple-50/20 to-white">
          {/* Subtle colorful ambient blurred glow backdrop */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-amber-300/15 via-rose-400/15 via-purple-400/15 to-cyan-400/15 rounded-full blur-3xl pointer-events-none" />

          {/* STATE 1: Empty Initial Search View */}
          {!currentPaper && !isGenerating && (
            <div className="max-w-3xl mx-auto min-h-[75vh] flex flex-col justify-center items-center text-center px-2 relative z-1">
              {/* Vibrant Young Mind Logo Badge */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center text-white shadow-xl shadow-amber-500/30 mb-5 transform hover:scale-105 transition">
                <Sparkles className="w-8 h-8 text-white drop-shadow-md" />
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-100 via-rose-100 to-purple-100 text-rose-900 border border-rose-200/80 mb-3 shadow-2xs">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>Instant Academic Paper Synthesis</span>
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                Generate Complete Research Papers with{' '}
                <span className="bg-gradient-to-r from-amber-500 via-rose-500 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Young Mind
                </span>
              </h1>
              <p className="text-sm text-slate-600 max-w-xl mb-7 leading-relaxed">
                Enter your research topic or thesis question. <strong className="text-slate-800">Young Mind</strong> automatically generates the whole publication-grade academic paper at once—complete with mathematical models, comparative experiments, and citations.
              </p>

              {/* Central Search Box with Vibrant Multi-Color Gradient Ring */}
              <div className="w-full p-[2px] rounded-2xl bg-gradient-to-r from-amber-400 via-rose-500 via-purple-500 to-cyan-400 shadow-xl shadow-indigo-100 mb-8 transition hover:shadow-2xl hover:shadow-rose-100/60">
                <div className="w-full bg-white rounded-[14px] overflow-hidden text-left">
                  <div className="p-4 pb-2">
                    <textarea
                      id="paper-search-input"
                      ref={textareaRef}
                      rows={2}
                      value={query}
                      onChange={handleInputChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSearchAndGenerate();
                        }
                      }}
                      placeholder="Enter research topic (e.g., 'Transformer-based Latency Optimization in Edge AI', 'Quantum Graph Neural Networks for Molecular Drug Discovery')... Press Enter to generate"
                      className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm md:text-base resize-none focus:outline-none leading-relaxed font-sans"
                    />
                  </div>

                  {/* Bottom Bar of Search Box */}
                  <div className="px-4 pb-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 bg-gradient-to-r from-slate-50 via-indigo-50/20 to-purple-50/20">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {/* Domain Selector */}
                      <select
                        value={selectedDomain}
                        onChange={(e) => setSelectedDomain(e.target.value)}
                        className="bg-white text-slate-700 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer font-medium shadow-2xs"
                      >
                        {DOMAINS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>

                      {/* Citation Style */}
                      <select
                        id="citation-style-select"
                        value={selectedCitationStyle}
                        onChange={(e) => setSelectedCitationStyle(e.target.value as CitationStyle)}
                        className="bg-white text-indigo-700 text-xs px-2.5 py-1.5 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer font-semibold shadow-2xs"
                      >
                        {CITATION_STYLES.map((c) => (
                          <option key={c} value={c}>
                            {c} Style
                          </option>
                        ))}
                      </select>

                      {/* Target Scope */}
                      <select
                        value={selectedLength}
                        onChange={(e) => setSelectedLength(e.target.value as any)}
                        className="bg-white text-emerald-800 text-xs px-2.5 py-1.5 rounded-lg border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer font-medium shadow-2xs"
                      >
                        <option value="standard">Standard (~3,500w)</option>
                        <option value="extended">Extended Journal (~5,500w)</option>
                        <option value="compact">Conference Short (~2,200w)</option>
                      </select>
                    </div>

                    {/* Search / Submit Button with Colorful Gradient */}
                    <button
                      id="paper-search-submit-btn"
                      onClick={() => handleSearchAndGenerate()}
                      disabled={!query.trim() || isGenerating}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        query.trim() && !isGenerating
                          ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:opacity-95 text-white shadow-md shadow-rose-500/25'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate Whole Paper</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Preset Topic Cards with 4 Distinctive Colorful Themes */}
              <div className="w-full">
                <div className="text-xs text-slate-500 font-semibold mb-3 flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Or select a topic to synthesize immediately:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  {PRESET_TOPICS.map((preset, idx) => {
                    const themeClasses = [
                      'bg-gradient-to-br from-sky-50 to-blue-50/70 border-sky-200 hover:border-sky-400 text-sky-950',
                      'bg-gradient-to-br from-fuchsia-50 to-purple-50/70 border-fuchsia-200 hover:border-fuchsia-400 text-fuchsia-950',
                      'bg-gradient-to-br from-emerald-50 to-teal-50/70 border-emerald-200 hover:border-emerald-400 text-emerald-950',
                      'bg-gradient-to-br from-amber-50 to-orange-50/70 border-amber-200 hover:border-amber-400 text-amber-950',
                    ][idx % 4];

                    const iconColor = [
                      'bg-sky-500 text-white',
                      'bg-fuchsia-500 text-white',
                      'bg-emerald-500 text-white',
                      'bg-amber-500 text-white',
                    ][idx % 4];

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setQuery(preset.query);
                          handleSearchAndGenerate(preset.query);
                        }}
                        className={`p-3.5 rounded-xl border transition text-left group flex items-start gap-3 shadow-2xs hover:shadow-md cursor-pointer ${themeClasses}`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs ${iconColor}`}>
                          <BookOpen className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">
                            {preset.title}
                          </div>
                          <div className="text-[11px] opacity-75 truncate mt-0.5">{preset.domain}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STATE 2: Generating Loading Screen */}
          {isGenerating && (
            <div className="max-w-2xl mx-auto space-y-6 pt-12">
              <div className="flex justify-end">
                <div className="bg-indigo-600 text-white px-4 py-3 rounded-2xl max-w-xl text-sm shadow-xs">
                  <div className="text-xs text-indigo-200 font-medium mb-1">Research Paper Query:</div>
                  <div className="font-semibold">{query}</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping"></span>
                    <span>Gemini is generating complete research paper...</span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{elapsedSeconds}s</span>
                  </div>
                </div>

                {/* Animated Progress Steps */}
                <div className="space-y-2.5 text-xs">
                  {[
                    '1. Formulating Academic Abstract & Problem Specification',
                    '2. Deriving Mathematical Theorems & Theoretical Formulations',
                    '3. Constructing Algorithmic Methodology & Structural Proofs',
                    '4. Generating Empirical Benchmarking & Comparative Performance Tables',
                    '5. Compiling Standardized Peer-Reviewed Citations & DOIs',
                  ].map((step, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2.5 transition ${
                        generationStep === idx
                          ? 'text-indigo-600 font-semibold'
                          : generationStep > idx
                          ? 'text-slate-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {generationStep > idx ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : generationStep === idx ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-indigo-600 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                      )}
                      <span>{step}</span>
                    </div>
                  ))}
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${Math.min(95, (generationStep + 1) * 20)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* STATE 3: Generated Whole Research Paper View */}
          {currentPaper && !isGenerating && (
            <div className="max-w-4xl mx-auto space-y-6 pb-12">
              {/* User Query Bubble */}
              <div className="flex justify-end">
                <div className="bg-white text-slate-800 px-4 py-2.5 rounded-2xl max-w-xl text-xs border border-slate-200 shadow-2xs flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <div>
                    <span className="text-slate-400 text-[10px] block font-semibold uppercase">Topic</span>
                    <span className="font-semibold text-slate-800">{currentPaper.query}</span>
                  </div>
                </div>
              </div>

              {/* Vibrant Colorful Paper Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50/70 border border-indigo-200/80 rounded-xl p-3 shadow-2xs">
                  <div className="flex items-center justify-between text-indigo-600 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Word Count</span>
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-base font-extrabold text-indigo-950">
                    {currentPaper.metrics.wordCount.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-indigo-600 font-medium">Standard Academic</div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-teal-50/70 border border-emerald-200/80 rounded-xl p-3 shadow-2xs">
                  <div className="flex items-center justify-between text-emerald-600 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Read Time</span>
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-base font-extrabold text-emerald-950">
                    ~{currentPaper.metrics.readingTimeMinutes} min
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium">Full Manuscript</div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-yellow-50/70 border border-amber-200/80 rounded-xl p-3 shadow-2xs">
                  <div className="flex items-center justify-between text-amber-600 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Citations</span>
                    <Quote className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-base font-extrabold text-amber-950">
                    {currentPaper.references?.length || currentPaper.metrics.citationsCount}
                  </div>
                  <div className="text-[10px] text-amber-600 font-medium">{currentPaper.citationStyle} Format</div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50/70 border border-purple-200/80 rounded-xl p-3 shadow-2xs">
                  <div className="flex items-center justify-between text-purple-600 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Equations</span>
                    <Brain className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-base font-extrabold text-purple-950">
                    {currentPaper.metrics.equationsCount}
                  </div>
                  <div className="text-[10px] text-purple-600 font-medium">LaTeX Formulations</div>
                </div>

                <div className="bg-gradient-to-br from-cyan-50 to-sky-50/70 border border-cyan-200/80 rounded-xl p-3 col-span-2 sm:col-span-1 shadow-2xs">
                  <div className="flex items-center justify-between text-cyan-600 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-700">Tables</span>
                    <TableIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-base font-extrabold text-cyan-950">
                    {currentPaper.metrics.tablesCount}
                  </div>
                  <div className="text-[10px] text-cyan-600 font-medium">Empirical Baselines</div>
                </div>
              </div>

              {/* Chain of Thought Accordion */}
              {thoughtProcess && (
                <div className="bg-indigo-50/50 border border-indigo-200 rounded-xl overflow-hidden text-xs">
                  <button
                    onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
                    className="w-full px-3.5 py-2 flex items-center justify-between text-indigo-900 hover:bg-indigo-100/50 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2 font-semibold">
                      <Brain className="w-4 h-4 text-indigo-600" />
                      <span>
                        Academic Chain of Thought ({thinkingTime ? `${thinkingTime}s` : 'Derivation Trace'})
                      </span>
                    </div>
                    {isThinkingExpanded ? (
                      <ChevronDown className="w-4 h-4 text-indigo-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-indigo-400" />
                    )}
                  </button>
                  {isThinkingExpanded && (
                    <div className="p-4 border-t border-indigo-100 bg-white text-slate-700 font-mono text-[11px] leading-relaxed whitespace-pre-line max-h-60 overflow-y-auto">
                      {thoughtProcess}
                    </div>
                  )}
                </div>
              )}

              {/* DIRECT GENERATION & EXPORT HUB (Word, Text, PDF) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <FileDown className="w-4 h-4 text-indigo-600" />
                      <span>Direct Paper Generation &amp; Export Formats</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Instantly generate and download the completed academic paper to your computer in your required format.
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                    <span>IEEE / Peer-Review Ready</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* 1. MS WORD (.DOCX) GENERATOR */}
                  <button
                    onClick={handleExportDocx}
                    disabled={isExporting !== null}
                    className="p-3.5 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/80 to-indigo-50/40 hover:from-blue-100/90 hover:to-indigo-100/60 transition text-left space-y-1.5 cursor-pointer shadow-2xs group relative disabled:opacity-60"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          W
                        </div>
                        <span className="font-bold text-xs text-blue-950">MS Word (.docx)</span>
                      </div>
                      {isExporting === 'docx' ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                      ) : (
                        <Download className="w-4 h-4 text-blue-500 group-hover:text-blue-700 transition" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-600 leading-snug">
                      Academic OOXML document with formatted headings, abstract, equations, and numbered bibliography.
                    </p>
                    <div className="text-[10px] font-bold text-blue-700 flex items-center gap-1 pt-1">
                      <span>Generate Word File</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                    </div>
                  </button>

                  {/* 2. PLAIN TEXT (.TXT) GENERATOR */}
                  <button
                    onClick={handleExportTxt}
                    disabled={isExporting !== null}
                    className="p-3.5 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50/80 to-yellow-50/40 hover:from-amber-100/90 hover:to-yellow-100/60 transition text-left space-y-1.5 cursor-pointer shadow-2xs group relative disabled:opacity-60"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          TXT
                        </div>
                        <span className="font-bold text-xs text-amber-950">Text File (.txt)</span>
                      </div>
                      {isExporting === 'txt' ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
                      ) : (
                        <Download className="w-4 h-4 text-amber-500 group-hover:text-amber-700 transition" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-600 leading-snug">
                      Clean UTF-8 plain text with distinct section headers for terminal pipelines, LLM fine-tuning, and notes.
                    </p>
                    <div className="text-[10px] font-bold text-amber-800 flex items-center gap-1 pt-1">
                      <span>Generate Text File</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                    </div>
                  </button>

                  {/* 3. ACADEMIC PDF (.PDF) GENERATOR */}
                  <button
                    onClick={handleExportPdf}
                    disabled={isExporting !== null}
                    className="p-3.5 rounded-xl border border-rose-200 bg-gradient-to-br from-rose-50/80 to-pink-50/40 hover:from-rose-100/90 hover:to-pink-100/60 transition text-left space-y-1.5 cursor-pointer shadow-2xs group relative disabled:opacity-60"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          PDF
                        </div>
                        <span className="font-bold text-xs text-rose-950">Academic PDF (.pdf)</span>
                      </div>
                      {isExporting === 'pdf' ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-rose-600" />
                      ) : (
                        <Download className="w-4 h-4 text-rose-500 group-hover:text-rose-700 transition" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-600 leading-snug">
                      Publication-grade serif document layout with running headers, A4 page margins, and pagination.
                    </p>
                    <div className="text-[10px] font-bold text-rose-700 flex items-center gap-1 pt-1">
                      <span>Generate PDF File</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                    </div>
                  </button>
                </div>
              </div>

              {/* DIRECT TEXT SELECTION REFINEMENT HELPER BANNER */}
              <div className="bg-gradient-to-r from-amber-50 via-rose-50/70 to-indigo-50 border border-amber-200/90 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>Direct Selection Refinement Active</span>
                      <span className="text-[10px] bg-white text-indigo-700 font-bold px-1.5 py-0.2 rounded border border-indigo-200">
                        Select text below
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Highlight or select any passage in the manuscript to instantly <span className="font-semibold text-indigo-700">Paraphrase</span> or <span className="font-semibold text-rose-700">Change Tone</span> (Formal Academic, Empirical, Persuasive, etc.).
                    </p>
                  </div>
                </div>

                {undoHistory.length > 0 && (
                  <button
                    onClick={handleUndoReplacement}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs shrink-0"
                    title="Undo last replaced passage"
                  >
                    <Undo2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Undo Last Edit ({undoHistory.length})</span>
                  </button>
                )}
              </div>

              {/* THE FULL RESEARCH PAPER ARTICLE CARD */}
              <article
                id="academic-manuscript-card"
                className="bg-white border border-slate-200 rounded-2xl p-6 md:p-12 shadow-sm text-slate-800 space-y-8 relative"
              >
                {/* Paper Header */}
                <div className="text-center space-y-3 border-b border-slate-200 pb-8">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                    Peer-Reviewed Research Paper
                  </div>
                  <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 tracking-tight leading-snug">
                    {currentPaper.title}
                  </h1>
                  {currentPaper.subtitle && (
                    <p className="text-sm md:text-base text-slate-500 font-serif italic max-w-2xl mx-auto">
                      {currentPaper.subtitle}
                    </p>
                  )}
                  <div className="space-y-1 pt-2">
                    <p className="text-sm font-semibold text-slate-800">{currentPaper.authors}</p>
                    <p className="text-xs text-slate-500">{currentPaper.affiliation}</p>
                  </div>
                </div>

                {/* Abstract Box */}
                <div className="bg-slate-50 border-l-4 border-indigo-600 rounded-r-xl p-5 space-y-2">
                  <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Abstract</div>
                  <p className="text-sm leading-relaxed text-slate-700 font-serif text-justify">
                    {currentPaper.abstract}
                  </p>
                </div>

                {/* Keywords */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-xs font-bold text-slate-500 mr-1">Keywords:</span>
                  {currentPaper.keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs rounded-full border border-slate-200 font-medium"
                    >
                      {kw}
                    </span>
                  ))}
                </div>

                {/* Quick Section Navigator Bar */}
                <div className="flex items-center gap-2 overflow-x-auto py-2.5 text-xs border-y border-slate-200 text-slate-600 scrollbar-none">
                  <span className="font-semibold text-slate-800 shrink-0">Sections:</span>
                  {currentPaper.sections.map((sec, idx) => (
                    <button
                      key={sec.id}
                      onClick={() => {
                        const el = document.getElementById(`paper-sec-${sec.id}`);
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 shrink-0 transition font-medium cursor-pointer"
                    >
                      {idx + 1}. {sec.title.split('.')[1]?.slice(0, 15) || sec.title.slice(0, 15)}...
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      const el = document.getElementById('paper-references-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 shrink-0 transition font-medium cursor-pointer"
                  >
                    References
                  </button>
                </div>

                {/* Structured Sections */}
                <div className="space-y-8 text-slate-800 font-serif leading-relaxed">
                  {currentPaper.sections.map((sec) => (
                    <section
                      key={sec.id}
                      id={`paper-sec-${sec.id}`}
                      data-section-id={sec.id}
                      className="space-y-3 pt-4 border-t border-slate-100 first:border-0 relative group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-lg md:text-xl font-sans font-bold text-slate-900 tracking-tight">
                          {sec.title}
                        </h2>
                        <button
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            handleTriggerRefine(sec.content.slice(0, 240), sec.id, rect);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 flex items-center gap-1 cursor-pointer"
                          title="Refine or change tone of passage in this section"
                        >
                          <Sparkles className="w-3 h-3 text-indigo-600" />
                          <span>Refine Passage</span>
                        </button>
                      </div>

                      {/* Markdown rendering with tables & formulas */}
                      <div className="space-y-3 text-sm md:text-base leading-relaxed text-slate-700 font-serif">
                        {sec.content.split('\n\n').map((paragraph, pIdx) => {
                          // If markdown table
                          if (paragraph.includes('|') && paragraph.includes('\n|')) {
                            const rows = paragraph.trim().split('\n');
                            const headers = rows[0]?.split('|').filter(Boolean).map((h) => h.trim());
                            const bodyRows = rows.slice(2);
                            return (
                              <div key={pIdx} className="my-4 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 font-sans text-xs shadow-2xs">
                                <table className="w-full text-left border-collapse">
                                  <thead>
                                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-900 font-semibold">
                                      {headers?.map((h, hi) => (
                                        <th key={hi} className="p-2.5 border-r border-slate-200 last:border-0">
                                          {h}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {bodyRows.map((br, bri) => {
                                      const cols = br.split('|').filter(Boolean).map((c) => c.trim());
                                      return (
                                        <tr key={bri} className="border-b border-slate-200/60 hover:bg-white transition last:border-0">
                                          {cols.map((c, ci) => (
                                            <td key={ci} className="p-2.5 border-r border-slate-200 last:border-0 font-mono text-[11px] text-slate-700">
                                              {c}
                                            </td>
                                          ))}
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            );
                          }

                          // If LaTeX formula block ($$ ... $$)
                          if (paragraph.startsWith('$$') && paragraph.endsWith('$$')) {
                            return (
                              <div key={pIdx} className="my-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center font-mono text-xs md:text-sm text-indigo-900 overflow-x-auto shadow-2xs">
                                {paragraph}
                              </div>
                            );
                          }

                          return (
                            <p key={pIdx} className="text-justify leading-relaxed">
                              {paragraph}
                            </p>
                          );
                        })}
                      </div>
                    </section>
                  ))}

                  {/* References Section */}
                  <section id="paper-references-section" className="space-y-4 pt-6 border-t-2 border-slate-200">
                    <h2 className="text-lg md:text-xl font-sans font-bold text-slate-900 tracking-tight flex items-center justify-between">
                      <span>References</span>
                      <span className="text-xs font-normal text-slate-500 font-sans">
                        {currentPaper.references.length} Citations ({currentPaper.citationStyle})
                      </span>
                    </h2>

                    <div className="space-y-2.5 font-sans text-xs">
                      {currentPaper.references.map((r) => (
                        <div
                          key={r.index}
                          className="flex items-start gap-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-indigo-50/50 transition"
                        >
                          <span className="font-mono font-bold text-indigo-600 shrink-0">[{r.index}]</span>
                          <div className="min-w-0 flex-1">
                            <span className="text-slate-800">{r.citation}</span>
                            {r.doi && (
                              <span className="block text-[11px] text-indigo-600 font-mono mt-0.5">
                                DOI: {r.doi}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </article>

              {/* Bottom Follow-up Prompt Bar */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-bold text-slate-800">Refine Paper &amp; Ask Inquiries with Young Mind</span>
                  </div>
                  {onOpenInEditor && (
                    <button
                      onClick={() => onOpenInEditor(currentPaper)}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Edit Manuscript Directly</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Follow up suggestions */}
                {suggestedFollowUps.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {suggestedFollowUps.map((prompt, pi) => (
                      <button
                        key={pi}
                        onClick={() => handleSendFollowUp(prompt)}
                        className="px-2.5 py-1 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-lg text-slate-700 text-xs transition cursor-pointer"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}

                {/* Follow-up messages */}
                {followUpMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-xl text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white ml-12'
                        : 'bg-slate-50 border border-slate-200 text-slate-800 mr-12'
                    }`}
                  >
                    <div className="text-[10px] font-semibold opacity-75 mb-1">
                      {msg.role === 'user' ? 'You' : 'Young Mind AI'} &bull; {msg.timestamp}
                    </div>
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  </div>
                ))}

                {isFollowUpLoading && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 italic py-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                    <span>Young Mind is updating paper analysis...</span>
                  </div>
                )}

                {/* Follow up input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendFollowUp();
                  }}
                  className="flex items-center gap-2 pt-2"
                >
                  <input
                    type="text"
                    value={followUpInput}
                    onChange={(e) => setFollowUpInput(e.target.value)}
                    placeholder="Ask Young Mind to modify a section, derive a formula, or expand empirical benchmarks..."
                    className="flex-1 bg-slate-50 text-slate-800 text-xs p-2.5 rounded-xl border border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                  />
                  <button
                    type="submit"
                    disabled={!followUpInput.trim() || isFollowUpLoading}
                    className="p-2.5 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:opacity-90 disabled:opacity-50 text-white rounded-xl transition cursor-pointer shrink-0 shadow-2xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </main>

      {/* Interactive Direct Selection Popover for Paraphrase and Tone Change */}
      <DirectSelectionPopover
        selection={selectionState}
        onClose={() => setSelectionState(null)}
        onReplaceText={handleReplaceSelection}
        onInsertAfter={handleInsertAfterSelection}
      />

      {/* Floating Status Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          {undoHistory.length > 0 && (
            <button
              onClick={handleUndoReplacement}
              className="ml-2 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
            >
              <Undo2 className="w-3 h-3" />
              <span>Undo</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
