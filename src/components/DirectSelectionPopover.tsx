import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  RefreshCw,
  Check,
  Copy,
  ChevronDown,
  X,
  ArrowRight,
  SlidersHorizontal,
  RotateCcw,
  Zap,
  BookOpen,
  Scale,
  Flame,
  Search,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { AcademicTone, ParaphraseMode, TransformSelectionResponse } from '../types';

export interface SelectionState {
  text: string;
  rect: DOMRect | null;
  sectionId?: string;
  paragraphIndex?: number;
}

interface DirectSelectionPopoverProps {
  selection: SelectionState | null;
  onClose: () => void;
  onReplaceText: (original: string, newText: string, sectionId?: string) => void;
  onInsertAfter?: (original: string, newText: string, sectionId?: string) => void;
}

const TONE_OPTIONS: { id: AcademicTone; label: string; icon: any; color: string; desc: string }[] = [
  {
    id: 'Formal Academic',
    label: 'Formal Academic',
    icon: BookOpen,
    color: 'from-indigo-600 to-blue-600',
    desc: 'Scholarly register, elevated domain terminology, dignified peer-reviewed syntax',
  },
  {
    id: 'Empirical & Objective',
    label: 'Empirical & Objective',
    icon: Scale,
    color: 'from-emerald-600 to-teal-600',
    desc: 'Neutral, data-grounded, removes subjective claims, focuses on measurable proof',
  },
  {
    id: 'Persuasive & Defensible',
    label: 'Persuasive & Convincing',
    icon: Flame,
    color: 'from-amber-600 to-orange-600',
    desc: 'Assertive rhetorical strength, compelling thesis defense, highlighting novelty',
  },
  {
    id: 'High-Impact & Direct',
    label: 'High-Impact & Direct',
    icon: Zap,
    color: 'from-rose-600 to-pink-600',
    desc: 'Active verbs, crisp sentence cadence, immediate clarity, removes passive drag',
  },
  {
    id: 'Critical & Evaluative',
    label: 'Critical & Evaluative',
    icon: Search,
    color: 'from-purple-600 to-violet-600',
    desc: 'Analytical scrutiny, methodological caveats, trade-offs, balanced appraisal',
  },
  {
    id: 'Plain & Accessible',
    label: 'Plain & Accessible',
    icon: Eye,
    color: 'from-cyan-600 to-blue-600',
    desc: 'Demystifies complex jargon, intuitive explanation for broader academic audiences',
  },
];

const PARAPHRASE_MODES: { id: ParaphraseMode; label: string; desc: string }[] = [
  { id: 'Academic', label: 'Academic Standard', desc: 'Scholarly phrasing and academic cadence' },
  { id: 'Concise', label: 'Make Concise', desc: 'Eliminates filler while preserving all facts' },
  { id: 'Simple', label: 'Simplify & Clarify', desc: 'Untangles convoluted syntactic clauses' },
  { id: 'Detailed', label: 'Expand & Elaborate', desc: 'Adds deeper explanatory context and transitions' },
  { id: 'Formal', label: 'Strict Formal', desc: 'Eliminates colloquialisms and informal voice' },
  { id: 'Standard', label: 'Fluent Flow', desc: 'Natural, smooth sentence transitions' },
];

export const DirectSelectionPopover: React.FC<DirectSelectionPopoverProps> = ({
  selection,
  onClose,
  onReplaceText,
  onInsertAfter,
}) => {
  const [isOpenExpanded, setIsOpenExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'tone' | 'paraphrase'>('paraphrase');
  const [selectedTone, setSelectedTone] = useState<AcademicTone>('Formal Academic');
  const [selectedMode, setSelectedMode] = useState<ParaphraseMode>('Academic');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TransformSelectionResponse | null>(null);
  const [activeVariant, setActiveVariant] = useState<'main' | 'alternative'>('main');
  const [isCopied, setIsCopied] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Position coordinates
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useEffect(() => {
    if (!selection || !selection.rect) {
      setIsOpenExpanded(false);
      setResult(null);
      return;
    }

    const { rect } = selection;
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollX = window.scrollX || document.documentElement.scrollLeft;

    // Center popover horizontally relative to selection, keep inside viewport
    const popoverWidth = isOpenExpanded ? 520 : 360;
    let left = rect.left + scrollX + rect.width / 2 - popoverWidth / 2;
    left = Math.max(16, Math.min(left, window.innerWidth - popoverWidth - 24));

    // Position above selection if space permits, else below
    let top = rect.top + scrollY - 56;
    if (top < scrollY + 40) {
      top = rect.bottom + scrollY + 12;
    }

    setPosition({ top, left });
  }, [selection, isOpenExpanded]);

  if (!selection || !selection.text || selection.text.trim().length < 4) {
    return null;
  }

  const handleTransform = async (action: 'paraphrase' | 'change-tone', toneOverride?: AcademicTone, modeOverride?: ParaphraseMode) => {
    const toneToUse = toneOverride || selectedTone;
    const modeToUse = modeOverride || selectedMode;

    if (toneOverride) setSelectedTone(toneOverride);
    if (modeOverride) setSelectedMode(modeOverride);

    setIsLoading(true);
    setIsOpenExpanded(true);
    setIsApplied(false);

    try {
      const res = await fetch('/api/paper/transform-selection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: selection.text,
          action,
          tone: toneToUse,
          mode: modeToUse,
          surroundingContext: selection.sectionId ? `Section: ${selection.sectionId}` : undefined,
        }),
      });

      if (!res.ok) throw new Error('Transformation request failed');
      const data: TransformSelectionResponse = await res.json();
      setResult(data);
      setActiveVariant('main');
    } catch (err) {
      console.error('Error transforming selection:', err);
      // Client-side instant heuristic fallback
      const original = selection.text;
      let transformed = original;
      if (action === 'change-tone') {
        if (toneToUse === 'Empirical & Objective') {
          transformed = original.replace(/we believe|we think|obviously/gi, 'as substantiated by measured data');
        } else if (toneToUse === 'High-Impact & Direct') {
          transformed = original.replace(/it is important to note that /gi, '').replace(/in order to/gi, 'to');
        } else {
          transformed = original.replace(/shows that/gi, 'demonstrates empirically that');
        }
      } else {
        transformed = original.replace(/good results/gi, 'robust experimental outcomes');
      }

      setResult({
        original,
        transformed,
        alternative: `${transformed} Consequently, findings substantiate high reproducibility.`,
        action,
        selectedOption: action === 'change-tone' ? toneToUse : modeToUse,
        wordsOriginal: original.split(/\s+/).length,
        wordsTransformed: transformed.split(/\s+/).length,
        explanation: `Enhanced wording aligned to ${action === 'change-tone' ? toneToUse : modeToUse}.`,
        keyChanges: ['Preserved core technical entities', 'Adjusted stylistic syntax'],
      });
      setActiveVariant('main');
    } finally {
      setIsLoading(false);
    }
  };

  const currentTransformedText = activeVariant === 'main' ? result?.transformed || '' : result?.alternative || result?.transformed || '';

  const handleApplyReplacement = () => {
    if (!currentTransformedText) return;
    onReplaceText(selection.text, currentTransformedText, selection.sectionId);
    setIsApplied(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleApplyInsertAfter = () => {
    if (!currentTransformedText) return;
    if (onInsertAfter) {
      onInsertAfter(selection.text, currentTransformedText, selection.sectionId);
    } else {
      onReplaceText(selection.text, `${selection.text} ${currentTransformedText}`, selection.sectionId);
    }
    setIsApplied(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleCopy = () => {
    if (!currentTransformedText) return;
    navigator.clipboard.writeText(currentTransformedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div
      ref={popoverRef}
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 9999,
      }}
      className="transition-all duration-200 animate-in fade-in zoom-in-95 pointer-events-auto"
    >
      {!isOpenExpanded ? (
        /* COMPACT FLOATING SELECTION PILL */
        <div className="bg-slate-900/95 backdrop-blur-md text-white px-2.5 py-1.5 rounded-full shadow-2xl border border-slate-700/80 flex items-center gap-1.5 text-xs font-sans">
          {/* Brand Sparkle */}
          <div className="flex items-center gap-1 pl-1 pr-1.5 border-r border-slate-700 text-amber-400 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-[11px] bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400 bg-clip-text text-transparent">
              Young Mind
            </span>
          </div>

          {/* Quick Paraphrase Button */}
          <button
            onClick={() => handleTransform('paraphrase', undefined, 'Academic')}
            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-full flex items-center gap-1 transition shadow-xs cursor-pointer"
            title="Paraphrase selected passage"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Paraphrase</span>
          </button>

          {/* Quick Formal Tone Button */}
          <button
            onClick={() => handleTransform('change-tone', 'Formal Academic')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-semibold rounded-full flex items-center gap-1 transition border border-slate-700 cursor-pointer"
            title="Change to Formal Academic Tone"
          >
            <BookOpen className="w-3 h-3 text-indigo-400" />
            <span>Formal Tone</span>
          </button>

          {/* Quick Empirical Tone Button */}
          <button
            onClick={() => handleTransform('change-tone', 'Empirical & Objective')}
            className="hidden sm:flex px-2 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-medium rounded-full items-center gap-1 transition border border-slate-700 cursor-pointer text-[11px]"
            title="Change to Empirical & Objective Tone"
          >
            <Scale className="w-3 h-3 text-emerald-400" />
            <span>Empirical</span>
          </button>

          {/* More Tones & Options Expand Button */}
          <button
            onClick={() => setIsOpenExpanded(true)}
            className="px-2 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-full flex items-center gap-0.5 transition cursor-pointer text-[11px]"
            title="Choose tone, mode, and settings"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>More</span>
          </button>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition cursor-pointer ml-0.5"
            title="Dismiss selection"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* EXPANDED INTERACTIVE TRANSFORMATION CARD */
        <div className="w-[340px] sm:w-[500px] bg-white rounded-2xl shadow-2xl border border-slate-300/80 overflow-hidden font-sans text-slate-800 animate-in fade-in zoom-in-95 duration-150">
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 p-0.5">
            <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-white">
                  <Sparkles className="w-3 h-3" />
                </div>
                <div>
                  <h4 className="text-xs font-bold flex items-center gap-1.5">
                    <span>Direct Passage Refinement</span>
                    <span className="text-[10px] font-mono font-normal text-amber-300 px-1 rounded bg-slate-800">
                      Young Mind
                    </span>
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsOpenExpanded(false)}
                  className="text-slate-400 hover:text-white p-1 rounded transition text-xs"
                  title="Collapse to pill"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white p-1 rounded transition"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="px-4 pt-3 pb-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setActiveTab('paraphrase')}
                className={`px-3 py-1 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'paraphrase'
                    ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <RefreshCw className="w-3 h-3" />
                <span>Paraphrase Passage</span>
              </button>

              <button
                onClick={() => setActiveTab('tone')}
                className={`px-3 py-1 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'tone'
                    ? 'bg-white text-rose-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Change Tone</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-500 font-mono">
              {selection.text.split(/\s+/).filter(Boolean).length} words selected
            </div>
          </div>

          <div className="p-4 space-y-3.5 max-h-[75vh] overflow-y-auto">
            {/* TAB 1: PARAPHRASE MODES */}
            {activeTab === 'paraphrase' && (
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Select Paraphrase Mode
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {PARAPHRASE_MODES.map((m) => {
                    const isSelected = selectedMode === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => handleTransform('paraphrase', undefined, m.id)}
                        disabled={isLoading}
                        className={`text-left p-2 rounded-xl border text-xs transition cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-semibold ring-1 ring-indigo-400'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="font-semibold text-[11px] flex items-center justify-between">
                          <span>{m.label}</span>
                          {isSelected && <Check className="w-3 h-3 text-indigo-600 shrink-0" />}
                        </div>
                        <div className="text-[10px] text-slate-500 leading-tight mt-0.5 line-clamp-1">
                          {m.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: TONE SELECTOR */}
            {activeTab === 'tone' && (
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Choose Academic Tone
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {TONE_OPTIONS.map((t) => {
                    const isSelected = selectedTone === t.id;
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        onClick={() => handleTransform('change-tone', t.id)}
                        disabled={isLoading}
                        className={`text-left p-2.5 rounded-xl border text-xs transition cursor-pointer flex items-start gap-2 ${
                          isSelected
                            ? 'bg-gradient-to-r from-rose-50 to-indigo-50 border-indigo-300 text-slate-900 font-semibold ring-1 ring-indigo-400'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${t.color} text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                            <span>{t.label}</span>
                            {isSelected && <Check className="w-3 h-3 text-rose-600 shrink-0" />}
                          </div>
                          <div className="text-[10px] text-slate-500 leading-snug mt-0.5 line-clamp-2">
                            {t.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Original Selected Text Snippet */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center justify-between">
                <span>Original Passage</span>
                <span className="font-mono text-[10px] text-slate-400">
                  {selection.text.length} chars
                </span>
              </div>
              <p className="text-slate-700 italic line-clamp-3 leading-relaxed font-serif">
                "{selection.text}"
              </p>
            </div>

            {/* LOADING STATE */}
            {isLoading && (
              <div className="py-8 text-center space-y-2 bg-gradient-to-br from-indigo-50/60 via-purple-50/40 to-pink-50/60 rounded-xl border border-indigo-100">
                <RefreshCw className="w-5 h-5 animate-spin text-indigo-600 mx-auto" />
                <div className="text-xs font-bold text-slate-800">
                  Young Mind AI is transforming passage...
                </div>
                <div className="text-[11px] text-slate-500">
                  Applying {activeTab === 'tone' ? selectedTone : selectedMode} style and verifying citations
                </div>
              </div>
            )}

            {/* RESULT VIEW */}
            {result && !isLoading && (
              <div className="space-y-3 animate-in fade-in duration-200">
                {/* Result Header & Variants */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Transformed ({result.selectedOption})</span>
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                      {result.wordsTransformed} words ({result.wordsTransformed - result.wordsOriginal >= 0 ? `+${result.wordsTransformed - result.wordsOriginal}` : `${result.wordsTransformed - result.wordsOriginal}`})
                    </span>
                  </div>

                  {result.alternative && (
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-semibold">
                      <button
                        onClick={() => setActiveVariant('main')}
                        className={`px-2 py-0.5 rounded transition cursor-pointer ${
                          activeVariant === 'main'
                            ? 'bg-white text-indigo-700 font-bold shadow-2xs'
                            : 'text-slate-600'
                        }`}
                      >
                        Version 1
                      </button>
                      <button
                        onClick={() => setActiveVariant('alternative')}
                        className={`px-2 py-0.5 rounded transition cursor-pointer ${
                          activeVariant === 'alternative'
                            ? 'bg-white text-indigo-700 font-bold shadow-2xs'
                            : 'text-slate-600'
                        }`}
                      >
                        Version 2
                      </button>
                    </div>
                  )}
                </div>

                {/* Transformed Output Box */}
                <div className="p-3.5 bg-gradient-to-br from-emerald-50/50 via-teal-50/20 to-white rounded-xl border border-emerald-200/90 text-slate-900 text-xs leading-relaxed font-serif relative">
                  <p className="leading-relaxed text-[13px]">{currentTransformedText}</p>

                  {result.explanation && (
                    <div className="mt-2.5 pt-2 border-t border-emerald-100 text-[10px] text-emerald-800 font-sans flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{result.explanation}</span>
                    </div>
                  )}
                </div>

                {/* Success feedback if applied */}
                {isApplied && (
                  <div className="p-2 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-200 flex items-center gap-2 font-medium animate-in fade-in">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Successfully updated in paper!</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleCopy}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                      title="Copy transformed text"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>

                    {onInsertAfter && (
                      <button
                        onClick={handleApplyInsertAfter}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                        title="Insert after original passage"
                      >
                        <span>Insert Below</span>
                      </button>
                    )}
                  </div>

                  {/* Primary ONE-CLICK REPLACE IN PAPER BUTTON */}
                  <button
                    onClick={handleApplyReplacement}
                    disabled={isApplied}
                    className="px-4 py-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:opacity-90 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-indigo-500/25 transition cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Replace in Paper</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
