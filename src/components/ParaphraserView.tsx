import React, { useState } from 'react';
import { CheckCheck, Sparkles, RefreshCw, Copy, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { ParaphraseMode, ParaphraseResponse } from '../types';

export const ParaphraserView: React.FC = () => {
  const [inputText, setInputText] = useState(
    'Deep neural networks are very good at image classification, but researchers found that they can easily be fooled by small changes called adversarial perturbations. In our study, we test defensive distillation with temperature scaling to see if edge microcontrollers can run without slowing down too much.'
  );

  const [mode, setMode] = useState<ParaphraseMode>('Academic');
  const [preserveCitations, setPreserveCitations] = useState(true);
  const [preserveMath, setPreserveMath] = useState(true);
  const [preserveTerminology, setPreserveTerminology] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ParaphraseResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const modes: ParaphraseMode[] = [
    'Standard',
    'Academic',
    'Professional',
    'Simple',
    'Technical',
    'Concise',
    'Detailed',
    'Human-like',
    'Formal',
  ];

  const handleParaphrase = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/paraphrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          mode,
          preserveQuotesAndCitations: preserveCitations,
          preserveMath,
          preserveTerminology,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result?.paraphrased) return;
    navigator.clipboard.writeText(result.paraphrased);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 text-xs font-semibold mb-2">
            <CheckCheck className="w-3.5 h-3.5" />
            <span>9-Mode Academic Paraphraser &amp; Tone Refiner</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Academic Rewriter &amp; Vocabulary Enhancer
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Restructure scholarly prose while strictly preserving citations, mathematical equations, and specialized nomenclature.
          </p>
        </div>

        <button
          onClick={handleParaphrase}
          disabled={isLoading || !inputText.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-sm transition"
        >
          {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>Paraphrase Prose</span>
        </button>
      </div>

      {/* Mode Selector & Safeguards */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-2">Selected Paraphrasing Mode</label>
          <div className="flex flex-wrap gap-1.5">
            {modes.map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  mode === m
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <span className="font-semibold text-slate-700">Integrity Safeguards:</span>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={preserveCitations}
              onChange={(e) => setPreserveCitations(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>Preserve Citations &amp; Quotes</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={preserveMath}
              onChange={(e) => setPreserveMath(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>Preserve LaTeX Equations</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={preserveTerminology}
              onChange={(e) => setPreserveTerminology(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>Preserve Nomenclature</span>
          </label>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Text Area */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">Original Academic Text</span>
              <span className="text-[10px] text-slate-400">({inputText.trim().split(/\s+/).filter(Boolean).length} words)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  setInputText(
                    'Deep neural networks are very good at image classification, but researchers found that they can easily be fooled by small changes called adversarial perturbations [Goodfellow et al., 2014]. In our study, we test defensive distillation with temperature scaling to see if edge microcontrollers can run without slowing down too much.'
                  )
                }
                className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded cursor-pointer"
              >
                Sample 1 (Citations)
              </button>
              <button
                type="button"
                onClick={() =>
                  setInputText(
                    'We formulate the empirical risk minimization objective as J(\\theta) = \\mathbb{E}[\\log P(y|x)] and penalize adversarial perturbations such that ||\\nabla_x J||_2 \\le \\epsilon. The protocol achieved 98.4% detection accuracy on edge devices with latency under 12ms.'
                  )
                }
                className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded cursor-pointer"
              >
                Sample 2 (Equations)
              </button>
            </div>
          </div>
          <textarea
            rows={12}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full flex-1 p-3 text-xs leading-relaxed text-slate-800 bg-slate-50/50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none font-mono"
            placeholder="Paste academic text, literature excerpt, or draft section here..."
          />
        </div>

        {/* Output Text Area */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">Paraphrased Output ({mode} Mode)</span>
              {result && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {result.readingEaseScore}
                </span>
              )}
            </div>
            {result && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-indigo-600"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 p-3 text-xs leading-relaxed text-slate-800 bg-slate-50/30 border border-slate-200 rounded-lg overflow-y-auto font-mono whitespace-pre-wrap min-h-[250px]">
            {result?.paraphrased || (
              <span className="text-slate-400 italic">
                Paraphrased academic output will render here with preserved citations and equations...
              </span>
            )}
          </div>

          {result && (
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Words Modified / Restructured:</span>
                <span className="font-bold text-slate-900">{result.wordsChanged} tokens</span>
              </div>
              <div className="text-[11px] text-slate-500">
                <strong>Academic Enhancements:</strong> {result.academicEnhancements.join('; ')}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
