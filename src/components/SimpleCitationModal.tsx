import React, { useState } from 'react';
import { X, Quote, Plus, Search, Check, Copy } from 'lucide-react';
import { CitationItem, CitationStyle } from '../types';

interface SimpleCitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  citations: CitationItem[];
  citationStyle: CitationStyle;
  onSelectCitation: (citationText: string) => void;
  onAddNewCitation: (citation: CitationItem) => void;
}

export const SimpleCitationModal: React.FC<SimpleCitationModalProps> = ({
  isOpen,
  onClose,
  citations,
  citationStyle,
  onSelectCitation,
  onAddNewCitation,
}) => {
  const [search, setSearch] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [year, setYear] = useState('2024');
  const [journal, setJournal] = useState('');
  const [doi, setDoi] = useState('');

  if (!isOpen) return null;

  const filtered = citations.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.authors.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    if (!title.trim()) return;
    const newCite: CitationItem = {
      id: `cite-${Date.now()}`,
      title,
      authors: authors || 'Unknown Author',
      year: year || '2024',
      journal: journal || 'Scientific Proceedings',
      doi: doi || '',
      citationStyle,
      inTextCitation: `(${authors.split(' ')[0] || 'Author'}, ${year})`,
      fullBibliography: `${authors} (${year}). ${title}. ${journal}.`,
      verificationStatus: 'verified',
    };
    onAddNewCitation(newCite);
    setIsAddingNew(false);
    setTitle('');
    setAuthors('');
    setJournal('');
    setDoi('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Quote className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">Insert In-Text Citation</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {!isAddingNew ? (
            <>
              {/* Search bar */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search bibliography by title or author..."
                    className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  onClick={() => setIsAddingNew(true)}
                  className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New</span>
                </button>
              </div>

              {/* Citations List */}
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400">
                    No matching citations found. Click "+ New" to add one.
                  </div>
                ) : (
                  filtered.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 truncate">
                          [{idx + 1}] {item.title}
                        </div>
                        <div className="text-slate-500 text-[11px] truncate">
                          {item.authors} ({item.year})
                        </div>
                        <div className="text-[10px] font-mono text-indigo-600">
                          In-text tag: {citationStyle === 'IEEE' ? `[${idx + 1}]` : item.inTextCitation}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const tag = citationStyle === 'IEEE' ? `[${idx + 1}]` : item.inTextCitation;
                          onSelectCitation(tag);
                          onClose();
                        }}
                        className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium shrink-0 transition cursor-pointer"
                      >
                        Insert
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            /* Add New Reference Form */
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-900">Add New Scholarly Reference</div>
              <div className="space-y-2">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Paper Title *"
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  value={authors}
                  onChange={(e) => setAuthors(e.target.value)}
                  placeholder="Authors (e.g. Bengio, Y., LeCun, Y.)"
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  value={journal}
                  onChange={(e) => setJournal(e.target.value)}
                  placeholder="Journal or Conference"
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="Year"
                    className="text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    value={doi}
                    onChange={(e) => setDoi(e.target.value)}
                    placeholder="DOI (optional)"
                    className="text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                >
                  Save Citation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
