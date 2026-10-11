import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Save,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Trash2,
  ChevronRight,
  ShieldCheck,
  Award,
  Layers,
  HelpCircle,
  Copy,
  Sliders,
  History,
} from 'lucide-react';
import { PaperSection, Project } from '../types';

interface AcademicEditorViewProps {
  activeProject: Project | null;
  onUpdateSection: (section: PaperSection) => void;
  onAddSection: (section: PaperSection) => void;
}

export const AcademicEditorView: React.FC<AcademicEditorViewProps> = ({
  activeProject,
  onUpdateSection,
  onAddSection,
}) => {
  const defaultSections: PaperSection[] = activeProject?.documents[0]?.sections || [
    {
      id: 'sec-1',
      title: '1. Introduction & Research Motivation',
      content: `### 1. Introduction\nThe escalation of automated cyber threats targeting Industrial Internet of Things (IIoT) infrastructure has exposed severe vulnerabilities in conventional parameterizations. Although deep neural networks achieve high baseline intrusion classification accuracy, their underlying loss landscapes are inherently vulnerable to adversarial evasion perturbations [1]. Under hard real-time latency deadlines (<10ms per packet), existing iterative defense algorithms (e.g. Projected Gradient Descent training) are computationally intractable on edge microcontrollers.`,
      status: 'completed',
    },
    {
      id: 'sec-2',
      title: '2. Proposed Methodology',
      content: `### 2. Proposed Methodology\nWe formulate a dual-phase defense combining spatial telemetry quantization with temperature-scaled student-teacher defensive distillation. By mapping raw sensory continuous vectors into discrete bounded topological bins, high-frequency gradient noise introduced by evasion adversaries is dampened prior to logit calculation.`,
      status: 'draft',
    },
  ];

  const [sections, setSections] = useState<PaperSection[]>(defaultSections);
  const [activeId, setActiveId] = useState<string>(defaultSections[0]?.id || '');
  const [isLoading, setIsLoading] = useState(false);
  const [qualityReport, setQualityReport] = useState<any | null>(null);
  const [activeAiAction, setActiveAiAction] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string>('All changes saved');

  const currentSection = sections.find((s) => s.id === activeId) || sections[0];

  const handleUpdateContent = (content: string) => {
    if (!currentSection) return;
    const updated: PaperSection = {
      ...currentSection,
      content,
      status: 'reviewed',
    };
    setSections(sections.map((s) => (s.id === currentSection.id ? updated : s)));
    onUpdateSection(updated);
    setSaveStatus('Saving changes...');
    setTimeout(() => setSaveStatus('All changes saved'), 600);
  };

  const handleRunAiAction = async (action: string) => {
    if (!currentSection) return;
    setIsLoading(true);
    setActiveAiAction(action);

    try {
      if (action === 'quality') {
        const res = await fetch('/api/documents/quality-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: currentSection.content }),
        });
        const data = await res.json();
        setQualityReport(data);
      } else {
        let promptText = '';
        if (action === 'academic') {
          promptText = `Elevate this text to prestigious journal academic register:\n${currentSection.content}`;
        } else if (action === 'concise') {
          promptText = `Make this academic section highly concise while preserving all mathematical assertions and claims:\n${currentSection.content}`;
        } else if (action === 'expand') {
          promptText = `Expand this section with rigorous academic context, theoretical backing, and formal derivations:\n${currentSection.content}`;
        } else if (action === 'citations') {
          promptText = `Add appropriate scholarly citation placeholders [X] and peer-reviewed bibliographic framing to this text:\n${currentSection.content}`;
        } else {
          promptText = `Rewrite this section to improve flow and structural clarity:\n${currentSection.content}`;
        }

        const res = await fetch('/api/paraphrase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: currentSection.content, mode: 'Academic' }),
        });
        const data = await res.json();
        if (data.paraphrased) {
          handleUpdateContent(data.paraphrased);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setActiveAiAction(null);
    }
  };

  const addNewSection = () => {
    const newSec: PaperSection = {
      id: `sec-${Date.now()}`,
      title: `Section ${sections.length + 1}`,
      content: `### Section ${sections.length + 1}\nEnter section content here...`,
      status: 'draft',
    };
    setSections([...sections, newSec]);
    setActiveId(newSec.id);
    onAddSection(newSec);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Academic Document Studio</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Academic Document Editor &amp; Writing Assistant
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Section-wise scholarly composing with real-time quality heuristics, citation anchors, and LaTeX formatting.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium">{saveStatus}</span>
          <button
            onClick={addNewSection}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Section</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sections Navigator */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-2 max-h-[720px] overflow-y-auto">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 pb-1 border-b border-slate-100">
            Document Outline ({sections.length})
          </div>

          {sections.map((sec, idx) => {
            const isSelected = sec.id === activeId;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveId(sec.id)}
                className={`w-full text-left p-2.5 rounded-lg text-xs transition border flex flex-col gap-1 ${
                  isSelected
                    ? 'bg-indigo-50/90 border-indigo-300 text-indigo-950 font-semibold shadow-xs'
                    : 'border-transparent hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="truncate pr-1">{sec.title.replace(/^###\s*/, '')}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                    sec.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : sec.status === 'reviewed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {sec.status}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal">
                  {sec.content.split(/\s+/).filter(Boolean).length} words
                </span>
              </button>
            );
          })}
        </div>

        {/* Editor Main Canvas */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col min-h-[620px]">
          {currentSection && (
            <>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <input
                  type="text"
                  value={currentSection.title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    const updated = { ...currentSection, title: newTitle };
                    setSections(sections.map((s) => (s.id === currentSection.id ? updated : s)));
                  }}
                  className="font-bold text-sm text-slate-900 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1 py-0.5 w-2/3"
                />

                <div className="flex items-center gap-2">
                  <select
                    value={currentSection.status}
                    onChange={(e) => {
                      const updated = { ...currentSection, status: e.target.value as any };
                      setSections(sections.map((s) => (s.id === currentSection.id ? updated : s)));
                    }}
                    className="text-[11px] bg-slate-100 border border-slate-200 rounded px-2 py-1 font-medium text-slate-700"
                  >
                    <option value="draft">Draft</option>
                    <option value="reviewed">In Review</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex items-center gap-1.5 py-1.5 border-b border-slate-100 text-xs text-slate-600 flex-wrap">
                <button
                  onClick={() => handleUpdateContent(`${currentSection.content}\n\n### Subheading\n`)}
                  className="px-2 py-0.5 rounded hover:bg-slate-100 font-bold"
                  title="Insert Subheading"
                >
                  H3
                </button>
                <button
                  onClick={() => handleUpdateContent(`${currentSection.content}\n\n**Key Finding**: `)}
                  className="px-2 py-0.5 rounded hover:bg-slate-100 font-bold"
                  title="Bold Assertion"
                >
                  B
                </button>
                <button
                  onClick={() => handleUpdateContent(`${currentSection.content}\n\n$$\\mathcal{L}_{total} = \\alpha \\mathcal{L}_{CE} + \\beta \\mathcal{L}_{distill}$$\n`)}
                  className="px-2 py-0.5 rounded hover:bg-slate-100 font-mono text-indigo-600"
                  title="Insert LaTeX Math"
                >
                  $$f(x)$$
                </button>
                <button
                  onClick={() => handleUpdateContent(`${currentSection.content} [1]`)}
                  className="px-2 py-0.5 rounded hover:bg-slate-100 font-mono text-emerald-600"
                  title="Insert Citation Reference"
                >
                  [Cit]
                </button>
                <button
                  onClick={() => handleUpdateContent(`${currentSection.content}\n\n| Model | Accuracy | Latency |\n| :--- | :---: | :---: |\n| Baseline | 88.2% | 14ms |\n| Proposed | 94.1% | 8ms |\n`)}
                  className="px-2 py-0.5 rounded hover:bg-slate-100 text-slate-700"
                  title="Insert Table"
                >
                  Table
                </button>
              </div>

              <textarea
                value={currentSection.content}
                onChange={(e) => handleUpdateContent(e.target.value)}
                className="w-full flex-1 p-3 text-xs leading-relaxed text-slate-800 font-mono bg-slate-50/40 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none"
              />
            </>
          )}
        </div>

        {/* AI Assistant Sidebar */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-4 text-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2 font-bold text-slate-900">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI Research Assistant</span>
          </div>

          <div className="space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-slate-400">Section Transformations</div>
            {[
              { id: 'academic', label: 'Make More Academic', desc: 'Formal vocabulary and passive register' },
              { id: 'concise', label: 'Make More Concise', desc: 'Prune filler, tighten assertions' },
              { id: 'expand', label: 'Expand Section', desc: 'Add literature and mathematical framing' },
              { id: 'citations', label: 'Ground with Citations', desc: 'Insert scholarly reference markers' },
              { id: 'quality', label: 'Audit Quality & Rigor', desc: 'Score academic, research, and format quality' },
            ].map((op) => (
              <button
                key={op.id}
                onClick={() => handleRunAiAction(op.id)}
                disabled={isLoading}
                className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-indigo-900 transition border border-slate-100 group"
              >
                <div className="font-semibold text-slate-800 group-hover:text-indigo-600 flex items-center justify-between">
                  <span>{op.label}</span>
                  {activeAiAction === op.id && <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{op.desc}</div>
              </button>
            ))}
          </div>

          {/* Quality Audit Report */}
          {qualityReport && (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Section Score</span>
                <span className="font-extrabold text-sm text-indigo-600">{qualityReport.overallScore}/100</span>
              </div>
              <div className="space-y-1 text-[11px] text-slate-600">
                <div className="font-semibold text-slate-700">Academic Quality:</div>
                <p className="italic text-slate-500">{qualityReport.academicQuality.toneConsistency}</p>
                <div className="font-semibold text-slate-700 mt-1">Research Soundness:</div>
                <p className="text-slate-500">{qualityReport.researchQuality.problemClarity}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
