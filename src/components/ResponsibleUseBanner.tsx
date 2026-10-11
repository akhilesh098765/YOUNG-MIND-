import React, { useState, useEffect } from 'react';
import { ShieldCheck, Info, X, ExternalLink } from 'lucide-react';

interface ResponsibleUseBannerProps {
  forceOpenModal?: boolean;
  onCloseModal?: () => void;
}

export const ResponsibleUseBanner: React.FC<ResponsibleUseBannerProps> = ({
  forceOpenModal,
  onCloseModal,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (forceOpenModal) {
      setShowModal(true);
    }
  }, [forceOpenModal]);

  const handleCloseModal = () => {
    setShowModal(false);
    if (onCloseModal) onCloseModal();
  };

  return (
    <>
      {!dismissed && (
        <div
          id="responsible-use-banner"
          className="bg-amber-50/90 border-b border-amber-200/80 text-amber-900 px-4 py-2 text-xs flex items-center justify-between transition-all"
        >
          <div className="flex items-center gap-2 max-w-6xl mx-auto w-full">
            <ShieldCheck className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span className="truncate">
              <strong>Responsible Academic Use:</strong> Young Mind AI enforces strict bibliographic validation. Authors remain fully accountable for verifying citations, derivations, and compliance with institutional ethics codes.
            </span>
            <button
              onClick={() => setShowModal(true)}
              className="underline font-bold text-amber-950 hover:text-amber-800 ml-2 whitespace-nowrap cursor-pointer"
            >
              Ethics Code &amp; Guidelines
            </button>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-amber-700 hover:text-amber-950 p-1 rounded transition cursor-pointer"
            title="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm sm:text-base">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <span>Academic Integrity &amp; AI Authorship Protocol</span>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-700 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed max-h-[75vh] overflow-y-auto">
              <blockquote className="p-3.5 bg-amber-50 border-l-4 border-amber-500 rounded-r text-amber-950 font-medium">
                &ldquo;Young Mind AI is an academic co-pilot designed to accelerate hypothesis formulation, literature synthesis, and manuscript structuring. The researcher maintains ultimate authorship responsibility.&rdquo;
              </blockquote>

              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                4 Core Safeguards Enforced System-Wide:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <strong className="text-slate-900 block font-bold">1. Zero Fabricated Results</strong>
                  <p className="text-slate-600 text-[11px]">
                    Empirical data is never hallucinated. Unverified results are labeled as <em>&ldquo;Proposed / Expected Benchmark&rdquo;</em>.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <strong className="text-slate-900 block font-bold">2. DOI Registry Verification</strong>
                  <p className="text-slate-600 text-[11px]">
                    Citations are validated against Crossref standard syntax. Unconfirmed citations are tagged <em>[?] Verification Required</em>.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <strong className="text-slate-900 block font-bold">3. Provenance Watermarking</strong>
                  <p className="text-slate-600 text-[11px]">
                    Every datum is tagged: Verified Fact, User Provided, AI Generated, or Unverified Claim.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <strong className="text-slate-900 block font-bold">4. Plagiarism &amp; Similarity Heuristics</strong>
                  <p className="text-slate-600 text-[11px]">
                    Estimates overlap with open repositories to uphold the &le;15% similarity limit.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-500 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                <span>
                  Aligns with recommendations by COPE (Committee on Publication Ethics) and ICMJE regarding artificial intelligence tools in scholarly communication.
                </span>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={handleCloseModal}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
              >
                I Understand &amp; Agree
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
