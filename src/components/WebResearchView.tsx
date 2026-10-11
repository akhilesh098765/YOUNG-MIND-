import React, { useState } from 'react';
import { Search, ExternalLink, Bookmark, CheckCircle2, AlertTriangle, RefreshCw, Plus, ShieldCheck } from 'lucide-react';
import { Project, ResearchSource } from '../types';

interface WebResearchViewProps {
  activeProject: Project | null;
  onAddSource: (src: ResearchSource) => void;
}

export const WebResearchView: React.FC<WebResearchViewProps> = ({ activeProject, onAddSource }) => {
  const [query, setQuery] = useState('adversarial robustness deep learning');
  const [databaseFilter, setDatabaseFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [sources, setSources] = useState<ResearchSource[]>([]);
  const [indexedIds, setIndexedIds] = useState<string[]>([]);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/web-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, domain: activeProject?.domain }),
      });
      const data = await res.json();
      if (data.sources) {
        setSources(data.sources);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIndexSource = (src: ResearchSource) => {
    onAddSource(src);
    setIndexedIds([...indexedIds, src.id]);
  };

  // Run initial search on mount
  React.useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <Search className="w-3.5 h-3.5" />
            <span>Multi-Database Scholarly Ingestion</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Web Research &amp; Scholarly Literature Index
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Query arXiv, PubMed, Crossref, and Semantic Scholar with cryptographic and origin provenance badges.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-700">Source Badges:</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-[10px]">
            [✓] Verified DB
          </span>
          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200 text-[10px]">
            [#] Search Result
          </span>
          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200 text-[10px]">
            [*] AI Suggested
          </span>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search arXiv, PubMed, Crossref, Semantic Scholar by keyword, DOI, or title..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <select
          value={databaseFilter}
          onChange={(e) => setDatabaseFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-700 focus:bg-white focus:outline-none"
        >
          <option value="all">All Scholarly Repositories</option>
          <option value="arxiv">arXiv Preprints</option>
          <option value="pubmed">PubMed / BioMed</option>
          <option value="crossref">Crossref DOI Index</option>
          <option value="semanticscholar">Semantic Scholar</option>
        </select>

        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="w-full sm:w-auto px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
          <span>Query Repositories</span>
        </button>
      </div>

      {/* Sources Search Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-slate-700">Retrieved Scholarly Articles ({sources.length})</span>
          <span>Indexed into current workspace: {indexedIds.length}</span>
        </div>

        {sources.map((src) => {
          const isIndexed = indexedIds.includes(src.id);
          return (
            <div key={src.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {src.sourceOrigin === 'verified_db' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        [✓] Verified Source (Direct Index)
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        [#] Academic Search Result
                      </span>
                    )}
                    <span className="text-xs text-slate-400 font-semibold">{src.year}</span>
                    <span className="text-xs font-mono text-indigo-600">DOI: {src.doi}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{src.title}</h3>
                  <div className="text-xs text-slate-500 font-medium">
                    {src.authors} &mdash; <em>{src.conference || src.journal}</em>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {src.url && (
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-slate-400 hover:text-slate-800 transition"
                      title="Open source paper"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => handleIndexSource(src)}
                    disabled={isIndexed}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-xs bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white cursor-pointer"
                  >
                    {isIndexed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>{isIndexed ? 'Indexed in Library' : 'Add to Library'}</span>
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{src.abstract}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Methodology</span>
                  <span className="text-slate-700">{src.method || 'Empirical formulation'}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Benchmark Dataset</span>
                  <span className="text-slate-700">{src.dataset || 'Standardized corpus'}</span>
                </div>
                <div className="bg-amber-50/50 p-2 rounded border border-amber-100">
                  <span className="text-[10px] font-bold text-amber-700 uppercase block">Identified Gap</span>
                  <span className="text-amber-950">{src.researchGap || 'Real-time resource bounds'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
