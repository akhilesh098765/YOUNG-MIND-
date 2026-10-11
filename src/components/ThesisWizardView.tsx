import React, { useState } from 'react';
import { Award, Sparkles, RefreshCw, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { Project, ThesisParams } from '../types';

interface ThesisWizardViewProps {
  activeProject: Project | null;
}

export const ThesisWizardView: React.FC<ThesisWizardViewProps> = ({ activeProject }) => {
  const [params, setParams] = useState<ThesisParams>({
    title: 'Adversarial Machine Learning Architectures for Intrusion Detection in Industrial IoT Environments',
    degreeLevel: 'PhD',
    institution: 'National Institute of Technology',
    department: 'Department of Computer Science and Engineering',
    candidateName: 'Akhilesh Kumar',
    advisorName: 'Dr. S. K. Bhattacharya, Professor & Fellow IEEE',
    submissionDate: 'April 2026',
    domain: 'Computer Science & Cyber-Physical Systems',
    abstractSummary: 'This doctoral thesis investigates adversarial perturbation resilience across resource-constrained SCADA microcontrollers and IIoT gateways.',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [thesisSections, setThesisSections] = useState<any[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<string>('');

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/research/thesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (data.sections) {
        setThesisSections(data.sections);
        setActiveSectionId(data.sections[0]?.id || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const currentSection = thesisSections.find((s) => s.id === activeSectionId) || thesisSections[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>PhD Dissertation &amp; Master&apos;s Thesis Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Thesis &amp; Dissertation Structural Generator
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Produce certified doctoral and master&apos;s degree dissertations with formal certificates, declarations, and Chapter 1 through 7 layouts.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-sm transition"
        >
          {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>Generate Complete Thesis Architecture</span>
        </button>
      </div>

      {/* Degree & Institutional Specifications */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-xs">
        <div className="sm:col-span-2">
          <label className="font-semibold text-slate-700 block mb-1">Thesis Title</label>
          <input
            type="text"
            value={params.title}
            onChange={(e) => setParams({ ...params, title: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:bg-white focus:outline-none"
          />
        </div>
        <div>
          <label className="font-semibold text-slate-700 block mb-1">Degree Level</label>
          <select
            value={params.degreeLevel}
            onChange={(e) => setParams({ ...params, degreeLevel: e.target.value as any })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:bg-white focus:outline-none"
          >
            <option value="PhD">Ph.D. Dissertation</option>
            <option value="M.Tech">M.Tech Thesis</option>
            <option value="Master of Science">Master of Science (M.S.) Thesis</option>
            <option value="Undergraduate">Undergraduate Capstone Report</option>
          </select>
        </div>
        <div>
          <label className="font-semibold text-slate-700 block mb-1">Candidate Name</label>
          <input
            type="text"
            value={params.candidateName}
            onChange={(e) => setParams({ ...params, candidateName: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:bg-white focus:outline-none"
          />
        </div>
        <div>
          <label className="font-semibold text-slate-700 block mb-1">Institution</label>
          <input
            type="text"
            value={params.institution}
            onChange={(e) => setParams({ ...params, institution: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:bg-white focus:outline-none"
          />
        </div>
        <div>
          <label className="font-semibold text-slate-700 block mb-1">Department</label>
          <input
            type="text"
            value={params.department}
            onChange={(e) => setParams({ ...params, department: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:bg-white focus:outline-none"
          />
        </div>
        <div>
          <label className="font-semibold text-slate-700 block mb-1">Research Advisor</label>
          <input
            type="text"
            value={params.advisorName}
            onChange={(e) => setParams({ ...params, advisorName: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:bg-white focus:outline-none"
          />
        </div>
        <div>
          <label className="font-semibold text-slate-700 block mb-1">Submission Date</label>
          <input
            type="text"
            value={params.submissionDate}
            onChange={(e) => setParams({ ...params, submissionDate: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Output Sections */}
      {thesisSections.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px]">
          <div className="lg:col-span-4 border-r border-slate-200 bg-slate-50/50 p-3 space-y-1 overflow-y-auto max-h-[700px]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
              Dissertation Hierarchy
            </div>
            {thesisSections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveSectionId(sec.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                  activeSectionId === sec.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                <span className="truncate pr-2">{sec.title}</span>
                {sec.isHypothetical && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 font-bold uppercase">
                    Expected
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="lg:col-span-8 p-5 flex flex-col space-y-3">
            {currentSection && (
              <>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-bold text-slate-900 text-sm">{currentSection.title}</h3>
                  {currentSection.isHypothetical && (
                    <div className="flex items-center gap-1 text-[11px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Academic Disclosure: Proposed / Expected Results</span>
                    </div>
                  )}
                </div>
                <textarea
                  value={currentSection.content}
                  onChange={(e) => {
                    const val = e.target.value;
                    setThesisSections(
                      thesisSections.map((s) => (s.id === currentSection.id ? { ...s, content: val } : s))
                    );
                  }}
                  className="w-full flex-1 min-h-[460px] p-3 text-xs leading-relaxed font-mono bg-slate-50/50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
          <Award className="w-12 h-12 text-slate-300 mx-auto" />
          <div className="text-sm font-semibold text-slate-700">No Thesis Skeletons Active</div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click &ldquo;Generate Complete Thesis Architecture&rdquo; to build your certificate, declaration, and 7 dissertation chapters.
          </p>
        </div>
      )}
    </div>
  );
};
