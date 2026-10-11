import React, { useState } from 'react';
import { Layers, Sparkles, RefreshCw, Copy, Check } from 'lucide-react';
import { Project } from '../types';

interface FigureGeneratorViewProps {
  activeProject: Project | null;
}

export const FigureGeneratorView: React.FC<FigureGeneratorViewProps> = ({ activeProject }) => {
  const [type, setType] = useState('Flowchart');
  const [topic, setTopic] = useState('Dual-Phase Spatial Quantization & Defensive Distillation');
  const [description, setDescription] = useState(
    'Packet telemetry enters through an edge gateway, undergoes spatial smoothing to eliminate gradient noise, and passes into a temperature-scaled student neural model.'
  );

  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState<any | null>({
    caption: 'Figure 1. Architectural pipeline of spatial quantization and defensive distillation.',
    diagramType: 'Flowchart',
    content: `\`\`\`mermaid
graph LR
  A[Raw SCADA Telemetry] --> B[Spatial Smoothing Filter]
  B --> C[Spatial Quantization Grid]
  C --> D[Distilled Student Model]
  D --> E[Logit Scaling T=20]
  E --> F[Class Decision]
\`\`\`

*Figure 1. Operational workflow schematic for edge intrusion detection. High-frequency adversarial perturbations are suppressed in the spatial quantization stage before feature extraction.*`,
  });

  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/figures-tables/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, topic, description }),
      });
      const data = await res.json();
      setOutput(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyContent = () => {
    if (!output?.content) return;
    navigator.clipboard.writeText(output.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold mb-2">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Academic Scientific Illustration</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Academic Figures, Architecture Diagrams &amp; Tables
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate formal system architecture diagrams, Mermaid.js workflows, and standard captioned comparison tables.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-sm transition"
        >
          {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>Generate Figure / Table</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 text-xs">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Illustration Parameters
          </h2>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Illustration Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:bg-white focus:outline-none"
            >
              <option value="Flowchart">Mermaid.js Flowchart</option>
              <option value="Architecture Diagram">System Architecture Schematic</option>
              <option value="Methodology Diagram">Methodology Data Flow</option>
              <option value="Comparison Table">Comparative Matrix Table</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Figure Topic / System</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Workflow Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Output Preview */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-900">{output?.caption || 'Figure Preview'}</span>
            <button
              onClick={copyContent}
              className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-indigo-600"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Markdown'}</span>
            </button>
          </div>

          <div className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs leading-relaxed text-slate-800 overflow-y-auto whitespace-pre-wrap">
            {output?.content}
          </div>
        </div>
      </div>
    </div>
  );
};
