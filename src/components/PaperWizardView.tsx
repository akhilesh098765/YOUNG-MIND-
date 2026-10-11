import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Send,
  Save,
  ChevronRight,
  RefreshCw,
  BookOpen,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { CitationStyle, PaperSection, Project, ResearchPaperParams } from '../types';

interface PaperWizardViewProps {
  activeProject: Project | null;
  onSaveToProject: (sections: PaperSection[]) => void;
  onNavigateToEditor: () => void;
}

export const PaperWizardView: React.FC<PaperWizardViewProps> = ({
  activeProject,
  onSaveToProject,
  onNavigateToEditor,
}) => {
  const [params, setParams] = useState<ResearchPaperParams>({
    topic: activeProject?.title || 'Adversarial Robustness in Deep Neural Networks for Industrial IoT Intrusion Detection',
    domain: activeProject?.domain || 'Artificial Intelligence in Cybersecurity',
    problem: 'Industrial edge microcontrollers fail under gradient-based evasion noise (PGD/FGSM) and cannot afford high-latency adversarial training.',
    objectives: 'Design a low-overhead defensive distillation protocol with spatial quantization that preserves real-time response (<10ms).',
    methodology: 'Dual-phase student-teacher temperature scaling distillation paired with pseudo-random spatial smoothing filters.',
    targetJournal: 'IEEE Transactions on Information Forensics and Security',
    wordCount: 4500,
    citationStyle: 'IEEE',
    referencesCount: 25,
    yearRange: '2020-2026',
    keywords: 'Industrial IoT, Intrusion Detection, Adversarial Machine Learning, Defensive Distillation, Edge AI',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [sections, setSections] = useState<PaperSection[]>(activeProject?.documents[0]?.sections || []);
  const [activeSectionId, setActiveSectionId] = useState<string>(sections[0]?.id || '');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleGenerate = async () => {
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/research/paper-wizard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          projectId: activeProject?.id,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate paper from server.');
      }

      const data = await res.json();
      if (data.sections && data.sections.length > 0) {
        setSections(data.sections);
        setActiveSectionId(data.sections[0].id);
        onSaveToProject(data.sections);
        setSuccessMsg(`Successfully synthesized ${data.sections.length} publication-grade sections.`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error executing generation request.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentSection = sections.find((s) => s.id === activeSectionId) || sections[0];

  const updateCurrentSectionContent = (newContent: string) => {
    if (!currentSection) return;
    const updated = sections.map((s) => (s.id === currentSection.id ? { ...s, content: newContent } : s));
    setSections(updated);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 font-sans">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>20-Section Research Paper Wizard</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Research Paper Generation &amp; Structuring
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Formulate comprehensive, publication-ready research manuscripts with rigorous experimental safeguards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {sections.length > 0 && (
            <>
              <button
                onClick={() => {
                  onSaveToProject(sections);
                  setSuccessMsg('Paper saved to project workspace.');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Sections</span>
              </button>
              <button
                onClick={onNavigateToEditor}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition shadow-sm"
              >
                <span>Open in Document Editor</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-lg text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-700 hover:text-emerald-950 text-xs font-bold">Dismiss</button>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-2.5 rounded-lg text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Specification Form */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Manuscript Parameters</h2>
            <span className="text-[11px] text-slate-400">Targeting {params.targetJournal.split(' ')[0]}</span>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quick Academic Presets:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() =>
                  setParams({
                    topic: 'Adversarial Robustness in Deep Neural Networks for Industrial IoT Intrusion Detection',
                    domain: 'Artificial Intelligence in Cybersecurity',
                    problem: 'Industrial edge microcontrollers fail under gradient-based evasion noise (PGD/FGSM) and cannot afford high-latency adversarial training.',
                    objectives: 'Design a low-overhead defensive distillation protocol with spatial quantization that preserves real-time response (<10ms).',
                    methodology: 'Dual-phase student-teacher temperature scaling distillation paired with pseudo-random spatial smoothing filters.',
                    targetJournal: 'IEEE Transactions on Information Forensics and Security',
                    wordCount: 4500,
                    citationStyle: 'IEEE',
                    referencesCount: 25,
                    yearRange: '2020-2026',
                    keywords: 'Industrial IoT, Intrusion Detection, Adversarial Machine Learning, Defensive Distillation, Edge AI',
                  })
                }
                className="px-2 py-1 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-[11px] font-medium text-slate-600 transition cursor-pointer"
              >
                IoT Security
              </button>
              <button
                type="button"
                onClick={() =>
                  setParams({
                    topic: 'Hallucination Mitigation in Large Language Models for Clinical Oncology Diagnostic Triage',
                    domain: 'Biomedical Informatics & Natural Language Processing',
                    problem: 'Foundation models produce non-grounded clinical citations and pharmacological counter-indications under ambiguous patient symptom histories.',
                    objectives: 'Develop an agentic retrieval-augmented verification loop referencing PubMed Central and MeSH knowledge graphs.',
                    methodology: 'Dual-encoder dense passage retrieval with constrained decoding and knowledge-graph entity grounding.',
                    targetJournal: 'Lancet Digital Health / Nature Medicine',
                    wordCount: 5000,
                    citationStyle: 'Vancouver',
                    referencesCount: 30,
                    yearRange: '2021-2026',
                    keywords: 'Clinical NLP, Retrieval-Augmented Generation, Medical Hallucinations, Oncology Triage',
                  })
                }
                className="px-2 py-1 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-[11px] font-medium text-slate-600 transition cursor-pointer"
              >
                Clinical NLP
              </button>
              <button
                type="button"
                onClick={() =>
                  setParams({
                    topic: 'Deep Reinforcement Learning for Adaptive Frequency Regulation in Islanded Renewable Microgrids',
                    domain: 'Electrical Power Engineering & Clean Energy',
                    problem: 'High solar/wind penetration causes inertia deficit and rapid frequency deviations that classical PID controllers fail to stabilize.',
                    objectives: 'Formulate an actor-critic proximal policy optimization controller for battery storage dispatch during transient events.',
                    methodology: 'Markov Decision Process formulation on IEEE 33-bus radial distribution network with real-time OPAL-RT simulation.',
                    targetJournal: 'IEEE Transactions on Smart Grid',
                    wordCount: 4200,
                    citationStyle: 'IEEE',
                    referencesCount: 22,
                    yearRange: '2020-2026',
                    keywords: 'Smart Grids, Microgrids, Deep Reinforcement Learning, Frequency Stability, Battery Energy Storage',
                  })
                }
                className="px-2 py-1 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-[11px] font-medium text-slate-600 transition cursor-pointer"
              >
                Smart Grids
              </button>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Research Topic</label>
              <input
                type="text"
                value={params.topic}
                onChange={(e) => setParams({ ...params, topic: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                placeholder="e.g. Adversarial Robustness in IIoT"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Academic Domain</label>
                <input
                  type="text"
                  value={params.domain}
                  onChange={(e) => setParams({ ...params, domain: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Citation Style</label>
                <select
                  value={params.citationStyle}
                  onChange={(e) => setParams({ ...params, citationStyle: e.target.value as CitationStyle })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="IEEE">IEEE</option>
                  <option value="APA 7">APA 7</option>
                  <option value="MLA">MLA</option>
                  <option value="Chicago">Chicago</option>
                  <option value="Harvard">Harvard</option>
                  <option value="Vancouver">Vancouver</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Target Journal / Conference</label>
              <input
                type="text"
                value={params.targetJournal}
                onChange={(e) => setParams({ ...params, targetJournal: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Research Problem Statement</label>
              <textarea
                rows={2}
                value={params.problem}
                onChange={(e) => setParams({ ...params, problem: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Research Objectives</label>
              <textarea
                rows={2}
                value={params.objectives}
                onChange={(e) => setParams({ ...params, objectives: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Proposed Methodology</label>
              <textarea
                rows={2}
                value={params.methodology}
                onChange={(e) => setParams({ ...params, methodology: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Words</label>
                <input
                  type="number"
                  value={params.wordCount}
                  onChange={(e) => setParams({ ...params, wordCount: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">References</label>
                <input
                  type="number"
                  value={params.referencesCount}
                  onChange={(e) => setParams({ ...params, referencesCount: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Year Range</label>
                <input
                  type="text"
                  value={params.yearRange}
                  onChange={(e) => setParams({ ...params, yearRange: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Keywords</label>
              <input
                type="text"
                value={params.keywords}
                onChange={(e) => setParams({ ...params, keywords: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Academic Sections...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Synthesize 20 Paper Sections</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Sections Navigation & Editor Preview */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
          {sections.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 space-y-3">
              <FileText className="w-12 h-12 text-slate-300 stroke-[1.5]" />
              <div className="text-base font-semibold text-slate-700">No Sections Generated Yet</div>
              <p className="text-xs max-w-md text-slate-500 leading-relaxed">
                Configure your manuscript parameters on the left and click &ldquo;Synthesize 20 Paper Sections&rdquo; to build your structured academic paper.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 flex-1">
              {/* Sections Sidebar */}
              <div className="md:col-span-4 border-r border-slate-200 bg-slate-50/50 p-3 overflow-y-auto max-h-[700px] space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-2 py-1 mb-1">
                  Manuscript Sections ({sections.length})
                </div>
                {sections.map((sec, idx) => {
                  const isSelected = sec.id === activeSectionId;
                  const isHypo = sec.isHypothetical || sec.title.toLowerCase().includes('expected') || sec.title.toLowerCase().includes('proposed results');
                  return (
                    <button
                      key={sec.id}
                      onClick={() => setActiveSectionId(sec.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition flex items-center justify-between group ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-700 hover:bg-slate-200/70'
                      }`}
                    >
                      <span className="truncate pr-2">
                        {idx + 1}. {sec.title.replace(/^###\s*/, '')}
                      </span>
                      {isHypo && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${isSelected ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-800'}`}>
                          Expected
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Section Preview & In-line Editor */}
              <div className="md:col-span-8 p-5 flex flex-col space-y-3">
                {currentSection && (
                  <>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">
                          {currentSection.title.replace(/^###\s*/, '')}
                        </h3>
                        <span className="text-[11px] text-slate-400">
                          {currentSection.content.split(/\s+/).filter(Boolean).length} words
                        </span>
                      </div>
                      {currentSection.isHypothetical && (
                        <div className="flex items-center gap-1 text-[11px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-medium">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Proposed / Expected Result Benchmark</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col">
                      <textarea
                        value={currentSection.content}
                        onChange={(e) => updateCurrentSectionContent(e.target.value)}
                        className="w-full flex-1 min-h-[440px] p-3 text-xs leading-relaxed text-slate-800 font-mono bg-slate-50/40 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
