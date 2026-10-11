import React, { useState } from 'react';
import { Search, ShieldAlert, CheckCircle2, AlertTriangle, RefreshCw, ExternalLink, Info } from 'lucide-react';
import { PlagiarismReport } from '../types';

export const PlagiarismView: React.FC = () => {
  const [text, setText] = useState(
    'Deep neural networks have achieved state-of-the-art results across diverse computer vision benchmarks. However, recent evaluations demonstrate vulnerability against adversarial attacks. Carlini and Wagner proposed optimization-based formulations that bypassed defensive distillation with high success rates.'
  );
  const [mode, setMode] = useState<'internal' | 'web' | 'hybrid'>('hybrid');
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<PlagiarismReport | null>(null);

  const handleScan = async () => {
    if (!text.trim()) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/plagiarism/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, mode }),
      });
      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
            <Search className="w-3.5 h-3.5" />
            <span>Dual-Engine Similarity Scanner</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Plagiarism &amp; Similarity Analysis
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit manuscript drafts against internal document vector indices and open scholarly repository baselines.
          </p>
        </div>

        <button
          onClick={handleScan}
          disabled={isLoading || !text.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-sm transition"
        >
          {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          <span>Run Similarity Audit</span>
        </button>
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="block font-bold mb-0.5">Authoritative Institutional Notice:</strong>
          This scan provides an algorithmic similarity estimate based on n-gram token overlap, TF-IDF vector comparisons, and publicly crawled open-access scholarly databases. It is not an official Turnitin or iThenticate report and cannot substitute for university-mandated checks.
        </div>
      </div>

      {/* Mode Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-slate-700">Scan Scope:</span>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="scanMode"
              checked={mode === 'hybrid'}
              onChange={() => setMode('hybrid')}
              className="text-indigo-600"
            />
            <span>Hybrid (Internal Library + Web Repositories)</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="scanMode"
              checked={mode === 'internal'}
              onChange={() => setMode('internal')}
              className="text-indigo-600"
            />
            <span>Mode A: Internal Workspace Library</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="scanMode"
              checked={mode === 'web'}
              onChange={() => setMode('web')}
              className="text-indigo-600"
            />
            <span>Mode B: Public Scholarly Web</span>
          </label>
        </div>
      </div>

      {/* Input & Report Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-900">Manuscript Passage to Verify</span>
            <span className="text-[11px] text-slate-400">
              {text.trim().split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
          <textarea
            rows={14}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full flex-1 p-3 text-xs leading-relaxed text-slate-800 bg-slate-50/50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none font-mono"
            placeholder="Paste complete paper section, literature review, or thesis abstract..."
          />
        </div>

        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Similarity Metric Summary</h2>
            <p className="text-xs text-slate-400">Acceptable institutional threshold is &le;15.0%</p>
          </div>

          {report ? (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                report.overallSimilarity <= 15
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}>
                <div>
                  <div className="text-3xl font-extrabold">{report.overallSimilarity}%</div>
                  <div className="text-xs font-semibold mt-0.5">
                    {report.overallSimilarity <= 15 ? 'Within Acceptable Range (<=15%)' : 'Exceeds Typical Threshold'}
                  </div>
                </div>
                <div className="p-3 bg-white rounded-xl shadow-xs">
                  {report.overallSimilarity <= 15 ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  ) : (
                    <ShieldAlert className="w-8 h-8 text-rose-600" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div className="text-slate-400">Checked Tokens</div>
                  <div className="font-bold text-slate-800 mt-0.5">{report.checkedWordsCount} words</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div className="text-slate-400">Matched Passages</div>
                  <div className="font-bold text-slate-800 mt-0.5">{report.matchedSourcesCount} detected</div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-800 mb-2">Matched Passages &amp; Citations:</h3>
                {report.matches.length === 0 ? (
                  <div className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-200">
                    No significant overlapping phrases detected against active indices.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
                    {report.matches.map((m, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-indigo-600 truncate max-w-[200px]">{m.matchedSource}</span>
                          <span className="font-semibold text-rose-600">{m.similarityPercentage}% overlap</span>
                        </div>
                        <p className="text-slate-600 italic text-[11px]">&ldquo;{m.passage}&rdquo;</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs space-y-2">
              <Search className="w-8 h-8 text-slate-300 mx-auto" />
              <div>Ready to analyze text for similarity</div>
              <p className="text-[11px] text-slate-400">Click &ldquo;Run Similarity Audit&rdquo; to execute.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
