import React, { useState } from 'react';
import { Bookmark, Sparkles, Table, RefreshCw, CheckCircle2, Download, Plus, Trash2 } from 'lucide-react';
import { LiteratureMatrixRow, Project, ReviewPaperParams } from '../types';

interface ReviewPaperViewProps {
  activeProject: Project | null;
}

export const ReviewPaperView: React.FC<ReviewPaperViewProps> = ({ activeProject }) => {
  const [params, setParams] = useState<ReviewPaperParams>({
    topic: 'Adversarial Attacks and Defensive Distillation in Industrial Cyber-Physical Systems',
    domain: 'Computer Science / Cybersecurity',
    scope: 'Systematic survey of attack topologies and defense models from 2017 to 2026',
    themes: '1. Gradient-based adversarial evasion; 2. Model poisoning; 3. Defensive distillation and spatial smoothing; 4. Hardware-aware micro-benchmarks.',
    targetConference: 'ACM Computing Surveys / IEEE Communications Surveys & Tutorials',
    citationStyle: 'IEEE',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [matrix, setMatrix] = useState<LiteratureMatrixRow[]>([
    {
      paper: 'Carlini & Wagner',
      year: '2017',
      method: 'L0, L2, Linf Optimization Attacks',
      dataset: 'MNIST, CIFAR-10',
      results: '100% attack success against defensive distillation',
      limitations: 'Computationally prohibitive for online real-time stream perturbation',
      researchGap: 'Robustness validation on non-image time-series sensory telemetry',
    },
    {
      paper: 'Papernot et al.',
      year: '2016',
      method: 'Defensive Distillation with Softmax Temperature',
      dataset: 'MNIST, CIFAR-10',
      results: 'Reduced gradient sensitivity from 10^14 to zero at T=100',
      limitations: 'Vulnerable to non-gradient optimization and high confidence logits',
      researchGap: 'Absence of spatial frequency noise dampening in edge topologies',
    },
    {
      paper: 'Al-Hawawreh et al.',
      year: '2024',
      method: 'Edge-IIoTset Deep Learning Intrusion Detection',
      dataset: 'Edge-IIoTset 2023',
      results: '98.7% multi-class accuracy across 14 attack vectors',
      limitations: 'High latency (48ms) exceeds SCADA 10ms hard realtime budget',
      researchGap: 'Ultra-low latency student-teacher distilled micro-architectures',
    },
  ]);

  const [synthesizedContent, setSynthesizedContent] = useState<string>('');
  const [newRow, setNewRow] = useState<LiteratureMatrixRow>({
    paper: '',
    year: '2025',
    method: '',
    dataset: '',
    results: '',
    limitations: '',
    researchGap: '',
  });

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/research/review-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (data.rawContent) {
        setSynthesizedContent(data.rawContent);
      }
      if (data.matrix && data.matrix.length > 0) {
        setMatrix(data.matrix);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const addRow = () => {
    if (!newRow.paper) return;
    setMatrix([...matrix, newRow]);
    setNewRow({
      paper: '',
      year: '2025',
      method: '',
      dataset: '',
      results: '',
      limitations: '',
      researchGap: '',
    });
  };

  const removeRow = (index: number) => {
    setMatrix(matrix.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold mb-2">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Literature Survey &amp; Systematic Review</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Review Paper Generator &amp; Comparative Matrix
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Produce rigorous thematic surveys, PRISMA search protocols, and systematic comparative tables across literature corpuses.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-sm transition"
        >
          {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>Synthesize Survey &amp; Matrix</span>
        </button>
      </div>

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-xs">
        <div>
          <label className="font-semibold text-slate-700 block mb-1">Survey Topic</label>
          <input
            type="text"
            value={params.topic}
            onChange={(e) => setParams({ ...params, topic: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="font-semibold text-slate-700 block mb-1">Target Journal / Review Outlet</label>
          <input
            type="text"
            value={params.targetConference}
            onChange={(e) => setParams({ ...params, targetConference: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="font-semibold text-slate-700 block mb-1">Systematic Search Scope &amp; Protocol</label>
          <textarea
            rows={2}
            value={params.scope}
            onChange={(e) => setParams({ ...params, scope: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="font-semibold text-slate-700 block mb-1">Thematic Classification Dimensions</label>
          <textarea
            rows={2}
            value={params.themes}
            onChange={(e) => setParams({ ...params, themes: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Systematic 7-Column Comparative Literature Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Systematic Literature Matrix (Paper | Year | Method | Dataset | Results | Limitations | Research Gap)
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-semibold">{matrix.length} Entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-semibold">
                <th className="p-3 w-32">Paper / Author</th>
                <th className="p-3 w-16">Year</th>
                <th className="p-3 w-40">Method</th>
                <th className="p-3 w-32">Dataset</th>
                <th className="p-3 w-44">Key Results</th>
                <th className="p-3 w-48">Limitations</th>
                <th className="p-3 w-48">Research Gap</th>
                <th className="p-3 w-12 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-600">
              {matrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition">
                  <td className="p-3 font-semibold text-slate-900">{row.paper}</td>
                  <td className="p-3">{row.year}</td>
                  <td className="p-3 font-mono text-[11px]">{row.method}</td>
                  <td className="p-3">{row.dataset}</td>
                  <td className="p-3">{row.results}</td>
                  <td className="p-3 text-amber-800 bg-amber-50/30">{row.limitations}</td>
                  <td className="p-3 text-indigo-800 bg-indigo-50/30">{row.researchGap}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => removeRow(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {/* Add Row Form */}
              <tr className="bg-slate-50/40">
                <td className="p-2">
                  <input
                    type="text"
                    placeholder="Author et al."
                    value={newRow.paper}
                    onChange={(e) => setNewRow({ ...newRow, paper: e.target.value })}
                    className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    placeholder="Year"
                    value={newRow.year}
                    onChange={(e) => setNewRow({ ...newRow, year: e.target.value })}
                    className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    placeholder="Methodology"
                    value={newRow.method}
                    onChange={(e) => setNewRow({ ...newRow, method: e.target.value })}
                    className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    placeholder="Benchmark"
                    value={newRow.dataset}
                    onChange={(e) => setNewRow({ ...newRow, dataset: e.target.value })}
                    className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    placeholder="Reported Metric"
                    value={newRow.results}
                    onChange={(e) => setNewRow({ ...newRow, results: e.target.value })}
                    className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    placeholder="Stated Flaws"
                    value={newRow.limitations}
                    onChange={(e) => setNewRow({ ...newRow, limitations: e.target.value })}
                    className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    placeholder="Unresolved Gap"
                    value={newRow.researchGap}
                    onChange={(e) => setNewRow({ ...newRow, researchGap: e.target.value })}
                    className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white"
                  />
                </td>
                <td className="p-2 text-center">
                  <button
                    onClick={addRow}
                    disabled={!newRow.paper}
                    className="p-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded transition shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Synthesized Review Paper Content */}
      {synthesizedContent && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Synthesized Survey Text &amp; Thematic Analysis</h3>
            <span className="text-xs text-slate-400 font-medium">Ready for publication formatting</span>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-relaxed text-slate-800 font-mono whitespace-pre-wrap max-h-[500px] overflow-y-auto">
            {synthesizedContent}
          </div>
        </div>
      )}
    </div>
  );
};
