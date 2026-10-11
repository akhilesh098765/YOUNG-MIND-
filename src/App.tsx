import React, { useState, useEffect } from 'react';
import { SimpleHeader, SimpleTab } from './components/SimpleHeader';
import { SimpleEditor } from './components/SimpleEditor';
import { SimpleToolsView } from './components/SimpleToolsView';
import { ExportModal } from './components/ExportModal';
import { NewProjectModal } from './components/NewProjectModal';
import { SimpleCitationModal } from './components/SimpleCitationModal';
import { SimpleParaphraseModal } from './components/SimpleParaphraseModal';
import { AcademicPaperStudio } from './components/AcademicPaperStudio';
import { CitationItem, CitationStyle, GeneratedPaper, PaperSection, Project } from './types';
import { demoProjects } from './data/demoProjects';

export default function App() {
  const [projects, setProjects] = useState<Project[]>(demoProjects);
  const [activeProject, setActiveProject] = useState<Project | null>(demoProjects[0] || null);

  // Active Main Navigation Tab ('generator' | 'editor' | 'tools')
  const [activeTab, setActiveTab] = useState<SimpleTab>('generator');

  // Document State
  const [documentTitle, setDocumentTitle] = useState<string>(
    demoProjects[0]?.title || 'Untitled Academic Paper'
  );
  const [authors, setAuthors] = useState<string>(
    'Dr. A. Sharma, Prof. K. Patel (IEEE Senior Member)'
  );
  const [affiliations, setAffiliations] = useState<string>(
    'Department of Computer Science & Engineering, Advanced Systems Lab'
  );
  const [sections, setSections] = useState<PaperSection[]>(
    demoProjects[0]?.documents[0]?.sections || []
  );
  const [citations, setCitations] = useState<CitationItem[]>(
    demoProjects[0]?.citations || []
  );
  const [activeSectionId, setActiveSectionId] = useState<string>(
    demoProjects[0]?.documents[0]?.sections[0]?.id || 'sec-1'
  );
  const [citationStyle, setCitationStyle] = useState<CitationStyle>('IEEE');
  const [isSaved, setIsSaved] = useState(true);

  // Modals
  const [isCitationModalOpen, setIsCitationModalOpen] = useState(false);
  const [isParaphraseModalOpen, setIsParaphraseModalOpen] = useState(false);
  const [targetSectionForModal, setTargetSectionForModal] = useState<string>('');
  const [paraphraseInitialText, setParaphraseInitialText] = useState<string>('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  // Sync state when activeProject changes
  useEffect(() => {
    if (activeProject) {
      setDocumentTitle(activeProject.title);
      const doc = activeProject.documents[0];
      if (doc && doc.sections) {
        setSections(doc.sections);
        setActiveSectionId(doc.sections[0]?.id || '');
      }
      if (activeProject.citations) {
        setCitations(activeProject.citations);
      }
    }
  }, [activeProject]);

  // Global Keyboard Shortcuts (Ctrl+S for save)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        setIsSaved(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleUpdateSection = (id: string, newTitle: string, newContent: string) => {
    setIsSaved(false);
    const updated = sections.map((s) =>
      s.id === id ? { ...s, title: newTitle, content: newContent } : s
    );
    setSections(updated);
  };

  const handleAddSection = (afterIndex?: number) => {
    setIsSaved(false);
    const newSec: PaperSection = {
      id: `sec-${Date.now()}`,
      title: `${sections.length + 1}. New Academic Section`,
      content: `### ${sections.length + 1}. Section Title\nEnter formal research methodology, empirical observations, and analytical derivations here...`,
      status: 'draft',
    };

    if (afterIndex !== undefined && afterIndex >= 0 && afterIndex < sections.length) {
      const copy = [...sections];
      copy.splice(afterIndex, 0, newSec);
      setSections(copy);
    } else {
      setSections([...sections, newSec]);
    }
    setActiveSectionId(newSec.id);
  };

  const handleDeleteSection = (id: string) => {
    if (sections.length <= 1) return;
    setIsSaved(false);
    const filtered = sections.filter((s) => s.id !== id);
    setSections(filtered);
    if (activeSectionId === id) {
      setActiveSectionId(filtered[0]?.id || '');
    }
  };

  const handleInsertCitationText = (citeTag: string) => {
    const sec = sections.find((s) => s.id === (targetSectionForModal || activeSectionId));
    if (!sec) return;
    const updated = `${sec.content} ${citeTag}`;
    handleUpdateSection(sec.id, sec.title, updated);
  };

  const handleApplyAiContent = (sectionId: string, content: string) => {
    const sec = sections.find((s) => s.id === sectionId);
    if (!sec) return;
    handleUpdateSection(sectionId, sec.title, content);
  };

  const handleApplyRewrite = (sectionId: string, rewrittenText: string) => {
    const sec = sections.find((s) => s.id === sectionId);
    if (!sec) return;
    handleUpdateSection(sectionId, sec.title, rewrittenText);
  };

  const handleOpenPaperInEditor = (paper: GeneratedPaper) => {
    setDocumentTitle(paper.title);
    setAuthors(paper.authors);
    setAffiliations(paper.affiliation);
    setCitationStyle(paper.citationStyle);

    // Convert paper sections into PaperSection[]
    const newSections: PaperSection[] = paper.sections.map((s) => ({
      id: s.id,
      title: s.title,
      content: s.content,
      status: 'generated',
    }));
    setSections(newSections);
    if (newSections.length > 0) {
      setActiveSectionId(newSections[0].id);
    }

    // Convert references into CitationItem[]
    const newCitations: CitationItem[] = paper.references.map((r) => ({
      id: r.id,
      authors: r.authors || 'Research Author',
      year: r.year || '2024',
      title: r.citation,
      doi: r.doi,
      citationStyle: paper.citationStyle,
      inTextCitation: `[${r.index}]`,
      fullBibliography: r.citation,
      verificationStatus: 'verified',
    }));
    setCitations(newCitations);

    setActiveTab('editor');
    setIsSaved(false);
  };

  const totalWords = sections.reduce(
    (acc, s) => acc + s.content.trim().split(/\s+/).filter(Boolean).length,
    0
  );

  const activeSection = sections.find((s) => s.id === activeSectionId) || sections[0];

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* 1. Clean Scholarly Header */}
      <SimpleHeader
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        documentTitle={documentTitle}
        onUpdateTitle={(t) => {
          setDocumentTitle(t);
          setIsSaved(false);
        }}
        projects={projects}
        activeProject={activeProject}
        onSelectProject={setActiveProject}
        onNewProject={() => setIsNewProjectModalOpen(true)}
        onExport={() => setIsExportModalOpen(true)}
        isSaved={isSaved}
        totalWords={totalWords}
        citationStyle={citationStyle}
        onChangeCitationStyle={setCitationStyle}
      />

      {/* 2. Main Body: Switch between Paper Generator, Manuscript Editor, and Research Tools */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {activeTab === 'generator' && (
          <AcademicPaperStudio
            onOpenInEditor={handleOpenPaperInEditor}
          />
        )}

        {activeTab === 'editor' && (
          <SimpleEditor
            documentTitle={documentTitle}
            onChangeTitle={(t) => {
              setDocumentTitle(t);
              setIsSaved(false);
            }}
            authors={authors}
            onChangeAuthors={(a) => {
              setAuthors(a);
              setIsSaved(false);
            }}
            affiliations={affiliations}
            onChangeAffiliations={(af) => {
              setAffiliations(af);
              setIsSaved(false);
            }}
            sections={sections}
            activeSectionId={activeSectionId}
            onSelectSection={setActiveSectionId}
            onUpdateSection={handleUpdateSection}
            onAddSection={handleAddSection}
            onDeleteSection={handleDeleteSection}
            citations={citations}
            citationStyle={citationStyle}
            onOpenCitationModal={(secId) => {
              setTargetSectionForModal(secId);
              setIsCitationModalOpen(true);
            }}
            onOpenParaphraseModal={(text, secId) => {
              setTargetSectionForModal(secId);
              setParaphraseInitialText(text);
              setIsParaphraseModalOpen(true);
            }}
            onAutoGeneratePaper={handleOpenPaperInEditor}
          />
        )}

        {activeTab === 'tools' && (
          <SimpleToolsView
            activeProject={activeProject}
            sections={sections}
            citations={citations}
            citationStyle={citationStyle}
            onAddCitation={(item) => setCitations([item, ...citations])}
            onApplyToSection={handleApplyAiContent}
          />
        )}
      </div>

      {/* Citations Modal */}
      <SimpleCitationModal
        isOpen={isCitationModalOpen}
        onClose={() => setIsCitationModalOpen(false)}
        citations={citations}
        citationStyle={citationStyle}
        onSelectCitation={handleInsertCitationText}
        onAddNewCitation={(item) => setCitations([item, ...citations])}
      />

      {/* Paraphrase Modal */}
      <SimpleParaphraseModal
        isOpen={isParaphraseModalOpen}
        onClose={() => setIsParaphraseModalOpen(false)}
        initialText={paraphraseInitialText}
        sectionId={targetSectionForModal || activeSectionId}
        onApplyRewrite={handleApplyRewrite}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        activeProject={activeProject}
      />

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onCreate={(p) => {
          const newProj: Project = {
            id: `proj-${Date.now()}`,
            title: p.title,
            type: p.type,
            domain: p.domain,
            description: p.description,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tags: ['Research'],
            documents: [
              {
                id: `doc-${Date.now()}`,
                projectId: `proj-${Date.now()}`,
                title: p.title,
                type: p.type,
                version: '1.0',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                sections: [
                  {
                    id: `sec-${Date.now()}`,
                    title: '1. Introduction',
                    content: `### 1. Introduction\nInitiate research on ${p.title} within ${p.domain}.`,
                    status: 'draft',
                  },
                ],
              },
            ],
            sources: [],
            citations: [],
            notes: [],
            versions: [],
          };
          setProjects([newProj, ...projects]);
          setActiveProject(newProj);
          setIsNewProjectModalOpen(false);
        }}
      />
    </div>
  );
}
