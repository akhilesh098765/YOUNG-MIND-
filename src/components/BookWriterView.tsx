import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Edit3,
  ListOrdered,
  FileText,
} from 'lucide-react';
import { BookParams, Project } from '../types';

interface BookWriterViewProps {
  activeProject: Project | null;
}

interface Chapter {
  id: string;
  number: number;
  title: string;
  summary: string;
  content: string;
  wordCount: number;
}

export const BookWriterView: React.FC<BookWriterViewProps> = ({ activeProject }) => {
  const [params, setParams] = useState<BookParams>({
    title: 'Adversarial Machine Learning: Theory, Foundations, and Cyber-Physical Systems',
    subject: 'Computer Science & Machine Learning Security',
    targetAudience: 'Postgraduate Scholars, Cybersecurity Researchers, and M.Tech/PhD Students',
    chaptersCount: 7,
    approximateWordCount: 35000,
    style: 'Rigorous Academic Monograph',
    difficulty: 'Graduate/Research',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [activeChapterId, setActiveChapterId] = useState<string>('chap-1');
  const [chapters, setChapters] = useState<Chapter[]>([
    {
      id: 'chap-1',
      number: 1,
      title: 'Chapter 1: Foundations of Mathematical Optimization in Machine Learning',
      summary: 'Formulates gradient dynamics, convexity bounds, and loss surface geometry in deep neural networks.',
      content: `### Chapter 1: Foundations of Mathematical Optimization in Machine Learning\n\n#### 1.1 Mathematical Scaffolding\nModern machine learning frameworks rely fundamentally on continuous optimization over high-dimensional empirical risk surfaces. We formulate the objective as:\n$$\\min_{\\theta \\in \\Theta} \\frac{1}{N} \\sum_{i=1}^N \\mathcal{L}(f(x_i; \\theta), y_i) + \\lambda \\Omega(\\theta)$$\nwhere $\\Omega(\\theta)$ imposes structural regularization.\n\n#### 1.2 Non-Convex Geometry and Saddle Points\nIn deep parameterized topologies, local minima are predominantly accompanied by saddle points with strictly indefinite Hessians.`,
      wordCount: 3400,
    },
    {
      id: 'chap-2',
      number: 2,
      title: 'Chapter 2: The Geometry of Adversarial Perturbations',
      summary: 'Examines linear hypotheses, boundary proximity, and $L_p$ norm constraint spaces.',
      content: `### Chapter 2: The Geometry of Adversarial Perturbations\n\n#### 2.1 Norm-Bounded Attack Space\nLet $x \\in \\mathbb{R}^d$ represent an unperturbed input. The adversarial goal is formulating a perturbation $\\delta$ bounded by $\\|\\delta\\|_p \\le \\epsilon$ such that $\\arg\\max f(x+\\delta) \\ne y$.\n\n#### 2.2 First-Order Projected Gradient Descent (PGD)\nPGD represents the universal first-order adversary traversing the boundary manifold.`,
      wordCount: 4200,
    },
    {
      id: 'chap-3',
      number: 3,
      title: 'Chapter 3: Defensive Distillation and Softmax Temperature Scaling',
      summary: 'Analyzes knowledge transfer under high temperatures and gradient vanishing phenomena.',
      content: `### Chapter 3: Defensive Distillation and Softmax Temperature Scaling\n\n#### 3.1 Temperature Dynamics\nBy setting temperature $T > 1$, probability distribution vectors flatten, transmitting subtle epistemic uncertainty to the student architecture.`,
      wordCount: 3800,
    },
  ]);

  const [preface, setPreface] = useState<string>(
    '### Preface\nThis monograph bridges foundational mathematics with operational cyber-physical deployment constraints, targeting doctoral scholars and industrial research laboratories.'
  );
  const [glossary, setGlossary] = useState<string>(
    '### Glossary\n- **Adversarial Noise**: Small, mathematically computed perturbations causing misclassification.\n- **Defensive Distillation**: A training method leveraging student-teacher architectures to minimize gradient leakage.\n- **Projected Gradient Descent (PGD)**: An iterative multi-step optimization adversary.'
  );
  const [indexTerms, setIndexTerms] = useState<string>(
    '### Index\nAdversarial perturbation, 12-18\nConvexity, 34\nDefensive Distillation, 78-95\nProjected Gradient Descent, 45-62\nTemperature Scaling, 81'
  );

  const handleGenerateOutline = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/research/book-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (data.chapters) setChapters(data.chapters);
      if (data.preface) setPreface(data.preface);
      if (data.glossary) setGlossary(data.glossary);
      if (data.index) setIndexTerms(data.index);
      if (data.chapters?.[0]) setActiveChapterId(data.chapters[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChapterAction = async (action: 'expand' | 'summarize' | 'academic' | 'rewrite') => {
    const chap = chapters.find((c) => c.id === activeChapterId);
    if (!chap) return;

    setIsLoading(true);
    try {
      let promptText = '';
      if (action === 'expand') {
        promptText = `Expand this chapter in high academic rigor with mathematical formulations and subheadings:\n${chap.content}`;
      } else if (action === 'summarize') {
        promptText = `Provide a 3-paragraph scholarly executive summary of this chapter:\n${chap.content}`;
      } else if (action === 'academic') {
        promptText = `Elevate the academic tone of this chapter text to formal monograph level:\n${chap.content}`;
      } else {
        promptText = `Rewrite this chapter to enhance clarity and technical precision:\n${chap.content}`;
      }

      const res = await fetch('/api/paraphrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: chap.content, mode: 'Academic' }),
      });
      const data = await res.json();
      if (data.paraphrased) {
        setChapters(
          chapters.map((c) =>
            c.id === chap.id
              ? {
                  ...c,
                  content:
                    action === 'expand'
                      ? `${c.content}\n\n#### Expanded Scholarly Section\n${data.paraphrased}`
                      : data.paraphrased,
                }
              : c
          )
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const activeChapter = chapters.find((c) => c.id === activeChapterId) || chapters[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>AI Academic Book &amp; Monograph Writer</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Book Architect &amp; Chapter Generator
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Build comprehensive scholarly textbooks and research monographs with complete chapter hierarchies, prefaces, and indexes.
          </p>
        </div>

        <button
          onClick={handleGenerateOutline}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-sm transition"
        >
          {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>Generate Full Book Architecture</span>
        </button>
      </div>

      {/* Book Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-xs">
        <div className="md:col-span-2">
          <label className="font-semibold text-slate-700 block mb-1">Book Title</label>
          <input
            type="text"
            value={params.title}
            onChange={(e) => setParams({ ...params, title: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="font-semibold text-slate-700 block mb-1">Subject / Domain</label>
          <input
            type="text"
            value={params.subject}
            onChange={(e) => setParams({ ...params, subject: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="font-semibold text-slate-700 block mb-1">Chapters Count</label>
          <input
            type="number"
            value={params.chaptersCount}
            onChange={(e) => setParams({ ...params, chaptersCount: Number(e.target.value) })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Main Chapter Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chapters Navigation */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-2 max-h-[700px] overflow-y-auto">
          <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-900">Table of Contents</span>
            <span className="text-[11px] text-slate-400">{chapters.length} Chapters</span>
          </div>

          {chapters.map((chap, idx) => (
            <button
              key={chap.id}
              onClick={() => setActiveChapterId(chap.id)}
              className={`w-full text-left p-2.5 rounded-lg text-xs transition border ${
                activeChapterId === chap.id
                  ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950 font-semibold shadow-xs'
                  : 'border-transparent hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="truncate pr-2">{chap.title}</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  ~{chap.wordCount}w
                </span>
              </div>
            </button>
          ))}

          {/* Book Elements */}
          <div className="pt-3 border-t border-slate-100 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">Ancillary Elements</div>
            <button
              onClick={() => setActiveChapterId('preface')}
              className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition ${
                activeChapterId === 'preface' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Preface &amp; Introduction
            </button>
            <button
              onClick={() => setActiveChapterId('glossary')}
              className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition ${
                activeChapterId === 'glossary' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Glossary of Terms
            </button>
            <button
              onClick={() => setActiveChapterId('index')}
              className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition ${
                activeChapterId === 'index' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Subject Index
            </button>
          </div>
        </div>

        {/* Chapter Editor & Operations */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col min-h-[600px]">
          {activeChapterId === 'preface' ? (
            <div className="space-y-2 flex-1 flex flex-col">
              <h3 className="font-bold text-sm text-slate-900">Book Preface</h3>
              <textarea
                value={preface}
                onChange={(e) => setPreface(e.target.value)}
                className="w-full flex-1 p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none"
              />
            </div>
          ) : activeChapterId === 'glossary' ? (
            <div className="space-y-2 flex-1 flex flex-col">
              <h3 className="font-bold text-sm text-slate-900">Academic Glossary</h3>
              <textarea
                value={glossary}
                onChange={(e) => setGlossary(e.target.value)}
                className="w-full flex-1 p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none"
              />
            </div>
          ) : activeChapterId === 'index' ? (
            <div className="space-y-2 flex-1 flex flex-col">
              <h3 className="font-bold text-sm text-slate-900">Subject Index Key Terms</h3>
              <textarea
                value={indexTerms}
                onChange={(e) => setIndexTerms(e.target.value)}
                className="w-full flex-1 p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none"
              />
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{activeChapter?.title}</h3>
                  <p className="text-[11px] text-slate-400">{activeChapter?.summary}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => handleChapterAction('expand')}
                    disabled={isLoading}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded transition"
                  >
                    Expand Chapter
                  </button>
                  <button
                    onClick={() => handleChapterAction('academic')}
                    disabled={isLoading}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded transition"
                  >
                    Elevate Tone
                  </button>
                  <button
                    onClick={() => handleChapterAction('summarize')}
                    disabled={isLoading}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded transition"
                  >
                    Summarize
                  </button>
                </div>
              </div>

              <textarea
                value={activeChapter?.content || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setChapters(
                    chapters.map((c) =>
                      c.id === activeChapter?.id ? { ...c, content: val, wordCount: val.split(/\s+/).length } : c
                    )
                  );
                }}
                className="w-full flex-1 min-h-[460px] p-3 text-xs leading-relaxed font-mono bg-slate-50/50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
