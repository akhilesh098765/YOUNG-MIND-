import React, { useState } from 'react';
import { FileSearch, Sparkles, RefreshCw, Upload, Plus, Bookmark, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Project, ResearchSource } from '../types';

interface PdfAnalyzerViewProps {
  activeProject: Project | null;
  onAddSourceToProject: (source: ResearchSource) => void;
}

export const PdfAnalyzerView: React.FC<PdfAnalyzerViewProps> = ({
  activeProject,
  onAddSourceToProject,
}) => {
  const [paperTitle, setPaperTitle] = useState('Carlini-Wagner-Robustness-2017.pdf');
  const [paperText, setPaperText] = useState(
    `Title: Towards Evaluating the Robustness of Neural Networks\nAuthors: Nicholas Carlini and David Wagner\nPublished in: 2017 IEEE Symposium on Security and Privacy (SP)\n\nAbstract: Defensive distillation is a recently proposed approach that can take an existing neural network and shield it from adversarial examples. In this paper, we demonstrate that defensive distillation does not provide security against adversarial examples, even under a restricted adversary who only controls pixels within an L_infinity ball. We formulate three new attack algorithms under L_0, L_2, and L_infinity distance metrics that defeat defensive distillation with 100% success rate.\n\nMethodology: We formulate optimization objectives using custom box constraints and change-of-variables w = 1/2 (tanh(w) + 1). The objective function f(x + delta) measures the logit gap between the target adversarial class and the most likely alternative class.\n\nResults & Benchmarks: On MNIST and CIFAR-10, our L_2 attack finds adversarial examples with significantly smaller perturbation norms than FGSM or JSMA, reducing the defensive distillation accuracy from 95% to 0%.\n\nLimitations: The optimization runs via gradient descent iterations which require multiple forward and backward passes per image, incurring significant runtime computational latency.`
  );

  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [added, setAdded] = useState(false);

  const handleAnalyze = async () => {
    if (!paperText.trim()) return;
    setIsLoading(true);
    setAdded(false);

    try {
      const res = await fetch('/api/documents/analyze-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: paperTitle,
          text: paperText,
        }),
      });
      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToLibrary = () => {
    if (!analysis) return;
    const newSource: ResearchSource = {
      id: `src-${Date.now()}`,
      title: analysis.title || paperTitle,
      authors: 'Carlini & Wagner',
      year: 2017,
      doi: '10.1109/SP.2017.49',
      conference: 'IEEE Symposium on Security and Privacy',
      abstract: 'Demonstrates failure modes in defensive distillation through optimization-based adversarial formulations.',
      method: 'Box-constrained L0, L2, Linf optimization',
      dataset: 'MNIST and CIFAR-10',
      results: '100% attack success against defensive distillation',
      limitations: 'High computational cost of iterative optimization per sample',
      researchGap: 'Robustness validation on non-image time-series sensory telemetry',
      sourceOrigin: 'user_upload',
    };

    onAddSourceToProject(newSource);
    setAdded(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold mb-2">
            <FileSearch className="w-3.5 h-3.5" />
            <span>Scholarly PDF &amp; Document Ingestion Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Academic Document &amp; PDF Paper Analyzer
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Deconstruct published papers, extract methodology and benchmark metrics, detect scientific limitations, and index into your project library.
          </p>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={isLoading || !paperText.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-sm transition"
        >
          {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>Deconstruct &amp; Extract Paper</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Document Text / PDF Ingestion */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <label className="text-xs font-bold text-slate-900 block">Document / PDF Filename</label>
              <input
                type="text"
                value={paperTitle}
                onChange={(e) => setPaperTitle(e.target.value)}
                className="text-xs font-mono text-indigo-600 bg-transparent border-none p-0 focus:outline-none"
              />
            </div>
            <label className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-md text-xs font-semibold text-slate-700 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload PDF/Text</span>
              <input
                type="file"
                accept=".pdf,.txt,.md"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setPaperTitle(file.name);
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      if (ev.target?.result) {
                        setPaperText(ev.target.result as string);
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
              />
            </label>
          </div>

          <textarea
            rows={18}
            value={paperText}
            onChange={(e) => setPaperText(e.target.value)}
            className="w-full flex-1 p-3 text-xs leading-relaxed text-slate-800 font-mono bg-slate-50/50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none"
            placeholder="Paste text extracted from PDF or scholarly paper..."
          />
        </div>

        {/* Structured Deconstruction Output */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900">Extracted Scholarly Architecture</h2>
            {analysis && (
              <button
                onClick={handleAddToLibrary}
                disabled={added}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded transition shadow-xs"
              >
                {added ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{added ? 'Indexed into Library' : 'Save to Project Sources'}</span>
              </button>
            )}
          </div>

          {analysis ? (
            <div className="space-y-4 overflow-y-auto max-h-[580px] text-xs leading-relaxed text-slate-700 pr-1">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-900 mb-1">Executive Synthesis</div>
                <div className="text-slate-600 whitespace-pre-wrap">{analysis.summary}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200 space-y-1">
                  <div className="font-bold text-emerald-900">Methodological Strengths</div>
                  <ul className="list-disc pl-4 space-y-1 text-emerald-950 text-[11px]">
                    {analysis.strengths?.map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-rose-50/50 rounded-lg border border-rose-200 space-y-1">
                  <div className="font-bold text-rose-900">Identified Weaknesses</div>
                  <ul className="list-disc pl-4 space-y-1 text-rose-950 text-[11px]">
                    {analysis.weaknesses?.map((w: string, i: number) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-200 space-y-1">
                <div className="font-bold text-indigo-900">Formulated Research Gaps</div>
                <ul className="list-disc pl-4 space-y-1 text-indigo-950 text-[11px]">
                  {analysis.researchGaps?.map((g: string, i: number) => (
                    <li key={i}>{g}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-slate-900 text-slate-100 rounded-lg space-y-1 font-mono text-[11px]">
                <div className="text-slate-400 font-bold">Suggested BibTeX Entry</div>
                <pre className="text-emerald-400 overflow-x-auto">{analysis.citationInfo?.suggestedBib}</pre>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 space-y-2 my-auto">
              <FileSearch className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-xs font-semibold text-slate-700">No Document Deconstructed</div>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Paste the paper text or upload a PDF above and click &ldquo;Deconstruct &amp; Extract Paper&rdquo;.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
