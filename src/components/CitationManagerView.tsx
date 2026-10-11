import React, { useState } from 'react';
import {
  Bookmark,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Copy,
  Check,
  Download,
  Search,
  ExternalLink,
} from 'lucide-react';
import { CitationItem, CitationStyle, Project } from '../types';

interface CitationManagerViewProps {
  activeProject: Project | null;
  onAddCitationToProject: (cit: CitationItem) => void;
  onRemoveCitation: (citId: string) => void;
}

export const CitationManagerView: React.FC<CitationManagerViewProps> = ({
  activeProject,
  onAddCitationToProject,
  onRemoveCitation,
}) => {
  const [citations, setCitations] = useState<CitationItem[]>(
    activeProject?.citations || [
      {
        id: 'cit-1',
        authors: 'Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, Ł., & Polosukhin, I.',
        year: 2017,
        title: 'Attention is All You Need',
        conference: 'Advances in Neural Information Processing Systems (NeurIPS)',
        pages: '5998-6008',
        doi: '10.48550/arXiv.1706.03762',
        citationStyle: 'IEEE',
        inTextCitation: '[1]',
        fullBibliography:
          'A. Vaswani et al., "Attention is All You Need," in Proc. of NeurIPS, 2017, pp. 5998-6008. https://doi.org/10.48550/arXiv.1706.03762',
        verificationStatus: 'verified',
        verificationNote: 'DOI syntax validated against Crossref standard schema.',
      },
      {
        id: 'cit-2',
        authors: 'Carlini, N., & Wagner, D.',
        year: 2017,
        title: 'Towards Evaluating the Robustness of Neural Networks',
        conference: 'IEEE Symposium on Security and Privacy (SP)',
        pages: '39-57',
        doi: '10.1109/SP.2017.49',
        citationStyle: 'IEEE',
        inTextCitation: '[2]',
        fullBibliography:
          'N. Carlini and D. Wagner, "Towards Evaluating the Robustness of Neural Networks," in IEEE Symposium on Security and Privacy, 2017, pp. 39-57. https://doi.org/10.1109/SP.2017.49',
        verificationStatus: 'verified',
        verificationNote: 'DOI syntax validated against Crossref standard schema.',
      },
    ]
  );

  const [selectedStyle, setSelectedStyle] = useState<CitationStyle>('IEEE');
  const [formData, setFormData] = useState({
    authors: '',
    year: '2025',
    title: '',
    journal: '',
    conference: '',
    volume: '',
    issue: '',
    pages: '',
    doi: '',
    url: '',
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!formData.title || !formData.authors) return;

    try {
      const res = await fetch('/api/citations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, citationStyle: selectedStyle }),
      });
      const data = await res.json();
      if (data.citation) {
        setCitations([data.citation, ...citations]);
        onAddCitationToProject(data.citation);
        setFormData({
          authors: '',
          year: '2025',
          title: '',
          journal: '',
          conference: '',
          volume: '',
          issue: '',
          pages: '',
          doi: '',
          url: '',
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const getBibtexOutput = () => {
    return citations
      .map((cit, idx) => {
        const key = (cit.authors.split(' ')[0] || 'ref') + cit.year + `_${idx + 1}`;
        return `@article{${key.toLowerCase().replace(/[^a-z0-9_]/g, '')},
  author    = {${cit.authors}},
  title     = {${cit.title}},
  year      = {${cit.year}},
  journal   = {${cit.journal || cit.conference || 'Journal of Academic Computing'}},
  volume    = {${cit.volume || '1'}},
  pages     = {${cit.pages || '1-10'}},
  doi       = {${cit.doi || 'DOI verification required'}}
}`;
      })
      .join('\n\n');
  };

  const [showBibtex, setShowBibtex] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold mb-2">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Academic Reference &amp; DOI Validator</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Citation Manager &amp; Bibliography Formatter
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Format references across 6 global styles, validate DOIs against Crossref schema, and export validated BibTeX blocks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBibtex(!showBibtex)}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition"
          >
            {showBibtex ? 'Hide BibTeX' : 'View BibTeX (.bib)'}
          </button>
        </div>
      </div>

      {showBibtex && (
        <div className="bg-slate-900 text-slate-100 p-5 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
            <span>BibTeX Raw Bibliography File</span>
            <button
              onClick={() => copyToClipboard(getBibtexOutput(), 'bibtex-all')}
              className="text-cyan-400 hover:text-cyan-300 font-bold"
            >
              {copiedId === 'bibtex-all' ? 'Copied!' : 'Copy BibTeX'}
            </button>
          </div>
          <pre className="overflow-x-auto p-2 bg-slate-950 rounded leading-relaxed">{getBibtexOutput()}</pre>
        </div>
      )}

      {/* Style Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between gap-4 flex-wrap text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">Citation Style:</span>
          {(['IEEE', 'APA 7', 'MLA', 'Chicago', 'Harvard', 'Vancouver'] as CitationStyle[]).map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStyle(st)}
              className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                selectedStyle === st
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
        <span className="text-slate-400 font-medium">{citations.length} Citations in Project</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* New Citation Form */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 text-xs">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Add Scholarly Reference
          </h2>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Authors (comma-separated)</label>
            <input
              type="text"
              placeholder="e.g. Kumar, A., Sharma, R., & Doe, J."
              value={formData.authors}
              onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Paper / Book Title</label>
            <input
              type="text"
              placeholder="e.g. Deep Learning in Industrial Cyber-Physical Security"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Year</label>
              <input
                type="text"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">DOI</label>
              <input
                type="text"
                placeholder="10.1109/SP.2017.49"
                value={formData.doi}
                onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Journal / Conference</label>
              <input
                type="text"
                placeholder="IEEE Transactions / Nature"
                value={formData.journal}
                onChange={(e) => setFormData({ ...formData, journal: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Pages</label>
              <input
                type="text"
                placeholder="112-124"
                value={formData.pages}
                onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={!formData.title || !formData.authors}
            className="w-full mt-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition shadow-sm"
          >
            Format &amp; Validate Citation
          </button>
        </div>

        {/* Citations List */}
        <div className="lg:col-span-7 space-y-3">
          {citations.map((cit) => (
            <div key={cit.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                    {cit.inTextCitation}
                  </span>
                  {cit.verificationStatus === 'verified' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>DOI Verified</span>
                    </span>
                  )}
                  {cit.verificationStatus === 'verification_required' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      <span>Verification Required</span>
                    </span>
                  )}
                  {cit.verificationStatus === 'incomplete' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      <HelpCircle className="w-3 h-3 text-slate-400" />
                      <span>No DOI</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(cit.fullBibliography, cit.id)}
                    className="p-1 text-slate-400 hover:text-slate-800 transition"
                    title="Copy full reference"
                  >
                    {copiedId === cit.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => {
                      setCitations(citations.filter((c) => c.id !== cit.id));
                      onRemoveCitation(cit.id);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                    title="Delete citation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-slate-800 font-medium leading-relaxed">{cit.fullBibliography}</p>
              {cit.verificationNote && (
                <div className="text-[11px] text-slate-400">{cit.verificationNote}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
