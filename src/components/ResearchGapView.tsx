import React, { useState } from 'react';
import { Sparkles, RefreshCw, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Project, ResearchGapCategory, ResearchGapItem } from '../types';

interface ResearchGapViewProps {
  activeProject: Project | null;
}

export const ResearchGapView: React.FC<ResearchGapViewProps> = ({ activeProject }) => {
  const [topic, setTopic] = useState(
    activeProject?.title || 'Adversarial Robustness in Edge Industrial IoT Intrusion Detection'
  );
  const [domain, setDomain] = useState(activeProject?.domain || 'Cybersecurity / Machine Learning');
  const [isLoading, setIsLoading] = useState(false);
  const [gaps, setGaps] = useState<ResearchGapItem[]>([
    {
      id: 'gap-methodological',
      category: 'Methodological',
      existingResearch: 'Standard gradient-based adversarial training and defensive distillation.',
      limitations: 'High latency overhead and computational cost, preventing deployment on sub-watt microcontrollers.',
      unresolvedProblem: 'How to achieve adversarial robustness without prohibitive backpropagation cost on embedded nodes.',
      researchGap: 'Lack of single-pass spatial smoothing quantization that suppresses high-frequency attack gradients in real-time.',
      proposedQuestion: 'Can non-parametric spatial quantization filters provide equivalent adversarial margin to iterative PGD training?',
      proposedMethod: 'Develop a hybrid spatial quantization and temperature-scaled distillation operator.',
      expectedContribution: 'Reduces inferential latency by 68% while maintaining 92% classification accuracy under L_inf perturbation.',
    },
    {
      id: 'gap-dataset',
      category: 'Dataset',
      existingResearch: 'Static synthetic benchmarks (Ton_IoT, CICIDS2017, NSL-KDD).',
      limitations: 'Do not replicate non-stationary physical sensory noise or intermittent SCADA packet drops.',
      unresolvedProblem: 'Models trained on static benchmarks suffer from severe epistemic drift in operational factories.',
      researchGap: 'Absence of longitudinal continuous telemetry datasets with time-varying environmental noise.',
      proposedQuestion: 'How does seasonal thermal sensor drift correlate with false alarm rates in deep IDS architectures?',
      proposedMethod: 'Capture and publish an open-access 12-month continuous cyber-physical telemetry benchmark.',
      expectedContribution: 'Release of a new standardized benchmark for industrial cyber-physical resilience testing.',
    },
    {
      id: 'gap-evaluation',
      category: 'Evaluation',
      existingResearch: 'Standard F1-Score and Accuracy under zero-knowledge adversary assumptions.',
      limitations: 'Neglects inference energy per byte, battery life depletion, and worst-case tail latencies.',
      unresolvedProblem: 'High accuracy models drain sensor node batteries within 36 hours under active evasion barrage.',
      researchGap: 'Lack of multi-objective Pareto scoring integrating battery joules per adversarial sample thwarted.',
      proposedQuestion: 'What is the optimal Pareto balance between inference energy budget and empirical defense margin?',
      proposedMethod: 'Formulate an Energy-Accuracy-Robustness Index (EARI) for hardware certification.',
      expectedContribution: 'A validated evaluation framework accepted by IEEE cyber-physical testbeds.',
    },
  ]);

  const [contributions, setContributions] = useState<any[]>([
    {
      type: 'Defensive Architecture',
      title: 'Spatial-Temporal Distillation Operator (STDO)',
      description: 'Decoupling raw sensor telemetry noise from decision boundaries via spatial smoothing and student-teacher distillation.',
      potentialImpact: 'Provides first mathematically provable robustness guarantees for sub-watt microcontrollers.',
      verificationDisclaimer: 'Potentially novel contribution — requires literature verification.',
      targetBenchmarks: ['Edge-IIoTset 2024', 'SWaT'],
    },
  ]);

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const [gapRes, contribRes] = await Promise.all([
        fetch('/api/research/gap-finder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, domain }),
        }),
        fetch('/api/research/contributions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, domain }),
        }),
      ]);

      const gapData = await gapRes.json();
      const contribData = await contribRes.json();

      if (gapData.gaps) setGaps(gapData.gaps);
      if (contribData.contributions) setContributions(contribData.contributions);
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
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>9-Dimensional Research Gap &amp; Novelty Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Research Gap Discovery &amp; Novelty Formulation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Systematically traverse from existing literature limitations to unresolved problems, rigorous research questions, and expected scientific contributions.
          </p>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-sm transition"
        >
          {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>Discover Research Gaps &amp; Novelty</span>
        </button>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-xs">
        <div>
          <label className="font-semibold text-slate-700 block mb-1">Target Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:bg-white focus:outline-none"
          />
        </div>
        <div>
          <label className="font-semibold text-slate-700 block mb-1">Academic Domain</label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Proposed Novel Contributions Section */}
      {contributions.length > 0 && (
        <div className="bg-slate-900 rounded-xl p-5 text-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold tracking-tight">Proposed Unique Scientific Contributions</h2>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-semibold border border-amber-400/30">
              Potentially novel contribution — requires literature verification
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            {contributions.map((c, i) => (
              <div key={i} className="bg-slate-800/80 rounded-lg p-3.5 border border-slate-700 space-y-2 text-xs">
                <div className="text-[10px] uppercase font-bold text-cyan-400">{c.type}</div>
                <div className="font-bold text-slate-100">{c.title}</div>
                <p className="text-slate-300 text-[11px] leading-relaxed">{c.description}</p>
                <div className="pt-2 border-t border-slate-700/80 text-[10px] text-emerald-400 font-medium">
                  Impact: {c.potentialImpact}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9 Gap Dimensions Pipeline Cards */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900">
          Rigorous Gap Formulation Pipeline ({gaps.length} Active Categories)
        </h2>

        {gaps.map((g) => (
          <div key={g.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                {g.category} Gap
              </span>
              <span className="text-xs text-slate-400">Formal Research Formulation Protocol</span>
            </div>

            {/* Pipeline Visual Flow */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">1. Existing Research</div>
                <div className="text-slate-700">{g.existingResearch}</div>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">2. Limitations</div>
                <div className="text-slate-700">{g.limitations}</div>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">3. Unresolved Problem</div>
                <div className="text-slate-700">{g.unresolvedProblem}</div>
              </div>
              <div className="bg-amber-50/60 p-2.5 rounded-lg border border-amber-200">
                <div className="text-[10px] uppercase font-bold text-amber-700 mb-1">4. Research Gap</div>
                <div className="text-amber-900 font-semibold">{g.researchGap}</div>
              </div>
              <div className="bg-indigo-50/60 p-2.5 rounded-lg border border-indigo-200">
                <div className="text-[10px] uppercase font-bold text-indigo-700 mb-1">5. Research Question</div>
                <div className="text-indigo-950 font-medium">{g.proposedQuestion}</div>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">6. Proposed Method</div>
                <div className="text-slate-700">{g.proposedMethod}</div>
              </div>
              <div className="bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-200">
                <div className="text-[10px] uppercase font-bold text-emerald-700 mb-1">7. Expected Contribution</div>
                <div className="text-emerald-950 font-semibold">{g.expectedContribution}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
